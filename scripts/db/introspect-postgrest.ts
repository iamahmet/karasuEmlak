#!/usr/bin/env tsx

/**
 * PostgREST Schema Introspection Script
 * 
 * Verifies that all required tables, views, and RPC functions exist in the database
 * and are accessible via PostgREST schema cache.
 * 
 * Usage:
 *   pnpm db:verify
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx pnpm db:verify
 * 
 * Exits with code 0 if all objects exist, 1 if any are missing.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
const envPaths = [
  resolve(__dirname, "../.env.local"),
  resolve(__dirname, "../../.env.local"),
  resolve(process.cwd(), ".env.local"),
];

for (const envPath of envPaths) {
  try {
    dotenv.config({ path: envPath });
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      break;
    }
  } catch {
    // Continue
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing required environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Required objects (tables, views, RPC functions)
// Based on codebase analysis
const REQUIRED_TABLES = [
  "articles",
  "news_articles",
  "listings",
  "authors",
  "content_ai_improvements",
  "content_comments",
  "notifications",
  "pharmacies",
  "media_assets",
  "categories",
  "profiles",
  "content_items",
  "content_locales",
  "topic_clusters",
  "cluster_items",
  "programmatic_pages",
  "static_pages",
  "workflow_reviews",
  "content_versions",
  "audit_logs",
] as const;

const REQUIRED_VIEWS = [
  // Add views if any
] as const;

const REQUIRED_RPC_FUNCTIONS = [
  "pgrst_reload_schema",
  // Add other RPC functions if any
] as const;

interface ObjectStatus {
  name: string;
  type: "table" | "view" | "rpc";
  existsInDB: boolean;
  visibleInPostgREST: boolean;
  error?: string;
}

/**
 * Check if a table/view exists in Postgres system catalogs
 * Uses direct PostgREST query to information_schema
 */
async function checkTableOrView(name: string, type: "table" | "view"): Promise<{ exists: boolean; error?: string }> {
  try {
    // Try to query the table directly - if it exists in DB, this will work (even if not in cache)
    const { error: queryError } = await supabase.from(name).select("*").limit(0);
    
    if (queryError) {
      // PGRST116 = table doesn't exist
      if (queryError.code === "PGRST116" || queryError.code === "42P01") {
        return { exists: false, error: "Table does not exist" };
      }
      // PGRST205/PGRST202 = table exists but not in cache
      if (queryError.code === "PGRST205" || queryError.code === "PGRST202") {
        return { exists: true, error: "Table exists but not in PostgREST cache" };
      }
      // Other errors might mean table exists but RLS issue
      return { exists: true };
    }
    
    return { exists: true };
  } catch (err: any) {
    return { exists: false, error: err.message };
  }
}

/**
 * Check if an RPC function exists
 */
async function checkRPCFunction(name: string): Promise<{ exists: boolean; error?: string }> {
  try {
    // Try to call the function (with safe parameters if needed)
    if (name === "pgrst_reload_schema") {
      // This function might not be callable, so check via system catalog
      const { data, error } = await supabase.rpc("exec_sql", {
        sql: `
          SELECT EXISTS (
            SELECT 1 
            FROM pg_proc p
            JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'public'
            AND p.proname = '${name}'
          ) as exists;
        `,
      });

      if (error) {
        // Fallback: try to call it (will fail gracefully if doesn't exist)
        try {
          await supabase.rpc(name);
          return { exists: true };
        } catch {
          return { exists: false, error: "Function not found" };
        }
      }

      return { exists: data?.[0]?.exists || false };
    }

    // For other functions, try to call them
    try {
      await supabase.rpc(name, {});
      return { exists: true };
    } catch (err: any) {
      // If it's a parameter error, function exists
      if (err.message?.includes("function") && err.message?.includes("does not exist")) {
        return { exists: false, error: err.message };
      }
      // Parameter mismatch means function exists
      return { exists: true };
    }
  } catch (err: any) {
    return { exists: false, error: err.message };
  }
}

/**
 * Check if object is visible in PostgREST
 * Uses service role client to bypass RLS for visibility check
 */
async function checkPostgRESTVisibility(name: string, type: "table" | "view" | "rpc"): Promise<boolean> {
  try {
    if (type === "rpc") {
      // For RPC, try to call it
      try {
        await supabase.rpc(name, {});
        return true;
      } catch (err: any) {
        // PGRST205 = not in cache
        if (err.code === "PGRST205" || err.code === "PGRST202") {
          return false;
        }
        // Other errors might mean function exists but params wrong
        return true;
      }
    } else {
      // For tables/views, try a simple select with service role
      // This bypasses RLS to check if table is in PostgREST cache
      const { error } = await supabase.from(name).select("*", { count: "exact", head: true }).limit(0);
      
      if (error) {
        // PGRST205/PGRST202 = not in cache (table exists but cache stale)
        if (error.code === "PGRST205" || error.code === "PGRST202") {
          return false;
        }
        // PGRST116/42P01 = table doesn't exist
        if (error.code === "PGRST116" || error.code === "42P01") {
          return false;
        }
        // Other errors (like RLS) - table might be in cache but access denied
        // For service role, if we get here, table is likely in cache
        // Check error message for schema cache keywords
        if (error.message?.toLowerCase().includes("schema cache") || 
            error.message?.toLowerCase().includes("could not find")) {
          return false;
        }
        // Assume table is in cache if error is not about schema cache
        return true;
      }
      
      return true;
    }
  } catch {
    return false;
  }
}

/**
 * Main introspection function
 */
async function introspectPostgREST(): Promise<{ success: boolean; results: ObjectStatus[] }> {
  console.log("🔍 PostgREST Schema Introspection\n");
  console.log(`📡 Connecting to: ${SUPABASE_URL.replace(/\/\/.*@/, "//***@")}\n`);

  const results: ObjectStatus[] = [];

  // Check tables
  console.log("📊 Checking tables...");
  for (const table of REQUIRED_TABLES) {
    const dbCheck = await checkTableOrView(table, "table");
    const postgrestCheck = dbCheck.exists
      ? await checkPostgRESTVisibility(table, "table")
      : false;

    results.push({
      name: table,
      type: "table",
      existsInDB: dbCheck.exists,
      visibleInPostgREST: postgrestCheck,
      error: dbCheck.error,
    });

    const status = dbCheck.exists && postgrestCheck ? "✅" : dbCheck.exists ? "⚠️" : "❌";
    console.log(`   ${status} ${table.padEnd(35)} DB: ${dbCheck.exists ? "✓" : "✗"} | PostgREST: ${postgrestCheck ? "✓" : "✗"}`);
  }

  // Check views
  if (REQUIRED_VIEWS.length > 0) {
    console.log("\n👁️  Checking views...");
    for (const view of REQUIRED_VIEWS) {
      const dbCheck = await checkTableOrView(view, "view");
      const postgrestCheck = dbCheck.exists
        ? await checkPostgRESTVisibility(view, "view")
        : false;

      results.push({
        name: view,
        type: "view",
        existsInDB: dbCheck.exists,
        visibleInPostgREST: postgrestCheck,
        error: dbCheck.error,
      });

      const status = dbCheck.exists && postgrestCheck ? "✅" : dbCheck.exists ? "⚠️" : "❌";
      console.log(`   ${status} ${view.padEnd(35)} DB: ${dbCheck.exists ? "✓" : "✗"} | PostgREST: ${postgrestCheck ? "✓" : "✗"}`);
    }
  }

  // Check RPC functions
  if (REQUIRED_RPC_FUNCTIONS.length > 0) {
    console.log("\n⚙️  Checking RPC functions...");
    for (const func of REQUIRED_RPC_FUNCTIONS) {
      const dbCheck = await checkRPCFunction(func);
      const postgrestCheck = dbCheck.exists
        ? await checkPostgRESTVisibility(func, "rpc")
        : false;

      results.push({
        name: func,
        type: "rpc",
        existsInDB: dbCheck.exists,
        visibleInPostgREST: postgrestCheck,
        error: dbCheck.error,
      });

      const status = dbCheck.exists && postgrestCheck ? "✅" : dbCheck.exists ? "⚠️" : "❌";
      console.log(`   ${status} ${func.padEnd(35)} DB: ${dbCheck.exists ? "✓" : "✗"} | PostgREST: ${postgrestCheck ? "✓" : "✗"}`);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Summary");
  console.log("=".repeat(60));

  const allExist = results.every((r) => r.existsInDB);
  const allVisible = results.every((r) => r.existsInDB && r.visibleInPostgREST);
  const missingInDB = results.filter((r) => !r.existsInDB);
  const missingInCache = results.filter((r) => r.existsInDB && !r.visibleInPostgREST);

  console.log(`✅ All exist in DB:     ${allExist ? "YES" : "NO"}`);
  console.log(`✅ All visible in PostgREST: ${allVisible ? "YES" : "NO"}`);

  if (missingInDB.length > 0) {
    console.log(`\n❌ Missing in DB (${missingInDB.length}):`);
    missingInDB.forEach((r) => console.log(`   - ${r.name} (${r.type})`));
  }

  if (missingInCache.length > 0) {
    console.log(`\n⚠️  In DB but not in PostgREST cache (${missingInCache.length}):`);
    missingInCache.forEach((r) => console.log(`   - ${r.name} (${r.type})`));
    console.log("\n💡 Run: pnpm supabase:reload-postgrest");
    console.log("   Or: POST /api/admin/reload-postgrest");
  }

  console.log("=".repeat(60));

  return {
    success: allExist && allVisible,
    results,
  };
}

// Run
introspectPostgREST()
  .then(({ success }) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
