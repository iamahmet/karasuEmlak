-- Migration: Create staff profiles table for RBAC
-- Description: Staff profiles for role-based access control
-- Date: 2024-12-31

CREATE TABLE IF NOT EXISTS public.staff_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'admin', 'super_admin')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_profiles_user_id ON public.staff_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_active ON public.staff_profiles(active);

-- RLS Policies
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own staff profile" ON public.staff_profiles;
CREATE POLICY "Users can read own staff profile"
  ON public.staff_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all staff profiles" ON public.staff_profiles;
CREATE POLICY "Service role can manage all staff profiles"
  ON public.staff_profiles FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Admins can read all staff profiles" ON public.staff_profiles;
CREATE POLICY "Admins can read all staff profiles"
  ON public.staff_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND active = true
    )
    OR auth.jwt() ->> 'role' = 'service_role'
  );
