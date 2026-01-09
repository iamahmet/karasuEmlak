/**
 * Script to create/update all neighborhoods in database with full SEO content
 * Run with: pnpm tsx scripts/create-all-neighborhoods.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Comprehensive list of Karasu neighborhoods
const neighborhoods = [
  { name: 'Merkez', priority: 'high' },
  { name: 'Sahil', priority: 'high' },
  { name: 'Yalı Mahallesi', priority: 'high' },
  { name: 'Liman Mahallesi', priority: 'high' },
  { name: 'İnköy', priority: 'high' },
  { name: 'Aziziye', priority: 'high' },
  { name: 'Cumhuriyet', priority: 'medium' },
  { name: 'Atatürk', priority: 'medium' },
  { name: 'Yeni Mahalle', priority: 'medium' },
  { name: 'Yenimahalle', priority: 'medium' },
  { name: 'Çamlıca', priority: 'medium' },
  { name: 'Kıyı', priority: 'medium' },
  { name: 'İnönü', priority: 'medium' },
  { name: 'Kurtuluş', priority: 'medium' },
  { name: 'Kıyı Mahallesi', priority: 'low' },
  { name: 'Deniz Mahallesi', priority: 'low' },
  { name: 'Yazlık Mahallesi', priority: 'low' },
];

// SEO content templates for each neighborhood
const seoContentTemplates: Record<string, any> = {
  'Merkez': {
    intro: 'Merkez Mahallesi, Karasu\'nun kalbi olan bölgedir. Şehir merkezine yakınlığı, gelişmiş alışveriş imkanları, bankalar, eczaneler ve toplu taşıma erişimiyle dikkat çeker. Bölgede hem daire hem de villa seçenekleri bulunmaktadır. Merkez konumu nedeniyle hem sürekli oturum hem de yatırım amaçlı tercih edilmektedir.',
    transportation: 'Merkez Mahallesi, şehir merkezine yürüme mesafesindedir. Toplu taşıma araçlarına kolay erişim imkanı sunar. Otobüs ve minibüs hatları bölgeden geçmektedir. İstanbul\'a ulaşım için otoyol erişimi kolaydır.',
    seaDistance: 'Denize yaklaşık 500-800 metre mesafededir. Sahile yürüyerek 10-15 dakikada ulaşılabilir. Deniz manzaralı konumlar mevcuttur.',
    socialLife: 'Bölgede çok sayıda kafe, restoran, alışveriş merkezi, banka ve kamu kurumları bulunmaktadır. Sosyal yaşam oldukça canlıdır. Günlük ihtiyaçlar yürüme mesafesindedir.',
    investmentPotential: 'Merkez konumu nedeniyle yatırım potansiyeli yüksektir. Hem kira geliri hem de değer artışı beklentisi güçlüdür. Özellikle sürekli kiralama potansiyeli yüksektir.',
  },
  'Sahil': {
    intro: 'Sahil Mahallesi, Karasu\'nun denize sıfır konumlu en popüler bölgelerinden biridir. Yazlık ve tatil amaçlı yatırımlar için ideal bir lokasyondur. Deniz manzaralı evler ve villalar burada bulunmaktadır. Turizm potansiyeli yüksektir.',
    transportation: 'Sahil Mahallesi, merkeze yaklaşık 2-3 km mesafededir. Özel araç veya taksi ile kolayca ulaşılabilir. Sahil yürüyüş yolu ve plaj tesisleri bulunmaktadır.',
    seaDistance: 'Denize sıfır konumdadır. Sahil yürüyüş yolu, plaj tesisleri ve deniz aktiviteleri bulunmaktadır. Yaz aylarında oldukça canlı bir ortam vardır.',
    socialLife: 'Yaz aylarında oldukça canlı bir sosyal yaşam vardır. Plaj tesisleri, restoranlar, kafeler ve eğlence mekanları bulunmaktadır. Kış aylarında daha sakin bir ortam vardır.',
    investmentPotential: 'Turizm potansiyeli yüksektir. Yazlık kira geliri ve değer artışı beklentisi güçlüdür. Özellikle yaz aylarında yüksek kiralama geliri sağlanabilir.',
  },
  'Yalı Mahallesi': {
    intro: 'Yalı Mahallesi, Karasu\'nun denize yakın özel konumlu bölgelerinden biridir. Deniz manzaralı konutlar ve yazlık evler burada bulunmaktadır. Hem yaşam hem yatırım amaçlı tercih edilmektedir.',
    transportation: 'Yalı Mahallesi, merkeze yaklaşık 1.5-2 km mesafededir. Özel araç ile kolayca ulaşılabilir. Sahil yürüyüş yolu ve plaj erişimi vardır.',
    seaDistance: 'Denize çok yakın konumdadır. Deniz manzaralı konutlar mevcuttur. Sahil yürüyüş yolu ve plaj tesisleri yakındır.',
    socialLife: 'Yaz aylarında canlı bir sosyal yaşam vardır. Plaj tesisleri, restoranlar ve kafeler bulunmaktadır. Kış aylarında sakin bir ortam vardır.',
    investmentPotential: 'Yazlık kiralama potansiyeli yüksektir. Denize yakın konumu nedeniyle yatırım değeri yüksektir. Turizm potansiyeli güçlüdür.',
  },
  'Liman Mahallesi': {
    intro: 'Liman Mahallesi, Karasu\'nun liman bölgesine yakın konumlu mahallesidir. Denize yakınlığı ve liman tesislerine yakınlığı ile dikkat çeker. Hem yaşam hem yatırım amaçlı seçenekler bulunmaktadır.',
    transportation: 'Liman Mahallesi, merkeze yaklaşık 2-3 km mesafededir. Liman tesislerine yakınlık avantajı vardır. Özel araç ile kolayca ulaşılabilir.',
    seaDistance: 'Denize yakın konumdadır. Liman tesisleri ve deniz aktiviteleri yakındır. Deniz manzaralı konutlar mevcuttur.',
    socialLife: 'Liman bölgesine yakınlık nedeniyle ticari aktiviteler yoğundur. Restoranlar, kafeler ve ticari tesisler bulunmaktadır.',
    investmentPotential: 'Liman bölgesine yakınlık nedeniyle yatırım potansiyeli vardır. Hem yaşam hem ticari amaçlı kullanım imkanı sunar.',
  },
  'İnköy': {
    intro: 'İnköy, Karasu\'nun sakin ve doğal güzellikleriyle öne çıkan bölgelerinden biridir. Denize yakın konumu ve sakin ortamı ile dikkat çeker. Aileler ve emekliler için ideal bir bölgedir.',
    transportation: 'İnköy, merkeze yaklaşık 3-4 km mesafededir. Özel araç ile kolayca ulaşılabilir. Toplu taşıma seçenekleri mevcuttur.',
    seaDistance: 'Denize yakın konumdadır. Doğal güzellikler ve sakin ortam avantajları vardır. Deniz manzaralı konutlar mevcuttur.',
    socialLife: 'Sakin ve huzurlu bir sosyal yaşam vardır. Temel ihtiyaçlar karşılanabilir. Doğa yürüyüş alanları ve parklar bulunmaktadır.',
    investmentPotential: 'Sakin ortam ve doğal güzellikler nedeniyle yatırım potansiyeli vardır. Özellikle yaşam kalitesi arayanlar için idealdir.',
  },
  'Aziziye': {
    intro: 'Aziziye Mahallesi, Karasu\'nun gelişmekte olan bölgelerinden biridir. Modern konut projeleri ve uygun fiyatlı seçenekler sunar. Hem oturum hem yatırım amaçlı tercih edilmektedir.',
    transportation: 'Aziziye Mahallesi, merkeze yaklaşık 1-2 km mesafededir. Toplu taşıma araçlarına erişim kolaydır. Gelişen altyapı avantajı vardır.',
    seaDistance: 'Denize yaklaşık 1-1.5 km mesafededir. Sahile yürüyerek 15-20 dakikada ulaşılabilir. Deniz manzaralı konutlar mevcuttur.',
    socialLife: 'Gelişmekte olan bir bölgedir. Temel ihtiyaçlar karşılanabilir, sosyal tesisler artmaktadır. Modern yaşam alanları gelişmektedir.',
    investmentPotential: 'Gelişmekte olan bölge olduğu için yatırım potansiyeli yüksektir. Uygun fiyatlı seçenekler ve gelecek değer artışı beklentisi vardır.',
  },
  'Cumhuriyet': {
    intro: 'Cumhuriyet Mahallesi, Karasu\'nun merkeze yakın sakin bir mahallesidir. Aileler için ideal bir bölgedir. Okullara ve sağlık tesislerine yakınlık avantajı vardır.',
    transportation: 'Cumhuriyet Mahallesi, merkeze yaklaşık 1 km mesafededir. Toplu taşıma araçlarına kolay erişim vardır. Yürüme mesafesinde hizmetler bulunmaktadır.',
    seaDistance: 'Denize yaklaşık 800-1000 metre mesafededir. Sahile yürüyerek 12-18 dakikada ulaşılabilir.',
    socialLife: 'Sakin ve aile dostu bir sosyal yaşam vardır. Okullar, sağlık tesisleri ve parklar yakındır. Güvenli bir ortam sunar.',
    investmentPotential: 'Merkeze yakınlık ve sakin ortam nedeniyle yatırım potansiyeli vardır. Özellikle aileler için ideal bir bölgedir.',
  },
  'Atatürk': {
    intro: 'Atatürk Mahallesi, Karasu\'nun ana cadde üzerinde bulunan bölgelerinden biridir. Ticari aktivitelerin yoğun olduğu bölgedir. Ulaşım kolaylığı ve merkeze yakınlık avantajları vardır.',
    transportation: 'Atatürk Mahallesi, ana cadde üzerinde bulunur. Toplu taşıma araçlarına kolay erişim vardır. Merkeze yürüme mesafesindedir.',
    seaDistance: 'Denize yaklaşık 600-900 metre mesafededir. Sahile yürüyerek 10-15 dakikada ulaşılabilir.',
    socialLife: 'Ticari aktivitelerin yoğun olduğu bölgedir. Alışveriş, restoran ve hizmet sektörü gelişmiştir. Canlı bir sosyal yaşam vardır.',
    investmentPotential: 'Ticari potansiyel ve merkez konumu nedeniyle yatırım değeri vardır. Hem oturum hem ticari amaçlı kullanım imkanı sunar.',
  },
  'Yeni Mahalle': {
    intro: 'Yeni Mahalle, Karasu\'nun hızla gelişen bölgelerinden biridir. Modern konut projeleri ve uygun fiyatlı seçenekler sunar. Gelişen altyapı ve yeni projelerle dikkat çeker.',
    transportation: 'Yeni Mahalle, merkeze yaklaşık 1-2 km mesafededir. Toplu taşıma araçlarına erişim kolaydır. Gelişen ulaşım ağı avantajı vardır.',
    seaDistance: 'Denize yaklaşık 1-1.5 km mesafededir. Sahile yürüyerek 15-20 dakikada ulaşılabilir.',
    socialLife: 'Gelişmekte olan bir bölgedir. Temel ihtiyaçlar karşılanabilir, sosyal tesisler artmaktadır. Modern yaşam alanları gelişmektedir.',
    investmentPotential: 'Gelişmekte olan bölge olduğu için yatırım potansiyeli yüksektir. Uygun fiyatlı seçenekler ve gelecek değer artışı beklentisi vardır.',
  },
};

// Default template for neighborhoods without specific content
const defaultSeoContent = {
  intro: (name: string) => `${name} Mahallesi, Karasu'nun önemli yerleşim bölgelerinden biridir. Denize yakınlığı, gelişmiş altyapısı ve sosyal olanaklarıyla dikkat çeker. Bölgede satılık ve kiralık emlak seçenekleri geniş bir yelpazede sunulmaktadır.`,
  transportation: 'Bölgeye toplu taşıma araçlarıyla kolayca ulaşılabilir. Merkeze yakınlık avantajı vardır.',
  seaDistance: 'Denize yakın mesafededir. Sahil erişimi kolaydır.',
  socialLife: 'Bölgede temel sosyal tesisler bulunmaktadır. Günlük ihtiyaçlar karşılanabilir.',
  investmentPotential: 'Yatırım potansiyeli mevcuttur. Konum avantajları nedeniyle değer artışı beklentisi vardır.',
};

async function createAllNeighborhoods() {
  console.log('🚀 Creating/updating all neighborhoods with full SEO content...\n');

  // Import slugify function
  function slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
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
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]+/g, '-')
      .replace(/\-\-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  for (const neighborhood of neighborhoods) {
    try {
      const slug = slugify(neighborhood.name);
      
      // Check if neighborhood exists
      const { data: existing } = await supabase
        .from('neighborhoods')
        .select('id, slug, name')
        .eq('slug', slug)
        .maybeSingle();

      const seoContent = seoContentTemplates[neighborhood.name] || {
        intro: defaultSeoContent.intro(neighborhood.name),
        transportation: defaultSeoContent.transportation,
        seaDistance: defaultSeoContent.seaDistance,
        socialLife: defaultSeoContent.socialLife,
        investmentPotential: defaultSeoContent.investmentPotential,
      };

      const neighborhoodData = {
        slug,
        name: neighborhood.name,
        district: 'Karasu',
        city: 'Sakarya',
        description: seoContent.intro,
        seo_content: seoContent,
        published: true,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        // Update existing neighborhood
        const { error } = await supabase
          .from('neighborhoods')
          .update(neighborhoodData)
          .eq('id', existing.id);

        if (error) {
          console.error(`❌ Error updating "${neighborhood.name}":`, error.message);
          continue;
        }

        console.log(`✅ Updated: "${neighborhood.name}"`);
      } else {
        // Create new neighborhood
        const { error } = await supabase
          .from('neighborhoods')
          .insert({
            ...neighborhoodData,
            created_at: new Date().toISOString(),
          });

        if (error) {
          console.error(`❌ Error creating "${neighborhood.name}":`, error.message);
          continue;
        }

        console.log(`✅ Created: "${neighborhood.name}"`);
      }
    } catch (error: any) {
      console.error(`❌ Error processing "${neighborhood.name}":`, error.message);
    }
  }

  console.log('\n✨ Neighborhoods creation/update completed!');
  console.log(`\n📊 Total neighborhoods processed: ${neighborhoods.length}`);
}

createAllNeighborhoods().catch(console.error);
