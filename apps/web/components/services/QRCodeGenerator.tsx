'use client';

import { useState } from 'react';
import { QrCode, Download, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import { Button, Label } from '@karasu/ui';
import { Input } from '@karasu/ui';
import { fetchWithRetry } from '@/lib/utils/api-client';

interface QRCodeGeneratorProps {
  defaultData?: string;
  listingSlug?: string;
  className?: string;
}

export function QRCodeGenerator({ 
  defaultData = '', 
  listingSlug,
  className = '' 
}: QRCodeGeneratorProps) {
  const [data, setData] = useState(defaultData);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateQR = async () => {
    if (!data && !listingSlug) {
      return;
    }

    setLoading(true);
    try {
      const url = listingSlug
        ? `/api/services/qr-code?listingSlug=${encodeURIComponent(listingSlug)}&size=300`
        : `/api/services/qr-code?data=${encodeURIComponent(data)}&size=300`;
      
      const result = await fetchWithRetry<{ success: boolean; data?: { qrCodeUrl: string } }>(url);
      
      if (result.success && result.data) {
        setQrUrl((result.data as any)?.qrCodeUrl || '');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('QR generation error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (qrUrl) {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQR = () => {
    if (qrUrl) {
      const link = document.createElement('a');
      link.href = qrUrl;
      link.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Kod Oluşturucu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!listingSlug && (
          <div className="space-y-2">
            <Label htmlFor="qr-data">URL veya Metin</Label>
            <Input
              id="qr-data"
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="https://example.com veya metin"
            />
          </div>
        )}

        <Button 
          onClick={generateQR} 
          disabled={loading || (!data && !listingSlug)}
          className="w-full"
        >
          {loading ? 'Oluşturuluyor...' : 'QR Kod Oluştur'}
        </Button>

        {qrUrl && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-center">
              <img 
                src={qrUrl} 
                alt="QR Code" 
                className="border-2 border-gray-200 rounded-lg p-2 bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Kopyalandı
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Kopyala
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadQR}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                İndir
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
