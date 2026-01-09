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
        'bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200',
        isCompact ? 'p-4' : 'p-6',
        className
      )}>
        <div className="flex items-center gap-3">
          <CheckCircle className={cn('text-green-600', isCompact ? 'h-4 w-4' : 'h-5 w-5')} />
          <div>
            <h3 className={cn('font-semibold text-green-900', isCompact && 'text-sm')}>Teşekkürler!</h3>
            <p className={cn('text-green-700', isCompact ? 'text-xs' : 'text-sm')}>E-posta adresinize onay linki gönderildi.</p>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant for sidebar
  if (isCompact) {
    return (
      <div className={cn('bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20', className)}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">Bülten</h3>
        </div>
        <p className="text-xs text-gray-600 mb-3">
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
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
          <p className="text-xs text-red-600 mt-2">{error}</p>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn('bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20', className)}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Emlak Güncellemelerinden Haberdar Olun
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Karasu emlak piyasasındaki son gelişmeler, yeni ilanlar ve özel fırsatlar hakkında bilgi alın.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="E-posta adresiniz"
              required
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button
              type="submit"
              disabled={loading || !email}
              className="whitespace-nowrap"
            >
              {loading ? 'Gönderiliyor...' : 'Abone Ol'}
            </Button>
          </form>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
          <p className="text-xs text-gray-500 mt-3">
            Abone olarak <a href="/gizlilik" className="underline hover:text-primary">Gizlilik Politikamızı</a> kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  );
}
