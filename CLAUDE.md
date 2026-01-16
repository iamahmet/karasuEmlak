# Claude Code - Proje Notları

Bu dosya Claude Code'un bu projeyle çalışırken dikkat etmesi gereken önemli bilgileri içerir.

## Proje Yapısı

```
karasuEmlak/
├── apps/
│   ├── web/          → karasuemlak.net (Vercel: karasu-emlak)
│   └── admin/        → admin.karasuemlak.net (Vercel: karasu-emlak-admin)
├── packages/
│   ├── config/       → Shared configuration
│   ├── lib/          → Shared utilities (Supabase, Cloudinary)
│   └── ui/           → Shared UI components
└── supabase/         → Database migrations
```

## Vercel Projeleri

| Lokal Klasör | Vercel Proje Adı | Domain | Root Directory |
|--------------|------------------|--------|----------------|
| `apps/web` | `karasu-emlak` | karasuemlak.net | apps/web |
| `apps/admin` | `karasu-emlak-admin` | admin.karasuemlak.net | apps/admin |

**DİKKAT:** `admin` adında eski/gereksiz bir Vercel projesi olabilir - bu YANLIŞ projedir!

## Kritik Kurallar

### 1. CRON_SECRET Ekleme

**ASLA `echo` kullanma!** Whitespace ekler ve build hata verir.

```bash
# ❌ YANLIŞ
echo 'secret' | vercel env add CRON_SECRET production

# ✅ DOĞRU
printf 'secret' | vercel env add CRON_SECRET production
```

### 2. Vercel CLI Kullanımı

```bash
# Hangi projeye bağlı olduğunu kontrol et
cat .vercel/project.json

# Doğru projeye bağlan (apps/admin klasöründen)
cd apps/admin
rm -rf .vercel
vercel link --project karasu-emlak-admin --yes

# Doğru projeye bağlan (apps/web klasöründen)
cd apps/web
rm -rf .vercel
vercel link --project karasu-emlak --yes
```

### 3. Root Directory Ayarı

- CLI'dan değiştirilemez, sadece Vercel Dashboard'dan
- `vercel project inspect` cache'li/eski değer gösterebilir
- Gerçek değer: `https://vercel.com/poi369/[proje]/settings/general`

### 4. Deploy Hataları

| Hata | Sebep | Çözüm |
|------|-------|-------|
| `CRON_SECRET contains whitespace` | echo ile eklendi | printf ile yeniden ekle |
| `No Next.js version detected` | Yanlış Root Directory | Dashboard'dan düzelt |
| `Canceled` deployment | Skip deployments aktif | Manuel Redeploy yap |
| `Path does not exist` | Yanlış klasörden deploy | Monorepo root'tan çalış |

### 5. Environment Variables

Tüm ortamlara (production, preview, development) aynı değeri ekle:

```bash
for env in production preview development; do
  printf 'value' | vercel env add KEY $env
done
```

## Sık Kullanılan Komutlar

```bash
# Build test (lokal)
pnpm run build:web
pnpm run build:admin

# Deploy tetikle (git push)
git commit --allow-empty -m "chore: deploy tetikle" && git push origin main

# Vercel env listele
vercel env ls

# Vercel deployment durumu
vercel ls

# Vercel proje bilgisi
vercel project inspect [proje-adı]
```

## Dikkat Edilecekler

1. **Proje karışıklığı:** Vercel'de benzer isimli projeler olabilir. Her zaman doğru projeyi kontrol et.

2. **CLI cache:** `vercel project inspect` eski bilgi gösterebilir. Dashboard'u kontrol et.

3. **Monorepo yapısı:** Deploy komutları `cd ../..` ile root'a gider. Bu normal.

4. **Skip deployments:** Bu ayar aktifse ve ilgili klasörde değişiklik yoksa deploy iptal edilir.

5. **vercel.json:** Her app'in kendi vercel.json'u var. Build command'lar `cd ../.. &&` ile başlamalı.

---

Son güncelleme: 2026-01-16
