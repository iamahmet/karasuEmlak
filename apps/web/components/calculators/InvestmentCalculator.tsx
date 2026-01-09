'use client';

import { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { Input } from '@karasu/ui';
import { Label } from '@karasu/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';

interface InvestmentCalculatorProps {
  propertyPrice?: number;
  monthlyRent?: number;
}

export function InvestmentCalculator({
  propertyPrice: initialPrice = 0,
  monthlyRent: initialRent = 0,
}: InvestmentCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState(initialPrice);
  const [monthlyRent, setMonthlyRent] = useState(initialRent);
  const [annualExpenses, setAnnualExpenses] = useState(0);
  const [taxRate, setTaxRate] = useState(0.15); // 15% default tax rate

  // Calculations
  const annualRent = monthlyRent * 12;
  const netAnnualIncome = annualRent - annualExpenses;
  const rentalYield = propertyPrice > 0 ? (netAnnualIncome / propertyPrice) * 100 : 0;
  const roi = propertyPrice > 0 ? (netAnnualIncome / propertyPrice) * 100 : 0;
  const paybackPeriod = netAnnualIncome > 0 ? propertyPrice / netAnnualIncome : 0;
  const annualTax = netAnnualIncome * taxRate;
  const netAfterTax = netAnnualIncome - annualTax;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6 text-primary" />
          <CardTitle>Yatırım Hesaplayıcı</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="property-price">Gayrimenkul Fiyatı (₺)</Label>
              <Input
                id="property-price"
                type="number"
                value={propertyPrice || ''}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                placeholder="Örn: 2.000.000"
              />
            </div>

            <div>
              <Label htmlFor="monthly-rent">Aylık Kira Geliri (₺)</Label>
              <Input
                id="monthly-rent"
                type="number"
                value={monthlyRent || ''}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                placeholder="Örn: 10.000"
              />
            </div>

            <div>
              <Label htmlFor="annual-expenses">Yıllık Giderler (₺)</Label>
              <Input
                id="annual-expenses"
                type="number"
                value={annualExpenses || ''}
                onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                placeholder="Örn: 5.000"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Aidat, sigorta, bakım vb.
              </p>
            </div>

            <div>
              <Label htmlFor="tax-rate">Vergi Oranı (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                step="0.01"
                value={taxRate * 100}
                onChange={(e) => setTaxRate(Number(e.target.value) / 100)}
                placeholder="15"
              />
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Kira Getirisi (Yıllık)
                  </span>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {rentalYield.toFixed(2)}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Net: {netAnnualIncome.toLocaleString('tr-TR')} ₺/yıl
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    ROI (Yatırım Getirisi)
                  </span>
                </div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-50">
                  {roi.toFixed(2)}%
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  Vergi sonrası: {netAfterTax.toLocaleString('tr-TR')} ₺/yıl
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Geri Dönüş Süresi
                  </span>
                </div>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-50">
                  {paybackPeriod > 0 ? paybackPeriod.toFixed(1) : '∞'} yıl
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                  Yatırımın geri dönmesi için geçen süre
                </p>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Özet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Yıllık Brüt Gelir:</span>
                  <span className="font-medium">
                    {annualRent.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Yıllık Giderler:</span>
                  <span className="font-medium">
                    {annualExpenses.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vergi:</span>
                  <span className="font-medium">
                    {annualTax.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-semibold">Net Kar:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {netAfterTax.toLocaleString('tr-TR')} ₺/yıl
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

