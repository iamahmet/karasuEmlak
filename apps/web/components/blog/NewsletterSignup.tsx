'use client';

import { useState } from 'react';
import { Mail, CheckCircle, Bell } from 'lucide-react';
import { Button } from '@karasu/ui';
import { cn } from '@karasu/lib';
import { trackNewsletterSignup } from '@/lib/analytics/blog-events';

interface NewsletterSignupProps {
  className?: string;
  articleId?: string;
  articleSlug?: string;
  articleTitle?: string;
  variant?: 'default' | 'compact';
}

export function NewsletterSignup({ className = '', articleId, articleSlug, articleTitle, variant = 'default' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCompact = variant === 'compact';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          name: null,
          source: articleSlug ? `blog-${articleSlug}` : 'blog-sidebar',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Abonelik başarısız');
      }

      // Track newsletter signup
      if (articleId && articleSlug && articleTitle) {
        trackNewsletterSignup({
          articleId,
          articleSlug,
          articleTitle,
        });
      }
      
      // Track GA event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'newsletter_signup', {
          event_category: 'engagement',
          event_label: articleSlug || 'blog-sidebar',
        });
      }
      
      setSubmitted(true);
      setEmail('');
      
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={cn(
        'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl border-2 border-green-200 dark:border-emerald-800',
        isCompact ? 'p-4' : 'p-6',
        className
      )}>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl">
            <CheckCircle className={cn('text-emerald-600 dark:text-emerald-400', isCompact ? 'h-4 w-4' : 'h-5 w-5')} />
          </div>
          <div>
            <h3 className={cn('font-bold text-emerald-900 dark:text-emerald-100', isCompact && 'text-sm')}>Teşekkürler!</h3>
            <p className={cn('text-emerald-700 dark:text-emerald-300', isCompact ? 'text-xs' : 'text-sm')}>E-posta adresinize onay linki gönderildi.</p>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant for sidebar
  if (isCompact) {
    return (
      <div className={cn('bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-2xl p-4 border-2 border-gray-200 dark:border-gray-700', className)}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Bülten</h3>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          Yeni içeriklerden haberdar olun.
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="E-posta"
            required
            className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Button
            type="submit"
            disabled={loading || !email}
            className="w-full text-sm"
            size="sm"
          >
            {loading ? 'Gönderiliyor...' : 'Abone Ol'}
          </Button>
        </form>
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-2xl p-6 md:p-8 border-2 border-gray-200 dark:border-gray-700 shadow-sm', className)}>
      <div className="flex items-start gap-5">
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30">
            <Mail className="h-7 w-7 text-primary" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2">
            Emlak Güncellemelerinden Haberdar Olun
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Karasu emlak piyasasındaki son gelişmeler, yeni ilanlar ve özel fırsatlar hakkında bilgi alın.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="E-posta adresiniz"
              required
              className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button
              type="submit"
              disabled={loading || !email}
              className="whitespace-nowrap sm:self-stretch"
            >
              {loading ? 'Gönderiliyor...' : 'Abone Ol'}
            </Button>
          </form>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Abone olarak <a href="/gizlilik" className="underline hover:text-primary">Gizlilik Politikamızı</a> kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  );
}
