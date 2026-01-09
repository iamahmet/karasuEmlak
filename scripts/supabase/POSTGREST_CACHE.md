# PostgREST Schema Cache Management

## Problem

PostgREST (Supabase's REST API layer) caches database schema for performance. When you create new tables, columns, or RLS policies via migrations, PostgREST's cache can become stale, causing errors like:

- `PGRST205: Could not find the table 'public.content_comments' in the schema cache`
- `PGRST202: Could not find the function public.get_content_comments(...) in the schema cache`

**Symptoms:**
- Tables exist in database (visible in Supabase Dashboard)
- API calls return empty results or errors
- Admin panel shows "no data" even though data exists

## Solution

We've implemented an automated solution that:

1. **Creates SECURITY DEFINER functions** (`pgrst_reload_schema()`, `pgrst_reload_config()`) that trigger PostgREST cache reload
2. **Automatically reloads cache** after migrations via `scripts/supabase/reload-postgrest.ts`
3. **Provides clear diagnostics** in API responses when cache is stale

## Usage

### Manual Reload

If you notice stale cache issues:

```bash
pnpm supabase:reload-postgrest
```

This will:
- Trigger PostgREST schema reload via RPC
- Wait 2 seconds for cache to update
- Verify critical tables are visible
- Retry up to 3 times with exponential backoff if needed

### Automatic Reload

Cache is automatically reloaded after migrations:

```bash
pnpm supabase:apply-migrations
```

This runs migrations, then automatically calls `reload-postgrest`.

### Admin Doctor

The admin doctor script includes cache verification:

```bash
pnpm admin:doctor
```

## How It Works

### 1. SQL Migration (006_create_postgrest_reload_functions.sql)

Creates two SECURITY DEFINER functions:

```sql
-- Reload schema cache
SELECT public.pgrst_reload_schema();

-- Reload config cache (optional)
SELECT public.pgrst_reload_config();
```

These functions execute `NOTIFY pgrst, 'reload schema';` which tells PostgREST to refresh its schema cache.

### 2. TypeScript Script (scripts/supabase/reload-postgrest.ts)

- Uses service role key (server-side only)
- Calls `pgrst_reload_schema()` RPC function
- Verifies tables are visible after reload
- Retries with exponential backoff if needed

### 3. API Route Diagnostics

When API routes detect `PGRST205` or `PGRST202` errors, they return:

```json
{
  "success": false,
  "code": "POSTGREST_SCHEMA_STALE",
  "message": "PostgREST schema cache is stale. Run: pnpm supabase:reload-postgrest",
  "data": {
    "suggestion": "Run: pnpm supabase:reload-postgrest",
    "documentation": "See scripts/supabase/POSTGREST_CACHE.md"
  }
}
```

## Verification

After running reload, verify tables are accessible:

```bash
# Check comments API
curl http://localhost:3001/api/comments

# Check admin doctor
pnpm admin:doctor
```

## Troubleshooting

### Cache Still Stale After Reload

If tables are still not visible after running reload:

1. **Wait 1-2 minutes** - PostgREST may need time to process the NOTIFY
2. **Check Supabase Dashboard** - Verify table exists in Database > Tables
3. **Run reload again** - Sometimes multiple attempts are needed
4. **Check PostgREST logs** - In Supabase Dashboard > Logs > PostgREST
5. **Contact Supabase Support** - If issue persists, may need infrastructure-level restart

### Function Not Found

If you get "function does not exist" error:

```bash
# Apply migration manually
# Run SQL from: scripts/db/migrations/006_create_postgrest_reload_functions.sql
# Or via Supabase Dashboard > SQL Editor
```

### Service Role Key Missing

Ensure `.env.local` has:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Best Practices

1. **Always run reload after migrations** - Use `pnpm supabase:apply-migrations` which does this automatically
2. **Check admin:doctor** - Before deploying, verify cache is fresh
3. **Monitor API responses** - Watch for `POSTGREST_SCHEMA_STALE` errors
4. **Document cache issues** - If you see persistent cache problems, document them for Supabase Support

## Technical Details

### Why SECURITY DEFINER?

The functions use `SECURITY DEFINER` so they can execute `NOTIFY` commands even when called via RPC with service role key. This ensures server-side code can trigger cache reloads without requiring direct database access.

### Why NOTIFY?

PostgREST listens for `NOTIFY pgrst, 'reload schema'` events. When it receives this, it:
1. Invalidates its schema cache
2. Re-reads schema from `pg_catalog`
3. Rebuilds its internal table/column/function mappings

This is the official way to trigger PostgREST cache reloads.

### Retry Logic

The reload script uses exponential backoff:
- Attempt 1: Wait 2 seconds
- Attempt 2: Wait 2 seconds (if first retry)
- Attempt 3: Wait 4 seconds (if second retry)
- Attempt 4: Wait 5 seconds (max, if third retry)

This gives PostgREST time to process the NOTIFY and rebuild its cache.

## Related Files

- `scripts/db/migrations/006_create_postgrest_reload_functions.sql` - SQL migration
- `scripts/supabase/reload-postgrest.ts` - Reload script
- `scripts/db/apply-migrations.ts` - Migration runner (calls reload automatically)
- `apps/admin/app/api/comments/route.ts` - Example API with cache diagnostics
- `apps/admin/lib/api/error-handler.ts` - Error handler with cache detection
