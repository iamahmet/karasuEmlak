/**
 * Generate Q&A system for Karasu and Kocaali
 * Creates standardized Q&A blocks for AI Overviews optimization
 * Run with: pnpm tsx scripts/generate-qa-system.ts
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

// Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 20 High-Value Questions for Karasu
const karasuQAs = [
  {
    question: 'Karasu\'da satılık ev almak mantıklı mı?',
    answer: 'Evet, Karasu\'da satılık ev almak mantıklıdır. İstanbul\'a yakınlığı, denize yakın konumu, gelişen altyapısı ve turizm potansiyeli nedeniyle hem oturum hem yatırım amaçlı tercih edilebilir. Uzun vadede değer kazanma potansiyeli yüksektir.',
    category: 'karar_verme',
    priority: 'high',
  },
  {
    question: 'Karasu\'da ev fiyatları neden değişken?',
    answer: 'Karasu\'da ev fiyatları konum, denize yakınlık, metrekare, oda sayısı, bina yaşı ve özelliklere göre değişmektedir. Denize yakın konumlar ve merkez mahalleler daha yüksek fiyatlara sahiptir. Ortalama fiyat aralığı 500.000 TL ile 3.000.000 TL arasındadır.',
    category: 'bilgi',
    priority: 'high',
  },
  {
    question: 'Karasu mu Kocaali mi yatırım için daha avantajlı?',
    answer: 'Her iki bölge de kendine özgü avantajlar sunar. Karasu daha gelişmiş altyapı, yüksek turizm potansiyeli ve daha fazla sosyal tesis sunarken, Kocaali daha uygun giriş fiyatları ve sakin bir yaşam sunar. Yatırım tercihi bütçe ve hedeflere göre değişir.',
    category: 'karsilastirma',
    priority: 'high',
  },
  {
    question: 'Karasu\'da ev alırken en çok yapılan hatalar nelerdir?',
    answer: 'Yeterli araştırma yapmamak, tapu durumunu kontrol etmemek, denize mesafeyi yanlış değerlendirmek, kış aylarında bakım maliyetlerini göz ardı etmek ve profesyonel danışmanlık almamak yaygın hatalardır. Dikkatli bir yaklaşım önemlidir.',
    category: 'risk',
    priority: 'high',
  },
  {
    question: 'Denize yakın evler gerçekten değer kazandırır mı?',
    answer: 'Evet, denize yakın evler genellikle daha yüksek değer artışı gösterir. Turizm potansiyeli, yazlık kiralama geliri ve talep yüksekliği nedeniyle uzun vadede değer kazanma potansiyeli yüksektir. Ancak bakım maliyetleri de dikkate alınmalıdır.',
    category: 'yatirim',
    priority: 'high',
  },
  {
    question: 'Karasu\'da hangi mahalleler yatırım için uygundur?',
    answer: 'Denize yakın mahalleler (Sahil, Yalı Mahallesi) ve merkez konumlar yatırım potansiyeli açısından öne çıkar. Yeni konut projelerinin olduğu bölgeler de uzun vadeli yatırım için uygundur. Her mahallenin kendine özgü avantajları vardır.',
    category: 'yatirim',
    priority: 'medium',
  },
  {
    question: 'Karasu\'da ev alırken tapu süreci nasıl işler?',
    answer: 'Tapu süreci genellikle 1-2 hafta sürer. Satıcı ve alıcı noterde buluşur, tapu devri yapılır. Gerekli belgeler: kimlik, vergi levhası, tapu, ruhsat. Profesyonel emlak danışmanı tüm süreci yönetir ve güvenli bir işlem sağlar.',
    category: 'bilgi',
    priority: 'medium',
  },
  {
    question: 'Karasu\'da yazlık mı sürekli oturumluk ev mi tercih edilmeli?',
    answer: 'Tercih, yaşam tarzı ve bütçeye göre değişir. Yazlık evler yatırım ve tatil amaçlı uygundur. Sürekli oturum için merkeze yakın, altyapısı gelişmiş mahalleler tercih edilmelidir. Her iki seçenek de Karasu\'da mevcuttur.',
    category: 'karar_verme',
    priority: 'medium',
  },
  {
    question: 'Karasu\'da ev fiyatları gelecekte artacak mı?',
    answer: 'İstanbul\'a yakınlık, turizm potansiyeli, altyapı yatırımları ve talep artışı uzun vadede fiyat artışı sağlayabilir. Ancak piyasa koşulları değişkendir. Güncel analiz için profesyonel danışmanlık alınması önerilir.',
    category: 'yatirim',
    priority: 'medium',
  },
  {
    question: 'Karasu\'da ev alırken nelere dikkat edilmeli?',
    answer: 'Konum, fiyat, bina yaşı, yapı durumu, tapu durumu, denize yakınlık, ulaşım imkanları, sosyal altyapı ve gelecekteki projeler dikkate alınmalıdır. Profesyonel emlak danışmanı ile çalışmak önemlidir.',
    category: 'risk',
    priority: 'high',
  },
  {
    question: 'Karasu\'da kredi ile ev alınabilir mi?',
    answer: 'Evet, Karasu\'da kredi ile ev alınabilir. Banka kredisi ve peşinat seçenekleri mevcuttur. Genellikle ev değerinin %70-80\'i kadar kredi kullanılabilir. Kredi başvuru süreci ve onay koşulları için emlak danışmanınızla görüşebilirsiniz.',
    category: 'bilgi',
    priority: 'medium',
  },
  {
    question: 'Karasu\'da hangi ev türleri daha popüler?',
    answer: 'Müstakil evler, daireler, villalar ve yazlık evler popülerdir. Denize yakın konumlarda yazlık evler ve villalar, merkez bölgelerde daireler ve müstakil evler tercih edilir. Her tür için geniş bir seçenek yelpazesi mevcuttur.',
    category: 'bilgi',
    priority: 'low',
  },
  {
    question: 'Karasu\'da ev alırken emlak danışmanı gerekli mi?',
    answer: 'Evet, profesyonel emlak danışmanı ile çalışmak önemlidir. Piyasa bilgisi, fiyat analizi, tapu süreci, yasal danışmanlık ve güvenli işlem için uzman desteği gereklidir. Tüm süreçte yanınızda olur.',
    category: 'karar_verme',
    priority: 'medium',
  },
  {
    question: 'Karasu\'da ev alırken vergi yükümlülükleri nelerdir?',
    answer: 'Emlak alımında emlak alım vergisi, tapu harcı ve noter ücretleri ödenir. Vergi oranları değişkendir. Güncel vergi bilgileri için mali müşavir veya emlak danışmanınızla görüşmeniz önerilir.',
    category: 'bilgi',
    priority: 'low',
  },
  {
    question: 'Karasu\'da ev alırken deprem riski var mı?',
    answer: 'Türkiye\'nin birçok bölgesi gibi Karasu da deprem riski taşır. Ev alırken yapı durumu, deprem yönetmeliğine uygunluk ve zemin etüdü kontrol edilmelidir. Güvenli yapılar tercih edilmelidir.',
    category: 'risk',
    priority: 'high',
  },
  {
    question: 'Karasu\'da ev alırken kış aylarında ne yapılmalı?',
    answer: 'Yazlık evler kış aylarında bakım gerektirir. Su tesisatının boşaltılması, ısıtma sistemlerinin kontrolü, güvenlik önlemleri ve düzenli bakım önemlidir. Sürekli oturum için merkez bölgeler daha uygundur.',
    category: 'bilgi',
    priority: 'low',
  },
  {
    question: 'Karasu\'da ev alırken komşuluk ilişkileri nasıl?',
    answer: 'Karasu genellikle sakin ve huzurlu bir yaşam sunar. Komşuluk ilişkileri genellikle iyidir. Özellikle merkez mahallelerde sosyal yaşam canlıdır. Mahalle seçerken bu faktörü de değerlendirmek önemlidir.',
    category: 'bilgi',
    priority: 'low',
  },
  {
    question: 'Karasu\'da ev alırken ulaşım imkanları yeterli mi?',
    answer: 'Evet, Karasu\'da ulaşım imkanları gelişmiştir. İstanbul\'a yakınlık, otoyol erişimi, toplu taşıma araçları ve merkez konum avantajları vardır. Özellikle merkez mahallelerde ulaşım kolaylığı yüksektir.',
    category: 'bilgi',
    priority: 'medium',
  },
  {
    question: 'Karasu\'da ev alırken okul ve sağlık tesisleri yeterli mi?',
    answer: 'Karasu\'da okul ve sağlık tesisleri mevcuttur. Merkez bölgelerde daha fazla seçenek bulunur. Özellikle sürekli oturum için bu tesislere yakınlık önemlidir. Güncel bilgi için emlak danışmanınızla görüşebilirsiniz.',
    category: 'bilgi',
    priority: 'low',
  },
  {
    question: 'Karasu\'da ev alırken yatırım getirisi ne kadar?',
    answer: 'Yatırım getirisi konum, ev tipi ve piyasa koşullarına göre değişir. Denize yakın konumlar yazlık kiralama geliri sağlar. Uzun vadede değer artışı beklentisi vardır. Detaylı analiz için profesyonel danışmanlık alınması önerilir.',
    category: 'yatirim',
    priority: 'medium',
  },
];

// 20 High-Value Questions for Kocaali
const kocaaliQAs = [
  {
    question: 'Kocaali\'de satılık ev almak mantıklı mı?',
    answer: 'Evet, Kocaali\'de satılık ev almak mantıklıdır. Daha uygun fiyatlı seçenekler, sakin yaşam, doğal güzellikler ve yatırım potansiyeli sunar. Karasu\'ya göre daha uygun giriş fiyatları ile yatırım yapılabilir.',
    category: 'karar_verme',
    priority: 'high',
  },
  {
    question: 'Kocaali\'de ev fiyatları neden Karasu\'dan daha uygun?',
    answer: 'Kocaali, Karasu\'ya göre daha az gelişmiş altyapı ve daha düşük turizm potansiyeline sahiptir. Bu nedenle fiyatlar genellikle daha uygun seviyededir. Ortalama fiyat aralığı 400.000 TL ile 2.500.000 TL arasındadır.',
    category: 'bilgi',
    priority: 'high',
  },
  {
    question: 'Kocaali mi Karasu mu yatırım için daha avantajlı?',
    answer: 'Her iki bölge de kendine özgü avantajlar sunar. Kocaali daha uygun giriş fiyatları ve sakin yaşam sunarken, Karasu daha gelişmiş altyapı ve yüksek turizm potansiyeline sahiptir. Yatırım tercihi bütçe ve hedeflere göre değişir.',
    category: 'karsilastirma',
    priority: 'high',
  },
  {
    question: 'Kocaali\'de ev alırken nelere dikkat edilmeli?',
    answer: 'Konum, fiyat, bina yaşı, yapı durumu, tapu durumu, denize yakınlık, ulaşım imkanları ve sosyal altyapı dikkate alınmalıdır. Özellikle gelişmekte olan bölgelerde gelecek projeleri de değerlendirmek önemlidir.',
    category: 'risk',
    priority: 'high',
  },
  {
    question: 'Kocaali\'de hangi mahalleler öne çıkıyor?',
    answer: 'Merkez mahalleler ve sahile yakın bölgeler öne çıkmaktadır. Denize erişimi olan mahalleler yazlık arayanlar için tercih edilirken, merkez bölgeler kalıcı yaşam için daha uygundur. Her mahallenin kendine özgü avantajları vardır.',
    category: 'bilgi',
    priority: 'medium',
  },
  {
    question: 'Kocaali\'de yazlık mı sürekli yaşam mı tercih ediliyor?',
    answer: 'Kocaali\'de hem yazlık hem de sürekli yaşam tercihleri görülmektedir. Yaz aylarında nüfus artışı yaşanırken, son yıllarda kalıcı yaşam tercih edenlerin sayısı da artmaktadır. Her iki seçenek için uygun seçenekler mevcuttur.',
    category: 'karar_verme',
    priority: 'medium',
  },
  {
    question: 'Kocaali\'de ev alırken yatırım potansiyeli var mı?',
    answer: 'Evet, Kocaali yatırım potansiyeli taşır. Özellikle denize yakın bölgeler ve gelişmekte olan mahalleler uzun vadeli yatırımcılar için ilgi çekici olabilir. Daha uygun giriş fiyatları ile yatırım yapılabilir.',
    category: 'yatirim',
    priority: 'high',
  },
  {
    question: 'Kocaali\'de ev fiyatları gelecekte artacak mı?',
    answer: 'Gelişmekte olan bölge olduğu için uzun vadede fiyat artışı beklentisi vardır. Özellikle altyapı yatırımları ve yeni projeler bölgenin değerini artırabilir. Ancak piyasa koşulları değişkendir.',
    category: 'yatirim',
    priority: 'medium',
  },
  {
    question: 'Kocaali\'de ev alırken ulaşım kolay mı?',
    answer: 'Kocaali\'de ulaşım imkanları mevcuttur. Merkeze yaklaşık 1-2 km mesafede toplu taşıma araçlarına erişim kolaydır. Özel araç ile İstanbul\'a ulaşım mümkündür. Gelişen ulaşım ağı avantajı vardır.',
    category: 'bilgi',
    priority: 'medium',
  },
  {
    question: 'Kocaali\'de ev alırken sosyal yaşam nasıl?',
    answer: 'Kocaali sakin ve huzurlu bir sosyal yaşam sunar. Temel ihtiyaçlar karşılanabilir, sosyal tesisler artmaktadır. Yaz aylarında daha canlı bir ortam vardır. Merkez bölgelerde daha fazla seçenek bulunur.',
    category: 'bilgi',
    priority: 'low',
  },
  {
    question: 'Kocaali\'de hangi ev türleri bulunuyor?',
    answer: 'Kocaali\'de müstakil evler, daireler, villalar ve yazlık evler bulunmaktadır. Denize yakın konumlarda yazlık evler, merkez bölgelerde daireler ve müstakil evler tercih edilir. Geniş bir seçenek yelpazesi mevcuttur.',
    category: 'bilgi',
    priority: 'low',
  },
  {
    question: 'Kocaali\'de ev alırken kredi kullanılabilir mi?',
    answer: 'Evet, Kocaali\'de kredi ile ev alınabilir. Banka kredisi ve peşinat seçenekleri mevcuttur. Genellikle ev değerinin %70-80\'i kadar kredi kullanılabilir. Kredi başvuru süreci için emlak danışmanınızla görüşebilirsiniz.',
    category: 'bilgi',
    priority: 'medium',
  },
  {
    question: 'Kocaali\'de ev alırken tapu süreci nasıl?',
    answer: 'Tapu süreci genellikle 1-2 hafta sürer. Satıcı ve alıcı noterde buluşur, tapu devri yapılır. Gerekli belgeler: kimlik, vergi levhası, tapu, ruhsat. Profesyonel emlak danışmanı tüm süreci yönetir.',
    category: 'bilgi',
    priority: 'low',
  },
  {
    question: 'Kocaali\'de ev alırken deprem riski var mı?',
    answer: 'Türkiye\'nin birçok bölgesi gibi Kocaali de deprem riski taşır. Ev alırken yapı durumu, deprem yönetmeliğine uygunluk ve zemin etüdü kontrol edilmelidir. Güvenli yapılar tercih edilmelidir.',
    category: 'risk',
    priority: 'high',
  },
  {
    question: 'Kocaali\'de ev alırken yatırım getirisi ne kadar?',
    answer: 'Yatırım getirisi konum, ev tipi ve piyasa koşullarına göre değişir. Denize yakın konumlar yazlık kiralama geliri sağlar. Uzun vadede değer artışı beklentisi vardır. Detaylı analiz için profesyonel danışmanlık alınması önerilir.',
    category: 'yatirim',
    priority: 'medium',
  },
  {
    question: 'Kocaali\'de ev alırken komşuluk ilişkileri nasıl?',
    answer: 'Kocaali genellikle sakin ve huzurlu bir yaşam sunar. Komşuluk ilişkileri genellikle iyidir. Özellikle merkez mahallelerde sosyal yaşam canlıdır. Mahalle seçerken bu faktörü de değerlendirmek önemlidir.',
    category: 'bilgi',
    priority: 'low',
  },
  {
    question: 'Kocaali\'de ev alırken okul ve sağlık tesisleri var mı?',
    answer: 'Kocaali\'de okul ve sağlık tesisleri mevcuttur. Merkez bölgelerde daha fazla seçenek bulunur. Özellikle sürekli oturum için bu tesislere yakınlık önemlidir. Güncel bilgi için emlak danışmanınızla görüşebilirsiniz.',
    category: 'bilgi',
    priority: 'low',
  },
  {
    question: 'Kocaali\'de ev alırken yeni projeler emlak piyasasını etkiliyor mu?',
    answer: 'Evet, Kocaali\'deki yeni konut ve altyapı projeleri bölgenin emlak piyasasını olumlu yönde etkileyebilir. Özellikle sahil düzenlemeleri ve ulaşım iyileştirmeleri çevresindeki konutlara olan ilgiyi artırabilir.',
    category: 'yatirim',
    priority: 'medium',
  },
  {
    question: 'Kocaali\'de ev alırken kış aylarında ne yapılmalı?',
    answer: 'Yazlık evler kış aylarında bakım gerektirir. Su tesisatının boşaltılması, ısıtma sistemlerinin kontrolü, güvenlik önlemleri ve düzenli bakım önemlidir. Sürekli oturum için merkez bölgeler daha uygundur.',
    category: 'bilgi',
    priority: 'low',
  },
  {
    question: 'Kocaali\'de ev alırken emlak danışmanı gerekli mi?',
    answer: 'Evet, profesyonel emlak danışmanı ile çalışmak önemlidir. Piyasa bilgisi, fiyat analizi, tapu süreci, yasal danışmanlık ve güvenli işlem için uzman desteği gereklidir. Tüm süreçte yanınızda olur.',
    category: 'karar_verme',
    priority: 'medium',
  },
];

interface QAEntry {
  question: string;
  answer: string;
  category: 'bilgi' | 'karsilastirma' | 'karar_verme' | 'risk' | 'yatirim';
  priority: 'high' | 'medium' | 'low';
  region: 'karasu' | 'kocaali';
}

async function generateQASystem() {
  console.log('🚀 Generating Q&A system for Karasu and Kocaali...\n');

  // Combine all QAs
  const allQAs: QAEntry[] = [
    ...karasuQAs.map(qa => ({ ...qa, region: 'karasu' as const })),
    ...kocaaliQAs.map(qa => ({ ...qa, region: 'kocaali' as const })),
  ];

  // Check if qa_entries table exists by trying to query it
  const { data: tableCheck, error: tableError } = await supabase
    .from('qa_entries')
    .select('id')
    .limit(1);

  // If error is about table not existing, show message
  if (tableError && tableError.code === '42P01') {
    console.log('⚠️  qa_entries table does not exist. Please create it first with the following schema:');
    console.log(`
      CREATE TABLE qa_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT NOT NULL,
        region TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    return;
  }

  // If other error, log it but continue (might be RLS issue)
  if (tableError && tableError.code !== '42P01') {
    console.log('⚠️  Warning: Could not check qa_entries table:', tableError.message);
    console.log('   Continuing anyway...\n');
  }

  let created = 0;
  let updated = 0;

  for (const qa of allQAs) {
    try {
      // Check if QA exists
      const { data: existing } = await supabase
        .from('qa_entries')
        .select('id')
        .eq('question', qa.question)
        .eq('region', qa.region)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('qa_entries')
          .update({
            answer: qa.answer,
            category: qa.category,
            priority: qa.priority,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) {
          console.error(`❌ Error updating QA:`, error.message);
          continue;
        }

        updated++;
        console.log(`✅ Updated: ${qa.question.substring(0, 50)}...`);
      } else {
        // Create new
        const { error } = await supabase
          .from('qa_entries')
          .insert({
            question: qa.question,
            answer: qa.answer,
            category: qa.category,
            priority: qa.priority,
            region: qa.region,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error(`❌ Error creating QA:`, error.message);
          continue;
        }

        created++;
        console.log(`✅ Created: ${qa.question.substring(0, 50)}...`);
      }
    } catch (error: any) {
      console.error(`❌ Error processing QA:`, error.message);
    }
  }

  console.log(`\n✨ Q&A system generation completed!`);
  console.log(`📊 Created: ${created}, Updated: ${updated}, Total: ${allQAs.length}`);
  console.log(`\n📝 Karasu QAs: ${karasuQAs.length}`);
  console.log(`📝 Kocaali QAs: ${kocaaliQAs.length}`);
}

generateQASystem().catch(console.error);
