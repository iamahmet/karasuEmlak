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
import OpenAI from 'openai';

// Load environment variables from multiple locations
const envPaths = [
  resolve(__dirname, '../.env.local'),
  resolve(__dirname, '../admin/.env.local'),
  resolve(__dirname, '../apps/web/.env.local'),
  resolve(__dirname, '../apps/admin/.env.local'),
];

for (const envPath of envPaths) {
  try {
    dotenv.config({ path: envPath, override: false }); // Don't override existing vars
  } catch (e) {
    // Ignore if file doesn't exist
  }
}

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
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
}

/**
 * Generate article content using Gemini AI or OpenAI (fallback)
 */
async function generateArticleContent(neighborhood: Neighborhood): Promise<GeneratedArticle> {
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

  // Try Gemini first
  const genAI = getGeminiClient();
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000,
        },
      });

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
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
      }
    } catch (error: any) {
      console.warn(`   ⚠️  Gemini failed, trying OpenAI fallback...`);
    }
  }

  // Fallback to OpenAI
  const openai = getOpenAIClient();
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sen Karasu Emlak için profesyonel bir emlak içerik uzmanısın. SEO-optimize edilmiş, bilgilendirici blog yazıları üretiyorsun.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 4000,
      });

      const parsed = JSON.parse(response.choices[0].message.content || '{}');
      
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
      console.error(`Error generating content with OpenAI for ${neighborhood.name}:`, error);
      throw error;
    }
  }

  // If no API keys, create template content
  console.warn(`   ⚠️  No AI API keys available, creating template content for ${neighborhood.name}`);
  
  return {
    title: `${neighborhood.name} Mahallesinde Ev Alırken Dikkat Edilmesi Gerekenler`,
    content: `<h2>${neighborhood.name} Mahallesinde Ev Alırken Dikkat Edilmesi Gerekenler</h2>
<p>${neighborhood.name} mahallesinde ev alırken dikkat edilmesi gereken önemli noktalar hakkında kapsamlı bir rehber.</p>

<h2>Konum ve Ulaşım</h2>
<p>${neighborhood.name} mahallesi ${neighborhood.district} ilçesinde yer almaktadır. Mahallenin konumu, ulaşım imkanları ve merkeze uzaklığı ev alım kararınızı etkileyen önemli faktörlerdir.</p>

<h2>Altyapı ve Hizmetler</h2>
<p>Mahallede su, elektrik, internet, sağlık ve eğitim hizmetlerinin durumunu kontrol etmek önemlidir.</p>

<h2>Yasal Süreçler</h2>
<p>Ev alırken tapu, imar durumu, yapı ruhsatı ve vergiler konusunda dikkatli olunmalıdır.</p>

<h2>Teknik Kontroller</h2>
<p>Yapı kalitesi, deprem dayanıklılığı ve izolasyon gibi teknik özellikler mutlaka kontrol edilmelidir.</p>

<h2>Finansman Seçenekleri</h2>
<p>Kredi imkanları ve ödeme planları hakkında bilgi alınmalıdır.</p>

<h2>Yatırım Potansiyeli</h2>
<p>${neighborhood.name} mahallesindeki emlak yatırım potansiyeli ve gelecek değer artışı değerlendirilmelidir.</p>

<p><strong>Not:</strong> Bu içerik template olarak oluşturulmuştur. AI API key'leri eklendiğinde otomatik olarak güncellenecektir.</p>`,
    excerpt: `${neighborhood.name} mahallesinde ev alırken dikkat edilmesi gereken tüm önemli noktalar, yasal süreçler, teknik kontroller ve finansman seçenekleri hakkında kapsamlı rehber.`,
    meta_description: `${neighborhood.name} mahallesinde ev alırken dikkat edilmesi gerekenler. Yasal süreçler, teknik kontroller, finansman ve yatırım potansiyeli hakkında detaylı bilgi.`,
    keywords: [
      `${neighborhood.name} ev alırken dikkat edilmesi gerekenler`,
      `${neighborhood.name} emlak`,
      `${neighborhood.name} ev almak`,
      'karasu emlak rehberi',
      `${neighborhood.district} emlak`,
    ],
  };
}

/**
 * Check if article already exists and if it's a template
 */
async function articleExists(slug: string): Promise<{ exists: boolean; isTemplate: boolean }> {
  const { data, error } = await supabase
    .from('articles')
    .select('id, content')
    .eq('slug', slug)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking article existence:', error);
    return { exists: false, isTemplate: false };
  }

  if (!data) {
    return { exists: false, isTemplate: false };
  }

  // Check if content is a template (contains template markers or is very short)
  const content = data.content || '';
  const isTemplate = 
    content.includes('template olarak oluşturulmuştur') || 
    content.includes('AI API key') ||
    content.includes('AI API key\'leri eklendiğinde') ||
    (content.length < 1500) || // Very short content likely template
    (content.split('<h2>').length < 4); // Less than 4 H2 sections likely template

  return { exists: true, isTemplate };
}

/**
 * Create article for a neighborhood
 */
async function createNeighborhoodArticle(neighborhood: Neighborhood, updateTemplates: boolean = true): Promise<void> {
  const slug = generateSlug(`${neighborhood.name} mahallesinde ev alırken dikkat edilmesi gerekenler`);
  
  // Check if article already exists and if it's a template
  const articleCheck = await articleExists(slug);
  if (articleCheck.exists) {
    if (articleCheck.isTemplate && updateTemplates) {
      console.log(`🔄 Updating template content for ${neighborhood.name}...`);
    } else {
      console.log(`⏭️  Skipping ${neighborhood.name} - article already exists: ${slug}`);
      return;
    }
  }

  console.log(`\n📝 Creating article for ${neighborhood.name}...`);
  console.log(`   Slug: ${slug}`);

  try {
    // Generate content
    console.log(`   🤖 Generating content with Gemini...`);
    const generated = await generateArticleContent(neighborhood);

    // Create or update article directly in database
    console.log(`   💾 Saving to database...`);
    
    if (articleCheck.exists) {
      // Update existing article
      const { data: article, error: updateError } = await supabase
        .from('articles')
        .update({
          title: generated.title,
          content: generated.content,
          excerpt: generated.excerpt,
          meta_description: generated.meta_description,
          keywords: generated.keywords,
          updated_at: new Date().toISOString(),
        })
        .eq('slug', slug)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update article: ${updateError.message}`);
      }

      if (!article) {
        throw new Error('Article was not updated');
      }

      console.log(`✅ Updated: "${generated.title}" (ID: ${article.id})`);
      console.log(`   URL: /blog/${slug}`);
      return;
    }
    
    // Insert new article
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

  // Check environment - if no API keys, we'll create template content
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  
  if (!hasGemini && !hasOpenAI) {
    console.warn('⚠️  WARNING: No AI API keys found (GEMINI_API_KEY or OPENAI_API_KEY)');
    console.warn('   Script will create template content without AI generation.');
    console.warn('   For full AI-generated content, please add API keys to .env.local\n');
  } else {
    console.log(`✅ Using ${hasGemini ? 'Gemini' : 'OpenAI'} API for content generation\n`);
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

  // Update templates flag - set to true to update template content with AI
  const updateTemplates = true;

  // First, create the general "Karasu" article if it doesn't exist or is template
  console.log('📝 Checking general Karasu article...');
  const karasuSlug = generateSlug('karasu ev alırken dikkat edilmesi gerekenler');
  const karasuCheck = await articleExists(karasuSlug);
  if (!karasuCheck.exists || (karasuCheck.isTemplate && updateTemplates)) {
    if (karasuCheck.exists && karasuCheck.isTemplate) {
      console.log('   Updating template content for general Karasu article...');
    } else {
      console.log('   Creating general Karasu article...');
    }
    console.log('   Creating general Karasu article...');
    try {
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

      let generated;
      
      // Try Gemini first
      const genAI = getGeminiClient();
      if (genAI) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4000,
            },
          });
          const result = await model.generateContent(prompt);
          const response = result.response.text();
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            generated = JSON.parse(jsonMatch[0]);
          }
        } catch (error: any) {
          console.warn(`   ⚠️  Gemini failed, trying OpenAI fallback...`);
        }
      }

      // Fallback to OpenAI
      if (!generated) {
        const openai = getOpenAIClient();
        if (openai) {
          try {
            const response = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: 'Sen Karasu Emlak için profesyonel bir emlak içerik uzmanısın. SEO-optimize edilmiş, bilgilendirici blog yazıları üretiyorsun.',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              response_format: { type: 'json_object' },
              temperature: 0.7,
              max_tokens: 4000,
            });
            generated = JSON.parse(response.choices[0].message.content || '{}');
          } catch (error: any) {
            console.warn(`   ⚠️  OpenAI also failed, creating template content...`);
          }
        }
      }

      // If still no generated content, create template
      if (!generated) {
        generated = {
          title: 'Karasu Ev Alırken Dikkat Edilmesi Gerekenler',
          content: `<h2>Karasu Ev Alırken Dikkat Edilmesi Gerekenler</h2>
<p>Karasu'da ev alırken dikkat edilmesi gereken tüm önemli noktalar, yasal süreçler, teknik kontroller ve finansman seçenekleri hakkında kapsamlı rehber.</p>

<h2>Konum ve Ulaşım</h2>
<p>Karasu ilçesinin konumu, ulaşım imkanları ve merkeze uzaklığı ev alım kararınızı etkileyen önemli faktörlerdir.</p>

<h2>Altyapı ve Hizmetler</h2>
<p>İlçede su, elektrik, internet, sağlık ve eğitim hizmetlerinin durumunu kontrol etmek önemlidir.</p>

<h2>Yasal Süreçler</h2>
<p>Ev alırken tapu, imar durumu, yapı ruhsatı ve vergiler konusunda dikkatli olunmalıdır.</p>

<h2>Teknik Kontroller</h2>
<p>Yapı kalitesi, deprem dayanıklılığı ve izolasyon gibi teknik özellikler mutlaka kontrol edilmelidir.</p>

<h2>Finansman Seçenekleri</h2>
<p>Kredi imkanları ve ödeme planları hakkında bilgi alınmalıdır.</p>

<h2>Yatırım Potansiyeli</h2>
<p>Karasu'daki emlak yatırım potansiyeli ve gelecek değer artışı değerlendirilmelidir.</p>

<p><strong>Not:</strong> Bu içerik template olarak oluşturulmuştur. AI API key'leri eklendiğinde otomatik olarak güncellenecektir.</p>`,
          excerpt: 'Karasu\'da ev alırken dikkat edilmesi gereken tüm önemli noktalar, yasal süreçler, teknik kontroller ve finansman seçenekleri hakkında kapsamlı rehber.',
          meta_description: 'Karasu ev alırken dikkat edilmesi gerekenler. Yasal süreçler, teknik kontroller, finansman ve yatırım potansiyeli hakkında detaylı bilgi.',
          keywords: ['karasu ev alırken dikkat edilmesi gerekenler', 'karasu emlak', 'karasu ev almak', 'karasu emlak rehberi'],
        };
      }

      if (generated) {
        if (karasuCheck.exists) {
          // Update existing article
          const { data: article, error: updateError } = await supabase
            .from('articles')
            .update({
              title: generated.title,
              content: generated.content,
              excerpt: generated.excerpt,
              meta_description: generated.meta_description,
              keywords: generated.keywords,
              updated_at: new Date().toISOString(),
            })
            .eq('slug', karasuSlug)
            .select()
            .single();

          if (!updateError && article) {
            console.log(`✅ Updated general Karasu article: /blog/${karasuSlug}`);
          }
        } else {
          // Insert new article
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
      await createNeighborhoodArticle(neighborhood, updateTemplates);
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
