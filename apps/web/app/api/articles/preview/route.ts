import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";
import { safeJsonParse } from "@/lib/utils/safeJsonParse";

/**
 * Preview Token API
 * Generates secure preview tokens for draft articles
 */

const PREVIEW_SECRET = process.env.PREVIEW_SECRET || "change-me-in-production";
const PREVIEW_TOKEN_EXPIRY = 60 * 60 * 24; // 24 hours

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleId, slug } = body;

    if (!articleId && !slug) {
      return NextResponse.json(
        { error: "Article ID or slug is required" },
        { status: 400 }
      );
    }

    // Use service role in development to bypass RLS
    let supabase;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (process.env.NODE_ENV === "development" && serviceRoleKey && supabaseUrl) {
      try {
        const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
        supabase = createSupabaseClient(supabaseUrl, serviceRoleKey);
      } catch (error) {
        console.error("Failed to create service role client:", error);
        supabase = await createClient();
      }
    } else {
      supabase = await createClient();
    }

    // Find article
    let article;
    if (articleId) {
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, status")
        .eq("id", articleId)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 });
      }
      article = data;
    } else {
      const { data, error } = await supabase
        .from("articles")
        .select("id, slug, status")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 });
      }
      article = data;
    }

    // Generate preview token
    const expiresAt = Math.floor(Date.now() / 1000) + PREVIEW_TOKEN_EXPIRY;
    const payload = {
      articleId: article.id,
      slug: article.slug,
      expiresAt,
    };

    const token = generatePreviewToken(payload);

    return NextResponse.json({
      success: true,
      token,
      previewUrl: `/preview/${article.slug}?token=${token}`,
      expiresAt,
    });
  } catch (error: any) {
    console.error("Preview token generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate preview token" },
      { status: 500 }
    );
  }
}

/**
 * Generate a secure preview token
 */
function generatePreviewToken(payload: {
  articleId: string;
  slug: string;
  expiresAt: number;
}): string {
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac("sha256", PREVIEW_SECRET);
  hmac.update(data);
  const signature = hmac.digest("hex");
  
  const tokenData = {
    ...payload,
    signature,
  };

  return Buffer.from(JSON.stringify(tokenData)).toString("base64url");
}

/**
 * Verify a preview token
 */
export function verifyPreviewToken(token: string): {
  valid: boolean;
  payload?: { articleId: string; slug: string; expiresAt: number };
  error?: string;
} {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const PARSE_FAILED = "__SAFE_JSON_PARSE_FAILED__";
    const tokenData = safeJsonParse(decoded, PARSE_FAILED as any, {
      context: "articles.preview.token",
      dedupeKey: "articles.preview.token",
    });
    if (tokenData === PARSE_FAILED) {
      return { valid: false, error: "Invalid token payload" };
    }

    // Check expiry
    if (tokenData.expiresAt < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: "Token expired" };
    }

    // Verify signature
    const { signature, ...payload } = tokenData;
    const data = JSON.stringify(payload);
    const hmac = crypto.createHmac("sha256", PREVIEW_SECRET);
    hmac.update(data);
    const expectedSignature = hmac.digest("hex");

    if (signature !== expectedSignature) {
      return { valid: false, error: "Invalid token signature" };
    }

    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: "Invalid token format" };
  }
}

