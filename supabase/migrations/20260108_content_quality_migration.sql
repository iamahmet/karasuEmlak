-- Migration: Content Quality Migration
-- Date: 2026-01-08
-- Purpose: Add quality_score and quality_issues columns if they don't exist,
--          and calculate initial quality scores for existing content

-- Add quality_score and quality_issues to articles table if they don't exist
DO $$ 
BEGIN
  -- Add quality_score column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'quality_score'
  ) THEN
    ALTER TABLE articles 
    ADD COLUMN quality_score INTEGER DEFAULT 0 
    CHECK (quality_score >= 0 AND quality_score <= 100);
    
    COMMENT ON COLUMN articles.quality_score IS 'Content quality score (0-100) calculated by quality checker';
  END IF;

  -- Add quality_issues column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'quality_issues'
  ) THEN
    ALTER TABLE articles 
    ADD COLUMN quality_issues JSONB DEFAULT '[]'::jsonb;
    
    COMMENT ON COLUMN articles.quality_issues IS 'Array of quality issues detected in content';
  END IF;
END $$;

-- Add quality_score and quality_issues to news_articles table if they don't exist
DO $$ 
BEGIN
  -- Add quality_score column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'quality_score'
  ) THEN
    ALTER TABLE news_articles 
    ADD COLUMN quality_score INTEGER DEFAULT 0 
    CHECK (quality_score >= 0 AND quality_score <= 100);
    
    COMMENT ON COLUMN news_articles.quality_score IS 'Content quality score (0-100) calculated by quality checker';
  END IF;

  -- Add quality_issues column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'quality_issues'
  ) THEN
    ALTER TABLE news_articles 
    ADD COLUMN quality_issues JSONB DEFAULT '[]'::jsonb;
    
    COMMENT ON COLUMN news_articles.quality_issues IS 'Array of quality issues detected in content';
  END IF;
END $$;

-- Note: Quality scores will be calculated by running the batch-content-improvement script
-- This migration only ensures the columns exist
