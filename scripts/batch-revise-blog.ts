/**
 * Batch Content Revision Script for Blog Articles
 * 
 * Revises all blog articles using the content revision framework.
 * Requires human review before publishing.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { reviseBlogArticle } from './content-revision-framework';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

function createServiceClient() {
  return createClient(supabaseUrl, supabaseKey);
}

async function batchReviseBlog() {
  console.log('🚀 Starting batch revision of blog articles...\n');

  const supabase = createServiceClient();

  // Fetch all blog articles
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, status, is_published, content')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching blog articles:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('ℹ️  No blog articles found.');
    return;
  }

  // Filter articles with sufficient content
  const articlesToRevise = articles.filter(a => {
    const content = a.content || '';
    return content.length >= 200;
  });

  console.log(`📝 Found ${articles.length} total blog articles`);
  console.log(`📝 ${articlesToRevise.length} articles have sufficient content for revision\n`);

  if (articlesToRevise.length === 0) {
    console.log('ℹ️  No articles with sufficient content to revise.');
    return;
  }

  let revised = 0;
  let skipped = 0;
  let errors = 0;

  for (const article of articlesToRevise) {
    try {
      console.log(`\n📝 Processing: "${article.title.substring(0, 60)}..."`);
      
      const revision = await reviseBlogArticle(article.id);

      if (revision) {
        revised++;
        console.log(`✅ Revised successfully`);
        console.log(`   Improvements: ${revision.after.improvements.length}`);
        console.log(`   Internal links: ${revision.changes.internalLinksAdded}`);
        console.log(`   AI blocks: ${revision.changes.aiFriendlyBlocksAdded}`);
      } else {
        skipped++;
        console.log(`⏭️  Skipped (revision returned null)`);
      }
    } catch (error: any) {
      errors++;
      console.error(`❌ Error:`, error.message);
    }
  }

  console.log(`\n\n✨ Batch revision completed!`);
  console.log(`📊 Statistics:`);
  console.log(`   ✅ Revised: ${revised}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`\n⚠️  IMPORTANT: Review revised articles in admin panel before publishing!`);
}

// CLI usage
if (require.main === module) {
  batchReviseBlog().catch(console.error);
}

export { batchReviseBlog };
