#!/usr/bin/env tsx

/**
 * Fix the slug for "Karasu İmarlı Arsa ve İmar Durumu Rehberi" article
 * Changes: karasu-i-marli-arsa-ve-i-mar-durumu-rehberi → karasu-imarli-arsa-ve-imar-durumu-rehberi
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Slug generation function
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
    if (lastHyphen > maxLength * 0.5) {
      slug = truncated.substring(0, lastHyphen);
    } else {
      slug = truncated.replace(/-+$/, '');
    }
  }

  return slug.replace(/-+$/g, '');
}

async function fixImarliSlug() {

  console.log('🔍 Fixing "Karasu İmarlı Arsa" article slug...\n');

  // Find the article with the broken slug
  const { data: article, error: findError } = await supabase
    .from('articles')
    .select('id, title, slug')
    .eq('slug', 'karasu-i-marli-arsa-ve-i-mar-durumu-rehberi')
    .maybeSingle();

  if (findError) {
    console.error('❌ Error finding article:', findError);
    process.exit(1);
  }

  if (!article) {
    console.log('⚠️  Article not found with slug: karasu-i-marli-arsa-ve-i-mar-durumu-rehberi');
    console.log('   Searching by title...\n');
    
    // Try to find by title
    const { data: articles, error: searchError } = await supabase
      .from('articles')
      .select('id, title, slug')
      .ilike('title', '%İmarlı Arsa%')
      .ilike('title', '%İmar Durumu%')
      .limit(5);

    if (searchError) {
      console.error('❌ Error searching articles:', searchError);
      process.exit(1);
    }

    if (!articles || articles.length === 0) {
      console.log('❌ Article not found. Please check the database manually.');
      process.exit(1);
    }

    console.log('📋 Found articles:');
    articles.forEach((a, i) => {
      console.log(`   ${i + 1}. ${a.title}`);
      console.log(`      Slug: ${a.slug}\n`);
    });

    // Use the first one that matches
    const matching = articles.find(a => 
      a.title.includes('İmarlı Arsa') && a.title.includes('İmar Durumu')
    );

    if (matching) {
      const newSlug = generateSlug(matching.title);
      console.log(`\n🔧 Fixing slug: ${matching.slug} → ${newSlug}\n`);

      // Check if new slug already exists
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', matching.id)
        .maybeSingle();

      if (existing) {
        console.log(`⚠️  Slug ${newSlug} already exists. Using alternative...`);
        const finalSlug = `${newSlug}-${matching.id.slice(0, 8)}`;
        console.log(`   Using: ${finalSlug}\n`);

        const { error: updateError } = await supabase
          .from('articles')
          .update({ slug: finalSlug, updated_at: new Date().toISOString() })
          .eq('id', matching.id);

        if (updateError) {
          console.error('❌ Error updating slug:', updateError);
          process.exit(1);
        }

        console.log(`✅ Fixed slug: ${matching.slug} → ${finalSlug}`);
      } else {
        const { error: updateError } = await supabase
          .from('articles')
          .update({ slug: newSlug, updated_at: new Date().toISOString() })
          .eq('id', matching.id);

        if (updateError) {
          console.error('❌ Error updating slug:', updateError);
          process.exit(1);
        }

        console.log(`✅ Fixed slug: ${matching.slug} → ${newSlug}`);
      }
    } else {
      console.log('❌ No matching article found.');
      process.exit(1);
    }
  } else {
    // Article found with broken slug
    const newSlug = generateSlug(article.title);
    console.log(`📝 Article found: ${article.title}`);
    console.log(`   Old slug: ${article.slug}`);
    console.log(`   New slug: ${newSlug}\n`);

    // Check if new slug already exists
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', newSlug)
      .neq('id', article.id)
      .maybeSingle();

    if (existing) {
      console.log(`⚠️  Slug ${newSlug} already exists. Using alternative...`);
      const finalSlug = `${newSlug}-${article.id.slice(0, 8)}`;
      console.log(`   Using: ${finalSlug}\n`);

      const { error: updateError } = await supabase
        .from('articles')
        .update({ slug: finalSlug, updated_at: new Date().toISOString() })
        .eq('id', article.id);

      if (updateError) {
        console.error('❌ Error updating slug:', updateError);
        process.exit(1);
      }

      console.log(`✅ Fixed slug: ${article.slug} → ${finalSlug}`);
    } else {
      const { error: updateError } = await supabase
        .from('articles')
        .update({ slug: newSlug, updated_at: new Date().toISOString() })
        .eq('id', article.id);

      if (updateError) {
        console.error('❌ Error updating slug:', updateError);
        process.exit(1);
      }

      console.log(`✅ Fixed slug: ${article.slug} → ${newSlug}`);
    }
  }

  console.log('\n✨ Done!');
}

fixImarliSlug()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
