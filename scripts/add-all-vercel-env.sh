#!/bin/bash
# Vercel Environment Variables - Toplu Ekleme Scripti
# Tüm environment variables'ları Vercel projelerine ekler

set -e

PROJECT_DIR="/Users/ahmetbulut/Desktop/karasuEmlak/apps/web"
SCOPE="poi369"

echo "🚀 Vercel Environment Variables Ekleme Başlıyor..."
echo ""

cd "$PROJECT_DIR"

# Function to add env var
add_env() {
    local key=$1
    local value=$2
    local env=$3
    
    echo "📝 Adding $key to $env..."
    printf "%s\n" "$value" | vercel env add "$key" "$env" --scope="$SCOPE" 2>&1 | grep -v "Vercel CLI" || true
    sleep 0.5
}

# Site Configuration
add_env "NEXT_PUBLIC_SITE_URL" "https://www.karasuemlak.net" "production"
add_env "NEXT_PUBLIC_SITE_URL" "https://www.karasuemlak.net" "preview"
add_env "NEXT_PUBLIC_SITE_URL" "http://localhost:3000" "development"

# Supabase Configuration
add_env "NEXT_PUBLIC_SUPABASE_URL" "https://lbfimbcvvvbczllhqqlf.supabase.co" "production"
add_env "NEXT_PUBLIC_SUPABASE_URL" "https://lbfimbcvvvbczllhqqlf.supabase.co" "preview"
add_env "NEXT_PUBLIC_SUPABASE_URL" "https://lbfimbcvvvbczllhqqlf.supabase.co" "development"

add_env "SUPABASE_URL" "https://lbfimbcvvvbczllhqqlf.supabase.co" "production"
add_env "SUPABASE_URL" "https://lbfimbcvvvbczllhqqlf.supabase.co" "preview"
add_env "SUPABASE_URL" "https://lbfimbcvvvbczllhqqlf.supabase.co" "development"

add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws" "production"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws" "preview"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws" "development"

add_env "SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws" "production"
add_env "SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws" "preview"
add_env "SUPABASE_ANON_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjA0OTksImV4cCI6MjA4MTM5NjQ5OX0.2-oyHOsFlrJitlf1GfhsC0n-QvSEkS9ET5DMFacFPws" "development"

add_env "SUPABASE_SERVICE_ROLE_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgyMDQ5OSwiZXhwIjoyMDgxMzk2NDk5fQ.gzQQlg-0iKGeMJe41s-89U1MGvlgSwBIWPGe61Zc2zo" "production"
add_env "SUPABASE_SERVICE_ROLE_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgyMDQ5OSwiZXhwIjoyMDgxMzk2NDk5fQ.gzQQlg-0iKGeMJe41s-89U1MGvlgSwBIWPGe61Zc2zo" "preview"
add_env "SUPABASE_SERVICE_ROLE_KEY" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgyMDQ5OSwiZXhwIjoyMDgxMzk2NDk5fQ.gzQQlg-0iKGeMJe41s-89U1MGvlgSwBIWPGe61Zc2zo" "development"

add_env "SUPABASE_JWT_SECRET" "IGuVzv1NGhamrNH9/mWPbidTKq7dwd8Jj6LedwgtlxNByHwafu32x6mKezMcPWLguJ5iCAY3N6DQrbvYTQfJXw==" "production"
add_env "SUPABASE_JWT_SECRET" "IGuVzv1NGhamrNH9/mWPbidTKq7dwd8Jj6LedwgtlxNByHwafu32x6mKezMcPWLguJ5iCAY3N6DQrbvYTQfJXw==" "preview"
add_env "SUPABASE_JWT_SECRET" "IGuVzv1NGhamrNH9/mWPbidTKq7dwd8Jj6LedwgtlxNByHwafu32x6mKezMcPWLguJ5iCAY3N6DQrbvYTQfJXw==" "development"

# Supabase Database
add_env "SUPABASE_DB_HOST" "db.lbfimbcvvvbczllhqqlf.supabase.co" "production"
add_env "SUPABASE_DB_PORT" "5432" "production"
add_env "SUPABASE_DB_NAME" "karasuEmlak" "production"
add_env "SUPABASE_DB_USER" "postgres" "production"
add_env "SUPABASE_DB_PASSWORD" "A1683myPX87czfXR" "production"

# Cloudinary Configuration
add_env "CLOUDINARY_CLOUD_NAME" "dqucm2ffl" "production"
add_env "CLOUDINARY_CLOUD_NAME" "dqucm2ffl" "preview"
add_env "CLOUDINARY_CLOUD_NAME" "dqucm2ffl" "development"

add_env "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" "dqucm2ffl" "production"
add_env "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" "dqucm2ffl" "preview"
add_env "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" "dqucm2ffl" "development"

add_env "CLOUDINARY_API_KEY" "475897588713275" "production"
add_env "CLOUDINARY_API_KEY" "475897588713275" "preview"
add_env "CLOUDINARY_API_KEY" "475897588713275" "development"

add_env "CLOUDINARY_API_SECRET" "ExkLcxp3v7kOQxzNdn_i0lWr5Jk" "production"
add_env "CLOUDINARY_API_SECRET" "ExkLcxp3v7kOQxzNdn_i0lWr5Jk" "preview"
add_env "CLOUDINARY_API_SECRET" "ExkLcxp3v7kOQxzNdn_i0lWr5Jk" "development"

add_env "CLOUDINARY_URL" "cloudinary://475897588713275:ExkLcxp3v7kOQxzNdn_i0lWr5Jk@dqucm2ffl" "production"
add_env "CLOUDINARY_URL" "cloudinary://475897588713275:ExkLcxp3v7kOQxzNdn_i0lWr5Jk@dqucm2ffl" "preview"
add_env "CLOUDINARY_URL" "cloudinary://475897588713275:ExkLcxp3v7kOQxzNdn_i0lWr5Jk@dqucm2ffl" "development"

# AI Services
# NOTE: Replace with your actual OpenAI API key
add_env "OPENAI_API_KEY" "your-openai-api-key-here" "production"
add_env "OPENAI_API_KEY" "your-openai-api-key-here" "preview"

# GitHub
# NOTE: Replace with your actual GitHub token
add_env "GITHUB_PERSONAL_ACCESS_TOKEN" "your-github-token-here" "production"

# Security Secrets
REVALIDATE_SECRET=$(openssl rand -hex 32)
CRON_SECRET=$(openssl rand -hex 32)

add_env "REVALIDATE_SECRET" "$REVALIDATE_SECRET" "production"
add_env "CRON_SECRET" "$CRON_SECRET" "production"

# Node Environment
add_env "NODE_ENV" "production" "production"

echo ""
echo "✅ Tüm environment variables eklendi!"
echo ""
echo "📋 Eklenen variables:"
echo "  - Site Configuration"
echo "  - Supabase (URL, Keys, Database)"
echo "  - Cloudinary"
echo "  - OpenAI API"
echo "  - GitHub Token"
echo "  - Security Secrets (REVALIDATE_SECRET, CRON_SECRET)"
echo ""
echo "🔍 Kontrol için: vercel env ls --scope=$SCOPE"
