#!/usr/bin/env tsx

/**
 * Fix Article Slugs Script
 * 
 * Bu script tüm makalelerin slug'larını kontrol eder ve yanlış olanları düzeltir.
 * 
 * Yanlış slug kriterleri:
 * - Türkçe karakterler içeriyorsa (ğ, ü, ş, ı, ö, ç)
 * - Özel karakterler içeriyorsa (sadece a-z, 0-9, - olmalı)
 * - Boşluklar içeriyorsa
 * - Başında/sonunda tire var ama title'dan oluşturulmamışsa
 * - Title ile uyumsuzsa
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate slug from title (same as form-validators.ts)
 */
function generateSlug(title: string, maxLength: number = 100): string {
  let slug = title
    .toLowerCase()
    .trim()
    // Turkish character replacements
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/İ/g, 'i')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  // If slug is longer than maxLength, truncate at word boundary
  if (slug.length > maxLength) {
    const truncated = slug.substring(0, maxLength);
    const lastHyphen = truncated.lastIndexOf('-');
    // If we found a hyphen and it's not too close to the start, use it
    if (lastHyphen > maxLength * 0.5) {
      slug = truncated.substring(0, lastHyphen);
    } else {
      // Otherwise, just truncate and remove trailing hyphen
      slug = truncated.replace(/-+$/, '');
    }
  }

  // Final cleanup
  return slug.replace(/^-+|-+$/g, '');
}

/**
 * Check if slug is valid
 */
function isValidSlug(slug: string): boolean {
  // Check for Turkish characters
  if (/[ğüşıöçĞÜŞİÖÇ]/.test(slug)) {
    return false;
  }

  // Check for invalid characters (only a-z, 0-9, - allowed)
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return false;
  }

  // Check for spaces
  if (/\s/.test(slug)) {
    return false;
  }

  // Check for leading/trailing hyphens
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return false;
  }

  // Check for multiple consecutive hyphens
  if (/-{2,}/.test(slug)) {
    return false;
  }

  return true;
}

/**
 * Check if slug matches title (allowing for minor variations)
 */
function slugMatchesTitle(slug: string, title: string): boolean {
  const expectedSlug = generateSlug(title);
  // Allow for minor variations (e.g., timestamp suffixes)
  return slug === expectedSlug || slug.startsWith(expectedSlug + '-');
}

async function fixArticleSlugs() {
  console.log("🔍 Makale slug'ları kontrol ediliyor...\n");

  try {
    // Fetch all articles
    const { data: articles, error } = await supabase
      .from("articles")
      .select("id, title, slug")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    if (!articles || articles.length === 0) {
      console.log("✅ Hiç makale bulunamadı.");
      return;
    }

    console.log(`📊 Toplam ${articles.length} makale bulundu.\n`);

    const issues: Array<{
      id: string;
      title: string;
      oldSlug: string;
      newSlug: string;
      reason: string;
    }> = [];

    // Check each article
    for (const article of articles) {
      const { id, title, slug } = article;

      if (!slug || !title) {
        continue;
      }

      let needsFix = false;
      let reason = "";

      // Check if slug is valid
      if (!isValidSlug(slug)) {
        needsFix = true;
        reason = "Geçersiz karakterler içeriyor";
      }

      // Check if slug matches title (allowing for minor variations)
      const expectedSlug = generateSlug(title);
      if (slug !== expectedSlug && !slug.startsWith(expectedSlug + '-')) {
        // Check if the difference is significant (not just timestamp)
        const slugWithoutTimestamp = slug.replace(/-\d+$/, '');
        if (slugWithoutTimestamp !== expectedSlug) {
          needsFix = true;
          reason = reason || "Title ile uyumsuz";
        }
      }

      if (needsFix) {
        const newSlug = generateSlug(title);
        
        // Check if new slug already exists (different article)
        const { data: existing } = await supabase
          .from("articles")
          .select("id")
          .eq("slug", newSlug)
          .neq("id", id)
          .maybeSingle();

        let finalSlug = newSlug;
        if (existing) {
          // Append timestamp if slug exists
          finalSlug = `${newSlug}-${Date.now()}`;
          reason += " (slug çakışması, timestamp eklendi)";
        }

        issues.push({
          id,
          title,
          oldSlug: slug,
          newSlug: finalSlug,
          reason,
        });
      }
    }

    if (issues.length === 0) {
      console.log("✅ Tüm slug'lar doğru! Düzeltme gerekmiyor.\n");
      return;
    }

    console.log(`⚠️  ${issues.length} makalede sorun bulundu:\n`);

    // Show issues
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.title}`);
      console.log(`   Eski: ${issue.oldSlug}`);
      console.log(`   Yeni: ${issue.newSlug}`);
      console.log(`   Sebep: ${issue.reason}\n`);
    });

    // Auto-confirm for automated runs
    console.log(`\n📝 ${issues.length} makale düzeltilecek. Düzeltmeler uygulanıyor...\n`);

    // Fix issues
    let fixed = 0;
    let errors = 0;

    for (const issue of issues) {
      try {
        const { error: updateError } = await supabase
          .from("articles")
          .update({ slug: issue.newSlug })
          .eq("id", issue.id);

        if (updateError) {
          console.error(`❌ ${issue.title} düzeltilemedi:`, updateError.message);
          errors++;
        } else {
          console.log(`✅ ${issue.title} düzeltildi: ${issue.oldSlug} → ${issue.newSlug}`);
          fixed++;
        }
      } catch (error: any) {
        console.error(`❌ ${issue.title} düzeltilemedi:`, error.message);
        errors++;
      }
    }

    console.log(`\n📊 Özet:`);
    console.log(`   ✅ Düzeltilen: ${fixed}`);
    console.log(`   ❌ Hata: ${errors}`);
    console.log(`   📝 Toplam: ${issues.length}\n`);

    if (fixed > 0) {
      console.log("✨ Slug düzeltmeleri tamamlandı!\n");
    }
  } catch (error: any) {
    console.error("❌ Hata:", error.message);
    process.exit(1);
  }
}

// Run the script
fixArticleSlugs()
  .then(() => {
    console.log("✅ Script tamamlandı.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
