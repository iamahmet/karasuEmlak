# Content Image Generator Script

Otomatik olarak görselsiz haber ve blog yazıları için görsel oluşturan script.

## Özellikler

✅ **Medya Kütüphanesi Öncelikli**: Önce mevcut görselleri kullanır  
✅ **AI Görsel Üretimi**: Gerekirse AI ile yeni görsel üretir  
✅ **Akıllı Eşleştirme**: Başlık ve içerik bazlı görsel eşleştirme  
✅ **Rate Limiting**: API rate limit'lerini korur  
✅ **Dry Run Modu**: Değişiklik yapmadan test edebilirsiniz  

## Kullanım

### Temel Kullanım

```bash
# Tüm görselsiz haber ve blog yazıları için görsel oluştur (limit: 50)
pnpm scripts:generate-content-images

# Sadece haberler için
pnpm scripts:generate-content-images --type=news --limit=10

# Sadece blog yazıları için
pnpm scripts:generate-content-images --type=articles --limit=10

# Dry run (test modu - değişiklik yapmaz)
pnpm scripts:generate-content-images --dry-run
```

### Parametreler

- `--type=news|articles|all` - İşlenecek içerik tipi (varsayılan: `all`)
- `--limit=N` - İşlenecek maksimum içerik sayısı (varsayılan: `50`)
- `--dry-run` - Test modu, değişiklik yapmaz

### Örnekler

```bash
# İlk 5 görselsiz haberi görselleştir
pnpm scripts:generate-content-images --type=news --limit=5

# İlk 10 blog yazısını görselleştir (test modu)
pnpm scripts:generate-content-images --type=articles --limit=10 --dry-run

# Tüm görselsiz içerikleri görselleştir (maksimum 20)
pnpm scripts:generate-content-images --type=all --limit=20
```

## Nasıl Çalışır?

1. **Görselsiz İçerikleri Bul**: Database'den görselsiz haber ve blog yazılarını tespit eder
2. **Medya Kütüphanesinde Ara**: Mevcut görsellerden uygun olanı bulmaya çalışır
   - Başlık kelimelerine göre eşleştirme
   - En az kullanılan görselleri tercih eder
3. **AI Görsel Üret**: Uygun görsel bulunamazsa AI ile yeni görsel üretir
   - OpenAI DALL-E 3 kullanır
   - Cloudinary'ye otomatik yükler
   - Database'e kaydeder
4. **İçeriği Güncelle**: Görseli içeriğe atar

## Gereksinimler

- Web uygulaması çalışıyor olmalı (AI generation için)
  - `localhost:3000` veya `NEXT_PUBLIC_SITE_URL` environment variable
- OpenAI API Key ayarlanmış olmalı
- Cloudinary credentials ayarlanmış olmalı
- Supabase bağlantısı çalışıyor olmalı

## Çıktı Örneği

```
🚀 Content Image Generator
   Type: all
   Limit: 10
   Mode: LIVE

📰 Processing News Articles...

Found 3 news articles without images.

Processing: Karasu'da Yeni Emlak Projesi
  ✓ Found existing image: news/karasu-emlak-projesi
  ✓ Updated with existing image

Processing: Emlak Piyasası Güncel Durum
  → Generating new image...
  ✓ Generated and updated: news/emlak-piyasasi-2024

📊 News Articles Summary:
   Processed: 2
   Reused from library: 1
   Generated new: 1
   Failed: 0

📝 Processing Blog Articles...

Found 5 blog articles without images.

Processing: Karasu'da Yatırım Rehberi
  ✓ Found existing image: articles/yatirim-rehberi
  ✓ Updated with existing image

📊 Blog Articles Summary:
   Processed: 1
   Reused from library: 1
   Generated new: 0
   Failed: 0

✅ Done!
```

## Notlar

- Script rate limiting'e dikkat eder (2 saniye bekleme)
- AI generation için web app'in çalışıyor olması gerekir
- Medya kütüphanesinden görsel bulunursa AI generation yapılmaz (maliyet tasarrufu)
- Dry run modunda hiçbir değişiklik yapılmaz, sadece ne yapılacağı gösterilir

