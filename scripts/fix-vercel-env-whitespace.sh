#!/bin/bash
#
# Vercel Environment Variables Whitespace Düzeltme Scripti
#
# Bu script Vercel'deki CRON_SECRET ve REVALIDATE_SECRET environment
# variable'larındaki leading/trailing whitespace'i temizler.
#
# Kullanım:
#   ./scripts/fix-vercel-env-whitespace.sh [project] [environment]
#
# Örnek:
#   ./scripts/fix-vercel-env-whitespace.sh web production
#   ./scripts/fix-vercel-env-whitespace.sh admin production
#

set -e

PROJECT="${1:-web}"
ENVIRONMENT="${2:-production}"

if [[ ! "$PROJECT" =~ ^(web|admin)$ ]]; then
  echo "❌ Geçersiz proje: $PROJECT (web veya admin olmalı)"
  exit 1
fi

if [[ ! "$ENVIRONMENT" =~ ^(production|preview|development)$ ]]; then
  echo "❌ Geçersiz environment: $ENVIRONMENT (production, preview veya development olmalı)"
  exit 1
fi

PROJECT_DIR="apps/$PROJECT"

echo "🔧 Vercel Environment Variables Whitespace Düzeltme"
echo "   Proje: $PROJECT"
echo "   Environment: $ENVIRONMENT"
echo ""

# Vercel CLI'nin yüklü olup olmadığını kontrol et
if ! command -v vercel &> /dev/null; then
  echo "❌ Vercel CLI bulunamadı. Lütfen yükleyin:"
  echo "   npm i -g vercel"
  exit 1
fi

# Proje dizinine git
cd "$PROJECT_DIR" || exit 1

# Mevcut env variable'ları çek
echo "📥 Mevcut environment variables alınıyor..."
vercel env pull .env.vercel.tmp --environment="$ENVIRONMENT" --yes 2>/dev/null || true

if [ ! -f ".env.vercel.tmp" ]; then
  echo "❌ Environment variables alınamadı"
  exit 1
fi

# CRON_SECRET ve REVALIDATE_SECRET'i kontrol et ve düzelt
FIXED=false

for VAR in CRON_SECRET REVALIDATE_SECRET; do
  if grep -q "^${VAR}=" .env.vercel.tmp; then
    OLD_VALUE=$(grep "^${VAR}=" .env.vercel.tmp | cut -d'=' -f2-)
    NEW_VALUE=$(echo "$OLD_VALUE" | xargs)  # trim whitespace
    
    if [ "$OLD_VALUE" != "$NEW_VALUE" ]; then
      echo "⚠️  $VAR whitespace tespit edildi"
      echo "   Orijinal uzunluk: ${#OLD_VALUE}"
      echo "   Temizlenmiş uzunluk: ${#NEW_VALUE}"
      
      # Vercel'e temizlenmiş değeri gönder
      echo "$NEW_VALUE" | vercel env add "$VAR" "$ENVIRONMENT" --force
      echo "   ✅ $VAR güncellendi"
      FIXED=true
    else
      echo "✅ $VAR zaten temiz"
    fi
  fi
done

# Geçici dosyayı temizle
rm -f .env.vercel.tmp

if [ "$FIXED" = true ]; then
  echo ""
  echo "✅ Tamamlandı! Environment variables düzeltildi."
  echo "   Şimdi Vercel'de yeniden deploy edebilirsiniz."
else
  echo ""
  echo "✅ Tüm environment variables zaten temiz."
fi
