#!/usr/bin/env tsx

/**
 * Create Karasu Balık Restoranları Content - Direct to Supabase
 * 
 * 5 adet cornerstone makale + 10 adet blog yazısı oluşturur.
 * Direkt Supabase'e kaydeder (AI içerik üretimi olmadan, placeholder içeriklerle).
 * İçerikler admin panelden düzenlenebilir.
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

interface ArticlePlan {
  title: string;
  slug: string;
  type: 'cornerstone' | 'normal';
  targetKeywords: string[];
  brief: string;
  internalLinks: string[];
  excerpt: string;
  metaDescription: string;
  content: string;
}

// 5 Cornerstone Makale Planı
const CORNERSTONE_ARTICLES: ArticlePlan[] = [
  {
    title: "Karasu'da En İyi Balık Restoranları: 2025 Kapsamlı Rehber",
    slug: "karasuda-en-iyi-balik-restoranlari-2025-kapsamli-rehber",
    type: 'cornerstone',
    targetKeywords: ["karasu balık restoranları", "karasu en iyi restoran", "karasu deniz ürünleri", "karasu balık lokantaları"],
    brief: "Karasu'da emlak alırken yakınınızdaki balık restoranları hakkında kapsamlı rehber.",
    internalLinks: ["Karasu'da ev almak", "Karasu yazlık yatırım", "Karasu denize yakın daireler"],
    excerpt: "Karasu'da emlak alırken yakınınızdaki balık restoranları hakkında kapsamlı rehber. Restoranların konumları, menüleri, fiyatları ve emlak bölgeleriyle ilişkisi. Karasu'da ev alırken yakınınızdaki restoranları da değerlendirin.",
    metaDescription: "Karasu'da en iyi balık restoranları rehberi. Emlak alırken yakındaki restoranları değerlendirin. Restoran yakınındaki emlak değerleri ve yazlık alırken sosyal hayat.",
    content: `<h1>Karasu'da En İyi Balık Restoranları: 2025 Kapsamlı Rehber</h1>

<p>Karasu, Sakarya'nın denize kıyısı olan ilçelerinden biri. Hem yazlık hem de oturumluk konut arayanlar için ideal bir bölge. Bu yazıda, Karasu'da emlak alırken yakınınızdaki balık restoranları hakkında kapsamlı bilgiler bulacaksınız.</p>

<h2>Karasu'da Emlak Alırken Restoranları Değerlendirmek</h2>

<p>Karasu'da ev alırken sadece konut özelliklerine bakmak yeterli değil. Yakınınızdaki restoranlar, özellikle balık restoranları, hem yaşam kalitesi hem de emlak değerleri açısından önemli faktörler. Restoran yakınındaki emlak değerleri genellikle daha yüksek oluyor.</p>

<h2>Karasu Sahil Şeridindeki Balık Restoranları</h2>

<p>Karasu sahil şeridinde birçok balık restoranı bulunuyor. Bu restoranlar, denize yakın konumları sayesinde hem turistler hem de yerel halk tarafından tercih ediliyor. Sahil şeridindeki restoranların çevresindeki emlak değerleri de bu nedenle yüksek.</p>

<h2>Yazlık Ev Alırken Restoran Yakınlığı</h2>

<p>Karasu'da yazlık ev alırken yakındaki balık restoranlarının önemi büyük. Yaz aylarında misafirlerinizi ağırlarken, yakındaki kaliteli restoranlar hem sizin hem de misafirlerinizin memnuniyetini artırır. Bu nedenle yazlık alırken sosyal hayatı göz önünde bulundurmalısınız.</p>

<h2>Restoran Yakınındaki Emlak Fırsatları</h2>

<p>Karasu'da balık restoranları yakınındaki emlak fırsatları hem yatırım hem de oturumluk için değerli. Restoran yakınında ev almanın avantajları arasında erişilebilirlik, sosyal hayat ve emlak değer artışı sayılabilir.</p>

<p>Karasu Emlak olarak, bölgedeki tüm emlak fırsatlarını değerlendirirken yakındaki restoranları da göz önünde bulunduruyoruz. <a href="/karasuda-ev-almak">Karasu'da ev almak</a> hakkında daha fazla bilgi için sayfamızı ziyaret edebilirsiniz.</p>`
  },
  {
    title: "Karasu Sahil Şeridindeki Balık Restoranları ve Emlak Değerleri",
    slug: "karasu-sahil-seridindeki-balik-restoranlari-ve-emlak-degerleri",
    type: 'cornerstone',
    targetKeywords: ["karasu sahil restoranları", "karasu denize yakın restoran", "karasu sahil emlak"],
    brief: "Karasu sahil şeridindeki balık restoranlarının emlak değerlerine etkisi.",
    internalLinks: ["Karasu sahil evleri", "Karasu denize sıfır villa", "Karasu yazlık fiyatları"],
    excerpt: "Karasu sahil şeridindeki balık restoranlarının emlak değerlerine etkisi. Restoran yakınında ev almanın avantajları ve dezavantajları.",
    metaDescription: "Karasu sahil şeridindeki balık restoranları ve emlak değerleri. Sahil restoranlarının çevresindeki emlak fırsatları.",
    content: `<h1>Karasu Sahil Şeridindeki Balık Restoranları ve Emlak Değerleri</h1>

<p>Karasu sahil şeridi, hem deniz manzarası hem de yakındaki balık restoranları sayesinde emlak yatırımcıları için cazip bir bölge. Bu yazıda, sahil şeridindeki restoranların emlak değerlerine etkisini inceleyeceğiz.</p>

<h2>Sahil Restoranlarının Emlak Değerlerine Etkisi</h2>

<p>Karasu sahil şeridindeki balık restoranları, bölgenin turizm potansiyelini artırıyor. Bu durum, çevresindeki emlak değerlerine de yansıyor. Sahil restoranlarının yakınındaki konutlar, hem yazlık hem de oturumluk için yüksek talep görüyor.</p>

<h2>Denize Yakın Restoranlar ve Emlak Fırsatları</h2>

<p>Denize yakın restoranlar, özellikle yaz aylarında yüksek talep görüyor. Bu restoranların çevresindeki emlak fırsatları da bu nedenle değerli. <a href="/karasu-sahil-evleri">Karasu sahil evleri</a> hakkında daha fazla bilgi için sayfamızı ziyaret edebilirsiniz.</p>

<h2>Restoran Yakınında Ev Almanın Avantajları</h2>

<p>Restoran yakınında ev almanın avantajları arasında erişilebilirlik, sosyal hayat ve emlak değer artışı sayılabilir. Ancak gürültü ve trafik gibi dezavantajları da göz önünde bulundurmalısınız.</p>`
  },
  {
    title: "Karasu'da Balık Restoranları Kültürü ve Yerel Yaşam Rehberi",
    slug: "karasuda-balik-restoranlari-kulturu-ve-yerel-yasam-rehberi",
    type: 'cornerstone',
    targetKeywords: ["karasu yerel yaşam", "karasu balık kültürü", "karasu sosyal hayat"],
    brief: "Karasu'da balık restoranları kültürü ve yerel yaşam.",
    internalLinks: ["Karasu'da yaşam", "Karasu mahalle rehberi", "Karasu sosyal aktiviteler"],
    excerpt: "Karasu'da balık restoranları kültürü ve yerel yaşam. Emlak alırken bölgenin sosyal hayatını anlamak için rehber.",
    metaDescription: "Karasu'da balık restoranları kültürü ve yerel yaşam rehberi. Yerel restoran kültürü ve emlak seçimine etkisi.",
    content: `<h1>Karasu'da Balık Restoranları Kültürü ve Yerel Yaşam Rehberi</h1>

<p>Karasu'nun yerel kültürü, balık restoranları etrafında şekilleniyor. Bu yazıda, Karasu'da emlak alırken bölgenin sosyal hayatını anlamak için rehber bulacaksınız.</p>

<h2>Yerel Restoran Kültürü</h2>

<p>Karasu'da balık restoranları, sadece yemek yemek için değil, aynı zamanda sosyalleşmek için de önemli mekanlar. Yerel halk, hafta sonları ve özel günlerde bu restoranlarda bir araya geliyor.</p>

<h2>Emlak Seçimine Etkisi</h2>

<p>Yerel restoran kültürü, emlak seçimine de etki ediyor. Restoran yakınındaki konutlar, sosyal hayata yakın olmak isteyenler için ideal. <a href="/karasuda-yasam">Karasu'da yaşam</a> hakkında daha fazla bilgi için sayfamızı ziyaret edebilirsiniz.</p>`
  },
  {
    title: "Karasu'da Yazlık Ev Alırken Yakındaki Balık Restoranları Rehberi",
    slug: "karasuda-yazlik-ev-alirken-yakindaki-balik-restoranlari-rehberi",
    type: 'cornerstone',
    targetKeywords: ["karasu yazlık restoran", "karasu yazlık ev yakını restoran", "karasu yazlık bölgeleri"],
    brief: "Karasu'da yazlık ev alırken yakındaki balık restoranlarının önemi.",
    internalLinks: ["Karasu yazlık yatırım", "Karasu yazlık fiyatları", "Karasu denize yakın yazlık"],
    excerpt: "Karasu'da yazlık ev alırken yakındaki balık restoranlarının önemi. Restoran yakınında yazlık almanın avantajları.",
    metaDescription: "Karasu'da yazlık ev alırken yakındaki balık restoranları rehberi. Yazlık bölgelerindeki restoran seçenekleri.",
    content: `<h1>Karasu'da Yazlık Ev Alırken Yakındaki Balık Restoranları Rehberi</h1>

<p>Karasu'da yazlık ev alırken yakındaki balık restoranlarının önemi büyük. Bu yazıda, yazlık bölgelerindeki restoran seçeneklerini ve emlak değerlerine etkisini inceleyeceğiz.</p>

<h2>Yazlık Bölgelerindeki Restoranlar</h2>

<p>Karasu'nun yazlık bölgelerinde birçok balık restoranı bulunuyor. Bu restoranlar, yaz aylarında hem yerel halk hem de tatilciler tarafından tercih ediliyor.</p>

<h2>Yazlık Alırken Restoran Yakınlığı</h2>

<p>Yazlık ev alırken yakındaki restoranları değerlendirmek önemli. Misafirlerinizi ağırlarken, yakındaki kaliteli restoranlar hem sizin hem de misafirlerinizin memnuniyetini artırır. <a href="/karasu-yazlik-yatirim">Karasu yazlık yatırım</a> hakkında daha fazla bilgi için sayfamızı ziyaret edebilirsiniz.</p>`
  },
  {
    title: "Karasu Balık Restoranları ve Turizm: Emlak Yatırımına Etkisi",
    slug: "karasu-balik-restoranlari-ve-turizm-emlak-yatirimina-etkisi",
    type: 'cornerstone',
    targetKeywords: ["karasu turizm", "karasu emlak yatırım", "karasu restoran turizm"],
    brief: "Karasu'daki balık restoranlarının turizme etkisi ve emlak yatırımlarına yansıması.",
    internalLinks: ["Karasu emlak yatırım", "Karasu turizm potansiyeli", "Karasu yatırım rehberi"],
    excerpt: "Karasu'daki balık restoranlarının turizme etkisi ve emlak yatırımlarına yansıması. Turistik bölgelerde emlak değerleri.",
    metaDescription: "Karasu balık restoranları ve turizm. Restoran turizminin emlak piyasasına etkisi ve yatırım fırsatları.",
    content: `<h1>Karasu Balık Restoranları ve Turizm: Emlak Yatırımına Etkisi</h1>

<p>Karasu'daki balık restoranları, bölgenin turizm potansiyelini artırıyor. Bu durum, emlak yatırımlarına da yansıyor. Bu yazıda, restoran turizminin emlak piyasasına etkisini inceleyeceğiz.</p>

<h2>Turizm ve Emlak Değerleri</h2>

<p>Karasu'daki balık restoranları, turistler için cazip mekanlar. Bu restoranların çevresindeki emlak değerleri de bu nedenle yüksek. Turistik bölgelerdeki konutlar, hem yazlık hem de yatırım için değerli.</p>

<h2>Yatırım Fırsatları</h2>

<p>Restoran turizminin emlak piyasasına etkisi, yatırımcılar için fırsatlar yaratıyor. <a href="/karasu-emlak-yatirim">Karasu emlak yatırım</a> hakkında daha fazla bilgi için sayfamızı ziyaret edebilirsiniz.</p>`
  }
];

// 10 Blog Yazısı Planı
const BLOG_POSTS: ArticlePlan[] = [
  {
    title: "Karasu Merkez'deki En Popüler Balık Restoranları",
    slug: "karasu-merkezdeki-en-populer-balik-restoranlari",
    type: 'normal',
    targetKeywords: ["karasu merkez restoran", "karasu balık lokantası"],
    brief: "Karasu merkezdeki popüler balık restoranları.",
    internalLinks: ["Karasu merkez evleri", "Karasu şehir merkezi"],
    excerpt: "Karasu merkezdeki popüler balık restoranları ve emlak bölgeleriyle ilişkisi.",
    metaDescription: "Karasu merkezdeki popüler balık restoranları. Merkez bölgelerdeki restoran seçenekleri.",
    content: `<h1>Karasu Merkez'deki En Popüler Balık Restoranları</h1>
<p>Karasu merkezdeki popüler balık restoranları ve emlak bölgeleriyle ilişkisi hakkında bilgiler.</p>`
  },
  {
    title: "Karasu Sahil'de Balık Yemek İçin En İyi Restoranlar",
    slug: "karasu-sahilde-balik-yemek-icin-en-iyi-restoranlar",
    type: 'normal',
    targetKeywords: ["karasu sahil restoran", "karasu deniz manzaralı restoran"],
    brief: "Karasu sahilinde deniz manzaralı balık restoranları.",
    internalLinks: ["Karasu sahil evleri", "Karasu denize yakın daire"],
    excerpt: "Karasu sahilinde deniz manzaralı balık restoranları ve sahil evleriyle ilişkisi.",
    metaDescription: "Karasu sahilinde balık yemek için en iyi restoranlar. Deniz manzaralı restoranlar.",
    content: `<h1>Karasu Sahil'de Balık Yemek İçin En İyi Restoranlar</h1>
<p>Karasu sahilinde deniz manzaralı balık restoranları hakkında bilgiler.</p>`
  },
  {
    title: "Karasu'da Aile İle Gidilebilecek Balık Restoranları",
    slug: "karasuda-aile-ile-gidilebilecek-balik-restoranlari",
    type: 'normal',
    targetKeywords: ["karasu aile restoranı", "karasu çocuklu aile restoran"],
    brief: "Karasu'da aileler için uygun balık restoranları.",
    internalLinks: ["Karasu aile evleri", "Karasu oturumluk daire"],
    excerpt: "Karasu'da aileler için uygun balık restoranları ve aile evleri yakınındaki restoranlar.",
    metaDescription: "Karasu'da aile ile gidilebilecek balık restoranları. Aile dostu restoranlar.",
    content: `<h1>Karasu'da Aile İle Gidilebilecek Balık Restoranları</h1>
<p>Karasu'da aileler için uygun balık restoranları hakkında bilgiler.</p>`
  },
  {
    title: "Karasu'da Uygun Fiyatlı Balık Restoranları Rehberi",
    slug: "karasuda-uygun-fiyatli-balik-restoranlari-rehberi",
    type: 'normal',
    targetKeywords: ["karasu uygun restoran", "karasu ekonomik balık"],
    brief: "Karasu'da uygun fiyatlı balık restoranları.",
    internalLinks: ["Karasu uygun fiyatlı ev", "Karasu ekonomik emlak"],
    excerpt: "Karasu'da uygun fiyatlı balık restoranları ve bütçe dostu bölgelerdeki emlak fırsatları.",
    metaDescription: "Karasu'da uygun fiyatlı balık restoranları rehberi. Ekonomik restoran seçenekleri.",
    content: `<h1>Karasu'da Uygun Fiyatlı Balık Restoranları Rehberi</h1>
<p>Karasu'da uygun fiyatlı balık restoranları hakkında bilgiler.</p>`
  },
  {
    title: "Karasu'da Lüks Balık Restoranları ve Çevresindeki Emlak",
    slug: "karasuda-luks-balik-restoranlari-ve-cevresindeki-emlak",
    type: 'normal',
    targetKeywords: ["karasu lüks restoran", "karasu premium balık"],
    brief: "Karasu'daki lüks balık restoranları.",
    internalLinks: ["Karasu lüks villa", "Karasu premium emlak"],
    excerpt: "Karasu'daki lüks balık restoranları ve çevresindeki premium emlak bölgeleri.",
    metaDescription: "Karasu'da lüks balık restoranları ve çevresindeki emlak. Premium restoranlar.",
    content: `<h1>Karasu'da Lüks Balık Restoranları ve Çevresindeki Emlak</h1>
<p>Karasu'daki lüks balık restoranları hakkında bilgiler.</p>`
  },
  {
    title: "Karasu'da Taze Balık Nerede Yenir? En İyi Restoranlar",
    slug: "karasuda-taze-balik-nerede-yenir-en-iyi-restoranlar",
    type: 'normal',
    targetKeywords: ["karasu taze balık", "karasu günlük balık"],
    brief: "Karasu'da taze balık servisi yapan restoranlar.",
    internalLinks: ["Karasu balıkçılık bölgeleri", "Karasu liman yakını"],
    excerpt: "Karasu'da taze balık servisi yapan restoranlar ve balıkçılık bölgelerindeki emlak.",
    metaDescription: "Karasu'da taze balık nerede yenir? Günlük taze balık servisi yapan restoranlar.",
    content: `<h1>Karasu'da Taze Balık Nerede Yenir? En İyi Restoranlar</h1>
<p>Karasu'da taze balık servisi yapan restoranlar hakkında bilgiler.</p>`
  },
  {
    title: "Karasu'da Deniz Manzaralı Balık Restoranları",
    slug: "karasuda-deniz-manzarali-balik-restoranlari",
    type: 'normal',
    targetKeywords: ["karasu manzaralı restoran", "karasu deniz görünümü"],
    brief: "Karasu'da deniz manzaralı balık restoranları.",
    internalLinks: ["Karasu manzaralı ev", "Karasu deniz görünümlü villa"],
    excerpt: "Karasu'da deniz manzaralı balık restoranları ve manzaralı evlerle ilişkisi.",
    metaDescription: "Karasu'da deniz manzaralı balık restoranları. Manzaralı restoranlar.",
    content: `<h1>Karasu'da Deniz Manzaralı Balık Restoranları</h1>
<p>Karasu'da deniz manzaralı balık restoranları hakkında bilgiler.</p>`
  },
  {
    title: "Karasu'da Yerel Lezzetler: Balık Restoranları ve Mutfak Kültürü",
    slug: "karasuda-yerel-lezzetler-balik-restoranlari-ve-mutfak-kulturu",
    type: 'normal',
    targetKeywords: ["karasu yerel lezzet", "karasu mutfak kültürü"],
    brief: "Karasu'nun yerel mutfak kültürü ve balık restoranları.",
    internalLinks: ["Karasu yerel yaşam", "Karasu kültür"],
    excerpt: "Karasu'nun yerel mutfak kültürü ve balık restoranları. Yerel yaşam hakkında bilgi.",
    metaDescription: "Karasu'da yerel lezzetler ve balık restoranları. Yerel mutfak kültürü.",
    content: `<h1>Karasu'da Yerel Lezzetler: Balık Restoranları ve Mutfak Kültürü</h1>
<p>Karasu'nun yerel mutfak kültürü hakkında bilgiler.</p>`
  },
  {
    title: "Karasu'da Akşam Yemeği İçin En İyi Balık Restoranları",
    slug: "karasuda-aksam-yemegi-icin-en-iyi-balik-restoranlari",
    type: 'normal',
    targetKeywords: ["karasu akşam yemeği", "karasu akşam restoran"],
    brief: "Karasu'da akşam yemeği için ideal balık restoranları.",
    internalLinks: ["Karasu gece hayatı", "Karasu sosyal aktiviteler"],
    excerpt: "Karasu'da akşam yemeği için ideal balık restoranları ve akşam yaşamı.",
    metaDescription: "Karasu'da akşam yemeği için en iyi balık restoranları. Akşam restoranları.",
    content: `<h1>Karasu'da Akşam Yemeği İçin En İyi Balık Restoranları</h1>
<p>Karasu'da akşam yemeği için ideal balık restoranları hakkında bilgiler.</p>`
  },
  {
    title: "Karasu'da Balık Restoranları ve Çevresindeki Emlak Fırsatları",
    slug: "karasuda-balik-restoranlari-ve-cevresindeki-emlak-firsatlari",
    type: 'normal',
    targetKeywords: ["karasu restoran yakını emlak", "karasu restoran çevresi"],
    brief: "Karasu'da balık restoranları yakınındaki emlak fırsatları.",
    internalLinks: ["Karasu emlak fırsatları", "Karasu yatırım rehberi"],
    excerpt: "Karasu'da balık restoranları yakınındaki emlak fırsatları ve avantajları.",
    metaDescription: "Karasu'da balık restoranları ve çevresindeki emlak fırsatları. Restoran yakını emlak.",
    content: `<h1>Karasu'da Balık Restoranları ve Çevresindeki Emlak Fırsatları</h1>
<p>Karasu'da balık restoranları yakınındaki emlak fırsatları hakkında bilgiler.</p>`
  }
];

/**
 * Create article directly in Supabase
 */
async function createArticle(article: ArticlePlan): Promise<void> {
  console.log(`\n📝 ${article.type === 'cornerstone' ? 'CORNERSTONE' : 'BLOG'}: "${article.title}"`);
  
  try {
    // Check if exists
    const { data: existing } = await supabase
      .from("articles")
      .select("id, title")
      .eq("slug", article.slug)
      .maybeSingle();
    
    if (existing) {
      console.log(`   ⏭️  Zaten mevcut: ${article.title}`);
      return;
    }
    
    // Prepare article data
    const articleData: any = {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      meta_description: article.metaDescription,
      keywords: article.targetKeywords,
      author: "Karasu Emlak",
      status: "draft", // Draft olarak oluştur, admin panelden yayınlanabilir
      category: article.type === 'cornerstone' ? 'Rehber' : 'Blog',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
    };
    
    // Create
    const { data, error: insertError } = await supabase
      .from("articles")
      .insert(articleData)
      .select("id")
      .single();
    
    if (insertError) throw insertError;
    
    console.log(`   ✅ Oluşturuldu: ${article.title}`);
    console.log(`   📍 Slug: /blog/${article.slug}`);
    console.log(`   📂 Kategori: ${articleData.category}`);
    console.log(`   📝 Durum: ${articleData.status} (Admin panelden yayınlanabilir)`);
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
  
  let cornerstoneCreated = 0;
  let cornerstoneErrors = 0;
  let blogCreated = 0;
  let blogErrors = 0;
  
  // Create cornerstone articles
  console.log("📚 Cornerstone Makaleler (5 adet)...\n");
  for (const article of CORNERSTONE_ARTICLES) {
    try {
      await createArticle(article);
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
      await createArticle(article);
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
    console.log("🔗 Admin Panel: http://localhost:3001/articles veya http://localhost:3000/tr/seo/content-studio\n");
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
