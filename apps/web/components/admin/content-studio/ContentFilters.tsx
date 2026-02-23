"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Filter, X, Search } from "lucide-react";

export interface ContentFilters {
  search: string;
  status: string;
  type: string;
  category: string;
  dateRange: string;
  author: string;
  tags: string[];
}

interface ContentFiltersProps {
  onFiltersChange: (filters: ContentFilters) => void;
  locale?: string;
}

export function ContentFilters({ onFiltersChange }: ContentFiltersProps) {
  const [filters, setFilters] = useState<ContentFilters>({
    search: "",
    status: "all",
    type: "all",
    category: "all",
    dateRange: "all",
    author: "all",
    tags: [],
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof ContentFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: ContentFilters = {
      search: "",
      status: "all",
      type: "all",
      category: "all",
      dateRange: "all",
      author: "all",
      tags: [],
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== "all" && v !== "" && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  return (
    <Card className="card-professional">
      <CardHeader className="pb-4 px-5 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Filter className="h-5 w-5 text-design-light" />
            Filtreler
            {activeFiltersCount > 0 && (
              <Badge className="bg-design-light text-white text-[10px] px-2 py-0.5">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-3 text-xs gap-1"
            >
              <X className="h-3 w-3" />
              Temizle
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-design-gray dark:text-gray-400" />
          <Input
            placeholder="İçerik ara..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 mb-1 block">
              Durum
            </label>
            <Select value={filters.status} onValueChange={(v) => handleFilterChange("status", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="draft">Taslak</SelectItem>
                <SelectItem value="review">İnceleme</SelectItem>
                <SelectItem value="published">Yayınlanan</SelectItem>
                <SelectItem value="archived">Arşivlenen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 mb-1 block">
              Tip
            </label>
            <Select value={filters.type} onValueChange={(v) => handleFilterChange("type", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="blog">Blog</SelectItem>
                <SelectItem value="news">Haber</SelectItem>
                <SelectItem value="howto">Nasıl Yapılır</SelectItem>
                <SelectItem value="cornerstone">Rehber</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 mb-1 block">
              Tarih
            </label>
            <Select value={filters.dateRange} onValueChange={(v) => handleFilterChange("dateRange", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="today">Bugün</SelectItem>
                <SelectItem value="week">Bu Hafta</SelectItem>
                <SelectItem value="month">Bu Ay</SelectItem>
                <SelectItem value="year">Bu Yıl</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 mb-1 block">
              Kategori
            </label>
            <Select value={filters.category} onValueChange={(v) => handleFilterChange("category", v)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {/* Categories will be loaded dynamically */}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full h-8 text-xs gap-2"
        >
          <Filter className="h-3 w-3" />
          {showAdvanced ? "Gelişmiş Filtreleri Gizle" : "Gelişmiş Filtreleri Göster"}
        </Button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E7E7E7] dark:border-[#062F28]">
            <div>
              <label className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 mb-1 block">
                Yazar
              </label>
              <Select value={filters.author} onValueChange={(v) => handleFilterChange("author", v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {/* Authors will be loaded dynamically */}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 mb-1 block">
                Etiketler
              </label>
              <Input
                placeholder="Etiket ara..."
                value={filters.tags.join(", ")}
                onChange={(e) => {
                  const tags = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                  handleFilterChange("tags", tags);
                }}
                className="h-9 text-sm"
              />
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E7E7E7] dark:border-[#062F28]">
            {filters.status !== "all" && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 flex items-center gap-1">
                Durum: {filters.status}
                                <button
                                  onClick={() => handleFilterChange("status", "all")}
                                  className="ml-1 hover:text-red-600"
                                  title="Durum filtresini kaldır"
                                  aria-label="Durum filtresini kaldır"
                                >
                                  <X className="h-3 w-3" />
                                </button>
              </Badge>
            )}
            {filters.type !== "all" && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 flex items-center gap-1">
                Tip: {filters.type}
                                <button
                                  onClick={() => handleFilterChange("type", "all")}
                                  className="ml-1 hover:text-red-600"
                                  title="Tip filtresini kaldır"
                                  aria-label="Tip filtresini kaldır"
                                >
                                  <X className="h-3 w-3" />
                                </button>
              </Badge>
            )}
            {filters.dateRange !== "all" && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 flex items-center gap-1">
                Tarih: {filters.dateRange}
                                <button
                                  onClick={() => handleFilterChange("dateRange", "all")}
                                  className="ml-1 hover:text-red-600"
                                  title="Tarih filtresini kaldır"
                                  aria-label="Tarih filtresini kaldır"
                                >
                                  <X className="h-3 w-3" />
                                </button>
              </Badge>
            )}
            {filters.search && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 flex items-center gap-1">
                Arama: {filters.search}
                                <button
                                  onClick={() => handleFilterChange("search", "")}
                                  className="ml-1 hover:text-red-600"
                                  title="Arama filtresini kaldır"
                                  aria-label="Arama filtresini kaldır"
                                >
                                  <X className="h-3 w-3" />
                                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

