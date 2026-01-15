#!/usr/bin/env tsx

/**
 * Sapanca Content Generation Pipeline
 * 
 * Generates 10 cornerstone + 20 blog articles for Sapanca
 * Includes AI image generation, Cloudinary upload, and DB integration
 * 
 * Usage:
 *   pnpm tsx scripts/generate-sapanca-content.ts
 *   pnpm tsx scripts/generate-sapanca-content.ts --dry-run
 *   pnpm tsx scripts/generate-sapanca-content.ts --limit 5
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";
import { generateImage } from "@karasu/lib/openai/image-generation";
import { uploadAIImage } from "@/lib/cloudinary/ai-upload";
import { calculateReadingTime } from "@/lib/utils/reading-time";
import { generateBlogArticleSchema, generateFAQPageSchema } from "@/lib/seo/blog-structured-data";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ContentPlan {
  cornerstone: Array<{
    title: string;
    slug: string;
    excerpt: string;
    keywords: string[];
    imagePrompts: {
      featured: string;
      inline: string[];
    };
  }>;
  blog: Array<{
    title: string;
    slug: string;
    excerpt: string;
    keywords: string[];
    imagePrompts: {
      featured: string;
      inline: string;
    };
  }>;
}

// Content Plan (10 cornerstone + 20 blog)
const CONTENT_PLAN: ContentPlan = {
  cornerstone: [
    {
      title: "Sapanca Bungalov Rehberi: Seçim Kriterleri, Fiyatlar ve Sezona Göre Öneriler",
      slug: "sapanca-bungalov-rehberi-secim-kriterleri-fiyatlar-ve-sezona-gore-oneriler",
      excerpt: "Sapanca'da bungalov seçerken dikkat edilmesi gerekenler, fiyat aralıkları, sezona göre avantajlar ve dezavantajlar. Göl kenarı bungalovlar, günlük kiralık seçenekleri ve yatırım potansiyeli hakkında kapsamlı rehber.",
      keywords: ["sapanca bungalov", "sapanca günlük kiralık", "sapanca satılık bungalov", "sapanca emlak"],
      imagePrompts: {
        featured: "Professional real estate photography of a modern wooden bungalow near Sapanca Lake, Turkey. Natural daylight, 24mm lens, shallow depth of field. Lake view in background, wooden deck with outdoor furniture. Realistic, high detail, no text, no logo.",
        inline: [
          "Interior of a cozy bungalow with fireplace, wooden beams, comfortable furniture. Natural indoor lighting, 35mm lens. Realistic, warm atmosphere, no text.",
          "Aerial view of Sapanca Lake with bungalows along the shore. Golden hour lighting, 24mm lens. Realistic, high detail, no text.",
        ],
      },
    },
    // ... diğer 9 cornerstone buraya eklenecek
  ],
  blog: [
    {
      title: "Sapanca'da Hafta Sonu: En İyi Bungalov ve Aktivite Önerileri",
      slug: "sapancada-hafta-sonu-en-iyi-bungalov-ve-aktivite-onerileri",
      excerpt: "Sapanca'da hafta sonu geçirmek için en iyi bungalov seçenekleri, göl çevresi aktiviteleri ve yürüyüş rotaları. Hafta sonu kaçamakları için pratik öneriler.",
      keywords: ["sapanca hafta sonu", "sapanca bungalov", "sapanca aktiviteler", "sapanca gölü"],
      imagePrompts: {
        featured: "Happy couple walking along Sapanca Lake shore, wooden bungalows in background. Natural daylight, 35mm lens, candid moment. Realistic, warm colors, no text, no logo.",
        inline: "Sapanca Lake with paddle boats and walking path. Golden hour, 24mm lens. Realistic, peaceful atmosphere, no text.",
      },
    },
    // ... diğer 19 blog buraya eklenecek
  ],
};

/**
 * Generate image using OpenAI or Gemini
 */
async function generateImageWithRetry(
  prompt: string,
  retries = 3
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (openaiKey) {
        const result = await generateImage(prompt, {
          size: '1792x1024',
          quality: 'hd',
          style: 'natural',
        });
        return result.url;
      } else if (geminiKey) {
        // Gemini image generation (if available)
        // TODO: Implement Gemini image generation
        throw new Error("Gemini image generation not yet implemented");
      } else {
        throw new Error("No image generation API key configured");
      }
    } catch (error: any) {
      if (attempt < retries) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.warn(`  ⚠️  Attempt ${attempt} failed, retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
  throw new Error("All retry attempts failed");
}

/**
 * Upload image to Cloudinary and save to DB
 */
async function uploadAndSaveImage(
  imageUrl: string,
  options: {
    articleId: string;
    articleSlug: string;
    alt: string;
    placement: 'featured' | 'inline';
    orderIndex?: number;
  }
): Promise<string | null> {
  try {
    const uploaded = await uploadAIImage({
      imageUrl,
      folder: `karasuemlak/blog/${options.articleSlug}`,
      publicId: `${options.articleSlug}-${options.placement}${options.orderIndex ? `-${options.orderIndex}` : ''}`,
      entityType: 'article',
      entityId: options.articleId,
      alt: options.alt,
      tags: ['sapanca', 'blog', options.placement],
      size: '1792x1024',
      quality: 'hd',
    });

    if (!uploaded.media_asset_id) {
      console.warn(`  ⚠️  Image uploaded but media_asset_id not returned`);
      return uploaded.public_id;
    }

    // Link to article via article_media
    if (options.placement === 'featured') {
      await supabase
        .from('articles')
        .update({ featured_image_id: uploaded.media_asset_id })
        .eq('id', options.articleId);
    }

    await supabase
      .from('article_media')
      .upsert({
        article_id: options.articleId,
        media_id: uploaded.media_asset_id,
        placement: options.placement,
        order_index: options.orderIndex || 0,
        context_json: { alt: options.alt },
      }, {
        onConflict: 'article_id,media_id,placement',
      });

    return uploaded.public_id;
  } catch (error: any) {
    console.error(`  ❌ Image upload failed:`, error.message);
    return null;
  }
}

/**
 * Generate article content (placeholder - will be enhanced with AI)
 */
function generateArticleContent(plan: ContentPlan['cornerstone'][0] | ContentPlan['blog'][0]): string {
  // This is a placeholder - in production, use Gemini/OpenAI to generate content
  // For now, return structured template
  return `# ${plan.title}

${plan.excerpt}

## İçindekiler
1. [Giriş](#giris)
2. [Ana Konu](#ana-konu)
3. [Önemli Noktalar](#onemli-noktalar)
4. [Sonuç](#sonuc)

## Giriş

Bu yazıda, ${plan.title.toLowerCase()} hakkında detaylı bilgiler bulacaksınız.

## Ana Konu

[İçerik buraya eklenecek - AI ile üretilecek]

## Önemli Noktalar

- Önemli nokta 1
- Önemli nokta 2
- Önemli nokta 3

## Sonuç

${plan.title} hakkında bilmeniz gerekenler bu yazıda özetlenmiştir.`;
}

/**
 * Main generation function
 */
async function generateSapancaContent(options: {
  dryRun?: boolean;
  limit?: number;
} = {}) {
  const { dryRun = false, limit } = options;

  console.log("🚀 Sapanca İçerik Üretim Pipeline Başlatılıyor...\n");
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'PRODUCTION'}`);
  if (limit) console.log(`   Limit: ${limit} articles\n`);

  const report: {
    cornerstone: { created: number; updated: number; errors: number };
    blog: { created: number; updated: number; errors: number };
    images: { generated: number; uploaded: number; errors: number };
  } = {
    cornerstone: { created: 0, updated: 0, errors: 0 },
    blog: { created: 0, updated: 0, errors: 0 },
    images: { generated: 0, uploaded: 0, errors: 0 },
  };

  // Generate cornerstone articles
  console.log("📝 Cornerstone Makaleler Üretiliyor...\n");
  const cornerstoneLimit = limit ? Math.min(limit, CONTENT_PLAN.cornerstone.length) : CONTENT_PLAN.cornerstone.length;

  for (let i = 0; i < cornerstoneLimit; i++) {
    const plan = CONTENT_PLAN.cornerstone[i];
    console.log(`\n[${i + 1}/${cornerstoneLimit}] ${plan.title}`);

    try {
      // Check if exists
      const { data: existing } = await supabase
        .from('articles')
        .select('id, title')
        .eq('slug', plan.slug)
        .maybeSingle();

      let articleId: string;

      if (existing) {
        console.log(`   🔄 Mevcut makale güncelleniyor...`);
        articleId = existing.id;
        report.cornerstone.updated++;
      } else {
        console.log(`   ✨ Yeni makale oluşturuluyor...`);
        const content = generateArticleContent(plan);
        const wordCount = content.split(/\s+/).length;
        const readingTime = calculateReadingTime(content);

        const { data: newArticle, error: insertError } = await supabase
          .from('articles')
          .insert({
            title: plan.title,
            slug: plan.slug,
            excerpt: plan.excerpt,
            content,
            meta_description: plan.excerpt,
            keywords: plan.keywords,
            category: 'Emlak Rehberi',
            author: 'Karasu Emlak',
            status: dryRun ? 'draft' : 'draft', // Always draft for review
            word_count: wordCount,
            reading_time: readingTime,
            published_at: null,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        if (!newArticle) throw new Error("Article not created");

        articleId = newArticle.id;
        report.cornerstone.created++;
      }

      // Generate images
      if (!dryRun && openaiKey) {
        console.log(`   🎨 Görseller üretiliyor...`);

        // Featured image
        try {
          const featuredUrl = await generateImageWithRetry(plan.imagePrompts.featured);
          report.images.generated++;
          const featuredPublicId = await uploadAndSaveImage(featuredUrl, {
            articleId,
            articleSlug: plan.slug,
            alt: plan.title,
            placement: 'featured',
          });
          if (featuredPublicId) report.images.uploaded++;
        } catch (error: any) {
          console.error(`   ❌ Featured image failed:`, error.message);
          report.images.errors++;
        }

        // Inline images
        for (let j = 0; j < plan.imagePrompts.inline.length; j++) {
          try {
            const inlineUrl = await generateImageWithRetry(plan.imagePrompts.inline[j]);
            report.images.generated++;
            const inlinePublicId = await uploadAndSaveImage(inlineUrl, {
              articleId,
              articleSlug: plan.slug,
              alt: `${plan.title} - Görsel ${j + 1}`,
              placement: 'inline',
              orderIndex: j,
            });
            if (inlinePublicId) report.images.uploaded++;
          } catch (error: any) {
            console.error(`   ❌ Inline image ${j + 1} failed:`, error.message);
            report.images.errors++;
          }
        }
      }

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error(`   ❌ Hata:`, error.message);
      report.cornerstone.errors++;
    }
  }

  // Generate blog articles (similar process)
  console.log("\n\n📝 Blog Yazıları Üretiliyor...\n");
  const blogLimit = limit ? Math.min(limit, CONTENT_PLAN.blog.length) : CONTENT_PLAN.blog.length;

  for (let i = 0; i < blogLimit; i++) {
    const plan = CONTENT_PLAN.blog[i];
    console.log(`\n[${i + 1}/${blogLimit}] ${plan.title}`);

    try {
      // Similar process as cornerstone
      // ... (implementation similar to above)
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error(`   ❌ Hata:`, error.message);
      report.blog.errors++;
    }
  }

  // Generate report
  const reportPath = 'docs/reports/sapanca_generation_report.md';
  const reportContent = `# Sapanca İçerik Üretim Raporu

**Tarih:** ${new Date().toISOString()}
**Mode:** ${dryRun ? 'DRY RUN' : 'PRODUCTION'}

## Özet

### Cornerstone Makaleler
- ✅ Oluşturulan: ${report.cornerstone.created}
- 🔄 Güncellenen: ${report.cornerstone.updated}
- ❌ Hatalar: ${report.cornerstone.errors}

### Blog Yazıları
- ✅ Oluşturulan: ${report.blog.created}
- 🔄 Güncellenen: ${report.blog.updated}
- ❌ Hatalar: ${report.blog.errors}

### Görseller
- 🎨 Üretilen: ${report.images.generated}
- ☁️  Yüklenen: ${report.images.uploaded}
- ❌ Hatalar: ${report.images.errors}

## Detaylar

[Detaylı log buraya eklenecek]
`;

  if (!existsSync('docs/reports')) {
    await mkdir('docs/reports', { recursive: true });
  }
  await writeFile(reportPath, reportContent);

  console.log(`\n\n📊 Rapor: ${reportPath}`);
  console.log("\n✅ Pipeline tamamlandı!\n");
}

// CLI argument parsing
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;

generateSapancaContent({ dryRun, limit })
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });
