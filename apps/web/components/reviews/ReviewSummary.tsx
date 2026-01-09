'use client';

import { Star } from 'lucide-react';
import { Review, getAverageRating } from '@/lib/reviews/review-data';

interface ReviewSummaryProps {
  reviews: Review[];
}

export default function ReviewSummary({ reviews }: ReviewSummaryProps) {
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;
  const roundedRating = Math.round(averageRating * 10) / 10;

  return (
    <div className="flex flex-col items-center md:items-start">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl font-bold">{roundedRating.toFixed(1)}</span>
        <div className="flex items-center">
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
      </div>
      <p className="text-sm text-muted-foreground">
        {reviews.length} değerlendirme
      </p>
    </div>
  );
}

