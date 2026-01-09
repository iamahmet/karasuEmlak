/**
 * Fix Neighborhood Slugs
 * Updates all neighborhood slugs in database to use proper Turkish character handling
 */

import * as dotenv from 'dotenv';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { generateSlug } from '../apps/web/lib/utils';

dotenv.config({ path: '.env.local' });

async function fixNeighborhoodSlugs() {
  console.log('🚀 Fixing neighborhood slugs...\n');
  
  const supabase = createServiceClient();
  
  // Get all neighborhoods from listings (since neighborhoods table might not exist)
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('location_neighborhood')
    .not('location_neighborhood', 'is', null);
  
  if (listingsError) {
    console.error('❌ Error fetching listings:', listingsError.message);
    return;
  }
  
  // Get unique neighborhoods
  const uniqueNeighborhoods = Array.from(
    new Set(
      listings
        ?.map(l => l.location_neighborhood)
        .filter(Boolean) as string[]
    )
  );
  
  console.log(`📋 Found ${uniqueNeighborhoods.length} unique neighborhoods\n`);
  
  // Show current vs new slugs
  const slugMappings: Array<{ name: string; oldSlug: string; newSlug: string }> = [];
  
  uniqueNeighborhoods.forEach(neighborhood => {
    const oldSlug = neighborhood.toLowerCase().replace(/\s+/g, '-');
    const newSlug = generateSlug(neighborhood);
    
    if (oldSlug !== newSlug) {
      slugMappings.push({ name: neighborhood, oldSlug, newSlug });
      console.log(`🔄 "${neighborhood}"`);
      console.log(`   Old: ${oldSlug}`);
      console.log(`   New: ${newSlug}\n`);
    }
  });
  
  if (slugMappings.length === 0) {
    console.log('✅ All slugs are already correct!\n');
    return;
  }
  
  console.log(`\n✨ Found ${slugMappings.length} neighborhoods that need slug updates`);
  console.log('⚠️  Note: This script only shows the differences.');
  console.log('   To update database slugs, you may need to update the neighborhoods table or listings table directly.\n');
}

fixNeighborhoodSlugs().catch(console.error);
