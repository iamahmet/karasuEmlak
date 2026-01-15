# Programmatic Pages Migration - Uygulama Talimatları

**Tarih:** 29 Ocak 2025  
**Migration Dosyası:** `supabase/migrations/20260129000000_create_programmatic_pages.sql`

---

## 📋 YÖNTEM 1: Supabase Dashboard (Önerilen)

### Adımlar:

1. **Supabase Dashboard'a gidin**
   - https://supabase.com/dashboard
   - Projenizi seçin (lbfimbcvvvbczllhqqlf)

2. **SQL Editor'ü açın**
   - Sol menüden "SQL Editor" seçin
   - "New query" butonuna tıklayın

3. **Migration dosyasını kopyalayın**
   - Dosya: `supabase/migrations/20260129000000_create_programmatic_pages.sql`
   - Tüm içeriği kopyalayın

4. **SQL'i çalıştırın**
   - SQL Editor'e yapıştırın
   - "Run" butonuna tıklayın
   - Sonuçları kontrol edin

5. **PostgREST cache'i yenileyin** (opsiyonel)
   ```bash
   pnpm supabase:reload-postgrest
   ```

---

## 📋 YÖNTEM 2: Supabase CLI

### Adımlar:

1. **Migration repair yapın** (gerekirse)
   ```bash
   pnpm supabase migration repair --status applied 20260129000000
   ```

2. **Migration'ı uygulayın**
   ```bash
   pnpm supabase db push
   ```

---

## ✅ DOĞRULAMA

Migration başarılı olduktan sonra, tablonun oluştuğunu kontrol edin:

```sql
-- Tabloyu kontrol et
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'programmatic_pages';

-- Tablo yapısını kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'programmatic_pages';
```

---

## 🚀 SONRAKI ADIM

Migration başarılı olduktan sonra programmatic pages'i oluşturun:

```bash
npx tsx scripts/initialize-programmatic-pages.ts
```

Bu script şu sayfaları oluşturacak:
- Namaz Vakitleri
- İmsakiye
- İftar Vakitleri
- Hava Durumu
- İş İlanları
- Vefat İlanları
- Nöbetçi Eczane
