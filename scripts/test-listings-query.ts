#!/usr/bin/env tsx
/**
 * Test script to check Supabase connection and listings data
 * Run: pnpm tsx scripts/test-listings-query.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env.local file
function loadEnv() {
  try {
    const envPath = join(process.cwd(), 'apps/web/.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    // Set environment variables
    Object.entries(envVars).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch (error) {
    console.warn('⚠️  Could not load .env.local, using process.env');
  }
}

function createServiceClient() {
  loadEnv();
  
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing required Supabase environment variables.\n' +
      'Required: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY\n' +
      `SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}\n` +
      `SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? 'SET' : 'MISSING'}`
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function testListings() {
  console.log('🔍 Testing Supabase connection and listings...\n');

  try {
    // Test 1: Create service client
    console.log('1️⃣ Creating Supabase service client...');
    const supabase = createServiceClient();
    console.log('✅ Service client created successfully\n');

    // Test 2: Check if listings table exists and get count
    console.log('2️⃣ Checking listings table...');
    const { count, error: countError } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error getting listings count:', countError);
      console.error('   Code:', countError.code);
      console.error('   Message:', countError.message);
      console.error('   Details:', countError.details);
      console.error('   Hint:', countError.hint);
      return;
    }

    console.log(`✅ Listings table exists. Total count: ${count || 0}\n`);

    // Test 3: Get all listings (no filters)
    console.log('3️⃣ Fetching all listings (no filters)...');
    const { data: allListings, error: allError } = await supabase
      .from('listings')
      .select('id, title, status, published, available, deleted_at')
      .limit(5);

    if (allError) {
      console.error('❌ Error fetching all listings:', allError);
      return;
    }

    console.log(`✅ Fetched ${allListings?.length || 0} listings (sample)`);
    if (allListings && allListings.length > 0) {
      console.log('   Sample listings:');
      allListings.forEach((listing: any) => {
        console.log(`   - ${listing.title} (${listing.status}) - published: ${listing.published}, available: ${listing.available}`);
      });
    }
    console.log('');

    // Test 4: Get published and available listings
    console.log('4️⃣ Fetching published and available listings...');
    const { data: publishedListings, error: publishedError } = await supabase
      .from('listings')
      .select('id, title, status, published, available, deleted_at')
      .eq('published', true)
      .eq('available', true)
      .is('deleted_at', null)
      .limit(5);

    if (publishedError) {
      console.error('❌ Error fetching published listings:', publishedError);
      return;
    }

    console.log(`✅ Fetched ${publishedListings?.length || 0} published and available listings`);
    if (publishedListings && publishedListings.length > 0) {
      console.log('   Published listings:');
      publishedListings.forEach((listing: any) => {
        console.log(`   - ${listing.title} (${listing.status})`);
      });
    }
    console.log('');

    // Test 5: Get satilik listings
    console.log('5️⃣ Fetching satilik listings...');
    const { data: satilikListings, error: satilikError, count: satilikCount } = await supabase
      .from('listings')
      .select('id, title, status', { count: 'exact' })
      .eq('published', true)
      .eq('available', true)
      .eq('status', 'satilik')
      .is('deleted_at', null)
      .limit(5);

    if (satilikError) {
      console.error('❌ Error fetching satilik listings:', satilikError);
      return;
    }

    console.log(`✅ Fetched ${satilikListings?.length || 0} satilik listings (total: ${satilikCount || 0})`);
    if (satilikListings && satilikListings.length > 0) {
      console.log('   Satilik listings:');
      satilikListings.forEach((listing: any) => {
        console.log(`   - ${listing.title}`);
      });
    }
    console.log('');

    // Test 6: Get kiralik listings
    console.log('6️⃣ Fetching kiralik listings...');
    const { data: kiralikListings, error: kiralikError, count: kiralikCount } = await supabase
      .from('listings')
      .select('id, title, status', { count: 'exact' })
      .eq('published', true)
      .eq('available', true)
      .eq('status', 'kiralik')
      .is('deleted_at', null)
      .limit(5);

    if (kiralikError) {
      console.error('❌ Error fetching kiralik listings:', kiralikError);
      return;
    }

    console.log(`✅ Fetched ${kiralikListings?.length || 0} kiralik listings (total: ${kiralikCount || 0})`);
    if (kiralikListings && kiralikListings.length > 0) {
      console.log('   Kiralik listings:');
      kiralikListings.forEach((listing: any) => {
        console.log(`   - ${listing.title}`);
      });
    }
    console.log('');

    // Test 7: Check RLS policies
    console.log('7️⃣ Checking RLS policies...');
    const { data: rlsData, error: rlsError } = await supabase.rpc('check_rls_policies', {});
    if (rlsError) {
      console.log('⚠️  Could not check RLS policies (function may not exist)');
      console.log('   This is OK - service role bypasses RLS anyway');
    } else {
      console.log('✅ RLS policies check:', rlsData);
    }
    console.log('');

    // Summary
    console.log('📊 Summary:');
    console.log(`   Total listings: ${count || 0}`);
    console.log(`   Published & available: ${publishedListings?.length || 0}`);
    console.log(`   Satilik: ${satilikCount || 0}`);
    console.log(`   Kiralik: ${kiralikCount || 0}`);
    console.log('');

    if ((satilikCount || 0) === 0 && (kiralikCount || 0) === 0) {
      console.log('⚠️  WARNING: No published listings found!');
      console.log('   This is why the pages show empty state.');
      console.log('   Please add some listings with:');
      console.log('   - published = true');
      console.log('   - available = true');
      console.log('   - deleted_at = null');
      console.log('   - status = "satilik" or "kiralik"');
    } else {
      console.log('✅ Listings data found! Pages should work correctly.');
    }

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

testListings().catch(console.error);
