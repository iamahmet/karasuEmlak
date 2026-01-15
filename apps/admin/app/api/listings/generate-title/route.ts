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
    const { property_type, location_neighborhood, room_count, status, area_sqm } = await request.json();

    const openaiClient = await getOpenAI();
    if (!openaiClient) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const prompt = `Aşağıdaki bilgilere göre SEO uyumlu, çekici ve profesyonel bir emlak ilan başlığı oluştur. Türkçe olmalı, 30-60 karakter arasında olmalı.

Emlak Tipi: ${property_type || "Belirtilmemiş"}
Mahalle: ${location_neighborhood || "Belirtilmemiş"}
Oda Sayısı: ${room_count ? room_count + "+1" : "Belirtilmemiş"}
İlan Tipi: ${status === "satilik" ? "Satılık" : "Kiralık"}
Metrekare: ${area_sqm ? area_sqm + " m²" : "Belirtilmemiş"}

Başlık özellikleri:
- SEO dostu olmalı
- Anahtar kelimeleri içermeli (emlak tipi, konum, oda sayısı)
- Çekici ve profesyonel olmalı
- 30-60 karakter arasında
- Türkçe karakterler kullanılabilir
- Örnek format: "Denize Sıfır 3+1 Daire, Merkez Mahallesi" veya "Satılık Villa - Liman Mahallesi"

SADECE başlığı döndür, başka açıklama yapma.`;

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sen bir emlak ilan uzmanısın. SEO uyumlu, çekici ve profesyonel ilan başlıkları oluşturuyorsun.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const title = completion.choices[0]?.message?.content?.trim() || "";

    if (!title) {
      // Fallback title
      const fallback = `${status === "satilik" ? "Satılık" : "Kiralık"} ${property_type || "Emlak"} ${location_neighborhood ? "- " + location_neighborhood : ""}`;
      return NextResponse.json({ title: fallback });
    }

    return NextResponse.json({ title });
  } catch (error: any) {
    console.error("Title generation error:", error);
    return NextResponse.json(
      { error: error.message || "Başlık oluşturulamadı" },
      { status: 500 }
    );
  }
}
