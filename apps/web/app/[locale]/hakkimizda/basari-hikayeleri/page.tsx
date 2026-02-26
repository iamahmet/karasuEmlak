import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
import { 
  Award, 
  TrendingUp, 
  Home, 
  Users, 
  CheckCircle, 
  Star,
  MapPin,
  Calendar,
  ArrowRight,
  Quote
} from 'lucide-react';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateOrganizationSchema } from '@/lib/seo/structured-data';
import Link from 'next/link';
import { Button } from '@karasu/ui';

export const revalidate = 3600;

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale 
    ? '/hakkimizda/basari-hikayeleri' 
    : `/${locale}/hakkimizda/basari-hikayeleri`;

  return {
    title: 'Başarı Hikayeleri | Karasu Emlak | Müşteri Başarı Örnekleri',
    description: 'Karasu Emlak ile çalışan müşterilerimizin başarı hikayeleri. Satılık ev alım-satım, kiralama ve yatırım danışmanlığı başarı örnekleri. 500+ mutlu...',
    keywords: [
      'karasu emlak başarı hikayeleri',
      'emlak başarı örnekleri',
      'karasu emlak müşteri yorumları',
      'emlak danışmanlık başarıları',
      'karasu emlak referanslar',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        'tr': `${siteConfig.url}/hakkimizda/basari-hikayeleri`,
        'en': `${siteConfig.url}/en/hakkimizda/basari-hikayeleri`,
      }),
    },
    openGraph: {
      title: 'Başarı Hikayeleri | Karasu Emlak',
      description: 'Karasu Emlak ile çalışan müşterilerimizin başarı hikayeleri ve referansları.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

interface SuccessStory {
  id: string;
  title: string;
  category: 'satilik' | 'kiralik' | 'yatirim' | 'danismanlik';
  clientName: string;
  location: string;
  propertyType: string;
  challenge: string;
  solution: string;
  result: string;
  metrics: {
    value: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  testimonial?: string;
  date: string;
}

const successStories: SuccessStory[] = [
  {
    id: '1',
    title: 'Denize Sıfır Villa Yatırımı',
    category: 'yatirim',
    clientName: 'Mehmet Y.',
    location: 'Karasu Sahil',
    propertyType: 'Villa',
    challenge: 'Yatırım amaçlı denize sıfır bir villa arıyordu. Piyasada birçok seçenek vardı ancak hangisinin en iyi yatırım olacağını bilmiyordu.',
    solution: 'Karasu Emlak ekibi detaylı piyasa analizi yaptı, yatırım potansiyeli yüksek bölgeleri belirledi ve ROI hesaplamaları ile en uygun seçeneği sundu.',
    result: 'Müşterimiz denize sıfır bir villa satın aldı. 2 yıl içinde %35 değer artışı yaşadı ve yaz sezonunda yüksek kira geliri elde etti.',
    metrics: [
      { value: '%35', label: 'Değer Artışı', icon: TrendingUp },
      { value: '2 Yıl', label: 'Yatırım Süresi', icon: Calendar },
      { value: '₺15K/ay', label: 'Ortalama Kira', icon: Home },
    ],
    testimonial: 'Karasu Emlak ekibi sayesinde mükemmel bir yatırım yaptım. Profesyonel danışmanlık ve doğru yönlendirme ile hayalimdeki villa yatırımını gerçekleştirdim.',
    date: '2024-06-15',
  },
  {
    id: '2',
    title: 'Merkez Daire Alım-Satım',
    category: 'satilik',
    clientName: 'Ayşe D.',
    location: 'Karasu Merkez',
    propertyType: 'Daire',
    challenge: 'Eski evini satıp daha büyük bir daire almak istiyordu. Fiyat belirleme ve satış süreci konusunda endişeliydi.',
    solution: 'Emlak değerleme hizmeti ile evinin gerçek piyasa değerini belirledik. Profesyonel fotoğraf çekimi ve pazarlama stratejisi ile hızlıca alıcı bulduk.',
    result: 'Eski evini beklediğinden %12 daha yüksek fiyata sattı. Yeni daireyi de uygun fiyata buldu ve 2 ay içinde taşındı.',
    metrics: [
      { value: '%12', label: 'Fiyat Artışı', icon: TrendingUp },
      { value: '45 Gün', label: 'Satış Süresi', icon: Calendar },
      { value: '₺850K', label: 'Satış Fiyatı', icon: Home },
    ],
    testimonial: 'Tüm süreç boyunca yanımda oldular. Hem satış hem de alım konusunda çok yardımcı oldular. Teşekkürler Karasu Emlak!',
    date: '2024-08-20',
  },
  {
    id: '3',
    title: 'Yazlık Kiralama Başarısı',
    category: 'kiralik',
    clientName: 'Ali K.',
    location: 'Karasu Sahil',
    propertyType: 'Yazlık',
    challenge: 'Yazlık evini kiralayarak ek gelir elde etmek istiyordu ancak kiracı bulma ve kira yönetimi konusunda deneyimi yoktu.',
    solution: 'Kiralama danışmanlığı hizmeti ile kira değerlemesi yaptık, profesyonel sözleşme hazırladık ve güvenilir kiracı bulduk.',
    result: 'Yazlık evini yaz sezonunda yüksek kira ile kiraladı. 3 ayda ₺45,000 gelir elde etti ve tüm süreç sorunsuz geçti.',
    metrics: [
      { value: '₺45K', label: '3 Aylık Gelir', icon: TrendingUp },
      { value: '₺15K/ay', label: 'Kira Fiyatı', icon: Home },
      { value: '%100', label: 'Doluluk Oranı', icon: CheckCircle },
    ],
    testimonial: 'Yazlık evimi kiralama konusunda hiçbir şey bilmiyordum. Karasu Emlak ekibi her adımda yardımcı oldu ve mükemmel sonuç aldım.',
    date: '2024-07-10',
  },
  {
    id: '4',
    title: 'Yatırım Portföyü Oluşturma',
    category: 'yatirim',
    clientName: 'Fatma Ş.',
    location: 'Karasu & Kocaali',
    propertyType: 'Çoklu',
    challenge: 'Emlak yatırımı yapmak istiyordu ancak nereden başlayacağını bilmiyordu. Portföy çeşitlendirmesi ve risk yönetimi konusunda danışmanlık gerekiyordu.',
    solution: 'Yatırım danışmanlığı hizmeti ile kapsamlı bir yatırım stratejisi oluşturduk. Farklı bölgelerde ve farklı emlak türlerinde yatırım yaparak portföyünü çeşitlendirdik.',
    result: '3 farklı bölgede toplam 5 emlak yatırımı yaptı. Portföy değeri 2 yılda %42 arttı ve düzenli kira geliri elde ediyor.',
    metrics: [
      { value: '5', label: 'Emlak Sayısı', icon: Home },
      { value: '%42', label: 'Portföy Artışı', icon: TrendingUp },
      { value: '₺25K/ay', label: 'Toplam Kira', icon: TrendingUp },
    ],
    testimonial: 'Yatırım konusunda çok tecrübesizdim. Karasu Emlak ekibi profesyonel danışmanlık ile portföyümü oluşturmamda çok yardımcı oldu.',
    date: '2024-05-01',
  },
];

export default async function SuccessStoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Hakkımızda', href: `${basePath}/hakkimizda` },
    { label: 'Başarı Hikayeleri', href: `${basePath}/hakkimizda/basari-hikayeleri` },
  ];

  const categoryLabels = {
    satilik: 'Satılık',
    kiralik: 'Kiralık',
    yatirim: 'Yatırım',
    danismanlik: 'Danışmanlık',
  };

  // Generate schema
  const organizationSchema = generateOrganizationSchema({
    name: siteConfig.name,
    description: 'Karasu Emlak başarı hikayeleri ve müşteri referansları',
    url: `${siteConfig.url}${basePath}/hakkimizda/basari-hikayeleri`,
  });

  return (
    <>
      <StructuredData data={organizationSchema} />
      <div className="min-h-screen bg-white">
        <Breadcrumbs items={breadcrumbs} />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-gray-50 py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#006AFF]/10 mb-6">
                <Award className="h-8 w-8 text-[#006AFF]" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6 tracking-tight">
                Başarı Hikayeleri
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                500+ mutlu müşterimizin başarı hikayeleri. Karasu Emlak ile gerçekleştirdikleri emlak hayallerini keşfedin.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-[#006AFF] mb-2">500+</div>
                  <div className="text-sm text-gray-600">Mutlu Müşteri</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-green-600 mb-2">%98</div>
                  <div className="text-sm text-gray-600">Memnuniyet</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-orange-600 mb-2">15+</div>
                  <div className="text-sm text-gray-600">Yıl Deneyim</div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="text-3xl font-bold text-purple-600 mb-2">1000+</div>
                  <div className="text-sm text-gray-600">Tamamlanan İşlem</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid gap-12">
                {successStories.map((story, index) => {
                  const categoryLabel = categoryLabels[story.category];
                  const CategoryIcon = story.category === 'yatirim' ? TrendingUp 
                    : story.category === 'satilik' ? Home
                    : story.category === 'kiralik' ? Home
                    : Users;

                  return (
                    <article
                      key={story.id}
                      className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                    >
                      <div className="md:flex">
                        {/* Left Side - Content */}
                        <div className="flex-1 p-8 lg:p-12">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-[#006AFF]/10 flex items-center justify-center">
                                <CategoryIcon className="h-6 w-6 text-[#006AFF]" />
                              </div>
                              <div>
                                <div className="inline-block px-3 py-1 bg-blue-50 text-[#006AFF] text-sm font-semibold rounded-full mb-2">
                                  {categoryLabel}
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 mb-2">
                                  {story.title}
                                </h2>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500 mb-1">Müşteri</div>
                              <div className="font-semibold text-gray-900">{story.clientName}</div>
                            </div>
                          </div>

                          {/* Location & Property */}
                          <div className="flex items-center gap-4 mb-6 text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{story.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4" />
                              <span>{story.propertyType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(story.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}</span>
                            </div>
                          </div>

                          {/* Challenge, Solution, Result */}
                          <div className="space-y-6 mb-8">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-sm font-bold">1</span>
                                Sorun
                              </h3>
                              <p className="text-gray-700 leading-relaxed pl-10">
                                {story.challenge}
                              </p>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
                                Çözüm
                              </h3>
                              <p className="text-gray-700 leading-relaxed pl-10">
                                {story.solution}
                              </p>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-sm font-bold">3</span>
                                Sonuç
                              </h3>
                              <p className="text-gray-700 leading-relaxed pl-10 font-medium">
                                {story.result}
                              </p>
                            </div>
                          </div>

                          {/* Metrics */}
                          <div className="grid grid-cols-3 gap-4 mb-6">
                            {story.metrics.map((metric, idx) => {
                              const Icon = metric.icon;
                              return (
                                <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                  <Icon className="h-5 w-5 text-[#006AFF] mb-2" />
                                  <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                                  <div className="text-xs text-gray-600">{metric.label}</div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Testimonial */}
                          {story.testimonial && (
                            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                              <Quote className="h-6 w-6 text-[#006AFF] mb-3" />
                              <p className="text-gray-700 italic leading-relaxed">
                                "{story.testimonial}"
                              </p>
                              <div className="mt-4 flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                                <span className="ml-2 text-sm font-semibold text-gray-900">{story.clientName}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-[#006AFF] to-blue-700">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-6">
                Siz de Başarı Hikayenizi Yazın
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Karasu Emlak ile emlak hayallerinizi gerçekleştirin. Profesyonel ekibimiz size yardımcı olmaya hazır.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-[#006AFF] hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
                  asChild
                >
                  <Link href={`${basePath}/iletisim`}>
                    İletişime Geçin
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
                  asChild
                >
                  <Link href={`${basePath}/satilik`}>
                    İlanları İncele
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
