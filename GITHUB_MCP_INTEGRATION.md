# ✅ GitHub MCP Server Entegrasyonu

## 🎯 Durum

GitHub MCP Server **entegre değil**. Kurulum scripti hazırlandı ve dokümantasyon oluşturuldu.

## 📋 Yapılan İşlemler

### 1. Kurulum Scripti ✅
**Dosya**: `scripts/setup-github-mcp.sh`

- GitHub CLI kontrolü
- GitHub Personal Access Token kontrolü ve ekleme
- Docker kontrolü
- MCP config güncelleme

### 2. Dokümantasyon ✅
**Dosya**: `docs/GITHUB_MCP_SERVER_SETUP.md`

- Detaylı kurulum rehberi
- Kullanım örnekleri
- Güvenlik notları
- Tool referansları

### 3. Environment Schema ✅
**Dosya**: `packages/config/env-schema.ts`

- `GITHUB_PERSONAL_ACCESS_TOKEN` eklendi

## 🚀 Kurulum Adımları

### 1. Otomatik Kurulum (Önerilen)

```bash
bash scripts/setup-github-mcp.sh
```

### 2. Manuel Kurulum

#### A. GitHub Personal Access Token Oluştur

1. https://github.com/settings/tokens adresine gidin
2. "Generate new token (classic)" tıklayın
3. Scope'ları seçin: `repo`, `read:org`, `read:user`
4. Token'ı kopyalayın

#### B. Environment Variable Ekle

`.env.local` dosyasına:
```bash
GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here
```

#### C. MCP Config Güncelle

`.cursor/mcp.json` dosyasına GitHub MCP Server ekleyin:

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

### 3. Cursor'ı Yeniden Başlat

1. Cursor'ı kapatın
2. `.env.local` dosyasını kontrol edin
3. `.cursor/mcp.json` dosyasını kontrol edin
4. Cursor'ı yeniden açın

## 🔧 Mevcut MCP Servers

1. **seo-research** - SEO araştırma tools (CapSolver bağımlı, şu an çalışmıyor)
2. **github** - GitHub MCP Server (kurulum hazır, token gerekli)

## 📊 GitHub MCP Server Özellikleri

### Repository Yönetimi
- Repository oluşturma, okuma, güncelleme
- Branch yönetimi
- File operations

### Issue & PR Yönetimi
- Issue oluşturma, güncelleme, yorum ekleme
- Pull Request oluşturma, review, merge
- Code search

### GitHub Copilot
- Copilot Spaces
- AI-powered PR creation

### Security
- Security advisories
- Vulnerability scanning

## 🎯 Kullanım Senaryoları

### Senaryo 1: Repository Yönetimi
```
#tool:create_repository name="my-repo" description="Description" private=false
#tool:get_repository owner="username" repo="my-repo"
```

### Senaryo 2: Issue Tracking
```
#tool:create_issue owner="username" repo="my-repo" title="Bug" body="Description"
#tool:list_issues owner="username" repo="my-repo" state="open"
```

### Senaryo 3: Pull Request
```
#tool:create_pull_request owner="username" repo="my-repo" title="Feature" head="feature" base="main"
#tool:merge_pull_request owner="username" repo="my-repo" pullNumber=1
```

### Senaryo 4: Code Search
```
#tool:search_code query="function name" owner="username" repo="my-repo"
```

## ⚠️ Notlar

- GitHub Personal Access Token gerekli
- Docker önerilir (en kolay kurulum)
- Rate limiting: GitHub API limit'leri geçerlidir
- Token'ı güvenli tutun (`.env.local` git'e commit etmeyin!)

## 📚 Referanslar

- **GitHub MCP Server**: https://github.com/github/github-mcp-server
- **Kurulum Rehberi**: `docs/GITHUB_MCP_SERVER_SETUP.md`
- **Kurulum Scripti**: `scripts/setup-github-mcp.sh`

---

**Durum**: ⏳ **KURULUM HAZIR - TOKEN GEREKLİ**
**Tarih**: 2025-01-27
**Sonraki Adım**: GitHub Personal Access Token ekleyip Cursor'ı yeniden başlatın
