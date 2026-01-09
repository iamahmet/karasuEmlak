import { NextRequest, NextResponse } from "next/server";

let openai: any = null;

// Initialize OpenAI client lazily
async function getOpenAI() {
  if (openai) return openai;
  
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    const OpenAI = (await import("openai")).default;
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    return openai;
  } catch (error) {
    console.warn("OpenAI package not available:", error);
    return null;
  }
}

/**
 * Comprehensive SEO Optimization API
 * Optimizes all SEO-related fields in one go using advanced AI prompts
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      content, 
      excerpt, 
      meta_description, 
      seo_keywords,
      slug,
      type = "article", // article, news, listing
      locale = "tr"
    } = await request.json();

    const openaiClient = await getOpenAI();
    if (!openaiClient) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set OPENAI_API_KEY in your .env.local file." },
        { status: 500 }
      );
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Extract plain text from HTML content for analysis
    const plainContent = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    const wordCount = plainContent.split(/\s+/).length;
    const headingCount = (content.match(/<h[2-6][^>]*>/gi) || []).length;
    const linkCount = (content.match(/<a[^>]*>/gi) || []).length;
    const imageCount = (content.match(/<img[^>]*>/gi) || []).length;

    // Advanced SEO optimization prompt
    const systemPrompt = `Sen dünya çapında tanınmış bir SEO uzmanısın. Türkçe emlak sektörü için içerik optimizasyonu yapıyorsun. 
Karasu ve Kocaali bölgesindeki emlak içeriklerini optimize ediyorsun. 
En güçlü SEO tekniklerini kullanarak, Google'ın en üst sıralarında yer alacak şekilde içerikleri optimize ediyorsun.

Önemli Kurallar:
1. Başlıklar 30-60 karakter arası olmalı, anahtar kelime zengin ve çekici olmalı
2. Meta açıklamalar 120-160 karakter arası, CTA içermeli, anahtar kelime zengin
3. İçerik minimum 800 kelime olmalı, H2-H6 başlıkları ile yapılandırılmış olmalı
4. Anahtar kelimeler doğal şekilde içeriğe dağıtılmalı
5. İç linkler için uygun yerler belirlenmeli
6. LSI (Latent Semantic Indexing) anahtar kelimeleri kullanılmalı
7. E-A-T (Expertise, Authoritativeness, Trustworthiness) sinyalleri güçlendirilmeli
8. Yerel SEO için Karasu, Kocaali, Sakarya gibi yerel anahtar kelimeler kullanılmalı
9. Emlak sektörüne özel terimler (satılık, kiralık, daire, villa, yazlık vb.) doğal şekilde kullanılmalı
10. Kullanıcı niyetine (informational, transactional, navigational) uygun içerik yapısı oluşturulmalı`;

    // Comprehensive optimization prompt
    const optimizationPrompt = `Aşağıdaki ${type === "article" ? "blog makalesi" : type === "news" ? "haber" : "ilan"} içeriğini SEO açısından profesyonel seviyede optimize et.

MEVCUT İÇERİK:
Başlık: ${title}
Slug: ${slug || "yok"}
Özet: ${excerpt || "yok"}
Meta Açıklama: ${meta_description || "yok"}
SEO Anahtar Kelimeler: ${seo_keywords || "yok"}
İçerik (ilk 3000 karakter): ${plainContent.substring(0, 3000)}

MEVCUT METRİKLER:
- Kelime Sayısı: ${wordCount}
- Başlık Sayısı (H2-H6): ${headingCount}
- Link Sayısı: ${linkCount}
- Görsel Sayısı: ${imageCount}

OPTİMİZASYON GÖREVİ:
1. BAŞLIK OPTİMİZASYONU:
   - 30-60 karakter arası
   - Ana anahtar kelimeyi başta kullan
   - Duygusal çekicilik ekle
   - Yerel SEO için bölge adı ekle (Karasu, Kocaali vb.)
   - Örnek format: "[Anahtar Kelime] Karasu'da [Fayda] - 2025 Rehberi"

2. META AÇIKLAMA OPTİMİZASYONU:
   - 120-160 karakter arası
   - Anahtar kelimeyi doğal şekilde kullan
   - CTA (Call to Action) ekle
   - Fayda odaklı yaz
   - Örnek format: "[Anahtar kelime] hakkında kapsamlı rehber. [Fayda]. [CTA]"

3. SEO ANAHTAR KELİMELERİ:
   - 8-12 anahtar kelime
   - Ana anahtar kelime + LSI kelimeler
   - Yerel SEO kelimeleri (Karasu, Kocaali, Sakarya)
   - Emlak terimleri (satılık, kiralık, daire, villa vb.)
   - Long-tail keywords
   - Virgülle ayrılmış format

4. İÇERİK OPTİMİZASYONU:
   - Minimum 800 kelime (şu an ${wordCount} kelime)
   - H2-H6 başlıkları ile yapılandır
   - Anahtar kelimeleri doğal şekilde dağıt (keyword density: %1-2)
   - İç linkler için uygun yerler belirle [LINK:başlık] formatında
   - FAQ bölümü ekle
   - Yerel bilgiler ekle (Karasu, Kocaali özellikleri)
   - E-A-T sinyalleri güçlendir (uzman görüşü, istatistikler, kaynaklar)

5. ÖZET OPTİMİZASYONU:
   - 150-200 karakter
   - İçeriğin özünü yansıt
   - Anahtar kelime içermeli
   - Çekici olmalı

YANIT FORMATI (JSON):
{
  "title": "Optimize edilmiş başlık",
  "meta_description": "Optimize edilmiş meta açıklama",
  "seo_keywords": "anahtar, kelime, listesi",
  "excerpt": "Optimize edilmiş özet",
  "content_improvements": {
    "suggested_headings": ["H2 başlık 1", "H2 başlık 2", ...],
    "suggested_internal_links": [
      {"text": "link metni", "url": "/blog/slug", "position": "paragraf numarası"}
    ],
    "suggested_faq": [
      {"question": "Soru", "answer": "Cevap"}
    ],
    "word_count_target": 800,
    "keyword_density": "1.5%",
    "lsi_keywords": ["LSI kelime 1", "LSI kelime 2", ...]
  },
  "seo_score": 85,
  "improvements": [
    "İyileştirme önerisi 1",
    "İyileştirme önerisi 2",
    ...
  ]
}

SADECE JSON YANIT VER, BAŞKA AÇIKLAMA YAPMA.`;

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o", // Use GPT-4o for better quality
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: optimizationPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || "{}";
    let optimizedData;
    
    try {
      optimizedData = JSON.parse(responseText);
    } catch (parseError) {
      // Fallback: try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        optimizedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("AI yanıtı parse edilemedi");
      }
    }

    // Calculate SEO score
    const seoScore = calculateSEOScore({
      title: optimizedData.title || title,
      metaDescription: optimizedData.meta_description || meta_description,
      content: content,
      wordCount,
      headingCount,
      linkCount,
      imageCount,
    });

    return NextResponse.json({
      success: true,
      optimized: {
        title: optimizedData.title || title,
        meta_description: optimizedData.meta_description || meta_description,
        seo_keywords: optimizedData.seo_keywords || seo_keywords,
        excerpt: optimizedData.excerpt || excerpt,
        content_improvements: optimizedData.content_improvements || {},
        seo_score: optimizedData.seo_score || seoScore,
        improvements: optimizedData.improvements || [],
      },
      metrics: {
        before: {
          title_length: title.length,
          meta_length: meta_description?.length || 0,
          word_count: wordCount,
          heading_count: headingCount,
        },
        after: {
          title_length: (optimizedData.title || title).length,
          meta_length: (optimizedData.meta_description || meta_description)?.length || 0,
          word_count: wordCount,
          heading_count: headingCount,
        },
      },
    });
  } catch (error: any) {
    console.error("Full SEO optimization error:", error);
    return NextResponse.json(
      { error: error.message || "Optimizasyon yapılamadı" },
      { status: 500 }
    );
  }
}

function calculateSEOScore(metrics: {
  title: string;
  metaDescription?: string | null;
  content: string;
  wordCount: number;
  headingCount: number;
  linkCount: number;
  imageCount: number;
}): number {
  let score = 0;
  const maxScore = 100;

  // Title optimization (20 points)
  if (metrics.title.length >= 30 && metrics.title.length <= 60) {
    score += 20;
  } else if (metrics.title.length >= 25 && metrics.title.length <= 70) {
    score += 15;
  } else {
    score += 5;
  }

  // Meta description (20 points)
  if (metrics.metaDescription) {
    if (metrics.metaDescription.length >= 120 && metrics.metaDescription.length <= 160) {
      score += 20;
    } else if (metrics.metaDescription.length >= 100 && metrics.metaDescription.length <= 180) {
      score += 15;
    } else {
      score += 10;
    }
  }

  // Content length (20 points)
  if (metrics.wordCount >= 800) {
    score += 20;
  } else if (metrics.wordCount >= 500) {
    score += 15;
  } else if (metrics.wordCount >= 300) {
    score += 10;
  } else {
    score += 5;
  }

  // Heading structure (15 points)
  if (metrics.headingCount >= 3) {
    score += 15;
  } else if (metrics.headingCount >= 2) {
    score += 10;
  } else if (metrics.headingCount >= 1) {
    score += 5;
  }

  // Internal links (10 points)
  if (metrics.linkCount >= 3) {
    score += 10;
  } else if (metrics.linkCount >= 1) {
    score += 5;
  }

  // Images (10 points)
  if (metrics.imageCount >= 3) {
    score += 10;
  } else if (metrics.imageCount >= 1) {
    score += 5;
  }

  // Keyword usage (5 points) - basic check
  const contentLower = metrics.content.toLowerCase();
  const titleLower = metrics.title.toLowerCase();
  if (titleLower.split(/\s+/).some(word => contentLower.includes(word))) {
    score += 5;
  }

  return Math.min(score, maxScore);
}
