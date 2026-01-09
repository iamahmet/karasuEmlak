# Asset Integration Guide

Bu dokümantasyon, logo, favicon ve icon dosyalarının projeye profesyonel bir şekilde entegre edilmesini açıklar.

## 📁 Klasör Yapısı

```
karasuEmlakSon/
├── gorseller/              # Kaynak görseller (buraya dosyalarınızı ekleyin)
│   ├── logo.svg
│   ├── logo-icon.svg
│   ├── favicon.ico
│   └── ...
├── apps/
│   ├── web/
│   │   └── public/        # Web uygulaması için public assets
│   └── admin/
│       └── public/        # Admin panel için public assets
└── scripts/
    └── setup-assets.ts    # Otomatik kopyalama scripti
```

## 🚀 Hızlı Başlangıç

### 1. Görselleri Ekleme

`gorseller/` klasörüne aşağıdaki dosyaları ekleyin:

**Zorunlu Dosyalar:**
- `favicon.ico` - 32x32 veya 16x16 piksel
- `logo.svg` - Tam logo (metin + icon)
- `logo-icon.svg` - Sadece icon (kare format)

**Opsiyonel Dosyalar (PWA için önerilir):**
- `icon-16x16.png` - 16x16 piksel
- `icon-32x32.png` - 32x32 piksel
- `icon-192x192.png` - 192x192 piksel (PWA)
- `icon-512x512.png` - 512x512 piksel (PWA)
- `apple-touch-icon.png` - 180x180 piksel (iOS)
- `safari-pinned-tab.svg` - Safari pinned tab icon

### 2. Otomatik Kopyalama

```bash
pnpm scripts:setup-assets
```

Bu komut:
- `gorseller/` klasöründeki tüm görselleri okur
- `apps/web/public/` ve `apps/admin/public/` klasörlerine kopyalar
- Hangi dosyaların kopyalandığını gösterir

### 3. Manuel Kopyalama

Script çalışmazsa, dosyaları manuel olarak kopyalayın:

```bash
# Web uygulaması için
cp gorseller/* apps/web/public/

# Admin panel için
cp gorseller/* apps/admin/public/
```

## 🎨 Logo Component Kullanımı

### Web Uygulaması

```tsx
import { Logo } from "@/components/branding/Logo";

// Tam logo (icon + metin)
<Logo variant="full" size="md" />

// Sadece icon
<Logo variant="icon" size="lg" />

// Özel path
<Logo variant="full" logoSrc="/custom-logo.svg" iconSrc="/custom-icon.svg" />
```

### Admin Panel

```tsx
import { Logo } from "@/components/branding/Logo";

<Logo variant="full" size="md" href="/dashboard" />
```

### Logo Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|-----------|----------|
| `variant` | `"full" \| "icon"` | `"full"` | Logo tipi |
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Logo boyutu |
| `href` | `string \| false` | `"/"` | Link URL (false = link yok) |
| `className` | `string` | - | Ek CSS sınıfları |
| `hideTextOnMobile` | `boolean` | `false` | Mobilde metni gizle |
| `logoSrc` | `string` | `"/logo.svg"` | Özel logo path |
| `iconSrc` | `string` | `"/logo-icon.svg"` | Özel icon path |

## 🔧 Favicon ve Icon Yapılandırması

### Next.js Metadata API

Favicon ve icon'lar otomatik olarak Next.js Metadata API ile yapılandırılmıştır:

**Web Uygulaması** (`apps/web/app/[locale]/layout.tsx`):
- Tüm icon boyutları desteklenir
- PWA manifest ile entegre
- Apple touch icon desteği

**Admin Panel** (`apps/admin/app/[locale]/layout.tsx`):
- Basitleştirilmiş icon yapılandırması
- Admin panel için optimize edilmiş

### PWA Manifest

`apps/web/public/manifest.json` dosyası tüm icon boyutlarını içerir:

```json
{
  "icons": [
    { "src": "/favicon.ico", "sizes": "32x32" },
    { "src": "/icon-16x16.png", "sizes": "16x16" },
    { "src": "/icon-32x32.png", "sizes": "32x32" },
    { "src": "/icon-192x192.png", "sizes": "192x192", "purpose": "any maskable" },
    { "src": "/icon-512x512.png", "sizes": "512x512", "purpose": "any maskable" }
  ]
}
```

## 📱 Desteklenen Formatlar

- **SVG** - Vektör formatı (önerilir, ölçeklenebilir)
- **PNG** - Raster formatı (PWA için gerekli)
- **ICO** - Favicon formatı (tarayıcı uyumluluğu için)
- **WebP** - Modern format (opsiyonel)

## ✅ Entegrasyon Kontrol Listesi

- [ ] `gorseller/` klasörüne logo dosyaları eklendi
- [ ] `pnpm scripts:setup-assets` komutu çalıştırıldı
- [ ] Dosyalar `apps/web/public/` ve `apps/admin/public/` klasörlerinde
- [ ] Logo component'leri header'larda kullanılıyor
- [ ] Favicon tarayıcıda görünüyor
- [ ] PWA manifest güncel
- [ ] Tüm icon boyutları mevcut (opsiyonel ama önerilir)

## 🐛 Sorun Giderme

### Logo görünmüyor

1. Dosya yollarını kontrol edin: `apps/web/public/logo.svg`
2. Browser cache'i temizleyin (Ctrl+Shift+R / Cmd+Shift+R)
3. Next.js dev server'ı yeniden başlatın

### Favicon görünmüyor

1. `favicon.ico` dosyasının `public/` klasöründe olduğundan emin olun
2. Tarayıcı cache'ini temizleyin
3. `next.config.js` dosyasında özel yapılandırma olup olmadığını kontrol edin

### PWA icon'ları çalışmıyor

1. Manifest.json dosyasını kontrol edin
2. Icon dosyalarının doğru boyutlarda olduğundan emin olun
3. Service worker'ın güncel olduğundan emin olun

## 📚 Ek Kaynaklar

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [PWA Manifest](https://web.dev/add-manifest/)
- [Favicon Best Practices](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)

## 🔄 Güncelleme

Logo veya favicon'u güncellemek için:

1. Yeni dosyaları `gorseller/` klasörüne ekleyin
2. `pnpm scripts:setup-assets` komutunu çalıştırın
3. Gerekirse Next.js dev server'ı yeniden başlatın

---

**Not:** Bu entegrasyon tamamen profesyonel standartlara uygun olarak yapılmıştır ve SEO, PWA, ve erişilebilirlik gereksinimlerini karşılar.
