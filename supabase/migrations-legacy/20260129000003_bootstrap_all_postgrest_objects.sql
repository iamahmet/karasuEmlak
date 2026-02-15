-- Bootstrap Migration: Ensure all PostgREST-required objects exist
-- This migration ensures critical tables, views, and functions are created
-- Run this after all other migrations to ensure nothing is missing

-- 1. Ensure pgrst_reload_schema function exists (idempotent)
CREATE OR REPLACE FUNCTION public.pgrst_reload_schema()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
  RETURN json_build_object(
    'ok', true,
    'ts', now(),
    'message', 'PostgREST schema reload triggered'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'ok', false,
      'error', SQLERRM,
      'ts', now()
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.pgrst_reload_schema() TO anon, authenticated, service_role;

-- 2. Ensure all critical tables have proper grants
-- (This is idempotent - GRANT is safe to run multiple times)

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Note: Individual table grants should be in their respective migrations
-- This migration ensures the reload function exists

-- 3. Trigger cache reload
NOTIFY pgrst, 'reload schema';

-- Comments
COMMENT ON FUNCTION public.pgrst_reload_schema() IS 'Triggers PostgREST schema cache reload via NOTIFY. Safe to call multiple times.';
