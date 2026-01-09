/**
 * Manual Blog Article Migration Script
 * 
 * This script reads article URLs from manual-blog-urls.txt and migrates them
 * 
 * Usage:
 * 1. Add article URLs to scripts/manual-blog-urls.txt (one per line)
 * 2. Run: pnpm scripts:migrate-blog-manual
 */

import { createServiceClient } from '@karasu/lib/supabase/service';
import { readFile } from 'fs/promises';
import { generateSlug } from '../apps/web/lib/utils';

interface ArticleData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  meta_description?: string;
  author?: string;
  published_at?: string;
  category?: string;
  tags?: string[];
  featured_image?: string;
}

async function fetchArticleFromUrl(url: string): Promise<ArticleData | null> {
  try {
    console.log(`📄 Fetching: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      console.error(`❌ HTTP ${response.status} for ${url}`);
      return null;
    }
    
    const html = await response.text();
    
    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) || 
                      html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    const title = titleMatch ? titleMatch[1].trim().replace(/\s*\|\s*.*$/, '') : 'Untitled';
    
    // Extract slug from URL
    const slugMatch = url.match(/\/blog\/([^\/\?]+)/);
    const slug = slugMatch ? slugMatch[1] : generateSlug(title);
    
    // Extract content - try multiple selectors
    let content = '';
    const contentSelectors = [
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    ];
    
    for (const selector of contentSelectors) {
      const match = html.match(selector);
      if (match && match[1]) {
        content = match[1];
        break;
      }
    }
    
    // If no content found, try to get body content
    if (!content) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) {
        content = bodyMatch[1];
      }
    }
    
    // Extract excerpt
    const excerptMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<div[^>]*class="[^"]*excerpt[^"]*"[^>]*>([^<]+)<\/div>/i);
    const excerpt = excerptMatch ? excerptMatch[1].trim() : undefined;
    
    // Extract published date
    const dateMatch = html.match(/<time[^>]*datetime=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i);
    const published_at = dateMatch ? dateMatch[1] : undefined;
    
    // Extract author
    const authorMatch = html.match(/<meta[^>]*property=["']article:author["'][^>]*content=["']([^"']+)["']/i) ||
                       html.match(/<span[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/span>/i);
    const author = authorMatch ? authorMatch[1].trim() : 'Karasu Emlak';
    
    // Extract featured image
    const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<img[^>]*class="[^"]*featured[^"]*"[^>]*src=["']([^"']+)["']/i);
    const featured_image = imageMatch ? imageMatch[1] : undefined;
    
    return {
      title,
      slug,
      content: content || title, // Fallback to title if no content
      excerpt: excerpt || title.substring(0, 160),
      meta_description: excerpt || title.substring(0, 160),
      author,
      published_at: published_at || new Date().toISOString(),
      featured_image,
    };
  } catch (error) {
    console.error(`❌ Error fetching ${url}:`, error);
    return null;
  }
}

async function insertArticle(article: ArticleData): Promise<boolean> {
  const supabase = createServiceClient();
  
  // Check if article already exists
  const { data: existing } = await supabase
    .from('articles')
    .select('id, title')
    .eq('slug', article.slug)
    .maybeSingle();
  
  if (existing) {
    console.log(`⏭️  Article "${article.title}" already exists (ID: ${existing.id}), skipping...`);
    return false;
  }
  
  // Prepare article data
  const articleData = {
    title: article.title,
    slug: article.slug,
    content: article.content,
    excerpt: article.excerpt || null,
    meta_description: article.meta_description || article.excerpt || null,
    author: article.author || 'Karasu Emlak',
    published_at: article.published_at ? new Date(article.published_at).toISOString() : new Date().toISOString(),
    status: 'published' as const,
    category: article.category || null,
    tags: article.tags || [],
    featured_image: article.featured_image || null,
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
    console.error(`❌ Error inserting article "${article.title}":`, error.message);
    return false;
  }
  
  console.log(`✅ Successfully inserted: "${article.title}" (ID: ${data.id})`);
  return true;
}

async function migrateFromFile() {
  try {
    console.log('🚀 Starting manual blog article migration...\n');
    
    // Read URLs from file
    const fileContent = await readFile('scripts/manual-blog-urls.txt', 'utf-8');
    const urls = fileContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && line.includes('karasuemlak.net/blog'));
    
    if (urls.length === 0) {
      console.log('⚠️  No URLs found in manual-blog-urls.txt');
      console.log('📝 Please add article URLs to scripts/manual-blog-urls.txt (one per line)');
      return;
    }
    
    console.log(`📋 Found ${urls.length} article URLs to migrate\n`);
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    // Process each URL
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`\n[${i + 1}/${urls.length}] Processing: ${url}`);
      
      try {
        const article = await fetchArticleFromUrl(url);
        
        if (!article) {
          console.log(`⚠️  Could not fetch article, skipping...`);
          errorCount++;
          continue;
        }
        
        console.log(`📝 Title: ${article.title}`);
        console.log(`🔗 Slug: ${article.slug}`);
        console.log(`📄 Content length: ${article.content.length} chars`);
        
        const inserted = await insertArticle(article);
        
        if (inserted) {
          successCount++;
        } else {
          skippedCount++;
        }
        
        // Delay between requests to avoid rate limiting
        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error: any) {
        console.error(`❌ Error processing ${url}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`⏭️  Skipped (already exists): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total processed: ${urls.length}`);
    console.log('='.repeat(50));
    
  } catch (error: any) {
    console.error('\n💥 Migration failed:', error.message);
    if (error.code === 'ENOENT') {
      console.log('\n💡 Tip: Create scripts/manual-blog-urls.txt and add article URLs (one per line)');
    }
    throw error;
  }
}

// Run migration
if (require.main === module) {
  migrateFromFile()
    .then(() => {
      console.log('\n✨ Migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

export { migrateFromFile, fetchArticleFromUrl, insertArticle };
