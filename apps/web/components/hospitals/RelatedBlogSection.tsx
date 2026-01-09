'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, Stethoscope, Activity, Pill } from 'lucide-react';
import { Card, CardContent } from '@karasu/ui';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  category?: string;
  published_at?: string;
}

interface RelatedBlogSectionProps {
  basePath?: string;
  city?: 'karasu' | 'kocaali';
  className?: string;
}

const healthIcons = [Heart, Stethoscope, Activity, Pill];

export function RelatedBlogSection({ 
  basePath = '', 
  city = 'karasu',
  className = '' 
}: RelatedBlogSectionProps) {
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
        // Silent fail
      }

      // Fallback articles
      const fallbackArticles: Article[] = [
        {
          id: '1',
          title: 'Acil Durumlarda İlaç Temini ve Nöbetçi Eczaneler',
          slug: 'acil-durumlarda-ilac-temini-ve-nobetci-eczaneler',
          excerpt: 'Acil ilaç ihtiyacı durumunda nöbetçi eczanelerden nasıl yararlanılacağı ve dikkat edilmesi gerekenler.',
          category: 'Sağlık',
        },
        {
          id: '2',
          title: 'İlaç Kullanımında Dikkat Edilmesi Gerekenler',
          slug: 'ilac-kullaniminda-dikkat-edilmesi-gerekenler',
          excerpt: 'İlaç kullanırken dikkat edilmesi gereken önemli noktalar, yan etkiler ve güvenli kullanım hakkında bilgiler.',
          category: 'Sağlık',
        },
        {
          id: '3',
          title: 'Sağlık Hizmetlerinden Nasıl Yararlanılır?',
          slug: 'saglik-hizmetlerinden-nasil-yararlanilir',
          excerpt: 'Devlet hastaneleri, özel hastaneler ve sağlık merkezlerinden nasıl yararlanılacağı hakkında rehber.',
          category: 'Sağlık',
        },
        {
          id: '4',
          title: 'Acil Sağlık Durumlarında Yapılması Gerekenler',
          slug: 'acil-saglik-durumlarinda-yapilmasi-gerekenler',
          excerpt: 'Acil sağlık durumlarında ilk yardım, 112 aranması ve hastaneye ulaşım hakkında önemli bilgiler.',
          category: 'Sağlık',
        },
      ];

      setArticles(fallbackArticles);
      setLoading(false);
    }

    fetchHealthArticles();
  }, [basePath]);

  if (loading) {
    return (
      <section className={className}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-2">
            İlgili Blog Yazıları
          </h2>
          <p className="text-muted-foreground">
            Sağlık ve hastaneler hakkında faydalı bilgiler
          </p>
        </div>
        <Link
          href={`${basePath}/blog?category=Sağlık`}
          className="hidden md:flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
        >
          Tümünü Gör
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {articles.map((article, index) => {
          const Icon = healthIcons[index % healthIcons.length];
          const date = article.published_at 
            ? new Date(article.published_at).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            : null;

          return (
            <Link
              key={article.id}
              href={`${basePath}/blog/${article.slug}`}
              className="group block h-full"
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    {article.category && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        {article.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {date && <span>{date}</span>}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 md:hidden text-center">
        <Link
          href={`${basePath}/blog?category=Sağlık`}
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
        >
          Tüm Blog Yazılarını Gör
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
