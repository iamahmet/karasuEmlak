/**
 * Script to create Karasu-focused blog posts
 * Run with: pnpm tsx scripts/create-karasu-blog-posts.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
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
    title: "Karasu'da Emlak Yatırımı Yapmak: 2025 Rehberi",
    slug: "karasu-emlak-yatirim-2025-rehberi",
    excerpt: "Karasu'da emlak yatırımı yapmayı düşünüyorsanız, bu kapsamlı rehber size yol gösterecek. Fiyat trendleri, en iyi bölgeler ve yatırım fırsatları hakkında bilmeniz gerekenler.",
    content: `<h2>Karasu'da Emlak Yatırımı: Neden Karasu?</h2>
<p>Karasu, Sakarya'nın en popüler sahil ilçelerinden biri olarak, emlak yatırımcıları için cazip fırsatlar sunuyor. Denize sıfır konumu, gelişen altyapısı ve artan turizm potansiyeli ile Karasu, hem yazlık hem de kalıcı yaşam için ideal bir bölge.</p>

<h2>2025 Yılı Fiyat Trendleri</h2>
<p>Karasu emlak piyasası 2025 yılında istikrarlı bir büyüme gösteriyor. Denize yakın bölgelerdeki daire fiyatları ortalama 2.5-4 milyon TL arasında değişirken, villa fiyatları 5-15 milyon TL aralığında seyrediyor. Kiralık evler için aylık kira bedelleri 8.000-25.000 TL arasında değişmektedir.</p>

<h2>En İyi Yatırım Bölgeleri</h2>
<ul>
<li><strong>Merkez Mahalle:</strong> Şehir merkezine yakınlığı ve alışveriş imkanlarıyla öne çıkıyor.</li>
<li><strong>Sahil Bölgesi:</strong> Denize sıfır konumu ve turizm potansiyeli yüksek.</li>
<li><strong>Yeni Gelişen Bölgeler:</strong> Altyapı yatırımlarıyla hızla gelişen bölgeler.</li>
</ul>

<h2>Yatırım Yaparken Dikkat Edilmesi Gerekenler</h2>
<p>Karasu'da emlak yatırımı yaparken dikkat edilmesi gereken önemli noktalar:</p>
<ul>
<li>Tapu durumu ve yasal izinlerin kontrolü</li>
<li>Bölgenin altyapı durumu (su, elektrik, kanalizasyon)</li>
<li>Ulaşım imkanları ve merkeze mesafe</li>
<li>Çevresel faktörler ve deniz manzarası</li>
<li>Gelecek projeler ve bölge planlaması</li>
</ul>

<h2>Sonuç</h2>
<p>Karasu, emlak yatırımcıları için hem kısa hem de uzun vadede karlı fırsatlar sunuyor. Doğru bölge ve özelliklerdeki bir gayrimenkul, hem gelir getirici hem de değer artışı sağlayıcı bir yatırım olabilir.</p>`,
    meta_description: "Karasu'da emlak yatırımı yapmak için kapsamlı rehber. 2025 fiyat trendleri, en iyi bölgeler ve yatırım fırsatları hakkında bilmeniz gerekenler.",
    keywords: ["karasu emlak", "karasu yatırım", "karasu satılık ev", "karasu kiralık ev", "emlak yatırımı"],
    category: "yatirim",
    tags: ["yatırım", "emlak", "karasu", "rehber"]
  },
  {
    title: "Karasu Mahalleleri: En Popüler Bölgeler ve Özellikleri",
    slug: "karasu-mahalleleri-populer-bolgeler",
    excerpt: "Karasu'nun en popüler mahallelerini keşfedin. Her mahallenin özellikleri, fiyat aralıkları ve yaşam kalitesi hakkında detaylı bilgiler.",
    content: `<h2>Karasu Mahalleleri Genel Bakış</h2>
<p>Karasu, çeşitli mahalleleriyle farklı yaşam tarzlarına hitap eden bir ilçe. Her mahalle kendine özgü özellikleriyle öne çıkıyor.</p>

<h2>Merkez Mahalle</h2>
<p>Karasu'nun kalbi olan Merkez Mahalle, şehir merkezine yakınlığı ve alışveriş imkanlarıyla tercih ediliyor. Burada hem daire hem de villa seçenekleri bulunuyor.</p>
<ul>
<li>Şehir merkezine yakınlık</li>
<li>Gelişmiş alışveriş merkezleri</li>
<li>Toplu taşıma imkanları</li>
<li>Fiyat aralığı: 2-5 milyon TL</li>
</ul>

<h2>Sahil Bölgesi</h2>
<p>Denize sıfır konumuyla öne çıkan Sahil Bölgesi, yazlık ve tatil amaçlı yatırımlar için ideal. Deniz manzaralı evler ve villalar burada bulunuyor.</p>
<ul>
<li>Denize sıfır konum</li>
<li>Turizm potansiyeli</li>
<li>Yazlık ve tatil amaçlı kullanım</li>
<li>Fiyat aralığı: 4-15 milyon TL</li>
</ul>

<h2>Yeni Gelişen Bölgeler</h2>
<p>Altyapı yatırımlarıyla hızla gelişen yeni bölgeler, modern konut projeleri ve uygun fiyatlı seçenekler sunuyor.</p>
<ul>
<li>Modern konut projeleri</li>
<li>Uygun fiyatlı seçenekler</li>
<li>Gelişen altyapı</li>
<li>Fiyat aralığı: 1.5-3 milyon TL</li>
</ul>

<h2>Mahalle Seçerken Dikkat Edilmesi Gerekenler</h2>
<p>Karasu'da mahalle seçerken şu faktörleri göz önünde bulundurmalısınız:</p>
<ul>
<li>Yaşam tarzınıza uygunluk</li>
<li>Bütçenize uygun fiyat aralığı</li>
<li>Ulaşım imkanları</li>
<li>Çevresel faktörler</li>
<li>Gelecek projeler</li>
</ul>`,
    meta_description: "Karasu'nun en popüler mahallelerini keşfedin. Merkez, Sahil ve yeni gelişen bölgeler hakkında detaylı bilgiler.",
    keywords: ["karasu mahalleleri", "karasu bölgeler", "karasu merkez", "karasu sahil"],
    category: "rehber",
    tags: ["mahalle", "bölge", "karasu", "rehber"]
  },
  {
    title: "Yazlık Ev Alırken Dikkat Edilmesi Gerekenler: Karasu Özelinde",
    slug: "yazlik-ev-alirken-dikkat-edilmesi-gerekenler-karasu",
    excerpt: "Karasu'da yazlık ev almak istiyorsanız, bu rehber size yardımcı olacak. Dikkat edilmesi gereken önemli noktalar ve öneriler.",
    content: `<h2>Yazlık Ev Alırken Genel Kriterler</h2>
<p>Yazlık ev almak, hem tatil hem de yatırım amaçlı olabilir. Karasu gibi sahil bölgelerinde yazlık ev alırken dikkat edilmesi gereken önemli noktalar var.</p>

<h2>Konum ve Ulaşım</h2>
<p>Yazlık ev için konum çok önemlidir. Denize yakınlık, şehir merkezine mesafe ve ulaşım imkanları değerlendirilmelidir.</p>
<ul>
<li>Denize mesafe (yürüme mesafesi ideal)</li>
<li>Şehir merkezine ulaşım kolaylığı</li>
<li>Havaalanı ve otobüs terminali mesafesi</li>
<li>Çevresel gürültü ve kalabalık</li>
</ul>

<h2>Bina ve Yapı Özellikleri</h2>
<p>Yazlık evlerde bina özellikleri ve yapı kalitesi önemlidir. Deniz iklimine dayanıklılık ve bakım kolaylığı göz önünde bulundurulmalıdır.</p>
<ul>
<li>Nem ve deniz tuzuna dayanıklılık</li>
<li>Isıtma ve soğutma sistemleri</li>
<li>Su ve elektrik altyapısı</li>
<li>Güvenlik önlemleri</li>
</ul>

<h2>Yasal Durum ve Tapu</h2>
<p>Yazlık ev alırken yasal durumun kontrolü kritik öneme sahiptir.</p>
<ul>
<li>Tapu durumu ve mülkiyet</li>
<li>İmar durumu ve yapı ruhsatı</li>
<li>Yasal izinler ve belgeler</li>
<li>Vergi durumu</li>
</ul>

<h2>Bakım ve İşletme Maliyetleri</h2>
<p>Yazlık evlerin bakım ve işletme maliyetleri değerlendirilmelidir.</p>
<ul>
<li>Aylık bakım maliyetleri</li>
<li>Sigorta giderleri</li>
<li>Vergi yükümlülükleri</li>
<li>Kira geliri potansiyeli</li>
</ul>

<h2>Karasu'da Yazlık Ev Fiyatları</h2>
<p>Karasu'da yazlık ev fiyatları konum ve özelliklere göre değişiyor:</p>
<ul>
<li>Denize yakın daireler: 2.5-5 milyon TL</li>
<li>Denize yakın villalar: 6-20 milyon TL</li>
<li>Merkeze yakın yazlıklar: 1.5-3 milyon TL</li>
</ul>

<h2>Sonuç</h2>
<p>Karasu'da yazlık ev almak, hem tatil hem de yatırım amaçlı olabilir. Doğru konum ve özelliklerdeki bir yazlık ev, uzun vadede değer artışı sağlayabilir.</p>`,
    meta_description: "Karasu'da yazlık ev alırken dikkat edilmesi gerekenler. Konum, yapı özellikleri, yasal durum ve fiyatlar hakkında bilgiler.",
    keywords: ["yazlık ev", "karasu yazlık", "tatil evi", "sahil evi", "yazlık villa"],
    category: "rehber",
    tags: ["yazlık", "tatil", "rehber", "karasu"]
  },
  {
    title: "Karasu'da Kiralık Ev Bulma Rehberi: 2025",
    slug: "karasu-kiralik-ev-bulma-rehberi-2025",
    excerpt: "Karasu'da kiralık ev arıyorsanız, bu rehber size yardımcı olacak. En iyi bölgeler, fiyat aralıkları ve ipuçları.",
    content: `<h2>Karasu'da Kiralık Ev Arama Süreci</h2>
<p>Karasu'da kiralık ev bulmak için sistematik bir yaklaşım izlemek önemlidir. Bu rehber size süreçte yardımcı olacak.</p>

<h2>2025 Kira Fiyatları</h2>
<p>Karasu'da kiralık ev fiyatları bölge ve özelliklere göre değişiyor:</p>
<ul>
<li><strong>Merkez Mahalle:</strong> 10.000-20.000 TL/ay</li>
<li><strong>Sahil Bölgesi:</strong> 15.000-30.000 TL/ay</li>
<li><strong>Yeni Gelişen Bölgeler:</strong> 8.000-15.000 TL/ay</li>
</ul>

<h2>En İyi Kiralık Ev Bölgeleri</h2>
<h3>Merkez Mahalle</h3>
<p>Şehir merkezine yakınlığı ve alışveriş imkanlarıyla tercih ediliyor. Toplu taşıma erişimi kolay.</p>

<h3>Sahil Bölgesi</h3>
<p>Denize yakın konumuyla öne çıkıyor. Yaz aylarında özellikle popüler.</p>

<h3>Yeni Gelişen Bölgeler</h3>
<p>Modern konut projeleri ve uygun fiyatlı seçenekler sunuyor.</p>

<h2>Kiralık Ev Ararken Dikkat Edilmesi Gerekenler</h2>
<ul>
<li>Bütçenize uygun fiyat aralığı</li>
<li>İhtiyaçlarınıza uygun özellikler (oda sayısı, banyo, balkon)</li>
<li>Ulaşım imkanları ve merkeze mesafe</li>
<li>Çevresel faktörler (gürültü, güvenlik)</li>
<li>Kira sözleşmesi şartları</li>
</ul>

<h2>Kira Sözleşmesi İpuçları</h2>
<p>Kiralık ev sözleşmesi yaparken dikkat edilmesi gerekenler:</p>
<ul>
<li>Sözleşme süresi ve yenileme şartları</li>
<li>Depozito ve kira artış oranları</li>
<li>Bakım ve onarım sorumlulukları</li>
<li>Fesih şartları</li>
</ul>

<h2>Sonuç</h2>
<p>Karasu'da kiralık ev bulmak için doğru bölge ve özelliklerdeki evleri araştırmak önemlidir. Bu rehber size süreçte yardımcı olacaktır.</p>`,
    meta_description: "Karasu'da kiralık ev bulma rehberi. 2025 fiyatları, en iyi bölgeler ve kira sözleşmesi ipuçları.",
    keywords: ["karasu kiralık", "karasu kira", "karasu kiralık ev", "karasu kiralık daire"],
    category: "rehber",
    tags: ["kiralık", "kira", "rehber", "karasu"]
  },
  {
    title: "Emlak Alım-Satım Süreçleri: Karasu'da Ev Almak",
    slug: "emlak-alim-satim-surecleri-karasu",
    excerpt: "Karasu'da ev almak veya satmak istiyorsanız, bu rehber size süreçte yardımcı olacak. Yasal süreçler, belgeler ve ipuçları.",
    content: `<h2>Emlak Alım-Satım Süreci Genel Bakış</h2>
<p>Emlak alım-satım süreci, dikkatli planlama ve yasal süreçlerin takibi gerektirir. Bu rehber size Karasu'da ev alırken veya satarken yardımcı olacak.</p>

<h2>Ev Almak İçin Gerekli Belgeler</h2>
<ul>
<li>Kimlik belgesi (nüfus cüzdanı veya kimlik kartı)</li>
<li>Gelir belgesi (maaş bordrosu, vergi levhası)</li>
<li>Kredi onay belgesi (kredi kullanılacaksa)</li>
<li>Nüfus kayıt örneği</li>
<li>Vergi numarası belgesi</li>
</ul>

<h2>Tapu İşlemleri</h2>
<p>Tapu işlemleri emlak alım-satım sürecinin en önemli aşamasıdır.</p>
<ul>
<li>Tapu durumu kontrolü</li>
<li>İpotek ve haciz durumu</li>
<li>Tapu devir işlemleri</li>
<li>Tapu harç ve masrafları</li>
</ul>

<h2>Kredi Süreci</h2>
<p>Emlak kredisi kullanılacaksa, süreç şu adımları içerir:</p>
<ul>
<li>Kredi başvurusu ve ön onay</li>
<li>Gayrimenkul değerleme</li>
<li>Kredi onayı ve sözleşme</li>
<li>Kredi kullanımı ve ödeme planı</li>
</ul>

<h2>Vergi ve Harçlar</h2>
<p>Emlak alım-satım sürecinde çeşitli vergi ve harçlar ödenir:</p>
<ul>
<li>Tapu harç ve masrafları</li>
<li>Emlak vergisi</li>
<li>Gelir vergisi (satış durumunda)</li>
<li>Noter masrafları</li>
</ul>

<h2>Emlak Danışmanı Seçimi</h2>
<p>Profesyonel bir emlak danışmanı, süreçte size yardımcı olabilir:</p>
<ul>
<li>Piyasa bilgisi ve fiyat analizi</li>
<li>Yasal süreçlerin takibi</li>
<li>Müzakere ve anlaşma süreçleri</li>
<li>Belge ve işlem takibi</li>
</ul>

<h2>Sonuç</h2>
<p>Karasu'da ev almak veya satmak için doğru bilgi ve profesyonel destek önemlidir. Bu rehber size süreçte yardımcı olacaktır.</p>`,
    meta_description: "Karasu'da emlak alım-satım süreçleri. Gerekli belgeler, tapu işlemleri, kredi süreci ve vergiler hakkında bilgiler.",
    keywords: ["emlak alım satım", "ev almak", "ev satmak", "tapu işlemleri", "emlak kredisi"],
    category: "rehber",
    tags: ["alım-satım", "rehber", "yasal süreçler"]
  }
];

async function createBlogPosts() {
  console.log('🚀 Creating Karasu blog posts...\n');

  for (const post of blogPosts) {
    try {
      // Check if article already exists
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', post.slug)
        .maybeSingle();

      if (existing) {
        console.log(`⏭️  Skipping "${post.title}" - already exists`);
        continue;
      }

      // Create article - check if table uses is_published or status
      const articleData: any = {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        meta_description: post.meta_description,
        seo_keywords: post.keywords.join(', '),
        author: 'Karasu Emlak',
        views: 0,
        published_at: new Date().toISOString(),
      };

      // Try both is_published and status fields
      try {
        const { data, error } = await supabase
          .from('articles')
          .insert({
            ...articleData,
            is_published: true,
            category_slug: post.category,
          })
          .select()
          .single();

        if (error && error.message.includes('column') && error.message.includes('is_published')) {
          // Try with status field instead
          const { data: data2, error: error2 } = await supabase
            .from('articles')
            .insert({
              ...articleData,
              status: 'published',
              category: post.category,
              tags: post.tags,
            })
            .select()
            .single();

          if (error2) {
            throw error2;
          }
          console.log(`✅ Created: "${post.title}"`);
        } else if (error) {
          throw error;
        } else {
          console.log(`✅ Created: "${post.title}"`);
        }
      } catch (insertError: any) {
        // Fallback: try with status field
        const { data, error } = await supabase
          .from('articles')
          .insert({
            ...articleData,
            status: 'published',
            category: post.category,
            tags: post.tags,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }
        console.log(`✅ Created: "${post.title}"`);
      }

      if (error) {
        console.error(`❌ Error creating "${post.title}":`, error.message);
        continue;
      }

      console.log(`✅ Created: "${post.title}"`);
    } catch (error: any) {
      console.error(`❌ Error creating "${post.title}":`, error.message);
    }
  }

  console.log('\n✨ Blog posts creation completed!');
}

createBlogPosts().catch(console.error);

