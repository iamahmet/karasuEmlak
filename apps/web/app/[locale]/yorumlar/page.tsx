import type { Metadata } from 'next';

import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { Star, Filter, Search, TrendingUp, Award, Quote, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { getAllReviews, getAverageRating, getReviewCount } from '@/lib/reviews/review-data';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewSummary from '@/components/reviews/ReviewSummary';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateReviewCollectionSchema } from '@/lib/seo/local-seo-schemas';
import { getLastModified, generateLastModifiedMeta } from '@/lib/seo/content-freshness';

import { pruneHreflangLanguages } from '@/lib/seo/hreflang';
interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}


export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  const reviewCount = getReviewCount();
  const averageRating = getAverageRating();

  // Get lastModified for content freshness
  const lastModified = await getLastModified('page', 'yorumlar');
  const lastModifiedMeta = generateLastModifiedMeta(lastModified);

  return {
    title: 'Müşteri Yorumları ve Değerlendirmeleri | Karasu Emlak | 500+ Müşteri Yorumu',
    description: `Karasu Emlak müşterilerinden ${reviewCount} değerlendirme. Ortalama ${averageRating}/5 puan ile hizmetlerimiz hakkında müşteri görüşleri. Karasu emlak yorumları, değerlendirmeleri ve referanslar. %98 memnuniyet oranı.`,
    keywords: [
      'karasu emlak yorumları',
      'karasu emlak değerlendirmeleri',
      'müşteri yorumları',
      'emlak danışmanlığı yorumları',
      'karasu emlak müşteri görüşleri',
      'karasu emlak puan',
      'karasu emlak tavsiye',
      'karasu emlak referanslar',
      'sakarya emlak yorumları',
      'emlak yorumları karasu',
    ],
    ...lastModifiedMeta,
    alternates: {
      canonical: `${basePath}/yorumlar`,
      languages: pruneHreflangLanguages({
        'tr': '/yorumlar',
        'en': '/en/yorumlar',
        'et': '/et/yorumlar',
        'ru': '/ru/yorumlar',
        'ar': '/ar/yorumlar',
      }),
    },
    openGraph: {
      title: 'Müşteri Yorumları ve Değerlendirmeleri | Karasu Emlak',
      description: `${reviewCount} müşteri değerlendirmesi - Ortalama ${averageRating}/5 puan`,
      url: `${siteConfig.url}${basePath}/yorumlar`,
      type: 'website',
      images: [
        {
          url: `${siteConfig.url}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Karasu Emlak Müşteri Yorumları',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Müşteri Yorumları | Karasu Emlak',
      description: `${reviewCount} müşteri değerlendirmesi - Ortalama ${averageRating}/5 puan`,
    },
  };
}

export default async function YorumlarPage({
  params,
}: SearchPageProps) {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;

  const reviews = getAllReviews();
  const averageRating = getAverageRating();
  const reviewCount = getReviewCount();

  const breadcrumbs = [
    { label: 'Ana Sayfa', href: `${basePath}/` },
    { label: 'Müşteri Yorumları', href: `${basePath}/yorumlar` },
  ];

  // Group reviews by rating
  const reviewsByRating = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  // Calculate percentages
  const ratingPercentages = {
    5: reviewCount > 0 ? (reviewsByRating[5] / reviewCount) * 100 : 0,
    4: reviewCount > 0 ? (reviewsByRating[4] / reviewCount) * 100 : 0,
    3: reviewCount > 0 ? (reviewsByRating[3] / reviewCount) * 100 : 0,
    2: reviewCount > 0 ? (reviewsByRating[2] / reviewCount) * 100 : 0,
    1: reviewCount > 0 ? (reviewsByRating[1] / reviewCount) * 100 : 0,
  };

  // Recent reviews (last 3)
  const recentReviews = reviews.slice(0, 3);

  // Top rated reviews (5 stars)
  const topRatedReviews = reviews.filter(r => r.rating === 5).slice(0, 6);

  // Generate ReviewCollection schema
  const reviewCollectionSchema = generateReviewCollectionSchema({
    name: 'Karasu Emlak Müşteri Yorumları',
    description: `Karasu Emlak müşterilerinden ${reviewCount} değerlendirme ve yorum. Ortalama ${averageRating}/5 puan ile hizmetlerimiz hakkında müşteri görüşleri.`,
    reviews: reviews.map(review => ({
      authorName: review.authorName,
      authorUrl: review.authorUrl,
      datePublished: review.date,
      reviewBody: review.text,
      reviewRating: review.rating,
    })),
    aggregateRating: {
      ratingValue: averageRating,
      reviewCount: reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  });

  return (
    <>
      <StructuredData data={reviewCollectionSchema} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Breadcrumbs items={breadcrumbs} />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-6 backdrop-blur-sm">
                <Award className="h-8 w-8" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold mb-6 tracking-tight">
                Müşteri Yorumları
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                {reviewCount} müşterimizin deneyimleri ve görüşleri. Karasu Emlak hizmetlerimiz hakkında 
                gerçek müşteri yorumlarını okuyun.
              </p>
              
              {/* Overall Rating */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${
                            star <= Math.round(averageRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-blue-200 mt-1">
                      {reviewCount} değerlendirme
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-blue-100">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">%98 Memnuniyet Oranı</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 lg:py-16 bg-white -mt-8">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  {
                    label: 'Ortalama Puan',
                    value: averageRating.toFixed(1),
                    icon: Star,
                    color: 'text-yellow-500',
                    bgColor: 'bg-yellow-50',
                  },
                  {
                    label: 'Toplam Yorum',
                    value: reviewCount.toString(),
                    icon: Quote,
                    color: 'text-blue-500',
                    bgColor: 'bg-blue-50',
                  },
                  {
                    label: '5 Yıldız',
                    value: reviewsByRating[5].toString(),
                    icon: Award,
                    color: 'text-green-500',
                    bgColor: 'bg-green-50',
                  },
                  {
                    label: 'Memnuniyet',
                    value: '%98',
                    icon: TrendingUp,
                    color: 'text-purple-500',
                    bgColor: 'bg-purple-50',
                  },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center hover:border-[#006AFF]/40 hover:shadow-lg transition-all"
                    >
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Rating Distribution */}
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-sm">
                <h2 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 mb-8">
                  Puan Dağılımı
                </h2>
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = reviewsByRating[rating as keyof typeof reviewsByRating];
                    const percentage = ratingPercentages[rating as keyof typeof ratingPercentages];
                    return (
                      <div key={rating} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-900 w-16">
                              {rating} Yıldız
                            </span>
                            <div className="flex items-center">
                              {[...Array(rating)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-4 h-4 text-yellow-400 fill-current"
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                              {count}
                            </span>
                            <span className="text-xs text-gray-500 w-12 text-right">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Rated Reviews */}
        {topRatedReviews.length > 0 && (
          <section className="py-12 lg:py-16 bg-white">
            <div className="container mx-auto px-4 lg:px-6">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl lg:text-4xl font-display font-bold text-gray-900 mb-4">
                    En Beğenilen Yorumlar
                  </h2>
                  <p className="text-lg text-gray-600">
                    5 yıldız alan müşteri yorumları
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topRatedReviews.map((review, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-[#006AFF]/40 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-gray-500">
                          {new Date(review.date).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <Quote className="h-6 w-6 text-[#006AFF] mb-3 opacity-50" />
                      <p className="text-gray-700 leading-relaxed mb-4 line-clamp-4">
                        {review.text}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {review.authorName}
                          </div>
                          {review.propertyName && (
                            <div className="text-xs text-gray-500 mt-1">
                              {review.propertyName}
                            </div>
                          )}
                        </div>
                        <Award className="h-5 w-5 text-yellow-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Recent Reviews Preview */}
        {recentReviews.length > 0 && (
          <section className="py-12 lg:py-16 bg-gray-50">
            <div className="container mx-auto px-4 lg:px-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 mb-2">
                      Son Yorumlar
                    </h2>
                    <p className="text-gray-600">
                      En güncel müşteri değerlendirmeleri
                    </p>
                  </div>
                  <Link href={`${basePath}/yorumlar#tum-yorumlar`}>
                    <Button variant="outline" size="sm">
                      Tümünü Gör
                    </Button>
                  </Link>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {recentReviews.map((review, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-[#006AFF]/40 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-4 leading-relaxed">
                        {review.text}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm font-semibold text-gray-900">
                          {review.authorName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(review.date).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* All Reviews */}
        <section id="tum-yorumlar" className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-display font-bold text-gray-900 mb-2">
                    Tüm Yorumlar
                  </h2>
                  <p className="text-gray-600">
                    {reviewCount} müşteri yorumu ve değerlendirmesi
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrele
                  </Button>
                  <Button variant="outline" size="sm" className="hidden md:flex">
                    <Search className="h-4 w-4 mr-2" />
                    Ara
                  </Button>
                </div>
              </div>
              <ReviewList reviews={reviews} />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-[#006AFF] to-blue-700">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-6">
                Siz de Deneyiminizi Paylaşın
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Karasu Emlak ile çalışma deneyiminizi paylaşın. Yorumlarınız bizim için çok değerli.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-[#006AFF] hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
                  asChild
                >
                  <Link href={`${basePath}/iletisim`}>
                    Yorum Yapın
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
                  asChild
                >
                  <Link href={`${basePath}/hakkimizda`}>
                    Hakkımızda
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
