"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { Search, X, Calendar, FileText } from "lucide-react";
import { cn } from "@karasu/lib";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  slug: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  locales?: Array<{
    locale: string;
    title: string;
    content: string;
    excerpt?: string;
    meta_description?: string;
  }>;
}

interface ContentSearchProps {
  locale: string;
  onSelect?: (item: ContentItem) => void;
}

export function ContentSearch({ locale, onSelect }: ContentSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    fetchItems();
  }, [statusFilter, typeFilter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      params.append("locale", locale);

      const response = await fetch(`/api/content-studio?${params.toString()}`);
      const data = await response.json();
      
      if (!data.success) {
        // If table doesn't exist, show empty state
        if (data.code === "TABLE_NOT_FOUND" || data.code === "INTERNAL_ERROR") {
          setItems([]);
          return;
        }
        toast.error(data.message || "İçerikler yüklenemedi");
        setItems([]);
        return;
      }
      
      setItems(data.data?.items || data.items || []);
    } catch (error) {
      // Network errors - show empty state
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const localeData = item.locales?.find((l) => l.locale === locale);
        return (
          item.slug.toLowerCase().includes(query) ||
          localeData?.title?.toLowerCase().includes(query) ||
          localeData?.content?.toLowerCase().includes(query) ||
          localeData?.excerpt?.toLowerCase().includes(query) ||
          localeData?.meta_description?.toLowerCase().includes(query)
        );
      });
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter((item) => new Date(item.created_at) >= filterDate);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter((item) => new Date(item.created_at) >= filterDate);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter((item) => new Date(item.created_at) >= filterDate);
          break;
        case "year":
          filterDate.setFullYear(now.getFullYear() - 1);
          filtered = filtered.filter((item) => new Date(item.created_at) >= filterDate);
          break;
      }
    }

    return filtered;
  }, [items, searchQuery, statusFilter, typeFilter, dateFilter, locale]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setDateFilter("all");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || typeFilter !== "all" || dateFilter !== "all";

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card className="card-professional">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-design-gray dark:text-gray-400" />
              <Input
                type="text"
                placeholder="İçerik ara... (başlık, slug, içerik)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-modern"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] px-4 py-2 rounded-lg border border-[#E7E7E7] dark:border-[#062F28] bg-white dark:bg-[#0a3d35] text-sm font-ui">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="draft">Taslak</SelectItem>
                  <SelectItem value="review">İnceleme</SelectItem>
                  <SelectItem value="approved">Onaylandı</SelectItem>
                  <SelectItem value="published">Yayınlandı</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] px-4 py-2 rounded-lg border border-[#E7E7E7] dark:border-[#062F28] bg-white dark:bg-[#0a3d35] text-sm font-ui">
                  <SelectValue placeholder="Tip" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Tipler</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="cornerstone">Rehber</SelectItem>
                  <SelectItem value="breaking">Breaking</SelectItem>
                  <SelectItem value="programmatic">Programmatic</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px] px-4 py-2 rounded-lg border border-[#E7E7E7] dark:border-[#062F28] bg-white dark:bg-[#0a3d35] text-sm font-ui">
                  <SelectValue placeholder="Tarih" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Zamanlar</SelectItem>
                  <SelectItem value="today">Bugün</SelectItem>
                  <SelectItem value="week">Son 7 Gün</SelectItem>
                  <SelectItem value="month">Son 30 Gün</SelectItem>
                  <SelectItem value="year">Son Yıl</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="hover-scale micro-bounce rounded-xl"
                >
                  <X className="h-4 w-4 mr-2" />
                  Temizle
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-design-light" />
              Arama Sonuçları
            </div>
            <Badge variant="outline" className="text-xs font-ui">
              {filteredItems.length} sonuç
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 skeleton-professional rounded-lg" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-design-gray dark:text-gray-400" />
              <p className="text-sm text-design-gray dark:text-gray-400 font-ui">
                {hasActiveFilters ? "Arama kriterlerinize uygun içerik bulunamadı" : "Henüz içerik yok"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const localeData = item.locales?.find((l) => l.locale === locale);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "p-4 rounded-lg border border-[#E7E7E7] dark:border-[#062F28] bg-white dark:bg-[#0a3d35] hover:border-design-light transition-all cursor-pointer hover-lift",
                      selectedItem?.id === item.id && "border-design-light bg-design-light/5"
                    )}
                    onClick={() => {
                      setSelectedItem(item);
                      if (onSelect) {
                        onSelect(item);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-display font-bold text-design-dark dark:text-white line-clamp-1">
                            {localeData?.title || item.slug}
                          </h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-2 py-0.5 font-ui capitalize",
                              item.status === "published" && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
                              item.status === "draft" && "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
                              item.status === "review" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                            )}
                          >
                            {item.status}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-ui capitalize">
                            {item.type}
                          </Badge>
                        </div>
                        {localeData?.excerpt && (
                          <p className="text-xs text-design-gray dark:text-gray-400 font-ui line-clamp-2 mb-2">
                            {localeData.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-[10px] text-design-gray dark:text-gray-400 font-ui">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.created_at).toLocaleDateString("tr-TR")}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {localeData?.content?.length || 0} karakter
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
