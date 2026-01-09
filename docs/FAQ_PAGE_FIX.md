# FAQ Sayfası Sorun Çözümü

## Sorun
FAQ sayfasında "Veritabanından veri yüklenirken bir sorun oluştu" hatası görünüyordu.

## Kök Neden
**PostgREST Schema Cache** sorunu. PostgREST (Supabase'in REST API katmanı) database schema'sını cache'liyor. `qa_entries` tablosu database'de var ama PostgREST cache'inde görünmüyordu.

## Çözüm Adımları

### 1. PostgREST Schema Reload Fonksiyonu Oluşturuldu
```sql
CREATE OR REPLACE FUNCTION public.pgrst_reload_schema()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
  RETURN json_build_object('ok', true, 'ts', now(), 'message', 'PostgREST schema reload triggered');
END;
$$;
```

### 2. Schema Cache Yenilendi
```sql
SELECT public.pgrst_reload_schema();
```

### 3. Server Client Düzeltildi
- `createAnonClient()` → `createAnonServerClient()` (server component'ler için)
- `await` eklendi (async function)

## Manuel Çözüm (Eğer Otomatik Çalışmazsa)

### Yöntem 1: Supabase Dashboard
1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Project Settings → API → "Reload Schema" butonuna tıklayın
3. 10-30 saniye bekleyin

### Yöntem 2: RPC Call
```bash
curl -X POST "https://lbfimbcvvvbczllhqqlf.supabase.co/rest/v1/rpc/pgrst_reload_schema" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

### Yöntem 3: Script Kullan
```bash
pnpm tsx scripts/supabase/reload-postgrest.ts
```

## Doğrulama

Test scriptini çalıştırın:
```bash
pnpm tsx scripts/test-supabase-connection.ts
```

Başarılı olursa:
- ✅ Anon client connected successfully
- ✅ Service client connected successfully  
- ✅ getQAEntries() returned X entries

## Önleme

Gelecekte bu sorunu önlemek için:
1. Migration'lardan sonra otomatik olarak `pgrst_reload_schema()` çağrılmalı
2. `scripts/supabase/reload-postgrest.ts` script'i migration pipeline'ına eklenmeli

## Notlar

- PostgREST cache yenileme 5-30 saniye sürebilir
- Production'da bu işlem otomatik olmalı
- Development'ta manuel reload gerekebilir
