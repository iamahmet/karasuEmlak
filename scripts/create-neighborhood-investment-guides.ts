/**
 * Create Neighborhood Investment Guide Blog Posts
 * 
 * Creates comprehensive investment guides for neighborhoods
 * focusing on real estate investment opportunities
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

// Popular neighborhoods in Karasu
const popularNeighborhoods = [
  { name: 'Atatürk', slug: 'ataturk', description: 'Merkezi konum, ticari aktivite yoğunluğu' },
  { name: 'Sahil', slug: 'sahil', description: 'Denize sıfır konum, yüksek yatırım değeri' },
  { name: 'Merkez', slug: 'merkez', description: 'Şehir merkezi, ulaşım kolaylığı' },
  { name: 'Çamlık', slug: 'camlik', description: 'Doğa içinde sakin yaşam, gelişen bölge' },
  { name: 'Aziziye', slug: 'aziziye', description: 'Aile dostu bölge, okullara yakın' },
  { name: 'Çamlıca', slug: 'camlica', description: 'Huzurlu mahalle, doğal güzellikler' },
  { name: 'Cumhuriyet', slug: 'cumhuriyet', description: 'Merkeze yakın, sakin mahalle' },
  { name: 'Deniz Mahallesi', slug: 'deniz-mahallesi', description: 'Denize yakın, gelişmiş altyapı' },
  { name: 'İnköy', slug: 'inkoy', description: 'Gelişen bölge, yatırım potansiyeli' },
  { name: 'İnönü', slug: 'inonu', description: 'Denize yakın, sosyal olanaklar' },
];

function generateInvestmentGuide(neighborhood: typeof popularNeighborhoods[0]): BlogPost {
  const isCoastal = ['Sahil', 'Deniz Mahallesi', 'İnönü'].includes(neighborhood.name);
  const isCentral = ['Atatürk', 'Merkez', 'Cumhuriyet'].includes(neighborhood.name);
  const isNature = ['Çamlık', 'Çamlıca'].includes(neighborhood.name);
  const isFamily = ['Aziziye'].includes(neighborhood.name);

  let avgPrice = 3000000;
  let avgRent = 18000;
  let roi = 6.5;
  let priceRange = '3.000.000 - 4.500.000 TL';
  let rentRange = '15.000 - 25.000 TL';
  let locationAdvantages = ['Merkezi konum', 'Ulaşım kolaylığı', 'Gelişmiş altyapı'];
  let investmentFocus = 'Kira getirisi ve değer artışı kombinasyonu';

  if (isCoastal) {
    avgPrice = 4500000;
    avgRent = 25000;
    roi = 7.2;
    priceRange = '4.000.000 - 6.500.000 TL';
    rentRange = '20.000 - 35.000 TL';
    locationAdvantages = ['Denize sıfır konum', 'Yüksek turizm potansiyeli', 'Yazlık kiralama imkanı', 'Yüksek yatırım değeri'];
    investmentFocus = 'Yazlık kiralama ve turizm geliri';
  } else if (isCentral) {
    avgPrice = 3500000;
    avgRent = 20000;
    roi = 6.8;
    priceRange = '3.000.000 - 4.500.000 TL';
    rentRange = '15.000 - 25.000 TL';
    locationAdvantages = ['Merkezi konum', 'Ticari aktivite yoğunluğu', 'Ulaşım kolaylığı', 'Alışveriş imkanları'];
    investmentFocus = 'Kira getirisi ve ticari potansiyel';
  } else if (isNature) {
    avgPrice = 2800000;
    avgRent = 16000;
    roi = 6.2;
    priceRange = '2.500.000 - 4.000.000 TL';
    rentRange = '12.000 - 20.000 TL';
    locationAdvantages = ['Doğal güzellikler', 'Sakin yaşam', 'Gelişen bölge', 'Uzun vadeli değer artışı'];
    investmentFocus = 'Uzun vadeli değer artışı';
  } else if (isFamily) {
    avgPrice = 3200000;
    avgRent = 19000;
    roi = 6.6;
    priceRange = '2.800.000 - 4.200.000 TL';
    rentRange = '14.000 - 22.000 TL';
    locationAdvantages = ['Aile dostu bölge', 'Okullara yakınlık', 'Güvenli çevre', 'Sosyal olanaklar'];
    investmentFocus = 'Uzun vadeli kiralama ve değer artışı';
  }

  const yearlyRent = avgRent * 12;
  const yearlyExpenses = Math.round(yearlyRent * 0.1);
  const netIncome = yearlyRent - yearlyExpenses;
  const roiPercent = ((netIncome / avgPrice) * 100).toFixed(1);
  const paybackYears = (avgPrice / netIncome).toFixed(1);

  const content = `<h2>${neighborhood.name} Mahallesi: Emlak Yatırımı İçin Stratejik Konum</h2>
<p>${neighborhood.name} Mahallesi, Karasu'nun ${isCoastal ? 'denize yakın' : isCentral ? 'merkezi' : isNature ? 'doğal güzellikleri olan' : 'gelişen'} bölgelerinden biri olarak, emlak yatırımcıları için cazip fırsatlar sunmaktadır. ${neighborhood.description}. Bu kapsamlı rehber, ${neighborhood.name} Mahallesi'nde emlak yatırımı yapmayı düşünen yatırımcılar için detaylı analiz ve stratejik öneriler içermektedir.</p>

<h2>${neighborhood.name} Mahallesi Genel Bakış</h2>
<p>${neighborhood.name} Mahallesi, ${neighborhood.description}. Bölgenin ${isCoastal ? 'denize yakın konumu ve turizm potansiyeli' : isCentral ? 'merkezi konumu ve ticari aktiviteleri' : isNature ? 'doğal güzellikleri ve sakin yaşamı' : 'gelişen altyapısı ve sosyal olanakları'} ile dikkat çeker.</p>

<h3>Konum Avantajları</h3>
<ul>
${locationAdvantages.map(adv => `<li><strong>${adv}:</strong> ${neighborhood.name} Mahallesi'nin öne çıkan özelliklerinden biridir</li>`).join('\n')}
</ul>

<h2>Emlak Piyasası Analizi</h2>
<p>${neighborhood.name} Mahallesi'nde emlak piyasası, ${isCoastal ? 'denize yakın konumun avantajları' : isCentral ? 'merkezi konumun avantajları' : 'bölgenin gelişim potansiyeli'} nedeniyle dinamik bir yapıya sahiptir.</p>

<h3>Satılık Emlak Fiyatları</h3>
<ul>
<li><strong>Daireler:</strong> Ortalama ${priceRange} aralığında</li>
<li><strong>Müstakil Evler:</strong> ${isCoastal ? '5.000.000 - 8.000.000 TL' : isCentral ? '4.000.000 - 6.000.000 TL' : '3.500.000 - 5.500.000 TL'} aralığında</li>
<li><strong>İşyerleri:</strong> Konum ve büyüklüğe göre değişken</li>
</ul>

<h3>Kiralık Emlak Fiyatları</h3>
<ul>
<li><strong>Daireler:</strong> Aylık ${rentRange} aralığında</li>
<li><strong>Müstakil Evler:</strong> Aylık ${isCoastal ? '25.000 - 45.000 TL' : isCentral ? '20.000 - 35.000 TL' : '18.000 - 30.000 TL'} aralığında</li>
<li><strong>İşyerleri:</strong> Konum ve büyüklüğe göre değişken</li>
</ul>

<h2>Yatırım Fırsatları</h2>
<p>${neighborhood.name} Mahallesi, farklı yatırım profillerine uygun çeşitli fırsatlar sunar.</p>

<h3>1. Kira Getirisi Odaklı Yatırım</h3>
<p>${isCoastal ? 'Denize yakın konumu ve turizm potansiyeli' : isCentral ? 'Merkezi konum ve ticari aktivite yoğunluğu' : 'Bölgenin gelişen yapısı'} nedeniyle, kira getirisi potansiyeli yüksektir:</p>
<ul>
<li><strong>Yıllık Kira Getirisi:</strong> %${roi.toFixed(1)}-${(roi + 1.5).toFixed(1)} aralığında</li>
<li><strong>Boş Kalma Riski:</strong> ${isCoastal ? 'Orta (yazlık kiralama)' : isCentral ? 'Düşük (merkezi konum avantajı)' : 'Düşük-Orta'}</li>
<li><strong>Kiracı Profili:</strong> ${isCoastal ? 'Yazlıkçılar, turistler' : isCentral ? 'Çalışanlar, aileler, işletmeler' : 'Aileler, emekliler'}</li>
</ul>

<h3>2. Değer Artışı Odaklı Yatırım</h3>
<p>Bölgenin gelişim potansiyeli ve ${isCoastal ? 'denize yakın konumu' : isCentral ? 'merkezi konumu' : 'doğal güzellikleri'}, uzun vadeli değer artışı beklentisi yaratır:</p>
<ul>
<li><strong>Yıllık Değer Artışı:</strong> %3-5 aralığında</li>
<li><strong>Gelişim Projeleri:</strong> Altyapı iyileştirmeleri ve şehir planlaması</li>
<li><strong>Uzun Vadeli Potansiyel:</strong> Yüksek</li>
</ul>

${isCentral ? `<h3>3. Ticari Emlak Yatırımı</h3>
<p>Merkezi konumu, ticari emlak yatırımları için ideal bir ortam sağlar:</p>
<ul>
<li><strong>İşyeri Kiraları:</strong> Yüksek talep ve yüksek kira getirisi</li>
<li><strong>Yatırım Dönüşü:</strong> %8-12 aralığında</li>
<li><strong>Risk Profili:</strong> Orta-yüksek</li>
</ul>` : ''}

<h2>ROI Hesaplama Örnekleri</h2>

<h3>Örnek 1: Daire Yatırımı</h3>
<ul>
<li><strong>Yatırım Tutarı:</strong> ${new Intl.NumberFormat('tr-TR').format(avgPrice)} TL</li>
<li><strong>Aylık Kira:</strong> ${new Intl.NumberFormat('tr-TR').format(avgRent)} TL</li>
<li><strong>Yıllık Kira:</strong> ${new Intl.NumberFormat('tr-TR').format(yearlyRent)} TL</li>
<li><strong>Yıllık Giderler:</strong> ${new Intl.NumberFormat('tr-TR').format(yearlyExpenses)} TL (aidat, sigorta, bakım)</li>
<li><strong>Net Gelir:</strong> ${new Intl.NumberFormat('tr-TR').format(netIncome)} TL</li>
<li><strong>ROI:</strong> %${roiPercent}</li>
<li><strong>Geri Dönüş Süresi:</strong> ${paybackYears} yıl</li>
</ul>

<h3>Örnek 2: Müstakil Ev Yatırımı</h3>
<ul>
<li><strong>Yatırım Tutarı:</strong> ${new Intl.NumberFormat('tr-TR').format(Math.round(avgPrice * 1.4))} TL</li>
<li><strong>Aylık Kira:</strong> ${new Intl.NumberFormat('tr-TR').format(Math.round(avgRent * 1.5))} TL</li>
<li><strong>Yıllık Kira:</strong> ${new Intl.NumberFormat('tr-TR').format(Math.round(avgRent * 1.5 * 12))} TL</li>
<li><strong>Yıllık Giderler:</strong> ${new Intl.NumberFormat('tr-TR').format(Math.round(avgRent * 1.5 * 12 * 0.1))} TL</li>
<li><strong>Net Gelir:</strong> ${new Intl.NumberFormat('tr-TR').format(Math.round(avgRent * 1.5 * 12 * 0.9))} TL</li>
<li><strong>ROI:</strong> %${((Math.round(avgRent * 1.5 * 12 * 0.9) / Math.round(avgPrice * 1.4)) * 100).toFixed(1)}</li>
<li><strong>Geri Dönüş Süresi:</strong> ${(Math.round(avgPrice * 1.4) / Math.round(avgRent * 1.5 * 12 * 0.9)).toFixed(1)} yıl</li>
</ul>

<h2>Yatırım Stratejileri</h2>

<h3>Kısa Vadeli Strateji (1-3 Yıl)</h3>
<ul>
<li>${isCoastal ? 'Yazlık kiralama odaklı yatırım' : 'Kira getirisi odaklı yatırım'}</li>
<li>Düşük boş kalma riski olan konumlar</li>
<li>Hızlı dönüşüm potansiyeli</li>
</ul>

<h3>Orta Vadeli Strateji (3-7 Yıl)</h3>
<ul>
<li>Değer artışı + kira getirisi kombinasyonu</li>
<li>Gelişim projelerine yakın konumlar</li>
<li>Yenileme ve iyileştirme potansiyeli</li>
</ul>

<h3>Uzun Vadeli Strateji (7+ Yıl)</h3>
<ul>
<li>Değer artışı odaklı yatırım</li>
<li>Stratejik konum avantajları</li>
<li>Portföy çeşitlendirmesi</li>
</ul>

<h2>Dikkat Edilmesi Gerekenler</h2>

<h3>1. Piyasa Araştırması</h3>
<ul>
<li>Güncel fiyat trendlerini takip edin</li>
<li>Bölgedeki benzer emlakları karşılaştırın</li>
<li>Piyasa uzmanlarından danışmanlık alın</li>
</ul>

<h3>2. Yasal Kontroller</h3>
<ul>
<li>Tapu durumu ve ipotek kontrolü</li>
<li>İmar durumu ve yapı ruhsatı</li>
<li>Vergi yükümlülükleri</li>
</ul>

<h3>3. Finansman Planlaması</h3>
<ul>
<li>Kredi imkanlarını değerlendirin</li>
<li>Nakit akış planlaması yapın</li>
<li>Yedek fon ayırın</li>
</ul>

<h2>Sonuç</h2>
<p>${neighborhood.name} Mahallesi, ${neighborhood.description} ile emlak yatırımcıları için cazip fırsatlar sunmaktadır. Doğru strateji ve piyasa analizi ile, ${investmentFocus} potansiyeli olan yatırımlar yapılabilir.</p>

<p>Yatırım kararlarınızda profesyonel emlak danışmanlığı almak ve detaylı piyasa araştırması yapmak önemlidir. <a href="/satilik?mahalle=${neighborhood.slug}">${neighborhood.name} Mahallesi satılık ilanları</a> ve <a href="/kiralik?mahalle=${neighborhood.slug}">kiralık ilanları</a> için sayfalarımızı ziyaret edebilirsiniz.</p>

<p>ROI hesaplama ve yatırım analizi için <a href="/yatirim-hesaplayici">Yatırım Hesaplayıcı</a> aracımızı kullanabilirsiniz.</p>`;

  return {
    title: `${neighborhood.name} Mahallesi Emlak Yatırım Rehberi: Kapsamlı Analiz ve Fırsatlar`,
    slug: `${neighborhood.slug}-emlak-yatirim-rehberi`,
    excerpt: `${neighborhood.name} Mahallesi'nde emlak yatırımı yapmayı düşünüyorsanız, bu kapsamlı rehber size piyasa analizi, fiyat trendleri, yatırım fırsatları ve uzun vadeli getiri potansiyeli hakkında detaylı bilgi sunar.`,
    meta_description: `${neighborhood.name} Mahallesi emlak yatırım rehberi. Piyasa analizi, fiyat trendleri, kira getirisi, yatırım fırsatları ve uzun vadeli değer artışı hakkında kapsamlı bilgi.`,
    keywords: [
      `${neighborhood.name.toLowerCase()} mahallesi emlak`,
      `${neighborhood.name.toLowerCase()} mahallesi yatırım`,
      `karasu ${neighborhood.name.toLowerCase()} mahallesi`,
      `${neighborhood.name.toLowerCase()} mahallesi satılık`,
      `${neighborhood.name.toLowerCase()} mahallesi kiralık`,
      'karasu emlak yatırım',
      'sakarya emlak yatırım',
      `${neighborhood.name.toLowerCase()} mahallesi fiyatları`,
      `${neighborhood.name.toLowerCase()} mahallesi kira getirisi`,
      'karasu yatırım rehberi'
    ],
    category: 'yatirim-rehberi',
    tags: ['yatırım', 'mahalle rehberi', 'karasu', neighborhood.name.toLowerCase() + ' mahallesi', 'emlak analizi'],
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
  console.log('🚀 Creating neighborhood investment guide blog posts...\n');

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
  console.log(`\n✨ Done!`);
}

main().catch(console.error);
