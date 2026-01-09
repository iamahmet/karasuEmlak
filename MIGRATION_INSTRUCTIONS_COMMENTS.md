# Content Comments Migration Instructions

## Sorun
`content_comments` tablosu henüz oluşturulmamış. Bu yüzden yorumlar yüklenemiyor.

## Çözüm

### 1. Supabase Dashboard'dan Migration Uygulama

1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **SQL Editor**'ı açın
4. `scripts/db/migrations/005_create_content_comments.sql` dosyasının içeriğini kopyalayın
5. SQL Editor'a yapıştırın ve **Run** butonuna tıklayın

### 2. Supabase CLI ile Migration Uygulama

```bash
# Supabase CLI ile migration uygula
supabase db push

# Veya direkt SQL dosyasını çalıştır
supabase db execute -f scripts/db/migrations/005_create_content_comments.sql
```

### 3. Manuel Kontrol

Migration uygulandıktan sonra:

1. Supabase Dashboard > Table Editor
2. `content_comments` tablosunun oluşturulduğunu kontrol edin
3. RLS policies'in aktif olduğunu kontrol edin

### 4. Demo Yorumları Ekleme

Migration uygulandıktan sonra demo yorumları ekleyin:

```bash
npm run scripts:add-demo-comments
```

## Migration Dosyası
`scripts/db/migrations/005_create_content_comments.sql`

Bu migration şunları oluşturur:
- `content_comments` tablosu
- Gerekli indexler
- RLS policies (Row Level Security)
- Foreign key ilişkileri

## Not
Migration uygulanmadan önce yorumlar boş liste olarak dönecektir (hata vermeyecek).
