import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Home, TreePine, Car, Shield } from 'lucide-react';
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

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/karasu-mustakil-satilik-ev' : `/${locale}/karasu-mustakil-satilik-ev`;
  
  return {
    title: 'Karasu Müstakil Satılık Ev | Bahçeli Evler | Karasu Emlak',
    description: 'Karasu\'da müstakil satılık ev ilanları. Bahçeli evler, özel alan, aile yaşamı ve sakin mahalleler. Güncel ilanlar ve rehber.',
    keywords: [
      'karasu müstakil satılık ev',
      'karasu bahçeli satılık ev',
      'karasu müstakil konut',
      'karasu aile evi',
      'karasu bahçeli müstakil',
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: 'Karasu Müstakil Satılık Ev | Bahçeli Evler',
      description: 'Karasu\'da müstakil satılık ev ilanları ve rehber.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
    },
  };
}

// Fetch Q&As from database (with fallback)
// Now uses both ai_questions and qa_entries
async function getKarasuMustakilFAQs() {
  const allFAQs: Array<{ question: string; answer: string }> = [];
  
  // First, try ai_questions (managed Q&A system)
  try {
    const aiQuestions = await withTimeout(
      getAIQuestionsForPage('karasu-mustakil-satilik-ev', 'karasu', 'cornerstone'),
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
      // Filter for standalone/mustakil related Q&As
      const mustakilQAs = qaEntries.filter(qa => 
        qa.question.toLowerCase().includes('müstakil') ||
        qa.question.toLowerCase().includes('bahçe') ||
        qa.question.toLowerCase().includes('ev') ||
        qa.question.toLowerCase().includes('konut')
      );
      const relevantQAs = mustakilQAs.length > 0 ? mustakilQAs : qaEntries;
      
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
      question: 'Karasu\'da müstakil satılık ev fiyatları nasıl?',
      answer: 'Karasu\'da müstakil satılık ev fiyatları konum, metrekare, bahçe büyüklüğü ve özelliklere göre değişmektedir. Genellikle dairelere göre daha yüksek fiyatlara sahiptir ancak bahçe ve özel alan avantajları bu farkı dengeler.',
    },
    {
      question: 'Müstakil evlerin avantajları nelerdir?',
      answer: 'Müstakil evlerin avantajları arasında bahçe, özel alan, komşu gürültüsü olmaması, geniş yaşam alanları ve aile yaşamı için ideal ortam sayılabilir.',
    },
    {
      question: 'Karasu\'da hangi mahallelerde müstakil ev bulunuyor?',
      answer: 'Karasu\'da merkeze yakın sakin mahallelerde ve gelişen bölgelerde müstakil ev seçenekleri bulunmaktadır. Her mahallenin kendine özgü avantajları vardır.',
    },
  ];
}

export default async function KarasuMustakilSatilikEvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Fetch data - filter for standalone houses
  const allListingsResult = await withTimeout(
    getListings({ status: 'satilik', property_type: ['ev'] }, { field: 'created_at', order: 'desc' }, 1000, 0),
    3000,
    { listings: [], total: 0 }
  );
  
  const { listings: allListings = [] } = allListingsResult || {};
  
  // Filter for Karasu standalone houses
  const mustakilListings = allListings.filter(listing => 
    (listing.location_city?.toLowerCase().includes('karasu') ||
     listing.location_neighborhood?.toLowerCase().includes('karasu')) &&
    listing.property_type === 'ev'
  );

  // Fetch Q&As
  const faqs = await getKarasuMustakilFAQs();

  // Generate schemas
  const articleSchema = generateArticleSchema({
    headline: 'Karasu Müstakil Satılık Ev | Bahçeli Evler',
    description: 'Karasu\'da müstakil satılık ev ilanları. Bahçeli evler, özel alan ve aile yaşamı için ideal konutlar.',
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
      { name: 'Müstakil Satılık Ev', url: `${siteConfig.url}${basePath}/karasu-mustakil-satilik-ev` },
    ],
    `${siteConfig.url}${basePath}/karasu-mustakil-satilik-ev`
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
          { label: 'Müstakil Satılık Ev', href: `${basePath}/karasu-mustakil-satilik-ev` },
        ]}
      />

      {/* AI Overviews: Kısa Cevap Block */}
      <section className="py-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <ScrollReveal direction="up" delay={0}>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Karasu'da müstakil satılık ev</strong> arayanlar için özel bahçe, bağımsız yaşam ve geniş 
              alan avantajları önemlidir. Müstakil evler genellikle apartman dairelerinden daha yüksek fiyatlara 
              sahiptir, ancak özel yaşam alanı ve bahçe imkanı bu farkı dengeler. Karasu'da müstakil satılık ev 
              seçenekleri hem sürekli oturum hem de yazlık kullanım için uygundur.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                    Aile Yaşamı İçin İdeal
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Karasu Müstakil Satılık Ev
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  Karasu'da müstakil satılık ev ilanları. Bahçeli evler, özel alan, aile yaşamı ve sakin mahalleler. 
                  Geniş yaşam alanları ve huzurlu ortam.
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
                      Müstakil Ev: Ev Tipi Odaklı Rehber
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da müstakil satılık evler, aileler ve geniş yaşam alanı arayanlar için ideal seçeneklerdir. 
                        Bahçe, özel alan ve komşu gürültüsü olmadan yaşam imkanı sunar.
                      </p>
                      <p>
                        Bu rehber, Karasu'da müstakil satılık ev arayanlar için ev tipi özellikleri, avantajları ve 
                        dikkat edilmesi gerekenler hakkında kapsamlı bilgi sunmaktadır.
                      </p>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Advantages */}
                <ScrollReveal direction="up" delay={200}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Müstakil Evlerin Avantajları
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Müstakil evlerin birçok avantajı vardır. Bu avantajlar hem günlük yaşam hem de yaşam kalitesi 
                        açısından değerlidir.
                      </p>

                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <TreePine className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold text-gray-900">Bahçe ve Özel Alan</h3>
                          </div>
                          <p className="text-gray-700">
                            Müstakil evler genellikle bahçeli olup, özel alan sunar. Çocuklar için oyun alanı, 
                            yetişkinler için dinlenme ve hobi alanı sağlar.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <Shield className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold text-gray-900">Gürültü ve Mahremiyet</h3>
                          </div>
                          <p className="text-gray-700">
                            Komşu gürültüsü olmadan, mahremiyet içinde yaşam imkanı sunar. Sakin ve huzurlu bir 
                            yaşam ortamı sağlar.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <Home className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold text-gray-900">Geniş Yaşam Alanları</h3>
                          </div>
                          <p className="text-gray-700">
                            Müstakil evler genellikle daha geniş yaşam alanlarına sahiptir. Aileler için ideal 
                            oda sayısı ve yaşam alanı sunar.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <div className="flex items-center gap-3 mb-3">
                            <Car className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-semibold text-gray-900">Otopark ve Dış Mekan</h3>
                          </div>
                          <p className="text-gray-700">
                            Özel otopark, garaj ve dış mekan kullanım imkanları müstakil evlerin avantajlarıdır. 
                            Araç ve eşya depolama kolaylığı sağlar.
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Considerations */}
                <ScrollReveal direction="up" delay={400}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Müstakil Ev Alırken Dikkat Edilmesi Gerekenler
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Müstakil ev alırken bazı özel durumlar göz önünde bulundurulmalıdır.
                      </p>

                      <div className="space-y-3 mt-6">
                        <div className="border-l-4 border-primary pl-6">
                          <h4 className="font-semibold text-gray-900 mb-2">Bahçe Bakımı</h4>
                          <p className="text-sm text-gray-700">
                            Bahçeli evlerde düzenli bakım gerekir. Bahçe bakım maliyetleri ve zaman ayırma gerekliliği 
                            değerlendirilmelidir.
                          </p>
                        </div>

                        <div className="border-l-4 border-primary pl-6">
                          <h4 className="font-semibold text-gray-900 mb-2">Isıtma ve Bakım Maliyetleri</h4>
                          <p className="text-sm text-gray-700">
                            Müstakil evlerde ısıtma ve genel bakım maliyetleri apartman dairelerine göre daha yüksek 
                            olabilir. Bu faktör bütçe planlamasında göz önünde bulundurulmalıdır.
                          </p>
                        </div>

                        <div className="border-l-4 border-primary pl-6">
                          <h4 className="font-semibold text-gray-900 mb-2">Güvenlik</h4>
                          <p className="text-sm text-gray-700">
                            Müstakil evlerde güvenlik önlemleri önemlidir. Güvenlik sistemleri ve önlemler 
                            değerlendirilmelidir.
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Link to Pillar */}
                <ScrollReveal direction="up" delay={600}>
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
                        Müstakil Ev İlanları
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Toplam İlan</span>
                          <span className="text-lg font-bold text-gray-900">{mustakilListings.length}</span>
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
                        <Link href={`${basePath}/karasu-yatirimlik-satilik-ev`} className="block text-sm text-primary hover:underline">
                          Yatırımlık Satılık Ev
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
        {mustakilListings.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Karasu Müstakil Satılık Ev İlanları
                  </h2>
                  <p className="text-base text-gray-600">
                    {mustakilListings.length} adet müstakil satılık ev ilanı
                  </p>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mustakilListings.slice(0, 6).map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
              {mustakilListings.length > 6 && (
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
