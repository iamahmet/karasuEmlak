import { NextRequest, NextResponse } from "next/server";

async function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  
  try {
    const OpenAI = (await import("openai")).default;
    return new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } catch (error) {
    console.warn("OpenAI package not available:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, title, content, excerpt } = await request.json();

    const openaiClient = await getOpenAI();
    if (!openaiClient) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set OPENAI_API_KEY in your .env.local file." },
        { status: 500 }
      );
    }

    if (!title && !content) {
      return NextResponse.json(
        { error: "Title or content is required" },
        { status: 400 }
      );
    }

    let prompt = "";
    let systemPrompt = "";

    switch (type) {
      case "metaDescription":
        systemPrompt = "Sen bir SEO uzmanısın. Türkçe haber siteleri için meta açıklamaları oluşturuyorsun.";
        prompt = `Aşağıdaki haber için 3 farklı meta açıklama önerisi oluştur. Her biri 120-160 karakter arasında olmalı, SEO uyumlu ve çekici olmalı. Sadece önerileri liste halinde ver, başka açıklama yapma.

Başlık: ${title}
İçerik: ${content?.substring(0, 500) || ""}
Özet: ${excerpt || ""}`;
        break;

      case "seoKeywords":
        systemPrompt = "Sen bir SEO uzmanısın. Türkçe haber siteleri için SEO anahtar kelimeleri öneriyorsun.";
        prompt = `Aşağıdaki haber için 3 farklı SEO anahtar kelime listesi oluştur. Her liste virgülle ayrılmış 5-8 kelime içermeli. Sadece önerileri liste halinde ver, başka açıklama yapma.

Başlık: ${title}
İçerik: ${content?.substring(0, 500) || ""}
Özet: ${excerpt || ""}`;
        break;

      case "excerpt":
        systemPrompt = "Sen bir haber editörüsün. Türkçe haber siteleri için haber özetleri oluşturuyorsun.";
        prompt = `Aşağıdaki haber için 3 farklı özet önerisi oluştur. Her biri 150-200 karakter arasında olmalı, haberin özünü yansıtmalı ve çekici olmalı. Sadece önerileri liste halinde ver, başka açıklama yapma.

Başlık: ${title}
İçerik: ${content?.substring(0, 1000) || ""}`;
        break;

      case "title":
        systemPrompt = "Sen bir haber editörüsün. Türkçe haber siteleri için haber başlıkları oluşturuyorsun.";
        prompt = `Aşağıdaki haber içeriği için 3 farklı başlık önerisi oluştur. Her biri 30-60 karakter arasında olmalı, SEO uyumlu, çekici ve haberin özünü yansıtmalı. Sadece önerileri liste halinde ver, başka açıklama yapma.

İçerik: ${content?.substring(0, 1000) || ""}
Özet: ${excerpt || ""}`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid type" },
          { status: 400 }
        );
    }

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || "";
    
    // Parse suggestions from response
    const suggestions = responseText
      .split("\n")
      .filter(line => line.trim() && (line.match(/^\d+[\.\)]/) || line.startsWith("-") || line.startsWith("•")))
      .map(line => line.replace(/^\d+[\.\)]\s*/, "").replace(/^[-•]\s*/, "").trim())
      .filter(s => s.length > 0)
      .slice(0, 3);

    if (suggestions.length === 0) {
      // Fallback: try to extract from response
      const lines = responseText.split("\n").filter(l => l.trim());
      suggestions.push(...lines.slice(0, 3).map(l => l.trim()));
    }

    return NextResponse.json({
      success: true,
      suggestions: suggestions.length > 0 ? suggestions : [
        type === "metaDescription" ? "Bu haber hakkında detaylı bilgi için sayfamızı ziyaret edin." : "",
        type === "seoKeywords" ? "haber, gündem, son dakika" : "",
        type === "excerpt" ? "Bu haber hakkında detaylı bilgiler..." : "",
        type === "title" ? title || "Yeni Haber" : "",
      ].filter(Boolean),
    });
  } catch (error: any) {
    console.error("AI suggestion error:", error);
    return NextResponse.json(
      { error: error.message || "AI önerileri oluşturulamadı" },
      { status: 500 }
    );
  }
}
