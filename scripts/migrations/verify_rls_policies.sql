-- Migration: Verify RLS Policies for Phase 3 Fields
-- Phase 4: Supabase RLS, Cache, Reliability
-- Date: 2026-01-04

-- Verify that RLS policies still work correctly after adding review_status, quality_score fields

-- Check if articles table has proper RLS policies
DO $$
BEGIN
  -- Verify service role policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'articles' 
    AND policyname = 'Service role can manage articles'
  ) THEN
    RAISE WARNING 'Missing service role policy for articles';
  END IF;

  -- Verify public read policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'articles' 
    AND policyname = 'Public can read published articles'
  ) THEN
    RAISE WARNING 'Missing public read policy for articles';
  END IF;

  -- Verify public write policies exist (should block)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'articles' 
    AND policyname = 'Public cannot write articles'
  ) THEN
    RAISE WARNING 'Missing public write block policy for articles';
  END IF;
END $$;

-- Check if news_articles table has proper RLS policies
DO $$
BEGIN
  -- Verify service role policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'news_articles' 
    AND policyname = 'Service role can manage news_articles'
  ) THEN
    RAISE WARNING 'Missing service role policy for news_articles';
  END IF;

  -- Verify public read policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'news_articles' 
    AND policyname = 'Public can read published news'
  ) THEN
    RAISE WARNING 'Missing public read policy for news_articles';
  END IF;

  -- Verify public write policies exist (should block)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'news_articles' 
    AND policyname = 'Public cannot write news'
  ) THEN
    RAISE WARNING 'Missing public write block policy for news_articles';
  END IF;
END $$;

-- Verify RLS is enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'articles' 
    AND rowsecurity = true
  ) THEN
    RAISE WARNING 'RLS not enabled on articles table';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'news_articles' 
    AND rowsecurity = true
  ) THEN
    RAISE WARNING 'RLS not enabled on news_articles table';
  END IF;
END $$;

-- Test query: Service role should see all articles (including draft)
-- This is a verification query, not a migration
-- Run separately to verify RLS is working
