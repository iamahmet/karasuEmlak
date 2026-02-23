/**
 * SEO Content Engine Master Prompt
 * KarasuEmlak.net için intent + UX + topical authority odaklı içerik üretimi
 *
 * Clusters: Karasu (satılık/kiralık daire, emlak, yazlık, kira getirisi)
 *           Sapanca (bungalov, günlük kiralık, satılık daire/yazlık/bungalov)
 */

export type SEOContentEngineInput = {
  primaryKeyword: string;
  secondaryKeywords?: string[];
  pageType: "cornerstone" | "blog";
  region?: "Karasu" | "Sapanca" | "Kocaali" | "Sakarya";
  funnelStage?: "TOFU" | "MOFU" | "BOFU";
  cta?: "ilan ara" | "iletişim" | "WhatsApp";
};

export function buildSEOContentEnginePrompt(input: SEOContentEngineInput): string {
  const {
    primaryKeyword,
    secondaryKeywords = [],
    pageType,
    region = "Karasu",
    funnelStage = "MOFU",
    cta = "ilan ara",
  } = input;

  const secondaryStr = secondaryKeywords.length > 0 ? secondaryKeywords.join(", ") : "—";
  const regionStr = region || "Karasu, Kocaali, Sakarya";

  return `# SEO Content Engine — KarasuEmlak.net

Sen KarasuEmlak.net için senior SEO stratejisti + editör + emlak piyasası yazarısın. Odak: "intent + UX + topical authority". Keyword stuffing YOK.

## GİRDİLER
- Primary keyword: ${primaryKeyword}
- Secondary keywords: ${secondaryStr}
- Page type: ${pageType}
- Region: ${regionStr}
- Funnel stage: ${funnelStage}
- CTA: ${cta}

## KURALLAR
1. Keyword stuffing YOK. İnsan uzman gibi yaz.
2. Her parça net bir search intent'e uymalı (informational / commercial / transactional / local).
3. Türkçe-first, net, güvenli, yerel ton.
4. Doğrulanamayan sayısal iddialar YOK. Fiyat/verim için aralık + "piyasa koşullarına göre değişir" kullan.
5. Entity context doğal kullan: Karasu, Sakarya, Kocaali, Sapanca, bungalov, yazlık, kira geliri, denize yakın, tapu, iskan, aidat, kat mülkiyeti (sadece ilgiliyse).
6. CTA: "Ücretsiz danışmanlık", "İlanları filtrele", "Bölgeye göre karşılaştır" — satış baskısı yok.

## ÇIKTI FORMATI (STRICT JSON)

Aşağıdaki JSON yapısında yanıt ver. Sadece JSON, başka metin yok.

{
  "seoSetup": {
    "primaryKeyword": "${primaryKeyword}",
    "searchIntent": "informational|commercial|transactional|local",
    "audience": "kısa açıklama",
    "contentAngle": "USP - neden biz kazanırız",
    "title": "55-60 karakter SEO başlığı",
    "h1": "H1 başlığı",
    "metaDescription": "145-160 karakter meta açıklaması",
    "urlSlug": "seo-friendly-slug",
    "schema": "Article + FAQPage"
  },
  "outline": [
    {"level": "H2", "title": "Başlık", "note": "1 satır not"},
    {"level": "H3", "title": "Alt başlık", "note": "1 satır not"}
  ],
  "intro": {
    "paragraph1": "Direkt cevap + vaat (2-3 cümle)",
    "paragraph2": "Sayfa ne kapsar + kim için (2-3 cümle)"
  },
  "mainContent": "HTML formatında tam makale. Kısa paragraflar, bullet listeler. 2-4 adet 'Kısa Cevap:' blokları ekle. Gerekirse basit karşılaştırma tablosu. Yerel detaylar (tapu/iskan/aidat/konum/ulaşım). Minimum ${pageType === "cornerstone" ? "2500" : "1200"} kelime.",
  "faq": [
    {"question": "Soru 1", "answer": "2-4 cümle cevap"},
    {"question": "Soru 2", "answer": "2-4 cümle cevap"}
  ],
  "internalLinking": {
    "pillarLink": {"target": "/blog/slug", "anchor": "anchor metni"},
    "supportingLinks": [
      {"target": "/blog/slug", "anchor": "anchor metni"}
    ],
    "nextArticles": ["Öneri 1", "Öneri 2"]
  },
  "ctaBlocks": {
    "soft": "1-2 cümle yumuşak CTA",
    "direct": "1 cümle + buton etiketi önerisi"
  },
  "qualityCheck": {
    "intentMatched": true,
    "microAnswersIncluded": true,
    "internalLinksPlanned": true,
    "ctaPresent": true,
    "overClaimingAvoided": true
  }
}

## TRUST SIGNALS (doğal göm)
- Checklistler ("İlan bakarken şu 7 şeyi kontrol edin")
- Yaygın hatalar ("En sık yapılan 5 hata")
- Karar yardımcıları ("Hangi mahalle kim için uygun?")
- Yerel ifadeler (Karasu'da..., Sapanca'da..., sahil hattı..., göl çevresi...)

## ANTI-AI
- "Sonuç olarak", "Özetlemek gerekirse", "Bu makalede" KULLANMA
- Doğal geçişler: "Bu arada", "Dürüst olalım", "Bakalım"
- Cümle uzunluklarını çeşitlendir (kısa + uzun)

Şimdi bu kurallara uyarak tam JSON çıktı üret.`;
}

/**
 * Coverage Map: 1 cornerstone + 5 blog posts
 * Returns titles, primary keywords, intent, slugs for a cluster
 */
export function generateCoverageMapSuggestions(params: {
  cluster: "karasu" | "sapanca";
  pillarKeyword: string;
}): Array<{
  title: string;
  primaryKeyword: string;
  intent: string;
  slug: string;
  type: "cornerstone" | "blog";
}> {
  const { cluster, pillarKeyword } = params;
  const year = new Date().getFullYear();
  const region = cluster === "karasu" ? "Karasu" : "Sapanca";

  // Predefined clusters based on master prompt
  const karasuClusters: Record<string, string[]> = {
    "karasu satılık daire": [
      "Karasu Satılık Daire Fiyatları ve Mahalle Rehberi",
      "Karasu'da Daire Alırken Dikkat Edilecekler",
      "Karasu Sahilinde Satılık Daire Seçenekleri",
      "Karasu İskanlı Daire Nedir, Nasıl Alınır?",
      "Karasu'da Yatırım İçin Daire Seçimi",
    ],
    "karasu kiralık daire": [
      "Karasu Kiralık Daire Rehberi ve Fiyat Aralıkları",
      "Karasu Yaz-Kış Kiralık Daire Farkları",
      "Karasu'da Kiralık Daire Ararken Kontrol Listesi",
      "Karasu Sahil Mahallelerinde Kiralık Seçenekler",
      "Karasu Kiralık Daire Sözleşmesi: Bilmeniz Gerekenler",
    ],
    "karasu emlak": [
      `Karasu Emlak Piyasası ${year}: Kapsamlı Rehber`,
      "Karasu'da Emlak Alırken Tapu ve İskan Kontrolü",
      "Karasu Emlak Ofisleri ve Güvenilir Danışmanlık",
      "Karasu Emlak Yatırımı: Riskler ve Fırsatlar",
      "Karasu Emlak Vergileri ve Masraflar Rehberi",
    ],
    "karasu yazlık fiyatları": [
      "Karasu Yazlık Fiyatları ve Bölge Karşılaştırması",
      "Karasu'da Yazlık Alırken Dikkat Edilecekler",
      "Karasu Yazlık Kira Getirisi Hesaplama",
      "Karasu Sahilinde Yazlık vs Daire: Karar Rehberi",
      "Karasu Yazlık Piyasası Trendleri",
    ],
    "karasu kira getirisi": [
      "Karasu'da Kira Getirisi: Hesaplama ve Örnekler",
      "Karasu Yazlık Kira Getirisi Rehberi",
      "Karasu'da Yatırım Getirisi Karşılaştırması",
      "Karasu Kira Geliri Vergileri",
      "Karasu'da En İyi Kira Getirisi Veren Bölgeler",
    ],
  };

  const sapancaClusters: Record<string, string[]> = {
    "sapanca bungalov": [
      "Sapanca Bungalov Rehberi: Satın Alma ve Kiralama",
      "Sapanca Bungalov Fiyatları ve Bölge Analizi",
      "Sapanca'da Bungalov vs Yazlık: Karar Rehberi",
      "Sapanca Bungalov Yatırım Potansiyeli",
      "Sapanca Gölü Çevresinde Bungalov Seçenekleri",
    ],
    "sapanca günlük kiralık": [
      "Sapanca Günlük Kiralık Evler: Tatil Rehberi",
      "Sapanca'da Günlük Kiralık Bungalov ve Villa",
      "Sapanca Günlük Kiralık Fiyat Aralıkları",
      "Sapanca Tatil Konaklama Seçenekleri",
      "Sapanca Günlük Kiralık Rezervasyon İpuçları",
    ],
    "sapanca satılık daire": [
      "Sapanca Satılık Daire Fiyatları ve Bölgeler",
      "Sapanca'da Daire Alırken Bilmeniz Gerekenler",
      "Sapanca Gölü Manzaralı Daireler",
      "Sapanca Satılık Daire Yatırım Analizi",
      "Sapanca Daire ve Bungalov Karşılaştırması",
    ],
    "sapanca satılık yazlık": [
      "Sapanca Satılık Yazlık Rehberi ve Fiyatları",
      "Sapanca'da Yazlık Alırken Kontrol Listesi",
      "Sapanca Yazlık Kira Getirisi",
      "Sapanca Göl Çevresi Yazlık Seçenekleri",
      "Sapanca Yazlık Piyasası Trendleri",
    ],
    "sapanca satılık bungalov": [
      "Sapanca Satılık Bungalov Fiyatları ve Rehber",
      "Sapanca'da Bungalov Alırken Dikkat Edilecekler",
      "Sapanca Bungalov Yatırım Getirisi",
      "Sapanca Satılık Bungalov Bölge Analizi",
      "Sapanca Bungalov Tapu ve İmar Durumu",
    ],
  };

  const clusters = cluster === "karasu" ? karasuClusters : sapancaClusters;
  const normalizedKey = pillarKeyword.toLowerCase().trim();
  const suggestions = clusters[normalizedKey] || clusters[Object.keys(clusters)[0]]!;

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const result: Array<{
    title: string;
    primaryKeyword: string;
    intent: string;
    slug: string;
    type: "cornerstone" | "blog";
  }> = [];

  // Pillar (cornerstone)
  result.push({
    title: suggestions[0] || `${region} ${pillarKeyword} Rehberi`,
    primaryKeyword: pillarKeyword,
    intent: "commercial",
    slug: slugify(suggestions[0] || `${region} ${pillarKeyword}`),
    type: "cornerstone",
  });

  // 5 supporting blogs
  for (let i = 1; i <= 5; i++) {
    const title = suggestions[i] || `${region} ${pillarKeyword} - Rehber ${i}`;
    result.push({
      title,
      primaryKeyword: pillarKeyword,
      intent: i <= 2 ? "informational" : "commercial",
      slug: slugify(title),
      type: "blog",
    });
  }

  return result;
}
