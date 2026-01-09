# 🚀 Proje Başlatma Talimatları

## ✅ Cache Temizlendi
- [x] `.next` klasörleri silindi
- [x] `node_modules/.cache` temizlendi
- [x] `.turbo` cache temizlendi
- [x] Dependencies yüklendi

## 📋 Servers Başlatma

### Tüm Projeyi Başlat (Önerilen)
```bash
cd /Users/ahmetbulut/Desktop/karasuEmlakSon
pnpm dev
```

Bu komut:
- **Web App**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3001`

### Sadece Web App
```bash
pnpm dev:web
# veya
pnpm --filter web dev
```

### Sadece Admin Panel
```bash
pnpm dev:admin
# veya
pnpm --filter admin dev
```

## 🔍 Test URL'leri

### Web App
- Homepage: `http://localhost:3000`
- Blog: `http://localhost:3000/blog`
- Blog Detail: `http://localhost:3000/blog/[slug]`
- Haberler: `http://localhost:3000/haberler`

### Admin Panel
- Login: `http://localhost:3001/tr/login`
- Dashboard: `http://localhost:3001/tr/dashboard`
- Articles: `http://localhost:3001/tr/articles`

## ⚠️ Notlar

1. **Build Hatası**: Web app'te `slugify` import hatası düzeltildi
2. **Portlar**: 
   - Web App: 3000
   - Admin Panel: 3001
3. **Database**: Supabase bağlantısı kontrol edilmeli
4. **Environment Variables**: `.env.local` dosyası kontrol edilmeli

## 🧪 Test Senaryosu

1. **Admin Panel'de Makale Oluştur**:
   - `http://localhost:3001/tr/articles` → Create New
   - Title, slug, content doldur
   - "Published" checkbox'ını işaretle
   - Save

2. **Web App'te Kontrol Et**:
   - `http://localhost:3000/blog` → Makale listede görünmeli
   - `http://localhost:3000/blog/[slug]` → Detay sayfası açılmalı

## 🐛 Sorun Giderme

### Port Zaten Kullanılıyor
```bash
lsof -ti:3000,3001 | xargs kill -9
```

### Cache Temizleme
```bash
pnpm dev:clean
```

### Build Hataları
```bash
# Web app build
pnpm --filter web build

# Admin panel build
pnpm --filter admin build
```
