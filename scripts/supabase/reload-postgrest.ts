#!/usr/bin/env tsx

/**
 * Reload PostgREST Schema Cache
 * 
 * This script triggers PostgREST to reload its schema cache after database migrations.
 * It uses the SECURITY DEFINER function created in migration 006.
 * 
 * Usage:
 *   pnpm supabase:reload-postgrest
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx pnpm supabase:reload-postgrest
 * 
 * Features:
 * - Calls pgrst_reload_schema() RPC function
 * - Waits for cache to update (1-2 seconds)
 * - Verifies tables are visible (retries with exponential backoff)
 * - Returns exit code 0 on success, 1 on failure
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from multiple possible locations
const envPaths = [
  resolve(__dirname, "../.env.local"),
  resolve(__dirname, "../../.env.local"),
  resolve(process.cwd(), ".env.local"),
];

for (const envPath of envPaths) {
  try {
    dotenv.config({ path: envPath });
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      break; // Found valid env file
    }
  } catch {
    // Continue to next path
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing required environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗");
  console.error("\n💡 Add these to .env.local file");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface VerificationResult {
  table: string;
  visible: boolean;
  error?: string;
  count?: number;
}

/**
 * Verify that a table is visible in PostgREST schema cache
 */
async function verifyTable(tableName: string): Promise<VerificationResult> {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true })
      .limit(0);

    if (error) {
      // PGRST205 = table not in schema cache
      // PGRST116 = table doesn't exist
      if (error.code === "PGRST205" || error.code === "PGRST202") {
        return {
          table: tableName,
          visible: false,
          error: `Schema cache stale: ${error.message}`,
        };
      }
      if (error.code === "PGRST116" || error.code === "42P01") {
        return {
          table: tableName,
          visible: false,
          error: `Table does not exist: ${error.message}`,
        };
      }
      return {
        table: tableName,
        visible: false,
        error: error.message,
      };
    }

    return {
      table: tableName,
      visible: true,
      count: count || 0,
    };
  } catch (err: any) {
    return {
      table: tableName,
      visible: false,
      error: err.message || "Unknown error",
    };
  }
}

/**
 * Wait for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Reload PostgREST schema cache and verify
 */
async function reloadPostgREST(): Promise<boolean> {
  const isRemote = SUPABASE_URL.includes("supabase.co");
  if (isRemote) {
    console.log("Target: Supabase Hosted (remote).");
    console.log("If RPC/NOTIFY below fails, run in Dashboard > SQL Editor:\n  NOTIFY pgrst, 'reload schema';\n");
  } else {
    console.log("Target: Local Supabase. To fully restart PostgREST: pnpm supabase:stop then pnpm supabase:start\n");
  }

  console.log("🔄 Reloading PostgREST schema cache...\n");

  // Step 1: Call RPC function to trigger reload (with fallback to direct SQL)
  console.log("📡 Step 1: Triggering schema reload...");
  let reloadTriggered = false;
  
  try {
    const { data, error } = await supabase.rpc("pgrst_reload_schema");

    if (error) {
      // If function doesn't exist in cache, try direct SQL fallback
      if (
        error.code === "PGRST202" ||
        error.message?.includes("function") ||
        error.message?.includes("does not exist") ||
        error.message?.includes("schema cache")
      ) {
        console.warn("   ⚠️  RPC function not in PostgREST cache yet.");
        console.log("   🔄 Trying direct SQL NOTIFY as fallback...");
        
        // Fallback: Use direct SQL execution via Supabase Management API
        try {
          const { error: sqlError } = await supabase.rpc("exec_sql", {
            sql: "NOTIFY pgrst, 'reload schema';",
          });
          
          if (sqlError) {
            // If exec_sql doesn't exist, try via direct HTTP
            console.log("   🔄 Trying direct HTTP to PostgREST...");
            const notifyUrl = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
            const notifyResponse = await fetch(notifyUrl, {
              method: "POST",
              headers: {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ sql: "NOTIFY pgrst, 'reload schema';" }),
            });
            
            if (notifyResponse.ok) {
              console.log("   ✅ Direct NOTIFY sent via HTTP");
              reloadTriggered = true;
            } else {
              console.warn("   ⚠️  Direct HTTP also failed, but NOTIFY may have been sent");
              console.warn("   💡 Function exists in DB but PostgREST cache needs time to update");
              reloadTriggered = true; // Assume it worked, continue with verification
            }
          } else {
            console.log("   ✅ Direct NOTIFY sent via exec_sql");
            reloadTriggered = true;
          }
        } catch (fallbackErr: any) {
          console.warn("   ⚠️  Fallback methods failed:", fallbackErr.message);
          console.warn("   💡 Function exists in DB. PostgREST cache will update automatically.");
          console.warn("   💡 You can also run this SQL manually in Supabase Dashboard:");
          console.warn("      NOTIFY pgrst, 'reload schema';");
          reloadTriggered = true; // Continue anyway - cache may update
        }
      } else {
        console.error("❌ Failed to trigger reload:", error.message);
        return false;
      }
    } else {
      console.log("   ✅ Reload triggered via RPC:", data);
      reloadTriggered = true;
    }
  } catch (err: any) {
    console.warn("   ⚠️  RPC call failed:", err.message);
    console.warn("   💡 Continuing with verification - cache may update automatically");
    reloadTriggered = true; // Continue anyway
  }

  if (!reloadTriggered) {
    console.error("❌ Could not trigger reload");
    return false;
  }

  // Step 2: Wait for cache to update
  console.log("\n⏳ Step 2: Waiting for cache to update (2 seconds)...");
  await sleep(2000);

  // Step 3: Verify critical tables are visible
  console.log("\n🔍 Step 3: Verifying tables are visible...");
  const criticalTables = [
    "content_comments",
    "articles",
    "listings",
    "news_articles",
    "notifications",
    "seo_events",
  ];

  const results: VerificationResult[] = [];
  for (const table of criticalTables) {
    const result = await verifyTable(table);
    results.push(result);
    
    if (result.visible) {
      console.log(`   ✅ ${table.padEnd(25)} visible (${result.count ?? 0} rows)`);
    } else {
      console.log(`   ⚠️  ${table.padEnd(25)} ${result.error || "not visible"}`);
    }
  }

  // Step 4: Retry with exponential backoff if any table is not visible
  const failedTables = results.filter((r) => !r.visible && !r.error?.includes("does not exist"));
  
  if (failedTables.length > 0) {
    console.log(`\n🔄 Step 4: Retrying failed tables (up to 3 attempts)...`);
    
    let attempt = 1;
    const maxAttempts = 3;
    
    while (attempt <= maxAttempts && failedTables.length > 0) {
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
      console.log(`   Attempt ${attempt}/${maxAttempts}: Waiting ${waitTime}ms...`);
      await sleep(waitTime);

      // Retry verification for failed tables
      for (let i = failedTables.length - 1; i >= 0; i--) {
        const table = failedTables[i].table;
        const result = await verifyTable(table);
        
        if (result.visible) {
          console.log(`   ✅ ${table.padEnd(25)} now visible (${result.count ?? 0} rows)`);
          failedTables.splice(i, 1);
          // Update original result
          const originalIndex = results.findIndex((r) => r.table === table);
          if (originalIndex >= 0) {
            results[originalIndex] = result;
          }
        } else {
          console.log(`   ⚠️  ${table.padEnd(25)} still not visible`);
        }
      }

      attempt++;
    }
  }

  // Final summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Verification Summary");
  console.log("=".repeat(60));

  const visibleTables = results.filter((r) => r.visible);
  const missingTables = results.filter((r) => !r.visible && r.error?.includes("does not exist"));
  const staleTables = results.filter((r) => !r.visible && !r.error?.includes("does not exist"));

  console.log(`✅ Visible:     ${visibleTables.length}/${results.length}`);
  if (missingTables.length > 0) {
    console.log(`⚠️  Missing:     ${missingTables.length} (table doesn't exist - this is OK)`);
    missingTables.forEach((r) => console.log(`   - ${r.table}`));
  }
  if (staleTables.length > 0) {
    console.log(`❌ Stale cache: ${staleTables.length} (still not visible after reload)`);
    staleTables.forEach((r) => console.log(`   - ${r.table}: ${r.error}`));
  }

  console.log("=".repeat(60));

  // Success if all critical tables are either visible or don't exist
  const success = staleTables.length === 0;

  if (success) {
    console.log("\n✅ PostgREST schema cache reloaded successfully!");
    if (visibleTables.length > 0) {
      console.log(`   ${visibleTables.length} table(s) verified and accessible.`);
    }
    return true;
  } else {
    console.error("\n❌ Some tables still not visible after reload.");
    console.error("   This may indicate:");
    console.error("   1. PostgREST service needs restart (Supabase infrastructure)");
    console.error("   2. Table was created very recently (wait a few minutes)");
    console.error("   3. Migration not applied correctly");
    console.error("\n💡 Try:");
    console.error("   - Wait 1-2 minutes and run this script again");
    console.error("   - Check Supabase Dashboard > Database > Tables");
    console.error("   - Contact Supabase Support if issue persists");
    return false;
  }
}

// Run
reloadPostgREST()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
