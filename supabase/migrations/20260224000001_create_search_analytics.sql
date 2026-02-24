-- Search analytics tracking table

CREATE TABLE IF NOT EXISTS public.search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  results_count INTEGER,
  filters JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS search_analytics_timestamp_idx
  ON public.search_analytics (timestamp DESC);

CREATE INDEX IF NOT EXISTS search_analytics_query_idx
  ON public.search_analytics (query);

ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'search_analytics'
      AND policyname = 'search_analytics_no_public_access'
  ) THEN
    CREATE POLICY search_analytics_no_public_access
      ON public.search_analytics
      FOR ALL
      USING (false)
      WITH CHECK (false);
  END IF;
END $$;
