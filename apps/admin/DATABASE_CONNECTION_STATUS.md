# Admin Panel - Database Bağlantı Durumu

## ✅ Database Bağlantısı

### 1. Supabase Client Yapılandırması
- ✅ **Server-side**: `apps/admin/lib/supabase/server.ts` - Cookie-based session management
- ✅ **Client-side**: `@karasu/lib/supabase/client` (shared package)
- ✅ **Service Role**: Development modunda RLS bypass için kullanılıyor

### 2. Environment Variables
Gerekli environment variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (development için)
```

### 3. Database Bağlantı Kontrolü
- ✅ Dashboard'da Supabase bağlantı kontrolü mevcut
- ✅ Health check API: `/api/health` - Database bağlantısını test eder
- ✅ Development modunda placeholder değerlerle graceful degradation

## ✅ Web App Entegrasyonu

### 1. Articles Tablosu
- ✅ **Admin Panel**: `articles` tablosuna yazıyor
- ✅ **Web App**: `articles` tablosundan okuyor
- ✅ **Status Column**: `status = 'published'` (web app için)
- ✅ **is_published Column**: Boolean (backward compatibility için)

### 2. Publishing Workflow
1. **Admin Panel'de Makale Oluşturma**:
   - `POST /api/articles` - Yeni makale oluşturur
   - `is_published: true` → `status: 'published'` otomatik set edilir
   - `published_at` timestamp otomatik eklenir

2. **Web App'te Görüntüleme**:
   - `getArticles()` - `status = 'published'` olanları getirir
   - `getArticleBySlug()` - Published makaleleri slug ile getirir
   - Homepage'de featured articles gösterilir
   - Blog sayfasında tüm published articles listelenir

### 3. Cache Revalidation
- ✅ `revalidateArticle()` - Makale publish edildiğinde cache invalidate edilir
- ✅ `revalidateWebApp()` - Web app cache'i temizlenir
- ✅ ISR (Incremental Static Regeneration) - 1 saat revalidate

### 4. News Articles
- ✅ **Admin Panel**: `news_articles` tablosuna yazıyor
- ✅ **Web App**: `news_articles` tablosundan `published = true` olanları okuyor
- ✅ `/haberler` sayfasında gösteriliyor

## 🔄 Senkronizasyon

### Admin Panel → Web App
1. Admin panel'de makale oluştur/güncelle
2. `is_published: true` yap → `status: 'published'` otomatik set edilir
3. `published_at` timestamp eklenir
4. Cache revalidation tetiklenir
5. Web app'te görünür (max 1 saat içinde ISR ile)

### Web App → Admin Panel
- Web app sadece okuma yapar, yazma yapmaz
- Tüm yazma işlemleri admin panel üzerinden yapılır

## 📊 Database Schema Uyumluluğu

### Articles Tablosu
```sql
- id: uuid
- title: text
- slug: text (unique)
- content: text
- excerpt: text
- status: text ('draft' | 'published' | 'archived') ✅ Web app için
- is_published: boolean ✅ Admin panel için (backward compatibility)
- published_at: timestamp
- featured_image: text
- meta_description: text
- seo_keywords: text
- author: text
- category_id: uuid
- category_slug: text
- created_at: timestamp
- updated_at: timestamp
- views: integer
```

## ✅ Test Senaryosu

1. **Admin Panel'de Makale Oluştur**:
   ```
   POST /api/articles
   {
     "title": "Test Makale",
     "slug": "test-makale",
     "content": "İçerik...",
     "isPublished": true
   }
   ```

2. **Database'de Kontrol Et**:
   ```sql
   SELECT id, title, slug, status, is_published, published_at 
   FROM articles 
   WHERE slug = 'test-makale';
   ```
   - `status` = 'published' olmalı
   - `is_published` = true olmalı
   - `published_at` set edilmiş olmalı

3. **Web App'te Kontrol Et**:
   - `http://localhost:3000/blog` - Makale listede görünmeli
   - `http://localhost:3000/blog/test-makale` - Makale detay sayfası açılmalı

## ⚠️ Önemli Notlar

1. **Status vs is_published**:
   - Web app `status = 'published'` kullanıyor
   - Admin panel `is_published` boolean kullanıyor
   - API route'ları her ikisini de senkronize ediyor

2. **RLS Policies**:
   - Development modunda RLS devre dışı olabilir
   - Production'da RLS aktif olmalı
   - Service role key development için kullanılıyor

3. **Cache**:
   - ISR revalidate: 1 saat
   - Manual revalidation: Admin panel'den publish edildiğinde
   - Web app URL: `NEXT_PUBLIC_WEB_APP_URL` environment variable

## 🚀 Sonuç

✅ Admin panel database'e bağlı
✅ Web app database'den okuyor
✅ Publishing workflow çalışıyor
✅ Cache revalidation aktif
✅ Status/is_published senkronizasyonu yapıldı

**Admin panel'de oluşturduğunuz makaleler web app'te görüntülenebilir!**
