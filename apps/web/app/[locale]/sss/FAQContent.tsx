"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  ExternalLink,
  X,
  ThumbsUp,
  ThumbsDown,
  ChevronUp,
  Sparkles,
  Filter,
  MessageCircleQuestion
} from 'lucide-react';
import { Input } from '@karasu/ui';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  priority: number; // 0 = low, 1 = medium, 2 = high
  created_at?: string;
  updated_at?: string;
}

interface FAQContentProps {
  basePath: string;
  faqs?: FAQ[];
  error?: string | null;
}

const categoryLabels: Record<string, string> = {
  genel: 'Genel Bilgiler',
  satilik: 'Satılık Emlak',
  kiralik: 'Kiralık Emlak',
  hukuki: 'Hukuki Süreçler',
  finansman: 'Finansman ve Kredi',
  kiralama: 'Kiralama İşlemleri',
  // Legacy categories (for backward compatibility)
  bilgi: 'Genel Bilgiler',
  karsilastirma: 'Karşılaştırmalar',
  karar_verme: 'Karar Verme',
  risk: 'Risk ve Dikkat',
  yatirim: 'Yatırım',
};

const categoryIcons: Record<string, string> = {
  genel: '📋',
  satilik: '🏠',
  kiralik: '🔑',
  hukuki: '⚖️',
  finansman: '💰',
  kiralama: '📝',
};

const categoryOrder = ['genel', 'satilik', 'kiralik', 'hukuki', 'finansman', 'kiralama'];

// Highlight search terms in text
function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 text-gray-900 dark:text-yellow-100 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function FAQContent({ basePath, faqs: initialFaqs = [], error }: FAQContentProps) {
  const [faqs] = useState<FAQ[]>(initialFaqs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Memoized filtered FAQs
  const filteredFaqs = useMemo(() => {
    let filtered = faqs;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [faqs, searchQuery, selectedCategory]);

  // Popular FAQs (high priority)
  const popularFaqs = useMemo(() => {
    return faqs
      .filter((faq) => faq.priority === 2)
      .slice(0, 5);
  }, [faqs]);

  // Group FAQs by category
  const groupedFaqs = useMemo(() => {
    return filteredFaqs.reduce((acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push(faq);
      return acc;
    }, {} as Record<string, FAQ[]>);
  }, [filteredFaqs]);

  // Get unique categories, sorted by priority (memoized for performance)
  const categories = useMemo(() => {
    const unique = Array.from(new Set(faqs.map((faq) => faq.category)));
    return unique.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a);
      const bIndex = categoryOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [faqs]);

  // Memoize category counts for performance
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    faqs.forEach((faq) => {
      counts[faq.category] = (counts[faq.category] || 0) + 1;
    });
    return counts;
  }, [faqs]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedItems(new Set(filteredFaqs.map((faq) => faq.id)));
  }, [filteredFaqs]);

  const collapseAll = useCallback(() => {
    setExpandedItems(new Set());
  }, []);

  const scrollToCategory = useCallback((category: string) => {
    const element = document.getElementById(`category-${category}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveCategory(category);
      setTimeout(() => setActiveCategory(null), 2000);
    }
    setMobileMenuOpen(false);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFeedback = useCallback((faqId: string, type: 'up' | 'down') => {
    setFeedbackGiven((prev) => ({ ...prev, [faqId]: type }));
    // Here you could send feedback to analytics/backend
  }, []);

  const allExpanded = expandedItems.size === filteredFaqs.length && filteredFaqs.length > 0;

  // Render FAQ Item
  const renderFAQItem = (faq: FAQ, showCategory: boolean = false) => {
    const isExpanded = expandedItems.has(faq.id);
    const hasFeedback = feedbackGiven[faq.id];

    return (
      <article
        key={faq.id}
        className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden"
      >
        <button
          type="button"
          onClick={() => toggleExpanded(faq.id)}
          className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-start justify-between gap-3 sm:gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
          aria-expanded={isExpanded}
          aria-controls={`faq-answer-${faq.id}`}
          id={`faq-question-${faq.id}`}
        >
          <div className="flex-1 min-w-0">
            {showCategory && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-full mb-2">
                {categoryIcons[faq.category]} {categoryLabels[faq.category] || faq.category}
              </span>
            )}
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white pr-2 group-hover:text-primary transition-colors">
              {highlightText(faq.question, searchQuery)}
            </h3>
          </div>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isExpanded
              ? 'bg-primary text-white rotate-180'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-primary/10 dark:group-hover:bg-primary/20 group-hover:text-primary'
          }`}>
            <ChevronDown className="h-5 w-5" aria-hidden="true" />
          </div>
        </button>

        <div
          id={`faq-answer-${faq.id}`}
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
          role="region"
          aria-labelledby={`faq-question-${faq.id}`}
        >
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-gray-100 dark:border-gray-700">
            <div className="mt-4 prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {highlightText(faq.answer, searchQuery)}
              </p>
            </div>

            {/* Feedback Section */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Bu yanıt faydalı oldu mu?</p>
              <div className="flex items-center gap-2">
                {hasFeedback ? (
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" /> Teşekkürler!
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback(faq.id, 'up');
                      }}
                      className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      aria-label="Evet, faydalı oldu"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFeedback(faq.id, 'down');
                      }}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      aria-label="Hayır, faydalı olmadı"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Error Banner (if any) */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl" role="alert">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Bilgi:</strong> Veritabanından veri yüklenirken bir sorun oluştu. Sayfa varsayılan içerikle gösteriliyor.
            </p>
          </div>
        )}

        {/* Empty State - No FAQs */}
        {!error && faqs.length === 0 && (
          <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl" role="alert">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Bilgi:</strong> Şu anda veritabanında soru bulunmamaktadır. Lütfen daha sonra tekrar kontrol edin veya iletişim sayfamızdan sorularınızı bize iletin.
            </p>
          </div>
        )}

        {/* Hero Section - Premium Modern Design */}
        <header className="text-center mb-10 sm:mb-12 lg:mb-16">
          {/* Stats Badges - Like Reference Site */}
          {faqs.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                <MessageCircleQuestion className="h-4 w-4" />
                <span>{faqs.length}+ Soru ve Cevap</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                <span>{categories.length} Kategori</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                <span>Güncel Bilgiler</span>
              </div>
            </div>
          )}
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            Sık Sorulan Sorular
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Karasu emlak hakkında merak ettiklerinize yanıt bulun. Satılık ve kiralık gayrimenkul işlemleri, fiyatlar, mahalleler ve yatırım konularında kapsamlı bilgiler.
          </p>
          
          {/* Additional Stats */}
          {faqs.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                {faqs.length}+ Soru
              </span>
              <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {new Date().getFullYear()} Güncel
              </span>
              <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Uzman Cevaplar
              </span>
            </div>
          )}
        </header>

        {/* Search Bar - Enhanced with Category Filter */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-primary transition-colors" aria-hidden="true" />
              <Input
                type="text"
                placeholder="Sorularınızı arayın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-base w-full border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:border-primary dark:focus:border-primary focus:ring-4 focus:ring-primary/10 dark:focus:ring-primary/20 transition-all shadow-sm hover:shadow-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                aria-label="FAQ arama"
              />
            </div>
            {/* Quick Category Filter - Desktop */}
            <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary/50'
                }`}
              >
                Tümü ({faqs.length})
              </button>
              {categories.slice(0, 4).map((category) => {
                const count = categoryCounts[category] || 0;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setSearchQuery('');
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary/50'
                    }`}
                  >
                    {categoryLabels[category] || category} ({count})
                  </button>
                );
              })}
            </div>
          </div>
          {searchQuery && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400" role="status" aria-live="polite">
              <strong className="text-primary">{filteredFaqs.length}</strong> sonuç bulundu
              {searchQuery && <span className="text-gray-400 dark:text-gray-500"> - &quot;{searchQuery}&quot;</span>}
            </p>
          )}
        </div>

        {/* Popular Questions Section - Enhanced */}
        {popularFaqs.length > 0 && !searchQuery && selectedCategory === 'all' && (
          <section className="mb-10 sm:mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Popüler Sorular</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">En çok aranan sorular</p>
              </div>
            </div>
            <div className="grid gap-4">
              {popularFaqs.map((faq) => renderFAQItem(faq, true))}
            </div>
          </section>
        )}

        {/* Mobile Category Filter Button */}
        <div className="lg:hidden mb-6">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
              <Filter className="h-5 w-5" />
              {selectedCategory === 'all'
                ? 'Tüm Kategoriler'
                : `${categoryIcons[selectedCategory] || ''} ${categoryLabels[selectedCategory] || selectedCategory}`
              }
            </span>
            <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </button>
        </div>

        {/* Mobile Category Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-4 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kategoriler</h2>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Kapat"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <nav className="p-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Tümü ({faqs.length})
                </button>
                {categories.map((category) => {
                  const count = categoryCounts[category] || 0;
                  return (
                    <button
                      type="button"
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSearchQuery('');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all flex items-center gap-3 ${
                        selectedCategory === category
                          ? 'bg-primary text-white shadow-lg shadow-primary/25'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="text-lg">{categoryIcons[category]}</span>
                      <span className="flex-1">{categoryLabels[category] || category}</span>
                      <span className={`text-sm ${selectedCategory === category ? 'text-white/80' : 'text-gray-400 dark:text-gray-500'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content - Two Column Layout on Desktop */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8" ref={mainContentRef}>
          {/* Category Navigation - Sticky Sidebar on Desktop */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4" id="categories-heading">
                  Kategoriler
                </h2>
                <nav className="space-y-1.5" aria-labelledby="categories-heading" role="navigation">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    aria-current={selectedCategory === 'all' ? 'page' : undefined}
                  >
                    Tümü ({faqs.length})
                  </button>
                  {categories.map((category) => {
                    const count = categoryCounts[category] || 0;
                    return (
                      <button
                        type="button"
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setSearchQuery('');
                          scrollToCategory(category);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                          selectedCategory === category
                            ? 'bg-primary text-white shadow-lg shadow-primary/25'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        aria-current={selectedCategory === category ? 'page' : undefined}
                      >
                        <span>{categoryIcons[category]}</span>
                        <span className="flex-1">{categoryLabels[category] || category}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          selectedCategory === category
                            ? 'bg-white/20 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </nav>

                {/* Quick Actions */}
                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Hızlı İşlemler</h3>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={allExpanded ? collapseAll : expandAll}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {allExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" /> Tümünü Kapat
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" /> Tümünü Aç
                        </>
                      )}
                    </button>
                    <Link
                      href={`${basePath}/iletisim`}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <MessageCircleQuestion className="h-4 w-4" /> Soru Sor
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* FAQ Content - Main Area */}
          <main className="lg:col-span-9">
            {/* Expand/Collapse All - Mobile */}
            {filteredFaqs.length > 0 && (
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredFaqs.length} soru listeleniyor
                </span>
                <button
                  type="button"
                  onClick={allExpanded ? collapseAll : expandAll}
                  className="text-sm font-medium text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors flex items-center gap-1"
                >
                  {allExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" /> Tümünü Kapat
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" /> Tümünü Aç
                    </>
                  )}
                </button>
              </div>
            )}

            {filteredFaqs.length > 0 ? (
              <div className="space-y-10 sm:space-y-12">
                {Object.entries(groupedFaqs)
                  .sort(([a], [b]) => {
                    const aIndex = categoryOrder.indexOf(a);
                    const bIndex = categoryOrder.indexOf(b);
                    if (aIndex === -1 && bIndex === -1) return 0;
                    if (aIndex === -1) return 1;
                    if (bIndex === -1) return -1;
                    return aIndex - bIndex;
                  })
                  .map(([category, categoryFaqs]) => (
                    <section
                      key={category}
                      id={`category-${category}`}
                      className={`scroll-mt-24 transition-all duration-500 ${
                        activeCategory === category ? 'ring-2 ring-primary/20 dark:ring-primary/30 rounded-2xl p-4 -m-4' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-xl">
                          <span className="text-2xl">{categoryIcons[category]}</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {categoryLabels[category] || category}
                        </h2>
                        <span className="text-sm font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                          {categoryFaqs.length}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {categoryFaqs.map((faq) => renderFAQItem(faq))}
                      </div>
                    </section>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 px-4">
                <div className="max-w-md mx-auto">
                  <div className="mb-6 w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Sonuç bulunamadı
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    &quot;{searchQuery || selectedCategory}&quot; için sonuç bulunamadı.
                    Farklı bir arama terimi deneyin veya uzman ekibimizle iletişime geçin.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      variant="outline"
                      className="min-w-[140px] border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Filtreleri Temizle
                    </Button>
                    <Link href={`${basePath}/iletisim`}>
                      <Button className="min-w-[140px] bg-primary hover:bg-primary-dark dark:bg-primary dark:hover:bg-primary-light text-white">
                        İletişime Geç
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Related Links Section - Enhanced */}
            <section className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                İlgili Sayfalar
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { href: '/satilik', title: 'Satılık Emlaklar', desc: 'Karasu\'da satılık ev, villa ve arsa ilanları', icon: '🏠' },
                  { href: '/kiralik', title: 'Kiralık Emlaklar', desc: 'Karasu\'da kiralık ev ve daire seçenekleri', icon: '🔑' },
                  { href: '/karasu-emlak-rehberi', title: 'Emlak Rehberi', desc: 'Karasu emlak alım-satım rehberi ve ipuçları', icon: '📚' },
                  { href: '/karasu-mahalleler', title: 'Mahalleler', desc: 'Karasu ve Kocaali mahalleleri hakkında bilgiler', icon: '🏘️' },
                  { href: '/karasu-yatirimlik-gayrimenkul', title: 'Yatırım Rehberi', desc: 'Karasu\'da emlak yatırımı için rehber', icon: '📈' },
                  { href: '/rehber', title: 'Tüm Rehberler', desc: 'Emlak, kiralama ve yatırım rehberleri', icon: '📋' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={`${basePath}${link.href}`}
                    className="group p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary dark:hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{link.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors mb-1">
                          {link.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {link.desc}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* CTA Section - Enhanced */}
            <section className="mt-12 sm:mt-16 bg-gradient-to-br from-primary to-primary-dark dark:from-primary dark:to-primary-dark rounded-2xl p-6 sm:p-10 text-center text-white overflow-hidden relative">
              <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1] pointer-events-none">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                  backgroundSize: '32px 32px',
                }}></div>
              </div>
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                  Aradığınız cevabı bulamadınız mı?
                </h2>
                <p className="text-white/90 dark:text-white/80 mb-8 max-w-2xl mx-auto text-base sm:text-lg">
                  Uzman ekibimiz tüm sorularınızı yanıtlamaya hazır. WhatsApp veya telefon ile hemen iletişime geçin.
                </p>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  <Link href={`${basePath}/iletisim`}>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100 dark:bg-white dark:text-primary dark:hover:bg-gray-100 px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold shadow-lg">
                      İletişime Geç
                    </Button>
                  </Link>
                  <Link href={`${basePath}/satilik`}>
                    <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 dark:border-white dark:text-white dark:hover:bg-white/10 px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold">
                      İlanları İncele
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-primary text-white rounded-full shadow-lg shadow-primary/25 hover:bg-primary-dark dark:hover:bg-primary-light transition-all duration-300 flex items-center justify-center animate-in fade-in slide-in-from-bottom-4"
          aria-label="Yukarı çık"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
