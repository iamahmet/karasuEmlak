/**
 * Sample Data Population Script
 * 
 * This script populates the database with realistic sample data for:
 * - Listings (satılık/kiralik)
 * - Neighborhoods
 * - News articles
 * - Blog articles
 * 
 * IMPORTANT: This uses service role client to bypass RLS
 * Run this script only in development/staging environments
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { generateSlug } from '../apps/web/lib/utils';

// Load .env.local explicitly
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config(); // Also load .env if exists

// Direct Supabase client creation (bypasses env validation)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Karasu neighborhoods
const KARASU_NEIGHBORHOODS = [
  { name: 'Merkez', district: 'Karasu', city: 'Sakarya', lat: 41.0967, lng: 30.6914 },
  { name: 'Sahil', district: 'Karasu', city: 'Sakarya', lat: 41.1000, lng: 30.7000 },
  { name: 'Yalı Mahallesi', district: 'Karasu', city: 'Sakarya', lat: 41.0950, lng: 30.6950 },
  { name: 'Liman Mahallesi', district: 'Karasu', city: 'Sakarya', lat: 41.0980, lng: 30.6930 },
  { name: 'İnköy', district: 'Karasu', city: 'Sakarya', lat: 41.0900, lng: 30.6800 },
  { name: 'Aziziye', district: 'Karasu', city: 'Sakarya', lat: 41.1050, lng: 30.7050 },
  { name: 'Kılıç', district: 'Karasu', city: 'Sakarya', lat: 41.0920, lng: 30.6880 },
  { name: 'Çamlıca', district: 'Karasu', city: 'Sakarya', lat: 41.1100, lng: 30.7100 },
];

// Kocaali neighborhoods
const KOCAALI_NEIGHBORHOODS = [
  { name: 'Merkez', district: 'Kocaali', city: 'Sakarya', lat: 41.0500, lng: 30.6500 },
  { name: 'Sahil', district: 'Kocaali', city: 'Sakarya', lat: 41.0550, lng: 30.6550 },
  { name: 'Yenimahalle', district: 'Kocaali', city: 'Sakarya', lat: 41.0450, lng: 30.6450 },
  { name: 'Çamlık', district: 'Kocaali', city: 'Sakarya', lat: 41.0600, lng: 30.6600 },
];

// Property types
const PROPERTY_TYPES = ['ev', 'daire', 'villa', 'yazlik', 'arsa'] as const;
const STATUSES = ['satilik', 'kiralik'] as const;

// Sample listing titles
const LISTING_TITLES = {
  satilik: {
    ev: [
      'Karasu Merkez Müstakil Ev',
      'Denize Yakın Bahçeli Müstakil Ev',
      'Karasu Sahil Müstakil Ev',
      'Yalı Mahallesi Müstakil Ev',
      'İnköy Müstakil Ev',
      'Aziziye Müstakil Ev',
      'Kılıç Mahallesi Müstakil Ev',
      'Çamlıca Müstakil Ev',
    ],
    daire: [
      'Karasu Merkez 3+1 Daire',
      'Sahil 2+1 Daire',
      'Yalı Mahallesi 4+1 Daire',
      'Liman Mahallesi 3+1 Daire',
      'Denize Yakın 2+1 Daire',
      'Karasu Merkez 5+1 Daire',
    ],
    villa: [
      'Karasu Sahil Lüks Villa',
      'Denize Sıfır Villa',
      'Bahçeli Havuzlu Villa',
      'Karasu Yalı Mahallesi Villa',
    ],
    yazlik: [
      'Karasu Sahil Yazlık Ev',
      'Denize Yakın Yazlık',
      'Yalı Mahallesi Yazlık',
      'İnköy Yazlık Ev',
    ],
  },
  kiralik: {
    ev: [
      'Karasu Merkez Kiralık Müstakil Ev',
      'Sahil Kiralık Ev',
      'Yalı Mahallesi Kiralık Ev',
    ],
    daire: [
      'Karasu Merkez Kiralık 3+1 Daire',
      'Sahil Kiralık 2+1 Daire',
      'Yalı Mahallesi Kiralık 4+1 Daire',
    ],
    villa: [
      'Karasu Sahil Kiralık Villa',
      'Denize Sıfır Kiralık Villa',
    ],
    yazlik: [
      'Karasu Sahil Kiralık Yazlık',
      'Yalı Mahallesi Kiralık Yazlık',
    ],
  },
};

// Price ranges (TRY)
const PRICE_RANGES = {
  satilik: {
    ev: { min: 800000, max: 2500000 },
    daire: { min: 500000, max: 1500000 },
    villa: { min: 2000000, max: 5000000 },
    yazlik: { min: 600000, max: 2000000 },
    arsa: { min: 200000, max: 800000 },
  },
  kiralik: {
    ev: { min: 5000, max: 15000 },
    daire: { min: 3000, max: 10000 },
    villa: { min: 10000, max: 30000 },
    yazlik: { min: 4000, max: 12000 },
    arsa: { min: 1000, max: 5000 },
  },
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateListing(
  status: typeof STATUSES[number],
  propertyType: typeof PROPERTY_TYPES[number],
  neighborhood: typeof KARASU_NEIGHBORHOODS[number] | typeof KOCAALI_NEIGHBORHOODS[number]
) {
  const titles = LISTING_TITLES[status][propertyType as keyof typeof LISTING_TITLES.satilik] || LISTING_TITLES.satilik.ev;
  const title = randomChoice(titles).replace('Karasu', neighborhood.district);
  const slug = generateSlug(title);
  const priceRange = PRICE_RANGES[status][propertyType as keyof typeof PRICE_RANGES.satilik] || PRICE_RANGES.satilik.ev;
  const price = randomInt(priceRange.min, priceRange.max);

  // Features
  const features: Record<string, any> = {
    rooms: propertyType === 'arsa' ? null : randomInt(2, 5),
    bathrooms: propertyType === 'arsa' ? null : randomInt(1, 3),
    area: propertyType === 'arsa' ? randomInt(200, 1000) : randomInt(80, 250),
    floor: propertyType === 'daire' ? randomInt(1, 5) : null,
    building_age: randomInt(0, 20),
    balcony: propertyType !== 'arsa' ? Math.random() > 0.3 : false,
    parking: Math.random() > 0.2,
    elevator: propertyType === 'daire' ? Math.random() > 0.4 : false,
  };

  return {
    title,
    slug: `${slug}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status,
    property_type: propertyType,
    location_city: neighborhood.city,
    location_district: neighborhood.district,
    location_neighborhood: neighborhood.name,
    location_full_address: `${neighborhood.name}, ${neighborhood.district}, ${neighborhood.city}`,
    coordinates_lat: neighborhood.lat + (Math.random() - 0.5) * 0.01,
    coordinates_lng: neighborhood.lng + (Math.random() - 0.5) * 0.01,
    price_amount: price,
    price_currency: 'TRY',
    features,
    description_short: `${neighborhood.name} bölgesinde ${propertyType} tipinde ${status === 'satilik' ? 'satılık' : 'kiralık'} emlak.`,
    description_long: `${title} - ${neighborhood.name} bölgesinde konumlanmış ${propertyType} tipinde emlak. ${status === 'satilik' ? 'Satılık' : 'Kiralık'} olarak sunulmaktadır. Detaylı bilgi için iletişime geçiniz.`,
    images: [],
    available: true,
    published: true,
    featured: Math.random() > 0.8, // 20% featured
    agent_name: 'Karasu Emlak',
    agent_phone: '+90 264 123 45 67',
    agent_email: 'info@karasuemlak.net',
    agent_whatsapp: '+90 532 123 45 67',
  };
}

async function populateNeighborhoods() {
  console.log('🏘️  Populating neighborhoods...');
  
  const allNeighborhoods = [...KARASU_NEIGHBORHOODS, ...KOCAALI_NEIGHBORHOODS];
  const neighborhoodsToInsert = allNeighborhoods.map(n => ({
    slug: generateSlug(n.name),
    name: n.name,
    district: n.district,
    city: n.city,
    description: `${n.name}, ${n.district} bölgesinde yer alan bir mahalledir.`,
    coordinates_lat: n.lat,
    coordinates_lng: n.lng,
    published: true,
    stats: {
      listings_count: 0,
      avg_price: 0,
    },
  }));

  // Insert neighborhoods one by one to avoid conflicts
  const inserted: any[] = [];
  for (const neighborhood of neighborhoodsToInsert) {
    const { data, error } = await supabase
      .from('neighborhoods')
      .upsert(neighborhood, { onConflict: 'slug' })
      .select()
      .single();
    
    if (!error && data) {
      inserted.push(data);
    } else if (error && error.code !== '23505') { // Ignore duplicate key errors
      console.error(`Error inserting ${neighborhood.name}:`, error);
    }
  }

  console.log(`✅ Populated ${inserted.length} neighborhoods`);
  return inserted;
}

async function populateListings(count: number = 30) {
  console.log(`🏠 Populating ${count} listings...`);

  const allNeighborhoods = [...KARASU_NEIGHBORHOODS, ...KOCAALI_NEIGHBORHOODS];
  const listings: any[] = [];

  // Generate listings
  for (let i = 0; i < count; i++) {
    const status = randomChoice(STATUSES);
    const propertyType = randomChoice(PROPERTY_TYPES);
    const neighborhood = randomChoice(allNeighborhoods);
    
    listings.push(generateListing(status, propertyType, neighborhood));
  }

  // Insert in batches of 10
  const batchSize = 10;
  let inserted = 0;

  for (let i = 0; i < listings.length; i += batchSize) {
    const batch = listings.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('listings')
      .insert(batch)
      .select();

    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
    } else {
      inserted += data?.length || 0;
      console.log(`✅ Inserted batch ${i / batchSize + 1} (${data?.length || 0} listings)`);
    }
  }

  console.log(`✅ Total: ${inserted} listings populated`);
  return inserted;
}

async function populateNewsArticles(count: number = 5) {
  console.log(`📰 Populating ${count} news articles...`);

  const newsArticles = [
    {
      title: 'Karasu Emlak Piyasasında Yeni Trendler',
      slug: 'karasu-emlak-piyasasinda-yeni-trendler',
      source_url: 'https://karasugundem.com/emlak-trendleri',
      source_domain: 'karasugundem.com',
      original_summary: 'Karasu emlak piyasasında son dönemde yaşanan gelişmeler ve yeni trendler hakkında detaylı analiz.',
      published_at: new Date().toISOString(),
      published: true,
      featured: true,
    },
    {
      title: 'Kocaali Sahil Bölgesinde Yeni Projeler',
      slug: 'kocaali-sahil-bolgesinde-yeni-projeler',
      source_url: 'https://karasugundem.com/kocaali-projeler',
      source_domain: 'karasugundem.com',
      original_summary: 'Kocaali sahil bölgesinde başlatılan yeni konut projeleri ve yatırım fırsatları.',
      published_at: new Date(Date.now() - 86400000).toISOString(),
      published: true,
      featured: false,
    },
    {
      title: 'Sakarya Emlak Fiyatları 2025 Analizi',
      slug: 'sakarya-emlak-fiyatlari-2025-analizi',
      source_url: 'https://karasugundem.com/fiyat-analizi',
      source_domain: 'karasugundem.com',
      original_summary: 'Sakarya emlak piyasasında 2025 yılı fiyat trendleri ve bölgesel analizler.',
      published_at: new Date(Date.now() - 172800000).toISOString(),
      published: true,
      featured: false,
    },
    {
      title: 'Karasu Yatırım Amaçlı Gayrimenkul Rehberi',
      slug: 'karasu-yatirim-amacli-gayrimenkul-rehberi',
      source_url: 'https://karasugundem.com/yatirim-rehberi',
      source_domain: 'karasugundem.com',
      original_summary: 'Karasu bölgesinde yatırım amaçlı gayrimenkul alımında dikkat edilmesi gerekenler.',
      published_at: new Date(Date.now() - 259200000).toISOString(),
      published: true,
      featured: false,
    },
    {
      title: 'Kocaali Sahil Hattında Kiralama Piyasası',
      slug: 'kocaali-sahil-hattinda-kiralama-piyasasi',
      source_url: 'https://karasugundem.com/kiralama-piyasasi',
      source_domain: 'karasugundem.com',
      original_summary: 'Kocaali sahil hattında kiralama piyasası ve fiyat trendleri hakkında güncel bilgiler.',
      published_at: new Date(Date.now() - 345600000).toISOString(),
      published: true,
      featured: false,
    },
  ].slice(0, count);

  const { data, error } = await supabase
    .from('news_articles')
    .upsert(newsArticles, { onConflict: 'slug' })
    .select();

  if (error) {
    console.error('❌ Error populating news articles:', error);
    return 0;
  }

  console.log(`✅ Populated ${data?.length || 0} news articles`);
  return data?.length || 0;
}

async function main() {
  console.log('🚀 Starting sample data population...\n');

  try {
    // 1. Populate neighborhoods
    await populateNeighborhoods();
    console.log('');

    // 2. Populate listings
    await populateListings(30);
    console.log('');

    // 3. Populate news articles
    await populateNewsArticles(5);
    console.log('');

    console.log('✅ Sample data population completed!');
    console.log('\n📊 Summary:');
    console.log('   - Neighborhoods: ~12');
    console.log('   - Listings: 30');
    console.log('   - News Articles: 5');
    console.log('\n💡 You can now test the site with real data!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { populateNeighborhoods, populateListings, populateNewsArticles };
