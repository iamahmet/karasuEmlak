import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Home, Phone, Waves, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { generateRealEstateAgentLocalSchema } from '@/lib/seo/local-seo-schemas';
import { generateItemListSchema } from '@/lib/seo/listings-schema';
import { getListings, getNeighborhoods } from '@/lib/supabase/queries';
import { getAIQuestionsForPage } from '@/lib/supabase/queries/ai-questions';
import { ListingCard } from '@/components/listings/ListingCard';
import { withTimeout } from '@/lib/utils/timeout';
import dynamicImport from 'next/dynamic';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour

const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/karasu-denize-sifir-satilik-daire' : `/${locale}/karasu-denize-sifir-satilik-daire`;
  
  return {
    title: 'Karasu Denize Sıfır Satılık Daire | Deniz Manzaralı Daire İlanları 2025 | Karasu Emlak',
    description: 'Karasu\'da denize sıfır satılık daire ilanları. Deniz manzaralı, sahil şeridinde konumlarda 1+1\'den 4+1\'e kadar geniş seçenek. Güncel fiyatlar, yatırım analizi ve uzman emlak danışmanlığı. Hayalinizdeki denize sıfır daireyi bulun.',
    keywords: [
      'karasu denize sıfır satılık daire',
      'karasu deniz manzaralı satılık daire',
      'karasu sahil satılık daire',
      'karasu denize yakın satılık daire',
      'karasu deniz kenarı satılık daire',
      'karasu sahil şeridi satılık daire',
      'sakarya karasu denize sıfır daire',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': '/karasu-denize-sifir-satilik-daire',
        'en': '/en/karasu-denize-sifir-satilik-daire',
        'et': '/et/karasu-denize-sifir-satilik-daire',
        'ru': '/ru/karasu-denize-sifir-satilik-daire',
        'ar': '/ar/karasu-denize-sifir-satilik-daire',
      },
    },
    openGraph: {
      title: 'Karasu Denize Sıfır Satılık Daire | Deniz Manzaralı Daire İlanları 2025',
      description: 'Karasu\'da denize sıfır satılık daire ilanları. Deniz manzaralı konumlarda geniş seçenek. Güncel fiyatlar ve yatırım analizi.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Denize Sıfır Satılık Daire - Emlak İlanları',
        },
      ],
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Karasu Denize Sıfır Satılık Daire | Deniz Manzaralı Daireler',
      description: 'Karasu\'da denize sıfır satılık daire ilanları. Güncel fiyatlar ve yatırım analizi.',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function KarasuDenizeSifirSatilikDairePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Fetch listings with sea view or near sea
  const allListingsResult = await withTimeout(
    getListings({ status: 'satilik', property_type: ['daire'] }, { field: 'created_at', order: 'desc' }, 1000, 0),
    3000,
    { listings: [], total: 0 }
  );
  
  const neighborhoodsResult = await withTimeout(getNeighborhoods(), 3000, []);
  const neighborhoods = neighborhoodsResult || [];
  
  const { listings: allListings = [] } = allListingsResult || {};
  
  // Filter Karasu listings with sea view or coastal neighborhoods
  const coastalNeighborhoods = ['Sahil', 'Yalı', 'Liman', 'Deniz', 'Kıyı'];
  const denizeSifirListings = allListings.filter(listing => {
    const isKarasu = listing.location_city?.toLowerCase().includes('karasu') ||
                     listing.location_neighborhood?.toLowerCase().includes('karasu');
    const isDaire = listing.property_type === 'daire';
    const hasSeaView = listing.features?.seaView === true;
    const isCoastalNeighborhood = listing.location_neighborhood && 
      coastalNeighborhoods.some(n => listing.location_neighborhood?.includes(n));
    
    return isKarasu && isDaire && (hasSeaView || isCoastalNeighborhood);
  });
  
  // Group by room count
  const byRooms = {
    '1+1': denizeSifirListings.filter(l => l.features?.rooms === 1),
    '2+1': denizeSifirListings.filter(l => l.features?.rooms === 2),
    '3+1': denizeSifirListings.filter(l => l.features?.rooms === 3),
    '4+1': denizeSifirListings.filter(l => l.features?.rooms === 4),
  };
  
  // Calculate average price
  const prices = denizeSifirListings
    .filter(l => l.price_amount && l.price_amount > 0)
    .map(l => l.price_amount!);
  const avgPrice = prices.length > 0 
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : null;
  
  // Fetch FAQs
  const aiQuestions = await withTimeout(
    getAIQuestionsForPage('karasu-denize-sifir-satilik-daire', 'karasu', 'pillar'),
    2000,
    []
  );
  
  const faqs = aiQuestions && aiQuestions.length > 0 ? aiQuestions.map(q => ({
    question: q.question,
    answer: q.answer,
  })) : [
    {
      question: 'Karasu\'da denize sıfır satılık daire fiyatları nasıl?',
      answer: 'Karasu\'da denize sıfır satılık daire fiyatları genellikle 1.200.000 TL ile 3.500.000 TL arasında değişmektedir. Denize yakınlık ve deniz manzarası fiyatı %15-25 oranında artırmaktadır. Sahil, Yalı ve Liman mahallelerinde daha fazla seçenek bulunmaktadır.',
    },
    {
      question: 'Karasu\'da hangi mahallelerde denize sıfır satılık daire bulunuyor?',
      answer: 'Karasu\'da denize sıfır satılık daire seçenekleri özellikle Sahil, Yalı Mahallesi, Liman Mahallesi ve Deniz Mahallesi\'nde bulunmaktadır. Bu mahalleler denize çok yakın konumlarda yer almaktadır.',
    },
    {
      question: 'Denize sıfır daire yatırım için uygun mu?',
      answer: 'Evet, denize sıfır daireler yatırım için çok uygundur. Özellikle yaz aylarında kiralama potansiyeli yüksektir ve değer artışı hızlıdır. Turizm sezonunda yüksek kira geliri elde edilebilir.',
    },
  ];
  
  // Generate schemas
  const articleSchema = {
    ...generateArticleSchema({
      headline: 'Karasu Denize Sıfır Satılık Daire | Deniz Manzaralı Daire İlanları 2025',
      description: 'Karasu\'da denize sıfır satılık daire ilanları. Deniz manzaralı konumlarda geniş seçenek. Güncel fiyatlar ve yatırım analizi.',
      image: [`${siteConfig.url}/og-image.jpg`],
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      author: 'Karasu Emlak',
    }),
    mainEntity: {
      '@type': 'Question',
      name: 'Karasu\'da denize sıfır satılık daire nasıl bulunur?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Karasu'da denize sıfır satılık daire arayanlar için ${denizeSifirListings.length} adet aktif ilan mevcuttur. Fiyatlar genellikle 1.200.000 TL ile 3.500.000 TL arasında değişmektedir. Sahil, Yalı ve Liman mahallelerinde daha fazla seçenek bulunmaktadır.`,
      },
    },
  };
  
  const faqSchema = generateFAQSchema(faqs);
  
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Karasu Satılık Daire', url: `${siteConfig.url}${basePath}/karasu-satilik-daire` },
      { name: 'Karasu Denize Sıfır Satılık Daire', url: `${siteConfig.url}${basePath}/karasu-denize-sifir-satilik-daire` },
    ],
    `${siteConfig.url}${basePath}/karasu-denize-sifir-satilik-daire`
  );
  
  const realEstateAgentSchema = generateRealEstateAgentLocalSchema({
    includeRating: true,
    includeServices: true,
    includeAreaServed: true,
  });
  
  const itemListSchema = denizeSifirListings.length > 0
    ? generateItemListSchema(denizeSifirListings.slice(0, 20), `${siteConfig.url}${basePath}`, {
        name: 'Karasu Denize Sıfır Satılık Daire İlanları',
        description: `Karasu'da ${denizeSifirListings.length} adet denize sıfır satılık daire ilanı.`,
      })
    : null;
  
  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={realEstateAgentSchema} />
      {itemListSchema && <StructuredData data={itemListSchema} />}
      
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Karasu Satılık Daire', href: `${basePath}/karasu-satilik-daire` },
          { label: 'Karasu Denize Sıfır Satılık Daire', href: `${basePath}/karasu-denize-sifir-satilik-daire` },
        ]}
      />
      
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-800 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center gap-2">
                    <Waves className="w-4 h-4" />
                    {denizeSifirListings.length}+ Denize Sıfır Daire İlanı
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Karasu Denize Sıfır Satılık Daire
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  Karasu'da denize sıfır satılık daire arayanlar için kapsamlı rehber. Deniz manzaralı, sahil şeridinde konumlarda 
                  1+1'den 4+1'e kadar geniş seçenek. Güncel fiyatlar, yatırım analizi ve uzman emlak danışmanlığı.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    <Link href={`${basePath}/satilik?propertyType=daire&seaView=true`}>
                      <Waves className="w-5 h-5 mr-2" />
                      Denize Sıfır Daire İlanlarını Görüntüle
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
                <div className="text-2xl font-bold text-primary">{denizeSifirListings.length}</div>
                <div className="text-sm text-gray-600">Denize Sıfır Daire</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {avgPrice ? `₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K` : 'Değişken'}
                </div>
                <div className="text-sm text-gray-600">Ortalama Fiyat</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">+%20</div>
                <div className="text-sm text-gray-600">Yatırım Değeri</div>
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
                {/* Quick Answer */}
                <ScrollReveal direction="up" delay={0}>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>Karasu'da denize sıfır satılık daire</strong> arayanlar için {denizeSifirListings.length} adet aktif ilan mevcuttur. 
                      Fiyatlar genellikle 1.200.000 TL ile 3.500.000 TL arasında değişmektedir. Denize yakınlık ve deniz manzarası fiyatı %15-25 oranında artırmaktadır. 
                      Sahil, Yalı ve Liman mahallelerinde daha fazla seçenek bulunmaktadır. Yatırım ve yazlık amaçlı ideal seçeneklerdir.
                    </p>
                  </div>
                </ScrollReveal>

                {/* Introduction */}
                <ScrollReveal direction="up" delay={100}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Karasu'da Denize Sıfır Satılık Daire Arayanlar İçin Genel Bakış
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da denize sıfır satılık daire seçenekleri, özellikle yatırım ve yazlık amaçlı alımlar için çok popülerdir. 
                        Deniz manzaralı konumlar, sahil şeridinde yer alan apartmanlar ve denize yakın mahalleler, emlak yatırımcılarının 
                        ilgisini çekmektedir.
                      </p>
                      <p>
                        Denize sıfır daireler, hem sürekli oturum hem de yazlık amaçlı kullanım için idealdir. Özellikle yaz aylarında 
                        kiralama potansiyeli yüksektir ve turizm sezonunda yüksek kira geliri elde edilebilir.
                      </p>
                      <p>
                        Bu rehber, Karasu'da denize sıfır satılık daire almayı düşünenler için fiyat analizi, mahalle rehberi, 
                        yatırım tavsiyeleri ve dikkat edilmesi gerekenler hakkında kapsamlı bilgi sunmaktadır.
                      </p>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Investment Benefits */}
                <ScrollReveal direction="up" delay={200}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Denize Sıfır Daire Yatırım Avantajları
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                          <TrendingUp className="h-6 w-6 text-[#006AFF]" />
                          Yüksek Yatırım Değeri
                        </h3>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-[#006AFF] flex-shrink-0 mt-0.5" />
                            <span>Denize yakın konumlar %15-25 daha yüksek fiyat</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-[#006AFF] flex-shrink-0 mt-0.5" />
                            <span>Yıllık %8-12 değer artışı potansiyeli</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-[#006AFF] flex-shrink-0 mt-0.5" />
                            <span>Uzun vadede güçlü yatırım getirisi</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                        <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                          <Waves className="h-6 w-6 text-[#00A862]" />
                          Kiralama Potansiyeli
                        </h3>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-[#00A862] flex-shrink-0 mt-0.5" />
                            <span>Yaz aylarında yüksek kiralama talebi</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-[#00A862] flex-shrink-0 mt-0.5" />
                            <span>Yıllık %4-6 kira getirisi</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-[#00A862] flex-shrink-0 mt-0.5" />
                            <span>Turizm sezonunda premium fiyatlar</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Featured Listings */}
                {denizeSifirListings.length > 0 && (
                  <section className="py-8">
                    <ScrollReveal direction="up" delay={0}>
                      <div className="mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                          Öne Çıkan Karasu Denize Sıfır Satılık Daire İlanları
                        </h2>
                        <p className="text-base text-gray-600">
                          {denizeSifirListings.length} adet denize sıfır satılık daire ilanı
                        </p>
                      </div>
                    </ScrollReveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {denizeSifirListings.slice(0, 6).map((listing, index) => (
                        <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                          <ListingCard listing={listing} basePath={basePath} />
                        </ScrollReveal>
                      ))}
                    </div>
                    {denizeSifirListings.length > 6 && (
                      <div className="text-center mt-8">
                        <Button asChild size="lg">
                          <Link href={`${basePath}/satilik?propertyType=daire&seaView=true`}>
                            Tüm Denize Sıfır Daire İlanlarını Görüntüle ({denizeSifirListings.length})
                          </Link>
                        </Button>
                      </div>
                    )}
                  </section>
                )}

                {/* FAQ Section */}
                {faqs.length > 0 && (
                  <section className="py-8">
                    <ScrollReveal direction="up" delay={0}>
                      <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                          Sık Sorulan Sorular
                        </h2>
                        <p className="text-base text-gray-600">
                          Karasu denize sıfır satılık daireler hakkında merak edilenler
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
                  </section>
                )}
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
                          <span className="text-sm text-gray-600">Toplam Daire</span>
                          <span className="text-lg font-bold text-gray-900">{denizeSifirListings.length}</span>
                        </div>
                        {Object.entries(byRooms).map(([roomType, listings]) => (
                          listings.length > 0 && (
                            <div key={roomType} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">{roomType} Daire</span>
                              <span className="text-lg font-bold text-gray-900">{listings.length}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="left" delay={200}>
                    <div className="bg-primary/10 rounded-xl p-6 border border-primary/20">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        Emlak Danışmanlığı
                      </h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Karasu'da denize sıfır satılık daire arayanlar için uzman emlak danışmanlarımız size yardımcı olmaktan memnuniyet duyar.
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
                        <Link href={`${basePath}/karasu-satilik-daire`} className="block text-sm text-primary hover:underline">
                          Karasu Satılık Daire
                        </Link>
                        <Link href={`${basePath}/karasu-sahil-satilik-daire`} className="block text-sm text-primary hover:underline">
                          Karasu Sahil Satılık Daire
                        </Link>
                        <Link href={`${basePath}/karasu-yali-satilik-daire`} className="block text-sm text-primary hover:underline">
                          Karasu Yalı Satılık Daire
                        </Link>
                        <Link href={`${basePath}/satilik?propertyType=daire`} className="block text-sm text-primary hover:underline">
                          Tüm Satılık Daireler
                        </Link>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Karasu'da Hayalinizdeki Denize Sıfır Daireyi Bulun
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Uzman emlak danışmanlarımız, Karasu'da denize sıfır satılık daire arayanlar için profesyonel danışmanlık hizmeti sunmaktadır. 
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
                  <Link href={`${basePath}/satilik?propertyType=daire&seaView=true`}>
                    <Waves className="w-5 h-5 mr-2" />
                    Denize Sıfır Daire İlanlarını İncele
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
