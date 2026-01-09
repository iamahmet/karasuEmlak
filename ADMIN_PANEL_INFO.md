# 🔐 Admin Panel Bilgileri

## ✅ Durum

**Admin Panel:** ✅ Çalışıyor  
**URL:** http://localhost:3001  
**Port:** 3001

---

## 🌐 Erişim

Admin paneli next-intl kullanıyor ve locale-based routing var:

### Ana URL'ler:
- **http://localhost:3001** → Otomatik olarak `/tr`'ye yönlendirir
- **http://localhost:3001/tr** → Türkçe admin panel
- **http://localhost:3001/en** → İngilizce admin panel
- **http://localhost:3001/et** → Estonca admin panel
- **http://localhost:3001/ru** → Rusça admin panel
- **http://localhost:3001/ar** → Arapça admin panel (RTL)

---

## 🔑 Giriş Sayfası

Admin panel giriş sayfası:
👉 **http://localhost:3001/tr/login**

---

## 📋 Admin Panel Özellikleri

Admin panelinde şu modüller mevcut:

1. **Dashboard** - Ana kontrol paneli
2. **Content Studio** - İçerik yönetimi
3. **SEO Tools** - SEO araçları
4. **Analytics** - Analitik ve raporlar
5. **Users** - Kullanıcı yönetimi
6. **Settings** - Ayarlar
7. **Compliance** - KVKK/GDPR uyumluluk
8. **Integrations** - Entegrasyonlar
9. **Project Bot** - Otomasyon botları
10. **Media** - Medya kütüphanesi

---

## 🚀 Başlatma

```bash
# Admin paneli başlat
pnpm run dev:admin
```

---

## ⚠️ Notlar

- Admin panel authentication gerektirir
- İlk kullanımda kayıt olmanız gerekebilir
- Supabase Auth kullanılıyor

---

**Son Güncelleme:** Ocak 2025  
**Durum:** ✅ Çalışıyor

