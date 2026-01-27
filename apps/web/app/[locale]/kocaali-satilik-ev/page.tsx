import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Home, MapPin, TrendingUp, Waves, DollarSign, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getListings, getNeighborhoods } from '@/lib/supabase/queries';
import { getHighPriorityQAEntries } from '@/lib/supabase/queries/qa';
import { getAIQuestionsForPage } from '@/lib/supabase/queries/ai-questions';
import { ListingCard } from '@/components/listings/ListingCard';
import { withTimeout } from '@/lib/utils/timeout';
import dynamicImport from 'next/dynamic';

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
  const canonicalPath = locale === routing.defaultLocale ? '/kocaali-satilik-ev' : `/${locale}/kocaali-satilik-ev`;
  
  return {
    title: 'Kocaali Satılık Ev | Kapsamlı Rehber ve İlanlar | Karasu Emlak',
    description: 'Kocaali\'de satılık ev arayanlar için kapsamlı rehber. Fiyat analizi, mahalle rehberi, yatırım tavsiyeleri ve güncel ilanlar. Uzman emlak danışmanlığı ile hayalinizdeki evi bulun.',
    keywords: [
      'kocaali satılık ev',
      'kocaali satılık evler',
      'kocaali satılık konut',
      'kocaali satılık müstakil ev',
      'kocaali merkez satılık ev',
      'kocaali denize yakın satılık ev',
      'kocaali emlak',
      'kocaali yatırım',
      'sakarya kocaali satılık ev',
    ],
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': '/kocaali-satilik-ev',
        'en': '/en/kocaali-satilik-ev',
        'et': '/et/kocaali-satilik-ev',
        'ru': '/ru/kocaali-satilik-ev',
        'ar': '/ar/kocaali-satilik-ev',
      },
    },
    openGraph: {
      title: 'Kocaali Satılık Ev | Kapsamlı Rehber | Karasu Emlak',
      description: 'Kocaali\'de satılık ev arayanlar için kapsamlı rehber. Fiyat analizi, mahalle rehberi ve yatırım tavsiyeleri.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Kocaali Satılık Ev',
        },
      ],
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Kocaali Satılık Ev | Kapsamlı Rehber',
      description: 'Kocaali\'de satılık ev arayanlar için kapsamlı rehber ve güncel ilanlar.',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Fetch Q&As from database (with fallback to static FAQs)
// Now uses both qa_entries and ai_questions
async function getKocaaliFAQs() {
  const allFAQs: Array<{ question: string; answer: string }> = [];
  
  // First, try ai_questions (managed Q&A system)
  try {
    const aiQuestions = await withTimeout(
      getAIQuestionsForPage('kocaali-satilik-ev', 'kocaali', 'pillar'),
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
    const qaEntries = await withTimeout(getHighPriorityQAEntries('kocaali'), 2000, []);
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
      question: 'Kocaali\'de satılık ev fiyatları nasıl?',
      answer: 'Kocaali\'de satılık ev fiyatları konum, metrekare, oda sayısı ve özelliklere göre değişmektedir. Denize yakın konumlar ve merkez mahalleler genellikle daha yüksek fiyatlara sahiptir. Karasu\'ya göre genellikle daha uygun fiyatlı seçenekler sunar. Ortalama fiyat aralığı 400.000 TL ile 2.500.000 TL arasında değişmektedir.',
    },
    {
      question: 'Kocaali\'de hangi mahallelerde satılık ev bulunuyor?',
      answer: 'Kocaali\'de merkez mahalleler ve sahile yakın bölgelerde satılık ev seçenekleri bulunmaktadır. Her mahallenin kendine özgü avantajları vardır. Denize yakın mahalleler yazlık ve yatırım amaçlı tercih edilirken, merkez mahalleler sürekli oturum için idealdir.',
    },
    {
      question: 'Kocaali yatırım için uygun mu?',
      answer: 'Evet, Kocaali yatırım potansiyeli taşıyan bir bölgedir. Özellikle yazlık evler, denize yakın konumlar ve turizm potansiyeli yüksek alanlar yatırımcıların ilgisini çekmektedir. Karasu\'ya göre daha uygun giriş fiyatları sunar. Uzun vadede değer kazanma potansiyeli vardır.',
    },
    {
      question: 'Kocaali\'de satılık ev alırken nelere dikkat edilmeli?',
      answer: 'Kocaali\'de satılık ev alırken konum, fiyat, bina yaşı, yapı durumu, tapu durumu, denize yakınlık, ulaşım imkanları ve çevresel faktörler önemlidir. Özellikle yazlık ev alırken kış aylarında bakım ve güvenlik konuları göz önünde bulundurulmalıdır.',
    },
    {
      question: 'Kocaali mi Karasu mu yatırım için daha avantajlı?',
      answer: 'Her iki bölge de kendine özgü avantajlar sunar. Kocaali, daha uygun giriş fiyatları ve sakin bir yaşam sunarken, Karasu daha gelişmiş altyapı ve daha yüksek turizm potansiyeline sahiptir. Yatırım tercihi, bütçe ve yaşam tarzı tercihlerine göre değişir.',
    },
  ];
}

export default async function KocaaliSatilikEvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  // Fetch listings
  const allListingsResult = await withTimeout(
    getListings({}, { field: 'created_at', order: 'desc' }, 1000, 0),
    3000,
    { listings: [], total: 0 }
  );
  const allListings = allListingsResult?.listings || [];
  
  // Filter Kocaali listings
  const kocaaliListings = allListings.filter(listing =>
    listing.location_city?.toLowerCase().includes('kocaali') ||
    listing.location_neighborhood?.toLowerCase().includes('kocaali') ||
    listing.location_district?.toLowerCase().includes('kocaali')
  );
  
  const satilikListings = kocaaliListings.filter(l => l.status === 'satilik');
  const satilikCount = satilikListings.length;

  // Calculate average price
  const satilikPrices = satilikListings
    .filter(l => l.price_amount && l.price_amount > 0)
    .map(l => l.price_amount!);
  const avgPrice = satilikPrices.length > 0 
    ? Math.round(satilikPrices.reduce((a, b) => a + b, 0) / satilikPrices.length)
    : null;

  // Fetch Q&As from database
  const faqs = await getKocaaliFAQs();

  // Generate schemas
  const articleSchema = generateArticleSchema({
    headline: 'Kocaali Satılık Ev | Kapsamlı Rehber ve İlanlar',
    description: 'Kocaali\'de satılık ev arayanlar için kapsamlı rehber. Fiyat analizi, mahalle rehberi, yatırım tavsiyeleri ve güncel ilanlar.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Kocaali', url: `${siteConfig.url}${basePath}/kocaali` },
      { name: 'Kocaali Satılık Ev', url: `${siteConfig.url}${basePath}/kocaali-satilik-ev` },
    ],
    `${siteConfig.url}${basePath}/kocaali-satilik-ev`
  );

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Kocaali', href: `${basePath}/kocaali` },
            { label: 'Satılık Ev' },
          ]}
          className="mb-6"
        />

        {/* AI Overviews: Quick Answer */}
        <section className="py-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mb-8">
          <div className="max-w-4xl mx-auto px-6">
            <ScrollReveal direction="up" delay={0}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
              <p className="text-gray-700 leading-relaxed">
                <strong>Kocaali'de satılık ev</strong> arayanlar için geniş bir seçenek yelpazesi mevcuttur. 
                Fiyatlar konum, metrekare ve özelliklere göre 400.000 TL ile 2.500.000 TL arasında değişmektedir. 
                Karasu'ya göre genellikle daha uygun fiyatlı seçenekler sunar. Denize yakın konumlar ve merkez mahalleler 
                daha yüksek fiyatlara sahiptir. Hem sürekli oturum hem de yatırım amaçlı seçenekler bulunmaktadır.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Hero Section */}
        <header className="mb-12">
          <ScrollReveal direction="up" delay={0}>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Kocaali Satılık Ev
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
              Kocaali'de satılık ev arayanlar için kapsamlı rehber. Fiyat analizi, mahalle rehberi, yatırım tavsiyeleri ve güncel ilanlar.
            </p>
          </ScrollReveal>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="border rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">{satilikCount}</div>
              <div className="text-sm text-muted-foreground">Satılık Ev</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">
                {avgPrice ? `₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Ortalama Fiyat</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">
                {new Set(satilikListings.map(l => l.property_type)).size}
              </div>
              <div className="text-sm text-muted-foreground">Emlak Tipi</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">12km</div>
              <div className="text-sm text-muted-foreground">Sahil Uzunluğu</div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Kocaali Overview */}
          <ScrollReveal direction="up" delay={0}>
            <article className="prose prose-lg max-w-none">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Kocaali'de Satılık Ev Piyasası
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Kocaali, Sakarya'nın sahil ilçelerinden biri olarak, satılık ev piyasasında çeşitli seçenekler sunmaktadır. 
                  Denize yakın konumu ve sakin yaşam alanları ile Kocaali, hem yazlık hem de kalıcı yaşam arayanlar için 
                  uygun seçenekler içermektedir.
                </p>
                <p>
                  Kocaali'de satılık ev fiyatları, konum ve özelliklere göre değişmektedir. Sahil hattına yakın bölgelerde 
                  fiyatlar daha yüksekken, iç kesimlerde daha uygun seçenekler bulunabilir. 
                  <strong>Karasu'ya göre genellikle daha uygun fiyatlı bir alternatif sunar.</strong>
                </p>
                <p>
                  Kocaali'de satılık ev arayanlar için merkez mahalleler, sahile yakın bölgeler ve gelişmekte olan 
                  mahallelerde çeşitli seçenekler bulunmaktadır. Her mahallenin kendine özgü avantajları vardır.
                </p>
              </div>
            </article>
          </ScrollReveal>

          {/* Comparison with Karasu */}
          <ScrollReveal direction="up" delay={100}>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Kocaali mi Karasu mu?
              </h2>
              <p className="text-gray-700 mb-6">
                Her iki bölge de kendine özgü avantajlar sunar. Kocaali, daha uygun giriş fiyatları ve sakin bir yaşam 
                sunarken, Karasu daha gelişmiş altyapı ve daha yüksek turizm potansiyeline sahiptir.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Kocaali Avantajları</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Daha uygun fiyatlı seçenekler</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Sakin ve huzurlu yaşam</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Doğal güzellikler</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Karasu Avantajları</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Daha gelişmiş altyapı</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Yüksek turizm potansiyeli</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Daha fazla sosyal tesis</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`${basePath}/karasu-satilik-ev`}>
                  <Button variant="outline" size="sm">
                    Karasu Satılık Ev Rehberi
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href={`${basePath}/karasu-vs-kocaali-satilik-ev`}>
                  <Button variant="outline" size="sm">
                    Karşılaştırma Rehberi
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href={`${basePath}/kocaali`}>
                  <Button variant="outline" size="sm">
                    Kocaali Genel Bilgiler
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Property Types */}
          <ScrollReveal direction="up" delay={200}>
            <article>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Kocaali'de Satılık Ev Türleri
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                  Kocaali'de çeşitli ev türlerinde satılık seçenekler bulunmaktadır. Müstakil evler, apartman daireleri, 
                  villalar ve yazlık evler arasından seçim yapabilirsiniz.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {Array.from(new Set(satilikListings.map(l => l.property_type))).map((type) => {
                    const typeCount = satilikListings.filter(l => l.property_type === type).length;
                    const typeLabels: Record<string, string> = {
                      ev: 'Müstakil Ev',
                      daire: 'Daire',
                      villa: 'Villa',
                      yazlik: 'Yazlık',
                      arsa: 'Arsa',
                      isyeri: 'İşyeri',
                    };
                    return (
                      <div key={type} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">{typeLabels[type] || type}</span>
                          <span className="text-primary font-bold">{typeCount} ilan</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          </ScrollReveal>

          {/* Internal Links */}
          <ScrollReveal direction="up" delay={300}>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Daha Fazla Bilgi
              </h3>
              <p className="text-gray-700 mb-4">
                Kocaali'de satılık ev hakkında daha kapsamlı bilgi için{' '}
                <Link href={`${basePath}/kocaali-emlak-rehberi`} className="text-primary hover:underline font-medium">
                  Kocaali Emlak Rehberi
                </Link>{' '}
                sayfamıza göz atabilirsiniz.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href={`${basePath}/kocaali-emlak-rehberi`}>
                  <Button variant="outline" size="sm">
                    Emlak Rehberi
                  </Button>
                </Link>
                <Link href={`${basePath}/kocaali`}>
                  <Button variant="outline" size="sm">
                    Kocaali Genel
                  </Button>
                </Link>
                <Link href={`${basePath}/karasu-satilik-ev`}>
                  <Button variant="outline" size="sm">
                    Karasu Satılık Ev
                  </Button>
                </Link>
                <Link href={`${basePath}/karasu-vs-kocaali-satilik-ev`}>
                  <Button variant="outline" size="sm">
                    Karşılaştırma
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Featured Listings */}
        {satilikListings.length > 0 && (
          <section className="py-12 bg-gray-50 border-t border-gray-200 mt-12">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Kocaali'de Öne Çıkan Satılık Evler
                  </h2>
                  <p className="text-base text-gray-600">
                    {satilikListings.length} adet satılık ev ilanı
                  </p>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {satilikListings.slice(0, 6).map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
              {satilikListings.length > 6 && (
                <div className="text-center mt-8">
                  <Button asChild size="lg">
                    <Link href={`${basePath}/satilik?q=Kocaali`}>
                      Tüm Satılık İlanları Görüntüle ({satilikListings.length})
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="py-16 bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Sık Sorulan Sorular
                </h2>
                <p className="text-base text-gray-600">
                  Kocaali satılık ev hakkında merak edilenler
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

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Kocaali'de Hayalinizdeki Evi Bulun
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Uzman emlak danışmanlarımız, Kocaali'de satılık ev arayanlar için profesyonel danışmanlık hizmeti sunmaktadır.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                  <Link href={`${basePath}/iletisim`}>
                    İletişime Geçin
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  <Link href={`${basePath}/kocaali-emlak-rehberi`}>
                    Kocaali Emlak Rehberi
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </>
  );
}
