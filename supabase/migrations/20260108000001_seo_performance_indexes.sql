-- SEO and Performance Optimization Indexes
-- Created: 2026-01-08
-- Purpose: Improve query performance for SEO-related queries
-- Note: Some indexes may already exist from previous migrations, using IF NOT EXISTS to avoid errors

-- Indexes for listings table (SEO queries)
-- Check if index exists before creating (some may already exist from 20260106000000_add_performance_indexes.sql)
DO $$
BEGIN
  -- Only create if doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_listings_status_location' 
    AND tablename = 'listings'
  ) THEN
    CREATE INDEX idx_listings_status_location ON listings(status, location_district, location_neighborhood) WHERE deleted_at IS NULL;
  END IF;
END $$;
-- Property type and status index
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_property_type_status' AND tablename = 'listings') THEN
    CREATE INDEX idx_listings_property_type_status ON listings(property_type, status) WHERE deleted_at IS NULL;
  END IF;
END $$;
-- Price and status index
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_price_status' AND tablename = 'listings') THEN
    CREATE INDEX idx_listings_price_status ON listings(price_amount, status) WHERE deleted_at IS NULL AND price_amount IS NOT NULL;
  END IF;
END $$;
-- Created at and status index
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_created_at_status' AND tablename = 'listings') THEN
    CREATE INDEX idx_listings_created_at_status ON listings(created_at DESC, status) WHERE deleted_at IS NULL;
  END IF;
END $$;
-- Featured and status index
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_featured_status' AND tablename = 'listings') THEN
    CREATE INDEX idx_listings_featured_status ON listings(featured, status, created_at DESC) WHERE deleted_at IS NULL AND featured = true;
  END IF;
END $$;
-- Slug index (may already exist as unique)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_slug' AND tablename = 'listings') THEN
    CREATE INDEX idx_listings_slug ON listings(slug) WHERE deleted_at IS NULL;
  END IF;
END $$;
-- Indexes for neighborhoods table (SEO queries)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_neighborhoods_slug' AND tablename = 'neighborhoods') THEN
    CREATE INDEX idx_neighborhoods_slug ON neighborhoods(slug) WHERE deleted_at IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_neighborhoods_district_city' AND tablename = 'neighborhoods') THEN
    CREATE INDEX idx_neighborhoods_district_city ON neighborhoods(district, city) WHERE deleted_at IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_neighborhoods_published' AND tablename = 'neighborhoods') THEN
    CREATE INDEX idx_neighborhoods_published ON neighborhoods(published, created_at DESC) WHERE deleted_at IS NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_neighborhoods_coordinates' AND tablename = 'neighborhoods') THEN
    CREATE INDEX idx_neighborhoods_coordinates ON neighborhoods(coordinates_lat, coordinates_lng) WHERE deleted_at IS NULL AND coordinates_lat IS NOT NULL AND coordinates_lng IS NOT NULL;
  END IF;
END $$;
-- Indexes for articles table (SEO queries)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_articles_slug' AND tablename = 'articles') THEN
    CREATE INDEX idx_articles_slug ON articles(slug) WHERE status = 'published';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_articles_category_published' AND tablename = 'articles') THEN
    CREATE INDEX idx_articles_category_published ON articles(category, published_at DESC) WHERE status = 'published';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_articles_published_at' AND tablename = 'articles') THEN
    CREATE INDEX idx_articles_published_at ON articles(published_at DESC) WHERE status = 'published';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_articles_featured' AND tablename = 'articles') THEN
    CREATE INDEX idx_articles_featured ON articles(discover_eligible, published_at DESC) WHERE discover_eligible = true AND status = 'published';
  END IF;
END $$;
-- Indexes for qa_entries table (SEO queries)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'qa_entries') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_qa_entries_page_slug' AND tablename = 'qa_entries') THEN
      CREATE INDEX idx_qa_entries_page_slug ON qa_entries(page_slug) WHERE deleted_at IS NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_qa_entries_location' AND tablename = 'qa_entries') THEN
      CREATE INDEX idx_qa_entries_location ON qa_entries(location_type, location_value) WHERE deleted_at IS NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_qa_entries_priority' AND tablename = 'qa_entries') THEN
      CREATE INDEX idx_qa_entries_priority ON qa_entries(priority DESC, created_at DESC) WHERE deleted_at IS NULL;
    END IF;
  END IF;
END $$;
-- Indexes for ai_questions table (SEO queries)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_questions') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_questions_page_slug' AND tablename = 'ai_questions') THEN
      CREATE INDEX idx_ai_questions_page_slug ON ai_questions(page_slug) WHERE deleted_at IS NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_questions_location' AND tablename = 'ai_questions') THEN
      CREATE INDEX idx_ai_questions_location ON ai_questions(location_type, location_value) WHERE deleted_at IS NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_questions_priority' AND tablename = 'ai_questions') THEN
      CREATE INDEX idx_ai_questions_priority ON ai_questions(priority DESC, created_at DESC) WHERE deleted_at IS NULL;
    END IF;
  END IF;
END $$;
-- Composite index for common listing queries
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_composite_seo' AND tablename = 'listings') THEN
    CREATE INDEX idx_listings_composite_seo ON listings(
      status,
      property_type,
      location_district,
      location_neighborhood,
      created_at DESC
    ) WHERE deleted_at IS NULL;
  END IF;
END $$;
-- Full-text search index for listings (if needed)
-- Note: Requires pg_trgm extension
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS idx_listings_title_search ON listings USING gin(title gin_trgm_ops) WHERE deleted_at IS NULL;
-- CREATE INDEX IF NOT EXISTS idx_listings_description_search ON listings USING gin(description_short gin_trgm_ops) WHERE deleted_at IS NULL;

-- Index for neighborhood stats queries
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_listings_neighborhood_stats' AND tablename = 'listings') THEN
    CREATE INDEX idx_listings_neighborhood_stats ON listings(
      location_neighborhood,
      location_district,
      status,
      price_amount
    ) WHERE deleted_at IS NULL AND price_amount IS NOT NULL;
  END IF;
END $$;
-- Comments for documentation
COMMENT ON INDEX idx_listings_status_location IS 'Optimizes queries filtering by status and location (common in listing pages)';
COMMENT ON INDEX idx_listings_composite_seo IS 'Composite index for common SEO-related listing queries';
COMMENT ON INDEX idx_neighborhoods_slug IS 'Optimizes neighborhood lookup by slug (used in neighborhood pages)';
COMMENT ON INDEX idx_articles_category_published IS 'Optimizes article queries by category and publication date (used in blog pages)';
