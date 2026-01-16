/**
 * Create "Ev Alırken Dikkat Edilmesi Gerekenler" blog posts for all neighborhoods
 * 
 * This script creates professional, SEO-optimized blog posts for each neighborhood
 * using Gemini AI to generate high-quality content.
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  district: string;
  city: string;
  description?: string;
}

interface GeneratedArticle {
  title: string;
  content: string;
  excerpt: string;
  meta_description: string;
  keywords: string[];
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate URL-friendly slug from Turkish text
 */
function generateSlug(text: string, maxLength: number = 100): string {
  let slug = text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/İ/g, 'i')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (slug.length > maxLength) {
    const truncated = slug.substring(0, maxLength);
    const lastHyphen = truncated.lastIndexOf('-');
    if (lastHyphen > maxLength * 0.5) {
      slug = truncated.substring(0, lastHyphen);
    } else {
      slug = truncated.replace(/-+$/, '');
    }
  }

  return slug.replace(/-+$/g, '');
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate article content using Gemini AI
 */
async function generateArticleContent(neighborhood: Neighborhood): Promise<GeneratedArticle> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4000,
    },
  });

  const prompt = `Sen Karasu Emlak için profesyonel bir emlak içerik uzmanısın. ${neighborhood.name} mahallesinde ev alırken dikkat edilmesi gerekenler hakkında kapsamlı, SEO-optimize edilmiş bir blog yazısı yaz.

MAHALLE BİLGİLERİ:
- Mahalle Adı: ${neighborhood.name}
- İlçe: ${neighborhood.district}
- Şehir: ${neighborhood.city}
${neighborhood.description ? `- Açıklama: ${neighborhood.description}` : ''}

GEREKSİNİMLER:
1. Başlık: "${neighborhood.name} Mahallesinde Ev Alırken Dikkat Edilmesi Gerekenler" formatında
2. İçerik: Minimum 2000 kelime, yapılandırılmış (H2/H3 başlıklar)
3. SEO: Anahtar kelime "${neighborhood.name} ev alırken dikkat edilmesi gerekenler" doğal şekilde kullanılmalı
4. Yerel Bilgiler: ${neighborhood.name} mahallesine özel bilgiler, özellikler, avantajlar
5. Pratik Öneriler: Yasal süreçler, teknik kontroller, finansman, konum değerlendirmesi
6. Profesyonel Ton: Bilgilendirici, güvenilir, yerel uzman görüşü

İÇERİK YAPISI:
- Giriş: ${neighborhood.name} mahallesinin genel özellikleri ve ev alım sürecinin önemi
- Konum ve Ulaşım: Mahallenin konumu, ulaşım imkanları, merkeze uzaklık
- Altyapı ve Hizmetler: Su, elektrik, internet, sağlık, eğitim hizmetleri
- Yasal Süreçler: Tapu, imar durumu, yapı ruhsatı, vergiler
- Teknik Kontroller: Yapı kalitesi, deprem dayanıklılığı, izolasyon
- Finansman Seçenekleri: Kredi imkanları, ödeme planları
- Yatırım Potansiyeli: Gelecek değer artışı, kira getirisi
- Sonuç: Özet ve öneriler

JSON formatında döndür (sadece JSON, başka açıklama yapma):
{
  "title": "Başlık",
  "content": "HTML formatında içerik (H2, H3, p, ul, li etiketleri kullan)",
  "excerpt": "150-200 kelimelik özet",
  "meta_description": "150-160 karakter SEO açıklaması",
  "keywords": ["anahtar", "kelime", "listesi"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Gemini response');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      title: parsed.title || `${neighborhood.name} Mahallesinde Ev Alırken Dikkat Edilmesi Gerekenler`,
      content: parsed.content || '',
      excerpt: parsed.excerpt || '',
      meta_description: parsed.meta_description || '',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [
        `${neighborhood.name} ev alırken dikkat edilmesi gerekenler`,
        `${neighborhood.name} emlak`,
        `${neighborhood.name} ev almak`,
        'karasu emlak rehberi',
      ],
    };
  } catch (error: any) {
    console.error(`Error generating content for ${neighborhood.name}:`, error);
    throw error;
  }
}

/**
 * Check if article already exists
 */
async function articleExists(slug: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking article existence:', error);
    return false;
  }

  return !!data;
}

/**
 * Create article for a neighborhood
 */
async function createNeighborhoodArticle(neighborhood: Neighborhood): Promise<void> {
  const slug = generateSlug(`${neighborhood.name} mahallesinde ev alırken dikkat edilmesi gerekenler`);
  
  // Check if article already exists
  if (await articleExists(slug)) {
    console.log(`⏭️  Skipping ${neighborhood.name} - article already exists: ${slug}`);
    return;
  }

  console.log(`\n📝 Creating article for ${neighborhood.name}...`);
  console.log(`   Slug: ${slug}`);

  try {
    // Generate content
    console.log(`   🤖 Generating content with Gemini...`);
    const generated = await generateArticleContent(neighborhood);

    // Create article directly in database
    console.log(`   💾 Saving to database...`);
    const { data: article, error: insertError } = await supabase
      .from('articles')
      .insert({
        title: generated.title,
        slug: slug,
        content: generated.content,
        excerpt: generated.excerpt,
        meta_description: generated.meta_description,
        keywords: generated.keywords,
        author: 'Karasu Emlak',
        status: 'published',
        category: 'Rehber',
        tags: [
          neighborhood.name.toLowerCase(),
          'ev alırken dikkat edilmesi gerekenler',
          'emlak rehberi',
          'karasu',
          neighborhood.district.toLowerCase(),
        ],
        featured_image: null,
        internal_links: [],
        discover_eligible: true,
        views: 0,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to insert article: ${insertError.message}`);
    }

    if (!article) {
      throw new Error('Article was not created');
    }

    console.log(`✅ Created: "${generated.title}" (ID: ${article.id})`);
    console.log(`   URL: /blog/${slug}`);
  } catch (error: any) {
    console.error(`❌ Error creating article for ${neighborhood.name}:`, error.message);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting neighborhood buying guides creation...\n');

  // Check environment
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  // Get all neighborhoods
  console.log('📋 Fetching neighborhoods...');
  const { data: neighborhoods, error } = await supabase
    .from('neighborhoods')
    .select('id, name, slug, district, city, description')
    .eq('published', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch neighborhoods: ${error.message}`);
  }

  if (!neighborhoods || neighborhoods.length === 0) {
    console.log('⚠️  No neighborhoods found');
    return;
  }

  console.log(`✅ Found ${neighborhoods.length} neighborhoods\n`);

  // First, create the general "Karasu" article if it doesn't exist
  console.log('📝 Checking general Karasu article...');
  const karasuSlug = generateSlug('karasu ev alırken dikkat edilmesi gerekenler');
  if (!(await articleExists(karasuSlug))) {
    console.log('   Creating general Karasu article...');
    try {
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        },
      });

      const prompt = `Sen Karasu Emlak için profesyonel bir emlak içerik uzmanısın. Karasu'da ev alırken dikkat edilmesi gerekenler hakkında kapsamlı, SEO-optimize edilmiş bir blog yazısı yaz.

GEREKSİNİMLER:
1. Başlık: "Karasu Ev Alırken Dikkat Edilmesi Gerekenler"
2. İçerik: Minimum 2500 kelime, yapılandırılmış (H2/H3 başlıklar)
3. SEO: Anahtar kelime "karasu ev alırken dikkat edilmesi gerekenler" doğal şekilde kullanılmalı
4. Yerel Bilgiler: Karasu'ya özel bilgiler, özellikler, avantajlar, mahalleler
5. Pratik Öneriler: Yasal süreçler, teknik kontroller, finansman, konum değerlendirmesi
6. Profesyonel Ton: Bilgilendirici, güvenilir, yerel uzman görüşü

JSON formatında döndür (sadece JSON, başka açıklama yapma):
{
  "title": "Karasu Ev Alırken Dikkat Edilmesi Gerekenler",
  "content": "HTML formatında içerik (H2, H3, p, ul, li etiketleri kullan)",
  "excerpt": "150-200 kelimelik özet",
  "meta_description": "150-160 karakter SEO açıklaması",
  "keywords": ["karasu ev alırken dikkat edilmesi gerekenler", "karasu emlak", "karasu ev almak", "karasu emlak rehberi"]
}`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const generated = JSON.parse(jsonMatch[0]);
        
        const { data: article, error: insertError } = await supabase
          .from('articles')
          .insert({
            title: generated.title,
            slug: karasuSlug,
            content: generated.content,
            excerpt: generated.excerpt,
            meta_description: generated.meta_description,
            keywords: generated.keywords,
            author: 'Karasu Emlak',
            status: 'published',
            category: 'Rehber',
            tags: ['karasu', 'ev alırken dikkat edilmesi gerekenler', 'emlak rehberi'],
            featured_image: null,
            internal_links: [],
            discover_eligible: true,
            views: 0,
          })
          .select()
          .single();

        if (!insertError && article) {
          console.log(`✅ Created general Karasu article: /blog/${karasuSlug}`);
        }
      }
    } catch (error: any) {
      console.error(`⚠️  Could not create general Karasu article:`, error.message);
    }
    console.log('');
  } else {
    console.log(`⏭️  General Karasu article already exists: /blog/${karasuSlug}\n`);
  }

  // Process each neighborhood
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const neighborhood of neighborhoods) {
    try {
      await createNeighborhoodArticle(neighborhood);
      successCount++;
      
      // Rate limiting: wait 2 seconds between requests to avoid API limits
      if (successCount < neighborhoods.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error: any) {
      console.error(`❌ Failed for ${neighborhood.name}:`, error.message);
      errorCount++;
      
      // Continue with next neighborhood even if one fails
      continue;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Created: ${successCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📝 Total: ${neighborhoods.length}`);
  console.log('='.repeat(60));
}

// Run script
main()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
