# FAQ Sayfası - Kesin Çözüm

## 🔴 Sorun
FAQ sayfasında "Veritabanından veri yüklenirken bir sorun oluştu" hatası görünüyor.

**Kök Neden:** PostgREST Schema Cache sorunu. `qa_entries` tablosu database'de var ama PostgREST cache'inde görünmüyor.

## ✅ Çözüm (3 Yöntem)

### Yöntem 1: Supabase Dashboard (EN KOLAY) ⭐

1. **Supabase Dashboard'a gidin:**
   - https://supabase.com/dashboard
   - Project: `lbfimbcvvvbczllhqqlf`

2. **API Settings'e gidin:**
   - Sol menüden **Settings** → **API**
   - Veya direkt: https://supabase.com/dashboard/project/lbfimbcvvvbczllhqqlf/settings/api

3. **Schema Cache'i Yenileyin:**
   - Sayfanın altında **"Reload Schema"** veya **"Refresh Schema Cache"** butonunu bulun
   - Tıklayın ve 10-30 saniye bekleyin

4. **Test Edin:**
   ```bash
   pnpm tsx scripts/test-supabase-connection.ts
   ```

### Yöntem 2: Supabase CLI (Eğer Kuruluysa)

```bash
# Supabase CLI ile schema reload
supabase db reset --linked
# veya
supabase functions deploy
```

### Yöntem 3: Bekleme (Otomatik Yenileme)

PostgREST cache'i genellikle 5-10 dakika içinde otomatik olarak yenilenir. Eğer aceleniz yoksa bekleyebilirsiniz.

## 🔧 Yapılan Düzeltmeler

### 1. Server Client Düzeltildi ✅
- `apps/web/lib/db/qa.ts` dosyasında:
  - `createAnonClient()` → `createAnonServerClient()` (server component'ler için)
  - `await` eklendi

### 2. PostgREST Reload Fonksiyonu Oluşturuldu ✅
- `pgrst_reload_schema()` fonksiyonu database'e eklendi
- Migration uygulandı

### 3. Error Handling İyileştirildi ✅
- Sadece gerçek hatalarda error mesajı gösteriliyor
- Boş sonuçlar artık hata olarak gösterilmiyor

## 📊 Durum Kontrolü

### Database'de Tablo Var mı?
```sql
SELECT COUNT(*) FROM qa_entries;
-- Sonuç: 11 kayıt ✅
```

### PostgREST Cache'de Var mı?
```bash
curl -X GET "https://lbfimbcvvvbczllhqqlf.supabase.co/rest/v1/qa_entries?select=id&limit=1" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Başarılı:** JSON array döner
**Hata:** `PGRST205` hatası → Cache'de yok, reload gerekli

## 🚀 Hızlı Test

```bash
# Test scriptini çalıştır
pnpm tsx scripts/test-supabase-connection.ts

# Başarılı çıktı:
# ✅ Anon client connected successfully
# ✅ Service client connected successfully
# ✅ getQAEntries() returned 11 entries
```

## 📝 Notlar

- PostgREST cache yenileme 5-30 saniye sürebilir
- Production'da bu işlem otomatik olmalı
- Development'ta manuel reload gerekebilir
- Migration'lardan sonra cache otomatik yenilenmeli

## 🆘 Hala Çalışmıyorsa

1. **Supabase Dashboard'dan kontrol edin:**
   - Table Editor'da `qa_entries` tablosunu görüyor musunuz?
   - API → REST → `qa_entries` endpoint'i görünüyor mu?

2. **RLS Policy'leri kontrol edin:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'qa_entries';
   ```

3. **Supabase Support'a başvurun:**
   - Project: `lbfimbcvvvbczllhqqlf`
   - Sorun: PostgREST schema cache not updating

## ✅ Başarı Kriterleri

- [ ] Test scripti başarılı
- [ ] FAQ sayfası verileri gösteriyor
- [ ] Error mesajı görünmüyor
- [ ] API endpoint çalışıyor
