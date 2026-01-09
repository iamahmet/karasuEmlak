'use client';

/**
 * Health Articles Section Component
 * Displays health-related articles with SEO optimization
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CardImage } from '@/components/images';
import { ExternalImage } from '@/components/images';
import { isValidCloudinaryId } from '@/lib/images/free-image-fallback';
import { calculateReadingTime } from '@/lib/utils/reading-time';
import { FileText, ArrowRight, Heart, Pill, Activity, Stethoscope } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  category?: string;
  published_at?: string;
  content?: string;
}

interface HealthArticlesSectionProps {
  basePath?: string;
  className?: string;
}

// Fallback health articles (if API fails) - SEO optimized
const fallbackHealthArticles: Article[] = [
  {
    id: '1',
    title: 'İlaç Kullanımında Dikkat Edilmesi Gerekenler',
    slug: 'ilac-kullaniminda-dikkat-edilmesi-gerekenler',
    excerpt: 'İlaç kullanırken dikkat edilmesi gereken önemli noktalar, yan etkiler ve güvenli kullanım hakkında detaylı bilgiler. Reçeteli ve reçetesiz ilaçların doğru kullanımı.',
    category: 'Sağlık',
    content: 'İlaç kullanımı hakkında detaylı içerik...',
  },
  {
    id: '2',
    title: 'Acil Durumlarda İlaç Temini ve Nöbetçi Eczaneler',
    slug: 'acil-durumlarda-ilac-temini-ve-nobetci-eczaneler',
    excerpt: 'Acil ilaç ihtiyacı durumunda nöbetçi eczanelerden nasıl yararlanılacağı, Karasu nöbetçi eczane bilgileri ve dikkat edilmesi gerekenler.',
    category: 'Sağlık',
    content: 'Acil durumlarda ilaç temini hakkında içerik...',
  },
  {
    id: '3',
    title: 'Reçeteli ve Reçetesiz İlaçlar Arasındaki Fark',
    slug: 'receteli-ve-recetesiz-ilaclar-arasindaki-fark',
    excerpt: 'Reçeteli ve reçetesiz ilaçların farkları, kullanım alanları, güvenlik önlemleri ve hangi durumlarda hangi ilaç türünün kullanılacağı.',
    category: 'Sağlık',
    content: 'Reçeteli ve reçetesiz ilaçlar hakkında içerik...',
  },
  {
    id: '4',
    title: 'İlaç Saklama Koşulları ve Son Kullanma Tarihleri',
    slug: 'ilac-saklama-kosullari-ve-son-kullanim-tarihleri',
    excerpt: 'İlaçların doğru saklama yöntemleri, son kullanma tarihlerinin önemi, güvenli kullanım ve ilaçların etkinliğini koruma yöntemleri.',
    category: 'Sağlık',
    content: 'İlaç saklama koşulları hakkında içerik...',
  },
];

export function HealthArticlesSection({ basePath = '', className = '' }: HealthArticlesSectionProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHealthArticles() {
      try {
        // Try to fetch health articles from database
        const response = await fetch(`${basePath}/api/articles?category=Sağlık&limit=4&status=published`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.articles && data.articles.length > 0) {
            setArticles(data.articles);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        // Silent fail - use fallback
      }

      // Fallback to static articles
      setArticles(fallbackHealthArticles);
      setLoading(false);
    }

    fetchHealthArticles();
  }, [basePath]);

  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const healthIcons = [Heart, Pill, Activity, Stethoscope];

  return (
    <section className={className} itemScope itemType="https://schema.org/CollectionPage">
      {/* Section Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900" itemProp="name">
              Sağlık ve İlaç Rehberi
            </h2>
            <p className="text-sm md:text-base text-gray-600 mt-1" itemProp="description">
              Sağlığınız için faydalı bilgiler, ilaç kullanımı rehberi ve eczane hizmetleri hakkında detaylı içerikler
            </p>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" itemScope itemType="https://schema.org/ItemList">
        {articles.map((article, index) => {
          const Icon = healthIcons[index % healthIcons.length];
          const readingTime = calculateReadingTime(article.content || '');
          const isCloudinary = isValidCloudinaryId(article.featured_image);
          const imageUrl = article.featured_image;

          return (
            <div key={article.id} itemScope itemType="https://schema.org/Article" itemProp="itemListElement">
              <Link
                href={`${basePath}/blog/${article.slug}`}
                className="group block h-full"
                aria-label={`${article.title} yazısını oku`}
                itemProp="url"
              >
                <article className="h-full bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col">
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden">
                    {imageUrl ? (
                      isCloudinary ? (
                        <CardImage
                          publicId={imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      ) : (
                        <ExternalImage
                          src={imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                          fill
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100">
                        <Icon className="h-16 w-16 text-green-400" />
                      </div>
                    )}
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Category Badge */}
                    {article.category && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-green-700 border border-green-200">
                          <Icon className="h-3 w-3" />
                          {article.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 
                      className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors"
                      itemProp="headline"
                    >
                      {article.title}
                    </h3>
                    
                    {article.excerpt && (
                      <p 
                        className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1"
                        itemProp="description"
                      >
                        {article.excerpt}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FileText className="h-3 w-3" />
                        <span>{readingTime} dk okuma</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </article>
              </Link>
            </div>
          );
        })}
      </div>

      {/* CTA Link */}
      <div className="mt-8 text-center">
        <Link
          href={`${basePath}/blog?category=Sağlık`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
        >
          <FileText className="h-5 w-5" />
          Tüm Sağlık Yazılarını Görüntüle
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
