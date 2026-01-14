#!/bin/bash

echo "🔍 Vercel Domain Mapping Kontrolü"
echo "=================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI yüklü değil."
    echo "   Yüklemek için: npm i -g vercel"
    exit 1
fi

echo "📋 Web Projesi Domain'leri:"
echo "---------------------------"
cd apps/web 2>/dev/null && vercel domains ls 2>/dev/null || echo "   ⚠️  Web projesi bulunamadı veya domain listesi alınamadı"

echo ""
echo "📋 Admin Projesi Domain'leri:"
echo "-----------------------------"
cd ../admin 2>/dev/null && vercel domains ls 2>/dev/null || echo "   ⚠️  Admin projesi bulunamadı veya domain listesi alınamadı"

echo ""
echo "💡 Not: Domain'leri Vercel Dashboard'dan kontrol etmek daha güvenilir:"
echo "   https://vercel.com/dashboard"
echo ""
echo "✅ Doğrulama:"
echo "   - admin.karasuemlak.net web projesinde OLMAMALI"
echo "   - admin.karasuemlak.net admin projesinde OLMALI"
