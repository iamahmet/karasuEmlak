import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { BookOpen, MapPin, Home, TrendingUp, Phone, Info, DollarSign } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { getListings } from '@/lib/supabase/queries';
import { ListingCard } from '@/components/listings/ListingCard';
import dynamicImport from 'next/dynamic';

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
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
  const canonicalPath = locale === routing.defaultLocale ? '/kocaali-emlak-rehberi' : `/${locale}/kocaali-emlak-rehberi`;
  
  return {
    title: 'Kocaali Emlak Rehberi | Kapsamlı Emlak Bilgileri | Karasu Emlak',
    description: 'Kocaali emlak rehberi: Kocaali\'de emlak almak, satmak veya kiralamak isteyenler için kapsamlı bilgiler, fiyat trendleri ve uzman tavsiyeleri.',
    keywords: [
      'kocaali emlak',
      'kocaali emlak rehberi',
      'kocaali satılık ev',
      'kocaali kiralık ev',
      'kocaali emlak fiyatları',
      'kocaali yatırım',
      'sakarya kocaali emlak',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        'tr': '/kocaali-emlak-rehberi',
        'en': '/en/kocaali-emlak-rehberi',
        'et': '/et/kocaali-emlak-rehberi',
        'ru': '/ru/kocaali-emlak-rehberi',
        'ar': '/ar/kocaali-emlak-rehberi',
      }),
    },
    openGraph: {
      title: 'Kocaali Emlak Rehberi | Kapsamlı Emlak Bilgileri',
      description: 'Kocaali\'de emlak almak, satmak veya kiralamak isteyenler için kapsamlı bilgiler ve uzman tavsiyeleri.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

const kocaaliEmlakQA = [
  {
    question: "Kocaali'de emlak fiyatları nasıl?",
    answer: "Kocaali'de emlak fiyatları, konum ve özelliklere göre değişmektedir. Sahil hattına yakın bölgelerde fiyatlar daha yüksekken, iç kesimlerde daha uygun seçenekler bulunabilir. Kocaali, Karasu'ya göre genellikle daha uygun fiyatlı bir alternatif sunar.",
  },
  {
    question: "Kocaali yatırım için uygun mu?",
    answer: "Kocaali, Sakarya'nın sahil ilçelerinden biri olarak yatırım potansiyeli taşır. Özellikle denize yakın bölgeler ve gelişmekte olan mahalleler, uzun vadeli yatırımcılar için ilgi çekici olabilir. Karasu ile karşılaştırıldığında, daha uygun giriş fiyatları sunar.",
  },
  {
    question: "Kocaali'de hangi mahalleler öne çıkıyor?",
    answer: "Kocaali'de merkez mahalleler ve sahile yakın bölgeler öne çıkmaktadır. Denize erişimi olan mahalleler, yazlık arayanlar için tercih edilirken, merkez bölgeler kalıcı yaşam için daha uygundur.",
  },
  {
    question: "Kocaali'de yazlık mı sürekli yaşam mı tercih ediliyor?",
    answer: "Kocaali'de hem yazlık hem de sürekli yaşam tercihleri görülmektedir. Yaz aylarında nüfus artışı yaşanırken, son yıllarda kalıcı yaşam tercih edenlerin sayısı da artmaktadır.",
  },
  {
    question: "Kocaali'de yeni projeler emlak piyasasını nasıl etkiliyor?",
    answer: "Kocaali'deki yeni konut ve altyapı projeleri, bölgenin emlak piyasasını olumlu yönde etkileyebilir. Özellikle sahil düzenlemeleri ve ulaşım iyileştirmeleri, çevresindeki konutlara olan ilgiyi artırabilir.",
  },
];

export default async function KocaaliEmlakRehberiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Get Kocaali listings
  const allListings = await getListings({});
  const kocaaliListings = allListings.listings.filter(listing => 
    listing.location_city?.toLowerCase().includes('kocaali') ||
    listing.location_neighborhood?.toLowerCase().includes('kocaali')
  );

  const faqSchema = generateFAQSchema(kocaaliEmlakQA);

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Kocaali', href: `${basePath}/kocaali` },
          { label: 'Emlak Rehberi', href: `${basePath}/kocaali-emlak-rehberi` },
        ]}
      />

      {/* AI Overviews: Kısa Cevap Block */}
      <section className="py-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <ScrollReveal direction="up" delay={0}>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Kocaali emlak rehberi</strong>, Kocaali'de emlak almak, satmak veya kiralamak isteyenler 
              için kapsamlı bilgiler, fiyat trendleri ve uzman tavsiyeleri sunar. Kocaali, Karasu'ya göre genellikle 
              daha uygun fiyatlı seçenekler sunar. Denize yakın konumlar ve merkez mahalleler hem yaşam hem de 
              yatırım amaçlı tercih edilmektedir.
            </p>
          </ScrollReveal>
        </div>
      </section>

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
                    Kapsamlı Rehber
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Kocaali Emlak Rehberi
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  Kocaali'de emlak almak, satmak veya kiralamak isteyenler için kapsamlı bilgiler, fiyat trendleri ve uzman tavsiyeleri.{' '}
                  <Link href={`${basePath}/kocaali`} className="text-white hover:text-primary-300 underline font-medium">
                    Kocaali
                  </Link>
                  {' '}sayfamızda tüm emlak seçeneklerini keşfedebilirsiniz.
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
              <div className="lg:col-span-2 space-y-8">
                <ScrollReveal direction="up" delay={0}>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      Kocaali Emlak Piyasası
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700">
                      <p>
                        Kocaali, Sakarya'nın sahil ilçelerinden biri olarak, emlak piyasasında çeşitli seçenekler sunmaktadır. 
                        Denize yakın konumu ve sakin yaşam alanları ile Kocaali emlak piyasası, hem yazlık hem de kalıcı yaşam 
                        arayanlar için uygun seçenekler içermektedir.
                      </p>
                      <p>
                        Kocaali'de emlak fiyatları, konum ve özelliklere göre değişmektedir. Sahil hattına yakın bölgelerde 
                        fiyatlar daha yüksekken, iç kesimlerde daha uygun seçenekler bulunabilir. Kocaali, Karasu'ya göre 
                        genellikle daha uygun fiyatlı bir alternatif sunar.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={100}>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      Yatırım Potansiyeli
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700">
                      <p>
                        Kocaali, Sakarya'nın sahil ilçelerinden biri olarak yatırım potansiyeli taşır. Özellikle denize yakın 
                        bölgeler ve gelişmekte olan mahalleler, uzun vadeli yatırımcılar için ilgi çekici olabilir. 
                        Karasu ile karşılaştırıldığında, daha uygun giriş fiyatları sunar.
                      </p>
                      <p>
                        Kocaali'deki yeni konut ve altyapı projeleri, bölgenin emlak piyasasını olumlu yönde etkileyebilir. 
                        Özellikle sahil düzenlemeleri ve ulaşım iyileştirmeleri, çevresindeki konutlara olan ilgiyi artırabilir.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={200}>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                      Yaşam Tarzı
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700">
                      <p>
                        Kocaali'de hem yazlık hem de sürekli yaşam tercihleri görülmektedir. Yaz aylarında nüfus artışı yaşanırken, 
                        son yıllarda kalıcı yaşam tercih edenlerin sayısı da artmaktadır. Merkez mahalleler ve sahile yakın 
                        bölgeler öne çıkmaktadır.
                      </p>
                      <p>
                        Denize erişimi olan mahalleler, yazlık arayanlar için tercih edilirken, merkez bölgeler kalıcı yaşam 
                        için daha uygundur. Kocaali, sakin bir sahil ilçesi olarak doğal güzellikleri ve temiz havasıyla 
                        dikkat çeker.
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
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Hızlı Bilgiler
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Toplam İlan</span>
                          <span className="text-lg font-bold text-gray-900">{kocaaliListings.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Satılık</span>
                          <span className="text-lg font-bold text-gray-900">
                            {kocaaliListings.filter(l => l.status === 'satilik').length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Kiralık</span>
                          <span className="text-lg font-bold text-gray-900">
                            {kocaaliListings.filter(l => l.status === 'kiralik').length}
                          </span>
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
                        Kocaali'de emlak işlemleri için uzman danışmanlarımız size yardımcı olmaktan memnuniyet duyar.
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

        {/* Listings Section */}
        {kocaaliListings.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Kocaali Emlak İlanları
                  </h2>
                  <p className="text-base text-gray-600">
                    {kocaaliListings.length} adet aktif ilan
                  </p>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kocaaliListings.slice(0, 6).map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
              {kocaaliListings.length > 6 && (
                <div className="text-center mt-8">
                  <Button asChild size="lg">
                    <Link href={`${basePath}/kocaali`}>
                      Tüm Kocaali İlanlarını Görüntüle
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
                  Kocaali emlak rehberi hakkında merak edilenler
                </p>
              </div>
            </ScrollReveal>

            <div className="space-y-4">
              {kocaaliEmlakQA.map((faq, index) => (
                <ScrollReveal key={index} direction="up" delay={index * 50}>
                  <details className="group bg-gray-50 rounded-xl p-6 border-2 border-gray-200 hover:border-primary transition-all duration-200 hover:shadow-md">
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

        {/* Related Links Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  İlgili Sayfalar
                </h2>
                <p className="text-lg text-gray-600">
                  Kocaali emlak ile ilgili diğer sayfalarımızı keşfedin
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ScrollReveal direction="up" delay={100}>
                <Link href={`${basePath}/kocaali-satilik-ev`} className="block">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Home className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Kocaali Satılık Ev</h3>
                    <p className="text-sm text-gray-600">Kocaali'de satılık ev ilanları</p>
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={150}>
                <Link href={`${basePath}/kocaali-satilik-ev-fiyatlari`} className="block">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Fiyat Analizi</h3>
                    <p className="text-sm text-gray-600">Kocaali emlak fiyatları</p>
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={200}>
                <Link href={`${basePath}/kocaali-yatirimlik-gayrimenkul`} className="block">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Yatırımlık</h3>
                    <p className="text-sm text-gray-600">Yatırım fırsatları</p>
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={250}>
                <Link href={`${basePath}/kocaali`} className="block">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                      <MapPin className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Kocaali Rehberi</h3>
                    <p className="text-sm text-gray-600">Tüm Kocaali bilgileri</p>
                  </div>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Kocaali'de Emlak İşlemleriniz İçin Yanınızdayız
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Uzman emlak danışmanlarımız, Kocaali'de emlak almak, satmak veya kiralamak isteyenler için profesyonel danışmanlık hizmeti sunmaktadır.{' '}
                <Link href={`${basePath}/kocaali`} className="text-white hover:text-primary-300 underline font-medium">
                  Kocaali
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
                  <Link href={`${basePath}/kocaali`}>
                    <BookOpen className="w-5 h-5 mr-2" />
                    Kocaali Sayfasına Git
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

