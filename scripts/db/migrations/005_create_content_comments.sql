-- Migration: Create content_comments table
-- Description: Comments system for articles and listings
-- Date: 2025-01-XX

-- Content Comments Table
CREATE TABLE IF NOT EXISTS public.content_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE,
  listing_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.content_comments(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_email TEXT,
  author_website TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  moderation_note TEXT,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for listings if table exists (will be added later if needed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'listings') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'content_comments_listing_id_fkey'
    ) THEN
      ALTER TABLE public.content_comments 
      ADD CONSTRAINT content_comments_listing_id_fkey 
      FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_comments_content_id ON public.content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_listing_id ON public.content_comments(listing_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_user_id ON public.content_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_parent_id ON public.content_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_status ON public.content_comments(status);
CREATE INDEX IF NOT EXISTS idx_content_comments_created_at ON public.content_comments(created_at DESC);

-- RLS Policies
ALTER TABLE public.content_comments ENABLE ROW LEVEL SECURITY;

-- Public can read approved comments
DROP POLICY IF EXISTS "Public can read approved comments" ON public.content_comments;
CREATE POLICY "Public can read approved comments"
  ON public.content_comments FOR SELECT
  USING (status = 'approved');

-- Users can create comments
DROP POLICY IF EXISTS "Users can create comments" ON public.content_comments;
CREATE POLICY "Users can create comments"
  ON public.content_comments FOR INSERT
  WITH CHECK (true);

-- Users can update their own comments (if pending)
DROP POLICY IF EXISTS "Users can update own pending comments" ON public.content_comments;
CREATE POLICY "Users can update own pending comments"
  ON public.content_comments FOR UPDATE
  USING (
    (user_id = auth.uid() AND status = 'pending') OR
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Service role can manage all comments
DROP POLICY IF EXISTS "Service role can manage all comments" ON public.content_comments;
CREATE POLICY "Service role can manage all comments"
  ON public.content_comments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Staff can manage all comments
DROP POLICY IF EXISTS "Staff can manage all comments" ON public.content_comments;
CREATE POLICY "Staff can manage all comments"
  ON public.content_comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE user_id = auth.uid() AND active = true
    )
    OR auth.jwt() ->> 'role' = 'service_role'
  );
