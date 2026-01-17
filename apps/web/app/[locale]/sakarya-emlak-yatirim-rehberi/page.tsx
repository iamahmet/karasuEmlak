import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';

export const dynamic = 'force-dynamic';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { TrendingUp, DollarSign, MapPin, Building2, Home, Award, BarChart3, Target, Phone } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getListings } from '@/lib/supabase/queries';
import { getAIQuestionsForPage } from '@/lib/supabase/queries/ai-questions';
import { getHighPriorityQAEntries } from '@/lib/supabase/queries/qa';
import { ListingCard } from '@/components/listings/ListingCard';
import { withTimeout } from '@/lib/utils/timeout';
import dynamicImport from 'next/dynamic';

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
  const canonicalPath = locale === routing.defaultLocale ? '/sakarya-emlak-yatirim-rehberi' : `/${locale}/sakarya-emlak-yatirim-rehberi`;
  
  return {
    title: 'Sakarya Emlak Yatırım Rehberi | Yatırım Fırsatları ve Stratejileri | Karasu Emlak',
    description: 'Sakarya emlak yatırım rehberi: Karasu ve Kocaali bölgelerinde yatırım fırsatları, fiyat trendleri, kiralama geliri analizi ve uzman yatırım tavsiyeleri. 2025 güncel rehber.',
    keywords: [
      'sakarya emlak yatırım',
      'sakarya yatırım rehberi',
      'karasu yatırım',
      'kocaali yatırım',
      'sakarya emlak fırsatları',
      'karasu yatırımlık ev',
      'kocaali yatırımlık ev',
      'sakarya kiralama geliri',
      'sakarya emlak piyasası',
      'sakarya yatırım potansiyeli',
    ],
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': '/sakarya-emlak-yatirim-rehberi',
        'en': '/en/sakarya-emlak-yatirim-rehberi',
        'et': '/et/sakarya-emlak-yatirim-rehberi',
        'ru': '/ru/sakarya-emlak-yatirim-rehberi',
        'ar': '/ar/sakarya-emlak-yatirim-rehberi',
      },
    },
    openGraph: {
      title: 'Sakarya Emlak Yatırım Rehberi | Yatırım Fırsatları',
      description: 'Sakarya\'da emlak yatırımı yapmak isteyenler için kapsamlı rehber, fiyat trendleri ve uzman tavsiyeleri.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Sakarya Emlak Yatırım Rehberi',
        },
      ],
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Sakarya Emlak Yatırım Rehberi',
      description: 'Sakarya\'da emlak yatırımı için kapsamlı rehber ve uzman tavsiyeleri.',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Fetch Q&As from database (with fallback)
async function getSakaryaYatirimFAQs() {
  const allFAQs: Array<{ question: string; answer: string }> = [];
  
  // First, try ai_questions (managed Q&A system)
  try {
    const aiQuestions = await withTimeout(
      getAIQuestionsForPage('sakarya-emlak-yatirim-rehberi', 'global', 'pillar'),
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
  
  // Then, try qa_entries (legacy system) - get both karasu and kocaali
  try {
    const [karasuQAs, kocaaliQAs] = await Promise.all([
      withTimeout(getHighPriorityQAEntries('karasu'), 2000, []),
      withTimeout(getHighPriorityQAEntries('kocaali'), 2000, []),
    ]);
    
    // Filter for investment-related Q&As
    const investmentQAs = [...(karasuQAs || []), ...(kocaaliQAs || [])].filter(qa => 
      qa.category === 'yatirim' || 
      qa.question.toLowerCase().includes('yatırım') ||
      qa.question.toLowerCase().includes('yatirim') ||
      qa.question.toLowerCase().includes('kiralama geliri')
    );
    
    // Only add if not already in allFAQs (avoid duplicates)
    const existingQuestions = new Set(allFAQs.map(f => f.question.toLowerCase()));
    investmentQAs.forEach(qa => {
      if (!existingQuestions.has(qa.question.toLowerCase()) && allFAQs.length < 8) {
        allFAQs.push({
          question: qa.question,
          answer: qa.answer,
        });
      }
    });
  } catch (error) {
    console.error('Error fetching Q&A entries:', error);
  }
  
  if (allFAQs.length > 0) {
    return allFAQs.slice(0, 8);
  }
  
  // Fallback FAQs
  return [
    {
      question: 'Sakarya\'da emlak yatırımı yapmak mantıklı mı?',
      answer: 'Evet, Sakarya\'da emlak yatırımı yapmak mantıklıdır. İstanbul\'a yakınlığı, denize yakın konumu, gelişen altyapısı ve turizm potansiyeli nedeniyle yatırım değeri yüksektir. Özellikle Karasu ve Kocaali bölgeleri yatırımcıların ilgisini çekmektedir.',
    },
    {
      question: 'Sakarya\'da hangi bölgeler yatırım için daha uygundur?',
      answer: 'Karasu ve Kocaali bölgeleri yatırım için en uygun bölgelerdir. Denize yakın konumları, turizm potansiyeli ve gelişen altyapıları nedeniyle hem yazlık kullanım hem de yatırım getirisi açısından avantajlıdır.',
    },
    {
      question: 'Sakarya\'da kiralama geliri ne kadar?',
      answer: 'Kiralama geliri, konum, ev tipi, özellikler ve sezona göre değişmektedir. Denize yakın yazlık evler yaz aylarında yüksek kiralama geliri sağlayabilir. Detaylı bilgi için emlak danışmanlarımızla iletişime geçebilirsiniz.',
    },
    {
      question: 'Sakarya\'da yatırım için hangi ev tipleri tercih edilmeli?',
      answer: 'Yazlık evler, denize yakın daireler ve villalar yatırım için en çok tercih edilen türlerdir. Özellikle kiralama potansiyeli yüksek olan evler yatırım getirisi açısından avantajlıdır.',
    },
  ];
}

export default async function SakaryaEmlakYatirimRehberiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Fetch investment-worthy listings
  const allListingsResult = await withTimeout(
    getListings({ status: 'satilik' }, { field: 'created_at', order: 'desc' }, 100, 0),
    3000,
    { listings: [], total: 0 }
  );
  
  const { listings: allListings = [] } = allListingsResult || {};
  
  // Filter for Sakarya region (Karasu, Kocaali)
  const sakaryaListings = allListings.filter(listing => 
    listing.location_city?.toLowerCase().includes('sakarya') ||
    listing.location_city?.toLowerCase().includes('karasu') ||
    listing.location_city?.toLowerCase().includes('kocaali') ||
    listing.location_district?.toLowerCase().includes('karasu') ||
    listing.location_district?.toLowerCase().includes('kocaali')
  );
  
  // Prioritize investment-worthy listings (villa, yazlık, denize yakın)
  const investmentListings = sakaryaListings
    .filter(l => 
      l.property_type?.toLowerCase().includes('villa') ||
      l.property_type?.toLowerCase().includes('yazlık') ||
      l.property_type?.toLowerCase().includes('yazlik') ||
      l.location_neighborhood?.toLowerCase().includes('sahil') ||
      l.location_neighborhood?.toLowerCase().includes('deniz')
    )
    .slice(0, 12);
  
  // Fetch Q&As
  const faqs = await getSakaryaYatirimFAQs();
  
  // Generate schemas
  const articleSchema = generateArticleSchema({
    headline: 'Sakarya Emlak Yatırım Rehberi | Yatırım Fırsatları ve Stratejileri',
    description: 'Sakarya\'da emlak yatırımı yapmak isteyenler için kapsamlı rehber, fiyat trendleri, kiralama geliri analizi ve uzman tavsiyeleri.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });
  
  const faqSchema = generateFAQSchema(faqs);
  
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Yatırım Rehberi', url: `${siteConfig.url}${basePath}/sakarya-emlak-yatirim-rehberi` },
    ],
    `${siteConfig.url}${basePath}/sakarya-emlak-yatirim-rehberi`
  );

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />
      
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Yatırım Rehberi' },
        ]}
      />

      {/* AI Overviews: Kısa Cevap Block */}
      <section className="py-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg mb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <ScrollReveal direction="up" delay={0}>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Kısa Cevap
            </h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Sakarya emlak yatırım rehberi</strong>, Sakarya bölgesinde (özellikle Karasu ve Kocaali) 
              emlak yatırımı yapmak isteyenler için kapsamlı bilgiler, fiyat trendleri, kiralama geliri analizi 
              ve uzman tavsiyeleri sunar. Sakarya, İstanbul'a yakınlığı, denize yakın konumu, gelişen altyapısı 
              ve yüksek turizm potansiyeli ile hem yaşam hem de yatırım amaçlı tercih edilmektedir.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-indigo-900 via-blue-800 to-purple-900 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }} />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal direction="up" delay={0}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Sakarya Emlak Yatırım Rehberi
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mb-8">
                Karasu ve Kocaali bölgelerinde yatırım fırsatları, fiyat trendleri ve uzman tavsiyeleri
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={`${basePath}/karasu-yatirimlik-satilik-ev`}>
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Karasu Yatırım Fırsatları
                  </Button>
                </Link>
                <Link href={`${basePath}/kocaali-yatirimlik-gayrimenkul`}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Kocaali Yatırım Fırsatları
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Investment Overview */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Sakarya Emlak Yatırım Piyasası
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Sakarya bölgesi, özellikle Karasu ve Kocaali ilçeleri, emlak yatırımı için önemli fırsatlar sunmaktadır.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <ScrollReveal direction="up" delay={0}>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                  <TrendingUp className="h-8 w-8 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Yatırım Potansiyeli</h3>
                  <p className="text-gray-700 text-sm">
                    İstanbul'a yakınlık ve turizm potansiyeli nedeniyle yüksek yatırım değeri
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={100}>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                  <DollarSign className="h-8 w-8 text-green-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Kiralama Geliri</h3>
                  <p className="text-gray-700 text-sm">
                    Yazlık evler ve denize yakın konutlar yüksek kiralama geliri sağlayabilir
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={200}>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
                  <MapPin className="h-8 w-8 text-purple-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Stratejik Konum</h3>
                  <p className="text-gray-700 text-sm">
                    İstanbul'a 2 saat mesafede, denize yakın, gelişen altyapı
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={300}>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
                  <BarChart3 className="h-8 w-8 text-orange-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Değer Artışı</h3>
                  <p className="text-gray-700 text-sm">
                    Son yıllarda istikrarlı değer artışı ve gelecek projeler
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Karasu vs Kocaali Comparison */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Karasu vs Kocaali: Yatırım Karşılaştırması
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  İki bölgeyi yatırım açısından karşılaştırın ve size en uygun olanı seçin
                </p>
              </div>
            </ScrollReveal>

            <div className="max-w-5xl mx-auto">
              <Link href={`${basePath}/karasu-vs-kocaali-yatirim`}>
                <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">Detaylı Yatırım Karşılaştırması</h3>
                    <Button variant="outline">
                      Karşılaştırmayı Gör
                    </Button>
                  </div>
                  <p className="text-gray-700">
                    Karasu ve Kocaali bölgelerini fiyat, kiralama geliri, yatırım potansiyeli ve gelecek projeler açısından detaylı olarak karşılaştırın.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Investment Listings */}
        {investmentListings.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      Yatırım Fırsatları
                    </h2>
                    <p className="text-gray-600">
                      Sakarya bölgesinde yatırım potansiyeli yüksek ilanlar
                    </p>
                  </div>
                  <Link href={`${basePath}/satilik`}>
                    <Button variant="outline">
                      Tümünü Gör
                    </Button>
                  </Link>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investmentListings.map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 max-w-4xl">
              <ScrollReveal direction="up" delay={0}>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
                  Sık Sorulan Sorular
                </h2>
              </ScrollReveal>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <ScrollReveal key={index} direction="up" delay={index * 50}>
                    <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-400 transition-colors">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Yatırım Danışmanlığı Alın
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Sakarya emlak yatırımı hakkında uzman danışmanlarımızdan ücretsiz bilgi alın
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href={`${basePath}/iletisim`}>
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                    <Phone className="h-5 w-5 mr-2" />
                    İletişime Geç
                  </Button>
                </Link>
                <Link href={`${basePath}/karasu-yatirimlik-satilik-ev`}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Home className="h-5 w-5 mr-2" />
                    Karasu Yatırım İlanları
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}
