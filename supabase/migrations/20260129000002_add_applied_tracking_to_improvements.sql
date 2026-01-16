-- Migration: Add applied tracking to content_ai_improvements
-- Date: 2026-01-29
-- Purpose: Track whether improvements were applied to content

-- Add applied tracking columns
ALTER TABLE "public"."content_ai_improvements"
  ADD COLUMN IF NOT EXISTS "applied" BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "applied_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "applied_by" UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add index for applied status
CREATE INDEX IF NOT EXISTS "content_ai_improvements_applied_idx" 
  ON "public"."content_ai_improvements" ("applied", "applied_at" DESC);

-- Add comment
COMMENT ON COLUMN "public"."content_ai_improvements"."applied" IS 'Whether the improvement was applied to the content';
COMMENT ON COLUMN "public"."content_ai_improvements"."applied_at" IS 'When the improvement was applied';
COMMENT ON COLUMN "public"."content_ai_improvements"."applied_by" IS 'User who applied the improvement';
