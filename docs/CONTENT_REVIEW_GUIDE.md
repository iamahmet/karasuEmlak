# 📝 İçerik Review Rehberi

**Tarih:** 27 Ocak 2025  
**Durum:** ✅ Sistem Hazır

---

## 🎯 Genel Bakış

Projede iki tür draft içerik var:
1. **Makaleler (Articles)** - Blog yazıları
2. **Q&A Blokları (AI Questions)** - Soru-cevap içerikleri

Her ikisi de admin panelden review edilebilir ve yayınlanabilir.

---

## 📋 Review Workflow

### 1. Makaleleri Review Etme

**Adres:** `/admin/articles`

**Adımlar:**
1. Admin panele giriş yap
2. Sol menüden "Makaleler" (Articles) seçeneğine tıkla
3. "Draft" statusündeki makaleleri görüntüle
4. Her makaleyi kontrol et:
   - ✅ İçerik kalitesi
   - ✅ SEO optimizasyonu (meta description, title)
   - ✅ Internal links ("İlgili Sayfalar" bölümü)
   - ✅ Featured image (varsa)
5. "Onayla" butonuna tıklayarak yayınla
6. Gerekirse "Reddet" ile geri gönder

**Alternatif Yol:**
- Content Studio → Review Tab (`/admin/content-studio?tab=review`)
- Burada tüm draft içerikler tek yerde görüntülenir

### 2. Q&A Bloklarını Review Etme

**Adres:** `/admin/ai-qa`

**Adımlar:**
1. Admin panele giriş yap
2. Sol menüden "AI Q&A" seçeneğine tıkla
3. Draft statusündeki Q&A'ları görüntüle
4. Her Q&A'yı kontrol et:
   - ✅ Soru net ve anlaşılır mı?
   - ✅ Cevap doğru ve yeterli mi?
   - ✅ Location (karasu/kocaali/global) doğru mu?
   - ✅ Page type uygun mu?
5. "Approve" → "Publish" workflow'unu takip et

---

## 🔍 Review Checklist

### Makaleler İçin:
- [ ] Başlık SEO-friendly mi? (50-60 karakter)
- [ ] Meta description var mı? (120-160 karakter)
- [ ] İçerik yeterince uzun mu? (minimum 800 kelime)
- [ ] Internal links var mı? ("İlgili Sayfalar" bölümü)
- [ ] Featured image var mı?
- [ ] H1-H3 hierarchy doğru mu?
- [ ] AI kokusu var mı? (varsa düzelt)
- [ ] Yerel bilgiler doğru mu?

### Q&A Blokları İçin:
- [ ] Soru kullanıcıların gerçekten sorduğu bir soru mu?
- [ ] Cevap 40-70 kelime arasında mı? (AI Overviews için optimal)
- [ ] Location doğru mu? (karasu/kocaali/global)
- [ ] Page type uygun mu? (pillar/cornerstone/blog/neighborhood/comparison)
- [ ] Related entity (page slug) doğru mu?

---

## 📊 Mevcut Draft İçerikler

### Makaleler
- **Toplam Draft:** ~25+ makale
- **Durum:** Review bekliyor
- **Lokasyon:** `articles` tablosu, `status = 'draft'`

### Q&A Blokları
- **Toplam Draft:** 22 Q&A
- **Dağılım:**
  - Karasu: 14 Q&A
  - Kocaali: 4 Q&A
  - Global: 4 Q&A
- **Durum:** Review bekliyor
- **Lokasyon:** `ai_questions` tablosu, `status = 'draft'`

---

## 🚀 Hızlı Başlangıç

### 1. Tüm Draft Makaleleri Görüntüle
```bash
# Admin panelde
http://localhost:3001/admin/articles?status=draft
```

### 2. Tüm Draft Q&A'ları Görüntüle
```bash
# Admin panelde
http://localhost:3001/admin/ai-qa?status=draft
```

### 3. Toplu Review (Gelecekte)
Şu anda manuel review gerekiyor. Gelecekte batch approval özelliği eklenebilir.

---

## ⚙️ API Endpoints

### Makaleler
- `GET /api/articles?status=draft` - Draft makaleleri listele
- `PUT /api/articles/[id]` - Makaleyi güncelle ve yayınla
- `POST /api/content/review` - Review için gönder
- `POST /api/content/approve` - Onayla

### Q&A
- `GET /api/ai-qa?status=draft` - Draft Q&A'ları listele
- `PUT /api/ai-qa/[id]` - Q&A'yı güncelle
- `POST /api/ai-qa/[id]/approve` - Onayla
- `POST /api/ai-qa/[id]/publish` - Yayınla

---

## 📝 Notlar

- Review işlemi manuel yapılmalı - otomatik approval yok
- Quality score 70+ olan içerikler otomatik publish edilebilir (ayarlanabilir)
- Review sırasında içerik düzenlenebilir
- Her review işlemi `seo_events` tablosuna loglanır

---

## 🔗 İlgili Dosyalar

- `apps/admin/components/content-studio/ReviewTab.tsx` - Review UI
- `apps/admin/app/api/content/review/route.ts` - Review API
- `apps/admin/app/(dashboard)/articles/page.tsx` - Articles page
- `apps/admin/app/(dashboard)/ai-qa/AIQAManager.tsx` - Q&A manager

---

**Son Güncelleme:** 27 Ocak 2025
