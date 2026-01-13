/**
 * Verify and update internal links for "Karasu Satılık Daire" articles
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

async function verifyAndUpdateLinks() {
  console.log('🔗 Verifying and updating internal links...\n');
  
  const requiredLinks = [
    { text: 'Karasu Satılık Daire', url: '/karasu-satilik-daire' },
    { text: 'Karasu Satılık Ev', url: '/karasu-satilik-ev' },
    { text: 'Karasu Kiralık Daire', url: '/karasu-kiralik-daire' },
  ];
  
  let updated = 0;
  
  for (const title of targetTitles) {
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, internal_links')
      .ilike('title', `%${title}%`)
      .limit(1);
    
    if (!articles || articles.length === 0) {
      console.log(`⚠️  Not found: ${title}`);
      continue;
    }
    
    const article = articles[0];
    const currentLinks = article.internal_links || [];
    
    // Check if karasu-satilik-daire link exists
    const hasDaireLink = Array.isArray(currentLinks) && 
      currentLinks.some((l: any) => l.url === '/karasu-satilik-daire');
    
    if (!hasDaireLink) {
      console.log(`🔧 Updating: ${article.title.substring(0, 60)}...`);
      
      const { error } = await supabase
        .from('articles')
        .update({
          internal_links: requiredLinks,
          updated_at: new Date().toISOString(),
        })
        .eq('id', article.id);
      
      if (error) {
        console.error(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Updated internal links`);
        updated++;
      }
    } else {
      console.log(`✅ OK: ${article.title.substring(0, 60)}...`);
    }
  }
  
  console.log(`\n📊 Summary: ${updated} articles updated`);
}

verifyAndUpdateLinks().catch(console.error);
