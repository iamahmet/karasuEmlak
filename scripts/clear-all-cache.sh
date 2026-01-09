#!/bin/bash

# Kapsamlı Cache Temizleme Script'i
# Hem admin hem web için tüm cache'leri temizler

set -e

echo "🧹 Tüm cache'ler temizleniyor..."

# Portları durdur
echo "⏹️  Çalışan process'ler durduruluyor..."
lsof -ti:3000,3001,3002,3003 | xargs kill -9 2>/dev/null || true
sleep 2

# Next.js cache'leri
echo "🗑️  Next.js cache'leri temizleniyor..."
rm -rf apps/admin/.next
rm -rf apps/web/.next
echo "✅ .next klasörleri silindi"

# Turbo cache
echo "🗑️  Turbo cache temizleniyor..."
rm -rf .turbo
echo "✅ .turbo cache temizlendi"

# Node modules cache
echo "🗑️  Node modules cache temizleniyor..."
rm -rf apps/admin/node_modules/.cache
rm -rf apps/web/node_modules/.cache
rm -rf node_modules/.cache
echo "✅ node_modules/.cache temizlendi"

# TypeScript build info
echo "🗑️  TypeScript build info temizleniyor..."
find . -name "*.tsbuildinfo" -delete 2>/dev/null || true
echo "✅ TypeScript build info temizlendi"

echo ""
echo "✨ Tüm cache'ler temizlendi!"
echo ""
echo "🚀 Servisleri başlatmak için:"
echo "   pnpm dev          # Tüm servisler"
echo "   pnpm dev:admin    # Sadece admin"
echo "   pnpm dev:web      # Sadece web"
