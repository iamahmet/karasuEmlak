#!/usr/bin/env tsx

/**
 * Apply Programmatic Pages Migration Directly
 * 
 * Bu script migration'ı Supabase'e doğrudan uygular
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

// Use service role client for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function applyMigration() {
  console.log("🚀 Programmatic Pages migration uygulanıyor...\n");

  try {
    // Read migration file
    const migrationPath = join(process.cwd(), "supabase/migrations/20260129000000_create_programmatic_pages.sql");
    const sql = readFileSync(migrationPath, "utf-8");

    // Check if table already exists
    const { data: existingTable, error: checkError } = await supabase
      .rpc("exec_sql", { sql_query: "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'programmatic_pages');" })
      .single();

    // Try direct approach - execute SQL via PostgREST
    // Since Supabase JS client doesn't support raw SQL, we'll use the Management API approach
    // Or we can try to create the table using the client's methods

    // Alternative: Use Supabase's REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": supabaseServiceKey,
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ sql_query: sql }),
    });

    if (!response.ok) {
      // If RPC doesn't exist, we need to use Supabase Dashboard or CLI
      console.log("⚠️  Migration'ı doğrudan uygulayamıyoruz. Manuel uygulama gerekiyor.\n");
      console.log("📋 Yöntem 1: Supabase Dashboard (Önerilen)");
      console.log("   1. https://supabase.com/dashboard adresine gidin");
      console.log("   2. Projenizi seçin (lbfimbcvvvbczllhqqlf)");
      console.log("   3. Sol menüden 'SQL Editor' seçin");
      console.log("   4. 'New query' butonuna tıklayın");
      console.log("   5. Aşağıdaki dosyayı açın ve içeriğini kopyalayın:");
      console.log(`      ${migrationPath}`);
      console.log("   6. SQL Editor'e yapıştırın ve 'Run' butonuna tıklayın\n");
      
      console.log("📋 Yöntem 2: Supabase CLI (Migration history düzeltildikten sonra)");
      console.log("   pnpm supabase migration repair --status applied 20260129000000");
      console.log("   pnpm supabase db push\n");
      
      return false;
    }

    const result = await response.json();
    console.log("✅ Migration başarıyla uygulandı!\n");
    return true;
  } catch (error: any) {
    console.log("⚠️  Migration'ı doğrudan uygulayamıyoruz. Manuel uygulama gerekiyor.\n");
    console.log("📋 Supabase Dashboard'dan uygulayın:");
    console.log("   1. https://supabase.com/dashboard");
    console.log("   2. SQL Editor → New query");
    console.log(`   3. Dosya: supabase/migrations/20260129000000_create_programmatic_pages.sql\n`);
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
      console.log("⚠️  Lütfen migration'ı manuel olarak uygulayın.");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
