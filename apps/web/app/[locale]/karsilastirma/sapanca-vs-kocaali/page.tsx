import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema, generateArticleSchema } from '@/lib/seo/structured-data';
import Link from 'next/link';
import { Button } from '@karasu/ui';
import { Check, X, Home, TreePine } from 'lucide-react';
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
    title: 'Sapanca vs Kocaali | Emlak Karşılaştırması - Hangi Bölge Daha Uygun? 2025',
    description: 'Sapanca ve Kocaali emlak karşılaştırması. Fiyatlar, yaşam kalitesi, yatırım potansiyeli. Göl kenarı mı sahil mi? Hangi bölgeyi seçmeli?',
    keywords: [
      'sapanca vs kocaali',
      'sapanca kocaali karşılaştırma',
      'sapanca kocaali emlak',
      'sapanca mı kocaali mi',
      'kocaali sapanca fiyat',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/karsilastirma/sapanca-vs-kocaali`,
      languages: pruneHreflangLanguages({
        tr: '/karsilastirma/sapanca-vs-kocaali',
        en: '/en/karsilastirma/sapanca-vs-kocaali',
        et: '/et/karsilastirma/sapanca-vs-kocaali',
        ru: '/ru/karsilastirma/sapanca-vs-kocaali',
        ar: '/ar/karsilastirma/sapanca-vs-kocaali',
      }),
    },
    openGraph: {
      title: 'Sapanca vs Kocaali | Emlak Karşılaştırması',
      description: 'Sapanca ve Kocaali emlak karşılaştırması. Fiyatlar, yaşam kalitesi ve yatırım potansiyeli.',
      url: `${siteConfig.url}${basePath}/karsilastirma/sapanca-vs-kocaali`,
      type: 'website',
    },
  };
}

const sapancaVsKocaaliFAQs = [
  {
    question: 'Sapanca mı Kocaali mi daha uygun fiyatlı?',
    answer: 'Kocaali genellikle daha uygun fiyatlıdır. Kocaali\'de daire 700 bin - 1.2 milyon TL, Sapanca\'da 1-2.5 milyon TL bandındadır. Sapanca göl kenarı ve bungalov ile premium fiyatlıdır.',
  },
  {
    question: 'Göl kenarı mı deniz kenarı mı?',
    answer: 'Sapanca göl kenarı, sakin doğa ve bungalov kültürü sunar. Kocaali deniz kenarı, plaj ve yazlık yaşam sunar. Tercih yaşam tarzına göre değişir.',
  },
  {
    question: 'Yatırım için Sapanca mı Kocaali mi?',
    answer: 'Sapanca bungalov günlük kiralık getirisi yüksek, Kocaali uygun fiyatlı daire ve yazlık yatırımı sunar. Bütçe düşükse Kocaali, yüksek getiri hedefliyorsanız Sapanca tercih edilebilir.',
  },
];

const comparisonData = {
  sapanca: {
    name: 'Sapanca',
    pros: ['Göl manzarası', 'Bungalov seçenekleri', 'Masukiye yakınlığı', 'Günlük kiralık potansiyeli', 'Sakin doğa'],
    cons: ['Daha yüksek fiyatlar', 'Deniz yok'],
    avgDaire: '1 - 2.5 milyon TL',
    avgYazlik: '1 - 2 milyon TL',
    icon: Home,
  },
  kocaali: {
    name: 'Kocaali',
    pros: ['Denize yakın', 'Uygun fiyatlar', 'Plaj aktiviteleri', 'Yazlık kültürü', 'Merkez avantajları'],
    cons: ['Bungalov seçeneği sınırlı', 'Sapanca kadar turistik değil'],
    avgDaire: '700 bin - 1.2 milyon TL',
    avgYazlik: '500 bin - 1 milyon TL',
    icon: TreePine,
  },
};

export default async function SapancaVsKocaaliPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const articleSchema = generateArticleSchema({
    headline: 'Sapanca vs Kocaali | Emlak Karşılaştırması - Hangi Bölge Daha Uygun? 2025',
    description: 'Sapanca ve Kocaali emlak karşılaştırması. Fiyatlar, yaşam kalitesi ve yatırım potansiyeli.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(sapancaVsKocaaliFAQs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
    { name: 'Sapanca vs Kocaali', url: `${siteConfig.url}${basePath}/karsilastirma/sapanca-vs-kocaali` },
  ]);

  return (
    <>
      <StructuredData data={articleSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <StructuredData data={breadcrumbSchema} />

      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Sapanca vs Kocaali' },
        ]}
      />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Sapanca vs Kocaali
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            Sapanca ve Kocaali emlak karşılaştırması. Göl kenarı mı deniz kenarı mı? Fiyatlar, yaşam
            kalitesi ve yatırım potansiyeli açısından detaylı karşılaştırma.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
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

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-8 border-2 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3 mb-6">
              <TreePine className="w-10 h-10 text-amber-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Kocaali</h2>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Avantajlar</h3>
            <ul className="space-y-2 mb-6">
              {comparisonData.kocaali.pros.map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dezavantajlar</h3>
            <ul className="space-y-2 mb-4">
              {comparisonData.kocaali.cons.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              <strong>Ort. Daire:</strong> {comparisonData.kocaali.avgDaire} |{' '}
              <strong>Yazlık:</strong> {comparisonData.kocaali.avgYazlik}
            </p>
            <Link href={`${basePath}/kocaali`} className="mt-4 inline-block">
              <Button>Kocaali İlanları</Button>
            </Link>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {sapancaVsKocaaliFAQs.map((faq, index) => (
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
          <Link href={`${basePath}/karsilastirma/karasu-vs-sapanca`}>
            <Button variant="outline">Karasu vs Sapanca</Button>
          </Link>
          <Link href={`${basePath}/sapanca`}>
            <Button variant="outline">Sapanca</Button>
          </Link>
          <Link href={`${basePath}/kocaali`}>
            <Button variant="outline">Kocaali</Button>
          </Link>
          <Link href={`${basePath}/karasu`}>
            <Button variant="outline">Karasu</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
