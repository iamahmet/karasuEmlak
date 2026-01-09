/**
 * SEO Domination - Events Monitor & Measurement
 * 
 * Monitors and reports on SEO events
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
 * Get SEO events summary
 */
async function getEventsSummary() {
  const { data: events, error } = await supabase
    .from('seo_events')
    .select('event_type, entity_type, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching events:', error);
    return null;
  }

  if (!events || events.length === 0) {
    return null;
  }

  // Group by event type
  const summary: Record<string, {
    total: number;
    completed: number;
    failed: number;
    latest: string | null;
  }> = {};

  for (const event of events) {
    if (!summary[event.event_type]) {
      summary[event.event_type] = {
        total: 0,
        completed: 0,
        failed: 0,
        latest: null,
      };
    }

    summary[event.event_type].total++;
    if (event.status === 'completed') {
      summary[event.event_type].completed++;
    } else if (event.status === 'failed') {
      summary[event.event_type].failed++;
    }

    if (!summary[event.event_type].latest) {
      summary[event.event_type].latest = event.created_at;
    }
  }

  return summary;
}

/**
 * Get content statistics
 */
async function getContentStats() {
  const [articlesResult, qaResult] = await Promise.all([
    supabase
      .from('articles')
      .select('id, status, created_at', { count: 'exact' }),
    supabase
      .from('ai_questions')
      .select('id, status, created_at', { count: 'exact' })
      .eq('generated_by_ai', true),
  ]);

  return {
    articles: {
      total: articlesResult.count || 0,
      draft: articlesResult.data?.filter(a => a.status === 'draft').length || 0,
      published: articlesResult.data?.filter(a => a.status === 'published').length || 0,
    },
    qa: {
      total: qaResult.count || 0,
      draft: qaResult.data?.filter(q => q.status === 'draft').length || 0,
      published: qaResult.data?.filter(q => q.status === 'published').length || 0,
    },
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('📊 SEO Domination - Events Monitor\n');

  // Get events summary
  const eventsSummary = await getEventsSummary();
  if (eventsSummary) {
    console.log('📈 SEO Events Summary:');
    console.log('─'.repeat(50));
    for (const [eventType, stats] of Object.entries(eventsSummary)) {
      console.log(`\n${eventType}:`);
      console.log(`  Total: ${stats.total}`);
      console.log(`  Completed: ${stats.completed}`);
      console.log(`  Failed: ${stats.failed}`);
      if (stats.latest) {
        console.log(`  Latest: ${new Date(stats.latest).toLocaleString()}`);
      }
    }
  } else {
    console.log('No SEO events found');
  }

  // Get content statistics
  const contentStats = await getContentStats();
  console.log('\n\n📚 Content Statistics:');
  console.log('─'.repeat(50));
  console.log('\nArticles:');
  console.log(`  Total: ${contentStats.articles.total}`);
  console.log(`  Draft: ${contentStats.articles.draft}`);
  console.log(`  Published: ${contentStats.articles.published}`);
  console.log('\nQ&A Blocks:');
  console.log(`  Total: ${contentStats.qa.total}`);
  console.log(`  Draft: ${contentStats.qa.draft}`);
  console.log(`  Published: ${contentStats.qa.published}`);

  console.log('\n\n✨ Monitoring complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

export { getEventsSummary, getContentStats };
