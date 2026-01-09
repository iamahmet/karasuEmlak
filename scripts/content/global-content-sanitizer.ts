#!/usr/bin/env tsx
/**
 * Global Content Sanitization Script
 * 
 * FIXES:
 * - Removes blog-style content from listings
 * - Removes placeholders and broken tags
 * - Enforces content type separation
 * - Cleans AI-generated patterns
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Clean description function (inline to avoid import issues)
function cleanDescription(description: string): string {
  if (!description) return '';

  let cleaned = description;

  // Remove H2/H3 headings
  cleaned = cleaned.replace(/<h[23][^>]*>.*?<\/h[23]>/gi, '');
  cleaned = cleaned.replace(/^#{1,3}\s+.+$/gm, '');
  
  // Remove conclusion paragraphs
  cleaned = cleaned.replace(/<p>.*?(sonuç|özet|kısaca|özetlemek gerekirse|son olarak).*?<\/p>/gi, '');
  
  // Remove FAQ sections
  cleaned = cleaned.replace(/<h[23][^>]*>.*?SSS.*?<\/h[23]>/gi, '');
  cleaned = cleaned.replace(/SSS:[^]*?(?=\n\n|\n<h|\n<p|$)/gi, '');
  cleaned = cleaned.replace(/<p>.*?Sık Sorulan Sorular.*?<\/p>/gi, '');
  
  // Remove AI patterns
  const aiPatterns = [
    /Bu yazıda[^.]*\./gi, /Günümüzde[^.]*\./gi, /Son yıllarda[^.]*\./gi,
    /hayalinizdeki[^.]*\./gi, /tatil cenneti[^.]*\./gi, /eşsiz fırsat[^.]*\./gi,
    /yorumlarınızı bekliyorum[^]*?/gi, /düşünceleriniz neler[^]*?/gi,
    /image idea/gi, /\[IMAGE[^\]]*\]/gi, /\(IMAGE[^\)]*\)/gi,
    /\[Alt Text\]/gi, /\[Görsel açıklaması\]/gi, /\*\*:\*\*/g,
  ];
  aiPatterns.forEach(pattern => cleaned = cleaned.replace(pattern, ''));
  
  // Remove placeholders
  cleaned = cleaned.replace(/\[.*?\]/g, '');
  cleaned = cleaned.replace(/<img[^>]*alt=["']\s*["'][^>]*>/gi, '');
  cleaned = cleaned.replace(/<figcaption>\s*<\/figcaption>/gi, '');
  
  // Clean structure
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/<p>\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<p><\/p>/gi, '');
  cleaned = cleaned.replace(/<p>\s*&nbsp;\s*<\/p>/gi, '');
  cleaned = cleaned.replace(/<li>\s*<\/li>/gi, '');
  cleaned = cleaned.replace(/<div>\s*<\/div>/gi, '');
  
  // Limit paragraphs
  const paragraphMatches = cleaned.match(/<p[^>]*>.*?<\/p>/gi);
  if (paragraphMatches && paragraphMatches.length > 10) {
    cleaned = paragraphMatches.slice(0, 10).join('\n');
  }
  
  // Remove lists
  cleaned = cleaned.replace(/<ul[^>]*>.*?<\/ul>/gi, '');
  cleaned = cleaned.replace(/<ol[^>]*>.*?<\/ol>/gi, '');
  
  cleaned = cleaned.trim();
  cleaned = cleaned.replace(/^<[^>]+>\s*<\/[^>]+>$/gm, '');
  cleaned = cleaned.replace(/<\/p>\s*<p>/gi, '</p>\n<p>');
  
  return cleaned;
}

interface SanitizationResult {
  total: number;
  cleaned: number;
  errors: string[];
  skipped: string[];
}

async function sanitizeListings(): Promise<SanitizationResult> {
  const result: SanitizationResult = {
    total: 0,
    cleaned: 0,
    errors: [],
    skipped: [],
  };

  try {
    const supabase = createServiceClient();
    
    // Fetch all listings with description_long
    const { data: listings, error: fetchError } = await supabase
      .from('listings')
      .select('id, slug, title, description_long')
      .not('description_long', 'is', null);

    if (fetchError) {
      result.errors.push(`Fetch error: ${fetchError.message}`);
      return result;
    }

    if (!listings || listings.length === 0) {
      console.log('No listings found with description_long');
      return result;
    }

    result.total = listings.length;
    console.log(`\n📋 Processing ${listings.length} listings...\n`);

    for (const listing of listings) {
      if (!listing.description_long) {
        result.skipped.push(`${listing.slug} (no description)`);
        continue;
      }

      const original = listing.description_long;
      const cleaned = cleanDescription(original);

      // Check if cleaning made a difference
      if (cleaned === original.trim()) {
        result.skipped.push(`${listing.slug} (no changes needed)`);
        continue;
      }

      // Check if cleaned is too short (might have removed too much)
      if (cleaned.length < 50) {
        result.errors.push(`${listing.slug} (cleaned too short: ${cleaned.length} chars)`);
        continue;
      }

      // Update in database
      const { error: updateError } = await supabase
        .from('listings')
        .update({
          description_long: cleaned,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listing.id);

      if (updateError) {
        result.errors.push(`${listing.slug}: ${updateError.message}`);
      } else {
        result.cleaned++;
        console.log(`  ✅ Cleaned: ${listing.slug} (${original.length} → ${cleaned.length} chars)`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error: any) {
    result.errors.push(`Exception: ${error.message}`);
  }

  return result;
}

async function sanitizeArticles(): Promise<SanitizationResult> {
  const result: SanitizationResult = {
    total: 0,
    cleaned: 0,
    errors: [],
    skipped: [],
  };

  try {
    const supabase = createServiceClient();
    
    // Fetch all articles with content
    const { data: articles, error: fetchError } = await supabase
      .from('articles')
      .select('id, slug, title, content')
      .not('content', 'is', null);

    if (fetchError) {
      result.errors.push(`Fetch error: ${fetchError.message}`);
      return result;
    }

    if (!articles || articles.length === 0) {
      console.log('No articles found with content');
      return result;
    }

    result.total = articles.length;
    console.log(`\n📋 Processing ${articles.length} articles...\n`);

    for (const article of articles) {
      if (!article.content) {
        result.skipped.push(`${article.slug} (no content)`);
        continue;
      }

      let cleaned = article.content;

      // Remove placeholders (articles can have headings, but not placeholders)
      cleaned = cleaned.replace(/image idea/gi, '');
      cleaned = cleaned.replace(/\[IMAGE[^\]]*\]/gi, '');
      cleaned = cleaned.replace(/\(IMAGE[^\)]*\)/gi, '');
      cleaned = cleaned.replace(/\[Alt Text\]/gi, '');
      cleaned = cleaned.replace(/\[Görsel açıklaması\]/gi, '');
      cleaned = cleaned.replace(/\*\*:\*\*/g, '');
      cleaned = cleaned.replace(/\[.*?\]/g, '');

      // Remove empty paragraphs
      cleaned = cleaned.replace(/<p>\s*<\/p>/gi, '');
      cleaned = cleaned.replace(/<p><\/p>/gi, '');

      // Clean up multiple newlines
      cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
      cleaned = cleaned.trim();

      if (cleaned === article.content.trim()) {
        result.skipped.push(`${article.slug} (no changes needed)`);
        continue;
      }

      // Update in database
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          content: cleaned,
          updated_at: new Date().toISOString(),
        })
        .eq('id', article.id);

      if (updateError) {
        result.errors.push(`${article.slug}: ${updateError.message}`);
      } else {
        result.cleaned++;
        console.log(`  ✅ Cleaned: ${article.slug}`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error: any) {
    result.errors.push(`Exception: ${error.message}`);
  }

  return result;
}

async function main() {
  console.log('🧹 Global Content Sanitization Starting...\n');

  const listingResult = await sanitizeListings();
  const articleResult = await sanitizeArticles();

  console.log('\n' + '='.repeat(60));
  console.log('📊 SANITIZATION RESULTS');
  console.log('='.repeat(60));
  
  console.log('\n📋 LISTINGS:');
  console.log(`  Total: ${listingResult.total}`);
  console.log(`  Cleaned: ${listingResult.cleaned}`);
  console.log(`  Skipped: ${listingResult.skipped.length}`);
  console.log(`  Errors: ${listingResult.errors.length}`);
  
  if (listingResult.errors.length > 0) {
    console.log('\n  ❌ Errors:');
    listingResult.errors.slice(0, 10).forEach(err => console.log(`    - ${err}`));
    if (listingResult.errors.length > 10) {
      console.log(`    ... and ${listingResult.errors.length - 10} more`);
    }
  }

  console.log('\n📝 ARTICLES:');
  console.log(`  Total: ${articleResult.total}`);
  console.log(`  Cleaned: ${articleResult.cleaned}`);
  console.log(`  Skipped: ${articleResult.skipped.length}`);
  console.log(`  Errors: ${articleResult.errors.length}`);
  
  if (articleResult.errors.length > 0) {
    console.log('\n  ❌ Errors:');
    articleResult.errors.slice(0, 10).forEach(err => console.log(`    - ${err}`));
    if (articleResult.errors.length > 10) {
      console.log(`    ... and ${articleResult.errors.length - 10} more`);
    }
  }

  console.log('\n✅ Sanitization complete!\n');
}

main().catch(console.error);
