#!/usr/bin/env tsx
/**
 * Add 10 Professional Q&A Entries to Database
 * 
 * Adds high-quality, SEO-optimized Q&A entries for Karasu Emlak
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../apps/web/.env.local') });

function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

const professionalQAEntries = [
  {
    question: 'Karasu\'da emlak alım-satım işlemlerinde noter masrafları ne kadar?',
    answer: 'Karasu\'da emlak alım-satım işlemlerinde noter masrafları, satış bedelinin yaklaşık %0,5-1\'i arasında değişmektedir. Bu masraflar tapu devir harcı, belge harcı, damga vergisi ve noter ücretinden oluşur. 2024 yılı itibariyle, ortalama 500.000 TL\'lik bir gayrimenkul için noter masrafları yaklaşık 2.500-5.000 TL civarındadır. Masraflar, satış bedeline ve noter tarafından belirlenen tarifeye göre değişiklik gösterebilir. Detaylı bilgi için noter ofisleri ile iletişime geçmeniz önerilir.',
    category: 'hukuki',
    priority: 8,
    region: 'Karasu',
  },
  {
    question: 'Karasu\'da yazlık ev alırken dikkat edilmesi gerekenler nelerdir?',
    answer: 'Karasu\'da yazlık ev alırken öncelikle tapu durumunu, imar durumunu ve yapı ruhsatını kontrol etmelisiniz. Denize yakınlık, ulaşım kolaylığı, altyapı hizmetleri (su, elektrik, kanalizasyon) ve çevre düzenlemesi önemli faktörlerdir. Ayrıca, yazlık evlerin kış aylarında bakımı ve güvenliği için önlemler alınması gerektiğini unutmayın. Komşuluk ilişkileri ve bölgenin gelişim potansiyeli de değerlendirme kriterleriniz arasında olmalıdır. Profesyonel bir emlak danışmanı ile çalışarak, tüm bu faktörleri değerlendirebilir ve en uygun yazlık evi bulabilirsiniz.',
    category: 'karar_verme',
    priority: 9,
    region: 'Karasu',
  },
  {
    question: 'Karasu\'da kiralık ev ararken hangi belgeler hazırlanmalı?',
    answer: 'Karasu\'da kiralık ev ararken hazırlamanız gereken belgeler şunlardır: kimlik fotokopisi, gelir belgesi (maaş bordrosu, SGK dökümü veya vergi levhası), referans mektubu (varsa), kira ödeme gücünüzü gösteren banka ekstreleri ve nüfus kayıt örneği. Bazı ev sahipleri kefil belgesi de isteyebilir. Bu belgeleri hazır bulundurmanız, kiralama sürecini hızlandırır ve ev sahibi ile anlaşma şansınızı artırır. Tüm belgelerin güncel ve geçerli olmasına dikkat edin.',
    category: 'kiralama',
    priority: 8,
    region: 'Karasu',
  },
  {
    question: 'Karasu\'da emlak yatırımı yapmak için en uygun bölgeler hangileridir?',
    answer: 'Karasu\'da emlak yatırımı için en uygun bölgeler, denize yakın konumdaki mahalleler, turizm potansiyeli yüksek alanlar ve gelişim projelerinin olduğu bölgelerdir. Özellikle merkez mahalleler, sahil şeridi yakınındaki alanlar ve yeni imar planlarının açıldığı bölgeler yatırım açısından değerlidir. Ulaşım kolaylığı, altyapı yatırımları ve çevre düzenlemeleri de yatırım değerini artıran faktörlerdir. Yatırım yapmadan önce, bölgenin gelecek planlarını, nüfus artış trendlerini ve turizm potansiyelini değerlendirmeniz önerilir.',
    category: 'yatirim',
    priority: 9,
    region: 'Karasu',
  },
  {
    question: 'Karasu\'da emlak alım-satım işlemlerinde KDV muafiyeti var mı?',
    answer: 'Karasu\'da konut niteliğindeki gayrimenkullerin satışında, satış bedeli 5.000.000 TL\'yi aşmadığı sürece KDV muafiyeti bulunmaktadır. Ancak, ticari gayrimenkuller (işyeri, ofis, dükkan vb.) için KDV %20 oranında uygulanır. Ayrıca, ilk kez konut alanlar için belirli şartlarda KDV indirimi de söz konusu olabilir. Detaylı bilgi için mali müşavir veya vergi danışmanı ile görüşmeniz önerilir. Güncel mevzuat değişikliklerini takip etmek de önemlidir.',
    category: 'finansman',
    priority: 7,
    region: 'Karasu',
  },
  {
    question: 'Karasu\'da tapu devir işlemleri ne kadar sürer?',
    answer: 'Karasu\'da tapu devir işlemleri, gerekli belgelerin tamamlanması ve noter onayından sonra genellikle 1-2 hafta içinde tamamlanır. İşlem süresi, tapu müdürlüğünün yoğunluğuna, belgelerin eksiksizliğine ve ödeme işlemlerinin tamamlanma durumuna göre değişiklik gösterebilir. Hızlı işlem için, tüm belgeleri önceden hazırlamanız, eksik belge olmamasına dikkat etmeniz ve ödeme işlemlerini zamanında yapmanız önerilir. Profesyonel bir emlak danışmanı, tüm süreci takip ederek işlemlerin hızlı ilerlemesini sağlayabilir.',
    category: 'hukuki',
    priority: 8,
    region: 'Karasu',
  },
  {
    question: 'Karasu\'da kiralık ev fiyatları hangi faktörlere göre belirlenir?',
    answer: 'Karasu\'da kiralık ev fiyatları, konum (denize yakınlık, merkeze uzaklık), evin büyüklüğü (m², oda sayısı), bina yaşı ve durumu, kat sayısı ve manzara, altyapı hizmetleri (asansör, otopark, güvenlik), çevre düzenlemesi ve ulaşım kolaylığı gibi faktörlere göre belirlenir. Ayrıca, mevsimsel talepler (özellikle yaz aylarında) ve bölgenin turizm potansiyeli de fiyatları etkiler. Güncel piyasa fiyatlarını öğrenmek için profesyonel bir emlak danışmanı ile görüşmeniz önerilir.',
    category: 'kiralama',
    priority: 7,
    region: 'Karasu',
  },
  {
    question: 'Karasu\'da emlak alırken yapı denetim raporu gerekli mi?',
    answer: 'Karasu\'da 2019 yılından sonra yapı ruhsatı alınan binalar için yapı denetim raporu zorunludur. Bu rapor, binanın yapı ruhsatına uygun olarak inşa edildiğini, statik ve betonarme projelerine uygun olduğunu gösterir. Eski binalar için yapı denetim raporu olmayabilir, ancak alım yapmadan önce binanın durumunu kontrol etmek için ekspertiz raporu almanız önerilir. Yapı denetim raporu, emlak alımında güvenli bir yatırım yapmanızı sağlar ve ileride karşılaşabileceğiniz sorunları önler.',
    category: 'risk',
    priority: 9,
    region: 'Karasu',
  },
  {
    question: 'Karasu ile Kocaali arasında emlak fiyat farkı nedir?',
    answer: 'Karasu ve Kocaali arasında emlak fiyat farkları, konum, denize yakınlık, altyapı yatırımları ve turizm potansiyeline göre değişiklik gösterir. Genel olarak, Karasu merkez ve denize yakın bölgelerde fiyatlar daha yüksektir. Kocaali\'de ise daha uygun fiyatlı seçenekler bulunabilir. Ancak, her iki bölgede de konum, evin özellikleri ve piyasa koşulları fiyatları etkiler. Yatırım veya ikamet amacınıza göre, her iki bölgeyi de değerlendirmeniz ve profesyonel bir danışman ile görüşmeniz önerilir.',
    category: 'karsilastirma',
    priority: 8,
    region: 'Karasu',
  },
  {
    question: 'Karasu\'da emlak kredisi için hangi bankalar avantajlı?',
    answer: 'Karasu\'da emlak kredisi için tüm bankalar farklı faiz oranları ve kampanyalar sunmaktadır. Genellikle, büyük bankalar (Ziraat, İş Bankası, Garanti, Akbank) ve yapı kredi bankaları rekabetçi faiz oranları sunar. Kredi başvurusu yapmadan önce, farklı bankaların güncel faiz oranlarını, vade seçeneklerini ve kampanyalarını karşılaştırmanız önerilir. Ayrıca, gelir durumunuz, kredi geçmişiniz ve peşinat oranınız da kredi şartlarını etkiler. Profesyonel bir finans danışmanı ile görüşerek, size en uygun kredi seçeneğini bulabilirsiniz.',
    category: 'finansman',
    priority: 8,
    region: 'Karasu',
  },
  {
    question: 'Karasu\'da emlak alım-satım işlemlerinde ekspertiz raporu alınmalı mı?',
    answer: 'Karasu\'da emlak alım-satım işlemlerinde ekspertiz raporu alınması kesinlikle önerilir. Ekspertiz raporu, gayrimenkulün gerçek değerini, yapısal durumunu, imar durumunu ve olası riskleri ortaya koyar. Bu rapor sayesinde, adil bir fiyat belirleyebilir, gizli kusurları öğrenebilir ve yatırımınızı güvence altına alabilirsiniz. Ekspertiz raporu, tapu işlemlerinden önce alınmalı ve rapor sonuçlarına göre alım-satım kararı verilmelidir. Sertifikalı bir ekspertiz firması ile çalışmanız önerilir.',
    category: 'risk',
    priority: 9,
    region: 'Karasu',
  },
];

async function main() {
  const supabase = createServiceClient();

  console.log('📝 Adding 10 professional Q&A entries to database...\n');

  for (const entry of professionalQAEntries) {
    try {
      const { data, error } = await supabase
        .from('qa_entries')
        .insert(entry)
        .select()
        .single();

      if (error) {
        // Check if it's a duplicate (unique constraint violation)
        if (error.code === '23505' || error.message.includes('duplicate')) {
          console.log(`⚠️  Skipping duplicate: "${entry.question.substring(0, 50)}..."`);
          continue;
        }
        throw error;
      }

      console.log(`✅ Added: "${entry.question.substring(0, 60)}..."`);
    } catch (error: any) {
      console.error(`❌ Error adding entry: ${entry.question.substring(0, 50)}...`);
      console.error(`   Error: ${error.message}`);
    }
  }

  console.log('\n✨ Process completed!');
  
  // Show summary
  const { count } = await supabase
    .from('qa_entries')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Total Q&A entries in database: ${count || 0}`);
}

main().catch(console.error);
