#!/usr/bin/env tsx

/**
 * Create Karasu Kahvaltı Yerleri Content
 * 
 * 5 adet cornerstone makale + 10 adet blog yazısı oluşturur.
 * Karasu Emlak ile ilişkilendirilmiş, SEO optimize, Google Discover/SGE uyumlu.
 */

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;

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

// Configure Cloudinary
const hasCloudinary = cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret;
if (hasCloudinary) {
  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
  });
} else {
  console.warn("⚠️  Cloudinary config eksik - görsel oluşturma atlanacak");
}

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
    title: "Karasu'da En İyi Kahvaltı Yerleri: 2025 Kapsamlı Rehber",
    slug: "karasuda-en-iyi-kahvalti-yerleri-2025-kapsamli-rehber",
    type: 'cornerstone',
    targetKeywords: ["karasu kahvaltı yerleri", "karasu en iyi kahvaltı", "karasu kahvaltı mekanları", "karasu kahvaltı salonları"],
    brief: "Karasu'da emlak alırken yakınınızdaki kahvaltı yerleri hakkında kapsamlı rehber. Kahvaltı mekanlarının konumları, menüleri, fiyatları ve emlak bölgeleriyle ilişkisi.",
    internalLinks: ["Karasu'da ev almak", "Karasu yazlık yatırım", "Karasu merkez daireler"]
  },
  {
    title: "Karasu Sahil Şeridindeki Kahvaltı Mekanları ve Emlak Değerleri",
    slug: "karasu-sahil-seridindeki-kahvalti-mekanlari-ve-emlak-degerleri",
    type: 'cornerstone',
    targetKeywords: ["karasu sahil kahvaltı", "karasu denize yakın kahvaltı", "karasu sahil emlak", "karasu sahil kahvaltı mekanları"],
    brief: "Karasu sahil şeridindeki kahvaltı mekanlarının emlak değerlerine etkisi. Kahvaltı mekanı yakınında ev almanın avantajları ve dezavantajları.",
    internalLinks: ["Karasu sahil evleri", "Karasu denize sıfır villa", "Karasu yazlık fiyatları"]
  },
  {
    title: "Karasu'da Kahvaltı Kültürü ve Yerel Yaşam Rehberi",
    slug: "karasuda-kahvalti-kulturu-ve-yerel-yasam-rehberi",
    type: 'cornerstone',
    targetKeywords: ["karasu yerel yaşam", "karasu kahvaltı kültürü", "karasu sosyal hayat", "karasu kahvaltı geleneği"],
    brief: "Karasu'da kahvaltı kültürü ve yerel yaşam. Emlak alırken bölgenin sosyal hayatını anlamak için rehber. Kahvaltı mekanlarının sosyal hayattaki yeri.",
    internalLinks: ["Karasu'da yaşam", "Karasu mahalle rehberi", "Karasu sosyal aktiviteler"]
  },
  {
    title: "Karasu'da Yazlık Ev Alırken Yakındaki Kahvaltı Yerleri Rehberi",
    slug: "karasuda-yazlik-ev-alirken-yakindaki-kahvalti-yerleri-rehberi",
    type: 'cornerstone',
    targetKeywords: ["karasu yazlık kahvaltı", "karasu yazlık ev yakını kahvaltı", "karasu yazlık bölgeleri", "karasu yazlık kahvaltı mekanları"],
    brief: "Karasu'da yazlık ev alırken yakındaki kahvaltı yerlerinin önemi. Kahvaltı mekanı yakınında yazlık almanın avantajları ve yazlık yaşam kalitesi.",
    internalLinks: ["Karasu yazlık yatırım", "Karasu yazlık fiyatları", "Karasu denize yakın yazlık"]
  },
  {
    title: "Karasu Kahvaltı Mekanları ve Turizm: Emlak Yatırımına Etkisi",
    slug: "karasu-kahvalti-mekanlari-ve-turizm-emlak-yatirimina-etkisi",
    type: 'cornerstone',
    targetKeywords: ["karasu turizm", "karasu emlak yatırım", "karasu kahvaltı turizm", "karasu turistik kahvaltı"],
    brief: "Karasu'daki kahvaltı mekanlarının turizme etkisi ve emlak yatırımlarına yansıması. Turistik bölgelerde emlak değerleri ve kahvaltı mekanlarının rolü.",
    internalLinks: ["Karasu emlak yatırım", "Karasu turizm potansiyeli", "Karasu yatırım rehberi"]
  }
];

// 10 Blog Yazısı Planı
const BLOG_POSTS: ArticlePlan[] = [
  {
    title: "Karasu Merkez'deki En Popüler Kahvaltı Mekanları",
    slug: "karasu-merkezdeki-en-populer-kahvalti-mekanlari",
    type: 'blog',
    targetKeywords: ["karasu merkez kahvaltı", "karasu kahvaltı salonu"],
    brief: "Karasu merkezdeki popüler kahvaltı mekanları ve emlak bölgeleriyle ilişkisi.",
    internalLinks: ["Karasu merkez evleri", "Karasu şehir merkezi"]
  },
  {
    title: "Karasu Sahil'de Kahvaltı Yapmak İçin En İyi Mekanlar",
    slug: "karasu-sahilde-kahvalti-yapmak-icin-en-iyi-mekanlar",
    type: 'blog',
    targetKeywords: ["karasu sahil kahvaltı", "karasu deniz manzaralı kahvaltı"],
    brief: "Karasu sahilinde deniz manzaralı kahvaltı mekanları ve sahil evleriyle ilişkisi.",
    internalLinks: ["Karasu sahil evleri", "Karasu denize yakın daire"]
  },
  {
    title: "Karasu'da Aile İle Gidilebilecek Kahvaltı Yerleri",
    slug: "karasuda-aile-ile-gidilebilecek-kahvalti-yerleri",
    type: 'blog',
    targetKeywords: ["karasu aile kahvaltı", "karasu çocuklu aile kahvaltı"],
    brief: "Karasu'da aileler için uygun kahvaltı mekanları ve aile evleri yakınındaki mekanlar.",
    internalLinks: ["Karasu aile evleri", "Karasu oturumluk daire"]
  },
  {
    title: "Karasu'da Uygun Fiyatlı Kahvaltı Mekanları Rehberi",
    slug: "karasuda-uygun-fiyatli-kahvalti-mekanlari-rehberi",
    type: 'blog',
    targetKeywords: ["karasu uygun kahvaltı", "karasu ekonomik kahvaltı"],
    brief: "Karasu'da uygun fiyatlı kahvaltı mekanları ve bütçe dostu bölgelerdeki emlak fırsatları.",
    internalLinks: ["Karasu uygun fiyatlı ev", "Karasu ekonomik emlak"]
  },
  {
    title: "Karasu'da Lüks Kahvaltı Mekanları ve Çevresindeki Emlak",
    slug: "karasuda-luks-kahvalti-mekanlari-ve-cevresindeki-emlak",
    type: 'blog',
    targetKeywords: ["karasu lüks kahvaltı", "karasu premium kahvaltı"],
    brief: "Karasu'daki lüks kahvaltı mekanları ve çevresindeki premium emlak bölgeleri.",
    internalLinks: ["Karasu lüks villa", "Karasu premium emlak"]
  },
  {
    title: "Karasu'da Organik Kahvaltı Nerede Yapılır? En İyi Mekanlar",
    slug: "karasuda-organik-kahvalti-nerede-yapilir-en-iyi-mekanlar",
    type: 'blog',
    targetKeywords: ["karasu organik kahvaltı", "karasu doğal kahvaltı"],
    brief: "Karasu'da organik kahvaltı servisi yapan mekanlar ve organik ürün bölgelerindeki emlak.",
    internalLinks: ["Karasu organik ürün bölgeleri", "Karasu doğal yaşam"]
  },
  {
    title: "Karasu'da Deniz Manzaralı Kahvaltı Mekanları",
    slug: "karasuda-deniz-manzarali-kahvalti-mekanlari",
    type: 'blog',
    targetKeywords: ["karasu manzaralı kahvaltı", "karasu deniz görünümü kahvaltı"],
    brief: "Karasu'da deniz manzaralı kahvaltı mekanları ve manzaralı evlerle ilişkisi.",
    internalLinks: ["Karasu manzaralı ev", "Karasu deniz görünümlü villa"]
  },
  {
    title: "Karasu'da Yerel Lezzetler: Kahvaltı Mekanları ve Mutfak Kültürü",
    slug: "karasuda-yerel-lezzetler-kahvalti-mekanlari-ve-mutfak-kulturu",
    type: 'blog',
    targetKeywords: ["karasu yerel kahvaltı", "karasu mutfak kültürü"],
    brief: "Karasu'nun yerel mutfak kültürü ve kahvaltı mekanları. Yerel yaşam hakkında bilgi.",
    internalLinks: ["Karasu yerel yaşam", "Karasu kültür"]
  },
  {
    title: "Karasu'da Pazar Sabahı Kahvaltı İçin En İyi Mekanlar",
    slug: "karasuda-pazar-sabahi-kahvalti-icin-en-iyi-mekanlar",
    type: 'blog',
    targetKeywords: ["karasu pazar kahvaltı", "karasu hafta sonu kahvaltı"],
    brief: "Karasu'da pazar sabahı kahvaltı için ideal mekanlar ve hafta sonu yaşamı.",
    internalLinks: ["Karasu hafta sonu aktiviteleri", "Karasu sosyal aktiviteler"]
  },
  {
    title: "Karasu'da Kahvaltı Mekanları ve Çevresindeki Emlak Fırsatları",
    slug: "karasuda-kahvalti-mekanlari-ve-cevresindeki-emlak-firsatlari",
    type: 'blog',
    targetKeywords: ["karasu kahvaltı yakını emlak", "karasu kahvaltı çevresi"],
    brief: "Karasu'da kahvaltı mekanları yakınındaki emlak fırsatları ve avantajları.",
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
  faq?: Array<{ question: string; answer: string }>;
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

  // Get related cornerstone articles for blog posts
  const relatedCornerstones = article.type === 'blog' 
    ? CORNERSTONE_ARTICLES.map(c => ({ title: c.title, slug: c.slug }))
    : [];

  const prompt = `Sen Karasu'da 15 yıldır hizmet veren profesyonel bir emlak danışmanısın. Aşağıdaki konuda ${wordCount}+ kelimelik, kapsamlı, profesyonel ve bilgilendirici bir ${article.type === 'cornerstone' ? 'CORNERSTONE' : 'BLOG'} makale yaz.

BAŞLIK: ${article.title}
HEDEF ANAHTAR KELİMELER: ${article.targetKeywords.join(', ')}
KONU: ${article.brief}

${karasuContext}

GEREKSİNİMLER:
1. Minimum ${wordCount} kelime${article.type === 'cornerstone' ? ' (tercihen 2000+)' : ''}
2. Tam yapılandırılmış (H2, H3 başlıklar)
3. Karasu Emlak ile mantıklı şekilde ilişkilendir (örnek: "Karasu'da ev alırken yakınınızdaki kahvaltı yerlerini de değerlendirin", "Kahvaltı mekanı yakınındaki emlak değerleri", "Yazlık alırken sosyal hayatı göz önünde bulundurun")
4. Yerel bilgiler ekle (Karasu, Kocaali, mahalle adları, gerçek detaylar)
5. SEO optimize (anahtar kelimeler doğal şekilde kullanılmalı)
6. Anti-AI ton: "Sonuç olarak", "Özetlemek gerekirse", "Bu makalede" gibi ifadeler KULLANMA
7. Doğal, konuşma tonu: "By the way", "Honestly", "Let's see" gibi geçişler kullan
8. İç linkler için şu metinleri kullan: ${article.internalLinks.join(', ')}${relatedCornerstones.length > 0 ? `\n9. İlgili cornerstone makalelere doğal şekilde referans ver ve link ekle: ${relatedCornerstones.map(c => c.title).join(', ')}` : ''}

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
  "keywords": ["anahtar", "kelime", "listesi"],
  "faq": [
    {"question": "Karasu'da kahvaltı yapılacak en iyi yerler nerede?", "answer": "Karasu'da kahvaltı için birçok seçenek bulunmaktadır..."},
    {"question": "Karasu sahilinde kahvaltı yapılacak yerler var mı?", "answer": "Evet, Karasu sahil şeridinde deniz manzaralı kahvaltı mekanları bulunmaktadır..."},
    {"question": "Karasu'da kahvaltı fiyatları ne kadar?", "answer": "Karasu'da kahvaltı fiyatları mekana göre değişmektedir..."},
    {"question": "Karasu'da aile ile gidilebilecek kahvaltı yerleri hangileri?", "answer": "Karasu'da aileler için uygun birçok kahvaltı mekanı bulunmaktadır..."},
    {"question": "Karasu'da kahvaltı yaparken emlak değerlerini nasıl değerlendirmeliyim?", "answer": "Karasu'da emlak alırken yakındaki kahvaltı mekanlarını da göz önünde bulundurmanız önemlidir..."}
  ]
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
        faq: parsed.faq || [],
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
  
  const response = completion.choices[0]?.message?.content || '{}';
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
    faq: parsed.faq || [],
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
      console.log(`   ⏭️  Zaten mevcut: ${generated.title}`);
      return;
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
      seo_score: article.type === 'cornerstone' ? 85 : 75, // High score for cornerstone
      discover_eligible: article.type === 'cornerstone',
      internal_links: [
        ...article.internalLinks.map(link => ({
          text: link,
          url: `/${createSlug(link)}`
        })),
        ...(article.type === 'blog' ? CORNERSTONE_ARTICLES.map(c => ({
          text: c.title,
          url: `/blog/${c.slug}`
        })) : [])
      ],
    };
    
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
    console.log(`   📊 SEO Skoru: ${articleData.seo_score}`);
    
    // Create FAQ entries if available
    if (generated.faq && generated.faq.length > 0) {
      try {
        for (const faqItem of generated.faq) {
          await supabase.from('ai_questions').insert({
            question: faqItem.question,
            answer: faqItem.answer,
            location_scope: 'karasu',
            page_type: 'blog',
            page_slug: slug,
            priority: 'medium',
            status: 'published',
            generated_by_ai: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).then(() => {
            console.log(`   ✅ FAQ eklendi: ${faqItem.question.substring(0, 50)}...`);
          }).catch((faqError: any) => {
            // FAQ is optional, continue
            console.warn(`   ⚠️  FAQ ekleme hatası (devam ediliyor):`, faqError.message);
          });
        }
      } catch (faqError) {
        console.warn('   ⚠️  FAQ oluşturma hatası (devam ediliyor):', faqError);
      }
    }
    
    // Log SEO event
    try {
      await supabase.from('seo_events').insert({
        event_type: 'content_generated',
        entity_type: 'article',
        entity_id: data.id,
        event_data: {
          type: article.type,
          title: generated.title,
          word_count: generated.content.split(/\s+/).length,
          keywords: article.targetKeywords,
          faq_count: generated.faq?.length || 0,
        },
        status: 'success',
      });
    } catch (seoError) {
      console.warn('   ⚠️  SEO event log hatası (devam ediliyor):', seoError);
    }
    
    // Generate and upload featured image
    if (hasCloudinary && openai) {
      try {
        await generateAndUploadImage(data.id, generated.title, slug);
      } catch (imageError: any) {
        console.warn('   ⚠️  Görsel oluşturma hatası (devam ediliyor):', imageError.message);
      }
    } else if (!hasCloudinary) {
      console.log('   ⏭️  Cloudinary config eksik - görsel atlandı');
    } else if (!openai) {
      console.log('   ⏭️  OpenAI API key eksik - görsel atlandı');
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error: any) {
    console.error(`   ❌ Hata:`, error.message);
    throw error;
  }
}

/**
 * Generate and upload featured image
 */
async function generateAndUploadImage(articleId: string, title: string, slug: string) {
  if (!openai || !hasCloudinary) {
    return;
  }

  try {
    console.log('   🖼️  Görsel oluşturuluyor...');
    
    const imagePrompt = `Professional real estate photography style image: Beautiful Turkish breakfast table in Karasu, Sakarya. Traditional Turkish breakfast spread with fresh bread, cheese, olives, tomatoes, honey, jam on a wooden table. Coastal setting with sea view in background, natural lighting, high quality, realistic, no text, no watermark`;

    // Try using API endpoint first
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/ai/generate-image`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'article',
          prompt: imagePrompt,
          context: {
            title,
            category: 'cornerstone',
            description: 'Karasu kahvaltı yerleri rehberi',
          },
          options: {
            size: '1792x1024',
            quality: 'hd',
            style: 'natural',
          },
          upload: {
            folder: 'articles',
            entityType: 'article',
            entityId: articleId,
            alt: title,
            tags: ['cornerstone', 'karasu', 'kahvalti', 'ai-generated'],
          },
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.public_id) {
          await supabase
            .from('articles')
            .update({ featured_image: result.public_id })
            .eq('id', articleId);
          
          console.log(`   ✅ Görsel oluşturuldu ve yüklendi: ${result.public_id}`);
          return;
        }
      }
    } catch (apiError) {
      console.log('   → API endpoint başarısız, direkt oluşturma deneniyor...');
    }

    // Fallback: Direct generation
    const generated = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      size: '1792x1024',
      quality: 'hd',
      style: 'natural',
      n: 1,
    });

    if (!generated.data || generated.data.length === 0 || !generated.data[0].url) {
      throw new Error('Image generation failed');
    }

    const imageUrl = generated.data[0].url;
    console.log('   → Cloudinary\'ye yükleniyor...');

    // Download and upload to Cloudinary
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const dataUri = `data:image/png;base64,${imageBase64}`;

    const uploaded = await cloudinary.uploader.upload(dataUri, {
      public_id: `articles/${slug}`,
      folder: 'articles',
      tags: ['cornerstone', 'karasu', 'kahvalti', 'ai-generated'],
      overwrite: true,
    });

    await supabase
      .from('articles')
      .update({ featured_image: uploaded.public_id })
      .eq('id', articleId);

    console.log(`   ✅ Görsel yüklendi: ${uploaded.public_id}`);
  } catch (error: any) {
    console.warn('   ⚠️  Görsel oluşturma/yükleme başarısız:', error instanceof Error ? error.message : 'Unknown error');
    console.log('   → Placeholder görsel kullanılıyor...');
    
    // Fallback: Use placeholder
    const placeholderUrl = `https://placehold.co/1792x1024/006AFF/FFFFFF?text=${encodeURIComponent(title.substring(0, 40).replace(/[^\w\s]/g, ''))}`;
    
    try {
      const uploaded = await cloudinary.uploader.upload(placeholderUrl, {
        public_id: `articles/${slug}`,
        folder: 'articles',
        tags: ['placeholder', 'karasu', 'kahvalti'],
        overwrite: true,
      });

      await supabase
        .from('articles')
        .update({ featured_image: uploaded.public_id })
        .eq('id', articleId);
      
      console.log(`   ✅ Placeholder yüklendi: ${uploaded.public_id}`);
    } catch (placeholderError) {
      console.error('   ❌ Placeholder yükleme de başarısız');
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 Karasu Kahvaltı Yerleri İçerikleri Oluşturuluyor...\n");
  
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
