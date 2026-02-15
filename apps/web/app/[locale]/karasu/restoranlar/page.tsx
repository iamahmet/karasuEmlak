import type { Metadata } from 'next';
import Link from 'next/link';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent, Button } from '@karasu/ui';
import { Phone, MapPin, Utensils, UtensilsCrossed, Coffee, Clock, Star, Award, ChevronRight, Calendar, Fish, ExternalLink, BookOpen, Newspaper, Heart, Users, Navigation } from 'lucide-react';
import { KARASU_RESTORANLAR } from '@/lib/local-info/karasu-data';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { PlaceImage } from '@/components/images/PlaceImage';
import { getArticles } from '@/lib/supabase/queries/articles';
import { getNewsArticles } from '@/lib/supabase/queries/news';

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

const faqs = [
  {
    question: 'Karasu\'da nerede balık yenir?',
    answer: 'Karasu\'da balık yemek için en iyi yerler Botağzı Bölgesi\'ndeki balık restoranlarıdır. Sakarya Nehri\'nin denize döküldüğü bu eşsiz noktada, her mevsim taze balık ve deniz ürünleri bulabilirsiniz. Ayrıca Ahmet Ali\'nin Yeri Restoran, Botağzı Balık Evi ve Karasu Balıkçı Barınağı Restoranı da taze balık ve deniz ürünleri ile ünlüdür.',
  },
  {
    question: 'Karasu\'da kahvaltı nerede yapılır?',
    answer: 'Karasu\'da geleneksel Türk kahvaltısı sunan birçok kahvaltı salonu bulunmaktadır. Merkez ve Sahil mahallelerinde birçok seçenek mevcuttur. Merkez Kahvaltı Evi, organik ürünler ve zengin menü seçenekleri ile öne çıkmaktadır. Hafta sonları özellikle ailelerin tercih ettiği bu mekanlar, uygun fiyatları ve kaliteli hizmeti ile dikkat çekmektedir.',
  },
  {
    question: 'Karasu sahil kafeleri hangi saatlerde açık?',
    answer: 'Karasu sahil kafeleri genellikle sabah 08:00\'de açılıp gece 23:00\'e kadar hizmet vermektedir. Yaz aylarında daha geç saatlere kadar açık olabilir. Plaj Kafe gibi plaj kenarındaki kafeler, plaj aktiviteleri sırasında da hizmet vermektedir. Wi-Fi ve şarj istasyonları bulunan bu mekanlar, hem dinlenmek hem de çalışmak için idealdir.',
  },
  {
    question: 'Botağzı Bölgesi\'ndeki restoranlara nasıl gidilir?',
    answer: 'Botağzı Bölgesi, Karasu merkezine yaklaşık 5 km mesafededir. Özel araç ile ulaşım sağlanabilir. Ayrıca merkezden düzenli minibüs seferleri de bulunmaktadır. Restoranlar genellikle park yeri imkanı sunmaktadır. Özellikle akşam saatlerinde rezervasyon yaptırmanız önerilir.',
  },
  {
    question: 'Karasu\'da hangi mevsimde hangi balık türleri bulunur?',
    answer: 'Karasu\'da mevsimsel balık çeşitleri: İlkbahar (Mart-Mayıs): Levrek, çupra, kefal. Yaz (Haziran-Ağustos): Palamut, lüfer, istavrit. Sonbahar (Eylül-Kasım): Hamsi, palamut, lüfer. Kış (Aralık-Şubat): Mezgit, istavrit, hamsi. Restoranlar genellikle günlük taze balık çeşitlerini menülerinde belirtmektedir.',
  },
  {
    question: 'Karasu restoranlarında rezervasyon yapılabilir mi?',
    answer: 'Evet, özellikle yaz aylarında ve hafta sonlarında rezervasyon yaptırmanız önerilir. Ahmet Ali\'nin Yeri, Botağzı Balık Evi ve Sahil Restoran gibi popüler mekanlar rezervasyon kabul etmektedir. Telefon numaraları üzerinden rezervasyon yapabilirsiniz. Özel günler ve grup yemekleri için önceden rezervasyon yaptırmanız gerekmektedir.',
  },
  {
    question: 'Karasu\'da restoran fiyatları nasıl?',
    answer: 'Karasu\'da restoran fiyatları genellikle uygun seviyededir. Balık restoranlarında fiyatlar balık türüne ve mevsime göre değişmektedir. Kahvaltı salonları ve kafeler daha uygun fiyatlıdır. Özellikle yerel halkın tercih ettiği mekanlar, hem kaliteli hem de uygun fiyatlı hizmet sunmaktadır. Fiyatları önceden sormanız önerilir.',
  },
  {
    question: 'Karasu\'da hangi restoranlar deniz manzarası sunuyor?',
    answer: 'Karasu\'da deniz manzarası sunan birçok restoran bulunmaktadır. Sahil Restoran, Deniz Manzaralı Restoranlar ve plaj kenarındaki kafeler deniz manzarası eşliğinde hizmet vermektedir. Botağzı Bölgesi\'ndeki restoranlar ise hem nehir hem de deniz manzarası sunmaktadır. Özellikle akşam yemekleri için romantik bir atmosfer oluşturmaktadır.',
  },
];

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Karasu Restoranlar ve Yeme-İçme | En İyi Restoranlar | Karasu Emlak',
    description: 'Karasu restoranlar, kafeler ve yeme-içme mekanları. Taze balık restoranları, kahvaltı salonları ve sahil kafeleri. Karasu\'da nerede yenir?',
    keywords: [
      'karasu restoranlar',
      'karasu balık restoranı',
      'karasu kafeler',
      'karasu kahvaltı',
      'karasu nerede yenir',
      'karasu yeme içme',
      'sakarya karasu restoran',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/karasu/restoranlar`,
      languages: pruneHreflangLanguages({
        'tr': '/karasu/restoranlar',
        'en': '/en/karasu/restoranlar',
        'et': '/et/karasu/restoranlar',
        'ru': '/ru/karasu/restoranlar',
        'ar': '/ar/karasu/restoranlar',
      }),
    },
    openGraph: {
      title: 'Karasu Restoranlar ve Yeme-İçme | En İyi Restoranlar',
      description: 'Karasu restoranlar, kafeler ve yeme-içme mekanları bilgileri.',
      url: `${siteConfig.url}${basePath}/karasu/restoranlar`,
      type: 'website',
    },
  };
}

// Generate image URL for restaurants
function getRestaurantImage(name: string, type: string, index: number): string {
  const keywordMap: Record<string, string> = {
    'restoran': 'restaurant,food,dining',
    'balik-restorani': 'seafood,fish,restaurant',
    'kafe': 'cafe,coffee,coastal',
    'kahvalti': 'breakfast,food,morning',
  };
  
  const keywords = keywordMap[type] || 'restaurant,food';
  const primaryKeyword = keywords.split(',')[0].trim();
  const seedString = `${primaryKeyword}-${name.toLowerCase().replace(/\s+/g, '-')}-${type}-${index}`;
  const seed = seedString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000;
  
  return `https://picsum.photos/seed/${primaryKeyword}-${seed}/800/600`;
}

// Get icon based on type
function getRestaurantIcon(type: string) {
  switch (type) {
    case 'balik-restorani':
      return Fish;
    case 'kafe':
      return Coffee;
    case 'kahvalti':
      return UtensilsCrossed;
    default:
      return Utensils;
  }
}

// Get color scheme based on type - Minimal & Dark Mode Support
function getRestaurantColors(type: string) {
  switch (type) {
    case 'balik-restorani':
      return {
        bg: 'bg-primary/5 dark:bg-primary/10',
        border: 'border-primary/20 dark:border-primary/30',
        icon: 'bg-primary/10 dark:bg-primary/20 text-primary',
        badge: 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light',
        gradient: 'from-primary to-primary-dark',
      };
    case 'kafe':
      return {
        bg: 'bg-gray-50 dark:bg-gray-800/50',
        border: 'border-gray-200 dark:border-gray-700',
        icon: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
        badge: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        gradient: 'from-gray-600 to-gray-700',
      };
    case 'kahvalti':
      return {
        bg: 'bg-red-50/50 dark:bg-red-950/20',
        border: 'border-red-200/50 dark:border-red-800/30',
        icon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
        badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        gradient: 'from-red-600 to-red-700',
      };
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-800/50',
        border: 'border-gray-200 dark:border-gray-700',
        icon: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
        badge: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        gradient: 'from-gray-600 to-gray-700',
      };
  }
}

export default async function RestoranlarPage({
  params,
}: SearchPageProps) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const restoranlar = KARASU_RESTORANLAR.filter(r => r.type === 'restoran' || r.type === 'balik-restorani');
  const kafeler = KARASU_RESTORANLAR.filter(r => r.type === 'kafe');
  const digerMekanlar = KARASU_RESTORANLAR.filter(r => !['restoran', 'balik-restorani', 'kafe'].includes(r.type));

  const faqSchema = generateFAQSchema(faqs);

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

  // Statistics
  const stats = {
    totalRestaurants: restoranlar.length,
    cafes: kafeler.length,
    otherPlaces: digerMekanlar.length,
    fishRestaurants: restoranlar.filter(r => r.type === 'balik-restorani').length,
  };

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: `${basePath}/` },
            { label: 'Karasu', href: `${basePath}/karasu` },
            { label: 'Restoranlar' },
          ]}
          className="mb-6"
        />

        {/* Hero Section - Modern & Minimal */}
        <section className="mb-16">
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 md:p-12 lg:p-16">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                backgroundSize: '32px 32px',
              }}></div>
            </div>
            
            <div className="relative z-10">
              {/* Location Badge */}
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                  <Utensils className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Karasu, Sakarya</span>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white tracking-tight">
                Karasu Restoranlar ve Yeme-İçme Rehberi
              </h1>

              {/* Description */}
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mb-10 leading-relaxed">
                Taze balık ve deniz ürünleri ile ünlü sahil ilçesi. Botağzı Bölgesi'ndeki balık restoranları, sahil kafeleri ve geleneksel lezzetlerle dolu bir gastronomi deneyimi.
              </p>
              
              {/* Stats Grid - Minimal Design */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700/50">
                  <div className="text-3xl md:text-4xl font-bold mb-1.5 text-gray-900 dark:text-white">{stats.totalRestaurants}</div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Restoran</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700/50">
                  <div className="text-3xl md:text-4xl font-bold mb-1.5 text-gray-900 dark:text-white">{stats.fishRestaurants}</div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Balık Restoranı</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700/50">
                  <div className="text-3xl md:text-4xl font-bold mb-1.5 text-gray-900 dark:text-white">{stats.cafes}</div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Kafe</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700/50">
                  <div className="text-3xl md:text-4xl font-bold mb-1.5 text-gray-900 dark:text-white">{stats.otherPlaces}</div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Diğer Mekan</div>
                </div>
              </div>

              {/* Accent Line */}
              <div className="mt-10 h-1 w-20 bg-red-600 dark:bg-red-500 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Quick Navigation - Minimal Design */}
        <section className="mb-12">
          <div className="flex flex-wrap gap-3">
            <a href="#balik-restoranlari" className="px-4 py-2.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light rounded-lg text-sm font-medium hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors flex items-center gap-2 border border-primary/20 dark:border-primary/30">
              <Fish className="w-4 h-4" />
              Balık Restoranları ({stats.fishRestaurants})
            </a>
            <a href="#restoranlar" className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 border border-gray-200 dark:border-gray-700">
              <Utensils className="w-4 h-4" />
              Restoranlar ({restoranlar.filter(r => r.type === 'restoran').length})
            </a>
            <a href="#kafeler" className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 border border-gray-200 dark:border-gray-700">
              <Coffee className="w-4 h-4" />
              Kafeler ({stats.cafes})
            </a>
            <a href="#diger-mekanlar" className="px-4 py-2.5 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors flex items-center gap-2 border border-red-200/50 dark:border-red-800/30">
              <UtensilsCrossed className="w-4 h-4" />
              Diğer Mekanlar ({stats.otherPlaces})
            </a>
            <a href="#ilgili-icerikler" className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 border border-gray-200 dark:border-gray-700">
              <BookOpen className="w-4 h-4" />
              İlgili İçerikler
            </a>
          </div>
        </section>

        {/* Botağzı Bölgesi Balık Restoranları - Featured Section */}
        {restoranlar.filter(r => r.type === 'balik-restorani').length > 0 && (
          <section id="balik-restoranlari" className="mb-16 scroll-mt-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Fish className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Botağzı Bölgesi Balık Restoranları
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {stats.fishRestaurants} balık restoranı
                  </p>
                </div>
              </div>
              <p className="text-lg text-gray-700 max-w-3xl">
                Botağzı Bölgesi, Karasu'nun en ünlü balık restoranlarının bulunduğu yerdir. Sakarya Nehri'nin denize döküldüğü eşsiz noktada bulunan bu restoranlar, hem doğal ortam hem de taze balık sunmaktadır.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {restoranlar.filter(r => r.type === 'balik-restorani').map((restoran, index) => {
                const colors = getRestaurantColors(restoran.type);
                const Icon = getRestaurantIcon(restoran.type);
                const imageUrl = getRestaurantImage(restoran.name, restoran.type, index);
                
                return (
                  <Card key={restoran.name} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
                    <div className="relative h-64 overflow-hidden">
                      <PlaceImage
                        src={imageUrl}
                        alt={restoran.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        fallbackSeed={`fish-restaurant-${index}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <div className={`${colors.icon} px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur-sm`}>
                          <Icon className="w-4 h-4" />
                          <span className="text-xs font-semibold">Balık Restoranı</span>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                          {restoran.name}
                        </h3>
                        {restoran.adres && (
                          <div className="flex items-center gap-2 text-white/90 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{restoran.adres}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {restoran.aciklama || 'Taze balık ve deniz ürünleri ile ünlü restoran.'}
                      </p>
                      {restoran.ozellikler && restoran.ozellikler.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {restoran.ozellikler.map((ozellik, idx) => (
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
                        {restoran.telefon && (
                          <a
                            href={`tel:${restoran.telefon.replace(/\s/g, '')}`}
                            className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
                          >
                            <Phone className="h-4 w-4" />
                            {restoran.telefon}
                          </a>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">Önerilen</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Diğer Restoranlar */}
        {restoranlar.filter(r => r.type === 'restoran').length > 0 && (
          <section id="restoranlar" className="mb-16 scroll-mt-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Utensils className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Restoranlar
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {restoranlar.filter(r => r.type === 'restoran').length} restoran
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {restoranlar.filter(r => r.type === 'restoran').map((restoran, index) => {
                const colors = getRestaurantColors(restoran.type);
                const Icon = getRestaurantIcon(restoran.type);
                const imageUrl = getRestaurantImage(restoran.name, restoran.type, index);
                
                return (
                  <Card key={restoran.name} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
                    <div className="relative h-64 overflow-hidden">
                      <PlaceImage
                        src={imageUrl}
                        alt={restoran.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        fallbackSeed={`restaurant-${index}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <div className={`${colors.icon} px-3 py-1.5 rounded-lg flex items-center gap-2 backdrop-blur-sm`}>
                          <Icon className="w-4 h-4" />
                          <span className="text-xs font-semibold">Restoran</span>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                          {restoran.name}
                        </h3>
                        {restoran.adres && (
                          <div className="flex items-center gap-2 text-white/90 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{restoran.adres}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {restoran.aciklama || 'Karasu\'da lezzetli yemekler sunan restoran.'}
                      </p>
                      {restoran.ozellikler && restoran.ozellikler.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {restoran.ozellikler.map((ozellik, idx) => (
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
                        {restoran.telefon && (
                          <a
                            href={`tel:${restoran.telefon.replace(/\s/g, '')}`}
                            className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
                          >
                            <Phone className="h-4 w-4" />
                            {restoran.telefon}
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Sahil Kafeleri */}
        {kafeler.length > 0 && (
          <section id="kafeler" className="mb-16 scroll-mt-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Coffee className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Sahil Kafeleri
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {kafeler.length} kafe
                  </p>
                </div>
              </div>
              <p className="text-lg text-gray-700 max-w-3xl">
                Karasu sahil şeridinde bulunan kafeler, hem deniz manzarası hem de taze içecekler sunmaktadır. Özellikle yaz aylarında tercih edilmektedir.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kafeler.map((kafe, index) => {
                const colors = getRestaurantColors(kafe.type);
                const Icon = getRestaurantIcon(kafe.type);
                const imageUrl = getRestaurantImage(kafe.name, kafe.type, index);
                
                return (
                  <Card key={kafe.name} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                    <div className="relative h-48 overflow-hidden">
                      <PlaceImage
                        src={imageUrl}
                        alt={kafe.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        fallbackSeed={`cafe-${index}`}
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
                        {kafe.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-3">
                        {kafe.aciklama || 'Deniz kenarında keyifli vakit geçirebileceğiniz kafe.'}
                      </p>
                      {kafe.ozellikler && kafe.ozellikler.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {kafe.ozellikler.slice(0, 3).map((ozellik, idx) => (
                            <span
                              key={idx}
                              className={`${colors.badge} px-2 py-1 rounded-full text-xs font-medium`}
                            >
                              {ozellik}
                            </span>
                          ))}
                        </div>
                      )}
                      {kafe.adres && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t">
                          <MapPin className="w-3 h-3" />
                          <span>{kafe.adres}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Kahvaltı Salonları ve Diğer Mekanlar */}
        {digerMekanlar.length > 0 && (
          <section id="diger-mekanlar" className="mb-16 scroll-mt-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <UtensilsCrossed className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                    Kahvaltı Salonları ve Diğer Mekanlar
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {digerMekanlar.length} mekan
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {digerMekanlar.map((mekan, index) => {
                const colors = getRestaurantColors(mekan.type);
                const Icon = getRestaurantIcon(mekan.type);
                const imageUrl = getRestaurantImage(mekan.name, mekan.type, index);
                
                return (
                  <Card key={mekan.name} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
                    <div className="relative h-48 overflow-hidden">
                      <PlaceImage
                        src={imageUrl}
                        alt={mekan.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        fallbackSeed={`other-${index}`}
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
                        {mekan.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-3">
                        {mekan.aciklama || 'Karasu\'da hizmet veren yeme-içme mekanı.'}
                      </p>
                      {mekan.ozellikler && mekan.ozellikler.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {mekan.ozellikler.slice(0, 3).map((ozellik, idx) => (
                            <span
                              key={idx}
                              className={`${colors.badge} px-2 py-1 rounded-full text-xs font-medium`}
                            >
                              {ozellik}
                            </span>
                          ))}
                        </div>
                      )}
                      {mekan.adres && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 pt-3 border-t">
                          <MapPin className="w-3 h-3" />
                          <span>{mekan.adres}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Balık Mevsimleri ve Öneriler - Minimal Design */}
        <section className="mb-16">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                    Balık Mevsimleri ve Öneriler
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Mevsimsel Balık Çeşitleri</h4>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li><strong>İlkbahar (Mart-Mayıs):</strong> Levrek, çupra, kefal, kalkan</li>
                        <li><strong>Yaz (Haziran-Ağustos):</strong> Palamut, lüfer, istavrit, sardalya</li>
                        <li><strong>Sonbahar (Eylül-Kasım):</strong> Hamsi, palamut, lüfer, uskumru</li>
                        <li><strong>Kış (Aralık-Şubat):</strong> Mezgit, istavrit, hamsi, kalkan</li>
                      </ul>
                      <div className="mt-4 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/10 dark:border-primary/20">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong className="text-primary">💡 İpucu:</strong> Balık seçerken gözlerinin parlak, solungaçlarının kırmızı ve pullarının sıkı olmasına dikkat edin. Taze balık kokmaz, deniz kokusu verir.
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Restoran Seçimi İpuçları</h4>
                      <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                        <li>• Balığın taze olup olmadığını kontrol edin</li>
                        <li>• Denize yakın restoranlar genellikle daha taze balık sunar</li>
                        <li>• Özellikle yaz aylarında rezervasyon yaptırın</li>
                        <li>• Fiyatları önceden sorun</li>
                        <li>• Mevsimsel balık çeşitlerini tercih edin</li>
                        <li>• Restoranın temizliğine ve hijyenine dikkat edin</li>
                        <li>• Yerel halkın tercih ettiği mekanları seçin</li>
                      </ul>
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <strong className="text-red-600 dark:text-red-400">📍 Öneri:</strong> Botağzı Bölgesi\'ndeki restoranlar, hem taze balık hem de eşsiz doğal güzellikler sunmaktadır. Özellikle gün batımında rezervasyon yaptırmanızı öneririz.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Restoran Kültürü ve Gelenekler - Minimal Design */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Karasu Restoran Kültürü
                  </h3>
                </div>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Karasu, balık ve deniz ürünleri konusunda zengin bir kültüre sahiptir. Botağzı Bölgesi\'ndeki restoranlar, Sakarya Nehri\'nin denize döküldüğü eşsiz konumları sayesinde hem taze balık hem de doğal güzellikler sunmaktadır.
                  </p>
                  <p>
                    Geleneksel pişirme teknikleri ve yerel lezzetler, Karasu restoranlarının karakteristik özellikleridir. Özellikle balık çeşitleri, mevsimsel olarak değişen menüler ve özel soslarla servis edilmektedir.
                  </p>
                  <p>
                    Restoranlar genellikle aile işletmesi olarak yönetilmekte ve nesiller boyu aktarılan lezzetler sunulmaktadır. Bu durum, hem kalite hem de samimi hizmet anlayışını beraberinde getirmektedir.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <Clock className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Ziyaret Saatleri ve Öneriler
                  </h3>
                </div>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Balık Restoranları</h4>
                    <p className="text-sm">Öğle: 12:00 - 15:00 | Akşam: 18:00 - 23:00</p>
                    <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">En iyi zaman: Akşam saatleri (gün batımı manzarası için)</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Kafeler</h4>
                    <p className="text-sm">Sabah: 08:00 - Gece: 23:00</p>
                    <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Yaz aylarında daha geç saatlere kadar açık</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Kahvaltı Salonları</h4>
                    <p className="text-sm">Sabah: 07:00 - Öğle: 14:00</p>
                    <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">Hafta sonları daha erken dolabilir</p>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong className="text-red-600 dark:text-red-400">⏰ Öneri:</strong> Özellikle yaz aylarında ve hafta sonlarında rezervasyon yaptırmanız önerilir. Balık restoranları için akşam saatlerinde rezervasyon şarttır.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Özel Günler ve Etkinlikler - Minimal Design */}
        <section className="mb-16">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <Calendar className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Özel Günler ve Etkinlikler
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Karasu restoranlarında özel günler ve etkinlikler
                </p>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow bg-white dark:bg-gray-900">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Doğum Günleri
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Özel doğum günü kutlamaları için rezervasyon yaptırabilirsiniz. Pasta ve özel menü seçenekleri mevcuttur.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Rezervasyon: En az 2 gün önceden
                </p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow bg-white dark:bg-gray-900">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Romantik Akşam Yemekleri
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Özellikle Botağzı Bölgesi\'ndeki restoranlar, romantik akşam yemekleri için idealdir. Gün batımı manzarası eşliğinde özel menüler sunulmaktadır.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Önerilen saat: 19:00 - 21:00
                </p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow bg-white dark:bg-gray-900">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Grup Yemekleri
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Aile toplantıları, iş yemekleri ve grup etkinlikleri için özel menüler ve mekan düzenlemeleri yapılmaktadır.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Grup: 10+ kişi için özel fiyatlandırma
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Yol Tarifi ve Ulaşım - Minimal Design */}
        <section className="mb-16">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <Navigation className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    Yol Tarifi ve Ulaşım Bilgileri
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Botağzı Bölgesi Restoranları</h4>
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>• <strong>Karasu Merkez:</strong> 5 km (10 dakika)</li>
                        <li>• <strong>İstanbul:</strong> 150 km (1.5 saat)</li>
                        <li>• <strong>Sakarya:</strong> 50 km (45 dakika)</li>
                        <li>• <strong>Ankara:</strong> 350 km (4 saat)</li>
                      </ul>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                        Botağzı Bölgesi\'ne ulaşım için Karasu merkezden düzenli minibüs seferleri bulunmaktadır. Özel araç ile ulaşım daha kolaydır.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Sahil Restoranları</h4>
                      <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <li>• Sahil şeridi boyunca birçok restoran bulunmaktadır</li>
                        <li>• Merkeze yürüme mesafesindedir</li>
                        <li>• Plaj yolu üzerinde kolay ulaşım</li>
                        <li>• Park yeri mevcuttur</li>
                      </ul>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                        Sahil restoranları, plaj aktiviteleri sonrası kolay ulaşım imkanı sunmaktadır. Özellikle yaz aylarında yürüyüş yolu üzerinde keyifli bir deneyim sunmaktadır.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
                  <Newspaper className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Haberler</h3>
                </div>
                <div className="space-y-4">
                  {relatedNews.map((news) => (
                    <Link
                      key={news.id}
                      href={`${basePath}/haberler/${news.slug}`}
                      className="group block"
                    >
                      <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-800 hover:border-red-500/50 dark:hover:border-red-500/30 bg-white dark:bg-gray-900">
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center flex-shrink-0 border border-red-200/50 dark:border-red-800/30">
                              <Newspaper className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                                {news.title}
                              </h4>
                              {news.original_summary && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                  {news.original_summary}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
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
                            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full border-gray-200 dark:border-gray-800">
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

        {/* CTA Section - Minimal Design */}
        <section className="mb-12">
          <Card className="bg-primary dark:bg-primary-dark text-white border-0">
            <CardContent className="p-8 md:p-12 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                Karasu'da Emlak Fırsatları
              </h3>
              <p className="text-lg text-white/90 dark:text-white/80 mb-6 max-w-2xl mx-auto">
                Karasu'nun lezzetlerini keşfettiniz. Şimdi bu cennette yaşamak ister misiniz? Satılık ve kiralık emlak fırsatlarını inceleyin.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100 dark:bg-white dark:text-primary dark:hover:bg-gray-100">
                  <Link href={`${basePath}/satilik`}>
                    Satılık İlanlar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 dark:border-white dark:text-white dark:hover:bg-white/10">
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

