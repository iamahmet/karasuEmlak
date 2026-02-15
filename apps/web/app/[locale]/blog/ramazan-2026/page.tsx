import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { ArticleCard } from '@/components/blog/ArticleCard';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { generateBreadcrumbSchema, generateFAQPageSchema, generateBlogItemListSchema } from '@/lib/seo/blog-structured-data';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';
import { Button } from '@karasu/ui';
import { ArrowLeft, Calendar, FileText, MapPin } from 'lucide-react';

export const revalidate = 3600;

const RAMADAN_2026_SLUGS = [
  'ramazan-2026-karasu-rehberi',
  'sakarya-karasu-ramazan-imsakiyesi-2026',
  'karasu-iftara-kac-dakika-kaldi',
  'ramazan-bayrami-2026-karasu-tatil-yazlik-rehberi',
  'ramazan-2026-karasu-kiralik-ev-ipuclari',
  'ramazan-oncesi-tasinma-checklist-karasu',
  'ramazan-karasu-yazlik-kiralama-bayram-2026',
  'karasu-ramazan-sahil-aksam-plani',
  'ramazan-2026-karasu-ev-gezerken-sorular',
  'karasu-ramazan-2026-kiralik-daire-mi-ev-mi',
  'ramazan-bayrami-2026-karasu-trafik-park',
  'ramazanda-kiraci-mutfak-duzeni-iftar-sahur',
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/blog/ramazan-2026' : `/${locale}/blog/ramazan-2026`;
  const ogImageUrl = getOptimizedCloudinaryUrl('articles/ramazan-2026/ramazan-2026-karasu-rehberi', {
    width: 1200,
    height: 630,
    crop: 'fill',
    quality: 90,
    format: 'auto',
  });

  return {
    title: 'Ramazan 2026 Karasu Rehberleri | Blog',
    description:
      'Ramazan 2026 ve Ramazan Bayramı 2026 için Karasu odağında pratik rehberler: kiralık ev arama ipuçları, taşınma checklist’i, sahil akşam planı ve bayram dönemi yazlık önerileri.',
    keywords: [
      'ramazan 2026',
      'ramazan bayramı 2026',
      'karasu ramazan',
      'karasu kiralık',
      'karasu yazlık',
      'taşınma checklist',
      'kiralık ev ipuçları',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        tr: '/blog/ramazan-2026',
        en: '/en/blog/ramazan-2026',
        et: '/et/blog/ramazan-2026',
        ru: '/ru/blog/ramazan-2026',
        ar: '/ar/blog/ramazan-2026',
      },
    },
    openGraph: {
      title: 'Ramazan 2026 Karasu Rehberleri',
      description:
        'Ramazan ve bayram dönemine özel Karasu rehberleri, kontrol listeleri ve kiralık/yazlık planı.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Ramazan 2026 Karasu Rehberleri',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Ramazan 2026 Karasu Rehberleri',
      description: 'Ramazan ve bayram dönemine özel Karasu rehberleri ve kontrol listeleri.',
      images: [ogImageUrl],
    },
  };
}

async function getRamadanArticles() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .in('slug', RAMADAN_2026_SLUGS)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Ramazan 2026 Hub] Error fetching articles:', error);
    return [];
  }

  return (data || []) as any[];
}

export default async function Ramadan2026HubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const articles = await getRamadanArticles();

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Blog', href: `${basePath}/blog` },
    { label: 'Ramazan 2026', href: `${basePath}/blog/ramazan-2026` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana Sayfa', url: siteConfig.url },
    { name: 'Blog', url: `${siteConfig.url}${basePath}/blog` },
    { name: 'Ramazan 2026', url: `${siteConfig.url}${basePath}/blog/ramazan-2026` },
  ]);

  // CollectionPage schema (custom url for hub)
  const itemList = generateBlogItemListSchema(articles, `${siteConfig.url}${basePath}`, {
    name: 'Ramazan 2026 Yazıları',
    description: 'Ramazan 2026 ve Ramazan Bayramı 2026 için Karasu odaklı blog yazıları.',
  });
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Ramazan 2026 Karasu Rehberleri',
    description: 'Ramazan 2026 dönemine özel Karasu rehberleri, kontrol listeleri ve planlama yazıları.',
    url: `${siteConfig.url}${basePath}/blog/ramazan-2026`,
    mainEntity: itemList,
    numberOfItems: articles.length,
  };

  const faqSchema = generateFAQPageSchema([
    {
      question: 'Ramazan 2026 ne zaman başlıyor?',
      answer:
        'Türkiye takvimine göre Ramazan 2026, 19 Şubat 2026 Perşembe günü başlar. İmsak ve iftar saatleri gün gün değiştiği için Karasu için resmi takvimden kontrol edin.',
    },
    {
      question: 'Ramazan Bayramı 2026 hangi tarihlerde?',
      answer:
        'Türkiye takvimine göre Ramazan Bayramı 2026, 20 Mart 2026 Cuma ile 22 Mart 2026 Pazar tarihleri arasındadır.',
    },
    {
      question: 'Ramazan döneminde Karasu’da kiralık ev aramak mantıklı mı?',
      answer:
        'Evet. Randevuları doğru saatlere koyup karar sürecini aceleye getirmeden yönetirseniz verimli ilerleyebilir. Kontrol listeleri ve soru setleri işinizi kolaylaştırır.',
    },
  ]);

  // Pin cornerstone articles if present
  const cornerstoneOrder = [
    'ramazan-2026-karasu-rehberi',
    'sakarya-karasu-ramazan-imsakiyesi-2026',
    'ramazan-bayrami-2026-karasu-tatil-yazlik-rehberi',
  ];
  const pinned = cornerstoneOrder
    .map((s) => articles.find((a: any) => a.slug === s))
    .filter(Boolean);
  const pinnedIds = new Set(pinned.map((a: any) => a.id));
  const rest = articles.filter((a: any) => !pinnedIds.has(a.id));

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={collectionSchema as any} />
      {faqSchema && <StructuredData data={faqSchema as any} />}

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumbs items={breadcrumbs} className="mb-5" />

          <section className="rounded-2xl border border-gray-200 bg-gradient-to-br from-primary/5 via-white to-blue-50/60 p-6 md:p-10 shadow-sm mb-8">
            <Link
              href={`${basePath}/blog`}
              className="inline-flex items-center gap-2 text-gray-700 hover:text-primary transition-colors mb-5"
            >
              <ArrowLeft className="h-4 w-4" />
              Blog&apos;a Dön
            </Link>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
              Ramazan 2026 Karasu Rehberleri
            </h1>
            <p className="text-base md:text-lg text-gray-700 max-w-3xl leading-relaxed">
              Ramazan 2026 ve Ramazan Bayramı 2026 dönemi için Karasu odağında pratik içerikler: kiralık arama,
              taşınma planı, sahil akşam rutini ve bayram haftası yazlık/kısa tatil önerileri.
            </p>

            <div className="flex flex-wrap gap-2.5 mt-6">
              <Link href={`${basePath}/karasu/ramazan-imsakiyesi`}>
                <Button variant="outline" size="sm" className="border-2 hover:border-primary hover:bg-primary/5">
                  <Calendar className="h-4 w-4 mr-2" />
                  Karasu İmsakiyesi
                </Button>
              </Link>
              <Link href={`${basePath}/karasu/iftara-kac-dakika-kaldi`}>
                <Button variant="outline" size="sm" className="border-2 hover:border-primary hover:bg-primary/5">
                  <Calendar className="h-4 w-4 mr-2" />
                  İftara Kaç Dakika?
                </Button>
              </Link>
              <Link href={`${basePath}/kiralik`}>
                <Button variant="outline" size="sm" className="border-2 hover:border-primary hover:bg-primary/5">
                  <FileText className="h-4 w-4 mr-2" />
                  Kiralık İlanlar
                </Button>
              </Link>
              <Link href={`${basePath}/karasu`}>
                <Button variant="outline" size="sm" className="border-2 hover:border-primary hover:bg-primary/5">
                  <MapPin className="h-4 w-4 mr-2" />
                  Karasu Rehberi
                </Button>
              </Link>
              <Link href={`${basePath}/blog/etiket/ramazan`}>
                <Button variant="outline" size="sm" className="border-2 hover:border-primary hover:bg-primary/5">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ramazan Etiketi
                </Button>
              </Link>
            </div>
          </section>

          {pinned.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5">Cornerstone Rehberler</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pinned.map((article: any) => (
                  <ArticleCard key={article.id} article={article} basePath={basePath} />
                ))}
              </div>
            </section>
          )}

          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5">Tüm Ramazan 2026 Yazıları</h2>
            {rest.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((article: any) => (
                  <ArticleCard key={article.id} article={article} basePath={basePath} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-700">
                Şu an listelenecek yazı bulunamadı.
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
