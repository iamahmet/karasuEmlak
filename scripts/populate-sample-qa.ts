/**
 * Populate Sample Q&A Entries
 * 
 * Creates high-quality sample Q&As for testing and initial content
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// High-quality sample Q&As
const sampleQAs = [
  // Karasu Pillar Page Q&As
  {
    question: 'Karasu\'da satılık ev fiyatları ne durumda?',
    answer: 'Karasu\'da satılık ev fiyatları konum, metrekare ve özelliklere göre değişmektedir. Ortalama fiyat aralığı 500.000 TL ile 3.000.000 TL arasındadır. Denize yakın konumlar ve merkez mahalleler genellikle daha yüksek fiyatlara sahiptir. Müstakil evler ve villalar daha yüksek fiyat bandında yer alırken, apartman daireleri daha uygun seçenekler sunar.',
    location_scope: 'karasu',
    page_type: 'pillar',
    related_entity: 'karasu-satilik-ev',
    status: 'published',
    generated_by_ai: false,
    priority: 'high',
    category: 'fiyat',
  },
  {
    question: 'Karasu\'da hangi mahalleler satılık ev için öne çıkıyor?',
    answer: 'Karasu\'da Merkez, Sahil, Yalı Mahallesi ve İnköy satılık ev arayanlar için öne çıkan mahallelerdir. Merkez mahalleler ulaşım ve altyapı avantajları sunarken, denize yakın mahalleler yazlık kullanım ve yatırım potansiyeli açısından tercih edilmektedir. Her mahallenin kendine özgü karakteristikleri ve avantajları vardır.',
    location_scope: 'karasu',
    page_type: 'pillar',
    related_entity: 'karasu-satilik-ev',
    status: 'published',
    generated_by_ai: false,
    priority: 'high',
    category: 'mahalle',
  },
  {
    question: 'Karasu\'da yatırım amaçlı ev almak mantıklı mı?',
    answer: 'Karasu\'da yatırım amaçlı ev almak, turizm potansiyeli ve İstanbul\'a yakınlık nedeniyle mantıklı bir seçenektir. Denize yakın konumlar yazlık kiralama geliri sağlayabilir. Ortalama yıllık kiralama getirisi %4-6 arasında değişebilir. Uzun vadeli değer artışı beklentisi de yatırımcılar için caziptir.',
    location_scope: 'karasu',
    page_type: 'pillar',
    related_entity: 'karasu-satilik-ev',
    status: 'published',
    generated_by_ai: false,
    priority: 'high',
    category: 'yatirim',
  },
  
  // Kocaali Pillar Page Q&As
  {
    question: 'Kocaali\'de satılık ev fiyatları Karasu\'ya göre nasıl?',
    answer: 'Kocaali\'de satılık ev fiyatları genellikle Karasu\'ya göre daha uygun seviyededir. Ortalama fiyat aralığı 400.000 TL ile 2.500.000 TL arasındadır. Kocaali, daha uygun giriş fiyatları ve sakin yaşam sunarken, Karasu daha gelişmiş altyapı ve yüksek turizm potansiyeline sahiptir. Her iki bölge de kendine özgü avantajlar sunar.',
    location_scope: 'kocaali',
    page_type: 'pillar',
    related_entity: 'kocaali-satilik-ev',
    status: 'published',
    generated_by_ai: false,
    priority: 'high',
    category: 'fiyat',
  },
  {
    question: 'Kocaali mi Karasu mu satılık ev için daha uygun?',
    answer: 'Her iki bölge de kendine özgü avantajlar sunar. Kocaali daha uygun giriş fiyatları ve sakin yaşam sunarken, Karasu daha gelişmiş altyapı, yüksek turizm potansiyeli ve daha fazla sosyal tesislere sahiptir. Tercih bütçe, yaşam tarzı ve yatırım hedeflerine göre değişir. Her iki bölgeyi karşılaştırmak için detaylı rehberlerimizi inceleyebilirsiniz.',
    location_scope: 'global',
    page_type: 'comparison',
    related_entity: 'karasu-vs-kocaali-satilik-ev',
    status: 'published',
    generated_by_ai: false,
    priority: 'high',
    category: 'karsilastirma',
  },
  
  // Cornerstone Page Q&As
  {
    question: 'Karasu merkezde satılık ev almanın avantajları nelerdir?',
    answer: 'Karasu merkezde satılık ev almanın başlıca avantajları ulaşım kolaylığı, gelişmiş altyapı, alışveriş ve hizmetlere yakınlık, okul ve sağlık tesislerine erişimdir. Merkez konum günlük yaşam için pratiklik sunar ve yatırım açısından da değerlidir. Merkez mahallelerde hem daire hem de müstakil ev seçenekleri bulunmaktadır.',
    location_scope: 'karasu',
    page_type: 'cornerstone',
    related_entity: 'karasu-merkez-satilik-ev',
    status: 'published',
    generated_by_ai: false,
    priority: 'medium',
    category: 'avantaj',
  },
  {
    question: 'Karasu\'da denize yakın satılık evler yatırım için uygun mu?',
    answer: 'Karasu\'da denize yakın satılık evler yatırım açısından uygundur. Yazlık kiralama potansiyeli, turizm geliri ve uzun vadeli değer artışı yatırımcılar için caziptir. Özellikle yaz aylarında yüksek kiralama geliri sağlanabilir. Denize yakın konumlar hem yaşam hem yatırım amaçlı tercih edilebilir.',
    location_scope: 'karasu',
    page_type: 'cornerstone',
    related_entity: 'karasu-denize-yakin-satilik-ev',
    status: 'published',
    generated_by_ai: false,
    priority: 'medium',
    category: 'yatirim',
  },
  
  // Neighborhood Page Q&As
  {
    question: 'Karasu Merkez Mahallesi\'nde satılık ev seçenekleri nelerdir?',
    answer: 'Karasu Merkez Mahallesi\'nde hem apartman daireleri hem de müstakil ev seçenekleri bulunmaktadır. Merkez konumun avantajları nedeniyle fiyatlar biraz daha yüksek olabilir, ancak ulaşım kolaylığı ve hizmetlere erişim bu farkı dengeler. Merkez mahallelerde geniş bir fiyat yelpazesi mevcuttur.',
    location_scope: 'karasu',
    page_type: 'neighborhood',
    related_entity: 'merkez',
    status: 'published',
    generated_by_ai: false,
    priority: 'medium',
    category: 'mahalle',
  },
  
  // Comparison Page Q&As
  {
    question: 'Karasu ve Kocaali arasında satılık ev seçerken nelere dikkat edilmeli?',
    answer: 'Karasu ve Kocaali arasında satılık ev seçerken bütçe, yaşam tarzı tercihleri, yatırım hedefleri ve konum öncelikleri dikkate alınmalıdır. Karasu daha gelişmiş altyapı ve yüksek turizm potansiyeli sunarken, Kocaali daha uygun fiyatlar ve sakin yaşam sunar. Her iki bölgenin de kendine özgü avantajları vardır.',
    location_scope: 'global',
    page_type: 'comparison',
    related_entity: 'karasu-vs-kocaali-satilik-ev',
    status: 'published',
    generated_by_ai: false,
    priority: 'high',
    category: 'karsilastirma',
  },
];

async function populateSampleQA() {
  console.log('🚀 Populating sample Q&As...\n');

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const qa of sampleQAs) {
    try {
      // Check if similar Q&A already exists
      const { data: existing } = await supabase
        .from('ai_questions')
        .select('id')
        .eq('question', qa.question)
        .maybeSingle();

      if (existing) {
        skipped++;
        console.log(`⏭️  Skipped (already exists): "${qa.question.substring(0, 50)}..."`);
        continue;
      }

      const { error } = await supabase
        .from('ai_questions')
        .insert({
          ...qa,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          published_at: qa.status === 'published' ? new Date().toISOString() : null,
        });

      if (error) {
        errors++;
        console.error(`❌ Error creating Q&A:`, error.message);
        continue;
      }

      created++;
      console.log(`✅ Created: "${qa.question.substring(0, 50)}..."`);
    } catch (error: any) {
      errors++;
      console.error(`❌ Error:`, error.message);
    }
  }

  console.log(`\n\n✨ Sample Q&A population completed!`);
  console.log(`📊 Statistics:`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log(`\n💡 Tip: Review Q&As in admin panel at /admin/ai-qa`);
}

// CLI usage
if (require.main === module) {
  populateSampleQA().catch(console.error);
}

export { populateSampleQA };
