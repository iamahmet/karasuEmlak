#!/usr/bin/env tsx
/**
 * İlan Görsellerini Medya Kütüphanesine Kaydet
 * 
 * Bu script:
 * 1. İlanların images array'indeki görselleri kontrol eder
 * 2. Medya kütüphanesinde kayıtlı olmayan görselleri kaydeder
 * 3. entity_type ve entity_id'yi doğru şekilde atar
 * 
 * Kullanım:
 *   tsx scripts/sync-listings-to-media-library.ts [--dry-run] [--update]
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

interface Listing {
  id: string;
  title: string;
  slug: string;
  images: any[];
  property_type: string;
  location_neighborhood: string;
  location_district: string;
}

/**
 * Medya kütüphanesinde görsel var mı kontrol et
 */
async function mediaAssetExists(publicId: string, listingId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('media_assets')
    .select('id')
    .eq('cloudinary_public_id', publicId)
    .eq('entity_type', 'listing')
    .eq('entity_id', listingId)
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error(`Error checking media asset:`, error);
  }

  return !!data;
}

/**
 * Görseli medya kütüphanesine kaydet
 */
async function saveImageToMediaLibrary(
  image: any,
  listing: Listing,
  index: number,
  dryRun: boolean = false
): Promise<boolean> {
  const publicId = image.public_id || image.url?.split('/').pop()?.split('.')[0];
  const url = image.url || image.secure_url;
  const secureUrl = image.secure_url || image.url;

  if (!publicId && !url) {
    return false;
  }

  // Zaten kayıtlı mı kontrol et
  if (publicId) {
    const exists = await mediaAssetExists(publicId, listing.id);
    if (exists) {
      return false; // Zaten kayıtlı
    }
  }

  if (dryRun) {
    console.log(`  [DRY RUN] Would save image ${index + 1} for: ${listing.title}`);
    return true;
  }

  // Medya kütüphanesine kaydet
  const { error } = await supabase
    .from('media_assets')
    .insert({
      cloudinary_public_id: publicId || `listing-${listing.id}-${index}`,
      cloudinary_url: url,
      cloudinary_secure_url: secureUrl || url,
      asset_type: 'listing_image',
      entity_type: 'listing',
      entity_id: listing.id,
      alt_text: image.alt || `${listing.title} - Görsel ${index + 1}`,
      title: `${listing.title} - Görsel ${index + 1}`,
      width: image.width || null,
      height: image.height || null,
      format: image.format || (url?.match(/\.(\w+)$/)?.[1] || 'jpg'),
      transformations: {
        propertyType: listing.property_type,
        location: `${listing.location_neighborhood}, ${listing.location_district}`,
        order: image.order ?? index,
      },
      usage_count: 1,
      last_used_at: new Date().toISOString(),
    });

  if (error && error.code !== '23505') { // Ignore duplicate key errors
    console.error(`  ❌ Error saving image ${index + 1}:`, error.message);
    return false;
  }

  return true;
}

/**
 * Tüm ilanları kontrol et ve görselleri medya kütüphanesine kaydet
 */
async function syncListingsToMediaLibrary(dryRun: boolean = false, update: boolean = false) {
  console.log('🔍 İlan görsellerini medya kütüphanesine kaydediliyor...\n');

  // Tüm published ilanları al
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, slug, images, property_type, location_neighborhood, location_district')
    .eq('published', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching listings:', error);
    return;
  }

  if (!listings || listings.length === 0) {
    console.log('✅ No published listings found');
    return;
  }

  console.log(`📋 Found ${listings.length} published listings\n`);

  const stats = {
    total: listings.length,
    processed: 0,
    imagesSaved: 0,
    imagesSkipped: 0,
    errors: 0,
    listingsWithImages: 0,
    listingsWithoutImages: 0,
  };

  for (const listing of listings as Listing[]) {
    try {
      const images = Array.isArray(listing.images) ? listing.images : [];
      
      if (images.length === 0) {
        stats.listingsWithoutImages++;
        continue;
      }

      stats.listingsWithImages++;
      stats.processed++;

      let saved = 0;
      let skipped = 0;

      for (let i = 0; i < images.length; i++) {
        const savedResult = await saveImageToMediaLibrary(
          images[i],
          listing,
          i,
          dryRun && !update
        );

        if (savedResult) {
          saved++;
          stats.imagesSaved++;
        } else {
          skipped++;
          stats.imagesSkipped++;
        }
      }

      if (saved > 0) {
        console.log(`✅ ${listing.title}: ${saved} görsel kaydedildi, ${skipped} atlandı`);
      }
    } catch (error: any) {
      stats.errors++;
      console.error(`❌ Error processing listing ${listing.id}:`, error.message);
    }
  }

  console.log('\n📊 Özet:');
  console.log(`   Toplam ilan: ${stats.total}`);
  console.log(`   İşlenen: ${stats.processed}`);
  console.log(`   Görselli ilan: ${stats.listingsWithImages}`);
  console.log(`   Görselsiz ilan: ${stats.listingsWithoutImages}`);
  console.log(`   Kaydedilen görsel: ${stats.imagesSaved}`);
  console.log(`   Atlanan görsel: ${stats.imagesSkipped}`);
  console.log(`   Hatalar: ${stats.errors}`);

  if (dryRun && !update) {
    console.log('\n💡 Gerçek kayıt için: tsx scripts/sync-listings-to-media-library.ts --update');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const update = args.includes('--update');

  await syncListingsToMediaLibrary(dryRun, update);
}

main().catch(console.error);
