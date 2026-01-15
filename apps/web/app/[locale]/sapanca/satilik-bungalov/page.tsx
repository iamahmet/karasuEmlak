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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  return {
    title: 'Sapanca Satılık Bungalov | Göl Kenarı Bungalovlar ve Yatırım Fırsatları',
    description: 'Sapanca\'da satılık bungalov seçenekleri. Göl kenarı bungalovlar, ruhsat durumu, fiyatlar ve yatırım potansiyeli. Bungalov alırken dikkat edilmesi gerekenler.',
    keywords: [
      'sapanca satılık bungalov',
      'sapanca gölü satılık bungalov',
      'sapanca bungalov yatırım',
      'sapanca satılık bungalov fiyatları',
      'sapanca bungalov ruhsat',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/sapanca/satilik-bungalov`,
    },
  };
}

const bungalovFAQs = [
  {
    question: 'Sapanca\'da satılık bungalov fiyatları ne kadar?',
    answer: 'Sapanca\'da satılık bungalov fiyatları konum ve özelliklere göre değişmektedir. Göl kenarı bungalovlar 1.5-3 milyon TL, merkez bungalovlar 800 bin - 1.5 milyon TL arasında değişmektedir. Yeni yapılar ve göl manzaralı bungalovlar daha yüksek fiyatlıdır.',
  },
  {
    question: 'Sapanca\'da bungalov alırken ruhsat durumu önemli mi?',
    answer: 'Evet, Sapanca\'da bungalov alırken ruhsat durumu çok önemlidir. Özellikle göl kenarı bungalovlarda imar sorunları olabilir. Tapu ve ruhsat belgeleri mutlaka kontrol edilmelidir. Ruhsatsız bungalovlar ileride sorun çıkarabilir.',
  },
  {
    question: 'Sapanca\'da bungalov yatırımı mantıklı mı?',
    answer: 'Evet, Sapanca\'da bungalov yatırımı mantıklıdır. Özellikle göl kenarı bungalovlar yaz sezonunda yüksek günlük kiralık getirisi sağlar. Ancak mevsimsellik ve bakım maliyetlerini de hesaba katmak gerekiyor.',
  },
];

export default async function SapancaSatilikBungalovPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  // Fetch bungalov listings
  const listingsResult = await withTimeout(
    getListings({ status: 'satilik' }, { field: 'created_at', order: 'desc' }, 20, 0),
    3000,
    { listings: [], total: 0 }
  );

  const sapancaBungalovListings = (listingsResult?.listings || []).filter(l =>
    (l.location_district?.toLowerCase().includes('sapanca') ||
     l.location_neighborhood?.toLowerCase().includes('sapanca')) &&
    (l.title?.toLowerCase().includes('bungalov') ||
     l.description_short?.toLowerCase().includes('bungalov') ||
     l.description_long?.toLowerCase().includes('bungalov'))
  );

  const articleSchema = generateArticleSchema({
    headline: 'Sapanca Satılık Bungalov | Göl Kenarı Bungalovlar ve Yatırım Fırsatları',
    description: 'Sapanca\'da satılık bungalov seçenekleri. Göl kenarı bungalovlar ve yatırım potansiyeli.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(bungalovFAQs);
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
            Sapanca'da satılık bungalov seçenekleri. Göl kenarı bungalovlar ve yatırım fırsatları.
          </p>
        </div>

        {/* Listings Grid */}
        {sapancaBungalovListings.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Güncel İlanlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sapancaBungalovListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} basePath={basePath} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild>
                <Link href={`${basePath}/satilik?location=sapanca`}>
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
            {bungalovFAQs.map((faq, index) => (
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
      </div>
    </>
  );
}
