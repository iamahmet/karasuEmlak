#!/bin/bash
# GitHub'da repository oluşturduktan sonra bu scripti çalıştırın

echo "🚀 GitHub'a Push İşlemi Başlıyor..."
echo ""

# Remote kontrolü
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ Remote zaten ayarlı:"
    git remote -v
else
    echo "📡 Remote ekleniyor..."
    git remote add origin https://github.com/iamahmet/karasuEmlak.git
fi

# Branch kontrolü
echo ""
echo "🌿 Branch kontrolü..."
git branch -M main

# Son commit kontrolü
echo ""
echo "📝 Son commit:"
git log --oneline -1

# Push
echo ""
echo "⬆️  GitHub'a push ediliyor..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Başarıyla push edildi!"
    echo "🔗 Repository: https://github.com/iamahmet/karasuEmlak"
else
    echo ""
    echo "❌ Push başarısız oldu!"
    echo "💡 GitHub'da repository oluşturduğunuzdan emin olun: https://github.com/new"
fi
