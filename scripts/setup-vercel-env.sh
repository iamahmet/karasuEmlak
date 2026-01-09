#!/bin/bash
# Vercel Environment Variables Setup Script
# Bu script tüm environment variables'ları Vercel projelerine ekler

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Vercel Environment Variables Setup${NC}"
echo ""

# Vercel CLI kontrolü
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI yüklü değil. Yükleniyor...${NC}"
    npm install -g vercel@latest
fi

# Vercel login kontrolü
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel'e login olmanız gerekiyor.${NC}"
    echo "Lütfen şu komutu çalıştırın: vercel login"
    exit 1
fi

# Proje ID'leri
WEB_PROJECT_ID="prj_fUdRiZPneoh69aairgMNfRe02tK1"  # karasu-emlak (web app)
ADMIN_PROJECT_ID=""  # Admin panel projesi henüz oluşturulmamış olabilir

# Environment Variables - Web App
echo -e "${GREEN}📦 Web App Environment Variables Ekleniyor...${NC}"

# Site Configuration
vercel env add NEXT_PUBLIC_SITE_URL production <<< "https://www.karasuemlak.net" || true
vercel env add NEXT_PUBLIC_SITE_URL preview <<< "https://www.karasuemlak.net" || true
vercel env add NEXT_PUBLIC_SITE_URL development <<< "http://localhost:3000" || true

# Supabase Configuration
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://lbfimbcvvvbczllhqqlf.supabase.co" || true
vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< "https://lbfimbcvvvbczllhqqlf.supabase.co" || true
vercel env add NEXT_PUBLIC_SUPABASE_URL development <<< "https://lbfimbcvvvbczllhqqlf.supabase.co" || true

vercel env add SUPABASE_URL production <<< "https://lbfimbcvvvbczllhqqlf.supabase.co" || true
vercel env add SUPABASE_URL preview <<< "https://lbfimbcvvvbczllhqqlf.supabase.co" || true
vercel env add SUPABASE_URL development <<< "https://lbfimbcvvvbczllhqqlf.supabase.co" || true

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws" || true
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws" || true
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws" || true

vercel env add SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws" || true
vercel env add SUPABASE_ANON_KEY preview <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws" || true
vercel env add SUPABASE_ANON_KEY development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws" || true

vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgyMDQ5OSwiZXhwIjoyMDgxMzk2NDk5fQ.gzQQlg-0iKGeMJe41s-89U1MGvlgSwBIWPGe61Zc2zo" || true
vercel env add SUPABASE_SERVICE_ROLE_KEY preview <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgyMDQ5OSwiZXhwIjoyMDgxMzk2NDk5fQ.gzQQlg-0iKGeMJe41s-89U1MGvlgSwBIWPGe61Zc2zo" || true
vercel env add SUPABASE_SERVICE_ROLE_KEY development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgyMDQ5OSwiZXhwIjoyMDgxMzk2NDk5fQ.gzQQlg-0iKGeMJe41s-89U1MGvlgSwBIWPGe61Zc2zo" || true

vercel env add SUPABASE_JWT_SECRET production <<< "IGuVzv1NGhamrNH9/mWPbidTKq7dwd8Jj6LedwgtlxNByHwafu32x6mKezMcPWLguJ5iCAY3N6DQrbvYTQfJXw==" || true
vercel env add SUPABASE_JWT_SECRET preview <<< "IGuVzv1NGhamrNH9/mWPbidTKq7dwd8Jj6LedwgtlxNByHwafu32x6mKezMcPWLguJ5iCAY3N6DQrbvYTQfJXw==" || true
vercel env add SUPABASE_JWT_SECRET development <<< "IGuVzv1NGhamrNH9/mWPbidTKq7dwd8Jj6LedwgtlxNByHwafu32x6mKezMcPWLguJ5iCAY3N6DQrbvYTQfJXw==" || true

# Supabase Database
vercel env add SUPABASE_DB_HOST production <<< "db.lbfimbcvvvbczllhqqlf.supabase.co" || true
vercel env add SUPABASE_DB_PORT production <<< "5432" || true
vercel env add SUPABASE_DB_NAME production <<< "karasuEmlak" || true
vercel env add SUPABASE_DB_USER production <<< "postgres" || true
vercel env add SUPABASE_DB_PASSWORD production <<< "A1683myPX87czfXR" || true

# Cloudinary Configuration
vercel env add CLOUDINARY_CLOUD_NAME production <<< "dqucm2ffl" || true
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME production <<< "dqucm2ffl" || true
vercel env add CLOUDINARY_API_KEY production <<< "475897588713275" || true
vercel env add CLOUDINARY_API_SECRET production <<< "ExkLcxp3v7kOQxzNdn_i0lWr5Jk" || true
vercel env add CLOUDINARY_URL production <<< "cloudinary://475897588713275:ExkLcxp3v7kOQxzNdn_i0lWr5Jk@dqucm2ffl" || true

# AI Services
# NOTE: Replace with your actual OpenAI API key
echo "Enter your OpenAI API key:"
vercel env add OPENAI_API_KEY production || true

# GitHub
# NOTE: Replace with your actual GitHub token
echo "Enter your GitHub token:"
vercel env add GITHUB_PERSONAL_ACCESS_TOKEN production || true

# Security
vercel env add REVALIDATE_SECRET production <<< "$(openssl rand -hex 32)" || true
vercel env add CRON_SECRET production <<< "$(openssl rand -hex 32)" || true

# Node Environment
vercel env add NODE_ENV production <<< "production" || true

echo -e "${GREEN}✅ Web App environment variables eklendi!${NC}"
echo ""
echo -e "${YELLOW}📝 Not: Admin panel için ayrı bir Vercel projesi oluşturmanız gerekiyor.${NC}"
echo ""
