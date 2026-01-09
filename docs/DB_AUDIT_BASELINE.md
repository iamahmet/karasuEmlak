# Database Audit Baseline - KarasuEmlak

**Date:** 2025-01-06  
**Status:** Phase 0 Complete  
**Purpose:** Comprehensive baseline of all database access patterns, API routes, tables, and production parity analysis

---

## 🔴 CRITICAL FINDINGS

### 1. **Migrations Not Applied**
- **Issue:** Migration file `supabase/migrations/20260104215603_remote_schema.sql` defines tables (`articles`, `listings`, `neighborhoods`, `news_articles`, `qa_entries`, etc.) but these tables **DO NOT EXIST** in the current Supabase database.
- **Impact:** All database queries will fail with "table does not exist" errors.
- **Action Required:** Apply migrations immediately before proceeding with any fixes.

### 2. **Inconsistent Client Usage**
- Multiple patterns for creating Supabase clients:
  - Direct `createClient` from `@supabase/supabase-js` (inconsistent)
  - `createServiceClient` from `@karasu/lib/supabase/service` (preferred for admin)
  - `createClient` from `apps/web/lib/supabase/client.ts` (browser)
  - `createClient` from `apps/web/lib/supabase/server.ts` (server with cookies)
- **Impact:** No single source of truth, potential RLS bypass issues, inconsistent error handling.

### 3. **Missing Tables in Database**
- Expected tables (from code): `articles`, `news_articles`, `listings`, `neighborhoods`, `qa_entries`, `content_items`, `content_locales`, `content_comments`, `seo_events`, `media_assets`, `notifications`
- Actual tables (from Supabase): `User`, `Client`, `Lead`, `AgentProfile`, `BlogPost`, `FAQ`, `Notification`, etc. (different schema - appears to be admin panel schema)
- **Impact:** Complete mismatch between code expectations and database reality.

---

## 📊 SUPABASE CLIENT CREATION POINTS

### Browser (Client-Side)
- **File:** `apps/web/lib/supabase/client.ts`
- **Function:** `createClient()`
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Usage:** Client components, browser-side data fetching

### Server (Server-Side with Cookies)
- **File:** `apps/web/lib/supabase/server.ts`
- **Function:** `createClient()` (async)
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Usage:** Server components, server actions with session management

### Service Role (Admin/Server-Only)
- **File:** `packages/lib/supabase/service.ts`
- **Function:** `createServiceClient()`
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Usage:** Admin API routes, server-side operations requiring full access

### Direct Client Creation (Inconsistent - Needs Fix)
Found in:
- `apps/web/app/[locale]/sss/page.tsx` - Direct `createClient` from `@supabase/supabase-js`
- `apps/web/app/api/faq/route.ts` - Direct `createClient` with service key fallback
- Multiple scripts in `scripts/` directory

---

## 🗄️ DATABASE TABLES (Expected vs Actual)

### Expected Tables (from Migration File)
From `supabase/migrations/20260104215603_remote_schema.sql`:

1. **articles** - Blog posts
   - Fields: id, title, slug, content, excerpt, meta_description, keywords, author, published_at, status, featured_image, category, tags, views, seo_score, internal_links
   - RLS: Should filter by `status = 'published'` for anon

2. **news_articles** - News articles with emlak analysis
   - Fields: id, title, slug, source_url, original_summary, emlak_analysis, related_neighborhoods, related_listings, published_at, published, featured
   - RLS: Should filter by `published = true` for anon

3. **listings** - Property listings
   - Fields: id, title, slug, status, property_type, location_*, price_*, features, images, agent_*, published, available, deleted_at
   - RLS: Should filter by `published = true AND available = true AND deleted_at IS NULL` for anon

4. **neighborhoods** - Neighborhood data
   - Fields: id, slug, name, district, city, description, seo_content, faqs, stats, coordinates, published, deleted_at
   - RLS: Should filter by `published = true AND deleted_at IS NULL` for anon

5. **qa_entries** - Q&A entries
   - Fields: id, question, answer, category, priority, region, created_at, updated_at
   - RLS: Public read (all entries visible)

6. **content_items** - Content Studio items
   - Fields: id, type, slug, status, author_id, featured_image_url, published_at
   - RLS: Should filter by `status = 'published'` for anon

7. **content_locales** - Multi-language content
   - Fields: id, content_item_id, locale, title, content, excerpt, meta_description, translation_status
   - RLS: Inherits from content_items

8. **content_comments** - Comments on content
   - Fields: id, content_item_id, author_name, author_email, content, status, created_at
   - RLS: Should filter by `status = 'approved'` for anon

9. **seo_events** - SEO tracking events
   - Fields: id, event_type, entity_type, entity_id, metadata, created_at
   - RLS: Admin only (no public read)

10. **media_assets** - Cloudinary media references
    - Fields: id, cloudinary_public_id, cloudinary_url, asset_type, entity_type, entity_id
    - RLS: Public read (all assets visible)

11. **notifications** - System notifications
    - Fields: id, user_id, type, title, message, link, is_read, created_at
    - RLS: User-specific (users see only their notifications)

### Actual Tables (from Supabase Query)
Current database contains:
- `User`, `Client`, `Lead`, `AgentProfile`, `ClientProfile`, `Application`, `Program`, `Document`, `Contract`, `Payment`, `CommissionRecord`, `Message`, `Notification`, `BlogPost`, `Task`, `ActivityLog`, `EmailTemplate`, `FAQ`, `TrustBadge`, `NewsletterSubscription`, `ProcessStep`

**Note:** These appear to be from a different schema (possibly admin panel or legacy schema). The web app tables are missing.

---

## 🔌 API ROUTES THAT TOUCH DATABASE

### Web App API Routes (`apps/web/app/api/`)

#### Public Routes (Anon Key)
- `/api/faq` - GET - Fetches Q&A entries (uses service key fallback - **NEEDS FIX**)
- `/api/comments` - GET/POST - Comments CRUD
- `/api/contact` - POST - Contact form submissions
- `/api/newsletter/subscribe` - POST - Newsletter subscriptions
- `/api/listings/create` - POST - User listing submissions (uses service key)
- `/api/stats/listings` - GET - Listing statistics
- `/api/analytics/*` - POST - Analytics events (uses service key)

#### Admin Routes (Service Role)
- `/api/admin/*` - Admin operations
- `/api/admin/cache/invalidate` - POST - Cache invalidation

#### Cron Jobs
- `/api/cron/check-new-listings` - Checks for new listings
- `/api/cron/check-price-changes` - Monitors price changes
- `/api/cron/check-saved-searches` - Processes saved searches

### Admin Panel API Routes (`apps/admin/app/api/`)

#### Content Studio
- `/api/content-studio` - GET/POST - Content items list/create
- `/api/content-studio/clusters` - GET/POST - Topic clusters (returns 401 if table missing)
- `/api/content-studio/[id]` - GET/PUT/DELETE - Single content item
- `/api/content-studio/[id]/publish` - POST - Publish content
- `/api/content-studio/[id]/approve` - POST - Approve content
- `/api/content-studio/[id]/reject` - POST - Reject content

#### Articles & News
- `/api/articles` - GET/POST - Blog articles
- `/api/articles/[id]` - GET/PUT/DELETE - Single article
- `/api/news` - GET/POST - News articles
- `/api/news/[id]` - GET/PUT/DELETE - Single news article

#### Listings
- `/api/listings` - GET/POST - Property listings
- `/api/listings/[id]` - GET/PUT/DELETE - Single listing
- `/api/listings/bulk` - POST - Bulk operations

#### Comments
- `/api/comments` - GET - All comments
- `/api/comments/[id]` - GET/PUT/DELETE - Single comment
- `/api/comments/bulk` - POST - Bulk comment operations

#### Notifications
- `/api/notifications` - GET/POST - System notifications
- `/api/notifications/[id]` - GET/PUT/DELETE - Single notification
- `/api/notifications/bulk` - POST - Bulk operations

**Note:** Many of these routes use `createServiceClient()` which is correct for admin operations.

---

## 🌐 PRODUCTION SITEMAP ANALYSIS

### Production Routes (from https://www.karasuemlak.net/sitemap.xml)

#### Static Routes
- `/` - Homepage
- `/satilik` - For sale listings
- `/kiralik` - For rent listings
- `/hakkimizda` - About us
- `/iletisim` - Contact
- `/sss` - FAQ

#### Dynamic Listing Routes
- `/satilik/[type]` - e.g., `/satilik/daire`, `/satilik/villa`, `/satilik/arsa`
- `/kiralik/[type]` - e.g., `/kiralik/daire`, `/kiralik/villa`
- `/ilan/[type]/[slug]` - Individual listing pages

#### Blog Routes
- `/blog` - Blog index
- `/blog/[slug]` - Individual blog posts
  - Examples: `karasu-yatirim-rehberi`, `karasu-kira-getirisi-rehberi`, `karasu-arsa-rehberi`, `karasu-mahalleleri-rehberi`, `karasu-villa-rehberi`, `karasu-emlak-rehberi`, `karasu-satilik-ev-rehberi`

#### Neighborhood Routes
- `/karasu/[mahalle]` - Neighborhood pages (expected)
- `/kocaali/[mahalle]` - Kocaali neighborhoods (expected)

#### News Routes
- `/haberler` - News index
- `/haberler/[slug]` - Individual news articles

### Local Sitemap (`apps/web/app/sitemap.ts`)
- Generates static routes for all locales
- Fetches dynamic listings from `listings` table (will fail if table doesn't exist)
- Fetches blog posts from `articles` table (will fail if table doesn't exist)
- Fetches neighborhoods from `neighborhoods` table (will fail if table doesn't exist)
- Fetches news from `news_articles` table (will fail if table doesn't exist)

**Gap:** Production has more blog posts than local can generate (migration not applied).

---

## 🐛 KNOWN API FAILURES

### 1. `/api/content-studio` - 500 Error
- **Cause:** `content_items` table doesn't exist
- **Current Handling:** Returns empty array gracefully
- **Fix Required:** Apply migration or create table

### 2. `/api/content-studio/clusters` - 401 Error
- **Cause:** `topic_clusters` table doesn't exist
- **Current Handling:** Returns empty array gracefully
- **Fix Required:** Apply migration or create table

### 3. `/api/faq` - Empty Results
- **Cause:** `qa_entries` table doesn't exist OR RLS blocking access
- **Current Handling:** Falls back to anon key if service key fails
- **Fix Required:** Apply migration, verify RLS policies

### 4. Notifications Endpoints - 404
- **Cause:** `notifications` table structure mismatch (admin schema vs web schema)
- **Fix Required:** Align table structure or create separate notifications table for web app

---

## 📁 FILES TO REVIEW

### Supabase Client Files
- `apps/web/lib/supabase/client.ts` - Browser client
- `apps/web/lib/supabase/server.ts` - Server client with cookies
- `packages/lib/supabase/service.ts` - Service role client
- `apps/admin/lib/supabase/server.ts` - Admin server client

### Query Wrapper Files
- `apps/web/lib/supabase/queries/listings.ts`
- `apps/web/lib/supabase/queries/articles.ts`
- `apps/web/lib/supabase/queries/news.ts`
- `apps/web/lib/supabase/queries/neighborhoods.ts`
- `apps/web/lib/supabase/queries/qa.ts`
- `apps/web/lib/supabase/queries/ai-questions.ts`
- `apps/web/lib/supabase/query-wrapper.ts` - Generic query wrapper

### Migration Files
- `supabase/migrations/20260104215603_remote_schema.sql` - Main schema
- `scripts/db/migrations/001_create_notifications.sql`
- `scripts/db/migrations/002_create_content_studio_tables.sql`
- `scripts/db/migrations/003_create_topic_clusters.sql`
- `scripts/db/migrations/004_create_staff_profiles.sql`
- `scripts/db/migrations/005_create_content_comments.sql`
- `scripts/db/migrations/006_create_postgrest_reload_functions.sql`
- `scripts/db/migrations/007_standardize_rls_policies.sql`

### Debug Scripts
- `scripts/debug-rls.ts` - RLS policy verification
- `scripts/db/verify-admin-tables.ts` - Admin table verification

---

## ✅ NEXT STEPS (Phase 1-7)

1. **Apply Migrations** - Run all migration files to create missing tables
2. **Create Data Access Layer** - Implement repository pattern (`lib/db/*.ts`)
3. **Harden RLS** - Ensure anon <= service always
4. **Fix Caching** - Implement revalidateTag/revalidatePath strategy
5. **Fix API Failures** - Resolve 401/404/500 errors
6. **Production Parity** - Import missing content from production
7. **Admin UX** - Ensure all admin features work correctly
8. **Performance** - Add indexes and query optimization

---

## 📝 NOTES

- The database appears to have two different schemas: one for admin panel (User, Client, Lead, etc.) and one for web app (articles, listings, neighborhoods, etc.). They may be in different Supabase projects or the migrations haven't been applied.
- Many API routes gracefully handle missing tables by returning empty arrays. This is good for development but masks the real issue.
- The `createServiceClient` pattern is used correctly in admin routes, but some web routes use direct `createClient` with service key fallback, which is inconsistent.

---

**End of Baseline Audit**
