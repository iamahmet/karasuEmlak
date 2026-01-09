'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@karasu/ui';
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import { validateEmail } from '@/lib/validation/validators';
import { TextField } from '@/components/forms/FormField';
import { fetchWithRetry } from '@/lib/utils/api-client';
import { Label } from '@karasu/ui';

interface NewsletterFormProps {
  variant?: 'simple' | 'detailed';
  className?: string;
  source?: string;
}

/**
 * Enhanced Newsletter Form with Segmentation
 * SEO-friendly with proper form semantics
 */
export default function NewsletterForm({ 
  variant = 'simple',
  className = '',
  source = 'footer'
}: NewsletterFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Use form validation hook
  const {
    values: formData,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    reset,
    validate,
  } = useFormValidation({
    initialValues: {
      email: '',
      name: '',
    },
    validators: {
      email: (value) => validateEmail(value),
      name: (value) => ({ valid: true }), // Optional
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    if (!validate()) {
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const data = await fetchWithRetry('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name || undefined,
          source,
        }),
      });

      if (!data.success) {
        throw new Error(data.message || data.error || 'Abonelik oluşturulamadı');
      }

      setStatus('success');
      reset();

      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      const { handleApiError } = await import('@/lib/utils/api-client');
      const errorInfo = handleApiError(error);
      setErrorMessage(errorInfo.userFriendly);
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  if (variant === 'simple') {
    return (
      <form onSubmit={handleSubmit} className={`newsletter-form-simple ${className}`} noValidate>
        <div className="flex gap-2">
          <div className="flex-1">
            <TextField
              label=""
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              error={touched.email ? errors.email : undefined}
              placeholder="E-posta adresiniz"
              required
              className="w-full"
            />
          </div>
          <Button
            type="submit"
            disabled={status === 'loading' || !isValid}
            aria-label="Newsletter'e abone ol"
            className="shrink-0"
          >
            {status === 'loading' ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : status === 'success' ? (
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              'Abone Ol'
            )}
          </Button>
        </div>
        {status === 'success' && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">Başarıyla abone oldunuz!</p>
        )}
        {status === 'error' && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">{errorMessage || 'Bir hata oluştu'}</p>
        )}
        <p className="text-xs text-muted-foreground leading-relaxed mt-2">
          Yeni ilanlar ve güncellemelerden haberdar olmak için e-posta adresinizi girin.
        </p>
      </form>
    );
  }

  // Detailed variant
  return (
    <form onSubmit={handleSubmit} className={`newsletter-form-detailed bg-card rounded-xl border p-6 ${className}`} noValidate>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          Newsletter'e Abone Olun
        </h3>
        <p className="text-sm text-muted-foreground">
          Size özel ilan önerileri ve güncellemeler alın
        </p>
      </div>

      <div className="space-y-4">
        <TextField
          label="E-posta"
          name="newsletter-email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          onBlur={handleBlur('email')}
          error={touched.email ? errors.email : undefined}
          required
          placeholder="ornek@email.com"
          disabled={status === 'loading'}
        />

        <TextField
          label="Ad Soyad"
          name="newsletter-name"
          type="text"
          value={formData.name}
          onChange={handleChange('name')}
          onBlur={handleBlur('name')}
          placeholder="Adınız ve soyadınız (opsiyonel)"
          disabled={status === 'loading'}
          hint="İsteğe bağlı"
        />

        <Button
          type="submit"
          disabled={status === 'loading' || !isValid}
          className="w-full"
        >
          {status === 'loading' ? 'Gönderiliyor...' : 'Abone Ol'}
        </Button>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-300">
              Başarıyla abone oldunuz! Hoş geldiniz e-postası gönderilecektir.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">
              {errorMessage || 'Bir hata oluştu. Lütfen tekrar deneyin.'}
            </p>
          </div>
        )}
      </div>
    </form>
  );
}

