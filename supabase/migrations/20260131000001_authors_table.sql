-- Authors Table Migration
-- Creates authors table with RLS policies
-- Applied to: lbfimbcvvvbczllhqqlf (env project)

-- Authors table
CREATE TABLE IF NOT EXISTS public.authors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  full_name text NOT NULL,
  title text,
  bio text,
  avatar_url text,
  cover_url text,
  location text,
  languages text[] DEFAULT ARRAY['tr'],
  specialties text[] DEFAULT ARRAY[]::text[],
  social_json jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_authors_slug ON public.authors(slug);
CREATE INDEX IF NOT EXISTS idx_authors_is_active ON public.authors(is_active);

-- RLS Policies
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- Public can view active authors
DROP POLICY IF EXISTS "Public can view active authors" ON public.authors;
CREATE POLICY "Public can view active authors"
  ON public.authors
  FOR SELECT
  TO public
  USING (is_active = true);

-- Service role has full access
DROP POLICY IF EXISTS "Service role has full access to authors" ON public.authors;
CREATE POLICY "Service role has full access to authors"
  ON public.authors
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

-- Grant permissions (CRITICAL for PostgREST visibility)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.authors TO anon, authenticated, service_role;

-- Comments for PostgREST discovery
COMMENT ON TABLE public.authors IS 'Blog yazarları profilleri';

