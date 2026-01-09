# 🗺️ Karasu Emlak - Yol Haritası

**Domain:** karasuemlak.net  
**Durum:** Yeni Proje - Başlangıç  
**Tarih:** Ocak 2025

---

## 📋 Genel Bakış

Karasu Emlak için profesyonel, SEO-optimized, production-ready bir web sitesi ve admin paneli geliştirilecek.

### Mimari Kararlar

- **Monorepo Yapısı:** Turborepo ile apps/web + apps/admin + packages/ui + packages/lib
- **Public Site:** karasuemlak.net (apps/web)
- **Admin Panel:** admin.karasuemlak.net (apps/admin, ayrı deploy)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Image CDN:** Cloudinary
- **Deployment:** Vercel
- **Internationalization:** tr, en, et, ru, ar (RTL support for Arabic)

---

## 🎯 Fazlar ve Görevler

### ✅ FAZE 1: Temel Altyapı (Foundation)
**Süre:** 1-2 gün  
**Öncelik:** Kritik

#### 1.1 Monorepo Kurulumu
- [ ] Turborepo workspace yapısı oluştur
- [ ] Root package.json ve pnpm-workspace.yaml
- [ ] turbo.json konfigürasyonu
- [ ] TypeScript config (strict mode)
- [ ] ESLint + Prettier setup

#### 1.2 Packages Oluşturma
- [ ] `packages/config` - Environment schema (Zod), site config, NAP data
- [ ] `packages/lib` - Shared utilities (Supabase client, Cloudinary utils)
- [ ] `packages/ui` - shadcn/ui component library setup

#### 1.3 Environment Variables
- [ ] `.env.local.example` oluştur
- [ ] Zod schema validation (`packages/config/env-schema.ts`)
- [ ] Tüm gerekli env vars dokümante et

**Doğrulama:**
```bash
pnpm install
pnpm run typecheck
pnpm run lint
```

---

### ✅ FAZE 2: Public Site (apps/web) - Temel Yapı
**Süre:** 2-3 gün  
**Öncelik:** Kritik

#### 2.1 Next.js 14 App Router Setup
- [ ] `apps/web` Next.js projesi oluştur
- [ ] Root layout (`app/layout.tsx`) - metadata, fonts, providers
- [ ] Global styles (Tailwind CSS)
- [ ] Error boundaries
- [ ] Loading states

#### 2.2 UI Component System
- [ ] shadcn/ui kurulumu ve konfigürasyonu
- [ ] Design tokens (CSS variables) - colors, typography, spacing
- [ ] Temel component'ler: Button, Input, Card, Badge
- [ ] Responsive utilities

#### 2.3 Internationalization (i18n)
- [ ] next-intl veya custom i18n setup
- [ ] Locale detection (browser language)
- [ ] Language switcher component
- [ ] RTL support for Arabic
- [ ] URL structure: `/tr`, `/en`, `/et`, `/ru`, `/ar`

#### 2.4 Supabase Integration
- [ ] Supabase client setup (`packages/lib/supabase`)
- [ ] Server-side client (service role)
- [ ] Client-side client (anon key)
- [ ] Type generation (Supabase CLI)

#### 2.5 Cloudinary Integration
- [ ] Cloudinary client setup (`packages/lib/cloudinary`)
- [ ] Image optimization utilities
- [ ] Next.js Image component wrapper

**Doğrulama:**
```bash
pnpm run dev:web
# http://localhost:3000 açılmalı
```

---

### ✅ FAZE 3: Public Site - Ana Sayfalar
**Süre:** 3-4 gün  
**Öncelik:** Yüksek

#### 3.1 Layout Components
- [ ] Header (navigation, language switcher, auth buttons)
- [ ] Footer (links, NAP, social media)
- [ ] Mobile menu
- [ ] Breadcrumbs component

#### 3.2 Ana Sayfa (`/`)
- [ ] Hero section (search form)
- [ ] Featured properties grid
- [ ] Statistics section
- [ ] Neighborhood highlights
- [ ] CTA sections
- [ ] SEO metadata

#### 3.3 İlan Listeleme Sayfaları
- [ ] `/satilik` - Tüm satılık ilanlar
- [ ] `/satilik/[propertyType]` - Tip bazlı (daire, villa, arsa)
- [ ] `/kiralik` - Tüm kiralık ilanlar
- [ ] `/kiralik/[propertyType]` - Tip bazlı
- [ ] Filter component (fiyat, oda sayısı, m², lokasyon)
- [ ] Sort options
- [ ] Pagination
- [ ] Empty states

#### 3.4 İlan Detay Sayfası (`/ilan/[propertyType]/[slug]`)
- [ ] Property images gallery
- [ ] Property details (oda, m², fiyat, vb.)
- [ ] Location map (Google Maps)
- [ ] Contact form
- [ ] Similar properties
- [ ] Share buttons
- [ ] Schema.org Property schema

#### 3.5 Arama Sayfası (`/arama`)
- [ ] Advanced search form
- [ ] Search results
- [ ] Filters sidebar

**Doğrulama:**
- Tüm sayfalar responsive
- Loading, error, empty states mevcut
- SEO metadata her sayfada

---

### ✅ FAZE 4: SEO & Performance
**Süre:** 2-3 gün  
**Öncelik:** Yüksek

#### 4.1 SEO Implementation
- [ ] Metadata API (title, description, OG, Twitter)
- [ ] Canonical URLs
- [ ] Structured data (Schema.org):
  - Organization
  - LocalBusiness
  - RealEstateAgent
  - Property
  - BreadcrumbList
  - Article (blog için)
- [ ] Sitemap generation:
  - `/sitemap.xml` (index)
  - `/sitemap-listings.xml`
  - `/sitemap-blog.xml`
  - `/sitemap-neighborhoods.xml`
- [ ] `robots.txt`
- [ ] Hreflang tags (i18n için)

#### 4.2 Performance Optimization
- [ ] Image optimization (Next.js Image + Cloudinary)
- [ ] Code splitting (dynamic imports)
- [ ] Lazy loading
- [ ] Font optimization
- [ ] Bundle size analysis
- [ ] Core Web Vitals tracking

#### 4.3 Analytics & Monitoring
- [ ] Google Analytics 4 setup
- [ ] Consent banner (KVKK/GDPR compliant)
- [ ] Cookie preference center
- [ ] Web Vitals tracking
- [ ] Error tracking (Sentry - optional)

**Doğrulama:**
- Lighthouse score > 90
- Core Web Vitals yeşil
- Sitemap erişilebilir
- Structured data valid

---

### ✅ FAZE 5: Content System
**Süre:** 2-3 gün  
**Öncelik:** Orta

#### 5.1 Blog System
- [ ] `/blog` - Blog listesi
- [ ] `/blog/[slug]` - Blog detay
- [ ] Blog card component
- [ ] Categories/tags
- [ ] Related articles

#### 5.2 Haberler System
- [ ] `/haberler` - Haberler listesi
- [ ] `/haberler/[slug]` - Haber detay
- [ ] NewsArticle schema

#### 5.3 Karasu Bölge Sayfaları
- [ ] `/karasu` - Ana sayfa
- [ ] `/karasu/[mahalle]` - Mahalle detay
- [ ] `/karasu/mahalleler` - Tüm mahalleler
- [ ] Programmatic SEO pages

#### 5.4 Utility Sayfaları
- [ ] `/hakkimizda` - Hakkımızda
- [ ] `/iletisim` - İletişim formu
- [ ] `/sss` - Sıkça Sorulan Sorular
- [ ] `/gizlilik-politikasi` - KVKK/GDPR
- [ ] `/cerez-politikasi` - Cookie policy
- [ ] `/kullanim-kosullari` - Terms of service

**Doğrulama:**
- Tüm içerik sayfaları SEO optimized
- Internal linking mevcut

---

### ✅ FAZE 6: Authentication & User Features
**Süre:** 2-3 gün  
**Öncelik:** Orta

#### 6.1 Supabase Auth Setup
- [ ] Email OTP (magic link) authentication
- [ ] Social OAuth (Google, Facebook - optional)
- [ ] Auth UI components (login, signup, reset password)
- [ ] Protected routes middleware
- [ ] Session management

#### 6.2 User Features
- [ ] `/favoriler` - Favori ilanlar
- [ ] `/karsilastir` - İlan karşılaştırma
- [ ] User profile page
- [ ] Saved searches

**Doğrulama:**
- Auth flow çalışıyor
- Protected routes korunuyor
- User data Supabase'de

---

### ✅ FAZE 7: Admin Panel (apps/admin)
**Süre:** 4-5 gün  
**Öncelik:** Yüksek

#### 7.1 Admin Setup
- [ ] `apps/admin` Next.js projesi oluştur
- [ ] Admin layout (sidebar, header)
- [ ] RBAC (Role-Based Access Control) - staff/admin roles
- [ ] MFA (Multi-Factor Authentication) - enforceable plan
- [ ] Protected admin routes

#### 7.2 Content Studio
- [ ] Dashboard (stats, recent activity)
- [ ] İlan yönetimi (CRUD):
  - İlan ekleme/düzenleme
  - Görsel yükleme (Cloudinary)
  - Durum yönetimi (draft/published)
- [ ] Blog yönetimi:
  - AI article generation (normal + cornerstone)
  - Draft → review → publish workflow
  - Multi-language translations
- [ ] SEO Tools:
  - Metadata editor
  - Schema generator
  - Internal links manager
  - Sitemap intent
  - Quality gate (similarity/thin-risk checks)

#### 7.3 Analytics & Reports
- [ ] Event lake dashboard (1st-party events)
- [ ] Performance metrics
- [ ] Lead management
- [ ] Export functionality

**Doğrulama:**
- Admin panel subdomain'de deploy edilebilir
- RBAC çalışıyor
- Tüm CRUD işlemleri çalışıyor

---

### ✅ FAZE 8: Database & API
**Süre:** 2-3 gün  
**Öncelik:** Kritik

#### 8.1 Supabase Schema
- [ ] Tables:
  - `properties` (ilanlar)
  - `property_images`
  - `neighborhoods` (mahalleler)
  - `articles` (blog)
  - `news` (haberler)
  - `users` (Supabase Auth)
  - `user_profiles`
  - `favorites`
  - `leads` (form submissions)
  - `audit_logs` (admin actions)
- [ ] RLS (Row Level Security) policies - her tablo için
- [ ] Indexes (performance)
- [ ] Foreign keys

#### 8.2 API Routes
- [ ] `/api/properties` - İlan listesi
- [ ] `/api/properties/[id]` - İlan detay
- [ ] `/api/properties/stats` - İstatistikler
- [ ] `/api/articles` - Blog API
- [ ] `/api/contact` - İletişim formu
- [ ] `/api/newsletter/subscribe` - Newsletter
- [ ] `/api/analytics/vitals` - Web Vitals
- [ ] `/api/seo/schemas` - Schema generation

**Doğrulama:**
- RLS policies test edildi
- API endpoints çalışıyor
- Error handling mevcut

---

### ✅ FAZE 9: Automation & Scripts
**Süre:** 1-2 gün  
**Öncelik:** Düşük

#### 9.1 Setup Scripts
- [ ] `scripts/bootstrap.sh` - macOS setup (gh, vercel, supabase CLI)
- [ ] Environment validation script

#### 9.2 SEO Automation
- [ ] `scripts/seo/healthcheck.ts` - SEO sağlık kontrolü
- [ ] `scripts/seo/submit-sitemaps.ts` - Sitemap gönderimi
- [ ] `scripts/seo/search-console-check.ts` - GSC kontrolü

#### 9.3 Content Automation
- [ ] `scripts/content/generate-article.ts` - AI article generation
- [ ] `scripts/news/ingest.ts` - News ingestion

#### 9.4 CI/CD
- [ ] GitHub Actions:
  - PR: lint + typecheck + build + security checks
  - Nightly: full Project Bot scan

**Doğrulama:**
- Scripts çalışıyor
- CI/CD pipeline başarılı

---

### ✅ FAZE 10: Testing & Deployment
**Süre:** 2-3 gün  
**Öncelik:** Kritik

#### 10.1 Testing
- [ ] Type checking (`pnpm run typecheck`)
- [ ] Linting (`pnpm run lint`)
- [ ] Build test (`pnpm run build`)
- [ ] Manual testing (tüm sayfalar)
- [ ] Cross-browser testing
- [ ] Mobile testing

#### 10.2 Vercel Deployment
- [ ] Public site deploy (karasuemlak.net)
- [ ] Admin panel deploy (admin.karasuemlak.net - ayrı proje)
- [ ] Environment variables setup
- [ ] Domain configuration
- [ ] SSL certificates

#### 10.3 Post-Deployment
- [ ] Google Search Console setup
- [ ] Google Analytics verification
- [ ] Sitemap submission
- [ ] Performance monitoring
- [ ] Error tracking setup

**Doğrulama:**
- Production'da site çalışıyor
- Admin panel erişilebilir
- SEO tools çalışıyor
- Analytics tracking aktif

---

## 📊 Öncelik Sıralaması

### 🔴 Kritik (İlk 2 hafta)
1. FAZE 1: Temel Altyapı
2. FAZE 2: Public Site - Temel Yapı
3. FAZE 3: Public Site - Ana Sayfalar
4. FAZE 8: Database & API

### 🟡 Yüksek (2-4 hafta)
5. FAZE 4: SEO & Performance
6. FAZE 7: Admin Panel

### 🟢 Orta (4-6 hafta)
7. FAZE 5: Content System
8. FAZE 6: Authentication & User Features

### ⚪ Düşük (6+ hafta)
9. FAZE 9: Automation & Scripts
10. FAZE 10: Testing & Deployment (sürekli)

---

## 🛠️ Teknoloji Stack

### Core
- **Next.js** 14.2+ (App Router)
- **React** 18.3+
- **TypeScript** 5.4+ (strict mode)
- **Tailwind CSS** 3.4+
- **Turborepo** 2.7+ (monorepo)

### Backend
- **Supabase** (PostgreSQL + Auth + Storage)
- **Cloudinary** (Image CDN)

### UI Components
- **shadcn/ui** (component library)
- **Radix UI** (primitives)
- **Lucide React** (icons)

### Internationalization
- **next-intl** veya custom i18n solution

### SEO & Analytics
- **Google Analytics 4**
- **Google Search Console**
- **Schema.org** structured data

### Development
- **pnpm** 8.15+ (package manager)
- **ESLint** + **Prettier**
- **GitHub Actions** (CI/CD)

---

## 📝 Notlar

- Her faz sonunda doğrulama yapılmalı
- TypeScript strict mode aktif olmalı
- Tüm sayfalar responsive olmalı
- Loading, error, empty states her yerde olmalı
- SEO her sayfada optimize edilmeli
- RLS policies her tablo için zorunlu
- Environment variables Zod ile validate edilmeli

---

## 🚀 İlk Adımlar

1. **FAZE 1'i başlat** - Monorepo kurulumu
2. **Environment variables'ı hazırla** - Supabase, Cloudinary credentials
3. **GitHub repository oluştur** - `iamahmet/karasuEmlak`
4. **Vercel projeleri hazırla** - Public site + Admin panel

---

**Son Güncelleme:** Ocak 2025  
**Durum:** Planlama Tamamlandı ✅

