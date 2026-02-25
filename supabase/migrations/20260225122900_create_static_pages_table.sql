CREATE TABLE IF NOT EXISTS public.static_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  locale text NOT NULL DEFAULT 'tr',
  content text,
  meta_title text,
  meta_description text,
  meta_keywords text,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS static_pages_slug_locale_key
  ON public.static_pages (slug, locale);

CREATE INDEX IF NOT EXISTS idx_static_pages_locale
  ON public.static_pages (locale);

CREATE INDEX IF NOT EXISTS idx_static_pages_published
  ON public.static_pages (is_published);

CREATE OR REPLACE FUNCTION public.set_static_pages_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trg_static_pages_updated_at'
  ) THEN
    CREATE TRIGGER trg_static_pages_updated_at
      BEFORE UPDATE ON public.static_pages
      FOR EACH ROW
      EXECUTE FUNCTION public.set_static_pages_updated_at();
  END IF;
END
$$;
