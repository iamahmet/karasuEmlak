import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';

export const dynamic = 'force-dynamic';
import { routing } from '@/i18n/routing';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { Calendar, User, ExternalLink, TrendingUp, MapPin, Home } from 'lucide-react';
import { getNewsArticles } from '@/lib/supabase/queries';
import { getLatestGundemArticles } from '@/lib/rss/gundem-parser';
import { enhanceArticleSEO } from '@/lib/rss/gundem-integration';
import { generateSlug } from '@/lib/utils';
import { CardImage, ExternalImage } from '@/components/images';
import { withTimeout } from '@/lib/utils/timeout';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import dynamicImport from 'next/dynamic';

const ScrollReveal = dynamicImport(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
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
  const canonicalPath = locale === routing.defaultLocale ? '/haberler/karasu-emlak' : `/${locale}/haberler/karasu-emlak`;
  
  return {
    title: 'Karasu Emlak Haberleri | Güncel Emlak Gündemi | Karasu Emlak',
    description: 'Karasu emlak piyasası, yeni projeler, altyapı gelişmeleri ve emlak sektöründen güncel haberler. Karasu Gündem kaynaklı, emlak odaklı haberler.',
    keywords: [
      'karasu emlak haberleri',
      'karasu emlak gündemi',
      'karasu emlak piyasası',
      'karasu yeni projeler',
      'karasu altyapı gelişmeleri',
      'karasu emlak sektörü',
    ],
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': '/haberler/karasu-emlak',
        'en': '/en/haberler/karasu-emlak',
        'et': '/et/haberler/karasu-emlak',
        'ru': '/ru/haberler/karasu-emlak',
        'ar': '/ar/haberler/karasu-emlak',
      },
    },
    openGraph: {
      title: 'Karasu Emlak Haberleri | Güncel Emlak Gündemi',
      description: 'Karasu emlak piyasası ve sektöründen güncel haberler.',
      url: `${siteConfig.url}${canonicalPath}`,
      type: 'website',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Emlak Haberleri',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Karasu Emlak Haberleri',
      description: 'Karasu emlak piyasası ve sektöründen güncel haberler.',
    },
  };
}

export default async function KarasuEmlakNewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page = '1' } = await searchParams;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  const currentPage = parseInt(page, 10) || 1;
  const limit = 12;
  const offset = (currentPage - 1) * limit;
  
  // Fetch news articles from Supabase (real estate focused)
  const { articles, total } = await getNewsArticles(limit, offset);
  
  // Fetch Karasu Gündem articles (with timeout, graceful degradation)
  const gundemArticlesResult = await withTimeout(
    getLatestGundemArticles(20),
    3000,
    []
  );
  const gundemArticles = gundemArticlesResult || [];
  
  // Enhance Gündem articles with SEO metadata
  const enhancedGundemArticles = gundemArticles.map(article => 
    enhanceArticleSEO(article, siteConfig.url)
  );
  
  // Filter only real estate related articles from Gündem
  const realEstateGundemArticles = enhancedGundemArticles.filter(
    article => article.isRealEstateRelated
  );

  const totalPages = Math.ceil(total / limit);

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'Ana Sayfa', url: `${siteConfig.url}${basePath}/` },
      { name: 'Haberler', url: `${siteConfig.url}${basePath}/haberler` },
      { name: 'Karasu Emlak Haberleri', url: `${siteConfig.url}${basePath}/haberler/karasu-emlak` },
    ],
    `${siteConfig.url}${basePath}/haberler/karasu-emlak`
  );

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
          items={[
            { label: 'Haberler', href: `${basePath}/haberler` },
            { label: 'Karasu Emlak Haberleri' },
          ]}
          className="mb-6"
        />

        {/* Page Header */}
        <div className="mb-12">
          <ScrollReveal direction="up" delay={0}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Karasu Emlak Haberleri</h1>
            <p className="text-lg text-muted-foreground mb-4 max-w-3xl">
              Karasu emlak piyasası, yeni projeler, altyapı gelişmeleri ve emlak sektöründen güncel haberler. 
              Karasu Gündem kaynaklı, emlak odaklı haberler.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Kaynak:</span>
              <a 
                href="https://karasugundem.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium flex items-center gap-1.5 transition-colors"
              >
                Karasu Gündem
                <ExternalLink className="h-3.5 w-3.5 stroke-[1.5]" />
              </a>
            </div>
          </ScrollReveal>
        </div>

        {/* Quick Links to Hubs */}
        <div className="mb-12">
          <ScrollReveal direction="up" delay={100}>
            <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">İlgili Rehberler</h2>
              <div className="flex flex-wrap gap-3">
                <Link href={`${basePath}/karasu-satilik-ev`}>
                  <Button variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Karasu Satılık Ev
                  </Button>
                </Link>
                <Link href={`${basePath}/kocaali-satilik-ev`}>
                  <Button variant="outline" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Kocaali Satılık Ev
                  </Button>
                </Link>
                <Link href={`${basePath}/karasu-yatirimlik-gayrimenkul`}>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Yatırımlık Gayrimenkul
                  </Button>
                </Link>
                <Link href={`${basePath}/karasu-satilik-ev-fiyatlari`}>
                  <Button variant="outline" size="sm">
                    Fiyat Analizi
                  </Button>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Karasu Gündem Real Estate Articles */}
        {realEstateGundemArticles.length > 0 && (
          <div className="mb-12">
            <ScrollReveal direction="up" delay={0}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Karasu Gündem'den Emlak Haberleri</h2>
                  <p className="text-sm text-muted-foreground">
                    Karasu Gündem sitesinden emlak ile ilgili güncel haberler
                  </p>
                </div>
                <a 
                  href="https://karasugundem.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm font-medium flex items-center gap-1.5 transition-colors"
                >
                  Tüm Haberler
                  <ExternalLink className="h-4 w-4 stroke-[1.5]" />
                </a>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {realEstateGundemArticles.slice(0, 9).map((article, index) => (
                <ScrollReveal key={article.guid || article.slug} direction="up" delay={index * 50}>
                  <a 
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border rounded-xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
                  >
                    <article>
                      <div className="h-48 bg-muted relative overflow-hidden">
                        {article.image ? (
                          <ExternalImage
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">Görsel yok</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-primary/90 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold backdrop-blur-sm shadow-lg">
                          Karasu Gündem
                        </div>
                      </div>
                      <div className="p-6">
                        <h2 className="text-[17px] font-semibold mb-2 line-clamp-2 text-gray-900 tracking-[-0.022em]">{article.title}</h2>
                        <p className="text-[13px] text-muted-foreground mb-4 line-clamp-2 tracking-[-0.01em]">
                          {article.description || 'Devamını okumak için tıklayın...'}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5" />
                            <span>{article.author || 'Karasu Gündem'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {new Date(article.pubDate).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                        </div>
                        {article.relatedNeighborhoods && article.relatedNeighborhoods.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex flex-wrap gap-1.5">
                              {article.relatedNeighborhoods.slice(0, 3).map((neighborhood) => (
                                <Link 
                                  key={neighborhood}
                                  href={`${basePath}/mahalle/${generateSlug(neighborhood)}`}
                                  className="text-[11px] text-primary hover:text-primary/80 font-medium"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  #{neighborhood}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  </a>
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}

        {/* Our News Articles */}
        {articles.length > 0 && (
          <>
            <ScrollReveal direction="up" delay={0}>
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Karasu Emlak Haberleri</h2>
                <p className="text-sm text-muted-foreground">
                  Emlak odaklı, yeniden yazılmış ve genişletilmiş haberler
                </p>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {articles.map((article, index) => (
                <ScrollReveal key={article.id} direction="up" delay={index * 50}>
                  <Link href={`${basePath}/haberler/${article.slug}`}>
                    <article className="border rounded-xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                      <div className="h-48 bg-muted relative">
                        {article.cover_image ? (
                          <CardImage
                            publicId={article.cover_image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">Görsel yok</span>
                          </div>
                        )}
                        {article.featured && (
                          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold backdrop-blur-sm shadow-lg">
                            ⭐ Öne Çıkan
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h2 className="text-[17px] font-semibold mb-2 line-clamp-2 text-gray-900 tracking-[-0.022em]">{article.title}</h2>
                        <p className="text-[13px] text-muted-foreground mb-4 line-clamp-2 tracking-[-0.01em] flex-1">
                          {article.original_summary || article.seo_description || 'Devamını okumak için tıklayın...'}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5" />
                            <span>Karasu Emlak</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              {article.published_at 
                                ? new Date(article.published_at).toLocaleDateString('tr-TR')
                                : new Date(article.created_at).toLocaleDateString('tr-TR')
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </ScrollReveal>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <Link href={`${basePath}/haberler/karasu-emlak${currentPage > 1 ? `?page=${currentPage - 1}` : ''}`}>
                    <Button variant="outline" disabled={currentPage === 1}>Önceki</Button>
                  </Link>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNum > totalPages) return null;
                    return (
                      <Link key={pageNum} href={`${basePath}/haberler/karasu-emlak?page=${pageNum}`}>
                        <Button variant={currentPage === pageNum ? 'default' : 'outline'}>
                          {pageNum}
                        </Button>
                      </Link>
                    );
                  })}
                  <Link href={`${basePath}/haberler/karasu-emlak?page=${currentPage + 1}`}>
                    <Button variant="outline" disabled={currentPage >= totalPages}>Sonraki</Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {articles.length === 0 && realEstateGundemArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Henüz haber bulunmuyor.
            </p>
            <Link href={`${basePath}/haberler`}>
              <Button variant="outline">Tüm Haberlere Git</Button>
            </Link>
          </div>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-12 rounded-xl">
          <div className="container mx-auto px-4 text-center">
            <ScrollReveal direction="up" delay={0}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Karasu Emlak Haberlerini Takip Edin
              </h2>
              <p className="text-base md:text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
                Karasu emlak piyasası ve sektöründen güncel haberler için bizi takip edin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`${basePath}/karasu-satilik-ev`}>
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                    <Home className="w-5 h-5 mr-2" />
                    Karasu Satılık Ev
                  </Button>
                </Link>
                <Link href={`${basePath}/haberler`}>
                  <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                    Tüm Haberler
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </>
  );
}
