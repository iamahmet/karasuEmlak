/**
 * Script to create investment guide blog posts
 * Run with: pnpm tsx scripts/create-investment-guide-blog-posts.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from multiple possible locations
const envPaths = [
  resolve(__dirname, '../.env.local'),
  resolve(__dirname, '../../.env.local'),
  resolve(process.cwd(), '.env.local'),
];

for (const envPath of envPaths) {
  try {
    dotenv.config({ path: envPath });
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      break; // Found valid env file
    }
  } catch {
    // Continue to next path
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

const blogPosts: BlogPost[] = [
  {
    title: 'Karasu\'da Emlak Yatırımı Yapmak: 2025 Rehberi ve Stratejileri',
    slug: 'karasu-emlak-yatirim-2025-rehberi',
    excerpt: 'Karasu\'da emlak yatırımı yapmayı düşünüyorsanız, bu kapsamlı rehber size yol gösterecek. Fiyat trendleri, en iyi bölgeler, yatırım fırsatları ve stratejiler hakkında bilmeniz gerekenler.',
    meta_description: 'Karasu\'da emlak yatırımı yapmak için kapsamlı rehber. 2025 fiyat trendleri, en iyi bölgeler, yatırım fırsatları ve stratejiler hakkında detaylı bilgiler.',
    keywords: [
      'karasu emlak yatırım',
      'karasu yatırım rehberi',
      'karasu satılık ev',
      'karasu yatırım fırsatları',
      'karasu emlak fiyatları',
      'karasu yatırım stratejileri',
      'sakarya emlak yatırım',
      'karasu yazlık yatırım',
    ],
    category: 'Yatırım',
    tags: ['yatırım', 'emlak', 'karasu', 'rehber', 'strateji'],
    content: `<h2>Karasu'da Emlak Yatırımı: Neden Karasu?</h2>
<p>Karasu, Sakarya'nın en popüler sahil ilçelerinden biri olarak, emlak yatırımcıları için cazip fırsatlar sunuyor. Denize sıfır konumu, gelişen altyapısı ve artan turizm potansiyeli ile Karasu, hem yazlık hem de kalıcı yaşam için ideal bir bölge.</p>

<h3>Karasu'nun Yatırım Avantajları</h3>
<ul>
<li><strong>Denize Yakın Konum:</strong> Karasu'nun denize sıfır konumu, yazlık kiralama ve turizm geliri potansiyeli sunar</li>
<li><strong>Gelişen Altyapı:</strong> Ulaşım, sağlık ve eğitim altyapısı sürekli gelişmektedir</li>
<li><strong>Turizm Potansiyeli:</strong> Artan turist sayısı emlak değerlerini desteklemektedir</li>
<li><strong>Uygun Fiyatlar:</strong> İstanbul ve diğer büyük şehirlere göre daha uygun fiyatlar</li>
<li><strong>Doğal Güzellikler:</strong> Deniz, orman ve doğal güzellikler yaşam kalitesini artırır</li>
</ul>

<h2>2025 Yılı Fiyat Trendleri</h2>
<p>Karasu emlak piyasası 2025 yılında istikrarlı bir büyüme gösteriyor. Denize yakın bölgelerdeki daire fiyatları ortalama 2.5-4 milyon TL arasında değişirken, villa fiyatları 5-15 milyon TL aralığında seyrediyor. Kiralık evler için aylık kira bedelleri 8.000-25.000 TL arasında değişmektedir.</p>

<h3>Fiyat Trendleri Analizi</h3>
<ul>
<li><strong>Daire Fiyatları:</strong> 2.5-4 milyon TL (merkez), 3-5 milyon TL (denize yakın)</li>
<li><strong>Villa Fiyatları:</strong> 5-15 milyon TL (denize yakın villalar daha yüksek)</li>
<li><strong>Arsa Fiyatları:</strong> 500-2.000 TL/m² (lokasyona göre değişir)</li>
<li><strong>Kira Bedelleri:</strong> 8.000-25.000 TL/ay (daire), 15.000-50.000 TL/ay (villa)</li>
</ul>

<h2>En İyi Yatırım Bölgeleri</h2>
<p>Karasu'da yatırım yaparken lokasyon seçimi çok önemlidir. İşte en iyi yatırım bölgeleri:</p>

<h3>1. Merkez Mahalle</h3>
<p>Şehir merkezine yakınlığı ve alışveriş imkanlarıyla öne çıkıyor. Uzun vadeli kiralama geliri için ideal.</p>
<ul>
<li>Ulaşım kolaylığı</li>
<li>Alışveriş merkezleri</li>
<li>Eğitim kurumları</li>
<li>Fiyat aralığı: 2-5 milyon TL</li>
</ul>

<h3>2. Sahil Bölgesi</h3>
<p>Denize sıfır konumu ve turizm potansiyeli yüksek. Yazlık kiralama için mükemmel.</p>
<ul>
<li>Denize sıfır konum</li>
<li>Yüksek turizm potansiyeli</li>
<li>Yazlık kiralama geliri</li>
<li>Fiyat aralığı: 4-15 milyon TL</li>
</ul>

<h3>3. Yeni Gelişen Bölgeler</h3>
<p>Altyapı yatırımlarıyla hızla gelişen bölgeler. Uzun vadeli değer artışı potansiyeli.</p>
<ul>
<li>Modern konut projeleri</li>
<li>Uygun fiyatlı seçenekler</li>
<li>Gelişen altyapı</li>
<li>Fiyat aralığı: 1.5-3 milyon TL</li>
</ul>

<h2>Yatırım Stratejileri</h2>

<h3>1. Kısa Vadeli Yatırım (Flipping)</h3>
<p>Eski veya bakımsız emlakları alıp yenileyerek satmak. Hızlı kar marjı sağlar ancak risklidir.</p>
<ul>
<li>Bakımsız emlakları tespit edin</li>
<li>Yenileme maliyetlerini hesaplayın</li>
<li>Piyasa fırsatlarını takip edin</li>
<li>Hızlı satış stratejisi geliştirin</li>
</ul>

<h3>2. Uzun Vadeli Yatırım (Kira Geliri)</h3>
<p>Emlakı alıp uzun vadeli kiralama geliri elde etmek. İstikrarlı ve sürdürülebilir gelir sağlar.</p>
<ul>
<li>Kira geliri odaklı emlak seçin</li>
<li>Uzun vadeli kiracı bulun</li>
<li>Bakım ve onarım planı yapın</li>
<li>Nakit akışını takip edin</li>
</ul>

<h3>3. Yazlık Yatırım</h3>
<p>Yaz aylarında yüksek kiralama geliri elde etmek. Sezonsal gelir modeli.</p>
<ul>
<li>Denize yakın konumlar seçin</li>
<li>Yazlık kiralama potansiyelini değerlendirin</li>
<li>Turizm sezonunu takip edin</li>
<li>Kış ayları için alternatif plan yapın</li>
</ul>

<h2>Yatırım Yaparken Dikkat Edilmesi Gerekenler</h2>
<p>Karasu'da emlak yatırımı yaparken dikkat edilmesi gereken önemli noktalar:</p>

<h3>Yasal Kontroller</h3>
<ul>
<li>Tapu durumu ve yasal izinlerin kontrolü</li>
<li>İpotek ve haciz durumu</li>
<li>Yapı ruhsatı ve iskan durumu</li>
<li>Komşu hakları</li>
</ul>

<h3>Fiziksel Kontroller</h3>
<ul>
<li>Bölgenin altyapı durumu (su, elektrik, kanalizasyon)</li>
<li>Bina yaşı ve durumu</li>
<li>Deprem riski</li>
<li>Çevresel faktörler</li>
</ul>

<h3>Finansal Kontroller</h3>
<ul>
<li>Ulaşım imkanları ve merkeze mesafe</li>
<li>Gelecek projeler ve bölge planlaması</li>
<li>Vergi yükümlülükleri</li>
<li>Bakım ve onarım maliyetleri</li>
</ul>

<h2>Getiri Hesaplama</h2>
<p>Yatırım getirisi hesaplarken şu faktörleri göz önünde bulundurun:</p>

<h3>ROI Hesaplama</h3>
<p>ROI = (Yıllık Net Gelir / Yatırım Tutarı) × 100</p>
<p>Örnek: 3 milyon TL'ye aldığınız bir emlak yılda 216.000 TL net gelir getiriyorsa:</p>
<p>ROI = (216.000 / 3.000.000) × 100 = %7.2</p>

<h3>Geri Dönüş Süresi</h3>
<p>Geri Dönüş Süresi = Yatırım Tutarı / Yıllık Net Gelir</p>
<p>Örnek: 2 milyon TL yatırım, 120.000 TL yıllık gelir</p>
<p>Geri Dönüş Süresi = 2.000.000 / 120.000 = 16.7 yıl</p>

<h2>Risk Yönetimi</h2>
<p>Yatırım yaparken riskleri yönetmek çok önemlidir:</p>

<ul>
<li><strong>Piyasa Dalgalanmaları:</strong> Piyasa trendlerini takip edin</li>
<li><strong>Boş Kalma Riski:</strong> Alternatif kullanım planları yapın</li>
<li><strong>Bakım Maliyetleri:</strong> Yıllık bakım bütçesi ayırın</li>
<li><strong>Yasal Değişiklikler:</strong> Yasal düzenlemeleri takip edin</li>
<li><strong>Bölgesel Riskler:</strong> Bölge analizi yapın</li>
</ul>

<h2>Sonuç</h2>
<p>Karasu, emlak yatırımcıları için hem kısa hem de uzun vadede karlı fırsatlar sunuyor. Doğru bölge ve özelliklerdeki bir gayrimenkul, hem gelir getirici hem de değer artışı sağlayıcı bir yatırım olabilir. Yatırım kararı vermeden önce mutlaka profesyonel danışmanlık alın ve detaylı analiz yapın.</p>

<p>Yatırım hesaplama araçlarımızı kullanarak ROI ve getiri analizi yapabilir, <a href="/yatirim/piyasa-analizi">piyasa analizi</a> sayfamızdan güncel trendleri takip edebilirsiniz.</p>`,
  },
  {
    title: 'Emlak Yatırımında ROI Hesaplama: Kapsamlı Rehber ve Örnekler',
    slug: 'emlak-yatiriminda-roi-hesaplama-rehberi',
    excerpt: 'Emlak yatırımında ROI (Return on Investment) nasıl hesaplanır? Kira getirisi, geri dönüş süresi ve yatırım analizi hakkında kapsamlı rehber. Pratik örnekler ve hesaplama yöntemleri.',
    meta_description: 'Emlak yatırımında ROI hesaplama rehberi. Kira getirisi, geri dönüş süresi ve yatırım analizi hakkında detaylı bilgiler, pratik örnekler ve hesaplama yöntemleri.',
    keywords: [
      'roi hesaplama',
      'emlak yatırım roi',
      'kira getirisi hesaplama',
      'yatırım getiri analizi',
      'geri dönüş süresi',
      'emlak yatırım analizi',
      'roi rehberi',
      'yatırım hesaplama',
    ],
    category: 'Yatırım',
    tags: ['roi', 'yatırım', 'hesaplama', 'analiz', 'rehber'],
    content: `<h2>ROI Nedir?</h2>
<p>ROI (Return on Investment - Yatırım Getirisi), yatırımınızdan elde ettiğiniz getirinin yatırım tutarına oranıdır. Emlak yatırımlarında ROI, kira geliri ve değer artışı gibi faktörleri içerir.</p>

<h2>ROI Hesaplama Yöntemleri</h2>

<h3>1. Basit ROI Hesaplama</h3>
<p>En basit ROI hesaplama yöntemi:</p>
<p><strong>ROI = (Yıllık Net Gelir / Yatırım Tutarı) × 100</strong></p>

<h4>Örnek Hesaplama:</h4>
<ul>
<li>Yatırım Tutarı: 3.000.000 TL</li>
<li>Yıllık Kira Geliri: 240.000 TL</li>
<li>Yıllık Giderler: 24.000 TL (aidat, sigorta, bakım)</li>
<li>Yıllık Net Gelir: 240.000 - 24.000 = 216.000 TL</li>
<li>ROI = (216.000 / 3.000.000) × 100 = %7.2</li>
</ul>

<h3>2. Değer Artışı Dahil ROI</h3>
<p>Değer artışını da hesaba katan ROI hesaplama:</p>
<p><strong>ROI = [(Yıllık Net Gelir + Değer Artışı) / Yatırım Tutarı] × 100</strong></p>

<h4>Örnek Hesaplama:</h4>
<ul>
<li>Yatırım Tutarı: 3.000.000 TL</li>
<li>Yıllık Net Gelir: 216.000 TL</li>
<li>Yıllık Değer Artışı (%5): 150.000 TL</li>
<li>Toplam Getiri: 216.000 + 150.000 = 366.000 TL</li>
<li>ROI = (366.000 / 3.000.000) × 100 = %12.2</li>
</ul>

<h2>Kira Getirisi Hesaplama</h2>
<p>Kira getirisi, yıllık kira gelirinin emlak değerine oranıdır:</p>
<p><strong>Kira Getirisi = (Yıllık Kira Geliri / Emlak Değeri) × 100</strong></p>

<h3>Kira Getirisi Örnekleri</h3>
<ul>
<li><strong>Yazlık Konut:</strong> 2.500.000 TL değer, 180.000 TL yıllık kira = %7.2 getiri</li>
<li><strong>Merkez Daire:</strong> 3.000.000 TL değer, 216.000 TL yıllık kira = %7.2 getiri</li>
<li><strong>Denize Yakın Villa:</strong> 5.000.000 TL değer, 420.000 TL yıllık kira = %8.4 getiri</li>
</ul>

<h2>Geri Dönüş Süresi Hesaplama</h2>
<p>Geri dönüş süresi, yatırım tutarınızın ne kadar sürede geri döneceğini gösterir:</p>
<p><strong>Geri Dönüş Süresi = Yatırım Tutarı / Yıllık Net Gelir</strong></p>

<h3>Geri Dönüş Süresi Örnekleri</h3>
<ul>
<li>2.000.000 TL yatırım, 120.000 TL yıllık gelir = 16.7 yıl</li>
<li>3.000.000 TL yatırım, 216.000 TL yıllık gelir = 13.9 yıl</li>
<li>5.000.000 TL yatırım, 420.000 TL yıllık gelir = 11.9 yıl</li>
</ul>

<h2>ROI Hesaplarken Dikkat Edilmesi Gerekenler</h2>

<h3>1. Tüm Giderleri Hesaba Katın</h3>
<ul>
<li>Aidat ve yönetim giderleri</li>
<li>Sigorta maliyetleri</li>
<li>Bakım ve onarım giderleri</li>
<li>Vergi yükümlülükleri</li>
<li>Boş kalma riski</li>
</ul>

<h3>2. Değer Artışını Değerlendirin</h3>
<p>Uzun vadeli yatırımlarda değer artışı önemlidir. Bölgesel gelişim projeleri ve piyasa trendlerini takip edin.</p>

<h3>3. Finansman Maliyetlerini Hesaba Katın</h3>
<p>Kredi kullanıyorsanız, faiz maliyetlerini ROI hesaplamalarına dahil edin.</p>

<h2>İyi Bir ROI Oranı Nedir?</h2>
<p>Gayrimenkul yatırımları için genellikle:</p>
<ul>
<li><strong>%5-7:</strong> Düşük getiri, düşük risk</li>
<li><strong>%7-10:</strong> İyi getiri, orta risk</li>
<li><strong>%10+:</strong> Yüksek getiri, yüksek risk</li>
</ul>

<h2>ROI Hesaplama Örnekleri</h2>

<h3>Örnek 1: Yazlık Konut</h3>
<ul>
<li>Emlak Değeri: 2.500.000 TL</li>
<li>Aylık Kira: 15.000 TL</li>
<li>Yıllık Kira: 180.000 TL</li>
<li>Yıllık Giderler: 18.000 TL</li>
<li>Net Gelir: 162.000 TL</li>
<li>ROI: %6.5</li>
</ul>

<h3>Örnek 2: Merkez Daire</h3>
<ul>
<li>Emlak Değeri: 3.000.000 TL</li>
<li>Aylık Kira: 18.000 TL</li>
<li>Yıllık Kira: 216.000 TL</li>
<li>Yıllık Giderler: 24.000 TL</li>
<li>Net Gelir: 192.000 TL</li>
<li>ROI: %6.4</li>
</ul>

<h3>Örnek 3: Denize Yakın Villa</h3>
<ul>
<li>Emlak Değeri: 5.000.000 TL</li>
<li>Aylık Kira: 35.000 TL</li>
<li>Yıllık Kira: 420.000 TL</li>
<li>Yıllık Giderler: 42.000 TL</li>
<li>Net Gelir: 378.000 TL</li>
<li>ROI: %7.6</li>
</ul>

<h2>Sonuç</h2>
<p>ROI hesaplama, emlak yatırım kararlarınızı destekleyen önemli bir araçtır. Doğru hesaplama için tüm gelir ve giderleri hesaba katın, değer artışı potansiyelini değerlendirin ve risk faktörlerini göz önünde bulundurun.</p>

<p>Kendi ROI'nizi hesaplamak için <a href="/yatirim/roi-hesaplayici">ROI Hesaplayıcı</a> aracımızı kullanabilirsiniz.</p>`,
  },
];

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
  } catch (error) {
    console.error(`❌ Unexpected error for article "${article.title}":`, error);
    return false;
  }
}

async function createBlogPosts() {
  console.log('🚀 Starting investment guide blog posts creation...\n');

  let successCount = 0;
  let failCount = 0;

  for (const article of blogPosts) {
    const success = await insertArticle(article);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Successfully created/updated: ${successCount} articles`);
  console.log(`❌ Failed: ${failCount} articles`);
  console.log(`📝 Total: ${blogPosts.length} articles\n`);

  if (failCount === 0) {
    console.log('🎉 All blog posts created successfully!');
  } else {
    console.log('⚠️  Some articles failed to create. Please check the errors above.');
  }
}

// Run the script
createBlogPosts()
  .then(() => {
    console.log('\n✨ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
