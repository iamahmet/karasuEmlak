# KarasuEmlak v4 Architecture

## Core Philosophy

- **Stability > cleverness**: Boring, reliable code over clever hacks
- **SEO systems > one-off tricks**: Systematic SEO over ad-hoc optimizations
- **Async + background work > blocking SSR**: Heavy work happens off the main thread
- **Observability > guessing**: Logging, monitoring, health checks everywhere
- **Monorepo discipline from day 1**: Clear boundaries, explicit dependencies

## Global Non-Negotiable Rules

### 1. Root Layout Must NEVER Block Rendering
- Only `<html>` and `<body>` tags
- No Supabase calls
- No analytics loading
- No consent logic
- No widgets
- No AI logic

### 2. Middleware Must Be Ultra-Light
- No fetch
- No database
- No auth
- No logging
- Only routing logic (next-intl)

### 3. Homepage Must Render Even If:
- Database is down
- Supabase is unreachable
- AI services are offline
- **Solution**: Timeout all data fetching (3s max), graceful degradation

### 4. All Heavy Work Happens:
- In API routes
- In background scripts
- Via ISR / on-demand revalidation
- Never in page components or layouts

### 5. Dev Server Must Start Reliably in <10s
- Clean scripts for port management
- Explicit dev ports (web: 3000, admin: 3001)
- Health checks with timeouts

### 6. Every Feature Must Degrade Gracefully
- Empty states for missing data
- Fallback UI for failed operations
- Never show error pages for non-critical failures

## Monorepo Structure

```
apps/
  web/        → Public site (karasuemlak.net)
  admin/      → Admin panel (admin.karasuemlak.net)

packages/
  ui/         → Shared components (pure, no side effects)
  lib/        → Supabase client, fetch helpers, SEO utils
  config/     → siteConfig, SEO constants, env schema
```

Each app:
- Has its own `package.json`
- Has explicit dev port
  - `web`: 3000
  - `admin`: 3001
- Independent builds and deployments

## Web App (`apps/web`) Architecture

### Routing
- App Router (Next.js 14+)
- Locale-first structure: `/[locale]/...`
- Default locale: `tr`
- Supported: `tr`, `en`, `et`, `ru`, `ar`
- Arabic (`ar`) uses `dir="rtl"`

### Root Layout (`apps/web/app/layout.tsx`)
**ONLY:**
- `<html>`, `<body>` tags
- Fonts
- Theme classes
- Static metadata

**NEVER:**
- Supabase calls
- Analytics loading
- Consent logic
- Widgets
- AI logic

### Locale Layout (`apps/web/app/[locale]/layout.tsx`)
**Responsibilities:**
- i18n provider setup
- Header/Footer
- Client component lazy loading
- Schema injection (cached)

**Timeouts:**
- `getMessages()`: 2s max
- Schema generation: Cached (static data)

### Homepage (`apps/web/app/[locale]/page.tsx`)
**Pattern:**
```typescript
// All data fetching with timeout
const [data] = await withTimeoutAll([
  getFeaturedListings(6),
  getListingStats(),
  // ...
], 3000, null); // 3s timeout, null fallback

// Page renders with empty data if timeout
```

**Must render even if:**
- All data fetches fail
- Database is unreachable
- Network is slow

### SEO System
- `siteConfig` as single source of truth
- Dynamic sitemaps:
  - Static pages
  - Listings
  - Neighborhoods
  - Blog articles
  - News articles
  - FAQ pages
- Schema injected per-page, not globally
- Canonical URLs with hreflang

### Images
- Cloudinary only
- AI image generation:
  - Background job (never at build time)
  - Alt text auto-generated
  - Fallback stock images if AI fails
- Optimized formats (WebP/AVIF)
- Responsive sizing
- Lazy loading

### AI / Content
- AI never runs at build time
- All generation via:
  - `scripts/` directory
  - Admin-triggered API routes
- Results stored in Supabase
- Rate limiting and cost tracking

## Admin App (`apps/admin`) Architecture

### Authentication
- Supabase Auth required
- OTP / Magic Link + OAuth
- Staff RBAC:
  - `owner`
  - `admin`
  - `editor`
  - `seo`
- MFA enforced for owner/admin

### Features
- Content Studio
- Listing Management
- Neighborhood SEO Generator
- News Ingestion
- Sitemap Submission
- AI Generation Controls
- Analytics Dashboard

### Separation
- Admin NEVER shares runtime with web
- Separate deployment
- Separate database access (RLS-based)

## Supabase Rules

### Public Site
- Uses `anon` key (read-only)
- RLS: `published` read only
- No write operations

### Admin
- Session-based access
- RLS: Role-based write
- Audit logging for all changes

### Tables
- `listings` - Property listings
- `neighborhoods` - Neighborhood data
- `articles` - Blog articles
- `news` - News articles
- `media_assets` - Image/media tracking
- `seo_events` - SEO event logging
- `staff_profiles` - Admin user profiles
- `audit_logs` - Change tracking

## Analytics & Consent

### Consent Preference Center
- Categories:
  - `necessary` - Always enabled
  - `analytics` - GA4, Web Vitals
  - `marketing` - Ads, tracking
- GA4 / Clarity load ONLY after consent
- First-party event lake:
  - `events_raw` table
  - Nightly aggregation job
- Web vitals captured safely (no PII)

## Performance

### Timeouts
- Homepage data: 3s max
- Locale messages: 2s max
- API routes: 10s max (configurable)

### Caching
- Schema generation: Cached (static)
- ISR for static pages
- On-demand revalidation for dynamic content

### Monitoring
- `/healthz` endpoint (instant response)
- Web Vitals tracking
- Error logging
- Performance metrics

## Development Experience

### Health Checks
- `/healthz` route in BOTH apps
- Returns instantly (no blocking)
- Use with timeout:
  ```bash
  curl --max-time 2 http://localhost:3000/healthz
  ```

### Clean Scripts
```bash
# Clean and restart web
npm run dev:clean:web

# Clean and restart admin
npm run dev:clean:admin

# Clean everything
npm run dev:clean
```

### Port Management
- Web: `3000`
- Admin: `3001`
- Scripts automatically kill processes on ports

## Security

### RLS (Row Level Security)
- Every exposed table has RLS enabled
- Public: Read-only for published content
- Staff: Role-based write access

### Audit Logging
- All admin actions logged
- Auth events tracked
- Integration events logged
- Publishing events tracked

### Secrets
- Never in client code
- Server-only environment variables
- OpenAI keys, service_role keys: Server-only

## Deployment

### Vercel
- Separate projects for web and admin
- Environment variables per project
- Cron jobs for background tasks
- Edge functions for lightweight operations

### Monitoring
- Health checks
- Error tracking
- Performance monitoring
- Cost tracking (AI generation)
