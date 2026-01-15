#!/usr/bin/env tsx

/**
 * Apply Programmatic Pages Migration
 * 
 * Bu script migration'ı Supabase'e uygular
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";
import { join } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log("🚀 Programmatic Pages migration uygulanıyor...\n");

  try {
    // Read migration file
    const migrationPath = join(process.cwd(), "supabase/migrations/20260129000000_create_programmatic_pages.sql");
    const sql = readFileSync(migrationPath, "utf-8");

    // Split SQL into individual statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`📝 ${statements.length} SQL statement bulundu\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) continue;

      try {
        // Use RPC to execute SQL (if available) or direct query
        // Note: Supabase JS client doesn't support raw SQL execution
        // We'll need to use the Management API or CLI
        
        // For now, we'll check if table exists and provide instructions
        const { data: tableCheck, error: checkError } = await supabase
          .from("programmatic_pages")
          .select("id")
          .limit(1);

        if (!checkError) {
          console.log("✅ Tablo zaten mevcut, migration atlanıyor\n");
          return true;
        }

        // If table doesn't exist, we need to use Supabase CLI or Dashboard
        if (checkError?.code === "PGRST116" || checkError?.message?.includes("could not find the table")) {
          console.log("⚠️  Tablo bulunamadı. Migration'ı manuel olarak uygulamanız gerekiyor.\n");
          console.log("📋 Yöntem 1: Supabase Dashboard");
          console.log("   1. https://supabase.com/dashboard adresine gidin");
          console.log("   2. Projenizi seçin");
          console.log("   3. SQL Editor'ü açın");
          console.log("   4. Migration dosyasını kopyalayıp yapıştırın:");
          console.log(`      ${migrationPath}\n`);
          console.log("📋 Yöntem 2: Supabase CLI");
          console.log("   pnpm supabase db push\n");
          return false;
        }

        throw checkError;
      } catch (error: any) {
        if (error?.code === "PGRST116" || error?.message?.includes("could not find the table")) {
          // Table doesn't exist, which is expected
          continue;
        }
        throw error;
      }
    }

    console.log("✅ Migration başarıyla uygulandı!\n");
    return true;
  } catch (error: any) {
    console.error("❌ Migration hatası:", error.message);
    console.log("\n📋 Migration'ı manuel olarak uygulayın:");
    console.log("   1. Supabase Dashboard → SQL Editor");
    console.log("   2. Dosya: supabase/migrations/20260129000000_create_programmatic_pages.sql");
    console.log("   3. Veya: pnpm supabase db push\n");
    return false;
  }
}

// Run migration
applyMigration()
  .then((success) => {
    if (success) {
      console.log("✅ Migration tamamlandı.");
      process.exit(0);
    } else {
      console.log("⚠️  Migration manuel olarak uygulanmalı.");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
