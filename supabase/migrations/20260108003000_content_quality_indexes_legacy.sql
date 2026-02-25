-- Migration: Content Quality Indexes
-- Date: 2026-01-08
-- Purpose: Create indexes for quality_score and review_status columns for performance

-- Indexes for articles table
DO $$ 
BEGIN
  -- Index for quality_score (for filtering low-quality content)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'articles' AND indexname = 'idx_articles_quality_score'
  ) THEN
    CREATE INDEX idx_articles_quality_score ON articles(quality_score) 
    WHERE status = 'published';
    
    COMMENT ON INDEX idx_articles_quality_score IS 'Index for filtering articles by quality score';
  END IF;

  -- Index for review_status if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'review_status'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'articles' AND indexname = 'idx_articles_review_status'
    ) THEN
      CREATE INDEX idx_articles_review_status ON articles(review_status) 
      WHERE status = 'published';
      
      COMMENT ON INDEX idx_articles_review_status IS 'Index for filtering articles by review status';
    END IF;
  END IF;

  -- Composite index for quality_score and status (for admin queries)
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'articles' AND indexname = 'idx_articles_quality_status'
  ) THEN
    CREATE INDEX idx_articles_quality_status ON articles(status, quality_score);
    
    COMMENT ON INDEX idx_articles_quality_status IS 'Composite index for filtering by status and quality';
  END IF;
END $$;

-- Indexes for news_articles table (only if status/quality_score columns exist)
DO $$ 
BEGIN
  -- Index for quality_score - check status column exists first
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'news_articles' AND column_name = 'status'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'news_articles' AND column_name = 'quality_score'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'news_articles' AND indexname = 'idx_news_articles_quality_score'
    ) THEN
      CREATE INDEX idx_news_articles_quality_score ON news_articles(quality_score) 
      WHERE status = 'published';
      COMMENT ON INDEX idx_news_articles_quality_score IS 'Index for filtering news articles by quality score';
    END IF;
  END IF;

  -- Index for review_status if both columns exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'review_status'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'status'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'news_articles' AND indexname = 'idx_news_articles_review_status'
    ) THEN
      CREATE INDEX idx_news_articles_review_status ON news_articles(review_status) 
      WHERE status = 'published';
      COMMENT ON INDEX idx_news_articles_review_status IS 'Index for filtering news articles by review status';
    END IF;
  END IF;

  -- Composite index - only if both columns exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'status'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'quality_score'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'news_articles' AND indexname = 'idx_news_articles_quality_status'
    ) THEN
      CREATE INDEX idx_news_articles_quality_status ON news_articles(status, quality_score);
      COMMENT ON INDEX idx_news_articles_quality_status IS 'Composite index for filtering by status and quality';
    END IF;
  END IF;
END $$;
