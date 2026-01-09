import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { siteConfig } from '@karasu-emlak/config';
import type { Metadata } from 'next';

/**
 * /rehberler redirects to /rehber for consistency
 * This maintains compatibility with production site URLs
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/rehberler' : `/${locale}/rehberler`;
  
  return {
    title: 'Emlak Rehberleri | Detaylı Rehber Yazıları ve Uzman Tavsiyeleri | Karasu Emlak',
    description: 'Emlak alım-satım, kiralama, yatırım ve diğer emlak konularında detaylı rehber yazıları. Uzman tavsiyeleri ve pratik ipuçları.',
    keywords: [
      'emlak rehberleri',
      'emlak rehber yazıları',
      'gayrimenkul rehberi',
      'emlak danışmanlığı',
      'emlak ipuçları',
      'karasu emlak rehberleri',
    ],
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': '/rehberler',
        'en': '/en/rehberler',
        'et': '/et/rehberler',
        'ru': '/ru/rehberler',
        'ar': '/ar/rehberler',
      },
    },
    openGraph: {
      title: 'Emlak Rehberleri | Detaylı Rehber Yazıları ve Uzman Tavsiyeleri',
      description: 'Emlak konularında detaylı rehber yazıları ve uzman tavsiyeleri.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
  };
}

export default async function RehberlerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  redirect(`${basePath}/rehber`);
}
