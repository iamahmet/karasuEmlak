-- Ensure qa_entries and ai_questions tables exist
-- Idempotent: safe to run multiple times
-- Fixes: "AI questions table not found in schema cache", "QA entries table not found"

-- ============================================================================
-- 1. qa_entries table (legacy FAQ system)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.qa_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'genel',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  region TEXT NOT NULL CHECK (region IN ('karasu', 'kocaali')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE public.qa_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read qa_entries" ON public.qa_entries;
CREATE POLICY "Public can read qa_entries"
  ON public.qa_entries FOR SELECT
  USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Service role can manage qa_entries" ON public.qa_entries;
CREATE POLICY "Service role can manage qa_entries"
  ON public.qa_entries FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_qa_entries_region_priority
  ON public.qa_entries(region, priority DESC, created_at)
  WHERE deleted_at IS NULL;

-- ============================================================================
-- 2. ai_questions table (AI-managed Q&A for SEO)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ai_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  location_scope TEXT NOT NULL DEFAULT 'karasu' CHECK (location_scope IN ('karasu', 'kocaali', 'global')),
  page_type TEXT NOT NULL DEFAULT 'pillar' CHECK (page_type IN ('pillar', 'cornerstone', 'rehber', 'blog', 'neighborhood', 'comparison')),
  related_entity TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'published')),
  generated_by_ai BOOLEAN DEFAULT true,
  reviewed_by TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE public.ai_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published ai_questions" ON public.ai_questions;
CREATE POLICY "Public can read published ai_questions"
  ON public.ai_questions FOR SELECT
  USING (deleted_at IS NULL AND status = 'published');

DROP POLICY IF EXISTS "Service role can manage ai_questions" ON public.ai_questions;
CREATE POLICY "Service role can manage ai_questions"
  ON public.ai_questions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_ai_questions_location_scope
  ON public.ai_questions(location_scope, page_type, published_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_ai_questions_related_entity
  ON public.ai_questions(related_entity)
  WHERE deleted_at IS NULL AND related_entity IS NOT NULL;

-- ============================================================================
-- 3. Trigger PostgREST schema reload (if function exists)
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'pgrst_reload_schema') THEN
    PERFORM public.pgrst_reload_schema();
  END IF;
END $$;
