# 🚨 Admin Subdomain Hızlı Düzeltme

## Sorun
`admin.karasuemlak.net` → `karasuemlak.net` ile aynı içeriği gösteriyor

## ⚡ Hızlı Çözüm (5 Dakika)

### Adım 1: Vercel Dashboard Kontrolü

1. **Vercel Dashboard'a git:** https://vercel.com/dashboard
2. **Web projesini aç** (karasuemlak.net'i gösteren proje)
3. **Settings → Domains** sekmesine git
4. **`admin.karasuemlak.net` var mı kontrol et**
   - ✅ **Varsa:** Remove butonuna tıkla ve kaldır

### Adım 2: Admin Projesini Bul veya Oluştur

**Seçenek A: Admin projesi varsa**
1. Vercel Dashboard → Admin projesini bul
2. Settings → Domains
3. `admin.karasuemlak.net` ekle
4. Settings → General → Root Directory: `apps/admin` ✅

**Seçenek B: Admin projesi yoksa**
1. Vercel Dashboard → Add New Project
2. Repository: `iamahmet/karasuEmlak`
3. Framework: Next.js
4. **Root Directory:** `apps/admin` ⚠️ **KRİTİK**
5. Project Name: `karasu-emlak-admin`
6. Settings → Domains → `admin.karasuemlak.net` ekle
7. Environment Variables ekle (web projesindeki gibi)

### Adım 3: Redeploy

1. Admin projesi → Deployments
2. "Redeploy" butonuna tıkla
3. 2-3 dakika bekle

### Adım 4: Test

1. `https://admin.karasuemlak.net` aç
2. Admin panel görünmeli (login sayfası veya dashboard)
3. Web sitesi görünmemeli

## 🔍 Detaylı Kontrol

### Vercel CLI ile Kontrol (Opsiyonel)

```bash
# Web projesi domain'lerini kontrol et
cd apps/web
vercel domains ls

# Admin projesi domain'lerini kontrol et  
cd apps/admin
vercel domains ls
```

## ✅ Doğrulama Checklist

- [ ] `admin.karasuemlak.net` web projesinde YOK
- [ ] `admin.karasuemlak.net` admin projesinde VAR
- [ ] Admin projesinde Root Directory: `apps/admin`
- [ ] Admin projesi son commit'ten deploy edilmiş
- [ ] Build loglarında `apps/admin` görünüyor

## 🚨 Hala Çalışmıyorsa

1. **DNS Cache temizle:**
   - Tarayıcı cache'i temizle (Ctrl+Shift+Delete)
   - Veya incognito/private mode'da test et

2. **Vercel DNS Propagation:**
   - Domain mapping değişikliği 5-10 dakika sürebilir
   - Bekle ve tekrar dene

3. **Build Logları Kontrol:**
   - Admin projesi → Deployments → Son deployment → Build Logs
   - `apps/admin` görünmeli, `apps/web` görünmemeli

## 📞 Destek

Sorun devam ederse:
1. Vercel Dashboard → Admin Projesi → Settings → General
2. Root Directory'nin `apps/admin` olduğunu doğrula
3. Build Command'ın `cd ../.. && pnpm install && pnpm run build:admin` olduğunu doğrula
