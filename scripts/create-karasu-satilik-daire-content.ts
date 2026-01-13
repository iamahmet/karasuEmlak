/**
 * Create 5 Cornerstone Articles + 5 Blog Posts for "Karasu Satılık Daire"
 * 
 * Cornerstone Articles (2000+ words, type: 'cornerstone'):
 * 1. Karasu Satılık Daire Alım Rehberi: 2025 Yılında Dikkat Edilmesi Gerekenler
 * 2. Karasu'da Satılık Daire Fiyatları: Mahalle Bazlı Detaylı Analiz
 * 3. Karasu Satılık Daire Yatırım Rehberi: ROI Hesaplama ve Yatırım Stratejileri
 * 4. Karasu'da Satılık Daire Alırken Yasal Süreçler ve Tapu İşlemleri
 * 5. Karasu Satılık Daire: Denize Yakın vs Merkez Konum Karşılaştırması
 * 
 * Blog Posts (1000 words, type: 'normal'):
 * 1. Karasu'da 2025 Yılı Satılık Daire Piyasa Trendleri
 * 2. Karasu Sahilinde Satılık Daire Fırsatları
 * 3. Karasu Merkez'de Satılık Daire Arayanlar İçin İpuçları
 * 4. Karasu'da Kredi ile Satılık Daire Alım Süreci
 * 5. Karasu Satılık Daire: Eşyalı vs Eşyasız Seçenekler
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY in .env.local');
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Use service role for full access (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const cornerstoneArticles = [
  {
    title: 'Karasu Satılık Daire Alım Rehberi: 2025 Yılında Dikkat Edilmesi Gerekenler',
    topic: 'Karasu satılık daire alım rehberi 2025 yılında dikkat edilmesi gerekenler',
    targetKeywords: ['karasu satılık daire', 'karasu daire alım rehberi', 'karasu emlak alım', 'karasu satılık daire alırken dikkat edilmesi gerekenler'],
    template: 'investment',
    brief: 'Karasu\'da satılık daire almayı düşünenler için kapsamlı rehber. 2025 yılı güncel bilgileri, dikkat edilmesi gerekenler, yasal süreçler, fiyat analizi ve yatırım tavsiyeleri.',
  },
  {
    title: 'Karasu\'da Satılık Daire Fiyatları: Mahalle Bazlı Detaylı Analiz',
    topic: 'Karasu satılık daire fiyatları mahalle bazlı analiz 2025',
    targetKeywords: ['karasu satılık daire fiyatları', 'karasu daire fiyat analizi', 'karasu mahalle fiyatları', 'karasu emlak fiyat trendleri'],
    template: 'market-analysis',
    brief: 'Karasu\'da satılık daire fiyatlarının mahalle bazlı detaylı analizi. Merkez, Sahil, Yalı Mahallesi ve diğer mahallelerdeki fiyat trendleri, ortalama fiyatlar ve yatırım potansiyeli.',
  },
  {
    title: 'Karasu Satılık Daire Yatırım Rehberi: ROI Hesaplama ve Yatırım Stratejileri',
    topic: 'Karasu satılık daire yatırım rehberi ROI hesaplama stratejileri',
    targetKeywords: ['karasu satılık daire yatırım', 'karasu daire yatırım rehberi', 'karasu emlak yatırım', 'karasu daire ROI'],
    template: 'investment',
    brief: 'Karasu\'da satılık daire yatırımı yapmayı düşünenler için kapsamlı rehber. ROI hesaplama, kira getirisi analizi, yatırım stratejileri ve risk değerlendirmesi.',
  },
  {
    title: 'Karasu\'da Satılık Daire Alırken Yasal Süreçler ve Tapu İşlemleri',
    topic: 'Karasu satılık daire yasal süreçler tapu işlemleri',
    targetKeywords: ['karasu satılık daire yasal süreçler', 'karasu daire tapu işlemleri', 'karasu emlak yasal rehber', 'karasu daire alım süreci'],
    template: 'blog',
    brief: 'Karasu\'da satılık daire alırken bilinmesi gereken yasal süreçler, tapu işlemleri, gerekli belgeler ve dikkat edilmesi gereken yasal konular.',
  },
  {
    title: 'Karasu Satılık Daire: Denize Yakın vs Merkez Konum Karşılaştırması',
    topic: 'Karasu satılık daire denize yakın merkez konum karşılaştırması',
    targetKeywords: ['karasu satılık daire denize yakın', 'karasu merkez satılık daire', 'karasu daire konum karşılaştırması', 'karasu emlak konum analizi'],
    template: 'blog',
    brief: 'Karasu\'da satılık daire alırken denize yakın konumlar ile merkez konumların karşılaştırması. Avantajlar, dezavantajlar, fiyat farkları ve hangi durumda hangi konumun tercih edilmesi gerektiği.',
  },
];

const blogPosts = [
  {
    title: 'Karasu\'da 2025 Yılı Satılık Daire Piyasa Trendleri',
    topic: 'Karasu 2025 satılık daire piyasa trendleri',
    targetKeywords: ['karasu satılık daire 2025', 'karasu emlak trendleri', 'karasu daire piyasa analizi'],
    template: 'market-analysis',
    brief: 'Karasu\'da 2025 yılı satılık daire piyasasının güncel trendleri, fiyat değişimleri ve gelecek öngörüleri.',
  },
  {
    title: 'Karasu Sahilinde Satılık Daire Fırsatları',
    topic: 'Karasu sahilinde satılık daire fırsatları',
    targetKeywords: ['karasu sahil satılık daire', 'karasu denize sıfır daire', 'karasu sahil emlak'],
    template: 'blog',
    brief: 'Karasu sahilinde satılık daire fırsatları, denize yakın konumların avantajları ve yatırım potansiyeli.',
  },
  {
    title: 'Karasu Merkez\'de Satılık Daire Arayanlar İçin İpuçları',
    topic: 'Karasu merkez satılık daire arayanlar ipuçları',
    targetKeywords: ['karasu merkez satılık daire', 'karasu merkez emlak', 'karasu merkez daire ipuçları'],
    template: 'blog',
    brief: 'Karasu merkez\'de satılık daire arayanlar için pratik ipuçları, dikkat edilmesi gerekenler ve avantajlar.',
  },
  {
    title: 'Karasu\'da Kredi ile Satılık Daire Alım Süreci',
    topic: 'Karasu kredi ile satılık daire alım süreci',
    targetKeywords: ['karasu kredi ile daire alım', 'karasu emlak kredi', 'karasu daire kredi süreci'],
    template: 'blog',
    brief: 'Karasu\'da kredi ile satılık daire alım süreci, gerekli belgeler, kredi başvuru adımları ve dikkat edilmesi gerekenler.',
  },
  {
    title: 'Karasu Satılık Daire: Eşyalı vs Eşyasız Seçenekler',
    topic: 'Karasu satılık daire eşyalı eşyasız seçenekler',
    targetKeywords: ['karasu eşyalı satılık daire', 'karasu eşyasız satılık daire', 'karasu daire eşyalı eşyasız'],
    template: 'blog',
    brief: 'Karasu\'da satılık daire alırken eşyalı ve eşyasız seçeneklerin karşılaştırması, avantajları ve hangi durumda hangisinin tercih edilmesi gerektiği.',
  },
];

/**
 * Generate article using OpenAI directly (fallback if API is not available)
 */
async function generateArticleDirect(article: typeof cornerstoneArticles[0] | typeof blogPosts[0], type: 'cornerstone' | 'normal'): Promise<void> {
  console.log(`\n📝 Generating ${type === 'cornerstone' ? 'CORNERSTONE' : 'BLOG'}: "${article.title}"`);
  
  try {
    const wordCount = type === 'cornerstone' ? 2000 : 1000;
    const useFlagshipPrompt = type === 'cornerstone';
    const mainKeyword = 'karasu satılık daire';
    
    const flagshipPrompt = `# ROLE
You are a world-class SEO Specialist and Senior Content Writer with 15+ years of experience. Your goal is to write "Flagship Content" that ranks #1 on Google, beating all competitors in depth, engagement, and authority. You do NOT write like an AI. You write like a witty, experienced human expert (solopreneur vibe) who speaks directly to the reader.

# OBJECTIVE
Write a comprehensive, SEO-optimized, and highly engaging article on the user-provided [TOPIC] targeting the [KEYWORD]. The content must be unique, semantic, and tailored for high retention (dwell time).

# TONE & STYLE GUIDELINES (CRITICAL)
1. **Anti-AI / Human Touch:**
   * NEVER start sentences with: "In conclusion," "Furthermore," "Additionally," "Moreover," "In the dynamic world of," "Unlock the potential."
   * Avoid robotic transitions. Use natural, conversational connectors like: "By the way," "Honestly," "Let's see," "You see," "That being said," "Come to think of it," "To be fair."
   * Write at a **6th-grade reading level** (simple words) but with **PhD-level depth** (deep expertise).
   * Use specific examples, data, and logic. Avoid fluff and generic statements.
   * **Vibe:** Slightly informal, modern, authoritative but friendly. Imagine you are chatting with a friend over coffee.

2. **Formatting & Structure:**
   * Use Markdown formatting.
   * **Heirarchy:** Strict H1, H2, H3, H4 structure.
   * **Visuals:** Use **Bold** for emphasis, *Italics* for nuance. Use HTML lists (<ul><li>) where appropriate for readability.
   * **Length:** The article must be deep (aim for 2000+ words or cover the topic exhaustively).`;

    const systemPrompt = useFlagshipPrompt
      ? flagshipPrompt.replace(/\[TOPIC\]/g, article.topic).replace(/\[KEYWORD\]/g, mainKeyword)
      : `Sen Karasu'da 15 yıldır hizmet veren profesyonel bir emlak danışmanısın. Türkçe içerik oluşturuyorsun. Profesyonel, objektif ve bilgilendirici bir dil kullan.`;

    const prompt = `Aşağıdaki konuda ${wordCount} kelimelik kapsamlı bir makale oluştur:

Başlık: ${article.title}
Konu: ${article.topic}
Hedef Anahtar Kelimeler: ${article.targetKeywords.join(', ')}
Brief: ${article.brief}

Gereksinimler:
1. Minimum ${wordCount} kelime
2. Tam yapılandırılmış (H2, H3 başlıklar)
3. Karasu'ya özel, yerel bilgiler içermeli
4. Profesyonel, objektif, bilgilendirici ton
5. Gerçek kullanıcı sorularını yanıtla
6. "karasu satılık daire" anahtar kelimesini doğal şekilde kullan (1-2% density)
7. İç linkler için şu metinleri kullan: [Link: Karasu Satılık Daire], [Link: Karasu Satılık Ev], [Link: Karasu Kiralık Daire]

Format:
- Giriş (200-300 kelime): Konuyu tanıt, Karasu'ya özel bağlam kur
- Ana bölümler (H2 başlıklar altında, her biri 400-600 kelime)
- Alt bölümler (H3 başlıklar altında)
- Pratik örnekler ve ipuçları
- FAQ bölümü (5-7 soru)
- Sonuç (200-300 kelime)

Önemli:
- Karasu'nun coğrafi konumu, ulaşım avantajları vurgulanmalı
- Sakarya ili bağlamında Karasu'nun yeri
- Yerel mahalle isimleri kullan (Merkez, Sahil, Yalı, Aziziye, vb.)
- Gerçekçi fiyat aralıkları (2025 verilerine uygun)
- Yatırım potansiyeli ve gelecek projeksiyonları
- "Sonuç", "Özet" gibi başlıklar KULLANMA, doğal bitir

JSON formatında döndür:
{
  "title": "makale başlığı",
  "excerpt": "200-250 kelimelik özet",
  "content": "tam içerik (HTML formatında, H2/H3 başlıklar dahil, <p> etiketleri kullan)",
  "meta_description": "150-160 karakter SEO açıklaması",
  "seo_keywords": "virgülle ayrılmış anahtar kelimeler"
}`;

    const completion = await openai.chat.completions.create({
      model: useFlagshipPrompt ? 'gpt-4o' : 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: useFlagshipPrompt ? 8000 : 4000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const articleData = JSON.parse(responseText);

    if (!articleData.title || !articleData.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    // Generate slug
    const slug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if article with same slug exists
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('id, slug')
      .eq('slug', slug)
      .maybeSingle();

    const finalSlug = existingArticle ? `${slug}-${Date.now()}` : slug;

    // Extract keywords
    const keywords = articleData.seo_keywords
      ? articleData.seo_keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : article.targetKeywords;

    // Determine category
    const category = article.template === 'investment' ? 'Yatırım Rehberi' :
                     article.template === 'market-analysis' ? 'Piyasa Analizi' :
                     'Blog';

    // Create article
    const { data: createdArticle, error: createError } = await supabase
      .from('articles')
      .insert({
        title: articleData.title,
        slug: finalSlug,
        content: articleData.content,
        excerpt: articleData.excerpt || articleData.meta_description?.substring(0, 200) || '',
        meta_description: articleData.meta_description,
        keywords: keywords.length > 0 ? keywords : null,
        author: 'Karasu Emlak',
        status: 'published',
        published_at: new Date().toISOString(),
        category: category,
        views: 0,
        internal_links: [
          { text: 'Karasu Satılık Daire', url: '/karasu-satilik-daire' },
          { text: 'Karasu Satılık Ev', url: '/karasu-satilik-ev' },
          { text: 'Karasu Kiralık Daire', url: '/karasu-kiralik-daire' },
        ],
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    console.log(`✅ Created article: ${createdArticle.id} (${finalSlug})`);
    return;
  } catch (error: any) {
    console.error(`❌ Error creating article:`, error.message);
    throw error;
  }
}

/**
 * Generate article using Content Studio API (preferred method)
 */
async function generateArticleViaAPI(article: typeof cornerstoneArticles[0] | typeof blogPosts[0], type: 'cornerstone' | 'normal'): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3000/api/content-studio/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: type,
        template: article.template,
        topic: article.topic,
        brief: article.brief,
        locale: 'tr',
        context: 'karasu-emlak',
        region: 'Karasu, Kocaali, Sakarya',
      }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    
    if (!data.success) {
      return false;
    }

    const articleId = data.data?.contentId || data.data?.articleId || data.contentId || data.articleId;
    if (articleId) {
      console.log(`✅ Created article via API: ${articleId}`);
      
      // Update article with internal links and publish
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          internal_links: [
            { text: 'Karasu Satılık Daire', url: '/karasu-satilik-daire' },
            { text: 'Karasu Satılık Ev', url: '/karasu-satilik-ev' },
            { text: 'Karasu Kiralık Daire', url: '/karasu-kiralik-daire' },
          ],
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', articleId);

      if (updateError) {
        console.error(`⚠️  Warning: Could not update internal links: ${updateError.message}`);
      } else {
        console.log(`✅ Updated internal links and published`);
      }
      return true;
    }
    return false;
  } catch (error: any) {
    return false;
  }
}

/**
 * Generate article (tries API first, falls back to direct OpenAI)
 */
async function generateArticle(article: typeof cornerstoneArticles[0] | typeof blogPosts[0], type: 'cornerstone' | 'normal'): Promise<void> {
  console.log(`\n📝 Generating ${type === 'cornerstone' ? 'CORNERSTONE' : 'BLOG'}: "${article.title}"`);
  
  // Try API first
  const apiSuccess = await generateArticleViaAPI(article, type);
  if (apiSuccess) {
    return;
  }

  // Fallback to direct OpenAI
  console.log(`⚠️  API not available, using direct OpenAI generation...`);
  await generateArticleDirect(article, type);
}

/**
 * Check if article already exists
 */
async function articleExists(title: string): Promise<boolean> {
  const { data } = await supabase
    .from('articles')
    .select('id')
    .ilike('title', `%${title}%`)
    .limit(1);
  
  return (data && data.length > 0);
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting content creation for "Karasu Satılık Daire"');
  console.log('='.repeat(60));
  
  // Create cornerstone articles
  console.log('\n📚 Creating 5 CORNERSTONE Articles (2000+ words)...');
  for (const article of cornerstoneArticles) {
    const exists = await articleExists(article.title);
    if (exists) {
      console.log(`⏭️  Skipping (already exists): "${article.title}"`);
      continue;
    }
    await generateArticle(article, 'cornerstone');
    // Wait 3 seconds between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Create blog posts
  console.log('\n📝 Creating 5 BLOG Posts (1000 words)...');
  for (const post of blogPosts) {
    const exists = await articleExists(post.title);
    if (exists) {
      console.log(`⏭️  Skipping (already exists): "${post.title}"`);
      continue;
    }
    await generateArticle(post, 'normal');
    // Wait 3 seconds between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n✅ Content creation completed!');
  console.log('='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   - Cornerstone Articles: ${cornerstoneArticles.length}`);
  console.log(`   - Blog Posts: ${blogPosts.length}`);
  console.log(`   - Total: ${cornerstoneArticles.length + blogPosts.length} articles`);
}

main().catch(console.error);
