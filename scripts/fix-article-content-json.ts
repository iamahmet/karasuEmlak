/**
 * Fix articles whose content was accidentally stored as raw AI JSON response.
 * Uses raw fetch + safe JSON parse to handle malformed PostgREST responses.
 *
 * Run: pnpm exec tsx scripts/fix-article-content-json.ts [slug]
 *
 * If slug is omitted, processes all articles that have content starting with '{'.
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), 'apps/admin/.env.local') });
dotenv.config({ path: resolve(process.cwd(), 'apps/web/.env.local') });

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)?.replace(/\/$/, '');
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

function safeParseJSON<T>(value: string, fallback: T): T {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return fallback;
  }
  const trimmed = value.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // Try truncating at last valid } or ] (handles "Unexpected non-whitespace after JSON")
    const lastBrace = trimmed.lastIndexOf('}');
    const lastBracket = trimmed.lastIndexOf(']');
    const lastValid = Math.max(lastBrace, lastBracket);
    if (lastValid > 0) {
      try {
        return JSON.parse(trimmed.substring(0, lastValid + 1)) as T;
      } catch {
        // fall through
      }
    }
  }
  return fallback;
}

async function fetchArticleRaw(slug: string): Promise<{ id: string; slug: string; content: string } | null> {
  const url = `${supabaseUrl}/rest/v1/articles?slug=eq.${encodeURIComponent(slug)}&select=id,slug,content`;
  const res = await fetch(url, {
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
    },
  });
  const text = await res.text();
  const parsed = safeParseJSON<Array<{ id: string; slug: string; content: string }>>(text, []);
  const arr = Array.isArray(parsed) ? parsed : [];
  return arr.length > 0 ? arr[0] : null;
}

async function fetchArticlesWithJsonContent(): Promise<Array<{ id: string; slug: string; content: string }>> {
  // PostgREST: like.{% = content starts with {
  const url = `${supabaseUrl}/rest/v1/articles?content=like.%7B%25&select=id,slug,content`;
  const res = await fetch(url, {
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
    },
  });
  const text = await res.text();
  const parsed = safeParseJSON<Array<{ id: string; slug: string; content: string }>>(text, []);
  return Array.isArray(parsed) ? parsed : [];
}

async function updateArticleContent(id: string, content: string): Promise<boolean> {
  const url = `${supabaseUrl}/rest/v1/articles?id=eq.${id}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ content, updated_at: new Date().toISOString() }),
  });
  return res.ok;
}

async function fixArticleContent(article: { id: string; slug: string; content: string }): Promise<boolean> {
  const content = article.content?.trim();
  if (!content || !content.startsWith('{') || !content.includes('"content"')) {
    return false;
  }

  const parsed = safeParseJSON<{ content?: string }>(content, null);
  if (!parsed || typeof parsed.content !== 'string' || parsed.content.trim().length < 50) {
    return false;
  }

  const htmlContent = parsed.content.trim();
  const ok = await updateArticleContent(article.id, htmlContent);

  if (ok) {
    console.log(`  ✅ Fixed: ${article.slug} (extracted ${htmlContent.length} chars HTML)`);
  } else {
    console.error(`  ❌ Update failed for ${article.slug}`);
  }
  return ok;
}

async function main() {
  const slugArg = process.argv[2];

  if (slugArg) {
    console.log(`\n📝 Fetching article: ${slugArg}`);
    const article = await fetchArticleRaw(slugArg);
    if (!article) {
      console.log('Article not found.');
      process.exit(0);
    }
    await fixArticleContent(article);
    process.exit(0);
  }

  console.log('\n📋 Fetching articles with JSON-like content...');
  const articles = await fetchArticlesWithJsonContent();

  if (articles.length === 0) {
    console.log('No articles with JSON-like content found.');
    process.exit(0);
  }

  console.log(`Found ${articles.length} article(s).`);
  let fixed = 0;
  for (const article of articles) {
    if (await fixArticleContent(article)) {
      fixed++;
    }
  }
  console.log(`\n✅ Fixed ${fixed} of ${articles.length} articles.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
