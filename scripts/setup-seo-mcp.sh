#!/bin/bash

# SEO Research MCP Otomatik Kurulum Scripti
# macOS için optimize edilmiştir

set -e

echo "🚀 SEO Research MCP Kurulum Başlatılıyor..."
echo ""

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Homebrew kontrolü
echo "📦 Homebrew kontrol ediliyor..."
if ! command -v brew &> /dev/null; then
    echo -e "${YELLOW}⚠️  Homebrew bulunamadı. Kuruluyor...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo -e "${GREEN}✅ Homebrew kurulu${NC}"
fi

# 2. Python 3.10+ kontrolü ve kurulumu
echo ""
echo "🐍 Python 3.10+ kontrol ediliyor..."
PYTHON_VERSION=$(python3 --version 2>/dev/null | cut -d' ' -f2 | cut -d'.' -f1,2 || echo "0.0")
PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)

if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 10 ]); then
    echo -e "${YELLOW}⚠️  Python 3.10+ gerekli. Mevcut: Python $PYTHON_VERSION${NC}"
    echo "📦 Python 3.10+ kuruluyor..."
    brew install python@3.10
    echo -e "${GREEN}✅ Python 3.10+ kuruldu${NC}"
    
    # Python 3.10'u PATH'e ekle
    if [ -f "$HOME/.zshrc" ]; then
        if ! grep -q "python3.10" "$HOME/.zshrc"; then
            echo 'export PATH="/opt/homebrew/opt/python@3.10/bin:$PATH"' >> "$HOME/.zshrc"
            echo -e "${GREEN}✅ Python 3.10 PATH'e eklendi (.zshrc)${NC}"
        fi
    fi
    
    if [ -f "$HOME/.bash_profile" ]; then
        if ! grep -q "python3.10" "$HOME/.bash_profile"; then
            echo 'export PATH="/opt/homebrew/opt/python@3.10/bin:$PATH"' >> "$HOME/.bash_profile"
            echo -e "${GREEN}✅ Python 3.10 PATH'e eklendi (.bash_profile)${NC}"
        fi
    fi
else
    echo -e "${GREEN}✅ Python $PYTHON_VERSION kurulu (3.10+ gereksinimi karşılanıyor)${NC}"
fi

# 3. uv (uvx) kontrolü ve kurulumu
echo ""
echo "📦 uv (uvx) kontrol ediliyor..."
if ! command -v uvx &> /dev/null; then
    echo -e "${YELLOW}⚠️  uvx bulunamadı. Kuruluyor...${NC}"
    
    # Önce pip ile dene
    if command -v pip3 &> /dev/null; then
        pip3 install uv
        echo -e "${GREEN}✅ uv pip ile kuruldu${NC}"
    elif command -v pip &> /dev/null; then
        pip install uv
        echo -e "${GREEN}✅ uv pip ile kuruldu${NC}"
    else
        # Homebrew ile kur
        brew install uv
        echo -e "${GREEN}✅ uv Homebrew ile kuruldu${NC}"
    fi
else
    echo -e "${GREEN}✅ uvx kurulu${NC}"
fi

# 4. MCP yapılandırması kontrolü
echo ""
echo "⚙️  MCP yapılandırması kontrol ediliyor..."
if [ ! -f ".cursor/mcp.json" ]; then
    echo -e "${YELLOW}⚠️  .cursor/mcp.json bulunamadı. Oluşturuluyor...${NC}"
    mkdir -p .cursor
    cat > .cursor/mcp.json << 'EOF'
{
  "mcpServers": {
    "seo-research": {
      "command": "uvx",
      "args": ["--python", "3.10", "seo-mcp"],
      "env": {
        "CAPSOLVER_API_KEY": ""
      }
    }
  }
}
EOF
    echo -e "${GREEN}✅ .cursor/mcp.json oluşturuldu${NC}"
else
    echo -e "${GREEN}✅ .cursor/mcp.json mevcut${NC}"
fi

# 5. Environment variable kontrolü
echo ""
echo "🔑 Environment variable kontrol ediliyor..."
ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  .env.local bulunamadı. Oluşturuluyor...${NC}"
    touch "$ENV_FILE"
    echo -e "${GREEN}✅ .env.local oluşturuldu${NC}"
fi

# CAPSOLVER_API_KEY kontrolü
if grep -q "CAPSOLVER_API_KEY" "$ENV_FILE"; then
    CAPSOLVER_KEY=$(grep "CAPSOLVER_API_KEY" "$ENV_FILE" | cut -d'=' -f2 | tr -d ' ' | tr -d '"')
    if [ -z "$CAPSOLVER_KEY" ] || [ "$CAPSOLVER_KEY" = "" ]; then
        echo -e "${YELLOW}⚠️  CAPSOLVER_API_KEY boş${NC}"
        echo ""
        read -p "CapSolver API Key'inizi girin (boş bırakabilirsiniz, sonra ekleyebilirsiniz): " api_key
        if [ ! -z "$api_key" ]; then
            # Mevcut satırı güncelle
            sed -i '' "s/CAPSOLVER_API_KEY=.*/CAPSOLVER_API_KEY=$api_key/" "$ENV_FILE"
            echo -e "${GREEN}✅ CAPSOLVER_API_KEY güncellendi${NC}"
        else
            echo -e "${YELLOW}⚠️  CAPSOLVER_API_KEY boş bırakıldı. Sonra .env.local dosyasına ekleyebilirsiniz.${NC}"
        fi
    else
        echo -e "${GREEN}✅ CAPSOLVER_API_KEY mevcut${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  CAPSOLVER_API_KEY bulunamadı${NC}"
    echo ""
    read -p "CapSolver API Key'inizi girin (boş bırakabilirsiniz, sonra ekleyebilirsiniz): " api_key
    if [ ! -z "$api_key" ]; then
        echo "CAPSOLVER_API_KEY=$api_key" >> "$ENV_FILE"
        echo -e "${GREEN}✅ CAPSOLVER_API_KEY eklendi${NC}"
    else
        echo "# SEO Research MCP - CapSolver API Key" >> "$ENV_FILE"
        echo "CAPSOLVER_API_KEY=" >> "$ENV_FILE"
        echo -e "${YELLOW}⚠️  CAPSOLVER_API_KEY boş bırakıldı. Sonra .env.local dosyasına ekleyebilirsiniz.${NC}"
    fi
fi

# 6. Test
echo ""
echo "🧪 Kurulum test ediliyor..."
echo ""

# Python test
if command -v python3.10 &> /dev/null; then
    PYTHON_310_VERSION=$(python3.10 --version 2>/dev/null || echo "not found")
    echo -e "${GREEN}✅ Python 3.10: $PYTHON_310_VERSION${NC}"
elif python3 --version | grep -q "3.1[0-9]\|3.[2-9]"; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅ Python: $PYTHON_VERSION${NC}"
else
    echo -e "${RED}❌ Python 3.10+ bulunamadı${NC}"
fi

# uvx test
if command -v uvx &> /dev/null; then
    UVX_VERSION=$(uvx --version 2>/dev/null || echo "installed")
    echo -e "${GREEN}✅ uvx: $UVX_VERSION${NC}"
else
    echo -e "${RED}❌ uvx bulunamadı${NC}"
fi

# MCP config test
if [ -f ".cursor/mcp.json" ]; then
    echo -e "${GREEN}✅ MCP yapılandırması mevcut${NC}"
else
    echo -e "${RED}❌ MCP yapılandırması bulunamadı${NC}"
fi

# 7. Özet
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ SEO Research MCP Kurulum Tamamlandı!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Sonraki Adımlar:"
echo ""
echo "1. Cursor IDE'yi yeniden başlatın"
echo "2. MCP server'ın aktif olduğunu kontrol edin"
echo "3. CapSolver API Key'inizi .env.local dosyasına ekleyin (henüz eklemediyseniz)"
echo ""
echo "🔗 CapSolver API Key almak için: https://www.capsolver.com/"
echo ""
echo "📚 Dokümantasyon: docs/MCP_SEO_RESEARCH_INTEGRATION.md"
echo ""
