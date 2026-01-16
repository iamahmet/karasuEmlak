# PostgREST Schema Cache Runbook

## Quick Fix (60 seconds)

If you see **PGRST205** or **"schema cache"** errors:

### Option 1: Via API (Recommended)
```bash
# Reload PostgREST schema cache via API
curl -X POST http://localhost:3001/api/admin/reload-postgrest
```

### Option 2: Via Script
```bash
pnpm supabase:reload-postgrest
```

### Option 3: Manual (Supabase Dashboard)
1. Go to Supabase Dashboard → Settings → API
2. Click "Restart" or "Reload Schema"
3. Wait 10-30 seconds
4. Verify: `pnpm db:verify`

---

## Prevention Workflow

### Before Deploying Migrations

1. **Verify current state:**
   ```bash
   pnpm db:verify
   ```

2. **Apply migrations:**
   ```bash
   pnpm db:migrate
   ```
   This runs migrations AND verifies afterward.

3. **If verification fails:**
   ```bash
   pnpm supabase:reload-postgrest
   pnpm db:verify
   ```

### After Creating New Tables/Views/Functions

1. **Ensure migration is idempotent:**
   ```sql
   CREATE TABLE IF NOT EXISTS public.my_table (...);
   CREATE OR REPLACE FUNCTION public.my_function() ...;
   ```

2. **Add GRANT statements:**
   ```sql
   GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
   GRANT SELECT ON public.my_table TO anon, authenticated, service_role;
   ```

3. **Add COMMENT (helps PostgREST discovery):**
   ```sql
   COMMENT ON TABLE public.my_table IS 'Description';
   ```

4. **Reload cache:**
   ```bash
   pnpm supabase:reload-postgrest
   ```

---

## Diagnosis

### Check what's missing:
```bash
pnpm db:verify
```

This will show:
- ✅ Objects that exist in DB and PostgREST cache
- ⚠️ Objects that exist in DB but NOT in PostgREST cache
- ❌ Objects that don't exist in DB

### Common Issues

#### Issue: Table exists in DB but not visible via PostgREST
**Symptom:** PGRST205 error  
**Cause:** PostgREST schema cache is stale  
**Fix:**
```bash
pnpm supabase:reload-postgrest
```

#### Issue: Table doesn't exist
**Symptom:** PGRST116 error  
**Cause:** Migration not applied  
**Fix:**
```bash
# Check migrations
pnpm supabase migration list

# Apply missing migrations
pnpm supabase migration up
```

#### Issue: RLS blocking access
**Symptom:** 401/403 errors (not PGRST205)  
**Cause:** RLS policies too restrictive  
**Fix:** Check RLS policies and grants

---

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Verify database schema
  run: pnpm db:verify

- name: Apply migrations
  run: pnpm db:migrate

- name: Reload PostgREST cache
  run: pnpm supabase:reload-postgrest

- name: Final verification
  run: pnpm db:verify
```

---

## Runtime Fallback

If PGRST205 occurs at runtime:

1. **Automatic retry** (already implemented in Articles API)
2. **User notification** (AdminAIChecker shows reload button)
3. **Logging** (check server logs for details)

---

## Required Objects

The following objects MUST exist and be visible in PostgREST:

### Tables
- `articles`
- `news_articles`
- `listings`
- `authors`
- `content_ai_improvements`
- `content_comments`
- `notifications`
- `pharmacies`
- `media_assets`
- `categories`
- `profiles`
- `content_items`
- `content_locales`
- `topic_clusters`
- `cluster_items`
- `programmatic_pages`
- `static_pages`
- `workflow_reviews`
- `content_versions`
- `audit_logs`

### RPC Functions
- `pgrst_reload_schema()`

---

## Monitoring

Check PostgREST cache status:
```bash
pnpm db:verify
```

This should return exit code 0 if all objects are visible.

---

## Emergency Contacts

If issues persist:
1. Check Supabase Dashboard → Logs
2. Verify migrations are applied: `pnpm supabase migration list`
3. Check RLS policies: Supabase Dashboard → Authentication → Policies
4. Contact Supabase Support if infrastructure issue

---

Last updated: 2026-01-29
