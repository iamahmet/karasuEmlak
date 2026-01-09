#!/usr/bin/env tsx
/**
 * Batch Content Improvement Script
 * 
 * Scans all blog articles and news articles, calculates quality scores,
 * detects low-quality content, and provides improvement suggestions.
 * Updates database with quality scores and issues.
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { detectLowQualityContent } from '../../apps/web/lib/utils/content-quality-checker';
import { checkContentQuality } from '../../apps/web/lib/services/content-quality-service';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  meta_description?: string;
  keywords?: string[];
  category?: string;
  tags?: string[];
  quality_score?: number;
  quality_issues?: any;
}

interface ProcessingResult {
  total: number;
  processed: number;
  updated: number;
  errors: string[];
  lowQuality: Array<{
    id: string;
    title: string;
    slug: string;
    score: number;
    issues: number;
  }>;
}

/**
 * Process blog articles
 */
async function processBlogArticles(limit?: number): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    total: 0,
    processed: 0,
    updated: 0,
    errors: [],
    lowQuality: [],
  };

  try {
    // Fetch all published articles
    let query = supabase
      .from('articles')
      .select('id, title, slug, content, excerpt, meta_description, keywords, category, tags, quality_score, quality_issues')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data: articles, error } = await query;

    if (error) {
      result.errors.push(`Error fetching articles: ${error.message}`);
      return result;
    }

    if (!articles || articles.length === 0) {
      console.log('No articles found');
      return result;
    }

    result.total = articles.length;
    console.log(`\n📋 Found ${result.total} articles to process\n`);

    // Get all articles for duplicate detection
    const allArticles = articles.map(a => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      content: a.content || '',
    }));

    // Process each article
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i] as ContentItem;
      
      try {
        console.log(`[${i + 1}/${articles.length}] Processing: ${article.title.substring(0, 50)}...`);

        // Calculate quality score
        const qualityScore = detectLowQualityContent(
          article.content || '',
          article.title,
          allArticles.filter(a => a.id !== article.id)
        );

        // Check if quality score changed significantly
        const currentScore = article.quality_score || 0;
        const scoreChanged = Math.abs(qualityScore.overall - currentScore) > 5;

        // Update if score changed or if no score exists
        if (scoreChanged || !article.quality_score) {
          const updateData: any = {
            quality_score: qualityScore.overall,
            quality_issues: qualityScore.issues,
            updated_at: new Date().toISOString(),
          };

          const { error: updateError } = await supabase
            .from('articles')
            .update(updateData)
            .eq('id', article.id);

          if (updateError) {
            result.errors.push(`${article.slug}: ${updateError.message}`);
            console.log(`   ❌ Update failed: ${updateError.message}`);
          } else {
            result.updated++;
            console.log(`   ✅ Updated (score: ${qualityScore.overall}, issues: ${qualityScore.issues.length})`);
          }
        } else {
          console.log(`   ⏭️  Skipped (no significant change)`);
        }

        // Track low quality articles
        if (qualityScore.overall < 50) {
          result.lowQuality.push({
            id: article.id,
            title: article.title,
            slug: article.slug,
            score: qualityScore.overall,
            issues: qualityScore.issues.length,
          });
        }

        result.processed++;

        // Rate limiting
        if (i < articles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error: any) {
        result.errors.push(`${article.slug}: ${error.message}`);
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  } catch (error: any) {
    result.errors.push(`Exception: ${error.message}`);
  }

  return result;
}

/**
 * Process news articles
 */
async function processNewsArticles(limit?: number): Promise<ProcessingResult> {
  const result: ProcessingResult = {
    total: 0,
    processed: 0,
    updated: 0,
    errors: [],
    lowQuality: [],
  };

  try {
    // Fetch all published news articles
    let query = supabase
      .from('news_articles')
      .select('id, title, slug, original_summary, emlak_analysis, seo_description, seo_keywords, quality_score, quality_issues')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data: articles, error } = await query;

    if (error) {
      result.errors.push(`Error fetching news articles: ${error.message}`);
      return result;
    }

    if (!articles || articles.length === 0) {
      console.log('No news articles found');
      return result;
    }

    result.total = articles.length;
    console.log(`\n📋 Found ${result.total} news articles to process\n`);

    // Process each article
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i] as any;
      
      try {
        console.log(`[${i + 1}/${articles.length}] Processing: ${article.title.substring(0, 50)}...`);

        // Combine original_summary and emlak_analysis for quality check
        const content = `${article.original_summary || ''} ${article.emlak_analysis || ''}`.trim();

        if (!content) {
          console.log(`   ⏭️  Skipped (no content)`);
          continue;
        }

        // Calculate quality score
        const qualityScore = detectLowQualityContent(content, article.title);

        // Check if quality score changed significantly
        const currentScore = article.quality_score || 0;
        const scoreChanged = Math.abs(qualityScore.overall - currentScore) > 5;

        // Update if score changed or if no score exists
        if (scoreChanged || !article.quality_score) {
          const updateData: any = {
            quality_score: qualityScore.overall,
            quality_issues: qualityScore.issues,
            updated_at: new Date().toISOString(),
          };

          const { error: updateError } = await supabase
            .from('news_articles')
            .update(updateData)
            .eq('id', article.id);

          if (updateError) {
            result.errors.push(`${article.slug}: ${updateError.message}`);
            console.log(`   ❌ Update failed: ${updateError.message}`);
          } else {
            result.updated++;
            console.log(`   ✅ Updated (score: ${qualityScore.overall}, issues: ${qualityScore.issues.length})`);
          }
        } else {
          console.log(`   ⏭️  Skipped (no significant change)`);
        }

        // Track low quality articles
        if (qualityScore.overall < 50) {
          result.lowQuality.push({
            id: article.id,
            title: article.title,
            slug: article.slug,
            score: qualityScore.overall,
            issues: qualityScore.issues.length,
          });
        }

        result.processed++;

        // Rate limiting
        if (i < articles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error: any) {
        result.errors.push(`${article.slug}: ${error.message}`);
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  } catch (error: any) {
    result.errors.push(`Exception: ${error.message}`);
  }

  return result;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting batch content improvement...\n');

  const args = process.argv.slice(2);
  const limit = args.includes('--limit') 
    ? parseInt(args[args.indexOf('--limit') + 1]) || undefined
    : undefined;
  
  const type = args.includes('--type')
    ? args[args.indexOf('--type') + 1]
    : 'all';

  // Process blog articles
  if (type === 'all' || type === 'blog') {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PROCESSING BLOG ARTICLES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const blogResult = await processBlogArticles(limit);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('BLOG ARTICLES SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Processed: ${blogResult.processed}/${blogResult.total}`);
    console.log(`📝 Updated: ${blogResult.updated}`);
    console.log(`⚠️  Low Quality: ${blogResult.lowQuality.length}`);
    console.log(`❌ Errors: ${blogResult.errors.length}`);
    
    if (blogResult.lowQuality.length > 0) {
      console.log('\n⚠️  Low Quality Articles:');
      blogResult.lowQuality.slice(0, 10).forEach(item => {
        console.log(`   - ${item.title.substring(0, 50)} (score: ${item.score}, issues: ${item.issues})`);
      });
      if (blogResult.lowQuality.length > 10) {
        console.log(`   ... and ${blogResult.lowQuality.length - 10} more`);
      }
    }
    
    if (blogResult.errors.length > 0) {
      console.log('\n❌ Errors:');
      blogResult.errors.slice(0, 5).forEach(error => {
        console.log(`   - ${error}`);
      });
      if (blogResult.errors.length > 5) {
        console.log(`   ... and ${blogResult.errors.length - 5} more`);
      }
    }
  }

  // Process news articles
  if (type === 'all' || type === 'news') {
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PROCESSING NEWS ARTICLES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const newsResult = await processNewsArticles(limit);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('NEWS ARTICLES SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Processed: ${newsResult.processed}/${newsResult.total}`);
    console.log(`📝 Updated: ${newsResult.updated}`);
    console.log(`⚠️  Low Quality: ${newsResult.lowQuality.length}`);
    console.log(`❌ Errors: ${newsResult.errors.length}`);
    
    if (newsResult.lowQuality.length > 0) {
      console.log('\n⚠️  Low Quality Articles:');
      newsResult.lowQuality.slice(0, 10).forEach(item => {
        console.log(`   - ${item.title.substring(0, 50)} (score: ${item.score}, issues: ${item.issues})`);
      });
      if (newsResult.lowQuality.length > 10) {
        console.log(`   ... and ${newsResult.lowQuality.length - 10} more`);
      }
    }
    
    if (newsResult.errors.length > 0) {
      console.log('\n❌ Errors:');
      newsResult.errors.slice(0, 5).forEach(error => {
        console.log(`   - ${error}`);
      });
      if (newsResult.errors.length > 5) {
        console.log(`   ... and ${newsResult.errors.length - 5} more`);
      }
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Batch processing complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run
main().catch(console.error);
