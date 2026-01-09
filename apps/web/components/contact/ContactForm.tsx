'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@karasu/ui';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import { validateEmail, validateRequired, validateLength } from '@/lib/validation/validators';
import { TextField, TextAreaField } from '@/components/forms/FormField';
import { fetchWithRetry } from '@/lib/utils/api-client';

export default function ContactForm() {
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
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
    validators: {
      name: (value) => validateRequired(value, 'Ad Soyad'),
      email: (value) => validateEmail(value),
      phone: (value) => ({ valid: true }), // Optional
      subject: (value) => validateRequired(value, 'Konu'),
      message: (value) => {
        const required = validateRequired(value, 'Mesaj');
        if (!required.valid) return required;
        return validateLength(value, { min: 10, fieldName: 'Mesaj' });
      },
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
      const data = await fetchWithRetry('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!data.success) {
        throw new Error(data.message || data.error || 'Mesaj gönderilemedi');
      }

      setStatus('success');
      reset();

      setTimeout(() => setStatus('idle'), 5000);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField
        label="Ad Soyad"
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange('name')}
        onBlur={handleBlur('name')}
        error={touched.name ? errors.name : undefined}
        required
        disabled={status === 'loading'}
      />

      <TextField
        label="E-posta"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
        onBlur={handleBlur('email')}
        error={touched.email ? errors.email : undefined}
        required
        disabled={status === 'loading'}
      />

      <TextField
        label="Telefon"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange('phone')}
        onBlur={handleBlur('phone')}
        disabled={status === 'loading'}
        hint="İsteğe bağlı"
      />

      <TextField
        label="Konu"
        name="subject"
        type="text"
        value={formData.subject}
        onChange={handleChange('subject')}
        onBlur={handleBlur('subject')}
        error={touched.subject ? errors.subject : undefined}
        required
        disabled={status === 'loading'}
      />

      <TextAreaField
        label="Mesaj"
        name="message"
        value={formData.message}
        onChange={handleChange('message')}
        onBlur={handleBlur('message')}
        error={touched.message ? errors.message : undefined}
        required
        rows={6}
        disabled={status === 'loading'}
        hint="En az 10 karakter"
      />

      <Button
        type="submit"
        className="w-full"
        disabled={status === 'loading' || !isValid}
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gönderiliyor...
          </>
        ) : (
          'Gönder'
        )}
      </Button>

      {status === 'success' && (
        <div className="p-4 md:p-5 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3 md:gap-4 animate-fade-in" role="alert">
          <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm md:text-base font-semibold text-green-800 dark:text-green-200 mb-1">
              Mesajınız başarıyla gönderildi!
            </p>
            <p className="text-xs md:text-sm text-green-600 dark:text-green-400 leading-relaxed">
              En kısa sürede size dönüş yapacağız.
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 md:p-5 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 md:gap-4 animate-fade-in" role="alert">
          <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm md:text-base font-semibold text-red-800 dark:text-red-200 mb-1">
              Bir hata oluştu
            </p>
            <p className="text-xs md:text-sm text-red-600 dark:text-red-400 leading-relaxed">
              {errorMessage || 'Lütfen tekrar deneyiniz.'}
            </p>
          </div>
        </div>
      )}
    </form>
  );
}

