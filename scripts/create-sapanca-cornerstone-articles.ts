#!/usr/bin/env tsx

/**
 * Create Sapanca Cornerstone Articles
 * 
 * 10 adet otorite içerik (cornerstone) makale oluşturur.
 * Sapanca emlak uzmanı gibi, doğal, SEO optimize, Google Discover/SGE uyumlu.
 * 
 * Kurallar:
 * - 1200-2200 kelime
 * - İlk 2 paragraf snippet-ready özet
 * - TOC
 * - 2-3 micro-answer block
 * - 1 tablo
 * - 6-10 internal link
 * - 6-10 FAQ + schema
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

interface CornerstoneArticle {
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

const CORNERSTONE_ARTICLES: CornerstoneArticle[] = [
  {
    title: "Sapanca Bungalov Rehberi: Seçim Kriterleri, Fiyatlar ve Sezona Göre Öneriler",
    slug: "sapanca-bungalov-rehberi-secim-kriterleri-fiyatlar-ve-sezona-gore-oneriler",
    excerpt: "Sapanca'da bungalov seçerken dikkat edilmesi gerekenler, fiyat aralıkları, sezona göre avantajlar ve dezavantajlar. Göl kenarı bungalovlar, günlük kiralık seçenekleri ve yatırım potansiyeli hakkında kapsamlı rehber.",
    content: `# Sapanca Bungalov Rehberi: Seçim Kriterleri, Fiyatlar ve Sezona Göre Öneriler

Sapanca, bungalov kültürünün Türkiye'deki en önemli merkezlerinden biri. Göl kenarı bungalovlar, doğal güzellikler ve sakin atmosfer ile hem tatil hem yaşam için ideal. Bu rehberde, Sapanca'da bungalov seçerken dikkat edilmesi gerekenler, fiyat aralıkları ve sezona göre öneriler var.

## İçindekiler
1. [Sapanca'da Bungalov Nedir?](#sapancada-bungalov-nedir)
2. [Bungalov Seçim Kriterleri](#bungalov-secim-kriterleri)
3. [Fiyat Aralıkları](#fiyat-araliklari)
4. [Sezona Göre Öneriler](#sezona-gore-oneriler)
5. [Günlük Kiralık vs Satılık](#gunluk-kiralik-vs-satilik)
6. [Yatırım Potansiyeli](#yatirim-potansiyeli)
7. [Dikkat Edilmesi Gerekenler](#dikkat-edilmesi-gerekenler)

## Sapanca'da Bungalov Nedir?

Sapanca'da bungalov, genellikle tek katlı veya iki katlı, ahşap veya betonarme yapıda, göl kenarı veya doğal alanlarda yer alan konutlardır. Bungalovlar, genellikle bahçeli, şömine veya soba ile ısıtılan, doğal yaşamı ön planda tutan yapılardır.

Sapanca Gölü çevresinde bungalovlar, hem günlük kiralık hem satılık seçenekler sunar. Göl kenarı bungalovlar yüksek talep görürken, merkeze uzak bölgelerde daha uygun fiyatlı seçenekler bulunabilir.

## Bungalov Seçim Kriterleri

Sapanca'da bungalov seçerken dikkat edilmesi gereken kritik noktalar:

### Konum ve Göl Manzarası

Göl kenarı bungalovlar hem yaşam kalitesi hem yatırım değeri açısından avantajlı. Ancak göl kenarı bungalovlar daha pahalı. Göl manzarası olmayan ama doğal alanlarda yer alan bungalovlar daha uygun fiyatlı.

**Göl Kenarı Bungalovlar:**
- Yüksek fiyat (1.5-3 milyon TL)
- Yüksek günlük kiralık getirisi (800-2000 TL/gün)
- Yüksek talep
- Doğal güzellik

**Merkez Bungalovlar:**
- Uygun fiyat (800 bin - 1.5 milyon TL)
- Düşük günlük kiralık getirisi (500-1200 TL/gün)
- Ulaşım avantajı
- Hizmetlere yakınlık

### Bina Durumu ve Özellikler

Bungalov seçerken bina durumu önemli. Ahşap bungalovlar doğal görünüm sağlar ama bakım gerektirir. Betonarme bungalovlar daha dayanıklı ama doğal görünümü azaltır.

**Önemli Özellikler:**
- Şömine veya soba (kış kullanımı için)
- Bahçe veya teras
- Otopark
- Su ve elektrik altyapısı
- İnternet bağlantısı

### Ruhsat ve İmar Durumu

Bungalov alırken ruhsat ve imar durumu kontrol edilmeli. Özellikle göl kenarı bungalovlarda imar sorunları olabilir. Tapu ve ruhsat belgeleri kontrol edilmeli.

## Fiyat Aralıkları

Sapanca'da bungalov fiyatları konum ve özelliklere göre değişiyor:

| Bungalov Tipi | Satılık Fiyat | Günlük Kiralık (Yaz) | Günlük Kiralık (Kış) |
|----------------|--------------|----------------------|----------------------|
| Göl Kenarı (Yeni) | 2-3 milyon TL | 1500-2000 TL | 600-1000 TL |
| Göl Kenarı (Eski) | 1.5-2 milyon TL | 1000-1500 TL | 500-800 TL |
| Merkez (Yeni) | 1-1.5 milyon TL | 800-1200 TL | 400-600 TL |
| Merkez (Eski) | 800 bin - 1 milyon TL | 500-800 TL | 300-500 TL |

**Not:** Fiyatlar konum, metrekare, özellikler ve güncel piyasa koşullarına göre değişmektedir.

## Sezona Göre Öneriler

### Yaz Sezonu (Haziran-Eylül)

Yaz sezonunda Sapanca'da bungalov talebi yüksek. Günlük kiralık fiyatları artar, erken rezervasyon yapmak avantajlı.

**Yaz Sezonu Avantajları:**
- Yüksek günlük kiralık getirisi
- Yüksek talep
- Doğal aktiviteler (yüzme, yürüyüş)
- Göl çevresi canlılık

**Yaz Sezonu Dezavantajları:**
- Yüksek fiyatlar
- Erken rezervasyon gerekli
- Kalabalık

### Kış Sezonu (Aralık-Mart)

Kış sezonunda Sapanca'da bungalov talebi düşük. Günlük kiralık fiyatları düşer, şömine evler ve kar manzarası ile farklı bir deneyim sunulur.

**Kış Sezonu Avantajları:**
- Düşük fiyatlar
- Sakin atmosfer
- Şömine deneyimi
- Kar manzarası

**Kış Sezonu Dezavantajları:**
- Düşük talep
- Sınırlı aktivite
- Soğuk hava

### İlkbahar/Sonbahar (Orta Sezon)

İlkbahar ve sonbahar aylarında Sapanca'da bungalov talebi orta seviyede. Fiyatlar yaz sezonuna göre daha uygun, hava koşulları genellikle uygun.

## Günlük Kiralık vs Satılık

Sapanca'da bungalov alırken günlük kiralık mı satılık mı sorusu önemli:

### Günlük Kiralık Bungalov

**Avantajları:**
- Düşük başlangıç maliyeti
- Esneklik (istediğiniz zaman kullanabilirsiniz)
- Bakım sorumluluğu yok

**Dezavantajları:**
- Uzun vadede daha pahalı
- Her seferinde rezervasyon gerekli
- Kişiselleştirme yapamazsınız

### Satılık Bungalov

**Avantajları:**
- Uzun vadede daha ekonomik
- Kişiselleştirme yapabilirsiniz
- Yatırım değeri

**Dezavantajları:**
- Yüksek başlangıç maliyeti
- Bakım sorumluluğu
- Likidite sorunu (satış zor olabilir)

## Yatırım Potansiyeli

Sapanca'da bungalov yatırımı yapmak mantıklı mı?

**Yatırım Avantajları:**
- Günlük kiralık getirisi yüksek (özellikle yaz sezonu)
- Değer artışı potansiyeli
- Turizm potansiyeli
- İstanbul'a yakınlık

**Yatırım Riskleri:**
- Mevsimsellik (kış sezonu düşük talep)
- Bakım maliyetleri
- Likidite sorunu

**Yatırım Önerisi:**
Göl kenarı bungalovlar yatırım için daha uygun. Yaz sezonunda yüksek günlük kiralık getirisi, uzun vadede değer artışı potansiyeli var.

## Dikkat Edilmesi Gerekenler

Sapanca'da bungalov alırken veya kiralarken dikkat edilmesi gerekenler:

1. **Ruhsat ve İmar Durumu:** Tapu ve ruhsat belgeleri kontrol edilmeli
2. **Bakım Durumu:** Ahşap bungalovlar bakım gerektirir
3. **Altyapı:** Su, elektrik, internet bağlantısı kontrol edilmeli
4. **Mevsimsellik:** Günlük kiralık getirisi sezona göre değişir
5. **Ulaşım:** Merkeze ve göl kenarına ulaşım kolaylığı

## Sonuç

Sapanca'da bungalov seçimi, konum, fiyat, sezona göre avantajlar ve yatırım potansiyeli gibi birçok faktöre bağlı. Göl kenarı bungalovlar hem yaşam hem yatırım açısından avantajlı ama daha pahalı. Merkez bungalovlar daha uygun fiyatlı ama getiri daha düşük.

Yatırım yaparken göl kenarı bungalovları tercih etmek, günlük kiralık getirisi ve değer artışı açısından avantajlı. Ancak mevsimsellik ve bakım maliyetlerini de hesaba katmak gerekiyor.

## Bir Adım Sonra Ne Yapmalı?

Sapanca'da bungalov arayışınızda:
1. [Sapanca bungalov ilanlarını inceleyin](${basePath}/sapanca/bungalov)
2. [Günlük kiralık seçeneklerini görüntüleyin](${basePath}/sapanca/gunluk-kiralik)
3. [Sapanca emlak rehberini okuyun](${basePath}/blog/sapanca-emlak-rehberi)
4. [Karasu ve Kocaali alternatiflerini değerlendirin](${basePath}/karasu)`,
    meta_description: "Sapanca'da bungalov seçim kriterleri, fiyat aralıkları ve sezona göre öneriler. Göl kenarı bungalovlar, günlük kiralık seçenekleri ve yatırım potansiyeli hakkında kapsamlı rehber.",
    keywords: ["sapanca bungalov", "sapanca günlük kiralık", "sapanca satılık bungalov", "sapanca emlak", "sapanca gölü"],
    category: "Emlak Rehberi",
    author: "Karasu Emlak",
    status: "published",
  },
  // ... diğer 9 cornerstone makale buraya eklenecek
];

async function createCornerstoneArticles() {
  console.log("🚀 Sapanca cornerstone makaleler oluşturuluyor...\n");

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const article of CORNERSTONE_ARTICLES) {
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
  console.log(`   📁 Toplam: ${CORNERSTONE_ARTICLES.length}\n`);

  if (created > 0 || updated > 0) {
    console.log("✨ Sapanca cornerstone makaleler başarıyla işlendi!\n");
  }
}

// Run
createCornerstoneArticles()
  .then(() => {
    console.log("✅ Script tamamlandı.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
