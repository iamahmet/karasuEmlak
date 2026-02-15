import { Button } from '@karasu/ui';
import Link from 'next/link';
import { routing } from '@/i18n/routing';
import { Calendar, User, ExternalLink, MapPin, FileText } from 'lucide-react';
import type { Metadata } from 'next';

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
export const revalidate = 1800; // Revalidate every 30 minutes (news changes frequently)
import { getNewsArticles } from '@/lib/supabase/queries';
import { getLatestGundemArticles } from '@/lib/rss/gundem-parser';
import { enhanceArticleSEO } from '@/lib/rss/gundem-integration';
import { CardImage, ExternalImage } from '@/components/images';
import { siteConfig } from '@karasu-emlak/config';
import { withTimeout } from '@/lib/utils/timeout';
import { PageIntro, RelatedContent } from '@/components/content';
import { getNeighborhoods } from '@/lib/supabase/queries';
import { generateSlug } from '@/lib/utils';
import { getQAEntries } from '@/lib/supabase/queries/qa';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { StructuredData } from '@/components/seo/StructuredData';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const sp = (await searchParams) ?? {};
  const pageNum = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const canonicalBasePath = locale === routing.defaultLocale ? '/haberler' : `/${locale}/haberler`;
  const canonicalPath = pageNum > 1 ? `${canonicalBasePath}?page=${pageNum}` : canonicalBasePath;
  const titleSuffix = pageNum > 1 ? ` (Sayfa ${pageNum})` : '';
  
  return {
    title: `Haberler | Karasu Emlak | Güncel Emlak Haberleri ve Piyasa Analizleri${titleSuffix}`,
    description: 'Karasu emlak haberleri: Güncel piyasa analizleri, yeni projeler, bölge gelişmeleri ve yatırım haberleri. Emlak sektöründeki son gelişmeleri takip edin.',
    keywords: [
      'karasu emlak haberleri',
      'karasu piyasa haberleri',
      'sakarya emlak haberleri',
      'emlak sektör haberleri',
      'karasu yatırım haberleri',
      'bölge gelişmeleri',
    ],
    alternates: {
      canonical: `${siteConfig.url}${canonicalPath}`,
      languages: pruneHreflangLanguages({
        'tr': pageNum > 1 ? `/haberler?page=${pageNum}` : '/haberler',
        'en': '/en/haberler',
        'et': '/et/haberler',
        'ru': '/ru/haberler',
        'ar': '/ar/haberler',
      }),
    },
    openGraph: {
      title: 'Haberler | Karasu Emlak',
      description: 'Karasu ve çevresinden emlak sektörü, yatırım, bölge gelişmeleri ve piyasa haberleri.',
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
      title: 'Haberler | Karasu Emlak',
      description: 'Karasu ve çevresinden emlak sektörü, yatırım, bölge gelişmeleri ve piyasa haberleri.',
      images: [`${siteConfig.url}/og-image.jpg`],
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

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page = '1' } = await searchParams;
  // Since localePrefix is "as-needed", we don't need /tr prefix for default locale
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;
  
  const currentPage = parseInt(page, 10) || 1;
  const limit = 24; // Increased from 12 to show more news
  const offset = (currentPage - 1) * limit;
  
  // Fetch news articles from Supabase
  const { articles, total } = await getNewsArticles(limit, offset);
  
  // Fetch Karasu Gündem articles (with timeout, graceful degradation)
  const gundemArticlesResult = await withTimeout(
    getLatestGundemArticles(6),
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

  // Fetch neighborhoods and FAQs for related content
  const neighborhoods = await withTimeout(getNeighborhoods(), 2000, [] as string[]);
  const qaEntries = await withTimeout(getQAEntries('karasu', 'high'), 2000, []);
  const faqs = (qaEntries || []).slice(0, 5).map(qa => ({
    question: qa.question,
    answer: qa.answer,
  }));
  
  // Fallback FAQs
  if (faqs.length === 0) {
    faqs.push(
      {
        question: 'Karasu emlak haberleri nereden geliyor?',
        answer: 'Karasu emlak haberleri hem kendi haberlerimizden hem de Karasu Gündem gibi güvenilir kaynaklardan derlenmektedir. Emlak sektörü, yatırım ve bölge gelişmeleri hakkında güncel bilgiler paylaşılmaktadır.',
      },
      {
        question: 'Haberler ne sıklıkla güncelleniyor?',
        answer: 'Haberler düzenli olarak güncellenmekte ve yeni içerikler eklenmektedir. Emlak piyasasındaki önemli gelişmeler, yeni projeler ve bölge haberleri takip edilerek paylaşılmaktadır.',
      }
    );
  }
  
  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section with H1 */}
        <section className="mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            Karasu Emlak Haberleri
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mb-6">
            Karasu ve çevresinden emlak sektörü, yatırım, bölge gelişmeleri ve piyasa haberleri. Güncel emlak trendleri, yeni projeler ve bölge analizleri.
          </p>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{total}</span>
              <span>Haber</span>
            </div>
          </div>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <span className="text-sm text-gray-600">Kaynak:</span>
          <a 
            href="https://karasugundem.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#006AFF] hover:text-[#0052CC] font-medium flex items-center gap-1.5 transition-colors text-sm"
          >
            Karasu Gündem
            <ExternalLink className="h-3.5 w-3.5 stroke-[1.5]" />
          </a>
          <span className="text-gray-400">•</span>
          <Link href={`${basePath}/blog`}>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Blog Yazıları
            </Button>
          </Link>
          <Link href={`${basePath}/karasu`}>
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Karasu Rehberi
            </Button>
          </Link>
        </div>
        </section>

      {/* Karasu Gündem Real Estate Articles */}
      {realEstateGundemArticles.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Karasu Gündem'den Emlak Haberleri</h2>
              <p className="text-sm text-muted-foreground">
                Karasu Gündem sitesinden emlak ile ilgili güncel haberler
              </p>
            </div>
            <a 
              href="https://karasugundem.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#006AFF] hover:text-[#0052CC] text-sm font-medium flex items-center gap-1.5 transition-colors"
            >
              Tüm Haberler
              <ExternalLink className="h-4 w-4 stroke-[1.5]" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {realEstateGundemArticles.slice(0, 6).map((article) => {
              return (
                <a 
                  key={article.guid || article.slug} 
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border rounded-xl overflow-hidden hover:shadow-xl hover:border-[#006AFF]/30 transition-all duration-300 hover:-translate-y-1"
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
                        <div className="w-full h-full bg-gradient-to-br from-[#006AFF]/10 to-[#00A862]/10 flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">Görsel yok</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-[#006AFF]/90 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold backdrop-blur-sm shadow-lg">
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
                              <a 
                                key={neighborhood}
                                href={`${basePath}/karasu/${neighborhood}`}
                                className="text-[11px] text-[#006AFF] hover:text-[#0052CC] font-medium"
                              >
                                #{neighborhood}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Our News Articles */}
      {articles.length > 0 && (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Karasu Emlak Haberleri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                return (
                  <a key={article.id} href={`${basePath}/haberler/${article.slug}`} className="block">
                    <article className="border rounded-xl overflow-hidden hover:shadow-xl hover:border-[#006AFF]/30 transition-all duration-300 hover:-translate-y-1">
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
                      <div className="p-6">
                        <h2 className="text-[17px] font-semibold mb-2 line-clamp-2 text-gray-900 tracking-[-0.022em]">{article.title}</h2>
                        <p className="text-[13px] text-muted-foreground mb-4 line-clamp-2 tracking-[-0.01em]">
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
                  </a>
                );
              })}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                <a href={`${basePath}/haberler${currentPage > 1 ? `?page=${currentPage - 1}` : ''}`}>
                  <Button variant="outline" disabled={currentPage === 1}>Önceki</Button>
                </a>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <a key={pageNum} href={`${basePath}/haberler?page=${pageNum}`}>
                      <Button variant={currentPage === pageNum ? 'default' : 'outline'}>
                        {pageNum}
                      </Button>
                    </a>
                  );
                })}
                <a href={`${basePath}/haberler?page=${currentPage + 1}`}>
                  <Button variant="outline" disabled={currentPage >= totalPages}>Sonraki</Button>
                </a>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {articles.length === 0 && realEstateGundemArticles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {realEstateGundemArticles.length > 0 
              ? 'Karasu Emlak haberleri bulunmuyor, ancak Karasu Gündem\'den emlak haberleri yukarıda görüntüleniyor.'
              : 'Henüz haber bulunmuyor.'}
          </p>
        </div>
      )}

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="mt-12 bg-white rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Sık Sorulan Sorular</h2>
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

      {/* Related Neighborhoods */}
      {neighborhoods && neighborhoods.length > 0 && (
        <RelatedContent
          items={neighborhoods.slice(0, 6).map(n => ({
            id: generateSlug(n),
            title: `${n} Mahallesi`,
            slug: generateSlug(n),
            description: `${n} mahallesi hakkında haberler ve güncellemeler`,
            type: 'neighborhood' as const,
          }))}
          title="Popüler Mahalleler"
          type="neighborhoods"
          className="mt-12"
        />
      )}
    </div>
    </>
  );
}
