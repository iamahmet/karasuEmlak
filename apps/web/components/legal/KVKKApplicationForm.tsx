'use client';

import { useState } from 'react';
import { Button } from '@karasu/ui';
import { Input } from '@karasu/ui';
import { Textarea } from '@karasu/ui';
import { Label } from '@karasu/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@karasu/ui';
import { siteConfig } from '@karasu-emlak/config';
import { fetchWithRetry } from '@/lib/utils/api-client';

export default function KVKKApplicationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tcKimlikNo: '',
    address: '',
    requestType: 'bilgi',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const data = await fetchWithRetry('/api/kvkk-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!data.success) {
        throw new Error(data.error || data.message || 'Form gönderilemedi');
      }

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        tcKimlikNo: '',
        address: '',
        requestType: 'bilgi',
        message: '',
      });
    } catch (error) {
      setSubmitStatus('error');
      if (process.env.NODE_ENV === 'development') {
        const { handleApiError } = await import('@/lib/utils/api-client');
        const errorInfo = handleApiError(error);
        console.error('KVKK form submission error:', errorInfo.userFriendly);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Kişisel Bilgiler
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">
              Ad Soyad <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="email">
              E-posta <span className="text-red-500">*</span>
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label htmlFor="phone">
              Telefon <span className="text-red-500">*</span>
            </Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="05XX XXX XX XX"
            />
          </div>

          <div>
            <Label htmlFor="tcKimlikNo">
              T.C. Kimlik No
            </Label>
            <Input
              type="text"
              id="tcKimlikNo"
              name="tcKimlikNo"
              value={formData.tcKimlikNo}
              onChange={handleChange}
              maxLength={11}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">
            Adres
          </Label>
          <Textarea
            id="address"
            name="address"
            rows={3}
            value={formData.address}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Request Type */}
      <div>
        <Label htmlFor="requestType">
          Başvuru Türü <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.requestType}
          onValueChange={(value) => setFormData(prev => ({ ...prev, requestType: value }))}
        >
          <SelectTrigger id="requestType">
            <SelectValue placeholder="Başvuru türü seçin" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bilgi">Bilgi Alma</SelectItem>
            <SelectItem value="duzeltme">Düzeltme</SelectItem>
            <SelectItem value="silme">Silme</SelectItem>
            <SelectItem value="itiraz">İtiraz</SelectItem>
            <SelectItem value="zarar">Zararın Giderilmesi</SelectItem>
            <SelectItem value="diger">Diğer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Message */}
      <div>
        <Label htmlFor="message">
          Mesajınız <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={6}
          value={formData.message}
          onChange={handleChange}
          placeholder="Başvurunuzla ilgili detaylı bilgi veriniz..."
        />
      </div>

      {/* Privacy Notice */}
      <div className="bg-muted rounded-lg p-4 border">
        <p className="text-xs text-muted-foreground">
          <strong>Gizlilik Uyarısı:</strong> Bu form aracılığıyla gönderdiğiniz kişisel veriler, 
          6698 sayılı KVKK kapsamında işlenecektir. Verileriniz sadece başvurunuzun değerlendirilmesi 
          amacıyla kullanılacak ve güvenli bir şekilde saklanacaktır. Detaylı bilgi için{' '}
          <a href="/gizlilik-politikasi" className="text-primary hover:underline">
            Gizlilik Politikamızı
          </a>{' '}
          inceleyebilirsiniz.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
        </Button>
        <a
          href={`mailto:${'info@karasuemlak.com'}?subject=KVKK Başvurusu`}
          className="flex-1 px-6 py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg transition-colors duration-200 text-center"
        >
          E-posta ile Gönder
        </a>
      </div>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✅ Başvurunuz başarıyla gönderildi. En geç 30 gün içinde size dönüş yapılacaktır.
          </p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-200">
            ❌ Bir hata oluştu. Lütfen tekrar deneyin veya e-posta ile iletişime geçin.
          </p>
        </div>
      )}
    </form>
  );
}

