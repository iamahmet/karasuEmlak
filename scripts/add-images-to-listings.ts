/**
 * Add placeholder images to existing listings without images
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

async function addImagesToListings() {
  console.log('🖼️  Adding images to listings without images...\n');

  // Get all listings without images or with empty images array
  const { data: listings, error: fetchError } = await supabase
    .from('listings')
    .select('id, title, property_type, location_neighborhood, images')
    .or('images.is.null,images.eq.[]');

  if (fetchError) {
    console.error('❌ Error fetching listings:', fetchError);
    return;
  }

  if (!listings || listings.length === 0) {
    console.log('✅ All listings already have images!');
    return;
  }

  console.log(`📋 Found ${listings.length} listings without images\n`);

  let updated = 0;
  let errors = 0;

  for (const listing of listings) {
    // Map property types to real estate keywords
    const keywordMap: Record<string, string> = {
      'villa': 'luxury-villa',
      'yazlik': 'summer-house',
      'arsa': 'land-property',
      'daire': 'apartment',
      'ev': 'house',
      'isyeri': 'commercial-building',
    };
    const keyword = keywordMap[listing.property_type] || 'real-estate';
    
    // Generate consistent seed from listing properties
    const seedString = `${keyword}-${listing.location_neighborhood}-${listing.id}`;
    const seed = seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000;
    
    const images = [
      `https://picsum.photos/seed/${keyword}-${seed}/800/600`,
      `https://picsum.photos/seed/${keyword}-${seed + 1}/800/600`,
      `https://picsum.photos/seed/${keyword}-${seed + 2}/800/600`,
    ];

    const { error: updateError } = await supabase
      .from('listings')
      .update({ images })
      .eq('id', listing.id);

    if (updateError) {
      console.error(`❌ Error updating listing "${listing.title}":`, updateError.message);
      errors++;
    } else {
      updated++;
      if (updated % 10 === 0) {
        console.log(`   ✅ Updated ${updated}/${listings.length} listings...`);
      }
    }
  }

  console.log(`\n✨ Completed!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Errors: ${errors}`);
}

async function main() {
  await addImagesToListings();
}

main().catch(console.error);
