"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { X, Flame, TrendingUp, AlertCircle, Sparkles, Home, FileText, Newspaper, Clock } from "lucide-react";
import { Button } from "@karasu/ui";
import { cn } from "@karasu/lib";

interface NewsTickerProps {
  basePath?: string;
}

interface NewsItem {
  id: string;
  title: string;
  url: string;
  type?: 'breaking' | 'trending' | 'new' | 'featured' | 'listing';
  publishedAt?: string;
  category?: string;
}

/**
 * Premium News Ticker Component
 * 
 * Features:
 * - Auto-scrolling animation
 * - Breaking news indicator
 * - Dismissible
 * - Smooth animations
 * - Apple-quality design
 * - SEO optimized
 */
export function PremiumNewsTicker({ basePath = "" }: NewsTickerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Fetch breaking news from database
  useEffect(() => {
    async function fetchBreakingNews() {
      try {
        const { fetchWithRetry } = await import('@/lib/utils/api-client');
        const data = await fetchWithRetry(`/api/news/breaking?limit=8`);
        if (data.success && data.data?.news) {
          setNewsItems(data.data.news);
        } else if (data.data?.news) {
          // Fallback for different response structure
          setNewsItems(data.data.news);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching breaking news:', error);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchBreakingNews();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchBreakingNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fallback news items
  const fallbackNews: NewsItem[] = [
    {
      id: '1',
      title: 'Karasu\'da yeni konut projeleri start aldı',
      url: `${basePath}/haberler/karasu-yeni-konut-projeleri`,
      type: 'breaking',
      category: 'Haber',
    },
    {
      id: '2',
      title: 'Denize sıfır satılık villalarda fırsatlar',
      url: `${basePath}/satilik?deniz_manzarasi=true`,
      type: 'listing',
      category: 'Satılık',
    },
    {
      id: '3',
      title: '2025 emlak piyasası değerlendirmesi',
      url: `${basePath}/blog/2025-emlak-piyasasi`,
      type: 'featured',
      category: 'Blog',
    },
  ];

  const displayNews = newsItems.length > 0 ? newsItems : fallbackNews;

  // Check if dismissed in localStorage
  useEffect(() => {
    const isDismissed = localStorage.getItem('news-ticker-dismissed');
    if (isDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  // Handle dismiss
  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('news-ticker-dismissed', 'true');
    // Auto-reset after 1 hour
    setTimeout(() => {
      localStorage.removeItem('news-ticker-dismissed');
    }, 3600000);
  };

  // Get icon for news type
  const getNewsIcon = (type?: string) => {
    switch (type) {
      case 'breaking':
        return <Flame className="h-3.5 w-3.5 stroke-[2] text-red-500 animate-pulse" />;
      case 'trending':
        return <TrendingUp className="h-3.5 w-3.5 stroke-[2] text-orange-500" />;
      case 'featured':
        return <Sparkles className="h-3.5 w-3.5 stroke-[2] text-yellow-500" />;
      case 'listing':
        return <Home className="h-3.5 w-3.5 stroke-[2] text-green-500" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5 stroke-[2] text-blue-500" />;
    }
  };

  // Get badge color
  const getBadgeColor = (type?: string) => {
    switch (type) {
      case 'breaking':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30';
      case 'trending':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30';
      case 'featured':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30';
      case 'listing':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30';
      default:
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30';
    }
  };

  // Get badge text
  const getBadgeText = (type?: string) => {
    switch (type) {
      case 'breaking':
        return 'SON DAKİKA';
      case 'trending':
        return 'POPÜLER';
      case 'featured':
        return 'ÖNE ÇIKAN';
      case 'listing':
        return 'YENİ İLAN';
      default:
        return 'YENİ';
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dk önce`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get category icon
  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'Haber':
        return <Newspaper className="h-3 w-3" />;
      case 'Blog':
        return <FileText className="h-3 w-3" />;
      case 'Satılık':
      case 'Kiralık':
        return <Home className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (dismissed || displayNews.length === 0) return null;

  return (
    <div 
      className={cn(
        "relative w-full overflow-hidden",
        "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900",
        "border-b border-gray-700/50",
        "animate-in slide-in-from-top duration-300",
        "shadow-lg shadow-black/20"
      )}
      role="complementary"
      aria-label="Son dakika haberleri"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 animate-pulse-slow" style={{
          backgroundImage: 'linear-gradient(45deg, #006AFF 25%, transparent 25%), linear-gradient(-45deg, #006AFF 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #006AFF 75%), linear-gradient(-45deg, transparent 75%, #006AFF 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        }} />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50" />

      <div className="container mx-auto px-4 lg:px-6 relative">
        <div className="flex items-center h-12 gap-3">
          {/* Breaking News Label */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={cn(
              "px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider",
              "flex items-center gap-1.5",
              "shadow-lg backdrop-blur-sm",
              "animate-pulse-glow",
              getBadgeColor(displayNews[0]?.type)
            )}>
              {getNewsIcon(displayNews[0]?.type)}
              <span>{getBadgeText(displayNews[0]?.type)}</span>
            </div>
            <div className="h-5 w-px bg-gray-600/50" />
          </div>

          {/* News Items - Auto Scroll */}
          <div 
            ref={tickerRef}
            className="flex-1 overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div 
              className={cn(
                "flex gap-8 whitespace-nowrap",
                !isPaused && "animate-scroll-smooth"
              )}
            >
              {/* Render items twice for seamless loop */}
              {[...displayNews, ...displayNews].map((item, index) => (
                <Link
                  key={`${item.id}-${index}`}
                  href={item.url}
                  className={cn(
                    "group flex items-center gap-2.5 px-3 py-1.5 rounded-lg",
                    "text-[14px] font-medium text-white/90",
                    "tracking-[-0.011em]",
                    "transition-all duration-200",
                    "hover:text-white hover:bg-white/10",
                    "cursor-pointer",
                    "backdrop-blur-sm"
                  )}
                >
                  {/* Category Badge */}
                  {item.category && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-semibold text-white/80 group-hover:text-white group-hover:bg-white/20 transition-all">
                      {getCategoryIcon(item.category)}
                      <span>{item.category}</span>
                    </div>
                  )}
                  
                  {/* Dot Separator */}
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
                    item.type === 'breaking' && "bg-red-400 group-hover:bg-red-300 animate-pulse",
                    item.type === 'trending' && "bg-orange-400 group-hover:bg-orange-300",
                    item.type === 'featured' && "bg-yellow-400 group-hover:bg-yellow-300",
                    item.type === 'listing' && "bg-green-400 group-hover:bg-green-300",
                    !item.type && "bg-blue-400 group-hover:bg-blue-300",
                    "transition-colors duration-200"
                  )} />
                  
                  {/* Title */}
                  <span className="group-hover:underline underline-offset-2 flex-1">
                    {item.title}
                  </span>
                  
                  {/* Time */}
                  {item.publishedAt && (
                    <div className="flex items-center gap-1 text-[11px] text-white/60 group-hover:text-white/80 transition-colors">
                      <Clock className="h-3 w-3" />
                      <span suppressHydrationWarning>{formatRelativeTime(item.publishedAt)}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Dismiss Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "flex-shrink-0 h-7 w-7 rounded-md",
              "text-white/70 hover:text-white",
              "hover:bg-white/10",
              "transition-all duration-200"
            )}
            onClick={handleDismiss}
            aria-label="Haberleri gizle"
          >
            <X className="h-4 w-4 stroke-[2]" />
          </Button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="flex gap-8">
            <div className="h-4 w-48 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-white/10 rounded-lg animate-pulse" />
            <div className="h-4 w-56 bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
