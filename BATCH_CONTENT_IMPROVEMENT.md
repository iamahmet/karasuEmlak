# Batch Content Improvement Script

## ✅ Script Hazır!

**Dosya:** `scripts/content/batch-improve-all-content.ts`  
**Commit:** `f0778ee`

---

## 🚀 Kullanım

### Temel Kullanım

```bash
# Tüm içerikleri iyileştir (dikkatli kullan!)
pnpm scripts:batch-improve-all-content

# Dry-run (test, değişiklik kaydedilmez)
pnpm scripts:batch-improve-all-content --dry-run

# Sadece 10 içerik işle
pnpm scripts:batch-improve-all-content --limit 10

# Sadece articles'ları iyileştir
pnpm scripts:batch-improve-all-content --type articles

# Sadece news articles'ları iyileştir
pnpm scripts:batch-improve-all-content --type news

# Daha düşük skorlu içerikleri de iyileştir (default: 70)
pnpm scripts:batch-improve-all-content --min-score 60

# API rate limiting için delay artır (default: 2000ms)
pnpm scripts:batch-improve-all-content --delay 3000
```

### Kombinasyonlar

```bash
# Test: Sadece 5 articles, dry-run
pnpm scripts:batch-improve-all-content --dry-run --limit 5 --type articles

# Production: 20 articles, min score 65
pnpm scripts:batch-improve-all-content --limit 20 --type articles --min-score 65

# Tüm news articles, yavaş (rate limiting)
pnpm scripts:batch-improve-all-content --type news --delay 3000
```

---

## ⚙️ Gereksinimler

### Environment Variables

`.env.local` dosyasına ekleyin:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
# veya
OPENAI_API_KEY=your_openai_api_key_here
```

**Not:** Gemini tercih edilir, OpenAI fallback olarak kullanılır.

---

## 📊 Script Özellikleri

### İşlenen İçerik Tipleri

1. **Articles** (`articles` tablosu)
   - Field: `content`
   - Toplam: ~610 articles

2. **News Articles** (`news_articles` tablosu)
   - Field: `emlak_analysis`
   - Toplam: ~452 news articles

3. **Listings** (`listings` tablosu)
   - Field: `description` (eğer varsa)
   - Not: `description` kolonu yoksa atlanır

### İyileştirme Kriterleri

- **Min Score Threshold:** 70 (default)
  - Sadece 70'ten düşük skorlu içerikler iyileştirilir
  - Yüksek skorlu içerikler atlanır (zaten iyi)

- **Rate Limiting:** 2 saniye delay (default)
  - API limitlerini aşmamak için
  - `--delay` ile ayarlanabilir

### Progress Tracking

- Her iyileştirme `content_ai_improvements` tablosuna kaydedilir
- İyileştirilmiş içerik otomatik olarak database'e yazılır
- Progress console'da gösterilir

### Error Handling

- Hatalar loglanır, script devam eder
- Her item için ayrı error handling
- Summary'de hata sayısı gösterilir

---

## 📈 Örnek Çıktı

```
🚀 Batch Content Improvement Script
============================================================
Mode: 💾 LIVE (changes will be saved)
Min Score Threshold: 70
Delay between requests: 2000ms
Limit per type: 10
============================================================

📄 Fetching articles...
   Found 10 articles (limited to 10)
📰 Fetching news articles...
   Found 10 news articles (limited to 10)

📊 Total items to process: 20

[5.0%] Processing article #1/20: "Karasu'da Balık Restoranları..."
   ✅ Improved: 45 → 78 (+33)
[10.0%] Processing article #2/20: "Karasu'da Akşam Yemeği..."
   ⏭️  Skipped: Score 75 >= 70 (already good)
[15.0%] Processing news #3/20: "Karasu'da Yeni Emlak Projesi..."
   ✅ Improved: 52 → 81 (+29)

...

============================================================
📊 Summary
============================================================
Total processed: 20
✅ Improved: 12
⏭️  Skipped (score >= 70): 7
❌ Errors: 1

🏆 Top Improvements:
   1. [article] Karasu'da Balık Restoranları: 45 → 78 (+33)
   2. [news] Karasu'da Yeni Emlak Projesi: 52 → 81 (+29)
   ...

✅ All improvements saved to database
============================================================
```

---

## ⚠️ Önemli Notlar

### 1. API Rate Limits

- Gemini API: Rate limit var, delay kullanın
- OpenAI API: Rate limit var, delay kullanın
- **Öneri:** `--delay 3000` ile başlayın

### 2. Token Costs

- Her içerik için 2 API call (analyze + improve)
- ~1000 içerik = ~2000 API calls
- **Öneri:** Küçük batch'lerle başlayın

### 3. Database Updates

- İyileştirilmiş içerik otomatik olarak database'e yazılır
- `content_ai_improvements` tablosuna kayıt eklenir
- **Öneri:** Önce `--dry-run` ile test edin

### 4. Time Consumption

- Her içerik için ~3-5 saniye (API calls + delay)
- 100 içerik = ~5-8 dakika
- 1000 içerik = ~50-80 dakika
- **Öneri:** Batch'ler halinde çalıştırın

---

## 🔧 Troubleshooting

### GEMINI_API_KEY not found

```bash
# .env.local dosyasına ekleyin
echo "GEMINI_API_KEY=your_key_here" >> .env.local
```

### Rate limit errors

```bash
# Delay'i artırın
pnpm scripts:batch-improve-all-content --delay 5000
```

### Database connection errors

```bash
# Supabase credentials kontrol edin
# .env.local dosyasında:
# NEXT_PUBLIC_SUPABASE_URL=...
# SUPABASE_SERVICE_ROLE_KEY=...
```

### Script timeout

```bash
# Limit kullanın
pnpm scripts:batch-improve-all-content --limit 50
```

---

## 📝 Best Practices

1. **Test First:** Her zaman `--dry-run` ile başlayın
2. **Small Batches:** Küçük limit'lerle başlayın (10-20)
3. **Monitor Progress:** Console output'u takip edin
4. **Check Results:** İyileştirmeleri admin panel'den kontrol edin
5. **Rate Limiting:** API limitlerini aşmamak için delay kullanın

---

## 🎯 Önerilen Workflow

### 1. İlk Test (Dry Run)

```bash
pnpm scripts:batch-improve-all-content --dry-run --limit 5 --type articles
```

### 2. Küçük Batch (Live)

```bash
pnpm scripts:batch-improve-all-content --limit 10 --type articles
```

### 3. Orta Batch (Live)

```bash
pnpm scripts:batch-improve-all-content --limit 50 --type articles --delay 3000
```

### 4. Tüm İçerikler (Dikkatli!)

```bash
# Önce articles
pnpm scripts:batch-improve-all-content --type articles --delay 3000

# Sonra news
pnpm scripts:batch-improve-all-content --type news --delay 3000
```

---

## 📊 İstatistikler

Script çalıştıktan sonra:

- **Toplam işlenen:** Tüm içerikler
- **İyileştirilen:** Score < 70 olanlar
- **Atlanan:** Score >= 70 olanlar
- **Hatalar:** API veya database hataları

---

**Son güncelleme:** 2026-01-31
