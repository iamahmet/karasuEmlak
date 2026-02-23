# SEO System V2 — KarasuEmlak.net

**Hedef anahtar kelimeler:** karasu emlak, karasu satılık daire, karasu kiralık daire, karasu kira getirisi, karasu yazlık fiyatları, sapanca bungalov, sapanca günlük kiralık, sapanca satılık daire/yazlık/bungalov. Kocaali destek hub.

## NON-NEGOTIABLES

1. **GSC Verification:** `<meta name="google-site-verification" content="uNWMokv81E_cnHJl-FM-2QnAq3iQQ_uX2Kww-wZoWyA" />` — ASLA silme/değiştirme.
2. **GA4 Measurement ID:** `G-EXFYWJWB5C` — ASLA silme/değiştirme.
3. **Doorway/thin sayfa yok.** Keyword stuffing yok. Otomatik junk yok.
4. **Indexlenmiş URL'ler kırılmaz** — redirect + legacy route map kullan.

---

## Kategori: Cornerstone → Rehber

- **Cornerstone** kategorisi kaldırıldı.
- Yerine **Rehber** veya **anahtar kelime** (örn. Karasu Satılık Daire, Sapanca Bungalov) kullanılır.
- Yeni içerik: `category = primaryKeyword` (title case) veya `Rehber`.
- Mevcut DB: `Cornerstone` → `Rehber` migration uygulandı.

---

## Hub Sayfaları (Mega Hubs)

| Hub | Path | Amaç |
|-----|------|------|
| Karasu | `/karasu` | karasu emlak, karasu satılık daire, karasu kiralık daire |
| Sapanca | `/sapanca` | sapanca bungalov, sapanca günlük kiralık, sapanca satılık daire |
| Kocaali | `/kocaali` | Destek hub |

Her hub: "why this region", featured listings, FAQ blokları, rehber linkleri.

---

## Rehber (Pillar) Kuralları

- Her rehber: 1 pillar link (hub), 2 sibling link, 1 money page link.
- Kategori: primary keyword (Karasu Satılık Daire, Sapanca Bungalov vb.) veya Rehber.
- Minimum 2000 kelime, TL;DR, Kısa Cevap blokları.

---

## Scriptler

| Komut | Açıklama |
|-------|----------|
| `pnpm seo:doctor` | validate + crawl + schema |
| `pnpm seo:crawl` | Sitemap + key route crawl, SEO_CRAWL_REPORT.md |
| `pnpm seo:validate-schema` | JSON-LD doğrulama |
| `pnpm seo:validate` | Sitemap, robots, canonical, schema varlığı |
| `pnpm seo:indexnow` | Tüm URL'leri IndexNow ile gönder |

---

## Legacy URL Map

`scripts/seo/legacy-url-map.json` — 301 redirect hedefleri:

- `/kiralik-daire` → `/kiralik`
- `/satilik-daire` → `/satilik`
- `/karasu-kiralik-daire` → `/kiralik?location=karasu`
- `/karasu-satilik-daire` → `/satilik?location=karasu`

---

## Öncelikli SEO Roadmap (Top 20)

1. ✅ Cornerstone → Rehber kategori değişikliği
2. ✅ Crawl script + SEO Doctor + Legacy URL map
3. ✅ Schema validation script
4. Canonical & redirect uygulaması (middleware/next.config)
5. Structured data: WebSite, Organization, BreadcrumbList, ItemList, RealEstateListing
6. Internal linking: build-link-graph script
7. AI Overviews: Kısa Cevap, TL;DR, karar yardımcıları
8. Content quality scoring script
9. GA4 event tracking: search, filter, listing click, WhatsApp
10. Haftalık SEO rapor script
11. Hub sayfaları güçlendirme (/karasu, /sapanca, /kocaali)
12. Mahalle sayfaları (unique content ile)
13. OG image fallback generation
14. Core Web Vitals: LCP, CLS, INP
15. Hreflang tr-TR (minimal)
16. Programmatic SEO uniqueness gate
17. Discover-friendly editorial kuralları
18. Q&A bank dağılımı (20–40 soru/cluster)
19. NAP consistency + harita embed
20. IndexNow + sitemap ping otomasyonu

---

## Dosya Referansları

| Amaç | Dosya |
|------|-------|
| GSC/GA4 | `apps/web/app/[locale]/layout.tsx`, `lib/seo/constants.ts` |
| Legacy URL map | `scripts/seo/legacy-url-map.json` |
| Crawl | `scripts/seo/crawl-site.ts` |
| Schema validation | `scripts/seo/validate-schema.ts` |
| Structured data | `apps/web/lib/seo/structured-data.ts`, `local-seo-schemas.ts` |
| Sitemap | `apps/web/app/sitemap.ts` |
| Robots | `apps/web/app/robots.ts` |
