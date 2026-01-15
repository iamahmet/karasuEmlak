#!/usr/bin/env tsx

/**
 * Audit and Fix Blog Media
 * 
 * Checks all published/draft articles for:
 * - Missing featured images
 * - Missing inline images
 * - HTML entity encoding bugs
 * - Content quality issues
 * 
 * Usage:
 *   pnpm tsx scripts/audit-and-fix-blog-media.ts
 *   pnpm tsx scripts/audit-and-fix-blog-media.ts --fix
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { generateImage } from "@karasu/lib/openai/image-generation";
import { uploadAIImage } from "@/lib/cloudinary/ai-upload";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ArticleAudit {
  id: string;
  slug: string;
  title: string;
  status: string;
  hasFeaturedImage: boolean;
  hasInlineImages: boolean;
  hasEntityBugs: boolean;
  contentLength: number;
  issues: string[];
}

/**
 * Check for HTML entity encoding bugs
 */
function hasEntityBugs(content: string): boolean {
  if (!content) return false;
  
  // Check for escaped HTML tags that should be decoded
  if (content.match(/&lt;[a-z][a-z0-9]*[^&]*&gt;/i)) {
    return true;
  }
  
  // Check for "Alt Text" in blockquotes (AI artifact)
  if (content.match(/<blockquote[^>]*>.*?Alt Text.*?<\/blockquote>/i)) {
    return true;
  }
  
  return false;
}

/**
 * Fix HTML entity bugs
 */
function fixEntityBugs(content: string): string {
  let fixed = content;
  
  // Decode HTML entities
  fixed = fixed.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  
  // Remove "Alt Text" blockquotes
  fixed = fixed.replace(/<blockquote[^>]*>.*?Alt Text.*?<\/blockquote>/gi, '');
  
  // Fix broken image alt attributes
  fixed = fixed.replace(/alt="[^"]*Alt Text[^"]*"/gi, 'alt=""');
  
  return fixed;
}

/**
 * Generate image prompt from article
 */
function generateImagePrompt(article: { title: string; excerpt?: string; category?: string }): string {
  const location = article.title.toLowerCase().includes('sapanca') ? 'Sapanca Lake' :
                   article.title.toLowerCase().includes('karasu') ? 'Karasu' :
                   article.title.toLowerCase().includes('kocaali') ? 'Kocaali' :
                   'Sakarya';
  
  const propertyType = article.title.toLowerCase().includes('bungalov') ? 'bungalow' :
                       article.title.toLowerCase().includes('daire') ? 'apartment' :
                       article.title.toLowerCase().includes('villa') ? 'villa' :
                       article.title.toLowerCase().includes('yazlık') ? 'summer house' :
                       'real estate';
  
  return `Professional real estate photography of ${propertyType} in ${location}, Turkey. Natural daylight, 24-35mm lens, realistic depth of field, high detail, photorealistic. No text, no logo, no watermark, stock photo quality.`;
}

/**
 * Main audit function
 */
async function auditAndFix(options: { fix?: boolean } = {}) {
  const { fix = false } = options;
  
  console.log("🔍 Blog Media Audit Başlatılıyor...\n");
  console.log(`   Mode: ${fix ? 'FIX' : 'AUDIT ONLY'}\n`);

  // Fetch all articles
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, slug, title, content, excerpt, category, status, featured_image, featured_image_id')
    .in('status', ['published', 'draft']);

  if (error) {
    console.error("❌ Articles fetch error:", error);
    process.exit(1);
  }

  if (!articles || articles.length === 0) {
    console.log("ℹ️  No articles found.");
    return;
  }

  console.log(`📊 ${articles.length} makale bulundu.\n`);

  const auditResults: ArticleAudit[] = [];
  let fixedCount = 0;
  let imageGeneratedCount = 0;

  for (const article of articles) {
    const issues: string[] = [];
    
    // Check featured image
    const hasFeaturedImage = !!(article.featured_image || article.featured_image_id);
    if (!hasFeaturedImage) {
      issues.push('Missing featured image');
    }

    // Check inline images (basic check - look for <img> tags)
    const hasInlineImages = (article.content || '').includes('<img');
    if (!hasInlineImages && article.content && article.content.length > 2000) {
      issues.push('Long article without inline images');
    }

    // Check entity bugs
    const hasBugs = hasEntityBugs(article.content || '');
    if (hasBugs) {
      issues.push('HTML entity encoding bugs');
    }

    // Check content length
    const contentLength = (article.content || '').replace(/<[^>]*>/g, '').trim().length;
    if (contentLength < 500) {
      issues.push('Content too short (< 500 chars)');
    }

    auditResults.push({
      id: article.id,
      slug: article.slug,
      title: article.title,
      status: article.status,
      hasFeaturedImage,
      hasInlineImages,
      hasEntityBugs: hasBugs,
      contentLength,
      issues,
    });

    // Fix if requested
    if (fix && issues.length > 0) {
      console.log(`\n🔧 Fixing: ${article.title}`);

      // Fix entity bugs
      if (hasBugs) {
        const fixedContent = fixEntityBugs(article.content || '');
        await supabase
          .from('articles')
          .update({ content: fixedContent })
          .eq('id', article.id);
        console.log(`   ✅ Fixed HTML entity bugs`);
        fixedCount++;
      }

      // Generate featured image if missing
      if (!hasFeaturedImage && openaiKey) {
        try {
          const prompt = generateImagePrompt(article);
          const imageUrl = await generateImage(prompt, {
            size: '1792x1024',
            quality: 'hd',
            style: 'natural',
          });
          
          const uploaded = await uploadAIImage({
            imageUrl,
            folder: `karasuemlak/blog/${article.slug}`,
            publicId: `${article.slug}-featured`,
            entityType: 'article',
            entityId: article.id,
            alt: article.title,
            tags: ['blog', 'featured', article.category || 'general'],
            size: '1792x1024',
            quality: 'hd',
          });

          if (uploaded.media_asset_id) {
            await supabase
              .from('articles')
              .update({ featured_image_id: uploaded.media_asset_id })
              .eq('id', article.id);
            console.log(`   ✅ Generated and uploaded featured image`);
            imageGeneratedCount++;
          }
        } catch (error: any) {
          console.error(`   ❌ Image generation failed:`, error.message);
        }
      }
    }
  }

  // Generate report
  const reportPath = 'docs/reports/blog_media_audit_report.md';
  const totalIssues = auditResults.reduce((sum, r) => sum + r.issues.length, 0);
  const articlesWithIssues = auditResults.filter(r => r.issues.length > 0).length;

  const reportContent = `# Blog Media Audit Report

**Tarih:** ${new Date().toISOString()}
**Mode:** ${fix ? 'FIX' : 'AUDIT ONLY'}

## Özet

- **Toplam Makale:** ${articles.length}
- **Sorunlu Makale:** ${articlesWithIssues}
- **Toplam Sorun:** ${totalIssues}
- **Düzeltilen:** ${fix ? fixedCount : 0}
- **Görsel Üretilen:** ${fix ? imageGeneratedCount : 0}

## Sorun Dağılımı

- **Eksik Featured Image:** ${auditResults.filter(r => !r.hasFeaturedImage).length}
- **Eksik Inline Images:** ${auditResults.filter(r => !r.hasInlineImages && r.contentLength > 2000).length}
- **HTML Entity Bugs:** ${auditResults.filter(r => r.hasEntityBugs).length}
- **Kısa İçerik:** ${auditResults.filter(r => r.contentLength < 500).length}

## Detaylı Sonuçlar

${auditResults
  .filter(r => r.issues.length > 0)
  .map(r => `### ${r.title} (${r.slug})
- Status: ${r.status}
- Content Length: ${r.contentLength} chars
- Issues: ${r.issues.join(', ')}
`)
  .join('\n')}
`;

  if (!existsSync('docs/reports')) {
    await mkdir('docs/reports', { recursive: true });
  }
  await writeFile(reportPath, reportContent);

  console.log(`\n\n📊 Rapor: ${reportPath}`);
  console.log(`\n✅ Audit tamamlandı!\n`);
}

// CLI args
const args = process.argv.slice(2);
const fix = args.includes('--fix');

auditAndFix({ fix })
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
