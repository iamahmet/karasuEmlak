# SEO Research MCP Entegrasyonu

## 📋 Genel Bakış

[SEO Research MCP](https://github.com/egebese/seo-research-mcp) projeye entegre edildi. Bu tool, Ahrefs API'sini kullanarak SEO araştırması yapmanıza olanak sağlar.

## ✅ Kurulum

### 1. Gereksinimler

- Python 3.10+
- `uvx` (uv package manager)
- CapSolver API key

### 2. CapSolver API Key Alma

1. [CapSolver](https://www.capsolver.com/) sitesine kaydolun
2. API key'inizi alın
3. `.env.local` dosyasına ekleyin:

```bash
CAPSOLVER_API_KEY=your_api_key_here
```

### 3. MCP Server Yapılandırması

MCP server yapılandırması `.cursor/mcp.json` dosyasında:

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

**Not**: `CAPSOLVER_API_KEY` environment variable'dan otomatik olarak alınır.

### 4. Cursor'ı Yeniden Başlat

1. Cursor'ı kapatın
2. `.env.local` dosyasını kontrol edin (`CAPSOLVER_API_KEY` var mı?)
3. Cursor'ı yeniden açın
4. MCP server'ın aktif olduğunu kontrol edin

## 🔧 Kullanım

### Mevcut Tools

#### 1. `get_backlinks_list(domain)`
Domain için backlink analizi yapar.

**Kullanım:**
```
#tool:get_backlinks_list domain="karasuemlak.net"
```

**Örnek:**
```python
# Backlink analizi
get_backlinks_list("karasuemlak.net")
```

#### 2. `keyword_generator(keyword, country?, search_engine?)`
Seed keyword'den keyword fikirleri üretir.

**Kullanım:**
```
#tool:keyword_generator keyword="karasu satılık ev" country="tr"
```

**Örnek:**
```python
# Keyword araştırması
keyword_generator("karasu satılık ev", country="tr", search_engine="Google")
```

#### 3. `get_traffic(domain_or_url, country?, mode?)`
Website için trafik tahmini yapar.

**Kullanım:**
```
#tool:get_traffic domain_or_url="karasuemlak.net" country="tr"
```

**Örnek:**
```python
# Trafik analizi
get_traffic("karasuemlak.net", country="tr", mode="exact")
```

#### 4. `keyword_difficulty(keyword, country?)`
Keyword zorluk skoru ve SERP analizi yapar.

**Kullanım:**
```
#tool:keyword_difficulty keyword="karasu satılık ev" country="tr"
```

**Örnek:**
```python
# Keyword zorluk analizi
keyword_difficulty("karasu satılık ev", country="tr")
```

## 🎯 Admin Panel Entegrasyonu

### SEO Booster Dashboard'a Ekleme

SEO Research MCP tools'larını admin paneldeki SEO Booster sayfasına entegre edebiliriz:

1. **Backlink Analizi**: Domain backlink'lerini görüntüle
2. **Keyword Araştırması**: Yeni keyword fikirleri bul
3. **Trafik Analizi**: Rakip analizi ve trafik tahmini
4. **Keyword Zorluk**: SEO stratejisi için keyword zorluk skoru

### Örnek Kullanım Senaryoları

#### Senaryo 1: Yeni Blog Yazısı İçin Keyword Araştırması
```
1. keyword_generator("karasu emlak", country="tr")
2. keyword_difficulty() ile zorluk kontrolü
3. En uygun keyword'leri seç
4. Blog yazısını optimize et
```

#### Senaryo 2: Rakip Analizi
```
1. get_traffic("rakip-site.com", country="tr")
2. get_backlinks_list("rakip-site.com")
3. Top keyword'leri analiz et
4. Strateji geliştir
```

#### Senaryo 3: İçerik Optimizasyonu
```
1. Mevcut sayfa için keyword_difficulty()
2. get_traffic() ile mevcut trafik analizi
3. İyileştirme önerileri
4. A/B test stratejisi
```

## 🔍 Troubleshooting

### Problem: MCP Server Görünmüyor

**Çözüm:**
1. Cursor'ı yeniden başlatın
2. `.cursor/mcp.json` dosyasını kontrol edin
3. `uvx` kurulu mu kontrol edin: `which uvx`
4. Python 3.10+ kurulu mu kontrol edin: `python3 --version`

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

### Problem: Sonuç Yok

**Çözüm:**
1. Domain Ahrefs'te indexlenmiş mi kontrol edin
2. Domain formatını kontrol edin (www olmadan)
3. Farklı bir domain ile test edin

## 📊 API Referansı

Detaylı API referansı için: [SEO Research MCP GitHub](https://github.com/egebese/seo-research-mcp)

## 🔗 İlgili Dosyalar

- `.cursor/mcp.json` - MCP server yapılandırması
- `.env.local` - Environment variables (CAPSOLVER_API_KEY)
- `docs/MCP_SEO_RESEARCH_SETUP.md` - Bu dokümantasyon

## 🚀 Sonraki Adımlar

1. ✅ MCP server yapılandırması eklendi
2. ⏳ CapSolver API key eklenmeli (`.env.local`)
3. ⏳ Cursor yeniden başlatılmalı
4. ⏳ Admin panelde SEO Booster'a entegre edilebilir
5. ⏳ Test edilmeli

---

**Durum**: ✅ MCP SERVER YAPILANDIRMASI EKLENDİ
**Tarih**: 2025-01-27
