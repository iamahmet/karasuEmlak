#!/usr/bin/env tsx

/**
 * Create Karasu Balık Restoranları Content
 * 
 * 5 adet cornerstone makale + 10 adet blog yazısı oluşturur.
 * Karasu Emlak ile ilişkilendirilmiş, SEO optimize, Google Discover/SGE uyumlu.
 */

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!");
  process.exit(1);
}

if (!geminiApiKey && !openaiApiKey) {
  console.error("❌ GEMINI_API_KEY veya OPENAI_API_KEY gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

interface ArticlePlan {
  title: string;
  slug: string;
  type: 'cornerstone' | 'blog';
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
    brief: "Karasu'da emlak alırken yakınınızdaki balık restoranları hakkında kapsamlı rehber. Restoranların konumları, menüleri, fiyatları ve emlak bölgeleriyle ilişkisi.",
    internalLinks: ["Karasu'da ev almak", "Karasu yazlık yatırım", "Karasu denize yakın daireler"]
  },
  {
    title: "Karasu Sahil Şeridindeki Balık Restoranları ve Emlak Değerleri",
    slug: "karasu-sahil-seridindeki-balik-restoranlari-ve-emlak-degerleri",
    type: 'cornerstone',
    targetKeywords: ["karasu sahil restoranları", "karasu denize yakın restoran", "karasu sahil emlak"],
    brief: "Karasu sahil şeridindeki balık restoranlarının emlak değerlerine etkisi. Restoran yakınında ev almanın avantajları ve dezavantajları.",
    internalLinks: ["Karasu sahil evleri", "Karasu denize sıfır villa", "Karasu yazlık fiyatları"]
  },
  {
    title: "Karasu'da Balık Restoranları Kültürü ve Yerel Yaşam Rehberi",
    slug: "karasuda-balik-restoranlari-kulturu-ve-yerel-yasam-rehberi",
    type: 'cornerstone',
    targetKeywords: ["karasu yerel yaşam", "karasu balık kültürü", "karasu sosyal hayat"],
    brief: "Karasu'da balık restoranları kültürü ve yerel yaşam. Emlak alırken bölgenin sosyal hayatını anlamak için rehber.",
    internalLinks: ["Karasu'da yaşam", "Karasu mahalle rehberi", "Karasu sosyal aktiviteler"]
  },
  {
    title: "Karasu'da Yazlık Ev Alırken Yakındaki Balık Restoranları Rehberi",
    slug: "karasuda-yazlik-ev-alirken-yakindaki-balik-restoranlari-rehberi",
    type: 'cornerstone',
    targetKeywords: ["karasu yazlık restoran", "karasu yazlık ev yakını restoran", "karasu yazlık bölgeleri"],
    brief: "Karasu'da yazlık ev alırken yakındaki balık restoranlarının önemi. Restoran yakınında yazlık almanın avantajları.",
    internalLinks: ["Karasu yazlık yatırım", "Karasu yazlık fiyatları", "Karasu denize yakın yazlık"]
  },
  {
    title: "Karasu Balık Restoranları ve Turizm: Emlak Yatırımına Etkisi",
    slug: "karasu-balik-restoranlari-ve-turizm-emlak-yatirimina-etkisi",
    type: 'cornerstone',
    targetKeywords: ["karasu turizm", "karasu emlak yatırım", "karasu restoran turizm"],
    brief: "Karasu'daki balık restoranlarının turizme etkisi ve emlak yatırımlarına yansıması. Turistik bölgelerde emlak değerleri.",
    internalLinks: ["Karasu emlak yatırım", "Karasu turizm potansiyeli", "Karasu yatırım rehberi"]
  }
];

// 10 Blog Yazısı Planı
const BLOG_POSTS: ArticlePlan[] = [
  {
    title: "Karasu Merkez'deki En Popüler Balık Restoranları",
    slug: "karasu-merkezdeki-en-populer-balik-restoranlari",
    type: 'blog',
    targetKeywords: ["karasu merkez restoran", "karasu balık lokantası"],
    brief: "Karasu merkezdeki popüler balık restoranları ve emlak bölgeleriyle ilişkisi.",
    internalLinks: ["Karasu merkez evleri", "Karasu şehir merkezi"]
  },
  {
    title: "Karasu Sahil'de Balık Yemek İçin En İyi Restoranlar",
    slug: "karasu-sahilde-balik-yemek-icin-en-iyi-restoranlar",
    type: 'blog',
    targetKeywords: ["karasu sahil restoran", "karasu deniz manzaralı restoran"],
    brief: "Karasu sahilinde deniz manzaralı balık restoranları ve sahil evleriyle ilişkisi.",
    internalLinks: ["Karasu sahil evleri", "Karasu denize yakın daire"]
  },
  {
    title: "Karasu'da Aile İle Gidilebilecek Balık Restoranları",
    slug: "karasuda-aile-ile-gidilebilecek-balik-restoranlari",
    type: 'blog',
    targetKeywords: ["karasu aile restoranı", "karasu çocuklu aile restoran"],
    brief: "Karasu'da aileler için uygun balık restoranları ve aile evleri yakınındaki restoranlar.",
    internalLinks: ["Karasu aile evleri", "Karasu oturumluk daire"]
  },
  {
    title: "Karasu'da Uygun Fiyatlı Balık Restoranları Rehberi",
    slug: "karasuda-uygun-fiyatli-balik-restoranlari-rehberi",
    type: 'blog',
    targetKeywords: ["karasu uygun restoran", "karasu ekonomik balık"],
    brief: "Karasu'da uygun fiyatlı balık restoranları ve bütçe dostu bölgelerdeki emlak fırsatları.",
    internalLinks: ["Karasu uygun fiyatlı ev", "Karasu ekonomik emlak"]
  },
  {
    title: "Karasu'da Lüks Balık Restoranları ve Çevresindeki Emlak",
    slug: "karasuda-luks-balik-restoranlari-ve-cevresindeki-emlak",
    type: 'blog',
    targetKeywords: ["karasu lüks restoran", "karasu premium balık"],
    brief: "Karasu'daki lüks balık restoranları ve çevresindeki premium emlak bölgeleri.",
    internalLinks: ["Karasu lüks villa", "Karasu premium emlak"]
  },
  {
    title: "Karasu'da Taze Balık Nerede Yenir? En İyi Restoranlar",
    slug: "karasuda-taze-balik-nerede-yenir-en-iyi-restoranlar",
    type: 'blog',
    targetKeywords: ["karasu taze balık", "karasu günlük balık"],
    brief: "Karasu'da taze balık servisi yapan restoranlar ve balıkçılık bölgelerindeki emlak.",
    internalLinks: ["Karasu balıkçılık bölgeleri", "Karasu liman yakını"]
  },
  {
    title: "Karasu'da Deniz Manzaralı Balık Restoranları",
    slug: "karasuda-deniz-manzarali-balik-restoranlari",
    type: 'blog',
    targetKeywords: ["karasu manzaralı restoran", "karasu deniz görünümü"],
    brief: "Karasu'da deniz manzaralı balık restoranları ve manzaralı evlerle ilişkisi.",
    internalLinks: ["Karasu manzaralı ev", "Karasu deniz görünümlü villa"]
  },
  {
    title: "Karasu'da Yerel Lezzetler: Balık Restoranları ve Mutfak Kültürü",
    slug: "karasuda-yerel-lezzetler-balik-restoranlari-ve-mutfak-kulturu",
    type: 'blog',
    targetKeywords: ["karasu yerel lezzet", "karasu mutfak kültürü"],
    brief: "Karasu'nun yerel mutfak kültürü ve balık restoranları. Yerel yaşam hakkında bilgi.",
    internalLinks: ["Karasu yerel yaşam", "Karasu kültür"]
  },
  {
    title: "Karasu'da Akşam Yemeği İçin En İyi Balık Restoranları",
    slug: "karasuda-aksam-yemegi-icin-en-iyi-balik-restoranlari",
    type: 'blog',
    targetKeywords: ["karasu akşam yemeği", "karasu akşam restoran"],
    brief: "Karasu'da akşam yemeği için ideal balık restoranları ve akşam yaşamı.",
    internalLinks: ["Karasu gece hayatı", "Karasu sosyal aktiviteler"]
  },
  {
    title: "Karasu'da Balık Restoranları ve Çevresindeki Emlak Fırsatları",
    slug: "karasuda-balik-restoranlari-ve-cevresindeki-emlak-firsatlari",
    type: 'blog',
    targetKeywords: ["karasu restoran yakını emlak", "karasu restoran çevresi"],
    brief: "Karasu'da balık restoranları yakınındaki emlak fırsatları ve avantajları.",
    internalLinks: ["Karasu emlak fırsatları", "Karasu yatırım rehberi"]
  }
];

/**
 * Generate article content using Gemini
 */
async function generateArticleContent(article: ArticlePlan): Promise<{
  title: string;
  content: string;
  excerpt: string;
  meta_description: string;
  keywords: string[];
}> {
  const wordCount = article.type === 'cornerstone' ? 2000 : 1000;
  
  const karasuContext = `
KARASU EMLAK İÇERİK BAĞLAMI:
- Bölge: Karasu, Kocaali, Sakarya
- Site: KarasuEmlak.net - Karasu ve çevresinin güvenilir emlak platformu
- Uzmanlık: Yerel emlak piyasası, mahalle analizleri, yatırım rehberleri
- Hedef Kitle: Emlak alıcıları, yatırımcılar, bölge hakkında bilgi arayanlar
- Ton: Yerel uzman, güvenilir, bilgilendirici, doğal (AI gibi değil)
`;

  const prompt = `Sen Karasu'da 15 yıldır hizmet veren profesyonel bir emlak danışmanısın. Aşağıdaki konuda ${wordCount}+ kelimelik, kapsamlı, profesyonel ve bilgilendirici bir ${article.type === 'cornerstone' ? 'CORNERSTONE' : 'BLOG'} makale yaz.

BAŞLIK: ${article.title}
HEDEF ANAHTAR KELİMELER: ${article.targetKeywords.join(', ')}
KONU: ${article.brief}

${karasuContext}

GEREKSİNİMLER:
1. Minimum ${wordCount} kelime${article.type === 'cornerstone' ? ' (tercihen 2000+)' : ''}
2. Tam yapılandırılmış (H2, H3 başlıklar)
3. Karasu Emlak ile mantıklı şekilde ilişkilendir (örnek: "Karasu'da ev alırken yakınınızdaki restoranları da değerlendirin", "Restoran yakınındaki emlak değerleri", "Yazlık alırken sosyal hayatı göz önünde bulundurun")
4. Yerel bilgiler ekle (Karasu, Kocaali, mahalle adları, gerçek detaylar)
5. SEO optimize (anahtar kelimeler doğal şekilde kullanılmalı)
6. Anti-AI ton: "Sonuç olarak", "Özetlemek gerekirse", "Bu makalede" gibi ifadeler KULLANMA
7. Doğal, konuşma tonu: "By the way", "Honestly", "Let's see" gibi geçişler kullan
8. İç linkler için şu metinleri kullan: ${article.internalLinks.join(', ')}

İÇERİK YAPISI:
- Giriş (200-300 kelime): Konuya giriş, Karasu bağlamı
- Ana bölümler (H2 başlıklar altında, her biri 300-500 kelime)
- Alt bölümler (H3 başlıklar altında)
- Karasu Emlak bağlantısı (her bölümde doğal şekilde)
- Sonuç ve özet (200-300 kelime)

JSON formatında döndür (sadece JSON, başka açıklama yapma):
{
  "title": "makale başlığı",
  "excerpt": "150-200 kelimelik özet",
  "content": "tam içerik (HTML formatında, H2/H3 başlıklar dahil, <p>, <ul>, <li> kullan)",
  "meta_description": "150-160 karakter SEO açıklaması",
  "keywords": ["anahtar", "kelime", "listesi"]
}`;

  // Try Gemini first if available
  if (genAI) {
    const modelsToTry = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
    let result;
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: article.type === 'cornerstone' ? 8000 : 4000,
            responseMimeType: 'application/json',
          },
        });
        result = await model.generateContent(prompt);
        break;
      } catch (error: any) {
        console.warn(`[Gemini] Model ${modelName} failed, trying next...`, error.message);
        if (modelName === modelsToTry[modelsToTry.length - 1]) {
          console.log('[AI] Falling back to OpenAI...');
          break;
        }
      }
    }
    
    if (result) {
      const response = result.response.text();
      let parsed: any;
      
      try {
        parsed = JSON.parse(response);
      } catch (e) {
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          throw new Error('Could not parse JSON response');
        }
      }
      
      return {
        title: parsed.title || article.title,
        content: parsed.content || '',
        excerpt: parsed.excerpt || '',
        meta_description: parsed.meta_description || parsed.metaDescription || '',
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : 
                  typeof parsed.keywords === 'string' ? parsed.keywords.split(',').map((k: string) => k.trim()) :
                  article.targetKeywords,
      };
    }
  }
  
  // Fallback to OpenAI
  if (!openai) {
    throw new Error('Neither Gemini nor OpenAI API key is available');
  }
  
  console.log('[AI] Using OpenAI for content generation...');
  const completion = await openai.chat.completions.create({
    model: article.type === 'cornerstone' ? 'gpt-4o' : 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Sen Karasu\'da 15 yıldır hizmet veren profesyonel bir emlak danışmanısın. Profesyonel, objektif ve bilgilendirici içerik üretiyorsun.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: article.type === 'cornerstone' ? 8000 : 4000,
    response_format: { type: 'json_object' },
  });
  
  let parsed: any;
  
  try {
    parsed = JSON.parse(response);
  } catch (e) {
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } else {
      throw new Error('Could not parse JSON response');
    }
  }
  
  return {
    title: parsed.title || article.title,
    content: parsed.content || '',
    excerpt: parsed.excerpt || '',
    meta_description: parsed.meta_description || parsed.metaDescription || '',
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : 
              typeof parsed.keywords === 'string' ? parsed.keywords.split(',').map((k: string) => k.trim()) :
              article.targetKeywords,
  };
}

/**
 * Create slug from title
 */
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Create or update article
 */
async function createArticle(article: ArticlePlan): Promise<void> {
  console.log(`\n📝 ${article.type === 'cornerstone' ? 'CORNERSTONE' : 'BLOG'}: "${article.title}"`);
  
  try {
    // Generate content
    const generated = await generateArticleContent(article);
    
    // Create slug
    let slug = article.slug || createSlug(generated.title);
    
    // Check if exists
    const { data: existing } = await supabase
      .from("articles")
      .select("id, title")
      .eq("slug", slug)
      .maybeSingle();
    
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }
    
    // Prepare article data
    const articleData: any = {
      title: generated.title,
      slug,
      excerpt: generated.excerpt || generated.meta_description?.substring(0, 200) || '',
      content: generated.content,
      meta_description: generated.meta_description,
      keywords: generated.keywords.length > 0 ? generated.keywords : article.targetKeywords,
      author: "Karasu Emlak",
      status: "published",
      category: article.type === 'cornerstone' ? 'Rehber' : 'Blog',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
    };
    
    if (existing) {
      // Update
      const { error: updateError } = await supabase
        .from("articles")
        .update(articleData)
        .eq("id", existing.id);
      
      if (updateError) throw updateError;
      
      console.log(`   🔄 Güncellendi: ${generated.title}`);
      console.log(`   📍 Slug: /blog/${slug}`);
    } else {
      // Create
      const { data, error: insertError } = await supabase
        .from("articles")
        .insert(articleData)
        .select("id")
        .single();
      
      if (insertError) throw insertError;
      
      console.log(`   ✅ Oluşturuldu: ${generated.title}`);
      console.log(`   📍 Slug: /blog/${slug}`);
      console.log(`   📂 Kategori: ${articleData.category}`);
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
