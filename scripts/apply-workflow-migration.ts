/**
 * Apply Workflow System Migration
 * Directly executes the SQL migration file
 */

import { readFileSync } from "fs";
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

async function applyMigration() {
  console.log("🚀 Applying Workflow System Migration...\n");

  // Read migration file
  const migrationPath = join(
    process.cwd(),
    "supabase/migrations/20260127000000_admin_workflow_system.sql"
  );

  let sql: string;
  try {
    sql = readFileSync(migrationPath, "utf-8");
  } catch (error: any) {
    console.error(`❌ Failed to read migration file: ${error.message}`);
    process.exit(1);
  }

  console.log("📝 Migration file loaded\n");

  // Split SQL into statements
  // Remove comments and split by semicolons
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => {
      // Remove empty statements and comments
      if (!s || s.length === 0) return false;
      if (s.startsWith("--")) return false;
      // Keep statements that are not just comments
      const withoutComments = s.replace(/--.*$/gm, "").trim();
      return withoutComments.length > 0;
    });

  console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  // Execute each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement || statement.trim().length === 0) continue;

    // Skip comment-only lines
    if (statement.replace(/--.*$/gm, "").trim().length === 0) continue;

    try {
      // Use Supabase REST API to execute SQL via RPC
      // Note: This requires a function in Supabase that can execute SQL
      // For now, we'll try using the Management API approach
      
      // Alternative: Use Supabase's SQL execution endpoint if available
      const { error } = await supabase.rpc("exec_sql", {
        sql: statement,
      });

      if (error) {
        // If exec_sql doesn't exist, we need manual execution
        if (
          error.message?.includes("exec_sql") ||
          error.message?.includes("function") ||
          error.message?.includes("does not exist")
        ) {
          console.log(`\n⚠️  Direct SQL execution via API is not available.`);
          console.log(`\n📋 Please apply this migration manually:`);
          console.log(`   1. Go to Supabase Dashboard → SQL Editor`);
          console.log(`   2. Copy the SQL from: ${migrationPath}`);
          console.log(`   3. Paste and execute in SQL Editor\n`);
          console.log(`\n💡 Or use Supabase CLI:`);
          console.log(`   supabase migration repair --status applied 20260127000000`);
          console.log(`   supabase db push\n`);
          return;
        }

        // Check for "already exists" errors (these are OK with IF NOT EXISTS)
        if (
          error.message?.includes("already exists") ||
          error.message?.includes("duplicate") ||
          error.message?.includes("IF NOT EXISTS")
        ) {
          console.log(`   ✓ Statement ${i + 1}: Already exists (skipped)`);
          successCount++;
          continue;
        }

        console.error(`   ❌ Statement ${i + 1} failed:`, error.message);
        errorCount++;
      } else {
        console.log(`   ✓ Statement ${i + 1}: Success`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`   ❌ Statement ${i + 1} error:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);

  if (errorCount === 0) {
    console.log(`\n✅ Migration applied successfully!`);
    console.log(`\n🔄 Next step: Reload PostgREST schema cache`);
    console.log(`   Run: pnpm supabase:reload-postgrest\n`);
  } else {
    console.log(`\n⚠️  Some statements failed. Please check the errors above.`);
    console.log(`\n💡 You can also apply this migration manually via Supabase Dashboard SQL Editor.`);
  }
}

applyMigration().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
