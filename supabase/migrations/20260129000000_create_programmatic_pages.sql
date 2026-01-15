-- Create programmatic_pages table for dynamic content pages
CREATE TABLE IF NOT EXISTS "public"."programmatic_pages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL UNIQUE,
  "type" TEXT NOT NULL CHECK (type IN ('prayer_times', 'imsakiye', 'iftar', 'weather', 'jobs', 'obituary', 'pharmacy', 'other')),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "update_frequency" INTEGER NOT NULL DEFAULT 60, -- minutes
  "last_updated" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "config" JSONB DEFAULT '{}'::jsonb, -- Page-specific configuration
  "metadata" JSONB DEFAULT '{}'::jsonb, -- Additional metadata
  "views" INTEGER DEFAULT 0,
  "seo_title" TEXT,
  "seo_description" TEXT,
  "seo_keywords" TEXT[],
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deleted_at" TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "programmatic_pages_slug_idx" ON "public"."programmatic_pages" ("slug");
CREATE INDEX IF NOT EXISTS "programmatic_pages_type_idx" ON "public"."programmatic_pages" ("type");
CREATE INDEX IF NOT EXISTS "programmatic_pages_is_active_idx" ON "public"."programmatic_pages" ("is_active");
CREATE INDEX IF NOT EXISTS "programmatic_pages_deleted_at_idx" ON "public"."programmatic_pages" ("deleted_at");
CREATE INDEX IF NOT EXISTS "programmatic_pages_created_at_idx" ON "public"."programmatic_pages" ("created_at" DESC);

-- Enable RLS
ALTER TABLE "public"."programmatic_pages" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can read active pages
CREATE POLICY "Public can read active programmatic pages"
  ON "public"."programmatic_pages"
  FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- Admin can do everything (via service role)
-- Service role bypasses RLS, so no policy needed for admin operations
