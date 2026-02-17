import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema, generateArticleSchema } from '@/lib/seo/structured-data';
import { EnhancedRelatedArticles } from '@/components/blog/EnhancedRelatedArticles';
import { getRelatedContent } from '@/lib/content/related-content';
import { getListings } from '@/lib/supabase/queries';
import { withTimeout } from '@/lib/utils/timeout';
import { ListingCard } from '@/components/listings/ListingCard';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { pruneHreflangLanguages } from '@/lib/seo/hreflang';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Sapanca Satılık Bungalov | Göl Kenarı Bungalov İlanları 2025',
    description: 'Sapanca\'da satılık bungalov ilanları. Sapanca Gölü kenarında bungalov seçenekleri, fiyatlar ve günlük kiralık yatırım potansiyeli.',
    keywords: [
      'sapanca satılık bungalov',
      'sapanca bungalov satılık',
      'sapanca göl kenarı bungalov',
      'sapanca bungalov fiyatları',
      'sakarya sapanca bungalov',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/sapanca/satilik-bungalov`,
      languages: pruneHreflangLanguages({
        tr: '/sapanca/satilik-bungalov',
        en: '/en/sapanca/satilik-bungalov',
        et: '/et/sapanca/satilik-bungalov',
        ru: '/ru/sapanca/satilik-bungalov',
        ar: '/ar/sapanca/satilik-bungalov',
      }),
    },
    openGraph: {
      title: 'Sapanca Satılık Bungalov | Göl Kenarı Bungalov İlanları',
      description: 'Sapanca\'da satılık bungalov ilanları. Göl kenarı bungalov seçenekleri.',
      url: `${siteConfig.url}${basePath}/sapanca/satilik-bungalov`,
      type: 'website',
    },
  };
}

const satilikBungalovFAQs = [
  {
    question: 'Sapanca\'da satılık bungalov fiyatları ne kadar?',
    answer: 'Sapanca\'da satılık bungalov fiyatları 800 bin - 3 milyon TL arasında değişmektedir. Göl kenarı bungalovlar 1.5-3 milyon TL, merkez bungalovlar 800 bin - 1.5 milyon TL bandındadır. Ahşap ve betonarme bungalovlar farklı fiyat aralıklarında sunulmaktadır.',
  },
  {
    question: 'Sapanca bungalov günlük kiralık yatırımı karlı mı?',
    answer: 'Evet, Sapanca bungalov günlük kiralık yatırımı yüksek getiri potansiyeli sunmaktadır. Yaz sezonunda (Haziran-Eylül) günlük kiralama talebi yoğundur. Göl kenarı bungalovlar özellikle yüksek doluluk oranına sahiptir.',
  },
];

export default async function SapancaSatilikBungalovPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const { listings } = await withTimeout(
    getListings({ status: 'satilik', property_type: ['yazlik', 'ev'] }, { field: 'created_at', order: 'desc' }, 12, 0),
    3000,
    { listings: [], total: 0 }
  );

  const sapancaBungalovListings = (listings || []).filter(
    (l) =>
      (l.location_district?.toLowerCase().includes('sapanca') ||
        l.location_neighborhood?.toLowerCase().includes('sapanca')) &&
      (l.title?.toLowerCase().includes('bungalov') ||
        l.description_short?.toLowerCase().includes('bungalov') ||
        l.description_long?.toLowerCase().includes('bungalov'))
  );

  const relatedArticles = await getRelatedContent({
    keywords: ['sapanca', 'bungalov', 'satılık bungalov', 'sapanca gölü'],
    location: 'Sapanca',
    category: 'Rehber',
    tags: ['Sapanca', 'Bungalov'],
    limit: 6,
  });

  const articleSchema = generateArticleSchema({
    headline: 'Sapanca Satılık Bungalov | Göl Kenarı Bungalov İlanları 2025',
    description: 'Sapanca\'da satılık bungalov ilanları. Göl kenarı bungalov seçenekleri ve yatırım potansiyeli.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(satilikBungalovFAQs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
    { name: 'Sapanca', url: `${siteConfig.url}${basePath}/sapanca` },
    { name: 'Satılık Bungalov', url: `${siteConfig.url}${basePath}/sapanca/satilik-bungalov` },
  ]);

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />

      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Sapanca', href: `${basePath}/sapanca` },
          { label: 'Satılık Bungalov', href: `${basePath}/sapanca/satilik-bungalov` },
        ]}
      />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Sapanca Satılık Bungalov
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            Sapanca Gölü kenarında satılık bungalov ilanları. Günlük kiralık yatırım potansiyeli
            yüksek bungalov seçenekleri.
          </p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Sapanca&apos;da Bungalov Seçenekleri
          </h2>
          <p>
            Sapanca, bungalov kültürünün Türkiye&apos;deki merkezlerinden biridir. Göl kenarı ahşap ve
            betonarme bungalovlar hem tatil hem yatırım amaçlı tercih edilmektedir. Günlük kiralık
            talebi yüksek olduğundan yatırımcılar için cazip bir seçenektir.
          </p>
        </div>

        {sapancaBungalovListings.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Sapanca Satılık Bungalov İlanları
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sapancaBungalovListings.slice(0, 6).map((listing) => (
                <ListingCard key={listing.id} listing={listing} basePath={basePath} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href={`${basePath}/satilik?lokasyon=sapanca`}>
                <Button variant="outline" size="lg">
                  Tüm Sapanca Satılık Bungalov İlanları
                </Button>
              </Link>
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {satilikBungalovFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-4 mb-12">
          <Link href={`${basePath}/sapanca`}>
            <Button variant="outline">Sapanca Ana Sayfa</Button>
          </Link>
          <Link href={`${basePath}/sapanca/bungalov`}>
            <Button variant="outline">Sapanca Bungalov (Genel)</Button>
          </Link>
          <Link href={`${basePath}/sapanca/gunluk-kiralik`}>
            <Button variant="outline">Sapanca Günlük Kiralık</Button>
          </Link>
        </div>

        {relatedArticles.length > 0 && (
          <section>
            <EnhancedRelatedArticles
              articles={relatedArticles}
              basePath={basePath}
              title="Sapanca ve Bungalov Hakkında Makaleler"
              limit={6}
            />
          </section>
        )}
      </div>
    </>
  );
}
