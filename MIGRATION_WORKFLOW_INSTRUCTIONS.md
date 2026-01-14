# 🚀 Workflow System Migration - Uygulama Talimatları

**Tarih:** 27 Ocak 2025  
**Migration Dosyası:** `supabase/migrations/20260127000000_admin_workflow_system.sql`

---

## 📋 YÖNTEM 1: Supabase Dashboard (Önerilen)

### Adımlar:

1. **Supabase Dashboard'a gidin**
   - https://supabase.com/dashboard
   - Projenizi seçin

2. **SQL Editor'ü açın**
   - Sol menüden "SQL Editor" seçin
   - "New query" butonuna tıklayın

3. **Migration dosyasını kopyalayın**
   - Dosya: `supabase/migrations/20260127000000_admin_workflow_system.sql`
   - Tüm içeriği kopyalayın

4. **SQL'i çalıştırın**
   - SQL Editor'e yapıştırın
   - "Run" butonuna tıklayın
   - Sonuçları kontrol edin

5. **PostgREST cache'i yenileyin**
   ```bash
   pnpm supabase:reload-postgrest
   ```

---

## 📋 YÖNTEM 2: Supabase CLI

### Adımlar:

1. **Migration repair yapın (gerekirse)**
   ```bash
   pnpm supabase migration repair --status applied 20260127000000
   ```

2. **Migration'ı uygulayın**
   ```bash
   # Migration dosyasını doğrudan çalıştır
   pnpm supabase db push
   ```

   Veya:

   ```bash
   # Migration'ı manuel olarak işaretle
   pnpm supabase migration repair --status applied 20260127000000
   ```

3. **PostgREST cache'i yenileyin**
   ```bash
   pnpm supabase:reload-postgrest
   ```

---

## 📋 YÖNTEM 3: Environment Variables ile Script

### Önkoşullar:

`.env.local` dosyanızda şunlar olmalı:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Çalıştırma:

```bash
pnpm tsx scripts/apply-workflow-migration.ts
```

---

## ✅ DOĞRULAMA

Migration başarılı olduktan sonra, şu tabloların oluştuğunu kontrol edin:

1. **admin_audit_logs** - Audit log tablosu
2. **content_versions** - Versiyon kontrol tablosu
3. **content_reviews** - Review yönetim tablosu

### Kontrol SQL'i:

```sql
-- Tabloları kontrol et
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('admin_audit_logs', 'content_versions', 'content_reviews');

-- Kolonları kontrol et (articles tablosunda)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'articles' 
AND column_name IN ('status', 'assigned_reviewer_id', 'review_notes', 'current_version_number');
```

---

## ⚠️ HATA DURUMUNDA

### "Table already exists" hatası:
- Bu normal, `IF NOT EXISTS` kullanıldığı için güvenli
- Migration devam edecek

### "Permission denied" hatası:
- Service role key'in doğru olduğundan emin olun
- Supabase Dashboard'dan kontrol edin

### "Column already exists" hatası:
- Bu normal, mevcut kolonlar atlanacak
- Migration devam edecek

---

## 📝 NOTLAR

- Migration **idempotent** (güvenli tekrar çalıştırma) - `IF NOT EXISTS` kullanılıyor
- RLS policies otomatik olarak oluşturulacak
- Indexes performans için eklendi
- Tüm değişiklikler geri alınabilir (rollback için migration down gerekli)

---

**Son Güncelleme:** 27 Ocak 2025
