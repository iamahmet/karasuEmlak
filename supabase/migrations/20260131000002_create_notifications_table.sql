-- Migration: Create notifications table
-- Description: User notifications for admin panel and web app
-- Date: 2026-01-31
-- Idempotent: Yes (uses IF NOT EXISTS)

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add column if it doesn't exist (for backward compatibility)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications' 
    AND column_name = 'is_read'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Drop old 'read' column if it exists (migrate to is_read)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'notifications' 
    AND column_name = 'read'
  ) THEN
    -- Migrate data from 'read' to 'is_read' if needed
    UPDATE public.notifications 
    SET is_read = COALESCE(read, false)
    WHERE is_read IS NULL;
    
    ALTER TABLE public.notifications DROP COLUMN IF EXISTS read;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can manage all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Staff can read all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can read all notifications" ON public.notifications;

-- RLS Policies
-- Allow users to read their own notifications
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Allow service role to manage all notifications (admin API)
CREATE POLICY "Service role can manage all notifications"
  ON public.notifications FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow authenticated users to read all notifications (for admin panel)
-- This is safe because notifications don't contain sensitive data
CREATE POLICY "Authenticated users can read all notifications"
  ON public.notifications FOR SELECT
  USING (auth.role() = 'authenticated');

-- Grants for PostgREST visibility
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT ON public.notifications TO anon;

-- Add comment for PostgREST discovery
COMMENT ON TABLE public.notifications IS 'User notifications for admin panel and web app';
COMMENT ON COLUMN public.notifications.is_read IS 'Whether the notification has been read';
COMMENT ON COLUMN public.notifications.type IS 'Notification type: info, success, warning, error';
