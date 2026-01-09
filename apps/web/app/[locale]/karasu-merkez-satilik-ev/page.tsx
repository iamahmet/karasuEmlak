import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { MapPin, Building2, ShoppingCart, School, Heart } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getListings } from '@/lib/supabase/queries';
import { getQAEntriesByCategory } from '@/lib/supabase/queries/qa';
import { getAIQuestionsForPage } from '@/lib/supabase/queries/ai-questions';
import { ListingCard } from '@/components/listings/ListingCard';
import { withTimeout } from '@/lib/utils/timeout';
import dynamicImport from 'next/dynamic';

export const dynamic = 'force-dynamic';

const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/karasu-merkez-satilik-ev' : `/${locale}/karasu-merkez-satilik-ev`;
  
  return {
    title: 'Karasu Merkez Satılık Ev | Merkez Mahalle Rehberi | Karasu Emlak',
    description: 'Karasu merkez mahallelerinde satılık ev ilanları. Ulaşım kolaylığı, altyapı avantajları ve merkez konumun avantajları. Güncel ilanlar ve rehber.',
    keywords: [
      'karasu merkez satılık ev',
      'karasu merkez mahalle satılık ev',
      'karasu merkez emlak',
      'karasu merkez konut',
      'karasu şehir merkezi satılık ev',
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: 'Karasu Merkez Satılık Ev | Merkez Mahalle Rehberi',
      description: 'Karasu merkez mahallelerinde satılık ev ilanları ve rehber.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
    },
  };
}

// Fetch Q&As from database (with fallback)
// Now uses both ai_questions and qa_entries
async function getKarasuMerkezFAQs() {
  const allFAQs: Array<{ question: string; answer: string }> = [];
  
  // First, try ai_questions (managed Q&A system)
  try {
    const aiQuestions = await withTimeout(
      getAIQuestionsForPage('karasu-merkez-satilik-ev', 'karasu', 'cornerstone'),
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
    const qaEntries = await withTimeout(getQAEntriesByCategory('karasu', 'bilgi'), 2000, []);
    if (qaEntries && qaEntries.length > 0) {
      // Filter for central/merkez related Q&As
      const merkezQAs = qaEntries.filter(qa => 
        qa.question.toLowerCase().includes('merkez') ||
        qa.question.toLowerCase().includes('mahalle') ||
        qa.question.toLowerCase().includes('konum')
      );
      const relevantQAs = merkezQAs.length > 0 ? merkezQAs : qaEntries;
      
      // Only add if not already in allFAQs (avoid duplicates)
      const existingQuestions = new Set(allFAQs.map(f => f.question.toLowerCase()));
      relevantQAs.forEach(qa => {
        if (!existingQuestions.has(qa.question.toLowerCase()) && allFAQs.length < 5) {
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
    return allFAQs.slice(0, 5);
  }
  
  // Fallback FAQs
  return [
    {
      question: 'Karasu merkezde satılık ev fiyatları nasıl?',
      answer: 'Karasu merkezde satılık ev fiyatları konum, metrekare ve özelliklere göre değişmektedir. Merkez konumun avantajları nedeniyle genellikle biraz daha yüksek fiyatlar görülebilir, ancak ulaşım kolaylığı ve altyapı avantajları bu farkı dengeler.',
    },
    {
      question: 'Karasu merkezde hangi mahallelerde satılık ev var?',
      answer: 'Karasu merkezde Merkez Mahallesi, Atatürk Caddesi çevresi ve merkeze yakın mahallelerde satılık ev seçenekleri bulunmaktadır. Her mahallenin kendine özgü avantajları vardır.',
    },
    {
      question: 'Karasu merkezde ev almanın avantajları nelerdir?',
      answer: 'Karasu merkezde ev almanın avantajları arasında ulaşım kolaylığı, alışveriş merkezlerine yakınlık, okul ve sağlık tesislerine erişim, gelişmiş altyapı ve sosyal olanaklar sayılabilir.',
    },
  ];
}

export default async function KarasuMerkezSatilikEvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Fetch data - filter for central neighborhoods
  const allListingsResult = await withTimeout(
    getListings({ status: 'satilik' }, { field: 'created_at', order: 'desc' }, 1000, 0),
    3000,
    { listings: [], total: 0 }
  );
  
  const { listings: allListings = [] } = allListingsResult || {};
  
  // Filter for central Karasu listings (you can adjust neighborhood names)
  const centralNeighborhoods = ['merkez', 'ataturk', 'cumhuriyet', 'inkum', 'sahil'];
  const centralListings = allListings.filter(listing => {
    const neighborhood = listing.location_neighborhood?.toLowerCase() || '';
    return centralNeighborhoods.some(central => neighborhood.includes(central)) ||
           listing.location_city?.toLowerCase().includes('karasu');
  });

  // Fetch Q&As
  const faqs = await getKarasuMerkezFAQs();

  // Generate schemas
  const articleSchema = generateArticleSchema({
    headline: 'Karasu Merkez Satılık Ev | Merkez Mahalle Rehberi',
    description: 'Karasu merkez mahallelerinde satılık ev ilanları. Ulaşım kolaylığı, altyapı avantajları ve merkez konumun avantajları.',
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
      { name: 'Karasu Merkez Satılık Ev', url: `${siteConfig.url}${basePath}/karasu-merkez-satilik-ev` },
    ],
    `${siteConfig.url}${basePath}/karasu-merkez-satilik-ev`
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
          { label: 'Merkez Satılık Ev', href: `${basePath}/karasu-merkez-satilik-ev` },
        ]}
      />

      {/* AI Overviews: Kısa Cevap Block */}
      <section className="py-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <ScrollReveal direction="up" delay={0}>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Karasu merkezde satılık ev</strong> arayanlar için ulaşım kolaylığı, altyapı avantajları ve 
              merkeze yakınlık önemli avantajlardır. Merkez konumun avantajları nedeniyle fiyatlar biraz daha yüksek 
              olabilir, ancak günlük yaşam kolaylığı ve hizmetlere erişim bu farkı dengeler. Merkez mahallelerde 
              satılık ev seçenekleri geniş bir yelpazede sunulmaktadır.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                    Merkez Konum Avantajları
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Karasu Merkez Satılık Ev
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  Karasu merkez mahallelerinde satılık ev ilanları. Ulaşım kolaylığı, altyapı avantajları 
                  ve merkez konumun sunduğu tüm olanaklar.
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
                      Karasu Merkez: Lokasyon Odaklı Satılık Ev Rehberi
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu merkez, şehrin kalbi olarak hem sürekli oturum hem de yatırım amaçlı ev arayanlar 
                        için cazip seçenekler sunmaktadır. Merkez konumun avantajları, ulaşım kolaylığı, gelişmiş 
                        altyapı ve sosyal olanaklar ile birleştiğinde, Karasu merkez satılık evler özel bir değer kazanır.
                      </p>
                      <p>
                        Bu rehber, Karasu merkez mahallelerinde satılık ev arayanlar için lokasyon avantajları, 
                        mahalle özellikleri ve dikkat edilmesi gerekenler hakkında kapsamlı bilgi sunmaktadır.
                      </p>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Advantages */}
                <ScrollReveal direction="up" delay={200}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Karasu Merkezde Ev Almanın Avantajları
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu merkezde satılık ev almanın birçok avantajı vardır. Bu avantajlar hem günlük yaşam 
                        hem de yatırım açısından değerlidir.
                      </p>

                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <MapPin className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold text-gray-900">Ulaşım Kolaylığı</h3>
                          </div>
                          <p className="text-gray-700">
                            Merkez konum, toplu taşıma araçlarına, ana yollara ve İstanbul'a erişime kolaylık sağlar. 
                            Günlük ulaşım ihtiyaçları için ideal bir konumdur.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <ShoppingCart className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold text-gray-900">Alışveriş ve Hizmetler</h3>
                          </div>
                          <p className="text-gray-700">
                            Marketler, bankalar, eczaneler, restoranlar ve diğer hizmetler yürüme mesafesindedir. 
                            Günlük ihtiyaçlar için merkez konum avantajlıdır.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <School className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold text-gray-900">Eğitim ve Sağlık</h3>
                          </div>
                          <p className="text-gray-700">
                            Okullar, sağlık merkezleri ve hastaneler merkeze yakındır. Aileler için özellikle 
                            eğitim ve sağlık erişimi önemli bir avantajdır.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <Building2 className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold text-gray-900">Gelişmiş Altyapı</h3>
                          </div>
                          <p className="text-gray-700">
                            Su, elektrik, kanalizasyon, internet ve telefon hizmetleri merkezde daha gelişmiş 
                            ve kesintisizdir. Altyapı kalitesi yüksektir.
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Neighborhoods */}
                <ScrollReveal direction="up" delay={400}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Merkez Mahalleler ve Özellikleri
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu merkezde farklı mahalleler bulunmaktadır. Her mahallenin kendine özgü karakteristikleri 
                        ve avantajları vardır.
                      </p>

                      <div className="space-y-4 mt-6">
                        <div className="border-l-4 border-primary pl-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Merkez Mahallesi</h3>
                          <p className="text-gray-700">
                            Şehrin kalbi olan Merkez Mahallesi, tüm hizmetlere yakınlığı ile öne çıkar. 
                            Alışveriş, banka, eczane ve diğer hizmetler yürüme mesafesindedir.
                          </p>
                        </div>

                        <div className="border-l-4 border-primary pl-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Atatürk Caddesi Çevresi</h3>
                          <p className="text-gray-700">
                            Ana cadde üzerinde ve çevresinde bulunan evler, ulaşım kolaylığı ve merkeze yakınlık 
                            avantajlarına sahiptir. Ticari aktivitelerin yoğun olduğu bölgedir.
                          </p>
                        </div>

                        <div className="border-l-4 border-primary pl-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Cumhuriyet Mahallesi</h3>
                          <p className="text-gray-700">
                            Merkeze yakın sakin bir mahalle olan Cumhuriyet Mahallesi, aileler için idealdir. 
                            Okullara ve sağlık tesislerine yakınlık avantajı vardır.
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Considerations */}
                <ScrollReveal direction="up" delay={600}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Merkezde Ev Alırken Dikkat Edilmesi Gerekenler
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu merkezde satılık ev alırken bazı özel durumlar göz önünde bulundurulmalıdır.
                      </p>

                      <div className="space-y-3 mt-6">
                        <div className="flex items-start gap-3">
                          <Heart className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Gürültü Seviyesi</h4>
                            <p className="text-sm text-gray-700">
                              Merkez konum nedeniyle trafik ve ticari aktivite gürültüsü olabilir. 
                              Sakin bir yaşam tercih edenler için bu faktör değerlendirilmelidir.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Heart className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Park Yeri</h4>
                            <p className="text-sm text-gray-700">
                              Merkez konumlarda park yeri bulmak zor olabilir. Otopark özelliği olan evler 
                              tercih edilmelidir.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Heart className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Fiyat Farkı</h4>
                            <p className="text-sm text-gray-700">
                              Merkez konum nedeniyle fiyatlar biraz daha yüksek olabilir, ancak ulaşım ve 
                              hizmet erişimi avantajları bu farkı dengeler.
                            </p>
                          </div>
                        </div>
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
                      <Link href={`${basePath}/karasu-satilik-ev-fiyatlari`}>
                        <Button variant="outline" size="sm">
                          Fiyat Analizi
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
                        Merkez İlanları
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Toplam İlan</span>
                          <span className="text-lg font-bold text-gray-900">{centralListings.length}</span>
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
                        <Link href={`${basePath}/karasu-satilik-ev-fiyatlari`} className="block text-sm text-primary hover:underline">
                          Karasu Satılık Ev Fiyatları
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
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        {centralListings.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Karasu Merkez Satılık Ev İlanları
                  </h2>
                  <p className="text-base text-gray-600">
                    {centralListings.length} adet merkez konumlu satılık ev ilanı
                  </p>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {centralListings.slice(0, 6).map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
              {centralListings.length > 6 && (
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
