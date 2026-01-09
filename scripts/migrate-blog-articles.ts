/**
 * Script to migrate blog articles from old site (karasuemlak.net/blog) to new version
 * 
 * This script:
 * 1. Scrapes blog article URLs from old site
 * 2. Fetches article content
 * 3. Inserts into Supabase articles table
 * 
 * Usage: pnpm tsx scripts/migrate-blog-articles.ts
 */

import { createServiceClient } from '@karasu/lib/supabase/service';
import { generateSlug } from '../apps/web/lib/utils';

interface OldArticle {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  publishedAt?: string;
  author?: string;
  category?: string;
  tags?: string[];
  featuredImage?: string;
}

// Blog article URLs from old site - to be populated by scraping
const OLD_BLOG_URLS = [
  // These will be scraped from karasuemlak.net/blog
  // Example format: 'https://karasuemlak.net/blog/article-slug'
];

async function scrapeOldSiteArticles(): Promise<string[]> {
  // TODO: Implement scraping logic
  // For now, return empty array - will be populated manually or via scraping
  console.log('⚠️  Scraping not implemented yet. Please provide article URLs manually.');
  return [];
}

async function fetchArticleContent(url: string): Promise<OldArticle | null> {
  try {
    // TODO: Implement fetching logic
    // Use fetch or puppeteer to get article content
    console.log(`📄 Fetching article from: ${url}`);
    
    // Placeholder - implement actual fetching
    return null;
  } catch (error) {
    console.error(`❌ Error fetching article from ${url}:`, error);
    return null;
  }
}

async function insertArticle(article: OldArticle): Promise<boolean> {
  const supabase = createServiceClient();
  
  // Check if article already exists
  const { data: existing } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', article.slug)
    .maybeSingle();
  
  if (existing) {
    console.log(`⏭️  Article "${article.title}" already exists, skipping...`);
    return false;
  }
  
  // Prepare article data
  const articleData = {
    title: article.title,
    slug: article.slug,
    content: article.content,
    excerpt: article.excerpt || null,
    meta_description: article.excerpt || null,
    author: article.author || 'Karasu Emlak',
    published_at: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
    status: 'published' as const,
    category: article.category || null,
    tags: article.tags || [],
    featured_image: article.featuredImage || null,
    views: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // Insert article
  const { data, error } = await supabase
    .from('articles')
    .insert(articleData)
    .select()
    .single();
  
  if (error) {
    console.error(`❌ Error inserting article "${article.title}":`, error);
    return false;
  }
  
  console.log(`✅ Successfully inserted article: "${article.title}" (${data.id})`);
  return true;
}

async function migrateArticles() {
  console.log('🚀 Starting blog article migration...\n');
  
  // Get article URLs
  let articleUrls: string[] = [];
  
  if (OLD_BLOG_URLS.length > 0) {
    articleUrls = OLD_BLOG_URLS;
  } else {
    articleUrls = await scrapeOldSiteArticles();
  }
  
  if (articleUrls.length === 0) {
    console.log('⚠️  No article URLs found. Please provide URLs in OLD_BLOG_URLS array or implement scraping.');
    return;
  }
  
  console.log(`📋 Found ${articleUrls.length} articles to migrate\n`);
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  // Process each article
  for (const url of articleUrls) {
    try {
      const article = await fetchArticleContent(url);
      
      if (!article) {
        console.log(`⚠️  Could not fetch article from ${url}, skipping...`);
        errorCount++;
        continue;
      }
      
      const inserted = await insertArticle(article);
      
      if (inserted) {
        successCount++;
      } else {
        skippedCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error processing ${url}:`, error);
      errorCount++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`✅ Successfully migrated: ${successCount}`);
  console.log(`⏭️  Skipped (already exists): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📝 Total processed: ${articleUrls.length}`);
}

// Run migration
if (require.main === module) {
  migrateArticles()
    .then(() => {
      console.log('\n✨ Migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

export { migrateArticles, fetchArticleContent, insertArticle };
