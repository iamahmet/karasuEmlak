/**
 * Check which neighborhoods have "Ev Alırken Dikkat Edilmesi Gerekenler" blog posts
 * 
 * This script checks the database to see which neighborhoods already have
 * buying guide articles and which ones are missing.
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate URL-friendly slug from Turkish text
 */
function generateSlug(text: string, maxLength: number = 100): string {
  let slug = text
    .toLowerCase()
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
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (slug.length > maxLength) {
    const truncated = slug.substring(0, maxLength);
    const lastHyphen = truncated.lastIndexOf('-');
    if (lastHyphen > maxLength * 0.5) {
      slug = truncated.substring(0, lastHyphen);
    } else {
      slug = truncated.replace(/-+$/, '');
    }
  }

  return slug.replace(/-+$/g, '');
}

/**
 * Check if article exists for a neighborhood
 */
async function checkArticle(neighborhoodName: string): Promise<{ exists: boolean; slug: string; article?: any }> {
  const slug = generateSlug(`${neighborhoodName} mahallesinde ev alırken dikkat edilmesi gerekenler`);
  
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, status')
    .eq('slug', slug)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error(`Error checking article for ${neighborhoodName}:`, error);
    return { exists: false, slug };
  }

  return {
    exists: !!data,
    slug,
    article: data || undefined,
  };
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Checking neighborhood buying guides...\n');

  // Get all neighborhoods
  const { data: neighborhoods, error } = await supabase
    .from('neighborhoods')
    .select('id, name, slug, district, city')
    .eq('published', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch neighborhoods: ${error.message}`);
  }

  if (!neighborhoods || neighborhoods.length === 0) {
    console.log('⚠️  No neighborhoods found');
    return;
  }

  console.log(`📋 Found ${neighborhoods.length} neighborhoods\n`);

  const results: Array<{
    neighborhood: string;
    slug: string;
    exists: boolean;
    status?: string;
    articleTitle?: string;
  }> = [];

  // Check each neighborhood
  for (const neighborhood of neighborhoods) {
    const check = await checkArticle(neighborhood.name);
    results.push({
      neighborhood: neighborhood.name,
      slug: check.slug,
      exists: check.exists,
      status: check.article?.status,
      articleTitle: check.article?.title,
    });
  }

  // Separate existing and missing
  const existing = results.filter(r => r.exists);
  const missing = results.filter(r => !r.exists);

  // Print summary
  console.log('='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Existing: ${existing.length}`);
  console.log(`❌ Missing: ${missing.length}`);
  console.log(`📝 Total: ${neighborhoods.length}`);
  console.log('='.repeat(80));

  if (existing.length > 0) {
    console.log('\n✅ EXISTING ARTICLES:');
    console.log('-'.repeat(80));
    existing.forEach(r => {
      console.log(`  ✓ ${r.neighborhood.padEnd(30)} → /blog/${r.slug} (${r.status || 'unknown'})`);
    });
  }

  if (missing.length > 0) {
    console.log('\n❌ MISSING ARTICLES:');
    console.log('-'.repeat(80));
    missing.forEach(r => {
      console.log(`  ✗ ${r.neighborhood.padEnd(30)} → /blog/${r.slug}`);
    });
    
    console.log('\n💡 To create missing articles, run:');
    console.log('   npx tsx scripts/create-neighborhood-buying-guides.ts');
  }

  // Check for the specific article mentioned
  console.log('\n🔍 Checking specific article: karasu-ev-alirken-dikkat-edilmesi-gerekenler');
  const { data: karasuArticle } = await supabase
    .from('articles')
    .select('id, title, slug, status')
    .eq('slug', 'karasu-ev-alirken-dikkat-edilmesi-gerekenler')
    .maybeSingle();

  if (karasuArticle) {
    console.log(`  ✅ Found: "${karasuArticle.title}" (${karasuArticle.status})`);
  } else {
    console.log(`  ❌ Not found - needs to be created`);
  }
}

// Run script
main()
  .then(() => {
    console.log('\n✨ Check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Check failed:', error);
    process.exit(1);
  });
