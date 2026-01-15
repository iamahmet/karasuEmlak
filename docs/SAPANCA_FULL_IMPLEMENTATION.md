# Sapanca Full Implementation - Complete Documentation

## 📋 Genel Bakış

Bu dokümantasyon, Sapanca hub ve içerik üretim pipeline'ının tam implementasyonunu açıklar.

## ✅ Tamamlanan İşler

### 1. Database Migration ✅
- **Dosya:** `supabase/migrations/20260129000002_media_assets_enhancement.sql`
- **İçerik:**
  - `media_assets` tablosuna yeni kolonlar (provider, public_id, secure_url, blurhash, lqip_base64, caption, credits, srcset_json)
  - `article_media` junction tablosu (featured/inline görsel bağlantıları)
  - `articles` tablosuna `featured_image_id`, `schema_json`, `reading_time`, `word_count` kolonları
  - RLS policies

**Uygulama:**
```bash
# Migration'ı direkt SQL olarak uygula (Supabase Dashboard veya CLI)
psql $DATABASE_URL -f supabase/migrations/20260129000002_media_assets_enhancement.sql

# Veya Supabase CLI ile
pnpm supabase:db:push
```

### 2. Sapanca Hub Sayfası ✅
- **Dosya:** `apps/web/app/[locale]/sapanca/page.tsx`
- **Özellikler:**
  - Premium design
  - 12 Q&A blok (AI Overviews için)
  - Fiyatlar & trendler tablosu
  - Bölge rehberi
  - 3'lü hub ağı internal linking
  - Schema markup (Place, FAQ, Breadcrumb)

### 3. Sapanca Alt Sayfaları (Başlangıç) ✅
- **Oluşturulan:**
  - `/sapanca/bungalov` - Bungalov rehber sayfası
  - `/sapanca/gunluk-kiralik` - Günlük kiralık rehber sayfası
- **Eksik (oluşturulacak):**
  - `/sapanca/satilik-daire`
  - `/sapanca/satilik-yazlik`
  - `/sapanca/satilik-bungalov`
  - `/sapanca/gezilecek-yerler`

### 4. Blog Render Düzeltmeleri ✅
- **ResponsiveImage Component:** `apps/web/components/images/ResponsiveImage.tsx`
  - Cloudinary srcset
  - Blur placeholder
  - Lazy loading
  - Error fallback

- **ArticleSummary Component:** `apps/web/components/blog/ArticleSummary.tsx`
  - TL;DR özet kutusu
  - İlk 2-3 paragraf özet

- **ArticleShareButtons Component:** `apps/web/components/blog/ArticleShareButtons.tsx`
  - Facebook, Twitter, LinkedIn
  - Copy link

- **ArticleCallout Component:** `apps/web/components/blog/ArticleCallout.tsx`
  - Info, warning, success, error, tip callout'ları

- **ContentRenderer İyileştirmeleri:**
  - Max-width: `max-w-prose` (daha iyi okuma genişliği)
  - Typography: paragraph spacing, line-height
  - Table styles
  - Blockquote styles

- **render-content.ts İyileştirmeleri:**
  - Daha agresif HTML entity decode
  - "Alt Text" blockquote temizleme
  - Broken image tag düzeltmeleri

### 5. İçerik Üretim Scriptleri ✅
- **generate-sapanca-content.ts:** Master script (başlangıç)
  - 10 cornerstone + 20 blog planı
  - Görsel üretim pipeline
  - Cloudinary upload
  - DB entegrasyonu

- **create-sapanca-cornerstone-articles.ts:** Cornerstone makale scripti (1/10 tamamlandı)

- **audit-and-fix-blog-media.ts:** Mevcut blogları toparlama scripti
  - Eksik görsel kontrolü
  - HTML entity bug düzeltmeleri
  - İçerik kalite kontrolü

## ⏳ Devam Eden İşler

### 1. İçerik Üretimi
- [ ] 10 cornerstone makale içeriklerini tamamla (1/10 yapıldı)
- [ ] 20 blog yazısı içeriklerini oluştur
- [ ] Görsel üretim pipeline'ını test et
- [ ] Cloudinary upload'ı test et

### 2. Alt Sayfalar
- [ ] `/sapanca/satilik-daire` oluştur
- [ ] `/sapanca/satilik-yazlik` oluştur
- [ ] `/sapanca/satilik-bungalov` oluştur
- [ ] `/sapanca/gezilecek-yerler` oluştur

### 3. Internal Linking
- [ ] Karasu hub'a Sapanca linkleri ekle
- [ ] Kocaali hub'a Sapanca linkleri ekle
- [ ] Karşılaştırma sayfaları oluştur

### 4. Sitemap Güncellemeleri
- [ ] `/sapanca` ve alt sayfaları ekle
- [ ] Cornerstone sayfaları ekle
- [ ] Blog yazıları ekle

## 🚀 Nasıl Çalıştırılır?

### 1. Migration Uygula
```bash
# Supabase Dashboard'dan SQL Editor'de çalıştır:
# supabase/migrations/20260129000002_media_assets_enhancement.sql

# Veya CLI ile (eğer migration history uyumluysa):
pnpm supabase:db:push
```

### 2. Sapanca Hub Test Et
```bash
# Dev server'ı başlat
pnpm dev:web

# Tarayıcıda aç:
http://localhost:3000/sapanca
```

### 3. İçerik Üretimi (Hazırlık Aşamasında)
```bash
# Dry run (test)
pnpm tsx scripts/generate-sapanca-content.ts --dry-run

# Production (limit ile başla)
pnpm tsx scripts/generate-sapanca-content.ts --limit 2

# Tam üretim (tüm 30 içerik)
pnpm tsx scripts/generate-sapanca-content.ts
```

### 4. Mevcut Blogları Toparla
```bash
# Audit only
pnpm tsx scripts/audit-and-fix-blog-media.ts

# Fix mode (düzeltmeleri uygula)
pnpm tsx scripts/audit-and-fix-blog-media.ts --fix
```

## 📊 Beklenen Çıktılar

### generate-sapanca-content.ts
- **Rapor:** `docs/reports/sapanca_generation_report.md`
- **İçerik:**
  - Oluşturulan/güncellenen makale sayıları
  - Üretilen/yüklenen görsel sayıları
  - Hata logları

### audit-and-fix-blog-media.ts
- **Rapor:** `docs/reports/blog_media_audit_report.md`
- **İçerik:**
  - Sorunlu makale listesi
  - Sorun kategorileri
  - Düzeltme istatistikleri

## 🔧 Teknik Detaylar

### Görsel Üretim Pipeline
1. **Prompt Oluşturma:** Article title/excerpt'tan context-aware prompt
2. **AI Generation:** OpenAI DALL-E 3 (veya Gemini - gelecekte)
3. **Cloudinary Upload:** Folder: `karasuemlak/blog/{slug}/`
4. **DB Kayıt:** `media_assets` + `article_media` junction
5. **Article Update:** `featured_image_id` set et

### İçerik Kalite Kriterleri
- ✅ 1200-2200 kelime (cornerstone)
- ✅ 1500-2500 kelime (blog)
- ✅ İlk 2 paragraf snippet-ready
- ✅ TOC
- ✅ 2-3 micro-answer block
- ✅ 1 tablo
- ✅ 6-10 internal link
- ✅ 6-10 FAQ
- ✅ CTA: "Bir adım sonra ne yapmalı?"

### Görsel Kalite Kriterleri
- ✅ Fotoğraf gerçekçiliği (stock photo kalitesi)
- ✅ Doğal gün ışığı / golden hour
- ✅ 24-35mm lens, gerçekçi DOF
- ✅ Yapay görünüm yok
- ✅ Text/logo/watermark yok
- ✅ Sapanca gölü, bungalov konsepti, yerel atmosfer

## 📝 Notlar

- Migration'ı direkt SQL olarak uygulamak gerekebilir (Supabase Dashboard)
- Görsel üretim için OpenAI API key gerekli
- İçerik üretimi şu an placeholder - AI entegrasyonu eklenecek
- Tüm scriptler idempotent (aynı slug ile tekrar çalıştırılabilir)

## 🎯 Sonraki Adımlar

1. Migration'ı uygula (Supabase Dashboard)
2. Alt sayfaları tamamla
3. İçerik üretim scriptlerini tamamla (AI entegrasyonu)
4. Internal linking ekle
5. Sitemap güncelle
6. Test et ve deploy et
