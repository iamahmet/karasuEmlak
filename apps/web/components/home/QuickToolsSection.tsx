"use client";

import { useState } from "react";
import { Calculator, TrendingUp, Home, DollarSign } from "lucide-react";
import { cn } from "@karasu/lib";
import { InvestmentCalculatorSection } from "./InvestmentCalculatorSection";
import { MortgageCalculatorSection } from "./MortgageCalculatorSection";
import { PropertyValuationSection } from "./PropertyValuationSection";

export function QuickToolsSection() {
  const [activeTab, setActiveTab] = useState<"investment" | "mortgage" | "valuation">("investment");

  const tabs = [
    {
      id: "investment" as const,
      label: "Yatırım Hesaplayıcı",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "mortgage" as const,
      label: "Kredi Hesaplayıcı",
      icon: Home,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      id: "valuation" as const,
      label: "Değerleme Aracı",
      icon: Calculator,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <section className="py-10 lg:py-12 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-4">
              <Calculator className="h-4 w-4 text-purple-600 stroke-[1.5]" />
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Hesaplayıcılar</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-semibold mb-4 text-gray-900 tracking-tight">
              Emlak Hesaplayıcılarımız
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.47] tracking-[-0.022em]">
              Yatırım, kredi ve değerleme hesaplamalarınızı tek yerden yapın. Profesyonel araçlarımızla bilinçli kararlar verin.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-[15px] transition-all duration-200",
                    activeTab === tab.id
                      ? `${tab.bgColor} ${tab.color} shadow-lg scale-105`
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300"
                  )}
                >
                  <Icon className="h-5 w-5 stroke-[1.5]" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden p-6 lg:p-8">
            {activeTab === "investment" && (
              <div className="[&>section]:py-0 [&>section]:bg-transparent [&>section]:relative [&>section]:overflow-visible">
                <InvestmentCalculatorSection />
              </div>
            )}
            {activeTab === "mortgage" && (
              <div className="[&>section]:py-0 [&>section]:bg-transparent [&>section]:relative [&>section]:overflow-visible">
                <MortgageCalculatorSection />
              </div>
            )}
            {activeTab === "valuation" && (
              <div className="[&>section]:py-0 [&>section]:bg-transparent [&>section]:relative [&>section]:overflow-visible">
                <PropertyValuationSection />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

