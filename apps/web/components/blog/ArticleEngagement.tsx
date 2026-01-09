'use client';

import { useEffect, useState } from 'react';
import { Heart, Bookmark, Share2 } from 'lucide-react';
import { Button } from '@karasu/ui';
import { cn } from '@karasu/lib';

interface ArticleEngagementProps {
  articleId: string;
  articleSlug: string;
  articleTitle: string;
  className?: string;
}

export function ArticleEngagement({
  articleId,
  articleSlug,
  articleTitle,
  className = '',
}: ArticleEngagementProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    // Track time spent reading
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLike = () => {
    setLiked(!liked);
    // Track like event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'article_like', {
        event_category: 'engagement',
        event_label: articleSlug,
        value: !liked ? 1 : 0,
      });
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    // Track bookmark event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'article_bookmark', {
        event_category: 'engagement',
        event_label: articleSlug,
        value: !bookmarked ? 1 : 0,
      });
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLike}
        className={cn(
          "w-10 h-10",
          liked && "text-red-600 hover:text-red-700"
        )}
        aria-label={liked ? 'Beğeniyi kaldır' : 'Beğen'}
      >
        <Heart className={cn("h-5 w-5", liked && "fill-current")} />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleBookmark}
        className={cn(
          "w-10 h-10",
          bookmarked && "text-primary"
        )}
        aria-label={bookmarked ? 'Yer iminden çıkar' : 'Yer imine ekle'}
      >
        <Bookmark className={cn("h-5 w-5", bookmarked && "fill-current")} />
      </Button>

      {timeSpent > 30 && (
        <span className="text-xs text-gray-500 ml-2">
          {Math.floor(timeSpent / 60)} dk okundu
        </span>
      )}
    </div>
  );
}
