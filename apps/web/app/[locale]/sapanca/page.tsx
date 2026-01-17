import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import { MapPin, Home, Building2, TrendingUp, Award, Waves, Mountain, BarChart3, Phone, ArrowRight, Shield, Clock, Users, Calendar, BookOpen, Landmark, Factory, GraduationCap, Heart, TreePine, Fish, Coffee, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { getNeighborhoods, getListingStats, getFeaturedListings } from '@/lib/supabase/queries';
import { getArticles } from '@/lib/supabase/queries/articles';
import { CardImage } from '@/components/images';
import { ExternalImage } from '@/components/images';
import { generateSlug } from '@/lib/utils';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { generatePlaceSchema } from '@/lib/seo/local-seo-schemas';
import { ListingCard } from '@/components/listings/ListingCard';
import { withTimeout } from '@/lib/utils/timeout';
import dynamicImport from 'next/dynamic';

const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

const MarketTrendsDashboard = dynamicImport(() => import('@/components/home/MarketTrendsDashboard').then(mod => ({ default: mod.MarketTrendsDashboard })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

const TestimonialsWithSchema = dynamicImport(() => import('@/components/testimonials/TestimonialsWithSchema').then(mod => ({ default: mod.default })), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

const InteractiveMap = dynamicImport(() => import('@/components/map/InteractiveMap').then(mod => ({ default: mod.InteractiveMap })), {
  loading: () => <div className="h-[600px] bg-gray-100 rounded-2xl animate-pulse" />,
});

const QuickToolsSection = dynamicImport(() => import('@/components/home/QuickToolsSection').then(mod => ({ default: mod.QuickToolsSection })), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});

const WeatherWidget = dynamicImport(() => import('@/components/services/WeatherWidget').then(mod => ({ default: mod.WeatherWidget })), {
  loading: () => <div className="h-48 bg-white rounded-lg animate-pulse" />,
});

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/sapanca' : `/${locale}/sapanca`;
  
  return {
    title: 'Sapanca Bungalov & Emlak | Satılık Daire, Yazlık, Günlük Kiralık | Sapanca, Sakarya',
    description: 'Sapanca\'da bungalov, satılık daire, yazlık ve günlük kiralık seçenekleri. Sapanca Gölü çevresinde emlak fiyatları, yatırım fırsatları ve bölge rehberi.',
    keywords: [
      'sapanca bungalov',
      'sapanca satılık daire',
      'sapanca satılık yazlık',
      'sapanca satılık bungalov',
      'sapanca günlük kiralık',
      'sapanca emlak',
      'sapanca gölü',
      'sakarya sapanca emlak',
      'sapanca yatırım',
      'sapanca emlak fiyatları',
      'sapanca kiralık bungalov',
      'sapanca tatil',
      'sapanca gezilecek yerler',
      'sapanca emlak danışmanlığı',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': '/sapanca',
        'en': '/en/sapanca',
        'et': '/et/sapanca',
        'ru': '/ru/sapanca',
        'ar': '/ar/sapanca',
      },
    },
    openGraph: {
      title: 'Sapanca Bungalov & Emlak | Satılık Daire, Yazlık, Günlük Kiralık',
      description: 'Sapanca\'da bungalov, satılık daire, yazlık ve günlük kiralık seçenekleri. Sapanca Gölü çevresinde emlak fırsatları.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

const sapancaFAQs = [
  {
    question: 'Sapanca\'da bungalov fiyatları nasıl?',
    answer: 'Sapanca\'da bungalov fiyatları konum, metrekare, özellikler ve göl manzarasına göre değişmektedir. Göl kenarı bungalovlar genellikle daha yüksek fiyatlara sahiptir. Günlük kiralık bungalovlar sezona göre 500-2000 TL arasında değişebilir. Satılık bungalovlar ise 800 bin - 3 milyon TL aralığındadır.',
  },
  {
    question: 'Sapanca\'da günlük kiralık bungalov bulmak kolay mı?',
    answer: 'Evet, Sapanca\'da günlük kiralık bungalov seçenekleri oldukça fazladır. Özellikle yaz sezonunda (Haziran-Eylül) talep yüksektir. Erken rezervasyon yapmak avantajlıdır. Kış sezonunda daha uygun fiyatlar bulunabilir.',
  },
  {
    question: 'Sapanca\'da satılık daire fiyatları ne kadar?',
    answer: 'Sapanca\'da satılık daire fiyatları konum ve özelliklere göre değişmektedir. Göl kenarı daireler 1.5-3 milyon TL, merkez daireler 800 bin - 1.5 milyon TL arasında değişmektedir. Yeni yapılar ve göl manzaralı daireler daha yüksek fiyatlıdır.',
  },
  {
    question: 'Sapanca yatırım için uygun mu?',
    answer: 'Evet, Sapanca yatırım potansiyeli yüksek bir bölgedir. Özellikle günlük kiralık bungalovlar ve göl kenarı konutlar yatırımcıların ilgisini çekmektedir. Turizm potansiyeli ve İstanbul\'a yakınlığı ile uzun vadede değer kazanma potansiyeli yüksektir.',
  },
  {
    question: 'Sapanca\'da yaşam nasıl?',
    answer: 'Sapanca, sakin bir göl kasabası olarak doğal güzellikleri ve temiz havasıyla dikkat çeker. Sapanca Gölü çevresinde yürüyüş yolları, restoranlar ve aktivite alanları bulunmaktadır. Hem yazlık hem de kalıcı yaşam için ideal bir bölgedir.',
  },
  {
    question: 'Sapanca\'da hangi bölgeler öne çıkıyor?',
    answer: 'Sapanca\'da göl kenarı bölgeler, merkez ve çevre mahalleler emlak seçenekleri sunmaktadır. Göl kenarı bölgeler hem yaşam kalitesi hem yatırım değeri açısından avantajlıdır. Merkez bölgeler ise ulaşım ve hizmetler açısından pratik seçeneklerdir.',
  },
];

export default async function SapancaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Resolve params first (outside try-catch to avoid re-awaiting in catch)
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  try {
    // Fetch real data with timeout (3s max) - graceful degradation
    const neighborhoodsResult = await withTimeout(getNeighborhoods(), 3000, [] as string[]);
    const statsResult = await withTimeout(getListingStats(), 3000, { total: 0, satilik: 0, kiralik: 0, byType: {} });
    const featuredListingsResult = await withTimeout(getFeaturedListings(6), 3000, []);
    const neighborhoods = neighborhoodsResult || [];
    const stats = statsResult || { total: 0, satilik: 0, kiralik: 0, byType: {} };
    const featuredListings = (featuredListingsResult || []) as Awaited<ReturnType<typeof getFeaturedListings>>;

    // Filter listings for Sapanca
    const sapancaListings = featuredListings.filter(l => 
      l.location_district?.toLowerCase().includes('sapanca') || 
      l.location_neighborhood?.toLowerCase().includes('sapanca')
    );

    // Fetch Sapanca-related blog articles and cornerstone content
    let sapancaArticles: any[] = [];
    let sapancaCornerstone: any[] = [];
    
    try {
      const allArticlesResult = await withTimeout(getArticles(50, 0), 3000, { articles: [], total: 0 });
      // Safely process articles to handle malformed JSON
      const allArticles = (allArticlesResult?.articles || []).map((article: any) => {
        // Safely handle keywords field (can be array, string, or malformed JSON)
        if (article.keywords && typeof article.keywords === 'string') {
          try {
            const parsed = JSON.parse(article.keywords);
            article.keywords = Array.isArray(parsed) ? parsed : [];
          } catch {
            // If not valid JSON, try comma-separated
            article.keywords = article.keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
          }
        }
        // Ensure keywords is always an array
        if (!Array.isArray(article.keywords)) {
          article.keywords = [];
        }
        return article;
      });
    
    // Filter articles related to Sapanca (by title, content, or keywords)
    const sapancaRelated = allArticles.filter(article => {
      const titleLower = (article.title || '').toLowerCase();
      const contentLower = (article.content || '').toLowerCase();
      const excerptLower = (article.excerpt || '').toLowerCase();
      
      // Safely handle keywords (can be array, string, or JSON string)
      let keywords = '';
      try {
        if (Array.isArray(article.keywords)) {
          keywords = article.keywords.join(' ').toLowerCase();
        } else if (typeof article.keywords === 'string') {
          try {
            const parsed = JSON.parse(article.keywords);
            keywords = Array.isArray(parsed) ? parsed.join(' ').toLowerCase() : article.keywords.toLowerCase();
          } catch {
            keywords = article.keywords.toLowerCase();
          }
        }
      } catch {
        keywords = '';
      }
      
      const categoryLower = (article.category || '').toLowerCase();
      
      return (
        titleLower.includes('sapanca') ||
        contentLower.includes('sapanca') ||
        excerptLower.includes('sapanca') ||
        keywords.includes('sapanca') ||
        categoryLower.includes('sapanca')
      );
    });
    
    // Separate cornerstone (longer, comprehensive articles) from regular blog posts
    sapancaCornerstone = sapancaRelated.filter(article => {
      const wordCount = (article.content || '').split(/\s+/).length;
      return wordCount > 2000 || (article.category || '').toLowerCase().includes('rehber') || 
             (article.title || '').toLowerCase().includes('rehber');
    });
    
    sapancaArticles = sapancaRelated.filter(article => {
      const wordCount = (article.content || '').split(/\s+/).length;
      return wordCount <= 2000 && !(article.category || '').toLowerCase().includes('rehber') &&
             !(article.title || '').toLowerCase().includes('rehber');
    });
    
    // Limit to 6 articles and 3 cornerstone
    sapancaArticles = sapancaArticles.slice(0, 6);
    sapancaCornerstone = sapancaCornerstone.slice(0, 3);
  } catch (error) {
    console.error('Error fetching Sapanca articles:', error);
  }

  // Generate comprehensive local SEO schemas (with error handling)
  let placeSchema: any = null;
  let faqSchema: any = null;
  let breadcrumbSchema: any = null;
  
  try {
    placeSchema = generatePlaceSchema({
      name: 'Sapanca',
      description: 'Sapanca, Sakarya\'nın göl kasabası. Sapanca Gölü çevresinde bungalov, satılık daire, yazlık ve günlük kiralık seçenekleri ile hem yazlık hem de kalıcı yaşam için ideal bir bölge.',
      address: {
        addressLocality: 'Sapanca',
        addressRegion: 'Sakarya',
        addressCountry: 'TR',
        postalCode: '54600',
      },
      geo: {
        latitude: 40.6917,
        longitude: 30.2675,
      },
      url: `${siteConfig.url}${basePath}/sapanca`,
      containedIn: {
        '@type': 'State',
        name: 'Sakarya',
      },
    });
  } catch (error) {
    console.error('[SapancaPage] Error generating placeSchema:', error);
  }
  
  try {
    faqSchema = generateFAQSchema(sapancaFAQs);
  } catch (error) {
    console.error('[SapancaPage] Error generating faqSchema:', error);
  }
  
  try {
    breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Sapanca', url: `${siteConfig.url}${basePath}/sapanca` },
    ]);
  } catch (error) {
    console.error('[SapancaPage] Error generating breadcrumbSchema:', error);
  }

  return (
    <>
      {placeSchema && <StructuredData data={placeSchema} />}
      {faqSchema && <StructuredData data={faqSchema} />}
      {breadcrumbSchema && <StructuredData data={breadcrumbSchema} />}
      
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Sapanca', href: `${basePath}/sapanca` },
        ]}
      />

      {/* AI Overviews: Kısa Cevap Block - Modern Design */}
      <section className="py-8 bg-white dark:bg-gray-900 border-l-4 border-primary dark:border-primary-light rounded-r-lg mb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <ScrollReveal direction="up" delay={0}>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Kısa Cevap</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <strong>Sapanca</strong>, Sakarya'nın göl kasabası olarak bungalov, satılık daire, yazlık ve günlük kiralık seçenekleri ile dikkat çeker. 
              Sapanca Gölü çevresinde doğal güzellikler, yürüyüş yolları ve aktivite alanları bulunmaktadır. İstanbul'a yakınlığı, 
              turizm potansiyeli ve yatırım fırsatları ile hem sürekli oturum hem de yatırım amaçlı tercih edilmektedir.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <main className="min-h-screen bg-white">
      {/* Hero Section - Premium Design */}
        <section className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white py-20 md:py-32 overflow-hidden border-b border-gray-200 dark:border-gray-800">
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,currentColor_1px,transparent_0)] bg-[length:40px_40px]" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10 max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-block mb-6">
                  <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light border border-primary/20 dark:border-primary/30">
                    Sapanca Gölü'nün İncisi
                  </span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                  Sapanca
                </h1>
                <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                  Bungalov & Emlak & Günlük Kiralık. Sapanca Gölü çevresinde doğal güzellikler, yürüyüş yolları ve emlak fırsatları.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button asChild size="lg" className="bg-primary text-white hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-light">
                    <Link href={`${basePath}/sapanca/bungalov`}>
                      <Home className="w-5 h-5 mr-2" />
                      Bungalov
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Link href={`${basePath}/sapanca/gunluk-kiralik`}>
                      <KeyRound className="w-5 h-5 mr-2" />
                      Günlük Kiralık
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Link href={`${basePath}/sapanca/satilik-daire`}>
                      <Home className="w-5 h-5 mr-2" />
                      Satılık Daire
                    </Link>
                  </Button>
                </div>
                {/* Accent Line */}
                <div className="h-1 w-20 bg-blue-600 dark:bg-blue-500 rounded-full mx-auto"></div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Stats Section - Modern Design */}
        <section className="py-12 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 -mt-4 relative z-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <ScrollReveal direction="up" delay={0}>
                <div className="text-center bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stats.total}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Aktif İlan</div>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={50}>
                <div className="text-center bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{neighborhoods.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Bölge</div>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={100}>
                <div className="text-center bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stats.satilik}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Satılık</div>
                </div>
              </ScrollReveal>
              <ScrollReveal direction="up" delay={150}>
                <div className="text-center bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stats.kiralik}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Kiralık</div>
                </div>
              </ScrollReveal>
            </div>
          </div>
      </section>

        {/* Quick Filters / CTA Section - Premium */}
        <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Sapanca'da Ne Arıyorsunuz?
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Bungalov, günlük kiralık, satılık daire, yazlık ve daha fazlası. Size en uygun seçeneği bulun.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ScrollReveal direction="up" delay={0}>
                <Link href={`${basePath}/sapanca/bungalov`} className="group">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-xl">
                    <div className="w-16 h-16 rounded-xl bg-blue-500 dark:bg-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Home className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Bungalov</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Sapanca Gölü çevresinde bungalov seçenekleri. Satılık ve günlük kiralık bungalovlar.
                    </p>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold">
                      İncele <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={50}>
                <Link href={`${basePath}/sapanca/gunluk-kiralik`} className="group">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-8 border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 transition-all duration-300 hover:shadow-xl">
                    <div className="w-16 h-16 rounded-xl bg-green-500 dark:bg-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <KeyRound className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Günlük Kiralık</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Sapanca'da günlük kiralık bungalov ve yazlık seçenekleri. Hafta sonu kaçamakları için ideal.
                    </p>
                    <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                      İncele <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={100}>
                <Link href={`${basePath}/sapanca/satilik-daire`} className="group">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-8 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-xl">
                    <div className="w-16 h-16 rounded-xl bg-purple-500 dark:bg-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Home className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Satılık Daire</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Sapanca'da satılık daire seçenekleri. Göl kenarı ve merkez bölgelerde güncel ilanlar.
                    </p>
                    <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold">
                      İncele <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={150}>
                <Link href={`${basePath}/sapanca/satilik-yazlik`} className="group">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl p-8 border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600 transition-all duration-300 hover:shadow-xl">
                    <div className="w-16 h-16 rounded-xl bg-orange-500 dark:bg-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Waves className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Satılık Yazlık</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Sapanca'da satılık yazlık evler. Göl kenarı ve çevre bölgelerde yazlık seçenekleri.
                    </p>
                    <div className="flex items-center text-orange-600 dark:text-orange-400 font-semibold">
                      İncele <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={200}>
                <Link href={`${basePath}/sapanca/satilik-bungalov`} className="group">
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-2xl p-8 border-2 border-teal-200 dark:border-teal-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all duration-300 hover:shadow-xl">
                    <div className="w-16 h-16 rounded-xl bg-teal-500 dark:bg-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Home className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Satılık Bungalov</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Sapanca'da satılık bungalov seçenekleri. Yatırım ve yaşam amaçlı bungalovlar.
                    </p>
                    <div className="flex items-center text-teal-600 dark:text-teal-400 font-semibold">
                      İncele <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={250}>
                <Link href={`${basePath}/sapanca/gezilecek-yerler`} className="group">
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-2xl p-8 border-2 border-pink-200 dark:border-pink-800 hover:border-pink-400 dark:hover:border-pink-600 transition-all duration-300 hover:shadow-xl">
                    <div className="w-16 h-16 rounded-xl bg-pink-500 dark:bg-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Mountain className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Gezilecek Yerler</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Sapanca Gölü çevresinde gezilecek yerler, yürüyüş rotaları ve aktiviteler.
                    </p>
                    <div className="flex items-center text-pink-600 dark:text-pink-400 font-semibold">
                      İncele <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Hızlı Cevaplar (AI Overviews) Section */}
        <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Hızlı Cevaplar
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Sapanca hakkında en çok sorulan sorular ve kısa cevaplar.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  question: 'Sapanca\'da bungalov fiyatları ne kadar?',
                  answer: 'Sapanca\'da bungalov fiyatları konum ve özelliklere göre değişmektedir. Göl kenarı bungalovlar 1-3 milyon TL, günlük kiralık bungalovlar sezona göre 500-2000 TL arasında değişmektedir.',
                },
                {
                  question: 'Sapanca\'da günlük kiralık bulmak kolay mı?',
                  answer: 'Evet, Sapanca\'da günlük kiralık bungalov ve yazlık seçenekleri oldukça fazladır. Özellikle yaz sezonunda erken rezervasyon yapmak avantajlıdır.',
                },
                {
                  question: 'Sapanca\'da satılık daire fiyatları nasıl?',
                  answer: 'Sapanca\'da satılık daire fiyatları göl kenarı ve merkez bölgelere göre değişmektedir. Göl kenarı daireler 1.5-3 milyon TL, merkez daireler 800 bin - 1.5 milyon TL arasında değişmektedir.',
                },
                {
                  question: 'Sapanca yatırım için uygun mu?',
                  answer: 'Evet, Sapanca yatırım potansiyeli yüksek bir bölgedir. Özellikle günlük kiralık bungalovlar ve göl kenarı konutlar yatırımcıların ilgisini çekmektedir.',
                },
                {
                  question: 'Sapanca\'da yaşam nasıl?',
                  answer: 'Sapanca, sakin bir göl kasabası olarak doğal güzellikleri ve temiz havasıyla dikkat çeker. Göl çevresinde yürüyüş yolları, restoranlar ve aktivite alanları bulunmaktadır.',
                },
                {
                  question: 'Sapanca\'da hangi bölgeler öne çıkıyor?',
                  answer: 'Sapanca\'da göl kenarı bölgeler hem yaşam kalitesi hem yatırım değeri açısından avantajlıdır. Merkez bölgeler ise ulaşım ve hizmetler açısından pratik seçeneklerdir.',
                },
                {
                  question: 'Sapanca\'da mevsimsellik nasıl?',
                  answer: 'Sapanca\'da yaz sezonu (Haziran-Eylül) yüksek talep görür. Kış sezonunda daha sakin bir atmosfer vardır. Günlük kiralık fiyatları sezona göre değişmektedir.',
                },
                {
                  question: 'Sapanca\'da ulaşım nasıl?',
                  answer: 'Sapanca, İstanbul\'a yaklaşık 130 km mesafededir. TEM otoyolu üzerinden kolay ulaşım sağlanmaktadır. Ayrıca Sakarya merkeze 20 km mesafededir.',
                },
                {
                  question: 'Sapanca\'da çocukla tatil yapılabilir mi?',
                  answer: 'Evet, Sapanca çocuklu aileler için ideal bir tatil destinasyonudur. Göl çevresinde güvenli yürüyüş yolları, parklar ve aktivite alanları bulunmaktadır.',
                },
                {
                  question: 'Sapanca\'da kış turizmi var mı?',
                  answer: 'Sapanca\'da kış sezonunda şömine evler, kar manzarası ve sakin atmosfer ile farklı bir deneyim sunulmaktadır. Kış sezonunda günlük kiralık fiyatları daha uygundur.',
                },
                {
                  question: 'Sapanca\'da emlak komisyon oranları nasıl?',
                  answer: 'Sapanca\'da emlak komisyon oranları genellikle %2-3 arasında değişmektedir. Komisyon oranı satış fiyatına ve emlakçıya göre değişebilir.',
                },
                {
                  question: 'Sapanca\'da tapu işlemleri nasıl?',
                  answer: 'Sapanca\'da tapu işlemleri Sakarya Tapu Müdürlüğü üzerinden yapılmaktadır. İşlem süresi genellikle 1-2 hafta arasında değişmektedir.',
                },
              ].map((qa, index) => (
                <ScrollReveal key={index} direction="up" delay={index * 50}>
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {qa.question}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {qa.answer}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Fiyatlar & Trendler Section */}
        <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Fiyatlar & Trendler
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Sapanca'da güncel emlak fiyatları ve piyasa trendleri.
                </p>
              </div>
            </ScrollReveal>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Emlak Tipi</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Fiyat Aralığı</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Günlük Kiralık</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Notlar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Bungalov (Göl Kenarı)</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">1.5 - 3 milyon TL</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">800 - 2000 TL</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Göl manzarası, yüksek talep</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Bungalov (Merkez)</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">800 bin - 1.5 milyon TL</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">500 - 1200 TL</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Ulaşım avantajlı</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Daire (Göl Kenarı)</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">1.5 - 3 milyon TL</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">-</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Yeni yapılar, göl manzarası</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Daire (Merkez)</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">800 bin - 1.5 milyon TL</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">-</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Oturumluk için uygun</td>
                    </tr>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Yazlık (Göl Kenarı)</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">1 - 2.5 milyon TL</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">600 - 1500 TL</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Yaz sezonu yüksek talep</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong className="text-gray-900 dark:text-white">Not:</strong> Fiyatlar konum, metrekare, özellikler ve güncel piyasa koşullarına göre değişmektedir. 
                Güncel fiyat bilgisi için ilanlarımıza göz atabilir veya bizimle iletişime geçebilirsiniz. 
                Günlük kiralık fiyatları sezona göre değişmektedir (yaz sezonu daha yüksek).
              </p>
            </div>
          </div>
        </section>

        {/* Bölge Rehberi Section */}
        <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Bölge Rehberi
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Sapanca hakkında bilmeniz gerekenler: gezilecek yerler, ulaşım, mevsimsellik.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ScrollReveal direction="up" delay={0}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6">
                    <Mountain className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Gezilecek Yerler</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Sapanca Gölü çevresi yürüyüş yolları</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Maşukiye şelaleleri</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Kırkpınar Yaylası</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Göl çevresi restoranlar ve kafeler</span>
                    </li>
                  </ul>
                  <Link href={`${basePath}/sapanca/gezilecek-yerler`} className="mt-6 inline-flex items-center text-primary font-semibold hover:underline">
                    Detaylı Rehber <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={50}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ulaşım</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>İstanbul'a 130 km (TEM otoyolu)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Sakarya merkeze 20 km</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Özel araç ile kolay ulaşım</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Toplu taşıma seçenekleri mevcut</span>
                    </li>
                  </ul>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={100}>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-6">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Mevsimsellik</h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Yaz sezonu (Haziran-Eylül): Yüksek talep</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Kış sezonu: Sakin atmosfer, şömine evler</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>İlkbahar/Sonbahar: Orta sezon</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Günlük kiralık fiyatları sezona göre değişir</span>
                    </li>
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Featured Listings Section */}
        {sapancaListings.length > 0 && (
          <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 max-w-7xl">
              <ScrollReveal direction="up" delay={0}>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Öne Çıkan İlanlar
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                    Sapanca'da güncel emlak ilanları.
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sapancaListings.slice(0, 6).map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button asChild size="lg">
                  <Link href={`${basePath}/satilik?location=sapanca`}>
                    Tüm İlanları Görüntüle <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Cornerstone Articles Section */}
        {sapancaCornerstone.length > 0 && (
          <section className="py-16 lg:py-20 bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 max-w-7xl">
              <ScrollReveal direction="up" delay={0}>
                <div className="text-center mb-12">
                  <div className="inline-block mb-4">
                    <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light border border-primary/20 dark:border-primary/30">
                      Kapsamlı Rehberler
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Sapanca Hakkında Detaylı Rehberler
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                    Sapanca emlak, bungalov ve yatırım konularında kapsamlı rehberler ve analizler.
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sapancaCornerstone.map((article, index) => (
                  <ScrollReveal key={article.id || index} direction="up" delay={index * 50}>
                    <Link href={`${basePath}/blog/${article.slug}`} className="group">
                      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                        {article.featured_image && (
                          <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                            {!article.featured_image.startsWith('http') ? (
                              <CardImage
                                publicId={article.featured_image}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <ExternalImage
                                src={article.featured_image}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                fill
                              />
                            )}
                          </div>
                        )}
                        <div className="flex-1 flex flex-col">
                          <div className="mb-2">
                            <span className="px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-xs font-semibold rounded">
                              {article.category || 'Rehber'}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                            {article.excerpt || article.meta_description || ''}
                          </p>
                          <div className="flex items-center text-primary font-semibold text-sm mt-auto">
                            Devamını Oku <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>

              {sapancaCornerstone.length > 0 && (
                <div className="text-center mt-8">
                  <Button asChild variant="outline" size="lg">
                    <Link href={`${basePath}/blog?q=sapanca`}>
                      Tüm Sapanca Rehberlerini Görüntüle <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Blog Articles Section */}
        {sapancaArticles.length > 0 && (
          <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-4 max-w-7xl">
              <ScrollReveal direction="up" delay={0}>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Sapanca Blog Yazıları
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                    Sapanca emlak, bungalov, günlük kiralık ve yatırım konularında güncel blog yazıları.
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sapancaArticles.map((article, index) => (
                  <ScrollReveal key={article.id || index} direction="up" delay={index * 50}>
                    <Link href={`${basePath}/blog/${article.slug}`} className="group">
                      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary/50 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                        {article.featured_image && (
                          <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                            {!article.featured_image.startsWith('http') ? (
                              <CardImage
                                publicId={article.featured_image}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <ExternalImage
                                src={article.featured_image}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                fill
                              />
                            )}
                          </div>
                        )}
                        <div className="flex-1 flex flex-col">
                          <div className="mb-2">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded">
                              {article.category || 'Blog'}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                            {article.excerpt || article.meta_description || ''}
                          </p>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {article.published_at ? new Date(article.published_at).toLocaleDateString('tr-TR', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) : ''}
                            </span>
                            <div className="flex items-center text-primary font-medium text-sm">
                              Oku <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>

              {sapancaArticles.length > 0 && (
                <div className="text-center mt-8">
                  <Button asChild variant="outline" size="lg">
                    <Link href={`${basePath}/blog?q=sapanca`}>
                      Tüm Blog Yazılarını Görüntüle <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* İç Link Modülleri - 3'lü Hub Ağı */}
        <section className="py-16 lg:py-20 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 max-w-7xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Diğer Bölgeler
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Sakarya'nın diğer emlak bölgelerini de inceleyin.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScrollReveal direction="up" delay={0}>
                <Link href={`${basePath}/karasu`} className="group">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                        <Waves className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Karasu</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Karasu'da satılık ve kiralık emlak seçenekleri. Denize sıfır konumlar, yazlık evler.
                    </p>
                    <div className="flex items-center text-primary font-semibold">
                      İncele <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={50}>
                <Link href={`${basePath}/kocaali`} className="group">
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:shadow-xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                        <Waves className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Kocaali</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Kocaali'de satılık ve kiralık emlak seçenekleri. Sakin atmosfer, denize yakın konumlar.
                    </p>
                    <div className="flex items-center text-primary font-semibold">
                      İncele <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-20 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 max-w-4xl">
            <ScrollReveal direction="up" delay={0}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Sıkça Sorulan Sorular
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Sapanca hakkında merak ettikleriniz.
                </p>
              </div>
            </ScrollReveal>

            <div className="space-y-6">
              {sapancaFAQs.map((faq, index) => (
                <ScrollReveal key={index} direction="up" delay={index * 50}>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
  } catch (error: any) {
    console.error('[SapancaPage] Fatal error:', error);
    
    // Return minimal fallback UI (locale and basePath already resolved above)
    return (
      <>
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: `${basePath}/` },
            { label: 'Sapanca', href: `${basePath}/sapanca` },
          ]}
        />
        <main className="min-h-screen bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Sapanca Emlak
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Sapanca'da bungalov, satılık daire, yazlık ve günlük kiralık seçenekleri.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href={`${basePath}/sapanca/bungalov`}>
                  <Button>Bungalov</Button>
                </Link>
                <Link href={`${basePath}/sapanca/satilik-daire`}>
                  <Button>Satılık Daire</Button>
                </Link>
                <Link href={`${basePath}/sapanca/gunluk-kiralik`}>
                  <Button>Günlük Kiralık</Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }
}
