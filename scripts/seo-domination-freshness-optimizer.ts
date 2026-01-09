/**
 * SEO Domination - Freshness & Discover Optimizer
 * 
 * Optimizes content for Google Discover and freshness signals
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Optimize article for Discover
 */
async function optimizeForDiscover(article: {
  id: string;
  title: string;
  content: string;
  featured_image?: string | null;
  meta_description?: string | null;
}) {
  // Check if already optimized
  if (article.featured_image && article.meta_description) {
    return false;
  }

  const updates: any = {};

  // Ensure featured image exists
  if (!article.featured_image) {
    // Will be handled by image generator
    console.log(`⚠️  Missing featured image for: ${article.title}`);
  }

  // Optimize meta description for Discover
  if (!article.meta_description || article.meta_description.length < 100) {
    const excerpt = article.content
      .replace(/<[^>]*>/g, '') // Remove HTML
      .substring(0, 160)
      .trim();
    
    updates.meta_description = excerpt;
  }

  // Update article
  if (Object.keys(updates).length > 0) {
    updates.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', article.id);

    if (error) {
      console.error(`❌ Error updating article:`, error);
      return false;
    }

    console.log(`✅ Optimized: ${article.title}`);
    return true;
  }

  return false;
}

/**
 * Update freshness signals
 */
async function updateFreshnessSignals() {
  console.log('🔄 Updating freshness signals...\n');

  // Get articles that need freshness update
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, content, featured_image, meta_description, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('No published articles found');
    return;
  }

  console.log(`Found ${articles.length} articles to optimize\n`);

  let optimized = 0;

  for (const article of articles) {
    try {
      const wasOptimized = await optimizeForDiscover(article);
      if (wasOptimized) {
        optimized++;
      }
    } catch (error: any) {
      console.error(`Error optimizing ${article.title}:`, error.message);
    }
  }

  console.log(`\n\n✨ Freshness optimization completed!`);
  console.log(`📊 Optimized: ${optimized} articles`);

  // Log SEO event
  await supabase.from('seo_events').insert({
    event_type: 'freshness_optimized',
    entity_type: 'article',
    event_data: {
      articles_optimized: optimized,
      total_checked: articles.length,
    },
    status: 'completed',
  });
}

/**
 * Main execution
 */
async function main() {
  await updateFreshnessSignals();
}

if (require.main === module) {
  main().catch(console.error);
}

export { optimizeForDiscover, updateFreshnessSignals };
