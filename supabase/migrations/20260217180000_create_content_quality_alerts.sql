-- Content Quality Alerts for admin notifications
-- Stores quality check results for admin review

CREATE TABLE IF NOT EXISTS public.content_quality_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('low_quality', 'ai_detected', 'html_error', 'seo_issue')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  article_id UUID,
  article_title TEXT,
  article_slug TEXT,
  article_type TEXT CHECK (article_type IN ('article', 'news')),
  message TEXT NOT NULL,
  score INTEGER,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_quality_alerts_severity ON public.content_quality_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_content_quality_alerts_article_id ON public.content_quality_alerts(article_id);
CREATE INDEX IF NOT EXISTS idx_content_quality_alerts_created_at ON public.content_quality_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_quality_alerts_is_resolved ON public.content_quality_alerts(is_resolved);

ALTER TABLE public.content_quality_alerts ENABLE ROW LEVEL SECURITY;

-- Only service role and authenticated staff can access
CREATE POLICY "Service role full access content_quality_alerts"
  ON public.content_quality_alerts FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Authenticated users can read content_quality_alerts"
  ON public.content_quality_alerts FOR SELECT
  USING (auth.role() = 'authenticated');
