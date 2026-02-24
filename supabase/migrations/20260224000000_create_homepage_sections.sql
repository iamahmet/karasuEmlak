-- Homepage sections configuration for admin-managed homepage layout

CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS homepage_sections_display_order_idx
  ON public.homepage_sections (display_order ASC);

ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'homepage_sections'
      AND policyname = 'homepage_sections_public_read'
  ) THEN
    CREATE POLICY homepage_sections_public_read
      ON public.homepage_sections
      FOR SELECT
      USING (true);
  END IF;
END $$;

INSERT INTO public.homepage_sections (slug, name, is_visible, display_order, settings)
VALUES
  ('hero', 'Hero Section', true, 1, '{}'::jsonb),
  ('stats', 'Stats Section', true, 2, '{}'::jsonb),
  ('featured-listings', 'Featured Listings', true, 3, '{}'::jsonb),
  ('neighborhoods', 'Neighborhoods', true, 4, '{}'::jsonb),
  ('blog-news', 'Blog & News', true, 5, '{}'::jsonb),
  ('cta', 'CTA Section', true, 6, '{}'::jsonb),
  ('testimonials', 'Testimonials', true, 7, '{}'::jsonb)
ON CONFLICT (slug) DO NOTHING;
