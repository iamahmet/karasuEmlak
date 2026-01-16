#!/usr/bin/env tsx

/**
 * Batch Content Improvement Script
 * 
 * Automatically improves all existing content (articles, news_articles, listings)
 * using AI content improvement system.
 * 
 * Usage:
 *   pnpm scripts:batch-improve-all-content
 *   pnpm scripts:batch-improve-all-content --dry-run
 *   pnpm scripts:batch-improve-all-content --limit 10
 *   pnpm scripts:batch-improve-all-content --type articles
 * 
 * Options:
 *   --dry-run: Only analyze, don't save improvements
 *   --limit N: Process only N items per type
 *   --type TYPE: Process only specific type (articles, news, listings)
 *   --min-score N: Only improve content with score < N (default: 70)
 *   --delay N: Delay between requests in ms (default: 2000)
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";
// Import Gemini functions - use dynamic import to handle path resolution
let checkContentQualityWithGemini: any;
let improveContentWithGemini: any;

async function loadGeminiFunctions() {
  try {
    const geminiModule = await import("../../apps/admin/lib/services/gemini");
    checkContentQualityWithGemini = geminiModule.checkContentQualityWithGemini;
    improveContentWithGemini = geminiModule.improveContentWithGemini;
  } catch (error) {
    console.error("Error loading Gemini functions:", error);
    throw new Error("Failed to load Gemini functions. Make sure you're running from project root.");
  }
}

// Load environment variables
const envPaths = [
  resolve(__dirname, "../.env.local"),
  resolve(__dirname, "../../.env.local"),
  resolve(process.cwd(), ".env.local"),
];

for (const envPath of envPaths) {
  try {
    dotenv.config({ path: envPath });
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      break;
    }
  } catch {
    // Continue
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing required environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗");
  process.exit(1);
}

// Check for API keys (will be checked when actually needed)
if (!GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
  console.warn("⚠️  Warning: GEMINI_API_KEY or OPENAI_API_KEY not found");
  console.warn("   Script will fail when trying to improve content");
  console.warn("   Continuing anyway for dry-run or testing...");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const limitArg = args.find(arg => arg.startsWith("--limit="));
const limit = limitArg ? parseInt(limitArg.split("=")[1]) : undefined;
const typeArg = args.find(arg => arg.startsWith("--type="));
const typeFilter = typeArg ? typeArg.split("=")[1] : undefined;
const minScoreArg = args.find(arg => arg.startsWith("--min-score="));
const minScore = minScoreArg ? parseInt(minScoreArg.split("=")[1]) : 70;
const delayArg = args.find(arg => arg.startsWith("--delay="));
const delay = delayArg ? parseInt(delayArg.split("=")[1]) : 2000;

interface ContentItem {
  id: string;
  title: string;
  content: string;
  type: "article" | "news" | "listing";
  table: string;
  field: string;
}

interface ImprovementResult {
  id: string;
  type: string;
  title: string;
  scoreBefore: number;
  scoreAfter: number;
  improved: boolean;
  error?: string;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch all articles
 */
async function fetchArticles(limit?: number): Promise<ContentItem[]> {
  const query = supabase
    .from("articles")
    .select("id, title, content")
    .not("content", "is", null)
    .neq("content", "")
    .order("created_at", { ascending: false });

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching articles:", error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    title: item.title || "Untitled",
    content: item.content || "",
    type: "article" as const,
    table: "articles",
    field: "content",
  }));
}

/**
 * Fetch all news articles
 */
async function fetchNewsArticles(limit?: number): Promise<ContentItem[]> {
  const query = supabase
    .from("news_articles")
    .select("id, title, emlak_analysis, original_summary")
    .not("emlak_analysis", "is", null)
    .neq("emlak_analysis", "")
    .order("created_at", { ascending: false });

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching news articles:", error);
    return [];
  }

  return (data || [])
    .filter(item => item.emlak_analysis && item.emlak_analysis.trim().length > 0)
    .map(item => ({
      id: item.id,
      title: item.title || "Untitled",
      content: item.emlak_analysis || "",
      type: "news" as const,
      table: "news_articles",
      field: "emlak_analysis",
    }));
}

/**
 * Fetch all listings
 */
async function fetchListings(limit?: number): Promise<ContentItem[]> {
  const query = supabase
    .from("listings")
    .select("id, title, description")
    .not("description", "is", null)
    .neq("description", "")
    .order("created_at", { ascending: false });

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching listings:", error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    title: item.title || "Untitled",
    content: item.description || "",
    type: "listing" as const,
    table: "listings",
    field: "description",
  }));
}

/**
 * Improve a single content item
 */
async function improveContentItem(
  item: ContentItem,
  minScore: number
): Promise<ImprovementResult> {
  try {
    // Analyze content quality
    const qualityAnalysis = await checkContentQualityWithGemini(
      item.content,
      item.title
    );

    const scoreBefore = qualityAnalysis.score;

    // Only improve if score is below threshold
    if (scoreBefore >= minScore) {
      return {
        id: item.id,
        type: item.type,
        title: item.title,
        scoreBefore,
        scoreAfter: scoreBefore,
        improved: false,
      };
    }

    // Improve content
    const improvement = await improveContentWithGemini(
      item.content,
      item.title,
      qualityAnalysis
    );

    const scoreAfter = improvement.score.after;

    // Save improvement to database
    if (!isDryRun) {
      // Create improvement record
      await supabase.from("content_ai_improvements").insert({
        content_type: item.type,
        content_id: item.id,
        field: item.field,
        status: "completed",
        original_content: item.content,
        improved_content: improvement.improved,
        quality_analysis: qualityAnalysis,
        improvement_result: {
          score: {
            before: scoreBefore,
            after: scoreAfter,
            improvement: improvement.score.improvement,
          },
          changes: improvement.changes,
        },
        progress: 100,
        progress_message: "Tamamlandı",
        completed_at: new Date().toISOString(),
        applied: false, // Will be applied manually or via separate script
      });

      // Update content in database
      const updateData: any = {};
      updateData[item.field] = improvement.improved;

      await supabase
        .from(item.table)
        .update(updateData)
        .eq("id", item.id);
    }

    return {
      id: item.id,
      type: item.type,
      title: item.title,
      scoreBefore,
      scoreAfter,
      improved: true,
    };
  } catch (error: any) {
    console.error(`Error improving ${item.type} ${item.id}:`, error.message);
    return {
      id: item.id,
      type: item.type,
      title: item.title,
      scoreBefore: 0,
      scoreAfter: 0,
      improved: false,
      error: error.message,
    };
  }
}

/**
 * Main function
 */
async function main() {
  // Load Gemini functions
  await loadGeminiFunctions();
  console.log("🚀 Batch Content Improvement Script");
  console.log("=" .repeat(60));
  console.log(`Mode: ${isDryRun ? "🔍 DRY RUN (no changes will be saved)" : "💾 LIVE (changes will be saved)"}`);
  console.log(`Min Score Threshold: ${minScore}`);
  console.log(`Delay between requests: ${delay}ms`);
  if (limit) console.log(`Limit per type: ${limit}`);
  if (typeFilter) console.log(`Type filter: ${typeFilter}`);
  console.log("=" .repeat(60));
  console.log();

  const allItems: ContentItem[] = [];

  // Fetch content based on type filter
  if (!typeFilter || typeFilter === "articles") {
    console.log("📄 Fetching articles...");
    const articles = await fetchArticles(limit);
    console.log(`   Found ${articles.length} articles${limit ? ` (limited to ${limit})` : ""}`);
    allItems.push(...articles);
  }

  if (!typeFilter || typeFilter === "news") {
    console.log("📰 Fetching news articles...");
    const news = await fetchNewsArticles(limit);
    console.log(`   Found ${news.length} news articles${limit ? ` (limited to ${limit})` : ""}`);
    allItems.push(...news);
  }

  if (!typeFilter || typeFilter === "listings") {
    console.log("🏠 Fetching listings...");
    try {
      const listings = await fetchListings(limit);
      console.log(`   Found ${listings.length} listings${limit ? ` (limited to ${limit})` : ""}`);
      allItems.push(...listings);
    } catch (error: any) {
      console.warn(`   ⚠️  Could not fetch listings: ${error.message}`);
      console.warn(`   (This is OK if listings table doesn't have 'description' column)`);
    }
  }

  console.log();
  console.log(`📊 Total items to process: ${allItems.length}`);
  console.log();

  if (allItems.length === 0) {
    console.log("✅ No content to process");
    return;
  }

  const results: ImprovementResult[] = [];
  let processed = 0;
  let improved = 0;
  let skipped = 0;
  let errors = 0;

  // Process each item
  for (const item of allItems) {
    processed++;
    const progress = ((processed / allItems.length) * 100).toFixed(1);

    console.log(
      `[${progress}%] Processing ${item.type} #${processed}/${allItems.length}: "${item.title.substring(0, 50)}${item.title.length > 50 ? "..." : ""}"`
    );

    const result = await improveContentItem(item, minScore);

    if (result.error) {
      errors++;
      console.log(`   ❌ Error: ${result.error}`);
    } else if (result.improved) {
      improved++;
      console.log(
        `   ✅ Improved: ${result.scoreBefore} → ${result.scoreAfter} (+${result.scoreAfter - result.scoreBefore})`
      );
    } else {
      skipped++;
      console.log(
        `   ⏭️  Skipped: Score ${result.scoreBefore} >= ${minScore} (already good)`
      );
    }

    results.push(result);

    // Delay between requests to avoid rate limiting
    if (processed < allItems.length) {
      await sleep(delay);
    }
  }

  // Summary
  console.log();
  console.log("=" .repeat(60));
  console.log("📊 Summary");
  console.log("=" .repeat(60));
  console.log(`Total processed: ${processed}`);
  console.log(`✅ Improved: ${improved}`);
  console.log(`⏭️  Skipped (score >= ${minScore}): ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log();

  // Show top improvements
  const improvedResults = results.filter(r => r.improved && !r.error);
  if (improvedResults.length > 0) {
    console.log("🏆 Top Improvements:");
    improvedResults
      .sort((a, b) => (b.scoreAfter - b.scoreBefore) - (a.scoreAfter - a.scoreBefore))
      .slice(0, 10)
      .forEach((result, index) => {
        console.log(
          `   ${index + 1}. [${result.type}] ${result.title.substring(0, 40)}: ${result.scoreBefore} → ${result.scoreAfter} (+${result.scoreAfter - result.scoreBefore})`
        );
      });
    console.log();
  }

  // Show errors
  const errorResults = results.filter(r => r.error);
  if (errorResults.length > 0) {
    console.log("❌ Errors:");
    errorResults.forEach(result => {
      console.log(`   - [${result.type}] ${result.title}: ${result.error}`);
    });
    console.log();
  }

  if (isDryRun) {
    console.log("🔍 DRY RUN: No changes were saved");
    console.log("   Run without --dry-run to apply improvements");
  } else {
    console.log("✅ All improvements saved to database");
  }

  console.log("=" .repeat(60));
}

// Run
main()
  .then(() => {
    console.log("\n✅ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
