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
    title: 'Sapanca Satılık Daire | Göl Kenarı ve Merkez Daire Seçenekleri',
    description: 'Sapanca\'da satılık daire ilanları. Göl kenarı ve merkez bölgelerde güncel daire seçenekleri. Fiyatlar, bölge analizi ve yatırım potansiyeli.',
    keywords: [
      'sapanca satılık daire',
      'sapanca gölü satılık daire',
      'sapanca merkez satılık daire',
      'sapanca satılık daire fiyatları',
      'sapanca emlak daire',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/sapanca/satilik-daire`,
    },
  };
}

const daireFAQs = [
  {
    question: 'Sapanca\'da satılık daire fiyatları ne kadar?',
    answer: 'Sapanca\'da satılık daire fiyatları konum ve özelliklere göre değişmektedir. Göl kenarı daireler 1.5-3 milyon TL, merkez daireler 800 bin - 1.5 milyon TL arasında değişmektedir. Yeni yapılar ve göl manzaralı daireler daha yüksek fiyatlıdır.',
  },
  {
    question: 'Sapanca\'da hangi bölgelerde daire alınmalı?',
    answer: 'Sapanca\'da göl kenarı bölgeler hem yaşam kalitesi hem yatırım değeri açısından avantajlıdır. Merkez bölgeler ise ulaşım ve hizmetler açısından pratik seçeneklerdir. Yatırım için göl kenarı, oturumluk için merkez bölgeler tercih edilebilir.',
  },
  {
    question: 'Sapanca\'da daire yatırımı mantıklı mı?',
    answer: 'Evet, Sapanca\'da daire yatırımı mantıklıdır. Özellikle göl kenarı daireler hem kira getirisi hem değer artışı potansiyeli yüksektir. Turizm potansiyeli ve İstanbul\'a yakınlık ile uzun vadede değer kazanma potansiyeli var.',
  },
];

export default async function SapancaSatilikDairePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  // Fetch daire listings for Sapanca
  const listingsResult = await withTimeout(
    getListings({ status: 'satilik', property_type: ['daire'] }, { field: 'created_at', order: 'desc' }, 20, 0),
    3000,
    { listings: [], total: 0 }
  );

  const sapancaDaireListings = (listingsResult?.listings || []).filter(l =>
    (l.location_district?.toLowerCase().includes('sapanca') ||
     l.location_neighborhood?.toLowerCase().includes('sapanca'))
  );

  // Generate schemas
  const articleSchema = generateArticleSchema({
    headline: 'Sapanca Satılık Daire | Göl Kenarı ve Merkez Daire Seçenekleri',
    description: 'Sapanca\'da satılık daire ilanları. Göl kenarı ve merkez bölgelerde güncel daire seçenekleri.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(daireFAQs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
    { name: 'Sapanca', url: `${siteConfig.url}${basePath}/sapanca` },
    { name: 'Satılık Daire', url: `${siteConfig.url}${basePath}/sapanca/satilik-daire` },
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
          { label: 'Satılık Daire', href: `${basePath}/sapanca/satilik-daire` },
        ]}
      />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Sapanca Satılık Daire
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            Sapanca'da satılık daire seçenekleri. Göl kenarı ve merkez bölgelerde güncel ilanlar.
          </p>
        </div>

        {/* Fiyat Aralıkları */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Fiyat Aralıkları
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Bölge</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Fiyat Aralığı</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Notlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Göl Kenarı</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">1.5 - 3 milyon TL</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Göl manzarası, yüksek talep</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Merkez</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">800 bin - 1.5 milyon TL</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">Ulaşım avantajlı, oturumluk için uygun</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Listings Grid */}
        {sapancaDaireListings.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Güncel İlanlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sapancaDaireListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} basePath={basePath} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Button asChild>
                <Link href={`${basePath}/satilik?location=sapanca&property_type=daire`}>
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
            {daireFAQs.map((faq, index) => (
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
