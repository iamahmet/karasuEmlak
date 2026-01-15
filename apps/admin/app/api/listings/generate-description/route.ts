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
    const { property_type, location_neighborhood, room_count, status, area_sqm, price_amount, floor, building_age } = await request.json();

    const openaiClient = await getOpenAI();
    if (!openaiClient) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const prompt = `Aşağıdaki bilgilere göre SEO uyumlu, detaylı ve çekici bir emlak ilan açıklaması oluştur. Türkçe olmalı, 200-1000 karakter arasında olmalı, HTML formatında olmalı (paragraflar için <p>, başlıklar için <h3> kullan).

Emlak Tipi: ${property_type || "Belirtilmemiş"}
Mahalle: ${location_neighborhood || "Belirtilmemiş"}
Oda Sayısı: ${room_count ? room_count + "+1" : "Belirtilmemiş"}
İlan Tipi: ${status === "satilik" ? "Satılık" : "Kiralık"}
Metrekare: ${area_sqm ? area_sqm + " m²" : "Belirtilmemiş"}
Fiyat: ${price_amount ? price_amount.toLocaleString("tr-TR") + " TL" : "Belirtilmemiş"}
Kat: ${floor !== undefined && floor !== null ? floor : "Belirtilmemiş"}
Bina Yaşı: ${building_age !== undefined && building_age !== null ? building_age + " yaşında" : "Belirtilmemiş"}

Açıklama özellikleri:
- SEO dostu olmalı
- Anahtar kelimeleri doğal şekilde içermeli
- Emlak özelliklerini detaylıca açıklamalı
- Çevresel faktörleri (okul, market, sahil, ulaşım) belirtmeli
- Öne çıkan özellikleri vurgulamalı
- Profesyonel ve çekici bir dil kullanmalı
- HTML formatında (paragraflar için <p>, başlıklar için <h3>)
- 200-1000 karakter arasında
- Karasu, Sakarya bölgesi için yerel bilgiler ekle

SADECE HTML formatında açıklamayı döndür, başka açıklama yapma.`;

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Sen bir emlak ilan uzmanısın. SEO uyumlu, detaylı ve çekici ilan açıklamaları oluşturuyorsun. HTML formatında yazıyorsun.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const description = completion.choices[0]?.message?.content?.trim() || "";

    if (!description) {
      // Fallback description
      const fallback = `<p>${status === "satilik" ? "Satılık" : "Kiralık"} ${property_type || "emlak"} ${location_neighborhood ? location_neighborhood + " mahallesinde" : ""} bulunmaktadır.</p>`;
      return NextResponse.json({ description: fallback });
    }

    return NextResponse.json({ description });
  } catch (error: any) {
    console.error("Description generation error:", error);
    return NextResponse.json(
      { error: error.message || "Açıklama oluşturulamadı" },
      { status: 500 }
    );
  }
}
