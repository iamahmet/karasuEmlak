/**
 * Check article content in database
 * Usage: pnpm tsx scripts/check-article-content.ts karasu-yatirim-rehberi
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
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkArticle(slug: string) {
  console.log(`\n🔍 Checking article: ${slug}\n`);

  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, content, status, published_at, created_at')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!data) {
    console.log('❌ Article not found');
    return;
  }

  console.log('✅ Article found:');
  console.log(`   ID: ${data.id}`);
  console.log(`   Title: ${data.title}`);
  console.log(`   Slug: ${data.slug}`);
  console.log(`   Status: ${data.status}`);
  console.log(`   Published: ${data.published_at}`);
  console.log(`   Created: ${data.created_at}`);
  console.log(`\n📄 Content:`);
  console.log(`   Type: ${typeof data.content}`);
  console.log(`   Is null: ${data.content === null}`);
  console.log(`   Is undefined: ${data.content === undefined}`);
  console.log(`   Length: ${data.content?.length || 0}`);
  console.log(`   Is empty: ${!data.content || (typeof data.content === 'string' && data.content.trim().length === 0)}`);
  
  if (data.content && typeof data.content === 'string' && data.content.length > 0) {
    console.log(`\n   Preview (first 200 chars):`);
    console.log(`   ${data.content.substring(0, 200)}...`);
  } else {
    console.log(`\n   ⚠️  Content is empty or missing!`);
  }
}

const slug = process.argv[2] || 'karasu-yatirim-rehberi';
checkArticle(slug).catch(console.error);
