"use client";

import { BookOpen, FileText, TrendingUp, Search, Sparkles, ArrowRight } from "lucide-react";
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
    <section className="relative bg-gradient-to-br from-primary/5 via-white to-blue-50/30 overflow-hidden border-b border-gray-200/50">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="container mx-auto px-4 lg:px-6 py-16 lg:py-24 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary/10 to-blue-100/50 rounded-full mb-8 border border-primary/20 shadow-sm backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-bold text-primary">
              Blog & Rehberler
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold pb-2 mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-gray-300 drop-shadow-sm leading-[1.15]">
            {title}
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`${basePath}/rehber`}>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary-dark text-white px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group"
              >
                <FileText className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Emlak Rehberleri
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href={`${basePath}/haberler`}>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-4 text-base font-semibold transition-all duration-300 hover:-translate-y-0.5 group"
              >
                <TrendingUp className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Güncel Haberler
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
