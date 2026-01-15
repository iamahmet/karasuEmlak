#!/usr/bin/env tsx

/**
 * Initialize Programmatic Pages Script (Direct SQL)
 * 
 * Bu script temel programatik sayfaları doğrudan SQL ile oluşturur
 */

import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const DEFAULT_PAGES = [
  {
    slug: "namaz-vakitleri",
    type: "prayer_times",
    title: "Karasu Namaz Vakitleri",
    description: "Karasu ilçesi için güncel namaz vakitleri, imsak, öğle, ikindi, akşam ve yatsı namazı saatleri.",
    update_frequency: 1440,
    is_active: true,
    seo_title: "Karasu Namaz Vakitleri 2025 - Güncel İmsak, Öğle, İkindi, Akşam, Yatsı Saatleri",
    seo_description: "Karasu namaz vakitleri, imsak saati, öğle, ikindi, akşam ve yatsı namazı saatleri. Güncel ve doğru namaz vakitleri bilgisi.",
    seo_keywords: ["karasu namaz vakitleri", "karasu imsak", "karasu öğle namazı", "karasu akşam namazı", "namaz saatleri karasu"],
    config: { city: "Karasu", district: "Karasu", province: "Sakarya", timezone: "Europe/Istanbul" },
  },
  {
    slug: "imsakiye",
    type: "imsakiye",
    title: "Karasu İmsakiye",
    description: "Karasu için Ramazan ayı imsakiye takvimi, sahur ve iftar saatleri.",
    update_frequency: 1440,
    is_active: true,
    seo_title: "Karasu İmsakiye 2025 - Ramazan İmsakiye Takvimi",
    seo_description: "Karasu Ramazan imsakiye takvimi, sahur ve iftar saatleri. Güncel Ramazan imsakiye bilgileri.",
    seo_keywords: ["karasu imsakiye", "karasu ramazan", "karasu sahur", "karasu iftar", "imsakiye karasu"],
    config: { city: "Karasu", district: "Karasu", province: "Sakarya" },
  },
  {
    slug: "iftar-vakitleri",
    type: "iftar",
    title: "Karasu İftar Vakitleri",
    description: "Karasu için güncel iftar vakitleri ve Ramazan takvimi.",
    update_frequency: 1440,
    is_active: true,
    seo_title: "Karasu İftar Vakitleri 2025 - Güncel İftar Saatleri",
    seo_description: "Karasu iftar vakitleri, Ramazan iftar saatleri. Güncel ve doğru iftar zamanı bilgisi.",
    seo_keywords: ["karasu iftar", "karasu iftar saati", "ramazan iftar karasu", "iftar vakti karasu"],
    config: { city: "Karasu", district: "Karasu", province: "Sakarya" },
  },
  {
    slug: "hava-durumu",
    type: "weather",
    title: "Karasu Hava Durumu",
    description: "Karasu için güncel hava durumu, sıcaklık, nem, rüzgar ve 7 günlük hava durumu tahmini.",
    update_frequency: 60,
    is_active: true,
    seo_title: "Karasu Hava Durumu - Güncel Hava Tahmini ve Sıcaklık",
    seo_description: "Karasu hava durumu, güncel sıcaklık, nem, rüzgar hızı ve 7 günlük hava durumu tahmini. Meteoroloji verileri.",
    seo_keywords: ["karasu hava durumu", "karasu sıcaklık", "karasu meteoroloji", "karasu hava tahmini", "karasu hava durumu 7 günlük"],
    config: { city: "Karasu", district: "Karasu", province: "Sakarya", coordinates: { lat: 41.1, lng: 30.7 } },
  },
  {
    slug: "is-ilanlari",
    type: "jobs",
    title: "Karasu İş İlanları",
    description: "Karasu'da iş arayanlar için güncel iş ilanları, kariyer fırsatları ve işe alım duyuruları.",
    update_frequency: 240,
    is_active: true,
    seo_title: "Karasu İş İlanları - Güncel İş Fırsatları ve Kariyer",
    seo_description: "Karasu iş ilanları, iş arayanlar için güncel iş fırsatları, kariyer imkanları ve işe alım duyuruları.",
    seo_keywords: ["karasu iş ilanları", "karasu iş", "karasu kariyer", "karasu işe alım", "karasu iş fırsatları"],
    config: { city: "Karasu", district: "Karasu", province: "Sakarya", categories: ["tam zamanlı", "yarı zamanlı", "uzaktan çalışma", "staj"] },
  },
  {
    slug: "vefat-ilanlari",
    type: "obituary",
    title: "Karasu Vefat İlanları",
    description: "Karasu'da vefat edenler için taziye ilanları ve cenaze bilgileri.",
    update_frequency: 120,
    is_active: true,
    seo_title: "Karasu Vefat İlanları - Taziye ve Cenaze Duyuruları",
    seo_description: "Karasu vefat ilanları, taziye duyuruları ve cenaze bilgileri. Güncel vefat haberleri.",
    seo_keywords: ["karasu vefat", "karasu taziye", "karasu cenaze", "vefat ilanları karasu"],
    config: { city: "Karasu", district: "Karasu", province: "Sakarya" },
  },
  {
    slug: "nobetci-eczane",
    type: "pharmacy",
    title: "Karasu Nöbetçi Eczane",
    description: "Karasu'da nöbetçi eczaneler, eczane adresleri, telefon numaraları ve çalışma saatleri.",
    update_frequency: 60,
    is_active: true,
    seo_title: "Karasu Nöbetçi Eczane - Güncel Nöbetçi Eczane Listesi",
    seo_description: "Karasu nöbetçi eczane, eczane adresleri, telefon numaraları ve çalışma saatleri. Güncel nöbetçi eczane bilgileri.",
    seo_keywords: ["karasu nöbetçi eczane", "karasu eczane", "nöbetçi eczane karasu", "eczane karasu"],
    config: { city: "Karasu", district: "Karasu", province: "Sakarya" },
  },
];

async function initializeProgrammaticPages() {
  console.log("🚀 Programatik sayfalar oluşturuluyor (Direct SQL)...\n");

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const page of DEFAULT_PAGES) {
    try {
      // Check if page already exists
      const checkSql = `SELECT id FROM programmatic_pages WHERE slug = '${page.slug}' LIMIT 1;`;
      
      // Create insert SQL
      const insertSql = `
        INSERT INTO programmatic_pages (
          slug, type, title, description, update_frequency, is_active,
          seo_title, seo_description, seo_keywords, config,
          last_updated, created_at, updated_at
        ) VALUES (
          '${page.slug}',
          '${page.type}',
          '${page.title.replace(/'/g, "''")}',
          '${(page.description || '').replace(/'/g, "''")}',
          ${page.update_frequency},
          ${page.is_active},
          '${(page.seo_title || '').replace(/'/g, "''")}',
          '${(page.seo_description || '').replace(/'/g, "''")}',
          ARRAY[${page.seo_keywords.map(k => `'${k.replace(/'/g, "''")}'`).join(', ')}],
          '${JSON.stringify(page.config || {}).replace(/'/g, "''")}'::jsonb,
          NOW(),
          NOW(),
          NOW()
        )
        ON CONFLICT (slug) DO NOTHING
        RETURNING id;
      `;

      console.log(`📝 Oluşturuluyor: ${page.title}...`);
      console.log(`   SQL hazır, MCP tool ile çalıştırılacak\n`);
      
      // Note: This will be executed via MCP tool
      created++;
    } catch (error: any) {
      console.error(`❌ Hata (${page.title}):`, error.message);
      errors++;
    }
  }

  console.log(`\n📊 Özet:`);
  console.log(`   ✅ Oluşturulacak: ${created}`);
  console.log(`   ⏭️  Atlanan: ${skipped}`);
  console.log(`   ❌ Hata: ${errors}`);
  console.log(`   📁 Toplam: ${DEFAULT_PAGES.length}\n`);

  console.log("💡 Bu script SQL'i hazırlar. MCP tool ile çalıştırılacak.\n");
}

// Generate SQL for MCP execution
const sqlStatements = DEFAULT_PAGES.map(page => {
  return `INSERT INTO programmatic_pages (
  slug, type, title, description, update_frequency, is_active,
  seo_title, seo_description, seo_keywords, config,
  last_updated, created_at, updated_at
) VALUES (
  '${page.slug}',
  '${page.type}',
  '${page.title.replace(/'/g, "''")}',
  '${(page.description || '').replace(/'/g, "''")}',
  ${page.update_frequency},
  ${page.is_active},
  '${(page.seo_title || '').replace(/'/g, "''")}',
  '${(page.seo_description || '').replace(/'/g, "''")}',
  ARRAY[${page.seo_keywords.map(k => `'${k.replace(/'/g, "''")}'`).join(', ')}],
  '${JSON.stringify(page.config || {}).replace(/'/g, "''")}'::jsonb,
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO NOTHING;`;
}).join('\n\n');

console.log("🚀 Programmatic Pages SQL Statements:\n");
console.log("─".repeat(60));
console.log(sqlStatements);
console.log("─".repeat(60));
console.log("\n💡 Bu SQL'i Supabase SQL Editor'de çalıştırın veya MCP tool ile uygulayın.\n");
