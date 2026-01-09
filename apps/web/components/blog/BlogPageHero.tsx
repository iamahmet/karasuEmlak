"use client";

import { BookOpen, FileText, TrendingUp, Search } from "lucide-react";
import { Button } from "@karasu/ui";
import Link from "next/link";

interface BlogPageHeroProps {
  title?: string;
  description?: string;
  basePath?: string;
}

export function BlogPageHero({ 
  title = "Blog & Rehberler",
  description = "Karasu emlak, yatırım ve bölge hakkında güncel haberler, rehberler ve uzman görüşleri.",
  basePath = ""
}: BlogPageHeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-gray-50 overflow-hidden border-b border-gray-200">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,blue_1px,transparent_0)] bg-[length:24px_24px]" />
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-12 lg:py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-6 border border-blue-200">
            <BookOpen className="h-4 w-4 text-blue-600 stroke-[1.5]" />
            <span className="text-sm font-semibold text-blue-700">
              Blog & Rehberler
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

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={`${basePath}/rehber`}>
              <Button
                size="lg"
                className="bg-[#006AFF] hover:bg-[#0052CC] text-white px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <FileText className="h-5 w-5 mr-2 stroke-[1.5]" />
                Emlak Rehberleri
              </Button>
            </Link>
            <Link href={`${basePath}/haberler`}>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 font-semibold"
              >
                <TrendingUp className="h-5 w-5 mr-2 stroke-[1.5]" />
                Güncel Haberler
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
