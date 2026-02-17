import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema, generateArticleSchema } from '@/lib/seo/structured-data';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { Check, X, Waves, Home, MapPin } from 'lucide-react';
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
    title: 'Karasu vs Sapanca | Emlak Karşılaştırması - Hangi Bölge Daha Uygun? 2025',
    description: 'Karasu ve Sapanca emlak karşılaştırması. Fiyatlar, yaşam kalitesi, yatırım potansiyeli ve avantajlar. Deniz mi göl mü? Hangi bölgeyi seçmeli?',
    keywords: [
      'karasu vs sapanca',
      'karasu sapanca karşılaştırma',
      'karasu sapanca emlak',
      'karasu mı sapanca mı',
      'sapanca karasu fiyat',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/karsilastirma/karasu-vs-sapanca`,
      languages: pruneHreflangLanguages({
        tr: '/karsilastirma/karasu-vs-sapanca',
        en: '/en/karsilastirma/karasu-vs-sapanca',
        et: '/et/karsilastirma/karasu-vs-sapanca',
        ru: '/ru/karsilastirma/karasu-vs-sapanca',
        ar: '/ar/karsilastirma/karasu-vs-sapanca',
      }),
    },
    openGraph: {
      title: 'Karasu vs Sapanca | Emlak Karşılaştırması',
      description: 'Karasu ve Sapanca emlak karşılaştırması. Fiyatlar, yaşam kalitesi ve yatırım potansiyeli.',
      url: `${siteConfig.url}${basePath}/karsilastirma/karasu-vs-sapanca`,
      type: 'website',
    },
  };
}

const karasuVsSapancaFAQs = [
  {
    question: 'Karasu mı Sapanca mı daha uygun fiyatlı?',
    answer: 'Karasu genellikle daha uygun fiyatlıdır. Karasu\'da daire 800 bin - 1.5 milyon TL, Sapanca\'da 1-2.5 milyon TL bandındadır. Sapanca göl kenarı ve bungalov kültürü ile premium fiyatlıdır.',
  },
  {
    question: 'Deniz mi göl mü tercih edilmeli?',
    answer: 'Deniz kenarı yaşam ve plaj aktiviteleri istiyorsanız Karasu, göl manzarası ve sakin doğa istiyorsanız Sapanca daha uygundur. Her iki bölge de İstanbul\'a yakınlığı ile hafta sonu kaçamakları için popülerdir.',
  },
  {
    question: 'Yatırım için Karasu mu Sapanca mı?',
    answer: 'Her iki bölge de yatırım potansiyeli sunar. Sapanca bungalov günlük kiralık getirisi yüksek, Karasu yazlık ve daire kiralama talebi güçlüdür. Bütçe ve hedefe göre seçim yapılmalıdır.',
  },
];

const comparisonData = {
  karasu: {
    name: 'Karasu',
    pros: ['Denize sıfır', 'Plaj aktiviteleri', 'Daha uygun fiyatlar', 'Yazlık kültürü', 'Sahil düzenlemeleri'],
    cons: ['Yaz aylarında kalabalık', 'Kış aylarında sakin'],
    avgDaire: '800 bin - 1.5 milyon TL',
    avgYazlik: '600 bin - 1.5 milyon TL',
    icon: Waves,
  },
  sapanca: {
    name: 'Sapanca',
    pros: ['Göl manzarası', 'Bungalov seçenekleri', 'Sakin atmosfer', 'Masukiye yakınlığı', 'Günlük kiralık potansiyeli'],
    cons: ['Daha yüksek fiyatlar', 'Deniz yok'],
    avgDaire: '1 - 2.5 milyon TL',
    avgYazlik: '1 - 2 milyon TL',
    icon: Home,
  },
};

export default async function KarasuVsSapancaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const articleSchema = generateArticleSchema({
    headline: 'Karasu vs Sapanca | Emlak Karşılaştırması - Hangi Bölge Daha Uygun? 2025',
    description: 'Karasu ve Sapanca emlak karşılaştırması. Fiyatlar, yaşam kalitesi ve yatırım potansiyeli.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(karasuVsSapancaFAQs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
    { name: 'Karasu vs Sapanca', url: `${siteConfig.url}${basePath}/karsilastirma/karasu-vs-sapanca` },
  ]);

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />

      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Karasu vs Sapanca' },
        ]}
      />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Karasu vs Sapanca
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            Karasu ve Sapanca emlak karşılaştırması. Deniz kenarı mı göl kenarı mı? Fiyatlar, yaşam
            kalitesi ve yatırım potansiyeli açısından detaylı karşılaştırma.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-6">
              <Waves className="w-10 h-10 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Karasu</h2>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Avantajlar</h3>
            <ul className="space-y-2 mb-6">
              {comparisonData.karasu.pros.map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dezavantajlar</h3>
            <ul className="space-y-2 mb-4">
              {comparisonData.karasu.cons.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              <strong>Ort. Daire:</strong> {comparisonData.karasu.avgDaire} |{' '}
              <strong>Yazlık:</strong> {comparisonData.karasu.avgYazlik}
            </p>
            <Link href={`${basePath}/karasu`} className="mt-4 inline-block">
              <Button>Karasu İlanları</Button>
            </Link>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-8 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-6">
              <Home className="w-10 h-10 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sapanca</h2>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Avantajlar</h3>
            <ul className="space-y-2 mb-6">
              {comparisonData.sapanca.pros.map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dezavantajlar</h3>
            <ul className="space-y-2 mb-4">
              {comparisonData.sapanca.cons.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              <strong>Ort. Daire:</strong> {comparisonData.sapanca.avgDaire} |{' '}
              <strong>Yazlık:</strong> {comparisonData.sapanca.avgYazlik}
            </p>
            <Link href={`${basePath}/sapanca`} className="mt-4 inline-block">
              <Button>Sapanca İlanları</Button>
            </Link>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {karasuVsSapancaFAQs.map((faq, index) => (
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

        <div className="flex flex-wrap gap-4">
          <Link href={`${basePath}/karsilastirma/sapanca-vs-kocaali`}>
            <Button variant="outline">Sapanca vs Kocaali</Button>
          </Link>
          <Link href={`${basePath}/karasu`}>
            <Button variant="outline">Karasu</Button>
          </Link>
          <Link href={`${basePath}/sapanca`}>
            <Button variant="outline">Sapanca</Button>
          </Link>
          <Link href={`${basePath}/kocaali`}>
            <Button variant="outline">Kocaali</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
