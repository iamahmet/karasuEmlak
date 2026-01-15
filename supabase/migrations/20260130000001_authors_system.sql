-- Authors System Migration
-- Creates authors and article_authors tables with RLS policies

-- Authors table
CREATE TABLE IF NOT EXISTS public.authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  full_name text NOT NULL,
  title text,
  bio text,
  avatar_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  cover_media_id uuid REFERENCES public.media_assets(id) ON DELETE SET NULL,
  location text,
  languages text[] DEFAULT ARRAY['tr'],
  specialties text[] DEFAULT ARRAY[]::text[],
  social_json jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Article authors pivot table (many-to-many, future-proof)
CREATE TABLE IF NOT EXISTS public.article_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.authors(id) ON DELETE CASCADE,
  role text DEFAULT 'author' CHECK (role IN ('author', 'editor')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_id, author_id, role)
);

-- Add primary_author_id to articles for quick joins
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS primary_author_id uuid REFERENCES public.authors(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_authors_slug ON public.authors(slug);
CREATE INDEX IF NOT EXISTS idx_authors_is_active ON public.authors(is_active);
CREATE INDEX IF NOT EXISTS idx_article_authors_article_id ON public.article_authors(article_id);
CREATE INDEX IF NOT EXISTS idx_article_authors_author_id ON public.article_authors(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_primary_author_id ON public.articles(primary_author_id);

-- RLS Policies for authors
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- Public can only see active authors
CREATE POLICY "Public can view active authors"
  ON public.authors
  FOR SELECT
  TO public
  USING (is_active = true);

-- Service role has full access
CREATE POLICY "Service role has full access to authors"
  ON public.authors
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for article_authors
ALTER TABLE public.article_authors ENABLE ROW LEVEL SECURITY;

-- Public can only see authors of published articles
CREATE POLICY "Public can view authors of published articles"
  ON public.article_authors
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.articles
      WHERE articles.id = article_authors.article_id
      AND articles.status = 'published'
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to article_authors"
  ON public.article_authors
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_authors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for authors updated_at
CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON public.authors
  FOR EACH ROW
  EXECUTE FUNCTION update_authors_updated_at();

-- Function to sync primary_author_id from article_authors
CREATE OR REPLACE FUNCTION sync_primary_author_id()
RETURNS TRIGGER AS $$
BEGIN
  -- When article_authors is inserted/updated, sync primary_author_id
  UPDATE public.articles
  SET primary_author_id = (
    SELECT author_id
    FROM public.article_authors
    WHERE article_id = NEW.article_id
    AND role = 'author'
    ORDER BY created_at ASC
    LIMIT 1
  )
  WHERE id = NEW.article_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync primary_author_id
CREATE TRIGGER sync_primary_author_id_trigger
  AFTER INSERT OR UPDATE ON public.article_authors
  FOR EACH ROW
  EXECUTE FUNCTION sync_primary_author_id();

-- Grant permissions
GRANT SELECT ON public.authors TO anon, authenticated;
GRANT SELECT ON public.article_authors TO anon, authenticated;

COMMENT ON TABLE public.authors IS 'Blog yazarları profilleri';
COMMENT ON TABLE public.article_authors IS 'Yazı-yazar ilişki tablosu (many-to-many)';
COMMENT ON COLUMN public.articles.primary_author_id IS 'Hızlı join için birincil yazar ID (article_authors tablosundan sync edilir)';
