/**
 * Fix Image Public IDs Script
 * 
 * Fixes double folder structure in publicIds (e.g., news/news/slug -> news/slug)
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixPublicIds() {
  console.log('🔍 Checking for double folder structure in publicIds...\n');

  // Fix news articles
  const { data: newsArticles } = await supabase
    .from('news_articles')
    .select('id, title, slug, cover_image, og_image')
    .not('cover_image', 'is', null);

  let fixedNews = 0;
  for (const article of newsArticles || []) {
    let needsUpdate = false;
    const updates: any = {};

    // Fix cover_image
    if (article.cover_image && article.cover_image.includes('/')) {
      const parts = article.cover_image.split('/');
      if (parts.length >= 2 && parts[0] === parts[1]) {
        // Double folder: news/news/slug -> news/slug
        const fixed = parts.slice(1).join('/');
        updates.cover_image = fixed;
        needsUpdate = true;
        console.log(`  Fixing news cover_image: ${article.cover_image} -> ${fixed}`);
      }
    }

    // Fix og_image
    if (article.og_image && article.og_image.includes('/')) {
      const parts = article.og_image.split('/');
      if (parts.length >= 2 && parts[0] === parts[1]) {
        const fixed = parts.slice(1).join('/');
        updates.og_image = fixed;
        needsUpdate = true;
        console.log(`  Fixing news og_image: ${article.og_image} -> ${fixed}`);
      }
    }

    if (needsUpdate) {
      await supabase
        .from('news_articles')
        .update(updates)
        .eq('id', article.id);
      fixedNews++;
    }
  }

  // Fix articles
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, featured_image')
    .not('featured_image', 'is', null);

  let fixedArticles = 0;
  for (const article of articles || []) {
    if (article.featured_image && article.featured_image.includes('/')) {
      const parts = article.featured_image.split('/');
      if (parts.length >= 2 && parts[0] === parts[1]) {
        // Double folder: articles/articles/slug -> articles/slug
        const fixed = parts.slice(1).join('/');
        const { error } = await supabase
          .from('articles')
          .update({ featured_image: fixed })
          .eq('id', article.id);
        if (!error) {
          console.log(`  Fixing article featured_image: ${article.featured_image} -> ${fixed}`);
          fixedArticles++;
        }
      }
    }
  }

  console.log(`\n✅ Fixed ${fixedNews} news articles and ${fixedArticles} blog articles`);
}

fixPublicIds().catch(console.error);

