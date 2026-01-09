/**
 * Populate SSS Questions Script
 * Adds comprehensive FAQ questions to qa_entries table
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Comprehensive FAQ questions for Karasu Emlak
const faqQuestions = [
  // Genel Bilgiler
  {
    question: 'Karasu\'da emlak alım-satım işlemleri nasıl yapılır?',
    answer: 'Karasu\'da emlak alım-satım işlemleri için öncelikle bir emlak danışmanı ile görüşmeniz önerilir. Danışmanınız size uygun seçenekleri sunar, görüntüleme randevuları ayarlar ve tüm yasal süreçlerde rehberlik eder. Tapu devir işlemleri, noter masrafları ve diğer yasal süreçler hakkında detaylı bilgi verir.',
    category: 'genel',
    priority: 2,
  },
  {
    question: 'Kiralık ev bulmak ne kadar sürer?',
    answer: 'Kiralık ev bulma süresi genellikle 1-2 hafta arasında değişir. Bölge, bütçe ve özellik tercihlerinize göre bu süre kısalabilir veya uzayabilir. Karasu ve Kocaali bölgesinde aktif ilan sayısı ve talebin yoğunluğu da bu süreyi etkiler.',
    category: 'genel',
    priority: 2,
  },
  {
    question: 'Emlak komisyon oranları nedir?',
    answer: 'Emlak komisyon oranları genellikle satış fiyatının %2-3\'ü arasındadır. Kiralama işlemlerinde ise genellikle bir aylık kira bedeli komisyon olarak alınır. Komisyon oranları emlak danışmanı ve bölgeye göre değişiklik gösterebilir.',
    category: 'genel',
    priority: 2,
  },
  {
    question: 'Karasu\'da ev fiyatları nasıl belirlenir?',
    answer: 'Karasu\'da ev fiyatları konum, metrekare, oda sayısı, bina yaşı, denize yakınlık, altyapı durumu ve piyasa koşullarına göre belirlenir. Profesyonel bir değerleme ile doğru fiyat tespiti yapılabilir.',
    category: 'genel',
    priority: 2,
  },
  {
    question: 'Tapu işlemleri ne kadar sürer?',
    answer: 'Tapu devir işlemleri genellikle 1-2 hafta içinde tamamlanır. Belgelerin eksiksiz olması, noter randevusu ve tapu müdürlüğü işlem süreleri bu süreyi etkiler.',
    category: 'genel',
    priority: 1,
  },
  {
    question: 'Karasu\'da hangi belgeler gereklidir?',
    answer: 'Emlak alım-satım işlemleri için kimlik, tapu, vergi levhası, gelir belgesi ve gerekli durumlarda evlilik cüzdanı gibi belgeler gereklidir. Detaylı liste için emlak danışmanınızla görüşebilirsiniz.',
    category: 'genel',
    priority: 1,
  },
  
  // Satılık Emlak
  {
    question: 'Karasu\'da satılık ev fiyatları ne kadar?',
    answer: 'Karasu\'da satılık ev fiyatları konum, metrekare, oda sayısı ve özelliklere göre değişmektedir. Satılık daireler genellikle 800.000 TL ile 3.000.000 TL arasında, villalar 2.000.000 TL ile 8.000.000 TL arasında değişmektedir.',
    category: 'satilik',
    priority: 2,
  },
  {
    question: 'Karasu\'da yazlık ev alırken dikkat edilmesi gerekenler nelerdir?',
    answer: 'Karasu\'da yazlık ev alırken öncelikle tapu durumunu, imar durumunu ve yapı ruhsatını kontrol etmelisiniz. Denize yakınlık, ulaşım kolaylığı, altyapı hizmetleri ve çevre düzenlemesi önemli faktörlerdir.',
    category: 'satilik',
    priority: 2,
  },
  {
    question: 'Karasu\'da emlak yatırımı yapmak için en uygun bölgeler hangileridir?',
    answer: 'Karasu\'da emlak yatırımı için en uygun bölgeler, denize yakın konumdaki mahalleler, turizm potansiyeli yüksek alanlar ve gelişim projelerinin olduğu bölgelerdir.',
    category: 'satilik',
    priority: 2,
  },
  {
    question: 'Karasu\'da denize sıfır ev fiyatları ne kadar?',
    answer: 'Karasu\'da denize sıfır ev fiyatları genellikle 3.000.000 TL ile 10.000.000 TL arasında değişmektedir. Konum, metrekare ve özelliklere göre bu fiyatlar artabilir.',
    category: 'satilik',
    priority: 2,
  },
  {
    question: 'Karasu\'da yazlık ev fiyatları 2025 yılında ne kadar?',
    answer: 'Karasu\'da yazlık ev fiyatları 2025 yılında ortalama 1.500.000 TL ile 5.000.000 TL arasında değişmektedir. Denize yakınlık ve özelliklere göre fiyatlar değişiklik gösterebilir.',
    category: 'satilik',
    priority: 1,
  },
  
  // Kiralık Emlak
  {
    question: 'Karasu\'da kiralık ev fiyatları ne kadar?',
    answer: 'Karasu\'da kiralık ev fiyatları genellikle 8.000 TL ile 25.000 TL arasında değişmektedir. Yaz aylarında yazlık kiralama fiyatları daha yüksek olabilir.',
    category: 'kiralik',
    priority: 2,
  },
  {
    question: 'Karasu\'da kiralık ev ararken hangi belgeler hazırlanmalı?',
    answer: 'Karasu\'da kiralık ev ararken hazırlamanız gereken belgeler: kimlik fotokopisi, gelir belgesi, referans mektubu, banka ekstreleri ve nüfus kayıt örneği. Bazı ev sahipleri kefil belgesi de isteyebilir.',
    category: 'kiralik',
    priority: 2,
  },
  {
    question: 'Karasu\'da yazlık kiralama fiyatları ne kadar?',
    answer: 'Karasu\'da yazlık kiralama fiyatları sezona göre değişmektedir. Yaz aylarında aylık kira 15.000 TL ile 50.000 TL arasında değişebilir. Denize yakın konumlar daha yüksek fiyatlara sahiptir.',
    category: 'kiralik',
    priority: 1,
  },
  
  // Hukuki Süreçler
  {
    question: 'Karasu\'da emlak alım-satım işlemlerinde noter masrafları ne kadar?',
    answer: 'Karasu\'da emlak alım-satım işlemlerinde noter masrafları, satış bedelinin yaklaşık %0,5-1\'i arasında değişmektedir. Bu masraflar tapu devir harcı, belge harcı, damga vergisi ve noter ücretinden oluşur.',
    category: 'hukuki',
    priority: 2,
  },
  {
    question: 'Tapu devir işlemleri nasıl yapılır?',
    answer: 'Tapu devir işlemleri için önce noterde satış sözleşmesi imzalanır, ardından tapu müdürlüğünde devir işlemi yapılır. Gerekli belgeler ve masraflar hakkında emlak danışmanınızdan bilgi alabilirsiniz.',
    category: 'hukuki',
    priority: 2,
  },
  {
    question: 'Emlak alım-satım sözleşmesi nasıl hazırlanır?',
    answer: 'Emlak alım-satım sözleşmesi noterde hazırlanır ve tarafların kimlikleri, satış bedeli, ödeme şekli, teslim tarihi gibi tüm detaylar sözleşmede yer alır.',
    category: 'hukuki',
    priority: 1,
  },
  
  // Finansman
  {
    question: 'Karasu\'da ev almak için kredi nasıl alınır?',
    answer: 'Karasu\'da ev almak için kredi başvurusu yapmak için önce bir banka ile görüşmeniz gerekir. Gelir belgeniz, kimliğiniz ve gerekli belgelerle başvuru yapabilirsiniz. Kredi onayı genellikle 1-2 hafta içinde sonuçlanır.',
    category: 'finansman',
    priority: 2,
  },
  {
    question: 'Karasu\'da ev almak için peşinat ne kadar?',
    answer: 'Karasu\'da ev almak için peşinat genellikle satış bedelinin %20-30\'u arasında değişmektedir. Kredi çekmek için gerekli peşinat oranı bankaya göre değişiklik gösterebilir.',
    category: 'finansman',
    priority: 2,
  },
  {
    question: 'Karasu\'da emlak alım-satım işlemlerinde KDV muafiyeti var mı?',
    answer: 'Karasu\'da konut niteliğindeki gayrimenkullerin satışında, satış bedeli 5.000.000 TL\'yi aşmadığı sürece KDV muafiyeti bulunmaktadır. Ticari gayrimenkuller için KDV %20 oranında uygulanır.',
    category: 'finansman',
    priority: 1,
  },
  
  // Kiralama İşlemleri
  {
    question: 'Kiralama sözleşmesi nasıl yapılır?',
    answer: 'Kiralama sözleşmesi noterde veya emlak ofisinde yapılabilir. Sözleşmede kira bedeli, ödeme tarihi, süre, depozito gibi tüm detaylar yer alır.',
    category: 'kiralama',
    priority: 2,
  },
  {
    question: 'Kira depozitosu ne kadar olmalı?',
    answer: 'Kira depozitosu genellikle bir aylık kira bedeli kadar olur. Bazı durumlarda 2-3 aylık kira bedeli kadar depozito istenebilir.',
    category: 'kiralama',
    priority: 1,
  },
];

async function populateSSSQuestions() {
  console.log('🚀 Populating SSS Questions...\n');

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const qa of faqQuestions) {
    try {
      // Check if question already exists
      const { data: existing } = await supabase
        .from('qa_entries')
        .select('id, answer')
        .eq('question', qa.question)
        .maybeSingle();

      if (existing) {
        // Update if answer is different or empty
        if (existing.answer !== qa.answer || !existing.answer) {
          const { error: updateError } = await supabase
            .from('qa_entries')
            .update({
              answer: qa.answer,
              category: qa.category,
              priority: qa.priority,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (updateError) {
            console.error(`  ❌ Update error: ${updateError.message}`);
            errors++;
          } else {
            updated++;
            console.log(`  🔄 Updated: ${qa.question.substring(0, 50)}...`);
          }
        } else {
          skipped++;
        }
        continue;
      }

      // Insert new question
      const { error: insertError } = await supabase
        .from('qa_entries')
        .insert({
          question: qa.question,
          answer: qa.answer,
          category: qa.category,
          priority: qa.priority,
          region: 'karasu',
        });

      if (insertError) {
        console.error(`  ❌ Insert error: ${insertError.message}`);
        errors++;
      } else {
        inserted++;
        console.log(`  ✅ Inserted: ${qa.question.substring(0, 50)}...`);
      }
    } catch (error: any) {
      console.error(`  ❌ Exception: ${error.message}`);
      errors++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  ✅ Inserted: ${inserted}`);
  console.log(`  🔄 Updated: ${updated}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ❌ Errors: ${errors}`);
  console.log(`\n✨ Done!\n`);
}

// Run if called directly
if (require.main === module) {
  populateSSSQuestions().catch(console.error);
}

export { populateSSSQuestions };
