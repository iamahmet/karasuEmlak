#!/bin/bash

# V4 Compliance Test Script
# Tests critical V4 rules: health endpoints, timeouts, graceful degradation

set -e

echo "🧪 V4 Compliance Tests"
echo "======================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Test function
test_check() {
    local name=$1
    local command=$2
    local expected=$3
    
    echo -n "Testing: $name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        ((FAILED++))
        return 1
    fi
}

# Test health endpoints
echo "📡 Health Endpoint Tests"
echo "------------------------"

# Check if servers are running
WEB_RUNNING=$(curl -s --max-time 2 http://localhost:3000/healthz 2>/dev/null | grep -q "ok" && echo "yes" || echo "no")
ADMIN_RUNNING=$(curl -s --max-time 2 http://localhost:3001/healthz 2>/dev/null | grep -q "ok" && echo "yes" || echo "no")

if [ "$WEB_RUNNING" = "yes" ]; then
    echo -e "${GREEN}✓ Web server is running${NC}"
    
    # Test web health endpoint response time
    WEB_TIME=$(curl -o /dev/null -s -w '%{time_total}' --max-time 2 http://localhost:3000/healthz)
    WEB_TIME_MS=$(echo "$WEB_TIME * 1000" | bc | cut -d. -f1)
    
    if [ "$WEB_TIME_MS" -lt 100 ]; then
        echo -e "${GREEN}✓ Web health endpoint responds in ${WEB_TIME_MS}ms (<100ms target)${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠ Web health endpoint responds in ${WEB_TIME_MS}ms (target: <100ms)${NC}"
        ((FAILED++))
    fi
    
    # Test web health endpoint content
    WEB_STATUS=$(curl -s --max-time 2 http://localhost:3000/healthz | jq -r '.status' 2>/dev/null || echo "")
    if [ "$WEB_STATUS" = "ok" ]; then
        echo -e "${GREEN}✓ Web health endpoint returns correct status${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ Web health endpoint status check failed${NC}"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠ Web server is not running (start with: npm run dev:web)${NC}"
fi

if [ "$ADMIN_RUNNING" = "yes" ]; then
    echo -e "${GREEN}✓ Admin server is running${NC}"
    
    # Test admin health endpoint response time
    ADMIN_TIME=$(curl -o /dev/null -s -w '%{time_total}' --max-time 2 http://localhost:3001/healthz)
    ADMIN_TIME_MS=$(echo "$ADMIN_TIME * 1000" | bc | cut -d. -f1)
    
    if [ "$ADMIN_TIME_MS" -lt 100 ]; then
        echo -e "${GREEN}✓ Admin health endpoint responds in ${ADMIN_TIME_MS}ms (<100ms target)${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠ Admin health endpoint responds in ${ADMIN_TIME_MS}ms (target: <100ms)${NC}"
        ((FAILED++))
    fi
    
    # Test admin health endpoint content
    ADMIN_STATUS=$(curl -s --max-time 2 http://localhost:3001/healthz | jq -r '.status' 2>/dev/null || echo "")
    if [ "$ADMIN_STATUS" = "ok" ]; then
        echo -e "${GREEN}✓ Admin health endpoint returns correct status${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ Admin health endpoint status check failed${NC}"
        ((FAILED++))
    fi
else
    echo -e "${YELLOW}⚠ Admin server is not running (start with: npm run dev:admin)${NC}"
fi

echo ""
echo "📋 File Structure Tests"
echo "----------------------"

# Check root layout
if grep -q "createServiceClient\|createClient\|supabase\|fetch" apps/web/app/layout.tsx 2>/dev/null; then
    echo -e "${RED}✗ Root layout contains blocking operations${NC}"
    ((FAILED++))
else
    echo -e "${GREEN}✓ Root layout is clean (no blocking operations)${NC}"
    ((PASSED++))
fi

# Check middleware
if grep -q "fetch\|createServiceClient\|createClient\|supabase\|auth\|log" apps/web/proxy.ts 2>/dev/null; then
    echo -e "${RED}✗ Middleware contains blocking operations${NC}"
    ((FAILED++))
else
    echo -e "${GREEN}✓ Middleware is ultra-light${NC}"
    ((PASSED++))
fi

# Check timeout utilities exist
if [ -f "apps/web/lib/utils/timeout.ts" ]; then
    echo -e "${GREEN}✓ Timeout utilities exist${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Timeout utilities missing${NC}"
    ((FAILED++))
fi

# Check homepage uses timeout
if grep -q "withTimeoutAll" apps/web/app/\[locale\]/page.tsx 2>/dev/null; then
    echo -e "${GREEN}✓ Homepage uses timeout${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Homepage missing timeout${NC}"
    ((FAILED++))
fi

# Check locale layout uses timeout
if grep -q "withTimeout" apps/web/app/\[locale\]/layout.tsx 2>/dev/null; then
    echo -e "${GREEN}✓ Locale layout uses timeout${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Locale layout missing timeout${NC}"
    ((FAILED++))
fi

# Check health endpoints exist
if [ -f "apps/web/app/healthz/route.ts" ]; then
    echo -e "${GREEN}✓ Web health endpoint exists${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Web health endpoint missing${NC}"
    ((FAILED++))
fi

if [ -f "apps/admin/app/healthz/route.ts" ]; then
    echo -e "${GREEN}✓ Admin health endpoint exists${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Admin health endpoint missing${NC}"
    ((FAILED++))
fi

# Check documentation exists
DOCS=("ARCHITECTURE.md" "DEV_RULES.md" "RUNBOOK.md" "SEO_SYSTEM.md" "V4_MIGRATION_PLAN.md")
for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓ $doc exists${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ $doc missing${NC}"
        ((FAILED++))
    fi
done

echo ""
echo "📊 Test Results"
echo "---------------"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! V4 compliance verified.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please review the issues above.${NC}"
    exit 1
fi
