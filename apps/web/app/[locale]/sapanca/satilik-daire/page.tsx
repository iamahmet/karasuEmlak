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
    title: 'Sapanca Satılık Daire | Göl Kenarı ve Merkez Daire İlanları 2025',
    description: 'Sapanca\'da satılık daire ilanları. Göl kenarı ve merkez bölgelerde 1+1\'den 4+1\'e kadar daire seçenekleri. Güncel fiyatlar, mahalle rehberi ve yatırım analizi.',
    keywords: [
      'sapanca satılık daire',
      'sapanca satılık daireler',
      'sapanca göl kenarı daire',
      'sapanca merkez satılık daire',
      'sapanca daire fiyatları',
      'sapanca emlak daire',
      'sakarya sapanca satılık daire',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/sapanca/satilik-daire`,
      languages: pruneHreflangLanguages({
        tr: '/sapanca/satilik-daire',
        en: '/en/sapanca/satilik-daire',
        et: '/et/sapanca/satilik-daire',
        ru: '/ru/sapanca/satilik-daire',
        ar: '/ar/sapanca/satilik-daire',
      }),
    },
    openGraph: {
      title: 'Sapanca Satılık Daire | Göl Kenarı ve Merkez Daire İlanları',
      description: 'Sapanca\'da satılık daire ilanları. Göl kenarı ve merkez bölgelerde geniş seçenek.',
      url: `${siteConfig.url}${basePath}/sapanca/satilik-daire`,
      type: 'website',
    },
  };
}

const satilikDaireFAQs = [
  {
    question: 'Sapanca\'da satılık daire fiyatları ne kadar?',
    answer: 'Sapanca\'da satılık daire fiyatları konum ve özelliklere göre değişmektedir. Göl kenarı daireler 1.5-3 milyon TL, merkez daireler 800 bin - 1.5 milyon TL arasında değişmektedir. 2025 yılında ortalama m² fiyatı 25.000-45.000 TL aralığındadır.',
  },
  {
    question: 'Sapanca\'da hangi bölgelerde satılık daire var?',
    answer: 'Sapanca\'da göl kenarı (Kırkpınar, Mahmudiye), merkez ve çevre mahallelerde satılık daire seçenekleri bulunmaktadır. Göl kenarı bölgeler hem manzara hem yatırım değeri açısından öne çıkmaktadır.',
  },
  {
    question: 'Sapanca satılık daire yatırım için uygun mu?',
    answer: 'Evet, Sapanca satılık daire yatırım potansiyeli yüksek bir bölgedir. Günlük kiralık talebi, İstanbul\'a yakınlık ve turizm potansiyeli ile uzun vadede değer kazanma beklentisi yüksektir.',
  },
];

export default async function SapancaSatilikDairePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const { listings } = await withTimeout(
    getListings({ status: 'satilik', property_type: ['daire'] }, { field: 'created_at', order: 'desc' }, 12, 0),
    3000,
    { listings: [], total: 0 }
  );

  const sapancaDaireListings = (listings || []).filter(
    (l) =>
      l.location_district?.toLowerCase().includes('sapanca') ||
      l.location_neighborhood?.toLowerCase().includes('sapanca')
  );

  const relatedArticles = await getRelatedContent({
    keywords: ['sapanca', 'satılık daire', 'sapanca emlak', 'sapanca gölü'],
    location: 'Sapanca',
    category: 'Rehber',
    tags: ['Sapanca', 'Satılık Daire'],
    limit: 6,
  });

  const articleSchema = generateArticleSchema({
    headline: 'Sapanca Satılık Daire | Göl Kenarı ve Merkez Daire İlanları 2025',
    description: 'Sapanca\'da satılık daire ilanları. Göl kenarı ve merkez bölgelerde geniş seçenek, güncel fiyatlar.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(satilikDaireFAQs);
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
            Sapanca Gölü çevresinde satılık daire ilanları. Göl kenarı ve merkez bölgelerde 1+1&apos;den 4+1&apos;e
            kadar geniş seçenek. Güncel fiyatlar ve yatırım analizi.
          </p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Sapanca&apos;da Satılık Daire Seçenekleri
          </h2>
          <p>
            Sapanca, Sakarya&apos;nın en gözde göl kasabası olarak satılık daire talebinde sürekli artış
            göstermektedir. Göl kenarı bölgelerde manzara, merkezde ulaşım kolaylığı sunan daireler hem
            yaşam hem yatırım amaçlı tercih edilmektedir. 2025 yılında ortalama daire fiyatları 800 bin -
            2.5 milyon TL aralığındadır.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Bölge ve Fiyat Rehberi
          </h2>
          <p>
            Göl kenarı (Kırkpınar, Mahmudiye) daireler 1.5-3 milyon TL, merkez daireler 800 bin - 1.5
            milyon TL bandındadır. Yeni yapılar ve göl manzaralı daireler premium fiyatla satılmaktadır.
          </p>
        </div>

        {sapancaDaireListings.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Sapanca Satılık Daire İlanları
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sapancaDaireListings.slice(0, 6).map((listing) => (
                <ListingCard key={listing.id} listing={listing} basePath={basePath} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href={`${basePath}/satilik?lokasyon=sapanca&tip=daire`}>
                <Button variant="outline" size="lg">
                  Tüm Sapanca Satılık Daire İlanları
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
            {satilikDaireFAQs.map((faq, index) => (
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
          <Link href={`${basePath}/sapanca/satilik-yazlik`}>
            <Button variant="outline">Sapanca Satılık Yazlık</Button>
          </Link>
          <Link href={`${basePath}/sapanca/bungalov`}>
            <Button variant="outline">Sapanca Bungalov</Button>
          </Link>
        </div>

        {relatedArticles.length > 0 && (
          <section>
            <EnhancedRelatedArticles
              articles={relatedArticles}
              basePath={basePath}
              title="Sapanca ve Satılık Daire Hakkında Makaleler"
              limit={6}
            />
          </section>
        )}
      </div>
    </>
  );
}
