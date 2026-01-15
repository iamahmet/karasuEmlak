#!/usr/bin/env tsx

/**
 * Assign Authors to Articles - Direct SQL
 * Bypasses PostgREST cache issues
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

// Author mapping rules
function getAuthorSlugByContent(article: any): string | null {
  const title = (article.title || "").toLowerCase();
  const content = (article.content || "").toLowerCase();
  const keywords = (article.keywords || []).join(" ").toLowerCase();
  const category = (article.category || "").toLowerCase();
  const excerpt = (article.excerpt || "").toLowerCase();

  const fullText = `${title} ${content} ${keywords} ${category} ${excerpt}`;

  if (fullText.includes("yatırım") || fullText.includes("kira getirisi") || fullText.includes("fiyat analizi")) {
    return "can-ozkan";
  }
  if (fullText.includes("sapanca") && (fullText.includes("bungalov") || fullText.includes("günlük kiralık"))) {
    return "burak-sahin";
  }
  if (fullText.includes("tapu") || fullText.includes("imar") || fullText.includes("iskan") || fullText.includes("ruhsat")) {
    return "elif-arslan";
  }
  if (fullText.includes("karasu") && !fullText.includes("kocaali") && !fullText.includes("sapanca")) {
    return "mehmet-yilmaz";
  }
  if (fullText.includes("kocaali")) {
    return "ayse-demir";
  }
  if (fullText.includes("rehber") || fullText.includes("gezilecek yerler") || fullText.includes("yaşam")) {
    return "zeynep-kaya";
  }

  return null;
}

async function assignAuthorsDirectSQL() {
  console.log("🚀 Yazar atama işlemi başlatılıyor (Direct SQL)...\n");

  // Get authors using direct SQL
  const { data: authorsData, error: authorsError } = await supabase
    .rpc('exec_sql', { query: 'SELECT id, slug, full_name FROM public.authors WHERE is_active = true ORDER BY full_name;' })
    .single();

  // Fallback: use service role query
  let authors: any[] = [];
  try {
    const { data, error } = await supabase
      .from("authors")
      .select("id, slug, full_name")
      .eq("is_active", true)
      .order("full_name");

    if (!error && data) {
      authors = data;
    }
  } catch (e: any) {
    console.warn("⚠️  Supabase client ile yazarlar alınamadı, direkt SQL denenecek...");
  }

  if (authors.length === 0) {
    console.error("❌ Yazarlar alınamadı!");
    process.exit(1);
  }

  console.log(`📝 ${authors.length} aktif yazar bulundu\n`);

  // Get articles without authors using direct SQL
  const { data: articlesData } = await supabase
    .from("articles")
    .select("id, title, content, keywords, category, excerpt, slug")
    .is("primary_author_id", null)
    .limit(1000);

  const articles = articlesData || [];
  console.log(`📄 ${articles.length} yazarsız yazı bulundu\n`);

  if (articles.length === 0) {
    console.log("✅ Tüm yazıların yazarı var!\n");
    return;
  }

  let assigned = 0;
  let errors = 0;
  const roundRobinIndex = { current: 0 };

  for (const article of articles) {
    try {
      let authorSlug = getAuthorSlugByContent(article);
      let author = authors.find((a) => a.slug === authorSlug);

      if (!author) {
        author = authors[roundRobinIndex.current % authors.length];
        roundRobinIndex.current++;
      }

      // Insert using direct SQL
      const insertSQL = `
        INSERT INTO public.article_authors (article_id, author_id, role)
        VALUES ('${article.id}', '${author.id}', 'author')
        ON CONFLICT (article_id, author_id, role) DO NOTHING
        RETURNING id;
      `;

      try {
        await supabase.rpc('exec_sql', { query: insertSQL });
      } catch (e) {
        // Fallback: use Supabase client
        await supabase
          .from("article_authors")
          .insert({
            article_id: article.id,
            author_id: author.id,
            role: "author",
          });
      }

      // Update primary_author_id
      await supabase
        .from("articles")
        .update({ primary_author_id: author.id })
        .eq("id", article.id);

      console.log(`✅ Atandı: "${article.title.substring(0, 50)}..." → ${author.full_name}`);
      assigned++;

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error: any) {
      console.error(`❌ Hata (${article.title?.substring(0, 30)}):`, error.message);
      errors++;
    }
  }

  console.log(`\n📊 Özet:`);
  console.log(`   ✅ Atanan: ${assigned}`);
  console.log(`   ❌ Hata: ${errors}`);
  console.log(`   📁 Toplam: ${articles.length}\n`);

  if (assigned > 0) {
    console.log("✨ Yazar atama işlemi tamamlandı!\n");
  }
}

assignAuthorsDirectSQL()
  .then(() => {
    console.log("✅ Script tamamlandı.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
