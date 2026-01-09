'use client';

import { useState } from 'react';
import { Button } from '@karasu/ui';
import { Loader2, Sparkles, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateAIImage, type GenerateImageRequest } from '@/lib/ai/image-generator';

interface AIImageGeneratorProps {
  type: 'listing' | 'article' | 'neighborhood' | 'hero' | 'custom';
  context?: GenerateImageRequest['context'];
  onImageGenerated?: (publicId: string, url: string) => void;
  className?: string;
}

/**
 * AI Image Generator Component
 * 
 * Generates realistic images using OpenAI DALL-E 3
 * Automatically uploads to Cloudinary
 */
export function AIImageGenerator({
  type,
  context,
  onImageGenerated,
  className,
}: AIImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<{
    public_id?: string;
    url: string;
    revised_prompt?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateAIImage({
        type,
        context,
        options: {
          size: '1792x1024',
          quality: 'hd',
          style: 'natural',
        },
        upload: {
          folder: type === 'listing' ? 'listings' :
                  type === 'article' ? 'articles' :
                  type === 'neighborhood' ? 'neighborhoods' :
                  'ai-generated',
          entityType: type === 'listing' ? 'listing' :
                     type === 'article' ? 'article' :
                     type === 'neighborhood' ? 'neighborhood' :
                     'other',
          alt: context?.title || 'AI Generated Image',
        },
      });

      if (result.success && result.url) {
        setGeneratedImage({
          public_id: result.public_id,
          url: result.url,
          revised_prompt: result.revised_prompt,
        });

        if (result.public_id && onImageGenerated) {
          onImageGenerated(result.public_id, result.url);
        }
      } else {
        setError(result.error || 'Failed to generate image');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full"
        variant="outline"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Görsel Oluşturuluyor...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            AI ile Görsel Oluştur
          </>
        )}
      </Button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Hata Oluştu
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {generatedImage && (
        <div className="mt-4 space-y-3">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Görsel Başarıyla Oluşturuldu!
              </p>
              {generatedImage.revised_prompt && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Kullanılan Prompt: {generatedImage.revised_prompt}
                </p>
              )}
            </div>
          </div>

          <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
            <img
              src={generatedImage.url}
              alt="Generated"
              className="w-full h-auto"
            />
          </div>

          {generatedImage.public_id && (
            <div className="text-xs text-muted-foreground">
              <p>Public ID: <code className="bg-muted px-1 py-0.5 rounded">{generatedImage.public_id}</code></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

