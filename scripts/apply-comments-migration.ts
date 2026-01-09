#!/usr/bin/env tsx

/**
 * Apply content_comments migration automatically
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials");
  console.error("   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log("🚀 Applying content_comments migration...\n");

  try {
    // Read migration file
    const migrationPath = resolve(__dirname, "db/migrations/005_create_content_comments.sql");
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    console.log("📄 Migration file loaded:", migrationPath);
    console.log("📝 Executing SQL...\n");

    // Execute migration using RPC or direct SQL
    // Note: Supabase JS client doesn't support raw SQL execution directly
    // We'll use the REST API or check if table exists first
    
    // Check if table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from("content_comments")
      .select("id")
      .limit(1);

    if (existingTable !== null && !checkError) {
      console.log("✅ content_comments table already exists!");
      console.log("   Skipping migration...\n");
      return;
    }

    // If we get here, table doesn't exist
    // We need to use Supabase Management API or SQL Editor API
    console.log("⚠️  Table doesn't exist, but Supabase JS client cannot execute raw SQL.");
    console.log("   Please apply migration manually via:");
    console.log("   1. Supabase Dashboard > SQL Editor");
    console.log("   2. Or use Supabase CLI: supabase db push");
    console.log("\n   Migration file: scripts/db/migrations/005_create_content_comments.sql\n");
    
    // Try to use REST API to execute SQL (if available)
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ sql: migrationSQL }),
      });

      if (response.ok) {
        console.log("✅ Migration applied successfully via REST API!");
        return;
      }
    } catch (e) {
      // REST API method not available, fall back to manual instructions
    }

    // Alternative: Use Supabase Management API
    console.log("📋 Migration SQL to execute:\n");
    console.log("─".repeat(60));
    console.log(migrationSQL);
    console.log("─".repeat(60));
    console.log("\n");

    // Try using pg REST API directly
    const sqlStatements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`📊 Found ${sqlStatements.length} SQL statements to execute\n`);

    // For now, provide instructions
    console.log("💡 To apply this migration automatically, use one of these methods:\n");
    console.log("   1. Supabase Dashboard:");
    console.log("      - Go to SQL Editor");
    console.log("      - Paste the SQL above");
    console.log("      - Click Run\n");
    console.log("   2. Supabase CLI:");
    console.log("      supabase db execute -f scripts/db/migrations/005_create_content_comments.sql\n");
    console.log("   3. psql:");
    console.log("      psql <connection_string> -f scripts/db/migrations/005_create_content_comments.sql\n");

  } catch (error: any) {
    console.error("❌ Error applying migration:", error.message);
    console.error("\n📋 Please apply migration manually:");
    console.error("   File: scripts/db/migrations/005_create_content_comments.sql");
    process.exit(1);
  }
}

applyMigration()
  .then(() => {
    console.log("✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
