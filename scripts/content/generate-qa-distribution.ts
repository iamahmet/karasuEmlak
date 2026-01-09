/**
 * AI Overviews Q&A Distribution Script
 * Creates 40 Q&A sets (20 Karasu, 20 Kocaali) and distributes across pages
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

interface QAEntry {
  question: string;
  answer: string;
  category: 'bilgi' | 'karsilastirma' | 'karar_verme' | 'risk' | 'yatirim';
  region: 'karasu' | 'kocaali';
  priority: 'high' | 'medium' | 'low';
}

const karasuQAs: QAEntry[] = [
  {
    question: 'Karasu\'da satılık ev fiyatları ne kadar?',
    answer: 'Karasu\'da satılık ev fiyatları konum, büyüklük ve özelliklere göre değişmektedir. Merkez bölgede 2+1 daireler genellikle 800.000 TL ile 1.500.000 TL arasında, denize yakın bölgelerde ise 1.200.000 TL ile 2.500.000 TL arasında değişmektedir. Müstakil evler ise 2.000.000 TL\'den başlamaktadır.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'high',
  },
  {
    question: 'Karasu\'da emlak alırken nelere dikkat edilmeli?',
    answer: 'Karasu\'da emlak alırken konum, tapu durumu, yapı ruhsatı, denize mesafe, ulaşım imkanları ve çevresel faktörler önemlidir. Özellikle denize yakın bölgelerde sel riski kontrol edilmeli, tapu ve ruhsat belgeleri incelenmeli, çevredeki altyapı ve hizmetler değerlendirilmelidir.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'high',
  },
  {
    question: 'Karasu\'da hangi mahalleler yatırım için uygun?',
    answer: 'Karasu\'da yatırım potansiyeli yüksek mahalleler arasında Merkez, Sahil, Botağzı ve Yalı Mahallesi bulunmaktadır. Bu bölgeler denize yakınlık, ulaşım kolaylığı ve gelişen altyapı nedeniyle tercih edilmektedir. Ancak yatırım kararı vermeden önce detaylı piyasa araştırması yapılmalıdır.',
    category: 'yatirim',
    region: 'karasu',
    priority: 'high',
  },
  {
    question: 'Karasu\'da kiralık ev bulmak kolay mı?',
    answer: 'Karasu\'da kiralık ev bulmak, özellikle yaz aylarında daha zor olabilir çünkü yazlıkçı talebi artmaktadır. Merkez bölgelerde daha fazla seçenek bulunurken, denize yakın bölgelerde kiralar daha yüksek olabilir. Kış aylarında daha fazla seçenek ve uygun fiyatlar bulunabilir.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'medium',
  },
  {
    question: 'Karasu\'da emlak komisyonu ne kadar?',
    answer: 'Karasu\'da emlak komisyonu genellikle satış fiyatının %2-3\'ü arasında değişmektedir. Komisyon oranı emlak ofisine, işlemin büyüklüğüne ve hizmet kapsamına göre değişebilir. Detaylı bilgi için emlak ofisleri ile iletişime geçilmesi önerilir.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'medium',
  },
  {
    question: 'Karasu merkezde satılık ev var mı?',
    answer: 'Karasu merkezde satılık ev seçenekleri mevcuttur. Merkez bölgesi ulaşım, alışveriş ve hizmetlere yakınlık açısından avantajlıdır. Fiyatlar konum ve özelliklere göre değişmekle birlikte, merkez bölgede genellikle 800.000 TL ile 1.800.000 TL arasında seçenekler bulunmaktadır.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'high',
  },
  {
    question: 'Karasu\'da denize yakın satılık ev fiyatları nasıl?',
    answer: 'Karasu\'da denize yakın satılık ev fiyatları, denize mesafeye ve özelliklere göre değişmektedir. Denize sıfır veya çok yakın evler genellikle 1.500.000 TL\'den başlamakta, lüks özellikli villalar ise 3.000.000 TL ve üzerinde olabilmektedir. Denize 500 metre mesafedeki evler ise 1.200.000 TL ile 2.000.000 TL arasında değişmektedir.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'high',
  },
  {
    question: 'Karasu\'da yatırımlık satılık ev almak mantıklı mı?',
    answer: 'Karasu\'da yatırımlık satılık ev almak, bölgenin turizm potansiyeli, denize yakınlık ve gelişen altyapı göz önüne alındığında değerlendirilebilir. Ancak yatırım kararı vermeden önce piyasa araştırması, kira getirisi analizi ve uzun vadeli planlama yapılmalıdır. Profesyonel danışmanlık alınması önerilir.',
    category: 'yatirim',
    region: 'karasu',
    priority: 'high',
  },
  {
    question: 'Karasu\'da müstakil satılık ev bulmak zor mu?',
    answer: 'Karasu\'da müstakil satılık ev seçenekleri mevcuttur ancak dairelere göre daha az sayıdadır. Müstakil evler genellikle merkez dışındaki mahallelerde ve daha geniş arsalarda bulunmaktadır. Fiyatlar 2.000.000 TL\'den başlamakta, özellik ve konuma göre artmaktadır.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'medium',
  },
  {
    question: 'Karasu\'da hangi bölgeler emlak yatırımı için uygun?',
    answer: 'Karasu\'da emlak yatırımı için değerlendirilebilecek bölgeler arasında denize yakın mahalleler, merkez bölge ve gelişmekte olan yeni yerleşim alanları bulunmaktadır. Yatırım kararı vermeden önce bölgenin altyapı durumu, ulaşım imkanları, turizm potansiyeli ve gelecek planları incelenmelidir.',
    category: 'yatirim',
    region: 'karasu',
    priority: 'high',
  },
  {
    question: 'Karasu\'da emlak alım-satım süreci nasıl işler?',
    answer: 'Karasu\'da emlak alım-satım süreci genellikle şu adımları içerir: emlak seçimi, fiyat görüşmesi, sözleşme imzalanması, kapora ödenmesi, tapu işlemleri, kalan ödemenin yapılması ve tapu devri. Süreçte emlak ofisi, noter ve tapu müdürlüğü ile çalışılır. Tüm belgelerin kontrol edilmesi ve hukuki danışmanlık alınması önemlidir.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'medium',
  },
  {
    question: 'Karasu\'da yazlık ev almak mantıklı mı?',
    answer: 'Karasu\'da yazlık ev almak, yaz aylarında denize yakınlık ve doğal güzellikler açısından değerlendirilebilir. Ancak yazlık evlerin kış aylarında kullanımı sınırlı olabilir ve bakım maliyetleri dikkate alınmalıdır. Yatırım amaçlı alınıyorsa kira getirisi potansiyeli de değerlendirilmelidir.',
    category: 'yatirim',
    region: 'karasu',
    priority: 'medium',
  },
  {
    question: 'Karasu\'da emlak kredisi alınabilir mi?',
    answer: 'Karasu\'da emlak kredisi alınabilir. Bankalar, uygun şartları sağlayan alıcılara konut kredisi verebilmektedir. Kredi başvurusu için gelir belgesi, kimlik belgesi ve tapu bilgileri gerekmektedir. Kredi oranı ve vadesi bankaya ve alıcının durumuna göre değişmektedir.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'low',
  },
  {
    question: 'Karasu\'da hangi mahalleler denize en yakın?',
    answer: 'Karasu\'da denize en yakın mahalleler arasında Sahil Mahallesi, Botağzı Bölgesi, Yalı Mahallesi ve Liman Bölgesi bulunmaktadır. Bu mahalleler denize 100-500 metre mesafede olup, deniz manzarası ve plaj erişimi açısından avantajlıdır.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'high',
  },
  {
    question: 'Karasu\'da emlak vergisi ne kadar?',
    answer: 'Karasu\'da emlak vergisi, emlakın değerine ve belediye tarafından belirlenen oranlara göre hesaplanmaktadır. Vergi oranları emlak tipine (konut, ticari, arsa) göre değişmektedir. Detaylı bilgi için Karasu Belediyesi ile iletişime geçilmesi önerilir.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'low',
  },
  {
    question: 'Karasu\'da satılık villa var mı?',
    answer: 'Karasu\'da satılık villa seçenekleri mevcuttur. Villalar genellikle denize yakın bölgelerde, geniş bahçeli ve lüks özellikli olarak bulunmaktadır. Fiyatlar 3.000.000 TL\'den başlamakta, özellik ve konuma göre 10.000.000 TL ve üzerine çıkabilmektedir.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'medium',
  },
  {
    question: 'Karasu\'da emlak alırken noter gerekli mi?',
    answer: 'Karasu\'da emlak alım-satım işlemlerinde noter zorunluluğu bulunmaktadır. Sözleşme imzalanması, kapora ödenmesi ve tapu devri işlemleri noter huzurunda gerçekleştirilmelidir. Noter işlemleri güvenli ve hukuki bir alım-satım süreci için önemlidir.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'low',
  },
  {
    question: 'Karasu\'da hangi bölgeler daha güvenli?',
    answer: 'Karasu genel olarak güvenli bir ilçedir. Merkez bölge, yerleşik nüfusun yoğun olduğu mahalleler ve denize yakın turistik bölgeler genellikle güvenli kabul edilmektedir. Ancak emlak alırken çevreyi incelemek, komşularla görüşmek ve bölge hakkında bilgi almak önemlidir.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'medium',
  },
  {
    question: 'Karasu\'da emlak alırken tapu kontrolü nasıl yapılır?',
    answer: 'Karasu\'da emlak alırken tapu kontrolü için tapu müdürlüğünden tapu kayıt örneği alınmalı, tapu üzerindeki bilgiler (ada, parsel, yüzölçümü, üzerindeki yapı) kontrol edilmelidir. Tapu üzerinde ipotek, haciz veya şerh olup olmadığı kontrol edilmeli, tapu sahibinin kimliği doğrulanmalıdır.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'low',
  },
  {
    question: 'Karasu\'da satılık arsa bulmak kolay mı?',
    answer: 'Karasu\'da satılık arsa seçenekleri mevcuttur. Arsa fiyatları konum, büyüklük, imar durumu ve denize mesafeye göre değişmektedir. Denize yakın arsalar daha pahalı olurken, merkez dışındaki arsalar daha uygun fiyatlı olabilmektedir. İmar durumu ve yapılaşma izinleri kontrol edilmelidir.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'low',
  },
  {
    question: 'Karasu\'da emlak alırken ekspertiz gerekli mi?',
    answer: 'Karasu\'da emlak alırken ekspertiz yaptırmak zorunlu değildir ancak önerilir. Ekspertiz, emlakın değerini, yapı durumunu, yasal durumunu ve risklerini değerlendirir. Özellikle yüksek değerli emlaklarda ve kredi kullanımında ekspertiz raporu istenebilir.',
    category: 'bilgi',
    region: 'karasu',
    priority: 'low',
  },
];

const kocaaliQAs: QAEntry[] = [
  {
    question: 'Kocaali\'de satılık ev fiyatları ne kadar?',
    answer: 'Kocaali\'de satılık ev fiyatları konum ve özelliklere göre değişmektedir. Merkez bölgede 2+1 daireler genellikle 700.000 TL ile 1.300.000 TL arasında, denize yakın bölgelerde ise 1.000.000 TL ile 2.000.000 TL arasında değişmektedir. Müstakil evler 1.800.000 TL\'den başlamaktadır.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'high',
  },
  {
    question: 'Kocaali\'de emlak alırken nelere dikkat edilmeli?',
    answer: 'Kocaali\'de emlak alırken konum, tapu durumu, yapı ruhsatı, denize mesafe, ulaşım imkanları ve çevresel faktörler önemlidir. Özellikle denize yakın bölgelerde sel riski kontrol edilmeli, tapu ve ruhsat belgeleri incelenmeli, çevredeki altyapı ve hizmetler değerlendirilmelidir.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'high',
  },
  {
    question: 'Kocaali\'de hangi mahalleler yatırım için uygun?',
    answer: 'Kocaali\'de yatırım potansiyeli yüksek mahalleler arasında Merkez, Sahil, Yalı ve Liman Mahallesi bulunmaktadır. Bu bölgeler denize yakınlık, ulaşım kolaylığı ve gelişen altyapı nedeniyle tercih edilmektedir. Ancak yatırım kararı vermeden önce detaylı piyasa araştırması yapılmalıdır.',
    category: 'yatirim',
    region: 'kocaali',
    priority: 'high',
  },
  {
    question: 'Kocaali\'de kiralık ev bulmak kolay mı?',
    answer: 'Kocaali\'de kiralık ev bulmak, özellikle yaz aylarında daha zor olabilir çünkü yazlıkçı talebi artmaktadır. Merkez bölgelerde daha fazla seçenek bulunurken, denize yakın bölgelerde kiralar daha yüksek olabilir. Kış aylarında daha fazla seçenek ve uygun fiyatlar bulunabilir.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'medium',
  },
  {
    question: 'Kocaali\'de emlak komisyonu ne kadar?',
    answer: 'Kocaali\'de emlak komisyonu genellikle satış fiyatının %2-3\'ü arasında değişmektedir. Komisyon oranı emlak ofisine, işlemin büyüklüğüne ve hizmet kapsamına göre değişebilir. Detaylı bilgi için emlak ofisleri ile iletişime geçilmesi önerilir.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'medium',
  },
  {
    question: 'Kocaali merkezde satılık ev var mı?',
    answer: 'Kocaali merkezde satılık ev seçenekleri mevcuttur. Merkez bölgesi ulaşım, alışveriş ve hizmetlere yakınlık açısından avantajlıdır. Fiyatlar konum ve özelliklere göre değişmekle birlikte, merkez bölgede genellikle 700.000 TL ile 1.500.000 TL arasında seçenekler bulunmaktadır.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'high',
  },
  {
    question: 'Kocaali\'de denize yakın satılık ev fiyatları nasıl?',
    answer: 'Kocaali\'de denize yakın satılık ev fiyatları, denize mesafeye ve özelliklere göre değişmektedir. Denize sıfır veya çok yakın evler genellikle 1.200.000 TL\'den başlamakta, lüks özellikli villalar ise 2.500.000 TL ve üzerinde olabilmektedir. Denize 500 metre mesafedeki evler ise 1.000.000 TL ile 1.800.000 TL arasında değişmektedir.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'high',
  },
  {
    question: 'Kocaali\'de yatırımlık satılık ev almak mantıklı mı?',
    answer: 'Kocaali\'de yatırımlık satılık ev almak, bölgenin turizm potansiyeli, denize yakınlık ve gelişen altyapı göz önüne alındığında değerlendirilebilir. Ancak yatırım kararı vermeden önce piyasa araştırması, kira getirisi analizi ve uzun vadeli planlama yapılmalıdır. Profesyonel danışmanlık alınması önerilir.',
    category: 'yatirim',
    region: 'kocaali',
    priority: 'high',
  },
  {
    question: 'Kocaali\'de müstakil satılık ev bulmak zor mu?',
    answer: 'Kocaali\'de müstakil satılık ev seçenekleri mevcuttur ancak dairelere göre daha az sayıdadır. Müstakil evler genellikle merkez dışındaki mahallelerde ve daha geniş arsalarda bulunmaktadır. Fiyatlar 1.800.000 TL\'den başlamakta, özellik ve konuma göre artmaktadır.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'medium',
  },
  {
    question: 'Kocaali\'de hangi bölgeler emlak yatırımı için uygun?',
    answer: 'Kocaali\'de emlak yatırımı için değerlendirilebilecek bölgeler arasında denize yakın mahalleler, merkez bölge ve gelişmekte olan yeni yerleşim alanları bulunmaktadır. Yatırım kararı vermeden önce bölgenin altyapı durumu, ulaşım imkanları, turizm potansiyeli ve gelecek planları incelenmelidir.',
    category: 'yatirim',
    region: 'kocaali',
    priority: 'high',
  },
  {
    question: 'Kocaali\'de emlak alım-satım süreci nasıl işler?',
    answer: 'Kocaali\'de emlak alım-satım süreci genellikle şu adımları içerir: emlak seçimi, fiyat görüşmesi, sözleşme imzalanması, kapora ödenmesi, tapu işlemleri, kalan ödemenin yapılması ve tapu devri. Süreçte emlak ofisi, noter ve tapu müdürlüğü ile çalışılır. Tüm belgelerin kontrol edilmesi ve hukuki danışmanlık alınması önemlidir.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'medium',
  },
  {
    question: 'Kocaali\'de yazlık ev almak mantıklı mı?',
    answer: 'Kocaali\'de yazlık ev almak, yaz aylarında denize yakınlık ve doğal güzellikler açısından değerlendirilebilir. Ancak yazlık evlerin kış aylarında kullanımı sınırlı olabilir ve bakım maliyetleri dikkate alınmalıdır. Yatırım amaçlı alınıyorsa kira getirisi potansiyeli de değerlendirilmelidir.',
    category: 'yatirim',
    region: 'kocaali',
    priority: 'medium',
  },
  {
    question: 'Kocaali\'de emlak kredisi alınabilir mi?',
    answer: 'Kocaali\'de emlak kredisi alınabilir. Bankalar, uygun şartları sağlayan alıcılara konut kredisi verebilmektedir. Kredi başvurusu için gelir belgesi, kimlik belgesi ve tapu bilgileri gerekmektedir. Kredi oranı ve vadesi bankaya ve alıcının durumuna göre değişmektedir.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'low',
  },
  {
    question: 'Kocaali\'de hangi mahalleler denize en yakın?',
    answer: 'Kocaali\'de denize en yakın mahalleler arasında Sahil Mahallesi, Yalı Mahallesi, Liman Bölgesi ve Plaj Bölgesi bulunmaktadır. Bu mahalleler denize 100-500 metre mesafede olup, deniz manzarası ve plaj erişimi açısından avantajlıdır.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'high',
  },
  {
    question: 'Kocaali\'de emlak vergisi ne kadar?',
    answer: 'Kocaali\'de emlak vergisi, emlakın değerine ve belediye tarafından belirlenen oranlara göre hesaplanmaktadır. Vergi oranları emlak tipine (konut, ticari, arsa) göre değişmektedir. Detaylı bilgi için Kocaali Belediyesi ile iletişime geçilmesi önerilir.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'low',
  },
  {
    question: 'Kocaali\'de satılık villa var mı?',
    answer: 'Kocaali\'de satılık villa seçenekleri mevcuttur. Villalar genellikle denize yakın bölgelerde, geniş bahçeli ve lüks özellikli olarak bulunmaktadır. Fiyatlar 2.500.000 TL\'den başlamakta, özellik ve konuma göre 8.000.000 TL ve üzerine çıkabilmektedir.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'medium',
  },
  {
    question: 'Kocaali\'de emlak alırken noter gerekli mi?',
    answer: 'Kocaali\'de emlak alım-satım işlemlerinde noter zorunluluğu bulunmaktadır. Sözleşme imzalanması, kapora ödenmesi ve tapu devri işlemleri noter huzurunda gerçekleştirilmelidir. Noter işlemleri güvenli ve hukuki bir alım-satım süreci için önemlidir.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'low',
  },
  {
    question: 'Kocaali\'de hangi bölgeler daha güvenli?',
    answer: 'Kocaali genel olarak güvenli bir ilçedir. Merkez bölge, yerleşik nüfusun yoğun olduğu mahalleler ve denize yakın turistik bölgeler genellikle güvenli kabul edilmektedir. Ancak emlak alırken çevreyi incelemek, komşularla görüşmek ve bölge hakkında bilgi almak önemlidir.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'medium',
  },
  {
    question: 'Kocaali\'de emlak alırken tapu kontrolü nasıl yapılır?',
    answer: 'Kocaali\'de emlak alırken tapu kontrolü için tapu müdürlüğünden tapu kayıt örneği alınmalı, tapu üzerindeki bilgiler (ada, parsel, yüzölçümü, üzerindeki yapı) kontrol edilmelidir. Tapu üzerinde ipotek, haciz veya şerh olup olmadığı kontrol edilmeli, tapu sahibinin kimliği doğrulanmalıdır.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'low',
  },
  {
    question: 'Kocaali\'de satılık arsa bulmak kolay mı?',
    answer: 'Kocaali\'de satılık arsa seçenekleri mevcuttur. Arsa fiyatları konum, büyüklük, imar durumu ve denize mesafeye göre değişmektedir. Denize yakın arsalar daha pahalı olurken, merkez dışındaki arsalar daha uygun fiyatlı olabilmektedir. İmar durumu ve yapılaşma izinleri kontrol edilmelidir.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'low',
  },
  {
    question: 'Kocaali\'de emlak alırken ekspertiz gerekli mi?',
    answer: 'Kocaali\'de emlak alırken ekspertiz yaptırmak zorunlu değildir ancak önerilir. Ekspertiz, emlakın değerini, yapı durumunu, yasal durumunu ve risklerini değerlendirir. Özellikle yüksek değerli emlaklarda ve kredi kullanımında ekspertiz raporu istenebilir.',
    category: 'bilgi',
    region: 'kocaali',
    priority: 'low',
  },
];

/**
 * Insert Q&A entries into database
 */
async function insertQAEntries() {
  const supabase = createServiceClient();
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  console.log('📝 Inserting Q&A entries...\n');

  const allQAs = [...karasuQAs, ...kocaaliQAs];

  for (const qa of allQAs) {
    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('qa_entries')
        .select('id')
        .eq('question', qa.question)
        .eq('region', qa.region)
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      // Insert
      const { error } = await supabase
        .from('qa_entries')
        .insert({
          question: qa.question,
          answer: qa.answer,
          category: qa.category,
          region: qa.region,
          priority: qa.priority,
        });

      if (error) {
        console.error(`  ❌ Error inserting Q&A: ${error.message}`);
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

  console.log(`\n✅ Inserted: ${inserted}, Skipped: ${skipped}, Errors: ${errors}`);
  return { inserted, skipped, errors };
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Q&A distribution...\n');
  console.log(`📊 Total Q&As: ${karasuQAs.length} Karasu + ${kocaaliQAs.length} Kocaali = ${karasuQAs.length + kocaaliQAs.length}\n`);

  const result = await insertQAEntries();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Q&A DISTRIBUTION COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Inserted: ${result.inserted}`);
  console.log(`Skipped: ${result.skipped}`);
  console.log(`Errors: ${result.errors}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

if (require.main === module) {
  main().catch(console.error);
}

export { insertQAEntries, karasuQAs, kocaaliQAs };
