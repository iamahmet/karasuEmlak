import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { User, ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { getArticles } from '@/lib/supabase/queries';
import { ArticleCard } from '@/components/blog/ArticleCard';
// Schema will be generated inline
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; author: string }>;
}): Promise<Metadata> {
  const { locale, author } = await params;
  const decodedAuthor = decodeURIComponent(author);
  const canonicalPath = locale === routing.defaultLocale 
    ? `/blog/yazar/${author}` 
    : `/${locale}/blog/yazar/${author}`;
  
  return {
    title: `${decodedAuthor} | Blog Yazarı | Karasu Emlak`,
    description: `${decodedAuthor} tarafından yazılan blog makaleleri. Emlak, yatırım ve bölge hakkında uzman görüşler.`,
    keywords: [
      `${decodedAuthor} emlak`,
      `${decodedAuthor} blog`,
      'karasu emlak blog',
      'emlak yazarları',
    ],
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${decodedAuthor} | Blog Yazarı | Karasu Emlak`,
      description: `${decodedAuthor} tarafından yazılan blog makaleleri`,
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'profile',
    },
  };
}

export default async function BlogAuthorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; author: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, author } = await params;
  const { page = '1' } = await searchParams;
  const decodedAuthor = decodeURIComponent(author);
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  const currentPage = parseInt(page, 10) || 1;
  const limit = 12;
  const offset = (currentPage - 1) * limit;
  
  // Get all articles and filter by author
  const { articles: allArticles } = await getArticles(1000, 0);
  const authorArticles = allArticles.filter(article => 
    article.author?.toLowerCase() === decodedAuthor.toLowerCase()
  );
  
  if (authorArticles.length === 0) {
    notFound();
  }
  
  const paginatedArticles = authorArticles.slice(offset, offset + limit);
  const total = authorArticles.length;
  const totalPages = Math.ceil(total / limit);

  // Generate schema
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `${decodedAuthor} - Blog Makaleleri`,
    description: `${decodedAuthor} tarafından yazılan blog makaleleri`,
    mainEntity: {
      '@type': 'Person',
      name: decodedAuthor,
    },
    about: {
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
          { label: decodedAuthor, href: `${basePath}/blog/yazar/${author}` },
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
                <User className="w-6 h-6 text-primary-300" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  {decodedAuthor}
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
                        <Link href={`${basePath}/blog/yazar/${author}?page=${currentPage - 1}`}>
                          Önceki
                        </Link>
                      </Button>
                    )}
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Sayfa {currentPage} / {totalPages}
                    </span>
                    {currentPage < totalPages && (
                      <Button asChild variant="outline">
                        <Link href={`${basePath}/blog/yazar/${author}?page=${currentPage + 1}`}>
                          Sonraki
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Bu yazarın henüz makalesi bulunmuyor.</p>
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

