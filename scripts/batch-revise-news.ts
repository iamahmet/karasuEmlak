/**
 * Batch Content Revision Script
 * 
 * Revises all draft news articles using the content revision framework.
 * Requires human review before publishing.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { reviseNewsArticle } from './content-revision-framework';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

function createServiceClient() {
  return createClient(supabaseUrl, supabaseKey);
}

async function batchReviseNews() {
  console.log('🚀 Starting batch revision of news articles...\n');

  const supabase = createServiceClient();

  // Fetch all draft news articles
  const { data: articles, error } = await supabase
    .from('news_articles')
    .select('id, title, slug, published')
    .eq('published', false)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching news articles:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('ℹ️  No draft news articles found.');
    return;
  }

  console.log(`📰 Found ${articles.length} draft news articles\n`);

  let revised = 0;
  let skipped = 0;
  let errors = 0;

  for (const article of articles) {
    try {
      console.log(`\n📝 Processing: "${article.title.substring(0, 60)}..."`);
      
      const revision = await reviseNewsArticle(article.id);

      if (revision) {
        revised++;
        console.log(`✅ Revised successfully`);
        console.log(`   Improvements: ${revision.after.improvements.length}`);
        console.log(`   Changes: ${JSON.stringify(revision.changes, null, 2)}`);
      } else {
        skipped++;
        console.log(`⏭️  Skipped (content too short or error)`);
      }
    } catch (error: any) {
      errors++;
      console.error(`❌ Error revising article ${article.id}:`, error.message);
    }
  }

  console.log(`\n\n✨ Batch revision completed!`);
  console.log(`📊 Revised: ${revised}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`\n⚠️  IMPORTANT: Review all revised articles before publishing!`);
}

// CLI usage
if (require.main === module) {
  batchReviseNews().catch(console.error);
}

export { batchReviseNews };
