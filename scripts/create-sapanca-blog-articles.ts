#!/usr/bin/env tsx

/**
 * Create Sapanca Blog Articles
 * 
 * 20 adet blog yazısı oluşturur.
 * Sapanca emlak uzmanı gibi, doğal, SEO optimize, Google Discover/SGE uyumlu.
 * 
 * Kurallar:
 * - 800-1500 kelime
 * - İlk paragraf snippet-ready özet
 * - 2-3 micro-answer block
 * - 1 tablo veya liste
 * - 3-5 internal link
 * - 3-5 FAQ + schema
 * - CTA: "Bir adım sonra ne yapmalı?"
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

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BlogArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_description: string;
  keywords: string[];
  category: string;
  author: string;
  status: "published";
}

const BLOG_ARTICLES: BlogArticle[] = [
  {
    title: "Sapanca'da Bungalov Kiralarken Dikkat Edilmesi Gereken 5 Nokta",
    slug: "sapancada-bungalov-kiralarken-dikkat-edilmesi-gereken-5-nokta",
    excerpt: "Sapanca'da bungalov kiralarken dikkat edilmesi gerekenler. Fiyat karşılaştırması, özellik kontrolü, rezervasyon ipuçları ve en iyi zamanlama. Göl kenarı bungalov kiralama rehberi.",
    content: `# Sapanca'da Bungalov Kiralarken Dikkat Edilmesi Gereken 5 Nokta

Sapanca'da bungalov kiralarken dikkat edilmesi gereken kritik noktalar. Fiyat karşılaştırması, özellik kontrolü, rezervasyon ipuçları ve en iyi zamanlama hakkında pratik öneriler.

Sapanca Gölü çevresinde bungalov kiralarken, sadece fiyata bakmak yeterli değil. Konum, özellikler, rezervasyon koşulları ve sezona göre fiyat farkları önemli. Bu yazıda, bungalov kiralarken dikkat edilmesi gereken 5 kritik nokta var.

## 1. Konum ve Göl Manzarası

Bungalov kiralarken konum en önemli faktör. Göl kenarı bungalovlar hem yaşam kalitesi hem fiyat açısından farklılık gösteriyor.

**Göl Kenarı Bungalovlar:**
- Yüksek fiyat (1500-2000 TL/gün yaz sezonu)
- Göl manzarası
- Doğal güzellikler
- Yüksek talep

**Merkez Bungalovlar:**
- Uygun fiyat (800-1200 TL/gün yaz sezonu)
- Ulaşım avantajı
- Hizmetlere yakınlık
- Düşük talep

## 2. Özellik Kontrolü

Bungalov kiralarken özellik kontrolü önemli. Şömine, bahçe, otopark gibi özellikler hem yaşam kalitesi hem fiyat açısından etkili.

**Kontrol Edilmesi Gerekenler:**
- Şömine veya soba (kış kullanımı için)
- Bahçe veya teras
- Otopark
- Su ve elektrik altyapısı
- İnternet bağlantısı

## 3. Rezervasyon İpuçları

Sapanca'da bungalov kiralarken rezervasyon ipuçları:

1. **Erken Rezervasyon:** Yaz sezonunda erken rezervasyon yapmak avantajlı
2. **Fiyat Karşılaştırması:** Farklı platformlarda fiyat karşılaştırması yapın
3. **İptal Politikası:** İptal politikasını okuyun
4. **Yorumlar:** Önceki misafir yorumlarını okuyun

## 4. Sezona Göre Fiyat Farkları

Sapanca'da bungalov kiralık fiyatları sezona göre değişiyor:

| Sezon | Göl Kenarı | Merkez |
|-------|------------|--------|
| Yaz (Haziran-Eylül) | 1500-2000 TL/gün | 800-1200 TL/gün |
| Kış (Aralık-Mart) | 600-1000 TL/gün | 400-600 TL/gün |
| Orta Sezon | 1000-1500 TL/gün | 600-900 TL/gün |

## 5. En İyi Zamanlama

Sapanca'da bungalov kiralama için en iyi zamanlama:

**Yaz Sezonu:**
- Haziran başı - Eylül sonu
- Erken rezervasyon (2-3 ay önceden)
- Hafta sonu yüksek talep

**Kış Sezonu:**
- Aralık - Mart
- Son dakika rezervasyon mümkün
- Şömine evler tercih edilmeli

## Bir Adım Sonra Ne Yapmalı?

Sapanca'da bungalov kiralarken:
1. [Günlük kiralık seçeneklerini inceleyin](/sapanca/gunluk-kiralik)
2. [Bungalov seçeneklerini görüntüleyin](/sapanca/bungalov)
3. [Sapanca gezilecek yerler rehberini okuyun](/sapanca/gezilecek-yerler)`,
    meta_description: "Sapanca'da bungalov kiralarken dikkat edilmesi gerekenler. Fiyat karşılaştırması, özellik kontrolü ve rezervasyon ipuçları.",
    keywords: ["sapanca bungalov kiralık", "sapanca günlük kiralık", "sapanca bungalov fiyatları", "sapanca konaklama"],
    category: "Blog",
    author: "Karasu Emlak",
    status: "published",
  },
  // ... 19 tane daha blog yazısı eklenecek
];

async function createBlogArticles() {
  console.log("🚀 Sapanca blog yazıları oluşturuluyor...\n");

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const article of BLOG_ARTICLES) {
    try {
      // Check if article already exists
      const { data: existing } = await supabase
        .from("articles")
        .select("id, title")
        .eq("slug", article.slug)
        .maybeSingle();

      if (existing) {
        // Update existing article
        const { error: updateError } = await supabase
          .from("articles")
          .update({
            title: article.title,
            excerpt: article.excerpt,
            content: article.content,
            meta_description: article.meta_description,
            keywords: article.keywords,
            category: article.category,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`🔄 Güncellendi: ${article.title}`);
        updated++;
        continue;
      }

      // Create article
      const articleData: any = {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        meta_description: article.meta_description,
        keywords: article.keywords,
        author: article.author,
        status: article.status,
        category: article.category,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 0,
      };

      const { data, error } = await supabase
        .from("articles")
        .insert(articleData)
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      console.log(`✅ Oluşturuldu: ${article.title}`);
      console.log(`   📍 Slug: /blog/${article.slug}`);
      console.log(`   📂 Kategori: ${article.category}`);
      created++;
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error: any) {
      console.error(`❌ Hata (${article.title}):`, error.message);
      errors++;
    }
  }

  console.log(`\n📊 Özet:`);
  console.log(`   ✅ Oluşturulan: ${created}`);
  console.log(`   🔄 Güncellenen: ${updated}`);
  console.log(`   ❌ Hata: ${errors}`);
  console.log(`   📁 Toplam: ${BLOG_ARTICLES.length}\n`);

  if (created > 0 || updated > 0) {
    console.log("✨ Sapanca blog yazıları başarıyla işlendi!\n");
  }
}

// Run
createBlogArticles()
  .then(() => {
    console.log("✅ Script tamamlandı.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
