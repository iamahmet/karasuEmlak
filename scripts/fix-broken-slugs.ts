#!/usr/bin/env tsx

/**
 * Fix broken slugs that end with hyphens (e.g., "harf harf-")
 * This script finds and fixes slugs that were cut off mid-word
 */

import { createServiceClient } from '@karasu/lib/supabase/service';

/**
 * Improved slug generation - truncates at word boundaries
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

async function fixBrokenSlugs() {
  const supabase = createServiceClient();

  console.log('🔍 Checking for broken slugs...\n');

  // Get all articles
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('id, title, slug')
    .order('created_at', { ascending: false });

  if (articlesError) {
    console.error('❌ Error fetching articles:', articlesError);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log('✅ No articles found.');
    return;
  }

  console.log(`📊 Found ${articles.length} articles\n`);

  let fixedCount = 0;
  let skippedCount = 0;
  const brokenSlugs: Array<{ id: string; oldSlug: string; newSlug: string; title: string }> = [];

  for (const article of articles) {
    if (!article.slug || !article.title) continue;

    // Check if slug ends with hyphen (broken)
    const isBroken = article.slug.endsWith('-');
    
    // Also check if slug seems truncated (very short compared to title)
    const titleSlug = generateSlug(article.title);
    const seemsTruncated = article.slug.length < titleSlug.length * 0.7 && titleSlug.length > 20;

    if (isBroken || seemsTruncated) {
      const newSlug = generateSlug(article.title);
      
      // Check if new slug already exists (different article)
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', article.id)
        .maybeSingle();

      let finalSlug = newSlug;
      if (existing) {
        // Append article ID if conflict
        finalSlug = `${newSlug}-${article.id.slice(0, 8)}`;
      }

      if (finalSlug !== article.slug) {
        brokenSlugs.push({
          id: article.id,
          oldSlug: article.slug,
          newSlug: finalSlug,
          title: article.title,
        });
      }
    } else {
      skippedCount++;
    }
  }

  if (brokenSlugs.length === 0) {
    console.log('✅ No broken slugs found! All slugs are valid.\n');
    return;
  }

  console.log(`🔧 Found ${brokenSlugs.length} broken slugs to fix:\n`);
  brokenSlugs.slice(0, 10).forEach((item) => {
    console.log(`  - "${item.title}"`);
    console.log(`    Old: ${item.oldSlug}`);
    console.log(`    New: ${item.newSlug}\n`);
  });

  if (brokenSlugs.length > 10) {
    console.log(`  ... and ${brokenSlugs.length - 10} more\n`);
  }

  // Ask for confirmation
  console.log(`\n⚠️  This will update ${brokenSlugs.length} articles.`);
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Fix slugs
  for (const item of brokenSlugs) {
    const { error } = await supabase
      .from('articles')
      .update({ slug: item.newSlug, updated_at: new Date().toISOString() })
      .eq('id', item.id);

    if (error) {
      console.error(`❌ Error fixing slug for article ${item.id}:`, error);
    } else {
      fixedCount++;
      console.log(`✅ Fixed: ${item.oldSlug} → ${item.newSlug}`);
    }
  }

  // Also check news articles
  const { data: news, error: newsError } = await supabase
    .from('news_articles')
    .select('id, title, slug')
    .order('created_at', { ascending: false });

  if (!newsError && news && news.length > 0) {
    console.log(`\n📰 Checking ${news.length} news articles...\n`);
    
    for (const newsItem of news) {
      if (!newsItem.slug || !newsItem.title) continue;

      const isBroken = newsItem.slug.endsWith('-');
      const titleSlug = generateSlug(newsItem.title);
      const seemsTruncated = newsItem.slug.length < titleSlug.length * 0.7 && titleSlug.length > 20;

      if (isBroken || seemsTruncated) {
        const newSlug = generateSlug(newsItem.title);
        
        const { data: existing } = await supabase
          .from('news_articles')
          .select('id')
          .eq('slug', newSlug)
          .neq('id', newsItem.id)
          .maybeSingle();

        let finalSlug = newSlug;
        if (existing) {
          finalSlug = `${newSlug}-${newsItem.id.slice(0, 8)}`;
        }

        if (finalSlug !== newsItem.slug) {
          const { error } = await supabase
            .from('news_articles')
            .update({ slug: finalSlug, updated_at: new Date().toISOString() })
            .eq('id', newsItem.id);

          if (error) {
            console.error(`❌ Error fixing news slug for ${newsItem.id}:`, error);
          } else {
            fixedCount++;
            console.log(`✅ Fixed news: ${newsItem.slug} → ${finalSlug}`);
          }
        }
      }
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} broken slugs!`);
  console.log(`⏭️  Skipped ${skippedCount} valid slugs.\n`);
}

// Run the script
fixBrokenSlugs()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
