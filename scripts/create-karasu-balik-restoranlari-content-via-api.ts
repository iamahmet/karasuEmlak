#!/usr/bin/env tsx

/**
 * Create Karasu Balık Restoranları Content via API
 * 
 * 5 adet cornerstone makale + 10 adet blog yazısı oluşturur.
 * Content Studio API kullanarak içerik üretir.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ArticlePlan {
  title: string;
  slug: string;
  type: 'cornerstone' | 'normal';
  targetKeywords: string[];
  brief: string;
  internalLinks: string[];
}

// 5 Cornerstone Makale Planı
const CORNERSTONE_ARTICLES: ArticlePlan[] = [
  {
    title: "Karasu'da En İyi Balık Restoranları: 2025 Kapsamlı Rehber",
    slug: "karasuda-en-iyi-balik-restoranlari-2025-kapsamli-rehber",
    type: 'cornerstone',
    targetKeywords: ["karasu balık restoranları", "karasu en iyi restoran", "karasu deniz ürünleri", "karasu balık lokantaları"],
    brief: "Karasu'da emlak alırken yakınınızdaki balık restoranları hakkında kapsamlı rehber. Restoranların konumları, menüleri, fiyatları ve emlak bölgeleriyle ilişkisi. Karasu'da ev alırken yakınınızdaki restoranları da değerlendirin. Restoran yakınındaki emlak değerleri ve yazlık alırken sosyal hayatı göz önünde bulundurun.",
    internalLinks: ["Karasu'da ev almak", "Karasu yazlık yatırım", "Karasu denize yakın daireler"]
  },
  {
    title: "Karasu Sahil Şeridindeki Balık Restoranları ve Emlak Değerleri",
    slug: "karasu-sahil-seridindeki-balik-restoranlari-ve-emlak-degerleri",
    type: 'cornerstone',
    targetKeywords: ["karasu sahil restoranları", "karasu denize yakın restoran", "karasu sahil emlak"],
    brief: "Karasu sahil şeridindeki balık restoranlarının emlak değerlerine etkisi. Restoran yakınında ev almanın avantajları ve dezavantajları. Sahil şeridindeki restoranların çevresindeki emlak fırsatları ve yatırım potansiyeli.",
    internalLinks: ["Karasu sahil evleri", "Karasu denize sıfır villa", "Karasu yazlık fiyatları"]
  },
  {
    title: "Karasu'da Balık Restoranları Kültürü ve Yerel Yaşam Rehberi",
    slug: "karasuda-balik-restoranlari-kulturu-ve-yerel-yasam-rehberi",
    type: 'cornerstone',
    targetKeywords: ["karasu yerel yaşam", "karasu balık kültürü", "karasu sosyal hayat"],
    brief: "Karasu'da balık restoranları kültürü ve yerel yaşam. Emlak alırken bölgenin sosyal hayatını anlamak için rehber. Yerel restoran kültürü ve emlak seçimine etkisi.",
    internalLinks: ["Karasu'da yaşam", "Karasu mahalle rehberi", "Karasu sosyal aktiviteler"]
  },
  {
    title: "Karasu'da Yazlık Ev Alırken Yakındaki Balık Restoranları Rehberi",
    slug: "karasuda-yazlik-ev-alirken-yakindaki-balik-restoranlari-rehberi",
    type: 'cornerstone',
    targetKeywords: ["karasu yazlık restoran", "karasu yazlık ev yakını restoran", "karasu yazlık bölgeleri"],
    brief: "Karasu'da yazlık ev alırken yakındaki balık restoranlarının önemi. Restoran yakınında yazlık almanın avantajları. Yazlık bölgelerindeki restoran seçenekleri ve emlak değerlerine etkisi.",
    internalLinks: ["Karasu yazlık yatırım", "Karasu yazlık fiyatları", "Karasu denize yakın yazlık"]
  },
  {
    title: "Karasu Balık Restoranları ve Turizm: Emlak Yatırımına Etkisi",
    slug: "karasu-balik-restoranlari-ve-turizm-emlak-yatirimina-etkisi",
    type: 'cornerstone',
    targetKeywords: ["karasu turizm", "karasu emlak yatırım", "karasu restoran turizm"],
    brief: "Karasu'daki balık restoranlarının turizme etkisi ve emlak yatırımlarına yansıması. Turistik bölgelerde emlak değerleri. Restoran turizminin emlak piyasasına etkisi ve yatırım fırsatları.",
    internalLinks: ["Karasu emlak yatırım", "Karasu turizm potansiyeli", "Karasu yatırım rehberi"]
  }
];

// 10 Blog Yazısı Planı
const BLOG_POSTS: ArticlePlan[] = [
  {
    title: "Karasu Merkez'deki En Popüler Balık Restoranları",
    slug: "karasu-merkezdeki-en-populer-balik-restoranlari",
    type: 'normal',
    targetKeywords: ["karasu merkez restoran", "karasu balık lokantası"],
    brief: "Karasu merkezdeki popüler balık restoranları ve emlak bölgeleriyle ilişkisi. Merkez bölgelerdeki restoran seçenekleri ve yakınındaki emlak fırsatları.",
    internalLinks: ["Karasu merkez evleri", "Karasu şehir merkezi"]
  },
  {
    title: "Karasu Sahil'de Balık Yemek İçin En İyi Restoranlar",
    slug: "karasu-sahilde-balik-yemek-icin-en-iyi-restoranlar",
    type: 'normal',
    targetKeywords: ["karasu sahil restoran", "karasu deniz manzaralı restoran"],
    brief: "Karasu sahilinde deniz manzaralı balık restoranları ve sahil evleriyle ilişkisi. Sahil şeridindeki restoran seçenekleri ve manzaralı emlak fırsatları.",
    internalLinks: ["Karasu sahil evleri", "Karasu denize yakın daire"]
  },
  {
    title: "Karasu'da Aile İle Gidilebilecek Balık Restoranları",
    slug: "karasuda-aile-ile-gidilebilecek-balik-restoranlari",
    type: 'normal',
    targetKeywords: ["karasu aile restoranı", "karasu çocuklu aile restoran"],
    brief: "Karasu'da aileler için uygun balık restoranları ve aile evleri yakınındaki restoranlar. Aile dostu restoranlar ve çevresindeki oturumluk emlak seçenekleri.",
    internalLinks: ["Karasu aile evleri", "Karasu oturumluk daire"]
  },
  {
    title: "Karasu'da Uygun Fiyatlı Balık Restoranları Rehberi",
    slug: "karasuda-uygun-fiyatli-balik-restoranlari-rehberi",
    type: 'normal',
    targetKeywords: ["karasu uygun restoran", "karasu ekonomik balık"],
    brief: "Karasu'da uygun fiyatlı balık restoranları ve bütçe dostu bölgelerdeki emlak fırsatları. Ekonomik restoran seçenekleri ve yakınındaki uygun fiyatlı emlak.",
    internalLinks: ["Karasu uygun fiyatlı ev", "Karasu ekonomik emlak"]
  },
  {
    title: "Karasu'da Lüks Balık Restoranları ve Çevresindeki Emlak",
    slug: "karasuda-luks-balik-restoranlari-ve-cevresindeki-emlak",
    type: 'normal',
    targetKeywords: ["karasu lüks restoran", "karasu premium balık"],
    brief: "Karasu'daki lüks balık restoranları ve çevresindeki premium emlak bölgeleri. Lüks restoranların bulunduğu bölgelerdeki villa ve premium konut seçenekleri.",
    internalLinks: ["Karasu lüks villa", "Karasu premium emlak"]
  },
  {
    title: "Karasu'da Taze Balık Nerede Yenir? En İyi Restoranlar",
    slug: "karasuda-taze-balik-nerede-yenir-en-iyi-restoranlar",
    type: 'normal',
    targetKeywords: ["karasu taze balık", "karasu günlük balık"],
    brief: "Karasu'da taze balık servisi yapan restoranlar ve balıkçılık bölgelerindeki emlak. Günlük taze balık servisi yapan restoranlar ve liman yakınındaki emlak fırsatları.",
    internalLinks: ["Karasu balıkçılık bölgeleri", "Karasu liman yakını"]
  },
  {
    title: "Karasu'da Deniz Manzaralı Balık Restoranları",
    slug: "karasuda-deniz-manzarali-balik-restoranlari",
    type: 'normal',
    targetKeywords: ["karasu manzaralı restoran", "karasu deniz görünümü"],
    brief: "Karasu'da deniz manzaralı balık restoranları ve manzaralı evlerle ilişkisi. Deniz manzaralı restoranlar ve çevresindeki manzaralı emlak seçenekleri.",
    internalLinks: ["Karasu manzaralı ev", "Karasu deniz görünümlü villa"]
  },
  {
    title: "Karasu'da Yerel Lezzetler: Balık Restoranları ve Mutfak Kültürü",
    slug: "karasuda-yerel-lezzetler-balik-restoranlari-ve-mutfak-kulturu",
    type: 'normal',
    targetKeywords: ["karasu yerel lezzet", "karasu mutfak kültürü"],
    brief: "Karasu'nun yerel mutfak kültürü ve balık restoranları. Yerel yaşam hakkında bilgi ve yerel kültürün emlak seçimine etkisi.",
    internalLinks: ["Karasu yerel yaşam", "Karasu kültür"]
  },
  {
    title: "Karasu'da Akşam Yemeği İçin En İyi Balık Restoranları",
    slug: "karasuda-aksam-yemegi-icin-en-iyi-balik-restoranlari",
    type: 'normal',
    targetKeywords: ["karasu akşam yemeği", "karasu akşam restoran"],
    brief: "Karasu'da akşam yemeği için ideal balık restoranları ve akşam yaşamı. Akşam yemeği için popüler restoranlar ve çevresindeki emlak seçenekleri.",
    internalLinks: ["Karasu gece hayatı", "Karasu sosyal aktiviteler"]
  },
  {
    title: "Karasu'da Balık Restoranları ve Çevresindeki Emlak Fırsatları",
    slug: "karasuda-balik-restoranlari-ve-cevresindeki-emlak-firsatlari",
    type: 'normal',
    targetKeywords: ["karasu restoran yakını emlak", "karasu restoran çevresi"],
    brief: "Karasu'da balık restoranları yakınındaki emlak fırsatları ve avantajları. Restoran yakınında ev almanın avantajları ve yatırım potansiyeli.",
    internalLinks: ["Karasu emlak fırsatları", "Karasu yatırım rehberi"]
  }
];

/**
 * Create article via Content Studio API
 */
async function createArticleViaAPI(article: ArticlePlan): Promise<void> {
  console.log(`\n📝 ${article.type === 'cornerstone' ? 'CORNERSTONE' : 'BLOG'}: "${article.title}"`);
  
  try {
    const apiUrl = `${siteUrl}/api/content-studio/create`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: article.type,
        template: 'news',
        topic: article.title,
        brief: article.brief,
        locale: 'tr',
        context: {
          internalLinks: article.internalLinks,
          targetKeywords: article.targetKeywords,
        },
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`   ✅ Oluşturuldu: ${result.data?.article?.title || article.title}`);
      console.log(`   📍 Slug: /blog/${result.data?.article?.slug || article.slug}`);
      console.log(`   📂 Kategori: ${result.data?.article?.status || 'draft'}`);
    } else {
      throw new Error(result.error || 'Unknown error');
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 3000));
    
  } catch (error: any) {
    console.error(`   ❌ Hata:`, error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 Karasu Balık Restoranları İçerikleri Oluşturuluyor...\n");
  console.log(`📡 API URL: ${siteUrl}/api/content-studio/create\n`);
  
  let cornerstoneCreated = 0;
  let cornerstoneErrors = 0;
  let blogCreated = 0;
  let blogErrors = 0;
  
  // Create cornerstone articles
  console.log("📚 Cornerstone Makaleler (5 adet)...\n");
  for (const article of CORNERSTONE_ARTICLES) {
    try {
      await createArticleViaAPI(article);
      cornerstoneCreated++;
    } catch (error: any) {
      console.error(`❌ Cornerstone hatası: ${article.title}`, error.message);
      cornerstoneErrors++;
    }
  }
  
  // Create blog posts
  console.log("\n📝 Blog Yazıları (10 adet)...\n");
  for (const article of BLOG_POSTS) {
    try {
      await createArticleViaAPI(article);
      blogCreated++;
    } catch (error: any) {
      console.error(`❌ Blog hatası: ${article.title}`, error.message);
      blogErrors++;
    }
  }
  
  // Summary
  console.log("\n📊 Özet:");
  console.log(`   📚 Cornerstone: ${cornerstoneCreated}/${CORNERSTONE_ARTICLES.length} oluşturuldu, ${cornerstoneErrors} hata`);
  console.log(`   📝 Blog: ${blogCreated}/${BLOG_POSTS.length} oluşturuldu, ${blogErrors} hata`);
  console.log(`   📁 Toplam: ${cornerstoneCreated + blogCreated}/${CORNERSTONE_ARTICLES.length + BLOG_POSTS.length}\n`);
  
  if (cornerstoneCreated + blogCreated > 0) {
    console.log("✨ İçerikler başarıyla oluşturuldu!\n");
    console.log("💡 Not: İçerikler 'draft' durumunda oluşturuldu. Admin panelden yayınlayabilirsiniz.\n");
  }
}

// Run
main()
  .then(() => {
    console.log("✅ Script tamamlandı.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
