/**
 * Apply Database Migrations
 * Reads SQL files from scripts/db/migrations/ and applies them via Supabase
 * 
 * Usage: tsx scripts/db/apply-migrations.ts
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing required environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration(filename: string, sql: string): Promise<boolean> {
  console.log(`📦 Applying migration: ${filename}...`);

  try {
    // Split SQL by semicolons and execute each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      if (!statement) continue;

      // Use Supabase REST API to execute SQL
      // Note: This requires the Supabase Management API or direct database access
      // For now, we'll use a workaround via RPC if available
      
      const { error } = await supabase.rpc("exec_sql", {
        sql: statement,
      });

      if (error) {
        // If exec_sql doesn't exist, we need to use Supabase CLI or Management API
        if (error.message?.includes("exec_sql") || error.message?.includes("function") && error.message?.includes("does not exist")) {
          console.warn(`   ⚠️  Direct SQL execution not available.`);
          console.warn(`   Please apply migration manually via Supabase Dashboard or CLI:`);
          console.warn(`   File: scripts/db/migrations/${filename}`);
          return false;
        }

        // Ignore "already exists" errors
        if (
          error.message?.includes("already exists") ||
          error.message?.includes("duplicate") ||
          error.message?.includes("IF NOT EXISTS")
        ) {
          console.log(`   ℹ️  ${error.message}`);
          continue;
        }

        console.error(`   ❌ Error:`, error.message);
        return false;
      }
    }

    console.log(`   ✅ Migration ${filename} applied successfully`);
    return true;
  } catch (err: any) {
    console.error(`   ❌ Failed to apply migration ${filename}:`, err.message);
    return false;
  }
}

async function applyAllMigrations() {
  console.log("🚀 Applying database migrations...\n");

  const migrationsDir = join(process.cwd(), "scripts/db/migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("ℹ️  No migration files found.");
    return true;
  }

  console.log(`Found ${files.length} migration(s):\n`);

  const results: Array<{ file: string; success: boolean }> = [];

  for (const file of files) {
    const filePath = join(migrationsDir, file);
    const sql = readFileSync(filePath, "utf-8");

    const success = await applyMigration(file, sql);
    results.push({ file, success });

    if (!success) {
      console.log(`\n⚠️  Migration ${file} failed. Please apply manually.`);
    }
  }

  console.log("\n📊 Summary:");
  console.log("─".repeat(50));
  results.forEach((r) => {
    const status = r.success ? "✅ SUCCESS" : "❌ FAILED";
    console.log(`${status.padEnd(15)} ${r.file}`);
  });

  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    console.log("\n⚠️  Some migrations failed. Please apply manually via Supabase Dashboard or CLI.");
    return false;
  }

  console.log("\n✅ All migrations applied successfully!");
  
  // After migrations, reload PostgREST schema cache
  console.log("\n🔄 Reloading PostgREST schema cache...");
  try {
    const { execSync } = await import("child_process");
    execSync("tsx scripts/supabase/reload-postgrest.ts", {
      stdio: "inherit",
      env: process.env,
    });
  } catch (error: any) {
    console.warn("⚠️  Failed to reload PostgREST cache:", error.message);
    console.warn("   You can manually run: pnpm supabase:reload-postgrest");
  }
  
  return true;
}

// Run migrations
applyAllMigrations()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
