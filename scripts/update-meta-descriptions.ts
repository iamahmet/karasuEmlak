/**
 * Update meta descriptions for blog articles to match new professional titles
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

// Meta description mappings (SEO-optimized, 150-160 characters)
const metaDescriptions: Record<string, string> = {
  'Karasu\'da Daire Alırken Bilmeniz Gereken Her Şey: 2025 Rehberi': 
    'Karasu\'da satılık daire alırken dikkat edilmesi gerekenler, yasal süreçler, fiyat analizi ve uzman tavsiyeleri. 2025 yılı güncel rehber.',
  
  'Karasu Satılık Daire Fiyatları: Mahalle Mahalle 2025 Analizi': 
    'Karasu\'da satılık daire fiyatları mahalle bazlı detaylı analiz. Merkez, Sahil ve diğer mahallelerdeki güncel fiyatlar ve yatırım potansiyeli.',
  
  'Karasu\'da Daire Yatırımı: ROI Hesaplama ve Kazanç Stratejileri': 
    'Karasu\'da daire yatırımı yapmayı düşünenler için ROI hesaplama, kira getirisi analizi ve kazanç stratejileri. Uzman rehber.',
  
  'Karasu\'da Daire Alımında Yasal Rehber: Tapu ve Belgeler': 
    'Karasu\'da satılık daire alırken bilinmesi gereken yasal süreçler, tapu işlemleri ve gerekli belgeler. Detaylı yasal rehber.',
  
  'Karasu\'da Daire Alırken: Denize Yakın mı, Merkez mi?': 
    'Karasu\'da daire alırken denize yakın ve merkez konumların karşılaştırması. Avantajlar, dezavantajlar ve fiyat farkları.',
  
  'Karasu Emlak Piyasası 2025: Daire Fiyatları ve Trendler': 
    'Karasu emlak piyasası 2025 güncel analizi. Satılık daire fiyat trendleri, piyasa durumu ve gelecek öngörüleri.',
  
  'Karasu Sahilinde Daire: Denize Sıfır Fırsatlar ve Fiyatlar': 
    'Karasu sahilinde satılık daire fırsatları. Denize sıfır konumların avantajları, fiyat aralıkları ve yatırım potansiyeli.',
  
  'Karasu Merkez\'de Daire Arayanlar İçin 10 Pratik İpucu': 
    'Karasu merkez\'de satılık daire arayanlar için pratik ipuçları, dikkat edilmesi gerekenler ve avantajlar. Uzman tavsiyeleri.',
  
  'Karasu\'da Kredi ile Daire Alımı: Başvuru ve Onay Süreci': 
    'Karasu\'da kredi ile satılık daire alım süreci, başvuru adımları, gerekli belgeler ve onay süreci hakkında detaylı bilgi.',
  
  'Karasu\'da Daire Alırken: Eşyalı mı, Eşyasız mı?': 
    'Karasu\'da satılık daire alırken eşyalı ve eşyasız seçeneklerin karşılaştırması. Avantajları ve hangi durumda tercih edilmeli.',
};

async function updateMetaDescriptions() {
  console.log('📝 Updating meta descriptions for blog articles...\n');
  
  let updated = 0;
  let skipped = 0;
  
  for (const [title, metaDescription] of Object.entries(metaDescriptions)) {
    // Find article by title
    const { data: articles, error: findError } = await supabase
      .from('articles')
      .select('id, title, meta_description')
      .ilike('title', `%${title}%`)
      .limit(1);
    
    if (findError) {
      console.error(`❌ Error finding article "${title}":`, findError.message);
      continue;
    }
    
    if (!articles || articles.length === 0) {
      console.log(`⚠️  Article not found: "${title}"`);
      skipped++;
      continue;
    }
    
    const article = articles[0];
    
    // Check if already updated
    if (article.meta_description === metaDescription) {
      console.log(`⏭️  Already updated: "${title}"`);
      skipped++;
      continue;
    }
    
    // Update meta description
    const { error: updateError } = await supabase
      .from('articles')
      .update({
        meta_description: metaDescription,
        updated_at: new Date().toISOString(),
      })
      .eq('id', article.id);
    
    if (updateError) {
      console.error(`❌ Error updating "${title}":`, updateError.message);
      continue;
    }
    
    console.log(`✅ Updated meta description for: "${title}"`);
    console.log(`   "${metaDescription}"\n`);
    updated++;
  }
  
  console.log('\n📊 Summary:');
  console.log(`   - Updated: ${updated}`);
  console.log(`   - Skipped: ${skipped}`);
  console.log(`   - Total: ${Object.keys(metaDescriptions).length}`);
}

updateMetaDescriptions().catch(console.error);
