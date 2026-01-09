/**
 * Generate Karasu Satılık Daire Content
 * 
 * Creates 10 cornerstone articles and 5 blog posts about "Karasu satılık daire"
 * Uses OpenAI API for content generation
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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use service role for full access (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Cornerstone Articles (10 adet)
const cornerstoneArticles = [
  {
    title: 'Karasu Satılık Daire Rehberi 2024: Kapsamlı Alıcı Kılavuzu',
    targetKeywords: ['karasu satılık daire', 'karasu daire', 'karasu emlak', 'sakarya satılık daire'],
    internalLinks: [
      { text: 'Karasu mahalleler', url: '/karasu-mahalleler' },
      { text: 'Karasu emlak ofisi', url: '/karasu-emlak-ofisi' },
      { text: 'Kredi hesaplayıcı', url: '/kredi-hesaplayici' },
    ],
  },
  {
    title: 'Karasu\'da Daire Alırken Dikkat Edilmesi Gerekenler: Uzman Rehberi',
    targetKeywords: ['karasu daire alırken', 'karasu emlak alım', 'karasu daire seçimi'],
    internalLinks: [
      { text: 'Ekspertiz süreci', url: '/rehberler/ekspertiz-sureci' },
      { text: 'Tapu işlemleri', url: '/rehberler/tapu-islemleri' },
      { text: 'Karasu mahalleler', url: '/karasu-mahalleler' },
    ],
  },
  {
    title: 'Karasu Satılık Daire Fiyatları ve Piyasa Analizi 2024',
    targetKeywords: ['karasu daire fiyatları', 'karasu emlak fiyatları', 'karasu daire piyasası'],
    internalLinks: [
      { text: 'Karasu satılık ilanlar', url: '/satilik' },
      { text: 'Yatırım hesaplayıcı', url: '/yatirim-hesaplayici' },
      { text: 'Karasu mahalleler', url: '/karasu-mahalleler' },
    ],
  },
  {
    title: 'Karasu\'da En İyi Mahalleler ve Daire Seçenekleri',
    targetKeywords: ['karasu en iyi mahalleler', 'karasu mahalle rehberi', 'karasu daire mahalle'],
    internalLinks: [
      { text: 'Karasu mahalleler', url: '/karasu-mahalleler' },
      { text: 'Karasu merkez', url: '/karasu/merkez' },
      { text: 'Karasu sahil', url: '/karasu/sahil' },
    ],
  },
  {
    title: 'Karasu Satılık Daire Kredi ve Finansman Rehberi',
    targetKeywords: ['karasu daire kredisi', 'karasu konut kredisi', 'karasu daire finansman'],
    internalLinks: [
      { text: 'Kredi hesaplayıcı', url: '/kredi-hesaplayici' },
      { text: 'Kredi nasıl alınır', url: '/rehberler/kredi-nasil-alinir' },
      { text: 'Ev nasıl alınır', url: '/rehberler/ev-nasil-alinir' },
    ],
  },
  {
    title: 'Karasu\'da Daire Alım-Satım Süreci ve Yasal İşlemler',
    targetKeywords: ['karasu daire alım satım', 'karasu emlak işlemleri', 'karasu tapu işlemleri'],
    internalLinks: [
      { text: 'Tapu işlemleri', url: '/rehberler/tapu-islemleri' },
      { text: 'Ev nasıl alınır', url: '/rehberler/ev-nasil-alinir' },
      { text: 'Ekspertiz süreci', url: '/rehberler/ekspertiz-sureci' },
    ],
  },
  {
    title: 'Karasu Satılık Daire Yatırım Potansiyeli ve Getiri Analizi',
    targetKeywords: ['karasu daire yatırım', 'karasu emlak yatırımı', 'karasu daire getiri'],
    internalLinks: [
      { text: 'Yatırım hesaplayıcı', url: '/yatirim-hesaplayici' },
      { text: 'Yatırım yapma rehberi', url: '/rehberler/yatirim-yapma' },
      { text: 'Karasu mahalleler', url: '/karasu-mahalleler' },
    ],
  },
  {
    title: 'Karasu\'da Daire Seçerken Önemli Kriterler ve Kontrol Listesi',
    targetKeywords: ['karasu daire seçimi', 'karasu daire kriterleri', 'karasu emlak seçimi'],
    internalLinks: [
      { text: 'Ev nasıl alınır', url: '/rehberler/ev-nasil-alinir' },
      { text: 'Ekspertiz süreci', url: '/rehberler/ekspertiz-sureci' },
      { text: 'Karasu mahalleler', url: '/karasu-mahalleler' },
    ],
  },
  {
    title: 'Karasu Satılık Daire Piyasası ve Gelecek Projeksiyonları',
    targetKeywords: ['karasu daire piyasası', 'karasu emlak trendleri', 'karasu daire gelecek'],
    internalLinks: [
      { text: 'Karasu satılık ilanlar', url: '/satilik' },
      { text: 'Yatırım hesaplayıcı', url: '/yatirim-hesaplayici' },
      { text: 'Karasu mahalleler', url: '/karasu-mahalleler' },
    ],
  },
  {
    title: 'Karasu\'da Daire Alımında Vergi ve Masraflar: Detaylı Rehber',
    targetKeywords: ['karasu daire vergileri', 'karasu emlak masrafları', 'karasu daire masraflar'],
    internalLinks: [
      { text: 'Emlak vergisi', url: '/rehberler/emlak-vergisi' },
      { text: 'Tapu işlemleri', url: '/rehberler/tapu-islemleri' },
      { text: 'Ev nasıl alınır', url: '/rehberler/ev-nasil-alinir' },
    ],
  },
];

// Blog Posts (5 adet)
const blogPosts = [
  {
    title: 'Karasu\'da Satılık Daire Fırsatları: 2024\'ün En İyi Seçenekleri',
    targetKeywords: ['karasu satılık daire fırsatları', 'karasu daire fırsat', 'karasu emlak fırsat'],
  },
  {
    title: 'Karasu Satılık Daire İlanlarında Nelere Dikkat Edilmeli?',
    targetKeywords: ['karasu daire ilanları', 'karasu emlak ilan', 'karasu daire dikkat'],
  },
  {
    title: 'Karasu\'da Daire Alırken Yapılması Gerekenler: Pratik İpuçları',
    targetKeywords: ['karasu daire alım ipuçları', 'karasu emlak alım', 'karasu daire tavsiyeler'],
  },
  {
    title: 'Karasu Satılık Daire Piyasasında Son Trendler ve Fiyat Hareketleri',
    targetKeywords: ['karasu daire trendleri', 'karasu emlak trend', 'karasu daire fiyat trend'],
  },
  {
    title: 'Karasu\'da Daire Alımında Ekspertiz Süreci ve Önemi',
    targetKeywords: ['karasu daire ekspertiz', 'karasu emlak ekspertiz', 'karasu daire kontrol'],
  },
];

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
 * Calculate reading time
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Generate cornerstone article using OpenAI
 */
async function generateCornerstoneArticle(article: typeof cornerstoneArticles[0]): Promise<void> {
  console.log(`\n📝 Generating cornerstone: "${article.title}"`);
  
  try {
    const prompt = `Sen Karasu'da 15 yıldır hizmet veren profesyonel bir emlak danışmanısın. Aşağıdaki konuda 2500+ kelimelik, kapsamlı, profesyonel ve bilgilendirici bir CORNERSTONE makale yaz.

Başlık: ${article.title}
Hedef Anahtar Kelimeler: ${article.targetKeywords.join(', ')}

Gereksinimler:
1. Minimum 2500 kelime (cornerstone makale için)
2. Tam yapılandırılmış (H2, H3 başlıklar)
3. Karasu'ya özel, yerel bilgiler içermeli
4. Profesyonel, objektif, bilgilendirici ton
5. Gerçek kullanıcı sorularını yanıtla
6. İç linkler için şu metinleri kullan: ${article.internalLinks.map(l => `[Link: ${l.text}]`).join(', ')}
7. Sakarya ve Karasu'ya özel veriler ve örnekler

Format:
- Giriş (300-400 kelime): Konuyu tanıt, Karasu'ya özel bağlam kur
- Ana bölümler (H2 başlıklar altında, her biri 400-600 kelime)
- Alt bölümler (H3 başlıklar altında)
- Pratik örnekler ve ipuçları
- Sonuç ve özet (300-400 kelime)

Önemli:
- Karasu'nun coğrafi konumu, ulaşım avantajları vurgulanmalı
- Sakarya ili bağlamında Karasu'nun yeri
- Yerel mahalle isimleri kullan (Merkez, Sahil, Yalı, Aziziye, vb.)
- Gerçekçi fiyat aralıkları (2024 verilerine uygun)
- Yatırım potansiyeli ve gelecek projeksiyonları

JSON formatında döndür:
{
  "title": "makale başlığı",
  "excerpt": "200-250 kelimelik özet",
  "content": "tam içerik (HTML formatında, H2/H3 başlıklar dahil, <p> etiketleri kullan)",
  "meta_description": "150-160 karakter SEO açıklaması",
  "seo_keywords": "virgülle ayrılmış anahtar kelimeler"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen Karasu\'da 15 yıldır hizmet veren profesyonel bir emlak danışmanısın. Profesyonel, objektif ve bilgilendirici içerik üretiyorsun. Karasu ve Sakarya\'ya özel yerel bilgilere sahipsin.',
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
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        articleData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      // Fallback: create structure from text
      articleData = {
        title: article.title,
        excerpt: responseText.substring(0, 250),
        content: responseText,
        meta_description: `${article.title} - Karasu Emlak`,
        seo_keywords: article.targetKeywords.join(', '),
      };
    }

    const slug = generateSlug(articleData.title || article.title);
    const readingTime = calculateReadingTime(articleData.content || '');

    console.log(`   🔍 Checking for existing article with slug: ${slug}`);

    // Check if article already exists
    const { data: existing, error: checkError } = await supabase
      .from('articles')
      .select('id, title, category, status')
      .eq('slug', slug)
      .maybeSingle();

    if (checkError) {
      console.error(`   ⚠️  Error checking existing:`, checkError);
    }

    if (existing) {
      console.log(`   ⏭️  Already exists: ${slug}`);
      console.log(`   📄 Existing article ID: ${existing.id}, Category: ${existing.category}, Status: ${existing.status}`);
      console.log(`   🔄 Updating existing article...`);
      
      // Update existing article instead of skipping
      const { data: updatedArticle, error: updateError } = await supabase
        .from('articles')
        .update({
          title: articleData.title || article.title,
          content: articleData.content || '',
          excerpt: articleData.excerpt || articleData.content?.substring(0, 250) || '',
          meta_description: articleData.meta_description || `${article.title} - Karasu Emlak`,
          keywords: articleData.seo_keywords ? articleData.seo_keywords.split(',').map((k: string) => k.trim()) : article.targetKeywords,
          category: 'cornerstone',
          tags: ['karasu', 'satılık daire', 'emlak', 'sakarya'],
          internal_links: article.internalLinks,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (updateError) {
        console.error(`   ❌ Error updating article:`, updateError);
        return;
      }
      
      console.log(`   ✅ Updated: ${slug} (${readingTime} min read)`);
      return;
    }

    console.log(`   ✅ Slug is available, proceeding with insert...`);

    // Insert article
    console.log(`   📝 Inserting article with slug: ${slug}`);
    const insertData = {
      title: articleData.title || article.title,
      slug,
      content: articleData.content || '',
      excerpt: articleData.excerpt || articleData.content?.substring(0, 250) || '',
      meta_description: articleData.meta_description || `${article.title} - Karasu Emlak`,
      keywords: articleData.seo_keywords ? articleData.seo_keywords.split(',').map((k: string) => k.trim()) : article.targetKeywords,
      author: 'Karasu Emlak',
      status: 'published',
      published_at: new Date().toISOString(),
      category: 'cornerstone',
      tags: ['karasu', 'satılık daire', 'emlak', 'sakarya'],
      views: 0,
      discover_eligible: true,
      internal_links: article.internalLinks,
    };

    console.log(`   📊 Insert data preview:`, {
      title: insertData.title.substring(0, 50) + '...',
      slug: insertData.slug,
      category: insertData.category,
      content_length: insertData.content.length,
    });

    const { data: newArticle, error } = await supabase
      .from('articles')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error(`   ❌ Error inserting article:`, error);
      console.error(`   ❌ Error code:`, error.code);
      console.error(`   ❌ Error message:`, error.message);
      console.error(`   ❌ Error details:`, error.details);
      console.error(`   ❌ Error hint:`, error.hint);
      return;
    }

    if (!newArticle) {
      console.error(`   ❌ No article returned from insert`);
      return;
    }

    console.log(`   ✅ Created successfully: ${slug} (${readingTime} min read)`);
    console.log(`   📄 Article ID: ${newArticle.id}`);
    console.log(`   📊 Content length: ${newArticle.content?.length || 0} characters`);
  } catch (error: any) {
    console.error(`   ❌ Error generating article:`, error.message);
  }
}

/**
 * Generate blog post using OpenAI
 */
async function generateBlogPost(article: typeof blogPosts[0]): Promise<void> {
  console.log(`\n📝 Generating blog post: "${article.title}"`);
  
  try {
    const prompt = `Sen Karasu'da 15 yıldır hizmet veren profesyonel bir emlak danışmanısın. Aşağıdaki konuda 1000-1500 kelimelik, bilgilendirici bir blog yazısı yaz.

Başlık: ${article.title}
Hedef Anahtar Kelimeler: ${article.targetKeywords.join(', ')}

Gereksinimler:
1. 1000-1500 kelime
2. Yapılandırılmış (H2/H3 başlıklar)
3. Karasu'ya özel, yerel bilgiler
4. Bilgilendirici, objektif ton
5. Gerçek kullanıcı sorularını yanıtla
6. İlgili iç linkler öner (Karasu, Kocaali, yatırım sayfalarına)
7. Sakarya ve Karasu'ya özel veriler

Format:
- Giriş (150-200 kelime)
- Ana bölümler (H2 başlıklar altında)
- Alt bölümler (H3 başlıklar altında)
- Pratik ipuçları
- Doğal bir kapanış (son paragraf normal bir paragraf gibi)

ÖNEMLİ - YAPMA:
- "Sonuç", "Özet", "Değerlendirme" başlıkları EKLEME
- "Sonuç olarak", "Özetlemek gerekirse", "Kısaca" gibi ifadeler KULLANMA
- Yazıyı doğal bir şekilde bitir, insan yazmış gibi görünmeli

Önemli:
- Karasu'nun coğrafi konumu ve avantajları
- Yerel mahalle isimleri
- Gerçekçi örnekler ve veriler

JSON formatında döndür:
{
  "title": "makale başlığı",
  "excerpt": "150-200 kelimelik özet",
  "content": "tam içerik (HTML formatında, <p> etiketleri kullan)",
  "meta_description": "150-160 karakter SEO açıklaması",
  "seo_keywords": "virgülle ayrılmış anahtar kelimeler"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen Karasu\'da 15 yıldır hizmet veren profesyonel bir emlak danışmanısın. Bilgilendirici ve objektif içerik üretiyorsun. Karasu ve Sakarya\'ya özel yerel bilgilere sahipsin.',
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
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        articleData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      articleData = {
        title: article.title,
        excerpt: responseText.substring(0, 200),
        content: responseText,
        meta_description: `${article.title} - Karasu Emlak blog`,
        seo_keywords: article.targetKeywords.join(', '),
      };
    }

    const slug = generateSlug(articleData.title || article.title);
    const readingTime = calculateReadingTime(articleData.content || '');

    // Check if article already exists
    const { data: existing, error: checkError } = await supabase
      .from('articles')
      .select('id, title, category')
      .eq('slug', slug)
      .maybeSingle();

    if (checkError) {
      console.error(`   ⚠️  Error checking existing:`, checkError.message);
    }

    if (existing) {
      console.log(`   ⏭️  Already exists: ${slug} (ID: ${existing.id}, Category: ${existing.category})`);
      return;
    }

    // Insert article
    const { data: newArticle, error } = await supabase
      .from('articles')
      .insert({
        title: articleData.title || article.title,
        slug,
        content: articleData.content || '',
        excerpt: articleData.excerpt || articleData.content?.substring(0, 200) || '',
        meta_description: articleData.meta_description || `${article.title} - Karasu Emlak`,
        keywords: articleData.seo_keywords ? articleData.seo_keywords.split(',').map((k: string) => k.trim()) : article.targetKeywords,
        author: 'Karasu Emlak',
        status: 'published',
        published_at: new Date().toISOString(),
        category: 'blog',
        tags: ['karasu', 'satılık daire', 'emlak', 'blog'],
        views: 0,
        discover_eligible: true,
        internal_links: [],
      })
      .select()
      .single();

    if (error) {
      console.error(`   ❌ Error inserting blog post:`, error);
      console.error(`   ❌ Error details:`, JSON.stringify(error, null, 2));
      return;
    }

    if (!newArticle) {
      console.error(`   ❌ No article returned from insert`);
      return;
    }

    console.log(`   ✅ Created: ${slug} (${readingTime} min read)`);
    console.log(`   📄 Article ID: ${newArticle.id}`);
  } catch (error: any) {
    console.error(`   ❌ Error generating blog post:`, error);
    console.error(`   ❌ Stack:`, error.stack);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Karasu Satılık Daire Content Generation\n');
  console.log(`📊 Plan:`);
  console.log(`   - ${cornerstoneArticles.length} cornerstone articles`);
  console.log(`   - ${blogPosts.length} blog posts\n`);
  console.log(`🔗 Supabase URL: ${supabaseUrl}\n`);

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    process.exit(1);
  }

  // Test Supabase connection
  console.log('🔍 Testing Supabase connection...');
  const { data: testData, error: testError } = await supabase
    .from('articles')
    .select('id')
    .limit(1);
  
  if (testError) {
    console.error('❌ Supabase connection error:', testError);
    process.exit(1);
  }
  console.log('✅ Supabase connection successful\n');

  // Generate cornerstone articles
  console.log('📚 Generating Cornerstone Articles...\n');
  for (const article of cornerstoneArticles) {
    await generateCornerstoneArticle(article);
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Generate blog posts
  console.log('\n📝 Generating Blog Posts...\n');
  for (const post of blogPosts) {
    await generateBlogPost(post);
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Final verification
  console.log('\n🔍 Final verification...');
  const { data: finalCheck, error: finalError } = await supabase
    .from('articles')
    .select('id, title, category, status')
    .in('category', ['cornerstone', 'blog'])
    .eq('status', 'published');
  
  if (finalError) {
    console.error('❌ Error in final check:', finalError);
  } else {
    const cornerstoneCount = finalCheck?.filter(a => a.category === 'cornerstone').length || 0;
    const blogCount = finalCheck?.filter(a => a.category === 'blog').length || 0;
    console.log(`✅ Verification complete:`);
    console.log(`   - Cornerstone articles: ${cornerstoneCount}`);
    console.log(`   - Blog posts: ${blogCount}`);
    console.log(`   - Total: ${finalCheck?.length || 0}`);
  }

  console.log('\n✅ Content generation completed!');
}

// Run
main().catch(console.error);
