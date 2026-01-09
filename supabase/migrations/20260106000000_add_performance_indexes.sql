-- Performance Optimization Indexes
-- This migration adds indexes to improve query performance for common queries

-- Listings table indexes
-- Index for published/available listings (most common query)
CREATE INDEX IF NOT EXISTS idx_listings_published_available 
  ON public.listings(published, available, deleted_at) 
  WHERE published = true AND available = true AND deleted_at IS NULL;

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_listings_status 
  ON public.listings(status) 
  WHERE published = true AND available = true AND deleted_at IS NULL;

-- Index for property type filtering
CREATE INDEX IF NOT EXISTS idx_listings_property_type 
  ON public.listings(property_type) 
  WHERE published = true AND available = true AND deleted_at IS NULL;

-- Index for location filtering (district + neighborhood)
CREATE INDEX IF NOT EXISTS idx_listings_location 
  ON public.listings(location_district, location_neighborhood) 
  WHERE published = true AND available = true AND deleted_at IS NULL;

-- Index for price range queries
CREATE INDEX IF NOT EXISTS idx_listings_price 
  ON public.listings(price_amount) 
  WHERE published = true AND available = true AND deleted_at IS NULL AND price_amount IS NOT NULL;

-- Index for featured listings
CREATE INDEX IF NOT EXISTS idx_listings_featured 
  ON public.listings(featured, created_at DESC) 
  WHERE published = true AND available = true AND deleted_at IS NULL AND featured = true;

-- Index for slug lookups (already unique, but ensure index exists)
CREATE INDEX IF NOT EXISTS idx_listings_slug 
  ON public.listings(slug) 
  WHERE published = true AND deleted_at IS NULL;

-- Index for created_at sorting (most common sort)
CREATE INDEX IF NOT EXISTS idx_listings_created_at 
  ON public.listings(created_at DESC) 
  WHERE published = true AND available = true AND deleted_at IS NULL;

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_listings_status_type_district 
  ON public.listings(status, property_type, location_district) 
  WHERE published = true AND available = true AND deleted_at IS NULL;

-- Articles table indexes
-- Index for published articles
CREATE INDEX IF NOT EXISTS idx_articles_published 
  ON public.articles(status, published_at DESC) 
  WHERE status = 'published';

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_articles_slug 
  ON public.articles(slug) 
  WHERE status = 'published';

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_articles_category 
  ON public.articles(category) 
  WHERE status = 'published' AND category IS NOT NULL;

-- Index for views sorting (popular articles)
CREATE INDEX IF NOT EXISTS idx_articles_views 
  ON public.articles(views DESC) 
  WHERE status = 'published';

-- Index for created_at sorting
CREATE INDEX IF NOT EXISTS idx_articles_created_at 
  ON public.articles(created_at DESC) 
  WHERE status = 'published';

-- News articles table indexes
CREATE INDEX IF NOT EXISTS idx_news_published 
  ON public.news_articles(published, published_at DESC) 
  WHERE published = true AND deleted_at IS NULL;

-- Index for featured news
CREATE INDEX IF NOT EXISTS idx_news_featured 
  ON public.news_articles(featured, published_at DESC) 
  WHERE published = true AND featured = true AND deleted_at IS NULL;

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_news_slug 
  ON public.news_articles(slug) 
  WHERE published = true AND deleted_at IS NULL;

-- Neighborhoods table indexes
CREATE INDEX IF NOT EXISTS idx_neighborhoods_published 
  ON public.neighborhoods(published, district, city) 
  WHERE published = true AND deleted_at IS NULL;

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_neighborhoods_slug 
  ON public.neighborhoods(slug) 
  WHERE published = true AND deleted_at IS NULL;

-- Index for district filtering
CREATE INDEX IF NOT EXISTS idx_neighborhoods_district 
  ON public.neighborhoods(district) 
  WHERE published = true AND deleted_at IS NULL;

-- Comments table indexes
CREATE INDEX IF NOT EXISTS idx_comments_article_slug 
  ON public.comments(article_slug, status, created_at DESC) 
  WHERE status = 'approved';

-- Index for parent_id (nested comments)
CREATE INDEX IF NOT EXISTS idx_comments_parent_id 
  ON public.comments(parent_id) 
  WHERE parent_id IS NOT NULL;

-- QA entries table indexes (if exists)
-- Note: This will only create if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'qa_entries') THEN
    CREATE INDEX IF NOT EXISTS idx_qa_entries_region_priority 
      ON public.qa_entries(region, priority DESC, created_at);
    
    CREATE INDEX IF NOT EXISTS idx_qa_entries_category 
      ON public.qa_entries(category) 
      WHERE category IS NOT NULL;
  END IF;
END $$;

-- AI questions table indexes (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_questions') THEN
    CREATE INDEX IF NOT EXISTS idx_ai_questions_location_scope 
      ON public.ai_questions(location_scope, page_type, published_at DESC) 
      WHERE published = true;
    
    CREATE INDEX IF NOT EXISTS idx_ai_questions_page_slug 
      ON public.ai_questions(page_slug) 
      WHERE published = true;
  END IF;
END $$;

-- Analyze tables after index creation for query planner
ANALYZE public.listings;
ANALYZE public.articles;
ANALYZE public.news_articles;
ANALYZE public.neighborhoods;
ANALYZE public.comments;
