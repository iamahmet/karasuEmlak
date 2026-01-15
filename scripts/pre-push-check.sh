#!/bin/bash

# Pre-push Git Hook - Test and Build Check
# This script runs before git push to ensure code quality

set -e

echo "🔍 Pre-push kontrolü başlatılıyor...\n"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo -e "${RED}❌ Bu bir git repository değil!${NC}"
  exit 1
fi

# Step 1: TypeScript type checking
echo -e "${YELLOW}📝 Step 1: TypeScript type checking...${NC}"
if ! pnpm typecheck > /dev/null 2>&1; then
  echo -e "${RED}❌ TypeScript hataları bulundu!${NC}"
  echo -e "${YELLOW}💡 Düzeltmek için: pnpm typecheck${NC}\n"
  exit 1
fi
echo -e "${GREEN}✅ TypeScript kontrolü başarılı${NC}\n"

# Step 2: Linting
echo -e "${YELLOW}📝 Step 2: Linting...${NC}"
if ! pnpm lint > /dev/null 2>&1; then
  echo -e "${RED}❌ Lint hataları bulundu!${NC}"
  echo -e "${YELLOW}💡 Düzeltmek için: pnpm lint${NC}\n"
  exit 1
fi
echo -e "${GREEN}✅ Lint kontrolü başarılı${NC}\n"

# Step 3: Build check (web app)
echo -e "${YELLOW}📝 Step 3: Web app build kontrolü...${NC}"
if ! pnpm build:web:fast > /dev/null 2>&1; then
  echo -e "${RED}❌ Web app build hatası!${NC}"
  echo -e "${YELLOW}💡 Düzeltmek için: pnpm build:web${NC}\n"
  exit 1
fi
echo -e "${GREEN}✅ Web app build başarılı${NC}\n"

# Step 4: Build check (admin app)
echo -e "${YELLOW}📝 Step 4: Admin app build kontrolü...${NC}"
if ! pnpm build:admin > /dev/null 2>&1; then
  echo -e "${RED}❌ Admin app build hatası!${NC}"
  echo -e "${YELLOW}💡 Düzeltmek için: pnpm build:admin${NC}\n"
  exit 1
fi
echo -e "${GREEN}✅ Admin app build başarılı${NC}\n"

echo -e "${GREEN}✨ Tüm kontroller başarılı! Push yapılabilir.${NC}\n"
exit 0
