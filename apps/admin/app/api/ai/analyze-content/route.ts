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

export async function POST(request: NextRequest) {
  try {
    const { title, content, excerpt, meta_description, seo_keywords } = await request.json();

    const openaiClient = await getOpenAI();
    if (!openaiClient) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set OPENAI_API_KEY in your .env.local file." },
        { status: 500 }
      );
    }

    const wordCount = content?.replace(/<[^>]*>/g, "").split(/\s+/).length || 0;
    const headingCount = (content?.match(/<h[2-6][^>]*>/gi) || []).length || 0;
    const imageCount = (content?.match(/<img[^>]*>/gi) || []).length || 0;
    const linkCount = (content?.match(/<a[^>]*>/gi) || []).length || 0;

    const systemPrompt = "Sen bir SEO ve içerik uzmanısın. Türkçe haber içeriklerini analiz ediyorsun ve iyileştirme önerileri sunuyorsun.";

    const prompt = `Aşağıdaki haber içeriğini analiz et ve iyileştirme önerileri sun.

ÖNEMLİ: AI-like writing patterns, generic phrases, pazarlama jargonu tespit et.

Başlık: ${title || "Yok"}
İçerik: ${content?.substring(0, 1000) || "Yok"}
Özet: ${excerpt || "Yok"}
Meta Açıklama: ${meta_description || "Yok"}
SEO Anahtar Kelimeleri: ${seo_keywords || "Yok"}

İstatistikler:
- Kelime Sayısı: ${wordCount}
- Başlık Sayısı: ${headingCount}
- Görsel Sayısı: ${imageCount}
- Link Sayısı: ${linkCount}

Kontrol Et:
- AI-like patterns var mı? ("Günümüzde", "Son yıllarda", "Bu yazıda sizlere")
- Generic phrases var mı?
- Pazarlama jargonu var mı? ("eşsiz", "lüks", "kaçırılmayacak fırsat")
- Yerel bilgi eksik mi?
- Anahtar kelimeler doğal kullanılmış mı?

Lütfen şu formatta JSON döndür:
{
  "suggestions": [
    {
      "type": "improvement" | "warning" | "info",
      "category": "seo" | "content" | "readability" | "structure" | "tone",
      "title": "Öneri başlığı",
      "description": "Detaylı açıklama"
    }
  ]
}`;

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const result = JSON.parse(responseText);

    // Add manual suggestions based on analysis
    const manualSuggestions = [];

    if (wordCount < 300) {
      manualSuggestions.push({
        type: "warning",
        category: "content",
        title: "İçerik çok kısa",
        description: `İçerik ${wordCount} kelime. SEO için minimum 300 kelime önerilir. Daha fazla detay ve bilgi ekleyin.`,
      });
    }

    if (headingCount < 2) {
      manualSuggestions.push({
        type: "info",
        category: "structure",
        title: "Başlık yapısını iyileştirin",
        description: "İçeriği alt başlıklarla (H2, H3) yapılandırarak hem okunabilirliği hem de SEO'yu iyileştirin.",
      });
    }

    if (linkCount < 2) {
      manualSuggestions.push({
        type: "info",
        category: "seo",
        title: "İç linkler ekleyin",
        description: "İlgili haber ve sayfalara iç linkler ekleyerek SEO'yu güçlendirin.",
      });
    }

    if (imageCount === 0 && !content?.includes("<img")) {
      manualSuggestions.push({
        type: "info",
        category: "content",
        title: "Görseller ekleyin",
        description: "Görseller içeriği daha çekici hale getirir ve kullanıcı deneyimini iyileştirir.",
      });
    }

    return NextResponse.json({
      success: true,
      suggestions: [...(result.suggestions || []), ...manualSuggestions],
    });
  } catch (error: any) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Analiz yapılamadı" },
      { status: 500 }
    );
  }
}
