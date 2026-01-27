import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Waves, Sun, Umbrella, Anchor } from 'lucide-react';
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
  const canonicalPath = locale === routing.defaultLocale ? '/karasu-denize-yakin-satilik-ev' : `/${locale}/karasu-denize-yakin-satilik-ev`;
  
  return {
    title: 'Karasu Denize Yakın Satılık Ev | Sahil Konumları | Karasu Emlak',
    description: 'Karasu\'da denize yakın satılık ev ilanları. Sahil konumları, yazlık evler ve deniz manzaralı konutlar. Lifestyle ve yatırım fırsatları.',
    keywords: [
      'karasu denize yakın satılık ev',
      'karasu sahil satılık ev',
      'karasu deniz manzaralı ev',
      'karasu yazlık ev',
      'karasu denize sıfır ev',
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: 'Karasu Denize Yakın Satılık Ev | Sahil Konumları',
      description: 'Karasu\'da denize yakın satılık ev ilanları ve rehber.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
    },
  };
}

// Fetch Q&As from database (with fallback)
// Now uses both ai_questions and qa_entries
async function getKarasuDenizeYakinFAQs() {
  const allFAQs: Array<{ question: string; answer: string }> = [];
  
  // First, try ai_questions (managed Q&A system)
  try {
    const aiQuestions = await withTimeout(
      getAIQuestionsForPage('karasu-denize-yakin-satilik-ev', 'karasu', 'cornerstone'),
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
      // Filter for sea/coastal related Q&As
      const denizQAs = qaEntries.filter(qa => 
        qa.question.toLowerCase().includes('deniz') ||
        qa.question.toLowerCase().includes('sahil') ||
        qa.question.toLowerCase().includes('yazlık') ||
        qa.question.toLowerCase().includes('yatırım')
      );
      const relevantQAs = denizQAs.length > 0 ? denizQAs : qaEntries;
      
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
      question: 'Karasu\'da denize yakın satılık ev fiyatları nasıl?',
      answer: 'Karasu\'da denize yakın satılık ev fiyatları genellikle daha yüksektir çünkü deniz manzarası ve sahil konumu yatırımcılar ve yazlık arayanlar için caziptir. Fiyatlar konum, metrekare ve özelliklere göre değişmektedir.',
    },
    {
      question: 'Denize yakın evler yatırım için uygun mu?',
      answer: 'Evet, denize yakın evler hem yazlık kullanım hem de yatırım açısından popülerdir. Turizm potansiyeli ve kiralama geliri nedeniyle yatırım değeri yüksektir.',
    },
    {
      question: 'Denize yakın evlerde kış aylarında yaşam nasıl?',
      answer: 'Denize yakın evlerde kış aylarında yaşam genellikle sakin ve huzurludur. Ancak bazı bölgelerde kış aylarında hizmetler sınırlı olabilir. Sürekli oturum için bu faktör değerlendirilmelidir.',
    },
  ];
}

export default async function KarasuDenizeYakinSatilikEvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Fetch data - filter for sea-view/coastal listings
  const allListingsResult = await withTimeout(
    getListings({ status: 'satilik' }, { field: 'created_at', order: 'desc' }, 1000, 0),
    3000,
    { listings: [], total: 0 }
  );
  
  const { listings: allListings = [] } = allListingsResult || {};
  
  // Filter for sea-view/coastal listings
  const coastalListings = allListings.filter(listing => 
    listing.features.seaView === true ||
    listing.location_neighborhood?.toLowerCase().includes('sahil') ||
    listing.location_neighborhood?.toLowerCase().includes('yalı') ||
    listing.location_neighborhood?.toLowerCase().includes('liman') ||
    listing.property_type === 'yazlik'
  );

  // Fetch Q&As
  const faqs = await getKarasuDenizeYakinFAQs();

  // Generate schemas
  const articleSchema = generateArticleSchema({
    headline: 'Karasu Denize Yakın Satılık Ev | Sahil Konumları',
    description: 'Karasu\'da denize yakın satılık ev ilanları. Sahil konumları, yazlık evler ve deniz manzaralı konutlar.',
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
      { name: 'Denize Yakın Satılık Ev', url: `${siteConfig.url}${basePath}/karasu-denize-yakin-satilik-ev` },
    ],
    `${siteConfig.url}${basePath}/karasu-denize-yakin-satilik-ev`
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
          { label: 'Denize Yakın Satılık Ev', href: `${basePath}/karasu-denize-yakin-satilik-ev` },
        ]}
      />

      {/* AI Overviews: Kısa Cevap Block */}
      <section className="py-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <ScrollReveal direction="up" delay={0}>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Karasu'da denize yakın satılık ev</strong> arayanlar için yazlık kullanım, turizm potansiyeli 
              ve doğal güzellikler önemli avantajlardır. Denize yakın konumlar genellikle daha yüksek fiyatlara 
              sahiptir, ancak yaz aylarında kiralama geliri ve yatırım potansiyeli bu farkı dengeler. Denize yakın 
              satılık ev seçenekleri hem oturum hem de yatırım amaçlı tercih edilebilir.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-cyan-900 via-blue-800 to-cyan-900 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                    Lifestyle & Yatırım
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Karasu Denize Yakın Satılık Ev
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  Karasu'da denize yakın satılık ev ilanları. Sahil konumları, yazlık evler ve deniz manzaralı 
                  konutlar. Lifestyle ve yatırım fırsatları.
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
                      Denize Yakın Yaşam: Lifestyle ve Yatırım Fırsatları
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da denize yakın satılık evler, hem yaşam kalitesi hem de yatırım potansiyeli açısından 
                        özel bir değere sahiptir. Deniz manzarası, sahil konumu ve yazlık kullanım imkanları, bu evleri 
                        hem yaşam hem yatırım amaçlı cazip kılar.
                      </p>
                      <p>
                        Bu rehber, Karasu'da denize yakın satılık ev arayanlar için konum avantajları, yatırım potansiyeli 
                        ve dikkat edilmesi gerekenler hakkında kapsamlı bilgi sunmaktadır.
                      </p>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Advantages */}
                <ScrollReveal direction="up" delay={200}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Denize Yakın Evlerin Avantajları
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Denize yakın konumda ev almanın birçok avantajı vardır. Bu avantajlar hem günlük yaşam 
                        hem de yatırım açısından değerlidir.
                      </p>

                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <Waves className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold text-gray-900">Deniz Manzarası</h3>
                          </div>
                          <p className="text-gray-700">
                            Deniz manzarası, günlük yaşam kalitesini artırır ve evin değerini yükseltir. 
                            Manzara, hem yaşam hem yatırım açısından önemli bir değerdir.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <Sun className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold text-gray-900">Yazlık Kullanım</h3>
                          </div>
                          <p className="text-gray-700">
                            Denize yakın evler, yaz aylarında ideal yaşam alanları sunar. Plaj erişimi, 
                            deniz aktiviteleri ve açık hava yaşamı için mükemmeldir.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <Umbrella className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold text-gray-900">Yatırım Potansiyeli</h3>
                          </div>
                          <p className="text-gray-700">
                            Denize yakın evler, turizm potansiyeli ve kiralama geliri nedeniyle yatırım değeri yüksektir. 
                            Özellikle yazlık kiralama geliri önemli bir avantajdır.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <Anchor className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold text-gray-900">Sahil Yaşamı</h3>
                          </div>
                          <p className="text-gray-700">
                            Sahil yürüyüş yolları, plajlar, kafeler ve restoranlar denize yakın konumlarda bulunur. 
                            Aktif ve sosyal bir yaşam tarzı için idealdir.
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Investment Perspective */}
                <ScrollReveal direction="up" delay={400}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Yatırım Açısından Denize Yakın Evler
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Denize yakın evler, yatırım açısından özel bir değere sahiptir. Turizm potansiyeli, 
                        kiralama geliri ve uzun vadeli değer artışı, bu evleri yatırımcılar için cazip kılar.
                      </p>
                      <p>
                        Özellikle yazlık kiralama potansiyeli yüksek olan evler, yatırım getirisi açısından 
                        avantajlıdır. Ancak kış aylarında bakım ve güvenlik konuları göz önünde bulundurulmalıdır.
                      </p>
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                        <p className="text-sm text-gray-700">
                          <strong>Yatırım Tavsiyesi:</strong> Denize yakın ev yatırımı yaparken, kiralama potansiyeli, 
                          bakım maliyetleri ve uzun vadeli değer artışı birlikte değerlendirilmelidir.
                        </p>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Considerations */}
                <ScrollReveal direction="up" delay={600}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Denize Yakın Ev Alırken Dikkat Edilmesi Gerekenler
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Denize yakın ev alırken bazı özel durumlar göz önünde bulundurulmalıdır.
                      </p>

                      <div className="space-y-3 mt-6">
                        <div className="border-l-4 border-primary pl-6">
                          <h4 className="font-semibold text-gray-900 mb-2">Kış Aylarında Bakım</h4>
                          <p className="text-sm text-gray-700">
                            Denize yakın evlerde kış aylarında bakım ve güvenlik önemlidir. Özellikle yazlık evlerde 
                            kış aylarında düzenli kontrol gerekebilir.
                          </p>
                        </div>

                        <div className="border-l-4 border-primary pl-6">
                          <h4 className="font-semibold text-gray-900 mb-2">Nem ve Bakım</h4>
                          <p className="text-sm text-gray-700">
                            Deniz kenarındaki evlerde nem oranı yüksek olabilir. Düzenli bakım ve havalandırma önemlidir.
                          </p>
                        </div>

                        <div className="border-l-4 border-primary pl-6">
                          <h4 className="font-semibold text-gray-900 mb-2">Fiyat Farkı</h4>
                          <p className="text-sm text-gray-700">
                            Denize yakın konum nedeniyle fiyatlar genellikle daha yüksektir. Ancak yatırım potansiyeli 
                            ve yaşam kalitesi bu farkı dengeler.
                          </p>
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
                      <Link href={`${basePath}/karasu-yatirimlik-satilik-ev`}>
                        <Button variant="outline" size="sm">
                          Yatırımlık Evler
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
                        Sahil İlanları
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Toplam İlan</span>
                          <span className="text-lg font-bold text-gray-900">{coastalListings.length}</span>
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
                        <Link href={`${basePath}/karasu-yatirimlik-satilik-ev`} className="block text-sm text-primary hover:underline">
                          Yatırımlık Satılık Ev
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
        {coastalListings.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Denize Yakın Satılık Ev İlanları
                  </h2>
                  <p className="text-base text-gray-600">
                    {coastalListings.length} adet denize yakın satılık ev ilanı
                  </p>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coastalListings.slice(0, 6).map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
              {coastalListings.length > 6 && (
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
