import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button, Card, CardContent } from '@karasu/ui';
import Link from 'next/link';
import { Building2, CheckCircle, TrendingUp, Home, Phone, Mail, Award, Users, Shield, Target, FileText, BookOpen } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateLocalBusinessSchema, generateFAQSchema } from '@/lib/seo/structured-data';
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
  const canonicalPath = locale === routing.defaultLocale ? '/karasu-emlak-ofisi' : `/${locale}/karasu-emlak-ofisi`;
  
  return {
    title: 'Karasu Emlak Ofisi | Profesyonel Emlak Danışmanlığı | Karasu Emlak',
    description: 'Karasu emlak ofisi olarak 10+ yıllık deneyimimizle ev değerlemesi, satış danışmanlığı, kiralama ve yatırım danışmanlığı hizmetleri sunuyoruz. Karasu\'nun en güvenilir emlak ofisi.',
    keywords: [
      'karasu emlak ofisi',
      'karasu emlak danışmanı',
      'karasu emlakçı',
      'karasu emlak danışmanlığı',
      'karasu emlak hizmetleri',
      'karasu emlak ofisi hizmetleri',
      'karasu emlak değerleme',
      'karasu emlak yatırım danışmanlığı',
      'sakarya karasu emlak ofisi',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': '/karasu-emlak-ofisi',
        'en': '/en/karasu-emlak-ofisi',
        'et': '/et/karasu-emlak-ofisi',
        'ru': '/ru/karasu-emlak-ofisi',
        'ar': '/ar/karasu-emlak-ofisi',
      },
    },
    openGraph: {
      title: 'Karasu Emlak Ofisi | Profesyonel Emlak Danışmanlığı',
      description: 'Karasu emlak ofisi olarak 10+ yıllık deneyimimizle profesyonel emlak danışmanlığı hizmetleri sunuyoruz.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

const officeFAQs = [
  {
    question: 'Karasu emlak ofisi hizmetleri nelerdir?',
    answer: 'Karasu emlak ofisi olarak, ev değerlemesi, satış danışmanlığı, kiralama ve yatırım danışmanlığı hizmetleri sunuyoruz. 10+ yıllık deneyimimizle, müşterilerimize profesyonel emlak danışmanlığı sağlıyoruz. Karasu\'da emlak almak, satmak veya kiralamak isteyenler için kapsamlı hizmetler sunmaktayız.',
  },
  {
    question: 'Karasu emlak danışmanı nasıl seçilir?',
    answer: 'Karasu emlak danışmanı seçerken deneyim, bölge bilgisi, referanslar ve profesyonellik önemlidir. Karasu emlak ofisi olarak, bölgeyi yakından tanıyan, müşteri memnuniyetini ön planda tutan ve şeffaf çalışan danışmanlarımız ile hizmet vermekteyiz.',
  },
  {
    question: 'Karasu emlak ofisi komisyon oranları nasıl?',
    answer: 'Karasu emlak ofisi komisyon oranları, işlem türüne ve gayrimenkul değerine göre değişmektedir. Şeffaf fiyatlandırma politikamız ile önceden belirlenen komisyon oranları hakkında detaylı bilgi alabilirsiniz. Komisyon oranları piyasa standartlarına uygun olarak belirlenmektedir.',
  },
  {
    question: 'Karasu emlak ofisi ev değerleme hizmeti veriyor mu?',
    answer: 'Evet, Karasu emlak ofisi olarak profesyonel ev değerleme hizmeti sunuyoruz. Konum, metrekare, özellikler ve piyasa koşulları dikkate alınarak yapılan değerleme, satış veya kira kararlarınız için güvenilir bir rehberdir.',
  },
  {
    question: 'Karasu emlak ofisi yatırım danışmanlığı hizmeti veriyor mu?',
    answer: 'Evet, Karasu emlak ofisi yatırım danışmanlığı hizmeti sunmaktadır. Yatırımcılara piyasa analizi, yatırım fırsatları ve risk analizi konularında uzman görüş sunmaktayız. Karasu gayrimenkul piyasası, sağlam bir yatırım alanı olarak öne çıkmaktadır.',
  },
];

export default async function KarasuEmlakOfisiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  const localBusinessSchema = generateLocalBusinessSchema();
  const faqSchema = generateFAQSchema(officeFAQs);

  return (
    <>
      <StructuredData data={localBusinessSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Karasu Emlak Ofisi', href: `${basePath}/karasu-emlak-ofisi` },
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
                    10+ Yıllık Deneyim
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Karasu Emlak Ofisi
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  Karasu'da profesyonel emlak danışmanlığı hizmetleri sunan güvenilir emlak ofisi.{' '}
                  <Link href={`${basePath}/`} className="text-white hover:text-primary-300 underline font-medium">
                    Karasu emlak
                  </Link>
                  {' '}sayfamızda tüm emlak seçeneklerini keşfedebilirsiniz. 10+ yıllık deneyimimizle müşterilerimize en iyi hizmeti sunuyoruz.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Karasu Emlak Ofisi Hizmetlerimiz
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Karasu emlak ofisi olarak, müşterilerimize kapsamlı emlak danışmanlığı hizmetleri sunuyoruz.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ScrollReveal direction="up" delay={100}>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ev Değerlemesi</h3>
                  <p className="text-gray-600 text-sm">
                    Profesyonel ev değerleme hizmeti ile gayrimenkulünüzün piyasa değerini objektif kriterlere göre belirliyoruz.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={150}>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Satış Danışmanlığı</h3>
                  <p className="text-gray-600 text-sm">
                    Karasu emlak ofisi olarak, satış sürecinin her aşamasında yanınızdayız. Profesyonel pazarlama ve müzakere desteği.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={200}>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <Home className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Kiralama Hizmetleri</h3>
                  <p className="text-gray-600 text-sm">
                    Kiralık emlak arayanlar ve kiralama yapmak isteyenler için profesyonel danışmanlık ve eşleştirme hizmetleri.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={250}>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Yatırım Danışmanlığı</h3>
                  <p className="text-gray-600 text-sm">
                    Karasu emlak yatırım danışmanlığı ile yatırımcılara piyasa analizi ve en uygun yatırım fırsatlarını sunuyoruz.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-6xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Neden Karasu Emlak Ofisi?
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Karasu emlak ofisi olarak, müşterilerimize en iyi hizmeti sunmak için çalışıyoruz.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ScrollReveal direction="up" delay={100}>
                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">10+ Yıllık Deneyim</h3>
                  <p className="text-gray-600 mb-4">
                    Karasu emlak ofisi olarak, 10+ yıllık deneyimimizle bölgedeki gayrimenkul piyasasını yakından tanıyoruz. 
                    Bu deneyim, müşterilerimize en doğru tavsiyeleri sunmamızı sağlamaktadır.
                  </p>
                  <p className="text-gray-600">
                    Karasu'da emlak almak, satmak veya kiralamak isteyenler için{' '}
                    <Link href={`${basePath}/`} className="text-primary hover:underline font-medium">
                      Karasu emlak
                    </Link>
                    {' '}sayfamızda tüm seçenekleri keşfedebilirsiniz.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={150}>
                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Bölge Uzmanlığı</h3>
                  <p className="text-gray-600 mb-4">
                    Karasu emlak danışmanlarımız, bölgeyi yakından tanıyan ve her mahallenin özelliklerini bilen profesyonellerdir. 
                    Bu uzmanlık, müşterilerimize en uygun seçenekleri bulmamızı sağlamaktadır.
                  </p>
                  <p className="text-gray-600">
                    Karasu emlak ofisi olarak, mahalle bazlı detaylı bilgi ve analiz sunmaktayız.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={200}>
                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Şeffaf İşlem</h3>
                  <p className="text-gray-600 mb-4">
                    Karasu emlak ofisi olarak, tüm işlemlerde şeffaflık ilkesini benimsiyoruz. Komisyon oranları, 
                    işlem süreçleri ve maliyetler hakkında önceden detaylı bilgi veriyoruz.
                  </p>
                  <p className="text-gray-600">
                    Müşterilerimizin güvenini kazanmak için şeffaf çalışma prensibimiz vardır.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={250}>
                <div className="bg-white rounded-xl p-8 border border-gray-200">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Müşteri Memnuniyeti</h3>
                  <p className="text-gray-600 mb-4">
                    Karasu emlak ofisi olarak, müşteri memnuniyetini ön planda tutuyoruz. Her müşterimizin ihtiyacını 
                    anlayarak, en uygun çözümleri sunmaya çalışıyoruz.
                  </p>
                  <p className="text-gray-600">
                    Karasu emlak danışmanlarımız, müşterilerimizin hayallerindeki evi bulmalarına yardımcı olmaktan mutluluk duyuyoruz.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Sık Sorulan Sorular
                </h2>
                <p className="text-lg text-gray-600">
                  Karasu emlak ofisi hakkında merak ettikleriniz
                </p>
              </div>
            </ScrollReveal>

            <div className="space-y-4">
              {officeFAQs.map((faq, index) => (
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

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Karasu Emlak Ofisi ile Çalışın
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Karasu emlak ofisi olarak, müşterilerimize profesyonel emlak danışmanlığı hizmetleri sunuyoruz.{' '}
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
                    Satılık İlanları Görüntüle
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

