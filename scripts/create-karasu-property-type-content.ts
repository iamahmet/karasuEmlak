/**
 * Create Cornerstone Articles and Blog Posts for Property Types
 * 
 * Creates:
 * - 1 cornerstone article per property type (daire, villa, arsa)
 * - 5 blog posts per property type
 * - All with images and internal linking
 * 
 * Usage:
 *   pnpm tsx scripts/create-karasu-property-type-content.ts
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

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

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Property type configurations
 */
const propertyTypes = [
  {
    type: 'daire',
    title: 'Karasu Satılık Daire',
    keywords: ['karasu satıllık daire', 'karasu satılık daire', 'karasu daire fiyatları', 'karasu satılık apartman dairesi', 'karasu daire almak'],
    cornerstoneTitle: 'Karasu Satılık Daire: 2025 Kapsamlı Alıcı Rehberi ve Piyasa Analizi',
    blogTopics: [
      'Karasu\'da Daire Alırken Dikkat Edilmesi Gerekenler',
      'Karasu Daire Fiyatları ve Piyasa Trendleri 2025',
      'Karasu\'nun En Popüler Mahallelerinde Daire Seçenekleri',
      'Karasu\'da Yatırım Amaçlı Daire Almak: Rehber',
      'Karasu Daire Kredisi ve Finansman Seçenekleri'
    ],
  },
  {
    type: 'villa',
    title: 'Karasu Satılık Villa',
    keywords: ['karasu satıllık villa', 'karasu satılık villa', 'karasu villa fiyatları', 'karasu lüks villa', 'karasu denize yakın villa'],
    cornerstoneTitle: 'Karasu Satılık Villa: 2025 Kapsamlı Alıcı Rehberi ve Piyasa Analizi',
    blogTopics: [
      'Karasu\'da Villa Alırken Dikkat Edilmesi Gerekenler',
      'Karasu Villa Fiyatları ve Lüks Emlak Piyasası 2025',
      'Karasu\'nun En Prestijli Villa Bölgeleri',
      'Karasu\'da Yatırım Amaçlı Villa Almak: Rehber',
      'Karasu Villa Özellikleri ve Yaşam Kalitesi'
    ],
  },
  {
    type: 'arsa',
    title: 'Karasu Satılık Arsa',
    keywords: ['karasu satıllık arsa', 'karasu satılık arsa', 'karasu arsa fiyatları', 'karasu imarlı arsa', 'karasu arsa yatırımı'],
    cornerstoneTitle: 'Karasu Satılık Arsa: 2025 Kapsamlı Alıcı Rehberi ve Piyasa Analizi',
    blogTopics: [
      'Karasu\'da Arsa Alırken Dikkat Edilmesi Gerekenler',
      'Karasu Arsa Fiyatları ve Piyasa Trendleri 2025',
      'Karasu\'nun En Değerli Arsa Bölgeleri',
      'Karasu\'da Yatırım Amaçlı Arsa Almak: Rehber',
      'Karasu İmarlı Arsa ve İmar Durumu Rehberi'
    ],
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
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Log SEO event
 */
async function logSEOEvent(
  eventType: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, any>
) {
  try {
    await supabase.from('seo_events').insert({
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Generate internal links text for content
 */
function generateInternalLinks(propertyType: string): string {
  const allTypes = ['daire', 'villa', 'arsa', 'ev'];
  const otherTypes = allTypes.filter(t => t !== propertyType);
  
  const links = [
    `"Karasu satılık ${otherTypes[0]}"`,
    `"Karasu satılık ${otherTypes[1]}"`,
    `"Karasu satılık ev"`,
    `"Karasu emlak yatırım rehberi"`,
    `"Karasu mahalleleri"`,
  ];
  
  return links.join(', ');
}

/**
 * Generate cornerstone article
 */
async function generateCornerstoneArticle(propertyType: typeof propertyTypes[0]) {
  console.log(`\n📚 Creating Cornerstone: "${propertyType.cornerstoneTitle}"\n`);

  try {
    const prompt = `Sen Karasu'da 15 yıldır hizmet veren profesyonel bir emlak danışmanısın. "${propertyType.title}" konusunda 2500+ kelimelik, kapsamlı, profesyonel ve bilgilendirici bir CORNERSTONE makale yaz.

Başlık: ${propertyType.cornerstoneTitle}
Hedef Anahtar Kelimeler: ${propertyType.keywords.join(', ')}
Mülk Tipi: ${propertyType.type}

Gereksinimler:
1. Minimum 2500 kelime (cornerstone makale için)
2. Tam yapılandırılmış (H2, H3 başlıklar)
3. Yatırım odaklı, veri destekli
4. Sakin, uzman tonu (satış dili yok, objektif)
5. Gerçek kullanıcı sorularını yanıtla
6. Karasu'ya özel bilgiler içer (mahalleler, fiyat aralıkları, özellikler)
7. İç linkler için şu metinleri kullan: ${generateInternalLinks(propertyType.type)}

Format:
- Giriş (300-400 kelime) - Karasu'nun ${propertyType.type} piyasasındaki konumu
- Ana bölümler (H2 başlıklar altında):
  * Karasu ${propertyType.type.charAt(0).toUpperCase() + propertyType.type.slice(1)} Piyasası Genel Bakış
  * Karasu'da ${propertyType.type.charAt(0).toUpperCase() + propertyType.type.slice(1)} Alırken Dikkat Edilmesi Gerekenler
  * Karasu Mahalleleri ve Fiyat Aralıkları
  * ${propertyType.type.charAt(0).toUpperCase() + propertyType.type.slice(1)} Tipleri ve Özellikleri
  * Yatırım Potansiyeli ve Getiri Analizi
  * Finansman Seçenekleri
  * Hukuki Süreçler ve Dikkat Edilmesi Gerekenler
- Alt bölümler (H3 başlıklar altında)
- Sonuç ve özet (300-400 kelime)

JSON formatında döndür:
{
  "title": "makale başlığı",
  "excerpt": "200-250 kelimelik özet",
  "content": "tam içerik (HTML formatında, H2/H3 başlıklar dahil, <p> tagları ile)",
  "meta_description": "150-160 karakter SEO açıklaması",
  "seo_keywords": "virgülle ayrılmış anahtar kelimeler"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen bir emlak yatırım uzmanısın. Profesyonel, objektif ve bilgilendirici içerik üretiyorsun. Türkçe yazıyorsun.',
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
      articleData = {
        title: propertyType.cornerstoneTitle,
        excerpt: responseText.substring(0, 250),
        content: responseText,
        meta_description: `${propertyType.cornerstoneTitle} - Karasu Emlak uzman rehberi ve piyasa analizi`,
        seo_keywords: propertyType.keywords.join(', '),
      };
    }

    const slug = generateSlug(articleData.title || propertyType.cornerstoneTitle);

    // Check if article already exists
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️  Cornerstone already exists: ${slug}`);
      return existing.id;
    }

    // Create article
    const { data: article, error: insertError } = await supabase
      .from('articles')
      .insert({
        title: articleData.title || propertyType.cornerstoneTitle,
        slug,
        content: articleData.content || '',
        excerpt: articleData.excerpt || '',
        meta_description: articleData.meta_description || '',
        keywords: articleData.seo_keywords ? articleData.seo_keywords.split(',').map((k: string) => k.trim()) : propertyType.keywords,
        author: 'Karasu Emlak',
        status: 'published',
        published_at: new Date().toISOString(),
        category: 'Rehber',
        views: 0,
        seo_score: 85,
        discover_eligible: true,
        internal_links: [
          { text: `Karasu satılık ${propertyType.type === 'daire' ? 'villa' : propertyType.type === 'villa' ? 'arsa' : 'daire'}`, url: `/karasu-satilik-${propertyType.type === 'daire' ? 'villa' : propertyType.type === 'villa' ? 'arsa' : 'daire'}` },
          { text: 'Karasu satılık ev', url: '/karasu-satilik-ev' },
          { text: 'Karasu emlak yatırım rehberi', url: '/karasu-emlak-yatirim-rehberi' },
        ],
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log(`✅ Created cornerstone: ${article.id} (${slug})`);

    // Generate and upload image
    await generateAndUploadImage(article.id, articleData.title || propertyType.cornerstoneTitle, slug, propertyType.type);

    // Log SEO event
    await logSEOEvent(
      'content_generated',
      'article',
      article.id,
      {
        type: 'cornerstone',
        property_type: propertyType.type,
        title: articleData.title || propertyType.cornerstoneTitle,
        word_count: (articleData.content || '').split(/\s+/).length,
        keywords: propertyType.keywords,
      }
    );

    return article.id;
  } catch (error: any) {
    console.error(`❌ Error creating cornerstone:`, error.message);
    return null;
  }
}

/**
 * Generate blog post
 */
async function generateBlogPost(propertyType: typeof propertyTypes[0], topic: string, cornerstoneId: string) {
  console.log(`\n📝 Creating Blog: "${topic}"\n`);

  try {
    const prompt = `Sen Karasu'da 15 yıldır hizmet veren profesyonel bir emlak danışmanısın. Aşağıdaki konuda 1000-1500 kelimelik, bilgilendirici bir blog yazısı yaz.

Başlık: ${topic}
Mülk Tipi: ${propertyType.type}
Anahtar Kelimeler: ${propertyType.keywords.join(', ')}

Gereksinimler:
1. 1000-1500 kelime
2. Yapılandırılmış (H2, H3 başlıklar)
3. Pratik bilgiler ve ipuçları
4. Karasu'ya özel örnekler
5. İç linkler için şu metinleri kullan: ${generateInternalLinks(propertyType.type)}, "${propertyType.cornerstoneTitle}"

JSON formatında döndür:
{
  "title": "makale başlığı",
  "excerpt": "150-200 kelimelik özet",
  "content": "tam içerik (HTML formatında)",
  "meta_description": "150-160 karakter SEO açıklaması",
  "seo_keywords": "virgülle ayrılmış anahtar kelimeler"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen bir emlak uzmanısın. Bilgilendirici ve pratik içerik üretiyorsun. Türkçe yazıyorsun.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    let articleData;
    
    try {
      articleData = JSON.parse(responseText);
    } catch {
      articleData = {
        title: topic,
        excerpt: responseText.substring(0, 200),
        content: responseText,
        meta_description: `${topic} - Karasu Emlak rehberi`,
        seo_keywords: propertyType.keywords.join(', '),
      };
    }

    const slug = generateSlug(articleData.title || topic);

    // Check if article already exists
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️  Blog already exists: ${slug}`);
      return existing.id;
    }

    // Create article
    const { data: article, error: insertError } = await supabase
      .from('articles')
      .insert({
        title: articleData.title || topic,
        slug,
        content: articleData.content || '',
        excerpt: articleData.excerpt || '',
        meta_description: articleData.meta_description || '',
        keywords: articleData.seo_keywords ? articleData.seo_keywords.split(',').map((k: string) => k.trim()) : propertyType.keywords,
        author: 'Karasu Emlak',
        status: 'published',
        published_at: new Date().toISOString(),
        category: 'Blog',
        views: 0,
        seo_score: 75,
        discover_eligible: true,
        internal_links: [
          { text: propertyType.cornerstoneTitle, url: `/blog/${generateSlug(propertyType.cornerstoneTitle)}` },
          { text: `Karasu satılık ${propertyType.type === 'daire' ? 'villa' : propertyType.type === 'villa' ? 'arsa' : 'daire'}`, url: `/karasu-satilik-${propertyType.type === 'daire' ? 'villa' : propertyType.type === 'villa' ? 'arsa' : 'daire'}` },
          { text: 'Karasu satılık ev', url: '/karasu-satilik-ev' },
        ],
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log(`✅ Created blog: ${article.id} (${slug})`);

    // Generate and upload image
    await generateAndUploadImage(article.id, articleData.title || topic, slug, propertyType.type);

    // Log SEO event
    await logSEOEvent(
      'content_generated',
      'article',
      article.id,
      {
        type: 'blog',
        property_type: propertyType.type,
        title: articleData.title || topic,
        word_count: (articleData.content || '').split(/\s+/).length,
        keywords: propertyType.keywords,
      }
    );

    return article.id;
  } catch (error: any) {
    console.error(`❌ Error creating blog:`, error.message);
    return null;
  }
}

/**
 * Generate and upload featured image
 */
async function generateAndUploadImage(articleId: string, title: string, slug: string, propertyType: string) {
  try {
    const imagePrompts: Record<string, string> = {
      daire: `Professional real estate photography: Modern apartment building in Karasu, Sakarya. Beautiful exterior with balconies, blue sky, sea view in background, well-maintained facade, natural lighting, high quality, realistic, no text, no watermark`,
      villa: `Professional real estate photography: Luxury modern villa in Karasu, Sakarya. Beautiful exterior with Mediterranean architecture, private garden, blue sky, sea view in background, well-maintained property, natural lighting, high quality, realistic, no text, no watermark`,
      arsa: `Professional real estate photography: Empty land plot in Karasu, Sakarya. Beautiful landscape with potential, blue sky, sea view in background, well-located land, natural lighting, high quality, realistic, no text, no watermark`,
    };

    const imagePrompt = imagePrompts[propertyType] || imagePrompts.daire;

    console.log('   → Generating image with DALL-E 3...');
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
    console.log('   → Uploading to Cloudinary...');

    // Download and upload to Cloudinary
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const dataUri = `data:image/png;base64,${imageBase64}`;

    const uploaded = await cloudinary.uploader.upload(dataUri, {
      public_id: `articles/${slug}`,
      folder: 'articles',
      tags: ['karasu', propertyType, 'ai-generated'],
      overwrite: true,
    });

    // Update article with featured image
    const { error: updateError } = await supabase
      .from('articles')
      .update({ featured_image: uploaded.public_id })
      .eq('id', articleId);

    if (updateError) {
      console.error('   ⚠️  Failed to update article with image:', updateError.message);
    } else {
      console.log(`   ✅ Image uploaded: ${uploaded.public_id}`);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error: any) {
    console.error('   ⚠️  Image generation/upload failed:', error instanceof Error ? error.message : 'Unknown error');
    console.log('   → Using placeholder image...');
    
    // Fallback: Use placeholder
    const placeholderUrl = `https://placehold.co/1792x1024/006AFF/FFFFFF?text=${encodeURIComponent(title.substring(0, 40).replace(/[^\w\s]/g, ''))}`;
    
    try {
      const uploaded = await cloudinary.uploader.upload(placeholderUrl, {
        public_id: `articles/${slug}`,
        folder: 'articles',
        tags: ['placeholder', 'karasu', propertyType],
        overwrite: true,
      });

      await supabase
        .from('articles')
        .update({ featured_image: uploaded.public_id })
        .eq('id', articleId);
      
      console.log(`   ✅ Placeholder uploaded: ${uploaded.public_id}`);
    } catch (placeholderError) {
      console.error('   ❌ Placeholder upload also failed');
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Creating Property Type Content\n');
  console.log('📊 Plan:');
  console.log('   - 3 Cornerstone articles (1 per property type)');
  console.log('   - 15 Blog posts (5 per property type)');
  console.log('   - All with images and internal linking\n');

  const results = {
    cornerstones: [] as string[],
    blogs: [] as string[],
    errors: [] as string[],
  };

  for (const propertyType of propertyTypes) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 Processing: ${propertyType.title}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      // Create cornerstone
      const cornerstoneId = await generateCornerstoneArticle(propertyType);
      if (cornerstoneId) {
        results.cornerstones.push(cornerstoneId);
      }

      // Create blog posts
      for (const topic of propertyType.blogTopics) {
        const blogId = await generateBlogPost(propertyType, topic, cornerstoneId || '');
        if (blogId) {
          results.blogs.push(blogId);
        }
        
        // Rate limiting between blog posts
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // Rate limiting between property types
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error: any) {
      console.error(`❌ Error processing ${propertyType.type}:`, error.message);
      results.errors.push(`${propertyType.type}: ${error.message}`);
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ Content Creation Complete!');
  console.log(`${'='.repeat(60)}\n`);
  console.log(`📊 Summary:`);
  console.log(`   - Cornerstone articles: ${results.cornerstones.length}/3`);
  console.log(`   - Blog posts: ${results.blogs.length}/15`);
  console.log(`   - Errors: ${results.errors.length}`);
  
  if (results.errors.length > 0) {
    console.log(`\n⚠️  Errors:`);
    results.errors.forEach(err => console.log(`   - ${err}`));
  }
}

// Run script
main().catch(console.error);
