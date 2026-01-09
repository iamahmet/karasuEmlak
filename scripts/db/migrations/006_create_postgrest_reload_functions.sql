-- Migration: Create PostgREST schema reload functions
-- Description: SECURITY DEFINER functions to reload PostgREST schema cache
-- Date: 2025-01-XX
-- 
-- Why: PostgREST caches database schema. When tables/columns/policies change,
--      the cache can become stale, causing PGRST205 errors.
-- 
-- Solution: These functions allow server-side code to trigger PostgREST
--           schema reload via NOTIFY commands.

-- Function: Reload PostgREST schema cache
-- Usage: SELECT public.pgrst_reload_schema();
CREATE OR REPLACE FUNCTION public.pgrst_reload_schema()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Send NOTIFY to PostgREST to reload schema cache
  PERFORM pg_notify('pgrst', 'reload schema');
  
  RETURN json_build_object(
    'ok', true,
    'ts', now(),
    'message', 'PostgREST schema reload triggered'
  );
END;
$$;

-- Function: Reload PostgREST config cache
-- Usage: SELECT public.pgrst_reload_config();
CREATE OR REPLACE FUNCTION public.pgrst_reload_config()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Send NOTIFY to PostgREST to reload config cache
  PERFORM pg_notify('pgrst', 'reload config');
  
  RETURN json_build_object(
    'ok', true,
    'ts', now(),
    'message', 'PostgREST config reload triggered'
  );
END;
$$;

-- Grant execute to service_role (via authenticated role)
-- Service role can call these functions
GRANT EXECUTE ON FUNCTION public.pgrst_reload_schema() TO authenticated;
GRANT EXECUTE ON FUNCTION public.pgrst_reload_config() TO authenticated;

-- Also grant to anon for development (can be restricted in production)
-- In production, only service_role should be able to call these
GRANT EXECUTE ON FUNCTION public.pgrst_reload_schema() TO anon;
GRANT EXECUTE ON FUNCTION public.pgrst_reload_config() TO anon;

-- Comment for documentation
COMMENT ON FUNCTION public.pgrst_reload_schema() IS 
  'Triggers PostgREST schema cache reload. Call via RPC: supabase.rpc("pgrst_reload_schema"). Server-side only.';

COMMENT ON FUNCTION public.pgrst_reload_config() IS 
  'Triggers PostgREST config cache reload. Call via RPC: supabase.rpc("pgrst_reload_config"). Server-side only.';
