import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import { Hash, ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { ArticleCard } from '@/components/blog/ArticleCard';
import { getArticlesByTag } from '@/lib/supabase/queries';
import { generateBreadcrumbSchema, generateFAQPageSchema, generateBlogItemListSchema } from '@/lib/seo/blog-structured-data';

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
export const revalidate = 3600;

function normalizeTagSlug(value: string) {
  return (value || '').trim().toLowerCase().replace(/\s+/g, '-');
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; tag: string }>;
  searchParams?: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { locale, tag } = await params;
  const sp = (await searchParams) ?? {};
  const pageNum = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const decoded = decodeURIComponent(tag);
  const normalized = normalizeTagSlug(decoded);

  const canonicalBasePath = locale === routing.defaultLocale
    ? `/blog/etiket/${normalized}`
    : `/${locale}/blog/etiket/${normalized}`;
  const canonicalPath = pageNum > 1 ? `${canonicalBasePath}?page=${pageNum}` : canonicalBasePath;
  const titleSuffix = pageNum > 1 ? ` (Sayfa ${pageNum})` : '';

  const titleTag = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  return {
    title: `${titleTag} Etiketi | Blog | Karasu Emlak${titleSuffix}`,
    description: `Karasu Emlak blogunda "${titleTag}" etiketi ile ilişkili tüm yazılar. Rehberler, analizler ve güncel içerikler.`,
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        tr: pageNum > 1 ? `/blog/etiket/${normalized}?page=${pageNum}` : `/blog/etiket/${normalized}`,
        en: `/en/blog/etiket/${normalized}`,
        et: `/et/blog/etiket/${normalized}`,
        ru: `/ru/blog/etiket/${normalized}`,
        ar: `/ar/blog/etiket/${normalized}`,
      }),
    },
    openGraph: {
      title: `${titleTag} Etiketi | Blog${titleSuffix}`,
      description: `"${titleTag}" etiketi ile ilişkili blog yazıları`,
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${titleTag} Etiketi | Blog${titleSuffix}`,
      description: `"${titleTag}" etiketi ile ilişkili blog yazıları`,
      images: [`${siteConfig.url}/og-image.jpg`],
    },
  };
}

export default async function BlogTagPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; tag: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, tag } = await params;
  const { page = '1' } = await searchParams;
  const decoded = decodeURIComponent(tag);
  const normalized = normalizeTagSlug(decoded);
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const currentPage = parseInt(page, 10) || 1;
  const limit = 12;
  const offset = (currentPage - 1) * limit;

  const { articles: paginated, total } = await getArticlesByTag(normalized, limit, offset);

  if (!paginated || paginated.length === 0) {
    notFound();
  }

  const totalPages = Math.ceil(total / limit);

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Blog', href: `${basePath}/blog` },
    { label: `#${normalized}`, href: `${basePath}/blog/etiket/${encodeURIComponent(normalized)}` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Ana Sayfa', url: siteConfig.url },
    { name: 'Blog', url: `${siteConfig.url}${basePath}/blog` },
    { name: `#${normalized}`, url: `${siteConfig.url}${basePath}/blog/etiket/${encodeURIComponent(normalized)}` },
  ]);

  const itemList = generateBlogItemListSchema(paginated, `${siteConfig.url}${basePath}`, {
    name: `#${normalized} Yazıları`,
    description: `#${normalized} etiketi ile ilişkili blog yazıları`,
  });
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `#${normalized} Etiketi`,
    description: `#${normalized} etiketi ile ilişkili blog yazıları`,
    url: `${siteConfig.url}${basePath}/blog/etiket/${encodeURIComponent(normalized)}`,
    mainEntity: itemList,
    numberOfItems: total,
  };

  // Small FAQ to support rich results for common tags (esp. ramazan)
  const faqs =
    normalized === 'ramazan'
      ? [
          {
            question: 'Ramazan 2026 içerikleri nerede toplanıyor?',
            answer: 'Ramazan 2026 içerik merkezini blog içinde özel sayfada bulabilirsiniz: /blog/ramazan-2026.',
          },
        ]
      : [];
  const faqSchema = generateFAQPageSchema(faqs as any);

  return (
    <>
      <StructuredData data={breadcrumbSchema as any} />
      <StructuredData data={collectionSchema as any} />
      {faqSchema && <StructuredData data={faqSchema as any} />}

      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumbs items={breadcrumbs} className="mb-5" />

          <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-14 rounded-2xl mb-8">
            <div className="px-6 md:px-10">
              <Link
                href={`${basePath}/blog`}
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Blog&apos;a Dön
              </Link>
              <div className="flex items-center gap-3 mb-3">
                <Hash className="w-6 h-6 text-primary-400" aria-hidden />
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-sm">
                  #{normalized}
                </h1>
              </div>
              <p className="text-base text-gray-300">{total} yazı bulundu</p>
              {normalized === 'ramazan' && (
                <div className="mt-5">
                  <Link href={`${basePath}/blog/ramazan-2026`}>
                    <Button variant="secondary" size="sm">
                      Ramazan 2026 İçerik Merkezine Git
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </section>

          <section className="pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginated.map((article) => (
                <ArticleCard key={(article as any).id} article={article as any} basePath={basePath} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {currentPage > 1 && (
                  <Button asChild variant="outline">
                    <Link href={`${basePath}/blog/etiket/${encodeURIComponent(normalized)}?page=${currentPage - 1}`}>
                      Önceki
                    </Link>
                  </Button>
                )}
                <span className="px-4 py-2 text-sm text-gray-600">
                  Sayfa {currentPage} / {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Button asChild variant="outline">
                    <Link href={`${basePath}/blog/etiket/${encodeURIComponent(normalized)}?page=${currentPage + 1}`}>
                      Sonraki
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
