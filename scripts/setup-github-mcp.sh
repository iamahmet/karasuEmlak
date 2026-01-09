#!/bin/bash

# GitHub MCP Server Setup Script
# https://github.com/github/github-mcp-server

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🚀 GitHub MCP Server Kurulumu"
echo "=============================="
echo ""

# 1. Check for GitHub CLI
echo "📦 GitHub CLI kontrol ediliyor..."
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✅ GitHub CLI kurulu${NC}"
    gh --version | head -1
else
    echo -e "${YELLOW}⚠️  GitHub CLI bulunamadı${NC}"
    echo "GitHub CLI kurulumu için:"
    echo "  brew install gh"
    echo "  veya: https://cli.github.com/"
    echo ""
    read -p "GitHub CLI'yi şimdi kurmak ister misiniz? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v brew &> /dev/null; then
            brew install gh
        else
            echo -e "${RED}❌ Homebrew bulunamadı. Lütfen manuel olarak kurun: https://cli.github.com/${NC}"
            exit 1
        fi
    fi
fi

# 2. Check for GitHub Personal Access Token
echo ""
echo "🔑 GitHub Personal Access Token kontrol ediliyor..."
ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  .env.local bulunamadı. Oluşturuluyor...${NC}"
    touch "$ENV_FILE"
    echo -e "${GREEN}✅ .env.local oluşturuldu${NC}"
fi

if grep -q "GITHUB_PERSONAL_ACCESS_TOKEN" "$ENV_FILE"; then
    echo -e "${GREEN}✅ GITHUB_PERSONAL_ACCESS_TOKEN mevcut${NC}"
    grep "GITHUB_PERSONAL_ACCESS_TOKEN" "$ENV_FILE" | head -1 | sed 's/\(.*=\)\(.*\)/   Token: \1***/'
else
    echo -e "${YELLOW}⚠️  GITHUB_PERSONAL_ACCESS_TOKEN bulunamadı${NC}"
    echo ""
    echo "GitHub Personal Access Token oluşturmak için:"
    echo "1. https://github.com/settings/tokens adresine gidin"
    echo "2. 'Generate new token (classic)' tıklayın"
    echo "3. Token'a bir isim verin (örn: 'MCP Server')"
    echo "4. Gerekli scope'ları seçin:"
    echo "   - repo (full control of private repositories)"
    echo "   - read:org (read org and team membership)"
    echo "   - read:user (read user profile data)"
    echo "5. 'Generate token' tıklayın"
    echo "6. Token'ı kopyalayın (sadece bir kez gösterilir!)"
    echo ""
    read -p "GitHub Personal Access Token'ınızı girin: " GITHUB_TOKEN
    if [ ! -z "$GITHUB_TOKEN" ]; then
        echo "" >> "$ENV_FILE"
        echo "# GitHub MCP Server" >> "$ENV_FILE"
        echo "GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_TOKEN" >> "$ENV_FILE"
        echo -e "${GREEN}✅ GITHUB_PERSONAL_ACCESS_TOKEN eklendi${NC}"
    else
        echo -e "${YELLOW}⚠️  Token eklenmedi. Daha sonra manuel olarak ekleyebilirsiniz.${NC}"
    fi
fi

# 3. Check for Docker (for GitHub MCP Server)
echo ""
echo "🐳 Docker kontrol ediliyor..."
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker kurulu${NC}"
    docker --version
    USE_DOCKER=true
else
    echo -e "${YELLOW}⚠️  Docker bulunamadı${NC}"
    echo "GitHub MCP Server için Docker önerilir."
    echo "Alternatif: Binary indirip kullanabilirsiniz."
    USE_DOCKER=false
fi

# 4. Update MCP config
echo ""
echo "⚙️  MCP yapılandırması güncelleniyor..."
MCP_CONFIG=".cursor/mcp.json"

if [ ! -f "$MCP_CONFIG" ]; then
    echo -e "${YELLOW}⚠️  .cursor/mcp.json bulunamadı. Oluşturuluyor...${NC}"
    mkdir -p .cursor
    cat > "$MCP_CONFIG" << 'EOF'
{
  "mcpServers": {}
}
EOF
    echo -e "${GREEN}✅ .cursor/mcp.json oluşturuldu${NC}"
fi

# Backup existing config
if [ -f "$MCP_CONFIG" ]; then
    cp "$MCP_CONFIG" "$MCP_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Read existing config and add GitHub MCP Server
if [ "$USE_DOCKER" = true ]; then
    # Docker configuration
    cat > "$MCP_CONFIG" << 'EOF'
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN=${GITHUB_PERSONAL_ACCESS_TOKEN}",
        "ghcr.io/github/github-mcp-server"
      ]
    }
  }
}
EOF
    echo -e "${GREEN}✅ GitHub MCP Server (Docker) yapılandırması eklendi${NC}"
else
    # Binary configuration (user needs to download)
    echo -e "${YELLOW}⚠️  Docker bulunamadı. Binary kurulumu için:${NC}"
    echo "1. https://github.com/github/github-mcp-server/releases adresinden binary indirin"
    echo "2. Binary'yi PATH'e ekleyin"
    echo "3. MCP config'i manuel olarak güncelleyin"
    echo ""
    echo "Örnek config:"
    cat << 'EOF'
{
  "mcpServers": {
    "github": {
      "command": "/path/to/github-mcp-server",
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
EOF
fi

# 5. Check if GitHub MCP Server is already in config
if grep -q '"github"' "$MCP_CONFIG"; then
    echo -e "${GREEN}✅ GitHub MCP Server zaten yapılandırılmış${NC}"
else
    echo -e "${YELLOW}⚠️  GitHub MCP Server yapılandırması eklenmedi${NC}"
    echo "Lütfen manuel olarak ekleyin."
fi

echo ""
echo "✅ Kurulum tamamlandı!"
echo ""
echo "📝 Sonraki Adımlar:"
echo "1. GitHub Personal Access Token'ınızı kontrol edin (.env.local)"
echo "2. Cursor'ı yeniden başlatın"
echo "3. GitHub MCP Server'ın aktif olduğunu kontrol edin"
echo ""
echo "🔗 Referanslar:"
echo "- GitHub MCP Server: https://github.com/github/github-mcp-server"
echo "- GitHub Personal Access Tokens: https://github.com/settings/tokens"
