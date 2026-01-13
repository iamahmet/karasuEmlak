/**
 * Improve all blog article titles - comprehensive update
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

// Comprehensive title improvements
const titleImprovements: Record<string, string> = {
  // Already updated ones (keep them)
  'Karasu\'da Daire Alırken Bilmeniz Gereken Her Şey: 2025 Rehberi': null, // Keep
  'Karasu Satılık Daire Fiyatları: Mahalle Mahalle 2025 Analizi': null, // Keep
  'Karasu\'da Daire Yatırımı: ROI Hesaplama ve Kazanç Stratejileri': null, // Keep
  'Karasu\'da Daire Alımında Yasal Rehber: Tapu ve Belgeler': null, // Keep
  'Karasu\'da Daire Alırken: Denize Yakın mı, Merkez mi?': null, // Keep
  'Karasu Emlak Piyasası 2025: Daire Fiyatları ve Trendler': null, // Keep
  'Karasu Sahilinde Daire: Denize Sıfır Fırsatlar ve Fiyatlar': null, // Keep
  'Karasu Merkez\'de Daire Arayanlar İçin 10 Pratik İpucu': null, // Keep
  'Karasu\'da Kredi ile Daire Alımı: Başvuru ve Onay Süreci': null, // Keep
  'Karasu\'da Daire Alırken: Eşyalı mı, Eşyasız mı?': null, // Keep
  
  // Old titles that need updating
  'Karasu\'da Satılık Daire Fiyatları: Mahalle Bazlı Detaylı Analiz': 
    'Karasu Satılık Daire Fiyatları: Mahalle Mahalle 2025 Analizi',
  
  'Karasu\'da Satılık Daire Fiyatları: Mahalle Mahalle Derinlemesine Analiz': 
    'Karasu Satılık Daire Fiyatları: Mahalle Mahalle 2025 Analizi',
  
  // Mahalle yatırım rehberleri - shorten and improve
  'İnönü Mahallesi Karasu Satılık Daire Yatırım Rehberi: Kapsamlı Analiz ve Fırsatlar': 
    'İnönü Mahallesi: Karasu\'da Daire Yatırımı ve Fırsatlar',
  
  'İnköy Mahallesi Karasu Satılık Daire Yatırım Rehberi: Kapsamlı Analiz ve Fırsatlar': 
    'İnköy Mahallesi: Karasu\'da Daire Yatırımı ve Fırsatlar',
  
  'Deniz Mahallesi Karasu Satılık Daire Yatırım Rehberi: Kapsamlı Analiz ve Fırsatlar': 
    'Deniz Mahallesi: Karasu\'da Daire Yatırımı ve Fırsatlar',
  
  'Cumhuriyet Mahallesi Karasu Satılık Daire Yatırım Rehberi: Kapsamlı Analiz ve Fırsatlar': 
    'Cumhuriyet Mahallesi: Karasu\'da Daire Yatırımı ve Fırsatlar',
  
  'Çamlıca Mahallesi Karasu Satılık Daire Yatırım Rehberi: Kapsamlı Analiz ve Fırsatlar': 
    'Çamlıca Mahallesi: Karasu\'da Daire Yatırımı ve Fırsatlar',
  
  'Aziziye Mahallesi Karasu Satılık Daire Yatırım Rehberi: Kapsamlı Analiz ve Fırsatlar': 
    'Aziziye Mahallesi: Karasu\'da Daire Yatırımı ve Fırsatlar',
  
  'Çamlık Mahallesi Karasu Satılık Daire Yatırım Rehberi: Kapsamlı Analiz ve Fırsatlar': 
    'Çamlık Mahallesi: Karasu\'da Daire Yatırımı ve Fırsatlar',
  
  'Merkez Mahallesi Karasu Satılık Daire Yatırım Rehberi: Kapsamlı Analiz ve Fırsatlar': 
    'Merkez Mahallesi: Karasu\'da Daire Yatırımı ve Fırsatlar',
  
  'Sahil Mahallesi Karasu Satılık Daire Yatırım Rehberi: Kapsamlı Analiz ve Fırsatlar': 
    'Sahil Mahallesi: Karasu\'da Daire Yatırımı ve Fırsatlar',
  
  'Atatürk Mahallesi Karasu Satılık Daire Yatırım Rehberi: Kapsamlı Analiz ve Fırsatlar': 
    'Atatürk Mahallesi: Karasu\'da Daire Yatırımı ve Fırsatlar',
  
  // Other problematic titles
  'Karasu\'da Arsa Alırken Dikkat Edilmesi Gerekenler': 
    'Karasu\'da Arsa Alırken Bilmeniz Gerekenler',
  
  'Karasu\'da Villa Alırken Dikkat Edilmesi Gerekenler': 
    'Karasu\'da Villa Alırken Bilmeniz Gerekenler',
  
  'Karasu\'da Daire Alırken Dikkat Edilmesi Gerekenler': 
    'Karasu\'da Daire Alırken Bilmeniz Gerekenler',
  
  'Emlak Yatırımında ROI Hesaplama: Kapsamlı Rehber ve Örnekler': 
    'Emlak Yatırımında ROI Hesaplama: Pratik Rehber',
};

async function improveAllTitles() {
  console.log('📝 Improving all blog article titles...\n');
  
  // Get all published articles
  const { data: allArticles, error: fetchError } = await supabase
    .from('articles')
    .select('id, title, slug, category')
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  
  if (fetchError) {
    console.error('❌ Error fetching articles:', fetchError);
    return;
  }
  
  if (!allArticles || allArticles.length === 0) {
    console.log('⚠️  No published articles found');
    return;
  }
  
  let updated = 0;
  let skipped = 0;
  let notFound = 0;
  
  // Process each title improvement
  for (const [oldTitle, newTitle] of Object.entries(titleImprovements)) {
    if (newTitle === null) {
      // Skip - already good
      continue;
    }
    
    // Find articles matching old title (fuzzy match)
    const matchingArticles = allArticles.filter(article => 
      article.title.includes(oldTitle) || 
      oldTitle.includes(article.title.substring(0, 30))
    );
    
    if (matchingArticles.length === 0) {
      // Try exact match
      const exactMatch = allArticles.find(a => a.title === oldTitle);
      if (!exactMatch) {
        console.log(`⚠️  Not found: "${oldTitle.substring(0, 50)}..."`);
        notFound++;
        continue;
      }
      matchingArticles.push(exactMatch);
    }
    
    for (const article of matchingArticles) {
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
        console.error(`❌ Error updating "${article.title}":`, updateError.message);
        continue;
      }
      
      console.log(`✅ Updated: "${article.title.substring(0, 60)}..."`);
      console.log(`   → "${newTitle}"`);
      console.log(`   Category: ${article.category || 'N/A'}\n`);
      updated++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   - Updated: ${updated}`);
  console.log(`   - Skipped: ${skipped}`);
  console.log(`   - Not Found: ${notFound}`);
  console.log(`   - Total Processed: ${Object.keys(titleImprovements).filter(k => titleImprovements[k] !== null).length}`);
}

improveAllTitles().catch(console.error);
