-- Migration: Standardize RLS Policies Across All Tables
-- Description: Implements clean, predictable RLS strategy
-- Date: 2026-01-01
-- 
-- CORE PRINCIPLES:
-- 1. NEVER rely on RLS for admin logic - Admin APIs use service role
-- 2. RLS is ONLY for public/anon access - Protect public reads, block public writes
-- 3. Server-side = service role (all /api/* routes)
-- 4. Client-side = anon (listings, published content, read-only views)
--
-- STANDARD PATTERN FOR CONTENT TABLES:
-- A) Public read: SELECT only if published=true AND deleted_at IS NULL
-- B) Service role: ALL operations (SELECT, INSERT, UPDATE, DELETE)
-- C) Block everything else for public (no implicit access)

-- ============================================================================
-- PART 1: FIX CRITICAL SECURITY ISSUES
-- ============================================================================

-- news_articles: Remove dangerous "all_policy" that gives everyone ALL access
DROP POLICY IF EXISTS "news_articles_all_policy" ON public.news_articles;

-- qa_entries: Remove overly permissive policies
DROP POLICY IF EXISTS "qa_entries_delete_policy" ON public.qa_entries;
DROP POLICY IF EXISTS "qa_entries_insert_policy" ON public.qa_entries;
DROP POLICY IF EXISTS "qa_entries_select_policy" ON public.qa_entries;
DROP POLICY IF EXISTS "qa_entries_update_policy" ON public.qa_entries;

-- ============================================================================
-- PART 2: STANDARDIZE SERVICE ROLE POLICIES
-- ============================================================================
-- Use auth.role() = 'service_role' for consistency
-- This is the correct way to check service role in RLS

-- Articles: Ensure service role policy exists and is correct
DROP POLICY IF EXISTS "Service role can manage articles" ON public.articles;
CREATE POLICY "Service role can manage articles"
ON public.articles
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- News Articles: Create proper service role policy
DROP POLICY IF EXISTS "Service role can manage news_articles" ON public.news_articles;
CREATE POLICY "Service role can manage news_articles"
ON public.news_articles
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Content Comments: Fix service role policy (currently uses auth.jwt())
DROP POLICY IF EXISTS "Service role can manage all comments" ON public.content_comments;
CREATE POLICY "Service role can manage all comments"
ON public.content_comments
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Content Items: Fix service role policy
DROP POLICY IF EXISTS "Service role can manage all content" ON public.content_items;
CREATE POLICY "Service role can manage all content"
ON public.content_items
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Content Locales: Fix service role policy
DROP POLICY IF EXISTS "Service role can manage all content locales" ON public.content_locales;
CREATE POLICY "Service role can manage all content locales"
ON public.content_locales
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Neighborhoods: Fix service role policy
DROP POLICY IF EXISTS "Service role can manage neighborhoods" ON public.neighborhoods;
CREATE POLICY "Service role can manage neighborhoods"
ON public.neighborhoods
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- QA Entries: Create proper service role policy
CREATE POLICY "Service role can manage qa_entries"
ON public.qa_entries
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- SEO Events: Create proper service role policy
CREATE POLICY "Service role can manage seo_events"
ON public.seo_events
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- PART 3: STANDARDIZE PUBLIC READ POLICIES
-- ============================================================================
-- Public can ONLY read published content (no writes, no deletes)

-- Articles: Standardize public read policy
DROP POLICY IF EXISTS "Public can read published articles" ON public.articles;
CREATE POLICY "Public can read published articles"
ON public.articles
FOR SELECT
TO public
USING (
  (status = 'published' OR is_published = true)
  AND deleted_at IS NULL
);

-- News Articles: Create proper public read policy
DROP POLICY IF EXISTS "news_articles_select_policy" ON public.news_articles;
CREATE POLICY "Public can read published news"
ON public.news_articles
FOR SELECT
TO public
USING (
  published = true
  AND deleted_at IS NULL
);

-- Content Comments: Public can only read approved comments
DROP POLICY IF EXISTS "Public can read approved comments" ON public.content_comments;
CREATE POLICY "Public can read approved comments"
ON public.content_comments
FOR SELECT
TO public
USING (status = 'approved');

-- Content Items: Standardize public read policy
DROP POLICY IF EXISTS "Public can read published content" ON public.content_items;
CREATE POLICY "Public can read published content"
ON public.content_items
FOR SELECT
TO public
USING (status = 'published');

-- Content Locales: Public can read locales for published content
DROP POLICY IF EXISTS "Public can read published content locales" ON public.content_locales;
CREATE POLICY "Public can read published content locales"
ON public.content_locales
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.content_items
    WHERE content_items.id = content_locales.content_item_id
      AND content_items.status = 'published'
  )
);

-- Neighborhoods: Standardize public read policy
DROP POLICY IF EXISTS "Public can read published neighborhoods" ON public.neighborhoods;
CREATE POLICY "Public can read published neighborhoods"
ON public.neighborhoods
FOR SELECT
TO public
USING (published = true);

-- QA Entries: Public can read all (they're public Q&A)
CREATE POLICY "Public can read qa_entries"
ON public.qa_entries
FOR SELECT
TO public
USING (true);

-- SEO Events: Public can read all (they're analytics events)
DROP POLICY IF EXISTS "seo_events_select_policy" ON public.seo_events;
CREATE POLICY "Public can read seo_events"
ON public.seo_events
FOR SELECT
TO public
USING (true);

-- ============================================================================
-- PART 4: BLOCK PUBLIC WRITES (EXCEPT SPECIFIC CASES)
-- ============================================================================
-- By default, public cannot INSERT/UPDATE/DELETE
-- Only allow specific exceptions (like comments)

-- Articles: Block public writes
CREATE POLICY "Public cannot write articles"
ON public.articles
FOR INSERT
TO public
WITH CHECK (false);

CREATE POLICY "Public cannot update articles"
ON public.articles
FOR UPDATE
TO public
USING (false);

CREATE POLICY "Public cannot delete articles"
ON public.articles
FOR DELETE
TO public
USING (false);

-- News Articles: Block public writes
CREATE POLICY "Public cannot write news"
ON public.news_articles
FOR INSERT
TO public
WITH CHECK (false);

CREATE POLICY "Public cannot update news"
ON public.news_articles
FOR UPDATE
TO public
USING (false);

CREATE POLICY "Public cannot delete news"
ON public.news_articles
FOR DELETE
TO public
USING (false);

-- Content Items: Block public writes
CREATE POLICY "Public cannot write content_items"
ON public.content_items
FOR INSERT
TO public
WITH CHECK (false);

CREATE POLICY "Public cannot update content_items"
ON public.content_items
FOR UPDATE
TO public
USING (false);

CREATE POLICY "Public cannot delete content_items"
ON public.content_items
FOR DELETE
TO public
USING (false);

-- Content Locales: Block public writes
CREATE POLICY "Public cannot write content_locales"
ON public.content_locales
FOR INSERT
TO public
WITH CHECK (false);

CREATE POLICY "Public cannot update content_locales"
ON public.content_locales
FOR UPDATE
TO public
USING (false);

CREATE POLICY "Public cannot delete content_locales"
ON public.content_locales
FOR DELETE
TO public
USING (false);

-- Neighborhoods: Block public writes
CREATE POLICY "Public cannot write neighborhoods"
ON public.neighborhoods
FOR INSERT
TO public
WITH CHECK (false);

CREATE POLICY "Public cannot update neighborhoods"
ON public.neighborhoods
FOR UPDATE
TO public
USING (false);

CREATE POLICY "Public cannot delete neighborhoods"
ON public.neighborhoods
FOR DELETE
TO public
USING (false);

-- QA Entries: Allow public to insert (they can submit questions)
-- But block updates/deletes
CREATE POLICY "Public can insert qa_entries"
ON public.qa_entries
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public cannot update qa_entries"
ON public.qa_entries
FOR UPDATE
TO public
USING (false);

CREATE POLICY "Public cannot delete qa_entries"
ON public.qa_entries
FOR DELETE
TO public
USING (false);

-- SEO Events: Allow public to insert (they can track events)
-- But block updates/deletes
DROP POLICY IF EXISTS "seo_events_insert_policy" ON public.seo_events;
CREATE POLICY "Public can insert seo_events"
ON public.seo_events
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Public cannot update seo_events"
ON public.seo_events
FOR UPDATE
TO public
USING (false);

CREATE POLICY "Public cannot delete seo_events"
ON public.seo_events
FOR DELETE
TO public
USING (false);

-- Comments: Keep existing INSERT policy (users can create comments)
-- But ensure UPDATE/DELETE are restricted
-- (Existing policies handle this, but ensure they're correct)

-- ============================================================================
-- PART 5: ENABLE RLS ON TABLES THAT NEED IT
-- ============================================================================

-- Ensure RLS is enabled on all content tables
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_locales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 6: REMOVE REDUNDANT/DUPLICATE POLICIES
-- ============================================================================

-- Remove old "authenticated users can read all" policies
-- These are redundant - authenticated users should use service role via API
DROP POLICY IF EXISTS "Authenticated users can read all articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can read all ai_questions" ON public.ai_questions;
DROP POLICY IF EXISTS "Authenticated users can read all neighborhoods" ON public.neighborhoods;

-- Remove old staff policies that check staff_profiles
-- Admin should use service role, not staff role checks
DROP POLICY IF EXISTS "Staff can manage all comments" ON public.content_comments;
DROP POLICY IF EXISTS "Staff can manage all content" ON public.content_items;
DROP POLICY IF EXISTS "Staff can manage all content locales" ON public.content_locales;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON POLICY "Service role can manage articles" ON public.articles IS 
  'Service role (admin APIs) can perform all operations. This bypasses RLS.';

COMMENT ON POLICY "Public can read published articles" ON public.articles IS 
  'Public (anon key) can only read published articles. No writes allowed.';

COMMENT ON POLICY "Service role can manage news_articles" ON public.news_articles IS 
  'Service role (admin APIs) can perform all operations. This bypasses RLS.';

COMMENT ON POLICY "Public can read published news" ON public.news_articles IS 
  'Public (anon key) can only read published news. No writes allowed.';
