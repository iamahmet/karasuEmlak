import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { withTimeout } from '@/lib/utils/timeout';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';
import { getFreeImageForArticleServer, isValidCloudinaryId } from '@/lib/images/free-image-fallback';
import { normalizeArticleMetadata, isLegacyArticle } from '@/lib/utils/article-content-normalizer';
import { generateBlogImageAlt } from '@/lib/seo/image-alt-generator';
import { StructuredData } from '@/components/seo/StructuredData';
import { calculateReadingTime } from '@/lib/utils/reading-time';
import { ArticleHero } from '@/components/blog/ArticleHero';
import { ArticleBody } from '@/components/blog/ArticleBody';
import { ArticleSidebar } from '@/components/blog/ArticleSidebar';
import { ArticleFooter } from '@/components/blog/ArticleFooter';
import { generateContextualLinks } from '@/components/blog/contextual-links';
import { getArticleBySlug, getRelatedArticles, getAdjacentArticles } from '@/lib/supabase/queries';
import type { Article } from '@/lib/supabase/queries/articles';
import { getIntelligentRecommendations } from '@/lib/services/article-recommendations';
import { getPopularArticles } from '@/lib/supabase/queries/blog-sidebar';
import { getQAEntries } from '@/lib/supabase/queries/qa';
import { getAIQuestionsForPage } from '@/lib/supabase/queries/ai-questions';
import {
  generateBlogArticleSchema,
  generateBreadcrumbSchema,
  generateFAQPageSchema,
  generateWebPageSchema,
  generateRelatedArticlesSchema,
} from '@/lib/seo/blog-structured-data';
import { getLastModified, generateLastModifiedMeta } from '@/lib/seo/content-freshness';

// Critical components - Static imports for above-the-fold content
import { ReadingProgress } from '@/components/blog/ReadingProgress';
import { KeyboardShortcuts } from '@/components/blog/KeyboardShortcuts';
import { ArticleAnalytics } from '@/components/blog/ArticleAnalytics';
import { AIChecker } from '@/components/content/AIChecker';
import { AICheckerBadge } from '@/components/content/AICheckerBadge';

// Dynamic imports for code splitting - below-the-fold content
const ArticleNavigation = dynamic(
  () => import('@/components/blog/ArticleNavigation').then((mod) => ({ default: mod.ArticleNavigation })),
  { ssr: true }
);

// ISR: Revalidate every hour for fresh content
export const revalidate = 3600;

// Generate static params for popular articles to improve performance
export async function generateStaticParams() {
  try {
    const popularArticles = await withTimeout(getPopularArticles(50), 5000, []);
    if (!popularArticles || popularArticles.length === 0) {
      return [];
    }
    return popularArticles.map((article) => ({
      slug: article.slug,
    }));
  } catch (error) {
    console.warn('[Blog Detail] Failed to generate static params:', error);
    return [];
  }
}

/**
 * Enhanced metadata generation with comprehensive SEO
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  
  // Fetch article with timeout to prevent hanging
  const rawArticle = await withTimeout(getArticleBySlug(slug), 2000, null);

  if (!rawArticle) {
    return {
      title: 'Yazı Bulunamadı | Karasu Emlak Blog',
      description: 'Aradığınız blog yazısı bulunamadı.',
      robots: { index: false, follow: true },
    };
  }

  // Normalize article metadata for legacy articles
  const normalized = normalizeArticleMetadata(
    { ...rawArticle, title: rawArticle.title },
    {
      sanitize: true,
      clean: true,
      checkQuality: false, // Don't check quality in metadata generation (performance)
    }
  );
  const article = {
    ...rawArticle,
    ...normalized,
  };

  const canonicalPath = locale === routing.defaultLocale ? `/blog/${slug}` : `/${locale}/blog/${slug}`;
  const articleUrl = `${siteConfig.url}${canonicalPath}`;

  // Optimize OG image with fallback strategy (use normalized featured_image)
  const articleFeaturedImage = article.featured_image || normalized.featured_image;
  let ogImageUrl = `${siteConfig.url}/og-image.jpg`;
  if (articleFeaturedImage && isValidCloudinaryId(articleFeaturedImage)) {
    ogImageUrl = getOptimizedCloudinaryUrl(articleFeaturedImage, {
      width: 1200,
      height: 630,
      crop: 'fill',
      quality: 90,
      format: 'auto',
    });
  } else if (articleFeaturedImage) {
    ogImageUrl = articleFeaturedImage;
  } else {
    const freeImage = await withTimeout(getFreeImageForArticleServer({
      title: article.title,
      excerpt: article.excerpt || undefined,
      category: article.category || undefined,
      content: article.content || undefined,
    }), 1500, null);
    if (freeImage) {
      ogImageUrl = freeImage;
    }
  }

  // Extract clean description (use normalized metadata)
  const description = normalized.meta_description || 
    normalized.excerpt || 
    normalized.content.substring(0, 160).replace(/<[^>]*>/g, '').trim();
  
  const keywords = article.tags?.join(', ') || 
    article.keywords?.join(', ') || 
    'karasu emlak, gayrimenkul, ev satın alma';
  
  const author = article.author || 'Karasu Emlak';

  // Get lastModified date for content freshness
  const lastModified = await getLastModified(
    'article',
    slug,
    article.updated_at || article.published_at
  );
  const lastModifiedMeta = generateLastModifiedMeta(lastModified);

  return {
    title: article.title, // Template will add site name automatically
    description,
    keywords,
    authors: [{ name: author }],
    ...lastModifiedMeta,
    alternates: {
      canonical: articleUrl,
      languages: {
        tr: `/blog/${slug}`,
        en: `/en/blog/${slug}`,
        et: `/et/blog/${slug}`,
        ru: `/ru/blog/${slug}`,
        ar: `/ar/blog/${slug}`,
      },
    },
    openGraph: {
      title: article.title,
      description: article.excerpt || description,
      url: articleUrl,
      siteName: 'Karasu Emlak',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: generateBlogImageAlt(article.title, article.category || undefined, 'Karasu'),
        },
      ],
      type: 'article',
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at || undefined,
      authors: [author],
      section: article.category || 'Emlak',
      tags: article.tags || [],
      locale: locale === 'tr' ? 'tr_TR' : locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || description,
      images: [ogImageUrl],
      creator: '@karasuemlak',
    },
    robots: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    other: {
      'article:author': author,
      'article:published_time': article.published_at || '',
      'article:modified_time': article.updated_at || article.published_at || '',
      'article:section': article.category || 'Emlak',
      'article:tag': article.tags?.join(',') || '',
    },
  };
}

/**
 * Blog Detail Page Component
 * 
 * Features:
 * - Server-side rendering with ISR
 * - Comprehensive SEO with structured data
 * - Optimized image loading
 * - Related articles and navigation
 * - FAQ integration
 * - Analytics tracking
 */
export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  // Fetch article with timeout
  const rawArticle = await withTimeout(getArticleBySlug(slug), 3000, null);

  if (!rawArticle) {
    notFound();
  }

  // Normalize legacy articles - fix missing fields and format issues
  const isLegacy = isLegacyArticle(rawArticle);
  const normalized = normalizeArticleMetadata(
    { ...rawArticle, title: rawArticle.title },
    {
      sanitize: true,
      clean: true,
      checkQuality: process.env.NODE_ENV === 'development',
    }
  );
  
  // Merge normalized metadata with original article
  const article: Article = {
    ...rawArticle,
    ...normalized,
  } as Article;

  // Debug: Log legacy article status in development
  if (process.env.NODE_ENV === 'development' && isLegacy) {
    console.warn(`[Blog Detail] Legacy article detected: "${article.title}". Normalized content and metadata.`);
  }

  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  const articleUrl = `${siteConfig.url}${basePath}/blog/${slug}`;

  // Parallel data fetching for optimal performance
  // Get intelligent recommendations
  const [relatedArticles, adjacentArticles] = await Promise.all([
    withTimeout(getRelatedArticles(article, 6), 2000, []),
    withTimeout(getAdjacentArticles(article.id, article.published_at), 2000, { 
      previous: null, 
      next: null 
    }),
  ]);

  // Optimize featured image with robust fallback chain (use normalized featured_image)
  let imageUrl: string | null = null;
  let imageType: 'cloudinary' | 'external' = 'cloudinary';

  const featuredImage = article.featured_image || normalized.featured_image;

  // Step 1: Try Cloudinary image if valid public_id
  if (featuredImage && isValidCloudinaryId(featuredImage)) {
    try {
      imageUrl = getOptimizedCloudinaryUrl(featuredImage, {
        width: 1400,
        height: 800,
        quality: 90,
        format: 'auto',
        crop: 'fill',
      });
      if (imageUrl && imageUrl.trim() !== '') {
        imageType = 'cloudinary';
      } else {
        imageUrl = null;
      }
    } catch (error) {
      console.warn('[Blog Detail] Failed to generate Cloudinary URL:', error);
      imageUrl = null;
    }
  }
  
  // Step 2: If no Cloudinary image, try external URL validation
  if (!imageUrl && featuredImage) {
    const url = featuredImage.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      try {
        new URL(url);
        imageUrl = url;
        imageType = 'external';
      } catch {
        imageUrl = null;
      }
    }
  }
  
  // Step 3: If still no image, try free image service
  if (!imageUrl) {
    try {
      const freeImage = await withTimeout(getFreeImageForArticleServer(article), 3000, null);
      if (freeImage && freeImage.trim() !== '' && freeImage.startsWith('http')) {
        imageUrl = freeImage;
        imageType = 'external';
      }
    } catch (error) {
      console.warn('[Blog Detail] Failed to get free image:', error);
    }
  }
  
  // Step 4: Final fallback - use placeholder (will be handled by ArticleHero component)
  // imageUrl remains null, ArticleHero will handle the fallback

  // Fetch FAQs based on article content (optional, non-blocking)
  let faqs: Array<{ question: string; answer: string }> = [];
  try {
    const isKarasu =
      article.title.toLowerCase().includes('karasu') ||
      article.content?.toLowerCase().includes('karasu');
    const isKocaali =
      article.title.toLowerCase().includes('kocaali') ||
      article.content?.toLowerCase().includes('kocaali');

    if (isKarasu || isKocaali) {
      const region = isKarasu ? 'karasu' : 'kocaali';

      // AI-generated questions (preferred)
      try {
        const aiQuestions = await withTimeout(
          getAIQuestionsForPage(article.slug, region, 'blog'),
          2000,
          []
        );
        if (aiQuestions && aiQuestions.length > 0) {
          faqs.push(
            ...aiQuestions.map((q) => ({
              question: q.question,
              answer: q.answer,
            }))
          );
        }
      } catch {
        // Continue to legacy QA entries
      }

      // Legacy QA entries as fallback
      const existingQuestions = new Set(faqs.map((f) => f.question.toLowerCase()));
      const qaEntries = await withTimeout(getQAEntries(region, 'high'), 2000, []);
      if (qaEntries && qaEntries.length > 0) {
        qaEntries.forEach((qa) => {
          if (!existingQuestions.has(qa.question.toLowerCase()) && faqs.length < 6) {
            faqs.push({
              question: qa.question,
              answer: qa.answer,
            });
          }
        });
      }
    }
  } catch (error) {
    // FAQs are optional, continue without them
    console.warn('[Blog Detail] Failed to fetch FAQs:', error);
  }

  // Calculate reading metrics (use normalized content)
  const readingTime = calculateReadingTime(normalized.content);
  const wordCount = normalized.content
    .replace(/<[^>]*>/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const contextualLinks = generateContextualLinks({ content: normalized.content, basePath });

  // Generate comprehensive structured data for SEO (use normalized metadata)
  const articleSchema = generateBlogArticleSchema({
    title: article.title,
    description: normalized.meta_description,
    excerpt: normalized.excerpt,
    content: normalized.content,
    slug: article.slug,
    author: article.author,
    author_data: (article as any).author_data || undefined,
    publishedAt: article.published_at,
    updatedAt: article.updated_at,
    imageUrl,
    category: article.category,
    tags: article.tags,
    wordCount,
    readingTime,
  });

  const breadcrumbsForSchema = [
    { name: 'Ana Sayfa', url: siteConfig.url },
    { name: 'Blog', url: `${siteConfig.url}${basePath}/blog` },
    ...(article.category
      ? [
          {
            name: article.category,
            url: `${siteConfig.url}${basePath}/blog/kategori/${article.category.toLowerCase().replace(/\s+/g, '-')}`,
          },
        ]
      : []),
    { name: article.title, url: articleUrl },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbsForSchema);
  const faqSchema = faqs.length > 0 ? generateFAQPageSchema(faqs) : null;
  const webPageSchema = generateWebPageSchema({
    title: article.title,
    description: normalized.meta_description || normalized.excerpt || '',
    url: articleUrl,
    datePublished: article.published_at,
    dateModified: article.updated_at,
  });
  // Generate Related Articles schema
  const relatedArticlesSchema = relatedArticles && relatedArticles.length > 0
    ? generateRelatedArticlesSchema(relatedArticles, `${siteConfig.url}${basePath}`)
    : null;

  return (
    <>
      {/* Structured Data for SEO */}
      <StructuredData data={articleSchema} />
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={webPageSchema} />
      {/* Organization schema is handled by layout */}
      {faqSchema && <StructuredData data={faqSchema} />}
      {relatedArticlesSchema && <StructuredData data={relatedArticlesSchema} />}

      {/* Reading Progress Bar */}
      <ReadingProgress />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts basePath={basePath} articleId={article.id} />

      {/* AI Checker Badge - Admin Only (Hidden from public) */}
      {process.env.NODE_ENV === 'development' && (
        <AICheckerBadge
          content={normalized.content}
          title={article.title}
          position="top-right"
        />
      )}

      {/* Analytics */}
      <ArticleAnalytics
        event={{
          articleId: article.id,
          articleSlug: article.slug,
          articleTitle: article.title,
          category: article.category || undefined,
          readingTime,
          wordCount,
        }}
      />


      {/* Main Article Layout - Premium Editorial */}
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Article Container - Centered, Max Width 1400px */}
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-12 lg:py-16 max-w-[1400px]">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,900px)_380px] gap-10 lg:gap-16">
            {/* Main Content Column - Flexible Width for Optimal Reading */}
            <main className="min-w-0 w-full" id="main-content">
              {/* Hero Section */}
              <ArticleHero
                article={{
                  title: article.title,
                  excerpt: normalized.excerpt,
                  author: normalized.author,
                  published_at: article.published_at,
                  updated_at: article.updated_at,
                  category: normalized.category,
                  featured_image: normalized.featured_image,
                }}
                imageUrl={imageUrl}
                imageType={imageType}
                readingTime={readingTime}
                basePath={basePath}
              />

              {/* AI Checker - Admin Only (Hidden from public) */}
              {process.env.NODE_ENV === 'development' && (
                <div id="ai-checker" className="mb-8">
                  <AIChecker
                    content={normalized.content}
                    title={article.title}
                    contentType="blog"
                    showDetails={true}
                  />
                </div>
              )}

              {/* Article Body - Clean, No Nested Container */}
              <ArticleBody
                article={{
                  id: article.id,
                  title: article.title,
                  slug: article.slug,
                  content: normalized.content,
                  excerpt: normalized.excerpt,
                  meta_description: normalized.meta_description,
                  tags: normalized.tags,
                  author: normalized.author,
                  published_at: article.published_at,
                  author_data: (article as any).author_data || undefined,
                } as any}
                basePath={basePath}
                locale={locale}
                faqs={faqs}
                readingTime={readingTime}
                wordCount={wordCount}
                contextualLinks={contextualLinks}
              />

              {/* Article Navigation */}
              {adjacentArticles && (adjacentArticles.previous || adjacentArticles.next) && (
                <div className="mt-16 pt-10 border-t-2 border-gray-200 dark:border-gray-700">
                  <Suspense fallback={null}>
                    <ArticleNavigation
                      previousArticle={adjacentArticles.previous}
                      nextArticle={adjacentArticles.next}
                      basePath={basePath}
                    />
                  </Suspense>
                </div>
              )}
            </main>

            {/* Sidebar - Desktop Only, Sticky */}
            <aside className="hidden lg:block" aria-label="Makale yan menüsü">
              <ArticleSidebar
                basePath={basePath}
                article={{
                  id: article.id,
                  title: article.title,
                  content: article.content,
                  category: article.category,
                  published_at: article.published_at,
                }}
                readingTime={readingTime}
                wordCount={wordCount}
                relatedArticles={relatedArticles || []}
                contextualLinks={contextualLinks}
              />
            </aside>
          </div>

          {/* Enhanced Related Articles Footer */}
          {relatedArticles && relatedArticles.length > 0 && (
            <div className="mt-20 pt-12 border-t-2 border-gray-200 dark:border-gray-700">
              <Suspense
                fallback={
                  <div className="py-8">
                    <div className="h-8 w-48 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                      ))}
                    </div>
                  </div>
                }
              >
                <ArticleFooter
                  relatedArticles={relatedArticles}
                  currentArticleId={article.id}
                  basePath={basePath}
                />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
