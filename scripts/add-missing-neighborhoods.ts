/**
 * Add Missing Neighborhoods
 * 
 * Adds any missing neighborhoods that should have detail pages
 * but are not yet in the neighborhoods table.
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

// Slugify function (matches generateSlug from utils)
function generateSlug(text: string): string {
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

// Comprehensive list of all Karasu neighborhoods that should have pages
const allNeighborhoods = [
  'Merkez',
  'Sahil',
  'Yalı Mahallesi',
  'Liman Mahallesi',
  'İnköy',
  'Aziziye',
  'Cumhuriyet',
  'Atatürk',
  'Yeni Mahalle',
  'Yenimahalle',
  'Çamlıca',
  'Kıyı',
  'İnönü',
  'Kurtuluş',
  'Kıyı Mahallesi',
  'Deniz Mahallesi',
  'Yazlık Mahallesi',
  // Additional neighborhoods that might be missing
  'Kıyıköy',
  'Kestanelik',
  'Kurudere',
  'Kızılcık',
  'Kestane',
  'Köprübaşı',
  'Kurtköy',
  'Kızılot',
  'Kızılcık Mahallesi',
  'Köprübaşı Mahallesi',
  'Kurtköy Mahallesi',
  'Kızılot Mahallesi',
];

// Default SEO content template
const defaultSeoContent = {
  intro: (name: string) => `${name} Mahallesi, Karasu'nun önemli yerleşim bölgelerinden biridir. Denize yakınlığı, gelişmiş altyapısı ve sosyal olanaklarıyla dikkat çeker. Bölgede satılık ve kiralık emlak seçenekleri geniş bir yelpazede sunulmaktadır.`,
  transportation: 'Bölgeye toplu taşıma araçlarıyla kolayca ulaşılabilir. Merkeze yakınlık avantajı vardır.',
  seaDistance: 'Denize yakın mesafededir. Sahil erişimi kolaydır.',
  socialLife: 'Bölgede temel sosyal tesisler bulunmaktadır. Günlük ihtiyaçlar karşılanabilir.',
  investmentPotential: 'Yatırım potansiyeli mevcuttur. Konum avantajları nedeniyle değer artışı beklentisi vardır.',
};

async function addMissingNeighborhoods() {
  console.log('🚀 Checking and adding missing neighborhoods...\n');

  // Get existing neighborhoods
  const { data: existingNeighborhoods, error: fetchError } = await supabase
    .from('neighborhoods')
    .select('name, slug');

  if (fetchError) {
    console.error('❌ Error fetching existing neighborhoods:', fetchError);
    return;
  }

  const existingNames = new Set(existingNeighborhoods?.map(n => n.name.toLowerCase()) || []);
  const existingSlugs = new Set(existingNeighborhoods?.map(n => n.slug) || []);

  let added = 0;
  let skipped = 0;

  for (const name of allNeighborhoods) {
    const nameLower = name.toLowerCase();
    const slug = generateSlug(name);

    // Skip if already exists
    if (existingNames.has(nameLower) || existingSlugs.has(slug)) {
      skipped++;
      continue;
    }

    try {
      const seoContent = {
        intro: defaultSeoContent.intro(name),
        transportation: defaultSeoContent.transportation,
        seaDistance: defaultSeoContent.seaDistance,
        socialLife: defaultSeoContent.socialLife,
        investmentPotential: defaultSeoContent.investmentPotential,
      };

      const { error } = await supabase
        .from('neighborhoods')
        .insert({
          name,
          slug,
          district: 'Karasu',
          city: 'Sakarya',
          description: seoContent.intro,
          seo_content: seoContent,
          published: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error(`❌ Error adding "${name}":`, error.message);
        continue;
      }

      added++;
      console.log(`✅ Added: "${name}" (slug: ${slug})`);
    } catch (error: any) {
      console.error(`❌ Error processing "${name}":`, error.message);
    }
  }

  console.log(`\n\n✨ Process completed!`);
  console.log(`📊 Added: ${added}`);
  console.log(`⏭️  Skipped (already exists): ${skipped}`);
  console.log(`📝 Total neighborhoods: ${allNeighborhoods.length}`);
}

// CLI usage
if (require.main === module) {
  addMissingNeighborhoods().catch(console.error);
}

export { addMissingNeighborhoods };
