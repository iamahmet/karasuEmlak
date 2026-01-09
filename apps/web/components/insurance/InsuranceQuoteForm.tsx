'use client';

import { useState, FormEvent } from 'react';
import { Button, Label } from '@karasu/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@karasu/ui/components/select';
import { Checkbox } from '@karasu/ui';
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import { validateEmail, validatePhone, validateRequired } from '@/lib/validation/validators';
import { TextField, TextAreaField } from '@/components/forms/FormField';
import { fetchWithRetry } from '@/lib/utils/api-client';
import { Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface InsuranceQuoteFormProps {
  className?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  propertyValue: string;
  insuranceType: string;
  preferredContact: 'phone' | 'email' | 'whatsapp';
  message?: string;
  consent: boolean;
}

export default function InsuranceQuoteForm({ className = '' }: InsuranceQuoteFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [consentError, setConsentError] = useState('');

  const {
    values: formData,
    errors,
    touched,
    setValue,
    setTouched,
    reset,
    validate,
  } = useFormValidation({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      propertyType: '',
      propertyValue: '',
      insuranceType: '',
      preferredContact: 'phone' as 'phone' | 'email' | 'whatsapp',
      message: '',
      consent: false,
    },
    validators: {
      name: (value) => validateRequired(value, 'Ad Soyad'),
      email: (value) => validateEmail(value),
      phone: (value) => validatePhone(value, true),
      propertyType: (value) => validateRequired(value, 'Gayrimenkul Tipi'),
      propertyValue: (value) => validateRequired(value, 'Gayrimenkul Değeri'),
      insuranceType: (value) => validateRequired(value, 'Sigorta Türü'),
      preferredContact: (value) => ({ valid: true }),
      message: (value) => ({ valid: true }),
      consent: (value) => {
        if (!value) {
          return { valid: false, error: 'KVKK onayı gereklidir' };
        }
        return { valid: true };
      },
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleConsentChange = (checked: boolean) => {
    setValue('consent', checked);
    if (checked) {
      setConsentError('');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.consent) {
      setConsentError('KVKK onayı gereklidir');
      return;
    }

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
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: `Sigorta Teklifi Talebi\nGayrimenkul Tipi: ${formData.propertyType}\nGayrimenkul Değeri: ${formData.propertyValue}\nSigorta Türü: ${formData.insuranceType}\nTercih Edilen İletişim: ${formData.preferredContact}\n${formData.message ? `Mesaj: ${formData.message}` : ''}`,
          source: 'insurance_quote',
        }),
      });

      if (!data.success) {
        throw new Error(data.message || data.error || 'Form gönderilemedi');
      }

      setStatus('success');
      
      setTimeout(() => {
        reset();
        setValue('preferredContact', 'phone');
        setStatus('idle');
      }, 3000);
    } catch (error) {
      setStatus('error');
      const { handleApiError } = await import('@/lib/utils/api-client');
      const errorInfo = handleApiError(error);
      setErrorMessage(errorInfo.userFriendly || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 p-6 lg:p-8 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-[#006AFF]/10 dark:bg-[#006AFF]/20 flex items-center justify-center">
          <Shield className="h-6 w-6 text-[#006AFF]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Ücretsiz Sigorta Teklifi Alın
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Formu doldurun, size en uygun sigorta çözümünü sunalım
          </p>
        </div>
      </div>

      {status === 'success' ? (
        <div className="text-center py-8">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Talebiniz Alındı!
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            En kısa sürede sizinle iletişime geçeceğiz.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <TextField
              label="Ad Soyad *"
              name="name"
              value={formData.name}
              onChange={(value) => setValue('name', value)}
              onBlur={() => setTouched('name', true)}
              error={touched.name ? errors.name : undefined}
              required
            />

            <TextField
              label="E-posta *"
              name="email"
              type="email"
              value={formData.email}
              onChange={(value) => setValue('email', value)}
              onBlur={() => setTouched('email', true)}
              error={touched.email ? errors.email : undefined}
              required
            />
          </div>

          <TextField
            label="Telefon *"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(value) => setValue('phone', value)}
            onBlur={() => setTouched('phone', true)}
            error={touched.phone ? errors.phone : undefined}
            required
          />

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <Label htmlFor="propertyType" className="mb-2 block">
                Gayrimenkul Tipi *
              </Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value) => setValue('propertyType', value)}
              >
                <SelectTrigger id="propertyType" className={touched.propertyType && errors.propertyType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Daire</SelectItem>
                  <SelectItem value="house">Villa/Müstakil</SelectItem>
                  <SelectItem value="commercial">Ticari</SelectItem>
                  <SelectItem value="land">Arsa</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
              {touched.propertyType && errors.propertyType && (
                <p className="text-sm text-red-500 mt-1">{errors.propertyType}</p>
              )}
            </div>

            <div>
              <Label htmlFor="propertyValue" className="mb-2 block">
                Gayrimenkul Değeri (TL) *
              </Label>
              <Select
                value={formData.propertyValue}
                onValueChange={(value) => setValue('propertyValue', value)}
              >
                <SelectTrigger id="propertyValue" className={touched.propertyValue && errors.propertyValue ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-500k">0 - 500.000 TL</SelectItem>
                  <SelectItem value="500k-1m">500.000 - 1.000.000 TL</SelectItem>
                  <SelectItem value="1m-2m">1.000.000 - 2.000.000 TL</SelectItem>
                  <SelectItem value="2m-5m">2.000.000 - 5.000.000 TL</SelectItem>
                  <SelectItem value="5m+">5.000.000 TL ve üzeri</SelectItem>
                </SelectContent>
              </Select>
              {touched.propertyValue && errors.propertyValue && (
                <p className="text-sm text-red-500 mt-1">{errors.propertyValue}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="insuranceType" className="mb-2 block">
              Sigorta Türü *
            </Label>
            <Select
              value={formData.insuranceType}
              onValueChange={(value) => setValue('insuranceType', value)}
            >
              <SelectTrigger id="insuranceType" className={touched.insuranceType && errors.insuranceType ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dask">DASK (Zorunlu Deprem Sigortası)</SelectItem>
                <SelectItem value="home">Konut Sigortası</SelectItem>
                <SelectItem value="fire">Yangın Sigortası</SelectItem>
                <SelectItem value="comprehensive">Kapsamlı Sigorta Paketi</SelectItem>
                <SelectItem value="other">Diğer</SelectItem>
              </SelectContent>
            </Select>
            {touched.insuranceType && errors.insuranceType && (
              <p className="text-sm text-red-500 mt-1">{errors.insuranceType}</p>
            )}
          </div>

          <div>
            <Label htmlFor="preferredContact" className="mb-2 block">
              Tercih Edilen İletişim Yöntemi
            </Label>
            <Select
              value={formData.preferredContact}
              onValueChange={(value: 'phone' | 'email' | 'whatsapp') => setValue('preferredContact', value)}
            >
              <SelectTrigger id="preferredContact">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Telefon</SelectItem>
                <SelectItem value="email">E-posta</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TextAreaField
            label="Mesaj (Opsiyonel)"
            name="message"
            value={formData.message || ''}
            onChange={(value) => setValue('message', value)}
            rows={4}
            placeholder="Ek bilgi veya özel isteklerinizi buraya yazabilirsiniz..."
          />

          <div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="consent"
                checked={formData.consent}
                onCheckedChange={handleConsentChange}
                className={consentError ? 'border-red-500' : ''}
              />
              <Label htmlFor="consent" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <span className="text-red-500">*</span> KVKK Aydınlatma Metni'ni okudum ve kabul ediyorum. Kişisel verilerimin işlenmesine onay veriyorum.
              </Label>
            </div>
            {consentError && (
              <p className="text-sm text-red-500 mt-1">{consentError}</p>
            )}
          </div>

          {status === 'error' && errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{errorMessage}</p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full bg-[#006AFF] hover:bg-[#0052CC] text-white"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Ücretsiz Teklif Al
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
