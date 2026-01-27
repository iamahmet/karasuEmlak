#!/usr/bin/env tsx

/**
 * Generate Sapanca Content Cluster
 * 
 * Creates 10 cornerstone articles + 20 blog posts for Sapanca
 * All content includes internal linking, SEO metadata, FAQ, and schema
 * 
 * Usage:
 *   pnpm tsx scripts/content/generate-sapanca-cluster.ts
 *   pnpm tsx scripts/content/generate-sapanca-cluster.ts --dry-run
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
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!");
  process.exit(1);
}

if (!geminiApiKey && !openaiApiKey) {
  console.error("❌ GEMINI_API_KEY veya OPENAI_API_KEY gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

const DRY_RUN = process.argv.includes('--dry-run');

interface ArticlePlan {
  title: string;
  slug: string;
  type: 'cornerstone' | 'blog';
  targetKeywords: string[];
  brief: string;
  internalLinks: string[];
  relatedRegions?: string[];
}

// 10 Cornerstone Articles
const CORNERSTONE_ARTICLES: ArticlePlan[] = [
  {
    title: "Sapanca'da Emlak Rehberi: 2025 Kapsamlı Satın Alma Kılavuzu",
    slug: "sapanca-emlak-rehberi-2025-kapsamli-satin-alma-kilavuzu",
    type: 'cornerstone',
    targetKeywords: ["sapanca emlak", "sapanca satılık", "sapanca ev almak", "sapanca emlak rehberi"],
    brief: "Sapanca'da emlak alırken bilmeniz gereken her şey. Bölgeler, fiyatlar, yatırım potansiyeli ve satın alma süreci.",
    internalLinks: ["Sapanca bungalov", "Sapanca satılık daire", "Sapanca yazlık", "Karasu emlak"],
    relatedRegions: ["Karasu", "Kocaali"],
  },
  {
    title: "Sapanca Bungalov Rehberi: Satın Alma, Kiralama ve Yatırım",
    slug: "sapanca-bungalov-rehberi-satin-alma-kiralama-ve-yatirim",
    type: 'cornerstone',
    targetKeywords: ["sapanca bungalov", "sapanca bungalov satılık", "sapanca bungalov kiralık", "sapanca bungalov fiyatları"],
    brief: "Sapanca'da bungalov almak, kiralamak veya yatırım yapmak isteyenler için kapsamlı rehber.",
    internalLinks: ["Sapanca satılık", "Sapanca günlük kiralık", "Sapanca yazlık"],
    relatedRegions: ["Karasu"],
  },
  {
    title: "Sapanca Satılık Daire Fiyatları ve Bölge Analizi 2025",
    slug: "sapanca-satilik-daire-fiyatlari-ve-bolge-analizi-2025",
    type: 'cornerstone',
    targetKeywords: ["sapanca satılık daire", "sapanca daire fiyatları", "sapanca daire", "sapanca satılık"],
    brief: "Sapanca'da satılık daire fiyatları, bölge analizi ve yatırım potansiyeli.",
    internalLinks: ["Sapanca emlak", "Sapanca bungalov", "Karasu satılık daire"],
    relatedRegions: ["Karasu", "Kocaali"],
  },
  {
    title: "Sapanca Yazlık Ev Rehberi: Satın Alma ve Yatırım Kılavuzu",
    slug: "sapanca-yazlik-ev-rehberi-satin-alma-ve-yatirim-kilavuzu",
    type: 'cornerstone',
    targetKeywords: ["sapanca yazlık", "sapanca satılık yazlık", "sapanca yazlık ev", "sapanca yazlık fiyatları"],
    brief: "Sapanca'da yazlık ev almak isteyenler için bölge rehberi, fiyat analizi ve yatırım önerileri.",
    internalLinks: ["Sapanca bungalov", "Sapanca satılık", "Karasu yazlık"],
    relatedRegions: ["Karasu"],
  },
  {
    title: "Sapanca Günlük Kiralık Evler: Tatil ve Konaklama Rehberi",
    slug: "sapanca-gunluk-kiralik-evler-tatil-ve-konaklama-rehberi",
    type: 'cornerstone',
    targetKeywords: ["sapanca günlük kiralık", "sapanca kiralık ev", "sapanca tatil evi", "sapanca konaklama"],
    brief: "Sapanca'da günlük kiralık evler, tatil konaklama seçenekleri ve bölge aktiviteleri.",
    internalLinks: ["Sapanca bungalov", "Sapanca yazlık", "Karasu kiralık"],
    relatedRegions: ["Karasu"],
  },
  {
    title: "Sapanca Gölü Çevresi Emlak: Satın Alma ve Yatırım Rehberi",
    slug: "sapanca-golu-cevresi-emlak-satin-alma-ve-yatirim-rehberi",
    type: 'cornerstone',
    targetKeywords: ["sapanca gölü emlak", "sapanca gölü satılık", "sapanca gölü ev", "sapanca gölü yazlık"],
    brief: "Sapanca Gölü çevresindeki emlak fırsatları, fiyat analizi ve yatırım potansiyeli.",
    internalLinks: ["Sapanca emlak", "Sapanca yazlık", "Sapanca bungalov"],
    relatedRegions: ["Karasu"],
  },
  {
    title: "Sapanca'da Yatırım Yapılacak Bölgeler: Emlak Analizi",
    slug: "sapancada-yatirim-yapilacak-bolgeler-emlak-analizi",
    type: 'cornerstone',
    targetKeywords: ["sapanca yatırım", "sapanca emlak yatırım", "sapanca yatırım bölgeleri", "sapanca emlak analizi"],
    brief: "Sapanca'da yatırım yapılacak en iyi bölgeler, fiyat trendleri ve gelecek potansiyeli.",
    internalLinks: ["Sapanca emlak", "Sapanca satılık", "Karasu yatırım"],
    relatedRegions: ["Karasu", "Kocaali"],
  },
  {
    title: "Sapanca Satılık Villa: Fiyatlar, Bölgeler ve Yatırım Rehberi",
    slug: "sapanca-satilik-villa-fiyatlar-bolgeler-ve-yatirim-rehberi",
    type: 'cornerstone',
    targetKeywords: ["sapanca satılık villa", "sapanca villa", "sapanca villa fiyatları", "sapanca villa satılık"],
    brief: "Sapanca'da satılık villa seçenekleri, fiyat aralıkları ve yatırım değerlendirmesi.",
    internalLinks: ["Sapanca emlak", "Sapanca bungalov", "Karasu villa"],
    relatedRegions: ["Karasu"],
  },
  {
    title: "Sapanca'da Yaşam: Emlak Alırken Bilmeniz Gerekenler",
    slug: "sapancada-yasam-emlak-alirken-bilmeniz-gerekenler",
    type: 'cornerstone',
    targetKeywords: ["sapanca yaşam", "sapanca'da yaşamak", "sapanca emlak", "sapanca yerel yaşam"],
    brief: "Sapanca'da yaşam hakkında bilmeniz gerekenler. Emlak alırken dikkat edilmesi gerekenler.",
    internalLinks: ["Sapanca emlak", "Sapanca yazlık", "Karasu yaşam"],
    relatedRegions: ["Karasu", "Kocaali"],
  },
  {
    title: "Sapanca Emlak Piyasası: 2025 Trend Analizi ve Gelecek Öngörüleri",
    slug: "sapanca-emlak-piyasasi-2025-trend-analizi-ve-gelecek-ongoruleri",
    type: 'cornerstone',
    targetKeywords: ["sapanca emlak piyasası", "sapanca emlak trend", "sapanca emlak analiz", "sapanca emlak 2025"],
    brief: "Sapanca emlak piyasasının 2025 trend analizi, fiyat hareketleri ve gelecek öngörüleri.",
    internalLinks: ["Sapanca emlak", "Sapanca satılık", "Karasu emlak piyasası"],
    relatedRegions: ["Karasu", "Kocaali"],
  },
];

// 20 Blog Posts
const BLOG_POSTS: ArticlePlan[] = [
  {
    title: "Sapanca'da Kış Aylarında Emlak Almanın Avantajları",
    slug: "sapancada-kis-aylarinda-emlak-almanin-avantajlari",
    type: 'blog',
    targetKeywords: ["sapanca kış emlak", "sapanca kış satılık", "sapanca emlak kış"],
    brief: "Sapanca'da kış aylarında emlak almanın avantajları ve fırsatlar.",
    internalLinks: ["Sapanca emlak", "Sapanca satılık"],
  },
  {
    title: "Sapanca Gölü Manzaralı Evler: Fiyatlar ve Özellikler",
    slug: "sapanca-golu-manzarali-evler-fiyatlar-ve-ozellikler",
    type: 'blog',
    targetKeywords: ["sapanca gölü manzara", "sapanca gölü ev", "sapanca manzaralı ev"],
    brief: "Sapanca Gölü manzaralı evlerin fiyatları, özellikleri ve yatırım değeri.",
    internalLinks: ["Sapanca emlak", "Sapanca gölü emlak"],
  },
  {
    title: "Sapanca'da Emlak Alırken Dikkat Edilmesi Gerekenler",
    slug: "sapancada-emlak-alirken-dikkat-edilmesi-gerekenler",
    type: 'blog',
    targetKeywords: ["sapanca emlak almak", "sapanca emlak dikkat", "sapanca ev almak"],
    brief: "Sapanca'da emlak alırken dikkat edilmesi gereken önemli noktalar.",
    internalLinks: ["Sapanca emlak rehberi", "Sapanca satılık"],
  },
  {
    title: "Sapanca Bungalov vs Yazlık: Hangisini Seçmelisiniz?",
    slug: "sapanca-bungalov-vs-yazlik-hangisini-secmelisiniz",
    type: 'blog',
    targetKeywords: ["sapanca bungalov", "sapanca yazlık", "sapanca bungalov yazlık"],
    brief: "Sapanca'da bungalov ve yazlık arasındaki farklar ve hangisini seçmelisiniz.",
    internalLinks: ["Sapanca bungalov", "Sapanca yazlık"],
  },
  {
    title: "Sapanca'da Emlak Komisyonu ve Masraflar Rehberi",
    slug: "sapancada-emlak-komisyonu-ve-masraflar-rehberi",
    type: 'blog',
    targetKeywords: ["sapanca emlak komisyon", "sapanca emlak masraflar", "sapanca emlak ücret"],
    brief: "Sapanca'da emlak alırken ödenecek komisyon ve masraflar hakkında bilgi.",
    internalLinks: ["Sapanca emlak", "Sapanca satılık"],
  },
  {
    title: "Sapanca'da Yatırım Yapmak İçin En İyi 5 Bölge",
    slug: "sapancada-yatirim-yapmak-icin-en-iyi-5-bolge",
    type: 'blog',
    targetKeywords: ["sapanca yatırım bölgeleri", "sapanca yatırım", "sapanca emlak yatırım"],
    brief: "Sapanca'da yatırım yapmak için en iyi 5 bölge ve özellikleri.",
    internalLinks: ["Sapanca yatırım", "Sapanca emlak"],
  },
  {
    title: "Sapanca Günlük Kiralık Ev Fiyatları 2025",
    slug: "sapanca-gunluk-kiralik-ev-fiyatlari-2025",
    type: 'blog',
    targetKeywords: ["sapanca günlük kiralık fiyat", "sapanca kiralık ev fiyat", "sapanca tatil evi fiyat"],
    brief: "Sapanca'da günlük kiralık ev fiyatları ve sezonluk değişimler.",
    internalLinks: ["Sapanca günlük kiralık", "Sapanca kiralık"],
  },
  {
    title: "Sapanca'da Emlak Kredisi: Şartlar ve Başvuru Süreci",
    slug: "sapancada-emlak-kredisi-sartlar-ve-basvuru-sureci",
    type: 'blog',
    targetKeywords: ["sapanca emlak kredisi", "sapanca ev kredisi", "sapanca kredi"],
    brief: "Sapanca'da emlak kredisi şartları ve başvuru süreci hakkında bilgi.",
    internalLinks: ["Sapanca emlak", "Sapanca satılık"],
  },
  {
    title: "Sapanca Satılık Arsa: Fiyatlar ve Yatırım Potansiyeli",
    slug: "sapanca-satilik-arsa-fiyatlar-ve-yatirim-potansiyeli",
    type: 'blog',
    targetKeywords: ["sapanca satılık arsa", "sapanca arsa", "sapanca arsa fiyat"],
    brief: "Sapanca'da satılık arsa fiyatları ve yatırım potansiyeli.",
    internalLinks: ["Sapanca emlak", "Sapanca satılık"],
  },
  {
    title: "Sapanca'da Emlak Alırken Yasal Süreçler",
    slug: "sapancada-emlak-alirken-yasal-surecler",
    type: 'blog',
    targetKeywords: ["sapanca emlak yasal", "sapanca emlak süreç", "sapanca ev almak yasal"],
    brief: "Sapanca'da emlak alırken yasal süreçler ve dikkat edilmesi gerekenler.",
    internalLinks: ["Sapanca emlak", "Sapanca satılık"],
  },
  {
    title: "Sapanca Gölü Çevresinde Emlak Fırsatları",
    slug: "sapanca-golu-cevresinde-emlak-firsatlari",
    type: 'blog',
    targetKeywords: ["sapanca gölü emlak", "sapanca gölü satılık", "sapanca gölü ev"],
    brief: "Sapanca Gölü çevresindeki emlak fırsatları ve özellikleri.",
    internalLinks: ["Sapanca gölü emlak", "Sapanca emlak"],
  },
  {
    title: "Sapanca'da Yazlık Ev Kiralama Rehberi",
    slug: "sapancada-yazlik-ev-kiralama-rehberi",
    type: 'blog',
    targetKeywords: ["sapanca yazlık kiralık", "sapanca yazlık kiralama", "sapanca kiralık yazlık"],
    brief: "Sapanca'da yazlık ev kiralama rehberi ve öneriler.",
    internalLinks: ["Sapanca yazlık", "Sapanca kiralık"],
  },
  {
    title: "Sapanca Emlak Piyasasında Son Dönem Trendler",
    slug: "sapanca-emlak-piyasasinda-son-donem-trendler",
    type: 'blog',
    targetKeywords: ["sapanca emlak trend", "sapanca emlak piyasası", "sapanca emlak haber"],
    brief: "Sapanca emlak piyasasında son dönem trendler ve gelişmeler.",
    internalLinks: ["Sapanca emlak", "Sapanca emlak piyasası"],
  },
  {
    title: "Sapanca'da Emlak Yatırımı: Karlılık Analizi",
    slug: "sapancada-emlak-yatirimi-karlilik-analizi",
    type: 'blog',
    targetKeywords: ["sapanca emlak yatırım", "sapanca yatırım karlılık", "sapanca emlak karlı"],
    brief: "Sapanca'da emlak yatırımının karlılık analizi ve değerlendirmesi.",
    internalLinks: ["Sapanca yatırım", "Sapanca emlak"],
  },
  {
    title: "Sapanca Bungalov Kiralama: Fiyatlar ve Öneriler",
    slug: "sapanca-bungalov-kiralama-fiyatlar-ve-oneriler",
    type: 'blog',
    targetKeywords: ["sapanca bungalov kiralık", "sapanca bungalov kiralama", "sapanca kiralık bungalov"],
    brief: "Sapanca'da bungalov kiralama fiyatları ve öneriler.",
    internalLinks: ["Sapanca bungalov", "Sapanca kiralık"],
  },
  {
    title: "Sapanca'da Emlak Alırken Tapu Kontrolü",
    slug: "sapancada-emlak-alirken-tapu-kontrolu",
    type: 'blog',
    targetKeywords: ["sapanca emlak tapu", "sapanca tapu kontrol", "sapanca ev tapu"],
    brief: "Sapanca'da emlak alırken tapu kontrolü ve dikkat edilmesi gerekenler.",
    internalLinks: ["Sapanca emlak", "Sapanca satılık"],
  },
  {
    title: "Sapanca Gölü Manzaralı Yazlık Evler",
    slug: "sapanca-golu-manzarali-yazlik-evler",
    type: 'blog',
    targetKeywords: ["sapanca gölü yazlık", "sapanca gölü manzara yazlık", "sapanca yazlık göl"],
    brief: "Sapanca Gölü manzaralı yazlık evler ve özellikleri.",
    internalLinks: ["Sapanca yazlık", "Sapanca gölü emlak"],
  },
  {
    title: "Sapanca'da Emlak Alırken Ekspertiz Raporu",
    slug: "sapancada-emlak-alirken-ekspertiz-raporu",
    type: 'blog',
    targetKeywords: ["sapanca emlak ekspertiz", "sapanca ekspertiz", "sapanca ev ekspertiz"],
    brief: "Sapanca'da emlak alırken ekspertiz raporu ve önemi.",
    internalLinks: ["Sapanca emlak", "Sapanca satılık"],
  },
  {
    title: "Sapanca Satılık Daire Seçerken Dikkat Edilmesi Gerekenler",
    slug: "sapanca-satilik-daire-secerken-dikkat-edilmesi-gerekenler",
    type: 'blog',
    targetKeywords: ["sapanca satılık daire", "sapanca daire seçimi", "sapanca daire"],
    brief: "Sapanca'da satılık daire seçerken dikkat edilmesi gereken önemli noktalar.",
    internalLinks: ["Sapanca satılık daire", "Sapanca emlak"],
  },
  {
    title: "Sapanca'da Emlak Alırken Noter İşlemleri",
    slug: "sapancada-emlak-alirken-noter-islemleri",
    type: 'blog',
    targetKeywords: ["sapanca emlak noter", "sapanca noter işlem", "sapanca ev noter"],
    brief: "Sapanca'da emlak alırken noter işlemleri ve süreçleri.",
    internalLinks: ["Sapanca emlak", "Sapanca satılık"],
  },
];

/**
 * Generate article content using AI
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
  
  const sapancaContext = `
SAPANCA EMLAK İÇERİK BAĞLAMI:
- Bölge: Sapanca, Karasu, Kocaali, Sakarya
- Site: KarasuEmlak.net - Sapanca ve çevresinin güvenilir emlak platformu
- Uzmanlık: Yerel emlak piyasası, bölge analizleri, yatırım rehberleri
- Hedef Kitle: Emlak alıcıları, yatırımcılar, bölge hakkında bilgi arayanlar
- Ton: Yerel uzman, güvenilir, bilgilendirici, doğal (AI gibi değil)
- İlişkili Bölgeler: ${article.relatedRegions?.join(', ') || 'Karasu, Kocaali'}
`;

  const relatedCornerstones = article.type === 'blog' 
    ? CORNERSTONE_ARTICLES.map(c => ({ title: c.title, slug: c.slug }))
    : [];

  const prompt = `Sen Sapanca'da 15 yıldır hizmet veren profesyonel bir emlak danışmanısın. Aşağıdaki konuda ${wordCount}+ kelimelik, kapsamlı, profesyonel ve bilgilendirici bir ${article.type === 'cornerstone' ? 'CORNERSTONE' : 'BLOG'} makale yaz.

BAŞLIK: ${article.title}
HEDEF ANAHTAR KELİMELER: ${article.targetKeywords.join(', ')}
KONU: ${article.brief}

${sapancaContext}

GEREKSİNİMLER:
1. Minimum ${wordCount} kelime${article.type === 'cornerstone' ? ' (tercihen 2000+)' : ''}
2. Tam yapılandırılmış (H2, H3 başlıklar)
3. Sapanca Emlak ile mantıklı şekilde ilişkilendir
4. Yerel bilgiler ekle (Sapanca, Karasu, Kocaali, mahalle adları, gerçek detaylar)
5. SEO optimize (anahtar kelimeler doğal şekilde kullanılmalı)
6. Anti-AI ton: "Sonuç olarak", "Özetlemek gerekirse" gibi ifadeler KULLANMA
7. Doğal, konuşma tonu: "By the way", "Honestly", "Let's see" gibi geçişler kullan
8. İç linkler için şu metinleri kullan: ${article.internalLinks.join(', ')}${relatedCornerstones.length > 0 ? `\n9. İlgili cornerstone makalelere doğal şekilde referans ver ve link ekle: ${relatedCornerstones.map(c => c.title).join(', ')}` : ''}

JSON formatında döndür (sadece JSON, başka açıklama yapma):
{
  "title": "makale başlığı",
  "excerpt": "150-200 kelimelik özet",
  "content": "tam içerik (HTML formatında, H2/H3 başlıklar dahil, <p>, <ul>, <li> kullan)",
  "meta_description": "150-160 karakter SEO açıklaması",
  "keywords": ["anahtar", "kelime", "listesi"],
  "faq": [
    {"question": "Sapanca'da emlak alırken dikkat edilmesi gerekenler nelerdir?", "answer": "Sapanca'da emlak alırken..."},
    {"question": "Sapanca bungalov fiyatları ne kadar?", "answer": "Sapanca'da bungalov fiyatları..."},
    {"question": "Sapanca'da yatırım yapmak karlı mı?", "answer": "Sapanca'da emlak yatırımı..."}
  ]
}`;

  // Try Gemini first
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
        console.warn(`   ⚠️  Gemini ${modelName} failed, trying next...`);
        if (modelName === modelsToTry[modelsToTry.length - 1]) {
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
  
  const completion = await openai.chat.completions.create({
    model: article.type === 'cornerstone' ? 'gpt-4o' : 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Sen Sapanca\'da 15 yıldır hizmet veren profesyonel bir emlak danışmanısın. Profesyonel, objektif ve bilgilendirici içerik üretiyorsun.' },
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
    console.log('   🤖 AI içerik üretiliyor...');
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
      category: article.type === 'cornerstone' ? 'Cornerstone' : 'Blog',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      views: 0,
      seo_score: article.type === 'cornerstone' ? 85 : 75,
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
    
    // Create FAQ entries if available
    if (generated.faq && generated.faq.length > 0) {
      try {
        for (const faqItem of generated.faq) {
          await supabase.from('ai_questions').insert({
            question: faqItem.question,
            answer: faqItem.answer,
            location_scope: 'sapanca',
            page_type: 'blog',
            page_slug: slug,
            priority: 'medium',
            status: 'published',
            generated_by_ai: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).catch(() => {}); // FAQ is optional
        }
        console.log(`   ✅ ${generated.faq.length} FAQ eklendi`);
      } catch (faqError) {
        // FAQ is optional, continue
      }
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
  console.log("🚀 Sapanca İçerik Kümesi Oluşturuluyor...\n");
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No content will be created\n');
    console.log('Cornerstone Articles:');
    CORNERSTONE_ARTICLES.forEach((a, i) => console.log(`  ${i + 1}. ${a.title}`));
    console.log('\nBlog Posts:');
    BLOG_POSTS.forEach((a, i) => console.log(`  ${i + 1}. ${a.title}`));
    process.exit(0);
  }
  
  let cornerstoneCreated = 0;
  let cornerstoneErrors = 0;
  let blogCreated = 0;
  let blogErrors = 0;
  
  // Create cornerstone articles
  console.log(`📚 Cornerstone Makaleler (${CORNERSTONE_ARTICLES.length} adet)...\n`);
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
  console.log(`\n📝 Blog Yazıları (${BLOG_POSTS.length} adet)...\n`);
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
