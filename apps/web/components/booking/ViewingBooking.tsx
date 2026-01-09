'use client';

import { useState, FormEvent } from 'react';
import { Button, Input, Label, Textarea } from '@karasu/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@karasu/ui/components/select';
import { Calendar, Clock } from 'lucide-react';

interface ViewingBookingProps {
  propertyId?: string;
  propertySlug?: string;
  propertyTitle?: string;
  className?: string;
}

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
}

export default function ViewingBooking({ 
  propertyId,
  propertySlug,
  propertyTitle,
  className = '' 
}: ViewingBookingProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Generate available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00',
  ];

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ad Soyad gereklidir';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon gereklidir';
    } else if (!/^(\+90|0)?[5][0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    }
    
    if (!formData.preferredDate) {
      newErrors.preferredDate = 'Tarih seçiniz';
    }
    
    if (!formData.preferredTime) {
      newErrors.preferredTime = 'Saat seçiniz';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setStatus('loading');
    
    try {
      const { fetchWithRetry } = await import('@/lib/utils/api-client');
      const data = await fetchWithRetry('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: `Görüntüleme Randevusu\nTarih: ${formData.preferredDate}\nSaat: ${formData.preferredTime}\n${formData.message ? `Mesaj: ${formData.message}` : ''}`,
          source: 'viewing_booking',
          propertyId,
          propertySlug,
        }),
      });

      if (!data.success) {
        throw new Error(data.error || data.message || 'Randevu oluşturulamadı');
      }

      setStatus('success');
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          preferredDate: '',
          preferredTime: '',
          message: '',
        });
        setStatus('idle');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setErrors({ general: 'Bir hata oluştu. Lütfen tekrar deneyin veya telefon ile iletişime geçin.' });
    }
  };

  return (
    <div className={`viewing-booking ${className}`}>
      <form onSubmit={handleSubmit} className="bg-card rounded-xl border p-6 md:p-8" noValidate>
        <div className="mb-6">
          <h3 className="text-lg md:text-xl font-semibold mb-2">
            Görüntüleme Randevusu Oluştur
          </h3>
          <p className="text-sm text-muted-foreground">
            {propertyTitle 
              ? `${propertyTitle} için görüntüleme randevusu oluşturun`
              : 'İlan görüntüleme randevusu oluşturun'}
          </p>
        </div>

        {/* Success Message */}
        {status === 'success' && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-1">
                  Randevunuz Oluşturuldu!
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Randevu detayları e-posta ve SMS ile gönderilecektir. Onay için size kısa süre içinde dönüş yapacağız.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">{errors.general}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="booking-name">
              Ad Soyad <span className="text-red-500">*</span>
            </Label>
            <Input
              id="booking-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Adınız ve soyadınız"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="booking-email">
              E-posta <span className="text-red-500">*</span>
            </Label>
            <Input
              id="booking-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="ornek@email.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="booking-phone">
              Telefon <span className="text-red-500">*</span>
            </Label>
            <Input
              id="booking-phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="0546 639 54 61"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="booking-date">
                <Calendar className="w-4 h-4 inline mr-1" />
                Tercih Edilen Tarih <span className="text-red-500">*</span>
              </Label>
              <Input
                id="booking-date"
                name="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={handleChange}
                min={getMinDate()}
                max={getMaxDate()}
                required
                className={errors.preferredDate ? 'border-red-500' : ''}
              />
              {errors.preferredDate && <p className="mt-1 text-sm text-red-600">{errors.preferredDate}</p>}
            </div>

            <div>
              <Label htmlFor="booking-time">
                <Clock className="w-4 h-4 inline mr-1" />
                Tercih Edilen Saat <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.preferredTime}
                onValueChange={(value) => handleChange({ target: { name: 'preferredTime', value } } as any)}
                required
              >
                <SelectTrigger id="booking-time" className={errors.preferredTime ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Saat seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.preferredTime && <p className="mt-1 text-sm text-red-600">{errors.preferredTime}</p>}
            </div>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="booking-message">
              Mesajınız (Opsiyonel)
            </Label>
            <Textarea
              id="booking-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              placeholder="Eklemek istediğiniz bilgiler..."
            />
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Not:</strong> Randevu talebiniz onaylandıktan sonra size e-posta ve SMS ile bildirim gönderilecektir. 
              Randevu saatinden önce telefon ile teyit alınacaktır.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={status === 'loading'}
            className="w-full"
          >
            {status === 'loading' ? 'Gönderiliyor...' : 'Randevu Oluştur'}
          </Button>
        </div>
      </form>
    </div>
  );
}

