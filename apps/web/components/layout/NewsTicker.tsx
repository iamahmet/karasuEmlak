'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronRight } from 'lucide-react';
import { createClient } from '@karasu/lib/supabase/client';

interface NewsTickerProps {
  basePath?: string;
}

export function NewsTicker({ basePath = '' }: NewsTickerProps) {
  const [latestNews, setLatestNews] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Fetch latest featured news
    const fetchNews = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('news_articles')
          .select('*')
          .eq('published', true)
          .order('published_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data) {
          setLatestNews(data);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
    
    // Check if dismissed in localStorage
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('newsTickerDismissed');
      if (dismissed) {
        setIsDismissed(true);
        setIsVisible(false);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('newsTickerDismissed', 'true');
  };

  if (!latestNews || isDismissed) return null;

  const timeAgo = latestNews.published_at 
    ? new Date(latestNews.published_at).toLocaleDateString('tr-TR', { 
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : '';

  return (
    <div 
      className={`bg-[#006AFF] text-white py-3 px-4 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full h-0 overflow-hidden'
      }`}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* SON DAKİKA Badge */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-wider">SON DAKİKA</span>
            </div>
            
            {/* News Title */}
            <Link 
              href={`${basePath}/haberler/${latestNews.slug}`}
              className="flex-1 min-w-0 hover:underline"
            >
              <span className="text-sm md:text-base font-medium line-clamp-1">
                {latestNews.title}
              </span>
            </Link>
            
            {/* Time Ago */}
            {timeAgo && (
              <span className="text-xs opacity-90 flex-shrink-0 hidden md:inline">
                {timeAgo}
              </span>
            )}
            
            {/* PİYASA Button */}
            <Link
              href={`${basePath}/haberler`}
              className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 flex-shrink-0"
            >
              PİYASA
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          
          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

