# Phase 4: Supabase RLS, Cache, Reliability Audit

**Status:** In Progress  
**Goal:** Ensure correct RLS policies, optimize caching, improve reliability

---

## A) RLS Policies Audit

### Current State

**Standardized RLS Policies (007_standardize_rls_policies.sql):**
- ✅ Service role: Full access (bypasses RLS)
- ✅ Public (anon): Read-only for published content
- ✅ Public: Blocked writes (INSERT/UPDATE/DELETE)

**Tables with RLS:**
- `articles` - ✅ Standardized
- `news_articles` - ✅ Standardized
- `listings` - ✅ Standardized
- `neighborhoods` - ✅ Standardized
- `content_items` - ✅ Standardized
- `content_locales` - ✅ Standardized
- `content_comments` - ✅ Standardized
- `qa_entries` - ✅ Standardized
- `seo_events` - ✅ Standardized

### Issues to Check

1. **Client Usage:**
   - Server-side code MUST use `createServiceClient()`
   - Client-side code MUST use `createClient()` (anon key)
   - Admin APIs MUST use service role

2. **RLS Verification:**
   - Run `pnpm run health:db` to verify
   - Service role should see >= anon role counts
   - Anon role should only see published content

3. **New Tables:**
   - Phase 3 added `review_status`, `quality_score` fields
   - Need to verify RLS policies still work correctly

---

## B) Cache System Audit

### Next.js Cache

**Current Implementation:**
- `revalidatePath()` - Path-based invalidation
- `revalidateTag()` - Tag-based invalidation
- `/api/admin/cache/invalidate` - Cache invalidation API

**Issues:**
- ⚠️ No systematic cache tagging strategy
- ⚠️ Cache invalidation not triggered on content updates
- ⚠️ No cache warming for critical pages

**Recommendations:**
1. Add cache tags to all data fetching
2. Auto-invalidate on content publish/update
3. Implement cache warming for homepage, hub pages

### PostgREST Schema Cache

**Current Implementation:**
- ✅ `pgrst_reload_schema()` function exists
- ✅ `scripts/supabase/reload-postgrest.ts` script
- ✅ Auto-reload after migrations

**Status:** ✅ Working correctly

---

## C) Reliability Improvements

### Timeout Handling

**Current Implementation:**
- ✅ `withTimeout()` utility exists
- ✅ Used in some queries (listings, articles)

**Issues:**
- ⚠️ Not consistently applied to all queries
- ⚠️ Default timeout may be too long (3s)
- ⚠️ No timeout for admin queries

**Recommendations:**
1. Apply timeout to all Supabase queries
2. Different timeouts for public vs admin
3. Graceful degradation on timeout

### Retry Logic

**Current Implementation:**
- ✅ `fetchWithRetry()` in API clients
- ✅ Exponential backoff

**Issues:**
- ⚠️ Not applied to Supabase queries directly
- ⚠️ No retry for PostgREST errors

**Recommendations:**
1. Add retry wrapper for Supabase queries
2. Retry on transient errors (5xx, PGRST errors)
3. Max 2-3 retries with exponential backoff

### Error Handling

**Current Implementation:**
- ✅ `withErrorHandling()` wrapper in admin APIs
- ✅ Error handler detects PostgREST cache issues

**Issues:**
- ⚠️ Not all APIs use error handler
- ⚠️ Error messages not user-friendly

**Recommendations:**
1. Standardize error handling across all APIs
2. User-friendly error messages
3. Logging for debugging

---

## Action Items

### High Priority
1. ✅ Verify RLS policies for new fields (review_status, quality_score)
2. ⏳ Add cache tags to all data fetching
3. ⏳ Apply timeout to all Supabase queries
4. ⏳ Add retry logic for Supabase queries
5. ⏳ Standardize error handling

### Medium Priority
6. ⏳ Implement cache warming
7. ⏳ Add query performance monitoring
8. ⏳ Optimize slow queries

### Low Priority
9. ⏳ Add query result caching (Redis/Vercel KV)
10. ⏳ Implement connection pooling

---

## Verification Commands

```bash
# Check RLS policies
pnpm run health:db

# Check PostgREST cache
pnpm supabase:reload-postgrest

# Check SEO system
pnpm run health:seo
```
