import { NextRequest, NextResponse } from "next/server";
import {
  EDITORIAL_SYSTEM_PROMPT,
  TITLE_OPTIMIZATION_PROMPT,
  META_DESCRIPTION_PROMPT,
  EXCERPT_OPTIMIZATION_PROMPT,
  SEO_KEYWORDS_PROMPT,
  CONTENT_OPTIMIZATION_PROMPT,
} from "@/lib/prompts/editorial-optimizer";

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
    const { field, currentValue, context } = await request.json();

    const openaiClient = await getOpenAI();
    if (!openaiClient) {
      return NextResponse.json(
        { error: "OpenAI API key not configured. Please set OPENAI_API_KEY in your .env.local file." },
        { status: 500 }
      );
    }

    if (!field || !currentValue) {
      return NextResponse.json(
        { error: "Field and currentValue are required" },
        { status: 400 }
      );
    }

    const systemPrompt = EDITORIAL_SYSTEM_PROMPT;

    let prompt = "";

    switch (field) {
      case "title":
        prompt = `${TITLE_OPTIMIZATION_PROMPT}\n\nCurrent title: ${currentValue}\nContent context: ${context.content || ""}`;
        break;

      case "meta_description":
        prompt = `${META_DESCRIPTION_PROMPT}\n\nTitle: ${context.title || ""}\nContent: ${context.content || ""}\nCurrent meta description: ${currentValue}`;
        break;

      case "seo_keywords":
        prompt = `${SEO_KEYWORDS_PROMPT}\n\nTitle: ${context.title || ""}\nContent: ${context.content || ""}\nCurrent keywords: ${currentValue}`;
        break;

      case "excerpt":
        prompt = `${EXCERPT_OPTIMIZATION_PROMPT}\n\nContent: ${context.content || ""}\nCurrent excerpt: ${currentValue}`;
        break;

      case "content":
        prompt = `${CONTENT_OPTIMIZATION_PROMPT}\n\nCurrent content: ${currentValue || ""}\nContent type: blog`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid field" },
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
      max_tokens: field === "content" ? 2000 : 200,
    });

    const optimized = completion.choices[0]?.message?.content?.trim() || currentValue;

    return NextResponse.json({
      success: true,
      optimized,
    });
  } catch (error: any) {
    console.error("AI optimization error:", error);
    return NextResponse.json(
      { error: error.message || "Optimizasyon yapılamadı" },
      { status: 500 }
    );
  }
}
