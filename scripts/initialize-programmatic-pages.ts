#!/usr/bin/env tsx

/**
 * Initialize Programmatic Pages Script
 * 
 * Bu script temel programatik sayfaları otomatik olarak oluşturur:
 * - Namaz Vakitleri
 * - İmsakiye
 * - İftar Vakitleri
 * - Hava Durumu
 * - İş İlanları
 * - Vefat İlanları
 * - Nöbetçi Eczane
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ProgrammaticPage {
  slug: string;
  type: string;
  title: string;
  description: string;
  update_frequency: number;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  config?: Record<string, any>;
}

const DEFAULT_PAGES: ProgrammaticPage[] = [
  {
    slug: "namaz-vakitleri",
    type: "prayer_times",
    title: "Karasu Namaz Vakitleri",
    description: "Karasu ilçesi için güncel namaz vakitleri, imsak, öğle, ikindi, akşam ve yatsı namazı saatleri.",
    update_frequency: 1440, // 1 gün
    is_active: true,
    seo_title: "Karasu Namaz Vakitleri 2025 - Güncel İmsak, Öğle, İkindi, Akşam, Yatsı Saatleri",
    seo_description: "Karasu namaz vakitleri, imsak saati, öğle, ikindi, akşam ve yatsı namazı saatleri. Güncel ve doğru namaz vakitleri bilgisi.",
    seo_keywords: ["karasu namaz vakitleri", "karasu imsak", "karasu öğle namazı", "karasu akşam namazı", "namaz saatleri karasu"],
    config: {
      city: "Karasu",
      district: "Karasu",
      province: "Sakarya",
      timezone: "Europe/Istanbul",
    },
  },
  {
    slug: "imsakiye",
    type: "imsakiye",
    title: "Karasu İmsakiye",
    description: "Karasu için Ramazan ayı imsakiye takvimi, sahur ve iftar saatleri.",
    update_frequency: 1440, // 1 gün
    is_active: true,
    seo_title: "Karasu İmsakiye 2025 - Ramazan İmsakiye Takvimi",
    seo_description: "Karasu Ramazan imsakiye takvimi, sahur ve iftar saatleri. Güncel Ramazan imsakiye bilgileri.",
    seo_keywords: ["karasu imsakiye", "karasu ramazan", "karasu sahur", "karasu iftar", "imsakiye karasu"],
    config: {
      city: "Karasu",
      district: "Karasu",
      province: "Sakarya",
    },
  },
  {
    slug: "iftar-vakitleri",
    type: "iftar",
    title: "Karasu İftar Vakitleri",
    description: "Karasu için güncel iftar vakitleri ve Ramazan takvimi.",
    update_frequency: 1440, // 1 gün
    is_active: true,
    seo_title: "Karasu İftar Vakitleri 2025 - Güncel İftar Saatleri",
    seo_description: "Karasu iftar vakitleri, Ramazan iftar saatleri. Güncel ve doğru iftar zamanı bilgisi.",
    seo_keywords: ["karasu iftar", "karasu iftar saati", "ramazan iftar karasu", "iftar vakti karasu"],
    config: {
      city: "Karasu",
      district: "Karasu",
      province: "Sakarya",
    },
  },
  {
    slug: "hava-durumu",
    type: "weather",
    title: "Karasu Hava Durumu",
    description: "Karasu için güncel hava durumu, sıcaklık, nem, rüzgar ve 7 günlük hava durumu tahmini.",
    update_frequency: 60, // 1 saat
    is_active: true,
    seo_title: "Karasu Hava Durumu - Güncel Hava Tahmini ve Sıcaklık",
    seo_description: "Karasu hava durumu, güncel sıcaklık, nem, rüzgar hızı ve 7 günlük hava durumu tahmini. Meteoroloji verileri.",
    seo_keywords: ["karasu hava durumu", "karasu sıcaklık", "karasu meteoroloji", "karasu hava tahmini", "karasu hava durumu 7 günlük"],
    config: {
      city: "Karasu",
      district: "Karasu",
      province: "Sakarya",
      coordinates: {
        lat: 41.1,
        lng: 30.7,
      },
    },
  },
  {
    slug: "is-ilanlari",
    type: "jobs",
    title: "Karasu İş İlanları",
    description: "Karasu'da iş arayanlar için güncel iş ilanları, kariyer fırsatları ve işe alım duyuruları.",
    update_frequency: 240, // 4 saat
    is_active: true,
    seo_title: "Karasu İş İlanları - Güncel İş Fırsatları ve Kariyer",
    seo_description: "Karasu iş ilanları, iş arayanlar için güncel iş fırsatları, kariyer imkanları ve işe alım duyuruları.",
    seo_keywords: ["karasu iş ilanları", "karasu iş", "karasu kariyer", "karasu işe alım", "karasu iş fırsatları"],
    config: {
      city: "Karasu",
      district: "Karasu",
      province: "Sakarya",
      categories: ["tam zamanlı", "yarı zamanlı", "uzaktan çalışma", "staj"],
    },
  },
  {
    slug: "vefat-ilanlari",
    type: "obituary",
    title: "Karasu Vefat İlanları",
    description: "Karasu'da vefat edenler için taziye ilanları ve cenaze bilgileri.",
    update_frequency: 120, // 2 saat
    is_active: true,
    seo_title: "Karasu Vefat İlanları - Taziye ve Cenaze Duyuruları",
    seo_description: "Karasu vefat ilanları, taziye duyuruları ve cenaze bilgileri. Güncel vefat haberleri.",
    seo_keywords: ["karasu vefat", "karasu taziye", "karasu cenaze", "vefat ilanları karasu"],
    config: {
      city: "Karasu",
      district: "Karasu",
      province: "Sakarya",
    },
  },
  {
    slug: "nobetci-eczane",
    type: "pharmacy",
    title: "Karasu Nöbetçi Eczane",
    description: "Karasu'da nöbetçi eczaneler, eczane adresleri, telefon numaraları ve çalışma saatleri.",
    update_frequency: 60, // 1 saat
    is_active: true,
    seo_title: "Karasu Nöbetçi Eczane - Güncel Nöbetçi Eczane Listesi",
    seo_description: "Karasu nöbetçi eczane, eczane adresleri, telefon numaraları ve çalışma saatleri. Güncel nöbetçi eczane bilgileri.",
    seo_keywords: ["karasu nöbetçi eczane", "karasu eczane", "nöbetçi eczane karasu", "eczane karasu"],
    config: {
      city: "Karasu",
      district: "Karasu",
      province: "Sakarya",
    },
  },
];

async function initializeProgrammaticPages() {
  console.log("🚀 Programatik sayfalar oluşturuluyor...\n");

  // Check if table exists using direct SQL query (bypasses PostgREST cache)
  try {
    // Try to insert a test record and delete it immediately to verify table exists
    // This works even if PostgREST cache is stale
    const testId = crypto.randomUUID();
    const { error: testError } = await supabase
      .from("programmatic_pages")
      .insert({ id: testId, slug: `__test_${Date.now()}`, type: "other", title: "Test" })
      .select("id")
      .single();

    if (testError) {
      if (testError.message?.includes("could not find the table") || testError.code === "PGRST116" || testError.code === "42P01") {
        console.log("⚠️  Tablo bulunamadı, migration çalıştırılmalı.");
        console.log("📝 Migration dosyası: supabase/migrations/20260129000000_create_programmatic_pages.sql");
        console.log("💡 Migration'ı manuel olarak çalıştırın veya Supabase dashboard'dan uygulayın.\n");
        return;
      }
      // If it's a different error (like unique constraint), table exists
    } else {
      // Delete test record
      await supabase.from("programmatic_pages").delete().eq("id", testId);
    }
    
    console.log("✅ Tablo mevcut, devam ediliyor...\n");
  } catch (error: any) {
    if (error.message?.includes("could not find the table") || error.code === "PGRST116" || error.code === "42P01") {
      console.log("⚠️  Tablo bulunamadı, migration çalıştırılmalı.");
      console.log("📝 Migration dosyası: supabase/migrations/20260129000000_create_programmatic_pages.sql");
      console.log("💡 Migration'ı manuel olarak çalıştırın veya Supabase dashboard'dan uygulayın.\n");
      return;
    }
    // If it's a different error, assume table exists and continue
    console.log("✅ Tablo mevcut (cache sorunu olabilir), devam ediliyor...\n");
  }

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const page of DEFAULT_PAGES) {
    try {
      // Check if page already exists - use raw SQL to bypass PostgREST cache
      // First try direct insert with ON CONFLICT
      const insertData = {
        ...page,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Try insert - ON CONFLICT will handle duplicates
      const { data, error } = await supabase
        .from("programmatic_pages")
        .upsert(insertData, {
          onConflict: "slug",
          ignoreDuplicates: true,
        })
        .select("id")
        .single();

      if (error) {
        // If it's a schema cache error, try again after a delay
        if (error.message?.includes("schema cache") || error.code === "PGRST116") {
          console.log(`   ⏳ Schema cache sorunu, 3 saniye bekleniyor...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Retry
          const { data: retryData, error: retryError } = await supabase
            .from("programmatic_pages")
            .upsert(insertData, {
              onConflict: "slug",
              ignoreDuplicates: true,
            })
            .select("id")
            .single();

          if (retryError) {
            throw retryError;
          }

          // Check if it was inserted or already existed
          const { data: checkData } = await supabase
            .from("programmatic_pages")
            .select("id, created_at")
            .eq("slug", page.slug)
            .single();

          if (checkData) {
            // Check if it was just created (within last minute) or already existed
            const createdTime = new Date(checkData.created_at).getTime();
            const now = Date.now();
            const timeDiff = now - createdTime;

            if (timeDiff < 60000) {
              // Created within last minute, so it's new
              console.log(`✅ Oluşturuldu: ${page.title}`);
              console.log(`   📍 Slug: /${page.slug}`);
              console.log(`   🔄 Güncelleme: ${page.update_frequency} dakika`);
              created++;
              continue;
            } else {
              console.log(`⏭️  Atlanan: ${page.title} (zaten mevcut)`);
              skipped++;
              continue;
            }
          }
        } else {
          throw error;
        }
      }

      // Check if it was inserted or already existed
      if (data) {
        const { data: checkData } = await supabase
          .from("programmatic_pages")
          .select("id, created_at")
          .eq("slug", page.slug)
          .single();

        if (checkData) {
          const createdTime = new Date(checkData.created_at).getTime();
          const now = Date.now();
          const timeDiff = now - createdTime;

          if (timeDiff < 60000) {
            console.log(`✅ Oluşturuldu: ${page.title}`);
            console.log(`   📍 Slug: /${page.slug}`);
            console.log(`   🔄 Güncelleme: ${page.update_frequency} dakika`);
            created++;
            continue;
          } else {
            console.log(`⏭️  Atlanan: ${page.title} (zaten mevcut)`);
            skipped++;
            continue;
          }
        }
      }

      console.log(`✅ Oluşturuldu: ${page.title}`);
      console.log(`   📍 Slug: /${page.slug}`);
      console.log(`   🔄 Güncelleme: ${page.update_frequency} dakika`);
      created++;
    } catch (error: any) {
      console.error(`❌ Hata (${page.title}):`, error.message);
      errors++;
    }
  }

  console.log(`\n📊 Özet:`);
  console.log(`   ✅ Oluşturulan: ${created}`);
  console.log(`   ⏭️  Atlanan: ${skipped}`);
  console.log(`   ❌ Hata: ${errors}`);
  console.log(`   📁 Toplam: ${DEFAULT_PAGES.length}\n`);

  if (created > 0) {
    console.log("✨ Programatik sayfalar başarıyla oluşturuldu!\n");
  }
}

// Run the script
initializeProgrammaticPages()
  .then(() => {
    console.log("✅ Script tamamlandı.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
