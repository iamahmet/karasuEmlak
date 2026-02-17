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
    title: 'Sapanca Satılık Yazlık | Göl Kenarı Yazlık Ev İlanları 2025',
    description: 'Sapanca\'da satılık yazlık ev ilanları. Sapanca Gölü çevresinde yazlık evler, fiyatlar ve yatırım fırsatları. Güncel ilanlar.',
    keywords: [
      'sapanca satılık yazlık',
      'sapanca satılık yazlık ev',
      'sapanca göl kenarı yazlık',
      'sapanca yazlık fiyatları',
      'sakarya sapanca yazlık',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/sapanca/satilik-yazlik`,
      languages: pruneHreflangLanguages({
        tr: '/sapanca/satilik-yazlik',
        en: '/en/sapanca/satilik-yazlik',
        et: '/et/sapanca/satilik-yazlik',
        ru: '/ru/sapanca/satilik-yazlik',
        ar: '/ar/sapanca/satilik-yazlik',
      }),
    },
    openGraph: {
      title: 'Sapanca Satılık Yazlık | Göl Kenarı Yazlık Ev İlanları',
      description: 'Sapanca\'da satılık yazlık ev ilanları. Göl kenarı ve doğa içinde yazlık seçenekleri.',
      url: `${siteConfig.url}${basePath}/sapanca/satilik-yazlik`,
      type: 'website',
    },
  };
}

const satilikYazlikFAQs = [
  {
    question: 'Sapanca\'da satılık yazlık fiyatları ne kadar?',
    answer: 'Sapanca\'da satılık yazlık fiyatları 1-4 milyon TL arasında değişmektedir. Göl kenarı yazlıklar 2-4 milyon TL, merkez ve çevre mahallelerde 1-2 milyon TL bandındadır. Bahçeli ve havuzlu yazlıklar premium fiyatla satılmaktadır.',
  },
  {
    question: 'Sapanca yazlık yatırım için uygun mu?',
    answer: 'Evet, Sapanca yazlık yatırımı günlük kiralık potansiyeli yüksek bir seçenektir. Yaz sezonunda haftalık ve günlük kiralama talebi yoğundur. İstanbul\'a yakınlık ile hafta sonu kaçamakları için tercih edilmektedir.',
  },
];

export default async function SapancaSatilikYazlikPage({
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

  const sapancaYazlikListings = (listings || []).filter(
    (l) =>
      (l.location_district?.toLowerCase().includes('sapanca') ||
        l.location_neighborhood?.toLowerCase().includes('sapanca')) &&
      (l.title?.toLowerCase().includes('yazlık') ||
        l.description_short?.toLowerCase().includes('yazlık') ||
        l.description_long?.toLowerCase().includes('yazlık') ||
        l.property_type === 'yazlik')
  );

  const relatedArticles = await getRelatedContent({
    keywords: ['sapanca', 'satılık yazlık', 'sapanca gölü', 'yazlık ev'],
    location: 'Sapanca',
    category: 'Rehber',
    tags: ['Sapanca', 'Yazlık'],
    limit: 6,
  });

  const articleSchema = generateArticleSchema({
    headline: 'Sapanca Satılık Yazlık | Göl Kenarı Yazlık Ev İlanları 2025',
    description: 'Sapanca\'da satılık yazlık ev ilanları. Göl kenarı ve doğa içinde yazlık seçenekleri.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(satilikYazlikFAQs);
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
            Sapanca Gölü çevresinde satılık yazlık ev ilanları. Doğa içinde, göl manzaralı yazlık
            seçenekleri ve yatırım fırsatları.
          </p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Sapanca&apos;da Yazlık Ev Seçenekleri
          </h2>
          <p>
            Sapanca, yazlık ev arayanlar için ideal bir bölgedir. Sapanca Gölü çevresinde bahçeli,
            havuzlu ve göl manzaralı yazlık evler hem tatil hem yatırım amaçlı tercih edilmektedir.
            İstanbul&apos;a 1.5 saat mesafede hafta sonu kaçamakları için mükemmel konumdadır.
          </p>
        </div>

        {sapancaYazlikListings.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Sapanca Satılık Yazlık İlanları
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sapancaYazlikListings.slice(0, 6).map((listing) => (
                <ListingCard key={listing.id} listing={listing} basePath={basePath} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href={`${basePath}/satilik?lokasyon=sapanca&tip=yazlik`}>
                <Button variant="outline" size="lg">
                  Tüm Sapanca Satılık Yazlık İlanları
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
            {satilikYazlikFAQs.map((faq, index) => (
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
          <Link href={`${basePath}/sapanca/satilik-daire`}>
            <Button variant="outline">Sapanca Satılık Daire</Button>
          </Link>
          <Link href={`${basePath}/sapanca/satilik-bungalov`}>
            <Button variant="outline">Sapanca Satılık Bungalov</Button>
          </Link>
        </div>

        {relatedArticles.length > 0 && (
          <section>
            <EnhancedRelatedArticles
              articles={relatedArticles}
              basePath={basePath}
              title="Sapanca ve Yazlık Hakkında Makaleler"
              limit={6}
            />
          </section>
        )}
      </div>
    </>
  );
}
