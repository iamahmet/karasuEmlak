/**
 * Auto-Fill Content Completion Script
 * Scans all pages and fills missing content blocks using OpenAI
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

interface PageEntity {
  id: string;
  type: 'listing' | 'article' | 'news' | 'neighborhood' | 'utility';
  slug: string;
  title: string;
  description?: string;
  description_long?: string;
  content?: string;
  seo_content?: any;
  content_generated?: boolean;
  description_generated?: boolean;
}

interface ContentFillResult {
  entityId: string;
  entityType: string;
  filled: string[];
  skipped: string[];
  errors: string[];
}

const results: ContentFillResult[] = [];

/**
 * Generate content using OpenAI
 */
async function generateContent(
  prompt: string,
  context: Record<string, any>
): Promise<string | null> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.warn('⚠️  OpenAI API key not configured. Skipping content generation.');
    return null;
  }

  try {
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: openaiKey });

    const systemPrompt = `Sen Karasu ve Kocaali bölgesinde uzman bir emlak içerik editörüsün. 
Türkçe, doğal, lokal bağlamlı, SEO-safe içerik üret. 
Keyword stuffing yapma. Gerçek bilgiler ver, doğrulanamayan iddialarda bulunma.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || null;
  } catch (error: any) {
    console.error(`Error generating content: ${error.message}`);
    return null;
  }
}

/**
 * Fill missing content for listings
 */
async function fillListings() {
  const supabase = createServiceClient();
  const result: ContentFillResult = {
    entityId: 'listings',
    entityType: 'listing',
    filled: [],
    skipped: [],
    errors: [],
  };

  try {
    const { data: listings, error } = await supabase
      .from('listings')
      .select('id, title, slug, description_short, description_long, description')
      .eq('published', true)
      .eq('available', true)
      .is('deleted_at', null);

    if (error) {
      result.errors.push(`Database error: ${error.message}`);
      return result;
    }

    if (!listings || listings.length === 0) {
      result.skipped.push('No listings found');
      return result;
    }

    console.log(`\n📋 Processing ${listings.length} listings...`);

    for (const listing of listings) {
      // Check if description_long is missing or too short
      const hasLongDescription = listing.description_long && listing.description_long.length > 200;
      
      if (!hasLongDescription && !listing.description_generated) {
        // Use listing-specific prompt (factual, no blog structure)
        const prompt = `Sen Karasu'da 15 yıldır çalışan profesyonel bir emlak danışmanısın. Müşterilere gayrimenkulü yerinde gösterirken nasıl anlatırsan, öyle yaz.

KURALLAR:
- Sadece gerçek bilgiler, özellikler, konum avantajları
- 6-10 kısa paragraf (her biri 2-4 cümle)
- Blog yapısı YOK (H2, H3, başlıklar YOK)
- Sonuç paragrafı YOK
- FAQ YOK
- Pazarlama klişeleri YOK ("hayalinizdeki", "tatil cenneti", "son yıllarda")
- HTML: Sadece <p> etiketleri kullan

İLAN BİLGİLERİ:
Başlık: ${listing.title}
Kısa Açıklama: ${listing.description_short || listing.description || 'Yok'}
Özellikler: ${JSON.stringify(listing.features || {})}

Sadece HTML formatında açıklama döndür (<p> etiketleri ile), başka açıklama yapma.`;

        const generated = await generateContent(prompt, { listing });
        
        if (generated) {
          const { error: updateError } = await supabase
            .from('listings')
            .update({
              description_long: generated,
              description_generated: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', listing.id);

          if (updateError) {
            result.errors.push(`Listing ${listing.slug}: ${updateError.message}`);
          } else {
            result.filled.push(`description_long for ${listing.slug}`);
            console.log(`  ✅ Filled description_long for ${listing.slug}`);
          }
        } else {
          result.skipped.push(`description_long for ${listing.slug} (generation failed)`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        result.skipped.push(`description_long for ${listing.slug} (already exists)`);
      }
    }
  } catch (error: any) {
    result.errors.push(`Exception: ${error.message}`);
  }

  return result;
}

/**
 * Fill missing content for neighborhoods
 */
async function fillNeighborhoods() {
  const supabase = createServiceClient();
  const result: ContentFillResult = {
    entityId: 'neighborhoods',
    entityType: 'neighborhood',
    filled: [],
    skipped: [],
    errors: [],
  };

  try {
    const { data: neighborhoods, error } = await supabase
      .from('neighborhoods')
      .select('id, name, slug, description, seo_content, content_generated')
      .eq('published', true);

    if (error) {
      result.errors.push(`Database error: ${error.message}`);
      return result;
    }

    if (!neighborhoods || neighborhoods.length === 0) {
      result.skipped.push('No neighborhoods found');
      return result;
    }

    console.log(`\n📋 Processing ${neighborhoods.length} neighborhoods...`);

    for (const neighborhood of neighborhoods) {
      // Check if seo_content is missing or incomplete
      const hasSEOContent = neighborhood.seo_content && 
        typeof neighborhood.seo_content === 'object' &&
        neighborhood.seo_content.sections &&
        Array.isArray(neighborhood.seo_content.sections) &&
        neighborhood.seo_content.sections.length >= 4;

      if (!hasSEOContent && !neighborhood.content_generated) {
        const prompt = `Aşağıdaki mahalle için SEO-friendly, yapılandırılmış içerik oluştur (JSON format):
        
Mahalle: ${neighborhood.name}
Açıklama: ${neighborhood.description || 'Yok'}

JSON formatında şu bölümleri içermeli:
{
  "intro": "Giriş paragrafı (100-150 kelime)",
  "sections": [
    {
      "title": "Ulaşım",
      "content": "Ulaşım bilgileri (100-150 kelime)"
    },
    {
      "title": "Denize Yakınlık",
      "content": "Denize mesafe ve erişim (100-150 kelime)"
    },
    {
      "title": "Sosyal Yaşam",
      "content": "Sosyal yaşam ve aktiviteler (100-150 kelime)"
    },
    {
      "title": "Yatırım Potansiyeli",
      "content": "Yatırım değerlendirmesi (nötr ton, 100-150 kelime)"
    },
    {
      "title": "Kimler İçin Uygun",
      "content": "Hedef kitle analizi (100-150 kelime)"
    }
  ],
  "faqs": [
    {
      "question": "Soru 1",
      "answer": "Cevap 1 (40-90 kelime)"
    },
    {
      "question": "Soru 2",
      "answer": "Cevap 2 (40-90 kelime)"
    }
  ]
}

Sadece JSON döndür, başka açıklama yapma.`;

        const generated = await generateContent(prompt, { neighborhood });
        
        if (generated) {
          try {
            // Extract JSON from response
            const jsonMatch = generated.match(/\{[\s\S]*\}/);
            const jsonContent = jsonMatch ? jsonMatch[0] : generated;
            const parsed = JSON.parse(jsonContent);

            const { error: updateError } = await supabase
              .from('neighborhoods')
              .update({
                seo_content: parsed,
                content_generated: true,
                updated_at: new Date().toISOString(),
              })
              .eq('id', neighborhood.id);

            if (updateError) {
              result.errors.push(`Neighborhood ${neighborhood.slug}: ${updateError.message}`);
            } else {
              result.filled.push(`seo_content for ${neighborhood.slug}`);
              console.log(`  ✅ Filled seo_content for ${neighborhood.slug}`);
            }
          } catch (parseError: any) {
            result.errors.push(`Neighborhood ${neighborhood.slug}: JSON parse error`);
          }
        } else {
          result.skipped.push(`seo_content for ${neighborhood.slug} (generation failed)`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        result.skipped.push(`seo_content for ${neighborhood.slug} (already exists)`);
      }
    }
  } catch (error: any) {
    result.errors.push(`Exception: ${error.message}`);
  }

  return result;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting content fill process...\n');

  const force = process.argv.includes('--force');

  if (force) {
    console.log('⚠️  Force mode: Will regenerate existing content\n');
  }

  // Fill listings
  const listingsResult = await fillListings();
  results.push(listingsResult);

  // Fill neighborhoods
  const neighborhoodsResult = await fillNeighborhoods();
  results.push(neighborhoodsResult);

  // Print summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('CONTENT FILL SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  results.forEach(result => {
    console.log(`${result.entityType.toUpperCase()}:`);
    console.log(`  ✅ Filled: ${result.filled.length}`);
    console.log(`  ⏭️  Skipped: ${result.skipped.length}`);
    console.log(`  ❌ Errors: ${result.errors.length}`);
    if (result.errors.length > 0) {
      result.errors.forEach(error => console.log(`    - ${error}`));
    }
    console.log('');
  });

  const totalFilled = results.reduce((sum, r) => sum + r.filled.length, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped.length, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total: ${totalFilled} filled, ${totalSkipped} skipped, ${totalErrors} errors`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

if (require.main === module) {
  main().catch(console.error);
}

export { fillListings, fillNeighborhoods };
