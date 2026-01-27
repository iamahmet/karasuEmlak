#!/usr/bin/env tsx
/**
 * Test getListings function directly
 * Run: pnpm tsx scripts/test-getlistings.ts
 */

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
    
    Object.entries(envVars).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch (error) {
    console.warn('⚠️  Could not load .env.local');
  }
}

async function testGetListings() {
  loadEnv();
  
  console.log('🔍 Testing getListings function...\n');

  try {
    // Import getListings function
    const { getListings } = await import('../apps/web/lib/supabase/queries/listings');

    // Test 1: Get satilik listings
    console.log('1️⃣ Testing getListings with status: satilik...');
    const satilikResult = await getListings(
      { status: 'satilik' },
      { field: 'created_at', order: 'desc' },
      18,
      0
    );
    console.log(`✅ Satilik result: ${satilikResult.listings.length} listings, total: ${satilikResult.total}`);
    if (satilikResult.listings.length > 0) {
      console.log(`   First listing: ${satilikResult.listings[0].title}`);
    }
    console.log('');

    // Test 2: Get kiralik listings
    console.log('2️⃣ Testing getListings with status: kiralik...');
    const kiralikResult = await getListings(
      { status: 'kiralik' },
      { field: 'created_at', order: 'desc' },
      18,
      0
    );
    console.log(`✅ Kiralik result: ${kiralikResult.listings.length} listings, total: ${kiralikResult.total}`);
    if (kiralikResult.listings.length > 0) {
      console.log(`   First listing: ${kiralikResult.listings[0].title}`);
    }
    console.log('');

    // Summary
    console.log('📊 Summary:');
    console.log(`   Satilik: ${satilikResult.total} total, ${satilikResult.listings.length} returned`);
    console.log(`   Kiralik: ${kiralikResult.total} total, ${kiralikResult.listings.length} returned`);
    console.log('');

    if (satilikResult.total === 0 && kiralikResult.total === 0) {
      console.log('⚠️  WARNING: getListings returns 0 listings!');
      console.log('   This is why pages show empty state.');
    } else {
      console.log('✅ getListings function works correctly!');
      console.log('   Pages should display listings now.');
    }

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

testGetListings().catch(console.error);
