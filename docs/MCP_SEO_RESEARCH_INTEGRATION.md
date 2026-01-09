# SEO Research MCP Entegrasyon Rehberi

## ✅ Tamamlanan İşlemler

### 1. MCP Server Yapılandırması ✅
**Dosya**: `.cursor/mcp.json`

MCP server yapılandırması eklendi. Cursor IDE'de MCP server'ları kullanmak için gerekli.

### 2. Environment Schema Güncellemesi ✅
**Dosya**: `packages/config/env-schema.ts`

`CAPSOLVER_API_KEY` environment variable'ı schema'ya eklendi.

### 3. Dokümantasyon ✅
**Dosyalar**:
- `docs/MCP_SEO_RESEARCH_SETUP.md` - Detaylı kurulum rehberi
- `INTEGRATION_SEO_RESEARCH_MCP.md` - Entegrasyon raporu

## ⚠️ Yapılması Gerekenler

### 1. uvx Kurulumu (Gerekli)

MCP server'ı çalıştırmak için `uvx` gerekiyor. Python package manager `uv`'yi kurun:

```bash
# macOS
brew install uv

# veya pip ile
pip install uv

# Kurulumu kontrol et
uvx --version
```

### 2. Python 3.10+ Kurulumu (Gerekli)

Mevcut Python versiyonu: 3.9.6
Gerekli: Python 3.10+

```bash
# macOS - Homebrew ile
brew install python@3.10

# veya pyenv ile
pyenv install 3.10.0
pyenv global 3.10.0
```

### 3. CapSolver API Key Ekleme (Gerekli)

1. [CapSolver](https://www.capsolver.com/) sitesine kaydolun
2. API key'inizi alın
3. `.env.local` dosyasına ekleyin:

```bash
# .env.local
CAPSOLVER_API_KEY=your_api_key_here
```

### 4. Cursor'ı Yeniden Başlatma

1. Cursor'ı kapatın
2. `.env.local` dosyasını kontrol edin (`CAPSOLVER_API_KEY` var mı?)
3. Cursor'ı yeniden açın
4. MCP server'ın aktif olduğunu kontrol edin

## 🔧 MCP Server Yapılandırması

### Mevcut Config
`.cursor/mcp.json`:
```json
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
```

**Not**: `CAPSOLVER_API_KEY` environment variable'dan otomatik olarak alınır. Config dosyasında boş bırakılabilir.

## 📋 Mevcut Tools

### 1. `get_backlinks_list(domain)`
Domain için backlink analizi yapar.

**Kullanım:**
```
#tool:get_backlinks_list domain="karasuemlak.net"
```

### 2. `keyword_generator(keyword, country?, search_engine?)`
Seed keyword'den keyword fikirleri üretir.

**Kullanım:**
```
#tool:keyword_generator keyword="karasu satılık ev" country="tr"
```

### 3. `get_traffic(domain_or_url, country?, mode?)`
Website için trafik tahmini yapar.

**Kullanım:**
```
#tool:get_traffic domain_or_url="karasuemlak.net" country="tr"
```

### 4. `keyword_difficulty(keyword, country?)`
Keyword zorluk skoru ve SERP analizi yapar.

**Kullanım:**
```
#tool:keyword_difficulty keyword="karasu satılık ev" country="tr"
```

## 🎯 Kullanım Senaryoları

### Senaryo 1: Blog Yazısı İçin Keyword Araştırması
```
1. keyword_generator("karasu emlak", country="tr")
2. keyword_difficulty() ile zorluk kontrolü
3. En uygun keyword'leri seç
4. Blog yazısını optimize et
```

### Senaryo 2: Rakip Analizi
```
1. get_traffic("rakip-site.com", country="tr")
2. get_backlinks_list("rakip-site.com")
3. Top keyword'leri analiz et
4. Strateji geliştir
```

### Senaryo 3: İçerik Optimizasyonu
```
1. Mevcut sayfa için keyword_difficulty()
2. get_traffic() ile mevcut trafik analizi
3. İyileştirme önerileri
4. A/B test stratejisi
```

## 🔍 Troubleshooting

### Problem: uvx Bulunamadı
**Çözüm:**
```bash
# uv'yi kur
brew install uv
# veya
pip install uv

# Kontrol et
uvx --version
```

### Problem: Python 3.10+ Gerekli
**Çözüm:**
```bash
# Python 3.10+ kur
brew install python@3.10

# Kontrol et
python3.10 --version
```

### Problem: MCP Server Görünmüyor
**Çözüm:**
1. Cursor'ı yeniden başlatın
2. `.cursor/mcp.json` dosyasını kontrol edin
3. `uvx` kurulu mu kontrol edin: `which uvx`
4. Python 3.10+ kurulu mu kontrol edin: `python3.10 --version`

### Problem: CapSolver API Key Hatası
**Çözüm:**
1. `.env.local` dosyasında `CAPSOLVER_API_KEY` var mı kontrol edin
2. API key doğru mu kontrol edin
3. CapSolver hesabınız aktif mi kontrol edin

### Problem: Rate Limiting
**Çözüm:**
1. Birkaç dakika bekleyin
2. İstek sıklığını azaltın
3. CapSolver planınızı kontrol edin

## 📚 İlgili Dosyalar

- `.cursor/mcp.json` - MCP server yapılandırması
- `.env.local` - Environment variables (CAPSOLVER_API_KEY)
- `packages/config/env-schema.ts` - Environment schema
- `docs/MCP_SEO_RESEARCH_SETUP.md` - Detaylı kurulum rehberi
- `INTEGRATION_SEO_RESEARCH_MCP.md` - Entegrasyon raporu

## 🔗 Referanslar

- [SEO Research MCP GitHub](https://github.com/egebese/seo-research-mcp)
- [CapSolver](https://www.capsolver.com/)
- [Ahrefs API](https://ahrefs.com/api)
- [MCP Documentation](https://modelcontextprotocol.io/)

---

**Durum**: ✅ MCP SERVER YAPILANDIRMASI EKLENDİ
**Tarih**: 2025-01-27
**Versiyon**: 1.0.0

**Not**: `uvx` ve Python 3.10+ kurulumu gerekiyor. CapSolver API key eklenmeli.
