/**
 * Fast Listing Creator
 * Creates realistic listings for Karasu Emlak quickly
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const [key, ...values] = line.split('=');
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and Service Role Key must be set');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Karasu neighborhoods
const neighborhoods = [
  'Merkez', 'Yalı', 'Liman', 'Çataltepe', 'Aziziye', 'Cumhuriyet', 
  'Atatürk', 'Bota', 'Camlık', 'Kurtuluş', 'Sahil', 'Deniz'
];

// Property types
const propertyTypes = ['daire', 'villa', 'ev', 'yazlik', 'arsa', 'isyeri'];

// Status
const statuses: ('satilik' | 'kiralik')[] = ['satilik', 'kiralik'];

// Generate slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generate realistic listing
function generateListing(index: number) {
  const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
  const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  const propertyTypeNames: Record<string, string> = {
    'daire': 'Daire',
    'villa': 'Villa',
    'ev': 'Müstakil Ev',
    'yazlik': 'Yazlık',
    'arsa': 'Arsa',
    'isyeri': 'İşyeri',
  };

  const basePrice = status === 'satilik' 
    ? [500000, 1500000, 2500000, 3500000, 5000000][Math.floor(Math.random() * 5)]
    : [5000, 8000, 12000, 15000, 20000][Math.floor(Math.random() * 5)];

  const priceVariation = basePrice * (0.8 + Math.random() * 0.4);
  const price = Math.round(priceVariation / 1000) * 1000;

  const sizeM2 = propertyType === 'arsa'
    ? [300, 500, 750, 1000, 1500][Math.floor(Math.random() * 5)]
    : [80, 120, 150, 200, 250, 300][Math.floor(Math.random() * 6)];

  const rooms = propertyType === 'arsa' ? null : [2, 3, 4, 5][Math.floor(Math.random() * 4)];
  const bathrooms = propertyType === 'arsa' ? null : [1, 2, 3][Math.floor(Math.random() * 3)];

  const title = `${neighborhood} ${status === 'satilik' ? 'Satılık' : 'Kiralık'} ${propertyTypeNames[propertyType]}`;
  const slug = `${generateSlug(title)}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

  return {
    title,
    slug,
    status,
    property_type: propertyType,
    location_neighborhood: neighborhood,
    location_district: 'Karasu',
    location_city: 'Sakarya',
    location_full_address: `${neighborhood} Mahallesi, Karasu, Sakarya`,
    price_amount: price,
    price_currency: 'TRY',
    features: {
      sizeM2: sizeM2,
      rooms: rooms,
      bathrooms: bathrooms,
      buildingAge: [1, 5, 10, 15, 20][Math.floor(Math.random() * 5)],
      floor: propertyType === 'arsa' ? null : [1, 2, 3, 4, 5][Math.floor(Math.random() * 5)],
      totalFloors: propertyType === 'arsa' ? null : [2, 3, 4, 5][Math.floor(Math.random() * 4)],
      balcony: Math.random() > 0.3,
      parking: Math.random() > 0.2,
      elevator: propertyType === 'daire' && Math.random() > 0.4,
      seaView: (neighborhood === 'Yalı' || neighborhood === 'Sahil' || neighborhood === 'Deniz') && Math.random() > 0.3,
      furnished: status === 'kiralik' && Math.random() > 0.5,
    },
    description_short: `${neighborhood} mahallesinde, ${status === 'satilik' ? 'satılık' : 'kiralık'} ${propertyTypeNames[propertyType].toLowerCase()}. ${sizeM2} m²${rooms ? ', ' + rooms + ' oda' : ''}${bathrooms ? ', ' + bathrooms + ' banyo' : ''}.`,
    description_long: `<p>${neighborhood} mahallesinde konumlanmış bu ${propertyTypeNames[propertyType].toLowerCase()}, ${status === 'satilik' ? 'satın alma' : 'kiralama'} için ideal bir seçenektir.</p>
<p>${sizeM2} metrekare büyüklüğündeki ${propertyTypeNames[propertyType].toLowerCase()}, ${rooms ? rooms + ' odalı' : 'geniş'} bir yapıya sahiptir. ${bathrooms ? bathrooms + ' banyo' : ''} bulunmaktadır.</p>
<p>${neighborhood} mahallesi, Karasu'nun ${neighborhood === 'Merkez' ? 'merkezi konumunda' : neighborhood === 'Yalı' || neighborhood === 'Sahil' ? 'denize yakın' : 'sakin'} bir bölgesinde yer almaktadır.</p>
<p>Detaylı bilgi ve görüntüleme için +90 546 639 54 61 numaralı telefondan bizimle iletişime geçebilirsiniz.</p>`,
    images: (() => {
      // Map property types to real estate keywords
      const keywordMap: Record<string, string> = {
        'villa': 'luxury-villa',
        'yazlik': 'summer-house',
        'arsa': 'land-property',
        'daire': 'apartment',
        'ev': 'house',
        'isyeri': 'commercial-building',
      };
      const keyword = keywordMap[propertyType] || 'real-estate';
      const seed = `${keyword}-${neighborhood}-${index}`.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000;
      return [
        `https://picsum.photos/seed/${keyword}-${seed}/800/600`,
        `https://picsum.photos/seed/${keyword}-${seed + 1}/800/600`,
        `https://picsum.photos/seed/${keyword}-${seed + 2}/800/600`,
      ];
    })(),
    published: true,
    available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function createListings(count: number = 50) {
  console.log(`🚀 Creating ${count} listings...\n`);

  const listings = [];
  for (let i = 0; i < count; i++) {
    listings.push(generateListing(i));
  }

  // Batch insert (Supabase allows up to 1000 rows per insert)
  const batchSize = 50;
  let created = 0;
  let errors = 0;

  for (let i = 0; i < listings.length; i += batchSize) {
    const batch = listings.slice(i, i + batchSize);
    
    const { data, error } = await supabase
      .from('listings')
      .insert(batch)
      .select('id, title');

    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      errors += batch.length;
    } else {
      created += data?.length || 0;
      console.log(`✅ Created batch ${Math.floor(i / batchSize) + 1}: ${data?.length || 0} listings`);
    }
  }

  console.log(`\n✨ Completed!`);
  console.log(`   Created: ${created}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total in database: ${created} listings`);
}

// Check existing listings
async function checkListings() {
  const { data, error, count } = await supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .limit(5);

  if (error) {
    console.error('❌ Error checking listings:', error);
    return;
  }

  console.log(`📊 Current listings in database: ${count || 0}`);
  if (data && data.length > 0) {
    console.log(`\nSample listings:`);
    data.forEach((listing, i) => {
      console.log(`  ${i + 1}. ${listing.title} (${listing.status}) - /ilan/${listing.slug}`);
    });
  }
}

async function main() {
  const args = process.argv.slice(2);
  const count = args[0] ? parseInt(args[0], 10) : 50;

  console.log('📋 Checking existing listings...\n');
  await checkListings();
  console.log('\n');

  if (count > 0) {
    await createListings(count);
  }
}

main().catch(console.error);
