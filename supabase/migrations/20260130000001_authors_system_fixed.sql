-- Authors System Migration (Fixed - Conditional FK constraints)
-- Creates authors and article_authors tables with RLS policies

-- Authors table (without FK constraints first)
CREATE TABLE IF NOT EXISTS public.authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  full_name text NOT NULL,
  title text,
  bio text,
  avatar_media_id uuid,
  cover_media_id uuid,
  location text,
  languages text[] DEFAULT ARRAY['tr'],
  specialties text[] DEFAULT ARRAY[]::text[],
  social_json jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraints if media_assets exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media_assets') THEN
    -- Drop existing constraints if any
    ALTER TABLE public.authors DROP CONSTRAINT IF EXISTS authors_avatar_media_id_fkey;
    ALTER TABLE public.authors DROP CONSTRAINT IF EXISTS authors_cover_media_id_fkey;
    
    -- Add foreign key constraints
    ALTER TABLE public.authors
      ADD CONSTRAINT authors_avatar_media_id_fkey FOREIGN KEY (avatar_media_id) REFERENCES public.media_assets(id) ON DELETE SET NULL;
    
    ALTER TABLE public.authors
      ADD CONSTRAINT authors_cover_media_id_fkey FOREIGN KEY (cover_media_id) REFERENCES public.media_assets(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Article authors pivot table (without FK first)
CREATE TABLE IF NOT EXISTS public.article_authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  author_id uuid NOT NULL,
  role text DEFAULT 'author' CHECK (role IN ('author', 'editor')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_id, author_id, role)
);

-- Add foreign keys if tables exist
DO $$
BEGIN
  -- Add author_id FK (authors table should exist now)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'authors') THEN
    ALTER TABLE public.article_authors DROP CONSTRAINT IF EXISTS article_authors_author_id_fkey;
    ALTER TABLE public.article_authors
      ADD CONSTRAINT article_authors_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE CASCADE;
  END IF;
  
  -- Add article_id FK if articles exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'articles') THEN
    ALTER TABLE public.article_authors DROP CONSTRAINT IF EXISTS article_authors_article_id_fkey;
    ALTER TABLE public.article_authors
      ADD CONSTRAINT article_authors_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add primary_author_id to articles if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'articles') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'articles' AND column_name = 'primary_author_id') THEN
      ALTER TABLE public.articles
        ADD COLUMN primary_author_id uuid;
      
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'authors') THEN
        ALTER TABLE public.articles
          ADD CONSTRAINT articles_primary_author_id_fkey FOREIGN KEY (primary_author_id) REFERENCES public.authors(id) ON DELETE SET NULL;
      END IF;
    END IF;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_authors_slug ON public.authors(slug);
CREATE INDEX IF NOT EXISTS idx_authors_is_active ON public.authors(is_active);
CREATE INDEX IF NOT EXISTS idx_article_authors_article_id ON public.article_authors(article_id);
CREATE INDEX IF NOT EXISTS idx_article_authors_author_id ON public.article_authors(author_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'articles') THEN
    CREATE INDEX IF NOT EXISTS idx_articles_primary_author_id ON public.articles(primary_author_id);
  END IF;
END $$;

-- RLS Policies for authors
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active authors" ON public.authors;
CREATE POLICY "Public can view active authors"
  ON public.authors
  FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Service role has full access to authors" ON public.authors;
CREATE POLICY "Service role has full access to authors"
  ON public.authors
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for article_authors
ALTER TABLE public.article_authors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view authors of published articles" ON public.article_authors;
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

DROP POLICY IF EXISTS "Service role has full access to article_authors" ON public.article_authors;
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
DROP TRIGGER IF EXISTS update_authors_updated_at ON public.authors;
CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON public.authors
  FOR EACH ROW
  EXECUTE FUNCTION update_authors_updated_at();

-- Function to sync primary_author_id from article_authors
CREATE OR REPLACE FUNCTION sync_primary_author_id()
RETURNS TRIGGER AS $$
BEGIN
  -- When article_authors is inserted/updated, sync primary_author_id
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'articles') THEN
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync primary_author_id
DROP TRIGGER IF EXISTS sync_primary_author_id_trigger ON public.article_authors;
CREATE TRIGGER sync_primary_author_id_trigger
  AFTER INSERT OR UPDATE ON public.article_authors
  FOR EACH ROW
  EXECUTE FUNCTION sync_primary_author_id();

-- Grant permissions
GRANT SELECT ON public.authors TO anon, authenticated;
GRANT SELECT ON public.article_authors TO anon, authenticated;

COMMENT ON TABLE public.authors IS 'Blog yazarları profilleri';
COMMENT ON TABLE public.article_authors IS 'Yazı-yazar ilişki tablosu (many-to-many)';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'articles') THEN
    COMMENT ON COLUMN public.articles.primary_author_id IS 'Hızlı join için birincil yazar ID (article_authors tablosundan sync edilir)';
  END IF;
END $$;
