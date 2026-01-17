import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema, generateBreadcrumbSchema, generateArticleSchema } from '@/lib/seo/structured-data';
import { Mountain, Waves, TreePine, Coffee, Camera, MapPin } from 'lucide-react';
import Link from 'next/link';

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
    title: 'Sapanca Gezilecek Yerler | Göl Çevresi, Yürüyüş Rotaları ve Aktiviteler',
    description: 'Sapanca Gölü çevresinde gezilecek yerler, yürüyüş rotaları ve aktiviteler. Maşukiye şelaleleri, Kırkpınar Yaylası ve göl çevresi restoranlar. Discover uyumlu içerik.',
    keywords: [
      'sapanca gezilecek yerler',
      'sapanca gölü',
      'sapanca yürüyüş rotaları',
      'maşukiye şelaleleri',
      'sapanca aktiviteler',
      'sapanca turizm',
    ],
    alternates: {
      canonical: `${siteConfig.url}${basePath}/sapanca/gezilecek-yerler`,
    },
  };
}

const gezilecekYerler = [
  {
    name: 'Sapanca Gölü Çevresi',
    description: 'Sapanca Gölü çevresinde yürüyüş yolları, piknik alanları ve manzara noktaları. Göl kenarında yürüyüş yapmak ve doğal güzellikleri keşfetmek için ideal.',
    icon: Waves,
    category: 'Doğa',
  },
  {
    name: 'Maşukiye Şelaleleri',
    description: 'Maşukiye bölgesinde yer alan şelaleler ve doğal alanlar. Yürüyüş rotaları ve piknik alanları ile doğa severler için ideal.',
    icon: Mountain,
    category: 'Doğa',
  },
  {
    name: 'Kırkpınar Yaylası',
    description: 'Sapanca\'nın yüksek kesimlerinde yer alan Kırkpınar Yaylası. Temiz hava, doğal güzellikler ve yürüyüş rotaları.',
    icon: TreePine,
    category: 'Doğa',
  },
  {
    name: 'Göl Çevresi Restoranlar',
    description: 'Sapanca Gölü çevresinde yer alan restoranlar ve kafeler. Göl manzarası eşliğinde yemek yeme ve kahve içme imkanı.',
    icon: Coffee,
    category: 'Yeme-İçme',
  },
  {
    name: 'Fotoğraf Noktaları',
    description: 'Sapanca Gölü ve çevresinde fotoğraf çekmek için ideal noktalar. Gün doğumu ve gün batımı manzaraları.',
    icon: Camera,
    category: 'Aktiviteler',
  },
];

const gezilecekYerlerFAQs = [
  {
    question: 'Sapanca\'da en çok ziyaret edilen yerler nelerdir?',
    answer: 'Sapanca\'da en çok ziyaret edilen yerler Sapanca Gölü çevresi, Maşukiye şelaleleri ve Kırkpınar Yaylası\'dır. Göl çevresi yürüyüş yolları ve piknik alanları popülerdir.',
  },
  {
    question: 'Sapanca\'da yürüyüş rotaları var mı?',
    answer: 'Evet, Sapanca\'da göl çevresi yürüyüş rotaları bulunmaktadır. Ayrıca Maşukiye ve Kırkpınar Yaylası bölgelerinde doğa yürüyüş rotaları mevcuttur.',
  },
  {
    question: 'Sapanca\'da hangi mevsimde gitmek daha iyi?',
    answer: 'Sapanca\'da her mevsim farklı güzellikler sunar. Yaz sezonu aktiviteler için ideal, kış sezonu sakin atmosfer ve kar manzarası için uygundur. İlkbahar ve sonbahar doğa yürüyüşleri için ideal mevsimlerdir.',
  },
];

export default async function SapancaGezilecekYerlerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const articleSchema = generateArticleSchema({
    headline: 'Sapanca Gezilecek Yerler | Göl Çevresi, Yürüyüş Rotaları ve Aktiviteler',
    description: 'Sapanca Gölü çevresinde gezilecek yerler, yürüyüş rotaları ve aktiviteler. Discover uyumlu içerik.',
    image: [`${siteConfig.url}/og-image.jpg`],
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: 'Karasu Emlak',
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
            Sapanca Gölü çevresinde gezilecek yerler, yürüyüş rotaları ve aktiviteler.
          </p>
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {gezilecekYerler.map((place, index) => {
            const Icon = place.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {place.name}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {place.category}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {place.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {gezilecekYerlerFAQs.map((faq, index) => (
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
