/**
 * Test created articles by checking their URLs
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

const targetTitles = [
  'Karasu Satılık Daire Alım Rehberi: 2025 Yılında Dikkat Edilmesi Gerekenler',
  'Karasu\'da Satılık Daire Fiyatları: Mahalle Bazlı Detaylı Analiz',
  'Karasu Satılık Daire Yatırım Rehberi: ROI Hesaplama ve Yatırım Stratejileri',
  'Karasu\'da Satılık Daire Alırken Yasal Süreçler ve Tapu İşlemleri',
  'Karasu Satılık Daire: Denize Yakın vs Merkez Konum Karşılaştırması',
  'Karasu\'da 2025 Yılı Satılık Daire Piyasa Trendleri',
  'Karasu Sahilinde Satılık Daire Fırsatları',
  'Karasu Merkez\'de Satılık Daire Arayanlar İçin İpuçları',
  'Karasu\'da Kredi ile Satılık Daire Alım Süreci',
  'Karasu Satılık Daire: Eşyalı vs Eşyasız Seçenekler',
];

async function testArticles() {
  console.log('🧪 Testing created articles...\n');
  console.log('📋 Article URLs to test:\n');
  
  for (const title of targetTitles) {
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, slug, status, content')
      .ilike('title', `%${title}%`)
      .limit(1);
    
    if (!articles || articles.length === 0) {
      console.log(`❌ Not found: ${title}`);
      continue;
    }
    
    const article = articles[0];
    const url = `http://localhost:3000/tr/blog/${article.slug}`;
    const wordCount = article.content ? article.content.split(/\s+/).length : 0;
    
    console.log(`✅ ${article.title}`);
    console.log(`   URL: ${url}`);
    console.log(`   Status: ${article.status}`);
    console.log(`   Word Count: ${wordCount}`);
    console.log(`   Slug: ${article.slug}`);
    console.log('');
  }
  
  console.log('\n🌐 Test URLs in browser:');
  console.log('   http://localhost:3000/tr/blog');
  console.log('   http://localhost:3000/tr/karasu-satilik-daire');
}

testArticles().catch(console.error);
