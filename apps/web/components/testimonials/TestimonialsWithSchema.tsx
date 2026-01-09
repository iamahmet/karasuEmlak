import Testimonials from './Testimonials';
import { getAllReviews, Review } from '@/lib/reviews/review-data';
import { StructuredData } from '@/components/seo/StructuredData';

interface TestimonialsWithSchemaProps {
  reviews?: Review[];
  basePath?: string;
}

/**
 * TestimonialsWithSchema Component
 * 
 * IMPORTANT: AggregateRating is ONLY included in LocalBusiness schema (app/layout.tsx)
 * This component generates ItemList schema WITHOUT aggregateRating to prevent duplicate AggregateRating errors
 * Google Search Console requires only ONE AggregateRating per page
 */
export default function TestimonialsWithSchema({ reviews, basePath = "" }: TestimonialsWithSchemaProps) {
  // Use provided reviews or get all reviews
  const displayReviews: Review[] = reviews || getAllReviews();
  
  // Generate ItemList schema WITHOUT aggregateRating
  // aggregateRating is already in LocalBusiness schema (app/layout.tsx)
  // Adding it here would cause "multiple aggregate ratings" error in Google Search Console
  const testimonialsSchema = displayReviews.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Müşteri Yorumları',
    description: 'Karasu Emlak müşteri yorumları ve değerlendirmeleri',
    itemListElement: displayReviews.slice(0, 10).map((review, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.authorName,
        },
        datePublished: review.date,
        reviewBody: review.text,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
      },
    })),
    // NOTE: aggregateRating is NOT included here to prevent duplicate AggregateRating errors
    // aggregateRating is already in LocalBusiness schema (app/layout.tsx)
  } : null;

  return (
    <>
      {/* Testimonials Schema - ItemList WITHOUT AggregateRating */}
      {testimonialsSchema && <StructuredData data={testimonialsSchema} />}
      <Testimonials reviews={displayReviews} basePath={basePath} />
    </>
  );
}

