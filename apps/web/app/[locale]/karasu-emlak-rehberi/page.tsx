import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { BookOpen, MapPin, Home, TrendingUp, Phone, Info, DollarSign, Building2, Waves, Award } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { getListings, getNeighborhoods } from '@/lib/supabase/queries';
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
  const canonicalPath = locale === routing.defaultLocale ? '/karasu-emlak-rehberi' : `/${locale}/karasu-emlak-rehberi`;
  
  return {
    title: 'Karasu Emlak Rehberi | Kapsamlı Emlak Bilgileri ve Uzman Tavsiyeleri | Karasu Emlak',
    description: 'Karasu emlak rehberi: Karasu\'da emlak almak, satmak veya kiralamak isteyenler için kapsamlı bilgiler, fiyat trendleri, mahalle analizleri ve uzman tavsiyeleri. 2025 güncel rehber.',
    keywords: [
      'karasu emlak',
      'karasu emlak rehberi',
      'karasu satılık ev',
      'karasu kiralık ev',
      'karasu emlak fiyatları',
      'karasu yatırım',
      'karasu mahalleler',
      'karasu denize yakın ev',
      'sakarya karasu emlak',
      'karasu emlak danışmanlığı',
    ],
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': '/karasu-emlak-rehberi',
        'en': '/en/karasu-emlak-rehberi',
        'et': '/et/karasu-emlak-rehberi',
        'ru': '/ru/karasu-emlak-rehberi',
        'ar': '/ar/karasu-emlak-rehberi',
      },
    },
    openGraph: {
      title: 'Karasu Emlak Rehberi | Kapsamlı Emlak Bilgileri',
      description: 'Karasu\'da emlak almak, satmak veya kiralamak isteyenler için kapsamlı bilgiler, fiyat trendleri ve uzman tavsiyeleri.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Emlak Rehberi',
        },
      ],
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Karasu Emlak Rehberi | Kapsamlı Rehber',
      description: 'Karasu\'da emlak işlemleri için kapsamlı rehber ve uzman tavsiyeleri.',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Fetch Q&As from database (with fallback)
// Now uses both qa_entries and ai_questions
async function getKarasuEmlakFAQs() {
  const allFAQs: Array<{ question: string; answer: string }> = [];
  
  // First, try ai_questions (managed Q&A system)
  try {
    const aiQuestions = await withTimeout(
      getAIQuestionsForPage('karasu-emlak-rehberi', 'karasu', 'pillar'),
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
  
  // Fallback FAQs
  return [
    {
      question: "Karasu'da emlak fiyatları nasıl?",
      answer: "Karasu'da emlak fiyatları, konum, metrekare, oda sayısı, bina yaşı ve özelliklere göre değişmektedir. Denize yakın konumlar ve merkez mahalleler genellikle daha yüksek fiyatlara sahiptir. Ortalama fiyat aralığı 500.000 TL ile 3.000.000 TL arasında değişmektedir. Güncel fiyat bilgisi için ilanlarımıza göz atabilir veya bizimle iletişime geçebilirsiniz.",
    },
    {
      question: "Karasu yatırım için uygun mu?",
      answer: "Evet, Karasu yatırım potansiyeli yüksek bir bölgedir. Özellikle yazlık evler, denize yakın konumlar ve turizm potansiyeli yüksek alanlar yatırımcıların ilgisini çekmektedir. İstanbul'a yakınlığı, gelişen altyapısı ve doğal güzellikleri ile uzun vadede değer kazanma potansiyeli yüksektir.",
    },
    {
      question: "Karasu'da hangi mahalleler öne çıkıyor?",
      answer: "Karasu'da Merkez, Sahil, Yalı Mahallesi, Liman Mahallesi, İnköy, Aziziye ve diğer mahalleler öne çıkmaktadır. Her mahallenin kendine özgü avantajları vardır. Denize yakın mahalleler yazlık ve yatırım amaçlı tercih edilirken, merkez mahalleler sürekli oturum için idealdir.",
    },
    {
      question: "Karasu'da emlak alırken nelere dikkat edilmeli?",
      answer: "Karasu'da emlak alırken konum, fiyat, bina yaşı, yapı durumu, tapu durumu, denize yakınlık, ulaşım imkanları ve çevresel faktörler önemlidir. Özellikle yazlık ev alırken kış aylarında bakım ve güvenlik konuları göz önünde bulundurulmalıdır.",
    },
    {
      question: "Karasu'da kredi ile ev alınabilir mi?",
      answer: "Evet, Karasu'da kredi ile ev alınabilir. Banka kredisi ve peşinat seçenekleri hakkında bilgi almak için bizimle iletişime geçebilirsiniz. Genellikle ev değerinin %70-80'i kadar kredi kullanılabilmektedir.",
    },
    {
      question: "Karasu'da emlak alım-satım süreci nasıl işler?",
      answer: "Karasu'da emlak alım-satım süreci genellikle şu adımları içerir: İlan inceleme ve görüntüleme, fiyat pazarlığı, sözleşme imzalama, kapora ödeme, tapu işlemleri, kalan ödeme ve teslim. Tüm süreçte emlak danışmanınız size rehberlik edecektir.",
    },
    {
      question: "Karasu'da yazlık mı sürekli yaşam mı tercih ediliyor?",
      answer: "Karasu'da hem yazlık hem de sürekli yaşam tercihleri görülmektedir. Yaz aylarında nüfus artışı yaşanırken, son yıllarda kalıcı yaşam tercih edenlerin sayısı da artmaktadır. İstanbul'a yakınlığı nedeniyle hafta sonu kaçamakları için de popülerdir.",
    },
    {
      question: "Karasu'da yeni projeler emlak piyasasını nasıl etkiliyor?",
      answer: "Karasu'daki yeni konut ve altyapı projeleri, bölgenin emlak piyasasını olumlu yönde etkileyebilir. Özellikle sahil düzenlemeleri, ulaşım iyileştirmeleri ve turizm yatırımları, çevresindeki konutlara olan ilgiyi artırabilir.",
    },
  ];
}

export default async function KarasuEmlakRehberiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Fetch data with timeout
  const allListingsResult = await withTimeout(
    getListings({}, { field: 'created_at', order: 'desc' }, 100, 0),
    3000,
    { listings: [], total: 0 }
  );
  const allListings = allListingsResult?.listings || [];
  
  // Filter Karasu listings
  const karasuListings = allListings.filter(listing => 
    listing.location_city?.toLowerCase().includes('karasu') ||
    listing.location_neighborhood?.toLowerCase().includes('karasu') ||
    listing.location_district?.toLowerCase().includes('karasu')
  );
  
  const satilikListings = karasuListings.filter(l => l.status === 'satilik');
  const kiralikListings = karasuListings.filter(l => l.status === 'kiralik');
  
  // Get neighborhoods
  const neighborhoodsResult = await withTimeout(getNeighborhoods(), 3000, [] as string[]);
  const neighborhoods = neighborhoodsResult || [];
  
  // Fetch Q&As
  const faqs = await getKarasuEmlakFAQs();
  
  // Generate schemas
  const articleSchema = generateArticleSchema({
    headline: 'Karasu Emlak Rehberi | Kapsamlı Emlak Bilgileri ve Uzman Tavsiyeleri',
    description: 'Karasu\'da emlak almak, satmak veya kiralamak isteyenler için kapsamlı bilgiler, fiyat trendleri, mahalle analizleri ve uzman tavsiyeleri.',
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
      { name: 'Karasu Emlak Rehberi', url: `${siteConfig.url}${basePath}/karasu-emlak-rehberi` },
    ],
    `${siteConfig.url}${basePath}/karasu-emlak-rehberi`
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
          { label: 'Emlak Rehberi' },
        ]}
      />

      {/* AI Overviews: Kısa Cevap Block */}
      <section className="py-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <ScrollReveal direction="up" delay={0}>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Karasu emlak rehberi</strong>, Karasu'da emlak almak, satmak veya kiralamak isteyenler 
              için kapsamlı bilgiler, fiyat trendleri, mahalle analizleri ve uzman tavsiyeleri sunar. Karasu, 
              denize yakın konumları, gelişmiş altyapısı ve yüksek turizm potansiyeli ile hem yaşam hem de 
              yatırım amaçlı tercih edilmektedir.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 text-white py-20 md:py-28 overflow-hidden">
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
                Karasu Emlak Rehberi
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mb-8">
                Karasu'da emlak almak, satmak veya kiralamak isteyenler için kapsamlı bilgiler, 
                fiyat trendleri, mahalle analizleri ve uzman tavsiyeleri.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                  <Link href={`${basePath}/satilik`}>
                    <Home className="w-5 h-5 mr-2" />
                    Satılık İlanlar
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  <Link href={`${basePath}/kiralik`}>
                    Kiralık İlanlar
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 bg-gray-50 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <ScrollReveal direction="up" delay={0}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{satilikListings.length}+</div>
                  <div className="text-sm text-gray-600 font-medium">Satılık İlan</div>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={50}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{kiralikListings.length}+</div>
                  <div className="text-sm text-gray-600 font-medium">Kiralık İlan</div>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={100}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{neighborhoods.length}+</div>
                  <div className="text-sm text-gray-600 font-medium">Mahalle</div>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={150}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">20+</div>
                  <div className="text-sm text-gray-600 font-medium">Yıl Deneyim</div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Article */}
              <article className="lg:col-span-2">
                <ScrollReveal direction="up" delay={0}>
                  <div className="prose prose-lg max-w-none">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Karasu Emlak Piyasası Hakkında</h2>
                    
                    <p className="text-lg text-gray-700 mb-6">
                      Karasu, Sakarya'nın en önemli sahil ilçelerinden biri olarak, emlak piyasasında önemli bir konuma sahiptir. 
                      İstanbul'a yakınlığı, 20 km'lik sahil şeridi, gelişen altyapısı ve doğal güzellikleri ile hem oturum hem de 
                      yatırım amaçlı tercih edilen bir bölgedir.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Emlak Fiyat Trendleri</h3>
                    <p className="text-gray-700 mb-4">
                      Karasu'da emlak fiyatları, konum, metrekare, oda sayısı, bina yaşı ve özelliklere göre değişmektedir. 
                      Denize yakın konumlar ve merkez mahalleler genellikle daha yüksek fiyatlara sahiptir. Ortalama fiyat aralığı 
                      500.000 TL ile 3.000.000 TL arasında değişmektedir.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Mahalle Analizleri</h3>
                    <p className="text-gray-700 mb-4">
                      Karasu'da Merkez, Sahil, Yalı Mahallesi, Liman Mahallesi, İnköy, Aziziye ve diğer mahalleler öne çıkmaktadır. 
                      Her mahallenin kendine özgü avantajları vardır. Denize yakın mahalleler yazlık ve yatırım amaçlı tercih edilirken, 
                      merkez mahalleler sürekli oturum için idealdir.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Yatırım Potansiyeli</h3>
                    <p className="text-gray-700 mb-4">
                      Karasu, yatırım potansiyeli yüksek bir bölgedir. Özellikle yazlık evler, denize yakın konumlar ve turizm potansiyeli 
                      yüksek alanlar yatırımcıların ilgisini çekmektedir. İstanbul'a yakınlığı, gelişen altyapısı ve doğal güzellikleri ile 
                      uzun vadede değer kazanma potansiyeli yüksektir.
                    </p>

                    <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Alım-Satım Süreci</h3>
                    <p className="text-gray-700 mb-4">
                      Karasu'da emlak alım-satım süreci genellikle şu adımları içerir: İlan inceleme ve görüntüleme, fiyat pazarlığı, 
                      sözleşme imzalama, kapora ödeme, tapu işlemleri, kalan ödeme ve teslim. Tüm süreçte emlak danışmanınız size rehberlik edecektir.
                    </p>
                  </div>
                </ScrollReveal>
              </article>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-20 space-y-6">
                  <ScrollReveal direction="left" delay={100}>
                    <div className="bg-primary/10 rounded-xl p-6 border border-primary/20">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        Emlak Danışmanlığı
                      </h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Karasu'da emlak işlemleri için uzman emlak danışmanlarımız size yardımcı olmaktan memnuniyet duyar.
                      </p>
                      <Button asChild className="w-full">
                        <Link href={`${basePath}/iletisim`}>
                          <Phone className="w-4 h-4 mr-2" />
                          İletişime Geçin
                        </Link>
                      </Button>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="left" delay={200}>
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        İlgili Sayfalar
                      </h3>
                      <div className="space-y-2">
                        <Link href={`${basePath}/karasu-satilik-ev`} className="block text-sm text-primary hover:underline">
                          Karasu Satılık Ev
                        </Link>
                        <Link href={`${basePath}/karasu-satilik-ev-fiyatlari`} className="block text-sm text-primary hover:underline">
                          Karasu Satılık Ev Fiyatları
                        </Link>
                        <Link href={`${basePath}/karasu-yatirimlik-gayrimenkul`} className="block text-sm text-primary hover:underline">
                          Yatırımlık Gayrimenkul
                        </Link>
                        <Link href={`${basePath}/karasu/mahalle-karsilastirma`} className="block text-sm text-primary hover:underline">
                          Mahalle Karşılaştırması
                        </Link>
                        <div className="pt-2 mt-2 border-t border-gray-200">
                          <Link href={`${basePath}/kocaali-emlak-rehberi`} className="block text-sm text-primary hover:underline font-medium">
                            Kocaali Emlak Rehberi →
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
                    Öne Çıkan Karasu Emlak İlanları
                  </h2>
                  <p className="text-base text-gray-600">
                    {karasuListings.length} adet emlak ilanı
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
                      Tüm İlanları Görüntüle ({karasuListings.length})
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
                  Karasu emlak rehberi hakkında merak edilenler
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
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Karasu'da Emlak İşlemleriniz İçin Yanınızdayız
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Uzman emlak danışmanlarımız, Karasu'da emlak almak, satmak veya kiralamak isteyenler için 
                profesyonel danışmanlık hizmeti sunmaktadır. Tüm süreçte yanınızdayız.
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
