import { Button } from '@karasu/ui';
import Link from 'next/link';
import { routing } from '@/i18n/routing';
import { MapPin, FileText, BookOpen, TrendingUp, Search, BarChart3, Users, Calendar } from 'lucide-react';
import { getArticles } from '@/lib/supabase/queries';
import { getNewsArticles } from '@/lib/supabase/queries/news';
import { getLatestGundemArticles } from '@/lib/rss/gundem-parser';
import { enhanceArticleSEO } from '@/lib/rss/gundem-integration';
import { ArticleCard } from '@/components/blog/ArticleCard';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { getBlogCategories, getPopularArticles } from '@/lib/supabase/queries/blog-sidebar';
import { getPopularTags } from '@/lib/supabase/queries/blog-tags';
import { siteConfig } from '@karasu-emlak/config';
import { withTimeout } from '@/lib/utils/timeout';
import type { Metadata } from 'next';
import { BlogPageHero } from '@/components/blog/BlogPageHero';
import { BlogCategoriesSection } from '@/components/blog/BlogCategoriesSection';
import { BlogSearch } from '@/components/blog/BlogSearch';
import { BlogNewsletterSection } from '@/components/blog/BlogNewsletterSection';
import { BlogTagsSection } from '@/components/blog/BlogTagsSection';
import { BlogFilters } from '@/components/blog/BlogFilters';
import { NewsCard } from '@/components/blog/NewsCard';
import { PageIntro, RelatedContent } from '@/components/content';
import { getNeighborhoods } from '@/lib/supabase/queries';
import { generateSlug } from '@/lib/utils';
import { getQAEntries } from '@/lib/supabase/queries/qa';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { generateBlogCollectionPageSchema } from '@/lib/seo/blog-structured-data';
import dynamicImport from 'next/dynamic';

export const revalidate = 3600; // Revalidate every hour

const TrustSignalsBarDynamic = dynamicImport(() => import('@/components/trust/TrustSignalsBar').then(mod => ({ default: mod.TrustSignalsBar })), {
  loading: () => <div className="h-16 bg-white animate-pulse" />,
});

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalPath = locale === routing.defaultLocale ? '/blog' : `/${locale}/blog`;
  
  return {
    title: 'Blog | Emlak Rehberleri ve Yatırım Analizleri', // Template will add site name automatically
    description: 'Karasu emlak blog: Emlak alım-satım rehberleri, yatırım analizleri, mahalle rehberleri ve piyasa trendleri. Uzman görüşleri ve güncel içerikler ile emlak yatırımınızı bilinçli yapın.',
    keywords: [
      'karasu emlak blog',
      'karasu yatırım rehberi',
      'karasu emlak analizi',
      'karasu mahalle rehberi',
      'emlak alım satım rehberi',
      'karasu piyasa analizi',
      'sakarya emlak blog',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: {
        'tr': '/blog',
        'en': '/en/blog',
        'et': '/et/blog',
        'ru': '/ru/blog',
        'ar': '/ar/blog',
      },
    },
    openGraph: {
      title: 'Blog | Karasu Emlak',
      description: 'Emlak, yatırım ve Karasu hakkında güncel içerikler, rehberler ve uzman görüşleri.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Emlak Blog - Emlak Rehberi ve Haberler',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Blog | Karasu Emlak',
      description: 'Emlak, yatırım ve Karasu hakkında güncel içerikler, rehberler ve uzman görüşleri.',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; q?: string; category?: string; sort?: string; tag?: string }>;
}) {
  const { locale } = await params;
  const { page = '1', q, category, sort = 'newest', tag } = await searchParams;
  // Since localePrefix is "as-needed", we don't need /tr prefix for default locale
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;
  
  const currentPage = parseInt(page, 10) || 1;
  const limit = 24; // Increased from 12 to show more articles
  const offset = (currentPage - 1) * limit;
  const searchQuery = q || '';
  
  // Fetch articles from Supabase
  // For news section, we need ALL articles (not paginated) to show as fallback
  let allArticlesForNews: any[] = [];
  let articles: any[] = [];
  let total = 0;
  try {
    // Fetch all articles for news fallback (only on first load, no filters)
    if (!searchQuery && !category && !tag) {
      try {
        const allArticlesResult = await getArticles(50, 0);
        allArticlesForNews = allArticlesResult?.articles || [];
      } catch (error) {
        console.error('[Blog Page] Error fetching all articles for news:', error);
      }
    }
    
    // If search query exists, use search functionality
    if (searchQuery) {
      const { createAnonServerClient } = await import('@/lib/supabase/clients');
      const supabase = await createAnonServerClient();
      
      let query = supabase
        .from('articles')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('[Blog Page] Search error:', error);
        // Fallback to regular getArticles
        const result = await getArticles(limit, offset);
        articles = result?.articles || [];
        total = result?.total || 0;
      } else {
        articles = (data || []) as any[];
        total = count || 0;
      }
    } else {
      // If category filter exists, we need client-side filtering due to normalization
      // Otherwise, use normal server-side pagination for better performance
      if (category) {
        // Apply filters - fetch all articles first, then filter client-side
        // This is necessary because categories in DB may not be normalized
        let result = await getArticles(1000, 0); // Fetch more articles for filtering
        
        // Filter by category (client-side with normalization)
        const { slugToCategoryName, normalizeCategoryName, categoriesMatch } = await import('@/lib/utils/category-utils');
        const categoryName = slugToCategoryName(category);
        const normalizedCategory = normalizeCategoryName(categoryName);
        
        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('[Blog Page] Category filter:', {
            urlCategory: category,
            categoryName,
            normalizedCategory,
            totalBeforeFilter: result.articles.length,
          });
        }
        
        if (normalizedCategory) {
          result.articles = result.articles.filter(article => {
            const articleCategory = normalizeCategoryName(article.category);
            return categoriesMatch(articleCategory, normalizedCategory);
          });
          result.total = result.articles.length;
        }
        
        // Apply sorting
        if (sort === 'popular' || sort === 'views') {
          result.articles = [...result.articles].sort((a, b) => (b.views || 0) - (a.views || 0));
        } else if (sort === 'oldest') {
          result.articles = [...result.articles].sort((a, b) => {
            const dateA = a.published_at ? new Date(a.published_at).getTime() : new Date(a.created_at).getTime();
            const dateB = b.published_at ? new Date(b.published_at).getTime() : new Date(b.created_at).getTime();
            return dateA - dateB;
          });
        }
        // 'newest' is default, already sorted by getArticles

        // Filter by tag if provided
        if (tag) {
          result.articles = result.articles.filter(article => 
            article.tags && Array.isArray(article.tags) && 
            article.tags.some((t: string) => t.toLowerCase().replace(/\s+/g, '-') === tag.toLowerCase())
          );
          result.total = result.articles.length;
        }

        // Apply pagination after filtering
        articles = result.articles.slice(offset, offset + limit);
        total = result.total || 0;
      } else {
        // No category filter - use direct Supabase query for reliability
        // This bypasses getArticles to ensure we get results
        try {
          const { createAnonServerClient } = await import('@/lib/supabase/clients');
          const supabase = await createAnonServerClient();
          
          let query = supabase
            .from('articles')
            .select('*', { count: 'exact' })
            .eq('status', 'published')
            .order('published_at', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false });
          
          // Apply pagination
          query = query.range(offset, offset + limit - 1);
          
          const { data, error, count } = await query;
          
          if (error) {
            console.error('[Blog Page] Direct Supabase query error:', error);
            // Fallback to getArticles
            const result = await getArticles(limit, offset);
            articles = result.articles || [];
            total = result.total || 0;
          } else {
            articles = (data || []) as any[];
            total = count || 0;
          }
          
          // Apply sorting
          if (sort === 'popular' || sort === 'views') {
            articles = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0));
          } else if (sort === 'oldest') {
            articles = [...articles].sort((a, b) => {
              const dateA = a.published_at ? new Date(a.published_at).getTime() : new Date(a.created_at).getTime();
              const dateB = b.published_at ? new Date(b.published_at).getTime() : new Date(b.created_at).getTime();
              return dateA - dateB;
            });
          }
          // 'newest' is default, already sorted

          // Filter by tag if provided
          if (tag) {
            articles = articles.filter(article => 
              article.tags && Array.isArray(article.tags) && 
              article.tags.some((t: string) => t.toLowerCase().replace(/\s+/g, '-') === tag.toLowerCase())
            );
            total = articles.length;
          }
        } catch (error) {
          console.error('[Blog Page] Error fetching articles:', error);
          // Continue with empty articles
          articles = [];
          total = 0;
        }
      }
    }
  } catch (error) {
    console.error('[Blog Page] Error fetching articles:', error);
    // Continue with empty articles
  }
  
  // Fetch sidebar data, neighborhoods, FAQs, and tags
  let categories: any[] = [];
  let popularArticles: any[] = [];
  let neighborhoods: string[] = [];
  let faqs: Array<{ question: string; answer: string }> = [];
  let popularTags: Array<{ name: string; count: number; slug: string }> = [];
  
  try {
    const [categoriesResult, popularArticlesResult, neighborhoodsResult, qaResult, tagsResult] = await Promise.all([
      withTimeout(getBlogCategories(), 2000, []),
      withTimeout(getPopularArticles(5), 2000, []),
      withTimeout(getNeighborhoods(), 2000, [] as string[]),
      withTimeout(getQAEntries('karasu', 'high'), 2000, []),
      withTimeout(getPopularTags(15), 2000, []),
    ]);
    categories = categoriesResult || [];
    popularArticles = popularArticlesResult || [];
    neighborhoods = neighborhoodsResult || [];
    faqs = (qaResult || []).slice(0, 5).map(qa => ({
      question: qa.question,
      answer: qa.answer,
    }));
    popularTags = tagsResult || [];
  } catch (error) {
    console.error('[Blog Page] Error fetching sidebar data:', error);
    // Continue with empty arrays
  }
  
  // Fallback FAQs if none from database
  if (faqs.length === 0) {
    faqs = [
      {
        question: 'Karasu emlak blogunda hangi konular işleniyor?',
        answer: 'Karasu emlak blogunda emlak alım-satım rehberleri, yatırım analizleri, mahalle rehberleri, piyasa trendleri, fiyat analizleri ve bölge gelişmeleri hakkında detaylı içerikler bulunmaktadır.',
      },
      {
        question: 'Blog yazıları ne sıklıkla güncelleniyor?',
        answer: 'Blog yazıları düzenli olarak güncellenmekte ve yeni içerikler eklenmektedir. Emlak piyasasındaki gelişmeler, yeni projeler ve bölge haberleri takip edilerek güncel bilgiler paylaşılmaktadır.',
      },
      {
        question: 'Blog yazılarını nasıl filtreleyebilirim?',
        answer: 'Blog sayfasında kategori filtreleme özelliği bulunmaktadır. Ayrıca arama özelliği ile istediğiniz konu hakkında yazıları bulabilirsiniz.',
      },
    ];
  }
  
  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;
  
  // Fetch real estate news articles (first load - default)
  let realEstateNews: any[] = [];
  try {
    const newsResult = await withTimeout(
      getNewsArticles(6, 0),
      2000,
      { articles: [], total: 0 }
    );
    realEstateNews = newsResult?.articles || [];
  } catch (error) {
    console.error('[Blog Page] Error fetching news:', error);
  }
  
  // Fetch Karasu Gündem articles (with timeout, graceful degradation)
  // Always fetch Gündem articles to show real estate news on first load
  const gundemArticlesResult = await withTimeout(
    getLatestGundemArticles(20),
    3000,
    []
  );
  const gundemArticles = gundemArticlesResult || [];
  
  // Enhance Gündem articles with SEO metadata
  const enhancedGundemArticles = gundemArticles
    .map(article => enhanceArticleSEO(article, siteConfig.url));
  
  // Filter real estate related articles (prioritize these)
  const realEstateGundemArticles = enhancedGundemArticles
    .filter(article => article.isRealEstateRelated)
    .slice(0, 6);
  
  // ALWAYS show news on blog page (as requested: "ilk açılışta emlak ile ilgili haberler")
  // This ensures news section is always populated, regardless of filters
  if (realEstateNews.length === 0) {
    // Try Gündem articles first
    let articlesToUse: any[] = [];
    
    if (realEstateGundemArticles.length > 0) {
      articlesToUse = realEstateGundemArticles;
    } else if (gundemArticles.length > 0) {
      // Use all Gündem articles if no real estate related ones found
      articlesToUse = gundemArticles.slice(0, 6).map(article => enhanceArticleSEO(article, siteConfig.url));
    }
    
    if (articlesToUse.length > 0) {
      realEstateNews = articlesToUse.map((article, idx) => {
        // Use original link directly for Gündem articles
        const externalLink = article.link || '';
        
        return {
          id: `gundem-${idx}-${Date.now()}`,
          title: article.title,
          slug: externalLink, // Use full URL as slug for Gündem articles
          original_summary: article.description || article.content?.substring(0, 200) || '',
          emlak_analysis: article.description || article.content?.substring(0, 200) || '',
          published_at: article.pubDate || new Date().toISOString(),
          source_domain: 'karasugundem.com',
        };
      });
    }
  }
  
  // If still no news from Gündem, use blog articles as fallback
  // This ensures news section always has content (user's requirement)
  if (realEstateNews.length === 0) {
    // Use allArticlesForNews if available (from first load), otherwise use current articles
    const articlesToCheck = allArticlesForNews.length > 0 ? allArticlesForNews : articles;
    
    if (articlesToCheck && articlesToCheck.length > 0) {
      // Filter for "Emlak" category articles first, then show any
      const emlakArticles = articlesToCheck.filter(a => {
        const cat = (a.category || '').toLowerCase();
        const title = (a.title || '').toLowerCase();
        return cat.includes('emlak') || title.includes('emlak') || title.includes('gayrimenkul');
      });
      
      const articlesToShow = emlakArticles.length > 0 ? emlakArticles : articlesToCheck;
      
      realEstateNews = articlesToShow.slice(0, 6).map((article, idx) => ({
        id: article.id || `blog-${idx}`,
        title: article.title,
        slug: article.slug,
        original_summary: article.excerpt || article.meta_description || '',
        emlak_analysis: article.excerpt || article.meta_description || '',
        published_at: article.published_at || article.created_at || new Date().toISOString(),
        source_domain: 'karasuemlak.com',
      }));
    }
  }
  
  // Debug logging (dev only)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Blog Page Debug]', {
      realEstateNewsCount: realEstateNews.length,
      gundemArticlesCount: gundemArticles.length,
      realEstateGundemCount: realEstateGundemArticles.length,
      allArticlesForNewsCount: allArticlesForNews.length,
      articlesCount: articles.length,
      total,
      searchQuery,
      category,
      tag,
      firstArticleTitle: articles[0]?.title || 'none',
    });
  }
  
  
  const totalPages = Math.ceil(total / limit);

  // Get featured articles (first 3) - prioritize articles with featured images
  const articlesWithImages = (articles || []).filter(a => a.featured_image);
  const articlesWithoutImages = (articles || []).filter(a => !a.featured_image);
  
  // Featured: First 3 articles (prefer those with images, but include all if needed)
  const featuredArticles = articles.length > 0 ? [
    ...articlesWithImages.slice(0, 3),
    ...articlesWithoutImages.slice(0, Math.max(0, 3 - articlesWithImages.length))
  ].slice(0, 3).filter(Boolean) : [];
  
  // Latest articles: All remaining articles after featured
  const featuredIds = new Set(featuredArticles.map(a => a.id));
  const latestArticles = (articles || []).filter(a => !featuredIds.has(a.id)).filter(Boolean);
  
  // Additional debug logging after processing (dev only)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Blog Page] After processing:', {
      articlesCount: articles.length,
      featuredArticlesCount: featuredArticles.length,
      latestArticlesCount: latestArticles.length,
      articlesWithImagesCount: articlesWithImages.length,
      articlesWithoutImagesCount: articlesWithoutImages.length,
      willShowEmptyState: articles.length === 0,
    });
  }
  
  // Get popular articles for stats
  const totalViews = (articles || []).reduce((sum, a) => sum + (a.views || 0), 0);

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Blog', href: `${basePath}/blog` },
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `${siteConfig.url}${crumb.href}`,
    })),
  };

  // Generate CollectionPage schema with ItemList for blog articles
  const collectionSchema = generateBlogCollectionPageSchema(
    articles || [],
    `${siteConfig.url}${basePath}`,
    total || 0,
    {
      name: 'Karasu Emlak Blog',
      description: 'Karasu emlak, yatırım ve bölge hakkında güncel haberler, rehberler ve uzman görüşleri.',
    }
  );

  return (
    <div>
      <StructuredData data={breadcrumbSchema} />
      <StructuredData data={collectionSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <BlogPageHero basePath={basePath} />

        {/* Trust Signals Bar */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <TrustSignalsBarDynamic variant="compact" />
        </div>

        <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 max-w-7xl">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbs} className="mb-5" />

          {/* Real Estate News Section - First Load */}
          {/* Always show this section on first load, even if empty initially */}
          <section className="mb-8 bg-gradient-to-br from-blue-50/50 via-white to-primary/5 dark:from-gray-800/50 dark:via-gray-900 dark:to-primary/10 rounded-2xl p-6 md:p-8 border border-primary/10 dark:border-primary/20 shadow-lg">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Emlak Haberleri</h2>
                <p className="text-xs text-gray-600">Güncel emlak haberleri ve gelişmeler</p>
              </div>
            </div>
            {realEstateNews.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {realEstateNews.slice(0, 6).map((news) => (
                    <NewsCard key={news.id} news={news} basePath={basePath} variant="compact" />
                  ))}
                </div>
                {realEstateNews.length > 6 && (
                  <div className="mt-4 text-center">
                    <Link href={`${basePath}/haberler`}>
                      <Button variant="outline" size="sm">
                        Tüm Haberleri Gör ({realEstateNews.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600 mb-3">
                  {!searchQuery && !category && !tag 
                    ? 'Haberler yükleniyor...' 
                    : 'Bu filtre için haber bulunamadı.'}
                </p>
                <Link href={`${basePath}/haberler`}>
                  <Button variant="outline" size="sm">
                    Tüm Haberleri Gör
                  </Button>
                </Link>
              </div>
            )}
          </section>

          {/* Header Section with Stats */}
          <section className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                  Karasu Emlak Blog
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mb-6 leading-relaxed">
                  Karasu ve çevresinde emlak, yatırım, bölge rehberleri ve uzman görüşleri. Satılık ev fiyatları, mahalle analizleri, yatırım ipuçları ve daha fazlası.
                </p>
                
                {/* Stats */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <div className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-base">{total}</span>
                    <span>Yazı</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-base">{categories?.length || 0}</span>
                    <span>Kategori</span>
                  </div>
                  {totalViews > 0 && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="p-1.5 bg-primary/10 rounded-lg">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white text-base">{totalViews.toLocaleString('tr-TR')}</span>
                      <span>Görüntülenme</span>
                    </div>
                  )}
                </div>

                {/* Quick Links */}
                <div className="flex flex-wrap gap-3">
                  <Link href={`${basePath}/karasu-satilik-ev`}>
                    <Button variant="outline" size="sm" className="border-2 hover:border-primary hover:bg-primary/5 transition-all">
                      <MapPin className="h-4 w-4 mr-2" />
                      Karasu Rehberi
                    </Button>
                  </Link>
                  <Link href={`${basePath}/satilik`}>
                    <Button variant="outline" size="sm" className="border-2 hover:border-primary hover:bg-primary/5 transition-all">
                      <FileText className="h-4 w-4 mr-2" />
                      Satılık İlanlar
                    </Button>
                  </Link>
                  <Link href={`${basePath}/rehber/yatirim`}>
                    <Button variant="outline" size="sm" className="border-2 hover:border-primary hover:bg-primary/5 transition-all">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Yatırım Rehberi
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Search Section */}
            <div className="bg-gradient-to-br from-blue-50/90 via-white to-primary/5 dark:from-gray-800/50 dark:via-gray-900 dark:to-primary/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-200/50 dark:border-gray-700/50 mb-8 shadow-lg">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-xl">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Blog Yazılarında Ara</h2>
                </div>
                <BlogSearch basePath={basePath} />
                {searchQuery && (
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-lg px-4 py-2 inline-block">
                    <span>"<strong className="text-gray-900 dark:text-white">{searchQuery}</strong>" için <strong className="text-primary">{total}</strong> sonuç bulundu</span>
                  </div>
                )}
              </div>
            </div>

            {/* Categories Section */}
            {categories && categories.length > 0 && (
              <BlogCategoriesSection 
                categories={categories} 
                basePath={basePath}
              />
            )}

            {/* Seasonal Hub Link (Ramazan 2026) */}
            <div className="mb-6">
              <Link
                href={`${basePath}/blog/ramazan-2026`}
                className="block rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-blue-50/70 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        Ramazan 2026 İçerik Merkezi
                      </h2>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        SEO Hub
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 max-w-3xl">
                      Ramazan ve bayram dönemine özel Karasu rehberleri: kiralık ev arama ipuçları, taşınma checklist’i,
                      sahil akşam planı ve bayram haftası yazlık önerileri.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700">
                        /blog/ramazan-2026
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700">
                        /blog/etiket/ramazan
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Filters Section */}
            <BlogFilters 
              basePath={basePath}
              categories={categories}
              className="mb-6"
            />
          </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 lg:gap-8">
          {/* Main Content */}
          <div>
            {/* Show articles if any exist */}
            {articles.length > 0 ? (
              <>
            {/* Featured Articles Section */}
            {featuredArticles.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl border border-primary/20">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Öne Çıkan Yazılar</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">En popüler içerikler</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {featuredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} basePath={basePath} />
                  ))}
                </div>
              </section>
            )}

            {/* Latest Articles Section */}
            {latestArticles.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <Calendar className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Son Yazılar</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">En yeni blog içerikleri</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {latestArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} basePath={basePath} />
                  ))}
                </div>
              </section>
            )}

            {/* All Articles Section - Show if no featured/latest sections but articles exist */}
            {/* This ensures articles are always shown if they exist, even if featured/latest are empty */}
            {articles.length > 0 && featuredArticles.length === 0 && latestArticles.length === 0 && (
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-xl">
                      <FileText className="h-6 w-6 text-gray-700" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Blog Yazıları</h2>
                      <p className="text-sm text-gray-600 mt-1">Tüm blog içerikleri</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} basePath={basePath} />
                  ))}
                </div>
              </section>
            )}

                {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center gap-2" aria-label="Sayfa navigasyonu">
                  <Link href={`${basePath}/blog${currentPage > 1 ? `?page=${currentPage - 1}` : ''}`}>
                    <Button 
                      variant="outline" 
                      disabled={currentPage === 1}
                      className="px-4 py-2"
                    >
                      Önceki
                    </Button>
                  </Link>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }
                    if (pageNum > totalPages || pageNum < 1) return null;
                    return (
                      <Link key={pageNum} href={`${basePath}/blog?page=${pageNum}`}>
                        <Button 
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          className="min-w-[44px]"
                        >
                          {pageNum}
                        </Button>
                      </Link>
                    );
                  })}
                  <Link href={`${basePath}/blog?page=${currentPage + 1}`}>
                    <Button 
                      variant="outline" 
                      disabled={currentPage >= totalPages}
                      className="px-4 py-2"
                    >
                      Sonraki
                    </Button>
                  </Link>
                </nav>
                <div className="mt-4 text-center text-sm text-gray-600">
                  Sayfa {currentPage} / {totalPages}
                </div>
              </div>
              )}

                {/* Related Neighborhoods */}
                {neighborhoods && neighborhoods.length > 0 && (
                  <section className="mt-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border-2 border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">Popüler Mahalleler</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {neighborhoods.slice(0, 6).map((neighborhood) => (
                        <Link
                          key={neighborhood}
                          href={`${basePath}/mahalle/${generateSlug(neighborhood)}`}
                          className="bg-white rounded-lg p-3 border border-gray-200 hover:border-primary hover:shadow-md transition-all text-center"
                        >
                          <span className="text-xs font-semibold text-gray-900">{neighborhood}</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

              {/* Popular Tags Section */}
              {popularTags.length > 0 && (
                <BlogTagsSection tags={popularTags} basePath={basePath} className="mt-8" />
              )}

              {/* Newsletter Section */}
              <BlogNewsletterSection className="mt-8" />

              {/* FAQ Section */}
              {faqs.length > 0 && (
                <section className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
                  <h2 className="text-xl font-bold mb-5 text-gray-900">Sık Sorulan Sorular</h2>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <details key={index} className="group bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary transition-colors">
                        <summary className="cursor-pointer font-semibold text-gray-900 pr-8 group-hover:text-primary transition-colors">
                          {faq.question}
                        </summary>
                        <p className="mt-3 text-gray-700 leading-relaxed pl-4 border-l-2 border-primary/20">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              )}

                {/* Related Guides Section */}
                <section className="mt-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">İlgili Rehberler</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Link href={`${basePath}/rehber/yatirim`} className="group border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Yatırım Rehberi</h3>
                      </div>
                      <p className="text-xs text-gray-600">Emlak yatırım stratejileri</p>
                    </Link>
                    <Link href={`${basePath}/rehber/emlak-alim-satim`} className="group border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Alım-Satım</h3>
                      </div>
                      <p className="text-xs text-gray-600">Ev alma ve satma süreci</p>
                    </Link>
                    <Link href={`${basePath}/karasu-emlak-rehberi`} className="group border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Karasu Rehberi</h3>
                      </div>
                      <p className="text-xs text-gray-600">Karasu emlak rehberi</p>
                    </Link>
                    <Link href={`${basePath}/rehber`} className="group border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Tüm Rehberler</h3>
                      </div>
                      <p className="text-xs text-gray-600">Tüm emlak rehberleri</p>
                    </Link>
                  </div>
                </section>
              </>
            ) : (
              // Only show empty state if there are truly no articles
              <div className="text-center py-16 md:py-24">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Henüz blog yazısı bulunmuyor</h3>
                <p className="text-gray-600 mb-6">Yakında yeni içerikler eklenecek.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href={`${basePath}/rehber`}>
                    <Button variant="outline">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Rehberlere Göz At
                    </Button>
                  </Link>
                  <Link href={`${basePath}/satilik`}>
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Satılık İlanlar
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <BlogSidebar
              basePath={basePath}
              categories={categories || []}
              popularArticles={popularArticles || []}
            />
          </aside>
        </div>
      </div>
    </div>
    </div>
  );
}
