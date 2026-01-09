/**
 * SEO Suggestions Route
 * Generates SEO suggestions using OpenAI
 */

import { NextRequest, NextResponse } from "next/server";

import { generateText } from "@karasu/lib/openai";
import { handleAPIError, getUserFriendlyMessage, logError } from "@/lib/errors/handle-api-error";

import { requireStaff } from "@/lib/auth/server";
export async function POST(request: NextRequest) {
  try {
    await requireStaff();
    const body = await request.json();
    const { title, content, currentMetaDescription: _currentMetaDescription, locale = "tr" } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Generate meta description
    const metaPrompt = `Generate a compelling meta description (150-160 characters) in ${locale === 'tr' ? 'Turkish' : 'English'} for this article:

Title: ${title}
Content: ${content.substring(0, 500)}

Meta description should be:
- 150-160 characters
- Compelling and click-worthy
- Include main keywords
- Summarize the article value

Return only the meta description text, no quotes or extra text.`;
    
    const metaDescription = await generateText(metaPrompt, {
      max_tokens: 100,
      temperature: 0.7,
    }).then(text => text.trim().replace(/^["']|["']$/g, '').substring(0, 160));

    // Extract keywords from content (simple implementation)
    const words = content
      .replace(/<[^>]*>/g, " ")
      .toLowerCase()
      .split(/\s+/)
      .filter((w: string) => w.length > 4);
    const wordFreq: Record<string, number> = {};
    words.forEach((word: string) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word)
      .join(", ");

    return NextResponse.json({
      success: true,
      suggestions: {
        metaDescription,
        keywords: topKeywords,
      },
    });
  } catch (error: unknown) {
    logError(error, "SEOSuggestions");
    const errorInfo = handleAPIError(error);
    return NextResponse.json(
      {
        error: getUserFriendlyMessage(errorInfo as any),
        code: errorInfo.code,
      },
      { status: errorInfo.statusCode }
    );
  }
}

