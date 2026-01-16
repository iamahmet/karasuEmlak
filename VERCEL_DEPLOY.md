# 🚀 Vercel Otomatik Deploy Kurulumu

Bu proje Vercel'e otomatik deploy için yapılandırılmıştır. İki yöntem mevcuttur:

## Yöntem 1: Vercel GitHub Integration (Önerilen - En Kolay)

### Adımlar:

1. **Vercel Dashboard'a Git:**
   - https://vercel.com/dashboard
   - "Add New..." → "Project" tıkla

2. **GitHub Repository'yi Bağla:**
   - GitHub hesabınızı bağlayın (ilk kez ise)
   - `iamahmet/karasuEmlak` repository'sini seçin

3. **Web App (karasuemlak.net) için Proje Oluştur:**
   - **Project Name:** `karasu-emlak-web` (veya istediğiniz isim)
   - **Root Directory:** `apps/web` seçin
   - **Framework Preset:** Next.js (otomatik algılanır)
   - **Build Command:** `cd ../.. && pnpm install && pnpm run build:web`
   - **Output Directory:** `.next` (otomatik)
   - **Install Command:** `cd ../.. && pnpm install`

4. **Environment Variables Ekle:**
   - Vercel dashboard → Project Settings → Environment Variables
   - `.env.example` dosyasındaki tüm değişkenleri ekleyin
   - Production, Preview, Development için ayrı ayrı ekleyin

5. **Admin Panel (admin.karasuemlak.net) için Proje Oluştur:**
   - Yeni bir proje oluşturun
   - **Project Name:** `karasu-emlak-admin`
   - **Root Directory:** `apps/admin` seçin
   - **Build Command:** `cd ../.. && pnpm install && pnpm run build:admin`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && pnpm install`

6. **Domain Ayarları:**
   - Web App: `karasuemlak.net` ve `www.karasuemlak.net`
   - Admin Panel: `admin.karasuemlak.net`

### Otomatik Deploy:
- ✅ Her `main` branch'e push → Production deploy
- ✅ Her PR → Preview deploy
- ✅ Her commit → Preview URL oluşturulur

## Yöntem 2: GitHub Actions ile Vercel CLI (Alternatif)

### Gereksinimler:

1. **Vercel Token Oluştur:**
   ```bash
   # Vercel CLI ile login olun
   vercel login
   
   # Token alın
   vercel tokens create
   ```

2. **GitHub Secrets Ekle:**
   - GitHub repo → Settings → Secrets and variables → Actions
   - `VERCEL_TOKEN` secret'ını ekleyin (yukarıdaki token)

3. **Workflow Kullanımı:**
   - Otomatik: Her `main` branch push'unda deploy edilir
   - Manuel: Commit mesajına `[deploy-web]` veya `[deploy-admin]` ekleyin

### Workflow Dosyası:
`.github/workflows/vercel-deploy.yml` dosyası mevcuttur ve otomatik çalışır.

## 🔧 Vercel Configuration

### Web App (`apps/web/vercel.json`):
```json
{
  "buildCommand": "cd ../.. && pnpm install && pnpm run build:web",
  "devCommand": "cd ../.. && pnpm run dev:web",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "rootDirectory": "apps/web",
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "crons": [...]
}
```

### Admin Panel (`apps/admin/vercel.json`):
```json
{
  "buildCommand": "cd ../.. && pnpm install && pnpm run build:admin",
  "devCommand": "cd ../.. && pnpm run dev:admin",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "rootDirectory": "apps/admin",
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

## 📋 Environment Variables Checklist

📖 **Detaylı checklist:** [VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md)

Vercel'de şu environment variables'ları ekleyin:

### Required (Her İki Proje İçin):
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Optional (Web App):
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
- `CRON_SECRET`
- `REVALIDATE_SECRET`

### Optional (Admin Panel):
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_WEB_APP_URL` (web app URL'i)

## 🎯 Deploy Sonrası Kontroller

1. **Build Logs Kontrol:**
   - Vercel Dashboard → Deployments → Build Logs

2. **Environment Variables Doğrulama:**
   - Settings → Environment Variables → Tüm değişkenler mevcut mu?

3. **Domain Ayarları:**
   - Settings → Domains → Doğru domain'ler bağlı mı?

4. **Cron Jobs:**
   - Settings → Cron Jobs → Aktif mi?

5. **Function Logs:**
   - Vercel Dashboard → Functions → Logs kontrol

## 🐛 Sorun Giderme

### Build Hatası:
```bash
# Lokal build test
cd apps/web
cd ../.. && pnpm install && pnpm run build:web
```

### Environment Variable Hatası:
- Vercel Dashboard → Settings → Environment Variables
- Production, Preview, Development için ayrı ayrı kontrol edin

### Monorepo Root Hatası:
- Root Directory: `apps/web` veya `apps/admin` olmalı
- Build Command: `cd ../.. &&` ile başlamalı

### pnpm Hatası:
- Vercel otomatik algılar, ama manuel ayarlayabilirsiniz:
  - Settings → General → Install Command: `cd ../.. && pnpm install`

---

## ⚠️ Kritik Uyarılar ve Öğrenilen Dersler

### 1. CRON_SECRET Whitespace Sorunu

**Sorun:** `CRON_SECRET` environment variable'ında leading/trailing whitespace varsa Vercel build hata verir:
```
Error: The `CRON_SECRET` environment variable contains leading or trailing whitespace
```

**Çözüm:** Environment variable eklerken `echo` yerine `printf` kullanın:
```bash
# ❌ YANLIŞ - echo newline ekler
echo 'secret-value' | vercel env add CRON_SECRET production

# ✅ DOĞRU - printf whitespace eklemez
printf 'secret-value' | vercel env add CRON_SECRET production
```

**Düzeltme scripti:**
```bash
# Tüm ortamlardan sil
vercel env rm CRON_SECRET production --yes
vercel env rm CRON_SECRET preview --yes
vercel env rm CRON_SECRET development --yes

# Temiz olarak tekrar ekle
printf 'your-secret-here' | vercel env add CRON_SECRET production
printf 'your-secret-here' | vercel env add CRON_SECRET preview
printf 'your-secret-here' | vercel env add CRON_SECRET development
```

### 2. Vercel'de Birden Fazla Proje Karışıklığı

**Sorun:** Aynı repo için birden fazla Vercel projesi olabilir:
- `admin` (CLI'dan oluşturulmuş, Git bağlantısı yok)
- `karasu-emlak-admin` (GitHub'a bağlı, doğru olan)

**Çözüm:**
1. `vercel ls` ile hangi projeye bağlı olduğunuzu kontrol edin
2. Yanlış projedeyseniz: `rm -rf .vercel && vercel link --project DOGRU_PROJE_ADI --yes`
3. Gereksiz projeleri Vercel Dashboard'dan silin

**Proje yapısı:**
| Proje Adı | Domain | Açıklama |
|-----------|--------|----------|
| `karasu-emlak` | karasuemlak.net | Web uygulaması |
| `karasu-emlak-admin` | admin.karasuemlak.net | Admin paneli |

### 3. Root Directory Ayarı

**Sorun:** CLI'dan Root Directory değişikliği yapılamaz, Dashboard'dan yapılmalıdır.

**Önemli:**
- Vercel CLI cache'i eski ayarları gösterebilir
- `vercel project inspect` ile gösterilen değer güncel olmayabilir
- **Gerçek ayar her zaman Vercel Dashboard'dadır**

**Kontrol:**
```
https://vercel.com/[team]/[project]/settings/general
```

### 4. "Skip Deployments" Ayarı

**Sorun:** "Skip deployments when there are no changes to the root directory" ayarı aktifse ve apps/admin klasöründe değişiklik yoksa deploy iptal edilir (Canceled).

**Çözüm:**
- Bu ayarı kapatın VEYA
- Vercel Dashboard'dan manuel "Redeploy" yapın

### 5. Doğru Projeye Bağlanma

```bash
# Mevcut bağlantıyı kontrol et
cat .vercel/project.json

# Yeniden bağlan
rm -rf .vercel
vercel link --project karasu-emlak-admin --yes  # Admin için
vercel link --project karasu-emlak --yes         # Web için
```

### 6. Deploy Tetikleme Yöntemleri

| Yöntem | Komut/Aksiyon | Ne Zaman Kullanılır |
|--------|---------------|---------------------|
| Git Push | `git push origin main` | Normal geliştirme |
| CLI Deploy | `vercel --prod` | Hızlı test (monorepo root'tan) |
| Dashboard | Redeploy butonu | Env değişikliği sonrası |
| Boş Commit | `git commit --allow-empty -m "deploy"` | Zorla tetikleme |

## 📚 Kaynaklar

- [Vercel Monorepo Docs](https://vercel.com/docs/monorepos)
- [Vercel Next.js Docs](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Not:** İlk deploy'dan sonra Vercel otomatik olarak GitHub webhook'larını ayarlar ve her push'ta deploy eder.
