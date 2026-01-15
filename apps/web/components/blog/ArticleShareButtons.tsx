'use client';

import { Share2, Facebook, Twitter, Linkedin, Link2, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@karasu/ui';
import { cn } from '@/lib/utils';

interface ArticleShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

/**
 * ArticleShareButtons Component
 * 
 * Social sharing buttons with copy link functionality
 */
export function ArticleShareButtons({
  url,
  title,
  description,
  className,
}: ArticleShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : url;
  const shareText = `${title}${description ? ` - ${description}` : ''}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">
        Paylaş:
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(shareLinks.facebook, '_blank', 'width=600,height=400')}
        className="gap-2"
      >
        <Facebook className="h-4 w-4" />
        <span className="hidden sm:inline">Facebook</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(shareLinks.twitter, '_blank', 'width=600,height=400')}
        className="gap-2"
      >
        <Twitter className="h-4 w-4" />
        <span className="hidden sm:inline">Twitter</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(shareLinks.linkedin, '_blank', 'width=600,height=400')}
        className="gap-2"
      >
        <Linkedin className="h-4 w-4" />
        <span className="hidden sm:inline">LinkedIn</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="gap-2"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            <span className="hidden sm:inline">Kopyalandı!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Linki Kopyala</span>
          </>
        )}
      </Button>
    </div>
  );
}
