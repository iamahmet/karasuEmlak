'use client';

import { useState, FormEvent } from 'react';
import { Button, Label } from '@karasu/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@karasu/ui/components/select';
import { Checkbox } from '@karasu/ui';
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import { validateEmail, validatePhone, validateRequired } from '@/lib/validation/validators';
import { TextField, TextAreaField } from '@/components/forms/FormField';
import { fetchWithRetry } from '@/lib/utils/api-client';

interface LeadCaptureFormProps {
  propertyId?: string;
  propertySlug?: string;
  propertyTitle?: string;
  source?: 'property-detail' | 'homepage' | 'listing-page';
  className?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  preferredContact: 'phone' | 'email' | 'whatsapp';
  budget?: string;
  timeline?: string;
  message?: string;
  consent: boolean;
}

export default function LeadCaptureForm({ 
  propertyId,
  propertySlug,
  propertyTitle,
  source = 'homepage',
  className = '' 
}: LeadCaptureFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [consentError, setConsentError] = useState('');

  const totalSteps = 3;

  // Use form validation hook
  const {
    values: formData,
    errors,
    touched,
    isValid,
    setValue,
    setTouched,
    handleChange,
    handleBlur,
    reset,
    validate,
  } = useFormValidation({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      preferredContact: 'phone' as 'phone' | 'email' | 'whatsapp',
      budget: '',
      timeline: '',
      message: '',
      consent: false,
    },
    validators: {
      name: (value) => validateRequired(value, 'Ad Soyad'),
      email: (value) => validateEmail(value),
      phone: (value) => validatePhone(value, true),
      preferredContact: (value) => ({ valid: true }),
      budget: (value) => ({ valid: true }),
      timeline: (value) => ({ valid: true }),
      message: (value) => ({ valid: true }),
      consent: (value) => {
        if (currentStep === 3 && !value) {
          return { valid: false, error: 'KVKK onayı gereklidir' };
        }
        return { valid: true };
      },
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      // Validate step 1 fields
      const step1Valid = validate();
      return step1Valid;
    }
    
    if (step === 3) {
      // Validate consent
      if (!formData.consent) {
        setConsentError('KVKK onayı gereklidir');
        return false;
      }
      setConsentError('');
      return true;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Handle checkbox change separately
  const handleConsentChange = (checked: boolean) => {
    setValue('consent', checked);
    if (checked) {
      setConsentError('');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setStatus('loading');
    
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
          message: `Lead Capture Form\nBütçe: ${formData.budget || 'Belirtilmedi'}\nZaman: ${formData.timeline || 'Belirtilmedi'}\n${formData.message || ''}`,
          source: `lead_capture_${source}`,
          propertyId,
          propertySlug,
        }),
      });

      if (!data.success) {
        throw new Error(data.message || data.error || 'Form gönderilemedi');
      }

      setStatus('success');
      
      // Reset form after success
      setTimeout(() => {
        reset();
        setValue('preferredContact', 'phone');
        setCurrentStep(1);
        setStatus('idle');
      }, 3000);
    } catch (error) {
      setStatus('error');
      const { handleApiError } = await import('@/lib/utils/api-client');
      const errorInfo = handleApiError(error);
      // Show error in UI (can be enhanced with toast)
      console.error('Form submission error:', errorInfo.userFriendly);
    }
  };

  return (
    <div className={`lead-capture-form ${className}`}>
      <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 md:p-8" noValidate>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Adım {currentStep} / {totalSteps}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Contact Information */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4">
              İletişim Bilgileriniz
            </h3>
            
            <TextField
              label="Ad Soyad"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange('name')}
              onBlur={handleBlur('name')}
              error={touched.name ? errors.name : undefined}
              required
              placeholder="Adınız ve soyadınız"
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
              placeholder="ornek@email.com"
            />

            <TextField
              label="Telefon"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange('phone')}
              onBlur={handleBlur('phone')}
              error={touched.phone ? errors.phone : undefined}
              required
              placeholder="0532 593 38 54"
            />
          </div>
        )}

        {/* Step 2: Property Interest */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4">
              İlan Bilgileri
            </h3>
            
            {propertyTitle && (
              <div className="p-4 bg-muted rounded-lg mb-4">
                <p className="text-sm font-medium mb-1">
                  İlgilendiğiniz İlan:
                </p>
                <p className="text-sm text-muted-foreground">{propertyTitle}</p>
              </div>
            )}

            <div>
              <Label htmlFor="budget">Bütçe Aralığı</Label>
              <Select
                value={formData.budget || ''}
                onValueChange={(value) => setValue('budget', value)}
              >
                <SelectTrigger id="budget">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500000-1000000">500.000 - 1.000.000 ₺</SelectItem>
                  <SelectItem value="1000000-2000000">1.000.000 - 2.000.000 ₺</SelectItem>
                  <SelectItem value="2000000-5000000">2.000.000 - 5.000.000 ₺</SelectItem>
                  <SelectItem value="5000000+">5.000.000 ₺ ve üzeri</SelectItem>
                  <SelectItem value="belirtmek-istemiyorum">Belirtmek istemiyorum</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timeline">Ne Zaman Taşınmayı Planlıyorsunuz?</Label>
              <Select
                value={formData.timeline || ''}
                onValueChange={(value) => setValue('timeline', value)}
              >
                <SelectTrigger id="timeline">
                  <SelectValue placeholder="Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-ay-icinde">1 Ay İçinde</SelectItem>
                  <SelectItem value="1-3-ay">1-3 Ay</SelectItem>
                  <SelectItem value="3-6-ay">3-6 Ay</SelectItem>
                  <SelectItem value="6-12-ay">6-12 Ay</SelectItem>
                  <SelectItem value="12-ay-ustu">12 Ay ve Üzeri</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TextAreaField
              label="Mesajınız"
              name="message"
              value={formData.message || ''}
              onChange={handleChange('message')}
              onBlur={handleBlur('message')}
              rows={4}
              placeholder="Eklemek istediğiniz bilgiler..."
              hint="İsteğe bağlı"
            />
          </div>
        )}

        {/* Step 3: Consent */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4">
              Son Adım
            </h3>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="consent"
                  checked={formData.consent}
                  onCheckedChange={handleConsentChange}
                  required
                />
                <Label htmlFor="consent" className="text-sm cursor-pointer">
                  <span className="text-red-500">*</span> Kişisel verilerimin işlenmesine ve iletişim bilgilerime ulaşılmasına izin veriyorum.{' '}
                  <a href="/gizlilik-politikasi" className="text-primary hover:underline">
                    KVKK Aydınlatma Metni
                  </a>
                </Label>
              </div>
              {(consentError || (touched.consent && errors.consent)) && (
                <p className="mt-2 text-sm text-red-600">{consentError || errors.consent}</p>
              )}
            </div>

            {(errors as any).general && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300">{(errors as any).general}</p>
              </div>
            )}
          </div>
        )}

        {/* Success Message */}
        {status === 'success' && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <svg className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-1">
              Başvurunuz Alındı!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-400">
              En kısa sürede size dönüş yapacağız.
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        {status !== 'success' && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <Button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              variant="outline"
            >
              Geri
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 && !isValid}
              >
                İleri
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={status === 'loading' || !formData.consent}
              >
                {status === 'loading' ? 'Gönderiliyor...' : 'Gönder'}
              </Button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

