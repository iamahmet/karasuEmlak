'use client';

import { useEffect, useState } from 'react';
import { Quote as QuoteIcon, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { fetchWithRetry } from '@/lib/utils/api-client';

interface Quote {
  text: string;
  author?: string;
  category?: string;
}

interface QuoteWidgetProps {
  className?: string;
}

export function QuoteWidget({ className = '' }: QuoteWidgetProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQuote = async () => {
    try {
      setLoading(true);
      const response = await fetchWithRetry<Quote>(
        '/api/services/quote'
      );

      if (response.success && response.data) {
        setQuote(response.data);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Quote fetch error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  if (loading && !quote) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <QuoteIcon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm italic text-muted-foreground mb-2">
              "{quote.text}"
            </p>
            {quote.author && (
              <p className="text-xs text-muted-foreground text-right">
                — {quote.author}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchQuote}
            disabled={loading}
            className="flex-shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
