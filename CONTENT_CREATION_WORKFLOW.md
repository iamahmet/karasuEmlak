# İçerik Oluşturma İş Akışı

## 📋 Genel Bakış

Tüm yeni içerikler (haberler, blog yazıları, makaleler) oluşturulurken **CONTENT_QUALITY_STANDARDS.md** dosyasındaki standartlara uyulmalıdır.

## ✅ Yayın Öncesi Kontrol Listesi

### 1. İçerik Oluşturma
- [ ] **Admin panelde** içerik oluştur/düzenle
- [ ] **ContentQualityReminder** component'i görüntülendi (otomatik gösterilir)
- [ ] Standartları gözden geçir

### 2. AI İçerik Üretimi (Opsiyonel)
- [ ] AI Content Generator kullanıldıysa:
  - [ ] Generic ifadeler kontrol edildi
  - [ ] Yerel referanslar eklendi (Karasu, Kocaali)
  - [ ] İçerik doğal ve özgün hale getirildi

### 3. İçerik Analizi
- [ ] **AI Checker** ile analiz edildi (`/admin/content-improvement`)
- [ ] **Human-like Score**: > 70
- [ ] **AI Probability**: < 50%
- [ ] Sorunlar varsa düzeltildi

### 4. SEO Kontrolü
- [ ] **Title**: 50-60 karakter, keyword içeriyor
- [ ] **Meta Description**: 150-160 karakter, CTA var
- [ ] **H1**: Sadece 1 adet, keyword içeriyor
- [ ] **H2-H3**: Hiyerarşik yapı doğru
- [ ] **Alt Text**: Tüm görseller için eklendi
- [ ] **İç linkler**: 3-5 adet eklendi
- [ ] **Yerel SEO**: Karasu, Kocaali referansları var

### 5. İçerik Yapısı
- [ ] **Kelime sayısı**: Minimum 300 (ideal: 800-2000)
- [ ] **Paragraflar**: 2-4 cümle (okunabilir)
- [ ] **Başlıklar**: H2, H3 kullanıldı
- [ ] **Görseller**: Her 300 kelimede 1 görsel
- [ ] **CTA**: En az 2 adet eklendi

### 6. Kalite Kontrolü
- [ ] **Generic ifadeler** yok
- [ ] **Tekrar eden kelimeler** yok (5'ten fazla)
- [ ] **Uzun paragraflar** yok (10+ cümle)
- [ ] **Yazım hatası** kontrol edildi
- [ ] **Kurumsal kimlik** uygunluğu kontrol edildi

### 7. Yayınlama
- [ ] Tüm kontroller tamamlandı
- [ ] İçerik yayınlandı
- [ ] **AI Checker** ile son kontrol (opsiyonel)

## 🔄 Otomatik İyileştirme

### Yayın Sonrası
1. İçerik yayınlandıktan sonra `/admin/content-improvement` sayfasından kontrol edilebilir
2. Skor düşükse (< 70) otomatik iyileştirme yapılabilir
3. Toplu işlemler için script kullanılabilir

### Toplu İyileştirme
```bash
pnpm tsx scripts/improve-all-blog-content.ts
```

## 📝 Notlar

- ✅ **ContentQualityReminder** component'i tüm formlarda otomatik gösterilir
- ✅ **AI generation prompt'ları** kalite standartlarını içerir
- ✅ **AI Checker** sistemi yayın öncesi kontrol için kullanılabilir
- ✅ **Otomatik iyileştirme** yayın sonrası da yapılabilir

---

**Son Güncelleme**: 2026-01-XX  
**Versiyon**: 1.0.0
