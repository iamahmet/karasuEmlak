/**
 * Apply Migrations via Supabase Management API
 * Uses Supabase CLI or Management API to apply SQL migrations
 * 
 * Usage: 
 *   SUPABASE_ACCESS_TOKEN=xxx tsx scripts/db/apply-migrations-via-supabase.ts
 *   OR
 *   supabase db push (if using Supabase CLI)
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing required environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗");
  process.exit(1);
}

async function applyMigrationViaAPI(filename: string, sql: string): Promise<boolean> {
  console.log(`📦 Applying migration: ${filename}...`);

  try {
    // Use Supabase Management API to execute SQL
    // Note: This requires the Management API access token
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`   ❌ API Error:`, error);
      return false;
    }

    console.log(`   ✅ Migration ${filename} applied successfully`);
    return true;
  } catch (err: any) {
    console.error(`   ❌ Failed:`, err.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Applying database migrations via Supabase API...\n");
  console.log("⚠️  Note: Direct SQL execution via REST API is limited.");
  console.log("   For production, use Supabase CLI: supabase db push\n");

  const migrationsDir = join(process.cwd(), "scripts/db/migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("ℹ️  No migration files found.");
    return;
  }

  console.log(`Found ${files.length} migration(s):\n`);
  console.log("📝 Migration files to apply manually:");
  console.log("─".repeat(50));
  files.forEach((file, index) => {
    console.log(`${index + 1}. ${file}`);
  });

  console.log("\n💡 To apply migrations:");
  console.log("   1. Use Supabase Dashboard: SQL Editor → Run migration files");
  console.log("   2. Use Supabase CLI: supabase db push");
  console.log("   3. Copy SQL from scripts/db/migrations/*.sql and run in Supabase SQL Editor");
}

main().catch(console.error);
