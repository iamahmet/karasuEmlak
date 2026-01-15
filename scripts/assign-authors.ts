#!/usr/bin/env tsx

/**
 * Assign Authors to Articles
 * 
 * Rule-based mapping ile yazıları yazarlara dağıtır.
 * 
 * Mapping rules:
 * - "kira getirisi / yatırım / fiyat analizi" → yatırım analisti
 * - "sapanca bungalov / günlük kiralık" → sapanca uzmanı
 * - "tapu / iskan / imar / süreç" → hukuk/tapu persona
 * - "Karasu satılık daire / mahalle rehberi" → karasu danışmanı
 * - "Kocaali / bölge rehberi" → kocaali danışmanı
 * - "genel blog / rehber / yeme içme / yaşam" → editör
 * 
 * Fallback: round-robin
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Author slug mapping
const AUTHOR_MAPPING: Record<string, string> = {
  "mehmet-yilmaz": "Karasu danışmanı",
  "ayse-demir": "Kocaali danışmanı",
  "can-ozkan": "Yatırım analisti",
  "zeynep-kaya": "Editör",
  "burak-sahin": "Sapanca uzmanı",
  "elif-arslan": "Hukuk/tapu",
};

// Rule-based mapping function
function assignAuthorByContent(article: any, authors: any[]): string | null {
  const title = (article.title || "").toLowerCase();
  const content = (article.content || "").toLowerCase();
  const keywords = (article.keywords || []).join(" ").toLowerCase();
  const category = (article.category || "").toLowerCase();
  const excerpt = (article.excerpt || "").toLowerCase();

  const fullText = `${title} ${content} ${keywords} ${category} ${excerpt}`;

  // Yatırım analisti
  if (
    fullText.includes("yatırım") ||
    fullText.includes("kira getirisi") ||
    fullText.includes("fiyat analizi") ||
    fullText.includes("getiri") ||
    fullText.includes("yatırım potansiyeli")
  ) {
    return authors.find((a) => a.slug === "can-ozkan")?.id || null;
  }

  // Sapanca uzmanı
  if (
    fullText.includes("sapanca") &&
    (fullText.includes("bungalov") ||
      fullText.includes("günlük kiralık") ||
      fullText.includes("göl") ||
      fullText.includes("sapanca"))
  ) {
    return authors.find((a) => a.slug === "burak-sahin")?.id || null;
  }

  // Hukuk/tapu
  if (
    fullText.includes("tapu") ||
    fullText.includes("imar") ||
    fullText.includes("iskan") ||
    fullText.includes("ruhsat") ||
    fullText.includes("yasal süreç") ||
    fullText.includes("hukuk")
  ) {
    return authors.find((a) => a.slug === "elif-arslan")?.id || null;
  }

  // Karasu danışmanı
  if (
    (fullText.includes("karasu") &&
      (fullText.includes("satılık daire") ||
        fullText.includes("mahalle") ||
        fullText.includes("bölge rehberi"))) ||
    (fullText.includes("karasu") && !fullText.includes("kocaali") && !fullText.includes("sapanca"))
  ) {
    return authors.find((a) => a.slug === "mehmet-yilmaz")?.id || null;
  }

  // Kocaali danışmanı
  if (
    fullText.includes("kocaali") ||
    (fullText.includes("kocaali") && fullText.includes("bölge"))
  ) {
    return authors.find((a) => a.slug === "ayse-demir")?.id || null;
  }

  // Editör (genel blog, rehber, yaşam)
  if (
    fullText.includes("rehber") ||
    fullText.includes("gezilecek yerler") ||
    fullText.includes("yaşam") ||
    fullText.includes("yeme içme") ||
    category === "blog"
  ) {
    return authors.find((a) => a.slug === "zeynep-kaya")?.id || null;
  }

  return null;
}

async function assignAuthors(dryRun: boolean = false) {
  console.log(`🚀 Yazar atama işlemi başlatılıyor... (${dryRun ? "DRY RUN" : "APPLY"})\n`);

  // Get all active authors
  const { data: authors, error: authorsError } = await supabase
    .from("authors")
    .select("id, slug, full_name")
    .eq("is_active", true);

  if (authorsError || !authors) {
    console.error("❌ Yazarlar alınamadı:", authorsError);
    process.exit(1);
  }

  console.log(`📝 ${authors.length} aktif yazar bulundu\n`);

  // Get all articles without authors
  const { data: articles, error: articlesError } = await supabase
    .from("articles")
    .select("id, title, content, keywords, category, excerpt, primary_author_id")
    .is("primary_author_id", null)
    .limit(1000);

  if (articlesError) {
    console.error("❌ Yazılar alınamadı:", articlesError);
    process.exit(1);
  }

  console.log(`📄 ${articles?.length || 0} yazarsız yazı bulundu\n`);

  if (!articles || articles.length === 0) {
    console.log("✅ Tüm yazıların yazarı var!\n");
    return;
  }

  let assigned = 0;
  let errors = 0;
  const roundRobinIndex = { current: 0 };

  for (const article of articles) {
    try {
      // Try rule-based assignment
      let authorId = assignAuthorByContent(article, authors);

      // Fallback to round-robin
      if (!authorId) {
        authorId = authors[roundRobinIndex.current % authors.length].id;
        roundRobinIndex.current++;
      }

      const author = authors.find((a) => a.id === authorId);

      if (dryRun) {
        console.log(`📝 [DRY RUN] "${article.title}" → ${author?.full_name}`);
        assigned++;
      } else {
        // Insert into article_authors
        const { error: insertError } = await supabase
          .from("article_authors")
          .insert({
            article_id: article.id,
            author_id: authorId,
            role: "author",
          });

        if (insertError) {
          // If already exists, skip
          if (insertError.code === "23505") {
            console.log(`⏭️  Zaten atanmış: "${article.title}"`);
            continue;
          }
          throw insertError;
        }

        // Update primary_author_id (trigger will handle this, but we can also do it manually)
        const { error: updateError } = await supabase
          .from("articles")
          .update({ primary_author_id: authorId })
          .eq("id", article.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`✅ Atandı: "${article.title}" → ${author?.full_name}`);
        assigned++;
      }

      // Small delay
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error: any) {
      console.error(`❌ Hata (${article.title}):`, error.message);
      errors++;
    }
  }

  console.log(`\n📊 Özet:`);
  console.log(`   ✅ Atanan: ${assigned}`);
  console.log(`   ❌ Hata: ${errors}`);
  console.log(`   📁 Toplam: ${articles.length}\n`);

  if (assigned > 0 && !dryRun) {
    console.log("✨ Yazar atama işlemi tamamlandı!\n");
  }
}

// Parse command line args
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run") || args.includes("-d");

// Run
assignAuthors(dryRun)
  .then(() => {
    console.log("✅ Script tamamlandı.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
