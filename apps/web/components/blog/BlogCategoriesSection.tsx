"use client";

import Link from "next/link";
import { Tag, TrendingUp, FileText } from "lucide-react";
import { cn } from "@karasu/lib";
import { categoryToSlug, categoriesMatch } from "@/lib/utils/category-utils";

interface BlogCategoriesSectionProps {
  categories: Array<{ name: string; count: number }>;
  basePath?: string;
  currentCategory?: string;
}

export function BlogCategoriesSection({ 
  categories, 
  basePath = "",
  currentCategory
}: BlogCategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="p-1.5 bg-blue-50 rounded-lg">
          <Tag className="h-4 w-4 text-blue-600 stroke-[1.5]" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Kategoriler</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`${basePath}/blog`}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border-2",
            !currentCategory
              ? "bg-[#006AFF] text-white border-[#006AFF] shadow-md"
              : "bg-white text-gray-700 border-gray-200 hover:border-[#006AFF] hover:text-[#006AFF]"
          )}
        >
          <FileText className="h-4 w-4 inline-block mr-2 stroke-[1.5]" />
          Tümü
        </Link>
        {categories.map((category) => {
          const categorySlug = categoryToSlug(category.name);
          const isActive = currentCategory 
            ? categoriesMatch(currentCategory, category.name) || currentCategory === categorySlug
            : false;
          return (
            <Link
              key={category.name}
              href={`${basePath}/blog/kategori/${encodeURIComponent(categorySlug)}`}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 border flex items-center gap-1.5",
                isActive
                  ? "bg-[#006AFF] text-white border-[#006AFF] shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-[#006AFF] hover:text-[#006AFF]"
              )}
            >
              <span>{category.name}</span>
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              )}>
                {category.count}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
