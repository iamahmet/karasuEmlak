import { notFound } from 'next/navigation';
import { getNewsArticleBySlug, getNewsArticles } from '@/lib/supabase/queries';
import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { HeroImage, CardImage } from '@/components/images';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';
import { Button, SidebarRail } from '@karasu/ui';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, Share2, ExternalLink } from 'lucide-react';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateNewsArticleSchema } from '@/lib/seo/structured-data';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { generateSlug } from '@/lib/utils';
import { NewsSidebar } from '@/components/news/NewsSidebar';
import { normalizeNewsContent, normalizeNewsMetadata } from '@/lib/utils/news-content-normalizer';
import { ContentRenderer } from '@/components/content/ContentRenderer';

// Performance: Revalidate every hour for ISR
export const revalidate = 3600; // 1 hour

// Generate static params for popular news articles
export async function generateStaticParams() {
  try {
    const { articles } = await getNewsArticles(50, 0);
    if (!articles || articles.length === 0) {
      return [];
    }
    return articles.map((article) => ({
      slug: article.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getNewsArticleBySlug(slug);
  
  if (!article) {
    return {
      title: 'Haber Bulunamadı',
    };
  }

  const canonicalPath = locale === routing.defaultLocale 
    ? `/haberler/${slug}` 
    : `/${locale}/haberler/${slug}`;
  
  const ogImage = article.cover_image || article.og_image
    ? getOptimizedCloudinaryUrl((article.cover_image || article.og_image)!, { width: 1200, height: 630, crop: 'fill', quality: 90, format: 'auto' })
    : `${siteConfig.url}/og-image.jpg`;

  return {
    title: `${article.title} | Karasu Emlak Haberler`,
    description: article.seo_description || article.original_summary || article.title,
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': `/haberler/${slug}`,
        'en': `/en/haberler/${slug}`,
        'et': `/et/haberler/${slug}`,
        'ru': `/ru/haberler/${slug}`,
        'ar': `/ar/haberler/${slug}`,
      },
    },
    openGraph: {
      title: article.seo_title || article.title,
      description: article.seo_description || article.original_summary || '',
      url: `${siteConfig.url}${canonicalPath}`,
      images: [ogImage],
      type: 'article',
      publishedTime: article.published_at || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seo_title || article.title,
      description: article.seo_description || article.original_summary || '',
      images: [ogImage],
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = await getNewsArticleBySlug(slug);
  
  if (!article) {
    notFound();
  }

  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;
  
  // Normalize news metadata
  const normalized = normalizeNewsMetadata(
    {
      original_summary: article.original_summary,
      emlak_analysis: article.emlak_analysis,
      seo_description: article.seo_description,
      seo_keywords: article.seo_keywords,
    },
    {
      sanitize: true,
      clean: true,
    }
  );

  // Merge normalized metadata with original article (keep all original fields)
  const normalizedArticle = {
    ...article,
    title: article.title, // Ensure title is included
    original_summary: normalized.original_summary || article.original_summary,
    emlak_analysis: normalized.emlak_analysis || article.emlak_analysis,
    seo_description: normalized.seo_description || article.seo_description,
    seo_keywords: normalized.seo_keywords || article.seo_keywords,
  };
  
  // Get related news
  const { articles: allNews } = await getNewsArticles(10);
  const relatedNews = allNews
    .filter(a => a.id !== article.id)
    .slice(0, 3);

  // Generate structured data (use normalized metadata)
  const newsSchema = generateNewsArticleSchema({
    headline: normalizedArticle.title,
    description: normalizedArticle.seo_description || normalizedArticle.original_summary?.replace(/<[^>]*>/g, '').substring(0, 155),
    image: article.cover_image ? [getOptimizedCloudinaryUrl(article.cover_image, { width: 1200, height: 630, quality: 90, format: 'auto' })] : undefined,
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
    author: 'Karasu Emlak',
  });

  return (
    <>
      <StructuredData data={newsSchema} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-7xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Haberler', href: `${basePath}/haberler` },
            { label: normalizedArticle.title },
          ]}
          className="mb-6"
        />

        {/* Editorial Reading Layout - SidebarRail */}
        <SidebarRail
          sidebar={
            <NewsSidebar
              basePath={basePath}
              article={{
                id: normalizedArticle.id,
                title: normalizedArticle.title,
                content: normalizedArticle.original_summary?.replace(/<[^>]*>/g, '') || normalizedArticle.seo_description || '',
                published_at: normalizedArticle.published_at,
                featured: normalizedArticle.featured,
              }}
              relatedNews={relatedNews}
            />
          }
          sticky
          sidebarWidth="default"
        >
          {/* Article Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
              {normalizedArticle.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Karasu Emlak</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {article.published_at 
                    ? new Date(article.published_at).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : new Date(article.created_at).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                  }
                </span>
              </div>
            </div>
          </header>

          {/* Cover Image with Fallback */}
          <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden mb-8 bg-slate-100 dark:bg-slate-800">
            {article.cover_image ? (
              <HeroImage
                publicId={article.cover_image}
                alt={normalizedArticle.title}
                className="w-full h-full object-cover"
                sizes="100vw"
                fallback="/images/placeholder-article.jpg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                <div className="text-center p-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-400 dark:bg-slate-600 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Görsel yok</p>
                </div>
              </div>
            )}
          </div>

          {/* Original Summary */}
          {normalizedArticle.original_summary && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <ContentRenderer
                content={normalizedArticle.original_summary}
                format="auto"
                sanitize={true}
                prose={true}
                proseSize="lg"
                className="text-lg leading-relaxed text-gray-900"
              />
            </div>
          )}

          {/* Emlak Analysis */}
          {normalizedArticle.emlak_analysis && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Bu Ne Anlama Geliyor? - Emlak Analizi</h2>
              <ContentRenderer
                content={normalizedArticle.emlak_analysis}
                format="auto"
                sanitize={true}
                prose={true}
                proseSize="lg"
                className="mb-6 text-gray-700"
              />
                
                {/* Internal Links to Hubs */}
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">İlgili Rehberler</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Bu gelişmelerin emlak piyasasına etkileri hakkında daha fazla bilgi için:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`${basePath}/karasu-satilik-ev`}>
                      <Button variant="outline" size="sm">
                        Karasu Satılık Ev
                      </Button>
                    </Link>
                    <Link href={`${basePath}/kocaali-satilik-ev`}>
                      <Button variant="outline" size="sm">
                        Kocaali Satılık Ev
                      </Button>
                    </Link>
                    <Link href={`${basePath}/karasu-yatirimlik-gayrimenkul`}>
                      <Button variant="outline" size="sm">
                        Yatırımlık Gayrimenkul
                      </Button>
                    </Link>
                    <Link href={`${basePath}/karasu-satilik-ev-fiyatlari`}>
                      <Button variant="outline" size="sm">
                        Fiyat Analizi
                      </Button>
                    </Link>
                    {(() => {
                      // Get clean text for link detection (strip HTML)
                      const analysisText = normalizedArticle.emlak_analysis?.replace(/<[^>]*>/g, '') || '';
                      const summaryText = normalizedArticle.original_summary?.replace(/<[^>]*>/g, '') || '';
                      const contentLower = (analysisText + ' ' + summaryText).toLowerCase();
                      const links: Array<{ href: string; label: string }> = [];
                      
                      if (contentLower.includes('merkez')) {
                        links.push({ href: `${basePath}/karasu-merkez-satilik-ev`, label: 'Merkez Satılık Ev' });
                      }
                      if (contentLower.includes('deniz') || contentLower.includes('sahil')) {
                        links.push({ href: `${basePath}/karasu-denize-yakin-satilik-ev`, label: 'Denize Yakın Ev' });
                      }
                      if (contentLower.includes('yatırım') || contentLower.includes('yatirim')) {
                        links.push({ href: `${basePath}/karasu-yatirimlik-satilik-ev`, label: 'Yatırımlık Ev' });
                      }
                      if (contentLower.includes('müstakil') || contentLower.includes('mustakil')) {
                        links.push({ href: `${basePath}/karasu-mustakil-satilik-ev`, label: 'Müstakil Ev' });
                      }
                      if (contentLower.includes('karasu') && contentLower.includes('kocaali')) {
                        links.push({ href: `${basePath}/karasu-vs-kocaali-satilik-ev`, label: 'Karşılaştırma' });
                      }
                      
                      return links.slice(0, 2).map((link, index) => (
                        <Link key={index} href={link.href}>
                          <Button variant="outline" size="sm">
                            {link.label}
                          </Button>
                        </Link>
                      ));
                    })()}
                  </div>
                </div>
            </div>
          )}

          {/* Source Link */}
          {article.source_url && (
            <div className="mb-8 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kaynak:</p>
                  <p className="font-medium text-gray-900">{article.source_domain}</p>
                </div>
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <span>Orijinal Haberi Gör</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          )}

          {/* Related Neighborhoods */}
          {article.related_neighborhoods && article.related_neighborhoods.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">İlgili Mahalleler</h2>
              <p className="text-sm text-gray-600 mb-4">
                Bu haberle ilgili mahallelerde satılık ev seçeneklerini keşfedin:
              </p>
              <div className="flex flex-wrap gap-2">
                {article.related_neighborhoods.map((neighborhood) => {
                  const neighborhoodSlug = generateSlug(neighborhood);
                  return (
                    <Link
                      key={neighborhood}
                      href={`${basePath}/mahalle/${neighborhoodSlug}?status=satilik`}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                    >
                      {neighborhood} Satılık Ev
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Share Buttons */}
          <div className="border-t border-gray-200 pt-8 mb-12">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Paylaş:</span>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Paylaş
              </Button>
            </div>
          </div>

          {/* Related News */}
          {relatedNews.length > 0 && (
            <div className="border-t border-gray-200 pt-12">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">İlgili Haberler</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNews.map((related) => {
                  const relatedImage = related.cover_image;
                  return (
                    <Link key={related.id} href={`${basePath}/haberler/${related.slug}`}>
                      <article className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="h-40 bg-gray-100 relative">
                          {relatedImage ? (
                            <CardImage
                              publicId={relatedImage}
                              alt={related.title}
                              className="w-full h-full object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                              fallback="/images/placeholder-article.jpg"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <div className="text-center">
                                <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-500 text-xs">Görsel yok</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-2 text-gray-900">{related.title}</h3>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {related.original_summary || related.seo_description}
                          </p>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </SidebarRail>
      </div>
    </>
  );
}

