import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { FAQContent } from './FAQContent';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { generateAIOptimizedFAQSchema } from '@/lib/seo/ai-optimization';
import { getQAEntries } from '@/lib/db/qa';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/sss' : `/${locale}/sss`;
  
  // Get FAQ count for dynamic title
  let faqCount = 50;
  try {
    const qaEntries = await getQAEntries(undefined, undefined, 100);
    faqCount = qaEntries?.length || 50;
  } catch {
    // Fallback to default
  }

  return {
    title: `Sıkça Sorulan Sorular (SSS) | Karasu Emlak | ${faqCount}+ Emlak Soruları ve Cevapları`,
    description: 'Karasu ve Kocaali bölgesinde emlak alım-satım, kiralama, yatırım, tapu işlemleri, kredi başvurusu, noter masrafları ve diğer tüm konularda merak ettikleriniz için kapsamlı SSS rehberi. Uzman cevaplar ve güncel bilgiler. 2024 yılı güncel emlak bilgileri.',
    keywords: [
      'karasu emlak sss',
      'emlak sık sorulan sorular',
      'karasu emlak soruları',
      'kocaali emlak soruları',
      'emlak alım satım soruları',
      'emlak kiralama soruları',
      'karasu emlak cevapları',
      'emlak danışmanlık soruları',
      'tapu işlemleri soruları',
      'noter masrafları',
      'emlak kredi başvurusu',
      'karasu emlak rehberi',
      'emlak yatırım soruları',
      'hukuki süreçler emlak',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': `${siteConfig.url}/sss`,
        'en': `${siteConfig.url}/en/sss`,
        'et': `${siteConfig.url}/et/sss`,
        'ru': `${siteConfig.url}/ru/sss`,
        'ar': `${siteConfig.url}/ar/sss`,
      },
    },
    openGraph: {
      title: `Sıkça Sorulan Sorular (SSS) | Karasu Emlak | ${faqCount}+ Soru`,
      description: 'Karasu ve Kocaali bölgesinde emlak alım-satım, kiralama, yatırım, tapu işlemleri, kredi başvurusu ve diğer tüm konularda sıkça sorulan sorular ve detaylı cevapları. Uzman emlak danışmanlığı.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      siteName: 'Karasu Emlak',
      locale: locale === 'tr' ? 'tr_TR' : locale === 'en' ? 'en_US' : locale,
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Emlak Sıkça Sorulan Sorular - Emlak SSS',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Sıkça Sorulan Sorular (SSS) | Karasu Emlak | ${faqCount}+ Soru`,
      description: 'Karasu ve Kocaali bölgesinde emlak alım-satım, kiralama, yatırım ve diğer tüm konularda sıkça sorulan sorular ve detaylı cevapları.',
      images: [`${siteConfig.url}/og-image.jpg`],
      creator: '@karasuemlak',
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
    other: {
      'article:published_time': new Date().toISOString(),
      'article:modified_time': new Date().toISOString(),
    },
  };
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Sıkça Sorulan Sorular', href: `${basePath}/sss` },
  ];

  // Fetch FAQ questions from database with error handling
  let faqs: any[] = [];
  let faqQuestionsForSchema: Array<{ question: string; answer: string }> = [];
  let errorMessage: string | null = null;

  try {
    // Use repository pattern with anon server client (respects RLS)
    // This uses cookies() from next/headers which reads from the request
    const qaEntries = await getQAEntries(undefined, undefined, 200);
    
    if (qaEntries && qaEntries.length > 0) {
      faqs = qaEntries;
      console.log(`✅ [FAQ Page] Fetched ${qaEntries.length} FAQs from database`);
      
      // Get top FAQs for schema (prioritize high priority, max 10)
      // Sort by priority (2=high, 1=medium, 0=low) then by creation date
      const sortedForSchema = [...qaEntries]
        .sort((a, b) => {
          if (b.priority !== a.priority) return b.priority - a.priority;
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        })
        .slice(0, 10);
      
      faqQuestionsForSchema = sortedForSchema.map((faq) => ({
        question: faq.question,
        answer: faq.answer?.substring(0, 500) || '', // Limit answer length for schema
      }));
    } else {
      console.warn('⚠️ [FAQ Page] No FAQs found in database (empty result)');
      // Try with service client as fallback for debugging
      try {
        const { getQAEntriesAdmin } = await import('@/lib/db/qa');
        const adminEntries = await getQAEntriesAdmin(undefined, undefined, 200);
        if (adminEntries && adminEntries.length > 0) {
          console.log(`⚠️ [FAQ Page] Using admin client fallback - found ${adminEntries.length} FAQs`);
          faqs = adminEntries;
          faqQuestionsForSchema = adminEntries.slice(0, 10).map((faq) => ({
            question: faq.question,
            answer: faq.answer?.substring(0, 500) || '',
          }));
        }
      } catch (fallbackError) {
        console.error('❌ [FAQ Page] Fallback also failed:', fallbackError);
      }
    }
    // Note: Empty array is not an error - just means no FAQs in database yet
  } catch (error) {
    // Only show error if there's an actual exception (connection, RLS, etc.)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ [FAQ Page] Error fetching FAQs:', errorMsg);
    console.error('Error details:', error);
    errorMessage = errorMsg;
    
    // Try with service client as fallback
    try {
      const { getQAEntriesAdmin } = await import('@/lib/db/qa');
      const adminEntries = await getQAEntriesAdmin(undefined, undefined, 200);
      if (adminEntries && adminEntries.length > 0) {
        console.log(`⚠️ [FAQ Page] Using admin client fallback after error - found ${adminEntries.length} FAQs`);
        faqs = adminEntries;
        faqQuestionsForSchema = adminEntries.slice(0, 10).map((faq) => ({
          question: faq.question,
          answer: faq.answer?.substring(0, 500) || '',
        }));
        errorMessage = null; // Clear error if fallback worked
      }
    } catch (fallbackError) {
      console.error('❌ [FAQ Page] Fallback also failed:', fallbackError);
    }
    
    // Fallback to empty array - page will still render with fallback content
  }

  // If no FAQs from database, use fallback (for SEO schema)
  if (faqQuestionsForSchema.length === 0) {
    faqQuestionsForSchema = [
      {
        question: 'Karasu\'da emlak alım-satım işlemleri nasıl yapılır?',
        answer: 'Karasu\'da emlak alım-satım işlemleri için öncelikle bir emlak danışmanı ile görüşmeniz önerilir. Danışmanınız size uygun seçenekleri sunar, görüntüleme randevuları ayarlar ve tüm yasal süreçlerde rehberlik eder. Tapu devir işlemleri, noter masrafları ve diğer yasal süreçler hakkında detaylı bilgi verir.',
      },
      {
        question: 'Kiralık ev bulmak ne kadar sürer?',
        answer: 'Kiralık ev bulma süresi genellikle 1-2 hafta arasında değişir. Bölge, bütçe ve özellik tercihlerinize göre bu süre kısalabilir veya uzayabilir. Karasu ve Kocaali bölgesinde aktif ilan sayısı ve talebin yoğunluğu da bu süreyi etkiler.',
      },
      {
        question: 'Emlak komisyon oranları nedir?',
        answer: 'Emlak komisyon oranları genellikle satış fiyatının %2-3\'ü arasındadır. Kiralama işlemlerinde ise genellikle bir aylık kira bedeli komisyon olarak alınır. Komisyon oranları emlak danışmanı ve bölgeye göre değişiklik gösterebilir.',
      },
    ];
  }

  // Generate both standard and AI-optimized FAQ schemas
  const faqSchema = generateFAQSchema(faqQuestionsForSchema);
  const aiOptimizedFAQSchema = faqQuestionsForSchema.length > 0
    ? generateAIOptimizedFAQSchema(
        faqQuestionsForSchema.map(qa => ({
          question: qa.question,
          answer: qa.answer,
          lastUpdated: new Date().toISOString(),
        }))
      )
    : null;
  
  // Generate breadcrumb schema
  const canonicalPath = locale === routing.defaultLocale ? '/sss' : `/${locale}/sss`;
  const breadcrumbSchema = generateBreadcrumbSchema(
    breadcrumbs.map((b) => ({
      name: b.label,
      url: `${siteConfig.url}${b.href}`,
    })),
    `${siteConfig.url}${canonicalPath}`
  );

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      {aiOptimizedFAQSchema && <StructuredData data={aiOptimizedFAQSchema} />}
      {breadcrumbSchema && <StructuredData data={breadcrumbSchema} />}
      <Breadcrumbs items={breadcrumbs} />
      <FAQContent basePath={basePath} faqs={faqs} error={errorMessage} />
    </>
  );
}
