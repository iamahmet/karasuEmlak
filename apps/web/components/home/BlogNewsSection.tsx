"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, User, FileText, Newspaper, ExternalLink, ArrowRight } from "lucide-react";
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
            <h3
              className="text-lg font-bold mb-3 line-clamp-2 text-gray-900 leading-[1.3] tracking-tight group-hover:text-[#006AFF] transition-colors duration-200"
              dangerouslySetInnerHTML={{ __html: item.title }}
            />

            {/* Excerpt */}
            {item.excerpt && (
              <p
                className="text-[15px] text-gray-600 mb-4 line-clamp-2 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item.excerpt }}
              />
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
    <section className="py-24 lg:py-40 bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Blog Section */}
          {articles.length > 0 && (
            <div className="mb-32">
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-100/50 rounded-full">
                    <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">EMLAK REHBERİ</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-[-0.04em] leading-tight">
                    Bilgi ve <span className="text-blue-600">İlham</span> Kaynağı
                  </h2>
                  <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl leading-relaxed">
                    Gayrimenkul dünyasındaki en güncel bilgiler, yatırım stratejileri ve Karasu yaşam rehberleri.
                  </p>
                </div>

                <Link
                  href={`${basePath}/blog`}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gray-50 hover:bg-gray-100 transition-all duration-300 text-sm font-bold text-gray-900"
                >
                  TÜM YAZILAR
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Category Filters - Pill Style */}
              <div className="mb-12 overflow-x-auto no-scrollbar">
                <div className="flex gap-3 pb-4">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap",
                        selectedCategory === category
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Articles Grid - Higher Spacing */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
                {filteredArticles.slice(0, 3).map((article) => (
                  <Link
                    key={article.id}
                    href={`${basePath}/blog/${article.slug}`}
                    className="group"
                  >
                    <article className="space-y-8">
                      {/* Image Area */}
                      <div className="relative aspect-[16/10] bg-gray-50 rounded-[32px] overflow-hidden">
                        {article.featured_image ? (
                          article.featured_image.startsWith('http') ? (
                            <ExternalImage
                              src={article.featured_image}
                              alt={article.title}
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                              fill
                            />
                          ) : (
                            <CardImage
                              publicId={article.featured_image}
                              alt={article.title}
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              fallback={blogFallbackUrl}
                            />
                          )
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <FileText className="h-16 w-16 text-gray-300 stroke-[1]" />
                          </div>
                        )}

                        {/* Meta Tags */}
                        <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[9px] font-black text-gray-900 uppercase tracking-widest">
                            {article.category || 'BLOG'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-5 px-2">
                        <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(article.published_at)}
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5" />
                            {article.author || 'EDİTÖR'}
                          </div>
                        </div>

                        <h3
                          className="text-2xl font-bold text-gray-900 leading-tight tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: article.title }}
                        />

                        {article.excerpt && (
                          <p
                            className="text-gray-500 font-medium leading-relaxed text-[15px] line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: article.excerpt }}
                          />
                        )}

                        <div className="pt-2">
                          <span className="inline-flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-widest group-hover:gap-3 transition-all duration-300">
                            OKUMAYA DEVAM ET
                            <ArrowRight className="h-4 w-4 text-blue-600" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* News Section - Compact Pill Cards */}
          {news.length > 0 && (
            <div className="pt-24 border-t border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100/50 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">GÜNCEL GELİŞMELER</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-[-0.03em] leading-tight">
                    Karasu'dan <span className="text-emerald-600">Haberler</span>
                  </h2>
                </div>

                <Link
                  href={`${basePath}/haberler`}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 text-sm font-bold text-gray-900"
                >
                  TÜM HABERLER
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.slice(0, 3).map((newsItem) => (
                  <Link
                    key={newsItem.id}
                    href={`${basePath}/haberler/${newsItem.slug}`}
                    className="group"
                  >
                    <article className="flex gap-6 items-center p-4 rounded-[32px] hover:bg-gray-50 transition-all duration-500">
                      <div className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-gray-100">
                        {newsItem.featured_image ? (
                          newsItem.featured_image.startsWith('http') ? (
                            <ExternalImage
                              src={newsItem.featured_image}
                              alt={newsItem.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              fill
                            />
                          ) : (
                            <CardImage
                              publicId={newsItem.featured_image}
                              alt={newsItem.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              sizes="96px"
                              fallback={newsFallbackUrl}
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Newspaper className="h-8 w-8 text-gray-300 stroke-[1]" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {formatDate(newsItem.published_at)}
                        </div>
                        <h4
                          className="text-[15px] font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: newsItem.title }}
                        />
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
