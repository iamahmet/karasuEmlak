# 🚀 GitHub MCP Server - Hızlı Başlangıç

## ✅ Tamamlanan İşlemler

1. ✅ **GitHub Personal Access Token** - `.env.local` dosyasına eklendi
2. ✅ **MCP Config** - `.cursor/mcp.json` güncellendi
3. ⚠️ **Docker Daemon** - Başlatılması gerekiyor

## 🔧 Docker Başlatma

GitHub MCP Server Docker kullanıyor. Docker'ı başlatın:

### macOS
```bash
# Docker Desktop'u açın
open -a Docker

# veya terminal'den
docker info
```

### Kontrol
```bash
docker ps
```

## 📋 MCP Config Durumu

**Dosya**: `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "seo-research": {
      "command": "python3.10",
      "args": ["-m", "uv", "tool", "run", "seo-mcp"],
      "env": {
        "CAPSOLVER_API_KEY": "${CAPSOLVER_API_KEY}"
      }
    },
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
```

## 🎯 Sonraki Adımlar

### 1. Docker'ı Başlatın
```bash
# Docker Desktop'u açın veya
open -a Docker
```

### 2. Cursor'ı Yeniden Başlatın
1. Cursor'ı tamamen kapatın
2. Docker'ın çalıştığını kontrol edin: `docker ps`
3. Cursor'ı yeniden açın

### 3. GitHub MCP Server'ı Test Edin

Cursor'da şu komutları deneyin:

```
#tool:list_repositories
#tool:get_repository owner="username" repo="repo-name"
```

## 🔍 Troubleshooting

### Docker Daemon Çalışmıyor
```bash
# Docker Desktop'u açın
open -a Docker

# Kontrol edin
docker ps
```

### GitHub Token Hatası
```bash
# Token'ı kontrol edin
grep GITHUB_PERSONAL_ACCESS_TOKEN .env.local
```

### MCP Server Görünmüyor
1. Cursor'ı yeniden başlatın
2. `.cursor/mcp.json` dosyasını kontrol edin
3. Docker'ın çalıştığını kontrol edin

## 📚 Referanslar

- **GitHub MCP Server**: https://github.com/github/github-mcp-server
- **Kurulum Rehberi**: `docs/GITHUB_MCP_SERVER_SETUP.md`
- **Kurulum Raporu**: `GITHUB_MCP_SETUP_COMPLETE.md`

---

**Durum**: ✅ **TOKEN VE CONFIG HAZIR** - ⚠️ **DOCKER BAŞLATILMALI**
**Tarih**: 2025-01-27
