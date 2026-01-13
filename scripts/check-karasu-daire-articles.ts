/**
 * Check created articles for "Karasu Satılık Daire"
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

async function checkArticles() {
  console.log('🔍 Checking created articles for "Karasu Satılık Daire"...\n');
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, status, category, created_at')
    .or('title.ilike.%Karasu Satılık Daire%,title.ilike.%karasu satılık daire%,title.ilike.%Karasu%da Satılık Daire%')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('⚠️  No articles found');
    return;
  }

  console.log(`✅ Found ${articles.length} articles:\n`);
  
  const cornerstone = articles.filter(a => 
    a.title.includes('Alım Rehberi') || 
    a.title.includes('Fiyatları') || 
    a.title.includes('Yatırım Rehberi') ||
    a.title.includes('Yasal Süreçler') ||
    a.title.includes('Denize Yakın vs Merkez')
  );
  
  const blog = articles.filter(a => 
    a.title.includes('2025 Yılı') ||
    a.title.includes('Sahilinde') ||
    a.title.includes('Merkez') ||
    a.title.includes('Kredi ile') ||
    a.title.includes('Eşyalı vs Eşyasız')
  );

  console.log('📚 CORNERSTONE Articles:');
  cornerstone.forEach((a, i) => {
    console.log(`   ${i + 1}. ${a.title}`);
    console.log(`      Slug: ${a.slug}`);
    console.log(`      Status: ${a.status}`);
    console.log(`      Category: ${a.category || 'N/A'}`);
    console.log('');
  });

  console.log('📝 BLOG Posts:');
  blog.forEach((a, i) => {
    console.log(`   ${i + 1}. ${a.title}`);
    console.log(`      Slug: ${a.slug}`);
    console.log(`      Status: ${a.status}`);
    console.log(`      Category: ${a.category || 'N/A'}`);
    console.log('');
  });

  console.log(`\n📊 Summary:`);
  console.log(`   - Cornerstone: ${cornerstone.length}/5`);
  console.log(`   - Blog: ${blog.length}/5`);
  console.log(`   - Total: ${articles.length}`);
}

checkArticles().catch(console.error);
