# RLS Strategy - Clean, Predictable, Project-Wide

## Core Principles (NON-NEGOTIABLE)

### 1. NEVER rely on RLS for admin logic
- **Admin APIs must always use service role**
- RLS is NOT an admin permission system
- Service role bypasses RLS completely

### 2. RLS is ONLY for public/anon access
- Protect public reads (only published/approved content)
- Block public writes (except specific cases like comments)

### 3. Server-side = service role
- All `/api/*` routes that mutate or manage content
- All admin fetches
- All background scripts

### 4. Client-side = anon
- Listings
- Published content
- Read-only views

## Standard RLS Pattern

### For Content Tables (articles, news_articles, content_items, neighborhoods)

**A) Public Read Policy:**
```sql
CREATE POLICY "Public can read published <table>"
ON <table>
FOR SELECT
TO public
USING (
  (published = true OR status = 'published')
  AND deleted_at IS NULL
);
```

**B) Service Role Policy:**
```sql
CREATE POLICY "Service role can manage <table>"
ON <table>
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
```

**C) Block Public Writes:**
```sql
CREATE POLICY "Public cannot write <table>"
ON <table>
FOR INSERT TO public WITH CHECK (false);

CREATE POLICY "Public cannot update <table>"
ON <table>
FOR UPDATE TO public USING (false);

CREATE POLICY "Public cannot delete <table>"
ON <table>
FOR DELETE TO public USING (false);
```

## API Layer Rules

### Admin APIs (`/api/*` in admin panel)

**MUST use service role client:**
```typescript
import { createServiceClient } from "@karasu/lib/supabase/service";

const supabase = createServiceClient(); // Always service role
```

**BAN:**
- ❌ Using anon client inside admin routes
- ❌ Mixing client types in same handler
- ❌ Conditional service role (dev vs prod)

### Public APIs (web app)

**MUST use anon client:**
```typescript
import { createClient } from "@/lib/supabase/server"; // Uses anon key
```

## Query Filter Rules

### Admin Queries

**MUST NOT filter by published unless explicitly requested:**
```typescript
// ❌ WRONG - Admin shouldn't filter by published
const { data } = await supabase
  .from("articles")
  .select("*")
  .eq("published", true); // Admin should see ALL articles

// ✅ CORRECT - Admin sees all, filter only if requested
const { data } = await supabase
  .from("articles")
  .select("*");
  // No published filter - service role bypasses RLS anyway
```

### Public Queries

**MUST rely on RLS, not query filters:**
```typescript
// ✅ CORRECT - RLS handles filtering
const { data } = await supabase
  .from("articles")
  .select("*");
  // RLS policy ensures only published articles are returned

// ❌ WRONG - Don't double-filter
const { data } = await supabase
  .from("articles")
  .select("*")
  .eq("published", true); // Redundant - RLS already filters
```

## Table-Specific Policies

### Articles
- **Public:** Read if `status = 'published' OR is_published = true` AND `deleted_at IS NULL`
- **Service:** Full access

### News Articles
- **Public:** Read if `published = true` AND `deleted_at IS NULL`
- **Service:** Full access

### Content Comments
- **Public:** Read if `status = 'approved'`
- **Public:** Insert allowed (users can create comments)
- **Service:** Full access

### Neighborhoods
- **Public:** Read if `published = true`
- **Service:** Full access

### QA Entries
- **Public:** Read all (they're public Q&A)
- **Public:** Insert allowed (users can submit questions)
- **Service:** Full access

### SEO Events
- **Public:** Read all (analytics events)
- **Public:** Insert allowed (tracking events)
- **Service:** Full access

## Verification

Run RLS debug script:
```bash
pnpm debug:rls
```

**Expected results:**
- Anon client sees only published/approved content
- Service client sees ALL content
- `service_count >= anon_count` for all content tables
- Service client never returns 0 unless DB is empty

## Common Mistakes

### ❌ Using anon client in admin APIs
```typescript
// WRONG
const supabase = await createClient(); // Anon client
const { data } = await supabase.from("articles").select("*");
// Result: Empty array (RLS filters out unpublished)
```

### ❌ Filtering by published in admin queries
```typescript
// WRONG
const { data } = await serviceClient
  .from("articles")
  .eq("published", true); // Admin should see ALL articles
```

### ❌ Relying on RLS for admin permissions
```typescript
// WRONG - Don't create "staff can manage" policies
// Admin should use service role, not staff role checks
```

### ❌ Mixing client types
```typescript
// WRONG
const anonClient = await createClient();
const serviceClient = createServiceClient();
// Use one or the other, not both
```

## Migration Applied

Migration `007_standardize_rls_policies.sql` implements:
- ✅ Standard service role policies (using `auth.role()`)
- ✅ Standard public read policies
- ✅ Block public writes (except specific cases)
- ✅ Removed dangerous "all_policy" on news_articles
- ✅ Removed redundant authenticated/staff policies

## Files Modified

- `scripts/db/migrations/007_standardize_rls_policies.sql` - RLS policies
- `apps/admin/app/api/articles/route.ts` - Use service client
- `apps/admin/app/api/dashboard/stats/route.ts` - Use service client
- `apps/admin/app/api/static-pages/route.ts` - Use service client
- `apps/admin/app/api/comments/route.ts` - Already uses service client ✅
- `apps/admin/app/api/news/route.ts` - Already uses service client ✅
- `scripts/debug-rls.ts` - RLS verification script

## Next Steps

1. ✅ Migration applied
2. ✅ PostgREST cache reloaded
3. ⏳ Run `pnpm debug:rls` to verify
4. ⏳ Test admin APIs - should see all data
5. ⏳ Test public APIs - should see only published content
