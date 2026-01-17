import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema, generateArticleSchema } from '@/lib/seo/structured-data';
import { EnhancedRelatedArticles } from '@/components/blog/EnhancedRelatedArticles';
import { getRelatedContent } from '@/lib/content/related-content';

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
    title: 'Sapanca Günlük Kiralık | Bungalov ve Yazlık Günlük Kiralık Seçenekleri',
    description: 'Sapanca\'da günlük kiralık bungalov ve yazlık seçenekleri. Hafta sonu kaçamakları için ideal. Fiyatlar, dikkat edilmesi gerekenler ve rezervasyon bilgileri.',
    keywords: [
      'sapanca günlük kiralık',
      'sapanca günlük kiralık bungalov',
      'sapanca hafta sonu kiralık',
      'sapanca gölü günlük kiralık',
      'sapanca tatil evi kiralık',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/sapanca/gunluk-kiralik`,
    },
  };
}

const gunlukKiralikFAQs = [
  {
    question: 'Sapanca\'da günlük kiralık fiyatları ne kadar?',
    answer: 'Sapanca\'da günlük kiralık fiyatları sezona göre değişmektedir. Yaz sezonunda (Haziran-Eylül) göl kenarı bungalovlar 800-2000 TL/gün, merkez bungalovlar 500-1200 TL/gün arasında değişmektedir. Kış sezonunda fiyatlar daha uygundur.',
  },
  {
    question: 'Sapanca\'da günlük kiralık için rezervasyon nasıl yapılır?',
    answer: 'Sapanca\'da günlük kiralık için erken rezervasyon yapmak avantajlıdır. Özellikle yaz sezonunda talep yüksek olduğu için 1-2 ay önceden rezervasyon yapılması önerilir. Rezervasyon sırasında sözleşme, ödeme koşulları ve iptal politikası kontrol edilmelidir.',
  },
  {
    question: 'Sapanca\'da günlük kiralıkta dikkat edilmesi gerekenler nelerdir?',
    answer: 'Sapanca\'da günlük kiralık alırken ruhsat durumu, ödeme koşulları, iptal politikası, temizlik ve güvenlik konuları kontrol edilmelidir. Ayrıca göl kenarı bungalovlar için erişim, park yeri ve aktivite imkanları sorgulanmalıdır.',
  },
];

export default async function SapancaGunlukKiralikPage({
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
      'günlük kiralık',
      'bungalov',
      'yazlık',
      'hafta sonu',
      'tatil',
      'kiralık ev',
      'sapanca gölü',
    ],
    location: 'Sapanca',
    category: 'Rehber',
    tags: ['Sapanca', 'Günlük Kiralık', 'Tatil', 'Bungalov'],
    limit: 6,
  });

  const articleSchema = generateArticleSchema({
    headline: 'Sapanca Günlük Kiralık | Bungalov ve Yazlık Günlük Kiralık Seçenekleri',
    description: 'Sapanca\'da günlük kiralık bungalov ve yazlık seçenekleri. Hafta sonu kaçamakları için ideal.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
  });

  const faqSchema = generateFAQSchema(gunlukKiralikFAQs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
    { name: 'Sapanca', url: `${siteConfig.url}${basePath}/sapanca` },
    { name: 'Günlük Kiralık', url: `${siteConfig.url}${basePath}/sapanca/gunluk-kiralik` },
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
          { label: 'Günlük Kiralık', href: `${basePath}/sapanca/gunluk-kiralik` },
        ]}
      />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Sapanca Günlük Kiralık
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            Sapanca'da günlük kiralık bungalov ve yazlık seçenekleri. Hafta sonu kaçamakları için ideal.
          </p>
        </div>

        <div className="prose prose-lg max-w-none dark:prose-invert">
          <p>
            Sapanca'da günlük kiralık seçenekleri hakkında detaylı bilgiler bu sayfada yer alacak.
            Fiyatlar, dikkat edilmesi gerekenler ve rezervasyon bilgileri hazırlanıyor.
          </p>
        </div>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {gunlukKiralikFAQs.map((faq, index) => (
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
              title="Sapanca ve Günlük Kiralık Hakkında Makaleler"
              limit={6}
            />
          </section>
        )}
      </div>
    </>
  );
}
