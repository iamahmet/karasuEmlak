import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema, generateArticleSchema } from '@/lib/seo/structured-data';
import { getListings } from '@/lib/supabase/queries';
import { withTimeout } from '@/lib/utils/timeout';

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
    title: 'Sapanca Bungalov | Satılık ve Günlük Kiralık Bungalov Seçenekleri',
    description: 'Sapanca\'da bungalov seçenekleri. Göl kenarı bungalovlar, günlük kiralık ve satılık bungalovlar. Fiyatlar, sezona göre öneriler ve yatırım potansiyeli.',
    keywords: [
      'sapanca bungalov',
      'sapanca günlük kiralık bungalov',
      'sapanca satılık bungalov',
      'sapanca gölü bungalov',
      'sapanca bungalov fiyatları',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/sapanca/bungalov`,
    },
    openGraph: {
      title: 'Sapanca Bungalov | Satılık ve Günlük Kiralık',
      description: 'Sapanca\'da bungalov seçenekleri. Göl kenarı bungalovlar ve günlük kiralık seçenekleri.',
      url: `${siteConfig.url}${basePath}/sapanca/bungalov`,
      type: 'website',
    },
  };
}

const bungalovFAQs = [
  {
    question: 'Sapanca\'da bungalov fiyatları ne kadar?',
    answer: 'Sapanca\'da bungalov fiyatları konum ve özelliklere göre değişmektedir. Göl kenarı bungalovlar 1.5-3 milyon TL, merkez bungalovlar 800 bin - 1.5 milyon TL arasında değişmektedir. Günlük kiralık bungalovlar yaz sezonunda 800-2000 TL, kış sezonunda 500-1000 TL arasında değişmektedir.',
  },
  {
    question: 'Sapanca\'da günlük kiralık bungalov bulmak kolay mı?',
    answer: 'Evet, Sapanca\'da günlük kiralık bungalov seçenekleri oldukça fazladır. Özellikle yaz sezonunda (Haziran-Eylül) talep yüksektir. Erken rezervasyon yapmak avantajlıdır. Kış sezonunda daha uygun fiyatlar bulunabilir.',
  },
  {
    question: 'Sapanca\'da bungalov seçerken nelere dikkat edilmeli?',
    answer: 'Sapanca\'da bungalov seçerken konum (göl kenarı vs merkez), bina durumu (ahşap vs betonarme), özellikler (şömine, bahçe, otopark) ve ruhsat durumu kontrol edilmelidir. Göl kenarı bungalovlar hem yaşam kalitesi hem yatırım değeri açısından avantajlıdır.',
  },
];

export default async function SapancaBungalovPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  // Fetch bungalov listings
  const listingsResult = await withTimeout(
    getListings({ property_type: ['yazlik', 'ev'] }, { field: 'created_at', order: 'desc' }, 20, 0),
    3000,
    { listings: [], total: 0 }
  );

  const bungalovListings = (listingsResult?.listings || []).filter(l =>
    (l.location_district?.toLowerCase().includes('sapanca') ||
     l.location_neighborhood?.toLowerCase().includes('sapanca')) &&
    (l.title?.toLowerCase().includes('bungalov') ||
     l.description_short?.toLowerCase().includes('bungalov') ||
     l.description_long?.toLowerCase().includes('bungalov'))
  );

  // Generate schemas
  const articleSchema = generateArticleSchema({
    headline: 'Sapanca Bungalov | Satılık ve Günlük Kiralık Bungalov Seçenekleri',
    description: 'Sapanca\'da bungalov seçenekleri. Göl kenarı bungalovlar, günlük kiralık ve satılık bungalovlar hakkında kapsamlı rehber.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(bungalovFAQs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
    { name: 'Sapanca', url: `${siteConfig.url}${basePath}/sapanca` },
    { name: 'Bungalov', url: `${siteConfig.url}${basePath}/sapanca/bungalov` },
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
          { label: 'Bungalov', href: `${basePath}/sapanca/bungalov` },
        ]}
      />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Sapanca Bungalov
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            Sapanca Gölü çevresinde bungalov seçenekleri. Günlük kiralık ve satılık bungalovlar.
          </p>
        </div>

        {/* Content sections will be added */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <p>
            Sapanca'da bungalov seçenekleri hakkında detaylı bilgiler bu sayfada yer alacak.
            Göl kenarı bungalovlar, günlük kiralık seçenekleri ve satılık bungalovlar hakkında
            kapsamlı rehber hazırlanıyor.
          </p>
        </div>

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
