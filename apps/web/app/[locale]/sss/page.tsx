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

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  let locale = 'tr';
  let canonicalPath = '/sss';
  
  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale || 'tr';
    canonicalPath = locale === routing.defaultLocale ? '/sss' : `/${locale}/sss`;
  } catch {
    // Use defaults
  }
  
  // Get FAQ count for dynamic title
  let faqCount = 50;
  try {
    const qaEntries = await getQAEntries(undefined, undefined, 100);
    faqCount = Array.isArray(qaEntries) ? qaEntries.length : 50;
  } catch {
    // Fallback to default
  }

  const siteUrl = siteConfig?.url || 'https://karasuemlak.com';
  
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
      canonical: `${siteUrl}${canonicalPath}`,
      languages: {
        'tr': `${siteUrl}/sss`,
        'en': `${siteUrl}/en/sss`,
        'et': `${siteUrl}/et/sss`,
        'ru': `${siteUrl}/ru/sss`,
        'ar': `${siteUrl}/ar/sss`,
      },
    },
    openGraph: {
      title: `Sıkça Sorulan Sorular (SSS) | Karasu Emlak | ${faqCount}+ Soru`,
      description: 'Karasu ve Kocaali bölgesinde emlak alım-satım, kiralama, yatırım, tapu işlemleri, kredi başvurusu ve diğer tüm konularda sıkça sorulan sorular ve detaylı cevapları. Uzman emlak danışmanlığı.',
      url: `${siteUrl}${canonicalPath}`,
      type: 'website',
      siteName: 'Karasu Emlak',
      locale: locale === 'tr' ? 'tr_TR' : locale === 'en' ? 'en_US' : locale,
      images: [
        {
          url: `${siteUrl}/og-image.jpg`,
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
      images: [`${siteUrl}/og-image.jpg`],
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
  let locale = 'tr';
  let basePath = '';
  let breadcrumbs: Array<{ label: string; href: string }> = [];
  let faqs: any[] = [];
  let faqQuestionsForSchema: Array<{ question: string; answer: string }> = [];
  let errorMessage: string | null = null;

  try {
    const resolvedParams = await params;
    locale = resolvedParams.locale || 'tr';
    basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

    breadcrumbs = [
      { label: 'Ana Sayfa', href: `${basePath}/` },
      { label: 'Sıkça Sorulan Sorular', href: `${basePath}/sss` },
    ];
  } catch (paramError) {
    console.error('❌ [FAQ Page] Error resolving params:', paramError);
    // Use defaults
  }

  // Ensure we always have valid arrays
  if (!Array.isArray(faqs)) {
    faqs = [];
  }
  if (!Array.isArray(faqQuestionsForSchema)) {
    faqQuestionsForSchema = [];
  }

  try {
    // Use repository pattern with anon server client (respects RLS)
    // This uses cookies() from next/headers which reads from the request
    const qaEntries = await getQAEntries(undefined, undefined, 200);
    
    if (qaEntries && Array.isArray(qaEntries) && qaEntries.length > 0) {
      faqs = qaEntries;
      console.log(`✅ [FAQ Page] Fetched ${qaEntries.length} FAQs from database`);
      
      // Get top FAQs for schema (prioritize high priority, max 10)
      // Sort by priority (2=high, 1=medium, 0=low) then by creation date
      const sortedForSchema = [...qaEntries]
        .filter(faq => faq && faq.question && faq.answer) // Filter out invalid entries
        .sort((a, b) => {
          const aPriority = typeof a.priority === 'number' ? a.priority : 0;
          const bPriority = typeof b.priority === 'number' ? b.priority : 0;
          if (bPriority !== aPriority) return bPriority - aPriority;
          const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
          return aDate - bDate;
        })
        .slice(0, 10);
      
      faqQuestionsForSchema = sortedForSchema.map((faq) => ({
        question: String(faq.question || ''),
        answer: String(faq.answer || '').substring(0, 500), // Limit answer length for schema
      }));
    } else {
      console.warn('⚠️ [FAQ Page] No FAQs found in database (empty result)');
      // Try with service client as fallback for debugging
      try {
        const { getQAEntriesAdmin } = await import('@/lib/db/qa');
        const adminEntries = await getQAEntriesAdmin(undefined, undefined, 200);
        if (adminEntries && Array.isArray(adminEntries) && adminEntries.length > 0) {
          console.log(`⚠️ [FAQ Page] Using admin client fallback - found ${adminEntries.length} FAQs`);
          faqs = adminEntries;
          faqQuestionsForSchema = adminEntries
            .filter(faq => faq && faq.question && faq.answer)
            .slice(0, 10)
            .map((faq) => ({
              question: String(faq.question || ''),
              answer: String(faq.answer || '').substring(0, 500),
            }));
        }
      } catch (fallbackError) {
        console.error('❌ [FAQ Page] Fallback also failed:', fallbackError);
      }
    }
    // Note: Empty array is not an error - just means no FAQs in database yet
  } catch (error) {
    // Only show error if there's an actual exception (connection, RLS, etc.)
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ [FAQ Page] Error fetching FAQs:', errorMsg);
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack);
    }
    errorMessage = errorMsg;
    
    // Try with service client as fallback
    try {
      const { getQAEntriesAdmin } = await import('@/lib/db/qa');
      const adminEntries = await getQAEntriesAdmin(undefined, undefined, 200);
      if (adminEntries && Array.isArray(adminEntries) && adminEntries.length > 0) {
        console.log(`⚠️ [FAQ Page] Using admin client fallback after error - found ${adminEntries.length} FAQs`);
        faqs = adminEntries;
        faqQuestionsForSchema = adminEntries
          .filter(faq => faq && faq.question && faq.answer)
          .slice(0, 10)
          .map((faq) => ({
            question: String(faq.question || ''),
            answer: String(faq.answer || '').substring(0, 500),
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

  // Generate both standard and AI-optimized FAQ schemas (with error handling)
  let faqSchema: object | null = null;
  let aiOptimizedFAQSchema: object | null = null;
  let breadcrumbSchema: object | null = null;

  try {
    // Filter out invalid entries before generating schema
    const validFAQQuestions = faqQuestionsForSchema.filter(
      qa => qa && qa.question && qa.answer && 
            typeof qa.question === 'string' && 
            typeof qa.answer === 'string' &&
            qa.question.trim().length > 0 &&
            qa.answer.trim().length > 0
    );

    if (validFAQQuestions.length > 0) {
      faqSchema = generateFAQSchema(validFAQQuestions);
      
      aiOptimizedFAQSchema = generateAIOptimizedFAQSchema(
        validFAQQuestions.map(qa => ({
          question: String(qa.question).trim(),
          answer: String(qa.answer).trim(),
          lastUpdated: new Date().toISOString(),
        }))
      );
    }
  } catch (schemaError) {
    console.error('❌ [FAQ Page] Error generating schemas:', schemaError);
    // Continue without schemas - page will still render
  }

  try {
    // Generate breadcrumb schema
    const canonicalPath = locale === routing.defaultLocale ? '/sss' : `/${locale}/sss`;
    const siteUrl = siteConfig?.url || 'https://karasuemlak.com';
    breadcrumbSchema = generateBreadcrumbSchema(
      breadcrumbs.map((b) => ({
        name: b.label,
        url: `${siteUrl}${b.href}`,
      })),
      `${siteUrl}${canonicalPath}`
    );
  } catch (breadcrumbError) {
    console.error('❌ [FAQ Page] Error generating breadcrumb schema:', breadcrumbError);
    // Continue without breadcrumb schema
  }

  // Ensure faqs is always an array
  const safeFaqs = Array.isArray(faqs) ? faqs : [];
  const safeBreadcrumbs = Array.isArray(breadcrumbs) ? breadcrumbs : [
    { label: 'Ana Sayfa', href: '/' },
    { label: 'Sıkça Sorulan Sorular', href: '/sss' },
  ];

  try {
    return (
      <>
        {faqSchema && <StructuredData data={faqSchema} />}
        {aiOptimizedFAQSchema && <StructuredData data={aiOptimizedFAQSchema} />}
        {breadcrumbSchema && <StructuredData data={breadcrumbSchema} />}
        <Breadcrumbs items={safeBreadcrumbs} />
        <FAQContent basePath={basePath} faqs={safeFaqs} error={errorMessage} />
      </>
    );
  } catch (renderError) {
    console.error('❌ [FAQ Page] Error rendering page:', renderError);
    // Fallback render without schemas
    return (
      <>
        <Breadcrumbs items={safeBreadcrumbs} />
        <FAQContent basePath={basePath} faqs={safeFaqs} error={errorMessage || 'Sayfa yüklenirken bir hata oluştu.'} />
      </>
    );
  }
}
