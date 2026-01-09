/**
 * Reviews API Endpoint
 * 
 * GET /api/reviews
 * Returns all reviews with optional filtering
 * 
 * Query params:
 * - limit: number of reviews to return (default: 50)
 * - rating: filter by rating (1-5)
 * - sort: 'newest' | 'oldest' | 'rating' (default: 'newest')
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllReviews } from '@/lib/reviews/review-data';
import { getAverageRating, getReviewCount } from '@/lib/reviews/review-data';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const rating = searchParams.get('rating') ? parseInt(searchParams.get('rating')!, 10) : null;
    const sort = searchParams.get('sort') || 'newest';

    let reviews = getAllReviews();

    // Filter by rating if provided
    if (rating && rating >= 1 && rating <= 5) {
      reviews = reviews.filter(r => r.rating === rating);
    }

    // Sort reviews
    switch (sort) {
      case 'oldest':
        reviews = reviews.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'rating':
        reviews = reviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        reviews = reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }

    // Apply limit
    const limitedReviews = reviews.slice(0, limit);

    // Get aggregate stats
    const averageRating = getAverageRating();
    const reviewCount = getReviewCount();

    return NextResponse.json({
      success: true,
      data: {
        reviews: limitedReviews,
        pagination: {
          total: reviews.length,
          limit,
          returned: limitedReviews.length,
        },
        stats: {
          averageRating,
          reviewCount,
          ratingDistribution: {
            5: reviews.filter(r => r.rating === 5).length,
            4: reviews.filter(r => r.rating === 4).length,
            3: reviews.filter(r => r.rating === 3).length,
            2: reviews.filter(r => r.rating === 2).length,
            1: reviews.filter(r => r.rating === 1).length,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reviews',
      },
      { status: 500 }
    );
  }
}
