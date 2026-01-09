# Supabase CLI Kurulumu ve Yapılandırması

## ✅ Kurulum Tamamlandı

**Supabase CLI Versiyonu:** 2.70.5  
**Remote Project:** karasuEmlak (lbfimbcvvvbczllhqqlf)  
**Remote URL:** https://lbfimbcvvvbczllhqqlf.supabase.co

## 🔗 Remote Proje Bilgileri

- **Project Ref:** `lbfimbcvvvbczllhqqlf`
- **URL:** `https://lbfimbcvvvbczllhqqlf.supabase.co`
- **Database Password:** `A1683myPX87czfXR`
- **JWT Secret:** `IGuVzv1NGhamrNH9/mWPbidTKq7dwd8Jj6LedwgtlxNByHwafu32x6mKezMcPWLguJ5iCAY3N6DQrbvYTQfJXw==`

## 📊 Database Durumu

**Tablolar:**
- ✅ `ai_questions`: 39 satır
- ✅ `qa_entries`: 82 satır
- ✅ Tüm tablolar remote database'de mevcut

## 🛠️ Kullanılabilir Komutlar

### Genel
```bash
pnpm supabase [command]
```

### Local Development (Docker gerekli)
```bash
pnpm supabase:start          # Local Supabase başlat
pnpm supabase:stop           # Local Supabase durdur
pnpm supabase:status         # Container durumunu göster
pnpm supabase:reset          # Database'i sıfırla
```

### Migration Yönetimi
```bash
pnpm supabase:migration:new  # Yeni migration oluştur
pnpm supabase:migration:up   # Migration'ları uygula
pnpm supabase:migration:down # Migration'ları geri al
```

### Database İşlemleri
```bash
pnpm supabase:db:push        # Local schema'yı remote'a push et
pnpm supabase:db:pull        # Remote schema'yı local'e çek
pnpm supabase:db:diff        # Schema farklarını göster
```

## 📝 Notlar

1. **Docker Desktop Gerekli:** Local Supabase için Docker Desktop çalışıyor olmalı
2. **Migration History:** Remote'da 13 migration var, local'de migration dosyaları yok
3. **Schema Senkronizasyonu:** Docker başladıktan sonra `pnpm supabase:db:pull` ile schema çekilebilir

## 🔄 Sonraki Adımlar

1. Docker Desktop'ın tamamen başlamasını bekleyin
2. `pnpm supabase:start` ile local Supabase'i başlatın
3. `pnpm supabase:db:pull` ile remote schema'yı çekin
4. Gerekirse migration'ları remote'dan indirin

## 🔐 Güvenlik

- `.env.supabase` dosyası oluşturuldu (gitignore'da olmalı)
- Service role key ve JWT secret hassas bilgilerdir
- Bu dosyaları git'e commit etmeyin
