'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, Send, Sparkles } from 'lucide-react';
import { Button } from '@karasu/ui';
import { cn } from '@karasu/lib';

interface BlogNewsletterSectionProps {
  className?: string;
}

export function BlogNewsletterSection({ className }: BlogNewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          name: null,
          source: 'blog-page',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Abonelik başarısız');
      }

      setStatus('success');
      setMessage('Başarıyla abone oldunuz! Teşekkürler.');
      setEmail('');

      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Bir hata oluştu');
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  return (
    <section className={cn('bg-gradient-to-br from-primary/5 via-primary/10 to-blue-50 rounded-xl p-6 md:p-7 border border-primary/20 shadow-sm', className)}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Blog Güncellemelerini Kaçırmayın
        </h2>
        <p className="text-sm md:text-base text-gray-700 mb-6 leading-relaxed">
          Yeni blog yazıları, emlak rehberleri ve yatırım ipuçlarından haberdar olmak için e-posta listemize katılın.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <div className="flex-1 relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresiniz"
              required
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white text-gray-900 placeholder:text-gray-400"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>
          <Button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="px-6 py-3 font-semibold whitespace-nowrap"
            size="lg"
          >
            {status === 'loading' ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Gönderiliyor...
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Abone Oldunuz!
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Abone Ol
              </>
            )}
          </Button>
        </form>

        {message && (
          <div
            className={cn(
              'mt-4 p-4 rounded-lg flex items-center gap-3 max-w-md mx-auto',
              status === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            )}
          >
            {status === 'success' ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-500">
          Gizliliğinize saygı duyuyoruz. İstediğiniz zaman abonelikten çıkabilirsiniz.
        </p>
      </div>
    </section>
  );
}
