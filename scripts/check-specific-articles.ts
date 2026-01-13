/**
 * Check specific articles for "Karasu Satılık Daire"
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

const targetTitles = {
  cornerstone: [
    'Karasu Satılık Daire Alım Rehberi: 2025 Yılında Dikkat Edilmesi Gerekenler',
    'Karasu\'da Satılık Daire Fiyatları: Mahalle Bazlı Detaylı Analiz',
    'Karasu Satılık Daire Yatırım Rehberi: ROI Hesaplama ve Yatırım Stratejileri',
    'Karasu\'da Satılık Daire Alırken Yasal Süreçler ve Tapu İşlemleri',
    'Karasu Satılık Daire: Denize Yakın vs Merkez Konum Karşılaştırması',
  ],
  blog: [
    'Karasu\'da 2025 Yılı Satılık Daire Piyasa Trendleri',
    'Karasu Sahilinde Satılık Daire Fırsatları',
    'Karasu Merkez\'de Satılık Daire Arayanlar İçin İpuçları',
    'Karasu\'da Kredi ile Satılık Daire Alım Süreci',
    'Karasu Satılık Daire: Eşyalı vs Eşyasız Seçenekler',
  ],
};

async function checkArticles() {
  console.log('🔍 Checking specific articles...\n');
  
  console.log('📚 CORNERSTONE Articles:');
  for (const title of targetTitles.cornerstone) {
    const { data } = await supabase
      .from('articles')
      .select('id, title, slug, status')
      .ilike('title', `%${title}%`)
      .limit(1);
    
    if (data && data.length > 0) {
      console.log(`   ✅ ${title}`);
      console.log(`      ID: ${data[0].id}, Slug: ${data[0].slug}, Status: ${data[0].status}`);
    } else {
      console.log(`   ❌ ${title} - NOT FOUND`);
    }
  }
  
  console.log('\n📝 BLOG Posts:');
  for (const title of targetTitles.blog) {
    const { data } = await supabase
      .from('articles')
      .select('id, title, slug, status')
      .ilike('title', `%${title}%`)
      .limit(1);
    
    if (data && data.length > 0) {
      console.log(`   ✅ ${title}`);
      console.log(`      ID: ${data[0].id}, Slug: ${data[0].slug}, Status: ${data[0].status}`);
    } else {
      console.log(`   ❌ ${title} - NOT FOUND`);
    }
  }
}

checkArticles().catch(console.error);
