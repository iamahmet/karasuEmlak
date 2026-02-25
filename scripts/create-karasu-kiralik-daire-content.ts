/**
 * Create 5 Rehber Articles + 5 Blog Posts for "Karasu Kiralık Daire"
 *
 * Rehber Articles (2000+ words, category: Rehber):
 * 1. Karasu Kiralık Daire Rehberi: Fiyatlar ve Arama Rehberi 2026
 * 2. Karasu Kiralık Daire Fiyatları: Mahalle Bazlı Detaylı Analiz
 * 3. Karasu Kiralık Daire Sözleşme Rehberi: Kiracı ve Ev Sahibi İçin İpuçları
 * 4. Karasu Yaz-Kış Kiralık Daire Farkları: Mevsimsel Fiyat Rehberi
 * 5. Karasu Kiralık Daire: Denize Yakın vs Merkez Konum Karşılaştırması
 *
 * Blog Posts (1000 words, category: Rehber):
 * 1. Karasu'da 2026 Yılı Kiralık Daire Piyasa Trendleri
 * 2. Karasu Sahilinde Kiralık Daire Fırsatları
 * 3. Karasu'da Eşyalı Kiralık Daire Seçenekleri
 * 4. Karasu Kiralık Daire Depozito ve Kira Sözleşmesi Rehberi
 * 5. Karasu'da Yazlık Kiralık Daire Nasıl Bulunur?
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), 'apps/admin/.env.local') });
dotenv.config({ path: resolve(process.cwd(), 'apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

if (!openaiKey && !geminiKey) {
  throw new Error('Missing OPENAI_API_KEY or GEMINI_API_KEY in .env.local');
}

const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const mainKeyword = 'karasu kiralık daire';

const rehberArticles = [
  {
    title: 'Karasu Kiralık Daire Rehberi: Fiyatlar ve Arama Rehberi 2026',
    topic: 'Karasu kiralık daire fiyatları ve arama rehberi 2026',
    targetKeywords: ['karasu kiralık daire', 'karasu kiralık daire fiyatları', 'karasu kiralık', 'karasu yaz kış kiralık'],
    template: 'market-analysis',
    brief: "Karasu'da kiralık daire arayanlar için kapsamlı rehber. 2026 güncel kira fiyatları, mahalle analizi, yaz-kış kiralık farkları, sözleşme ipuçları ve arama stratejileri.",
    mustAnswerQuestions: [
      'Karasu kiralık daire fiyatları ne kadar?',
      "Karasu'da yazlık kiralık nasıl bulunur?",
      'Kiralık sözleşmesinde nelere dikkat edilmeli?',
    ],
    microAnswerBlocks: ['Kiralık fiyat aralıkları (mevsimsel).', 'Kiralık arama kontrol listesi.', 'Sözleşme maddeleri özeti.'],
  },
  {
    title: "Karasu Kiralık Daire Fiyatları: Mahalle Bazlı Detaylı Analiz",
    topic: 'Karasu kiralık daire fiyatları mahalle bazlı analiz 2026',
    targetKeywords: ['karasu kiralık daire fiyatları', 'karasu mahalle kiralık', 'karasu sahil kiralık daire', 'karasu merkez kiralık'],
    template: 'market-analysis',
    brief: "Karasu'nun mahallelerine göre kiralık daire fiyat analizi. Merkez, Sahil, Yalı, Liman, Aziziye ve diğer mahallelerde kira aralıkları, denize yakınlık etkisi.",
    mustAnswerQuestions: ['Hangi mahallelerde kiralık daire var?', 'Sahil mahallelerinde kira ne kadar?', 'Merkez vs sahil fiyat farkı nedir?'],
    microAnswerBlocks: ['Mahalle bazlı kira aralıkları tablosu.', 'Denize yakınlık ve fiyat ilişkisi.'],
  },
  {
    title: 'Karasu Kiralık Daire Sözleşme Rehberi: Kiracı ve Ev Sahibi İçin İpuçları',
    topic: 'Karasu kiralık daire sözleşme rehberi kiracı ev sahibi',
    targetKeywords: ['karasu kiralık sözleşmesi', 'karasu kira sözleşmesi', 'kiralık daire sözleşme maddeleri', 'karasu kiralık daire'],
    template: 'blog',
    brief: "Karasu'da kiralık daire sözleşmesinde olması gereken maddeler, depozito kuralları, kira artış oranları, kiracı ve ev sahibi hakları.",
    mustAnswerQuestions: ['Sözleşmede neler olmalı?', 'Depozito nasıl belirlenir?', 'Kira artış oranı ne olmalı?'],
    microAnswerBlocks: ['Sözleşmede olması gereken 5 temel madde.', 'Depozito ve kira artışı özeti.'],
  },
  {
    title: 'Karasu Yaz-Kış Kiralık Daire Farkları: Mevsimsel Fiyat Rehberi',
    topic: 'Karasu yaz kış kiralık daire farkları mevsimsel fiyatlar',
    targetKeywords: ['karasu yaz kış kiralık', 'karasu yazlık kiralık', 'karasu kış kiralık', 'karasu kiralık daire'],
    template: 'market-analysis',
    brief: "Karasu'da yaz ve kış döneminde kiralık daire fiyat farkları. Yazlık kiralama vs sürekli oturum, mevsimsel talep ve fiyat trendleri.",
    mustAnswerQuestions: ['Yazlık kiralık ne kadar?', 'Kış fiyatları ne kadar?', 'Yaz-kış farkı neden oluşur?'],
    microAnswerBlocks: ['Yaz vs kış kira karşılaştırma tablosu.', 'Mevsimsel talep etkisi.'],
  },
  {
    title: 'Karasu Kiralık Daire: Denize Yakın vs Merkez Konum Karşılaştırması',
    topic: 'Karasu kiralık daire denize yakın merkez konum karşılaştırma',
    targetKeywords: ['karasu denize yakın kiralık daire', 'karasu merkez kiralık daire', 'karasu kiralık daire konum', 'karasu kiralık'],
    template: 'blog',
    brief: "Karasu'da kiralık daire ararken denize yakın konumlar ile merkez konumların karşılaştırması. Avantajlar, fiyat farkları, kimler için uygun.",
    mustAnswerQuestions: ['Denize yakın kiralık avantajları neler?', 'Merkez daha mı uygun?', 'Hangi konum kim için uygun?'],
    microAnswerBlocks: ['Konum karşılaştırma tablosu.', 'Fiyat farkı özeti.'],
  },
];

const blogPosts = [
  {
    title: "Karasu'da 2026 Yılı Kiralık Daire Piyasa Trendleri",
    topic: 'Karasu 2026 kiralık daire piyasa trendleri',
    targetKeywords: ['karasu kiralık daire 2026', 'karasu kira trendleri', 'karasu kiralık piyasa'],
    template: 'market-analysis',
    brief: "Karasu'da 2026 yılı kiralık daire piyasasının güncel trendleri, fiyat değişimleri, talep analizi ve gelecek öngörüleri.",
  },
  {
    title: 'Karasu Sahilinde Kiralık Daire Fırsatları',
    topic: 'Karasu sahilinde kiralık daire fırsatları',
    targetKeywords: ['karasu sahil kiralık daire', 'karasu denize yakın kiralık', 'karasu sahil emlak kiralık'],
    template: 'blog',
    brief: "Karasu sahilinde kiralık daire fırsatları, denize yakın mahalleler, yazlık kiralama potansiyeli ve fiyat aralıkları.",
  },
  {
    title: "Karasu'da Eşyalı Kiralık Daire Seçenekleri",
    topic: 'Karasu eşyalı kiralık daire seçenekleri',
    targetKeywords: ['karasu eşyalı kiralık daire', 'karasu eşyasız kiralık', 'karasu kiralık daire eşyalı'],
    template: 'blog',
    brief: "Karasu'da eşyalı ve eşyasız kiralık daire seçenekleri, fiyat farkları, avantajları ve kimler için uygun.",
  },
  {
    title: 'Karasu Kiralık Daire Depozito ve Kira Sözleşmesi Rehberi',
    topic: 'Karasu kiralık daire depozito kira sözleşmesi',
    targetKeywords: ['karasu kiralık depozito', 'karasu kira sözleşmesi', 'karasu kiralık daire sözleşme'],
    template: 'blog',
    brief: "Karasu'da kiralık daire kiralamada depozito tutarları, kira sözleşmesi maddeleri, yasal haklar ve dikkat edilmesi gerekenler.",
  },
  {
    title: "Karasu'da Yazlık Kiralık Daire Nasıl Bulunur?",
    topic: 'Karasu yazlık kiralık daire nasıl bulunur',
    targetKeywords: ['karasu yazlık kiralık', 'karasu yazlık daire kiralama', 'karasu kiralık daire yaz'],
    template: 'blog',
    brief: "Karasu'da yazlık kiralık daire arama stratejileri, en iyi mahalleler, rezervasyon zamanlaması ve fiyat ipuçları.",
  },
];

async function generateArticleDirect(
  article: (typeof rehberArticles)[0] | (typeof blogPosts)[0],
  type: 'rehber' | 'normal'
): Promise<void> {
  console.log(`\n📝 Generating ${type === 'rehber' ? 'REHBER' : 'BLOG'}: "${article.title}"`);

  try {
    const wordCount = type === 'rehber' ? 2500 : 1200;
    const mustAnswer = 'mustAnswerQuestions' in article ? (article as { mustAnswerQuestions?: string[] }).mustAnswerQuestions : [];
    const microBlocks = 'microAnswerBlocks' in article ? (article as { microAnswerBlocks?: string[] }).microAnswerBlocks : [];

    const prompt = `Sen KarasuEmlak.net için senior SEO stratejisti + emlak piyasası yazarısın. Odak: intent + UX + topical authority. Keyword stuffing YOK.

GÖREV: Aşağıdaki plana göre ${wordCount}+ kelimelik ${type === 'rehber' ? 'REHBER (CORNERSTONE)' : 'BLOG'} makale yaz.

BAŞLIK (H1): ${article.title}
PRIMARY KEYWORD: ${mainKeyword}
SECONDARY KEYWORDS: ${article.targetKeywords.join(', ')}
Brief: ${article.brief}
BÖLGE: Karasu
${mustAnswer.length ? `MUTLAKA CEVAPLA: ${mustAnswer.join('; ')}` : ''}
${microBlocks.length ? `MİKRO CEVAP BLOKLARI EKLE: ${microBlocks.join('; ')}` : ''}

İÇ LİNKLER (HTML olarak ekle, doğal cümlelerde):
<a href="/karasu-kiralik-daire">Karasu Kiralık Daire</a>
<a href="/karasu-satilik-daire">Karasu Satılık Daire</a>
<a href="/blog/karasu-kira-getirisi-hesaplama-yatirim-rehberi-2026">Karasu Kira Getirisi</a>

KURALLAR:
- Türkçe, doğal, insan gibi yaz. "Sonuç olarak", "Özetlemek gerekirse" KULLANMA. Doğal geçişler: "Bu arada", "Dürüst olalım", "Bakalım".
- Fiyat/verim için aralık ver; "piyasa koşullarına göre değişir" ekle.
- HTML: <p>, <h2>, <h3>, <ul>, <li>, <table> kullan.
- 2-4 "Kısa Cevap:" bloğu ekle (snippet/AI Overviews için).
- FAQ bölümü: "Sık Sorulan Sorular" başlığı altında 5-7 soru-cevap.
- Trust signals: Checklistler ("İlan bakarken şu 7 şeyi kontrol edin"), yaygın hatalar ("En sık yapılan 5 hata").
- Karasu mahalleleri: Merkez, Sahil, Yalı, Liman, Aziziye, İnköy, Cumhuriyet.
- Gerçekçi kira aralıkları (2026): 1+1: 3.000-6.000 TL, 2+1: 4.000-9.000 TL, 3+1: 6.000-12.000 TL
- Tablolar: <table> veya markdown | A | B | formatı.
- "Sonuç", "Özet" başlığı KULLANMA; doğal bitir.

JSON formatında döndür (sadece JSON):
{
  "title": "SEO başlığı (55-60 karakter)",
  "content": "HTML içerik (tam makale)",
  "excerpt": "150-200 kelime özet",
  "meta_description": "145-160 karakter",
  "seo_keywords": "virgülle ayrılmış anahtar kelimeler"
}`;

    let responseText = '{}';

    if (genAI) {
      const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-pro'];
      for (const modelName of models) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: type === 'rehber' ? 8000 : 5000,
              responseMimeType: 'application/json',
            },
          });
          const result = await model.generateContent(prompt);
          responseText = result.response.text() || '{}';
          break;
        } catch (e) {
          console.warn(`   ⚠️  Gemini ${modelName} failed, trying next...`);
          if (modelName === models[models.length - 1]) throw e;
        }
      }
    } else if (openai) {
      const completion = await openai.chat.completions.create({
        model: type === 'rehber' ? 'gpt-4o' : 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: type === 'rehber' ? 8000 : 5000,
        response_format: { type: 'json_object' },
      });
      responseText = completion.choices[0]?.message?.content || '{}';
    } else {
      throw new Error('No AI provider available');
    }

    let articleData: Record<string, unknown>;
    try {
      articleData = JSON.parse(responseText);
    } catch {
      const m = responseText.match(/\{[\s\S]*\}/);
      articleData = m ? JSON.parse(m[0]) : {};
    }

    if (!articleData.title || !articleData.content) {
      throw new Error('Invalid response format from AI');
    }

    const slug = String(articleData.title)
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id, slug')
      .eq('slug', slug)
      .maybeSingle();

    const finalSlug = existingArticle ? `${slug}-${Date.now()}` : slug;

    const keywords = articleData.seo_keywords
      ? String(articleData.seo_keywords).split(',').map((k: string) => k.trim()).filter(Boolean)
      : article.targetKeywords;

    const { data: createdArticle, error: createError } = await supabase
      .from('articles')
      .insert({
        title: String(articleData.title),
        slug: finalSlug,
        content: String(articleData.content),
        excerpt: String(articleData.excerpt || (articleData.meta_description as string)?.substring(0, 200) || ''),
        meta_description: String(articleData.meta_description || ''),
        keywords: keywords.length > 0 ? keywords : null,
        author: 'Karasu Emlak',
        status: 'published',
        published_at: new Date().toISOString(),
        category: 'Rehber',
        views: 0,
        internal_links: [
          { text: 'Karasu Kiralık Daire', url: '/karasu-kiralik-daire' },
          { text: 'Karasu Satılık Daire', url: '/karasu-satilik-daire' },
          { text: 'Karasu Kira Getirisi', url: '/blog/karasu-kira-getirisi-hesaplama-yatirim-rehberi-2026' },
        ],
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    console.log(`✅ Created article: ${createdArticle.id} (${finalSlug})`);
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`❌ Error creating article:`, err.message);
    throw error;
  }
}

async function articleExists(title: string): Promise<boolean> {
  const { data } = await supabase
    .from('articles')
    .select('id')
    .ilike('title', `%${title}%`)
    .limit(1);
  return !!(data && data.length > 0);
}

async function main() {
  console.log('🚀 Starting content creation for "Karasu Kiralık Daire"');
  console.log('='.repeat(60));

  console.log('\n📚 Creating 5 REHBER Articles (2000+ words)...');
  for (const article of rehberArticles) {
    const exists = await articleExists(article.title);
    if (exists) {
      console.log(`⏭️  Skipping (already exists): "${article.title}"`);
      continue;
    }
    await generateArticleDirect(article, 'rehber');
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log('\n📝 Creating 5 BLOG Posts (1000 words)...');
  for (const post of blogPosts) {
    const exists = await articleExists(post.title);
    if (exists) {
      console.log(`⏭️  Skipping (already exists): "${post.title}"`);
      continue;
    }
    await generateArticleDirect(post, 'normal');
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log('\n✅ Content creation completed!');
  console.log('='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   - Rehber Articles: ${rehberArticles.length}`);
  console.log(`   - Blog Posts: ${blogPosts.length}`);
  console.log(`   - Total: ${rehberArticles.length + blogPosts.length} articles`);
}

main().catch(console.error);
