# 🏠 Karasu Emlak

Professional real estate website for karasuemlak.net

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (web app)
pnpm run dev:web

# Start development server (admin panel)
pnpm run dev:admin

# Build for production
pnpm run build

# Type checking
pnpm run typecheck

# Linting
pnpm run lint
```

## 📁 Project Structure

```
karasuEmlakSon/
├── apps/
│   ├── web/          # Public website (karasuemlak.net)
│   └── admin/        # Admin panel (admin.karasuemlak.net)
├── packages/
│   ├── config/       # Shared configuration (env, site config, NAP)
│   ├── lib/          # Shared utilities (Supabase, Cloudinary)
│   └── ui/           # Shared UI components (shadcn/ui)
├── scripts/          # Automation scripts
└── supabase/         # Supabase migrations
```

## 🔐 Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values.

See `PROJECT_DOCUMENTATION.md` for detailed environment variable documentation.

## 🚀 Deployment

### Vercel Otomatik Deploy

Proje Vercel'e otomatik deploy için yapılandırılmıştır:

1. **GitHub Integration (Önerilen):**
   - Vercel Dashboard → Add Project → GitHub repo seç
   - Root Directory: `apps/web` (web app) veya `apps/admin` (admin panel)
   - Environment variables ekle (`.env.example` dosyasına bakın)

2. **Otomatik Deploy:**
   - Her `main` branch push → Production deploy
   - Her PR → Preview deploy

📖 **Detaylı kurulum:** [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

## 📚 Documentation

- [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) - Vercel deployment guide
- [ROADMAP.md](./ROADMAP.md) - Development roadmap and phases
- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) - Complete project documentation
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture and technical details
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [DURUM_NOTU.md](./DURUM_NOTU.md) - Current project status
- [GELISTIRME_ONERILERI_V7.md](./GELISTIRME_ONERILERI_V7.md) - Latest development recommendations
- [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md) - Project analysis and cleanup plan

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Image CDN:** Cloudinary
- **Monorepo:** Turborepo
- **Package Manager:** pnpm 8.15+

## 📝 Development Status

- ✅ FAZE 1: Monorepo setup
- ✅ FAZE 2: Next.js setup & integrations
- ✅ FAZE 3: Public site pages
- ✅ FAZE 4: SEO & Performance
- ✅ FAZE 5: Content system
- ✅ FAZE 6: Authentication
- ✅ FAZE 7: Admin panel
- ✅ FAZE 8: Database & API
- ✅ FAZE 9: Automation scripts
- ✅ FAZE 10: Testing & Deployment

## ✨ Recent Features

- ✅ **PWA (Progressive Web App)** - Offline support, push notifications, background sync
- ✅ **Price Alerts** - Users can set price alerts for listings
- ✅ **Saved Searches** - Save and manage search criteria
- ✅ **Advanced Filters** - Enhanced filtering with sorting, quick filters, date ranges
- ✅ **Comparison Tool** - Compare up to 4 listings side-by-side
- ✅ **Enhanced Sharing** - Share listings via multiple platforms with QR codes
- ✅ **Professional Sitemap** - Optimized sitemap with proper priorities and change frequencies
- ✅ **Admin Panel Integration** - Seamless sync between admin panel and web app

## 🌍 Internationalization

Supported locales: `tr`, `en`, `et`, `ru`, `ar`

RTL support for Arabic (`ar`).

## 📞 Contact

- **Email:** info@karasuemlak.net
- **Phone:** +90 (546) 639 54 61
- **Website:** https://www.karasuemlak.net

