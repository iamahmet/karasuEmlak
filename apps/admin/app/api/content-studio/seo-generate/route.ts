/**
 * SEO Content Engine API
 * Generates content using the master prompt (intent + UX + topical authority)
 * Uses Gemini first, OpenAI fallback
 */

import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { checkContentQuality } from "@karasu/lib/content/quality-gate";
import { logAuditEvent } from "@karasu/lib/audit";
import {
  withErrorHandling,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/api/error-handler";
import { getRequestId } from "@/lib/api/middleware";
import { buildSEOContentEnginePrompt } from "@/lib/prompts/seo-content-engine";
import { buildFullArticleGeneratorPrompt } from "@/lib/prompts/full-article-generator";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

type SEOGenerateBody = {
  primaryKeyword: string;
  secondaryKeywords?: string[];
  pageType: "cornerstone" | "blog";
  region?: "Karasu" | "Sapanca" | "Kocaali" | "Sakarya";
  funnelStage?: "TOFU" | "MOFU" | "BOFU";
  cta?: "ilan ara" | "iletişim" | "WhatsApp";
  locale?: string;
  /** Full Article Generator: internal links + Ramadan */
  pillarSlug?: string;
  supportingSlugs?: string[];
  crossLinkSlugs?: string[];
  ramadanMode?: boolean;
  ramadanKeywords?: string[];
  audience?: string;
};

async function generateWithGemini(prompt: string): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000,
        responseMimeType: "application/json",
      },
    });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.warn("[SEO Engine] Gemini failed:", (e as Error).message);
    return null;
  }
}

async function generateWithOpenAI(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY yapılandırılmamış");

  const openai = new OpenAI({ apiKey: key });
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 8000,
    response_format: { type: "json_object" },
  });
  return completion.choices[0]?.message?.content || "{}";
}

function parseSEOResponse(text: string, isFullGenerator = false): {
  title: string;
  content: string;
  excerpt: string;
  metaDescription: string;
  keywords: string[];
  faq: Array<{ question: string; answer: string }>;
  slug?: string;
} {
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    else throw new Error("Geçersiz JSON yanıtı");
  }

  const setup = parsed.seoSetup || parsed.seoMeta || {};
  const articleBlock = parsed.article || {};
  const mainContent =
    parsed.mainContent ||
    articleBlock.mainContent ||
    parsed.content ||
    "";
  const intro = parsed.intro || articleBlock.intro || {};
  const introHtml =
    intro.paragraph1 && intro.paragraph2
      ? `<p>${intro.paragraph1}</p><p>${intro.paragraph2}</p>`
      : "";

  let fullContent = mainContent;
  if (introHtml && !mainContent.includes(intro.paragraph1)) {
    fullContent = introHtml + mainContent;
  }

  const faq = Array.isArray(parsed.faq) ? parsed.faq : [];
  const faqHtml =
    faq.length > 0
      ? `
<section class="faq-section">
  <h2>Sık Sorulan Sorular</h2>
  ${faq
    .map(
      (q: { question: string; answer: string }) =>
        `<div><h3>${q.question}</h3><p>${q.answer}</p></div>`
    )
    .join("\n")}
</section>`
      : "";
  if (faqHtml && !fullContent.includes("Sık Sorulan Sorular")) {
    fullContent += faqHtml;
  }

  const title = setup.title || setup.h1 || parsed.title || "";
  const metaDesc = setup.metaDescription || parsed.metaDescription || "";
  const slug = setup.urlSlug || "";

  const keywords: string[] = [];
  if (Array.isArray(parsed.keywords)) keywords.push(...parsed.keywords);
  else if (typeof parsed.keywords === "string")
    keywords.push(
      ...parsed.keywords.split(",").map((k: string) => k.trim()).filter(Boolean)
    );

  return {
    title,
    content: fullContent,
    excerpt: metaDesc.substring(0, 200) || "",
    metaDescription: metaDesc,
    keywords,
    faq,
    slug,
  };
}

async function handlePost(request: NextRequest) {
  const requestId = getRequestId(request);
  const supabase = createServiceClient();

  const body = (await request.json()) as SEOGenerateBody;
  const {
    primaryKeyword,
    secondaryKeywords,
    pageType,
    region,
    funnelStage,
    cta,
    locale = "tr",
    pillarSlug,
    supportingSlugs,
    crossLinkSlugs,
    ramadanMode,
    ramadanKeywords,
    audience,
  } = body;

  if (!primaryKeyword?.trim()) {
    return createErrorResponse(
      requestId,
      "VALIDATION_ERROR",
      "Primary keyword gereklidir",
      undefined,
      400
    );
  }

  const useFullGenerator =
    ramadanMode ||
    (pillarSlug && (supportingSlugs?.length ?? 0) > 0);

  const prompt = useFullGenerator
    ? buildFullArticleGeneratorPrompt({
        pageType: pageType || "blog",
        primaryKeyword: primaryKeyword.trim(),
        secondaryKeywords: secondaryKeywords || [],
        region,
        funnelStage,
        audience,
        pillarSlug: pillarSlug || primaryKeyword.toLowerCase().replace(/\s+/g, "-"),
        supportingSlugs: supportingSlugs || [],
        crossLinkSlugs: crossLinkSlugs || [],
        ramadanMode: !!ramadanMode,
        ramadanKeywords: ramadanKeywords || [],
      })
    : buildSEOContentEnginePrompt({
    primaryKeyword: primaryKeyword.trim(),
    secondaryKeywords: secondaryKeywords || [],
    pageType: pageType || "blog",
    region,
    funnelStage,
    cta,
  });

  let rawResponse: string;
  const geminiResult = await generateWithGemini(prompt);
  if (geminiResult) {
    rawResponse = geminiResult;
  } else {
    rawResponse = await generateWithOpenAI(prompt);
  }

  const parsed = parseSEOResponse(rawResponse, useFullGenerator);

  const slugBase = parsed.slug || parsed.title
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  let slug = slugBase.substring(0, 100);
  const { data: existing } = await supabase
    .from("articles")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) slug = `${slug}-${Date.now()}`;

  const { data: article, error: createError } = await supabase
    .from("articles")
    .insert({
      title: parsed.title,
      slug,
      content: parsed.content,
      excerpt: parsed.excerpt,
      meta_description: parsed.metaDescription,
      keywords: parsed.keywords.length > 0 ? parsed.keywords : null,
      author: "Karasu Emlak",
      status: "draft",
      category: pageType === "cornerstone"
        ? (primaryKeyword || "Rehber").replace(/\b\w/g, (c) => c.toUpperCase())
        : "Blog",
    })
    .select()
    .single();

  if (createError) {
    console.error("[SEO Engine] Article create error:", createError);
    throw createError;
  }

  const qualityCheck = checkContentQuality({
    title: parsed.title,
    content: parsed.content,
    excerpt: parsed.excerpt,
    meta_title: parsed.title,
    meta_description: parsed.metaDescription,
    slug,
  });

  await supabase
    .from("articles")
    .update({ seo_score: qualityCheck.score })
    .eq("id", article.id);

  await logAuditEvent({
    type: "content.created",
    user_id: "00000000-0000-0000-0000-000000000000",
    resource_type: "article",
    resource_id: article.id,
    metadata: {
      engine: "seo-content-engine",
      primaryKeyword,
      pageType,
      region,
    },
  });

  return createSuccessResponse(requestId, {
    contentId: article.id,
    articleId: article.id,
    article: {
      id: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status,
    },
    qualityScore: {
      score: qualityCheck.score,
      passed: qualityCheck.passed,
      issues: qualityCheck.issues,
    },
  });
}

export const POST = withErrorHandling(handlePost);
