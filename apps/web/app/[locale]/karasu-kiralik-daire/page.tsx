import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
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
import { AIChecker } from '@/components/content/AIChecker';
import { AICheckerBadge } from '@/components/content/AICheckerBadge';
import { generatePageContentInfo } from '@/lib/content/ai-checker-helper';
import { generateSlug } from '@/lib/utils';
import dynamicImport from 'next/dynamic';

// Performance: Revalidate every hour for ISR
export const revalidate = 3600; // 1 hour

const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/karasu-kiralik-daire' : `/${locale}/karasu-kiralik-daire`;
  
  return {
    title: 'Karasu Kiralık Daire | En Güncel İlanlar ve Aylık Kira Fiyatları 2025 | Karasu Emlak',
    description: 'Karasu\'da kiralık daire ilanları. Denize yakın konumlarda 1+1\'den 4+1\'e kadar geniş seçenek. Güncel aylık kira fiyatları, mahalle rehberi ve kiralama rehberi. Uzman emlak danışmanlığı ile hayalinizdeki daireyi bulun.',
    keywords: [
      'karasu kiralık daire',
      'karasu kiralık daireler',
      'karasu kiralık daire ilanları',
      'karasu denize yakın kiralık daire',
      'karasu merkez kiralık daire',
      'karasu 2+1 kiralık daire',
      'karasu 3+1 kiralık daire',
      'karasu kiralık daire fiyatları',
      'karasu emlak kiralık daire',
      'sakarya karasu kiralık daire',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': '/karasu-kiralik-daire',
        'en': '/en/karasu-kiralik-daire',
        'et': '/et/karasu-kiralik-daire',
        'ru': '/ru/karasu-kiralik-daire',
        'ar': '/ar/karasu-kiralik-daire',
      },
    },
    openGraph: {
      title: 'Karasu Kiralık Daire | En Güncel İlanlar ve Aylık Kira Fiyatları 2025',
      description: 'Karasu\'da kiralık daire ilanları. Denize yakın konumlarda 1+1\'den 4+1\'e kadar geniş seçenek. Güncel aylık kira fiyatları ve mahalle rehberi.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'article',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Kiralık Daire - Emlak İlanları ve Kira Fiyatları',
        },
      ],
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Karasu Kiralık Daire | En Güncel İlanlar',
      description: 'Karasu\'da kiralık daire ilanları. Denize yakın konumlarda geniş seçenek. Güncel aylık kira fiyatları ve mahalle rehberi.',
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
async function getKarasuKiralikDaireFAQs() {
  const allFAQs: Array<{ question: string; answer: string }> = [];
  
  // First, try ai_questions (managed Q&A system)
  try {
    const aiQuestions = await withTimeout(
      getAIQuestionsForPage('karasu-kiralik-daire', 'karasu', 'pillar'),
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
      question: 'Karasu\'da kiralık daire aylık kira fiyatları nasıl?',
      answer: 'Karasu\'da kiralık daire aylık kira fiyatları konum, metrekare, oda sayısı, bina yaşı ve özelliklere göre değişmektedir. Denize yakın konumlar ve merkez mahalleler genellikle daha yüksek kira fiyatlarına sahiptir. Ortalama aylık kira aralığı 3.000 TL ile 12.000 TL arasında değişmektedir. 1+1 daireler 3K-5K TL, 2+1 daireler 4K-8K TL, 3+1 daireler 6K-12K TL aralığındadır. Güncel kira bilgisi için ilanlarımıza göz atabilir veya bizimle iletişime geçebilirsiniz.',
    },
    {
      question: 'Karasu\'da hangi mahallelerde kiralık daire bulunuyor?',
      answer: 'Karasu\'da Merkez, Sahil, Yalı Mahallesi, Liman Mahallesi, İnköy, Aziziye, Cumhuriyet ve diğer mahallelerde kiralık daire seçenekleri bulunmaktadır. Her mahallenin kendine özgü avantajları vardır. Denize yakın mahalleler (Sahil, Yalı, Liman) yazlık kiralama için idealdir, merkez mahalleler sürekli oturum için tercih edilmektedir.',
    },
    {
      question: 'Karasu\'da kiralık daire kiralarken nelere dikkat edilmeli?',
      answer: 'Karasu\'da kiralık daire kiralarken konum, aylık kira, depozito, bina yaşı, yapı durumu, denize yakınlık, ulaşım imkanları, asansör, otopark, balkon, deniz manzarası, eşyalı/eşyasız durumu gibi özellikler önemlidir. Kira sözleşmesi, depozito tutarı ve süre gibi konuları profesyonel emlak danışmanımız size açıklayacaktır.',
    },
    {
      question: 'Karasu\'da kiralık daire kiralama süreci nasıl işler?',
      answer: 'Karasu\'da kiralık daire kiralama süreci genellikle şu adımları içerir: İlan inceleme ve görüntüleme, kira pazarlığı, sözleşme imzalama, depozito ödeme, anahtar teslimi. Tüm süreçte emlak danışmanınız size rehberlik edecektir. Ortalama süre 1-2 hafta arasında değişmektedir.',
    },
    {
      question: 'Karasu\'da hangi oda sayılarında kiralık daire bulunuyor?',
      answer: 'Karasu\'da 1+1, 2+1, 3+1 ve 4+1 kiralık daire seçenekleri bulunmaktadır. En popüler seçenekler 2+1 ve 3+1 dairelerdir. 1+1 daireler genellikle tek kişilik yaşam için idealdir, 3+1 ve 4+1 daireler aileler için idealdir.',
    },
    {
      question: 'Karasu\'da denize yakın kiralık daire var mı?',
      answer: 'Evet, Karasu\'da denize yakın konumlarda kiralık daire seçenekleri bulunmaktadır. Özellikle Sahil, Yalı Mahallesi ve Liman Mahallesi\'nde denize yakın kiralık daireler mevcuttur. Bu daireler genellikle yazlık kiralama için tercih edilmektedir.',
    },
    {
      question: 'Karasu\'da eşyalı kiralık daire var mı?',
      answer: 'Evet, Karasu\'da hem eşyalı hem eşyasız kiralık daire seçenekleri bulunmaktadır. Eşyalı daireler genellikle yazlık kiralama için tercih edilmektedir ve kira fiyatları biraz daha yüksektir. Eşyasız daireler sürekli oturum için idealdir.',
    },
    {
      question: 'Karasu\'da kiralık daire depozito tutarı ne kadar?',
      answer: 'Karasu\'da kiralık daire depozito tutarı genellikle 1-3 aylık kira tutarı kadar olmaktadır. Depozito tutarı daire özelliklerine, konumuna ve kira tutarına göre değişmektedir. Detaylı bilgi için bizimle iletişime geçebilirsiniz.',
    },
  ];
}

export default async function KarasuKiralikDairePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Fetch data with timeout
  const allListingsResult = await withTimeout(
    getListings({ status: 'kiralik', property_type: ['daire'] }, { field: 'created_at', order: 'desc' }, 1000, 0),
    3000,
    { listings: [], total: 0 }
  );
  const neighborhoodsResult = await withTimeout(getNeighborhoods(), 3000, [] as string[]);
  const statsResult = await withTimeout(getListingStats(), 3000, { total: 0, satilik: 0, kiralik: 0, byType: {} });
  
  const { listings: allListings = [] } = allListingsResult || {};
  const neighborhoods = neighborhoodsResult || [];
  const stats = statsResult || { total: 0, satilik: 0, kiralik: 0, byType: {} };
  
  // Filter Karasu kiralik daire listings
  const karasuKiralikDaireListings = allListings.filter(listing => 
    (listing.location_city?.toLowerCase().includes('karasu') ||
    listing.location_neighborhood?.toLowerCase().includes('karasu')) &&
    listing.property_type === 'daire'
  );

  // Group by room count
  const byRooms = {
    '1+1': karasuKiralikDaireListings.filter(l => l.features?.rooms === 1),
    '2+1': karasuKiralikDaireListings.filter(l => l.features?.rooms === 2),
    '3+1': karasuKiralikDaireListings.filter(l => l.features?.rooms === 3),
    '4+1': karasuKiralikDaireListings.filter(l => l.features?.rooms === 4),
  };

  // Calculate average monthly rent
  const rents = karasuKiralikDaireListings
    .filter(l => l.price_amount && l.price_amount > 0)
    .map(l => l.price_amount!);
  const avgRent = rents.length > 0 
    ? Math.round(rents.reduce((a, b) => a + b, 0) / rents.length)
    : null;

  // Fetch Q&As from database
  const faqs = await getKarasuKiralikDaireFAQs();

  // Generate schemas
  const articleSchema = {
    ...generateArticleSchema({
      headline: 'Karasu Kiralık Daire | En Güncel İlanlar ve Aylık Kira Fiyatları 2025',
      description: 'Karasu\'da kiralık daire ilanları. Denize yakın konumlarda 1+1\'den 4+1\'e kadar geniş seçenek. Güncel aylık kira fiyatları, mahalle rehberi ve kiralama rehberi.',
      image: [`${siteConfig.url}/og-image.jpg`],
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      author: 'Karasu Emlak',
    }),
    // AI Overviews optimization
    mainEntity: {
      '@type': 'Question',
      name: 'Karasu\'da kiralık daire nasıl bulunur?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Karasu\'da kiralık daire arayanlar için geniş bir seçenek yelpazesi mevcuttur. Aylık kira fiyatları konum, metrekare ve özelliklere göre 3.000 TL ile 12.000 TL arasında değişmektedir. Denize yakın konumlar ve merkez mahalleler daha yüksek kira fiyatlarına sahiptir. Hem sürekli oturum hem de yazlık kiralama amaçlı seçenekler bulunmaktadır. 1+1, 2+1, 3+1 ve 4+1 oda seçenekleri mevcuttur.',
      },
    },
  };

  const faqSchema = generateFAQSchema(faqs);

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Kiralık İlanlar', url: `${siteConfig.url}${basePath}/kiralik` },
      { name: 'Karasu Kiralık Daire', url: `${siteConfig.url}${basePath}/karasu-kiralik-daire` },
    ],
    `${siteConfig.url}${basePath}/karasu-kiralik-daire`
  );

  // RealEstateAgent schema
  const realEstateAgentSchema = generateRealEstateAgentLocalSchema({
    includeRating: true,
    includeServices: true,
    includeAreaServed: true,
  });

  // ItemList schema for listings
  const itemListSchema = karasuKiralikDaireListings.length > 0
    ? generateItemListSchema(karasuKiralikDaireListings.slice(0, 20), `${siteConfig.url}${basePath}`, {
        name: 'Karasu Kiralık Daire İlanları',
        description: `Karasu'da ${karasuKiralikDaireListings.length} adet kiralık daire ilanı. Denize yakın konumlarda geniş seçenek.`,
      })
    : null;
  // Generate page content for AI checker
  const pageContentInfo = generatePageContentInfo('Karasu Kiralık Daire', [
    { id: 'genel-bakis', title: 'Karasu\'da Kiralık Daire Arayanlar İçin Genel Bakış', content: 'Karasu\'da kiralık daire ilanları ve seçenekleri hakkında kapsamlı bilgi. Denize yakın konumlarda, merkez mahallelerde ve gelişen bölgelerde kiralık daire seçenekleri bulunmaktadır. Hem sürekli oturum hem de yazlık kiralama amaçlı seçenekler mevcuttur. İstanbul\'a yakınlık, turizm potansiyeli ve doğal güzellikler, Karasu\'yu kiralık daire arayanlar için cazip bir bölge haline getirmektedir.' },
    { id: 'oda-sayisina-gore', title: 'Oda Sayısına Göre Karasu Kiralık Daire Seçenekleri', content: '1+1, 2+1, 3+1 ve 4+1 oda seçenekleri mevcuttur. Tek kişi veya çiftler için 1+1, küçük aileler için 2+1, orta büyüklükte aileler için 3+1, büyük aileler için 4+1 daire seçenekleri bulunmaktadır. Her oda sayısı için farklı fiyat aralıklarında seçenekler mevcuttur.' },
    { id: 'fiyat-analizi', title: 'Karasu Kiralık Daire Fiyat Analizi', content: 'Karasu\'da kiralık daire fiyatları konum, metrekare, oda sayısı, denize yakınlık ve özelliklere göre değişmektedir. Ortalama aylık kira fiyatları 1+1 daireler için 2.500 TL - 6.000 TL, 2+1 daireler için 4.000 TL - 9.000 TL, 3+1 daireler için 6.000 TL - 11.000 TL, 4+1 daireler için 8.000 TL - 15.000 TL arasında değişmektedir. Denize yakın konumlar ve merkez mahalleler daha yüksek kira fiyatlarına sahiptir.' },
    { id: 'mahalleler', title: 'Mahallelere Göre Karasu Kiralık Daire Seçenekleri', content: 'Karasu\'nun farklı mahallelerinde kiralık daire seçenekleri mevcuttur. Merkez mahalleler, denize yakın mahalleler, gelişen bölgeler ve uygun fiyatlı bölgeler hakkında detaylı bilgi. Her mahallenin ulaşım, sosyal alanlar, okullar, sağlık kuruluşları ve güvenlik açısından değerlendirmesi.' },
    { id: 'dikkat-edilmesi-gerekenler', title: 'Dikkat Edilmesi Gerekenler', content: 'Karasu\'da kiralık daire ararken dikkat edilmesi gerekenler: Kira sözleşmesi detayları, depozito miktarı, kira artış oranları, ev sahibi ile iletişim, evin durumu, çevre faktörleri, ulaşım kolaylığı ve sosyal alanlar. Kira sözleşmelerinde yasal haklar ve sorumluluklar hakkında bilgi sahibi olunmalıdır.' },
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
          { label: 'Kiralık İlanlar', href: `${basePath}/kiralik` },
          { label: 'Karasu Kiralık Daire', href: `${basePath}/karasu-kiralik-daire` },
        ]}
      />
      
      {/* AI Checker Badge */}
      <AICheckerBadge
        content={pageContentInfo.content}
        title="Karasu Kiralık Daire"
        position="top-right"
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
                    {karasuKiralikDaireListings.length}+ Aktif Kiralık Daire İlanı
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Karasu Kiralık Daire
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8">
                  Karasu'da kiralık daire arayanlar için kapsamlı rehber. Denize yakın konumlarda 1+1'den 4+1'e kadar geniş seçenek. 
                  Güncel aylık kira fiyatları, mahalle rehberi ve kiralama rehberi. Uzman emlak danışmanlığı ile hayalinizdeki daireyi bulun.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    <Link href={`${basePath}/kiralik?propertyType=daire`}>
                      <Home className="w-5 h-5 mr-2" />
                      Tüm Kiralık Daire İlanlarını Görüntüle
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
                <div className="text-2xl font-bold text-primary">{karasuKiralikDaireListings.length}</div>
                <div className="text-sm text-gray-600">Aktif Kiralık Daire</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{neighborhoods.length}</div>
                <div className="text-sm text-gray-600">Mahalle</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {avgRent ? `₺${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(avgRent)}` : 'Değişken'}
                </div>
                <div className="text-sm text-gray-600">Ortalama Aylık Kira</div>
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
                {/* AI Checker */}
                <div id="ai-checker">
                  <AIChecker
                    content={pageContentInfo.content}
                    title="Karasu Kiralık Daire"
                    contentType="article"
                    showDetails={true}
                  />
                </div>

                {/* AI Overviews Optimized: Quick Answer */}
                <ScrollReveal direction="up" delay={0}>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Kısa Cevap</h3>
                    <p className="text-gray-700 leading-relaxed">
                      <strong>Karasu'da kiralık daire</strong> arayanlar için geniş bir seçenek yelpazesi mevcuttur. 
                      Aylık kira fiyatları konum, metrekare ve özelliklere göre 3.000 TL ile 12.000 TL arasında değişmektedir. 
                      Denize yakın konumlar ve merkez mahalleler daha yüksek kira fiyatlarına sahiptir. Hem sürekli oturum hem de 
                      yazlık kiralama amaçlı seçenekler bulunmaktadır. 1+1, 2+1, 3+1 ve 4+1 oda seçenekleri mevcuttur. İstanbul'a yakınlık, 
                      turizm potansiyeli ve gelişen altyapı, Karasu'yu kiralık daire arayanlar için cazip bir bölge haline getirmektedir.
                    </p>
                  </div>
                </ScrollReveal>

                {/* Introduction */}
                <ScrollReveal direction="up" delay={100}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Karasu'da Kiralık Daire Arayanlar İçin Genel Bakış
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu, Sakarya'nın en gözde sahil ilçelerinden biri olup, kiralık daire piyasasında çeşitli seçenekler sunmaktadır. 
                        Denize yakın konumu, modern apartman projeleri, gelişen altyapısı ile Karasu kiralık daire piyasası zengin bir yelpazeye sahiptir.
                      </p>
                      <p>
                        Karasu'da kiralık daire arayanlar için hem sürekli oturum hem de yazlık kiralama amaçlı seçenekler bulunmaktadır. 
                        Özellikle İstanbul'a yakınlığı, doğal güzellikleri ve turizm potansiyeli ile Karasu, kiralık daire arayanların 
                        ilgisini çeken bir bölgedir.
                      </p>
                      <p>
                        Bu rehber, Karasu'da kiralık daire kiralamayı düşünenler için aylık kira fiyat analizi, mahalle rehberi, oda sayısına göre seçenekler, 
                        kiralama tavsiyeleri ve dikkat edilmesi gerekenler hakkında kapsamlı bilgi sunmaktadır.
                      </p>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Room Count Options */}
                <ScrollReveal direction="up" delay={200}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Oda Sayısına Göre Karasu Satılık Daire Seçenekleri
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da satılık daire seçenekleri oda sayısına göre çeşitlilik göstermektedir. Her oda sayısının kendine özgü 
                        avantajları ve kullanım alanları vardır.
                      </p>

                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="border rounded-lg p-6 bg-gray-50">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">1+1 Daireler</h3>
                          <p className="text-gray-700 mb-3">
                            Yatırım amaçlı ve tek kişilik yaşam için ideal. Genellikle 50-70 m² arası metrekareye sahiptir.
                          </p>
                          <div className="text-sm text-gray-600 mb-3">
                            <strong>Aylık Kira:</strong> 3.000 TL - 5.000 TL
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Popüler Mahalleler:</strong> Merkez, Sahil
                          </div>
                          <Link href={`${basePath}/kiralik?propertyType=daire&rooms=1`}>
                            <Button variant="outline" size="sm" className="w-full mt-4">
                              1+1 Kiralık Daire Ara
                            </Button>
                          </Link>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">2+1 Daireler</h3>
                          <p className="text-gray-700 mb-3">
                            Çiftler ve küçük aileler için ideal. Genellikle 70-100 m² arası metrekareye sahiptir.
                          </p>
                          <div className="text-sm text-gray-600 mb-3">
                            <strong>Aylık Kira:</strong> 4.000 TL - 8.000 TL
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Popüler Mahalleler:</strong> Merkez, Sahil, Yalı Mahallesi
                          </div>
                          <Link href={`${basePath}/kiralik?propertyType=daire&rooms=2`}>
                            <Button variant="outline" size="sm" className="w-full mt-4">
                              2+1 Kiralık Daire Ara
                            </Button>
                          </Link>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">3+1 Daireler</h3>
                          <p className="text-gray-700 mb-3">
                            Aileler için en popüler seçenek. Genellikle 100-130 m² arası metrekareye sahiptir.
                          </p>
                          <div className="text-sm text-gray-600 mb-3">
                            <strong>Aylık Kira:</strong> 6.000 TL - 12.000 TL
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Popüler Mahalleler:</strong> Merkez, Sahil, Liman, Aziziye
                          </div>
                          <Link href={`${basePath}/kiralik?propertyType=daire&rooms=3`}>
                            <Button variant="outline" size="sm" className="w-full mt-4">
                              3+1 Kiralık Daire Ara
                            </Button>
                          </Link>
                        </div>

                        <div className="border rounded-lg p-6 bg-gray-50">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">4+1 Daireler</h3>
                          <p className="text-gray-700 mb-3">
                            Geniş aileler için ideal. Genellikle 130-180 m² arası metrekareye sahiptir.
                          </p>
                          <div className="text-sm text-gray-600 mb-3">
                            <strong>Aylık Kira:</strong> 8.000 TL - 15.000 TL
                          </div>
                          <div className="text-sm text-gray-600">
                            <strong>Popüler Mahalleler:</strong> Merkez, Sahil, Yalı Mahallesi
                          </div>
                          <Link href={`${basePath}/kiralik?propertyType=daire&rooms=4`}>
                            <Button variant="outline" size="sm" className="w-full mt-4">
                              4+1 Kiralık Daire Ara
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>

                {/* Rent Analysis */}
                <ScrollReveal direction="up" delay={400}>
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Karasu Kiralık Daire Aylık Kira Analizi ve Piyasa Trendleri
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da kiralık daire aylık kira fiyatları birçok faktöre bağlı olarak değişmektedir. Bu faktörleri anlamak, 
                        doğru karar vermenize yardımcı olacaktır.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div className="p-6 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 rounded-2xl border border-blue-200/40">
                          <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-[#006AFF]" />
                            Aylık Kira Trendleri
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                              <span className="text-gray-700 font-medium">Merkez Bölge (2+1)</span>
                              <span className="font-bold text-gray-900">4K - 8K TL</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                              <span className="text-gray-700 font-medium">Denize Yakın (3+1)</span>
                              <span className="font-bold text-gray-900">6K - 12K TL</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                              <span className="text-gray-700 font-medium">Sahil Şeridi (2+1)</span>
                              <span className="font-bold text-gray-900">5K - 10K TL</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                              <span className="text-gray-700 font-medium">Lüks Projeler (3+1)</span>
                              <span className="font-bold text-gray-900">8K - 15K TL</span>
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
                                <strong className="text-gray-900 font-semibold">Asansör ve otopark</strong> değer artışı sağlar
                              </div>
                            </li>
                            <li className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-[#00A862] flex-shrink-0 mt-0.5" />
                              <div>
                                <strong className="text-gray-900 font-semibold">Eşyalı seçenekler</strong> yazlık kiralama için ideal
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
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Mahallelere Göre Karasu Kiralık Daire Seçenekleri
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'nun her mahallesi kendine özgü karakteristiklere sahiptir. Kiralık daire seçerken mahalle 
                        özelliklerini değerlendirmek önemlidir.
                      </p>

                      <div className="grid md:grid-cols-2 gap-4 mt-6">
                        {neighborhoods.slice(0, 8).map((neighborhood) => {
                          const neighborhoodSlug = generateSlug(neighborhood);
                          const neighborhoodListings = karasuKiralikDaireListings.filter(
                            l => l.location_neighborhood && generateSlug(l.location_neighborhood) === generateSlug(neighborhood)
                          );
                          
                          return (
                            <Link
                              key={neighborhood}
                              href={`${basePath}/mahalle/${neighborhoodSlug}?status=kiralik&propertyType=daire`}
                              className="block border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all"
                            >
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{neighborhood}</h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {neighborhoodListings.length} kiralık daire ilanı
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
                  <article>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                      Karasu'da Kiralık Daire Kiralarken Dikkat Edilmesi Gerekenler
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Karasu'da kiralık daire kiralarken dikkat edilmesi gereken önemli noktalar vardır. Bu noktalar hem 
                        sürekli oturum hem de yazlık kiralama amaçlı kiralamalar için geçerlidir.
                      </p>

                      <div className="space-y-4 mt-6">
                        <div className="border rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            Kira Sözleşmesi ve Depozito
                          </h3>
                          <p>
                            Kira sözleşmesi mutlaka yazılı olmalı ve tüm koşullar net bir şekilde belirtilmelidir. Depozito tutarı, 
                            kira ödeme tarihi, sözleşme süresi gibi konular önemlidir. Profesyonel emlak danışmanımız size yardımcı olacaktır.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            Daire Durumu ve Bakım
                          </h3>
                          <p>
                            Daire durumu, bakım durumu, eşyalı/eşyasız durumu önemlidir. Eşyalı daireler genellikle yazlık kiralama için idealdir. 
                            Daireyi görüntülemeden kiralama yapmamalısınız.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            Özellikler: Asansör, Otopark, Balkon, Eşyalı
                          </h3>
                          <p>
                            Asansör, otopark, balkon, deniz manzarası, eşyalı durumu gibi özellikler hem yaşam kalitesini hem de kira fiyatını etkiler. 
                            Bu özelliklere sahip daireler genellikle daha yüksek kira fiyatlarına sahiptir.
                          </p>
                        </div>

                        <div className="border rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            Konum ve Ulaşım
                          </h3>
                          <p>
                            Denize mesafe, merkeze yakınlık, ulaşım imkanları, okul, sağlık ve alışveriş merkezlerine yakınlık 
                            değerlendirilmelidir. Özellikle sürekli oturum için bu faktörler yaşam kalitesini etkiler.
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
                  <ScrollReveal direction="left" delay={100}>
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Hızlı İstatistikler
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Toplam Kiralık Daire</span>
                          <span className="text-lg font-bold text-gray-900">{karasuKiralikDaireListings.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">1+1 Daire</span>
                          <span className="text-lg font-bold text-gray-900">{byRooms['1+1'].length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">2+1 Daire</span>
                          <span className="text-lg font-bold text-gray-900">{byRooms['2+1'].length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">3+1 Daire</span>
                          <span className="text-lg font-bold text-gray-900">{byRooms['3+1'].length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">4+1 Daire</span>
                          <span className="text-lg font-bold text-gray-900">{byRooms['4+1'].length}</span>
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
                        Karasu'da kiralık daire arayanlar için uzman emlak danışmanlarımız size yardımcı olmaktan memnuniyet duyar.
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
                        <Link href={`${basePath}/kiralik?propertyType=daire`} className="block text-sm text-primary hover:underline">
                          Tüm Kiralık Daireler
                        </Link>
                        <Link href={`${basePath}/karasu-satilik-daire`} className="block text-sm text-primary hover:underline">
                          Karasu Satılık Daire
                        </Link>
                        <Link href={`${basePath}/karasu-satilik-ev`} className="block text-sm text-primary hover:underline">
                          Karasu Satılık Ev
                        </Link>
                        <Link href={`${basePath}/karasu-kiralik-ev`} className="block text-sm text-primary hover:underline">
                          Karasu Kiralık Ev
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
        {karasuKiralikDaireListings.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <ScrollReveal direction="up" delay={0}>
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Öne Çıkan Karasu Kiralık Daire İlanları
                  </h2>
                  <p className="text-base text-gray-600">
                    {karasuKiralikDaireListings.length} adet kiralık daire ilanı
                  </p>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {karasuKiralikDaireListings.slice(0, 6).map((listing, index) => (
                  <ScrollReveal key={listing.id} direction="up" delay={index * 50}>
                    <ListingCard listing={listing} basePath={basePath} />
                  </ScrollReveal>
                ))}
              </div>
              {karasuKiralikDaireListings.length > 6 && (
                <div className="text-center mt-8">
                  <Button asChild size="lg">
                    <Link href={`${basePath}/kiralik?propertyType=daire`}>
                      Tüm Kiralık Daire İlanlarını Görüntüle ({karasuKiralikDaireListings.length})
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
                  Karasu kiralık daireler hakkında merak edilenler
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
                Karasu'da Hayalinizdeki Kiralık Daireyi Bulun
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Uzman emlak danışmanlarımız, Karasu'da kiralık daire arayanlar için profesyonel danışmanlık hizmeti sunmaktadır. 
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
                  <Link href={`${basePath}/kiralik?propertyType=daire`}>
                    <Home className="w-5 h-5 mr-2" />
                    Tüm Kiralık Daire İlanlarını İncele
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
