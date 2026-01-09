# SSS (Sık Sorulan Sorular) Sayfası - Kullanım Kılavuzu

## ✅ Tamamlanan İyileştirmeler

### 1. Database Entegrasyonu
- SSS sayfası artık `qa_entries` tablosundan soruları çekiyor
- API endpoint: `/api/faq`
- Server-side rendering ile hızlı yükleme

### 2. Gelişmiş UI/UX
- ✅ Arama fonksiyonu
- ✅ Kategori filtreleme (8 kategori)
- ✅ Kategorilere göre gruplama
- ✅ Modern accordion UI
- ✅ Responsive design

### 3. SEO İyileştirmeleri
- ✅ Gelişmiş metadata
- ✅ Hreflang tags
- ✅ FAQ Schema (Structured Data)
- ✅ Breadcrumbs

### 4. OpenAI Entegrasyonu
- ✅ Script: `scripts/generate-enhanced-sss.ts`
- ✅ Canlı sitedeki sorular dahil
- ✅ AI ile yeni sorular üretimi

---

## 🚀 Kullanım

### 1. Script'i Çalıştırma

**Gereksinimler:**
- `.env.local` dosyasında `OPENAI_API_KEY` olmalı
- Supabase environment variables olmalı

```bash
# Script'i çalıştır
pnpm scripts:generate-enhanced-sss
```

**Script ne yapar:**
1. Canlı sitedeki sorular için cevaplar üretir (OpenAI)
2. Yeni sorular üretir (her kategori için 5-8 soru)
3. Database'e ekler/ günceller

### 2. Sayfayı Görüntüleme

```
http://localhost:3000/sss
```

### 3. API Endpoint

```bash
# Tüm FAQ sorularını getir
GET /api/faq

# Response:
[
  {
    "id": "uuid",
    "question": "Soru metni",
    "answer": "Cevap metni",
    "category": "bilgi",
    "priority": "high",
    "region": "karasu",
    "created_at": "...",
    "updated_at": "..."
  }
]
```

---

## 📋 Kategoriler

1. **Genel Bilgiler** (`bilgi`)
2. **Karşılaştırmalar** (`karsilastirma`)
3. **Karar Verme** (`karar_verme`)
4. **Risk ve Dikkat** (`risk`)
5. **Yatırım** (`yatirim`)
6. **Hukuki Süreçler** (`hukuki`)
7. **Finansman** (`finansman`)
8. **Kiralama** (`kiralama`)

---

## 🔧 Database Yapısı

```sql
CREATE TABLE qa_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL, -- 'high' | 'medium' | 'low'
  region TEXT NOT NULL, -- 'karasu' | 'kocaali'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📝 Notlar

- Script ilk çalıştırmada canlı sitedeki 8 soru için cevap üretir
- Sonra her kategori için 5-8 yeni soru üretir
- Toplam ~50-60 soru database'e eklenir
- Mevcut sorular güncellenir (duplicate check)

---

## 🎯 Sonraki Adımlar

1. Script'i çalıştır: `pnpm scripts:generate-enhanced-sss`
2. Database'de soruları kontrol et
3. Sayfayı test et: `http://localhost:3000/sss`
4. Gerekirse daha fazla soru ekle
