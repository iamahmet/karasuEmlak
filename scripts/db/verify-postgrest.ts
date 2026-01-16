#!/usr/bin/env tsx

/**
 * PostgREST Verification Script
 * 
 * Verifies that all required tables/views/functions are visible in PostgREST schema cache.
 * This is a simplified version of introspect-postgrest.ts focused on critical objects.
 * 
 * Usage:
 *   pnpm db:verify-postgrest
 * 
 * Exits with code 0 if all objects are visible, 1 if any are missing.
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

// Critical objects that MUST be visible in PostgREST
const CRITICAL_TABLES = [
  "articles",
  "notifications",
  "content_ai_improvements",
  "authors",
] as const;

interface VerificationResult {
  name: string;
  visible: boolean;
  error?: string;
}

async function verifyTable(name: string): Promise<VerificationResult> {
  try {
    const { error } = await supabase
      .from(name)
      .select("*", { count: "exact", head: true })
      .limit(0);

    if (error) {
      // PGRST205/PGRST202 = schema cache stale
      if (error.code === "PGRST205" || error.code === "PGRST202") {
        return {
          name,
          visible: false,
          error: `Schema cache stale: ${error.message}`,
        };
      }
      // PGRST116 = table doesn't exist
      if (error.code === "PGRST116" || error.code === "42P01") {
        return {
          name,
          visible: false,
          error: `Table does not exist: ${error.message}`,
        };
      }
      return {
        name,
        visible: false,
        error: error.message,
      };
    }

    return {
      name,
      visible: true,
    };
  } catch (err: any) {
    return {
      name,
      visible: false,
      error: err.message || "Unknown error",
    };
  }
}

async function main() {
  console.log("🔍 Verifying PostgREST schema cache...\n");

  const results: VerificationResult[] = [];
  for (const table of CRITICAL_TABLES) {
    const result = await verifyTable(table);
    results.push(result);
    
    if (result.visible) {
      console.log(`   ✅ ${table.padEnd(30)} visible`);
    } else {
      console.log(`   ❌ ${table.padEnd(30)} ${result.error || "not visible"}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  const visibleCount = results.filter((r) => r.visible).length;
  const failedCount = results.filter((r) => !r.visible).length;

  console.log(`✅ Visible: ${visibleCount}/${results.length}`);
  if (failedCount > 0) {
    console.log(`❌ Failed:  ${failedCount}/${results.length}`);
    console.log("\n💡 To fix:");
    console.log("   pnpm supabase:reload-postgrest");
    console.log("   or");
    console.log("   curl -X POST http://localhost:3001/api/admin/reload-postgrest");
  }
  console.log("=".repeat(60));

  const success = failedCount === 0;
  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
