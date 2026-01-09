# Local Development Troubleshooting Guide

Bu dokümantasyon, local development ortamında karşılaşılan yaygın sorunları ve çözümlerini içerir.

## İçindekiler

1. [CSP (Content Security Policy) Hataları](#csp-content-security-policy-hataları)
2. [Supabase Bağlantı Sorunları](#supabase-bağlantı-sorunları)
3. [Environment Variables](#environment-variables)
4. [Genel Kontrol Listesi](#genel-kontrol-listesi)

---

## CSP (Content Security Policy) Hataları

### Sorun: Leaflet CSS Engelleniyorve

**Hata Mesajı:**
```
Loading the stylesheet 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css' violates the following Content Security Policy directive: "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'"
```

**Çözüm:**
`apps/web/lib/security/csp.ts` dosyasında `style-src` direktifine `https://unpkg.com` ekleyin:

```typescript
const styleSources = [
  "'self'",
  'https://fonts.googleapis.com',
  'https://unpkg.com',  // Leaflet CSS için
  "'unsafe-inline'",
];
```

### Sorun: Inline Script Engelleniyorve (Development)

**Hata Mesajı:**
```
Executing inline script violates the following Content Security Policy directive 'script-src 'self' 'nonce-xxx' ... Note that 'unsafe-inline' is ignored if either a hash or nonce value is present in the source list.
```

**Neden:**
CSP standardına göre, `nonce` kullanıldığında `'unsafe-inline'` görmezden gelinir.

**Çözüm:**
Development modunda nonce kullanmayın. `apps/web/lib/security/csp.ts`:

```typescript
const scriptSources = [
  "'self'",
  // Dev modda nonce kullanma - unsafe-inline çalışsın
  ...(!isDev && nonce ? [`'nonce-${nonce}'`] : []),
  // ... diğer kaynaklar
  ...(isDev ? ["'unsafe-eval'", "'unsafe-inline'"] : []),
];
```

### CSP Yapılandırma Dosyası Konumu

```
apps/web/lib/security/csp.ts
```

### İzin Verilen Kaynaklar Listesi

| Direktif | Kaynaklar |
|----------|-----------|
| `script-src` | self, googletagmanager, google-analytics, gstatic, googleapis, sentry, cloudinary |
| `style-src` | self, fonts.googleapis.com, unpkg.com, unsafe-inline |
| `img-src` | self, data:, https:, blob: |
| `font-src` | self, data:, fonts.gstatic.com |
| `connect-src` | self, supabase, google-analytics, sentry, cloudinary, vercel |

---

## Supabase Bağlantı Sorunları

### Sorun: "Invalid API key"

**Hata Mesajı:**
```
Error fetching listings: {
  message: 'Invalid API key',
  hint: 'Double check your Supabase `anon` or `service_role` API key.'
}
```

**Olası Nedenler:**

1. **API key'ler farklı dosyalarda farklı** - En yaygın sorun!
2. **API key yenilenmiş** - Supabase Dashboard'dan yeni key alınmalı
3. **Kopyalama hatası** - Eksik/fazla karakter

**Kontrol Edilecek Dosyalar:**

```bash
# Her iki dosyadaki key'leri karşılaştır
diff <(grep "SUPABASE_SERVICE_ROLE_KEY" .env.local) \
     <(grep "SUPABASE_SERVICE_ROLE_KEY" apps/web/.env.local)
```

**Çözüm:**

1. Supabase Dashboard → Settings → API'ye gidin
2. `service_role` key'ini kopyalayın
3. **Her iki dosyayı** güncelleyin:
   - `/.env.local` (root)
   - `/apps/web/.env.local`

### Environment Dosyaları Hiyerarşisi

```
karasuEmlakSon/
├── .env.local              # Root - bazı paketler buradan okur
├── apps/
│   ├── web/
│   │   └── .env.local      # Web app - Next.js buradan okur
│   └── admin/
│       └── .env.local      # Admin panel
```

**Önemli:** Her iki `.env.local` dosyasındaki Supabase key'leri **AYNI** olmalı!

### Gerekli Supabase Environment Variables

```env
# Public (client-side güvenli)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Server-side only
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # ÖNEMLİ: Sadece server'da kullanılmalı!
```

---

## Environment Variables

### Zorunlu Variables

| Variable | Açıklama | Nerede Kullanılır |
|----------|----------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Client & Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Client & Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role | Server only |
| `NEXT_PUBLIC_SITE_URL` | Site URL | SEO, metadata |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Image optimization |

### Environment Validation

Proje başlangıcında environment variables otomatik olarak validate edilir:

```typescript
// packages/config/env-schema.ts
export function getEnv(): Env {
  try {
    return validateEnv();
  } catch (error) {
    // Development'ta warning gösterir, production'da hata fırlatır
  }
}
```

### Yeni Environment Variable Ekleme

1. `packages/config/env-schema.ts` dosyasına schema ekleyin
2. Her iki `.env.local` dosyasını güncelleyin
3. Dev server'ı yeniden başlatın

---

## Genel Kontrol Listesi

### Local Development Başlamadan Önce

- [ ] `pnpm install` çalıştırıldı
- [ ] `.env.local` dosyaları mevcut (root ve apps/web)
- [ ] Supabase key'leri her iki dosyada aynı
- [ ] Port 3000 kullanılmıyor (`lsof -ti:3000`)

### Sorun Yaşandığında

1. **Console hatalarını kontrol et** (tarayıcı + terminal)
2. **CSP hatası varsa** → `csp.ts` dosyasını kontrol et
3. **Supabase hatası varsa** → Key'leri karşılaştır
4. **Dev server'ı yeniden başlat:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   pnpm run dev --filter=web
   ```

### Faydalı Komutlar

```bash
# Port 3000'i kill et
lsof -ti:3000 | xargs kill -9

# Environment variables kontrol
grep "SUPABASE" apps/web/.env.local

# Key karşılaştırma
diff <(grep "SUPABASE_SERVICE_ROLE_KEY" .env.local) \
     <(grep "SUPABASE_SERVICE_ROLE_KEY" apps/web/.env.local)

# Dev server başlat
pnpm run dev --filter=web

# Build test
pnpm run build --filter=web
```

---

## Sık Karşılaşılan Hatalar ve Çözümleri

| Hata | Olası Neden | Çözüm |
|------|-------------|-------|
| `Invalid API key` | Key uyuşmazlığı | Her iki .env.local'ı senkronize et |
| `CSP script violation` | Nonce + unsafe-inline çakışması | Dev'de nonce'u devre dışı bırak |
| `CSP style violation` | Yeni CDN eklenmemiş | style-src'ye domain ekle |
| `EADDRINUSE :3000` | Port kullanımda | `lsof -ti:3000 \| xargs kill -9` |
| `Module not found` | Dependency eksik | `pnpm install` |

---

## İletişim

Sorun çözülmezse:
1. Terminal ve browser console loglarını kaydet
2. `.env.local` dosyalarını (key'leri maskeleyerek) paylaş
3. Hangi sayfada/işlemde hata aldığını belirt

---

*Son güncelleme: Ocak 2026*
