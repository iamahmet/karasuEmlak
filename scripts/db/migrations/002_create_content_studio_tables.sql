-- Migration: Create Content Studio tables
-- Description: content_items and content_locales for content management
-- Date: 2024-12-31

-- Content Items Table
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'normal',
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  featured_image_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_items_status ON public.content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_items_slug ON public.content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_items_created_at ON public.content_items(created_at DESC);

-- Content Locales Table
CREATE TABLE IF NOT EXISTS public.content_locales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  locale TEXT NOT NULL CHECK (locale IN ('tr', 'en', 'et', 'ru', 'ar')),
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  translation_status TEXT DEFAULT 'draft' CHECK (translation_status IN ('draft', 'review', 'approved', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_item_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_content_locales_content_item_id ON public.content_locales(content_item_id);
CREATE INDEX IF NOT EXISTS idx_content_locales_locale ON public.content_locales(locale);

-- RLS Policies for content_items
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published content" ON public.content_items;
CREATE POLICY "Public can read published content"
  ON public.content_items FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Service role can manage all content" ON public.content_items;
CREATE POLICY "Service role can manage all content"
  ON public.content_items FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Staff can manage all content" ON public.content_items;
CREATE POLICY "Staff can manage all content"
  ON public.content_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE user_id = auth.uid() AND active = true
    )
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- RLS Policies for content_locales
ALTER TABLE public.content_locales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published content locales" ON public.content_locales;
CREATE POLICY "Public can read published content locales"
  ON public.content_locales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.content_items
      WHERE id = content_item_id AND status = 'published'
    )
  );

DROP POLICY IF EXISTS "Service role can manage all content locales" ON public.content_locales;
CREATE POLICY "Service role can manage all content locales"
  ON public.content_locales FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Staff can manage all content locales" ON public.content_locales;
CREATE POLICY "Staff can manage all content locales"
  ON public.content_locales FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE user_id = auth.uid() AND active = true
    )
    OR auth.jwt() ->> 'role' = 'service_role'
  );
