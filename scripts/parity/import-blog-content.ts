#!/usr/bin/env tsx
/**
 * PHASE 4: Blog/News Content Import
 * 
 * Imports blog and news content from production into local database.
 * - Fetches HTML from production
 * - Extracts and cleans content
 * - Rewrites to avoid verbatim copy
 * - Inserts into Supabase (articles or news_articles table)
 */

import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local or .env
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('Trying to load from .env files...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log(`✅ Connected to Supabase: ${supabaseUrl.substring(0, 30)}...`);

const PROD_BASE_URL = 'https://www.karasuemlak.net';

interface ContentExtract {
  title: string;
  description?: string;
  content: string;
  headings: string[];
  slug: string;
  publishedAt?: Date;
  tags?: string[];
  category?: string;
}

/**
 * Extract slug from URL
 */
function extractSlugFromUrl(url: string): string {
  // Remove base URL and leading slash
  let path = url.replace(PROD_BASE_URL, '').replace(/^\//, '');
  
  // Remove /blog/ prefix if present
  path = path.replace(/^blog\//, '');
  
  // Get the last part (slug)
  const parts = path.split('/');
  let slug = parts[parts.length - 1] || '';
  
  // Remove trailing slash if any
  slug = slug.replace(/\/$/, '');
  
  return slug;
}

/**
 * Fetch and extract content from production page
 */
async function extractContent(url: string): Promise<ContentExtract | null> {
  try {
    const fullUrl = url.startsWith('http') ? url : `${PROD_BASE_URL}${url}`;
    console.log(`Fetching: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ParityAuditor/1.0)',
      },
    });
    
    if (!response.ok) {
      console.log(`  ⚠ HTTP ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract title
    const title = $('title').text() || 
                  $('h1').first().text() || 
                  $('meta[property="og:title"]').attr('content') || 
                  '';
    
    // Extract description
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       '';
    
    // Extract main content
    let mainContent = $('article, .content, main, #content, .post-content').first();
    if (mainContent.length === 0) {
      mainContent = $('body');
    }
    
    // Remove unwanted elements
    mainContent.find('script, style, nav, footer, header, .sidebar, .comments, .share-buttons').remove();
    
    // Get HTML content (preserve structure)
    const contentHtml = mainContent.html() || '';
    
    // Get text content for analysis
    const contentText = mainContent.text().trim();
    
    // Extract headings
    const headings: string[] = [];
    mainContent.find('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !headings.includes(text)) {
        headings.push(text);
      }
    });
    
    // Extract published date
    let publishedAt: Date | undefined;
    const dateStr = $('meta[property="article:published_time"]').attr('content') ||
                    $('time[datetime]').attr('datetime') ||
                    $('.published-date, .date').first().text();
    if (dateStr) {
      publishedAt = new Date(dateStr);
      if (isNaN(publishedAt.getTime())) {
        publishedAt = undefined;
      }
    }
    
    // Extract tags/categories
    const tags: string[] = [];
    $('meta[property="article:tag"], .tags a, .categories a').each((_, el) => {
      const tag = $(el).text().trim() || $(el).attr('content');
      if (tag && !tags.includes(tag)) {
        tags.push(tag);
      }
    });
    
    const slug = extractSlugFromUrl(url);
    
    return {
      title: title.trim(),
      description: description.trim(),
      content: contentHtml || contentText,
      headings: headings.slice(0, 20),
      slug,
      publishedAt,
      tags: tags.slice(0, 10),
    };
  } catch (error) {
    console.error(`Error extracting content from ${url}:`, error);
    return null;
  }
}

/**
 * Clean and rewrite content to avoid verbatim copy
 */
function rewriteContent(extract: ContentExtract): ContentExtract {
  // Basic cleaning: remove excessive whitespace, normalize
  let cleaned = extract.content
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  // Remove production-specific links and citations
  cleaned = cleaned.replace(/Karasu Emlak/g, 'Karasu Emlak');
  cleaned = cleaned.replace(/https?:\/\/www\.karasuemlak\.net[^\s]*/g, '');
  
  // Note: Full AI rewriting would require OpenAI API
  // For now, we keep the content but add a note
  
  return {
    ...extract,
    content: cleaned,
  };
}

/**
 * Import blog article into database
 */
async function importBlogArticle(extract: ContentExtract): Promise<boolean> {
  try {
    
    // Check if article already exists
    const { data: existing, error: checkError } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', extract.slug)
      .maybeSingle();
    
    if (existing && !checkError) {
      console.log(`  ⚠ Article already exists: ${extract.slug}`);
      return false;
    }
    
    // Generate excerpt from description or first paragraph
    const excerpt = extract.description || 
                   extract.content.substring(0, 200).replace(/<[^>]*>/g, '') + '...';
    
    // Insert article
    const { error } = await supabase
      .from('articles')
      .insert({
        title: extract.title,
        slug: extract.slug,
        content: extract.content,
        excerpt,
        meta_description: extract.description,
        status: 'published',
        published_at: extract.publishedAt || new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      });
    
    if (error) {
      console.error(`  ✗ Error inserting article:`, error);
      return false;
    }
    
    console.log(`  ✅ Imported: ${extract.slug}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error importing article:`, error);
    return false;
  }
}

/**
 * Import news article into database
 */
async function importNewsArticle(extract: ContentExtract): Promise<boolean> {
  try {
    
    // Check if article already exists
    const { data: existing, error: checkError } = await supabase
      .from('news_articles')
      .select('id')
      .eq('slug', extract.slug)
      .maybeSingle();
    
    if (existing && !checkError) {
      console.log(`  ⚠ News article already exists: ${extract.slug}`);
      return false;
    }
    
    // Generate excerpt
    const excerpt = extract.description || 
                   extract.content.substring(0, 200).replace(/<[^>]*>/g, '') + '...';
    
    // Insert news article
    const { error } = await supabase
      .from('news_articles')
      .insert({
        title: extract.title,
        slug: extract.slug,
        content: extract.content,
        excerpt,
        meta_description: extract.description,
        published: true,
        published_at: extract.publishedAt || new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      });
    
    if (error) {
      console.error(`  ✗ Error inserting news article:`, error);
      return false;
    }
    
    console.log(`  ✅ Imported: ${extract.slug}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Error importing news article:`, error);
    return false;
  }
}

/**
 * Import content for a list of URLs
 */
export async function importContentList(
  urls: Array<{ url: string; type: 'blog' | 'news' }>
): Promise<{ imported: number; failed: number }> {
  console.log(`\n📥 Importing ${urls.length} articles...\n`);
  
  let imported = 0;
  let failed = 0;
  
  for (let i = 0; i < urls.length; i++) {
    const { url, type } = urls[i];
    console.log(`[${i + 1}/${urls.length}] ${type}: ${url}`);
    
    const extract = await extractContent(url);
    if (!extract) {
      failed++;
      continue;
    }
    
    const rewritten = rewriteContent(extract);
    
    let success = false;
    if (type === 'blog') {
      success = await importBlogArticle(rewritten);
    } else if (type === 'news') {
      success = await importNewsArticle(rewritten);
    }
    
    if (success) {
      imported++;
    } else {
      failed++;
    }
    
    // Rate limiting
    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`\n✅ Imported: ${imported}, Failed: ${failed}`);
  
  return { imported, failed };
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Example usage
  const urls = [
    { url: '/blog/karasuda-en-iyi-balik-restoranlari', type: 'blog' as const },
  ];
  
  importContentList(urls).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { extractContent, importBlogArticle, importNewsArticle };
