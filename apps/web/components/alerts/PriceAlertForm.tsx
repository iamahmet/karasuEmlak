'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@karasu/ui';
import { Input } from '@karasu/ui';
import { Label } from '@karasu/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@karasu/ui';
import { Checkbox } from '@karasu/ui';
import { Bell, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFormValidation } from '@/lib/hooks/useFormValidation';
import { validateEmail, validateRequired } from '@/lib/validation/validators';
import { fetchWithRetry } from '@/lib/utils/api-client';
import { toast } from 'sonner';
import { cn } from '@karasu/lib';

interface PriceAlertFormProps {
  initialFilters?: {
    minPrice?: number;
    maxPrice?: number;
    propertyType?: string;
    location?: string;
    neighborhood?: string;
  };
  className?: string;
  onSuccess?: () => void;
}

const PROPERTY_TYPES = [
  { value: 'daire', label: 'Daire' },
  { value: 'villa', label: 'Villa' },
  { value: 'ev', label: 'Ev' },
  { value: 'yazlik', label: 'Yazlık' },
  { value: 'arsa', label: 'Arsa' },
  { value: 'isyeri', label: 'İşyeri' },
  { value: 'dukkan', label: 'Dükkan' },
];

const FREQUENCY_OPTIONS = [
  { value: 'immediate', label: 'Anında' },
  { value: 'daily', label: 'Günlük' },
  { value: 'weekly', label: 'Haftalık' },
];

export function PriceAlertForm({ initialFilters, className, onSuccess }: PriceAlertFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    values: formData,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    reset,
    validate,
    setValue,
  } = useFormValidation({
    initialValues: {
      email: '',
      name: '',
      minPrice: initialFilters?.minPrice?.toString() || '',
      maxPrice: initialFilters?.maxPrice?.toString() || '',
      propertyType: initialFilters?.propertyType || '',
      location: initialFilters?.location || 'Karasu',
      neighborhood: initialFilters?.neighborhood || '',
      frequency: 'daily',
      email_notifications: true,
      push_notifications: false,
    },
    validators: {
      email: (value) => validateEmail(value),
      name: (value) => ({ valid: true }), // Optional
      minPrice: (value) => ({ valid: true }), // Optional
      maxPrice: (value) => ({ valid: true }), // Optional
      propertyType: (value) => ({ valid: true }), // Optional
      location: (value) => ({ valid: true }),
      neighborhood: (value) => ({ valid: true }),
      frequency: (value) => ({ valid: true }),
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Validate at least one filter is set
    const hasFilters =
      formData.minPrice ||
      formData.maxPrice ||
      (formData.propertyType && formData.propertyType !== 'all') ||
      formData.neighborhood;

    if (!hasFilters) {
      toast.error('En az bir filtre kriteri belirtmelisiniz');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const filters: any = {};
      if (formData.minPrice) filters.min_price = parseFloat(formData.minPrice);
      if (formData.maxPrice) filters.max_price = parseFloat(formData.maxPrice);
      if (formData.propertyType) filters.property_type = formData.propertyType;
      if (formData.location) filters.location = formData.location;
      if (formData.neighborhood) filters.neighborhood = formData.neighborhood;

      const data = await fetchWithRetry('/api/alerts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name || undefined,
          filters,
          frequency: formData.frequency,
          email_notifications: formData.email_notifications,
          push_notifications: formData.push_notifications,
        }),
      });

      if (!data.success) {
        throw new Error(data.error || 'Fiyat uyarısı oluşturulamadı');
      }

      setStatus('success');
      toast.success('Fiyat uyarısı oluşturuldu!', {
        description: 'Yeni ilanlar bulunduğunda size bildirim göndereceğiz.',
      });
      reset();
      onSuccess?.();

      setTimeout(() => setStatus('idle'), 3000);
    } catch (error: any) {
      setStatus('error');
      const { handleApiError } = await import('@/lib/utils/api-client');
      const errorInfo = handleApiError(error);
      setErrorMessage(errorInfo.userFriendly);
      toast.error('Fiyat uyarısı oluşturulamadı', {
        description: errorInfo.userFriendly,
      });
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  if (status === 'success') {
    return (
      <div className={cn('p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg', className)}>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">Fiyat Uyarısı Oluşturuldu!</h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Yeni ilanlar bulunduğunda size e-posta ile bildirim göndereceğiz.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)} noValidate>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email" className="text-sm font-semibold">
              E-posta Adresi <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email')(e.target.value)}
              onBlur={handleBlur('email')}
              placeholder="ornek@email.com"
              className={cn(
                'mt-1',
                errors.email && touched.email && 'border-red-500 focus:border-red-500'
              )}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && touched.email && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1" id="email-error">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="name" className="text-sm font-semibold">
              Ad Soyad (Opsiyonel)
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name')(e.target.value)}
              placeholder="Adınız Soyadınız"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minPrice" className="text-sm font-semibold">
              Minimum Fiyat (TL)
            </Label>
            <Input
              id="minPrice"
              type="number"
              value={formData.minPrice}
              onChange={(e) => handleChange('minPrice')(e.target.value)}
              placeholder="Örn: 500000"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="maxPrice" className="text-sm font-semibold">
              Maksimum Fiyat (TL)
            </Label>
            <Input
              id="maxPrice"
              type="number"
              value={formData.maxPrice}
              onChange={(e) => handleChange('maxPrice')(e.target.value)}
              placeholder="Örn: 2000000"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="propertyType" className="text-sm font-semibold">
              Emlak Tipi
            </Label>
            <Select
              value={formData.propertyType || undefined}
              onValueChange={(value) => handleChange('propertyType')(value === "all" ? '' : value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Tümü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location" className="text-sm font-semibold">
              Lokasyon
            </Label>
            <Input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location')(e.target.value)}
              placeholder="Karasu"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="neighborhood" className="text-sm font-semibold">
            Mahalle (Opsiyonel)
          </Label>
          <Input
            id="neighborhood"
            type="text"
            value={formData.neighborhood}
            onChange={(e) => handleChange('neighborhood')(e.target.value)}
            placeholder="Örn: Merkez, Sahil"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="frequency" className="text-sm font-semibold">
            Bildirim Sıklığı
          </Label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => handleChange('frequency')(value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="email_notifications"
              checked={formData.email_notifications}
              onCheckedChange={(checked) => setValue('email_notifications', checked as boolean)}
            />
            <Label htmlFor="email_notifications" className="text-sm font-normal cursor-pointer">
              E-posta bildirimleri al
            </Label>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="push_notifications"
                checked={formData.push_notifications}
                onCheckedChange={(checked) => setValue('push_notifications', checked as boolean)}
              />
              <Label htmlFor="push_notifications" className="text-sm font-normal cursor-pointer">
                Push bildirimleri al (PWA)
              </Label>
            </div>
            {formData.push_notifications && (
              <div className="text-xs text-gray-500">
                Push bildirimleri için tarayıcı izni gerekebilir
              </div>
            )}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={status === 'loading'}
        className="w-full"
        size="lg"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Oluşturuluyor...
          </>
        ) : (
          <>
            <Bell className="w-4 h-4 mr-2" />
            Fiyat Uyarısı Oluştur
          </>
        )}
      </Button>
    </form>
  );
}
