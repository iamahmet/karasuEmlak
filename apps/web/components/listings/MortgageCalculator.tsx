"use client";

import { useState } from "react";
import { Calculator, TrendingDown, Percent } from "lucide-react";
import { Button } from "@karasu/ui";
import { cn } from "@karasu/lib";

interface MortgageCalculatorProps {
  propertyPrice: number;
  className?: string;
}

export function MortgageCalculator({ propertyPrice, className }: MortgageCalculatorProps) {
  const [downPayment, setDownPayment] = useState(20); // %
  const [interestRate, setInterestRate] = useState(2.5); // %
  const [loanTerm, setLoanTerm] = useState(120); // months

  const calculateMortgage = () => {
    const downPaymentAmount = (propertyPrice * downPayment) / 100;
    const loanAmount = propertyPrice - downPaymentAmount;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm;

    // Monthly payment formula: M = P[r(1+r)^n]/[(1+r)^n-1]
    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - loanAmount;

    return {
      downPaymentAmount,
      loanAmount,
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
    };
  };

  const mortgage = calculateMortgage();

  return (
    <div className={cn("bg-white rounded-xl border-2 border-gray-200 p-6", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 rounded-xl">
          <Calculator className="h-6 w-6 text-[#006AFF]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Kredi Hesaplayıcı</h3>
          <p className="text-sm text-gray-600">Aylık ödeme tutarınızı hesaplayın</p>
        </div>
      </div>

      {/* Monthly Payment Result */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 mb-6 border-2 border-blue-200">
        <div className="text-sm text-blue-700 font-semibold mb-2">Tahmini Aylık Ödeme</div>
        <div className="text-4xl font-extrabold text-[#006AFF]">
          ₺{new Intl.NumberFormat('tr-TR').format(mortgage.monthlyPayment)}
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-5 mb-6">
        {/* Down Payment */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Peşinat (%)</label>
            <span className="text-sm font-bold text-[#006AFF]">
              ₺{new Intl.NumberFormat('tr-TR').format(mortgage.downPaymentAmount)}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="50"
            step="5"
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006AFF]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>%10</span>
            <span className="font-bold text-gray-900">{downPayment}%</span>
            <span>%50</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5" />
              Faiz Oranı (Yıllık)
            </label>
            <span className="text-sm font-bold text-[#006AFF]">%{interestRate.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006AFF]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>%1.0</span>
            <span className="font-bold text-gray-900">%{interestRate.toFixed(1)}</span>
            <span>%5.0</span>
          </div>
        </div>

        {/* Loan Term */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5" />
              Vade Süresi
            </label>
            <span className="text-sm font-bold text-[#006AFF]">{loanTerm} Ay</span>
          </div>
          <input
            type="range"
            min="12"
            max="240"
            step="12"
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006AFF]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>12 Ay</span>
            <span className="font-bold text-gray-900">{loanTerm} Ay ({Math.round(loanTerm / 12)} Yıl)</span>
            <span>240 Ay</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Kredi Tutarı</div>
          <div className="text-base font-bold text-gray-900">
            ₺{new Intl.NumberFormat('tr-TR').format(mortgage.loanAmount)}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Toplam Faiz</div>
          <div className="text-base font-bold text-gray-900">
            ₺{new Intl.NumberFormat('tr-TR').format(mortgage.totalInterest)}
          </div>
        </div>
      </div>

      <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <div className="text-xs text-gray-600 mb-1">Toplam Geri Ödeme</div>
        <div className="text-lg font-bold text-gray-900">
          ₺{new Intl.NumberFormat('tr-TR').format(mortgage.totalPayment)}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        * Bu hesaplama tahminidir. Gerçek koşullar için bankanız ile görüşün.
      </p>
    </div>
  );
}

