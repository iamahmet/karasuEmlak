# Teknik Mükemmellik Dokümantasyonu

Bu dokümantasyon, KarasuEmlak projesindeki teknik standartları, best practice'leri ve otomatik kontrolleri açıklar.

---

## 🔄 PostgREST Cache Yönetimi

### Sorun
PostgREST (Supabase REST API) database schema'sını cache'ler. Yeni tablo/kolon/policy oluşturulduğunda cache eski kalabilir ve `PGRST205` hatalarına yol açar.

### Kalıcı Çözüm

#### 1. Otomatik Cache Reload Fonksiyonu
```sql
SELECT public.pgrst_reload_schema();
```

Bu fonksiyon:
- `NOTIFY pgrst, 'reload schema'` gönderir
- `NOTIFY pgrst, 'reload config'` gönderir
- Hata durumlarını yakalar ve JSON döner

#### 2. Migration Sonrası Otomatik Reload
Tüm migration script'leri otomatik olarak cache'i yeniler:
```bash
pnpm supabase:apply-migrations
```

#### 3. Manuel Reload
```bash
pnpm supabase:reload-postgrest
```

#### 4. Programmatic Pages Oluşturulduktan Sonra
`scripts/initialize-programmatic-pages.ts` otomatik olarak cache'i yeniler.

### Best Practices

1. **Migration'dan Sonra**: Her zaman `pnpm supabase:reload-postgrest` çalıştırın
2. **Yeni Tablo Oluşturulduğunda**: Cache'i manuel yenileyin veya script'i kullanın
3. **Production'da**: Migration'lar otomatik cache reload içerir

### Cache Durumu Kontrolü

```sql
SELECT * FROM public.postgrest_cache_status;
```

Bu view kritik tabloların durumunu gösterir.

---

## 🧪 Pre-Push Test Pipeline

### Kurulum

```bash
bash scripts/git-hooks/setup-pre-push.sh
```

Bu script `.git/hooks/pre-push` hook'unu oluşturur.

### Çalıştırılan Kontroller

1. **TypeScript Type Checking**
   ```bash
   pnpm typecheck
   ```

2. **Linting**
   ```bash
   pnpm lint
   ```

3. **Web App Build**
   ```bash
   pnpm build:web:fast
   ```

4. **Admin App Build**
   ```bash
   pnpm build:admin
   ```

### Hook'u Devre Dışı Bırakma

```bash
rm .git/hooks/pre-push
```

### Manuel Test

```bash
bash scripts/pre-push-check.sh
```

---

## 🍪 Cookie Yönetimi (KVKK/GDPR Uyumlu)

### Mevcut Özellikler

1. **Cookie Consent Banner**
   - İlk ziyarette gösterilir
   - "Kabul Et", "Reddet", "Ayarlar" seçenekleri
   - KVKK/GDPR uyumlu

2. **Cookie Kategorileri**
   - **Necessary**: Her zaman aktif (zorunlu)
   - **Analytics**: Google Analytics için (izin gerekli)
   - **Marketing**: Pazarlama çerezleri (izin gerekli)
   - **Functional**: Fonksiyonel çerezler (varsayılan: açık)

3. **Tercih Yönetimi**
   - LocalStorage'da saklanır
   - Versiyon kontrolü
   - Geri çekme (withdraw) desteği

### Geliştirmeler

#### 1. Cookie Detay Sayfası
- Tüm çerezlerin listesi
- Kategori bazlı filtreleme
- Süre ve amaç bilgileri

#### 2. API Entegrasyonu
- Consent verilerini backend'e gönderme
- Audit log
- Policy versiyonu takibi

#### 3. Google Analytics Entegrasyonu
- Consent mode v2
- Analytics sadece izin verildiğinde çalışır
- `gtag('consent', 'update', ...)` kullanımı

### Kullanım

```typescript
import { getCookiePreferences, saveCookiePreferences, isCategoryAllowed } from '@/lib/cookies/cookie-consent';

// Tercihleri al
const prefs = getCookiePreferences();

// Analytics izni var mı?
if (isCategoryAllowed('analytics')) {
  // Google Analytics kodunu çalıştır
}

// Tercihleri kaydet
saveCookiePreferences({ analytics: true });
```

---

## 📝 İçerik Yazım Standartları

### Rol: Karasu Emlak İçerik Editörü

Yazılar şu özelliklere sahip olmalı:

1. **Doğal Dil**: AI gibi değil, insan gibi yaz
2. **Yerel Bilgi**: Karasu'ya özgü detaylar
3. **Uzman Görüşü**: Emlak sektöründe deneyimli biri gibi
4. **SEO Uyumlu**: Anahtar kelimeler doğal akışta
5. **Google Discover/SGE Uyumlu**: İlk 2 paragraf özet gibi

### Ana SEO Hedefleri

- `karasu satılık daire` (EN ÖNEMLİ)
- `karasu emlak`
- `karasu yazlık fiyatları`
- `karasu kira getirisi`
- `karasu yatırım`
- `sakarya karasu satılık`
- `karasu denize yakın daire`
- `karasu yazlık yatırım`

### İçerik Türleri

#### Cornerstone Makaleler (5 adet)
- Uzun, kapsamlı, otorite içerik
- 3000+ kelime
- Detaylı analiz ve yorum
- Karasu emlak piyasası hakkında derinlemesine bilgi

#### Blog Yazıları (10 adet)
- 1500-2500 kelime
- Güncel konular
- Pratik bilgiler
- SEO optimize

### Yazım Kuralları

❌ **YAPMA:**
- "Bu yazıda sizlere..." gibi klişeler
- "Sonuç olarak..." gibi formal kapanışlar
- Liste formatında AI işaretleri
- Akademik/robotik dil

✅ **YAP:**
- Doğrudan konuya gir
- Yerel bilgi ve gerçekçi çıkarımlar
- Değişken cümle uzunlukları
- Emlakçı dili değil, danışman dili

---

## 🔧 Teknik Standartlar

### Code Quality

1. **TypeScript**: Strict mode aktif
2. **Linting**: ESLint + Prettier
3. **Type Checking**: Pre-push hook'ta kontrol edilir
4. **Build**: Her push öncesi test edilir

### Database

1. **RLS**: Her tabloda aktif
2. **Migrations**: Versioned, reversible
3. **Cache**: PostgREST cache otomatik yönetilir
4. **Backups**: Supabase otomatik backup

### Security

1. **Secrets**: `.env.local` (gitignore'da)
2. **Service Role**: Sadece server-side
3. **RLS Policies**: Public read, admin write
4. **Cookie Consent**: KVKK/GDPR uyumlu

---

## 📚 İlgili Dosyalar

- `scripts/supabase/reload-postgrest.ts` - Cache reload script
- `scripts/pre-push-check.sh` - Pre-push test script
- `scripts/git-hooks/setup-pre-push.sh` - Hook kurulum script
- `apps/web/lib/cookies/cookie-consent.ts` - Cookie yönetimi
- `apps/web/components/compliance/CookieConsent.tsx` - Cookie banner
- `supabase/migrations/20260129000001_enhance_postgrest_cache_reload.sql` - Enhanced cache reload

---

**Son Güncelleme**: 29 Ocak 2025
