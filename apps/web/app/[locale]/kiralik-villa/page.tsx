import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Home, Phone, MapPin, TrendingUp, DollarSign, Building2, CheckCircle2, Search, Eye, FileText, Shield, Calculator, BarChart3, Lightbulb, Info, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { generateRealEstateAgentLocalSchema } from '@/lib/seo/local-seo-schemas';
import { generateItemListSchema } from '@/lib/seo/listings-schema';
import { getListings, getNeighborhoods, getListingStats } from '@/lib/supabase/queries';
import { getHighPriorityQAEntries } from '@/lib/supabase/queries/qa';
import { ListingCard } from '@/components/listings/ListingCard';
import { withTimeout } from '@/lib/utils/timeout';
import { generatePageContentInfo } from '@/lib/content/ai-checker-helper';
import dynamicImport from 'next/dynamic';
import { optimizeMetaDescription } from '@/lib/seo/meta-description-optimizer';
import { Suspense } from 'react';

// Performance: ISR with cache tags for better performance
export const revalidate = 3600; // 1 hour - regenerate every hour
export const dynamicParams = true; // Allow dynamic params

// Generate static params for all locales (ISR optimization)
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Lazy load animations (non-critical)
const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

// Lazy load client-side components for better performance
const AIChecker = dynamicImport(() => import('@/components/content/AIChecker').then(mod => ({ default: mod.AIChecker })), {
  loading: () => <div className="h-32 bg-gray-50 rounded-lg animate-pulse" />,
});

const AICheckerBadge = dynamicImport(() => import('@/components/content/AICheckerBadge').then(mod => ({ default: mod.AICheckerBadge })), {
  loading: () => null,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/kiralik-villa' : `/${locale}/kiralik-villa`;
  
  const baseDescription = 'Türkiye\'de kiralık villa ilanları. 1+1\'den 4+1\'e kadar seçenek. Güncel fiyatlar, mahalle rehberi ve yatırım analizi. Uzman emlak danışmanlığı ile hayalinizdeki villayı bulun.';
  const optimizedDescription = optimizeMetaDescription(baseDescription, {
    keywords: ['kiralık villa', 'kiralık villa ilanları', 'emlak'],
    includeCTA: true,
  });

  return {
    title: 'Kiralık Villa | En Güncel İlanlar ve Fiyatlar 2025 | Karasu Emlak',
    description: optimizedDescription,
    keywords: ["kiralık villa","kiralık villalar","kiralık villa ilanları","kiralık villa fiyatları"],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': '/kiralik-villa',
        'en': '/en/kiralik-villa',
        'et': '/et/kiralik-villa',
        'ru': '/ru/kiralik-villa',
        'ar': '/ar/kiralik-villa',
      },
    },
    openGraph: {
      title: 'Kiralık Villa | En Güncel İlanlar ve Fiyatlar 2025',
      description: 'Türkiye\'de satılık villa ilanları. 1+1\'den 4+1\'e kadar geniş seçenek. Güncel fiyatlar ve mahalle rehberi.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Kiralık Villa - Emlak İlanları ve Fiyatları',
        },
      ],
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Kiralık Villa | En Güncel İlanlar',
      description: 'Türkiye\'de satılık villa ilanları. Geniş seçenek. Güncel fiyatlar ve mahalle rehberi.',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Fetch Q&As from database (with fallback to static FAQs)
async function getKiralikVillaFAQs() {
  const allFAQs: Array<{ question: string; answer: string }> = [];
  
  try {
    const dbFAQs = await getHighPriorityQAEntries('karasu');
    if (dbFAQs && dbFAQs.length > 0) {
      allFAQs.push(...dbFAQs.map(qa => ({
        question: qa.question,
        answer: qa.answer,
      })));
    }
  } catch (error) {
    console.error('Error fetching FAQs from database:', error);
  }
  
  // Fallback static FAQs
  if (allFAQs.length === 0) {
    allFAQs.push(
      {
        question: 'Satılık daire alırken nelere dikkat edilmeli?',
        answer: 'Satılık daire alırken konum, metrekare, oda sayısı, bina yaşı, kat sayısı, asansör, otopark, balkon gibi özellikler dikkate alınmalıdır. Ayrıca tapu durumu, yapı ruhsatı, imar durumu, aidat ve giderler gibi yasal ve mali konular da kontrol edilmelidir.',
      },
      {
        question: 'Satılık daire fiyatları nasıl belirlenir?',
        answer: 'Satılık daire fiyatları konum, metrekare, oda sayısı, bina yaşı, kat, manzara, bina özellikleri, çevre faktörleri ve piyasa koşullarına göre belirlenir. Aynı bölgedeki benzer dairelerin fiyatları karşılaştırılarak piyasa değeri tespit edilir.',
      },
      {
        question: 'Kredi ile daire alınabilir mi?',
        answer: 'Evet, konut kredisi ile daire alınabilir. Kredi başvurusu için gelir belgesi, kimlik, tapu bilgileri ve diğer gerekli belgeler hazırlanmalıdır. Kredi tutarı, gelir durumuna ve daire değerine göre belirlenir.',
      },
      {
        question: 'Villa alırken hangi belgeler gereklidir?',
        answer: 'Villa alırken tapu, yapı ruhsatı, iskan belgesi, vekaletname (varsa), kimlik belgeleri, gelir belgesi (kredi için), vergi levhası ve diğer yasal belgeler gereklidir. Tüm belgelerin güncel ve eksiksiz olması önemlidir.',
      },
      {
        question: 'Satılık daire alımında noter masrafları ne kadar?',
        answer: 'Noter masrafları daire değerine göre değişir. Genellikle daire değerinin %1-2\'si kadar noter masrafı ödenir. Ayrıca tapu harcı, belediye harcı ve diğer yasal masraflar da eklenir.',
      },
      {
        question: 'Villa alırken ekspertiz yaptırmak gerekli mi?',
        answer: 'Evet, daire alırken ekspertiz yaptırmak önemlidir. Ekspertiz ile dairenin gerçek değeri, yapısal durumu, imar durumu ve yasal durumu kontrol edilir. Bu sayede olası sorunlar önceden tespit edilir.',
      },
      {
        question: 'Satılık daire alırken hangi mahalleler tercih edilmeli?',
        answer: 'Satılık daire alırken ulaşım kolaylığı, sosyal alanlar, okullar, sağlık kuruluşları, güvenlik, altyapı ve gelecek projeleri gibi faktörler dikkate alınmalıdır. Merkez mahalleler ve gelişen bölgeler genellikle daha çok tercih edilir.',
      },
    );
  }
  
  return allFAQs;
}

export default async function KiralikVillaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Performance: Fetch data in parallel with timeout (faster than sequential)
  const [allListingsResult, neighborhoodsResult, statsResult] = await Promise.all([
    withTimeout(
      getListings({ status: 'kiralik', property_type: ['villa'] }, { field: 'created_at', order: 'desc' }, 1000, 0),
      3000,
      { listings: [], total: 0 }
    ),
    withTimeout(getNeighborhoods(), 3000, [] as string[]),
    withTimeout(getListingStats(), 3000, { total: 0, satilik: 0, kiralik: 0, byType: {} }),
  ]);
  
  const { listings: allListings = [] } = allListingsResult || {};
  const neighborhoods = neighborhoodsResult || [];
  const stats = statsResult || { total: 0, satilik: 0, kiralik: 0, byType: {} };
  
  // All daire listings (not filtered by location)
  const villaListings = allListings.filter(listing => listing.property_type === 'daire');

  // Group by room count
  const byRooms = {
    '1+1': villaListings.filter(l => l.features?.rooms === 1),
    '2+1': villaListings.filter(l => l.features?.rooms === 2),
    '3+1': villaListings.filter(l => l.features?.rooms === 3),
    '4+1': villaListings.filter(l => l.features?.rooms === 4),
  };

  // Calculate average price
  const prices = villaListings
    .filter(l => l.price_amount && l.price_amount > 0)
    .map(l => l.price_amount!);
  const avgPrice = prices.length > 0 
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : null;

  // Performance: Fetch Q&As with timeout (non-blocking)
  const faqsResult = await withTimeout(getKiralikVillaFAQs(), 2000, []);
  const faqs = faqsResult || [];

  // Generate schemas
  const articleSchema = {
    ...generateArticleSchema({
      headline: 'Kiralık Villa | En Güncel İlanlar ve Fiyatlar 2025',
      description: 'Türkiye\'de satılık villa ilanları. 1+1\'den 4+1\'e kadar geniş seçenek. Güncel fiyatlar, mahalle rehberi ve yatırım analizi.',
      image: [`${siteConfig.url}/og-image.jpg`],
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      author: 'Karasu Emlak',
    }),
    // AI Overviews optimization
    mainEntity: {
      '@type': 'Question',
      name: 'Satılık daire nasıl bulunur?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Satılık daire arayanlar için geniş bir seçenek yelpazesi mevcuttur. Fiyatlar konum, metrekare ve özelliklere göre değişmektedir. Merkez mahalleler ve gelişen bölgeler daha yüksek fiyatlara sahiptir. Hem sürekli oturum hem de yatırım amaçlı seçenekler bulunmaktadır. 1+1, 2+1, 3+1 ve 4+1 oda seçenekleri mevcuttur.',
      },
    },
  };

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Satılık İlanlar', url: `${siteConfig.url}${basePath}/satilik` },
      { name: 'Kiralık Villa', url: `${siteConfig.url}${basePath}/kiralik-villa` },
    ],
    `${siteConfig.url}${basePath}/kiralik-villa`
  );

  // RealEstateAgent schema
  const realEstateAgentSchema = generateRealEstateAgentLocalSchema({
    includeRating: true,
    includeServices: true,
    includeAreaServed: true,
  });

  // ItemList schema for listings
  const itemListSchema = villaListings.length > 0
    ? generateItemListSchema(villaListings.slice(0, 20), `${siteConfig.url}${basePath}`, {
        name: 'Kiralık Villa İlanları',
        description: `Türkiye'de ${villaListings.length} adet satılık daire ilanı. Geniş seçenek.`,
      })
    : null;
  // Generate page content for AI checker
  const pageContentInfo = generatePageContentInfo('Kiralık Villa', [
    { 
      id: 'genel-bakis', 
      title: 'Kiralık Villa Arayanlar İçin Genel Bakış', 
      content: 'Türkiye\'de kiralık villa ilanları ve seçenekleri hakkında kapsamlı bilgi. Lüks yaşam arayanlar için geniş bahçeli, havuzlu ve özel konumlarda villa seçenekleri bulunmaktadır. Hem yaz tatilleri hem de sürekli oturum için ideal villa seçenekleri mevcuttur. Özellikle sahil bölgeleri, gelişen ilçeler ve prestijli mahalleler, villa yatırımcılarının ilgisini çeken bölgelerdir.' 
    },
    { 
      id: 'oda-sayisina-gore', 
      title: 'Oda Sayısına Göre Kiralık Villa Seçenekleri', 
      content: '3+1, 4+1, 5+1 ve daha büyük oda seçenekleri mevcuttur. Büyük aileler için geniş yaşam alanları, çoklu banyo, geniş mutfak ve özel bahçe alanları sunan villa seçenekleri bulunmaktadır. Her villa, konum, metrekare, oda sayısı ve özelliklerine göre farklı fiyat aralıklarında sunulmaktadır.' 
    },
    { 
      id: 'fiyat-analizi', 
      title: 'Kiralık Villa Fiyat Analizi', 
      content: 'Kiralık villa fiyatları konum, metrekare, oda sayısı, bahçe büyüklüğü, havuz varlığı ve özelliklere göre değişmektedir. Ortalama aylık kira fiyatları 3+1 villalar için 15.000 TL - 30.000 TL, 4+1 villalar için 20.000 TL - 40.000 TL, 5+1 ve üzeri villalar için 30.000 TL - 60.000 TL arasında değişmektedir. Sahil bölgeleri ve prestijli mahalleler daha yüksek fiyatlara sahiptir.' 
    },
    { 
      id: 'mahalle-rehberi', 
      title: 'Mahalle Rehberi', 
      content: 'Popüler villa bölgeleri ve mahalleleri hakkında detaylı bilgi. Sahil bölgeleri, gelişen ilçeler, prestijli mahalleler ve uygun fiyatlı bölgeler. Her mahallenin ulaşım, sosyal alanlar, okullar, sağlık kuruluşları ve güvenlik açısından değerlendirmesi. Gelecek projeleri ve altyapı durumu.' 
    },
    { 
      id: 'yatirim-tavsiyeleri', 
      title: 'Yatırım Tavsiyeleri', 
      content: 'Kiralık villa yatırımı yapmayı düşünenler için kira getirisi, bölgenin gelişim potansiyeli, turizm potansiyeli, gelecek projeleri ve piyasa trendleri hakkında tavsiyeler. Yatırım amaçlı villa alımında dikkat edilmesi gerekenler, getiri analizi ve risk değerlendirmesi. Kira sözleşmeleri ve yasal süreçler hakkında bilgi.' 
    },
  ]);


  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={realEstateAgentSchema} />
      {itemListSchema && <StructuredData data={itemListSchema} />}
      
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Satılık İlanlar', href: `${basePath}/satilik` },
          { label: 'Kiralık Villa', href: `${basePath}/kiralik-villa` },
        ]}
      />
      
      {/* AI Checker Badge - Admin Only (Hidden from public) */}


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
                    {villaListings.length}+ Aktif Villa İlanı
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Kiralık Villa
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  Türkiye'de satılık daire arayanlar için kapsamlı rehber. 1+1'den 4+1'e kadar geniş seçenek. 
                  Güncel fiyatlar, mahalle rehberi ve yatırım analizi. Uzman emlak danışmanlığı ile hayalinizdeki villayı bulun.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    <Link href={`${basePath}/kiralik?propertyType=villa`}>
                      <Home className="w-5 h-5 mr-2" />
                      Tüm Villa İlanlarını Görüntüle
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                    <Link href={`${basePath}/iletisim`}>
                      <Phone className="w-5 h-5 mr-2" />
                      İletişime Geçin
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8 bg-white border-b border-gray-200 -mt-4 relative z-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{villaListings.length}</div>
                <div className="text-sm text-gray-600">Aktif Villa İlanı</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{neighborhoods.length}</div>
                <div className="text-sm text-gray-600">Mahalle</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {avgPrice ? `₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K` : 'Değişken'}
                </div>
                <div className="text-sm text-gray-600">Ortalama Fiyat</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-gray-600">Danışmanlık</div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* AI Checker - Admin Only (Hidden from public) */}

                {/* AI Overviews Optimized: Quick Answer */}
                <ScrollReveal direction="up" delay={0}>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>Satılık daire</strong> arayanlar için geniş bir seçenek yelpazesi mevcuttur. 
                      Fiyatlar konum, metrekare ve özelliklere göre değişmektedir. 
                      Merkez mahalleler ve gelişen bölgeler daha yüksek fiyatlara sahiptir. Hem sürekli oturum hem de 
                      yatırım amaçlı seçenekler bulunmaktadır. 1+1, 2+1, 3+1 ve 4+1 oda seçenekleri mevcuttur. 
                      Türkiye'nin farklı bölgelerinde çeşitli fiyat aralıklarında seçenekler bulunmaktadır.
                    </p>
                  </div>
                </ScrollReveal>

                {/* Introduction */}
                <ScrollReveal direction="up" delay={100}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Kiralık Villa Arayanlar İçin Genel Bakış
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Türkiye'de satılık daire piyasası zengin bir yelpazeye sahiptir. 
                        Farklı bölgelerde, farklı fiyat aralıklarında ve farklı özelliklerde daire seçenekleri bulunmaktadır.
                      </p>
                      <p>
                        Satılık daire arayanlar için hem sürekli oturum hem de yatırım amaçlı seçenekler mevcuttur. 
                        Özellikle büyük şehirler, sahil bölgeleri ve gelişen ilçeler, emlak yatırımcılarının 
                        ilgisini çeken bölgelerdir.
                      </p>
                      <p>
                        Bu rehber, satılık daire almayı düşünenler için fiyat analizi, oda sayısına göre seçenekler, 
                        yatırım tavsiyeleri ve dikkat edilmesi gerekenler hakkında kapsamlı bilgi sunmaktadır.
                      </p>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Room Count Options */}
                <ScrollReveal direction="up" delay={200}>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Oda Sayısına Göre Kiralık Villa Seçenekleri
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 1+1 */}
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">1+1 Villa</h3>
                          <span className="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                            {byRooms['1+1'].length} İlan
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed mb-4">
                          Tek kişi veya çiftler için ideal. Kompakt ve ekonomik seçenekler.
                        </p>
                        <div className="text-sm text-gray-600 font-medium mb-3">
                          <span className="text-gray-900 font-bold">₺400.000 - ₺1.200.000</span> arası
                        </div>
                        <Link href={`${basePath}/kiralik?propertyType=villa&rooms=1`}>
                          <Button variant="outline" size="sm" className="w-full gap-2 border-blue-300 hover:border-blue-500 hover:text-blue-600">
                            1+1 Villa Ara
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>

                      {/* 2+1 */}
                      <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">2+1 Villa</h3>
                          <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                            {byRooms['2+1'].length} İlan
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed mb-4">
                          Küçük aileler için ideal. En popüler seçenek.
                        </p>
                        <div className="text-sm text-gray-600 font-medium mb-3">
                          <span className="text-gray-900 font-bold">₺600.000 - ₺1.800.000</span> arası
                        </div>
                        <Link href={`${basePath}/kiralik?propertyType=villa&rooms=2`}>
                          <Button variant="outline" size="sm" className="w-full gap-2 border-green-300 hover:border-green-500 hover:text-green-600">
                            2+1 Villa Ara
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>

                      {/* 3+1 */}
                      <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">3+1 Villa</h3>
                          <span className="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full">
                            {byRooms['3+1'].length} İlan
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed mb-4">
                          Orta büyüklükte aileler için ideal. Geniş yaşam alanı.
                        </p>
                        <div className="text-sm text-gray-600 font-medium mb-3">
                          <span className="text-gray-900 font-bold">₺900.000 - ₺2.500.000</span> arası
                        </div>
                        <Link href={`${basePath}/kiralik?propertyType=villa&rooms=3`}>
                          <Button variant="outline" size="sm" className="w-full gap-2 border-purple-300 hover:border-purple-500 hover:text-purple-600">
                            3+1 Villa Ara
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>

                      {/* 4+1 */}
                      <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">4+1 Villa</h3>
                          <span className="px-3 py-1 bg-amber-500 text-white text-sm font-semibold rounded-full">
                            {byRooms['4+1'].length} İlan
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed mb-4">
                          Büyük aileler için ideal. Lüks ve konforlu yaşam.
                        </p>
                        <div className="text-sm text-gray-600 font-medium mb-3">
                          <span className="text-gray-900 font-bold">₺1.500.000 - ₺4.000.000</span> arası
                        </div>
                        <Link href={`${basePath}/kiralik?propertyType=villa&rooms=4`}>
                          <Button variant="outline" size="sm" className="w-full gap-2 border-amber-300 hover:border-amber-500 hover:text-amber-600">
                            4+1 Villa Ara
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Featured Listings */}
                {villaListings.length > 0 && (
                  <ScrollReveal direction="up" delay={300}>
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                          Öne Çıkan Kiralık Villa İlanları
                        </h2>
                        <Link href={`${basePath}/kiralik?propertyType=villa`}>
                          <Button variant="ghost" size="sm">
                            Tümünü Gör
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {villaListings.slice(0, 6).map((listing) => (
                          <ListingCard key={listing.id} listing={listing} basePath={basePath} />
                        ))}
                      </div>
                    </div>
                  </ScrollReveal>
                )}

                {/* Price Analysis */}
                <ScrollReveal direction="up" delay={400}>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Kiralık Villa Fiyat Analizi ve Piyasa Trendleri
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Satılık daire fiyatları bölge, konum, metrekare, oda sayısı ve özelliklere göre değişmektedir. 
                        Büyük şehirlerde fiyatlar daha yüksekken, gelişen ilçeler ve sahil bölgelerinde daha uygun seçenekler bulunmaktadır.
                      </p>
                      <p>
                        Ortalama fiyatlar 1+1 daireler için 400.000 TL - 1.200.000 TL, 2+1 daireler için 600.000 TL - 1.800.000 TL, 
                        3+1 daireler için 900.000 TL - 2.500.000 TL, 4+1 daireler için 1.500.000 TL - 4.000.000 TL arasında değişmektedir.
                      </p>
                      <p>
                        Yatırım amaçlı daire alımında kira getirisi, bölgenin gelişim potansiyeli ve gelecek projeleri dikkate alınmalıdır.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Important Considerations */}
                <ScrollReveal direction="up" delay={500}>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Villa Alırken Dikkat Edilmesi Gerekenler
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Yasal Belgeler</h3>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          Tapu, yapı ruhsatı, iskan belgesi ve diğer yasal belgelerin eksiksiz ve güncel olması gerekir.
                        </p>
                      </div>

                      <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Calculator className="h-5 w-5 text-green-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Maliyet Analizi</h3>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          Villa fiyatı, noter masrafları, tapu harcı, aidat ve diğer giderler toplam maliyeti oluşturur.
                        </p>
                      </div>

                      <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Building2 className="h-5 w-5 text-purple-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Bina Özellikleri</h3>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          Bina yaşı, kat sayısı, asansör, otopark, güvenlik ve diğer ortak alanlar kontrol edilmelidir.
                        </p>
                      </div>

                      <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-amber-100 rounded-lg">
                            <MapPin className="h-5 w-5 text-amber-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Konum ve Çevre</h3>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          Ulaşım, okullar, sağlık kuruluşları, alışveriş merkezleri ve sosyal alanlar değerlendirilmelidir.
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                {/* FAQ Section */}
                {faqs.length > 0 && (
                  <ScrollReveal direction="up" delay={600}>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                        Sık Sorulan Sorular
                      </h2>
                      <div className="space-y-4">
                        {faqs.map((faq, index) => (
                          <div key={index} className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                            <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ScrollReveal>
                )}
              </div>

              {/* Sidebar */}
              <aside className="space-y-6">
                {/* Quick Stats */}
                <div className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Hızlı İstatistikler</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Toplam İlan</span>
                      <span className="font-bold text-gray-900">{villaListings.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ortalama Fiyat</span>
                      <span className="font-bold text-gray-900">
                        {avgPrice ? `₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgPrice / 1000)}K` : 'Değişken'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mahalle Sayısı</span>
                      <span className="font-bold text-gray-900">{neighborhoods.length}</span>
                    </div>
                  </div>
                </div>

                {/* Related Pages */}
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">İlgili Sayfalar</h3>
                  <div className="space-y-2">
                    <Link href={`${basePath}/karasu-kiralik-villa`} className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-semibold text-gray-900">Karasu Kiralık Villa</div>
                      <div className="text-sm text-gray-600">Karasu'ya özel rehber</div>
                    </Link>
                    <Link href={`${basePath}/satilik-villa`} className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-semibold text-gray-900">Satılık Villa</div>
                      <div className="text-sm text-gray-600">Villa ilanları ve rehber</div>
                    </Link>
                    <Link href={`${basePath}/kiralik-daire`} className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-semibold text-gray-900">Kiralık Daire</div>
                      <div className="text-sm text-gray-600">Kiralık daire ilanları</div>
                    </Link>
                    <Link href={`${basePath}/kiralik-ev`} className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-semibold text-gray-900">Kiralık Ev</div>
                      <div className="text-sm text-gray-600">Kiralık ev ilanları</div>
                    </Link>
                    <Link href={`${basePath}/satilik-villa`} className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-semibold text-gray-900">Satılık Villa</div>
                      <div className="text-sm text-gray-600">Satılık villa ilanları</div>
                    </Link>
                    <Link href={`${basePath}/satilik-daire`} className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-semibold text-gray-900">Satılık Daire</div>
                      <div className="text-sm text-gray-600">Satılık daire ilanları</div>
                    </Link>
                    <Link href={`${basePath}/karasu`} className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-semibold text-gray-900">Karasu Rehberi</div>
                      <div className="text-sm text-gray-600">Karasu hakkında bilgiler</div>
                    </Link>
                    <Link href={`${basePath}/karasu-emlak-rehberi`} className="block p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="font-semibold text-gray-900">Karasu Emlak Rehberi</div>
                      <div className="text-sm text-gray-600">Kapsamlı emlak rehberi</div>
                    </Link>
                  </div>
                </div>

                {/* CTA */}
                <div className="p-6 bg-gradient-to-br from-primary to-primary/80 rounded-xl text-white">
                  <h3 className="text-lg font-bold mb-3">Uzman Danışmanlık</h3>
                  <p className="text-sm text-white/90 mb-4">
                    Satılık daire alımında uzman desteği alın. Size en uygun seçeneği bulalım.
                  </p>
                  <Button asChild size="sm" variant="secondary" className="w-full">
                    <Link href={`${basePath}/iletisim`}>
                      İletişime Geçin
                      <Phone className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary to-primary/80 text-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Hayalinizdeki Villayi Bulun
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Geniş ilan yelpazesi ve uzman danışmanlık hizmeti ile size en uygun villayı bulmanıza yardımcı oluyoruz.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link href={`${basePath}/kiralik?propertyType=villa`}>
                    <Search className="w-5 h-5 mr-2" />
                    Villa Ara
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  <Link href={`${basePath}/iletisim`}>
                    <Phone className="w-5 h-5 mr-2" />
                    İletişime Geçin
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
