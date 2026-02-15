import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Tag, ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { getArticles } from '@/lib/supabase/queries';
import { ArticleCard } from '@/components/blog/ArticleCard';
import { slugToCategoryName, categoryToSlug, normalizeCategoryName, categoriesMatch } from '@/lib/utils/category-utils';
// Schema will be generated inline
import { notFound } from 'next/navigation';

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string }>;
  searchParams?: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  const sp = (await searchParams) ?? {};
  const pageNum = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const decodedCategorySlug = decodeURIComponent(category);
  const categoryName = slugToCategoryName(decodedCategorySlug) || decodedCategorySlug;
  const canonicalBasePath = locale === routing.defaultLocale 
    ? `/blog/kategori/${category}` 
    : `/${locale}/blog/kategori/${category}`;
  const canonicalPath = pageNum > 1 ? `${canonicalBasePath}?page=${pageNum}` : canonicalBasePath;
  const titleSuffix = pageNum > 1 ? ` (Sayfa ${pageNum})` : '';
  
  return {
    title: `${categoryName} Kategorisi | Blog | Karasu Emlak${titleSuffix}`,
    description: `Karasu Emlak blogunda ${categoryName} kategorisindeki tüm makaleler. Emlak, yatırım ve bölge hakkında güncel içerikler.`,
    keywords: [
      `${categoryName} emlak`,
      `${categoryName} blog`,
      'karasu emlak blog',
      'emlak makaleleri',
      `${categoryName.toLowerCase()} kategorisi`,
    ],
    alternates: {
      canonical: canonicalPath,
      languages: pruneHreflangLanguages({
        'tr': pageNum > 1 ? `/blog/kategori/${category}?page=${pageNum}` : `/blog/kategori/${category}`,
        'en': `/en/blog/kategori/${category}`,
        'et': `/et/blog/kategori/${category}`,
        'ru': `/ru/blog/kategori/${category}`,
        'ar': `/ar/blog/kategori/${category}`,
      }),
    },
    openGraph: {
      title: `${categoryName} Kategorisi | Blog | Karasu Emlak${titleSuffix}`,
      description: `Karasu Emlak blogunda ${categoryName} kategorisindeki makaleler`,
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} Kategorisi | Blog | Karasu Emlak${titleSuffix}`,
      description: `Karasu Emlak blogunda ${categoryName} kategorisindeki makaleler`,
      images: [`${siteConfig.url}/og-image.jpg`],
    },
  };
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, category } = await params;
  const { page = '1' } = await searchParams;
  const decodedCategorySlug = decodeURIComponent(category);
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  const currentPage = parseInt(page, 10) || 1;
  const limit = 12;
  const offset = (currentPage - 1) * limit;
  
  // Convert slug to category name
  let categoryName = slugToCategoryName(decodedCategorySlug);
  
  // Get all articles first to find matching category if slug doesn't match standard
  const { articles: allArticles } = await getArticles(1000, 0);
  
  // If slug doesn't match standard categories, try to find matching category from articles
  if (!categoryName) {
    // Find unique categories that match the slug
    const matchingCategories = new Set<string>();
    allArticles.forEach(article => {
      if (article.category && categoryToSlug(article.category) === decodedCategorySlug.toLowerCase()) {
        matchingCategories.add(article.category);
      }
    });
    
    if (matchingCategories.size === 0) {
      notFound();
    }
    
    // Use the first matching category (should be normalized already)
    categoryName = Array.from(matchingCategories)[0];
  }
  
  // Filter articles by category (case-insensitive match)
  const categoryArticles = allArticles.filter(article => 
    categoriesMatch(article.category, categoryName)
  );
  
  if (categoryArticles.length === 0) {
    notFound();
  }
  
  const paginatedArticles = categoryArticles.slice(offset, offset + limit);
  const total = categoryArticles.length;
  const totalPages = Math.ceil(total / limit);

  // Generate schema
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryName} Kategorisi`,
    description: `Karasu Emlak blogunda ${categoryName} kategorisindeki makaleler`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: paginatedArticles.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          name: article.title,
          url: `${siteConfig.url}${basePath}/blog/${article.slug}`,
        },
      })),
    },
  };

  return (
    <>
      <StructuredData data={collectionSchema} />
      
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: `${basePath}/` },
          { label: 'Blog', href: `${basePath}/blog` },
          { label: categoryName, href: `${basePath}/blog/kategori/${category}` },
        ]}
      />

      <main className="min-h-screen bg-white">
        {/* Header */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Link
                href={`${basePath}/blog`}
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Blog'a Dön
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <Tag className="w-6 h-6 text-primary-300" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  {categoryName}
                </h1>
              </div>
              <p className="text-lg text-gray-200">
                {total} makale bulundu
              </p>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            {paginatedArticles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {paginatedArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} basePath={basePath} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {currentPage > 1 && (
                      <Button asChild variant="outline">
                        <Link href={`${basePath}/blog/kategori/${category}?page=${currentPage - 1}`}>
                          Önceki
                        </Link>
                      </Button>
                    )}
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Sayfa {currentPage} / {totalPages}
                    </span>
                    {currentPage < totalPages && (
                      <Button asChild variant="outline">
                        <Link href={`${basePath}/blog/kategori/${category}?page=${currentPage + 1}`}>
                          Sonraki
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Bu kategoride henüz makale bulunmuyor.</p>
                <Button asChild className="mt-4">
                  <Link href={`${basePath}/blog`}>
                    Tüm Makalelere Dön
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
