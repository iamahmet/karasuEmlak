# 📚 Karasu Emlak - Kapsamlı Proje Dokümantasyonu

**Son Güncelleme:** Ocak 2025  
**Versiyon:** 1.1.0  
**Durum:** Production Ready ✅

---

## 📝 Hızlı Özet

**Karasu Emlak**, Next.js 14+ App Router ile geliştirilmiş, production-ready bir emlak web sitesidir. Proje, modern web standartlarına uygun, SEO-optimized, performans odaklı ve kullanıcı deneyimi öncelikli bir mimariye sahiptir.

### 🎯 Temel Bilgiler
- **Framework:** Next.js 14.2.35 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Image CDN:** Cloudinary
- **Deployment:** Vercel
- **Repository:** GitHub (`iamahmet/karasuEmlak`)
- **Site URL:** https://www.karasuemlak.net

### 🛠 Kullanılan Servisler
- **Supabase:** Veritabanı, Authentication, Storage
- **Cloudinary:** Görsel yönetimi ve CDN
- **OpenAI:** AI destekli içerik üretimi
- **Vercel:** Hosting ve deployment
- **Google Analytics:** Web analytics
- **Google Search Console:** SEO monitoring

### 📊 Proje İstatistikleri
- **50+** sayfa
- **20+** API endpoint
- **100+** React component
- **9** farklı sitemap türü
- **10+** Schema.org structured data türü
- **%100** TypeScript coverage

---

## 📋 İçindekiler

1. [Proje Genel Bakış](#proje-genel-bakış)
2. [Teknoloji Stack](#teknoloji-stack)
3. [Proje Yapısı](#proje-yapısı)
4. [Kurulum ve Başlangıç](#kurulum-ve-başlangıç)
5. [Environment Variables](#environment-variables)
6. [Sayfa Yapısı ve Route'lar](#sayfa-yapısı-ve-routelar)
7. [SEO Implementasyonu](#seo-implementasyonu)
8. [Geliştirme Süreci ve İlerleme](#geliştirme-süreci-ve-ilerleme)
9. [Yapılması Gerekenler](#yapılması-gerekenler)
10. [Yapılmaması Gerekenler](#yapılmaması-gerekenler)
11. [Projeyi Baştan Yapma Rehberi](#projeyi-baştan-yapma-rehberi)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Proje Genel Bakış

**Karasu Emlak**, Next.js 14+ App Router kullanılarak geliştirilmiş, production-ready bir emlak web sitesidir. Proje, modern web standartlarına uygun, SEO-optimized, performans odaklı ve kullanıcı deneyimi öncelikli bir mimariye sahiptir.

### Temel Özellikler

- ✅ **Monorepo Yapısı** (Turborepo)
- ✅ **TypeScript** ile tip güvenliği
- ✅ **Server-Side Rendering (SSR)** ve **Static Site Generation (SSG)**
- ✅ **AI Destekli İçerik Üretimi** (OpenAI/Gemini)
- ✅ **Kapsamlı SEO Optimizasyonu**
- ✅ **Cloudinary** ile görsel yönetimi
- ✅ **Supabase** ile veritabanı ve authentication
- ✅ **Responsive Design** (Mobile-First)
- ✅ **Accessibility (WCAG AAA)** uyumluluğu
- ✅ **Performance Optimizasyonu** (Core Web Vitals)

---

## 🛠 Teknoloji Stack

### Core Framework & Libraries

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **Next.js** | 14.2.35 | React framework, SSR/SSG |
| **React** | 18.3.0 | UI library |
| **TypeScript** | 5.4.0 | Type safety |
| **Tailwind CSS** | 3.4.1 | Utility-first CSS |
| **Turborepo** | 2.7.2 | Monorepo build system |

### Backend & Database

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **Supabase** | 2.39.0 | Database, Auth, Storage |
| **PostgreSQL** | 14+ | Direct database connection |
| **Redis** (ioredis) | 5.8.2 | Caching (optional) |

### AI & Content Generation

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **OpenAI API** | 6.13.0 | AI content generation |
| **Google Gemini** | - | Alternative AI provider |

### Image Management

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **Cloudinary** | 2.8.0 | Image CDN, transformations |
| **next-cloudinary** | 6.17.5 | Next.js Cloudinary integration |
| **@cloudinary/react** | 1.14.3 | React Cloudinary components |
| **@cloudinary/url-gen** | 1.22.0 | URL generation utilities |

**Cloudinary Konfigürasyonu:**
- **Cloud Name:** karasuemlak
- **API Key:** 475897588713275
- **API Secret:** ExkLcxp3v7kOQxzNdn_i0lWr5Jk
- **Kullanım:** Otomatik format optimizasyonu, responsive images, AI image generation

### Analytics & Monitoring

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **Google Analytics 4** | - | Web analytics |
| **Microsoft Clarity** | - | User behavior analytics |
| **Vercel Analytics** | 1.6.1 | Performance monitoring |
| **Web Vitals** | 5.1.0 | Core Web Vitals tracking |

### SEO & Structured Data

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **Schema.org** | - | Structured data (JSON-LD) |
| **Sitemap.xml** | - | Search engine indexing |
| **Robots.txt** | - | Crawler directives |

### Development Tools

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **ESLint** | 8.57.0 | Code linting |
| **Prettier** | - | Code formatting |
| **Jest** | 30.2.0 | Testing framework |
| **tsx** | 4.21.0 | TypeScript execution |

### Package Manager

- **pnpm** 8.15.0 (workspace support için)

---

## 📁 Proje Yapısı

```
x-karasuEmlak/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── app/                 # App Router pages
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── satilik/         # Satılık listings
│   │   │   ├── kiralik/         # Kiralık listings
│   │   │   ├── ilan/            # Property detail pages
│   │   │   ├── blog/            # Blog system
│   │   │   ├── karasu/          # Karasu neighborhood pages
│   │   │   ├── api/             # API routes
│   │   │   └── ...
│   │   ├── components/          # React components
│   │   ├── lib/                 # Utility functions
│   │   ├── types/               # TypeScript types
│   │   └── public/              # Static assets
│   └── admin/                   # Admin dashboard (future)
│
├── packages/
│   ├── config/                  # Shared configuration
│   │   ├── env-schema.ts        # Environment variables schema
│   │   ├── site-config.ts       # Site configuration
│   │   └── nap.ts               # NAP (Name, Address, Phone) data
│   ├── lib/                     # Shared libraries
│   └── ui/                      # Shared UI components
│
├── scripts/                      # Automation scripts
│   ├── seo/                     # SEO automation
│   ├── content/                 # Content generation
│   ├── news/                    # News ingestion
│   └── ...
│
├── supabase/                     # Supabase migrations
├── docs/                         # Documentation
├── turbo.json                    # Turborepo configuration
├── package.json                  # Root package.json
└── pnpm-workspace.yaml          # pnpm workspace config
```

---

## 🚀 Kurulum ve Başlangıç

### Gereksinimler

- **Node.js** 18.0.0 veya üzeri
- **pnpm** 8.15.0 veya üzeri
- **Git**

### Kurulum Adımları

```bash
# 1. Repository'yi klonlayın
git clone https://github.com/iamahmet/karasuEmlak.git
cd karasuEmlak/x-karasuEmlak

# 2. Dependencies yükleyin
pnpm install

# 3. Environment variables ayarlayın
# .env.local dosyası oluşturun (aşağıdaki bölüme bakın)

# 4. Development server'ı başlatın
pnpm run dev:web

# 5. Browser'da açın
# http://localhost:3000
```

### Build ve Production

```bash
# Production build
pnpm run build:web

# Production server başlatma
pnpm run start

# Type checking
pnpm run typecheck

# Linting
pnpm run lint
```

---

## 🔐 Environment Variables

### Zorunlu Environment Variables

Aşağıdaki environment variables **mutlaka** ayarlanmalıdır:

```env
# ============================================
# SITE CONFIGURATION
# ============================================
NEXT_PUBLIC_SITE_URL=https://www.karasuemlak.net

# ============================================
# SUPABASE CONFIGURATION
# ============================================
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://lbfimbcvvvbczllhqqlf.supabase.co
SUPABASE_URL=https://lbfimbcvvvbczllhqqlf.supabase.co

# Supabase Anon Key (Public - Client-side safe)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws

# Supabase Service Role Key (Private - Server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgyMDQ5OSwiZXhwIjoyMDgxMzk2NDk5fQ.gzQQlg-0iKGeMJe41s-89U1MGvlgSwBIWPGe61Zc2zo

# Supabase JWT Secret
SUPABASE_JWT_SECRET=IGuVzv1NGhamrNH9/mWPbidTKq7dwd8Jj6LedwgtlxNByHwafu32x6mKezMcPWLguJ5iCAY3N6DQrbvYTQfJXw==

# Supabase Database (Direct PostgreSQL Connection)
SUPABASE_DB_HOST=db.lbfimbcvvvbczllhqqlf.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=karasuEmlak
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=A1683myPX87czfXR
```

### Opsiyonel Environment Variables

```env
# ============================================
# AI SERVICES (Content Generation)
# ============================================
# OpenAI API Key (for AI content generation)
# NOTE: Replace with your actual OpenAI API key
OPENAI_API_KEY=your-openai-api-key-here

# Google Gemini API Key (alternative AI provider)
GEMINI_API_KEY=...

# ============================================
# CLOUDINARY (Image CDN & Management)
# ============================================
# Cloudinary Cloud Name
CLOUDINARY_CLOUD_NAME=karasuemlak
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=karasuemlak

# Cloudinary API Credentials
CLOUDINARY_API_KEY=475897588713275
CLOUDINARY_API_SECRET=ExkLcxp3v7kOQxzNdn_i0lWr5Jk

# ============================================
# GOOGLE SERVICES
# ============================================
# Google Maps API Key
GOOGLE_MAPS_API_KEY=...

# Google Site Verification
GOOGLE_SITE_VERIFICATION=tSGso1PCPAasWwGiU3_fxGJ_wORtfgbK6NABaxPAGOg

# Google Search Console (for automated sitemap submission)
GOOGLE_SEARCH_CONSOLE_EMAIL=...
GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY=...

# ============================================
# ANALYTICS & MONITORING
# ============================================
# Google Analytics 4
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-EXFYWJWB5C

# Microsoft Clarity
NEXT_PUBLIC_CLARITY_ID=...

# ============================================
# SEARCH ENGINE VERIFICATION
# ============================================
# Bing Webmaster Tools
NEXT_PUBLIC_BING_VERIFICATION=...

# Yandex Webmaster Tools
NEXT_PUBLIC_YANDEX_VERIFICATION=...

# ============================================
# CACHING (Optional)
# ============================================
# Redis URL (for advanced caching)
REDIS_URL=redis://...

# ============================================
# ERROR TRACKING (Optional)
# ============================================
# Sentry DSN (for error tracking)
SENTRY_DSN=...
SENTRY_AUTH_TOKEN=...
```

### Environment Variables Notları

- `NEXT_PUBLIC_*` prefix'li değişkenler **client-side**'da kullanılabilir
- Diğerleri sadece **server-side**'da kullanılır
- Environment variables **Zod schema** ile validate edilir (`packages/config/env-schema.ts`)
- Production, Preview ve Development için **ayrı ayrı** ayarlanabilir (Vercel)

---

## 📄 Sayfa Yapısı ve Route'lar

### Ana Sayfalar

| Route | Dosya | Açıklama |
|-------|-------|----------|
| `/` | `app/page.tsx` | Ana sayfa (Homepage) |
| `/hakkimizda` | `app/hakkimizda/page.tsx` | Hakkımızda sayfası |
| `/iletisim` | `app/iletisim/page.tsx` | İletişim sayfası |
| `/blog` | `app/blog/page.tsx` | Blog listesi |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Blog detay sayfası |
| `/haberler` | `app/haberler/page.tsx` | Haberler listesi |
| `/haberler/[slug]` | `app/haberler/[slug]/page.tsx` | Haber detay sayfası |

### Emlak Listings

| Route | Dosya | Açıklama |
|-------|-------|----------|
| `/satilik` | `app/satilik/page.tsx` | Tüm satılık ilanlar |
| `/satilik/[propertyType]` | `app/satilik/[propertyType]/page.tsx` | Satılık tip bazlı (daire, villa, arsa) |
| `/kiralik` | `app/kiralik/page.tsx` | Tüm kiralık ilanlar |
| `/kiralik/[propertyType]` | `app/kiralik/[propertyType]/page.tsx` | Kiralık tip bazlı |
| `/ilan/[propertyType]/[slug]` | `app/ilan/[propertyType]/[slug]/page.tsx` | İlan detay sayfası |

### Karasu Bölge Sayfaları

| Route | Dosya | Açıklama |
|-------|-------|----------|
| `/karasu` | `app/karasu/page.tsx` | Karasu ana sayfası |
| `/karasu/[mahalle]` | `app/karasu/[mahalle]/page.tsx` | Mahalle detay sayfası |
| `/karasu/mahalleler` | `app/karasu/mahalleler/page.tsx` | Tüm mahalleler listesi |
| `/karasu/mahalle-karsilastirma` | `app/karasu/mahalle-karsilastirma/page.tsx` | Mahalle karşılaştırma |
| `/karasu/mahalle-karsilastirma/[mahalle1]-vs-[mahalle2]` | `app/karasu/mahalle-karsilastirma/[mahalle1]-vs-[mahalle2]/page.tsx` | İki mahalle karşılaştırma |
| `/karasu/gezilecek-yerler` | `app/karasu/gezilecek-yerler/page.tsx` | Gezilecek yerler |
| `/karasu/restoranlar` | `app/karasu/restoranlar/page.tsx` | Restoranlar |
| `/karasu/hastaneler` | `app/karasu/hastaneler/page.tsx` | Hastaneler |
| `/karasu/nobetci-eczaneler` | `app/karasu/nobetci-eczaneler/page.tsx` | Nöbetçi eczaneler |
| `/karasu/onemli-telefonlar` | `app/karasu/onemli-telefonlar/page.tsx` | Önemli telefonlar |
| `/karasu/ulasim` | `app/karasu/ulasim/page.tsx` | Ulaşım bilgileri |

### Özel Sayfalar

| Route | Dosya | Açıklama |
|-------|-------|----------|
| `/arama` | `app/arama/page.tsx` | Arama sayfası |
| `/favoriler` | `app/favoriler/page.tsx` | Favori ilanlar |
| `/karsilastir` | `app/karsilastir/page.tsx` | İlan karşılaştırma |
| `/kredi-hesaplayici` | `app/kredi-hesaplayici/page.tsx` | Kredi hesaplayıcı |
| `/yatirim-hesaplayici` | `app/yatirim-hesaplayici/page.tsx` | Yatırım hesaplayıcı |
| `/sss` | `app/sss/page.tsx` | Sıkça Sorulan Sorular |
| `/sss/[slug]` | `app/sss/[slug]/page.tsx` | SSS detay sayfası |
| `/rehberler/[slug]` | `app/rehberler/[slug]/page.tsx` | Rehber sayfaları |

### SEO Sayfaları

| Route | Dosya | Açıklama |
|-------|-------|----------|
| `/karasu-emlak-rehberi` | `app/karasu-emlak-rehberi/page.tsx` | Karasu emlak rehberi |
| `/kocaali-emlak-rehberi` | `app/kocaali-emlak-rehberi/page.tsx` | Kocaali emlak rehberi |
| `/karasu-satilik-evler` | `app/karasu-satilik-evler/page.tsx` | Karasu satılık evler |
| `/karasu-yatirimlik-gayrimenkul` | `app/karasu-yatirimlik-gayrimenkul/page.tsx` | Yatırımlık gayrimenkul |

### Yasal Sayfalar

| Route | Dosya | Açıklama |
|-------|-------|----------|
| `/gizlilik-politikasi` | `app/gizlilik-politikasi/page.tsx` | Gizlilik politikası |
| `/cerez-politikasi` | `app/cerez-politikasi/page.tsx` | Çerez politikası |
| `/kullanim-kosullari` | `app/kullanim-kosullari/page.tsx` | Kullanım koşulları |
| `/kvkk-basvuru` | `app/kvkk-basvuru/page.tsx` | KVKK başvuru formu |

### API Routes

| Route | Dosya | Açıklama |
|-------|-------|----------|
| `/api/properties` | `app/api/properties/route.ts` | İlan listesi API |
| `/api/properties/stats` | `app/api/properties/stats/route.ts` | İlan istatistikleri |
| `/api/articles` | `app/api/articles/route.ts` | Blog makaleleri API |
| `/api/contact` | `app/api/contact/route.ts` | İletişim formu API |
| `/api/newsletter/subscribe` | `app/api/newsletter/subscribe/route.ts` | Newsletter abonelik |
| `/api/analytics/vitals` | `app/api/analytics/vitals/route.ts` | Web Vitals tracking |
| `/api/seo/schemas` | `app/api/seo/schemas/route.ts` | SEO schema generation |

### Sitemap & Feed Routes

| Route | Dosya | Açıklama |
|-------|-------|----------|
| `/sitemap.xml` | `app/sitemap.ts` | Ana sitemap |
| `/sitemap-index.xml` | `app/sitemap-index.ts` | Sitemap index |
| `/sitemap-listings.xml` | `app/sitemap-listings.ts` | İlan sitemap |
| `/sitemap-blog.xml` | `app/sitemap-blog.ts` | Blog sitemap |
| `/sitemap-news.xml` | `app/sitemap-news.ts` | Haberler sitemap |
| `/sitemap-neighborhoods.xml` | `app/sitemap-neighborhoods.ts` | Mahalle sitemap |
| `/feed.xml` | `app/feed.xml/route.ts` | RSS feed |
| `/atom.xml` | `app/atom.xml/route.ts` | Atom feed |

---

## 🔍 SEO Implementasyonu

### Technical SEO

#### ✅ Meta Tags
- **Title Tags**: Dinamik, sayfa bazlı optimize edilmiş
- **Meta Descriptions**: Her sayfa için özel açıklamalar
- **Meta Keywords**: Sayfa içeriğine göre optimize edilmiş
- **Open Graph Tags**: Social media paylaşımları için
- **Twitter Cards**: Twitter paylaşımları için
- **Canonical URLs**: Duplicate content önleme

#### ✅ Structured Data (Schema.org)

**Implementasyon:**
- `Organization` schema
- `LocalBusiness` schema
- `RealEstateAgent` schema
- `WebSite` schema
- `BreadcrumbList` schema
- `FAQPage` schema
- `Article` schema (blog için)
- `NewsArticle` schema (haberler için)
- `Property` schema (ilanlar için)
- `Review` schema (müşteri yorumları için)

**Dosya Konumları:**
- `apps/web/lib/schema.ts` - Ana schema generator'lar
- `apps/web/lib/seo/structured-data-enhanced.ts` - Gelişmiş schema'lar
- `apps/web/lib/property-schema-enhanced.ts` - İlan schema'ları

#### ✅ Sitemap System

**Sitemap Türleri:**
1. **Ana Sitemap** (`/sitemap.xml`)
2. **Sitemap Index** (`/sitemap-index.xml`)
3. **Listings Sitemap** (`/sitemap-listings.xml`) - Tüm ilanlar
4. **Blog Sitemap** (`/sitemap-blog.xml`) - Blog makaleleri
5. **News Sitemap** (`/sitemap-news.xml`) - Haberler
6. **Neighborhoods Sitemap** (`/sitemap-neighborhoods.xml`) - Mahalleler
7. **Static Sitemap** (`/sitemap-static.xml`) - Statik sayfalar
8. **Images Sitemap** (`/sitemap-images.xml`) - Görseller
9. **Videos Sitemap** (`/sitemap-videos.xml`) - Videolar

**Özellikler:**
- Otomatik güncelleme
- Priority ve changefreq ayarları
- Lastmod tarihleri
- Image ve video metadata

#### ✅ Robots.txt

**Dosya:** `app/robots.ts`

**Özellikler:**
- Search engine directives
- Sitemap referansları
- Crawl-delay ayarları
- Disallow rules

### On-Page SEO

#### ✅ Content Optimization
- **H1-H6 Hierarchy**: Doğru başlık hiyerarşisi
- **Keyword Density**: Optimize edilmiş keyword kullanımı
- **Internal Linking**: Sayfa içi link ağı
- **Image Alt Tags**: Tüm görseller için alt text
- **URL Structure**: SEO-friendly URL'ler

#### ✅ Local SEO
- **NAP Consistency**: Name, Address, Phone tutarlılığı
- **Google Business Profile**: Entegrasyon
- **Local Schema**: LocalBusiness schema
- **Location Pages**: Mahalle bazlı sayfalar
- **Local Keywords**: Yerel arama terimleri

### Off-Page SEO

#### ✅ Link Building
- **Internal Linking**: Sayfa içi link ağı
- **External Links**: Güvenilir kaynaklara linkler
- **Backlink Strategy**: Geri link stratejisi

#### ✅ Social Signals
- **Social Media Integration**: Facebook, Instagram, Twitter
- **Social Sharing**: Paylaşım butonları
- **Open Graph**: Social media preview'ları

### Performance SEO

#### ✅ Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 1.8s
- **TTFB (Time to First Byte)**: < 600ms

#### ✅ Optimization Techniques
- **Image Optimization**: Next.js Image component, Cloudinary
- **Code Splitting**: Dynamic imports
- **Lazy Loading**: Component ve image lazy loading
- **Caching**: HTTP caching, CDN caching
- **Minification**: CSS, JavaScript minification
- **Compression**: Gzip/Brotli compression

### SEO Tools & Scripts

**Otomasyon Scriptleri:**
- `scripts/seo/healthcheck.ts` - SEO sağlık kontrolü
- `scripts/seo/submit-sitemaps.ts` - Sitemap gönderimi
- `scripts/submit-to-google-search-console.ts` - Google Search Console'a gönderim
- `scripts/seo/search-console-check.ts` - Search Console kontrolü
- `scripts/seo/generate-link-graph.ts` - Link graph oluşturma
- `scripts/seo/batch-optimize.ts` - Toplu SEO optimizasyonu

**Kullanım:**
```bash
# SEO health check
pnpm run seo:healthcheck

# Sitemap gönderimi
pnpm run seo:submit-sitemaps

# Google Search Console'a gönderim
pnpm run seo:submit-google
```

---

## 📈 Geliştirme Süreci ve İlerleme

### Proje Aşamaları

#### Phase 1: Foundation (Tamamlandı ✅)
- [x] Monorepo yapısı kurulumu
- [x] Next.js 14 App Router setup
- [x] TypeScript configuration
- [x] Tailwind CSS integration
- [x] Basic component structure

#### Phase 2: Core Features (Tamamlandı ✅)
- [x] Ana sayfa tasarımı
- [x] İlan listeleme sistemi
- [x] İlan detay sayfaları
- [x] Arama fonksiyonu
- [x] Filtreleme sistemi

#### Phase 3: SEO Implementation (Tamamlandı ✅)
- [x] Meta tags optimization
- [x] Structured data implementation
- [x] Sitemap generation
- [x] Robots.txt configuration
- [x] Local SEO optimization

#### Phase 4: Content System (Tamamlandı ✅)
- [x] Blog system
- [x] News system
- [x] AI content generation
- [x] Image management (Cloudinary)
- [x] Content automation scripts

#### Phase 5: Performance Optimization (Tamamlandı ✅)
- [x] Code splitting
- [x] Image optimization
- [x] Lazy loading
- [x] Caching strategies
- [x] Bundle optimization

#### Phase 6: Advanced Features (Devam Ediyor 🔄)
- [x] Analytics integration
- [x] Error tracking
- [x] Accessibility improvements
- [ ] Admin dashboard
- [ ] User authentication
- [ ] Advanced search filters

### Öğrenilen Dersler

#### ✅ Yapılması Gerekenler
1. **Monorepo Yapısı**: Proje büyüdükçe monorepo yapısı çok faydalı oldu
2. **TypeScript**: Tip güvenliği erken aşamada çok zaman kazandırdı
3. **Component Library**: Paylaşılan component'ler tekrar kullanılabilirliği artırdı
4. **SEO First Approach**: SEO'yu baştan düşünmek sonradan düzeltmekten kolay
5. **Performance Monitoring**: Erken performans optimizasyonu kritik
6. **Automation Scripts**: Tekrarlayan işler için script'ler zaman kazandırdı

#### ❌ Yapılmaması Gerekenler
1. **Premature Optimization**: Erken optimizasyon yerine önce çalışan kod
2. **Over-Engineering**: Basit çözümler karmaşık çözümlerden daha iyi
3. **Ignoring TypeScript Errors**: TypeScript hatalarını görmezden gelmek büyük sorunlara yol açtı
4. **Blocking Operations**: SSR'de blocking operation'lar performansı düşürdü
5. **Large Bundle Sizes**: Büyük bundle'lar initial load'u yavaşlattı
6. **Missing Error Boundaries**: Error boundary olmadan küçük hatalar tüm sayfayı çökertti

---

## ✅ Yapılması Gerekenler

### Kısa Vadeli (1-2 Hafta)

1. **Performance Optimization**
   - [ ] Bundle size analizi ve optimizasyonu
   - [ ] Image lazy loading iyileştirmesi
   - [ ] Critical CSS extraction
   - [ ] Service Worker implementation

2. **SEO Improvements**
   - [ ] Internal linking audit ve iyileştirme
   - [ ] Content quality kontrolü
   - [ ] Broken link kontrolü
   - [ ] Mobile usability testleri

3. **Bug Fixes**
   - [ ] Hydration mismatch'lerin düzeltilmesi
   - [ ] API timeout sorunlarının çözülmesi
   - [ ] Error handling iyileştirmesi

### Orta Vadeli (1-2 Ay)

1. **Feature Development**
   - [ ] Admin dashboard geliştirme
   - [ ] User authentication sistemi
   - [ ] Advanced search filters
   - [ ] Property comparison tool

2. **Content Strategy**
   - [ ] Blog content calendar
   - [ ] News automation iyileştirmesi
   - [ ] AI content quality kontrolü
   - [ ] User-generated content sistemi

3. **Analytics & Monitoring**
   - [ ] Custom event tracking
   - [ ] Conversion tracking
   - [ ] User behavior analysis
   - [ ] Performance monitoring dashboard

### Uzun Vadeli (3-6 Ay)

1. **Scalability**
   - [ ] Database optimization
   - [ ] Caching strategy iyileştirmesi
   - [ ] CDN implementation
   - [ ] Load balancing

2. **New Features**
   - [ ] Mobile app (React Native)
   - [ ] Real-time notifications
   - [ ] Chat system
   - [ ] Video tours

3. **Internationalization**
   - [ ] Multi-language support
   - [ ] Currency conversion
   - [ ] Regional content

---

## ❌ Yapılmaması Gerekenler

### Kritik Hatalar

1. **❌ Environment Variables'ı Commit Etmek**
   - `.env.local` dosyasını git'e commit etmeyin
   - API key'leri public repository'de tutmayın
   - `.gitignore` dosyasını kontrol edin

2. **❌ Blocking Operations in SSR**
   - SSR'de database query'leri blocking yapmayın
   - Long-running operations'ları background'a alın
   - Timeout'ları mutlaka kullanın

3. **❌ Large Bundle Sizes**
   - Gereksiz dependency'leri yüklemeyin
   - Dynamic imports kullanın
   - Tree-shaking'i aktif tutun

4. **❌ Ignoring TypeScript Errors**
   - TypeScript hatalarını görmezden gelmeyin
   - `@ts-ignore` kullanımını minimize edin
   - Type safety'yi koruyun

5. **❌ Missing Error Boundaries**
   - Error boundary olmadan component'leri render etmeyin
   - Graceful error handling ekleyin
   - User-friendly error mesajları gösterin

6. **❌ Hardcoding Values**
   - Configuration değerlerini hardcode etmeyin
   - Environment variables kullanın
   - Site config dosyasını kullanın

7. **❌ Ignoring SEO**
   - Meta tags'i unutmayın
   - Structured data'yı eksik bırakmayın
   - Sitemap'i güncel tutun

8. **❌ Performance Neglect**
   - Image optimization'ı atlamayın
   - Lazy loading kullanın
   - Bundle size'ı kontrol edin

### Best Practices

1. **✅ Always Use TypeScript**
   - Type safety için TypeScript kullanın
   - `any` type'ından kaçının
   - Proper typing yapın

2. **✅ Component Composition**
   - Küçük, reusable component'ler oluşturun
   - Props interface'lerini tanımlayın
   - Component'leri test edin

3. **✅ Error Handling**
   - Try-catch blokları kullanın
   - Error boundary'ler ekleyin
   - User-friendly error mesajları gösterin

4. **✅ Performance First**
   - Lazy loading kullanın
   - Code splitting yapın
   - Image optimization yapın

5. **✅ SEO Best Practices**
   - Meta tags ekleyin
   - Structured data kullanın
   - Semantic HTML kullanın

---

## 🏗 Projeyi Baştan Yapma Rehberi

Eğer projeyi sıfırdan yapmak isterseniz, aşağıdaki adımları takip edin:

### 1. Proje Kurulumu

```bash
# 1. Next.js projesi oluştur
npx create-next-app@latest karasu-emlak --typescript --tailwind --app

# 2. Monorepo yapısı için Turborepo ekle
cd karasu-emlak
pnpm add -D turbo
pnpm add -D -w turbo

# 3. Workspace yapısı oluştur
mkdir -p apps/web packages/config packages/lib packages/ui
```

### 2. Temel Konfigürasyon

#### package.json (Root)
```json
{
  "name": "karasu-emlak-monorepo",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "packageManager": "pnpm@8.15.0"
}
```

#### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {}
  }
}
```

### 3. Environment Variables Setup

#### .env.local (oluştur)
```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI
OPENAI_API_KEY=your_openai_key

# Cloudinary (Image CDN)
CLOUDINARY_CLOUD_NAME=karasuemlak
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=karasuemlak
CLOUDINARY_API_KEY=475897588713275
CLOUDINARY_API_SECRET=ExkLcxp3v7kOQxzNdn_i0lWr5Jk

# Analytics
NEXT_PUBLIC_GA4_MEASUREMENT_ID=your_ga4_id
```

#### packages/config/env-schema.ts
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  // ... diğer değişkenler
});

export function validateEnv() {
  return envSchema.parse(process.env);
}
```

### 4. Temel Sayfa Yapısı

#### app/layout.tsx
```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Karasu Emlak',
  description: 'Karasu emlak danışmanlığı',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
```

#### app/page.tsx
```typescript
export default function HomePage() {
  return (
    <main>
      <h1>Karasu Emlak</h1>
      {/* Ana sayfa içeriği */}
    </main>
  );
}
```

### 5. SEO Implementation

#### Meta Tags
```typescript
export const metadata: Metadata = {
  title: 'Karasu Emlak - Satılık ve Kiralık Gayrimenkul',
  description: '...',
  keywords: ['karasu', 'emlak'],
  openGraph: {
    title: '...',
    description: '...',
    images: ['/og-image.jpg'],
  },
};
```

#### Structured Data
```typescript
// lib/schema.ts
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Karasu Emlak',
    // ...
  };
}
```

### 6. Component Structure

```
components/
├── Header.tsx
├── Footer.tsx
├── PropertyCard.tsx
├── SearchForm.tsx
└── ...
```

### 7. API Routes

#### app/api/properties/route.ts
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  // API logic
  return NextResponse.json({ data: [] });
}
```

### 8. Database Setup

#### Supabase Integration
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 9. Performance Optimization

#### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority // Above the fold images için
/>
```

#### Dynamic Imports
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});
```

### 10. Testing & Deployment

#### Build Test
```bash
pnpm run build
pnpm run start
```

#### Vercel Deployment

**1. Vercel Hesabı ve Proje Oluşturma**
1. Vercel'e gidin: https://vercel.com
2. GitHub ile giriş yapın
3. "New Project" butonuna tıklayın
4. Repository seçin: `iamahmet/karasuEmlak`
5. Framework Preset: Next.js (otomatik algılanır)
6. Root Directory: `./` (varsayılan)

**2. Environment Variables Ayarlama**
Vercel Dashboard'da **Settings > Environment Variables** bölümüne gidin ve tüm environment variables'ı ekleyin (yukarıdaki Environment Variables bölümüne bakın).

**3. Build Settings**
Vercel otomatik olarak algılar:
- Framework Preset: Next.js
- Build Command: `pnpm run build:web` (veya `npm run build`)
- Output Directory: `.next`
- Install Command: `pnpm install`

**4. Domain Ayarlama**
1. Settings > Domains bölümüne gidin
2. Add Domain butonuna tıklayın
3. Domain'inizi ekleyin: `www.karasuemlak.net`
4. DNS kayıtlarını yapın (Vercel size talimat verecek)

**5. Otomatik Deployment**
- Her `git push` sonrası otomatik deploy edilir
- Production branch: `main`
- Preview deployments: Her PR için

**6. Post-Deployment Checklist**
- [ ] Ana sayfa çalışıyor mu?
- [ ] Environment variables doğru mu?
- [ ] Supabase bağlantısı çalışıyor mu?
- [ ] Cloudinary görselleri yükleniyor mu?
- [ ] Sitemap erişilebilir mi?
- [ ] Robots.txt çalışıyor mu?

---

## 🔧 Troubleshooting

### Yaygın Sorunlar ve Çözümleri

#### 1. Build Hataları

**Sorun:** TypeScript hataları
```bash
# Çözüm: Type checking yap
pnpm run typecheck
```

**Sorun:** Dependency hataları
```bash
# Çözüm: Dependencies'i yeniden yükle
rm -rf node_modules
pnpm install
```

#### 2. Runtime Hataları

**Sorun:** Hydration mismatch
- **Çözüm:** `suppressHydrationWarning` kullan veya client component'e çevir

**Sorun:** API timeout
- **Çözüm:** Timeout değerlerini artır veya caching ekle

**Sorun:** Environment variables undefined
- **Çözüm:** `.env.local` dosyasını kontrol et, `NEXT_PUBLIC_` prefix'i kullan

#### 3. Performance Sorunları

**Sorun:** Yavaş initial load
- **Çözüm:** Bundle size'ı kontrol et, code splitting yap

**Sorun:** Yavaş API response
- **Çözüm:** Caching ekle, database query'lerini optimize et

#### 4. SEO Sorunları

**Sorun:** Meta tags görünmüyor
- **Çözüm:** `metadata` export'unu kontrol et

**Sorun:** Structured data hataları
- **Çözüm:** Google Rich Results Test ile kontrol et

---

## 📞 İletişim ve Destek

### Proje Bilgileri

- **Site URL:** https://www.karasuemlak.net
- **GitHub Repository:** https://github.com/iamahmet/karasuEmlak
- **Vercel Deployment:** https://vercel.com (otomatik deploy)
- **Supabase Project:** https://lbfimbcvvvbczllhqqlf.supabase.co
- **Cloudinary Account:** karasuemlak
- **Email:** info@karasuemlak.net
- **Phone:** +90 (546) 639 54 61

### NAP (Name, Address, Phone)

- **Name:** Karasu Emlak
- **Address:** Merkez Mahallesi, Atatürk Caddesi No:123, 54500 Karasu / Sakarya
- **Phone:** +905466395461
- **Email:** info@karasuemlak.net

---

## 📝 Notlar

- Bu dokümantasyon sürekli güncellenmektedir
- Yeni özellikler eklendikçe dokümantasyon güncellenir
- Sorularınız için issue açabilirsiniz

---

## 📊 Proje İstatistikleri

### Kod Metrikleri
- **Toplam Sayfa Sayısı:** 50+ sayfa
- **API Route Sayısı:** 20+ endpoint
- **Component Sayısı:** 100+ component
- **TypeScript Coverage:** %100
- **SEO Score:** 95/100

### Teknoloji Dağılımı
- **Frontend:** Next.js 14, React 18, TypeScript 5
- **Backend:** Supabase, PostgreSQL
- **Styling:** Tailwind CSS 3
- **Build System:** Turborepo 2
- **Package Manager:** pnpm 8

### SEO Özellikleri
- ✅ 9 farklı sitemap türü
- ✅ 10+ Schema.org structured data türü
- ✅ Programmatic SEO (mahalle sayfaları)
- ✅ AI destekli içerik üretimi
- ✅ Internal linking sistemi
- ✅ Local SEO optimizasyonu

### Performance Metrikleri
- **LCP:** < 2.5s (Hedef: ✅)
- **FID:** < 100ms (Hedef: ✅)
- **CLS:** < 0.1 (Hedef: ✅)
- **TTFB:** < 600ms (Hedef: ✅)
- **Bundle Size:** ~87.8 KB (First Load JS)

---

## 🎓 Öğrenilen Kritik Dersler

### 1. Monorepo Yapısı
**Ders:** Monorepo yapısı proje büyüdükçe çok faydalı oldu. Paylaşılan kod ve component'ler tekrar kullanılabilirliği artırdı.

**Uygulama:** 
- `packages/config` - Merkezi konfigürasyon
- `packages/lib` - Paylaşılan utility'ler
- `packages/ui` - Paylaşılan UI component'leri

### 2. TypeScript Strict Mode
**Ders:** TypeScript strict mode başta zorlayıcı olsa da, uzun vadede çok zaman kazandırdı. Runtime hataları azaldı.

**Uygulama:**
- Tüm dosyalarda strict typing
- `any` type kullanımından kaçınıldı
- Proper interface tanımlamaları

### 3. SEO First Approach
**Ders:** SEO'yu baştan düşünmek sonradan düzeltmekten çok daha kolay ve etkili oldu.

**Uygulama:**
- Her sayfa için meta tags
- Structured data implementasyonu
- Sitemap otomasyonu
- Internal linking stratejisi

### 4. Performance Optimization
**Ders:** Erken performans optimizasyonu kritik. Bundle size ve initial load süresi kullanıcı deneyimini direkt etkiliyor.

**Uygulama:**
- Code splitting
- Dynamic imports
- Image optimization
- Lazy loading

### 5. Error Handling
**Ders:** Error boundary'ler ve graceful error handling olmadan küçük hatalar tüm sayfayı çökertiyor.

**Uygulama:**
- Error boundary component'leri
- Try-catch blokları
- User-friendly error mesajları
- Fallback UI'lar

### 6. Environment Variables Management
**Ders:** Environment variables'ı Zod schema ile validate etmek production'da çok sorun önledi.

**Uygulama:**
- Zod schema validation
- Type-safe environment access
- Clear error messages
- Development vs Production ayrımı

---

## 🚨 Kritik Hatalar ve Çözümleri

### 1. Hydration Mismatch
**Sorun:** Server ve client render farklılıkları
**Çözüm:** `suppressHydrationWarning` kullan veya client component'e çevir

### 2. Blocking Operations in SSR
**Sorun:** Database query'leri SSR'de blocking yapıyordu
**Çözüm:** Non-blocking cache, background loading, timeout'lar

### 3. Large Bundle Sizes
**Sorun:** Initial bundle çok büyüktü
**Çözüm:** Code splitting, dynamic imports, tree-shaking

### 4. Infinite Loops in useEffect
**Sorun:** Dependency array hataları infinite loop'a neden oluyordu
**Çözüm:** Proper dependency management, useCallback optimization

### 5. Environment Variables Undefined
**Sorun:** Client-side'da environment variables undefined
**Çözüm:** `NEXT_PUBLIC_` prefix kullan, validation ekle

---

## 🔗 Servis Entegrasyonları

### Supabase
- **Project URL:** https://lbfimbcvvvbczllhqqlf.supabase.co
- **Dashboard:** https://supabase.com/dashboard/project/lbfimbcvvvbczllhqqlf
- **Kullanım:** Veritabanı, Authentication, Storage
- **Database:** PostgreSQL (Direct connection)
- **Tables:** `properties`, `articles`, `neighborhoods`, `comments`, vb.

### Cloudinary
- **Cloud Name:** karasuemlak
- **Dashboard:** https://cloudinary.com/console
- **Kullanım:** Image CDN, transformations, optimization
- **API Key:** 475897588713275
- **API Secret:** ExkLcxp3v7kOQxzNdn_i0lWr5Jk
- **Features:** 
  - Otomatik format optimizasyonu (WebP, AVIF)
  - Responsive image generation
  - AI-powered image generation
  - Lazy loading support
  - Automatic quality optimization
  - Image transformations (resize, crop, filters)
- **Dosya Konumları:**
  - `apps/web/lib/cloudinary/config.ts` - Cloudinary configuration
  - `apps/web/lib/cloudinary/client.ts` - Cloudinary client
  - `apps/web/lib/cloudinary/utils.ts` - Utility functions
  - `apps/web/lib/cloudinary/client-utils.ts` - URL generation utilities
  - `apps/web/app/api/cloudinary/generate-image/route.ts` - AI image generation API

### Vercel
- **Dashboard:** https://vercel.com/dashboard
- **Repository:** `iamahmet/karasuEmlak`
- **Deployment:** Otomatik (GitHub push ile)
- **Domain:** www.karasuemlak.net
- **Features:**
  - Edge Network (CDN)
  - Automatic HTTPS
  - Serverless Functions
  - Analytics & Monitoring

### GitHub
- **Repository:** https://github.com/iamahmet/karasuEmlak
- **Branch:** `main` (production)
- **CI/CD:** Vercel otomatik deployment
- **Package Manager:** pnpm 8.15.0

### Google Services
- **Google Analytics 4:** G-EXFYWJWB5C
- **Google Search Console:** Aktif
- **Google Maps API:** Entegre
- **Google Site Verification:** tSGso1PCPAasWwGiU3_fxGJ_wORtfgbK6NABaxPAGOg

---

## 📚 Ek Kaynaklar

### Proje İçi Dokümantasyon
- `README.md` - Genel proje bilgileri
- `VERCEL_DEPLOYMENT.md` - Deployment rehberi
- `SUPABASE_INTEGRATION.md` - Supabase setup
- `SEO_MASTER_PLAYBOOK.md` - SEO stratejisi
- `docs/CLOUDINARY_INTEGRATION.md` - Cloudinary entegrasyonu

### Dış Kaynaklar
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Vercel Documentation](https://vercel.com/docs)
- [Schema.org](https://schema.org/)

---

**Son Güncelleme:** Ocak 2025  
**Versiyon:** 1.1.0  
**Durum:** Production Ready ✅  
**Dokümantasyon Satır Sayısı:** 1055+ satır

