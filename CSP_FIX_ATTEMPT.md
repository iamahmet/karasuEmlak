# CSP Header Düzeltme Denemesi

**Tarih:** 2026-01-05  
**Durum:** 🔄 Düzeltme denemesi

---

## 🔧 Sorun

Browser console'da CSP parse hataları devam ediyor:
```
The Content-Security-Policy directive 'default-src' contains 'script-src' as a source expression.
```

## ✅ Yapılan Değişiklik

CSP header'ı **direkt string formatına** çevrildi (array + join yerine):

```javascript
// Önceki (Array + Join - Hala hata veriyordu)
value: [
  "default-src 'self'",
  "script-src ...",
  // ...
].join('; ')

// Yeni (Direkt String)
value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' ...; style-src ..."
```

**Dosya:** `apps/web/next.config.mjs` (satır 119)

---

## 📋 CSP Directive'leri

```
default-src 'self'
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.gstatic.com https://browser.sentry-cdn.com
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
img-src 'self' data: https: blob:
font-src 'self' data: https://fonts.gstatic.com
connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://*.sentry.io wss://*.supabase.co
frame-src 'self' https://www.google.com
object-src 'none'
base-uri 'self'
form-action 'self'
worker-src 'self' blob:
manifest-src 'self'
```

---

## ✅ Test

1. **Cache Temizlendi:** ✅
2. **Dev Server Yeniden Başlatıldı:** ✅
3. **Browser Console Kontrolü:**
   - Hard refresh yapın (Cmd+Shift+R / Ctrl+Shift+R)
   - CSP hataları olmamalı

---

## 🔍 Not

Eğer hala hata devam ederse, Next.js'in header formatı veya Sentry wrapper'ı header'ları override ediyor olabilir. Bu durumda:
- Sentry config'i kontrol edilmeli
- Veya CSP header'ı middleware'de set edilmeli
