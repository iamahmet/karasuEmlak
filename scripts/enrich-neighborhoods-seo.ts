/**
 * Script to enrich neighborhoods with SEO content
 * Run with: pnpm tsx scripts/enrich-neighborhoods-seo.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Common neighborhoods in Karasu
const neighborhoods = [
  'Merkez',
  'Sahil',
  'Yeni Mahalle',
  'Cumhuriyet',
  'Atatürk',
  'İnönü',
  'Kurtuluş',
  'Yenimahalle',
  'Çamlıca',
  'Kıyı',
];

const seoContentTemplates: Record<string, any> = {
  Merkez: {
    intro: 'Merkez Mahallesi, Karasu\'nun kalbi olan bölgedir. Şehir merkezine yakınlığı, gelişmiş alışveriş imkanları ve toplu taşıma erişimiyle dikkat çeker. Bölgede hem daire hem de villa seçenekleri bulunmaktadır.',
    transportation: 'Merkez Mahallesi, şehir merkezine yürüme mesafesindedir. Toplu taşıma araçlarına kolay erişim imkanı sunar. Otobüs ve minibüs hatları bölgeden geçmektedir.',
    seaDistance: 'Denize yaklaşık 500-800 metre mesafededir. Sahile yürüyerek 10-15 dakikada ulaşılabilir.',
    socialLife: 'Bölgede çok sayıda kafe, restoran ve alışveriş merkezi bulunmaktadır. Sosyal yaşam oldukça canlıdır.',
    investmentPotential: 'Merkez konumu nedeniyle yatırım potansiyeli yüksektir. Kira geliri ve değer artışı beklentisi güçlüdür.',
  },
  Sahil: {
    intro: 'Sahil Mahallesi, Karasu\'nun denize sıfır konumlu en popüler bölgelerinden biridir. Yazlık ve tatil amaçlı yatırımlar için ideal bir lokasyondur.',
    transportation: 'Sahil Mahallesi, merkeze yaklaşık 2-3 km mesafededir. Özel araç veya taksi ile kolayca ulaşılabilir.',
    seaDistance: 'Denize sıfır konumdadır. Sahil yürüyüş yolu ve plaj tesisleri bulunmaktadır.',
    socialLife: 'Yaz aylarında oldukça canlı bir sosyal yaşam vardır. Plaj tesisleri, restoranlar ve eğlence mekanları bulunmaktadır.',
    investmentPotential: 'Turizm potansiyeli yüksektir. Yazlık kira geliri ve değer artışı beklentisi güçlüdür.',
  },
  'Yeni Mahalle': {
    intro: 'Yeni Mahalle, Karasu\'nun hızla gelişen bölgelerinden biridir. Modern konut projeleri ve uygun fiyatlı seçenekler sunar.',
    transportation: 'Merkeze yaklaşık 1-2 km mesafededir. Toplu taşıma araçlarına erişim kolaydır.',
    seaDistance: 'Denize yaklaşık 1-1.5 km mesafededir. Sahile yürüyerek 15-20 dakikada ulaşılabilir.',
    socialLife: 'Gelişmekte olan bir bölgedir. Temel ihtiyaçlar karşılanabilir, sosyal tesisler artmaktadır.',
    investmentPotential: 'Gelişmekte olan bölge olduğu için yatırım potansiyeli yüksektir. Uygun fiyatlı seçenekler mevcuttur.',
  },
};

async function enrichNeighborhoods() {
  console.log('🚀 Enriching neighborhoods with SEO content...\n');

  for (const neighborhood of neighborhoods) {
    try {
      const slug = neighborhood.toLowerCase().replace(/\s+/g, '-');
      
      // Check if neighborhood exists
      const { data: existing } = await supabase
        .from('neighborhoods')
        .select('id, slug')
        .eq('slug', slug)
        .maybeSingle();

      const seoContent = seoContentTemplates[neighborhood] || {
        intro: `${neighborhood} Mahallesi, Karasu'nun önemli yerleşim bölgelerinden biridir. Denize yakınlığı, gelişmiş altyapısı ve sosyal olanaklarıyla dikkat çeker.`,
        transportation: 'Bölgeye toplu taşıma araçlarıyla kolayca ulaşılabilir.',
        seaDistance: 'Denize yakın mesafededir.',
        socialLife: 'Bölgede temel sosyal tesisler bulunmaktadır.',
        investmentPotential: 'Yatırım potansiyeli mevcuttur.',
      };

      if (existing) {
        // Update existing neighborhood
        const { error } = await supabase
          .from('neighborhoods')
          .update({
            seo_content: seoContent,
            description: seoContent.intro,
            published: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) {
          console.error(`❌ Error updating "${neighborhood}":`, error.message);
          continue;
        }

        console.log(`✅ Updated: "${neighborhood}"`);
      } else {
        // Create new neighborhood
        const { error } = await supabase
          .from('neighborhoods')
          .insert({
            slug,
            name: neighborhood,
            district: 'Karasu',
            city: 'Sakarya',
            description: seoContent.intro,
            seo_content: seoContent,
            published: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error(`❌ Error creating "${neighborhood}":`, error.message);
          continue;
        }

        console.log(`✅ Created: "${neighborhood}"`);
      }
    } catch (error: any) {
      console.error(`❌ Error processing "${neighborhood}":`, error.message);
    }
  }

  console.log('\n✨ Neighborhoods enrichment completed!');
}

enrichNeighborhoods().catch(console.error);

