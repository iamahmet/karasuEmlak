import dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function verify() {
  console.log('🔍 Verifying database content...\n');

  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('id, title, published, available')
    .limit(10);

  console.log('📊 Listings:', listings?.length || 0);
  if (listingsError) console.error('Error:', listingsError.message);
  if (listings && listings.length > 0) {
    console.log('   Sample:', listings[0].title);
    console.log('   Published:', listings.filter(l => l.published && l.available).length);
  }

  const { data: neighborhoods, error: neighborhoodsError } = await supabase
    .from('neighborhoods')
    .select('id, name, published')
    .limit(10);

  console.log('\n📊 Neighborhoods:', neighborhoods?.length || 0);
  if (neighborhoodsError) console.error('Error:', neighborhoodsError.message);
  if (neighborhoods && neighborhoods.length > 0) {
    console.log('   Sample:', neighborhoods[0].name);
    console.log('   Published:', neighborhoods.filter(n => n.published).length);
  }

  const { data: news, error: newsError } = await supabase
    .from('news_articles')
    .select('id, title, published')
    .limit(10);

  console.log('\n📊 News Articles:', news?.length || 0);
  if (newsError) console.error('Error:', newsError.message);
  if (news && news.length > 0) {
    console.log('   Sample:', news[0].title);
    console.log('   Published:', news.filter(n => n.published).length);
  }

  console.log('\n✅ Verification complete!');
}

verify();
