#!/bin/bash

# Clear Cache and Test Script
# This script clears all caches and restarts the development server

set -e

echo "🧹 Clearing all caches..."

# Clear Next.js cache
echo "📦 Clearing Next.js cache..."
rm -rf apps/web/.next
rm -rf apps/admin/.next
echo "✅ Next.js cache cleared"

# Clear node_modules/.cache
echo "📦 Clearing node_modules cache..."
find . -type d -name ".next" -prune -o -type d -name "node_modules" -prune -o -type d -name ".cache" -exec rm -rf {} + 2>/dev/null || true
echo "✅ Node modules cache cleared"

# Clear Turbo cache
echo "📦 Clearing Turbo cache..."
rm -rf .turbo
echo "✅ Turbo cache cleared"

# Clear pnpm cache (optional, uncomment if needed)
# echo "📦 Clearing pnpm cache..."
# pnpm store prune
# echo "✅ pnpm cache cleared"

echo ""
echo "✅ All caches cleared!"
echo ""
echo "🚀 Starting development servers..."
echo "   Run: pnpm run dev:web"
echo "   Or: pnpm run dev:admin"
echo ""
