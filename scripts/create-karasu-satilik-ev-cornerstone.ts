/**
 * Create Cornerstone Article: "Karasu Satılık Ev"
 * 
 * Creates a comprehensive cornerstone article about buying houses in Karasu
 * with AI-generated image and publishes it immediately
 * 
 * Usage:
 *   pnpm tsx scripts/create-karasu-satilik-ev-cornerstone.ts
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
 * Main function
 */
async function main() {
  console.log('🚀 Creating Cornerstone Article: "Karasu Satılık Ev"\n');

  const articleTitle = 'Karasu Satılık Ev: 2025 Kapsamlı Alıcı Rehberi ve Piyasa Analizi';
  const targetKeywords = [
    'karasu satıllık ev',
    'karasu satılık ev',
    'karasu ev fiyatları',
    'karasu emlak',
    'karasu satılık konut',
    'karasu ev almak',
    'karasu yazlık ev',
    'karasu denize yakın ev'
  ];

  try {
    // Step 1: Generate article content
    console.log('📝 Step 1: Generating article content...');
    
    const prompt = `Sen Karasu'da 15 yıldır hizmet veren profesyonel bir emlak danışmanısın. "Karasu Satılık Ev" konusunda 2500+ kelimelik, kapsamlı, profesyonel ve bilgilendirici bir CORNERSTONE makale yaz.

Başlık: ${articleTitle}
Hedef Anahtar Kelimeler: ${targetKeywords.join(', ')}

Gereksinimler:
1. Minimum 2500 kelime (cornerstone makale için)
2. Tam yapılandırılmış (H2, H3 başlıklar)
3. Yatırım odaklı, veri destekli
4. Sakin, uzman tonu (satış dili yok, objektif)
5. Gerçek kullanıcı sorularını yanıtla
6. Karasu'ya özel bilgiler içer (mahalleler, fiyat aralıkları, özellikler)
7. İç linkler için şu metinleri kullan: "Karasu satılık daire", "Karasu kiralık ev", "Karasu emlak yatırım rehberi", "Karasu mahalleleri"

Format:
- Giriş (300-400 kelime) - Karasu'nun emlak piyasasındaki konumu
- Ana bölümler (H2 başlıklar altında):
  * Karasu Emlak Piyasası Genel Bakış
  * Karasu'da Ev Alırken Dikkat Edilmesi Gerekenler
  * Karasu Mahalleleri ve Fiyat Aralıkları
  * Ev Tipleri ve Özellikleri
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
      // If not JSON, treat as plain text
      articleData = {
        title: articleTitle,
        excerpt: responseText.substring(0, 250),
        content: responseText,
        meta_description: `${articleTitle} - Karasu Emlak uzman rehberi ve piyasa analizi`,
        seo_keywords: targetKeywords.join(', '),
      };
    }

    const slug = generateSlug(articleData.title || articleTitle);
    const readingTime = calculateReadingTime(articleData.content || '');

    // Check if article already exists
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️  Article already exists: ${slug}`);
      console.log(`   Updating existing article...`);
      
      // Update existing article
      const { data: updated, error: updateError } = await supabase
        .from('articles')
        .update({
          title: articleData.title || articleTitle,
          content: articleData.content || '',
          excerpt: articleData.excerpt || '',
          meta_description: articleData.meta_description || '',
          keywords: articleData.seo_keywords ? articleData.seo_keywords.split(',').map((k: string) => k.trim()) : targetKeywords,
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          category: 'Rehber',
          author: 'Karasu Emlak',
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      console.log(`✅ Updated article: ${updated.id}`);
      
      // Generate image for existing article
      console.log('\n🖼️  Step 2: Generating featured image...');
      await generateAndUploadImage(updated.id, articleData.title || articleTitle, slug);
      
      return;
    }

    // Step 2: Create article in database
    console.log('\n💾 Step 2: Creating article in database...');
    
    const { data: article, error: insertError } = await supabase
      .from('articles')
      .insert({
        title: articleData.title || articleTitle,
        slug,
        content: articleData.content || '',
        excerpt: articleData.excerpt || '',
        meta_description: articleData.meta_description || '',
        keywords: articleData.seo_keywords ? articleData.seo_keywords.split(',').map((k: string) => k.trim()) : targetKeywords,
        author: 'Karasu Emlak',
        status: 'published',
        published_at: new Date().toISOString(),
        category: 'Rehber',
        views: 0,
        seo_score: 85, // High score for cornerstone
        discover_eligible: true,
        internal_links: [
          { text: 'Karasu satılık daire', url: '/karasu-satilik-daire' },
          { text: 'Karasu kiralık ev', url: '/karasu-kiralik-ev' },
          { text: 'Karasu emlak yatırım rehberi', url: '/karasu-emlak-yatirim-rehberi' },
        ],
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log(`✅ Created article: ${article.id} (${slug})`);

    // Step 3: Generate and upload image
    console.log('\n🖼️  Step 3: Generating featured image...');
    await generateAndUploadImage(article.id, articleData.title || articleTitle, slug);

    // Step 4: Log SEO event
    await logSEOEvent(
      'content_generated',
      'article',
      article.id,
      {
        type: 'cornerstone',
        title: articleData.title || articleTitle,
        word_count: (articleData.content || '').split(/\s+/).length,
        keywords: targetKeywords,
        reading_time: readingTime,
      }
    );

    console.log('\n✅ Cornerstone article created and published successfully!');
    console.log(`\n📊 Article Details:`);
    console.log(`   - Title: ${articleData.title || articleTitle}`);
    console.log(`   - Slug: ${slug}`);
    console.log(`   - Word Count: ${(articleData.content || '').split(/\s+/).length}`);
    console.log(`   - Reading Time: ${readingTime} min`);
    console.log(`   - Status: Published`);
    console.log(`   - URL: /blog/${slug}`);
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message || error);
    process.exit(1);
  }
}

/**
 * Generate and upload featured image
 */
async function generateAndUploadImage(articleId: string, title: string, slug: string) {
  try {
    // Try using API endpoint first
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const apiUrl = `${baseUrl}/api/ai/generate-image`;
    
    console.log('   → Generating image with DALL-E 3 via API...');
    
    const imagePrompt = `Professional real estate photography style image: Modern Turkish coastal house in Karasu, Sakarya. Beautiful exterior with Mediterranean architecture, blue sky, sea view in background, well-maintained garden, natural lighting, high quality, realistic, no text, no watermark`;

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
            description: 'Karasu satılık ev rehberi',
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
            tags: ['cornerstone', 'karasu', 'satilik-ev', 'ai-generated'],
          },
        }),
        signal: AbortSignal.timeout(60000), // 60 second timeout
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.public_id) {
          // Update article with featured image
          const { error: updateError } = await supabase
            .from('articles')
            .update({ featured_image: result.public_id })
            .eq('id', articleId);

          if (updateError) {
            console.error('   ⚠️  Failed to update article with image:', updateError.message);
          } else {
            console.log(`   ✅ Image generated and uploaded: ${result.public_id}`);
            console.log(`   ✅ Article updated with featured image`);
            return;
          }
        }
      }
    } catch (apiError) {
      console.log('   ⚠️  API endpoint failed, trying direct generation...');
    }

    // Fallback: Direct generation
    console.log('   → Generating image directly with DALL-E 3...');
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
      tags: ['cornerstone', 'karasu', 'satilik-ev', 'ai-generated'],
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
      console.log(`   ✅ Article updated with featured image`);
    }
  } catch (error: any) {
    console.error('   ⚠️  Image generation/upload failed:', error instanceof Error ? error.message : 'Unknown error');
    console.log('   → Using placeholder image...');
    
    // Fallback: Use placeholder
    const placeholderUrl = `https://placehold.co/1792x1024/006AFF/FFFFFF?text=${encodeURIComponent(title.substring(0, 40).replace(/[^\w\s]/g, ''))}`;
    
    try {
      const uploaded = await cloudinary.uploader.upload(placeholderUrl, {
        public_id: `articles/${slug}`,
        folder: 'articles',
        tags: ['placeholder', 'karasu'],
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

// Run script
main().catch(console.error);
