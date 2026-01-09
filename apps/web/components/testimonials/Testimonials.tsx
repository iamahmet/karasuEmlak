'use client';

import { useState } from 'react';
import { Card, CardContent } from '@karasu/ui';
import { Star } from 'lucide-react';
import { Review } from '@/lib/reviews/review-data';
import { cn } from '@karasu/lib';
import Link from 'next/link';
import { Button } from '@karasu/ui';

interface TestimonialsProps {
  reviews?: Review[];
  limit?: number;
  basePath?: string;
}

export default function Testimonials({ reviews, limit = 4, basePath = "" }: TestimonialsProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const allReviews = reviews || [];
  
  // Filter by rating
  const filteredReviews = selectedRating === null
    ? allReviews
    : allReviews.filter(review => review.rating === selectedRating);
  
  const displayReviews = filteredReviews.slice(0, limit);
  
  // Count reviews by rating
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: allReviews.filter(r => r.rating === rating).length
  }));

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Müşteri Yorumları
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Karasu Emlak ile çalışan müşterilerimizin deneyimleri
          </p>
        </div>

        {/* Star Rating Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedRating(null)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
              selectedRating === null
                ? "bg-[#006AFF] text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            Tümü
          </button>
          {ratingCounts.map(({ rating, count }) => (
            <button
              key={rating}
              onClick={() => setSelectedRating(rating)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2",
                selectedRating === rating
                  ? "bg-[#006AFF] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <div className="flex items-center gap-0.5">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span>({count})</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
          {displayReviews.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="font-semibold text-sm">
                      {testimonial.authorName}
                    </div>
                    {testimonial.propertyName && (
                      <div className="text-xs text-muted-foreground">
                        {testimonial.propertyName}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(testimonial.date).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* View All Button */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" className="border-2 border-gray-300 hover:border-[#006AFF] hover:bg-blue-50" asChild>
            <Link href={`${basePath}/yorumlar`}>
              Tüm Yorumları Görüntüle
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

