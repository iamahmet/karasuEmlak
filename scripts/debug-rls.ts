#!/usr/bin/env tsx

/**
 * RLS Debug Script
 * 
 * Verifies RLS policies work correctly by comparing:
 * - anon client (public access) vs service role (admin access)
 * 
 * Usage:
 *   pnpm debug:rls
 * 
 * Expected results:
 * - anon_count < service_role_count (for content tables)
 * - admin never returns 0 unless DB is empty
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing required environment variables");
  process.exit(1);
}

// Create clients
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Create service role client (admin access)
const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface TableCheck {
  table: string;
  anonCount: number | null;
  serviceCount: number | null;
  anonError?: string;
  serviceError?: string;
  status: "ok" | "warning" | "error";
}

async function checkTable(tableName: string): Promise<TableCheck> {
  const result: TableCheck = {
    table: tableName,
    anonCount: null,
    serviceCount: null,
    status: "ok",
  };

  // Check with anon client
  try {
    const { count, error } = await anonClient
      .from(tableName)
      .select("*", { count: "exact", head: true });

    if (error) {
      result.anonError = `${error.code}: ${error.message}`;
      result.status = "warning";
    } else {
      result.anonCount = count || 0;
    }
  } catch (err: any) {
    result.anonError = err.message;
    result.status = "error";
  }

  // Check with service client
  try {
    const { count, error } = await serviceClient
      .from(tableName)
      .select("*", { count: "exact", head: true });

    if (error) {
      result.serviceError = `${error.code}: ${error.message}`;
      result.status = "error";
    } else {
      result.serviceCount = count || 0;
    }
  } catch (err: any) {
    result.serviceError = err.message;
    result.status = "error";
  }

  // Validate results
  if (result.serviceCount !== null && result.serviceCount === 0 && result.anonCount !== null && result.anonCount === 0) {
    // Both are 0 - table might be empty (OK)
    result.status = "ok";
  } else if (result.serviceCount !== null && result.serviceCount > 0 && result.anonCount !== null && result.anonCount >= result.serviceCount) {
    // Anon sees same or more - RLS might not be working (WARNING)
    result.status = "warning";
  } else if (result.serviceCount !== null && result.serviceCount > 0 && result.anonCount !== null && result.anonCount < result.serviceCount) {
    // Anon sees less - RLS is working (OK)
    result.status = "ok";
  } else if (result.serviceError) {
    // Service client error - critical (ERROR)
    result.status = "error";
  }

  return result;
}

async function main() {
  console.log("🔍 RLS Debug - Verifying Row Level Security Policies\n");
  console.log("=".repeat(70));

  const tables = [
    "articles",
    "news_articles",
    "content_comments",
    "content_items",
    "content_locales",
    "neighborhoods",
    "qa_entries",
    "seo_events",
  ];

  const results: TableCheck[] = [];

  for (const table of tables) {
    const result = await checkTable(table);
    results.push(result);
  }

  // Print results
  console.log("\n📊 Results:\n");
  console.log("Table".padEnd(25) + "Anon".padEnd(12) + "Service".padEnd(12) + "Status");
  console.log("-".repeat(70));

  for (const result of results) {
    const anonStr = result.anonCount !== null 
      ? result.anonCount.toString() 
      : result.anonError?.substring(0, 10) || "N/A";
    const serviceStr = result.serviceCount !== null 
      ? result.serviceCount.toString() 
      : result.serviceError?.substring(0, 10) || "N/A";
    const statusIcon = result.status === "ok" ? "✅" : result.status === "warning" ? "⚠️ " : "❌";

    console.log(
      result.table.padEnd(25) +
      anonStr.padEnd(12) +
      serviceStr.padEnd(12) +
      statusIcon
    );

    if (result.anonError) {
      console.log(`  ⚠️  Anon error: ${result.anonError}`);
    }
    if (result.serviceError) {
      console.log(`  ❌ Service error: ${result.serviceError}`);
    }
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("📋 Summary:\n");

  const ok = results.filter((r) => r.status === "ok").length;
  const warnings = results.filter((r) => r.status === "warning").length;
  const errors = results.filter((r) => r.status === "error").length;

  console.log(`✅ OK:        ${ok}/${results.length}`);
  console.log(`⚠️  Warnings:  ${warnings}/${results.length}`);
  console.log(`❌ Errors:    ${errors}/${results.length}`);

  // Check for issues
  const hasIssues = warnings > 0 || errors > 0;

  if (hasIssues) {
    console.log("\n⚠️  Issues found:");
    results
      .filter((r) => r.status !== "ok")
      .forEach((r) => {
        console.log(`\n  ${r.table}:`);
        if (r.status === "warning") {
          console.log(`    - Anon sees ${r.anonCount}, Service sees ${r.serviceCount}`);
          console.log(`    - Anon should see LESS than service (RLS should filter)`);
        }
        if (r.serviceError) {
          console.log(`    - Service client error: ${r.serviceError}`);
          console.log(`    - CRITICAL: Admin APIs won't work!`);
        }
      });
  } else {
    console.log("\n✅ All checks passed! RLS is working correctly.");
  }

  console.log("\n" + "=".repeat(70));
  console.log("💡 Expected behavior:");
  console.log("   - Anon client: Sees only published/approved content");
  console.log("   - Service client: Sees ALL content (bypasses RLS)");
  console.log("   - Service count should be >= anon count");
  console.log("=".repeat(70));

  process.exit(hasIssues ? 1 : 0);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
