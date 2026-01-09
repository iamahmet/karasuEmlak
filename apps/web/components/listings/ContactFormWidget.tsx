"use client";

import { useState } from "react";
import { Send, User, Mail, Phone, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@karasu/ui";
import { cn } from "@karasu/lib";
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import { validateEmail, validatePhone, validateRequired } from '@/lib/validation/validators';
import { TextField, TextAreaField } from '@/components/forms/FormField';
import { fetchWithRetry } from '@/lib/utils/api-client';

interface ContactFormWidgetProps {
  propertyId: string;
  propertyTitle: string;
  className?: string;
}

export function ContactFormWidget({ propertyId, propertyTitle, className }: ContactFormWidgetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Use form validation hook
  const {
    values: formData,
    errors,
    touched,
    isValid,
    setValue,
    handleChange,
    handleBlur,
    reset,
    validate,
  } = useFormValidation({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      message: `Merhaba, "${propertyTitle}" ilanı hakkında bilgi almak istiyorum.`,
    },
    validators: {
      name: (value) => validateRequired(value, 'Ad Soyad'),
      email: (value) => validateEmail(value),
      phone: (value) => validatePhone(value, true),
      message: (value) => ({ valid: true }), // Optional
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await fetchWithRetry('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, propertyId }),
      });

      if (!data.success) {
        throw new Error(data.message || data.error || 'Form gönderilemedi');
      }

      setIsSuccess(true);
      reset();
      setValue('message', `Merhaba, "${propertyTitle}" ilanı hakkında bilgi almak istiyorum.`);

      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Form submission error:', error);
      }
      // Show error to user (can be enhanced with toast)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("bg-white rounded-xl border-2 border-gray-200 p-6", className)}>
      <div className="mb-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Bilgi Talep Edin</h3>
        <p className="text-sm text-gray-600">Size en kısa sürede dönüş yapalım</p>
      </div>

      {isSuccess ? (
        <div className="p-6 bg-green-50 border-2 border-green-200 rounded-xl text-center">
          <div className="text-4xl mb-3">✅</div>
          <h4 className="font-bold text-green-900 mb-2">Mesajınız Alındı!</h4>
          <p className="text-sm text-green-700">
            En kısa sürede size geri dönüş yapacağız.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Adınız Soyadınız"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange('name')}
            onBlur={handleBlur('name')}
            error={touched.name ? errors.name : undefined}
            required
            placeholder="Adınız Soyadınız"
            className="pl-10"
          />

          <TextField
            label="E-posta Adresiniz"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
            error={touched.email ? errors.email : undefined}
            required
            placeholder="ornek@email.com"
            className="pl-10"
          />

          <TextField
            label="Telefon Numaranız"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange('phone')}
            onBlur={handleBlur('phone')}
            error={touched.phone ? errors.phone : undefined}
            required
            placeholder="05XX XXX XX XX"
            className="pl-10"
          />

          <TextAreaField
            label="Mesajınız"
            name="message"
            value={formData.message}
            onChange={handleChange('message')}
            onBlur={handleBlur('message')}
            rows={4}
            placeholder="İlan hakkında merak ettikleriniz..."
            hint="İsteğe bağlı"
            className="pl-10"
          />

          {/* Contact Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tercih Ettiğiniz İletişim Yöntemi
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className="p-2 border-2 border-gray-200 rounded-lg text-xs font-medium hover:border-[#006AFF] transition-colors"
              >
                📞 Telefon
              </button>
              <button
                type="button"
                className="p-2 border-2 border-gray-200 rounded-lg text-xs font-medium hover:border-[#006AFF] transition-colors"
              >
                💬 WhatsApp
              </button>
              <button
                type="button"
                className="p-2 border-2 border-gray-200 rounded-lg text-xs font-medium hover:border-[#006AFF] transition-colors"
              >
                ✉️ E-posta
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full bg-[#006AFF] hover:bg-[#0052CC] text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Bilgi Talep Et
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Formun gönderilerek{" "}
            <a href="/gizlilik-politikasi" className="text-[#006AFF] hover:underline">
              gizlilik politikasını
            </a>{" "}
            kabul etmiş olursunuz.
          </p>
        </form>
      )}
    </div>
  );
}

