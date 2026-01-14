#!/usr/bin/env tsx
/**
 * Fix all slugs in database and ensure URL consistency
 * Normalizes all slugs using generateSlug function
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

/**
 * Generate URL-friendly slug from Turkish text
 * Improved: Truncates at word boundaries to avoid cutting words
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

  // If slug is longer than maxLength, truncate at word boundary
  if (slug.length > maxLength) {
    const truncated = slug.substring(0, maxLength);
    const lastHyphen = truncated.lastIndexOf('-');
    // If we found a hyphen and it's not too close to the start, use it
    if (lastHyphen > maxLength * 0.5) {
      slug = truncated.substring(0, lastHyphen);
    } else {
      // Otherwise, just truncate and remove trailing hyphen
      slug = truncated.replace(/-+$/, '');
    }
  }

  // Final cleanup: remove any trailing hyphens
  return slug.replace(/-+$/g, '');
}

async function fixAllSlugs() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🔧 Fixing slugs in database...\n');

  // 1. Fix neighborhoods slugs
  console.log('📦 Fixing neighborhoods slugs...');
  const { data: neighborhoods, error: neighborhoodsError } = await supabase
    .from('neighborhoods')
    .select('id, name, slug');

  if (neighborhoodsError) {
    console.error('❌ Error fetching neighborhoods:', neighborhoodsError);
  } else if (neighborhoods) {
    let updated = 0;
    for (const neighborhood of neighborhoods) {
      const normalizedSlug = generateSlug(neighborhood.name);
      if (neighborhood.slug !== normalizedSlug) {
        const { error } = await supabase
          .from('neighborhoods')
          .update({ slug: normalizedSlug })
          .eq('id', neighborhood.id);
        
        if (error) {
          console.error(`  ❌ Error updating ${neighborhood.name}:`, error);
        } else {
          console.log(`  ✅ ${neighborhood.name}: ${neighborhood.slug} → ${normalizedSlug}`);
          updated++;
        }
      }
    }
    console.log(`✅ Updated ${updated} neighborhood slugs\n`);
  }

  // 2. Fix articles slugs
  console.log('📝 Fixing articles slugs...');
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('id, title, slug');

  if (articlesError) {
    console.error('❌ Error fetching articles:', articlesError);
  } else if (articles) {
    let updated = 0;
    for (const article of articles) {
      const normalizedSlug = generateSlug(article.title);
      if (article.slug !== normalizedSlug) {
        const { error } = await supabase
          .from('articles')
          .update({ slug: normalizedSlug })
          .eq('id', article.id);
        
        if (error) {
          console.error(`  ❌ Error updating ${article.title}:`, error);
        } else {
          console.log(`  ✅ ${article.title}: ${article.slug} → ${normalizedSlug}`);
          updated++;
        }
      }
    }
    console.log(`✅ Updated ${updated} article slugs\n`);
  }

  // 3. Fix news_articles slugs
  console.log('📰 Fixing news_articles slugs...');
  const { data: newsArticles, error: newsError } = await supabase
    .from('news_articles')
    .select('id, title, slug');

  if (newsError) {
    console.error('❌ Error fetching news_articles:', newsError);
  } else if (newsArticles) {
    let updated = 0;
    for (const news of newsArticles) {
      const normalizedSlug = generateSlug(news.title);
      if (news.slug !== normalizedSlug) {
        const { error } = await supabase
          .from('news_articles')
          .update({ slug: normalizedSlug })
          .eq('id', news.id);
        
        if (error) {
          console.error(`  ❌ Error updating ${news.title}:`, error);
        } else {
          console.log(`  ✅ ${news.title}: ${news.slug} → ${normalizedSlug}`);
          updated++;
        }
      }
    }
    console.log(`✅ Updated ${updated} news article slugs\n`);
  }

  // 4. Fix listings slugs
  console.log('🏠 Fixing listings slugs...');
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id, title, slug')
    .limit(1000); // Process in batches if needed

  if (listingsError) {
    console.error('❌ Error fetching listings:', listingsError);
  } else if (listings) {
    let updated = 0;
    for (const listing of listings) {
      const normalizedSlug = generateSlug(listing.title);
      if (listing.slug !== normalizedSlug) {
        const { error } = await supabase
          .from('listings')
          .update({ slug: normalizedSlug })
          .eq('id', listing.id);
        
        if (error) {
          console.error(`  ❌ Error updating ${listing.title}:`, error);
        } else {
          console.log(`  ✅ ${listing.title}: ${listing.slug} → ${normalizedSlug}`);
          updated++;
        }
      }
    }
    console.log(`✅ Updated ${updated} listing slugs\n`);
  }

  console.log('✅ All slugs normalized!');
}

fixAllSlugs().catch(console.error);
