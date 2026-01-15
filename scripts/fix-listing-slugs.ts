#!/usr/bin/env tsx

/**
 * Fix Listing Slugs Script
 * 
 * Bu script tüm ilanların slug'larını kontrol eder ve yanlış olanları düzeltir.
 * 
 * Yanlış slug kriterleri:
 * - Türkçe karakterler içeriyorsa (ğ, ü, ş, ı, ö, ç)
 * - Özel karakterler içeriyorsa (sadece a-z, 0-9, - olmalı)
 * - Boşluklar içeriyorsa
 * - Başında/sonunda tire var
 * - Manasız karakter kombinasyonları içeriyorsa (örn: "deni-ze", "i-syeri")
 * - Gereksiz timestamp veya hash içeriyorsa
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
 * Generate slug from title (improved version)
 */
function generateSlug(title: string, maxLength: number = 100): string {
  // First, normalize Turkish characters BEFORE splitting
  let normalized = title
    .toLowerCase()
    .trim()
    // Turkish character replacements (do this first!)
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/Ğ/g, "g")
    .replace(/Ü/g, "u")
    .replace(/Ş/g, "s")
    .replace(/İ/g, "i")
    .replace(/Ö/g, "o")
    .replace(/Ç/g, "c");

  // Now replace non-alphanumeric with hyphens
  let slug = normalized
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  // Fix common broken patterns AFTER initial slug generation
  // "deni-ze" -> "denize" (fix broken words)
  slug = slug.replace(/([a-z]{3,})-ze/g, '$1ze');
  slug = slug.replace(/-ze-/g, 'ze-');
  slug = slug.replace(/-ze$/g, 'ze');
  
  // "i-syeri" -> "isyeri" (fix broken words)
  slug = slug.replace(/^i-syeri/g, 'isyeri');
  slug = slug.replace(/-i-syeri/g, '-isyeri');
  slug = slug.replace(/i-syeri-/g, 'isyeri-');
  slug = slug.replace(/i-syeri$/g, 'isyeri');
  
  // "i-nkoy" -> "inkoy" (fix broken words like "İnköy")
  slug = slug.replace(/^i-n([a-z]{3,})/g, 'in$1');
  slug = slug.replace(/-i-n([a-z]{3,})/g, '-in$1');
  slug = slug.replace(/i-n([a-z]{3,})-/g, 'in$1-');
  slug = slug.replace(/i-n([a-z]{3,})$/g, 'in$1');
  slug = slug.replace(/([a-z])-i-n([a-z]{3,})/g, '$1-in$2');
  
  // Fix other single letter + word patterns that should be combined
  // Common Turkish word patterns
  const validCombinations = [
    { pattern: /-i-([a-z]{4,})/g, replacement: (match: string, word: string) => {
      // Check if "i" + word makes a valid Turkish word
      const combined = 'i' + word;
      // Common Turkish words starting with "i"
      if (['isyeri', 'inkoy', 'inonu', 'istanbul', 'izmir'].some(w => combined.startsWith(w))) {
        return `-${combined}`;
      }
      return match;
    }},
  ];
  
  // Remove multiple consecutive hyphens
  slug = slug.replace(/-{2,}/g, "-");

  // If slug is longer than maxLength, truncate at word boundary
  if (slug.length > maxLength) {
    const truncated = slug.substring(0, maxLength);
    const lastHyphen = truncated.lastIndexOf('-');
    if (lastHyphen > maxLength * 0.5) {
      slug = truncated.substring(0, lastHyphen);
    } else {
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

  // Check for meaningless patterns (e.g., "deni-ze", "i-syeri", "kiralik-i-syeri")
  const meaninglessPatterns = [
    /-i-syeri/g, // "i-syeri" gibi (should be "isyeri")
    /^i-syeri/g, // "i-syeri" at start
    /[a-z]{3,}-ze$/g, // "deni-ze" gibi (should be "denize")
    /[a-z]{3,}-ze-/g, // "deni-ze-something" gibi
    /-[a-z]{1}-[a-z]/g, // Single letter between words (e.g., "a-b")
  ];

  for (const pattern of meaninglessPatterns) {
    if (pattern.test(slug)) {
      return false;
    }
  }

  // Check for timestamp patterns (long numbers at the end)
  if (/\d{10,}/.test(slug)) {
    return false;
  }

  // Check for hash-like patterns (random alphanumeric at the end)
  if (/-[a-z0-9]{8,}$/.test(slug) && !/^[a-z]+-[a-z]+/.test(slug)) {
    // If it looks like a hash (long alphanumeric at end) and not a normal word
    const parts = slug.split('-');
    const lastPart = parts[parts.length - 1];
    if (lastPart.length >= 8 && /^[a-z0-9]+$/.test(lastPart) && !/^[a-z]{3,}/.test(lastPart)) {
      return false;
    }
  }

  return true;
}

/**
 * Clean slug from timestamps and hashes
 */
function cleanSlug(slug: string): string {
  // Remove timestamp patterns (10+ digits)
  slug = slug.replace(/-\d{10,}/g, '');
  
  // Remove hash-like patterns at the end (8+ alphanumeric that don't look like words)
  slug = slug.replace(/-[a-z0-9]{8,}$/g, (match) => {
    // Check if it looks like a word (starts with 3+ letters)
    if (/^-[a-z]{3,}/.test(match)) {
      return match; // Keep it, it's probably a word
    }
    return ''; // Remove it, it's probably a hash
  });

  // Fix "deni-ze" -> "denize" pattern (do this first, before other fixes)
  slug = slug.replace(/([a-z]{3,})-ze$/g, '$1ze'); // "deni-ze" -> "denize"
  slug = slug.replace(/([a-z]{3,})-ze-/g, '$1ze-'); // "deni-ze-something" -> "denize-something"
  slug = slug.replace(/-ze-/g, 'ze-'); // "-ze-" -> "ze-"
  
  // Fix "i-syeri" -> "isyeri" pattern
  slug = slug.replace(/^i-syeri/g, 'isyeri'); // Start with "i-syeri"
  slug = slug.replace(/-i-syeri/g, '-isyeri'); // Middle "-i-syeri"
  slug = slug.replace(/i-syeri-/g, 'isyeri-'); // End with "-i-syeri-"
  slug = slug.replace(/i-syeri$/g, 'isyeri'); // End with "i-syeri"
  
  // Fix "i-nkoy" -> "inkoy" pattern (and similar)
  // This happens when "İnköy" becomes "i-nkoy" instead of "inkoy"
  slug = slug.replace(/^i-n([a-z]{3,})/g, 'in$1'); // "i-nkoy" -> "inkoy"
  slug = slug.replace(/-i-n([a-z]{3,})/g, '-in$1'); // "-i-nkoy" -> "-inkoy"
  slug = slug.replace(/i-n([a-z]{3,})-/g, 'in$1-'); // "i-nkoy-" -> "inkoy-"
  slug = slug.replace(/i-n([a-z]{3,})$/g, 'in$1'); // "i-nkoy" -> "inkoy"
  
  // Also fix in the middle of slug
  slug = slug.replace(/([a-z])-i-n([a-z]{3,})/g, '$1-in$2'); // "something-i-nkoy" -> "something-inkoy"
  
  // Fix other common broken patterns with single letter + word
  // "i-something" where "isomething" makes sense
  const validIPrefixes = ['is', 'in', 'im', 'il', 'ir', 'it', 'iy', 'iz'];
  slug = slug.replace(/-i-([a-z]{3,})/g, (match, word) => {
    const prefix = 'i' + word.substring(0, 1);
    if (validIPrefixes.includes(prefix)) {
      return `-${prefix}${word.substring(1)}`;
    }
    return match;
  });
  
  // Fix other single letter patterns that create valid words
  slug = slug.replace(/-([a-z])-([a-z]{3,})/g, (match, letter, word) => {
    // Common Turkish prefixes
    const combined = letter + word;
    const validPrefixes = ['in', 'un', 'an', 'en', 'on', 'is', 'as', 'es', 'os', 'us'];
    const prefix = letter + word.substring(0, 1);
    if (validPrefixes.includes(prefix)) {
      return `-${prefix}${word.substring(1)}`;
    }
    return match;
  });

  // Remove multiple consecutive hyphens
  slug = slug.replace(/-{2,}/g, "-");

  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
}

/**
 * Check if slug matches title (allowing for minor variations)
 */
function slugMatchesTitle(slug: string, title: string): boolean {
  const expectedSlug = generateSlug(title);
  const cleanedSlug = cleanSlug(slug);
  
  // Allow for minor variations (e.g., timestamp suffixes)
  return cleanedSlug === expectedSlug || cleanedSlug.startsWith(expectedSlug + '-') || expectedSlug.startsWith(cleanedSlug);
}

async function fixListingSlugs() {
  console.log("🔍 İlan slug'ları kontrol ediliyor...\n");

  try {
    // Fetch all listings
    const { data: listings, error } = await supabase
      .from("listings")
      .select("id, title, slug")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    if (!listings || listings.length === 0) {
      console.log("✅ Hiç ilan bulunamadı.");
      return;
    }

    console.log(`📊 Toplam ${listings.length} ilan bulundu.\n`);

    const issues: Array<{
      id: string;
      title: string;
      oldSlug: string;
      newSlug: string;
      reason: string;
    }> = [];

    // Check each listing
    for (const listing of listings) {
      const { id, title, slug } = listing;

      if (!slug || !title) {
        continue;
      }

      let needsFix = false;
      let reason = "";

      // Check if slug is valid
      if (!isValidSlug(slug)) {
        needsFix = true;
        reason = "Geçersiz karakterler veya manasız pattern içeriyor";
      }

      // Always check for broken patterns, even if slug seems valid
      const hasBrokenPatterns = 
        /-i-syeri/.test(slug) ||
        /^i-syeri/.test(slug) ||
        /[a-z]{3,}-ze/.test(slug) ||
        /^i-n([a-z]{3,})/.test(slug) ||
        /-i-n([a-z]{3,})/.test(slug) ||
        /\d{10,}/.test(slug) || // Timestamp
        /-[a-z0-9]{8,}$/.test(slug); // Hash at end (but allow if it's a valid word)

      if (hasBrokenPatterns) {
        needsFix = true;
        reason = "Manasız pattern içeriyor (deni-ze, i-syeri, i-nkoy, timestamp, hash)";
      }

      // Check if slug matches title (allowing for minor variations)
      const expectedSlug = generateSlug(title);
      const cleanedSlug = cleanSlug(slug);
      
      if (!hasBrokenPatterns && cleanedSlug !== expectedSlug && !cleanedSlug.startsWith(expectedSlug + '-') && !expectedSlug.startsWith(cleanedSlug)) {
        needsFix = true;
        reason = reason || "Title ile uyumsuz";
      }

      if (needsFix) {
        // Always regenerate from title to ensure consistency
        let newSlug = generateSlug(title);
        
        // Remove any hash-like suffixes from the new slug if they exist
        newSlug = cleanSlug(newSlug);
        
        // Check if new slug already exists (different listing)
        const { data: existing } = await supabase
          .from("listings")
          .select("id")
          .eq("slug", newSlug)
          .neq("id", id)
          .maybeSingle();

        let finalSlug = newSlug;
        if (existing) {
          // Append a unique suffix (short hash based on id)
          const shortId = id.substring(0, 8);
          finalSlug = `${newSlug}-${shortId}`;
          
          // Double check this doesn't exist either
          const { data: existing2 } = await supabase
            .from("listings")
            .select("id")
            .eq("slug", finalSlug)
            .neq("id", id)
            .maybeSingle();
          
          if (existing2) {
            // Still exists, append timestamp
            finalSlug = `${newSlug}-${Date.now()}`;
            reason += " (slug çakışması, timestamp eklendi)";
          } else {
            reason += " (slug çakışması, kısa ID eklendi)";
          }
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

    console.log(`⚠️  ${issues.length} ilanda sorun bulundu:\n`);

    // Show first 20 issues
    const showCount = Math.min(20, issues.length);
    issues.slice(0, showCount).forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.title}`);
      console.log(`   Eski: ${issue.oldSlug}`);
      console.log(`   Yeni: ${issue.newSlug}`);
      console.log(`   Sebep: ${issue.reason}\n`);
    });

    if (issues.length > showCount) {
      console.log(`   ... ve ${issues.length - showCount} ilan daha\n`);
    }

    // Auto-confirm for automated runs
    console.log(`\n📝 ${issues.length} ilan düzeltilecek. Düzeltmeler uygulanıyor...\n`);

    // Fix issues
    let fixed = 0;
    let errors = 0;

    for (const issue of issues) {
      try {
        const { error: updateError } = await supabase
          .from("listings")
          .update({ slug: issue.newSlug })
          .eq("id", issue.id);

        if (updateError) {
          console.error(`❌ ${issue.title} düzeltilemedi:`, updateError.message);
          errors++;
        } else {
          console.log(`✅ ${issue.title.substring(0, 50)}... düzeltildi: ${issue.oldSlug} → ${issue.newSlug}`);
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
fixListingSlugs()
  .then(() => {
    console.log("✅ Script tamamlandı.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
