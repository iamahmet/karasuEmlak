-- Enhanced PostgREST Cache Reload System
-- This migration enhances the cache reload mechanism to be more reliable

-- 1. Create or replace the reload function with better error handling
CREATE OR REPLACE FUNCTION public.pgrst_reload_schema()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Send NOTIFY to PostgREST
  PERFORM pg_notify('pgrst', 'reload schema');
  
  -- Also try reload config
  PERFORM pg_notify('pgrst', 'reload config');
  
  result := json_build_object(
    'ok', true,
    'ts', now(),
    'message', 'PostgREST schema and config reload triggered',
    'notified', true
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'ok', false,
      'error', SQLERRM,
      'ts', now()
    );
END;
$$;

-- 2. Create a function that automatically reloads cache after table changes
-- This will be called via triggers on schema changes
CREATE OR REPLACE FUNCTION public.pgrst_auto_reload_on_schema_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Wait a bit for the change to be committed
  PERFORM pg_sleep(0.5);
  
  -- Trigger reload
  PERFORM pg_notify('pgrst', 'reload schema');
  
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the transaction if reload fails
    RETURN NULL;
END;
$$;

-- 3. Create a function to check if a table is visible in PostgREST cache
CREATE OR REPLACE FUNCTION public.pgrst_check_table_visibility(table_name TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists BOOLEAN;
  result JSON;
BEGIN
  -- Check if table exists in information_schema
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = pgrst_check_table_visibility.table_name
  ) INTO table_exists;
  
  result := json_build_object(
    'table', table_name,
    'exists', table_exists,
    'checked_at', now()
  );
  
  RETURN result;
END;
$$;

-- 4. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.pgrst_reload_schema() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.pgrst_check_table_visibility(TEXT) TO anon, authenticated, service_role;

-- 5. Create a view to monitor PostgREST cache status
CREATE OR REPLACE VIEW public.postgrest_cache_status AS
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    ) THEN 'exists'
    ELSE 'missing'
  END as status,
  now() as checked_at
FROM (
  VALUES 
    ('articles'),
    ('listings'),
    ('news_articles'),
    ('programmatic_pages'),
    ('qa_entries'),
    ('content_comments'),
    ('notifications')
) AS critical_tables(table_name);

-- Grant read access
GRANT SELECT ON public.postgrest_cache_status TO anon, authenticated;

COMMENT ON FUNCTION public.pgrst_reload_schema() IS 'Triggers PostgREST schema cache reload via NOTIFY';
COMMENT ON FUNCTION public.pgrst_check_table_visibility(TEXT) IS 'Checks if a table exists in the database schema';
COMMENT ON VIEW public.postgrest_cache_status IS 'Shows status of critical tables for PostgREST cache monitoring';
