import type { Metadata } from 'next';
import Link from 'next/link';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent, Button } from '@karasu/ui';
import { KARASU_GEZILECEK_YERLER } from '@/lib/local-info/karasu-data';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { getArticles } from '@/lib/supabase/queries/articles';
import { getNewsArticles } from '@/lib/supabase/queries/news';
import { PlaceImage } from '@/components/images/PlaceImage';
import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
import {
  MapPin,
  Camera,
  Waves,
  TreePine,
  Mountain,
  UtensilsCrossed,
  Coffee,
  Clock,
  Star,
  Navigation,
  Calendar,
  Users,
  Award,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Newspaper
} from 'lucide-react';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

const faqs = [
  {
    question: 'Karasu\'da gezilecek en önemli yerler nelerdir?',
    answer: 'Karasu\'da gezilecek en önemli yerler: 20 km uzunluğundaki Karasu Plajı, Acarlar Longozu (dünyanın tek parça halindeki en büyük longozu), Botağzı Bölgesi (Sakarya Nehri\'nin denize döküldüğü nokta) ve sahil yolu. Ayrıca merkez parkı, balık restoranları ve doğa yürüyüş parkurları da görülmeye değer yerlerdir.',
  },
  {
    question: 'Acarlar Longozu\'na nasıl gidilir?',
    answer: 'Acarlar Longozu Karasu\'ya yaklaşık 10 km mesafededir. Özel araç ile ulaşım sağlanabilir. Doğa yürüyüşü ve kuş gözlemi için ideal bir alandır. Giriş ücretlidir ve ziyaret saatleri mevsimsel olarak değişmektedir.',
  },
  {
    question: 'Karasu plajı ücretsiz mi?',
    answer: 'Evet, Karasu plajı halka açık ve ücretsizdir. 20 km uzunluğundaki plajın birçok noktasında plaj tesisleri, şemsiye-koltuk kiralama, restoranlar ve kafeler bulunmaktadır.',
  },
  {
    question: 'Karasu\'da en iyi fotoğraf çekilecek yerler nerede?',
    answer: 'Karasu\'da fotoğraf çekmek için en iyi yerler: Botağzı Bölgesi (gün doğumu ve gün batımı), Acarlar Longozu (doğa fotoğrafçılığı), Karasu Plajı (sahil manzaraları) ve sahil yolu (panoramik manzaralar).',
  },
  {
    question: 'Karasu\'da hangi mevsimde gitmek daha iyi?',
    answer: 'Karasu yaz aylarında (Haziran-Eylül) en popüler dönemdir. Ancak ilkbahar (Nisan-Mayıs) ve sonbahar (Eylül-Ekim) ayları da doğa yürüyüşleri ve daha sakin bir tatil için idealdir. Kış aylarında ise balık restoranları ve doğa yürüyüşleri için uygundur.',
  },
];

// Generate image URL for each place with real estate keywords
function getPlaceImage(placeName: string, type: string, index: number): string {
  // Map place types to real estate/tourism keywords
  const keywordMap: Record<string, string> = {
    'plaj': 'beach,coastal,seaside',
    'dogal-alan': 'nature,landscape,outdoor',
    'turistik-yer': 'tourism,landmark,attraction',
  };

  const keywords = keywordMap[type] || 'real-estate,property';
  const primaryKeyword = keywords.split(',')[0].trim();

  // Generate consistent seed from place name and type
  const seedString = `${primaryKeyword}-${placeName.toLowerCase().replace(/\s+/g, '-')}-${type}-${index}`;
  const seed = seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000;

  // Use Picsum Photos with keyword-based seed
  return `https://picsum.photos/seed/${primaryKeyword}-${seed}/800/600`;
}

// Get icon based on type
function getTypeIcon(type: string) {
  switch (type) {
    case 'plaj':
      return Waves;
    case 'dogal-alan':
      return TreePine;
    case 'turistik-yer':
      return Camera;
    default:
      return MapPin;
  }
}

// Get color scheme based on type
function getTypeColors(type: string) {
  switch (type) {
    case 'plaj':
      return {
        bg: 'from-cyan-50 to-blue-50',
        border: 'border-cyan-100',
        icon: 'bg-cyan-100 text-cyan-600',
        badge: 'bg-cyan-50 text-cyan-700',
        gradient: 'from-cyan-500 to-blue-500',
      };
    case 'dogal-alan':
      return {
        bg: 'from-green-50 to-emerald-50',
        border: 'border-green-100',
        icon: 'bg-green-100 text-green-600',
        badge: 'bg-green-50 text-green-700',
        gradient: 'from-green-500 to-emerald-500',
      };
    case 'turistik-yer':
      return {
        bg: 'from-purple-50 to-pink-50',
        border: 'border-purple-100',
        icon: 'bg-purple-100 text-purple-600',
        badge: 'bg-purple-50 text-purple-700',
        gradient: 'from-purple-500 to-pink-500',
      };
    default:
      return {
        bg: 'from-gray-50 to-slate-50',
        border: 'border-gray-100',
        icon: 'bg-gray-100 text-gray-600',
        badge: 'bg-gray-50 text-gray-700',
        gradient: 'from-gray-500 to-slate-500',
      };
  }
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const revalidate = 3600; // 1 hour
export const dynamicParams = true;



export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Karasu Gezilecek Yerler | Turistik Yerler ve Doğal Güzellikler | Karasu Emlak',
    description: 'Karasu gezilecek yerler: Karasu Plajı, Acarlar Longozu, Botağzı Bölgesi ve diğer turistik yerler. Karasu\'da görülmesi gereken yerler, fotoğraflar, haritalar ve detaylı bilgiler.',
    keywords: [
      'karasu gezilecek yerler',
      'karasu plaj',
      'acarlar longozu',
      'karasu turistik yerler',
      'karasu doğal güzellikler',
      'karasu botağzı',
      'sakarya karasu gezilecek yerler',
      'karasu fotoğraf',
      'karasu harita',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/karasu/gezilecek-yerler`,
      languages: pruneHreflangLanguages({
        'tr': '/karasu/gezilecek-yerler',
        'en': '/en/karasu/gezilecek-yerler',
        'et': '/et/karasu/gezilecek-yerler',
        'ru': '/ru/karasu/gezilecek-yerler',
        'ar': '/ar/karasu/gezilecek-yerler',
      }),
    },
    openGraph: {
      title: 'Karasu Gezilecek Yerler | Turistik Yerler ve Doğal Güzellikler',
      description: 'Karasu gezilecek yerler: Plajlar, doğal alanlar ve turistik mekanlar. Fotoğraflar, haritalar ve detaylı bilgiler.',
      url: `${siteConfig.url}${basePath}/karasu/gezilecek-yerler`,
      type: 'website',
      images: [
        {
          url: `${siteConfig.url}/images/karasu-gezilecek-yerler-og.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Gezilecek Yerler',
        },
      ],
    },
  };
}

export default async function GezilecekYerlerPage({
  params,
}: SearchPageProps) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const plajlar = KARASU_GEZILECEK_YERLER.filter(y => y.type === 'plaj');
  const dogalAlanlar = KARASU_GEZILECEK_YERLER.filter(y => y.type === 'dogal-alan');
  const digerYerler = KARASU_GEZILECEK_YERLER.filter(y => !['plaj', 'dogal-alan'].includes(y.type));

  const faqSchema = generateFAQSchema(faqs);

  // Statistics
  const stats = {
    totalPlaces: KARASU_GEZILECEK_YERLER.length,
    beaches: plajlar.length,
    naturalAreas: dogalAlanlar.length,
    touristPlaces: digerYerler.length,
    beachLength: '20 km',
    bestSeason: 'Haziran - Eylül',
  };

  // Fetch related blog articles and news
  let relatedBlogs: any[] = [];
  let relatedNews: any[] = [];

  try {
    const [blogResult, newsResult] = await Promise.all([
      getArticles(3, 0).catch(() => ({ articles: [], total: 0 })),
      getNewsArticles(3, 0).catch(() => ({ articles: [], total: 0 })),
    ]);

    relatedBlogs = blogResult.articles || [];
    relatedNews = newsResult.articles || [];
  } catch (error) {
    console.error('Error fetching related content:', error);
  }

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: `${basePath}/` },
            { label: 'Karasu', href: `${basePath}/karasu` },
            { label: 'Gezilecek Yerler' },
          ]}
          className="mb-6"
        />

        {/* Hero Section */}
        <section className="mb-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-500 to-emerald-500 p-8 md:p-16 text-white">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-6 h-6" />
                <span className="text-cyan-100 text-sm font-medium">Karasu, Sakarya</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Karasu Gezilecek Yerler
              </h1>
              <p className="text-xl md:text-2xl text-cyan-50 max-w-3xl mb-8 leading-relaxed">
                Doğal güzellikleri, uzun plajları ve eşsiz turistik yerleri ile ziyaretçilerini büyüleyen bir sahil ilçesi. 20 km uzunluğundaki plajı, dünyanın tek parça halindeki en büyük longozu ve Sakarya Nehri'nin denize döküldüğü eşsiz nokta ile doğa severler için ideal bir destinasyon.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">{stats.totalPlaces}</div>
                  <div className="text-sm text-cyan-100">Gezilecek Yer</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">{stats.beachLength}</div>
                  <div className="text-sm text-cyan-100">Plaj Uzunluğu</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">{stats.naturalAreas}</div>
                  <div className="text-sm text-cyan-100">Doğal Alan</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">{stats.beaches}</div>
                  <div className="text-sm text-cyan-100">Plaj</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="mb-12">
          <div className="flex flex-wrap gap-3">
            <a href="#plajlar" className="px-4 py-2 bg-cyan-50 text-cyan-700 rounded-full text-sm font-medium hover:bg-cyan-100 transition-colors flex items-center gap-2">
              <Waves className="w-4 h-4" />
              Plajlar ({plajlar.length})
            </a>
            <a href="#dogal-alanlar" className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium hover:bg-green-100 transition-colors flex items-center gap-2">
              <TreePine className="w-4 h-4" />
              Doğal Alanlar ({dogalAlanlar.length})
            </a>
            <a href="#turistik-yerler" className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Turistik Yerler ({digerYerler.length})
            </a>
            <a href="#sss" className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2">
              <Award className="w-4 h-4" />
              SSS
            </a>
            <a href="#ilgili-icerikler" className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-100 transition-colors flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              İlgili İçerikler
            </a>
          </div>
        </section>

        {/* Plajlar */}
        {plajlar.length > 0 && (
          <section id="plajlar" className="mb-16 scroll-mt-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-cyan-100 rounded-xl">
                  <Waves className="w-6 h-6 text-cyan-600" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Plajlar ve Sahil Alanları
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {plajlar.length} plaj ve sahil alanı
                  </p>
                </div>
              </div>
              <p className="text-lg text-gray-700 max-w-3xl">
                Karasu'nun 20 km uzunluğundaki plajı, ince taneli kumu ve temiz deniziyle ünlüdür. Yaz aylarında binlerce ziyaretçiyi ağırlar. Plaj boyunca tesisler, restoranlar ve aktivite alanları bulunmaktadır.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {plajlar.map((yer, index) => {
                const colors = getTypeColors(yer.type);
                const Icon = getTypeIcon(yer.type);
                const imageUrl = getPlaceImage(yer.name, yer.type, index);

                return (
                  <Card key={yer.name} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
                    <div className="relative h-64 overflow-hidden">
                      <PlaceImage
                        src={imageUrl}
                        alt={yer.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        fallbackSeed={`beach-${index}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <div className={`${colors.icon} px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur-sm`}>
                          <Icon className="w-4 h-4" />
                          <span className="text-xs font-semibold">Plaj</span>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                          {yer.name}
                        </h3>
                        {yer.konum && (
                          <div className="flex items-center gap-2 text-white/90 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{yer.konum}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {yer.aciklama}
                      </p>
                      {yer.ozellikler && yer.ozellikler.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {yer.ozellikler.map((ozellik, idx) => (
                            <span
                              key={idx}
                              className={`${colors.badge} px-3 py-1.5 rounded-full text-xs font-medium`}
                            >
                              {ozellik}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">Önerilen</span>
                        </div>
                        <Button variant="outline" size="sm" className="group/btn">
                          Detaylar
                          <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Doğal Alanlar */}
        {dogalAlanlar.length > 0 && (
          <section id="dogal-alanlar" className="mb-16 scroll-mt-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <TreePine className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Doğal Alanlar ve Koruma Bölgeleri
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {dogalAlanlar.length} doğal alan
                  </p>
                </div>
              </div>
              <p className="text-lg text-gray-700 max-w-3xl">
                Karasu, zengin doğal güzellikleri ve koruma altındaki alanları ile doğa severler için ideal bir destinasyondur. Doğa yürüyüşü, kuş gözlemi ve fotoğrafçılık için mükemmel fırsatlar sunar.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {dogalAlanlar.map((yer, index) => {
                const colors = getTypeColors(yer.type);
                const Icon = getTypeIcon(yer.type);
                const imageUrl = getPlaceImage(yer.name, yer.type, index);

                return (
                  <Card key={yer.name} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
                    <div className="relative h-64 overflow-hidden">
                      <PlaceImage
                        src={imageUrl}
                        alt={yer.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        fallbackSeed={`nature-${index}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <div className={`${colors.icon} px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur-sm`}>
                          <Icon className="w-4 h-4" />
                          <span className="text-xs font-semibold">Doğal Alan</span>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                          {yer.name}
                        </h3>
                        {yer.konum && (
                          <div className="flex items-center gap-2 text-white/90 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{yer.konum}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {yer.aciklama}
                      </p>
                      {yer.ozellikler && yer.ozellikler.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {yer.ozellikler.map((ozellik, idx) => (
                            <span
                              key={idx}
                              className={`${colors.badge} px-3 py-1.5 rounded-full text-xs font-medium`}
                            >
                              {ozellik}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <TreePine className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Doğa Yürüyüşü</span>
                        </div>
                        <Button variant="outline" size="sm" className="group/btn">
                          Detaylar
                          <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Turistik Yerler */}
        {digerYerler.length > 0 && (
          <section id="turistik-yerler" className="mb-16 scroll-mt-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Camera className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Turistik Yerler ve Parklar
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {digerYerler.length} turistik yer
                  </p>
                </div>
              </div>
              <p className="text-lg text-gray-700 max-w-3xl">
                Karasu'nun merkezi ve çevresinde bulunan parklar, yürüyüş yolları ve turistik mekanlar. Aileler ve çocuklar için ideal aktivite alanları.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {digerYerler.map((yer, index) => {
                const colors = getTypeColors(yer.type);
                const Icon = getTypeIcon(yer.type);
                const imageUrl = getPlaceImage(yer.name, yer.type, index);

                return (
                  <Card key={yer.name} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                    <div className="relative h-48 overflow-hidden">
                      <PlaceImage
                        src={imageUrl}
                        alt={yer.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        fallbackSeed={`tourism-${index}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute top-3 left-3">
                        <div className={`${colors.icon} px-2 py-1 rounded-lg backdrop-blur-sm`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-xl font-bold mb-2 text-gray-900">
                        {yer.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-3">
                        {yer.aciklama}
                      </p>
                      {yer.ozellikler && yer.ozellikler.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {yer.ozellikler.slice(0, 3).map((ozellik, idx) => (
                            <span
                              key={idx}
                              className={`${colors.badge} px-2 py-1 rounded-full text-xs font-medium`}
                            >
                              {ozellik}
                            </span>
                          ))}
                        </div>
                      )}
                      {yer.konum && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t">
                          <MapPin className="w-3 h-3" />
                          <span>{yer.konum}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Best Time to Visit */}
        <section className="mb-16">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">
                    En İyi Ziyaret Zamanı
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Karasu'yu ziyaret etmek için en ideal dönemler:
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white/60 rounded-lg p-4">
                      <div className="font-semibold text-gray-900 mb-1">Yaz (Haziran-Eylül)</div>
                      <div className="text-sm text-gray-600">Plaj aktiviteleri, deniz keyfi, en sıcak dönem</div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-4">
                      <div className="font-semibold text-gray-900 mb-1">İlkbahar (Nisan-Mayıs)</div>
                      <div className="text-sm text-gray-600">Doğa yürüyüşleri, daha sakin atmosfer, yeşil doğa</div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-4">
                      <div className="font-semibold text-gray-900 mb-1">Sonbahar (Eylül-Ekim)</div>
                      <div className="text-sm text-gray-600">Balık mevsimi, doğa fotoğrafçılığı, huzurlu tatil</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section id="sss" className="mb-12 scroll-mt-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 rounded-xl">
                <Award className="w-6 h-6 text-gray-600" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Sık Sorulan Sorular
              </h2>
            </div>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-colors shadow-sm">
                <summary className="cursor-pointer flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-semibold pr-4 text-gray-900">
                    {faq.question}
                  </h3>
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* İlgili İçerikler - Blog ve Makaleler */}
        <section id="ilgili-icerikler" className="mb-16 scroll-mt-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  İlgili İçerikler
                </h2>
                <p className="text-gray-600 mt-1">
                  Karasu hakkında daha fazla bilgi edinin
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Blog Yazıları */}
            {relatedBlogs.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold text-gray-900">Blog Yazıları</h3>
                </div>
                <div className="space-y-4">
                  {relatedBlogs.map((article) => (
                    <Link
                      key={article.id}
                      href={`${basePath}/blog/${article.slug}`}
                      className="group block"
                    >
                      <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-primary/50">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                                {article.title}
                              </h4>
                              {article.excerpt && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {article.excerpt}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {article.published_at && (
                                  <span>
                                    {new Date(article.published_at).toLocaleDateString('tr-TR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`${basePath}/blog`}>
                      Tüm Blog Yazıları
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Haberler */}
            {relatedNews.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Newspaper className="w-5 h-5 text-orange-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Haberler</h3>
                </div>
                <div className="space-y-4">
                  {relatedNews.map((news) => (
                    <Link
                      key={news.id}
                      href={`${basePath}/haberler/${news.slug}`}
                      className="group block"
                    >
                      <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-orange-500/50">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center flex-shrink-0">
                              <Newspaper className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                                {news.title}
                              </h4>
                              {news.original_summary && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {news.original_summary}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                {news.published_at && (
                                  <span>
                                    {new Date(news.published_at).toLocaleDateString('tr-TR', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`${basePath}/haberler`}>
                      Tüm Haberler
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-12">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-white border-0">
            <CardContent className="p-8 md:p-12 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Karasu'da Emlak Fırsatları
              </h3>
              <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
                Karasu'nun eşsiz güzelliklerini keşfettiniz. Şimdi bu cennette yaşamak ister misiniz? Satılık ve kiralık emlak fırsatlarını inceleyin.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                  <Link href={`${basePath}/satilik`}>
                    Satılık İlanlar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link href={`${basePath}/kiralik`}>
                    Kiralık İlanlar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
