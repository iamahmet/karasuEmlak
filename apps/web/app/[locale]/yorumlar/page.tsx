import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { getAllReviews, getAverageRating, getReviewCount } from '@/lib/reviews/review-data';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewSummary from '@/components/reviews/ReviewSummary';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateReviewCollectionSchema } from '@/lib/seo/local-seo-schemas';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  const reviewCount = getReviewCount();
  const averageRating = getAverageRating();

  return {
    title: 'Müşteri Yorumları ve Değerlendirmeleri | Karasu Emlak',
    description: `Karasu Emlak müşterilerinden ${reviewCount} değerlendirme. Ortalama ${averageRating}/5 puan ile hizmetlerimiz hakkında müşteri görüşleri. Karasu emlak yorumları ve değerlendirmeleri.`,
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
    ],
    alternates: {
      canonical: `${basePath}/yorumlar`,
      languages: {
        'tr': '/yorumlar',
        'en': '/en/yorumlar',
        'et': '/et/yorumlar',
        'ru': '/ru/yorumlar',
        'ar': '/ar/yorumlar',
      },
    },
    openGraph: {
      title: 'Müşteri Yorumları ve Değerlendirmeleri | Karasu Emlak',
      description: `${reviewCount} müşteri değerlendirmesi - Ortalama ${averageRating}/5 puan`,
      url: `${siteConfig.url}${basePath}/yorumlar`,
      type: 'website',
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
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Yorumlar' },
        ]}
        className="mb-6"
      />

      {/* Hero Section */}
      <section className="mb-12 text-center">
        <div className="inline-block mb-4">
          <span className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary/10 text-primary">
            {reviewCount} Değerlendirme
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          Müşteri Yorumları
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          {reviewCount} müşterimizin deneyimleri ve görüşleri. Karasu Emlak hizmetlerimiz hakkında 
          gerçek müşteri yorumlarını okuyun.
        </p>
        <div className="flex flex-wrap gap-3 justify-center items-center">
          <div className="px-4 py-2 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            {
              label: 'Ortalama Puan',
              value: averageRating.toFixed(1),
              color: 'yellow',
            },
            {
              label: 'Toplam Yorum',
              value: reviewCount.toString(),
              color: 'blue',
            },
            {
              label: '5 Yıldız',
              value: reviewsByRating[5].toString(),
              color: 'green',
            },
            {
              label: 'Memnuniyet',
              value: '%100',
              color: 'purple',
            },
          ].map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Review Summary & Rating Distribution */}
      <section className="mb-12">
        <Card className="mb-12">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Overall Rating */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">
                  Genel Değerlendirme
                </h2>
                <ReviewSummary reviews={reviews} />
              </div>
              
              {/* Rating Distribution */}
              <div>
                <h3 className="text-xl font-bold mb-6">
                  Puan Dağılımı
                </h3>
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = reviewsByRating[rating as keyof typeof reviewsByRating];
                    const percentage = ratingPercentages[rating as keyof typeof ratingPercentages];
                    return (
                      <div key={rating} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
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
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium w-12 text-right">
                              {count}
                            </span>
                            <span className="text-xs text-muted-foreground w-10 text-right">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-primary h-3 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reviews Preview */}
        {recentReviews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Son Yorumlar
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {recentReviews.map((review, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
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
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-4 leading-relaxed">
                      {review.text}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-sm font-semibold">
                        {review.authorName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Reviews */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">
              Tüm Yorumlar
            </h2>
            <span className="text-sm text-muted-foreground">
              {reviewCount} yorum
            </span>
          </div>
          <ReviewList reviews={reviews} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="mb-12 text-center bg-muted rounded-lg p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Siz de Deneyiminizi Paylaşın
        </h2>
        <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Karasu Emlak ile çalışma deneyiminizi paylaşın. Yorumlarınız bizim için çok değerli.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/iletisim">
            <Button size="lg">
              Yorum Yapın
            </Button>
          </Link>
          <Link href="/hakkimizda">
            <Button variant="outline" size="lg">
              Hakkımızda
            </Button>
          </Link>
        </div>
      </section>
      </div>
    </>
  );
}

