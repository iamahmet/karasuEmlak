"use client";

import { Home, Building2, MapPin, Search, TrendingUp } from "lucide-react";
import { Button } from "@karasu/ui";
import Link from "next/link";

interface ListingsPageHeroProps {
  title: string;
  description: string;
  status: "satilik" | "kiralik";
  stats?: {
    total: number;
    satilik?: number;
    kiralik?: number;
  };
  basePath?: string;
}

export function ListingsPageHero({ 
  title, 
  description, 
  status,
  stats,
  basePath = "" 
}: ListingsPageHeroProps) {
  const isSatilik = status === "satilik";

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:24px_24px]" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#006AFF] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#00A862] rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-16 lg:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
            {isSatilik ? (
              <Home className="h-4 w-4 text-white stroke-[1.5]" />
            ) : (
              <Building2 className="h-4 w-4 text-white stroke-[1.5]" />
            )}
            <span className="text-sm font-semibold text-white">
              {isSatilik ? "Satılık İlanlar" : "Kiralık İlanlar"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-white leading-tight tracking-tight">
            {title}
          </h1>

          {/* Description */}
          <p className="text-[17px] md:text-[19px] text-gray-200/90 mb-8 max-w-3xl mx-auto leading-[1.6]">
            {description}
          </p>

          {/* Stats */}
          {stats && (
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {stats.total > 0 && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <div className="w-3 h-3 rounded-full bg-[#00A862]"></div>
                  <span className="text-sm font-semibold text-white">
                    {stats.total}+ Aktif İlan
                  </span>
                </div>
              )}
              {isSatilik && stats.satilik && stats.satilik > 0 && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <Home className="h-4 w-4 text-white stroke-[1.5]" />
                  <span className="text-sm font-semibold text-white">
                    {stats.satilik}+ Satılık
                  </span>
                </div>
              )}
              {!isSatilik && stats.kiralik && stats.kiralik > 0 && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <Building2 className="h-4 w-4 text-white stroke-[1.5]" />
                  <span className="text-sm font-semibold text-white">
                    {stats.kiralik}+ Kiralık
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={`${basePath}/haritada-goruntule`}>
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-50 px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <MapPin className="h-5 w-5 mr-2 stroke-[1.5]" />
                Haritada Görüntüle
              </Button>
            </Link>
            <Link href={`${basePath}/${isSatilik ? "kiralik" : "satilik"}`}>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-6 py-3 font-semibold"
              >
                {isSatilik ? "Kiralık İlanlar" : "Satılık İlanlar"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
