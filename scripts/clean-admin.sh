#!/bin/bash

# Admin Panel Temiz Başlangıç Script'i
# Bu script admin paneli cache'ini temizler ve yeniden başlatır

set -e

echo "🧹 Admin panel cache temizleniyor..."

# Port 3001'de çalışan process'i durdur
if lsof -ti:3001 > /dev/null 2>&1; then
  echo "⏹️  Port 3001'deki process durduruluyor..."
  lsof -ti:3001 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# Cache'i temizle
cd "$(dirname "$0")/../apps/admin"
rm -rf .next
echo "✅ Cache temizlendi"

# Ana dizine dön ve admin paneli başlat
cd ../..
echo "🚀 Admin panel başlatılıyor..."
pnpm run dev:admin

