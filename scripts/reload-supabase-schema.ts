#!/usr/bin/env tsx

/**
 * Reload Supabase PostgREST Schema Cache
 * This fixes PGRST205 errors when tables are newly created
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function reloadSchema() {
  console.log("🔄 Supabase PostgREST schema cache yenileniyor...");
  
  try {
    // Method 1: Query table to force schema refresh
    console.log("📊 Schema refresh için content_comments tablosu sorgulanıyor...");

    // Method 2: Direct SQL execution (if RPC doesn't work)
    if (notifyError) {
      console.log("⚠️  RPC method failed, trying direct SQL...");
      const { error: sqlError } = await supabase
        .from('_dummy')
        .select('*')
        .limit(0)
        .catch(() => {
          // This will fail but might trigger schema refresh
          return { error: null };
        });
    }

    // Method 3: Query the table to force schema refresh
    console.log("📊 Schema refresh için content_comments tablosu sorgulanıyor...");
    const { data, error } = await supabase
      .from("content_comments")
      .select("id")
      .limit(1);

    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("schema cache")) {
        console.log("⚠️  Schema cache henüz güncellenmedi. Birkaç dakika bekleyin...");
        console.log("💡 Supabase Dashboard > SQL Editor'de şu komutu çalıştırın:");
        console.log("   NOTIFY pgrst, 'reload schema';");
      } else {
        console.error("❌ Schema refresh hatası:", error.message);
      }
    } else {
      console.log("✅ Schema cache başarıyla yenilendi!");
      if (data) {
        console.log(`📝 content_comments tablosunda ${data.length > 0 ? 'veri' : 'henüz veri yok'} var`);
      }
    }
  } catch (error: any) {
    console.error("❌ Schema reload hatası:", error.message);
    console.log("\n💡 Manuel olarak Supabase Dashboard > SQL Editor'de şu komutu çalıştırın:");
    console.log("   NOTIFY pgrst, 'reload schema';");
  }
}

reloadSchema();
