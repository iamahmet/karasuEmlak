-- Migration: AI Improvements Queue
-- Date: 2026-01-28
-- Purpose: Create table to track AI content improvement requests and results

CREATE TABLE IF NOT EXISTS "public"."content_ai_improvements" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "content_type" VARCHAR(50) NOT NULL, -- 'article', 'news', 'listing', 'page'
  "content_id" UUID NOT NULL,
  "field" VARCHAR(100) NOT NULL, -- 'emlak_analysis', 'content', etc.
  "status" VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'approved', 'rejected'
  "original_content" TEXT NOT NULL,
  "improved_content" TEXT,
  "quality_analysis" JSONB, -- Original quality analysis
  "improvement_result" JSONB, -- Full improvement result with scores, suggestions, etc.
  "progress" INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  "progress_message" TEXT,
  "error_message" TEXT,
  "created_by" UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  "approved_by" UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  "approved_at" TIMESTAMPTZ,
  "rejected_at" TIMESTAMPTZ,
  "rejection_reason" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "completed_at" TIMESTAMPTZ,
  "started_at" TIMESTAMPTZ
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS "content_ai_improvements_content_idx" 
  ON "public"."content_ai_improvements" ("content_type", "content_id");

CREATE INDEX IF NOT EXISTS "content_ai_improvements_status_idx" 
  ON "public"."content_ai_improvements" ("status");

CREATE INDEX IF NOT EXISTS "content_ai_improvements_created_by_idx" 
  ON "public"."content_ai_improvements" ("created_by");

CREATE INDEX IF NOT EXISTS "content_ai_improvements_created_at_idx" 
  ON "public"."content_ai_improvements" ("created_at" DESC);

-- Composite index for status + created_at (for kanban queries)
CREATE INDEX IF NOT EXISTS "content_ai_improvements_status_created_idx" 
  ON "public"."content_ai_improvements" ("status", "created_at" DESC);

-- GIN index for JSONB searches
CREATE INDEX IF NOT EXISTS "content_ai_improvements_analysis_idx" 
  ON "public"."content_ai_improvements" USING GIN ("quality_analysis");

CREATE INDEX IF NOT EXISTS "content_ai_improvements_result_idx" 
  ON "public"."content_ai_improvements" USING GIN ("improvement_result");

-- RLS Policies
ALTER TABLE "public"."content_ai_improvements" ENABLE ROW LEVEL SECURITY;

-- Policy: Staff can view all improvements
CREATE POLICY "Staff can view all AI improvements"
  ON "public"."content_ai_improvements"
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
           OR auth.users.raw_user_meta_data->>'role' = 'staff')
    )
  );

-- Policy: Staff can create improvements
CREATE POLICY "Staff can create AI improvements"
  ON "public"."content_ai_improvements"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
           OR auth.users.raw_user_meta_data->>'role' = 'staff')
    )
  );

-- Policy: Staff can update improvements
CREATE POLICY "Staff can update AI improvements"
  ON "public"."content_ai_improvements"
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
           OR auth.users.raw_user_meta_data->>'role' = 'staff')
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_content_ai_improvements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_ai_improvements_updated_at
  BEFORE UPDATE ON "public"."content_ai_improvements"
  FOR EACH ROW
  EXECUTE FUNCTION update_content_ai_improvements_updated_at();

COMMENT ON TABLE "public"."content_ai_improvements" IS 'Tracks AI content improvement requests and results for review and approval workflow';
COMMENT ON COLUMN "public"."content_ai_improvements"."status" IS 'pending: waiting to be processed, processing: currently being improved, completed: improvement done, failed: error occurred, approved: approved and applied, rejected: rejected by reviewer';
