'use client';

import { useState, useEffect } from 'react';
import { Card } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { Input } from '@karasu/ui';
import { Label } from '@karasu/ui';
import { toast } from 'sonner';
import { safeJsonParse } from '@/lib/utils/safeJsonParse';
import { Save, AlertCircle } from 'lucide-react';

interface RateLimitConfig {
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
  maxCostPerDay: number;
}

export function AIImageSettings() {
  const [config, setConfig] = useState<RateLimitConfig>({
    maxRequestsPerHour: 20,
    maxRequestsPerDay: 100,
    maxCostPerDay: 10.0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load current config from database
    fetch('/api/ai-images/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings?.rate_limits) {
          setConfig(data.settings.rate_limits);
        }
      })
      .catch(() => {
        // Fallback to localStorage if API fails
        const saved = localStorage.getItem('ai-image-rate-limit-config');
        if (saved) {
          const parsed = safeJsonParse(saved, null, {
            context: 'ai-image-rate-limit-config',
            dedupeKey: 'ai-image-rate-limit-config',
          });
          if (parsed) {
            setConfig(parsed);
          }
        }
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/ai-images/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rate_limits: config,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ayarlar kaydedilemedi');
      }

      // Also save to localStorage as fallback
      localStorage.setItem('ai-image-rate-limit-config', JSON.stringify(config));

      toast.success('Ayarlar kaydedildi');
    } catch (error: any) {
      toast.error(error.message || 'Ayarlar kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Rate Limit Ayarları</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          AI görsel üretme için rate limit ve maliyet kontrollerini yapılandırın.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="maxRequestsPerHour">Maksimum İstek/Saat</Label>
            <Input
              id="maxRequestsPerHour"
              type="number"
              value={config.maxRequestsPerHour}
              onChange={(e) => setConfig({ ...config, maxRequestsPerHour: parseInt(e.target.value) || 0 })}
              min={1}
              max={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              Bir saat içinde maksimum kaç görsel üretme isteği yapılabileceğini belirler.
            </p>
          </div>

          <div>
            <Label htmlFor="maxRequestsPerDay">Maksimum İstek/Gün</Label>
            <Input
              id="maxRequestsPerDay"
              type="number"
              value={config.maxRequestsPerDay}
              onChange={(e) => setConfig({ ...config, maxRequestsPerDay: parseInt(e.target.value) || 0 })}
              min={1}
              max={10000}
            />
            <p className="text-xs text-gray-500 mt-1">
              Bir gün içinde maksimum kaç görsel üretme isteği yapılabileceğini belirler.
            </p>
          </div>

          <div>
            <Label htmlFor="maxCostPerDay">Maksimum Maliyet/Gün ($)</Label>
            <Input
              id="maxCostPerDay"
              type="number"
              step="0.01"
              value={config.maxCostPerDay}
              onChange={(e) => setConfig({ ...config, maxCostPerDay: parseFloat(e.target.value) || 0 })}
              min={0}
              max={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              Bir gün içinde maksimum ne kadar harcama yapılabileceğini belirler (USD).
            </p>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-300">
                <p className="font-semibold mb-1">Dikkat</p>
                <p>
                  Bu ayarlar tüm AI görsel üretme isteklerini etkiler. 
                  Değişiklikler anında geçerli olur ve mevcut rate limit kontrollerini etkiler.
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </Button>
        </div>
      </Card>

      {/* Cost Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">DALL-E 3 Fiyatlandırması</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="font-medium">1024x1024</span>
            <div className="text-right">
              <p className="text-sm">Standard: $0.04</p>
              <p className="text-sm">HD: $0.08</p>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="font-medium">1792x1024</span>
            <div className="text-right">
              <p className="text-sm">Standard: $0.08</p>
              <p className="text-sm">HD: $0.12</p>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="font-medium">1024x1792</span>
            <div className="text-right">
              <p className="text-sm">Standard: $0.08</p>
              <p className="text-sm">HD: $0.12</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          * Fiyatlar görsel başına. Cache'den alınan görseller için maliyet yoktur ($0).
        </p>
      </Card>
    </div>
  );
}

