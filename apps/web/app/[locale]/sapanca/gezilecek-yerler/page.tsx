import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema, generateArticleSchema } from '@/lib/seo/structured-data';
import { generatePlaceSchema } from '@/lib/seo/local-seo-schemas';
import { EnhancedRelatedArticles } from '@/components/blog/EnhancedRelatedArticles';
import { getRelatedContent } from '@/lib/content/related-content';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { MapPin, TreePine, Waves, Coffee, Camera, Utensils } from 'lucide-react';
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
    title: 'Sapanca Gezilecek Yerler | Sapanca Gölü, Doğa ve Turistik Noktalar 2025',
    description: 'Sapanca gezilecek yerler rehberi. Sapanca Gölü, Masukiye, Kartepe ve çevresindeki doğa harikaları, restoranlar ve aktiviteler. Tatil planı için kapsamlı rehber.',
    keywords: [
      'sapanca gezilecek yerler',
      'sapanca gölü',
      'sapanca turistik yerler',
      'masukiye sapanca',
      'sapanca doğa',
      'sapanca restoranlar',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/sapanca/gezilecek-yerler`,
      languages: pruneHreflangLanguages({
        tr: '/sapanca/gezilecek-yerler',
        en: '/en/sapanca/gezilecek-yerler',
        et: '/et/sapanca/gezilecek-yerler',
        ru: '/ru/sapanca/gezilecek-yerler',
        ar: '/ar/sapanca/gezilecek-yerler',
      }),
    },
    openGraph: {
      title: 'Sapanca Gezilecek Yerler | Göl, Doğa ve Turistik Noktalar',
      description: 'Sapanca gezilecek yerler rehberi. Sapanca Gölü, Masukiye ve çevresindeki doğa harikaları.',
      url: `${siteConfig.url}${basePath}/sapanca/gezilecek-yerler`,
      type: 'website',
    },
  };
}

const gezilecekYerlerFAQs = [
  {
    question: 'Sapanca\'da mutlaka görülmesi gereken yerler nelerdir?',
    answer: 'Sapanca Gölü çevresi yürüyüş yolları, Masukiye şelalesi, Kartepe kayak merkezi, Sapanca merkez sahil ve çevredeki ormanlık alanlar mutlaka görülmesi gereken yerlerdir. Göl kenarı kahvaltı ve balık restoranları da popülerdir.',
  },
  {
    question: 'Sapanca\'dan Masukiye\'ye nasıl gidilir?',
    answer: 'Sapanca merkezden Masukiye\'ye araçla yaklaşık 15-20 dakika sürmektedir. D100 karayolunu takip ederek Kartepe yönüne devam edebilirsiniz. Masukiye şelalesi ve doğa restoranları için ideal bir günübirlik gezi rotasıdır.',
  },
  {
    question: 'Sapanca Gölü çevresinde ne yapılır?',
    answer: 'Sapanca Gölü çevresinde yürüyüş, bisiklet, tekne turu, balık restoranlarında yemek ve göl kenarı kahvaltı yapılabilir. Yaz aylarında yüzme ve piknik alanları da mevcuttur.',
  },
];

const gezilecekYerler = [
  {
    name: 'Sapanca Gölü',
    description: 'Türkiye\'nin en güzel doğal göllerinden biri. Çevresinde yürüyüş yolları, restoranlar ve piknik alanları.',
    icon: Waves,
  },
  {
    name: 'Masukiye',
    description: 'Şelale, doğa restoranları ve seraları ile ünlü. Sapanca\'dan 15 dakika mesafede.',
    icon: TreePine,
  },
  {
    name: 'Kartepe Kayak Merkezi',
    description: 'Kış aylarında kayak, yaz aylarında doğa yürüyüşü. İstanbul\'a yakın kayak merkezi.',
    icon: MapPin,
  },
  {
    name: 'Sapanca Sahil',
    description: 'Göl kenarı yürüyüş bandı, kahvaltı ve balık restoranları. Hafta sonu yoğun ilgi görür.',
    icon: Camera,
  },
  {
    name: 'Göl Kenarı Restoranlar',
    description: 'Taze balık, kahvaltı ve manzara eşliğinde yemek. Özellikle hafta sonu rezervasyon önerilir.',
    icon: Utensils,
  },
  {
    name: 'Maşukiye Kahvaltı ve Kahve Durakları',
    description: 'Serada kahvaltı, organik ürünler ve doğa manzarası. Instagram\'da popüler noktalar.',
    icon: Coffee,
  },
];

export default async function SapancaGezilecekYerlerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const relatedArticles = await getRelatedContent({
    keywords: ['sapanca', 'gezilecek yerler', 'sapanca gölü', 'masukiye', 'tatil'],
    location: 'Sapanca',
    category: 'Rehber',
    tags: ['Sapanca', 'Gezilecek Yerler', 'Tatil'],
    limit: 6,
  });

  const articleSchema = generateArticleSchema({
    headline: 'Sapanca Gezilecek Yerler | Sapanca Gölü, Doğa ve Turistik Noktalar 2025',
    description: 'Sapanca gezilecek yerler rehberi. Sapanca Gölü, Masukiye, Kartepe ve çevresindeki doğa harikaları.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const placeSchema = generatePlaceSchema({
    name: 'Sapanca Gezilecek Yerler',
    description: 'Sapanca Gölü, Masukiye, Kartepe ve çevresindeki turistik noktalar rehberi.',
    address: {
      addressLocality: 'Sapanca',
      addressRegion: 'Sakarya',
      addressCountry: 'TR',
    },
    geo: {
      latitude: 40.6917,
      longitude: 30.2675,
    },
    url: `${siteConfig.url}${basePath}/sapanca/gezilecek-yerler`,
  });

  const faqSchema = generateFAQSchema(gezilecekYerlerFAQs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
    { name: 'Sapanca', url: `${siteConfig.url}${basePath}/sapanca` },
    { name: 'Gezilecek Yerler', url: `${siteConfig.url}${basePath}/sapanca/gezilecek-yerler` },
  ]);

  return (
    <>
      <StructuredData data={articleSchema} />
      <StructuredData data={placeSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />

      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Sapanca', href: `${basePath}/sapanca` },
          { label: 'Gezilecek Yerler', href: `${basePath}/sapanca/gezilecek-yerler` },
        ]}
      />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Sapanca Gezilecek Yerler
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            Sapanca Gölü, Masukiye, Kartepe ve çevresindeki doğa harikaları. Tatil ve hafta sonu
            gezisi için kapsamlı rehber.
          </p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Sapanca ve Çevresi Turistik Noktalar
          </h2>
          <p>
            Sapanca, İstanbul&apos;a yakınlığı ve doğal güzellikleri ile hafta sonu kaçamakları için
            ideal bir destinasyondur. Sapanca Gölü çevresinde yürüyüş, Masukiye&apos;de şelale ve seralar,
            Kartepe&apos;de kış kayak merkezi ile dört mevsim ziyaret edilebilir.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Öne Çıkan Yerler
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gezilecekYerler.map((yer, index) => {
              const Icon = yer.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{yer.name}</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{yer.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {gezilecekYerlerFAQs.map((faq, index) => (
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
          <Link href={`${basePath}/sapanca/gunluk-kiralik`}>
            <Button variant="outline">Sapanca Günlük Kiralık</Button>
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
              title="Sapanca ve Gezilecek Yerler Hakkında Makaleler"
              limit={6}
            />
          </section>
        )}
      </div>
    </>
  );
}
