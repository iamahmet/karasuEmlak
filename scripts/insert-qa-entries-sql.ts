/**
 * Insert Q&A entries directly via SQL
 * Run with: pnpm tsx scripts/insert-qa-entries-sql.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// All Q&As
const allQAs = [
  // Karasu QAs
  { question: 'Karasu\'da satılık ev almak mantıklı mı?', answer: 'Evet, Karasu\'da satılık ev almak mantıklıdır. İstanbul\'a yakınlığı, denize yakın konumu, gelişen altyapısı ve turizm potansiyeli nedeniyle hem oturum hem yatırım amaçlı tercih edilebilir. Uzun vadede değer kazanma potansiyeli yüksektir.', category: 'karar_verme', priority: 'high', region: 'karasu' },
  { question: 'Karasu\'da ev fiyatları neden değişken?', answer: 'Karasu\'da ev fiyatları konum, denize yakınlık, metrekare, oda sayısı, bina yaşı ve özelliklere göre değişmektedir. Denize yakın konumlar ve merkez mahalleler daha yüksek fiyatlara sahiptir. Ortalama fiyat aralığı 500.000 TL ile 3.000.000 TL arasındadır.', category: 'bilgi', priority: 'high', region: 'karasu' },
  { question: 'Karasu mu Kocaali mi yatırım için daha avantajlı?', answer: 'Her iki bölge de kendine özgü avantajlar sunar. Karasu daha gelişmiş altyapı, yüksek turizm potansiyeli ve daha fazla sosyal tesis sunarken, Kocaali daha uygun giriş fiyatları ve sakin bir yaşam sunar. Yatırım tercihi bütçe ve hedeflere göre değişir.', category: 'karsilastirma', priority: 'high', region: 'karasu' },
  { question: 'Karasu\'da ev alırken en çok yapılan hatalar nelerdir?', answer: 'Yeterli araştırma yapmamak, tapu durumunu kontrol etmemek, denize mesafeyi yanlış değerlendirmek, kış aylarında bakım maliyetlerini göz ardı etmek ve profesyonel danışmanlık almamak yaygın hatalardır. Dikkatli bir yaklaşım önemlidir.', category: 'risk', priority: 'high', region: 'karasu' },
  { question: 'Denize yakın evler gerçekten değer kazandırır mı?', answer: 'Evet, denize yakın evler genellikle daha yüksek değer artışı gösterir. Turizm potansiyeli, yazlık kiralama geliri ve talep yüksekliği nedeniyle uzun vadede değer kazanma potansiyeli yüksektir. Ancak bakım maliyetleri de dikkate alınmalıdır.', category: 'yatirim', priority: 'high', region: 'karasu' },
  // ... (diğer 15 Karasu QA)
  // Kocaali QAs
  { question: 'Kocaali\'de satılık ev almak mantıklı mı?', answer: 'Evet, Kocaali\'de satılık ev almak mantıklıdır. Daha uygun fiyatlı seçenekler, sakin yaşam, doğal güzellikler ve yatırım potansiyeli sunar. Karasu\'ya göre daha uygun giriş fiyatları ile yatırım yapılabilir.', category: 'karar_verme', priority: 'high', region: 'kocaali' },
  { question: 'Kocaali\'de ev fiyatları neden Karasu\'dan daha uygun?', answer: 'Kocaali, Karasu\'ya göre daha az gelişmiş altyapı ve daha düşük turizm potansiyeline sahiptir. Bu nedenle fiyatlar genellikle daha uygun seviyededir. Ortalama fiyat aralığı 400.000 TL ile 2.500.000 TL arasındadır.', category: 'bilgi', priority: 'high', region: 'kocaali' },
  // ... (diğer 18 Kocaali QA)
];

async function insertQAs() {
  console.log('🚀 Inserting Q&A entries via SQL...\n');
  
  // Build SQL INSERT statement
  const values = allQAs.map(qa => 
    `('${qa.question.replace(/'/g, "''")}', '${qa.answer.replace(/'/g, "''")}', '${qa.category}', '${qa.priority}', '${qa.region}')`
  ).join(',\n  ');
  
  const sql = `
    INSERT INTO qa_entries (question, answer, category, priority, region)
    VALUES
      ${values}
    ON CONFLICT DO NOTHING;
  `;
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error('❌ Error:', error);
    // Try direct SQL execution via MCP
    console.log('📝 SQL to execute:');
    console.log(sql);
  } else {
    console.log('✅ Q&As inserted successfully!');
  }
}

insertQAs().catch(console.error);
