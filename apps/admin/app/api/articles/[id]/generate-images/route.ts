import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { extractImageSuggestions } from '@/lib/utils/extract-image-suggestions';

/**
 * Generate images for image suggestions in article content
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { field = 'content' } = body;

    const supabase = createServiceClient();

    // Fetch article
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (fetchError || !article) {
      return NextResponse.json(
        { success: false, error: 'Makale bulunamadı' },
        { status: 404 }
      );
    }

    // Get content from specified field
    const contentText = article[field as keyof typeof article] as string;
    if (!contentText) {
      return NextResponse.json(
        { success: false, error: 'İçerik bulunamadı' },
        { status: 400 }
      );
    }

    // Extract image suggestions
    const suggestions = extractImageSuggestions(contentText);
    
    if (suggestions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'İçerikte görsel önerisi bulunamadı',
        suggestions: [],
        generated: [],
      });
    }

    console.log(`[Article Generate Images] Found ${suggestions.length} image suggestions`);

    // Generate images for each suggestion
    const generatedImages = [];
    let updatedContent = contentText;

    for (const suggestion of suggestions) {
      try {
        console.log(`[Article Generate Images] Generating image for: ${suggestion.imageIdea}`);

        // Call AI image generation API (internal call)
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const imageResponse = await fetch(`${baseUrl}/api/ai/generate-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'article',
            context: {
              title: article.title,
              description: suggestion.imageIdea,
              category: article.category || 'blog',
            },
            options: {
              size: '1792x1024',
              quality: 'hd',
              style: 'natural',
            },
            upload: {
              entityType: 'article',
              entityId: id,
              alt: suggestion.altText,
              tags: ['ai-generated', 'article', 'auto-generated'],
            },
          }),
        });

        const imageData = await imageResponse.json();

        if (imageData.success && imageData.url) {
          // Replace suggestion with image tag
          updatedContent = updatedContent.replace(
            suggestion.originalText,
            `<img src="${imageData.url}" alt="${suggestion.altText}" class="w-full rounded-lg my-6" loading="lazy" />`
          );

          generatedImages.push({
            suggestion,
            imageUrl: imageData.url,
            publicId: imageData.public_id,
            cost: imageData.cost,
          });

          console.log(`[Article Generate Images] Successfully generated image: ${imageData.url}`);
        } else {
          console.error(`[Article Generate Images] Failed to generate image:`, imageData.error);
          generatedImages.push({
            suggestion,
            error: imageData.error || 'Görsel oluşturulamadı',
          });
        }
      } catch (error: any) {
        console.error(`[Article Generate Images] Error generating image:`, error);
        generatedImages.push({
          suggestion,
          error: error.message || 'Görsel oluşturulamadı',
        });
      }
    }

    // Update article with new content (if any images were generated)
    if (generatedImages.some(img => img.imageUrl)) {
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          [field]: updatedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        console.error('[Article Generate Images] Error updating article:', updateError);
        return NextResponse.json(
          { success: false, error: 'İçerik güncellenemedi' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      suggestions: suggestions.length,
      generated: generatedImages.filter(img => img.imageUrl).length,
      failed: generatedImages.filter(img => img.error).length,
      images: generatedImages,
      updatedContent: generatedImages.some(img => img.imageUrl) ? updatedContent : null,
    });
  } catch (error: any) {
    console.error('[Article Generate Images] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
