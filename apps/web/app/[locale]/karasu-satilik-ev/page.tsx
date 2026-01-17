import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Home, Phone, MapPin, TrendingUp, DollarSign, Building2, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getListings, getNeighborhoods } from '@/lib/supabase/queries';
import { getHighPriorityQAEntries } from '@/lib/supabase/queries/qa';
import { getAIQuestionsForPage } from '@/lib/supabase/queries/ai-questions';
import { ListingCard } from '@/components/listings/ListingCard';
import { withTimeout } from '@/lib/utils/timeout';
import { generateSlug } from '@/lib/utils';
import dynamicImport from 'next/dynamic';
import { AIChecker } from '@/components/content/AIChecker';
import { AICheckerBadge } from '@/components/content/AICheckerBadge';
import { generatePageContentInfo } from '@/lib/content/ai-checker-helper';
import { EnhancedRelatedArticles } from '@/components/blog/EnhancedRelatedArticles';
import { getRelatedContent } from '@/lib/content/related-content';

// Performance: Revalidate every hour for ISR
export const revalidate = 3600; // 1 hour

const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/karasu-satilik-ev' : `/${locale}/karasu-satilik-ev`;
  
  return {
    title: 'Karasu Satılık Ev | Kapsamlı Rehber ve İlanlar | Karasu Emlak',
    description: 'Karasu\'da satılık ev arayanlar için kapsamlı rehber. Fiyat analizi, mahalle rehberi, yatırım tavsiyeleri ve güncel ilanlar. Uzman emlak danışmanlığı ile hayalinizdeki evi bulun.',
    keywords: [
      'karasu satılık ev',
      'karasu satılık evler',
      'karasu satılık konut',
      'karasu satılık müstakil ev',
      'karasu merkez satılık ev',
      'karasu denize yakın satılık ev',
      'karasu emlak',
      'karasu yatırım',
      'sakarya karasu satılık ev',
    ],
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': '/karasu-satilik-ev',
        'en': '/en/karasu-satilik-ev',
        'et': '/et/karasu-satilik-ev',
        'ru': '/ru/karasu-satilik-ev',
        'ar': '/ar/karasu-satilik-ev',
      },
    },
    openGraph: {
      title: 'Karasu Satılık Ev | Kapsamlı Rehber | Karasu Emlak',
      description: 'Karasu\'da satılık ev arayanlar için kapsamlı rehber. Fiyat analizi, mahalle rehberi ve yatırım tavsiyeleri.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Satılık Ev - Emlak İlanları ve Fiyatları',
        },
      ],
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Karasu Satılık Ev | Kapsamlı Rehber',
      description: 'Karasu\'da satılık ev arayanlar için kapsamlı rehber ve güncel ilanlar.',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Fetch Q&As from database (with fallback to static FAQs)
// Now uses both qa_entries and ai_questions
async function getKarasuFAQs() {
  const allFAQs: Array<{ question: string; answer: string }> = [];
  
  // First, try ai_questions (managed Q&A system)
  try {
    const aiQuestions = await withTimeout(
      getAIQuestionsForPage('karasu-satilik-ev', 'karasu', 'pillar'),
      2000,
      []
    );
    if (aiQuestions && aiQuestions.length > 0) {
      allFAQs.push(...aiQuestions.map(q => ({
        question: q.question,
        answer: q.answer,
      })));
    }
  } catch (error) {
    console.error('Error fetching AI questions:', error);
  }
  
  // Then, try qa_entries (legacy system)
  try {
    const qaEntries = await withTimeout(getHighPriorityQAEntries('karasu'), 2000, []);
    if (qaEntries && qaEntries.length > 0) {
      // Only add if not already in allFAQs (avoid duplicates)
      const existingQuestions = new Set(allFAQs.map(f => f.question.toLowerCase()));
      qaEntries.forEach(qa => {
        if (!existingQuestions.has(qa.question.toLowerCase())) {
          allFAQs.push({
            question: qa.question,
            answer: qa.answer,
          });
        }
      });
    }
  } catch (error) {
    console.error('Error fetching Q&A entries:', error);
  }
  
  if (allFAQs.length > 0) {
    return allFAQs.slice(0, 8); // Limit to 8 total
  }
  
  // Fallback to static FAQs
  return [
    {
      question: 'Karasu\'da satılık ev fiyatları nasıl?',
      answer: 'Karasu\'da satılık ev fiyatları konum, metrekare, oda sayısı, bina yaşı ve özelliklere göre değişmektedir. Denize yakın konumlar ve merkez mahalleler genellikle daha yüksek fiyatlara sahiptir. Ortalama fiyat aralığı 500.000 TL ile 3.000.000 TL arasında değişmektedir. Güncel fiyat bilgisi için ilanlarımıza göz atabilir veya bizimle iletişime geçebilirsiniz.',
    },
    {
      question: 'Karasu\'da hangi mahallelerde satılık ev bulunuyor?',
      answer: 'Karasu\'da Merkez, Sahil, Yalı Mahallesi, Liman Mahallesi, İnköy, Aziziye ve diğer mahallelerde satılık ev seçenekleri bulunmaktadır. Her mahallenin kendine özgü avantajları vardır. Denize yakın mahalleler yazlık ve yatırım amaçlı tercih edilirken, merkez mahalleler sürekli oturum için idealdir.',
    },
    {
      question: 'Karasu yatırım için uygun mu?',
      answer: 'Evet, Karasu yatırım potansiyeli yüksek bir bölgedir. Özellikle yazlık evler, denize yakın konumlar ve turizm potansiyeli yüksek alanlar yatırımcıların ilgisini çekmektedir. İstanbul\'a yakınlığı, gelişen altyapısı ve doğal güzellikleri ile uzun vadede değer kazanma potansiyeli yüksektir. Kiralama geliri de düşünüldüğünde, Karasu\'da satılık ev yatırımı mantıklı bir seçenektir.',
    },
    {
      question: 'Karasu\'da satılık ev alırken nelere dikkat edilmeli?',
      answer: 'Karasu\'da satılık ev alırken konum, fiyat, bina yaşı, yapı durumu, tapu durumu, denize yakınlık, ulaşım imkanları ve çevresel faktörler önemlidir. Özellikle yazlık ev alırken kış aylarında bakım ve güvenlik konuları göz önünde bulundurulmalıdır. Profesyonel emlak danışmanımız size tüm bu konularda yardımcı olacaktır.',
    },
    {
      question: 'Karasu\'da kredi ile ev alınabilir mi?',
      answer: 'Evet, Karasu\'da kredi ile ev alınabilir. Banka kredisi ve peşinat seçenekleri hakkında bilgi almak için bizimle iletişime geçebilirsiniz. Kredi kullanımı durumunda gerekli belgeler, kredi başvuru süreci ve onay koşulları hakkında detaylı bilgi verebiliriz. Genellikle ev değerinin %70-80\'i kadar kredi kullanılabilmektedir.',
    },
    {
      question: 'Karasu\'da satılık ev alım-satım süreci nasıl işler?',
      answer: 'Karasu\'da satılık ev alım-satım süreci genellikle şu adımları içerir: İlan inceleme ve görüntüleme, fiyat pazarlığı, sözleşme imzalama, kapora ödeme, tapu işlemleri, kalan ödeme ve teslim. Tüm süreçte emlak danışmanınız size rehberlik edecektir. Ortalama süre 2-4 hafta arasında değişmektedir.',
    },
    {
      question: 'Karasu\'da satılık ev alırken tapu durumu önemli mi?',
      answer: 'Evet, tapu durumu çok önemlidir. Kat irtifaklı, kat mülkiyetli, arsa tapulu gibi farklı tapu türleri vardır. Tapu durumu, kredi kullanımı, vergi hesaplamaları ve gelecekteki satış işlemlerini etkiler. Mutlaka tapu belgesi incelenmeli ve gerekirse tapu müdürlüğünden bilgi alınmalıdır.',
    },
  ];
}

export default async function KarasuSatilikEvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Fetch data with timeout
  const allListingsResult = await withTimeout(
    getListings({ status: 'satilik' }, { field: 'created_at', order: 'desc' }, 1000, 0),
    3000,
    { listings: [], total: 0 }
  );
  const neighborhoodsResult = await withTimeout(getNeighborhoods(), 3000, [] as string[]);
  
  const { listings: allListings = [] } = allListingsResult || {};
  const neighborhoods = neighborhoodsResult || [];

  // Fetch related articles for SEO and engagement
  const relatedArticles = await getRelatedContent({
    keywords: [
      'karasu',
      'ev',
      'satılık ev',
      'müstakil',
      'yatırım',
      'karasu emlak',
      'ev fiyatları',
      'mahalle',
    ],
    location: 'Karasu',
    category: 'Rehber',
    tags: ['Karasu', 'Ev', 'Yatırım', 'Emlak'],
    limit: 6,
  });
  
  // Filter Karasu listings
  const karasuListings = allListings.filter(listing => 
    listing.location_city?.toLowerCase().includes('karasu') ||
    listing.location_neighborhood?.toLowerCase().includes('karasu')
  );

  // Group by property type
  const propertiesByType = {
    ev: karasuListings.filter(l => l.property_type === 'ev'),
    daire: karasuListings.filter(l => l.property_type === 'daire'),
    villa: karasuListings.filter(l => l.property_type === 'villa'),
    yazlik: karasuListings.filter(l => l.property_type === 'yazlik'),
  };

  // Calculate average price (rough estimate)
  const prices = karasuListings
    .filter(l => l.price_amount && l.price_amount > 0)
    .map(l => l.price_amount!);
  const avgPrice = prices.length > 0 
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : null;

  // Fetch Q&As from database
  const faqs = await getKarasuFAQs();

  // Generate page content for AI checker
  const pageContentInfo = generatePageContentInfo('Karasu Satılık Ev', [
    { id: 'genel-bakis', title: 'Karasu\'da Satılık Ev Arayanlar İçin Genel Bakış', content: 'Karasu\'da satılık ev ilanları ve seçenekleri hakkında kapsamlı bilgi.' },
    { id: 'emlak-tiplerine-gore', title: 'Emlak Tiplerine Göre Seçenekler', content: 'Daire, villa, yazlık ve müstakil ev seçenekleri.' },
    { id: 'fiyat-analizi', title: 'Karasu Satılık Ev Fiyat Analizi', content: 'Fiyat trendleri ve piyasa analizi.' },
    { id: 'mahalleler', title: 'Mahallelere Göre Karasu Satılık Ev Seçenekleri', content: 'Popüler mahalleler ve özellikleri.' },
    { id: 'dikkat-edilmesi-gerekenler', title: 'Dikkat Edilmesi Gerekenler', content: 'Satılık ev alırken dikkat edilmesi gerekenler.' },
  ]);

  // Generate schemas
  const articleSchema = {
    ...generateArticleSchema({
      headline: 'Karasu Satılık Ev | Kapsamlı Rehber ve İlanlar',
      description: 'Karasu\'da satılık ev arayanlar için kapsamlı rehber. Fiyat analizi, mahalle rehberi, yatırım tavsiyeleri ve güncel ilanlar.',
      image: [`${siteConfig.url}/og-image.jpg`],
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      author: 'Karasu Emlak',
    }),
    // AI Overviews optimization
    mainEntity: {
      '@type': 'Question',
      name: 'Karasu\'da satılık ev nasıl bulunur?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Karasu\'da satılık ev arayanlar için geniş bir seçenek yelpazesi mevcuttur. Fiyatlar konum, metrekare ve özelliklere göre 500.000 TL ile 3.000.000 TL arasında değişmektedir. Denize yakın konumlar ve merkez mahalleler daha yüksek fiyatlara sahiptir. Hem sürekli oturum hem de yatırım amaçlı seçenekler bulunmaktadır.',
      },
    },
  };

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Karasu Satılık Ev', url: `${siteConfig.url}${basePath}/karasu-satilik-ev` },
    ],
    `${siteConfig.url}${basePath}/karasu-satilik-ev`
  );

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />
      
      {/* AI Checker Badge - Admin Only (Hidden from public) */}

      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Karasu Satılık Ev', href: `${basePath}/karasu-satilik-ev` },
        ]}
      />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                    {karasuListings.length}+ Aktif İlan
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Karasu Satılık Ev
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  Karasu'da satılık ev arayanlar için kapsamlı rehber. Fiyat analizi, mahalle rehberi, yatırım tavsiyeleri ve güncel ilanlar. 
                  Uzman emlak danışmanlığı ile hayalinizdeki evi bulun.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    <Link href={`${basePath}/satilik`}>
                      <Home className="w-5 h-5 mr-2" />
                      Tüm İlanları Görüntüle
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                    <Link href={`${basePath}/iletisim`}>
                      <Phone className="w-5 h-5 mr-2" />
                      İletişime Geçin
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8 bg-white border-b border-gray-200 -mt-4 relative z-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{karasuListings.length}</div>
                <div className="text-sm text-gray-600">Aktif İlan</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{neighborhoods.length}</div>
                <div className="text-sm text-gray-600">Mahalle</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {avgPrice ? `₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K` : 'Değişken'}
                </div>
                <div className="text-sm text-gray-600">Ortalama Fiyat</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-gray-600">Danışmanlık</div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* AI Checker - Admin Only (Hidden from public) */}

                {/* AI Overviews Optimized: Quick Answer */}
                <ScrollReveal direction="up" delay={0}>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>Karasu'da satılık ev</strong> arayanlar için geniş bir seçenek yelpazesi mevcuttur. 
                      Fiyatlar konum, metrekare ve özelliklere göre 500.000 TL ile 3.000.000 TL arasında değişmektedir. 
                      Denize yakın konumlar ve merkez mahalleler daha yüksek fiyatlara sahiptir. Hem sürekli oturum hem de 
                      yatırım amaçlı seçenekler bulunmaktadır. İstanbul'a yakınlık, turizm potansiyeli ve gelişen altyapı, 
                      Karasu'yu cazip bir emlak bölgesi haline getirmektedir.
                    </p>
                  </div>
                </ScrollReveal>

                {/* Introduction */}
                <ScrollReveal direction="up" delay={100}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Karasu'da Satılık Ev Arayanlar İçin Genel Bakış
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu, Sakarya'nın en gözde sahil ilçelerinden biri olup, satılık ev piyasasında çeşitli seçenekler sunmaktadır. 
                        Denize yakın konumu, yazlık evleri, modern yaşam alanları ve gelişen altyapısı ile Karasu emlak piyasası zengin bir yelpazeye sahiptir.
                      </p>
                      <p>
                        Karasu'da satılık ev arayanlar için hem sürekli oturum hem de yatırım amaçlı seçenekler bulunmaktadır. 
                        Özellikle İstanbul'a yakınlığı, doğal güzellikleri ve turizm potansiyeli ile Karasu, emlak yatırımcılarının 
                        ilgisini çeken bir bölgedir.
                      </p>
                      <p>
                        Bu rehber, Karasu'da satılık ev almayı düşünenler için fiyat analizi, mahalle rehberi, yatırım tavsiyeleri 
                        ve dikkat edilmesi gerekenler hakkında kapsamlı bilgi sunmaktadır.
                      </p>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Price Factors */}
                <ScrollReveal direction="up" delay={200}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Karasu'da Ev Fiyatlarını Etkileyen Faktörler Nelerdir?
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da satılık ev fiyatları birçok faktöre bağlı olarak değişmektedir. Bu faktörleri anlamak, 
                        doğru karar vermenize yardımcı olacaktır.
                      </p>
                      
                      <div className="space-y-4 mt-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            Konum ve Denize Yakınlık
                          </h3>
                          <p>
                            Denize yakın konumlar genellikle daha yüksek fiyatlara sahiptir. Özellikle denize sıfır veya 
                            deniz manzaralı evler, yatırımcılar ve yazlık arayanlar için cazip olduğundan fiyatları daha yüksektir. 
                            Merkez mahalleler de ulaşım kolaylığı ve altyapı avantajları nedeniyle tercih edilmektedir.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Ev Tipi ve Özellikler
                          </h3>
                          <p>
                            Müstakil evler, daireler, villalar ve yazlık evler farklı fiyat aralıklarında bulunmaktadır. 
                            Oda sayısı, metrekare, bina yaşı, asansör, otopark, balkon, deniz manzarası gibi özellikler 
                            fiyatı etkileyen önemli faktörlerdir.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Piyasa Koşulları
                          </h3>
                          <p>
                            Emlak piyasası genel ekonomik koşullardan, faiz oranlarından ve bölgesel gelişmelerden etkilenir. 
                            Karasu'da yeni projeler, altyapı yatırımları ve turizm gelişmeleri fiyatları etkileyebilir.
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Property Types */}
                <ScrollReveal direction="up" delay={400}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Karasu'da Hangi Ev Türleri Satılık? Müstakil, Apartman, Yazlık ve Daha Fazlası
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da satılık ev seçenekleri geniş bir yelpazede sunulmaktadır. Her ev tipinin kendine özgü 
                        avantajları ve kullanım alanları vardır.
                      </p>

                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="border rounded-lg p-6 bg-gray-50">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Müstakil Evler</h3>
                          <p className="text-gray-700 mb-3">
                            Bahçeli, özel alanı olan müstakil evler aileler için idealdir. Genellikle 3+1, 4+1 gibi geniş 
                            yaşam alanlarına sahiptir.
                          </p>
                          <div className="text-sm text-gray-600">
                            <strong>Popüler Mahalleler:</strong> Merkez, Aziziye, İnköy
                          </div>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Apartman Daireleri</h3>
                          <p className="text-gray-700 mb-3">
                            Modern yaşam alanları, güvenlik ve ortak alan avantajları ile apartman daireleri şehir hayatı 
                            için uygundur.
                          </p>
                          <div className="text-sm text-gray-600">
                            <strong>Popüler Mahalleler:</strong> Sahil, Yalı Mahallesi, Liman
                          </div>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Villalar</h3>
                          <p className="text-gray-700 mb-3">
                            Lüks yaşam arayanlar için geniş bahçeler, özel havuzlar ve deniz manzaralı villalar mevcuttur.
                          </p>
                          <div className="text-sm text-gray-600">
                            <strong>Popüler Mahalleler:</strong> Denize yakın özel konumlar
                          </div>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Yazlık Evler</h3>
                          <p className="text-gray-700 mb-3">
                            Yaz aylarında kullanım ve yatırım amaçlı yazlık evler, denize yakın konumlarda bulunmaktadır.
                          </p>
                          <div className="text-sm text-gray-600">
                            <strong>Popüler Mahalleler:</strong> Sahil, Yalı Mahallesi, İnköy
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Neighborhoods */}
                <ScrollReveal direction="up" delay={600}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Mahallelere Göre Satılık Ev Seçenekleri
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'nun her mahallesi kendine özgü karakteristiklere sahiptir. Satılık ev seçerken mahalle 
                        özelliklerini değerlendirmek önemlidir.
                      </p>

                      <div className="grid md:grid-cols-2 gap-4 mt-6">
                        {neighborhoods.slice(0, 6).map((neighborhood) => {
                          const neighborhoodSlug = generateSlug(neighborhood);
                          const neighborhoodListings = karasuListings.filter(
                            l => l.location_neighborhood && generateSlug(l.location_neighborhood) === generateSlug(neighborhood)
                          );
                          
                          return (
                            <Link
                              key={neighborhood}
                              href={`${basePath}/mahalle/${neighborhoodSlug}?status=satilik`}
                              className="block border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all"
                            >
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{neighborhood}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {neighborhoodListings.length} satılık ev ilanı
                              </p>
                              <span className="text-sm text-primary font-medium">Mahalle detayları →</span>
                            </Link>
                          );
                        })}
                      </div>

                      <div className="mt-6">
                        <Link href={`${basePath}/karasu`}>
                          <Button variant="outline">
                            Tüm Mahalleleri Keşfet
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Investment vs Residence */}
                <ScrollReveal direction="up" delay={800}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Karasu'da Satılık Ev: Yatırım Amaçlı mı, Oturum Amaçlı mı?
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da satılık ev alırken amacınızı netleştirmek önemlidir. Yatırım ve oturum amaçlı evler 
                        farklı kriterlere sahiptir.
                      </p>

                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="border-l-4 border-primary pl-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Oturum Amaçlı</h3>
                          <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>Merkeze yakınlık ve ulaşım kolaylığı</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>Okul, sağlık ve alışveriş merkezlerine yakınlık</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>Güvenli ve sakin mahalleler</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                              <span>Altyapı ve hizmetlerin gelişmiş olması</span>
                            </li>
                          </ul>
                        </div>

                        <div className="border-l-4 border-secondary pl-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Yatırım Amaçlı</h3>
                          <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                              <span>Denize yakın konumlar ve turizm potansiyeli</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                              <span>Kiralama geliri potansiyeli</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                              <span>Değer artış potansiyeli yüksek bölgeler</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                              <span>Gelişen projeler ve altyapı yatırımları</span>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-gray-700">
                          <strong>Not:</strong> Hem oturum hem yatırım amaçlı kullanılabilecek evler de mevcuttur. 
                          Özellikle denize yakın merkez konumlar, hem yaşam kalitesi hem de yatırım değeri sunmaktadır.
                        </p>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Important Considerations */}
                <ScrollReveal direction="up" delay={1000}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Karasu'da Satılık Ev Ararken Dikkat Edilmesi Gerekenler
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da satılık ev alırken dikkat edilmesi gereken önemli noktalar vardır. Bu noktalar hem 
                        yatırım hem de oturum amaçlı alımlar için geçerlidir.
                      </p>

                      <div className="space-y-4 mt-6">
                        <div className="border rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Tapu Durumu ve Yasal İşlemler</h3>
                          <p>
                            Tapu durumu mutlaka kontrol edilmelidir. Kat irtifaklı, kat mülkiyetli veya arsa tapulu 
                            olması durumunda farklı işlemler gerekebilir. Tapu müdürlüğünden güncel bilgi alınmalıdır.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Bina Yaşı ve Yapı Durumu</h3>
                          <p>
                            Bina yaşı, yapı kalitesi ve bakım durumu önemlidir. Özellikle yazlık evlerde kış aylarında 
                            bakım ve güvenlik konuları göz önünde bulundurulmalıdır.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Altyapı ve Hizmetler</h3>
                          <p>
                            Su, elektrik, kanalizasyon, internet ve telefon hizmetlerinin durumu kontrol edilmelidir. 
                            Özellikle yazlık bölgelerde bu hizmetlerin yıl boyu kesintisiz olması önemlidir.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Çevresel Faktörler</h3>
                          <p>
                            Denize mesafe, manzara, gürültü seviyesi, komşuluk ilişkileri ve mahalle karakteristiği 
                            değerlendirilmelidir. Özellikle sürekli oturum için bu faktörler yaşam kalitesini etkiler.
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Market Trends */}
                <ScrollReveal direction="up" delay={1200}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Güncel Piyasa Trendleri ve Gelecek Beklentileri
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu emlak piyasası, genel ekonomik koşullar ve bölgesel gelişmelerden etkilenmektedir. 
                        Piyasa trendlerini anlamak, doğru zamanlama yapmanıza yardımcı olabilir.
                      </p>
                      <p>
                        İstanbul'a yakınlık, turizm potansiyeli ve doğal güzellikler, Karasu'yu uzun vadede değerli 
                        bir yatırım merkezi haline getirmektedir. Özellikle denize yakın konumlar ve merkez mahalleler, 
                        hem yaşam kalitesi hem de yatırım değeri açısından tercih edilmektedir.
                      </p>
                      <p>
                        Yeni projeler, altyapı yatırımları ve turizm gelişmeleri, bölgenin gelecekteki değer artışını 
                        desteklemektedir. Ancak piyasa koşulları değişken olduğundan, güncel fiyat bilgisi için 
                        profesyonel emlak danışmanı ile görüşmeniz önerilir.
                      </p>
                    </div>
                  </article>
                </ScrollReveal>
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-20 space-y-6">
                  <ScrollReveal direction="left" delay={100}>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Hızlı İstatistikler
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Toplam İlan</span>
                          <span className="text-lg font-bold text-gray-900">{karasuListings.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Müstakil Ev</span>
                          <span className="text-lg font-bold text-gray-900">{propertiesByType.ev.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Daire</span>
                          <span className="text-lg font-bold text-gray-900">{propertiesByType.daire.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Villa</span>
                          <span className="text-lg font-bold text-gray-900">{propertiesByType.villa.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Yazlık</span>
                          <span className="text-lg font-bold text-gray-900">{propertiesByType.yazlik.length}</span>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="left" delay={200}>
                    <div className="bg-primary/10 rounded-xl p-6 border border-primary/20">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        Emlak Danışmanlığı
                      </h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Karasu'da satılık ev arayanlar için uzman emlak danışmanlarımız size yardımcı olmaktan memnuniyet duyar.
                      </p>
                      <Button asChild className="w-full">
                        <Link href={`${basePath}/iletisim`}>
                          <Phone className="w-4 h-4 mr-2" />
                          İletişime Geçin
                        </Link>
                      </Button>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="left" delay={300}>
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        İlgili Sayfalar
                      </h3>
                      <div className="space-y-2">
                        <Link href={`${basePath}/karasu-satilik-ev-fiyatlari`} className="block text-sm text-primary hover:underline">
                          Karasu Satılık Ev Fiyatları
                        </Link>
                        <Link href={`${basePath}/karasu-merkez-satilik-ev`} className="block text-sm text-primary hover:underline">
                          Karasu Merkez Satılık Ev
                        </Link>
                        <Link href={`${basePath}/karasu-denize-yakin-satilik-ev`} className="block text-sm text-primary hover:underline">
                          Denize Yakın Satılık Ev
                        </Link>
                        <Link href={`${basePath}/karasu-yatirimlik-satilik-ev`} className="block text-sm text-primary hover:underline">
                          Yatırımlık Satılık Ev
                        </Link>
                        <Link href={`${basePath}/karasu-mustakil-satilik-ev`} className="block text-sm text-primary hover:underline">
                          Müstakil Satılık Ev
                        </Link>
                        <Link href={`${basePath}/karasu-mahalleler`} className="block text-sm text-primary hover:underline">
                          Karasu Mahalleler
                        </Link>
                        <div className="pt-2 mt-2 border-t border-gray-200">
                        <Link href={`${basePath}/kocaali-satilik-ev`} className="block text-sm text-primary hover:underline font-medium">
                          Kocaali'de Satılık Ev Seçenekleri →
                        </Link>
                        <Link href={`${basePath}/karasu-vs-kocaali-satilik-ev`} className="block text-sm text-primary hover:underline font-medium mt-2">
                          Karasu vs Kocaali Karşılaştırması →
                        </Link>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        {karasuListings.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Öne Çıkan Karasu Satılık Ev İlanları
                  </h2>
                  <p className="text-base text-gray-600">
                    {karasuListings.length} adet satılık ev ilanı
                  </p>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {karasuListings.slice(0, 6).map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
              {karasuListings.length > 6 && (
                <div className="text-center mt-8">
                  <Button asChild size="lg">
                    <Link href={`${basePath}/satilik`}>
                      Tüm Satılık İlanları Görüntüle ({karasuListings.length})
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Sık Sorulan Sorular
                </h2>
                <p className="text-base text-gray-600">
                  Karasu satılık evler hakkında merak edilenler
                </p>
              </div>
            </ScrollReveal>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <ScrollReveal key={index} direction="up" delay={index * 50}>
                  <details className="group bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary transition-all duration-200 hover:shadow-md">
                    <summary className="cursor-pointer flex items-center justify-between">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 pr-4 group-hover:text-primary transition-colors">
                        {faq.question}
                      </h3>
                      <svg
                        className="w-5 h-5 text-gray-500 flex-shrink-0 transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Related Articles Section - SEO & Engagement */}
        {relatedArticles.length > 0 && (
          <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <EnhancedRelatedArticles
                articles={relatedArticles}
                basePath={basePath}
                title="Karasu Ev ve Yatırım Hakkında Makaleler"
                limit={6}
              />
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Karasu'da Hayalinizdeki Evi Bulun
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Uzman emlak danışmanlarımız, Karasu'da satılık ev arayanlar için profesyonel danışmanlık hizmeti sunmaktadır. 
                Tüm süreçte yanınızdayız.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                  <Link href={`${basePath}/iletisim`}>
                    <Phone className="w-5 h-5 mr-2" />
                    İletişime Geçin
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  <Link href={`${basePath}/satilik`}>
                    <Home className="w-5 h-5 mr-2" />
                    Tüm İlanları İncele
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}
