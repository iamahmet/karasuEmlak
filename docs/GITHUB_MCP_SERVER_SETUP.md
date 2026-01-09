# GitHub MCP Server Entegrasyonu

## 📋 Genel Bakış

[GitHub MCP Server](https://github.com/github/github-mcp-server), GitHub'ın resmi MCP (Model Context Protocol) sunucusudur. AI araçlarının GitHub platformuyla doğrudan etkileşim kurmasını sağlar.

## ✅ Özellikler

- ✅ Repository yönetimi (okuma, yazma, güncelleme)
- ✅ Issue yönetimi (oluşturma, güncelleme, yorum ekleme)
- ✅ Pull Request yönetimi (oluşturma, review, merge)
- ✅ Code search ve analiz
- ✅ Branch yönetimi
- ✅ GitHub Copilot entegrasyonu
- ✅ Security advisories
- ✅ Ve daha fazlası...

## 🔧 Kurulum

### 1. Gereksinimler

- Docker (önerilen) veya GitHub MCP Server binary
- GitHub Personal Access Token (PAT)

### 2. GitHub Personal Access Token Oluşturma

1. [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens) adresine gidin
2. "Generate new token (classic)" tıklayın
3. Token'a bir isim verin (örn: "MCP Server")
4. Gerekli scope'ları seçin:
   - `repo` (full control of private repositories)
   - `read:org` (read org and team membership)
   - `read:user` (read user profile data)
   - `workflow` (update GitHub Action workflows) - opsiyonel
5. "Generate token" tıklayın
6. Token'ı kopyalayın (sadece bir kez gösterilir!)

### 3. Environment Variable Ekleme

`.env.local` dosyasına ekleyin:

```bash
GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here
```

### 4. MCP Config Güncelleme

`.cursor/mcp.json` dosyasına GitHub MCP Server ekleyin:

**Docker ile (Önerilen)**:
```json
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
```

**Binary ile**:
```json
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
```

### 5. Otomatik Kurulum

```bash
bash scripts/setup-github-mcp.sh
```

## 🚀 Kullanım

### Mevcut Tools

GitHub MCP Server birçok tool sağlar:

#### Repository Tools
- `create_repository` - Yeni repository oluştur
- `get_repository` - Repository bilgilerini al
- `list_repositories` - Repository'leri listele
- `update_repository` - Repository güncelle
- `delete_repository` - Repository sil

#### Issue Tools
- `create_issue` - Yeni issue oluştur
- `get_issue` - Issue bilgilerini al
- `list_issues` - Issue'ları listele
- `update_issue` - Issue güncelle
- `add_issue_comment` - Issue'a yorum ekle

#### Pull Request Tools
- `create_pull_request` - Yeni PR oluştur
- `get_pull_request` - PR bilgilerini al
- `list_pull_requests` - PR'ları listele
- `merge_pull_request` - PR'ı merge et
- `get_pull_request_reviews` - PR review'larını al

#### Code Tools
- `search_code` - Kod ara
- `get_file_contents` - Dosya içeriğini al
- `create_or_update_file` - Dosya oluştur/güncelle
- `delete_file` - Dosya sil

#### GitHub Copilot Tools
- `create_pull_request_with_copilot` - Copilot ile PR oluştur
- `get_copilot_space` - Copilot Space al
- `list_copilot_spaces` - Copilot Space'leri listele

### Örnek Kullanımlar

#### Repository Oluşturma
```
#tool:create_repository name="my-new-repo" description="A new repository" private=false
```

#### Issue Oluşturma
```
#tool:create_issue owner="username" repo="repo-name" title="Bug fix" body="Description"
```

#### Pull Request Oluşturma
```
#tool:create_pull_request owner="username" repo="repo-name" title="New feature" head="feature-branch" base="main"
```

#### Kod Arama
```
#tool:search_code query="function name" owner="username" repo="repo-name"
```

## 🔒 Güvenlik

### Read-Only Mode

Sadece okuma işlemleri için:

```json
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
        "-e",
        "GITHUB_READ_ONLY=1",
        "ghcr.io/github/github-mcp-server"
      ]
    }
  }
}
```

### Lockdown Mode

Sadece push access'i olan kullanıcıların içeriğini göster:

```json
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
        "-e",
        "GITHUB_LOCKDOWN_MODE=1",
        "ghcr.io/github/github-mcp-server"
      ]
    }
  }
}
```

## 📚 Referanslar

- **GitHub MCP Server**: https://github.com/github/github-mcp-server
- **GitHub Personal Access Tokens**: https://github.com/settings/tokens
- **MCP Documentation**: https://modelcontextprotocol.io/
- **GitHub API Documentation**: https://docs.github.com/en/rest

## ⚠️ Notlar

- GitHub Personal Access Token'ınızı güvenli tutun
- Token'ı `.env.local` dosyasına ekleyin (git'e commit etmeyin!)
- Rate limiting: GitHub API rate limit'leri geçerlidir
- Docker kullanımı önerilir (en kolay kurulum)

---

**Durum**: ✅ **KURULUM HAZIR**
**Tarih**: 2025-01-27
**Versiyon**: v0.27.0
