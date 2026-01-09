-- Migration: Create topic clusters table
-- Description: Topic clusters for content organization
-- Date: 2024-12-31

CREATE TABLE IF NOT EXISTS public.topic_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topic_clusters_created_at ON public.topic_clusters(created_at DESC);

-- RLS Policies
ALTER TABLE public.topic_clusters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage all clusters" ON public.topic_clusters;
CREATE POLICY "Service role can manage all clusters"
  ON public.topic_clusters FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Staff can manage all clusters" ON public.topic_clusters;
CREATE POLICY "Staff can manage all clusters"
  ON public.topic_clusters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE user_id = auth.uid() AND active = true
    )
    OR auth.jwt() ->> 'role' = 'service_role'
  );
