#!/usr/bin/env tsx

/**
 * Auto-reload PostgREST Cache
 * 
 * This script automatically reloads PostgREST cache after detecting schema changes.
 * It should be called after migrations or table changes.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Reload PostgREST cache with retry logic
 */
async function reloadCacheWithRetry(maxRetries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.rpc("pgrst_reload_schema");

      if (!error && data?.ok) {
        // Wait for cache to update
        await new Promise(resolve => setTimeout(resolve, 2000));
        return true;
      }

      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`   ⏳ Retry ${attempt}/${maxRetries} in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    } catch (err: any) {
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  return false;
}

/**
 * Verify table is visible in cache
 */
async function verifyTableInCache(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select("id")
      .limit(1);

    if (error) {
      if (error.code === "PGRST205" || error.code === "PGRST202") {
        return false; // Table not in cache
      }
      if (error.code === "PGRST116" || error.code === "42P01") {
        return false; // Table doesn't exist
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Main function
 */
async function autoReloadCache() {
  console.log("🔄 PostgREST cache otomatik yenileniyor...\n");

  const success = await reloadCacheWithRetry();

  if (success) {
    console.log("✅ Cache yenileme başarılı!\n");
    
    // Verify critical tables
    const criticalTables = ["programmatic_pages", "articles", "listings", "news_articles"];
    console.log("🔍 Kritik tablolar kontrol ediliyor...\n");

    for (const table of criticalTables) {
      const visible = await verifyTableInCache(table);
      if (visible) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ⚠️  ${table} (cache henüz güncellenmedi, birkaç saniye bekleyin)`);
      }
    }
  } else {
    console.log("⚠️  Cache yenileme başarısız, manuel kontrol gerekebilir.\n");
  }
}

// Run
autoReloadCache()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Hata:", error);
    process.exit(1);
  });
