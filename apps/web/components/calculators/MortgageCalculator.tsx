'use client';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';
import { Input } from '@karasu/ui';
import { Label } from '@karasu/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';

interface MortgageCalculation {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  amortization: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export function MortgageCalculator() {
  const [propertyPrice, setPropertyPrice] = useState<number>(2000000);
  const [downPayment, setDownPayment] = useState<number>(400000);
  const [loanTerm, setLoanTerm] = useState<number>(20); // years
  const [interestRate, setInterestRate] = useState<number>(2.5); // annual percentage
  const [calculation, setCalculation] = useState<MortgageCalculation | null>(null);

  // Calculate mortgage
  useEffect(() => {
    const loanAmount = propertyPrice - downPayment;
    if (loanAmount <= 0) {
      setCalculation(null);
      return;
    }

    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    // Calculate monthly payment using standard mortgage formula
    const monthlyPayment =
      monthlyRate === 0
        ? loanAmount / numberOfPayments
        : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
          (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    const totalPayment = monthlyPayment * numberOfPayments;
    const totalInterest = totalPayment - loanAmount;

    // Generate amortization schedule
    const amortization: MortgageCalculation['amortization'] = [];
    let balance = loanAmount;

    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;

      amortization.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
      });
    }

    setCalculation({
      monthlyPayment,
      totalPayment,
      totalInterest,
      principal: loanAmount,
      amortization,
    });
  }, [propertyPrice, downPayment, loanTerm, interestRate]);

  const downPaymentPercent = propertyPrice > 0 ? (downPayment / propertyPrice) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kredi Hesaplayıcı</CardTitle>
        <p className="text-sm text-muted-foreground">
          Konut kredisi ödeme planınızı hesaplayın
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            {/* Property Price */}
            <div>
              <Label htmlFor="property-price">Konut Fiyatı (₺)</Label>
              <Input
                id="property-price"
                type="number"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                min="0"
                step="10000"
              />
            </div>

            {/* Down Payment */}
            <div>
              <Label htmlFor="down-payment">Peşinat (₺)</Label>
              <Input
                id="down-payment"
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                min="0"
                max={propertyPrice}
                step="10000"
              />
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Peşinat Oranı</span>
                  <span className="font-medium">{downPaymentPercent.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, downPaymentPercent)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Loan Term */}
            <div>
              <Label htmlFor="loan-term">Vade (Yıl): {loanTerm}</Label>
              <input
                id="loan-term"
                type="range"
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                min="5"
                max="30"
                step="1"
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>5 yıl</span>
                <span>30 yıl</span>
              </div>
            </div>

            {/* Interest Rate */}
            <div>
              <Label htmlFor="interest-rate">Faiz Oranı (% Yıllık)</Label>
              <Input
                id="interest-rate"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                min="0"
                max="20"
                step="0.1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                * Güncel faiz oranları için bankanızla iletişime geçin
              </p>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {calculation ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-xs text-primary font-medium mb-1">
                        Aylık Ödeme
                      </div>
                      <div className="text-xl font-bold">
                        {formatPrice(calculation.monthlyPayment)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-xs text-muted-foreground font-medium mb-1">
                        Toplam Ödeme
                      </div>
                      <div className="text-xl font-bold">
                        {formatPrice(calculation.totalPayment)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Loan Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Kredi Detayları</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Kredi Tutarı</span>
                      <span className="text-sm font-semibold">
                        {formatPrice(calculation.principal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Toplam Faiz</span>
                      <span className="text-sm font-semibold">
                        {formatPrice(calculation.totalInterest)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-sm font-medium">
                        Toplam Ödeme
                      </span>
                      <span className="text-base font-bold text-primary">
                        {formatPrice(calculation.totalPayment)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Breakdown Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ödeme Dağılımı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <div 
                        className="flex-1 h-8 bg-primary rounded flex items-center justify-center text-white text-xs font-medium"
                        style={{ flex: calculation.principal / calculation.totalPayment }}
                      >
                        Anapara
                      </div>
                      <div 
                        className="flex-1 h-8 bg-muted rounded flex items-center justify-center text-white text-xs font-medium"
                        style={{ flex: calculation.totalInterest / calculation.totalPayment }}
                      >
                        Faiz
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      Anapara: {formatPrice(calculation.principal)} ({((calculation.principal / calculation.totalPayment) * 100).toFixed(1)}%) | 
                      Faiz: {formatPrice(calculation.totalInterest)} ({((calculation.totalInterest / calculation.totalPayment) * 100).toFixed(1)}%)
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">Lütfen geçerli değerler girin</p>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Not:</strong> Bu hesaplayıcı tahmini değerler sunar. Gerçek kredi koşulları bankanızın güncel faiz oranlarına ve kredi politikalarına göre değişiklik gösterebilir. Kesin bilgi için bankanızla iletişime geçin.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

