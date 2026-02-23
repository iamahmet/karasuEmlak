#!/usr/bin/env tsx

/**
 * Batch Generate KarasuEmlak.net Content
 * 10 Cornerstones + 20 Blogs + Internal Linking
 *
 * Usage:
 *   pnpm tsx scripts/content/batch-generate-karasu-emlak-content.ts
 *   pnpm tsx scripts/content/batch-generate-karasu-emlak-content.ts --dry-run
 *   pnpm tsx scripts/content/batch-generate-karasu-emlak-content.ts --limit=5
 *   pnpm tsx scripts/content/batch-generate-karasu-emlak-content.ts --cornerstones-only
 *
 * Preserve GSC verification meta + GA measurement ID exactly as-is.
 */

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import { resolve } from "path";
import {
  CORNERSTONES,
  BLOGS,
  LINKING_MATRIX,
  type CornerstonePlan,
  type BlogPlan,
} from "./karasu-emlak-content-plan";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), "apps/admin/.env.local") });
dotenv.config({ path: resolve(process.cwd(), "apps/web/.env.local") });

const DRY_RUN = process.argv.includes("--dry-run");
const CORNERSTONES_ONLY = process.argv.includes("--cornerstones-only");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1] || "999", 10) : 999;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiKey = process.env.GEMINI_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!");
  process.exit(1);
}

if (!geminiKey && !openaiKey && !DRY_RUN) {
  console.error("❌ GEMINI_API_KEY veya OPENAI_API_KEY gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

const slugToId = new Map<string, string>();

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildInternalLinksContext(
  item: CornerstonePlan | BlogPlan,
  isCornerstone: boolean
): string {
  const links: string[] = [];
  if (isCornerstone) {
    const pillarLinks = LINKING_MATRIX.pillarToBlogs[item.id as keyof typeof LINKING_MATRIX.pillarToBlogs];
    if (pillarLinks) {
      pillarLinks.forEach((l) => {
        links.push(`<a href="/blog/${l.slug}">${l.anchor}</a>`);
      });
    }
  } else {
    const blog = item as BlogPlan;
    const cs = CORNERSTONES.find((c) => c.id === blog.supportsCornerstone);
    if (cs) {
      links.push(`<a href="/blog/${cs.slug}">${cs.h1}</a> (ana rehber)`);
    }
    const siblingSlugs = BLOGS.filter(
      (b) => b.supportsCornerstone === blog.supportsCornerstone && b.id !== blog.id
    )
      .slice(0, 2)
      .map((b) => ({ slug: b.slug, anchor: b.h1 }));
    siblingSlugs.forEach((s) => {
      links.push(`<a href="/blog/${s.slug}">${s.anchor}</a>`);
    });
  }
  return links.length > 0
    ? `\nİÇ LİNKLER (HTML olarak ekle, doğal cümlelerde):\n${links.join("\n")}`
    : "";
}

async function generateContent(
  item: CornerstonePlan | BlogPlan,
  isCornerstone: boolean
): Promise<{
  title: string;
  content: string;
  excerpt: string;
  meta_description: string;
  keywords: string[];
  faq?: Array<{ question: string; answer: string }>;
}> {
  const wordCount = isCornerstone ? 2500 : 1200;
  let region = "Karasu";
  if ("parentCategory" in item && item.parentCategory) {
    region = item.parentCategory;
  } else if ("supportsCornerstone" in item) {
    const cs = (item as BlogPlan).supportsCornerstone;
    region = ["CS01", "CS02", "CS03", "CS04"].includes(cs) ? "Sapanca" : ["CS09", "CS10"].includes(cs) ? "General" : "Karasu";
  }

  const internalLinksCtx = buildInternalLinksContext(item, isCornerstone);

  const prompt = `Sen KarasuEmlak.net için senior SEO stratejisti + emlak piyasası yazarısın. Odak: intent + UX + topical authority. Keyword stuffing YOK.

GÖREV: Aşağıdaki plana göre ${wordCount}+ kelimelik ${isCornerstone ? "CORNERSTONE" : "BLOG"} makale yaz.

BAŞLIK (H1): ${item.h1}
PRIMARY KEYWORD: ${item.primaryKeyword}
SECONDARY KEYWORDS: ${item.secondaryKeywords.join(", ")}
UNIQUE ANGLE: ${item.uniqueAngle}
BÖLGE: ${region}
${"mustAnswerQuestions" in item ? `MUTLAKA CEVAPLA: ${(item as CornerstonePlan).mustAnswerQuestions.join("; ")}` : ""}
${"microAnswerBlocks" in item ? `MİKRO CEVAP BLOKLARI EKLE: ${(item as CornerstonePlan).microAnswerBlocks.join("; ")}` : ""}
${"microAnswerBlock" in item ? `MİKRO CEVAP: ${(item as BlogPlan).microAnswerBlock}` : ""}
${"faqTopics" in item ? `FAQ KONULARI: ${(item as BlogPlan).faqTopics.join("; ")}` : ""}
${internalLinksCtx}

KURALLAR:
- Türkçe, doğal, insan gibi yaz. "Sonuç olarak", "Özetlemek gerekirse" KULLANMA.
- Fiyat/verim için aralık ver; "piyasa koşullarına göre değişir" ekle.
- HTML: <p>, <h2>, <h3>, <ul>, <li>, <table> kullan.
- 2-4 "Kısa Cevap:" bloğu ekle (snippet/AI Overviews için).
- FAQ bölümü: "Sık Sorulan Sorular" başlığı altında 3-6 soru-cevap.
- İç linkleri doğal cümlelerde kullan (yukarıdaki HTML formatında).

JSON formatında döndür (sadece JSON):
{
  "title": "SEO başlığı (55-60 karakter)",
  "content": "HTML içerik (tam makale)",
  "excerpt": "150-200 kelime özet",
  "meta_description": "145-160 karakter",
  "keywords": ["anahtar", "kelime", "listesi"],
  "faq": [{"question": "Soru", "answer": "Cevap"}]
}`;

  if (DRY_RUN) {
    return {
      title: item.h1,
      content: `<p>${item.uniqueAngle}</p>`,
      excerpt: item.uniqueAngle.substring(0, 200),
      meta_description: `KarasuEmlak.net - ${item.primaryKeyword}`,
      keywords: item.secondaryKeywords,
      faq: [],
    };
  }

  if (genAI) {
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: isCornerstone ? 8000 : 5000,
            responseMimeType: "application/json",
          },
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        let parsed: any;
        try {
          parsed = JSON.parse(text);
        } catch {
          const m = text.match(/\{[\s\S]*\}/);
          parsed = m ? JSON.parse(m[0]) : {};
        }
        return {
          title: parsed.title || item.h1,
          content: parsed.content || "",
          excerpt: parsed.excerpt || "",
          meta_description: parsed.meta_description || parsed.metaDescription || "",
          keywords: Array.isArray(parsed.keywords)
            ? parsed.keywords
            : typeof parsed.keywords === "string"
              ? parsed.keywords.split(",").map((k: string) => k.trim())
              : item.secondaryKeywords,
          faq: parsed.faq || [],
        };
      } catch (e) {
        console.warn(`   ⚠️  Gemini ${modelName} failed`);
        if (modelName === models[models.length - 1]) break;
      }
    }
  }

  if (!openai) throw new Error("Neither Gemini nor OpenAI available");
  const completion = await openai.chat.completions.create({
    model: isCornerstone ? "gpt-4o" : "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: isCornerstone ? 8000 : 5000,
    response_format: { type: "json_object" },
  });
  const text = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(text);
  return {
    title: parsed.title || item.h1,
    content: parsed.content || "",
    excerpt: parsed.excerpt || "",
    meta_description: parsed.meta_description || parsed.metaDescription || "",
    keywords: Array.isArray(parsed.keywords)
      ? parsed.keywords
      : typeof parsed.keywords === "string"
        ? parsed.keywords.split(",").map((k: string) => k.trim())
        : item.secondaryKeywords,
    faq: parsed.faq || [],
  };
}

async function ensureSlugUnique(slug: string): Promise<string> {
  const { data } = await supabase.from("articles").select("id").eq("slug", slug).maybeSingle();
  if (data) return `${slug}-${Date.now()}`;
  return slug;
}

async function createArticle(
  item: CornerstonePlan | BlogPlan,
  generated: {
    title: string;
    content: string;
    excerpt: string;
    meta_description: string;
    keywords: string[];
    faq?: Array<{ question: string; answer: string }>;
  },
  isCornerstone: boolean
): Promise<string> {
  const slug = await ensureSlugUnique(item.slug);

  if (DRY_RUN) {
    console.log(`   [DRY-RUN] Would create: /blog/${slug}`);
    slugToId.set(slug, `dry-${slug}`);
    return slug;
  }

  const { data, error } = await supabase
    .from("articles")
    .insert({
      title: generated.title,
      slug,
      content: generated.content,
      excerpt: generated.excerpt,
      meta_description: generated.meta_description,
      keywords: generated.keywords,
      author: "Karasu Emlak",
      status: "draft",
      category: isCornerstone
        ? ((item as CornerstonePlan).primaryKeyword || "Rehber").replace(/\b\w/g, (c) => c.toUpperCase())
        : "Blog",
      seo_score: 80,
    })
    .select("id")
    .single();

  if (error) throw error;
  if (data?.id) slugToId.set(slug, data.id);
  return slug;
}

async function main() {
  console.log("\n📋 KarasuEmlak.net Batch Content Generation");
  console.log("   10 Cornerstones + 20 Blogs + Internal Linking\n");
  if (DRY_RUN) console.log("   🔸 DRY RUN - no DB writes\n");
  if (CORNERSTONES_ONLY) console.log("   🔸 Cornerstones only\n");

  let created = 0;
  const toCreate = [
    ...CORNERSTONES.map((c) => ({ item: c, isCornerstone: true })),
    ...(CORNERSTONES_ONLY ? [] : BLOGS.map((b) => ({ item: b, isCornerstone: false }))),
  ].slice(0, LIMIT);

  for (let i = 0; i < toCreate.length; i++) {
    const { item, isCornerstone } = toCreate[i];
    const label = isCornerstone ? (item as CornerstonePlan).id : (item as BlogPlan).id;
    console.log(`\n[${i + 1}/${toCreate.length}] ${label} ${item.h1.substring(0, 50)}...`);

    try {
      console.log("   🤖 Generating...");
      const generated = await generateContent(item, isCornerstone);
      const slug = await createArticle(item, generated, isCornerstone);
      created++;
      console.log(`   ✅ /blog/${slug}`);
    } catch (e: any) {
      console.error(`   ❌ ${e.message}`);
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\n📊 Done. Created: ${created}/${toCreate.length}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
