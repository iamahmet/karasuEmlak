# Google Maps API Kurulum Rehberi

## 🔧 Sorun Giderme

### RefererNotAllowedMapError Hatası

Bu hata, Google Maps API key'inizde localhost referer'ının izinli olmamasından kaynaklanır.

#### Çözüm:

1. **Google Cloud Console'a gidin:**
   - https://console.cloud.google.com/apis/credentials

2. **API Key'inizi bulun ve düzenleyin**

3. **Application restrictions** bölümünde:
   - **HTTP referrers (web sitesi)** seçeneğini seçin
   - Şu referer'ları ekleyin:
     ```
     http://localhost:3000/*
     http://localhost:3001/*
     http://127.0.0.1:3000/*
     http://127.0.0.1:3001/*
     https://karasuemlak.net/*
     https://www.karasuemlak.net/*
     https://*.vercel.app/*
     ```

4. **API restrictions** bölümünde:
   - Şu API'leri etkinleştirin:
     - Maps JavaScript API
     - Geocoding API
     - Places API (opsiyonel)

5. **Değişiklikleri kaydedin** (birkaç dakika sürebilir)

### CSP (Content Security Policy) Ayarları

CSP ayarları zaten yapılandırılmış durumda:
- ✅ `connect-src` içinde Google Maps domain'leri eklendi
- ✅ `script-src` içinde Google Maps domain'leri eklendi

### Script Loading Uyarısı

Google Maps script'i `loading=async` parametresi ile yükleniyor. Bu performans için önerilen yöntemdir.

## ✅ Test

1. **API Key'i kontrol edin:**
   ```bash
   echo $NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
   ```

2. **Sayfayı yenileyin:**
   - Hard refresh: Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)

3. **Console'u kontrol edin:**
   - CSP hataları olmamalı
   - RefererNotAllowedMapError olmamalı

## 📝 Notlar

- Development'ta localhost referer'ı eklenmeli
- Production'da production domain'i eklenmeli
- API key'inizi `.env.local` dosyasında saklayın (git'e commit etmeyin)
