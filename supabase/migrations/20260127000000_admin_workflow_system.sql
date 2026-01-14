-- =====================================================
-- Admin Workflow System Migration
-- Tarih: 2025-01-27
-- Amaç: Audit logging, version control ve workflow management
-- =====================================================

-- 1. ADMIN AUDIT LOGS TABLE
-- Tüm admin aktivitelerini kaydetmek için
CREATE TABLE IF NOT EXISTS "public"."admin_audit_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  "action" VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'publish', 'approve', etc.
  "resource_type" VARCHAR(50), -- 'article', 'news', 'listing', 'user', etc.
  "resource_id" UUID,
  "resource_slug" TEXT, -- Alternative identifier for resources without UUID
  "changes" JSONB, -- Before/after changes
  "metadata" JSONB DEFAULT '{}'::jsonb, -- Additional context
  "ip_address" INET,
  "user_agent" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS "admin_audit_logs_user_id_idx" ON "public"."admin_audit_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "admin_audit_logs_action_idx" ON "public"."admin_audit_logs" ("action");
CREATE INDEX IF NOT EXISTS "admin_audit_logs_resource_type_idx" ON "public"."admin_audit_logs" ("resource_type");
CREATE INDEX IF NOT EXISTS "admin_audit_logs_resource_id_idx" ON "public"."admin_audit_logs" ("resource_id");
CREATE INDEX IF NOT EXISTS "admin_audit_logs_created_at_idx" ON "public"."admin_audit_logs" ("created_at" DESC);

-- GIN index for JSONB searches
CREATE INDEX IF NOT EXISTS "admin_audit_logs_changes_idx" ON "public"."admin_audit_logs" USING GIN ("changes");
CREATE INDEX IF NOT EXISTS "admin_audit_logs_metadata_idx" ON "public"."admin_audit_logs" USING GIN ("metadata");

-- =====================================================

-- 2. CONTENT VERSIONS TABLE
-- İçerik versiyonlarını saklamak için
CREATE TABLE IF NOT EXISTS "public"."content_versions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "content_type" VARCHAR(50) NOT NULL, -- 'article', 'news', 'listing', 'page'
  "content_id" UUID NOT NULL,
  "version_number" INTEGER NOT NULL,
  "data" JSONB NOT NULL, -- Tüm içerik verisi (snapshot)
  "created_by" UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  "change_note" TEXT, -- Kullanıcı notu (commit message benzeri)
  "is_current" BOOLEAN DEFAULT FALSE, -- En güncel versiyon mu?
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE("content_type", "content_id", "version_number")
);

-- Indexes for content versions
CREATE INDEX IF NOT EXISTS "content_versions_content_idx" ON "public"."content_versions" ("content_type", "content_id");
CREATE INDEX IF NOT EXISTS "content_versions_created_by_idx" ON "public"."content_versions" ("created_by");
CREATE INDEX IF NOT EXISTS "content_versions_created_at_idx" ON "public"."content_versions" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "content_versions_is_current_idx" ON "public"."content_versions" ("is_current") WHERE "is_current" = TRUE;

-- GIN index for JSONB searches
CREATE INDEX IF NOT EXISTS "content_versions_data_idx" ON "public"."content_versions" USING GIN ("data");

-- =====================================================

-- 3. CONTENT REVIEWS TABLE
-- İçerik review sürecini yönetmek için
CREATE TABLE IF NOT EXISTS "public"."content_reviews" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "content_type" VARCHAR(50) NOT NULL,
  "content_id" UUID NOT NULL,
  "reviewer_id" UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  "assigned_by" UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'changes_requested'
  "notes" TEXT,
  "review_data" JSONB, -- Review sırasındaki içerik durumu
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "reviewed_at" TIMESTAMPTZ,
  "completed_at" TIMESTAMPTZ
);

-- Indexes for content reviews
CREATE INDEX IF NOT EXISTS "content_reviews_content_idx" ON "public"."content_reviews" ("content_type", "content_id");
CREATE INDEX IF NOT EXISTS "content_reviews_reviewer_idx" ON "public"."content_reviews" ("reviewer_id");
CREATE INDEX IF NOT EXISTS "content_reviews_status_idx" ON "public"."content_reviews" ("status");
CREATE INDEX IF NOT EXISTS "content_reviews_created_at_idx" ON "public"."content_reviews" ("created_at" DESC);

-- =====================================================

-- 4. UPDATE EXISTING TABLES FOR WORKFLOW SUPPORT

-- Articles table - workflow columns
DO $$ 
BEGIN
  -- Add status column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'status'
  ) THEN
    ALTER TABLE "public"."articles" ADD COLUMN "status" VARCHAR(20) DEFAULT 'draft';
  END IF;

  -- Add assigned_reviewer_id if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'assigned_reviewer_id'
  ) THEN
    ALTER TABLE "public"."articles" ADD COLUMN "assigned_reviewer_id" UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  -- Add review_notes if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'review_notes'
  ) THEN
    ALTER TABLE "public"."articles" ADD COLUMN "review_notes" TEXT;
  END IF;

  -- Add current_version_number if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'articles' AND column_name = 'current_version_number'
  ) THEN
    ALTER TABLE "public"."articles" ADD COLUMN "current_version_number" INTEGER DEFAULT 1;
  END IF;
END $$;

-- Listings table - workflow columns
DO $$ 
BEGIN
  -- Add status column if not exists (listings already has status, but ensure it's workflow-compatible)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'assigned_reviewer_id'
  ) THEN
    ALTER TABLE "public"."listings" ADD COLUMN "assigned_reviewer_id" UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'review_notes'
  ) THEN
    ALTER TABLE "public"."listings" ADD COLUMN "review_notes" TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'listings' AND column_name = 'current_version_number'
  ) THEN
    ALTER TABLE "public"."listings" ADD COLUMN "current_version_number" INTEGER DEFAULT 1;
  END IF;
END $$;

-- =====================================================

-- 5. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on audit logs (admin only)
ALTER TABLE "public"."admin_audit_logs" ENABLE ROW LEVEL SECURITY;

-- Policy: Only staff/admin can view audit logs
CREATE POLICY "admin_audit_logs_select_policy" ON "public"."admin_audit_logs"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "public"."user_roles" ur
      JOIN "public"."roles" r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('super_admin', 'admin', 'staff')
    )
  );

-- Enable RLS on content versions (admin only)
ALTER TABLE "public"."content_versions" ENABLE ROW LEVEL SECURITY;

-- Policy: Only staff/admin can view content versions
CREATE POLICY "content_versions_select_policy" ON "public"."content_versions"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "public"."user_roles" ur
      JOIN "public"."roles" r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('super_admin', 'admin', 'staff')
    )
  );

-- Policy: Only staff/admin can insert content versions
CREATE POLICY "content_versions_insert_policy" ON "public"."content_versions"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."user_roles" ur
      JOIN "public"."roles" r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('super_admin', 'admin', 'staff')
    )
  );

-- Enable RLS on content reviews (admin only)
ALTER TABLE "public"."content_reviews" ENABLE ROW LEVEL SECURITY;

-- Policy: Reviewers and staff can view reviews
CREATE POLICY "content_reviews_select_policy" ON "public"."content_reviews"
  FOR SELECT
  USING (
    reviewer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM "public"."user_roles" ur
      JOIN "public"."roles" r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('super_admin', 'admin', 'staff')
    )
  );

-- Policy: Staff can insert/update reviews
CREATE POLICY "content_reviews_insert_policy" ON "public"."content_reviews"
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."user_roles" ur
      JOIN "public"."roles" r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('super_admin', 'admin', 'staff')
    )
  );

CREATE POLICY "content_reviews_update_policy" ON "public"."content_reviews"
  FOR UPDATE
  USING (
    reviewer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM "public"."user_roles" ur
      JOIN "public"."roles" r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('super_admin', 'admin', 'staff')
    )
  );

-- =====================================================

-- 6. FUNCTIONS AND TRIGGERS

-- Function: Auto-increment version number
CREATE OR REPLACE FUNCTION "public"."increment_content_version"()
RETURNS TRIGGER AS $$
BEGIN
  -- Update current_version_number when content is updated
  IF TG_OP = 'UPDATE' THEN
    NEW.current_version_number := COALESCE(OLD.current_version_number, 0) + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-create version on content update
-- Note: This will be handled in application code for better control
-- But we can add triggers if needed

-- Function: Create audit log entry
CREATE OR REPLACE FUNCTION "public"."create_audit_log"(
  p_action VARCHAR(100),
  p_resource_type VARCHAR(50),
  p_resource_id UUID,
  p_resource_slug TEXT DEFAULT NULL,
  p_changes JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Insert audit log
  INSERT INTO "public"."admin_audit_logs" (
    "user_id",
    "action",
    "resource_type",
    "resource_id",
    "resource_slug",
    "changes",
    "metadata"
  ) VALUES (
    v_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_resource_slug,
    p_changes,
    p_metadata
  ) RETURNING "id" INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================

-- 7. COMMENTS (Documentation)

COMMENT ON TABLE "public"."admin_audit_logs" IS 'Tüm admin panel aktivitelerini kaydeder';
COMMENT ON TABLE "public"."content_versions" IS 'İçerik versiyonlarını saklar, geri alma için';
COMMENT ON TABLE "public"."content_reviews" IS 'İçerik review sürecini yönetir';

COMMENT ON COLUMN "public"."admin_audit_logs"."changes" IS 'Before/after değişiklikleri JSON formatında';
COMMENT ON COLUMN "public"."content_versions"."data" IS 'İçeriğin tam snapshot''ı';
COMMENT ON COLUMN "public"."content_versions"."change_note" IS 'Kullanıcının versiyon için eklediği not';
COMMENT ON COLUMN "public"."content_reviews"."status" IS 'Review durumu: pending, approved, rejected, changes_requested';

-- =====================================================
-- Migration Complete
-- =====================================================
