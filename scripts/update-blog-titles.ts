/**
 * Update blog article titles to be more professional and SEO-optimized
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

// Professional title mappings
const titleUpdates: Record<string, string> = {
  // Cornerstone Articles
  'Karasu Satılık Daire Alım Rehberi: 2025 Yılında Dikkat Edilmesi Gerekenler': 
    'Karasu\'da Daire Alırken Bilmeniz Gereken Her Şey: 2025 Rehberi',
  
  'Karasu\'da Satılık Daire Fiyatları: Mahalle Bazlı Detaylı Analiz': 
    'Karasu Satılık Daire Fiyatları: Mahalle Mahalle 2025 Analizi',
  
  'Karasu Satılık Daire Yatırım Rehberi: ROI Hesaplama ve Yatırım Stratejileri': 
    'Karasu\'da Daire Yatırımı: ROI Hesaplama ve Kazanç Stratejileri',
  
  'Karasu\'da Satılık Daire Alırken Yasal Süreçler ve Tapu İşlemleri': 
    'Karasu\'da Daire Alımında Yasal Rehber: Tapu ve Belgeler',
  
  'Karasu Satılık Daire: Denize Yakın vs Merkez Konum Karşılaştırması': 
    'Karasu\'da Daire Alırken: Denize Yakın mı, Merkez mi?',
  
  // Blog Posts
  'Karasu\'da 2025 Yılı Satılık Daire Piyasa Trendleri': 
    'Karasu Emlak Piyasası 2025: Daire Fiyatları ve Trendler',
  
  'Karasu Sahilinde Satılık Daire Fırsatları': 
    'Karasu Sahilinde Daire: Denize Sıfır Fırsatlar ve Fiyatlar',
  
  'Karasu Merkez\'de Satılık Daire Arayanlar İçin İpuçları': 
    'Karasu Merkez\'de Daire Arayanlar İçin 10 Pratik İpucu',
  
  'Karasu\'da Kredi ile Satılık Daire Alım Süreci': 
    'Karasu\'da Kredi ile Daire Alımı: Başvuru ve Onay Süreci',
  
  'Karasu Satılık Daire: Eşyalı vs Eşyasız Seçenekler': 
    'Karasu\'da Daire Alırken: Eşyalı mı, Eşyasız mı?',
};

async function updateTitles() {
  console.log('📝 Updating blog article titles to be more professional...\n');
  
  let updated = 0;
  let skipped = 0;
  
  for (const [oldTitle, newTitle] of Object.entries(titleUpdates)) {
    // Find article by title
    const { data: articles, error: findError } = await supabase
      .from('articles')
      .select('id, title, slug')
      .ilike('title', `%${oldTitle}%`)
      .limit(1);
    
    if (findError) {
      console.error(`❌ Error finding article "${oldTitle}":`, findError.message);
      continue;
    }
    
    if (!articles || articles.length === 0) {
      console.log(`⚠️  Article not found: "${oldTitle}"`);
      skipped++;
      continue;
    }
    
    const article = articles[0];
    
    // Check if already updated
    if (article.title === newTitle) {
      console.log(`⏭️  Already updated: "${newTitle}"`);
      skipped++;
      continue;
    }
    
    // Update title
    const { error: updateError } = await supabase
      .from('articles')
      .update({
        title: newTitle,
        updated_at: new Date().toISOString(),
      })
      .eq('id', article.id);
    
    if (updateError) {
      console.error(`❌ Error updating "${oldTitle}":`, updateError.message);
      continue;
    }
    
    console.log(`✅ Updated: "${oldTitle}"`);
    console.log(`   → "${newTitle}"`);
    console.log(`   Slug: ${article.slug}\n`);
    updated++;
  }
  
  console.log('\n📊 Summary:');
  console.log(`   - Updated: ${updated}`);
  console.log(`   - Skipped: ${skipped}`);
  console.log(`   - Total: ${Object.keys(titleUpdates).length}`);
}

updateTitles().catch(console.error);
