#!/usr/bin/env tsx
/**
 * Medya Kütüphanesinden İlan Görsellerini Senkronize Et
 * 
 * Bu script:
 * 1. Medya kütüphanesindeki listing'e ait tüm görselleri bulur
 * 2. İlanların images array'ini günceller
 * 3. Eksik görselleri tespit eder ve raporlar
 * 
 * Kullanım:
 *   tsx scripts/sync-listing-images-from-media-library.ts [--dry-run] [--update]
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

interface MediaAsset {
  id: string;
  cloudinary_public_id: string;
  cloudinary_secure_url: string;
  cloudinary_url: string;
  entity_type: string | null;
  entity_id: string | null;
  alt_text: string | null;
  asset_type: string;
  width: number | null;
  height: number | null;
  order?: number;
}

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
 * Medya kütüphanesinden listing'e ait görselleri getir
 */
async function getMediaAssetsForListing(listingId: string): Promise<MediaAsset[]> {
  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .eq('entity_type', 'listing')
    .eq('entity_id', listingId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`Error fetching media assets for listing ${listingId}:`, error);
    return [];
  }

  return (data || []) as MediaAsset[];
}

/**
 * İlan görsellerini medya kütüphanesinden güncelle
 */
async function syncListingImages(listing: Listing, dryRun: boolean = false): Promise<{
  updated: boolean;
  added: number;
  removed: number;
  total: number;
}> {
  // Medya kütüphanesinden görselleri al
  const mediaAssets = await getMediaAssetsForListing(listing.id);

  if (mediaAssets.length === 0) {
    return { updated: false, added: 0, removed: 0, total: 0 };
  }

  // Mevcut görselleri parse et
  const currentImages = Array.isArray(listing.images) ? listing.images : [];
  
  // Medya kütüphanesindeki görselleri formatla
  const newImages = mediaAssets.map((asset, index) => ({
    public_id: asset.cloudinary_public_id,
    url: asset.cloudinary_secure_url || asset.cloudinary_url,
    alt: asset.alt_text || `${listing.title} - Görsel ${index + 1}`,
    order: asset.order ?? index,
    width: asset.width,
    height: asset.height,
    asset_type: asset.asset_type,
  }));

  // Değişiklik var mı kontrol et
  const currentImageIds = new Set(
    currentImages
      .map((img: any) => img.public_id || img.url)
      .filter(Boolean)
  );
  
  const newImageIds = new Set(
    newImages.map((img) => img.public_id || img.url)
  );

  const added = newImages.length - currentImages.length;
  const removed = currentImages.length - newImages.length;
  const hasChanges = 
    added !== 0 || 
    removed !== 0 ||
    !Array.from(currentImageIds).every(id => newImageIds.has(id));

  if (!hasChanges) {
    return { updated: false, added: 0, removed: 0, total: newImages.length };
  }

  if (dryRun) {
    console.log(`  [DRY RUN] Would update: ${listing.title}`);
    console.log(`    Current: ${currentImages.length} images`);
    console.log(`    New: ${newImages.length} images`);
    return { updated: true, added, removed, total: newImages.length };
  }

  // İlanı güncelle
  const { error: updateError } = await supabase
    .from('listings')
    .update({
      images: newImages,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listing.id);

  if (updateError) {
    console.error(`  ❌ Error updating listing ${listing.id}:`, updateError);
    return { updated: false, added: 0, removed: 0, total: currentImages.length };
  }

  return { updated: true, added, removed, total: newImages.length };
}

/**
 * Tüm ilanları kontrol et ve güncelle
 */
async function syncAllListings(dryRun: boolean = false, update: boolean = false) {
  console.log('🔍 Medya kütüphanesinden ilan görsellerini senkronize ediliyor...\n');

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
    updated: 0,
    skipped: 0,
    errors: 0,
    totalImagesAdded: 0,
    totalImagesRemoved: 0,
    listingsWithMedia: 0,
    listingsWithoutMedia: 0,
  };

  for (const listing of listings as Listing[]) {
    try {
      const mediaAssets = await getMediaAssetsForListing(listing.id);
      
      if (mediaAssets.length === 0) {
        stats.listingsWithoutMedia++;
        continue;
      }

      stats.listingsWithMedia++;

      const result = await syncListingImages(listing, dryRun && !update);

      if (result.updated) {
        stats.updated++;
        stats.totalImagesAdded += result.added;
        stats.totalImagesRemoved += result.removed;
        
        console.log(`✅ ${listing.title}`);
        console.log(`   Görseller: ${result.total} (${result.added > 0 ? `+${result.added}` : ''}${result.removed > 0 ? `-${result.removed}` : ''})`);
      } else {
        stats.skipped++;
      }
    } catch (error: any) {
      stats.errors++;
      console.error(`❌ Error processing listing ${listing.id}:`, error.message);
    }
  }

  console.log('\n📊 Özet:');
  console.log(`   Toplam ilan: ${stats.total}`);
  console.log(`   Güncellenen: ${stats.updated}`);
  console.log(`   Atlanan: ${stats.skipped}`);
  console.log(`   Hatalar: ${stats.errors}`);
  console.log(`   Medya kütüphanesinde görseli olan: ${stats.listingsWithMedia}`);
  console.log(`   Medya kütüphanesinde görseli olmayan: ${stats.listingsWithoutMedia}`);
  console.log(`   Eklenen görsel: ${stats.totalImagesAdded}`);
  console.log(`   Kaldırılan görsel: ${stats.totalImagesRemoved}`);

  if (dryRun && !update) {
    console.log('\n💡 Gerçek güncelleme için: tsx scripts/sync-listing-images-from-media-library.ts --update');
  }
}

/**
 * Eksik görselleri raporla
 */
async function reportMissingImages() {
  console.log('🔍 Eksik görselleri tespit ediliyor...\n');

  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, slug, images, property_type, location_neighborhood')
    .eq('published', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching listings:', error);
    return;
  }

  const missingImages: Listing[] = [];
  const lowImageCount: Array<{ listing: Listing; count: number }> = [];

  for (const listing of listings as Listing[]) {
    const mediaAssets = await getMediaAssetsForListing(listing.id);
    const currentImages = Array.isArray(listing.images) ? listing.images : [];
    
    if (mediaAssets.length === 0 && currentImages.length === 0) {
      missingImages.push(listing);
    } else if (currentImages.length < 3 && mediaAssets.length > currentImages.length) {
      lowImageCount.push({ listing, count: currentImages.length });
    }
  }

  console.log(`📊 Rapor:\n`);
  console.log(`   Görseli olmayan ilanlar: ${missingImages.length}`);
  if (missingImages.length > 0) {
    console.log('\n   İlanlar:');
    missingImages.slice(0, 10).forEach((listing) => {
      console.log(`     - ${listing.title} (${listing.slug})`);
    });
    if (missingImages.length > 10) {
      console.log(`     ... ve ${missingImages.length - 10} ilan daha`);
    }
  }

  console.log(`\n   Az görselli ilanlar (<3 görsel, medya kütüphanesinde daha fazla var): ${lowImageCount.length}`);
  if (lowImageCount.length > 0) {
    console.log('\n   İlanlar:');
    lowImageCount.slice(0, 10).forEach(({ listing, count }) => {
      console.log(`     - ${listing.title}: ${count} görsel (medya kütüphanesinde daha fazla var)`);
    });
    if (lowImageCount.length > 10) {
      console.log(`     ... ve ${lowImageCount.length - 10} ilan daha`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const update = args.includes('--update');
  const report = args.includes('--report');

  if (report) {
    await reportMissingImages();
    return;
  }

  await syncAllListings(dryRun, update);
}

main().catch(console.error);
