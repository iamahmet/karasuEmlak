import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { TrendingUp, Award, Home, Phone } from 'lucide-react';
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

// Performance: Revalidate every hour for ISR
export const revalidate = 3600; // 1 hour

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/karasu-yatirimlik-gayrimenkul' : `/${locale}/karasu-yatirimlik-gayrimenkul`;
  
  return {
    title: 'Karasu Yatırımlık Gayrimenkul | Yatırım Fırsatları ve Rehber | Karasu Emlak',
    description: 'Karasu\'da yatırımlık gayrimenkul fırsatları. Yatırım potansiyeli yüksek bölgeler, fiyat trendleri ve uzman tavsiyeleri.',
    keywords: [
      'karasu yatırımlık gayrimenkul',
      'karasu yatırım fırsatları',
      'karasu emlak yatırım',
      'karasu yatırım potansiyeli',
      'karasu yatırımlık daire',
      'karasu yatırımlık villa',
      'sakarya yatırım gayrimenkul',
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: 'Karasu Yatırımlık Gayrimenkul | Yatırım Fırsatları | Karasu Emlak',
      description: 'Karasu\'da yatırımlık gayrimenkul fırsatları ve uzman tavsiyeleri.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

// Fetch Q&As from database (with fallback)
// Now uses both ai_questions and qa_entries
async function getKarasuYatirimFAQs() {
  const allFAQs: Array<{ question: string; answer: string }> = [];
  
  // First, try ai_questions (managed Q&A system)
  try {
    const aiQuestions = await withTimeout(
      getAIQuestionsForPage('karasu-yatirimlik-gayrimenkul', 'karasu', 'pillar'),
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
      // Filter for investment-related Q&As
      const investmentQAs = qaEntries.filter(qa => 
        qa.category === 'yatirim' || 
        qa.question.toLowerCase().includes('yatırım') ||
        qa.question.toLowerCase().includes('yatirim')
      );
      const relevantQAs = investmentQAs.length > 0 ? investmentQAs : qaEntries;
      
      // Only add if not already in allFAQs (avoid duplicates)
      const existingQuestions = new Set(allFAQs.map(f => f.question.toLowerCase()));
      relevantQAs.forEach(qa => {
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
      question: 'Karasu\'da gayrimenkul yatırımı yapmak mantıklı mı?',
      answer: 'Evet, Karasu\'da gayrimenkul yatırımı yapmak mantıklıdır. İstanbul\'a yakınlığı, gelişen altyapısı, turizm potansiyeli ve denize yakın konumu nedeniyle yatırım değeri yüksektir. Özellikle yeni otoyol projeleri ve liman yatırımları bölgenin değerini artırmaktadır.',
    },
    {
      question: 'Karasu\'da hangi bölgeler yatırım için daha uygundur?',
      answer: 'Denize yakın bölgeler (Sahil, Yalı mahalleleri) ve merkez konumlar yatırım potansiyeli açısından öne çıkmaktadır. Ayrıca yeni konut projelerinin olduğu bölgeler de uzun vadeli yatırım için uygundur.',
    },
    {
      question: 'Karasu\'da gayrimenkul fiyatları ne durumda?',
      answer: 'Karasu\'da gayrimenkul fiyatları son yıllarda artış eğilimindedir. Denize yakın konumlar ve merkez bölgeler daha yüksek fiyatlara sahiptir. Fiyatlar konum, metrekare, oda sayısı ve denize yakınlık gibi faktörlere göre değişiklik göstermektedir.',
    },
    {
      question: 'Karasu\'da yatırım için hangi gayrimenkul türleri tercih edilmeli?',
      answer: 'Yazlık daireler ve villalar yatırım için en çok tercih edilen türlerdir. Özellikle denize sıfır veya denize yürüme mesafesindeki konutlar hem tatil amaçlı kullanım hem de yatırım getirisi açısından avantajlıdır.',
    },
    {
      question: 'Karasu\'da gayrimenkul yatırımında dikkat edilmesi gerekenler nelerdir?',
      answer: 'Tapu durumu, yapı ruhsatı, imar durumu, denize mesafe, ulaşım kolaylığı, sosyal altyapı ve gelecekteki projeler gibi faktörlere dikkat edilmelidir. Profesyonel bir emlak danışmanı ile çalışmak önemlidir.',
    },
  ];
}

export default async function KarasuYatirimlikGayrimenkulPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  let locale: string;
  try {
    const paramsResult = await params;
    locale = paramsResult.locale;
  } catch (error) {
    console.error('Error getting params:', error);
    locale = routing.defaultLocale;
  }
  
  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Get all sale listings
  const allListingsResult = await withTimeout(
    getListings({ status: 'satilik' }, { field: 'created_at', order: 'desc' }, 100, 0),
    3000,
    { listings: [], total: 0 }
  );
  const allListings = allListingsResult?.listings || [];
  const investmentListings = allListings.filter(listing => 
    (listing.location_city?.toLowerCase().includes('karasu') ||
    listing.location_neighborhood?.toLowerCase().includes('karasu')) &&
    (listing.property_type === 'daire' || listing.property_type === 'villa' || listing.property_type === 'yazlik')
  );

  // Group by property type
  const propertiesByType = {
    daire: investmentListings.filter(l => l.property_type === 'daire').slice(0, 6),
    villa: investmentListings.filter(l => l.property_type === 'villa').slice(0, 6),
    yazlik: investmentListings.filter(l => l.property_type === 'yazlik').slice(0, 6),
  };

  // Fetch Q&As
  const investmentFAQs = await getKarasuYatirimFAQs();

  // Generate schemas
  const articleSchema = generateArticleSchema({
    headline: 'Karasu Yatırımlık Gayrimenkul | Yatırım Fırsatları ve Rehber',
    description: 'Karasu\'da yatırımlık gayrimenkul fırsatları. Yatırım potansiyeli yüksek bölgeler, fiyat trendleri ve uzman tavsiyeleri.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(investmentFAQs);

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Karasu', url: `${siteConfig.url}${basePath}/karasu` },
      { name: 'Karasu Yatırımlık Gayrimenkul', url: `${siteConfig.url}${basePath}/karasu-yatirimlik-gayrimenkul` },
    ],
    `${siteConfig.url}${basePath}/karasu-yatirimlik-gayrimenkul`
  );

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />
      
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Karasu', href: `${basePath}/karasu` },
          { label: 'Yatırımlık Gayrimenkul', href: `${basePath}/karasu-yatirimlik-gayrimenkul` },
        ]}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:40px_40px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Karasu Yatırımlık Gayrimenkul
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  Karasu'da yatırım potansiyeli yüksek gayrimenkul fırsatları.{' '}
                  <Link href={`${basePath}/`} className="text-white hover:text-primary-300 underline font-medium">
                    Karasu emlak
                  </Link>
                  {' '}sayfamızda tüm yatırım seçeneklerini keşfedebilirsiniz. Uzman tavsiyeleri ve güncel ilanlar ile yatırım kararınızı destekleyin.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Investment Overview */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Neden Karasu'da Yatırım?
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 mb-6">
                    Karasu, İstanbul'a sadece 2 saat mesafede, Karadeniz'in sakin ve huzurlu kıyısında yer alan, 
                    yatırım potansiyeli yüksek bir bölgedir. Son yıllarda yapılan altyapı yatırımları ve turizm 
                    gelişimi bölgenin değerini artırmaktadır. Karasu'da yatırım yapmak isteyenler için{' '}
                    <Link href={`${basePath}/`} className="text-primary hover:underline font-medium">
                      Karasu emlak
                    </Link>
                    {' '}sayfamızda tüm yatırım seçeneklerini keşfedebilirsiniz.
                  </p>
                  <ul className="list-disc list-inside space-y-3 text-gray-700">
                    <li>İstanbul'a yakınlık ve ulaşım kolaylığı</li>
                    <li>Denize yakın konum ve turizm potansiyeli</li>
                    <li>Gelişen altyapı ve yeni projeler</li>
                    <li>Uygun fiyat seviyeleri ve yatırım fırsatları</li>
                    <li>Uzun vadede değerlenme potansiyeli</li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Investment Properties by Type */}
        {propertiesByType.daire.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      Yatırımlık Daireler
                    </h2>
                    <p className="text-gray-600">
                      Karasu'da yatırım potansiyeli yüksek daire seçenekleri
                    </p>
                  </div>
                  <Link
                    href={`${basePath}/satilik?tip=daire`}
                    className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-primary transition-colors"
                  >
                    Tümünü Gör
                    <TrendingUp className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertiesByType.daire.map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 100}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {propertiesByType.villa.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      Yatırımlık Villalar
                    </h2>
                    <p className="text-gray-600">
                      Lüks ve yatırım değeri yüksek villa seçenekleri
                    </p>
                  </div>
                  <Link
                    href={`${basePath}/satilik?tip=villa`}
                    className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-primary transition-colors"
                  >
                    Tümünü Gör
                    <TrendingUp className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertiesByType.villa.map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 100}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {propertiesByType.yazlik.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      Yatırımlık Yazlıklar
                    </h2>
                    <p className="text-gray-600">
                      Denize yakın yazlık yatırım fırsatları
                    </p>
                  </div>
                  <Link
                    href={`${basePath}/satilik?tip=yazlik`}
                    className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-primary transition-colors"
                  >
                    Tümünü Gör
                    <TrendingUp className="w-4 h-4" />
                  </Link>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertiesByType.yazlik.map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 100}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
                  Sık Sorulan Sorular
                </h2>
                <div className="space-y-6">
                  {investmentFAQs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {faq.question}
                      </h3>
                      <p className="text-gray-700">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Yatırım Danışmanlığı İçin İletişime Geçin
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Karasu emlak uzmanlarımız ile yatırım fırsatlarını değerlendirin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                  <Link href={`${basePath}/iletisim`}>
                    <Phone className="w-5 h-5 mr-2" />
                    İletişime Geçin
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-gray-800 text-white hover:bg-gray-700">
                  <Link href={`${basePath}/satilik`}>
                    <Home className="w-5 h-5 mr-2" />
                    Tüm Satılık İlanlar
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

