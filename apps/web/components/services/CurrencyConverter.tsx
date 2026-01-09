'use client';

import { useState, useEffect } from 'react';
import { Input } from '@karasu/ui';
import { Button } from '@karasu/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@karasu/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import { fetchWithRetry } from '@/lib/utils/api-client';

interface CurrencyConverterProps {
  className?: string;
}

const CURRENCIES = [
  { code: 'TRY', name: 'Türk Lirası', symbol: '₺' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
];

export function CurrencyConverter({ className = '' }: CurrencyConverterProps) {
  const [amount, setAmount] = useState<string>('1000000');
  const [from, setFrom] = useState<string>('TRY');
  const [to, setTo] = useState<string>('USD');
  const [converted, setConverted] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Geçerli bir miktar girin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchWithRetry<{ 
        success: boolean; 
        data?: { converted: number; rate?: number } 
      }>(
        `/api/services/currency?from=${from}&to=${to}&amount=${amount}`
      );

      if (data.success && data.data) {
        setConverted((data.data as any)?.converted || 0);
        // Get rate separately
        const rateData = await fetchWithRetry<{ 
          success: boolean; 
          data?: { rate: number } 
        }>(
          `/api/services/currency?from=${from}&to=${to}`
        );
        if (rateData.success && rateData.data) {
          setRate((rateData.data as any)?.rate || 0);
        }
      } else {
        setError('Döviz kuru alınamadı');
      }
    } catch (err) {
      setError('Dönüştürme sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (amount && parseFloat(amount) > 0 && from && to) {
      convert();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]); // Only convert when currencies change

  const fromCurrency = CURRENCIES.find(c => c.code === from);
  const toCurrency = CURRENCIES.find(c => c.code === to);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" />
          Döviz Çevirici
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Miktar</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setConverted(null);
              }}
              placeholder="1000000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Para Birimi</label>
            <Select value={from} onValueChange={(value) => {
              setFrom(value);
              setConverted(null);
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <ArrowRightLeft className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Dönüştür</label>
          <Select value={to} onValueChange={(value) => {
            setTo(value);
            setConverted(null);
          }}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={convert} 
          disabled={loading || !amount}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Dönüştürülüyor...
            </>
          ) : (
            'Dönüştür'
          )}
        </Button>

        {error && (
          <div className="text-sm text-red-500 text-center">{error}</div>
        )}

        {converted !== null && !error && (
          <div className="pt-4 border-t space-y-2">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {toCurrency?.symbol} {new Intl.NumberFormat('tr-TR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(converted)}
              </div>
              {rate && (
                <div className="text-sm text-muted-foreground mt-1">
                  1 {from} = {rate.toFixed(4)} {to}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
