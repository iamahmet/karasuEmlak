#!/usr/bin/env tsx
/**
 * Find listings with broken JSON at position 1003
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.join(__dirname, '../apps/web/.env.local') });

async function findBrokenJSON() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('🔍 Searching for listings with broken JSON...\n');

  // Get all kiralik listings
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, slug, features, images, status')
    .eq('status', 'kiralik')
    .eq('published', true)
    .limit(100);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${listings?.length || 0} kiralik listings\n`);

  // Check each listing for JSON issues around position 1003
  for (const listing of listings || []) {
    try {
      // Check features
      if (listing.features && typeof listing.features === 'string') {
        if (listing.features.length >= 1000) {
          try {
            JSON.parse(listing.features);
          } catch (parseError: any) {
            const position = parseError.message.match(/position (\d+)/)?.[1];
            if (position && parseInt(position) >= 1000 && parseInt(position) <= 1010) {
              console.log(`❌ BROKEN FEATURES JSON found:`);
              console.log(`   Listing ID: ${listing.id}`);
              console.log(`   Title: ${listing.title}`);
              console.log(`   Slug: ${listing.slug}`);
              console.log(`   Features length: ${listing.features.length}`);
              console.log(`   Error position: ${position}`);
              console.log(`   Preview (chars 990-1020): ${listing.features.substring(990, 1020)}`);
              console.log(`   Full features: ${listing.features}\n`);
            }
          }
        }
      }

      // Check images
      if (listing.images && typeof listing.images === 'string') {
        if (listing.images.length >= 1000) {
          try {
            JSON.parse(listing.images);
          } catch (parseError: any) {
            const position = parseError.message.match(/position (\d+)/)?.[1];
            if (position && parseInt(position) >= 1000 && parseInt(position) <= 1010) {
              console.log(`❌ BROKEN IMAGES JSON found:`);
              console.log(`   Listing ID: ${listing.id}`);
              console.log(`   Title: ${listing.title}`);
              console.log(`   Slug: ${listing.slug}`);
              console.log(`   Images length: ${listing.images.length}`);
              console.log(`   Error position: ${position}`);
              console.log(`   Preview (chars 990-1020): ${listing.images.substring(990, 1020)}`);
              console.log(`   Full images: ${listing.images}\n`);
            }
          }
        }
      }

      // Try to serialize the entire listing
      try {
        JSON.stringify(listing);
      } catch (stringifyError: any) {
        console.log(`❌ LISTING NOT SERIALIZABLE:`);
        console.log(`   Listing ID: ${listing.id}`);
        console.log(`   Title: ${listing.title}`);
        console.log(`   Error: ${stringifyError.message}\n`);
      }
    } catch (error: any) {
      console.log(`❌ ERROR CHECKING LISTING ${listing.id}:`, error.message);
    }
  }

  console.log('✅ Scan complete');
}

findBrokenJSON().catch(console.error);
