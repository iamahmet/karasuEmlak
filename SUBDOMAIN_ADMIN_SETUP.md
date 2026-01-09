# Admin Panel Subdomain Kurulumu

## 🎯 Genel Bakış

Admin paneli artık subdomain'de çalışacak şekilde yapılandırıldı:
- **Web App:** `www.karasuemlak.net` veya `karasuemlak.net`
- **Admin Panel:** `admin.karasuemlak.net`

## 📋 Yapılan Değişiklikler

### 1. Admin App Middleware ✅
- Subdomain kontrolü eklendi
- Production'da `admin.*` subdomain kontrolü yapılıyor
- Development'ta `localhost:3001` kullanılıyor

### 2. Web App Middleware ✅
- `/admin` route'ları artık admin subdomain'e redirect ediyor
- Ana domain'de `/admin` route'larına erişim engellendi

## 🔧 DNS Konfigürasyonu

### DNS Kayıtları

Aşağıdaki DNS kayıtlarını ekleyin:

```
# Ana Domain (Web App)
A     @                   76.76.21.21    (Vercel IP - otomatik)
CNAME www                 cname.vercel-dns.com

# Admin Subdomain
CNAME admin               cname.vercel-dns.com
```

**Not:** Vercel otomatik olarak DNS kayıtlarını yönetir. Sadece CNAME kaydı eklemeniz yeterli.

## 🚀 Vercel Konfigürasyonu

### PROJE 1: Web App (karasuemlak.net)

1. **Vercel Dashboard → Project Settings:**
   - **Project Name:** `karasu-emlak-web`
   - **Root Directory:** `apps/web`
   - **Framework:** Next.js

2. **Domain Mapping:**
   - Settings → Domains
   - `karasuemlak.net` ekle
   - `www.karasuemlak.net` ekle (redirect to karasuemlak.net)

### PROJE 2: Admin Panel (admin.karasuemlak.net)

1. **Yeni Proje Oluştur:**
   - Vercel Dashboard → "Add New..." → "Project"
   - Repository: `iamahmet/karasuEmlak`
   - Framework Preset: **Next.js**

2. **Project Settings → General:**
   - **Project Name:** `karasu-emlak-admin`
   - **Root Directory:** `apps/admin` ⚠️ **KRİTİK**
   - **Framework Preset:** Next.js
   - **Build Command:** (otomatik - `apps/admin/vercel.json`'dan alınır)
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && pnpm install`

3. **Domain Mapping:**
   - Settings → Domains
   - `admin.karasuemlak.net` ekle

4. **Environment Variables:**
   Admin projesine aynı environment variable'ları ekleyin:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   SUPABASE_JWT_SECRET=...
   OPENAI_API_KEY=...
   CLOUDINARY_URL=...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   DATABASE_URL=...
   NEXT_PUBLIC_SITE_URL=https://www.karasuemlak.net
   NEXT_PUBLIC_ADMIN_URL=https://admin.karasuemlak.net
   ```

## 🧪 Local Development

### Development Modu

**Web App:**
```bash
pnpm dev:web
# http://localhost:3000
```

**Admin Panel:**
```bash
pnpm dev:admin
# http://localhost:3001
```

### Local Subdomain Test (macOS)

`/etc/hosts` dosyasına ekleyin:
```
127.0.0.1 admin.localhost
```

Sonra:
- Web: http://localhost:3000
- Admin: http://admin.localhost:3001

## 📝 Environment Variables

### Web App (.env.local)
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

### Admin App (.env.local)
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
```

### Production
```bash
NEXT_PUBLIC_SITE_URL=https://www.karasuemlak.net
NEXT_PUBLIC_ADMIN_URL=https://admin.karasuemlak.net
```

## ✅ Doğrulama

1. **DNS Kontrolü:**
   ```bash
   dig admin.karasuemlak.net
   # CNAME kaydını kontrol edin
   ```

2. **Vercel Deploy:**
   - Her iki proje de ayrı deploy edilmeli
   - Admin projesi `apps/admin` root directory ile
   - Web projesi `apps/web` root directory ile

3. **Test:**
   - `https://www.karasuemlak.net` → Web app çalışmalı
   - `https://admin.karasuemlak.net` → Admin panel çalışmalı
   - `https://www.karasuemlak.net/admin` → Admin subdomain'e redirect olmalı

## 🔒 Güvenlik

- Admin subdomain sadece admin app'ten erişilebilir
- Web app'teki `/admin` route'ları admin subdomain'e redirect ediyor
- Middleware'de subdomain kontrolü var
- Production'da auth check aktif

## 📚 Sonraki Adımlar

1. DNS kayıtlarını ekleyin (CNAME: admin → Vercel)
2. Vercel'de admin projesini oluşturun
3. Domain mapping yapın (admin.karasuemlak.net)
4. Environment variable'ları ekleyin
5. Deploy edin ve test edin

---

**Durum:** ✅ Subdomain routing yapılandırıldı  
**Admin App:** ✅ `apps/admin` subdomain'de çalışacak  
**Web App:** ✅ `/admin` route'ları admin subdomain'e redirect ediyor
