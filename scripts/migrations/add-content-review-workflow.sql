-- Migration: Add Content Review Workflow
-- Phase 3: Content Engine
-- Date: 2026-01-04

-- Add review workflow fields to articles table
DO $$ 
BEGIN
  -- Add review_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'review_status'
  ) THEN
    ALTER TABLE articles 
    ADD COLUMN review_status TEXT DEFAULT 'draft' 
    CHECK (review_status IN ('draft', 'pending_review', 'approved', 'rejected'));
  END IF;

  -- Add reviewed_by column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE articles 
    ADD COLUMN reviewed_by UUID REFERENCES auth.users(id);
  END IF;

  -- Add reviewed_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE articles 
    ADD COLUMN reviewed_at TIMESTAMPTZ;
  END IF;

  -- Add review_notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'review_notes'
  ) THEN
    ALTER TABLE articles 
    ADD COLUMN review_notes TEXT;
  END IF;

  -- Add quality_score column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'quality_score'
  ) THEN
    ALTER TABLE articles 
    ADD COLUMN quality_score INTEGER DEFAULT 0 
    CHECK (quality_score >= 0 AND quality_score <= 100);
  END IF;

  -- Add quality_issues column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'quality_issues'
  ) THEN
    ALTER TABLE articles 
    ADD COLUMN quality_issues JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add review workflow fields to news_articles table
DO $$ 
BEGIN
  -- Add review_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'review_status'
  ) THEN
    ALTER TABLE news_articles 
    ADD COLUMN review_status TEXT DEFAULT 'draft' 
    CHECK (review_status IN ('draft', 'pending_review', 'approved', 'rejected'));
  END IF;

  -- Add reviewed_by column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'reviewed_by'
  ) THEN
    ALTER TABLE news_articles 
    ADD COLUMN reviewed_by UUID REFERENCES auth.users(id);
  END IF;

  -- Add reviewed_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE news_articles 
    ADD COLUMN reviewed_at TIMESTAMPTZ;
  END IF;

  -- Add review_notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'review_notes'
  ) THEN
    ALTER TABLE news_articles 
    ADD COLUMN review_notes TEXT;
  END IF;

  -- Add quality_score column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'quality_score'
  ) THEN
    ALTER TABLE news_articles 
    ADD COLUMN quality_score INTEGER DEFAULT 0 
    CHECK (quality_score >= 0 AND quality_score <= 100);
  END IF;

  -- Add quality_issues column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'news_articles' AND column_name = 'quality_issues'
  ) THEN
    ALTER TABLE news_articles 
    ADD COLUMN quality_issues JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create index for pending reviews
CREATE INDEX IF NOT EXISTS idx_articles_pending_review 
ON articles(review_status) 
WHERE review_status = 'pending_review';

CREATE INDEX IF NOT EXISTS idx_news_articles_pending_review 
ON news_articles(review_status) 
WHERE review_status = 'pending_review';

-- Create index for quality scores
CREATE INDEX IF NOT EXISTS idx_articles_quality_score 
ON articles(quality_score) 
WHERE quality_score < 70;

CREATE INDEX IF NOT EXISTS idx_news_articles_quality_score 
ON news_articles(quality_score) 
WHERE quality_score < 70;

-- Add comment
COMMENT ON COLUMN articles.review_status IS 'Content review workflow status: draft, pending_review, approved, rejected';
COMMENT ON COLUMN news_articles.review_status IS 'Content review workflow status: draft, pending_review, approved, rejected';
COMMENT ON COLUMN articles.quality_score IS 'Content quality score (0-100), calculated by quality gate';
COMMENT ON COLUMN news_articles.quality_score IS 'Content quality score (0-100), calculated by quality gate';
