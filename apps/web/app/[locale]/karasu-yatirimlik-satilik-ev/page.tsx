import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { TrendingUp, DollarSign, ChartLine, Target } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getListings } from '@/lib/supabase/queries';
import { getQAEntriesByCategory } from '@/lib/supabase/queries/qa';
import { getAIQuestionsForPage } from '@/lib/supabase/queries/ai-questions';
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
  const canonicalPath = locale === routing.defaultLocale ? '/karasu-yatirimlik-satilik-ev' : `/${locale}/karasu-yatirimlik-satilik-ev`;
  
  return {
    title: 'Karasu Yatırımlık Satılık Ev | Yatırım Rehberi ve Fırsatlar | Karasu Emlak',
    description: 'Karasu\'da yatırımlık satılık ev fırsatları. Yatırım potansiyeli yüksek bölgeler, kiralama geliri, değer artışı ve uzman tavsiyeleri.',
    keywords: [
      'karasu yatırımlık satılık ev',
      'karasu yatırım ev',
      'karasu yatırım fırsatları',
      'karasu kiralama geliri',
      'karasu emlak yatırım',
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: 'Karasu Yatırımlık Satılık Ev | Yatırım Rehberi',
      description: 'Karasu\'da yatırımlık satılık ev fırsatları ve yatırım tavsiyeleri.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
    },
  };
}

// Fetch Q&As from database (with fallback)
// Now uses both ai_questions and qa_entries
async function getKarasuYatirimlikSatilikFAQs() {
  const allFAQs: Array<{ question: string; answer: string }> = [];
  
  // First, try ai_questions (managed Q&A system)
  try {
    const aiQuestions = await withTimeout(
      getAIQuestionsForPage('karasu-yatirimlik-satilik-ev', 'karasu', 'cornerstone'),
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
    const qaEntries = await withTimeout(getQAEntriesByCategory('karasu', 'yatirim'), 2000, []);
    if (qaEntries && qaEntries.length > 0) {
      // Only add if not already in allFAQs (avoid duplicates)
      const existingQuestions = new Set(allFAQs.map(f => f.question.toLowerCase()));
      qaEntries.forEach(qa => {
        if (!existingQuestions.has(qa.question.toLowerCase()) && allFAQs.length < 6) {
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
    return allFAQs.slice(0, 6);
  }
  
  // Fallback FAQs
  return [
    {
      question: 'Karasu\'da satılık ev yatırımı yapmak mantıklı mı?',
      answer: 'Evet, Karasu\'da satılık ev yatırımı yapmak mantıklıdır. İstanbul\'a yakınlığı, turizm potansiyeli, denize yakın konumu ve gelişen altyapısı nedeniyle yatırım değeri yüksektir. Özellikle yazlık kiralama geliri ve uzun vadeli değer artışı potansiyeli vardır.',
    },
    {
      question: 'Karasu\'da hangi bölgeler yatırım için daha uygundur?',
      answer: 'Denize yakın bölgeler (Sahil, Yalı mahalleleri), merkez konumlar ve turizm potansiyeli yüksek alanlar yatırım için idealdir. Özellikle yazlık kiralama potansiyeli olan evler yatırımcılar için caziptir.',
    },
    {
      question: 'Karasu\'da ev yatırımında kiralama geliri ne kadar?',
      answer: 'Kiralama geliri, konum, ev tipi, özellikler ve sezona göre değişmektedir. Denize yakın yazlık evler yaz aylarında yüksek kiralama geliri sağlayabilir. Detaylı bilgi için emlak danışmanlarımızla iletişime geçebilirsiniz.',
    },
    {
      question: 'Yatırım için hangi ev tipleri tercih edilmeli?',
      answer: 'Yazlık evler, denize yakın daireler ve villalar yatırım için en çok tercih edilen türlerdir. Özellikle kiralama potansiyeli yüksek olan evler yatırım getirisi açısından avantajlıdır.',
    },
  ];
}

export default async function KarasuYatirimlikSatilikEvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Fetch data - filter for investment-worthy listings
  const allListingsResult = await withTimeout(
    getListings({ status: 'satilik' }, { field: 'created_at', order: 'desc' }, 1000, 0),
    3000,
    { listings: [], total: 0 }
  );
  
  const { listings: allListings = [] } = allListingsResult || {};
  
  // Filter for investment-worthy listings (sea view, yazlik, villa, or central location)
  const investmentListings = allListings.filter(listing => {
    const isKarasu = listing.location_city?.toLowerCase().includes('karasu') ||
                     listing.location_neighborhood?.toLowerCase().includes('karasu');
    const isInvestmentWorthy = listing.features.seaView === true ||
                              listing.property_type === 'yazlik' ||
                              listing.property_type === 'villa' ||
                              listing.location_neighborhood?.toLowerCase().includes('sahil') ||
                              listing.location_neighborhood?.toLowerCase().includes('yalı');
    return isKarasu && isInvestmentWorthy;
  });

  // Fetch Q&As
  const faqs = await getKarasuYatirimlikSatilikFAQs();

  // Generate schemas
  const articleSchema = generateArticleSchema({
    headline: 'Karasu Yatırımlık Satılık Ev | Yatırım Rehberi ve Fırsatlar',
    description: 'Karasu\'da yatırımlık satılık ev fırsatları. Yatırım potansiyeli yüksek bölgeler, kiralama geliri ve değer artışı.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Karasu Satılık Ev', url: `${siteConfig.url}${basePath}/karasu-satilik-ev` },
      { name: 'Yatırımlık Satılık Ev', url: `${siteConfig.url}${basePath}/karasu-yatirimlik-satilik-ev` },
    ],
    `${siteConfig.url}${basePath}/karasu-yatirimlik-satilik-ev`
  );

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />
      
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Karasu Satılık Ev', href: `${basePath}/karasu-satilik-ev` },
          { label: 'Yatırımlık Satılık Ev', href: `${basePath}/karasu-yatirimlik-satilik-ev` },
        ]}
      />

      {/* AI Overviews: Kısa Cevap Block */}
      <section className="py-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <ScrollReveal direction="up" delay={0}>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Karasu'da yatırımlık satılık ev</strong> arayanlar için turizm potansiyeli, yaz aylarında 
              kiralama geliri ve uzun vadeli değer kazanma önemli avantajlardır. Denize yakın konumlar ve merkez 
              mahalleler yatırım için idealdir. Ortalama yıllık kiralama getirisi %4-6 arasında değişebilir. 
              Karasu, İstanbul'a yakınlığı ve gelişen altyapısı ile yatırım amaçlı satılık ev arayanlar için 
              cazip bir seçenektir.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                    Yatırım Fırsatları
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Karasu Yatırımlık Satılık Ev
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  Karasu'da yatırımlık satılık ev fırsatları. Yatırım potansiyeli yüksek bölgeler, kiralama geliri, 
                  değer artışı ve uzman tavsiyeleri.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* Introduction */}
                <ScrollReveal direction="up" delay={0}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Karasu'da Yatırım Amaçlı Satılık Ev: Stratejik Rehber
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu, yatırım amaçlı satılık ev arayanlar için stratejik bir bölgedir. İstanbul'a yakınlığı, 
                        turizm potansiyeli, denize yakın konumu ve gelişen altyapısı ile yatırım değeri yüksektir.
                      </p>
                      <p>
                        Bu rehber, Karasu'da yatırımlık satılık ev arayanlar için yatırım potansiyeli, kiralama geliri, 
                        değer artışı beklentileri ve dikkat edilmesi gerekenler hakkında kapsamlı bilgi sunmaktadır.
                      </p>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Investment Potential */}
                <ScrollReveal direction="up" delay={200}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Karasu'da Ev Yatırımının Potansiyeli
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da satılık ev yatırımının birçok avantajı vardır. Bu avantajlar hem kısa vadeli gelir 
                        hem de uzun vadeli değer artışı açısından değerlidir.
                      </p>

                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <TrendingUp className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold text-gray-900">Kiralama Geliri</h3>
                          </div>
                          <p className="text-gray-700">
                            Özellikle yazlık evler ve denize yakın konumlar, yaz aylarında yüksek kiralama geliri 
                            sağlayabilir. Turizm potansiyeli kiralama fırsatlarını artırır.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <ChartLine className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold text-gray-900">Değer Artışı</h3>
                          </div>
                          <p className="text-gray-700">
                            İstanbul'a yakınlık, gelişen altyapı ve turizm potansiyeli, uzun vadede değer artışı 
                            sağlayabilir. Bölgesel gelişmeler yatırım değerini destekler.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <Target className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold text-gray-900">Turizm Potansiyeli</h3>
                          </div>
                          <p className="text-gray-700">
                            Karasu'nun turizm potansiyeli, yatırım değerini artırır. Denize yakın konumlar ve 
                            yazlık evler turistler için caziptir.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <DollarSign className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold text-gray-900">Çeşitli Yatırım Seçenekleri</h3>
                          </div>
                          <p className="text-gray-700">
                            Farklı bütçelere uygun yatırım seçenekleri mevcuttur. Daireler, villalar, yazlık evler 
                            ve müstakil evler arasından seçim yapılabilir.
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Best Areas */}
                <ScrollReveal direction="up" delay={400}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Yatırım İçin En Uygun Bölgeler
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da yatırım için en uygun bölgeler, yatırım potansiyeli, kiralama geliri ve değer artışı 
                        açısından değerlendirilmelidir.
                      </p>

                      <div className="space-y-4 mt-6">
                        <div className="border-l-4 border-primary pl-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Denize Yakın Bölgeler</h3>
                          <p className="text-gray-700">
                            Sahil, Yalı Mahallesi ve denize yakın konumlar, yazlık kiralama potansiyeli nedeniyle 
                            yatırım için idealdir. Turizm potansiyeli yüksektir.
                          </p>
                        </div>

                        <div className="border-l-4 border-primary pl-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Merkez Konumlar</h3>
                          <p className="text-gray-700">
                            Merkez mahalleler, sürekli kiralama potansiyeli ve ulaşım avantajları nedeniyle yatırım 
                            değeri yüksektir. Hem oturum hem yatırım amaçlı kullanılabilir.
                          </p>
                        </div>

                        <div className="border-l-4 border-primary pl-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Gelişen Projeler Yakını</h3>
                          <p className="text-gray-700">
                            Yeni konut projeleri, altyapı yatırımları ve turizm gelişmeleri yakınındaki evler, 
                            gelecekteki değer artışı açısından avantajlıdır.
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Investment Strategy */}
                <ScrollReveal direction="up" delay={600}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Yatırım Stratejisi ve Dikkat Edilmesi Gerekenler
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da yatırımlık satılık ev alırken, doğru strateji ve dikkatli değerlendirme önemlidir.
                      </p>

                      <div className="space-y-3 mt-6">
                        <div className="border-l-4 border-primary pl-6">
                          <h4 className="font-semibold text-gray-900 mb-2">Kiralama Potansiyeli</h4>
                          <p className="text-sm text-gray-700">
                            Yatırım yaparken kiralama potansiyelini değerlendirmek önemlidir. Denize yakın yazlık evler 
                            yaz aylarında yüksek gelir sağlayabilir.
                          </p>
                        </div>

                        <div className="border-l-4 border-primary pl-6">
                          <h4 className="font-semibold text-gray-900 mb-2">Bakım Maliyetleri</h4>
                          <p className="text-sm text-gray-700">
                            Yatırım yaparken bakım maliyetlerini göz önünde bulundurmak gerekir. Özellikle yazlık evlerde 
                            kış aylarında bakım ve güvenlik maliyetleri olabilir.
                          </p>
                        </div>

                        <div className="border-l-4 border-primary pl-6">
                          <h4 className="font-semibold text-gray-900 mb-2">Uzun Vadeli Değer Artışı</h4>
                          <p className="text-sm text-gray-700">
                            Yatırım yaparken sadece kısa vadeli gelir değil, uzun vadeli değer artışı da değerlendirilmelidir. 
                            Bölgesel gelişmeler ve projeler önemlidir.
                          </p>
                        </div>
                      </div>

                      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 my-6">
                        <p className="text-sm text-gray-700">
                          <strong>Yatırım Tavsiyesi:</strong> Yatırım yaparken profesyonel emlak danışmanı ile çalışmak, 
                          piyasa analizi yapmak ve uzun vadeli strateji belirlemek önemlidir.
                        </p>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Link to Pillar */}
                <ScrollReveal direction="up" delay={800}>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      Daha Fazla Bilgi
                    </h3>
                    <p className="text-gray-700 mb-4">
                      Karasu'da satılık ev hakkında daha kapsamlı bilgi için{' '}
                      <Link href={`${basePath}/karasu-satilik-ev`} className="text-primary hover:underline font-medium">
                        Karasu Satılık Ev
                      </Link>{' '}
                      rehberimize göz atabilirsiniz.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`${basePath}/karasu-satilik-ev`}>
                        <Button variant="outline" size="sm">
                          Ana Rehber
                        </Button>
                      </Link>
                      <Link href={`${basePath}/karasu-denize-yakin-satilik-ev`}>
                        <Button variant="outline" size="sm">
                          Denize Yakın Evler
                        </Button>
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-20 space-y-6">
                  <ScrollReveal direction="left" delay={100}>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Yatırım İlanları
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Toplam İlan</span>
                          <span className="text-lg font-bold text-gray-900">{investmentListings.length}</span>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="left" delay={200}>
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        İlgili Sayfalar
                      </h3>
                      <div className="space-y-2">
                        <Link href={`${basePath}/karasu-satilik-ev`} className="block text-sm text-primary hover:underline">
                          Karasu Satılık Ev (Ana Rehber)
                        </Link>
                        <Link href={`${basePath}/karasu-merkez-satilik-ev`} className="block text-sm text-primary hover:underline">
                          Merkez Satılık Ev
                        </Link>
                        <Link href={`${basePath}/karasu-denize-yakin-satilik-ev`} className="block text-sm text-primary hover:underline">
                          Denize Yakın Satılık Ev
                        </Link>
                        <Link href={`${basePath}/karasu-mustakil-satilik-ev`} className="block text-sm text-primary hover:underline">
                          Müstakil Satılık Ev
                        </Link>
                        <Link href={`${basePath}/karasu-satilik-ev-fiyatlari`} className="block text-sm text-primary hover:underline">
                          Fiyat Analizi
                        </Link>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        {investmentListings.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Yatırımlık Satılık Ev İlanları
                  </h2>
                  <p className="text-base text-gray-600">
                    {investmentListings.length} adet yatırım potansiyeli yüksek satılık ev ilanı
                  </p>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investmentListings.slice(0, 6).map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
              {investmentListings.length > 6 && (
                <div className="text-center mt-8">
                  <Button asChild size="lg">
                    <Link href={`${basePath}/satilik`}>
                      Tüm İlanları Görüntüle
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
      </main>
    </>
  );
}
