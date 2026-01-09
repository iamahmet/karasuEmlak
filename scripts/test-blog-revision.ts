/**
 * Test Content Revision on Blog Articles
 * 
 * Tests the content revision framework on 1-2 blog articles
 * to verify it works correctly before batch processing.
 */

import { reviseBlogArticle } from './content-revision-framework';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

function createServiceClient() {
  return createClient(supabaseUrl, supabaseKey);
}

async function testBlogRevision() {
  console.log('🧪 Testing content revision on blog articles...\n');

  const supabase = createServiceClient();

  // Get 2 blog articles (draft or published)
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, content, status, is_published')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(2);

  if (error) {
    console.error('❌ Error fetching blog articles:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('ℹ️  No blog articles found.');
    console.log('💡 Tip: Create some blog articles first via admin panel or script.');
    return;
  }

  console.log(`📝 Found ${articles.length} blog articles to test\n`);

  for (const article of articles) {
    const content = article.content || '';
    
    if (!content || content.length < 200) {
      console.log(`⏭️  Skipping "${article.title}" - content too short (${content.length} chars)`);
      continue;
    }

    console.log(`\n📝 Testing revision for: "${article.title.substring(0, 60)}..."`);
    console.log(`   Content length: ${content.length} characters`);
    console.log(`   Status: ${article.status || (article.is_published ? 'published' : 'draft')}`);
    console.log(`   Article ID: ${article.id}\n`);

    try {
      const revision = await reviseBlogArticle(article.id);

      if (revision) {
        console.log('✅ Revision successful!');
        console.log(`\n   Improvements made:`);
        revision.after.improvements.forEach(imp => {
          console.log(`   - ${imp}`);
        });
        console.log(`\n   Changes summary:`);
        console.log(`   - Intro rewritten: ${revision.changes.introRewritten}`);
        console.log(`   - Headings improved: ${revision.changes.headingsImproved}`);
        console.log(`   - Internal links added: ${revision.changes.internalLinksAdded}`);
        console.log(`   - AI-friendly blocks added: ${revision.changes.aiFriendlyBlocksAdded}`);
        console.log(`   - Fluff removed: ${revision.changes.fluffRemoved}`);
        console.log(`\n   Content length: ${revision.before.content.length} → ${revision.after.content.length} characters`);
      } else {
        console.log('❌ Revision returned null');
      }
    } catch (error: any) {
      console.error(`❌ Error revising article:`, error.message);
    }
  }

  console.log(`\n\n✨ Test completed!`);
  console.log(`\n⚠️  IMPORTANT: Review revised articles in admin panel before publishing!`);
}

// CLI usage
if (require.main === module) {
  testBlogRevision().catch(console.error);
}

export { testBlogRevision };
