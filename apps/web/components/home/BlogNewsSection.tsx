"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, User, FileText, Newspaper, ExternalLink } from "lucide-react";
import { Button } from "@karasu/ui";
import { CardImage } from "@/components/images";
import { ExternalImage } from "@/components/images";
import { cn } from "@karasu/lib";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  author?: string;
  published_at?: string;
  featured_image?: string;
  category?: string;
  views?: number;
}

interface BlogNewsSectionProps {
  articles: Article[];
  news: Article[];
  basePath?: string;
}

export function BlogNewsSection({ articles, news, basePath = "" }: BlogNewsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  
  const categories = [
    "Tümü",
    "Analiz",
    "Genel",
    "Güncel Trendler",
    "Haberler",
    "Kiralık Rehberi",
    "Piyasa Analizi",
    "Rehber",
    "Satılık Rehberi",
    "Satın Alma Rehberi",
    "Sektör Analizi",
    "Turizm",
    "Yatırım",
    "Yatırım Rehberi",
    "Yatırım Stratejileri",
    "Yaşam Rehberi",
    "Yeme-İçme",
  ];
  
  // Filter articles by category
  const filteredArticles = selectedCategory === "Tümü" 
    ? articles 
    : articles.filter(article => 
        article.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        article.title.toLowerCase().includes(selectedCategory.toLowerCase())
      );
  const formatDate = (date?: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Fallback images
  const blogFallbackUrl = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80";
  const newsFallbackUrl = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";

  const renderCard = (item: Article, type: 'blog' | 'news') => {
    const href = type === 'blog' ? `${basePath}/blog/${item.slug}` : `${basePath}/haberler/${item.slug}`;
    const isCloudinary = item.featured_image && !item.featured_image.startsWith('http');
    const fallbackUrl = type === 'blog' ? blogFallbackUrl : newsFallbackUrl;

    return (
      <Link
        key={item.id}
        href={href}
        className="group block"
      >
        <article className="h-full bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-2">
          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            {item.featured_image ? (
              isCloudinary ? (
                <CardImage
                  publicId={item.featured_image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  fallback={fallbackUrl}
                />
              ) : (
                <ExternalImage
                  src={item.featured_image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  fill
                />
              )
            ) : (
              <div className="w-full h-full relative">
                <img
                  src={fallbackUrl}
                  alt={item.title}
                  className="w-full h-full object-cover opacity-60"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  {type === 'blog' ? (
                    <FileText className="h-12 w-12 text-gray-300 stroke-[1.5]" />
                  ) : (
                    <Newspaper className="h-12 w-12 text-gray-300 stroke-[1.5]" />
                  )}
                </div>
              </div>
            )}
            
            {/* Category Badge */}
            {item.category && (
              <div className="absolute top-3 left-3">
                <div className="px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-white/95 text-gray-700 shadow-md">
                  {item.category}
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Title */}
            <h3 className="text-lg font-bold mb-3 line-clamp-2 text-gray-900 leading-[1.3] tracking-tight group-hover:text-[#006AFF] transition-colors duration-200">
              {item.title}
            </h3>

            {/* Excerpt */}
            {item.excerpt && (
              <p className="text-[15px] text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                {item.excerpt}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-[14px] text-gray-500 pt-4 border-t border-gray-200">
              {item.author && (
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 stroke-[1.5]" />
                  <span className="font-medium">{item.author}</span>
                </div>
              )}
              {item.published_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 stroke-[1.5]" />
                  <span>{formatDate(item.published_at)}</span>
                </div>
              )}
            </div>
          </div>
        </article>
      </Link>
    );
  };

  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Blog Section */}
          {articles.length > 0 && (
            <div className="mb-16">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
                <div>
                  <div className="inline-block mb-4">
                    <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Emlak Rehberi</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3 tracking-tight">
                    En Son Blog Yazıları
                  </h2>
                  <p className="text-[17px] text-gray-600">
                    Emlak alım-satım, yatırım ve Karasu rehberleri
                  </p>
                </div>
                <Button variant="outline" className="hidden md:flex border-2 border-gray-300 hover:border-[#006AFF] hover:bg-blue-50" asChild>
                  <Link href={`${basePath}/blog`}>
                    Tüm Makaleler
                    <ExternalLink className="h-4 w-4 ml-2 stroke-[1.5]" />
                  </Link>
                </Button>
              </div>

              {/* Category Filters */}
              <div className="mb-8 overflow-x-auto">
                <div className="flex gap-2 pb-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200",
                        selectedCategory === category
                          ? "bg-[#006AFF] text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredArticles.slice(0, 3).map((article) => (
                  <div key={`blog-${article.id}`}>
                    {renderCard(article, 'blog')}
                  </div>
                ))}
              </div>

              {/* Mobile View All */}
              <div className="mt-8 text-center md:hidden">
                <Button variant="outline" className="border-2 border-gray-300 hover:border-[#006AFF]" asChild>
                  <Link href={`${basePath}/blog`}>
                    Tümünü Gör
                    <ExternalLink className="h-4 w-4 ml-2 stroke-[1.5]" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* News Section */}
          {news.length > 0 && (
            <div>
              {/* Header */}
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="inline-block mb-4">
                    <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Güncel Haberler</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3 tracking-tight">
                    Karasu Emlak Haberleri
                  </h2>
                  <p className="text-[17px] text-gray-600">
                    Piyasa, mevzuat ve yerel gelişmeler
                  </p>
                </div>
                <Button variant="outline" className="hidden md:flex border-2 border-gray-300 hover:border-[#006AFF] hover:bg-blue-50" asChild>
                  <Link href={`${basePath}/haberler`}>
                    Tümünü Gör
                    <ExternalLink className="h-4 w-4 ml-2 stroke-[1.5]" />
                  </Link>
                </Button>
              </div>

              {/* News Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {news.slice(0, 3).map((newsItem) => (
                  <div key={`news-${newsItem.id}`}>
                    {renderCard(newsItem, 'news')}
                  </div>
                ))}
              </div>

              {/* Mobile View All */}
              <div className="mt-8 text-center md:hidden">
                <Button variant="outline" className="border-2 border-gray-300 hover:border-[#006AFF]" asChild>
                  <Link href={`${basePath}/haberler`}>
                    Tümünü Gör
                    <ExternalLink className="h-4 w-4 ml-2 stroke-[1.5]" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
