#!/bin/bash

# Quick V4 Compliance Test
# Fast checks without requiring servers to be running

set -e

echo "🧪 Quick V4 Compliance Check"
echo "============================"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

# Check root layout
echo -n "Root layout check... "
if grep -qE "createServiceClient|createClient|supabase|fetch" apps/web/app/layout.tsx 2>/dev/null; then
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
else
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
fi

# Check middleware
echo -n "Middleware check... "
if grep -qE "fetch|createServiceClient|createClient|supabase|auth|log" apps/web/proxy.ts 2>/dev/null; then
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
else
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
fi

# Check timeout utilities
echo -n "Timeout utilities... "
if [ -f "apps/web/lib/utils/timeout.ts" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# Check homepage timeout
echo -n "Homepage timeout... "
if grep -q "withTimeoutAll" apps/web/app/\[locale\]/page.tsx 2>/dev/null; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# Check locale layout timeout
echo -n "Locale layout timeout... "
if grep -q "withTimeout" apps/web/app/\[locale\]/layout.tsx 2>/dev/null; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# Check health endpoints
echo -n "Web health endpoint... "
if [ -f "apps/web/app/healthz/route.ts" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

echo -n "Admin health endpoint... "
if [ -f "apps/admin/app/healthz/route.ts" ]; then
    echo -e "${GREEN}✓ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAILED${NC}"
    ((FAILED++))
fi

# Check documentation
DOCS=("ARCHITECTURE.md" "DEV_RULES.md" "RUNBOOK.md" "SEO_SYSTEM.md" "V4_MIGRATION_PLAN.md" "TEST_PLAN.md")
for doc in "${DOCS[@]}"; do
    echo -n "Documentation: $doc... "
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
    fi
done

echo ""
echo "📊 Results:"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some checks failed${NC}"
    exit 1
fi
