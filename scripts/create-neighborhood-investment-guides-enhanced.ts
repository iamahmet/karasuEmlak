/**
 * Create Enhanced Neighborhood Investment Guide Blog Posts
 * 
 * Creates professional, SEO-optimized investment guides for neighborhoods
 * with focus on "karasu satılık daire" and related keywords
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../apps/web/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  meta_description: string;
  keywords: string[];
  category: string;
  tags: string[];
}

// Popular neighborhoods in Karasu with detailed characteristics
const popularNeighborhoods = [
  { 
    name: 'Atatürk', 
    slug: 'ataturk', 
    description: 'Merkezi konum, ticari aktivite yoğunluğu',
    characteristics: ['Merkezi konum', 'Ticari bölge', 'Ulaşım merkezi', 'Alışveriş imkanları'],
    propertyTypes: ['Daire', 'Müstakil Ev', 'İşyeri']
  },
  { 
    name: 'Sahil', 
    slug: 'sahil', 
    description: 'Denize sıfır konum, yüksek yatırım değeri',
    characteristics: ['Denize sıfır', 'Turizm potansiyeli', 'Yazlık kiralama', 'Yüksek değer'],
    propertyTypes: ['Daire', 'Villa', 'Yazlık']
  },
  { 
    name: 'Merkez', 
    slug: 'merkez', 
    description: 'Şehir merkezi, ulaşım kolaylığı',
    characteristics: ['Şehir merkezi', 'Ulaşım kolaylığı', 'Sosyal olanaklar', 'Eğitim kurumları'],
    propertyTypes: ['Daire', 'Müstakil Ev', 'İşyeri']
  },
  { 
    name: 'Çamlık', 
    slug: 'camlik', 
    description: 'Doğa içinde sakin yaşam, gelişen bölge',
    characteristics: ['Doğal güzellikler', 'Sakin yaşam', 'Gelişen bölge', 'Uzun vadeli değer'],
    propertyTypes: ['Daire', 'Müstakil Ev', 'Villa']
  },
  { 
    name: 'Aziziye', 
    slug: 'aziziye', 
    description: 'Aile dostu bölge, okullara yakın',
    characteristics: ['Aile dostu', 'Okullara yakın', 'Güvenli çevre', 'Sosyal tesisler'],
    propertyTypes: ['Daire', 'Müstakil Ev']
  },
  { 
    name: 'Çamlıca', 
    slug: 'camlica', 
    description: 'Huzurlu mahalle, doğal güzellikler',
    characteristics: ['Huzurlu mahalle', 'Doğal güzellikler', 'Sakin yaşam', 'Yeşil alanlar'],
    propertyTypes: ['Daire', 'Müstakil Ev', 'Villa']
  },
  { 
    name: 'Cumhuriyet', 
    slug: 'cumhuriyet', 
    description: 'Merkeze yakın, sakin mahalle',
    characteristics: ['Merkeze yakın', 'Sakin mahalle', 'Aile dostu', 'Ulaşım kolaylığı'],
    propertyTypes: ['Daire', 'Müstakil Ev']
  },
  { 
    name: 'Deniz Mahallesi', 
    slug: 'deniz-mahallesi', 
    description: 'Denize yakın, gelişmiş altyapı',
    characteristics: ['Denize yakın', 'Gelişmiş altyapı', 'Turizm potansiyeli', 'Modern yaşam'],
    propertyTypes: ['Daire', 'Villa', 'Yazlık']
  },
  { 
    name: 'İnköy', 
    slug: 'inkoy', 
    description: 'Gelişen bölge, yatırım potansiyeli',
    characteristics: ['Gelişen bölge', 'Yatırım potansiyeli', 'Uygun fiyatlar', 'Gelişim projeleri'],
    propertyTypes: ['Daire', 'Müstakil Ev', 'Arsa']
  },
  { 
    name: 'İnönü', 
    slug: 'inonu', 
    description: 'Denize yakın, sosyal olanaklar',
    characteristics: ['Denize yakın', 'Sosyal olanaklar', 'Gelişmiş altyapı', 'Turizm potansiyeli'],
    propertyTypes: ['Daire', 'Villa', 'Yazlık']
  },
];

function generateInvestmentGuide(neighborhood: typeof popularNeighborhoods[0]): BlogPost {
  const isCoastal = ['Sahil', 'Deniz Mahallesi', 'İnönü'].includes(neighborhood.name);
  const isCentral = ['Atatürk', 'Merkez', 'Cumhuriyet'].includes(neighborhood.name);
  const isNature = ['Çamlık', 'Çamlıca'].includes(neighborhood.name);
  const isFamily = ['Aziziye'].includes(neighborhood.name);

  // Pricing based on location type
  let avgPrice = 3000000;
  let avgRent = 18000;
  let roi = 6.5;
  let priceRange = '3.000.000 - 4.500.000 TL';
  let rentRange = '15.000 - 25.000 TL';
  let pricePerM2 = 24000;
  let locationAdvantages = ['Merkezi konum', 'Ulaşım kolaylığı', 'Gelişmiş altyapı'];
  let investmentFocus = 'Kira getirisi ve değer artışı kombinasyonu';
  let marketTrend = 'İstikrarlı büyüme';
  let demandLevel = 'Yüksek talep';

  if (isCoastal) {
    avgPrice = 4500000;
    avgRent = 25000;
    roi = 7.2;
    priceRange = '4.000.000 - 6.500.000 TL';
    rentRange = '20.000 - 35.000 TL';
    pricePerM2 = 32000;
    locationAdvantages = ['Denize sıfır konum', 'Yüksek turizm potansiyeli', 'Yazlık kiralama imkanı', 'Yüksek yatırım değeri'];
    investmentFocus = 'Yazlık kiralama ve turizm geliri';
    marketTrend = 'Güçlü büyüme';
    demandLevel = 'Çok yüksek talep';
  } else if (isCentral) {
    avgPrice = 3500000;
    avgRent = 20000;
    roi = 6.8;
    priceRange = '3.000.000 - 4.500.000 TL';
    rentRange = '15.000 - 25.000 TL';
    pricePerM2 = 28000;
    locationAdvantages = ['Merkezi konum', 'Ticari aktivite yoğunluğu', 'Ulaşım kolaylığı', 'Alışveriş imkanları'];
    investmentFocus = 'Kira getirisi ve ticari potansiyel';
    marketTrend = 'İstikrarlı büyüme';
    demandLevel = 'Yüksek talep';
  } else if (isNature) {
    avgPrice = 2800000;
    avgRent = 16000;
    roi = 6.2;
    priceRange = '2.500.000 - 4.000.000 TL';
    rentRange = '12.000 - 20.000 TL';
    pricePerM2 = 22000;
    locationAdvantages = ['Doğal güzellikler', 'Sakin yaşam', 'Gelişen bölge', 'Uzun vadeli değer artışı'];
    investmentFocus = 'Uzun vadeli değer artışı';
    marketTrend = 'Yavaş ama istikrarlı büyüme';
    demandLevel = 'Orta-yüksek talep';
  } else if (isFamily) {
    avgPrice = 3200000;
    avgRent = 19000;
    roi = 6.6;
    priceRange = '2.800.000 - 4.200.000 TL';
    rentRange = '14.000 - 22.000 TL';
    pricePerM2 = 25000;
    locationAdvantages = ['Aile dostu bölge', 'Okullara yakınlık', 'Güvenli çevre', 'Sosyal olanaklar'];
    investmentFocus = 'Uzun vadeli kiralama ve değer artışı';
    marketTrend = 'İstikrarlı büyüme';
    demandLevel = 'Yüksek talep';
  }

  const yearlyRent = avgRent * 12;
  const yearlyExpenses = Math.round(yearlyRent * 0.1);
  const netIncome = yearlyRent - yearlyExpenses;
  const roiPercent = ((netIncome / avgPrice) * 100).toFixed(1);
  const paybackYears = (avgPrice / netIncome).toFixed(1);
  const avgSizeM2 = Math.round(avgPrice / pricePerM2);

  // Fix for "Deniz Mahallesi" - remove duplicate "Mahallesi"
  const displayName = neighborhood.name === 'Deniz Mahallesi' ? 'Deniz Mahallesi' : `${neighborhood.name} Mahallesi`;

  // SEO-optimized keywords with "karasu satılık daire" as golden keyword
  const seoKeywords = [
    'karasu satılık daire',
    `${displayName.toLowerCase()} satılık daire`,
    `karasu ${neighborhood.name.toLowerCase()} satılık daire`,
    'karasu satılık daire fiyatları',
    `${displayName.toLowerCase()} emlak`,
    `${displayName.toLowerCase()} yatırım`,
    'karasu emlak yatırım',
    'sakarya satılık daire',
    'karasu satılık daire ilanları',
    `${displayName.toLowerCase()} kiralık daire`,
    'karasu yatırım rehberi',
    'karasu emlak piyasası',
    `${displayName.toLowerCase()} fiyatları`,
    'karasu satılık daire seçenekleri'
  ];
  
  const content = `<h2>${displayName}'nde Karasu Satılık Daire Yatırımı: Kapsamlı Rehber</h2>
<p>Karasu'da emlak yatırımı yapmayı düşünüyorsanız, ${displayName} özellikle <strong>karasu satılık daire</strong> yatırımcıları için cazip fırsatlar sunmaktadır. ${neighborhood.description}. Bu profesyonel rehber, ${displayName}'nde <strong>karasu satılık daire</strong> yatırımı yapmayı düşünen yatırımcılar için detaylı piyasa analizi, fiyat trendleri, yatırım stratejileri ve uzun vadeli getiri potansiyeli hakkında kapsamlı bilgi içermektedir.</p>

<h2>${displayName}: Karasu Satılık Daire İçin Neden İdeal?</h2>
<p>${displayName}, Karasu'nun ${isCoastal ? 'denize yakın' : isCentral ? 'merkezi' : isNature ? 'doğal güzellikleri olan' : 'gelişen'} bölgelerinden biri olarak, <strong>karasu satılık daire</strong> arayan yatırımcılar için stratejik bir konumda yer almaktadır. Bölgenin ${isCoastal ? 'denize yakın konumu ve turizm potansiyeli' : isCentral ? 'merkezi konumu ve ticari aktiviteleri' : isNature ? 'doğal güzellikleri ve sakin yaşamı' : 'gelişen altyapısı ve sosyal olanakları'} ile <strong>karasu satılık daire</strong> yatırımları için ideal bir ortam sağlamaktadır.</p>

<h3>Konum Avantajları ve Özellikler</h3>
<ul>
${locationAdvantages.map(adv => `<li><strong>${adv}:</strong> ${displayName}'nin <strong>karasu satılık daire</strong> yatırımcıları için öne çıkan özelliklerinden biridir</li>`).join('\n')}
</ul>

<h2>Karasu Satılık Daire Piyasası: ${displayName} Analizi</h2>
<p>${displayName}'nde <strong>karasu satılık daire</strong> piyasası, ${isCoastal ? 'denize yakın konumun avantajları' : isCentral ? 'merkezi konumun avantajları' : 'bölgenin gelişim potansiyeli'} nedeniyle ${marketTrend} göstermektedir. ${demandLevel} gözlemlenmektedir ve bu durum <strong>karasu satılık daire</strong> fiyatlarını desteklemektedir.</p>

<h3>Karasu Satılık Daire Fiyat Aralıkları</h3>
<p>${displayName}'nde <strong>karasu satılık daire</strong> fiyatları, konum, metrekare, oda sayısı ve özelliklere göre değişmektedir:</p>
<ul>
<li><strong>2+1 Daireler:</strong> ${priceRange} aralığında</li>
<li><strong>3+1 Daireler:</strong> ${isCoastal ? '4.500.000 - 7.000.000 TL' : isCentral ? '3.500.000 - 5.500.000 TL' : '3.000.000 - 5.000.000 TL'} aralığında</li>
<li><strong>4+1 ve Üzeri:</strong> ${isCoastal ? '6.000.000 - 9.000.000 TL' : isCentral ? '5.000.000 - 7.500.000 TL' : '4.500.000 - 7.000.000 TL'} aralığında</li>
<li><strong>Metrekare Başına Ortalama:</strong> ${new Intl.NumberFormat('tr-TR').format(pricePerM2)} TL/m²</li>
</ul>

<h3>Karasu Satılık Daire Özellikleri</h3>
<p>${displayName}'ndeki <strong>karasu satılık daire</strong> seçenekleri genellikle şu özelliklere sahiptir:</p>
<ul>
<li><strong>Ortalama Metrekare:</strong> ${avgSizeM2} m²</li>
<li><strong>Oda Sayısı:</strong> 2+1, 3+1, 4+1 seçenekleri mevcuttur</li>
<li><strong>Banyo Sayısı:</strong> Genellikle 1-2 banyo</li>
<li><strong>Balkon:</strong> Çoğu dairede balkon bulunmaktadır</li>
<li><strong>Asansör:</strong> ${isCentral ? 'Merkezi konum nedeniyle çoğu binada asansör mevcuttur' : 'Bazı binalarda asansör bulunmaktadır'}</li>
<li><strong>Otopark:</strong> ${isCentral ? 'Sınırlı otopark imkanı' : 'Otopark imkanı mevcuttur'}</li>
</ul>

<h2>Karasu Satılık Daire Yatırım Fırsatları</h2>
<p>${displayName}'nde <strong>karasu satılık daire</strong> yatırımı yapmak, farklı yatırım profillerine uygun çeşitli fırsatlar sunmaktadır.</p>

<h3>1. Kira Getirisi Odaklı Karasu Satılık Daire Yatırımı</h3>
<p>${isCoastal ? 'Denize yakın konumu ve turizm potansiyeli' : isCentral ? 'Merkezi konum ve ticari aktivite yoğunluğu' : 'Bölgenin gelişen yapısı'} nedeniyle, <strong>karasu satılık daire</strong> yatırımları için kira getirisi potansiyeli yüksektir:</p>
<ul>
<li><strong>Yıllık Kira Getirisi:</strong> %${roi.toFixed(1)}-${(roi + 1.5).toFixed(1)} aralığında</li>
<li><strong>Boş Kalma Riski:</strong> ${isCoastal ? 'Orta (yazlık kiralama)' : isCentral ? 'Düşük (merkezi konum avantajı)' : 'Düşük-Orta'}</li>
<li><strong>Kiracı Profili:</strong> ${isCoastal ? 'Yazlıkçılar, turistler, emekliler' : isCentral ? 'Çalışanlar, aileler, işletmeler' : 'Aileler, emekliler, çalışanlar'}</li>
<li><strong>Kira Artış Potansiyeli:</strong> Yıllık %${isCoastal ? '8-12' : isCentral ? '6-10' : '5-8'} aralığında</li>
</ul>

<h3>2. Değer Artışı Odaklı Karasu Satılık Daire Yatırımı</h3>
<p>Bölgenin gelişim potansiyeli ve ${isCoastal ? 'denize yakın konumu' : isCentral ? 'merkezi konumu' : 'doğal güzellikleri'}, <strong>karasu satılık daire</strong> yatırımları için uzun vadeli değer artışı beklentisi yaratır:</p>
<ul>
<li><strong>Yıllık Değer Artışı:</strong> %3-5 aralığında</li>
<li><strong>Gelişim Projeleri:</strong> Altyapı iyileştirmeleri, şehir planlaması ve yeni projeler</li>
<li><strong>Uzun Vadeli Potansiyel:</strong> Yüksek (5-10 yıl içinde %30-50 değer artışı beklenmektedir)</li>
<li><strong>Piyasa Likiditesi:</strong> ${demandLevel} nedeniyle satış kolaylığı</li>
</ul>

${isCentral ? `<h3>3. Ticari Potansiyel: Karasu Satılık Daire ve İşyeri Kombinasyonu</h3>
<p>Merkezi konumu, <strong>karasu satılık daire</strong> yatırımları için ticari potansiyel de sunmaktadır:</p>
<ul>
<li><strong>Alt Kat İşyeri + Üst Kat Daire:</strong> Kombine yatırım imkanı</li>
<li><strong>İşyeri Kiraları:</strong> Yüksek talep ve yüksek kira getirisi (%8-12)</li>
<li><strong>Risk Profili:</strong> Orta-yüksek (ticari faaliyet bağımlılığı)</li>
</ul>` : ''}

<h2>Karasu Satılık Daire ROI Hesaplama: ${displayName} Örnekleri</h2>
<p>Aşağıda, ${displayName}'nde <strong>karasu satılık daire</strong> yatırımı için detaylı ROI hesaplama örnekleri bulunmaktadır.</p>

<h3>Örnek 1: 2+1 Karasu Satılık Daire Yatırımı</h3>
<ul>
<li><strong>Daire Özellikleri:</strong> 2+1, ${avgSizeM2} m², ${isCentral ? 'merkezi konum' : isCoastal ? 'denize yakın' : 'mahalle içi'}</li>
<li><strong>Yatırım Tutarı:</strong> ${new Intl.NumberFormat('tr-TR').format(avgPrice)} TL</li>
<li><strong>Aylık Kira:</strong> ${new Intl.NumberFormat('tr-TR').format(avgRent)} TL</li>
<li><strong>Yıllık Kira Geliri:</strong> ${new Intl.NumberFormat('tr-TR').format(yearlyRent)} TL</li>
<li><strong>Yıllık Giderler:</strong> ${new Intl.NumberFormat('tr-TR').format(yearlyExpenses)} TL (aidat, sigorta, bakım, vergi)</li>
<li><strong>Net Yıllık Gelir:</strong> ${new Intl.NumberFormat('tr-TR').format(netIncome)} TL</li>
<li><strong>ROI (Yatırım Getirisi):</strong> %${roiPercent}</li>
<li><strong>Geri Dönüş Süresi:</strong> ${paybackYears} yıl</li>
<li><strong>5 Yıllık Toplam Getiri:</strong> ${new Intl.NumberFormat('tr-TR').format(netIncome * 5)} TL (kira) + ${new Intl.NumberFormat('tr-TR').format(avgPrice * 0.2)} TL (değer artışı) = ${new Intl.NumberFormat('tr-TR').format(netIncome * 5 + avgPrice * 0.2)} TL</li>
</ul>

<h3>Örnek 2: 3+1 Karasu Satılık Daire Yatırımı</h3>
<ul>
<li><strong>Daire Özellikleri:</strong> 3+1, ${Math.round(avgSizeM2 * 1.2)} m², ${isCentral ? 'merkezi konum' : isCoastal ? 'denize yakın' : 'mahalle içi'}</li>
<li><strong>Yatırım Tutarı:</strong> ${new Intl.NumberFormat('tr-TR').format(Math.round(avgPrice * 1.3))} TL</li>
<li><strong>Aylık Kira:</strong> ${new Intl.NumberFormat('tr-TR').format(Math.round(avgRent * 1.3))} TL</li>
<li><strong>Yıllık Kira Geliri:</strong> ${new Intl.NumberFormat('tr-TR').format(Math.round(avgRent * 1.3 * 12))} TL</li>
<li><strong>Yıllık Giderler:</strong> ${new Intl.NumberFormat('tr-TR').format(Math.round(avgRent * 1.3 * 12 * 0.1))} TL</li>
<li><strong>Net Yıllık Gelir:</strong> ${new Intl.NumberFormat('tr-TR').format(Math.round(avgRent * 1.3 * 12 * 0.9))} TL</li>
<li><strong>ROI:</strong> %${((Math.round(avgRent * 1.3 * 12 * 0.9) / Math.round(avgPrice * 1.3)) * 100).toFixed(1)}</li>
<li><strong>Geri Dönüş Süresi:</strong> ${(Math.round(avgPrice * 1.3) / Math.round(avgRent * 1.3 * 12 * 0.9)).toFixed(1)} yıl</li>
</ul>

<h2>Karasu Satılık Daire Yatırım Stratejileri</h2>
<p>${displayName}'nde <strong>karasu satılık daire</strong> yatırımı için farklı stratejiler uygulanabilir:</p>

<h3>Kısa Vadeli Strateji (1-3 Yıl): Hızlı Dönüşüm</h3>
<ul>
<li><strong>Hedef:</strong> ${isCoastal ? 'Yazlık kiralama ve kısa vadeli getiri' : 'Kira getirisi ve hızlı satış'}</li>
<li><strong>Daire Seçimi:</strong> ${isCoastal ? 'Denize yakın, yazlıkçılar için uygun' : 'Merkezi konum, yüksek talep gören'}</li>
<li><strong>Beklenen Getiri:</strong> Yıllık %${roi.toFixed(1)}-${(roi + 2).toFixed(1)}</li>
<li><strong>Risk Seviyesi:</strong> ${isCoastal ? 'Orta' : 'Düşük'}</li>
</ul>

<h3>Orta Vadeli Strateji (3-7 Yıl): Dengeli Büyüme</h3>
<ul>
<li><strong>Hedef:</strong> Kira getirisi + değer artışı kombinasyonu</li>
<li><strong>Daire Seçimi:</strong> Gelişim projelerine yakın, yenileme potansiyeli olan</li>
<li><strong>Beklenen Getiri:</strong> Yıllık %${(roi + 1).toFixed(1)}-${(roi + 3).toFixed(1)} (kira + değer artışı)</li>
<li><strong>Risk Seviyesi:</strong> Orta</li>
</ul>

<h3>Uzun Vadeli Strateji (7+ Yıl): Portföy Çeşitlendirmesi</h3>
<ul>
<li><strong>Hedef:</strong> Değer artışı odaklı, portföy çeşitlendirmesi</li>
<li><strong>Daire Seçimi:</strong> Stratejik konum, uzun vadeli değer artışı potansiyeli</li>
<li><strong>Beklenen Getiri:</strong> Yıllık %${(roi + 2).toFixed(1)}-${(roi + 4).toFixed(1)} (toplam getiri)</li>
<li><strong>Risk Seviyesi:</strong> Düşük-Orta</li>
</ul>

<h2>Karasu Satılık Daire Seçerken Dikkat Edilmesi Gerekenler</h2>

<h3>1. Konum ve Ulaşım</h3>
<ul>
<li>Ana yollara ve toplu taşıma hatlarına yakınlık</li>
<li>${isCentral ? 'Ticari merkezlere ve işyerlerine yakınlık' : isCoastal ? 'Denize ve plajlara yakınlık' : 'Okullara, sağlık tesislerine yakınlık'}</li>
<li>Gelecek gelişim projelerine yakınlık</li>
</ul>

<h3>2. Bina ve Daire Özellikleri</h3>
<ul>
<li><strong>Bina Yaşı:</strong> Yeni veya iyi durumda olan binalar tercih edilmelidir</li>
<li><strong>Metrekare:</strong> ${avgSizeM2} m² ve üzeri daireler daha yüksek kira getirisi sağlar</li>
<li><strong>Oda Sayısı:</strong> 2+1 ve 3+1 daireler en yüksek talep görmektedir</li>
<li><strong>Asansör:</strong> ${isCentral ? 'Merkezi konumda asansörlü binalar tercih edilmelidir' : 'Asansör varlığı değer artışı sağlar'}</li>
<li><strong>Otopark:</strong> Otoparklı daireler daha yüksek kira getirisi sağlar</li>
</ul>

<h3>3. Yasal ve Finansal Kontroller</h3>
<ul>
<li><strong>Tapu Durumu:</strong> Tapu durumu ve ipotek kontrolü mutlaka yapılmalıdır</li>
<li><strong>İmar Durumu:</strong> İmar durumu ve yapı ruhsatı kontrol edilmelidir</li>
<li><strong>Vergi Yükümlülükleri:</strong> Emlak vergisi ve diğer vergi yükümlülükleri hesaplanmalıdır</li>
<li><strong>Kredi İmkanları:</strong> Kredi kullanılacaksa, faiz oranları ve ödeme planı değerlendirilmelidir</li>
</ul>

<h3>4. Piyasa Araştırması</h3>
<ul>
<li>Bölgedeki benzer <strong>karasu satılık daire</strong> fiyatlarını karşılaştırın</li>
<li>Kira piyasasını araştırın ve gerçekçi kira beklentileri oluşturun</li>
<li>Piyasa uzmanlarından ve emlak danışmanlarından profesyonel destek alın</li>
<li>Gelecek gelişim projelerini ve altyapı planlarını takip edin</li>
</ul>

<h2>Karasu Satılık Daire Piyasa Trendleri: ${displayName}</h2>
<p>${displayName}'nde <strong>karasu satılık daire</strong> piyasası, ${marketTrend} göstermektedir. Son dönemlerde gözlemlenen trendler:</p>

<h3>Fiyat Trendleri</h3>
<ul>
<li><strong>Son 1 Yıl:</strong> %${isCoastal ? '8-12' : isCentral ? '6-10' : '5-8'} fiyat artışı</li>
<li><strong>Son 3 Yıl:</strong> %${isCoastal ? '25-35' : isCentral ? '20-30' : '15-25'} toplam fiyat artışı</li>
<li><strong>Beklenen Trend:</strong> ${isCoastal ? 'Güçlü büyüme devam edecek' : isCentral ? 'İstikrarlı büyüme sürecek' : 'Yavaş ama istikrarlı büyüme'}</li>
</ul>

<h3>Talep Trendleri</h3>
<ul>
<li><strong>Talep Seviyesi:</strong> ${demandLevel}</li>
<li><strong>En Çok Talep Gören:</strong> 2+1 ve 3+1 <strong>karasu satılık daire</strong> seçenekleri</li>
<li><strong>Ortalama Satış Süresi:</strong> ${isCoastal ? '30-45 gün' : isCentral ? '35-50 gün' : '40-60 gün'}</li>
<li><strong>Ortalama Kiralama Süresi:</strong> ${isCoastal ? '15-30 gün (yazlık)' : '20-40 gün'}</li>
</ul>

<h2>Karasu Satılık Daire Yatırımında Finansman Seçenekleri</h2>
<p><strong>Karasu satılık daire</strong> yatırımı için çeşitli finansman seçenekleri mevcuttur:</p>

<h3>1. Nakit Yatırım</h3>
<ul>
<li><strong>Avantajlar:</strong> Hızlı işlem, pazarlık gücü, düşük maliyet</li>
<li><strong>Dezavantajlar:</strong> Yüksek başlangıç maliyeti</li>
<li><strong>Uygun Olan:</strong> Yüksek nakit rezervi olan yatırımcılar</li>
</ul>

<h3>2. Konut Kredisi ile Yatırım</h3>
<ul>
<li><strong>Avantajlar:</strong> Düşük başlangıç maliyeti, kaldıraç etkisi</li>
<li><strong>Dezavantajlar:</strong> Faiz maliyeti, kredi onay süreci</li>
<li><strong>ROI Hesaplama:</strong> Faiz maliyeti düşüldükten sonra net getiri hesaplanmalıdır</li>
</ul>

<h3>3. Kombine Finansman</h3>
<ul>
<li><strong>Yöntem:</strong> Nakit + kredi kombinasyonu</li>
<li><strong>Avantajlar:</strong> Esneklik, risk dağılımı</li>
<li><strong>Uygun Olan:</strong> Orta seviye yatırımcılar</li>
</ul>

<h2>Karasu Satılık Daire Yatırımında Vergi ve Maliyetler</h2>
<p><strong>Karasu satılık daire</strong> yatırımında dikkate alınması gereken vergi ve maliyetler:</p>

<h3>Satın Alma Maliyetleri</h3>
<ul>
<li><strong>Tapu Harç ve Masrafları:</strong> Yaklaşık %2-3 (emlak değerine göre)</li>
<li><strong>Noter Masrafları:</strong> Yaklaşık 5.000-10.000 TL</li>
<li><strong>Emlak Komisyonu:</strong> %2-3 (varsa)</li>
</ul>

<h3>İşletme Maliyetleri</h3>
<ul>
<li><strong>Aidat:</strong> Aylık 500-2.000 TL (binaya göre değişir)</li>
<li><strong>Emlak Vergisi:</strong> Yıllık emlak değerinin %0,1-0,2'si</li>
<li><strong>Sigorta:</strong> Yıllık 2.000-5.000 TL</li>
<li><strong>Bakım ve Onarım:</strong> Yıllık kira gelirinin %5-10'u</li>
</ul>

<h3>Vergi Yükümlülükleri</h3>
<ul>
<li><strong>Kira Geliri Vergisi:</strong> Yıllık kira gelirinin %15-35'i (gelir dilimine göre)</li>
<li><strong>Satış Geliri Vergisi:</strong> Satış durumunda gelir vergisi (2 yıl içinde satışta %15-35)</li>
</ul>

<h2>Sonuç: ${displayName}'nde Karasu Satılık Daire Yatırımı</h2>
<p>${displayName}, ${neighborhood.description} ile <strong>karasu satılık daire</strong> yatırımcıları için cazip fırsatlar sunmaktadır. Doğru strateji, piyasa analizi ve profesyonel danışmanlık ile, ${investmentFocus} potansiyeli olan <strong>karasu satılık daire</strong> yatırımları yapılabilir.</p>

<p><strong>Karasu satılık daire</strong> yatırım kararlarınızda profesyonel emlak danışmanlığı almak ve detaylı piyasa araştırması yapmak çok önemlidir. ${displayName}'ndeki <a href="/satilik?mahalle=${neighborhood.slug}&tip=daire"><strong>karasu satılık daire ilanları</strong></a> ve <a href="/kiralik?mahalle=${neighborhood.slug}&tip=daire">kiralık daire ilanları</a> için sayfalarımızı ziyaret edebilirsiniz.</p>

<p>ROI hesaplama ve yatırım analizi için <a href="/yatirim-hesaplayici">Yatırım Hesaplayıcı</a> aracımızı kullanabilir, <a href="/kredi-hesaplayici">Kredi Hesaplayıcı</a> ile finansman seçeneklerinizi değerlendirebilirsiniz.</p>

<p>${displayName} hakkında daha fazla bilgi için <a href="/mahalle/${neighborhood.slug}">Mahalle Detay Sayfası</a>'nı ziyaret edebilirsiniz.</p>`;

  return {
    title: `${displayName} Karasu Satılık Daire Yatırım Rehberi: Kapsamlı Analiz ve Fırsatlar`,
    slug: `${neighborhood.slug}-emlak-yatirim-rehberi`,
    excerpt: `${displayName}'nde karasu satılık daire yatırımı yapmayı düşünüyorsanız, bu profesyonel rehber size piyasa analizi, fiyat trendleri, ROI hesaplamaları, yatırım stratejileri ve uzun vadeli getiri potansiyeli hakkında detaylı bilgi sunar.`,
    meta_description: `${displayName} karasu satılık daire yatırım rehberi. Piyasa analizi, fiyat trendleri, kira getirisi, ROI hesaplamaları ve yatırım fırsatları. Karasu satılık daire fiyatları ve yatırım stratejileri hakkında kapsamlı bilgi.`,
    keywords: seoKeywords,
    category: 'yatirim-rehberi',
    tags: ['yatırım', 'mahalle rehberi', 'karasu', displayName.toLowerCase(), 'emlak analizi', 'karasu satılık daire', 'yatırım rehberi'],
    content
  };
}

// Generate investment guides for all popular neighborhoods
const investmentGuides: BlogPost[] = popularNeighborhoods.map(generateInvestmentGuide);

async function insertArticle(article: BlogPost): Promise<boolean> {
  try {
    // Check if article already exists
    const { data: existing } = await supabase
      .from('articles')
      .select('id, title')
      .eq('slug', article.slug)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️  Article "${article.title}" already exists, updating...`);
      
      // Update existing article
      const { data, error } = await supabase
        .from('articles')
        .update({
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          meta_description: article.meta_description,
          keywords: article.keywords,
          category: article.category,
          tags: article.tags,
          status: 'published',
          updated_at: new Date().toISOString(),
        })
        .eq('slug', article.slug)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error updating article "${article.title}":`, error);
        return false;
      }

      console.log(`✅ Successfully updated article: "${article.title}" (${data.id})`);
      return true;
    }

    // Insert new article
    const { data, error } = await supabase
      .from('articles')
      .insert({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        meta_description: article.meta_description,
        keywords: article.keywords,
        category: article.category,
        tags: article.tags,
        author: 'Karasu Emlak',
        status: 'published',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 0,
        discover_eligible: true,
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error inserting article "${article.title}":`, error);
      return false;
    }

    console.log(`✅ Successfully inserted article: "${article.title}" (${data.id})`);
    return true;
  } catch (error: any) {
    console.error(`❌ Error processing article "${article.title}":`, error.message || error);
    return false;
  }
}

async function main() {
  console.log('🚀 Creating enhanced neighborhood investment guide blog posts...\n');
  console.log('📌 Focus: SEO optimization with "karasu satılık daire" as golden keyword\n');

  let successCount = 0;
  let failCount = 0;

  for (const guide of investmentGuides) {
    const success = await insertArticle(guide);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully created/updated: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`\n✨ Done! All articles are SEO-optimized with "karasu satılık daire" focus.`);
}

main().catch(console.error);
