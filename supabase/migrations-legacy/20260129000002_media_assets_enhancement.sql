-- Media Assets Enhancement Migration
-- Adds article_media junction table and enhances media_assets for blog content pipeline

-- 1. Ensure media_assets table has all required columns
DO $$
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'media_assets' AND column_name = 'provider'
  ) THEN
    ALTER TABLE public.media_assets ADD COLUMN provider TEXT DEFAULT 'cloudinary';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'media_assets' AND column_name = 'public_id'
  ) THEN
    ALTER TABLE public.media_assets ADD COLUMN public_id TEXT;
    -- Migrate from cloudinary_public_id if exists
    UPDATE public.media_assets 
    SET public_id = cloudinary_public_id 
    WHERE cloudinary_public_id IS NOT NULL AND public_id IS NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'media_assets' AND column_name = 'secure_url'
  ) THEN
    ALTER TABLE public.media_assets ADD COLUMN secure_url TEXT;
    -- Migrate from cloudinary_secure_url if exists
    UPDATE public.media_assets 
    SET secure_url = cloudinary_secure_url 
    WHERE cloudinary_secure_url IS NOT NULL AND secure_url IS NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'media_assets' AND column_name = 'blurhash'
  ) THEN
    ALTER TABLE public.media_assets ADD COLUMN blurhash TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'media_assets' AND column_name = 'lqip_base64'
  ) THEN
    ALTER TABLE public.media_assets ADD COLUMN lqip_base64 TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'media_assets' AND column_name = 'caption'
  ) THEN
    ALTER TABLE public.media_assets ADD COLUMN caption TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'media_assets' AND column_name = 'credits'
  ) THEN
    ALTER TABLE public.media_assets ADD COLUMN credits TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'media_assets' AND column_name = 'srcset_json'
  ) THEN
    ALTER TABLE public.media_assets ADD COLUMN srcset_json JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- 2. Create article_media junction table
CREATE TABLE IF NOT EXISTS public.article_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  placement TEXT NOT NULL CHECK (placement IN ('featured', 'inline')),
  order_index INTEGER DEFAULT 0,
  context_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, media_id, placement)
);

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_article_media_article_id 
  ON public.article_media(article_id);

CREATE INDEX IF NOT EXISTS idx_article_media_media_id 
  ON public.article_media(media_id);

CREATE INDEX IF NOT EXISTS idx_article_media_placement 
  ON public.article_media(placement);

CREATE INDEX IF NOT EXISTS idx_article_media_order 
  ON public.article_media(article_id, order_index);

-- 4. Add featured_image_id to articles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'featured_image_id'
  ) THEN
    ALTER TABLE public.articles ADD COLUMN featured_image_id UUID 
      REFERENCES public.media_assets(id) ON DELETE SET NULL;
  END IF;

  -- Migrate from featured_image (text) to featured_image_id if possible
  -- This is a best-effort migration, may not match all cases
  WITH matches AS (
    SELECT DISTINCT ON (a.id)
      a.id AS article_id,
      ma.id AS media_id
    FROM public.articles a
    JOIN public.media_assets ma
      ON (
        ma.cloudinary_public_id = a.featured_image
        OR ma.cloudinary_secure_url = a.featured_image
        OR ma.secure_url = a.featured_image
      )
    WHERE a.featured_image IS NOT NULL
      AND a.featured_image_id IS NULL
    ORDER BY a.id, ma.created_at DESC NULLS LAST, ma.id
  )
  UPDATE public.articles a
  SET featured_image_id = matches.media_id
  FROM matches
  WHERE a.id = matches.article_id;
END $$;

-- 5. Add schema_json to articles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'schema_json'
  ) THEN
    ALTER TABLE public.articles ADD COLUMN schema_json JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- 6. Add reading_time and word_count to articles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'reading_time'
  ) THEN
    ALTER TABLE public.articles ADD COLUMN reading_time INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'word_count'
  ) THEN
    ALTER TABLE public.articles ADD COLUMN word_count INTEGER;
  END IF;
END $$;

-- 7. RLS Policies for media_assets
DROP POLICY IF EXISTS "Public can view published article media" ON public.media_assets;
CREATE POLICY "Public can view published article media" ON public.media_assets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.article_media am
      JOIN public.articles a ON am.article_id = a.id
      WHERE am.media_id = media_assets.id
      AND a.status = 'published'
    )
    OR ai_generated = false -- Non-AI images are public
  );

DROP POLICY IF EXISTS "Service role can manage all media" ON public.media_assets;
CREATE POLICY "Service role can manage all media" ON public.media_assets
  FOR ALL
  USING (auth.role() = 'service_role');

-- 8. RLS Policies for article_media
ALTER TABLE public.article_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published article media links" ON public.article_media;
CREATE POLICY "Public can view published article media links" ON public.article_media
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.articles a
      WHERE a.id = article_media.article_id
      AND a.status = 'published'
    )
  );

DROP POLICY IF EXISTS "Service role can manage article media" ON public.article_media;
CREATE POLICY "Service role can manage article media" ON public.article_media
  FOR ALL
  USING (auth.role() = 'service_role');

-- 9. Comments
COMMENT ON TABLE public.article_media IS 'Junction table linking articles to media assets with placement and ordering';
COMMENT ON COLUMN public.article_media.placement IS 'Where the image appears: featured (hero) or inline (within content)';
COMMENT ON COLUMN public.article_media.order_index IS 'Order of inline images within article content';
COMMENT ON COLUMN public.article_media.context_json IS 'Additional context: alt text override, caption, etc.';

COMMENT ON COLUMN public.media_assets.srcset_json IS 'Responsive image srcset data: [{width, url}, ...]';
COMMENT ON COLUMN public.media_assets.blurhash IS 'Blurhash string for placeholder';
COMMENT ON COLUMN public.media_assets.lqip_base64 IS 'Low Quality Image Placeholder base64';
