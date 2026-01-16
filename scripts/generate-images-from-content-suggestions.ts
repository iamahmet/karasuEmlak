#!/usr/bin/env tsx

/**
 * Generate Images from Content Suggestions
 * 
 * İçeriklerdeki "Image Idea" ve "Alt Text" pattern'lerini bulur,
 * görselleri oluşturur ve içerikteki placeholder'ları gerçek görsellerle değiştirir.
 * 
 * Usage:
 *   pnpm tsx scripts/generate-images-from-content-suggestions.ts
 *   pnpm tsx scripts/generate-images-from-content-suggestions.ts --type=articles
 *   pnpm tsx scripts/generate-images-from-content-suggestions.ts --type=news
 *   pnpm tsx scripts/generate-images-from-content-suggestions.ts --limit=10
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Image suggestion extraction (inline to avoid path issues)
interface ImageSuggestion {
  imageIdea: string;
  altText: string;
  position: number;
  originalText: string;
}

function extractImageSuggestions(content: string): ImageSuggestion[] {
  const suggestions: ImageSuggestion[] = [];
  if (!content) return suggestions;

  // Split by "> >" to handle multiple suggestions
  const blocks = content.split(/>\s*>/).filter(block => block.trim().length > 0);
  
  for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
    const block = blocks[blockIndex];
    const blockPattern = />*\s*\*\*Image Idea:\*\*\s*([^|]+?)\s*\|\s*\*\*Alt Text:\*\*\s*([^\n>]+?)(?=\s*$|>)/gi;
    let blockMatch: RegExpExecArray | null;
    
    while ((blockMatch = blockPattern.exec(block)) !== null) {
      const isFirstBlock = blockIndex === 0;
      const fullMatch = isFirstBlock ? `>${blockMatch[0]}` : `> >${blockMatch[0]}`;
      
      let position = content.indexOf(fullMatch);
      if (position === -1) {
        position = content.indexOf(blockMatch[0]);
      }
      
      if (position >= 0 && !suggestions.some(s => Math.abs(s.position - position) < 10)) {
        suggestions.push({
          imageIdea: blockMatch[1].trim(),
          altText: blockMatch[2].trim(),
          position,
          originalText: fullMatch,
        });
      }
    }
  }

  // Also try pattern with brackets
  const patternWithBrackets = />+\s*\*\*Image Idea:\*\*\s*\[([^\]]+)\]\s*\|\s*\*\*Alt Text:\*\*\s*\[([^\]]+)\]/gi;
  let match: RegExpExecArray | null;
  while ((match = patternWithBrackets.exec(content)) !== null) {
    if (match && !suggestions.some(s => Math.abs(s.position - match!.index) < 10)) {
      suggestions.push({
        imageIdea: match[1].trim(),
        altText: match[2].trim(),
        position: match.index,
        originalText: match[0],
      });
    }
  }

  return suggestions;
}

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!");
  process.exit(1);
}

if (!openaiApiKey && !geminiApiKey) {
  console.error("❌ OPENAI_API_KEY veya GEMINI_API_KEY gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Parse command line arguments
const args = process.argv.slice(2);
const typeArg = args.find(arg => arg.startsWith('--type='))?.split('=')[1] || 'all';
const limitArg = args.find(arg => arg.startsWith('--limit='))?.split('=')[1];
const limit = limitArg ? parseInt(limitArg, 10) : undefined;

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: 'article' | 'news';
}

/**
 * Generate image using API
 */
async function generateImage(
  imageIdea: string,
  altText: string,
  context: { title: string; type: 'article' | 'news'; entityId: string }
): Promise<{ url: string; public_id?: string; cost?: number } | null> {
  try {
    const apiUrl = `${siteUrl}/api/ai/generate-image`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'article',
        context: {
          title: context.title,
          description: imageIdea,
          category: context.type === 'article' ? 'blog' : 'news',
        },
        options: {
          size: '1792x1024',
          quality: 'hd',
          style: 'natural',
        },
        upload: {
          entityType: context.type,
          entityId: context.entityId,
          alt: altText,
          tags: ['ai-generated', context.type, 'auto-generated', 'content-image'],
          folder: `articles/${context.type}`,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    
    if (data.success && data.url) {
      return {
        url: data.url,
        public_id: data.public_id,
        cost: data.cost || 0,
      };
    }

    throw new Error(data.error || 'Görsel oluşturulamadı');
  } catch (error: any) {
    console.error(`   ❌ Görsel oluşturma hatası:`, error.message);
    return null;
  }
}

/**
 * Process articles
 */
async function processArticles(): Promise<{ processed: number; generated: number; errors: number }> {
  console.log("\n📝 Articles işleniyor...\n");

  let processed = 0;
  let generated = 0;
  let errors = 0;

  // Fetch articles with content
  let query = supabase
    .from('articles')
    .select('id, title, slug, content')
    .not('content', 'is', null)
    .neq('content', '');

  if (limit) {
    query = query.limit(limit);
  }

  const { data: articles, error } = await query;

  if (error) {
    console.error('❌ Articles yüklenemedi:', error);
    return { processed: 0, generated: 0, errors: 1 };
  }

  if (!articles || articles.length === 0) {
    console.log('   ⚠️  İşlenecek article bulunamadı');
    return { processed: 0, generated: 0, errors: 0 };
  }

  console.log(`   📚 ${articles.length} article bulundu\n`);

  for (const article of articles) {
    try {
      const suggestions = extractImageSuggestions(article.content);
      
      if (suggestions.length === 0) {
        continue; // Skip if no suggestions
      }

      console.log(`\n📄 "${article.title}"`);
      console.log(`   🔍 ${suggestions.length} görsel önerisi bulundu`);

      let updatedContent = article.content;
      let articleGenerated = 0;

      for (const suggestion of suggestions) {
        console.log(`   🎨 Oluşturuluyor: "${suggestion.imageIdea.substring(0, 50)}..."`);
        
        const imageResult = await generateImage(suggestion.imageIdea, suggestion.altText, {
          title: article.title,
          type: 'article',
          entityId: article.id,
        });

        if (imageResult) {
          // Replace suggestion with image tag
          const imageTag = `<img src="${imageResult.url}" alt="${suggestion.altText}" class="w-full rounded-lg my-6" loading="lazy" />`;
          updatedContent = updatedContent.replace(suggestion.originalText, imageTag);
          
          articleGenerated++;
          generated++;
          console.log(`   ✅ Oluşturuldu: ${imageResult.public_id || 'N/A'}`);
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          errors++;
        }
      }

      // Update article if any images were generated
      if (articleGenerated > 0) {
        const { error: updateError } = await supabase
          .from('articles')
          .update({
            content: updatedContent,
            updated_at: new Date().toISOString(),
          })
          .eq('id', article.id);

        if (updateError) {
          console.error(`   ❌ Güncelleme hatası:`, updateError.message);
          errors++;
        } else {
          console.log(`   ✅ İçerik güncellendi (${articleGenerated} görsel eklendi)`);
        }
      }

      processed++;
    } catch (error: any) {
      console.error(`   ❌ Hata:`, error.message);
      errors++;
    }
  }

  return { processed, generated, errors };
}

/**
 * Process news articles
 */
async function processNews(): Promise<{ processed: number; generated: number; errors: number }> {
  console.log("\n📰 News articles işleniyor...\n");

  let processed = 0;
  let generated = 0;
  let errors = 0;

  // Fetch news articles with content
  let query = supabase
    .from('news_articles')
    .select('id, title, slug, content, emlak_analysis')
    .not('content', 'is', null)
    .neq('content', '');

  if (limit) {
    query = query.limit(limit);
  }

  const { data: newsArticles, error } = await query;

  if (error) {
    console.error('❌ News articles yüklenemedi:', error);
    return { processed: 0, generated: 0, errors: 1 };
  }

  if (!newsArticles || newsArticles.length === 0) {
    console.log('   ⚠️  İşlenecek news article bulunamadı');
    return { processed: 0, generated: 0, errors: 0 };
  }

  console.log(`   📰 ${newsArticles.length} news article bulundu\n`);

  for (const article of newsArticles) {
    try {
      // Check both content and emlak_analysis fields
      const contentFields = [
        { field: 'content', value: article.content },
        { field: 'emlak_analysis', value: article.emlak_analysis },
      ].filter(f => f.value);

      let totalGenerated = 0;
      let updatedFields: Record<string, string> = {};

      for (const { field, value } of contentFields) {
        const suggestions = extractImageSuggestions(value as string);
        
        if (suggestions.length === 0) {
          continue;
        }

        console.log(`\n📄 "${article.title}" (${field})`);
        console.log(`   🔍 ${suggestions.length} görsel önerisi bulundu`);

        let updatedContent = value as string;

        for (const suggestion of suggestions) {
          console.log(`   🎨 Oluşturuluyor: "${suggestion.imageIdea.substring(0, 50)}..."`);
          
          const imageResult = await generateImage(suggestion.imageIdea, suggestion.altText, {
            title: article.title,
            type: 'news',
            entityId: article.id,
          });

          if (imageResult) {
            const imageTag = `<img src="${imageResult.url}" alt="${suggestion.altText}" class="w-full rounded-lg my-6" loading="lazy" />`;
            updatedContent = updatedContent.replace(suggestion.originalText, imageTag);
            
            totalGenerated++;
            generated++;
            console.log(`   ✅ Oluşturuldu: ${imageResult.public_id || 'N/A'}`);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            errors++;
          }
        }

        if (updatedContent !== value) {
          updatedFields[field] = updatedContent;
        }
      }

      // Update article if any images were generated
      if (totalGenerated > 0) {
        const { error: updateError } = await supabase
          .from('news_articles')
          .update({
            ...updatedFields,
            updated_at: new Date().toISOString(),
          })
          .eq('id', article.id);

        if (updateError) {
          console.error(`   ❌ Güncelleme hatası:`, updateError.message);
          errors++;
        } else {
          console.log(`   ✅ İçerik güncellendi (${totalGenerated} görsel eklendi)`);
        }
      }

      processed++;
    } catch (error: any) {
      console.error(`   ❌ Hata:`, error.message);
      errors++;
    }
  }

  return { processed, generated, errors };
}

/**
 * Main function
 */
async function main() {
  console.log("🚀 İçeriklerdeki Görsel Önerileri İşleniyor...\n");
  console.log(`📡 API URL: ${siteUrl}/api/ai/generate-image\n`);

  let totalProcessed = 0;
  let totalGenerated = 0;
  let totalErrors = 0;

  if (typeArg === 'all' || typeArg === 'articles') {
    const result = await processArticles();
    totalProcessed += result.processed;
    totalGenerated += result.generated;
    totalErrors += result.errors;
  }

  if (typeArg === 'all' || typeArg === 'news') {
    const result = await processNews();
    totalProcessed += result.processed;
    totalGenerated += result.generated;
    totalErrors += result.errors;
  }

  // Summary
  console.log("\n📊 Özet:");
  console.log(`   📝 İşlenen içerik: ${totalProcessed}`);
  console.log(`   🎨 Oluşturulan görsel: ${totalGenerated}`);
  console.log(`   ❌ Hata: ${totalErrors}\n`);

  if (totalGenerated > 0) {
    console.log("✨ Görseller başarıyla oluşturuldu ve içeriklere eklendi!\n");
  } else {
    console.log("ℹ️  İşlenecek görsel önerisi bulunamadı.\n");
  }
}

// Run
main()
  .then(() => {
    console.log("✅ Script tamamlandı.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
