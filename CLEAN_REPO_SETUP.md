# 🧹 Temiz Repository Kurulumu

## 📋 Yapılacaklar

### 1. GitHub'da Repository'yi Sil

1. https://github.com/iamahmet/karasuEmlak adresine git
2. **Settings** → En alta scroll yap
3. **Danger Zone** → **Delete this repository**
4. Repository adını yaz: `iamahmet/karasuEmlak`
5. **I understand the consequences, delete this repository** tıkla

### 2. Local Repository'yi Temizle

Aşağıdaki komutları çalıştır:

```bash
cd /Users/ahmetbulut/Desktop/karasuEmlak

# Git history'yi temizle (yeni başlangıç)
rm -rf .git

# Yeni git repository başlat
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: Karasu Emlak - Professional Real Estate Platform"
```

### 3. Yeni GitHub Repository Oluştur

1. https://github.com/new adresine git
2. **Repository name**: `karasuEmlak`
3. **Description**: `Karasu Emlak - Professional Real Estate Website with Next.js, Supabase, and Vercel`
4. **Public** veya **Private** seç (tercihine göre)
5. **Initialize this repository with**: Hiçbirini işaretleme (README, .gitignore, license)
6. **Create repository** tıkla

### 4. Local Repository'yi GitHub'a Push Et

```bash
cd /Users/ahmetbulut/Desktop/karasuEmlak

# Remote ekle
git remote add origin https://github.com/iamahmet/karasuEmlak.git

# Main branch oluştur
git branch -M main

# Push et
git push -u origin main
```

## ✅ Temizlenen Dosyalar

- ✅ Gereksiz `.md` dosyaları `.gitignore`'a eklendi
- ✅ PDF dosyaları `.gitignore`'a eklendi
- ✅ `.env.local` dosyaları zaten ignore ediliyor
- ✅ Build artifacts zaten ignore ediliyor

## 📝 Korunan Dosyalar

- ✅ `README.md` (eğer varsa)
- ✅ `LICENSE`
- ✅ `docs/` klasöründeki tüm markdown dosyaları
- ✅ Tüm kaynak kod dosyaları
- ✅ Configuration dosyaları

## 🚀 Sonraki Adımlar

1. ✅ GitHub'da repository'yi sil
2. ✅ Local repository'yi temizle (yukarıdaki komutlar)
3. ✅ Yeni GitHub repository oluştur
4. ✅ Push et
5. ✅ Vercel'de yeni repository'yi bağla

---

**Not**: Bu işlem geri alınamaz. Emin misiniz?
