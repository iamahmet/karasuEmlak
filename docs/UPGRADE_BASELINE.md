# System Upgrade Baseline - KarasuEmlak v4

**Generated:** 2026-01-04  
**Purpose:** Comprehensive system audit for systematic upgrade  
**Status:** Phase 0 Complete

---

## 📋 Executive Summary

This document provides a complete baseline of the KarasuEmlak platform before systematic upgrade. All routes, SEO systems, content sources, scripts, and security configurations are mapped.

**Key Metrics:**
- **Total Routes:** 100+ public routes, 50+ API routes
- **SEO System:** Dynamic sitemaps, structured data, metadata generation
- **Content Sources:** Supabase (articles, news, listings, neighborhoods, QA)
- **Admin Panel:** 30+ admin routes, content studio, SEO tools
- **Scripts:** 40+ automation scripts

---

## 🗺️ Route Inventory

### Public Routes (`apps/web/app/[locale]/`)

#### Core Pages
- `/` - Homepage
- `/satilik` - For Sale Listings
- `/kiralik` - For Rent Listings
- `/ilan/[slug]` - Listing Detail
- `/arama` - Search
- `/favorilerim` - Favorites
- `/karsilastir` - Compare Listings

#### Content Pages
- `/blog` - Blog Listing
- `/blog/[slug]` - Blog Detail
- `/blog/kategori/[category]` - Blog by Category
- `/blog/yazar/[author]` - Blog by Author
- `/haberler` - News Listing
- `/haberler/[slug]` - News Detail
- `/rehber` - Guides
- `/rehber/yatirim` - Investment Guide
- `/rehber/emlak-alim-satim` - Buy/Sell Guide
- `/rehber/kiralama` - Rental Guide

#### Location Pages (Karasu)
- `/karasu` - Karasu Hub
- `/karasu/gezilecek-yerler` - Places to Visit
- `/karasu/hastaneler` - Hospitals
- `/karasu/nobetci-eczaneler` - Pharmacies
- `/karasu/restoranlar` - Restaurants
- `/karasu/ulasim` - Transportation
- `/karasu/onemli-telefonlar` - Important Phone Numbers
- `/karasu/mahalle-karsilastirma` - Neighborhood Comparison
- `/mahalle/[slug]` - Neighborhood Detail

#### Location Pages (Kocaali)
- `/kocaali` - Kocaali Hub
- `/kocaali/gezilecek-yerler` - Places to Visit
- `/kocaali/hastaneler` - Hospitals
- `/kocaali/nobetci-eczaneler` - Pharmacies
- `/kocaali/restoranlar` - Restaurants
- `/kocaali/ulasim` - Transportation
- `/kocaali/onemli-telefonlar` - Important Phone Numbers
- `/kocaali/mahalleler` - Neighborhoods

#### SEO Programmatic Pages
- `/karasu-emlak-rehberi` - Karasu Real Estate Guide
- `/kocaali-emlak-rehberi` - Kocaali Real Estate Guide
- `/karasu-satilik-ev` - Karasu For Sale Homes
- `/karasu-satilik-ev-fiyatlari` - Karasu Home Prices
- `/karasu-satilik-evler` - Karasu For Sale Homes (plural)
- `/karasu-yatirimlik-gayrimenkul` - Karasu Investment Properties
- `/karasu-emlak-ofisi` - Karasu Real Estate Office
- `/karasu-merkez-satilik-ev` - Karasu Center For Sale Homes
- `/karasu-denize-yakin-satilik-ev` - Karasu Sea-Side For Sale Homes
- `/karasu-yatirimlik-satilik-ev` - Karasu Investment For Sale Homes
- `/karasu-mustakil-satilik-ev` - Karasu Detached For Sale Homes
- `/karasu-vs-kocaali-satilik-ev` - Karasu vs Kocaali For Sale
- `/karasu-vs-kocaali-yatirim` - Karasu vs Kocaali Investment
- `/karasu-vs-kocaali-yasam` - Karasu vs Kocaali Living
- `/kocaali-satilik-ev` - Kocaali For Sale Homes
- `/kocaali-satilik-ev-fiyatlari` - Kocaali Home Prices
- `/kocaali-yatirimlik-gayrimenkul` - Kocaali Investment Properties
- `/sakarya-emlak-yatirim-rehberi` - Sakarya Real Estate Investment Guide

#### Tools & Calculators
- `/kredi-hesaplayici` - Mortgage Calculator
- `/yatirim-hesaplayici` - Investment Calculator
- `/yatirim/piyasa-analizi` - Market Analysis
- `/yatirim/roi-hesaplayici` - ROI Calculator

#### Services
- `/hizmetler` - Services
- `/hizmetler/emlak-degerleme` - Property Valuation
- `/hizmetler/danismanlik` - Consultancy
- `/hizmetler/hukuki-destek` - Legal Support
- `/hizmetler/sigorta` - Insurance

#### Statistics
- `/istatistikler/piyasa-raporlari` - Market Reports
- `/istatistikler/fiyat-trendleri` - Price Trends
- `/istatistikler/bolge-analizi` - Regional Analysis

#### About & Legal
- `/hakkimizda` - About Us
- `/hakkimizda/ekibimiz` - Our Team
- `/hakkimizda/referanslar` - References
- `/hakkimizda/kariyer` - Careers
- `/iletisim` - Contact
- `/sss` - FAQ
- `/gizlilik-politikasi` - Privacy Policy
- `/cerez-politikasi` - Cookie Policy
- `/kullanim-kosullari` - Terms of Service
- `/kvkk-basvuru` - KVKK Application

### API Routes (`apps/web/app/api/`)

#### Public APIs
- `/api/contact` - Contact Form
- `/api/comments` - Comments CRUD
- `/api/newsletter/subscribe` - Newsletter Subscription
- `/api/kvkk-application` - KVKK Application
- `/api/listings/create` - Create Listing (public)
- `/api/listings/upload-image` - Upload Listing Image

#### Service APIs
- `/api/services/weather` - Weather Service
- `/api/services/currency` - Currency Conversion
- `/api/services/geocoding` - Geocoding
- `/api/services/news` - News Feed
- `/api/services/qr-code` - QR Code Generation
- `/api/services/quote` - Quote Service
- `/api/services/timezone` - Timezone Info
- `/api/services/validate/email` - Email Validation
- `/api/services/validate/phone` - Phone Validation

#### SEO APIs
- `/api/seo/optimize` - SEO Optimization
- `/api/seo/submit-sitemap` - Submit Sitemap
- `/api/services/seo/backlinks` - Backlink Check
- `/api/services/seo/content` - Content Analysis
- `/api/services/seo/keywords` - Keyword Research
- `/api/services/seo/serp` - SERP Tracking

#### Analytics APIs
- `/api/analytics/events` - Event Tracking
- `/api/analytics/performance` - Performance Metrics
- `/api/analytics/web-vitals` - Web Vitals
- `/api/stats/listings` - Listing Statistics

#### Admin APIs
- `/api/admin/sync` - Sync Data
- `/api/admin/rebuild` - Rebuild Cache
- `/api/admin/cache/invalidate` - Invalidate Cache
- `/api/admin/add-neighborhoods` - Add Neighborhoods
- `/api/admin/test-listings` - Test Listings

#### Cron Jobs
- `/api/cron/check-new-listings` - Check New Listings
- `/api/cron/check-price-changes` - Check Price Changes
- `/api/cron/check-saved-searches` - Check Saved Searches

#### AI & Media
- `/api/ai/generate-image` - Generate AI Image
- `/api/images/free` - Free Images
- `/api/gundem/feed` - News Feed
- `/api/news/breaking` - Breaking News

### Admin Routes (`apps/admin/app/[locale]/`)

#### Dashboard
- `/dashboard` - Main Dashboard
- `/analytics/dashboard` - Analytics Dashboard

#### Content Management
- `/articles` - Articles List
- `/articles/[id]` - Article Edit
- `/articles/new` - New Article
- `/news` - News List
- `/news/[id]` - News Edit
- `/haberler` - News (Turkish)
- `/haberler/[id]` - News Edit
- `/haberler/[id]/edit` - News Edit Page
- `/content-studio` - Content Studio
- `/content-studio/[id]` - Content Item Edit

#### Listings
- `/listings` - Listings List
- `/listings/[id]` - Listing Edit
- `/listings/new` - New Listing

#### SEO Tools
- `/seo` - SEO Dashboard
- `/seo/booster` - SEO Booster
- `/seo/content-studio` - SEO Content Studio
- `/seo/content-studio/[id]` - SEO Content Item
- `/seo/control` - SEO Control
- `/seo/control/metadata` - Metadata Control
- `/seo/control/schema` - Schema Control
- `/seo/control/links` - Links Control
- `/seo/indexing` - Indexing Tools

#### Media & AI
- `/media` - Media Library
- `/ai-images` - AI Images
- `/ai-qa` - AI Q&A

#### Users & Settings
- `/users` - Users Management
- `/settings` - Settings
- `/notifications` - Notifications

#### Compliance
- `/compliance/consent` - Consent Management
- `/compliance/logs` - Compliance Logs
- `/compliance/policies` - Policies

#### Other
- `/navigation` - Navigation Menu
- `/homepage` - Homepage Editor
- `/programmatic-pages` - Programmatic Pages
- `/reports` - Reports
- `/project-bot` - Project Bot
- `/integrations/google` - Google Integration

---

## 🔍 SEO System

### Sitemaps
- **Location:** `apps/web/app/sitemap.ts`
- **Type:** Dynamic, database-driven
- **Includes:**
  - Static routes (50+)
  - Listings (published only)
  - Blog posts (published only)
  - News articles (published only)
  - Neighborhoods (published only)
- **Last Modified:** Dynamic from database `updated_at`
- **Index:** `/sitemap.xml`

- **News Sitemap:** `apps/web/app/sitemap-news.ts`
  - News articles only
  - Google News format
  - Location: `/sitemap-news.xml`

### Robots.txt
- **Location:** `apps/web/app/robots.ts`
- **Rules:**
  - Allow: `/` (all public routes)
  - Disallow: `/api/`, `/admin/`, `/_next/`, `/favorilerim`, `/karsilastir`
  - Sitemaps: `/sitemap.xml`, `/sitemap-news.xml`

### Metadata System
- **Location:** `packages/lib/seo/metadata.ts`
- **Functions:**
  - `generateSEOMetadata()` - Generate SEO metadata
  - `generateMetaTags()` - Generate HTML meta tags
  - `validateSEOMetadata()` - Validate metadata
  - `generateArticleStructuredData()` - Article schema

### Structured Data
- **Location:** `apps/web/lib/seo/structured-data.ts`
- **Types:**
  - Organization (cached, site-wide)
  - Article (blog posts)
  - NewsArticle (news items)
  - RealEstateListing (listings)
  - BreadcrumbList (navigation)
  - FAQPage (FAQ pages)
- **Injection:** Per-page via `<StructuredData />` component

### Canonical URLs
- **Pattern:** Default locale (`tr`) has no prefix, others use `/{locale}/path`
- **Implementation:** Per-page `generateMetadata()` functions
- **Hreflang:** Supported for all locales (tr, en, et, ru, ar)

---

## 💾 Content Sources

### Supabase Tables

#### Content Tables
- `articles` - Blog posts
  - Fields: id, title, slug, content, excerpt, featured_image, author, published, status, created_at, updated_at
  - RLS: Public reads published only, service role full access
- `news_articles` - News items
  - Fields: id, title, slug, content, excerpt, featured_image, published, created_at, updated_at
  - RLS: Public reads published only, service role full access
- `content_items` - Content studio items
  - Fields: id, title, slug, content, status (draft/review/published), cluster_id, created_at, updated_at
  - RLS: Public reads published only, service role full access
- `neighborhoods` - Neighborhood data
  - Fields: id, name, slug, description, location, published, created_at, updated_at
  - RLS: Public reads published only, service role full access
- `qa_entries` - Q&A entries
  - Fields: id, question, answer, category, published, created_at, updated_at
  - RLS: Public reads all, public can insert, service role full access

#### Listing Tables
- `listings` - Property listings
  - Fields: id, title, slug, description, price, property_type, location, images, published, created_at, updated_at
  - RLS: Public reads published only, service role full access

#### System Tables
- `navigation_menus` - Navigation menu definitions
- `navigation_items` - Navigation menu items
- `staff_profiles` - Staff/Admin profiles (RBAC)
- `user_roles` - User role assignments
- `content_comments` - Comments on content
- `topic_clusters` - Content topic clusters
- `seo_events` - SEO tracking events
- `notifications` - System notifications

### Content Queries
- **Location:** `apps/web/lib/supabase/queries/`
- **Files:**
  - `articles.ts` - Blog queries
  - `news.ts` - News queries
  - `listings.ts` - Listing queries
  - `neighborhoods.ts` - Neighborhood queries
  - `qa.ts` - Q&A queries
  - `ai-questions.ts` - AI Q&A queries
  - `blog-sidebar.ts` - Blog sidebar queries

---

## 🛠️ Critical Scripts

### Content Generation
- `scripts/create-karasu-blog-posts.ts` - Generate Karasu blog posts
- `scripts/create-seo-blog-posts.ts` - Generate SEO blog posts
- `scripts/seo-domination-content-generator.ts` - SEO content generator
- `scripts/generate-content-images.ts` - Generate content images
- `scripts/generate-qa-system.ts` - Generate Q&A system

### Database Management
- `scripts/db/apply-migrations.ts` - Apply database migrations
- `scripts/db/verify-admin-tables.ts` - Verify admin tables
- `scripts/debug-rls.ts` - Debug RLS policies
- `scripts/reload-supabase-schema.ts` - Reload Supabase schema

### Data Population
- `scripts/add-test-listings.ts` - Add test listings
- `scripts/add-missing-neighborhoods.ts` - Add neighborhoods
- `scripts/create-all-neighborhoods.ts` - Create all neighborhoods
- `scripts/populate-sample-qa.ts` - Populate sample Q&A

### SEO & Optimization
- `scripts/seo-internal-linking-system.ts` - Internal linking
- `scripts/seo-domination-freshness-optimizer.ts` - Freshness optimizer
- `scripts/enrich-neighborhoods-seo.ts` - Enrich neighborhood SEO

### Content Revision
- `scripts/batch-revise-blog.ts` - Batch revise blog posts
- `scripts/batch-revise-news.ts` - Batch revise news
- `scripts/content-revision-framework.ts` - Content revision framework

### Automation
- `scripts/automation-pipeline.ts` - Automation pipeline
- `scripts/setup-navigation-menu.ts` - Setup navigation menu

---

## ☁️ Cloudinary Usage

### Configuration
- **Environment Variables:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Usage:** Image optimization, transformations, AI image uploads

### Key Files
- `apps/web/lib/cloudinary/ai-upload.ts` - AI image uploads
- `apps/web/lib/cloudinary/image-helpers.ts` - Image helpers
- `apps/web/lib/cloudinary/optimization.ts` - Image optimization
- `apps/web/lib/cloudinary/utils.ts` - Cloudinary utilities

### Transformations
- Auto format: `q_auto,f_auto`
- Responsive: `c_fill,w_auto,h_auto`
- OG images: `w_1200,h_630,c_fill`

---

## 🔒 Supabase Security (RLS)

### Client Usage Patterns

#### Public Routes (Anon Key)
- **Location:** `apps/web/lib/supabase/client.ts`
- **Usage:** Client-side components, public pages
- **Tables:** listings, articles, news_articles, neighborhoods (published only)

#### Server Routes (Service Role)
- **Location:** `apps/web/lib/supabase/server.ts` (anon) or `@karasu/lib/supabase/service` (service)
- **Usage:** API routes, admin panel, server components
- **Tables:** All tables, full access

### RLS Policies

#### Standard Pattern
1. **Public Read:** `published = true AND deleted_at IS NULL`
2. **Service Role:** Full access (`auth.role() = 'service_role'`)
3. **Public Write:** Blocked (except comments, QA)

#### Table-Specific Policies
- **articles:** Public reads `status = 'published'`, service full access
- **news_articles:** Public reads `published = true`, service full access
- **listings:** Public reads `published = true`, service full access
- **neighborhoods:** Public reads `published = true`, service full access
- **content_comments:** Public reads `status = 'approved'`, public can insert, service full access
- **qa_entries:** Public reads all, public can insert, service full access

### Known Issues
- **Neighborhoods:** Anon vs service count mismatch (needs investigation)
- **PostgREST Cache:** Schema cache staleness (PGRST205, PGRST202 errors)
- **Solution:** Run `pnpm supabase:reload-postgrest` when schema changes

---

## 🎨 Admin Panel

### Current Structure
- **Base URL:** `/admin` or `/[locale]` (admin app)
- **Auth:** Supabase Auth + Staff Profiles (RBAC)
- **Proxy:** `apps/admin/proxy.ts` - Staff check

### Known Errors
1. **500 on `/api/content-studio`** - Needs investigation
2. **401 on clusters** - Auth/RBAC issue
3. **404 on notifications** - Table/endpoint missing
4. **Unclickable UI** - z-index, pointer-events, modal traps

### Admin Features
- Content Studio (draft → review → publish)
- SEO Tools (metadata, schema, sitemap)
- Media Library (Cloudinary integration)
- Analytics Dashboard
- User Management
- Settings

---

## 📊 Performance Baseline

### Build Time
- **Current:** Unknown (needs measurement)
- **Target:** < 5 minutes

### Runtime Metrics
- **LCP Target:** < 2.5s
- **CLS Target:** < 0.1
- **TBT Target:** < 200ms

### Bundle Analysis
- **Status:** Not analyzed
- **Action:** Run `npm run perf:report` (to be created)

---

## ✅ Health Check Status

### Required Checks
- [ ] `npm run health:local` - Local environment health
- [ ] `npm run health:seo` - SEO system health
- [ ] `npm run health:db` - Database health

**Status:** Scripts to be created in Phase 0

---

## 🎯 Next Steps

1. **Create Health Check Scripts** (Phase 0 completion)
2. **Design System Implementation** (Phase 1)
3. **SEO Audit & Fixes** (Phase 2)
4. **Content Engine** (Phase 3)
5. **Supabase Hardening** (Phase 4)
6. **Admin Panel Fixes** (Phase 5)
7. **Cloudinary AI Pipeline** (Phase 6)
8. **Performance Optimization** (Phase 7)

---

## 📝 Notes

- All routes preserve existing URLs and slugs
- No breaking changes planned
- Migration path for all updates
- Server components preferred, client scope minimized
- RLS security is critical - never bypass for convenience

---

**Last Updated:** 2026-01-04  
**Next Review:** After Phase 0 health scripts completion
