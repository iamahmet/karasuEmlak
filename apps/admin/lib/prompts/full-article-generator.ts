/**
 * Full Article Generator (Human-like TR) + Internal Links + FAQ + Schema + Ramadan Add-on
 * KarasuEmlak.net için publish-ready makale üretimi
 */

export type FullArticleGeneratorInput = {
  pageType: "cornerstone" | "blog";
  primaryKeyword: string;
  secondaryKeywords?: string[];
  region?: "Karasu" | "Sapanca" | "Kocaali" | "Sakarya" | "General";
  funnelStage?: "TOFU" | "MOFU" | "BOFU";
  audience?: string;
  pillarSlug: string;
  supportingSlugs: string[];
  crossLinkSlugs?: string[];
  ramadanMode?: boolean;
  ramadanKeywords?: string[];
};

const RAMADAN_KEYWORD_GUIDANCE = `
RAMADAN KEYWORD GUIDANCE (ONLY IF RAMADAN_MODE=ON)
Use Ramadan-related keywords ONLY when relevant to the topic and region. Examples you may use naturally:
- "ramazan dönemi kiralık"
- "ramazanda yazlık kiralama"
- "bayram tatili sapanca bungalov"
- "iftar sonrası ev gezmesi"
- "ramazanda taşınma planı"
- "bayram öncesi satılık daire"
- "ramazan bütçesi kira/aidat"
- "ramazan sessiz mahalle tercihleri"
- "sahur için sakin lokasyon"
- "ramazanda kısa dönem konaklama"
`;

export function buildFullArticleGeneratorPrompt(input: FullArticleGeneratorInput): string {
  const {
    pageType,
    primaryKeyword,
    secondaryKeywords = [],
    region = "Karasu",
    funnelStage = "MOFU",
    audience = "",
    pillarSlug,
    supportingSlugs,
    crossLinkSlugs = [],
    ramadanMode = false,
    ramadanKeywords = [],
  } = input;

  const secondaryStr = secondaryKeywords.length > 0 ? secondaryKeywords.join(", ") : "—";
  const supportingStr = supportingSlugs.length > 0 ? supportingSlugs.join(", ") : "—";
  const crossStr = crossLinkSlugs.length > 0 ? crossLinkSlugs.join(", ") : "—";
  const ramadanKwStr = ramadanKeywords.length > 0 ? ramadanKeywords.join(", ") : "—";

  let prompt = `# Full Article Generator (Human-like TR) — KarasuEmlak.net

Sen senior Türkçe SEO yazarı + yerel emlak uzmanısın. Doğal Türkçe yaz (AI kokusu yok). Çıktı KarasuEmlak.net için publish-ready olmalı ve topical authority güçlendirmeli.

## GİRDİLER
- Page type: ${pageType}
- Primary keyword: ${primaryKeyword}
- Secondary keywords: ${secondaryStr}
- Region focus: ${region}
- Funnel stage: ${funnelStage}
- Target audience: ${audience || "—"}
- Internal links (MANDATORY):
  - Pillar link slug: ${pillarSlug}
  - Supporting link slugs: ${supportingStr}
  - Cross-link slugs: ${crossStr}
- Ramadan mode: ${ramadanMode ? "ON" : "OFF"}
${ramadanMode ? `- Ramadan keywords: ${ramadanKwStr}` : ""}

## KURALLAR (DEĞİŞTİRİLEMEZ)
1. Gerçek yerel uzman gibi yaz. Robotik geçişler ve şablon ifadeler YOK.
2. Keyword stuffing YOK. Primary keyword doğal kullan: title, H1, ilk 120 kelime, bir H2, bir image alt önerisi.
3. Doğrulanamayan kesin sayılar YOK. Aralık + "piyasa koşullarına göre değişir" kullan.
4. Kısa paragraflar (2–4 satır). Listeler, checklistler, küçük tablolar tercih et.
5. "Kısa Cevap:" micro-answer blokları ekle (toplam 3–5 blok) — Featured Snippets / AI Overviews için.
6. FAQ bölümü ekle (4–7 S/C). Cevaplar kısa ve net.
7. Internal linkleri verilen slug'larla gerçek markdown link olarak ekle:
   Örnek: [Karasu kiralık daire rehberi](/blog/${pillarSlug})
   Doğal anchor kullan. Asla "buraya tıklayın" deme.
8. Sonda yumuşak CTA bloğu (satış baskısı yok).
${ramadanMode ? `
9. Ramadan mode AÇIK:
   - Konuyla gerçekten uyuyorsa kısa seasonal modül ekle (200–350 kelime).
   - Zoraki dini ton YOK; saygılı, nötr, yerel yaşam açısı.
   - Pratik seasonal davranışlar: kısa dönem kiralama, bayram tatili, aile ziyareti, bütçe, taşınma zamanı, ev gezme saatleri, mahalle yaşamı.
   - 2 ek micro-answer + 2 ek FAQ item Ramadan keyword'lere bağlı.
` : ""}

## ÇIKTI FORMATI (STRICT JSON)

Aşağıdaki JSON yapısında yanıt ver. Sadece JSON, başka metin yok.

{
  "seoMeta": {
    "title": "55-60 karakter TR başlık",
    "h1": "H1",
    "metaDescription": "145-160 karakter TR meta",
    "urlSlug": "seo-friendly-slug",
    "primaryKeyword": "${primaryKeyword}",
    "secondaryKeywords": ["..."],
    "intent": "info|commercial|transactional|local",
    "schemaRecommendation": "Article veya BlogPosting + FAQPage"
  },
  "article": {
    "intro": {
      "paragraph1": "Direkt cevap + vaat (2-3 cümle)",
      "paragraph2": "Sayfa ne kapsar + kim için (2-3 cümle)"
    },
    "mainContent": "Markdown formatında tam makale. H2/H3 yapısı. 3-5 Kısa Cevap bloğu. 1 basit tablo (varsa). 1 checklist (her zaman). Internal linkler doğal gömülü.",
    "imageSuggestions": {
      "hero": "1 hero image fikri (photorealistic)",
      "inArticle": ["2 in-article image fikri"],
      "altTexts": ["3 alt-text önerisi TR"]
    }
  },
  "faq": [
    {"question": "Soru", "answer": "2-4 cümle cevap"}
  ],
  "internalLinking": {
    "pillarUsed": {"anchor": "anchor metni", "slug": "${pillarSlug}"},
    "supportingUsed": [{"anchor": "anchor", "slug": "slug"}],
    "crossLinksUsed": [{"anchor": "anchor", "slug": "slug"}]
  },
  "cta": {
    "soft": "2 cümle yumuşak CTA",
    "direct": "1 cümle + buton etiketi"
  },
  "qualityCheck": {
    "humanTone": true,
    "microAnswersIncluded": true,
    "internalLinksIncluded": true,
    "keywordPlacementNatural": true,
    "noExaggeratedClaims": true
  }
}
`;

  if (ramadanMode) {
    prompt += `\n${RAMADAN_KEYWORD_GUIDANCE}\n`;
  }

  prompt += `\nŞimdi bu kurallara uyarak tam JSON çıktı üret.`;

  return prompt;
}
