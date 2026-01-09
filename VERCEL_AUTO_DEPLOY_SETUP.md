# 🚀 Vercel Otomatik Deploy Kurulumu

## ✅ GitHub Push Tamamlandı

Proje başarıyla GitHub'a push edildi:
- **Repository**: `https://github.com/iamahmet/karasuEmlak.git`
- **Branch**: `main`
- **Commit**: `617697d2`

## 🔧 Vercel Otomatik Deploy Ayarları

### 1. Vercel Dashboard'da Proje Ayarları

Her iki proje için (web ve admin) aşağıdaki ayarları yapın:

#### Web App (karasuemlak.net)
1. Vercel Dashboard → `karasu-emlak` projesi
2. **Settings** → **Git**
   - ✅ GitHub entegrasyonu aktif olmalı
   - ✅ Production Branch: `main`
   - ✅ Auto-deploy: `ON`

3. **Settings** → **General**
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && SKIP_ENV_VALIDATION=true turbo run build --filter=web`
   - **Output Directory**: `.next`
   - **Install Command**: `cd ../.. && pnpm install`

#### Admin App (admin.karasuemlak.net)
1. Vercel Dashboard → Yeni proje oluştur veya mevcut admin projesi
2. **Settings** → **Git**
   - ✅ GitHub entegrasyonu aktif olmalı
   - ✅ Production Branch: `main`
   - ✅ Auto-deploy: `ON`

3. **Settings** → **General**
   - **Root Directory**: `apps/admin`
   - **Build Command**: `cd ../.. && pnpm install && pnpm run build:admin`
   - **Output Directory**: `.next`
   - **Install Command**: `cd ../.. && pnpm install`

### 2. Environment Variables (Vercel Dashboard)

Her iki projeye de aşağıdaki environment variable'ları ekleyin:

#### Web App Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://lbfimbcvvvbczllhqqlf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=IGuVzv1NGhamrNH9/mWPbidTKq7dwd8Jj6LedwgtlxNByHwafu32x6mKezMcPWLguJ5iCAY3N6DQrbvYTQfJXw==

# Database
DATABASE_URL=postgresql://postgres:A1683myPX87czfXR@db.lbfimbcvvvbczllhqqlf.supabase.co:5432/postgres
SUPABASE_DB_HOST=db.lbfimbcvvvbczllhqqlf.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=A1683myPX87czfXR

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=dqucm2ffl
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dqucm2ffl
CLOUDINARY_API_KEY=475897588713275
CLOUDINARY_API_SECRET=ExkLcxp3v7kOQxzNdn_i0lWr5Jk
CLOUDINARY_URL=cloudinary://475897588713275:ExkLcxp3v7kOQxzNdn_i0lWr5Jk@dqucm2ffl

# URLs
NEXT_PUBLIC_SITE_URL=https://www.karasuemlak.net
NEXT_PUBLIC_ADMIN_URL=https://admin.karasuemlak.net

# GitHub (for CI/CD)
GITHUB_TOKEN=your-github-token-here
```

#### Admin App Environment Variables
```bash
# Supabase (aynı)
NEXT_PUBLIC_SUPABASE_URL=https://lbfimbcvvvbczllhqqlf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=IGuVzv1NGhamrNH9/mWPbidTKq7dwd8Jj6LedwgtlxNByHwafu32x6mKezMcPWLguJ5iCAY3N6DQrbvYTQfJXw==

# Database (aynı)
DATABASE_URL=postgresql://postgres:A1683myPX87czfXR@db.lbfimbcvvvbczllhqqlf.supabase.co:5432/postgres
SUPABASE_DB_HOST=db.lbfimbcvvvbczllhqqlf.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=A1683myPX87czfXR

# OpenAI (aynı)
OPENAI_API_KEY=your-openai-api-key-here

# Cloudinary (aynı)
CLOUDINARY_CLOUD_NAME=dqucm2ffl
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dqucm2ffl
CLOUDINARY_API_KEY=475897588713275
CLOUDINARY_API_SECRET=ExkLcxp3v7kOQxzNdn_i0lWr5Jk
CLOUDINARY_URL=cloudinary://475897588713275:ExkLcxp3v7kOQxzNdn_i0lWr5Jk@dqucm2ffl

# URLs (farklı)
NEXT_PUBLIC_SITE_URL=https://www.karasuemlak.net
NEXT_PUBLIC_ADMIN_URL=https://admin.karasuemlak.net

# GitHub (aynı)
GITHUB_TOKEN=your-github-token-here
```

### 3. Domain Ayarları

#### Web App Domain
- **Production**: `www.karasuemlak.net` veya `karasuemlak.net`
- Vercel Dashboard → Project → Settings → Domains

#### Admin App Domain
- **Production**: `admin.karasuemlak.net`
- Vercel Dashboard → Project → Settings → Domains
- DNS CNAME kaydı: `admin` → `cname.vercel-dns.com`

### 4. Otomatik Deploy Kontrolü

Vercel otomatik olarak:
- ✅ Her `main` branch push'unda deploy yapar
- ✅ Pull Request'lerde preview deployment oluşturur
- ✅ Build hatalarında bildirim gönderir

### 5. Deploy Durumunu Kontrol Etme

```bash
# Vercel CLI ile deploy durumunu kontrol et
vercel ls

# Vercel CLI ile logları görüntüle
vercel logs [deployment-url]
```

### 6. GitHub Actions (Opsiyonel)

Eğer ekstra CI/CD kontrolü istiyorsanız, `.github/workflows/vercel-deploy.yml` oluşturabilirsiniz:

```yaml
name: Vercel Deployment
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run build
```

## ✅ Sonraki Adımlar

1. ✅ GitHub'a push edildi
2. ⏳ Vercel Dashboard'da environment variable'ları ekleyin
3. ⏳ Domain ayarlarını yapın (DNS kayıtları)
4. ⏳ İlk deploy'u tetikleyin veya otomatik deploy'u bekleyin
5. ⏳ Deploy durumunu kontrol edin

## 🔍 Deploy Durumunu Kontrol

1. Vercel Dashboard → Projects
2. Her proje için **Deployments** sekmesine bakın
3. Son commit'in deploy edilip edilmediğini kontrol edin
4. Build loglarını inceleyin

## 📝 Notlar

- Vercel otomatik olarak GitHub'daki değişiklikleri algılar
- `main` branch'e her push otomatik deploy tetikler
- Environment variable'lar her proje için ayrı ayrı ayarlanmalı
- Admin subdomain için DNS CNAME kaydı gerekli

---

**Son Güncelleme**: $(date)
**Status**: ✅ GitHub push tamamlandı, Vercel deploy bekleniyor
