import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Home, Phone } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getListings } from '@/lib/supabase/queries';
import { getHighPriorityQAEntries } from '@/lib/supabase/queries/qa';
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
  const canonicalPath = locale === routing.defaultLocale ? '/karasu-satilik-evler' : `/${locale}/karasu-satilik-evler`;
  
  return {
    title: 'Karasu Satılık Evler | Kapsamlı Rehber ve İlanlar | Karasu Emlak',
    description: 'Karasu\'da satılık ev arayanlar için kapsamlı rehber. Tüm mahalleler, fiyat aralıkları, yatırım fırsatları ve güncel ilanlar.',
    keywords: [
      'karasu satılık ev',
      'karasu satılık daire',
      'karasu satılık villa',
      'karasu satılık yazlık',
      'karasu emlak',
      'karasu yatırım',
      'sakarya karasu satılık ev',
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: 'Karasu Satılık Evler | Kapsamlı Rehber | Karasu Emlak',
      description: 'Karasu\'da satılık ev arayanlar için kapsamlı rehber. Tüm mahalleler, fiyat aralıkları ve yatırım fırsatları.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

// Fetch Q&As from database (with fallback)
// Now uses both ai_questions and qa_entries
async function getKarasuSatilikEvlerFAQs() {
  const allFAQs: Array<{ question: string; answer: string }> = [];
  
  // First, try ai_questions (managed Q&A system)
  try {
    const aiQuestions = await withTimeout(
      getAIQuestionsForPage('karasu-satilik-evler', 'karasu', 'pillar'),
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
      question: 'Karasu\'da satılık ev fiyatları nasıl?',
      answer: 'Karasu\'da satılık ev fiyatları konum, metrekare, oda sayısı ve özelliklere göre değişmektedir. Denize yakın konumlar genellikle daha yüksek fiyatlara sahiptir. Güncel fiyat bilgisi için ilanlarımıza göz atabilir veya bizimle iletişime geçebilirsiniz.',
    },
    {
      question: 'Karasu\'da hangi mahallelerde satılık ev bulunuyor?',
      answer: 'Karasu\'da Merkez, Sahil, Yalı Mahallesi, Liman Mahallesi gibi denize yakın bölgelerde ve diğer mahallelerde satılık ev seçenekleri bulunmaktadır. Her mahallenin kendine özgü avantajları vardır.',
    },
    {
      question: 'Karasu yatırım için uygun mu?',
      answer: 'Evet, Karasu yatırım potansiyeli yüksek bir bölgedir. Özellikle yazlık evler ve denize yakın konumlar yatırımcıların ilgisini çekmektedir. Turizm potansiyeli ve İstanbul\'a yakınlığı ile uzun vadede değer kazanma potansiyeli yüksektir.',
    },
    {
      question: 'Karasu\'da satılık ev alırken nelere dikkat edilmeli?',
      answer: 'Karasu\'da satılık ev alırken konum, fiyat, bina yaşı, yapı durumu, tapu durumu, denize yakınlık ve çevresel faktörler önemlidir. Profesyonel emlak danışmanımız size tüm bu konularda yardımcı olacaktır.',
    },
    {
      question: 'Karasu\'da kredi ile ev alınabilir mi?',
      answer: 'Evet, Karasu\'da kredi ile ev alınabilir. Banka kredisi ve peşinat seçenekleri hakkında bilgi almak için bizimle iletişime geçebilirsiniz. Kredi kullanımı durumunda gerekli belgeler ve süreç hakkında detaylı bilgi verebiliriz.',
    },
  ];
}

export default async function KarasuSatilikEvlerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Get all sale listings
  const allListingsResult = await withTimeout(
    getListings({ status: 'satilik' }, { field: 'created_at', order: 'desc' }, 100, 0),
    3000,
    { listings: [], total: 0 }
  );
  const allListings = allListingsResult?.listings || [];
  const karasuListings = allListings.filter(listing => 
    listing.location_city?.toLowerCase().includes('karasu') ||
    listing.location_neighborhood?.toLowerCase().includes('karasu')
  );

  // Group by property type
  const propertiesByType = {
    daire: karasuListings.filter(l => l.property_type === 'daire'),
    villa: karasuListings.filter(l => l.property_type === 'villa'),
    yazlik: karasuListings.filter(l => l.property_type === 'yazlik'),
    ev: karasuListings.filter(l => l.property_type === 'ev'),
  };

  // Fetch Q&As
  const faqs = await getKarasuSatilikEvlerFAQs();

  // Generate schemas
  const articleSchema = generateArticleSchema({
    headline: 'Karasu Satılık Evler | Kapsamlı Rehber ve İlanlar',
    description: 'Karasu\'da satılık ev arayanlar için kapsamlı rehber. Tüm mahalleler, fiyat aralıkları, yatırım fırsatları ve güncel ilanlar.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Karasu', url: `${siteConfig.url}${basePath}/karasu` },
      { name: 'Karasu Satılık Evler', url: `${siteConfig.url}${basePath}/karasu-satilik-evler` },
    ],
    `${siteConfig.url}${basePath}/karasu-satilik-evler`
  );

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />
      
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Karasu Satılık Evler', href: `${basePath}/karasu-satilik-evler` },
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
                  Karasu Satılık Evler
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  Karasu'da satılık ev arayanlar için kapsamlı rehber. Tüm mahalleler, fiyat aralıkları ve yatırım fırsatları.{' '}
                  <Link href={`${basePath}/`} className="text-white hover:text-primary-300 underline font-medium">
                    Karasu emlak
                  </Link>
                  {' '}sayfamızda tüm emlak seçeneklerini keşfedebilirsiniz.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Property Types Filter */}
        <section className="py-6 bg-white border-b border-gray-200 -mt-4 relative z-20">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={100}>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link 
                  href={`${basePath}/satilik?tip=daire`}
                  className="px-5 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-900 transition-colors text-sm font-medium border border-gray-200 hover:border-primary"
                >
                  Satılık Daire ({propertiesByType.daire.length})
                </Link>
                <Link 
                  href={`${basePath}/satilik?tip=villa`}
                  className="px-5 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-900 transition-colors text-sm font-medium border border-gray-200 hover:border-primary"
                >
                  Satılık Villa ({propertiesByType.villa.length})
                </Link>
                <Link 
                  href={`${basePath}/satilik?tip=yazlik`}
                  className="px-5 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-900 transition-colors text-sm font-medium border border-gray-200 hover:border-primary"
                >
                  Satılık Yazlık ({propertiesByType.yazlik.length})
                </Link>
                <Link 
                  href={`${basePath}/satilik`}
                  className="px-5 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-900 transition-colors text-sm font-medium border border-gray-200 hover:border-primary"
                >
                  Tüm Satılık İlanlar ({allListings.length})
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <ScrollReveal direction="up" delay={0}>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      Karasu Satılık Ev Piyasası
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700">
                      <p>
                        Karasu, Sakarya'nın en gözde sahil ilçelerinden biri olup, satılık ev piyasasında çeşitli seçenekler sunmaktadır. 
                        Denize yakın konumu, yazlık evleri ve modern yaşam alanları ile Karasu emlak piyasası zengin bir yelpazeye sahiptir.
                      </p>
                      <p>
                        Karasu'da satılık ev fiyatları konum, metrekare, oda sayısı ve özelliklere göre değişmektedir. 
                        Denize yakın konumlar genellikle daha yüksek fiyatlara sahiptir. Özellikle yazlık evler ve denize sıfır konumlar 
                        yatırımcıların ilgisini çekmektedir.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={200}>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      Yatırım Fırsatları
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700">
                      <p>
                        Karasu, yatırım potansiyeli yüksek bir bölgedir. Özellikle yazlık evler ve denize yakın konumlar 
                        yatırımcıların ilgisini çekmektedir. Turizm potansiyeli ve İstanbul'a yakınlığı ile uzun vadede 
                        değer kazanma potansiyeli yüksektir.
                      </p>
                      <p>
                        Karasu'da satılık ev alırken konum, fiyat, bina yaşı, yapı durumu, tapu durumu ve çevresel faktörler 
                        önemlidir. Profesyonel emlak danışmanımız size tüm bu konularda yardımcı olacaktır.
                      </p>
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
                        Hızlı İstatistikler
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Toplam İlan</span>
                          <span className="text-lg font-bold text-gray-900">{karasuListings.length}</span>
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
                          İletişime Geçin
                        </Link>
                      </Button>
                    </div>
                  </ScrollReveal>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        {karasuListings.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Karasu Satılık Ev İlanları
                  </h2>
                  <p className="text-base text-gray-600">
                    {karasuListings.length} adet satılık ev ilanı
                  </p>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {karasuListings.slice(0, 9).map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
              {karasuListings.length > 9 && (
                <div className="text-center mt-8">
                  <Button asChild size="lg">
                    <Link href={`${basePath}/satilik`}>
                      Tüm Satılık İlanları Görüntüle
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
                      <p className="text-sm md:text-base text-gray-700">
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
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Karasu'da Hayalinizdeki Evi Bulun
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Uzman emlak danışmanlarımız, Karasu'da satılık ev arayanlar için profesyonel danışmanlık hizmeti sunmaktadır.{' '}
                <Link href={`${basePath}/`} className="text-white hover:text-primary-300 underline font-medium">
                  Karasu emlak
                </Link>
                {' '}sayfamızda tüm emlak seçeneklerini keşfedebilirsiniz.
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

