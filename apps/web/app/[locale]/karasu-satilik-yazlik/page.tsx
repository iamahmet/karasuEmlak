import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Home, Phone, MapPin, TrendingUp, DollarSign, Building2, CheckCircle2, Search, Eye, FileText, Shield, Calculator, BarChart3, Lightbulb, Info } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateArticleSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { generateRealEstateAgentLocalSchema } from '@/lib/seo/local-seo-schemas';
import { generateItemListSchema } from '@/lib/seo/listings-schema';
import { getListings, getNeighborhoods, getListingStats } from '@/lib/supabase/queries';
import { getHighPriorityQAEntries } from '@/lib/supabase/queries/qa';
import { getAIQuestionsForPage } from '@/lib/supabase/queries/ai-questions';
import { ListingCard } from '@/components/listings/ListingCard';
import { withTimeout } from '@/lib/utils/timeout';
import { generateSlug } from '@/lib/utils';
import dynamicImport from 'next/dynamic';
import { Suspense } from 'react';
import { EnhancedRelatedArticles } from '@/components/blog/EnhancedRelatedArticles';
import { getRelatedContent } from '@/lib/content/related-content';
import { calculateReadingTime } from '@/lib/utils/reading-time';

// Performance: ISR with cache tags for better performance
import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
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

const CornerstoneTableOfContents = dynamicImport(() => import('@/components/content/CornerstoneTableOfContents').then(mod => ({ default: mod.CornerstoneTableOfContents })), {
  loading: () => <div className="h-64 bg-gray-50 rounded-xl animate-pulse border border-gray-200" />,
});

const ReadingProgress = dynamicImport(() => import('@/components/content/ReadingProgress').then(mod => ({ default: mod.ReadingProgress })), {
  loading: () => null,
});

const EnhancedShareButtons = dynamicImport(() => import('@/components/share/EnhancedShareButtons').then(mod => ({ default: mod.EnhancedShareButtons })), {
  loading: () => <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/karasu-satilik-yazlik' : `/${locale}/karasu-satilik-yazlik`;
  
  return {
    title: 'Karasu Satılık Yazlık | Denize Yakın Yazlık Evler ve Fiyatlar 2025 | Karasu Emlak',
    description: 'Karasu\'da satılık yazlık ilanları. Denize yakın konumlarda uygun fiyatlı yazlık evler. Güncel fiyatlar, mahalle rehberi ve yatırım analizi. Uzman emlak danışmanlığı ile hayalinizdeki yazlığı bulun.',
    keywords: [
      'karasu satılık yazlık',
      'karasu satılık yazlık ev',
      'karasu satılık yazlık ilanları',
      'karasu denize yakın satılık yazlık',
      'karasu uygun fiyatlı satılık yazlık',
      'karasu yazlık ev fiyatları',
      'karasu satılık yazlık fiyatları',
      'karasu emlak yazlık',
      'sakarya karasu satılık yazlık',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        'tr': '/karasu-satilik-yazlik',
        'en': '/en/karasu-satilik-yazlik',
        'et': '/et/karasu-satilik-yazlik',
        'ru': '/ru/karasu-satilik-yazlik',
        'ar': '/ar/karasu-satilik-yazlik',
      }),
    },
    openGraph: {
      title: 'Karasu Satılık Yazlık | Denize Yakın Yazlık Evler 2025',
      description: 'Karasu\'da satılık yazlık ilanları. Denize yakın konumlarda uygun fiyatlı yazlık evler. Güncel fiyatlar ve mahalle rehberi.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Satılık Yazlık - Emlak İlanları ve Fiyatları',
        },
      ],
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Karasu Satılık Yazlık | Denize Yakın Yazlık Evler',
      description: 'Karasu\'da satılık yazlık ilanları. Denize yakın konumlarda uygun fiyatlı yazlık evler. Güncel fiyatlar ve mahalle rehberi.',
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
async function getKarasuYazlikFAQs() {
  const allFAQs: Array<{ question: string; answer: string }> = [];
  
  // First, try ai_questions (managed Q&A system)
  try {
    const aiQuestions = await withTimeout(
      getAIQuestionsForPage('karasu-satilik-yazlik', 'karasu', 'pillar'),
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
    return allFAQs.slice(0, 10); // Limit to 10 total
  }
  
  // Fallback to static FAQs
  return [
    {
      question: 'Karasu\'da satılık yazlık fiyatları nasıl?',
      answer: 'Karasu\'da satılık yazlık fiyatları konum, metrekare, denize yakınlık ve özelliklere göre değişmektedir. Denize yakın konumlar genellikle daha yüksek fiyatlara sahiptir. Ortalama fiyat aralığı 600.000 TL ile 1.800.000 TL arasında değişmektedir. Denize yakın yazlıklar 800K-1.8M TL, merkeze yakın yazlıklar 600K-1.2M TL aralığındadır. Güncel fiyat bilgisi için ilanlarımıza göz atabilir veya bizimle iletişime geçebilirsiniz.',
    },
    {
      question: 'Karasu\'da hangi mahallelerde satılık yazlık bulunuyor?',
      answer: 'Karasu\'da Sahil, Yalı Mahallesi, Liman Mahallesi, İnköy ve denize yakın mahallelerde satılık yazlık seçenekleri bulunmaktadır. Her mahallenin kendine özgü avantajları vardır. Denize yakın mahalleler (Sahil, Yalı, Liman) yazlık evler için idealdir. Bu bölgeler yaz tatilleri ve yatırım amaçlı tercih edilmektedir.',
    },
    {
      question: 'Karasu\'da satılık yazlık alırken nelere dikkat edilmeli?',
      answer: 'Karasu\'da satılık yazlık alırken konum, fiyat, denize yakınlık, tapu durumu, yapı durumu, kış aylarında bakım ve güvenlik, altyapı hizmetleri (su, elektrik, kanalizasyon) önemlidir. Özellikle yazlık amaçlı alımlarda kış aylarında bakım ve güvenlik konuları göz önünde bulundurulmalıdır. Profesyonel emlak danışmanımız size tüm bu konularda yardımcı olacaktır.',
    },
    {
      question: 'Karasu\'da satılık yazlık yatırım için uygun mu?',
      answer: 'Evet, Karasu\'da satılık yazlık yatırım potansiyeli yüksektir. Özellikle denize yakın konumlar, turizm potansiyeli yüksek alanlar yatırımcıların ilgisini çekmektedir. İstanbul\'a yakınlığı, turizm potansiyeli ve doğal güzellikleri ile uzun vadede değer kazanma potansiyeli yüksektir. Yaz aylarında kiralama geliri de düşünüldüğünde, Karasu\'da satılık yazlık yatırımı mantıklı bir seçenektir.',
    },
    {
      question: 'Karasu\'da kredi ile yazlık alınabilir mi?',
      answer: 'Evet, Karasu\'da kredi ile yazlık alınabilir. Banka kredisi ve peşinat seçenekleri hakkında bilgi almak için bizimle iletişime geçebilirsiniz. Kredi kullanımı durumunda gerekli belgeler, kredi başvuru süreci ve onay koşulları hakkında detaylı bilgi verebiliriz. Genellikle yazlık değerinin %70-80\'i kadar kredi kullanılabilmektedir.',
    },
    {
      question: 'Karasu\'da satılık yazlık alım-satım süreci nasıl işler?',
      answer: 'Karasu\'da satılık yazlık alım-satım süreci genellikle şu adımları içerir: İlan inceleme ve görüntüleme, fiyat pazarlığı, sözleşme imzalama, kapora ödeme, tapu işlemleri, kalan ödeme ve teslim. Tüm süreçte emlak danışmanınız size rehberlik edecektir. Ortalama süre 2-4 hafta arasında değişmektedir.',
    },
    {
      question: 'Karasu\'da denize yakın satılık yazlık var mı?',
      answer: 'Evet, Karasu\'da denize yakın veya denize çok yakın konumlarda satılık yazlık seçenekleri bulunmaktadır. Özellikle Sahil, Yalı Mahallesi ve Liman Mahallesi\'nde denize yakın yazlıklar mevcuttur. Bu yazlıklar genellikle yatırım ve yaz tatilleri amaçlı tercih edilmektedir.',
    },
    {
      question: 'Karasu\'da yazlık evler kış aylarında kullanılabilir mi?',
      answer: 'Karasu\'da bazı yazlık evler kış aylarında da kullanılabilir, ancak çoğu yazlık ev yaz ayları için tasarlanmıştır. Kış aylarında kullanım için ısıtma sistemi, yalıtım ve bakım önemlidir. Kış aylarında kullanılabilir yazlık evler genellikle daha yüksek fiyatlara sahiptir.',
    },
  ];
}

export default async function KarasuSatilikYazlikPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Performance: Fetch data in parallel with timeout (faster than sequential)
  const [allListingsResult, neighborhoodsResult, statsResult] = await Promise.all([
    withTimeout(
      getListings({ status: 'satilik', property_type: ['yazlik'] }, { field: 'created_at', order: 'desc' }, 1000, 0),
      3000,
      { listings: [], total: 0 }
    ),
    withTimeout(getNeighborhoods(), 3000, [] as string[]),
    withTimeout(getListingStats(), 3000, { total: 0, satilik: 0, kiralik: 0, byType: {} }),
  ]);
  
  const { listings: allListings = [] } = allListingsResult || {};
  const neighborhoods = neighborhoodsResult || [];
  const stats = statsResult || { total: 0, satilik: 0, kiralik: 0, byType: {} };

  // Fetch related articles for SEO and engagement
  const relatedArticles = await getRelatedContent({
    keywords: [
      'karasu',
      'yazlık',
      'satılık yazlık',
      'göl kenarı',
      'tatil',
      'yatırım',
      'karasu emlak',
      'yazlık ev',
      'yaz sezonu',
    ],
    location: 'Karasu',
    category: 'Rehber',
    tags: ['Karasu', 'Yazlık', 'Yatırım', 'Tatil'],
    limit: 6,
  });
  
  // Filter Karasu yazlik listings
  const karasuYazlikListings = allListings.filter(listing => 
    (listing.location_city?.toLowerCase().includes('karasu') ||
    listing.location_neighborhood?.toLowerCase().includes('karasu')) &&
    listing.property_type === 'yazlik'
  );

  // Group by features
  const byFeatures = {
    'denizeYakin': karasuYazlikListings.filter(l => l.features?.seaView === true || l.location_neighborhood?.toLowerCase().includes('sahil') || l.location_neighborhood?.toLowerCase().includes('yalı')),
    'bahceli': karasuYazlikListings.filter(l => (l.features as any)?.garden === true || l.features?.sizeM2 && l.features.sizeM2 > 100),
    'uygunFiyatli': karasuYazlikListings.filter(l => l.price_amount && l.price_amount < 1000000),
    'ortaSegment': karasuYazlikListings.filter(l => l.price_amount && l.price_amount >= 1000000 && l.price_amount < 1500000),
  };

  // Calculate average price
  const prices = karasuYazlikListings
    .filter(l => l.price_amount && l.price_amount > 0)
    .map(l => l.price_amount!);
  const avgPrice = prices.length > 0 
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : null;

  // Performance: Fetch Q&As with timeout (non-blocking)
  const faqsResult = await withTimeout(getKarasuYazlikFAQs(), 2000, []);
  const faqs = faqsResult || [];

  // Generate schemas
  const articleSchema = {
    ...generateArticleSchema({
      headline: 'Karasu Satılık Yazlık | Denize Yakın Yazlık Evler ve Fiyatlar 2025',
      description: 'Karasu\'da satılık yazlık ilanları. Denize yakın konumlarda uygun fiyatlı yazlık evler. Güncel fiyatlar, mahalle rehberi ve yatırım analizi.',
      image: [`${siteConfig.url}/og-image.jpg`],
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      author: 'Karasu Emlak',
    }),
    // AI Overviews optimization
    mainEntity: {
      '@type': 'Question',
      name: 'Karasu\'da satılık yazlık nasıl bulunur?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Karasu\'da satılık yazlık arayanlar için geniş bir seçenek yelpazesi mevcuttur. Fiyatlar konum, metrekare ve özelliklere göre 600.000 TL ile 1.800.000 TL arasında değişmektedir. Denize yakın konumlar daha yüksek fiyatlara sahiptir. Hem yaz tatilleri hem de yatırım amaçlı seçenekler bulunmaktadır. Denize yakın, bahçeli ve uygun fiyatlı yazlık seçenekleri mevcuttur.',
      },
    },
  };

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Satılık İlanlar', url: `${siteConfig.url}${basePath}/satilik` },
      { name: 'Karasu Satılık Yazlık', url: `${siteConfig.url}${basePath}/karasu-satilik-yazlik` },
    ],
    `${siteConfig.url}${basePath}/karasu-satilik-yazlik`
  );

  // RealEstateAgent schema
  const realEstateAgentSchema = generateRealEstateAgentLocalSchema({
    includeRating: true,
    includeServices: true,
    includeAreaServed: true,
  });

  // ItemList schema for listings
  const itemListSchema = karasuYazlikListings.length > 0
    ? generateItemListSchema(karasuYazlikListings.slice(0, 20), `${siteConfig.url}${basePath}`, {
        name: 'Karasu Satılık Yazlık İlanları',
        description: `Karasu'da ${karasuYazlikListings.length} adet satılık yazlık ilanı. Denize yakın konumlarda uygun fiyatlı yazlık evler.`,
      })
    : null;

  // Generate HTML content for AI checker and TOC
  const pageContent = `
    <h2 id="genel-bakis">Karasu'da Satılık Yazlık Arayanlar İçin Genel Bakış</h2>
    <p>Karasu, Sakarya'nın en gözde sahil ilçelerinden biri olup, satılık yazlık piyasasında çeşitli seçenekler sunmaktadır.</p>
    
    <h2 id="ozelliklerine-gore-secenekler">Özelliklerine Göre Karasu Satılık Yazlık Seçenekleri</h2>
    <p>Karasu'da satılık yazlık seçenekleri özelliklerine göre çeşitlilik göstermektedir.</p>
    
    <h3 id="denize-yakin-yazliklar">Denize Yakın Yazlıklar</h3>
    <p>Denize yakın konumlarda yazlık seçenekleri. Plaja yakınlık ve deniz manzarası avantajları.</p>
    
    <h3 id="bahceli-yazliklar">Bahçeli Yazlıklar</h3>
    <p>Bahçeli yazlık seçenekleri. Özel bahçe kullanımı ve doğa içinde yaşam.</p>
    
    <h2 id="fiyat-analizi">Karasu Satılık Yazlık Fiyat Analizi ve Piyasa Trendleri</h2>
    <p>Karasu'da satılık yazlık fiyatları birçok faktöre bağlı olarak değişmektedir.</p>
    
    <h2 id="mahalleler">Mahallelere Göre Karasu Satılık Yazlık Seçenekleri</h2>
    <p>Karasu'nun her mahallesi kendine özgü karakteristiklere sahiptir.</p>
    
    <h2 id="dikkat-edilmesi-gerekenler">Karasu'da Satılık Yazlık Alırken Dikkat Edilmesi Gerekenler</h2>
    <p>Karasu'da satılık yazlık alırken dikkat edilmesi gereken önemli noktalar vardır.</p>
  `;

  // Calculate reading time and word count
  const readingTime = calculateReadingTime(pageContent);
  const wordCount = pageContent.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(w => w.length > 0).length;

  // Generate headings for TOC
  const tocHeadings = [
    { id: 'genel-bakis', text: 'Karasu\'da Satılık Yazlık Arayanlar İçin Genel Bakış', level: 2 },
    { id: 'ozelliklerine-gore-secenekler', text: 'Özelliklerine Göre Karasu Satılık Yazlık Seçenekleri', level: 2 },
    { id: 'denize-yakin-yazliklar', text: 'Denize Yakın Yazlıklar', level: 3 },
    { id: 'bahceli-yazliklar', text: 'Bahçeli Yazlıklar', level: 3 },
    { id: 'fiyat-analizi', text: 'Karasu Satılık Yazlık Fiyat Analizi ve Piyasa Trendleri', level: 2 },
    { id: 'mahalleler', text: 'Mahallelere Göre Karasu Satılık Yazlık Seçenekleri', level: 2 },
    { id: 'dikkat-edilmesi-gerekenler', text: 'Karasu\'da Satılık Yazlık Alırken Dikkat Edilmesi Gerekenler', level: 2 },
  ];

  const shareUrl = `${siteConfig.url}${basePath}/karasu-satilik-yazlik`;
  const shareTitle = 'Karasu Satılık Yazlık | Denize Yakın Yazlık Evler ve Fiyatlar 2025';
  const shareDescription = 'Karasu\'da satılık yazlık ilanları. Denize yakın konumlarda uygun fiyatlı yazlık evler. Güncel fiyatlar, mahalle rehberi ve yatırım analizi.';

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={realEstateAgentSchema} />
      {itemListSchema && <StructuredData data={itemListSchema} />}
      
      {/* Reading Progress Bar - Lazy loaded */}
      <Suspense fallback={null}>
        <ReadingProgress showTimeRemaining={true} estimatedReadingTime={readingTime} />
      </Suspense>
      
      {/* AI Checker Badge - Admin Only (Hidden from public) */}

      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Satılık İlanlar', href: `${basePath}/satilik` },
          { label: 'Karasu Satılık Yazlık', href: `${basePath}/karasu-satilik-yazlik` },
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
                    {karasuYazlikListings.length}+ Aktif Yazlık İlanı
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Karasu Satılık Yazlık
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  Karasu'da satılık yazlık arayanlar için kapsamlı rehber. Denize yakın konumlarda uygun fiyatlı yazlık evler. 
                  Güncel fiyatlar, mahalle rehberi ve yatırım analizi. Uzman emlak danışmanlığı ile hayalinizdeki yazlığı bulun.
                </p>
                
                {/* Share Buttons - Lazy loaded */}
                <div className="mb-6 flex justify-center">
                  <Suspense fallback={<div className="h-10 w-64 bg-white/10 rounded-lg animate-pulse" />}>
                    <EnhancedShareButtons
                      url={shareUrl}
                      title={shareTitle}
                      description={shareDescription}
                      variant="compact"
                      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg"
                    />
                  </Suspense>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    <Link href={`${basePath}/satilik?propertyType=yazlik`}>
                      <Home className="w-5 h-5 mr-2" />
                      Tüm Yazlık İlanlarını Görüntüle
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
                <div className="text-2xl font-bold text-primary">{karasuYazlikListings.length}</div>
                <div className="text-sm text-gray-600">Aktif Yazlık İlanı</div>
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
                      <strong>Karasu'da satılık yazlık</strong> arayanlar için geniş bir seçenek yelpazesi mevcuttur. 
                      Fiyatlar konum, metrekare ve özelliklere göre 600.000 TL ile 1.800.000 TL arasında değişmektedir. 
                      Denize yakın konumlar daha yüksek fiyatlara sahiptir. Hem yaz tatilleri hem de 
                      yatırım amaçlı seçenekler bulunmaktadır. Denize yakın, bahçeli ve uygun fiyatlı yazlık seçenekleri mevcuttur. İstanbul'a yakınlık, 
                      turizm potansiyeli ve doğal güzellikler, Karasu'yu yazlık yatırımları için cazip bir bölge haline getirmektedir.
                    </p>
                  </div>
                </ScrollReveal>

                {/* Introduction */}
                <ScrollReveal direction="up" delay={100}>
                  <article id="genel-bakis" className="scroll-mt-24">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Karasu'da Satılık Yazlık Arayanlar İçin Genel Bakış
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu, Sakarya'nın en gözde sahil ilçelerinden biri olup, satılık yazlık piyasasında çeşitli seçenekler sunmaktadır. 
                        Denize yakın konumu, uygun fiyatlı yazlık evler, bahçeli seçenekler ile Karasu yazlık piyasası zengin bir yelpazeye sahiptir.
                      </p>
                      <p>
                        Karasu'da satılık yazlık arayanlar için hem yaz tatilleri hem de yatırım amaçlı seçenekler bulunmaktadır. 
                        Özellikle İstanbul'a yakınlığı, doğal güzellikleri ve turizm potansiyeli ile Karasu, yazlık yatırımcılarının 
                        ilgisini çeken bir bölgedir.
                      </p>
                      <p>
                        Bu rehber, Karasu'da satılık yazlık almayı düşünenler için fiyat analizi, mahalle rehberi, yazlık özelliklerine göre seçenekler, 
                        yatırım tavsiyeleri ve dikkat edilmesi gerekenler hakkında kapsamlı bilgi sunmaktadır.
                      </p>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Yazlik Features Options */}
                <ScrollReveal direction="up" delay={200}>
                  <article id="ozelliklerine-gore-secenekler" className="scroll-mt-24">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Özelliklerine Göre Karasu Satılık Yazlık Seçenekleri
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da satılık yazlık seçenekleri özelliklerine göre çeşitlilik göstermektedir. Her özelliğin kendine özgü 
                        avantajları ve kullanım alanları vardır.
                      </p>

                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div id="denize-yakin-yazliklar" className="scroll-mt-24 border rounded-lg p-6 bg-gray-50">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Denize Yakın Yazlıklar</h3>
                          <p className="text-gray-700 mb-3">
                            Denize yakın konumlarda yazlık seçenekleri. Plaja yakınlık ve deniz manzarası avantajları.
                          </p>
                          <div className="text-sm text-gray-600 mb-3">
                            <strong>Fiyat Aralığı:</strong> 800.000 TL - 1.800.000 TL
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Popüler Mahalleler:</strong> Sahil, Yalı Mahallesi, Liman
                          </div>
                          <Link href={`${basePath}/satilik?propertyType=yazlik&seaView=true`}>
                            <Button variant="outline" size="sm" className="w-full mt-4">
                              Denize Yakın Yazlık Ara
                            </Button>
                          </Link>
                        </div>

                        <div id="bahceli-yazliklar" className="scroll-mt-24 border rounded-lg p-6 bg-gray-50">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Bahçeli Yazlıklar</h3>
                          <p className="text-gray-700 mb-3">
                            Bahçeli yazlık seçenekleri. Özel bahçe kullanımı ve doğa içinde yaşam.
                          </p>
                          <div className="text-sm text-gray-600 mb-3">
                            <strong>Fiyat Aralığı:</strong> 700.000 TL - 1.500.000 TL
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Popüler Mahalleler:</strong> Sahil, Yalı Mahallesi, İnköy
                          </div>
                          <Link href={`${basePath}/satilik?propertyType=yazlik`}>
                            <Button variant="outline" size="sm" className="w-full mt-4">
                              Bahçeli Yazlık Ara
                            </Button>
                          </Link>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Uygun Fiyatlı Yazlıklar</h3>
                          <p className="text-gray-700 mb-3">
                            Uygun fiyatlı yazlık seçenekleri. Yatırım ve yaz tatilleri için ideal.
                          </p>
                          <div className="text-sm text-gray-600 mb-3">
                            <strong>Fiyat Aralığı:</strong> 600.000 TL - 1.000.000 TL
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Popüler Mahalleler:</strong> İnköy, Aziziye, Merkez
                          </div>
                          <Link href={`${basePath}/satilik?propertyType=yazlik&maxPrice=1000000`}>
                            <Button variant="outline" size="sm" className="w-full mt-4">
                              Uygun Fiyatlı Yazlık Ara
                            </Button>
                          </Link>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">Orta Segment Yazlıklar</h3>
                          <p className="text-gray-700 mb-3">
                            Orta segment yazlık seçenekleri. Dengeli fiyat ve özellik dengesi.
                          </p>
                          <div className="text-sm text-gray-600 mb-3">
                            <strong>Fiyat Aralığı:</strong> 1.000.000 TL - 1.500.000 TL
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Popüler Mahalleler:</strong> Sahil, Yalı Mahallesi, Liman
                          </div>
                          <Link href={`${basePath}/satilik?propertyType=yazlik&minPrice=1000000&maxPrice=1500000`}>
                            <Button variant="outline" size="sm" className="w-full mt-4">
                              Orta Segment Yazlık Ara
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Price Analysis */}
                <ScrollReveal direction="up" delay={400}>
                  <article id="fiyat-analizi" className="scroll-mt-24">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Karasu Satılık Yazlık Fiyat Analizi ve Piyasa Trendleri
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da satılık yazlık fiyatları birçok faktöre bağlı olarak değişmektedir. Bu faktörleri anlamak, 
                        doğru karar vermenize yardımcı olacaktır.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="p-6 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 rounded-2xl border border-blue-200/40">
                          <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-[#006AFF]" />
                            Fiyat Trendleri
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                              <span className="text-gray-700 font-medium">Uygun Fiyatlı</span>
                              <span className="font-bold text-gray-900">600K - 1M TL</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                              <span className="text-gray-700 font-medium">Denize Yakın</span>
                              <span className="font-bold text-gray-900">800K - 1.8M TL</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                              <span className="text-gray-700 font-medium">Bahçeli Yazlık</span>
                              <span className="font-bold text-gray-900">700K - 1.5M TL</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                              <span className="text-gray-700 font-medium">Orta Segment</span>
                              <span className="font-bold text-gray-900">1M - 1.5M TL</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-green-50/30 rounded-2xl border border-emerald-200/40">
                          <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                            <Lightbulb className="h-6 w-6 text-[#00A862]" />
                            Yatırım İpuçları
                          </h3>
                          <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-[#00A862] flex-shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-gray-900 font-semibold">Denize yakın konumlar</strong> yatırım değeri yüksek
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-[#00A862] flex-shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-gray-900 font-semibold">Gelişen mahalleler</strong> gelecek potansiyeli sunar
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-[#00A862] flex-shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-gray-900 font-semibold">Denize yakınlık</strong> yatırım değeri yüksek
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-[#00A862] flex-shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-gray-900 font-semibold">Yaz kiralama</strong> yatırım getirisi yüksek
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Neighborhoods */}
                <ScrollReveal direction="up" delay={600}>
                  <article id="mahalleler" className="scroll-mt-24">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Mahallelere Göre Karasu Satılık Yazlık Seçenekleri
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'nun her mahallesi kendine özgü karakteristiklere sahiptir. Satılık yazlık seçerken mahalle 
                        özelliklerini değerlendirmek önemlidir.
                      </p>

                      <div className="grid md:grid-cols-2 gap-4 mt-6">
                        {neighborhoods.slice(0, 8).map((neighborhood) => {
                          const neighborhoodSlug = generateSlug(neighborhood);
                          const neighborhoodListings = karasuYazlikListings.filter(
                            l => l.location_neighborhood && generateSlug(l.location_neighborhood) === generateSlug(neighborhood)
                          );
                          
                          return (
                            <Link
                              key={neighborhood}
                              href={`${basePath}/mahalle/${neighborhoodSlug}?status=satilik&propertyType=yazlik`}
                              className="block border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all"
                            >
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{neighborhood}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {neighborhoodListings.length} satılık yazlık ilanı
                              </p>
                              <span className="text-sm text-primary font-medium">Mahalle detayları →</span>
                            </Link>
                          );
                        })}
                      </div>

                      <div className="mt-6">
                        <Link href={`${basePath}/karasu/mahalleler`}>
                          <Button variant="outline">
                            Tüm Mahalleleri Keşfet
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Important Considerations */}
                <ScrollReveal direction="up" delay={800}>
                  <article id="dikkat-edilmesi-gerekenler" className="scroll-mt-24">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Karasu'da Satılık Yazlık Alırken Dikkat Edilmesi Gerekenler
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da satılık yazlık alırken dikkat edilmesi gereken önemli noktalar vardır. Bu noktalar hem 
                        yatırım hem de yaz tatilleri amaçlı alımlar için geçerlidir.
                      </p>

                      <div className="space-y-4 mt-6">
                        <div className="border rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Tapu Durumu ve Yasal İşlemler
                          </h3>
                          <p>
                            Tapu durumu mutlaka kontrol edilmelidir. Yazlık evler genellikle arsa tapulu veya kat mülkiyetli olabilir. 
                            Tapu müdürlüğünden güncel bilgi alınmalıdır.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Yapı Durumu ve Kış Bakımı
                          </h3>
                          <p>
                            Yazlık yapı kalitesi, bakım durumu ve kış aylarında güvenlik önemlidir. Özellikle yazlık evler için 
                            kış bakımı ve güvenlik sistemleri göz önünde bulundurulmalıdır.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            Özellikler: Denize Yakınlık, Bahçe
                          </h3>
                          <p>
                            Denize yakınlık, bahçe varlığı gibi özellikler hem yaşam kalitesini hem de yazlık değerini etkiler. 
                            Bu özelliklere sahip yazlıklar genellikle daha yüksek fiyatlara sahiptir ve yatırım potansiyeli yüksektir.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            Konum ve Altyapı
                          </h3>
                          <p>
                            Denize mesafe, altyapı hizmetleri (su, elektrik, kanalizasyon, internet), güvenlik ve 
                            ulaşım imkanları değerlendirilmelidir. Özellikle yazlık evler için bu faktörler yaşam kalitesini etkiler.
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-20 space-y-6">
                  {/* Table of Contents - Lazy loaded */}
                  <Suspense fallback={<div className="h-64 bg-gray-50 rounded-xl animate-pulse border border-gray-200 mb-6" />}>
                    <CornerstoneTableOfContents
                      headings={tocHeadings}
                      className="mb-6"
                    />
                  </Suspense>

                  {/* Share Buttons - Lazy loaded */}
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Paylaş</h3>
                    <Suspense fallback={<div className="h-10 bg-gray-100 rounded-lg animate-pulse" />}>
                      <EnhancedShareButtons
                        url={shareUrl}
                        title={shareTitle}
                        description={shareDescription}
                        variant="compact"
                        className="flex-wrap gap-2"
                      />
                    </Suspense>
                  </div>

                  {/* Page Info Card */}
                  <ScrollReveal direction="left" delay={100}>
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                      <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-primary" />
                        Sayfa Bilgileri
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                          <div className="flex items-center gap-2.5 text-sm text-gray-600">
                            <Eye className="h-4 w-4 text-primary" />
                            <span className="font-medium">Okuma Süresi</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{readingTime} dk</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                          <div className="flex items-center gap-2.5 text-sm text-gray-600">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="font-medium">Kelime Sayısı</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{wordCount.toLocaleString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="left" delay={100}>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Hızlı İstatistikler
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Toplam Yazlık</span>
                          <span className="text-lg font-bold text-gray-900">{karasuYazlikListings.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Denize Yakın</span>
                          <span className="text-lg font-bold text-gray-900">{byFeatures.denizeYakin.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Bahçeli</span>
                          <span className="text-lg font-bold text-gray-900">{byFeatures.bahceli.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Uygun Fiyatlı</span>
                          <span className="text-lg font-bold text-gray-900">{byFeatures.uygunFiyatli.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Orta Segment</span>
                          <span className="text-lg font-bold text-gray-900">{byFeatures.ortaSegment.length}</span>
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
                        Karasu'da satılık yazlık arayanlar için uzman emlak danışmanlarımız size yardımcı olmaktan memnuniyet duyar.
                      </p>
                      <Button asChild className="w-full">
                        <Link href={`${basePath}/iletisim`}>
                          <Phone className="w-4 h-4 mr-2" />
                          İletişime Geçin
                        </Link>
                      </Button>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal direction="left" delay={300}>
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        İlgili Sayfalar
                      </h3>
                      <div className="space-y-2">
                        <Link href={`${basePath}/satilik?propertyType=yazlik`} className="block text-sm text-primary hover:underline">
                          Tüm Satılık Yazlıklar
                        </Link>
                        <Link href={`${basePath}/karasu-satilik-villa`} className="block text-sm text-primary hover:underline">
                          Karasu Satılık Villa
                        </Link>
                        <Link href={`${basePath}/karasu-satilik-daire`} className="block text-sm text-primary hover:underline">
                          Karasu Satılık Daire
                        </Link>
                        <Link href={`${basePath}/karasu-satilik-ev`} className="block text-sm text-primary hover:underline">
                          Karasu Satılık Ev
                        </Link>
                        <Link href={`${basePath}/karasu-denize-yakin-satilik-ev`} className="block text-sm text-primary hover:underline">
                          Denize Yakın Satılık Ev
                        </Link>
                        <Link href={`${basePath}/karasu-mahalleler`} className="block text-sm text-primary hover:underline">
                          Karasu Mahalleler
                        </Link>
                        <div className="pt-2 mt-2 border-t border-gray-200">
                          <Link href={`${basePath}/kredi-hesaplayici`} className="block text-sm text-primary hover:underline font-medium">
                            Kredi Hesaplayıcı →
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
        {karasuYazlikListings.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Öne Çıkan Karasu Satılık Yazlık İlanları
                  </h2>
                  <p className="text-base text-gray-600">
                    {karasuYazlikListings.length} adet satılık yazlık ilanı
                  </p>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {karasuYazlikListings.slice(0, 6).map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                    {/* First 3 images get priority loading for LCP optimization */}
                    <ListingCard listing={listing} basePath={basePath} priority={index < 3} />
                  </ScrollReveal>
                ))}
              </div>
              {karasuYazlikListings.length > 6 && (
                <div className="text-center mt-8">
                  <Button asChild size="lg">
                    <Link href={`${basePath}/satilik?propertyType=yazlik`}>
                      Tüm Satılık Yazlık İlanlarını Görüntüle ({karasuYazlikListings.length})
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
                  Karasu satılık yazlıklar hakkında merak edilenler
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

        {/* Related Articles Section - SEO & Engagement */}
        {relatedArticles.length > 0 && (
          <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4">
              <EnhancedRelatedArticles
                articles={relatedArticles}
                basePath={basePath}
                title="Karasu Yazlık ve Yatırım Hakkında Makaleler"
                limit={6}
              />
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Karasu'da Hayalinizdeki Yazlığı Bulun
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Uzman emlak danışmanlarımız, Karasu'da satılık yazlık arayanlar için profesyonel danışmanlık hizmeti sunmaktadır. 
                Tüm süreçte yanınızdayız.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                  <Link href={`${basePath}/iletisim`}>
                    <Phone className="w-5 h-5 mr-2" />
                    İletişime Geçin
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                  <Link href={`${basePath}/satilik?propertyType=yazlik`}>
                    <Home className="w-5 h-5 mr-2" />
                    Tüm Yazlık İlanlarını İncele
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
