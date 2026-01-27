import { NextRequest, NextResponse } from "next/server";
import { handleAPIError, getUserFriendlyMessage, logError } from "@/lib/errors/handle-api-error";
import { FLAGSHIP_CONTENT_PROMPT } from "@/lib/prompts/editorial-optimizer";
import { safeJsonParse } from "@/lib/utils/safeJsonParse";

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
    const { topic, tone = "professional", wordCount = 800 } = await request.json();

    const openaiClient = await getOpenAI();
    if (!openaiClient) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set OPENAI_API_KEY in your .env.local file." },
        { status: 500 }
      );
    }

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const toneMap: Record<string, string> = {
      professional: "profesyonel ve objektif",
      casual: "günlük ve samimi",
      formal: "resmi ve ciddi",
    };

    const toneValue = toneMap[tone] || toneMap.professional;

    // Use Flagship Content prompt for blog articles (wordCount >= 1500)
    const useFlagshipPrompt = wordCount >= 1500;

    // Extract main keyword from topic (first 2-3 words)
    const topicWords = topic.split(' ').slice(0, 3).join(' ');
    
    const systemPrompt = useFlagshipPrompt
      ? FLAGSHIP_CONTENT_PROMPT.replace(/\[TOPIC\]/g, topic).replace(/\[KEYWORD\]/g, topicWords)
      : `Sen bir profesyonel haber editörüsün. Türkçe haber içerikleri oluşturuyorsun. ${toneValue} bir dil kullan.`;
    
    const prompt = useFlagshipPrompt
      ? `Aşağıdaki konu hakkında kapsamlı bir "Flagship Content" makalesi oluştur:

KONU: ${topic}
HEDEF ANAHTAR KELİME: ${topicWords}
KELİME SAYISI: Minimum ${wordCount} kelime (tercihen 2000+)

Lütfen şu formatta JSON döndür:
{
  "title": "H1 başlığı (30-60 karakter, High CTR, Curiosity Gap)",
  "content": "HTML formatında içerik (H1, H2, H3, H4 başlıklar, <p> paragraflar, <ul><li> listeler)",
  "excerpt": "150-200 kelimelik özet",
  "metaDescription": "SEO meta açıklaması (120-155 karakter)",
  "keywords": "virgülle ayrılmış SEO anahtar kelimeleri (5-10 kelime)",
  "faq": [
    {"question": "Soru 1", "answer": "Cevap 1"},
    {"question": "Soru 2", "answer": "Cevap 2"},
    {"question": "Soru 3", "answer": "Cevap 3"},
    {"question": "Soru 4", "answer": "Cevap 4"},
    {"question": "Soru 5", "answer": "Cevap 5"}
  ],
  "internalLinks": ["İç link önerisi 1", "İç link önerisi 2", "İç link önerisi 3"]
}

ÖNEMLİ:
- Minimum 2000 kelime
- 10-15 alt başlık (H2/H3)
- Her H2 bölümü 300-500 kelime
- FAQ bölümü ekle (5 soru-cevap)
- İç link önerileri belirt
- Görsel önerileri ekle (Image Idea formatında)
- Anti-AI ton: "In conclusion", "Furthermore" gibi ifadeler KULLANMA
- Doğal, konuşma tonu: "By the way", "Honestly", "Let's see" gibi geçişler kullan`
      : `Aşağıdaki konu hakkında ${wordCount} kelimelik kapsamlı bir haber makalesi oluştur:

Konu: ${topic}
Yazım Tarzı: ${toneValue}
Kelime Sayısı: ${wordCount}

Lütfen şu formatta JSON döndür:
{
  "title": "Haber başlığı (30-60 karakter)",
  "content": "HTML formatında haber içeriği (başlıklar için <h2>, <h3> kullan, paragraflar için <p> kullan)",
  "excerpt": "Haber özeti (150-200 karakter)",
  "metaDescription": "SEO meta açıklaması (120-160 karakter)",
  "keywords": "virgülle ayrılmış SEO anahtar kelimeleri (5-10 kelime)"
}

İçerik şunları içermeli:
- Doğal, akıcı bir giriş paragrafı
- En az 2 alt başlık (H2)
- Her alt başlık altında 2-3 paragraf
- SEO uyumlu yapı

ÖNEMLİ - İÇERİK KALİTE STANDARTLARI:
- "Sonuç", "Özet", "Değerlendirme" gibi başlıklar KULLANMA
- "Sonuç olarak", "Özetlemek gerekirse", "Kısaca", "bu makalede", "bu yazıda" gibi generic ifadeler KULLANMA
- Yazıyı doğal bir şekilde bitir, son paragrafı normal bir paragraf gibi yaz
- Yerel referanslar ekle: "Karasu", "Kocaali", "Sakarya" gibi coğrafi terimler
- Özgün ve doğal ifadeler kullan, AI detection'dan kaçın
- Cümle yapılarını çeşitlendir (kısa + uzun karışımı)
- Tekrar eden kelimelerden kaçın, eş anlamlılar kullan
- Kurumsal kimliğe uygun profesyonel ton kullan
- İnsan yazmış gibi görünmeli, yapay zeka yazmış gibi değil`;

    const completion = await openaiClient.chat.completions.create({
      model: useFlagshipPrompt ? "gpt-4o" : "gpt-4o-mini", // Use better model for flagship content
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: useFlagshipPrompt ? 8000 : Math.min(wordCount * 2, 4000),
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const content = safeJsonParse<{
      title?: string;
      content?: string;
      excerpt?: string;
      metaDescription?: string;
      meta_description?: string;
      keywords?: string;
      faq?: any[];
      internalLinks?: any[];
    }>(responseText, { title: "", content: "" }, {
      context: "ai.generate-article.response",
      dedupeKey: "ai.generate-article.response",
    });

    if (!content.title || !content.content) {
      throw new Error("Invalid response format");
    }

    return NextResponse.json({
      success: true,
      content: {
        title: content.title,
        content: content.content,
        excerpt: content.excerpt || "",
        metaDescription: content.metaDescription || content.meta_description || "",
        keywords: content.keywords || "",
        faq: content.faq || [],
        internalLinks: content.internalLinks || [],
      },
    });
  } catch (error: unknown) {
    logError(error, "POST /api/ai/generate-article");
    const errorInfo = handleAPIError(error);
    return NextResponse.json(
      { error: getUserFriendlyMessage(errorInfo), code: errorInfo.code },
      { status: errorInfo.statusCode }
    );
  }
}
