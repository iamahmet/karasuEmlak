"use client";

import { Shield, Lock, CheckCircle2, Award, FileCheck, Verified } from "lucide-react";
import { cn } from "@karasu/lib";

export function TrustBadgesSection() {
  const badges = [
    {
      icon: Shield,
      title: "Lisanslı Emlak Ofisi",
      description: "Resmi Ticaret Sicil Kaydı",
    },
    {
      icon: Lock,
      title: "SSL Güvenli",
      description: "256-bit Şifreleme",
    },
    {
      icon: CheckCircle2,
      title: "KVKK Uyumlu",
      description: "Kişisel Veri Koruması",
    },
    {
      icon: Award,
      title: "15 Yıl Tecrübe",
      description: "Sektör Deneyimi",
    },
    {
      icon: FileCheck,
      title: "Yasal Danışmanlık",
      description: "Profesyonel Destek",
    },
    {
      icon: Verified,
      title: "Onaylı İlanlar",
      description: "Doğrulanmış Bilgiler",
    },
  ];

  return (
    <section className="py-12 bg-gray-50 border-y border-gray-200">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="text-center mb-8">
          <h3 className="text-[17px] font-semibold text-gray-600 uppercase tracking-wider mb-2">
            Güvenilir Partner
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {badges.map((badge, index) => (
            <div
              key={index}
              className={cn(
                "group p-6 bg-white rounded-xl",
                "border border-gray-200",
                "transition-all duration-300",
                "hover:border-[#006AFF]/30 hover:shadow-md hover:-translate-y-1",
                "animate-in fade-in slide-in-from-bottom-2"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <badge.icon className="h-8 w-8 text-[#006AFF] stroke-[1.5] mx-auto mb-3 transition-transform duration-300 group-hover:scale-110" />
              <div className="text-[13px] font-bold text-gray-900 mb-1 text-center tracking-[-0.01em]">
                {badge.title}
              </div>
              <div className="text-[11px] text-gray-500 text-center tracking-[-0.005em]">
                {badge.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

