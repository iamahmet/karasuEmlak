#!/usr/bin/env tsx

/**
 * Apply Migration via Service Role
 * 
 * Bu script migration'ı Supabase service role ile uygular
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

async function applyMigration() {
  console.log("🚀 Programmatic Pages migration uygulanıyor...\n");

  // Read migration file
  const migrationPath = join(process.cwd(), "supabase/migrations/20260129000000_create_programmatic_pages.sql");
  const sql = readFileSync(migrationPath, "utf-8");

  // Supabase JS client doesn't support raw SQL execution
  // We need to use Supabase Management API or Dashboard
  
  console.log("⚠️  Supabase JS client raw SQL çalıştıramaz.\n");
  console.log("📋 Migration'ı manuel olarak uygulamanız gerekiyor:\n");
  console.log("YÖNTEM 1: Supabase Dashboard (Önerilen)");
  console.log("─────────────────────────────────────────");
  console.log("1. https://supabase.com/dashboard adresine gidin");
  console.log("2. Projenizi seçin");
  console.log("3. Sol menüden 'SQL Editor' seçin");
  console.log("4. 'New query' butonuna tıklayın");
  console.log("5. Aşağıdaki SQL'i kopyalayıp yapıştırın:\n");
  console.log("─".repeat(60));
  console.log(sql);
  console.log("─".repeat(60));
  console.log("\n6. 'Run' butonuna tıklayın\n");
  
  console.log("YÖNTEM 2: Supabase CLI");
  console.log("─────────────────────────────────────────");
  console.log("Migration history'yi düzelttikten sonra:");
  console.log("  pnpm supabase migration repair --status applied 20260129000000");
  console.log("  pnpm supabase db push\n");
  
  // Check if table exists after manual application
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: checkData, error: checkError } = await supabase
    .from("programmatic_pages")
    .select("id")
    .limit(1);

  if (!checkError && checkData !== null) {
    console.log("✅ Tablo mevcut! Migration başarıyla uygulanmış.\n");
    return true;
  }

  console.log("⚠️  Tablo henüz oluşturulmamış. Lütfen yukarıdaki adımları takip edin.\n");
  return false;
}

// Run
applyMigration()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Hata:", error);
    process.exit(1);
  });
