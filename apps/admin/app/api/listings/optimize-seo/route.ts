import { NextRequest, NextResponse } from "next/server";

async function getOpenAI() {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return null;
  }
  try {
    const { default: OpenAI } = await import("openai");
    return new OpenAI({ apiKey: openaiKey });
  } catch (error) {
    console.error("Failed to initialize OpenAI:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, property_type, location_neighborhood } = await request.json();

    const openaiClient = await getOpenAI();
    if (!openaiClient) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const prompt = `Aşağıdaki emlak ilanını SEO için optimize et. Türkçe olmalı.

Mevcut Başlık: ${title || "Yok"}
Mevcut Açıklama: ${description || "Yok"}
Emlak Tipi: ${property_type || "Belirtilmemiş"}
Mahalle: ${location_neighborhood || "Belirtilmemiş"}

Optimize edilmiş içerik özellikleri:
- SEO dostu başlık (30-60 karakter)
- SEO dostu açıklama (200-1000 karakter, HTML formatında)
- Anahtar kelimeleri doğal şekilde içermeli
- Yerel SEO için Karasu, Sakarya referansları ekle
- URL slug önerisi (küçük harf, tire ile ayrılmış)

YANIT FORMATI (JSON):
{
  "optimizedTitle": "Optimize edilmiş başlık",
  "optimizedDescription": "Optimize edilmiş açıklama (HTML)",
  "optimizedSlug": "optimize-edilmis-slug",
  "keywords": ["anahtar", "kelime", "listesi"],
  "seoScore": 85
}

SADECE JSON döndür, başka açıklama yapma.`;

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sen bir SEO uzmanısın. Emlak ilanlarını SEO için optimize ediyorsun. JSON formatında yanıt veriyorsun.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || "{}";
    const optimized = JSON.parse(responseText);

    return NextResponse.json({
      optimizedTitle: optimized.optimizedTitle || title,
      optimizedDescription: optimized.optimizedDescription || description,
      optimizedSlug: optimized.optimizedSlug || "",
      keywords: optimized.keywords || [],
      seoScore: optimized.seoScore || 0,
    });
  } catch (error: any) {
    console.error("SEO optimization error:", error);
    return NextResponse.json(
      { error: error.message || "SEO optimizasyonu başarısız" },
      { status: 500 }
    );
  }
}
