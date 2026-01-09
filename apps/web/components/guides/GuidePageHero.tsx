"use client";

import { BookOpen, FileText, HelpCircle, Info, ArrowRight } from "lucide-react";
import { Button } from "@karasu/ui";
import Link from "next/link";
import { cn } from "@karasu/lib";

interface GuidePageHeroProps {
  title?: string;
  description?: string;
  basePath?: string;
}

export function GuidePageHero({ 
  title = "Emlak Rehberleri",
  description = "Emlak alım-satım, kiralama ve yatırım konularında kapsamlı rehberler ve uzman tavsiyeleri.",
  basePath = ""
}: GuidePageHeroProps) {
  const quickLinks = [
    {
      icon: FileText,
      title: "Emlak Alım-Satım",
      href: `${basePath}/rehber/emlak-alim-satim`,
      color: "blue",
    },
    {
      icon: BookOpen,
      title: "Kiralama Rehberi",
      href: `${basePath}/rehber/kiralama`,
      color: "green",
    },
    {
      icon: Info,
      title: "Yatırım Rehberi",
      href: `${basePath}/rehber/yatirim`,
      color: "orange",
    },
    {
      icon: HelpCircle,
      title: "Sık Sorulan Sorular",
      href: `${basePath}/sss`,
      color: "purple",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
    green: "bg-green-50 text-green-600 border-green-200 hover:bg-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100",
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-gray-50 overflow-hidden border-b border-gray-200">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,blue_1px,transparent_0)] bg-[length:24px_24px]" />
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6 border border-blue-200">
            <BookOpen className="h-4 w-4 text-blue-600 stroke-[1.5]" />
            <span className="text-sm font-semibold text-blue-700">
              Emlak Rehberleri
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-gray-900 leading-tight tracking-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="text-[17px] md:text-[19px] text-gray-600 mb-8 max-w-3xl mx-auto leading-[1.6]">
            {description}
          </p>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={index}
                href={link.href}
                className="group block"
              >
                <div className={cn(
                  "bg-white rounded-xl border-2 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center",
                  colorClasses[link.color as keyof typeof colorClasses]
                )}>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/50 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 tracking-tight">
                    {link.title}
                  </h3>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Keşfet
                    <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
