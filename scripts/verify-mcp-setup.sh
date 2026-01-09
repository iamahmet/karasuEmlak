#!/bin/bash

echo "🔍 MCP Setup Verification"
echo "========================"
echo ""

# Check Python 3.10
echo "1. Python 3.10:"
python3.10 --version 2>/dev/null && echo "   ✅ Found" || echo "   ❌ Not found"

# Check uv
echo "2. uv (via Python):"
python3.10 -m uv --version 2>/dev/null && echo "   ✅ Found" || echo "   ❌ Not found"

# Check CAPSOLVER_API_KEY
echo "3. CAPSOLVER_API_KEY:"
if grep -q "CAPSOLVER_API_KEY" .env.local 2>/dev/null; then
    echo "   ✅ Found in .env.local"
    grep "CAPSOLVER_API_KEY" .env.local | head -1 | sed 's/\(.*=\)\(.*\)/   Key: \1***/'
else
    echo "   ❌ Not found in .env.local"
fi

# Check MCP config
echo "4. MCP Config (.cursor/mcp.json):"
if [ -f ".cursor/mcp.json" ]; then
    echo "   ✅ Found"
    if grep -q "seo-research" .cursor/mcp.json 2>/dev/null; then
        echo "   ✅ seo-research configured"
    else
        echo "   ❌ seo-research not configured"
    fi
else
    echo "   ❌ Not found"
fi

echo ""
echo "📝 Note: uvx is accessed via 'python3.10 -m uv tool run'"
echo "   MCP server should use: python3.10 -m uv tool run seo-mcp"
