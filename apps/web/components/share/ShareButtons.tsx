'use client';

import { useEffect, useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@karasu/ui';
import { cn } from '@karasu/lib';
import { trackArticleShare } from '@/lib/analytics/blog-events';
import { EnhancedShareButtons } from './EnhancedShareButtons';
import { generateShareUrl, trackShare } from '@/lib/services/social-sharing';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  articleId?: string;
  articleSlug?: string;
  variant?: 'default' | 'compact' | 'enhanced';
  listingId?: string;
  listingSlug?: string;
  image?: string;
}

export default function ShareButtons({ 
  url, 
  title, 
  description = '',
  className = '',
  articleId,
  articleSlug,
  variant = 'default',
  listingId,
  listingSlug,
  image,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  // Use enhanced version for listings
  if (variant === 'enhanced' || listingId) {
    return (
      <EnhancedShareButtons
        url={url}
        title={title}
        description={description}
        image={image}
        className={className}
        variant="default"
        listingId={listingId}
        listingSlug={listingSlug}
        onShare={(platform) => {
          if (articleId && articleSlug) {
            trackArticleShare(
              {
                articleId,
                articleSlug,
                articleTitle: title,
              },
              platform as any
            );
          }
        }}
      />
    );
  }

  const shareData = {
    title,
    text: description,
    url,
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled (AbortError) is expected, don't log
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Copy to clipboard failed:', err);
      }
    }
  };

  const shareLinks = {
    facebook: generateShareUrl('facebook', url, title, description),
    twitter: generateShareUrl('twitter', url, title, description),
    whatsapp: generateShareUrl('whatsapp', url, title, description),
    linkedin: generateShareUrl('linkedin', url, title, description),
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Native Share */}
      {canNativeShare && (
        <Button
          onClick={handleShare}
          size="icon"
          variant="outline"
          className="w-11 h-11"
          aria-label="Paylaş"
          title="Paylaş"
        >
          <Share2 className="w-5 h-5" />
        </Button>
      )}
      
      {/* Facebook */}
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          trackShare('facebook', url);
          if (articleId && articleSlug) {
            trackArticleShare(
              {
                articleId,
                articleSlug,
                articleTitle: title,
              },
              'facebook'
            );
          }
        }}
        className="w-11 h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
        aria-label="Facebook'ta paylaş"
        title="Facebook"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>
      
      {/* Twitter/X */}
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 rounded-lg bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 flex items-center justify-center transition-colors"
        aria-label="X (Twitter)'da paylaş"
        title="X (Twitter)"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>
      
      {/* WhatsApp */}
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          trackShare('whatsapp', url);
          if (articleId && articleSlug) {
            trackArticleShare(
              {
                articleId,
                articleSlug,
                articleTitle: title,
              },
              'whatsapp'
            );
          }
        }}
        className="w-11 h-11 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-colors"
        aria-label="WhatsApp'ta paylaş"
        title="WhatsApp"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.29 1.262.463 1.694.593.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

      {/* Copy Link */}
      <Button
        onClick={() => {
          handleCopy();
          if (articleId && articleSlug) {
            trackArticleShare(
              {
                articleId,
                articleSlug,
                articleTitle: title,
              },
              'copy'
            );
          }
        }}
        size="icon"
        variant={copied ? "default" : "outline"}
        className={cn(
          "w-11 h-11",
          copied && "bg-green-600 hover:bg-green-700 text-white"
        )}
        aria-label="Linki kopyala"
        title={copied ? 'Kopyalandı!' : 'Linki kopyala'}
      >
        {copied ? (
          <Check className="w-5 h-5" />
        ) : (
          <Copy className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}
