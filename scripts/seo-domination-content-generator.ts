/**
 * SEO Domination Content Generator
 * 
 * Generates cornerstone articles, support blog posts, and Q&A blocks
 * for Sakarya real estate SEO domination strategy.
 * 
 * Usage:
 *   pnpm tsx scripts/seo-domination-content-generator.ts --type=cornerstone
 *   pnpm tsx scripts/seo-domination-content-generator.ts --type=blog
 *   pnpm tsx scripts/seo-domination-content-generator.ts --type=qa
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

// Use service role for full access (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY in .env.local');
}

/**
 * Log SEO event
 */
async function logSEOEvent(
  eventType: string,
  entityType: string,
  entityId: string,
  eventData: any
): Promise<void> {
  try {
    await supabase.from('seo_events').insert({
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      event_data: eventData,
      status: 'completed',
    });
  } catch (error) {
    console.error('Error logging SEO event:', error);
  }
}

/**
 * Calculate reading time in minutes
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Generate slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * CORNERSTONE ARTICLES (5 articles, 2000+ words)
 */
const cornerstoneArticles = [
  {
    title: "Karasu'da Emlak Yatırımı: 2024 Rehberi",
    targetKeywords: ['karasu yatırım', 'karasu emlak yatırım', 'karasu yatırımlık ev'],
    internalLinks: [
      { text: 'Karasu Satılık Ev', href: '/karasu-satilik-ev' },
      { text: 'Karasu Yatırımlık Satılık Ev', href: '/karasu-yatirimlik-satilik-ev' },
      { text: 'Karasu Emlak Rehberi', href: '/karasu-emlak-rehberi' },
    ],
  },
  {
    title: "Kocaali vs Karasu: Yatırımcılar İçin Detaylı Karşılaştırma",
    targetKeywords: ['kocaali mi karasu mu', 'karasu kocaali yatırım', 'kocaali karasu karşılaştırma'],
    internalLinks: [
      { text: 'Karasu vs Kocaali Yatırım', href: '/karasu-vs-kocaali-yatirim' },
      { text: 'Kocaali Yatırımlık Gayrimenkul', href: '/kocaali-yatirimlik-gayrimenkul' },
      { text: 'Karasu Yatırımlık Gayrimenkul', href: '/karasu-yatirimlik-gayrimenkul' },
    ],
  },
  {
    title: "Sakarya Emlak Piyasası: Trendler ve Fırsatlar",
    targetKeywords: ['sakarya emlak', 'sakarya yatırım', 'sakarya emlak piyasası'],
    internalLinks: [
      { text: 'Sakarya Emlak Yatırım Rehberi', href: '/sakarya-emlak-yatirim-rehberi' },
      { text: 'Karasu Satılık Ev', href: '/karasu-satilik-ev' },
      { text: 'Kocaali Satılık Ev', href: '/kocaali-satilik-ev' },
    ],
  },
  {
    title: "Karasu'da Ev Alırken Dikkat Edilmesi Gerekenler",
    targetKeywords: ['karasu ev almak', 'karasu emlak alım satım', 'karasu ev alırken'],
    internalLinks: [
      { text: 'Karasu Emlak Rehberi', href: '/karasu-emlak-rehberi' },
      { text: 'Karasu Satılık Ev', href: '/karasu-satilik-ev' },
      { text: 'Karasu Mahalleler', href: '/karasu-mahalleler' },
    ],
  },
  {
    title: "Karasu Mahalleleri: Yatırım Potansiyeli ve Yaşam Kalitesi",
    targetKeywords: ['karasu mahalleler', 'karasu hangi mahalle', 'karasu mahalle analizi'],
    internalLinks: [
      { text: 'Karasu Mahalleler', href: '/karasu-mahalleler' },
      { text: 'Karasu Satılık Ev', href: '/karasu-satilik-ev' },
      { text: 'Karasu Emlak Rehberi', href: '/karasu-emlak-rehberi' },
    ],
  },
];

/**
 * SUPPORT BLOG POSTS (15 posts, 800-1500 words)
 */
const supportBlogPosts = [
  "Karasu'da ev alırken dikkat edilmesi gerekenler",
  "Karasu merkez mi sahil mi?",
  "Kocaali yatırım potansiyeli",
  "Karasu'da ev fiyatları neden artıyor?",
  "Karasu'da kiralama geliri ne kadar?",
  "Kocaali'de yazlık ev almak mantıklı mı?",
  "Karasu'da hangi mahalleler değerleniyor?",
  "Sakarya emlak piyasası 2024",
  "Karasu'da ev almak için kredi şartları",
  "Kocaali vs Karasu: Hangi bölge daha uygun?",
  "Karasu'da yatırım için en uygun ev tipleri",
  "Kocaali'de emlak alım-satım süreçleri",
  "Karasu'da denize yakın ev fiyatları",
  "Sakarya'da emlak yatırımı yapmak mantıklı mı?",
  "Karasu'da ev alırken tapu işlemleri",
];

/**
 * AI Q&A BLOCKS (20 blocks, 40-70 words)
 */
const qaBlocks = [
  {
    question: "Karasu'da ev almak mantıklı mı?",
    location_scope: 'karasu' as const,
    page_type: 'pillar' as const,
    priority: 'high' as const,
  },
  {
    question: "Karasu yatırım için uygun mu?",
    location_scope: 'karasu' as const,
    page_type: 'pillar' as const,
    priority: 'high' as const,
  },
  {
    question: "Kocaali mi Karasu mu?",
    location_scope: 'global' as const,
    page_type: 'comparison' as const,
    priority: 'high' as const,
  },
  {
    question: "Karasu'da hangi mahalleler değerleniyor?",
    location_scope: 'karasu' as const,
    page_type: 'neighborhood' as const,
    priority: 'high' as const,
  },
  {
    question: "Karasu'da ev fiyatları ne durumda?",
    location_scope: 'karasu' as const,
    page_type: 'pillar' as const,
    priority: 'medium' as const,
  },
  {
    question: "Kocaali yatırım potansiyeli nedir?",
    location_scope: 'kocaali' as const,
    page_type: 'pillar' as const,
    priority: 'high' as const,
  },
  {
    question: "Karasu'da kiralama geliri ne kadar?",
    location_scope: 'karasu' as const,
    page_type: 'pillar' as const,
    priority: 'medium' as const,
  },
  {
    question: "Sakarya emlak piyasası nasıl?",
    location_scope: 'global' as const,
    page_type: 'pillar' as const,
    priority: 'high' as const,
  },
  {
    question: "Karasu'da ev alırken nelere dikkat edilmeli?",
    location_scope: 'karasu' as const,
    page_type: 'blog' as const,
    priority: 'high' as const,
  },
  {
    question: "Kocaali'de yazlık ev almak mantıklı mı?",
    location_scope: 'kocaali' as const,
    page_type: 'blog' as const,
    priority: 'medium' as const,
  },
  {
    question: "Karasu merkez mi sahil mi yatırım için?",
    location_scope: 'karasu' as const,
    page_type: 'blog' as const,
    priority: 'medium' as const,
  },
  {
    question: "Karasu'da hangi ev tipleri yatırım için uygun?",
    location_scope: 'karasu' as const,
    page_type: 'pillar' as const,
    priority: 'medium' as const,
  },
  {
    question: "Kocaali'de emlak alım-satım süreçleri nasıl?",
    location_scope: 'kocaali' as const,
    page_type: 'blog' as const,
    priority: 'low' as const,
  },
  {
    question: "Karasu'da denize yakın ev fiyatları nasıl?",
    location_scope: 'karasu' as const,
    page_type: 'cornerstone' as const,
    priority: 'medium' as const,
  },
  {
    question: "Sakarya'da emlak yatırımı yapmak mantıklı mı?",
    location_scope: 'global' as const,
    page_type: 'pillar' as const,
    priority: 'high' as const,
  },
  {
    question: "Karasu'da ev almak için kredi şartları neler?",
    location_scope: 'karasu' as const,
    page_type: 'blog' as const,
    priority: 'low' as const,
  },
  {
    question: "Kocaali vs Karasu: Hangi bölge daha uygun?",
    location_scope: 'global' as const,
    page_type: 'comparison' as const,
    priority: 'high' as const,
  },
  {
    question: "Karasu'da yatırım için en uygun mahalleler?",
    location_scope: 'karasu' as const,
    page_type: 'neighborhood' as const,
    priority: 'high' as const,
  },
  {
    question: "Karasu'da ev alırken tapu işlemleri nasıl?",
    location_scope: 'karasu' as const,
    page_type: 'blog' as const,
    priority: 'low' as const,
  },
  {
    question: "Kocaali'de yatırım amaçlı ev almak mantıklı mı?",
    location_scope: 'kocaali' as const,
    page_type: 'pillar' as const,
    priority: 'medium' as const,
  },
];

/**
 * Generate cornerstone article using OpenAI
 */
async function generateCornerstoneArticle(article: typeof cornerstoneArticles[0]): Promise<void> {
  console.log(`\n📝 Generating: "${article.title}"`);
  
  try {
    const prompt = `Sen bir emlak yatırım uzmanısın. Aşağıdaki konuda 2000+ kelimelik, profesyonel, objektif ve bilgilendirici bir makale yaz.

Başlık: ${article.title}
Hedef Anahtar Kelimeler: ${article.targetKeywords.join(', ')}

Gereksinimler:
1. Minimum 2000 kelime
2. Tam yapılandırılmış (H2, H3 başlıklar)
3. Yatırım odaklı, veri destekli
4. Sakin, uzman tonu (satış dili yok)
5. Gerçek kullanıcı sorularını yanıtla
6. İç linkler için şu metinleri kullan: ${article.internalLinks.map(l => l.text).join(', ')}

Format:
- Giriş (200-300 kelime)
- Ana bölümler (H2 başlıklar altında)
- Alt bölümler (H3 başlıklar altında)
- Sonuç ve özet (200-300 kelime)

JSON formatında döndür:
{
  "title": "makale başlığı",
  "excerpt": "150-200 kelimelik özet",
  "content": "tam içerik (HTML formatında, H2/H3 başlıklar dahil)",
  "meta_description": "150-160 karakter SEO açıklaması",
  "seo_keywords": "virgülle ayrılmış anahtar kelimeler"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen bir emlak yatırım uzmanısın. Profesyonel, objektif ve bilgilendirici içerik üretiyorsun.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    let articleData;
    
    try {
      articleData = JSON.parse(responseText);
    } catch {
      // If not JSON, treat as plain text
      articleData = {
        title: article.title,
        excerpt: responseText.substring(0, 200),
        content: responseText,
        meta_description: `${article.title} - Karasu Emlak uzman rehberi`,
        seo_keywords: article.targetKeywords.join(', '),
      };
    }

    const slug = generateSlug(articleData.title || article.title);
    const readingTime = calculateReadingTime(articleData.content || '');

    // Check if article already exists
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️  Skipping - article already exists: ${slug}`);
      return;
    }

    // Use API route instead of direct Supabase insert to avoid schema cache issues
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const apiUrl = `${baseUrl}/api/articles`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: articleData.title || article.title,
          slug,
          excerpt: articleData.excerpt || '',
          content: articleData.content || '',
          metaDescription: articleData.meta_description || '',
          seoKeywords: articleData.seo_keywords || article.targetKeywords.join(', '),
          author: 'Karasu Emlak',
          isPublished: false,
          isFeatured: true, // Cornerstone articles are featured
          locale: 'tr',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to create article');
      }

      const created = data.data?.article || data.article;
      
      if (!created || !created.id) {
        console.log(`   ⏭️  Article creation failed or already exists`);
        return;
      }

      // Log SEO event
      await logSEOEvent(
        'content_generated',
        'article',
        created.id,
        {
          type: 'cornerstone',
          title: articleData.title || article.title,
          word_count: (articleData.content || '').split(/\s+/).length,
          keywords: article.targetKeywords,
        }
      );

      console.log(`✅ Created: "${articleData.title || article.title}" (${slug})`);
    } catch (apiError: any) {
      console.error(`❌ Error creating article via API:`, apiError.message || apiError);
      return;
    }
  } catch (error: any) {
    console.error(`❌ Error generating article:`, error.message);
  }
}

/**
 * Generate support blog post
 */
async function generateBlogPost(title: string): Promise<void> {
  console.log(`\n📝 Generating blog post: "${title}"`);
  
  try {
    const prompt = `Sen bir emlak uzmanısın. Aşağıdaki konuda 800-1500 kelimelik, bilgilendirici bir blog yazısı yaz.

Başlık: ${title}

Gereksinimler:
1. 800-1500 kelime
2. Yapılandırılmış (H2/H3 başlıklar)
3. Bilgilendirici, objektif ton
4. Gerçek kullanıcı sorularını yanıtla
5. İlgili iç linkler öner (Karasu, Kocaali, yatırım sayfalarına)

ÖNEMLİ - YAPMA:
- "Sonuç", "Özet", "Değerlendirme" başlıkları EKLEME
- "Sonuç olarak", "Özetlemek gerekirse", "Kısaca" gibi ifadeler KULLANMA
- Yazıyı doğal bir şekilde bitir, son paragraf normal bir paragraf gibi olsun
- İnsan yazmış gibi görünmeli, yapay zeka yazmış gibi değil

JSON formatında döndür:
{
  "title": "makale başlığı",
  "excerpt": "100-150 kelimelik özet",
  "content": "tam içerik (HTML formatında)",
  "meta_description": "150-160 karakter SEO açıklaması",
  "seo_keywords": "virgülle ayrılmış anahtar kelimeler"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen bir emlak uzmanısın. Bilgilendirici ve objektif içerik üretiyorsun.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    let articleData;
    
    try {
      articleData = JSON.parse(responseText);
    } catch {
      articleData = {
        title,
        excerpt: responseText.substring(0, 150),
        content: responseText,
        meta_description: `${title} - Karasu Emlak blog`,
        seo_keywords: title,
      };
    }

    const slug = generateSlug(articleData.title || title);
    const readingTime = calculateReadingTime(articleData.content || '');

    // Check if article already exists
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️  Skipping - article already exists: ${slug}`);
      return;
    }

    // Use API route instead of direct Supabase insert
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const apiUrl = `${baseUrl}/api/articles`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: articleData.title || title,
          slug,
          excerpt: articleData.excerpt || '',
          content: articleData.content || '',
          metaDescription: articleData.meta_description || '',
          seoKeywords: articleData.seo_keywords || title,
          author: 'Karasu Emlak',
          isPublished: false,
          locale: 'tr',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to create blog post');
      }

      const created = data.data?.article || data.article;
      
      if (!created || !created.id) {
        console.log(`   ⏭️  Blog post creation failed or already exists`);
        return;
      }

      // Log SEO event
      await logSEOEvent(
        'content_generated',
        'article',
        created.id,
        {
          type: 'blog',
          title: articleData.title || title,
          word_count: (articleData.content || '').split(/\s+/).length,
        }
      );

      console.log(`✅ Created: "${articleData.title || title}" (${slug})`);
    } catch (apiError: any) {
      console.error(`❌ Error creating blog post via API:`, apiError.message || apiError);
      return;
    }
  } catch (error: any) {
    console.error(`❌ Error generating blog post:`, error.message);
  }
}

/**
 * Generate Q&A block
 */
async function generateQA(qa: typeof qaBlocks[0]): Promise<void> {
  console.log(`\n❓ Generating Q&A: "${qa.question}"`);
  
  try {
    const prompt = `Sen bir emlak uzmanısın. Aşağıdaki soruya 40-70 kelimelik, kısa, net ve bilgilendirici bir cevap ver.

Soru: ${qa.question}

Gereksinimler:
1. 40-70 kelime
2. Kısa, net, direkt cevap
3. Objektif, bilgilendirici (satış dili yok)
4. AI Overviews için optimize edilmiş
5. Gerçek veriler ve bilgiler içermeli

Sadece cevabı döndür (soru sorma, sadece cevap ver).`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen bir emlak uzmanısın. Kısa, net ve bilgilendirici cevaplar veriyorsun.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 150,
    });

    const answer = completion.choices[0]?.message?.content?.trim() || '';

    if (!answer || answer.length < 40) {
      console.log(`⚠️  Answer too short, skipping`);
      return;
    }

    // Check if Q&A already exists
    const { data: existing } = await supabase
      .from('ai_questions')
      .select('id')
      .eq('question', qa.question)
      .maybeSingle();

    if (existing) {
      console.log(`   ⏭️  Q&A already exists, skipping`);
      return;
    }

    // Try insert - if schema cache error, we'll use MCP Supabase
    const insertResult = await supabase
      .from('ai_questions')
      .insert({
        question: qa.question,
        answer,
        location_scope: qa.location_scope,
        page_type: qa.page_type,
        priority: qa.priority,
        status: 'draft',
        generated_by_ai: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    let created = insertResult.data;
    let error = insertResult.error;

    // If schema cache error, use MCP Supabase to insert directly
    if (error && (error.code === 'PGRST205' || error.message?.includes('schema cache'))) {
      console.log(`   ⚠️  Schema cache issue, using direct SQL...`);
      
      try {
        // Use MCP Supabase execute_sql
        const sqlQuery = `
          INSERT INTO public.ai_questions (
            question, answer, location_scope, page_type, priority, 
            status, generated_by_ai, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id;
        `;
        
        // Note: We can't use MCP tools in scripts, so we'll use a workaround
        // Try with a simple select first to refresh cache, then retry
        await supabase.from('ai_questions').select('id').limit(1);
        
        // Wait a bit for cache refresh
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Retry insert
        const retryResult = await supabase
          .from('ai_questions')
          .insert({
            question: qa.question,
            answer,
            location_scope: qa.location_scope,
            page_type: qa.page_type,
            priority: qa.priority,
            status: 'draft',
            generated_by_ai: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        
        created = retryResult.data;
        error = retryResult.error;
        
        if (error) {
          console.log(`   ⚠️  Still having issues, will skip this Q&A`);
          return;
        }
      } catch (retryError: any) {
        console.log(`   ⚠️  Retry failed: ${retryError.message}`);
        return;
      }
    }

    if (error && !created) {
      console.error(`❌ Error creating Q&A:`, error.message || error);
      return;
    }

    if (!created || !created.id) {
      console.log(`   ⏭️  Q&A creation failed or already exists`);
      return;
    }

    // Log SEO event
    await logSEOEvent(
      'qa_generated',
      'ai_question',
      created.id,
      {
        question: qa.question,
        location_scope: qa.location_scope,
        page_type: qa.page_type,
      }
    );

    console.log(`✅ Created Q&A: "${qa.question}"`);
  } catch (error: any) {
    console.error(`❌ Error generating Q&A:`, error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const typeArg = args.find(arg => arg.startsWith('--type='));
  const type = typeArg ? typeArg.split('=')[1] : 'all';

  console.log('🚀 SEO Domination Content Generator\n');
  console.log(`Mode: ${type}\n`);

  if (type === 'cornerstone' || type === 'all') {
    console.log('📚 Generating Cornerstone Articles...\n');
    for (const article of cornerstoneArticles) {
      await generateCornerstoneArticle(article);
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  if (type === 'blog' || type === 'all') {
    console.log('\n📝 Generating Support Blog Posts...\n');
    for (const title of supportBlogPosts) {
      await generateBlogPost(title);
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  if (type === 'qa' || type === 'all') {
    console.log('\n❓ Generating Q&A Blocks...\n');
    for (const qa of qaBlocks) {
      await generateQA(qa);
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n\n✨ Content generation completed!');
  console.log('\n⚠️  IMPORTANT: Review all generated content in admin panel before publishing!');
}

if (require.main === module) {
  main().catch(console.error);
}

export { generateCornerstoneArticle, generateBlogPost, generateQA };
