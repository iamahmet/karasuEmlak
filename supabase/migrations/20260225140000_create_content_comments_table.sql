-- Create content_comments table for blog/listing comments
-- Notes:
-- - content_id is intentionally left without FK because comments can target
--   multiple content sources (e.g. articles/news/content_items) with different IDs.
-- - listing_id FK is added conditionally if listings table exists.

CREATE TABLE IF NOT EXISTS public.content_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid,
  listing_id uuid,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_id uuid REFERENCES public.content_comments(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text,
  author_website text,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  moderation_note text,
  approved_at timestamptz,
  rejected_at timestamptz,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'listings'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
        AND table_name = 'content_comments'
        AND constraint_name = 'content_comments_listing_id_fkey'
    ) THEN
      ALTER TABLE public.content_comments
        ADD CONSTRAINT content_comments_listing_id_fkey
        FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_content_comments_content_id ON public.content_comments(content_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_listing_id ON public.content_comments(listing_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_user_id ON public.content_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_parent_id ON public.content_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_status ON public.content_comments(status);
CREATE INDEX IF NOT EXISTS idx_content_comments_created_at ON public.content_comments(created_at DESC);

ALTER TABLE public.content_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read approved comments" ON public.content_comments;
CREATE POLICY "Public can read approved comments"
  ON public.content_comments
  FOR SELECT
  USING (status = 'approved');

DROP POLICY IF EXISTS "Users can create comments" ON public.content_comments;
CREATE POLICY "Users can create comments"
  ON public.content_comments
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own pending comments" ON public.content_comments;
CREATE POLICY "Users can update own pending comments"
  ON public.content_comments
  FOR UPDATE
  USING (
    (user_id = auth.uid() AND status = 'pending')
    OR auth.jwt() ->> 'role' = 'service_role'
  );

DROP POLICY IF EXISTS "Service role can manage all comments" ON public.content_comments;
CREATE POLICY "Service role can manage all comments"
  ON public.content_comments
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Staff can manage all comments" ON public.content_comments;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'staff_profiles'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Staff can manage all comments"
        ON public.content_comments
        FOR ALL
        USING (
          EXISTS (
            SELECT 1
            FROM public.staff_profiles
            WHERE user_id = auth.uid() AND active = true
          )
          OR auth.jwt() ->> 'role' = 'service_role'
        )
        WITH CHECK (
          EXISTS (
            SELECT 1
            FROM public.staff_profiles
            WHERE user_id = auth.uid() AND active = true
          )
          OR auth.jwt() ->> 'role' = 'service_role'
        )
    $policy$;
  END IF;
END $$;
