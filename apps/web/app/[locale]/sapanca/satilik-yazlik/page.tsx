import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema, generateArticleSchema } from '@/lib/seo/structured-data';
import { getListings } from '@/lib/supabase/queries';
import { ListingCard } from '@/components/listings/ListingCard';
import { withTimeout } from '@/lib/utils/timeout';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { EnhancedRelatedArticles } from '@/components/blog/EnhancedRelatedArticles';
import { getRelatedContent } from '@/lib/content/related-content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Sapanca Satılık Yazlık | Göl Kenarı Yazlık Evler ve Yatırım Fırsatları',
    description: 'Sapanca\'da satılık yazlık evler. Göl kenarı yazlıklar, yatırım potansiyeli ve güncel fiyatlar. Yaz sezonu kira getirisi ve yatırım analizi.',
    keywords: [
      'sapanca satılık yazlık',
      'sapanca gölü satılık yazlık',
      'sapanca yazlık ev',
      'sapanca satılık yazlık fiyatları',
      'sapanca yazlık yatırım',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/sapanca/satilik-yazlik`,
    },
  };
}

const yazlikFAQs = [
  {
    question: 'Sapanca\'da satılık yazlık fiyatları ne kadar?',
    answer: 'Sapanca\'da satılık yazlık fiyatları konum ve özelliklere göre değişmektedir. Göl kenarı yazlıklar 1-2.5 milyon TL, merkez yazlıklar 600 bin - 1.5 milyon TL arasında değişmektedir. Yaz sezonunda yüksek kira getirisi potansiyeli vardır.',
  },
  {
    question: 'Sapanca\'da yazlık yatırım mantıklı mı?',
    answer: 'Evet, Sapanca\'da yazlık yatırım mantıklıdır. Özellikle göl kenarı yazlıklar yaz sezonunda yüksek kira getirisi sağlar. Ancak kış sezonunda talep düşük olduğu için yıl boyu kira geliri beklemek gerçekçi değildir.',
  },
  {
    question: 'Sapanca\'da yazlık mı daire mi alınmalı?',
    answer: 'Sapanca\'da yazlık mı daire mi sorusu kullanım amacına bağlıdır. Yazlık yatırım için ideal, yaz sezonunda yüksek kira getirisi. Daire ise oturumluk için daha uygun, yıl boyu kira geliri sağlar.',
  },
];

export default async function SapancaSatilikYazlikPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  // Fetch related articles for SEO and engagement
  const relatedArticles = await getRelatedContent({
    keywords: [
      'sapanca',
      'yazlık',
      'satılık yazlık',
      'göl kenarı',
      'yatırım',
      'sapanca gölü',
      'yazlık ev',
      'yaz sezonu',
    ],
    location: 'Sapanca',
    category: 'Rehber',
    tags: ['Sapanca', 'Yazlık', 'Yatırım', 'Göl Kenarı'],
    limit: 6,
  });

  // Fetch yazlık listings for Sapanca
  const listingsResult = await withTimeout(
    getListings({ status: 'satilik', property_type: ['yazlik', 'ev'] }, { field: 'created_at', order: 'desc' }, 20, 0),
    3000,
    { listings: [], total: 0 }
  );

  const sapancaYazlikListings = (listingsResult?.listings || []).filter(l =>
    (l.location_district?.toLowerCase().includes('sapanca') ||
     l.location_neighborhood?.toLowerCase().includes('sapanca')) &&
    (l.property_type === 'yazlik' || l.title?.toLowerCase().includes('yazlık'))
  );

  const articleSchema = generateArticleSchema({
    headline: 'Sapanca Satılık Yazlık | Göl Kenarı Yazlık Evler ve Yatırım Fırsatları',
    description: 'Sapanca\'da satılık yazlık evler. Göl kenarı yazlıklar ve yatırım potansiyeli.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(yazlikFAQs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
    { name: 'Sapanca', url: `${siteConfig.url}${basePath}/sapanca` },
    { name: 'Satılık Yazlık', url: `${siteConfig.url}${basePath}/sapanca/satilik-yazlik` },
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
          { label: 'Satılık Yazlık', href: `${basePath}/sapanca/satilik-yazlik` },
        ]}
      />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Sapanca Satılık Yazlık
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            Sapanca'da satılık yazlık evler. Göl kenarı yazlıklar ve yatırım fırsatları.
          </p>
        </div>

        {/* Listings Grid */}
        {sapancaYazlikListings.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Güncel İlanlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sapancaYazlikListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} basePath={basePath} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild>
                <Link href={`${basePath}/satilik?location=sapanca&property_type=yazlik`}>
                  Tüm İlanları Görüntüle <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {yazlikFAQs.map((faq, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Articles Section - SEO & Engagement */}
        {relatedArticles.length > 0 && (
          <section className="mt-16">
            <EnhancedRelatedArticles
              articles={relatedArticles}
              basePath={basePath}
              title="Sapanca Yazlık ve Yatırım Hakkında Makaleler"
              limit={6}
            />
          </section>
        )}
      </div>
    </>
  );
}
