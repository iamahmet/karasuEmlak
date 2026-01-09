"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";
import { Edit, FileText } from "lucide-react";
import { BulkActionsBar } from "./BulkActionsBar";
import { ContentPreview } from "./ContentPreview";
import { ContentSearch } from "./ContentSearch";
import { ContentFilters, ContentFilters as ContentFiltersType } from "./ContentFilters";
import { ExportImport } from "./ExportImport";
import { cn } from "@karasu/lib";
import { Checkbox } from "@karasu/ui";
import { LoadingState } from "../ui/LoadingState";
import { EmptyState } from "../empty-states/EmptyState";

export function DraftsTab({ locale }: { locale: string }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<any[]>([]);
  const [filteredDrafts, setFilteredDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<ContentFiltersType>({
    search: "",
    status: "draft",
    type: "all",
    category: "all",
    dateRange: "all",
    author: "all",
    tags: [],
  });

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/content-studio?status=draft");
      const data = await response.json();
      
      if (!data.success) {
        // If table doesn't exist, show empty state instead of error
        if (data.code === "TABLE_NOT_FOUND" || data.code === "INTERNAL_ERROR") {
          setDrafts([]);
          applyFilters([], filters);
          return;
        }
        toast.error(data.message || data.error || "Failed to fetch drafts");
        return;
      }
      
      const items = data.data?.items || data.items || [];
      setDrafts(items);
      applyFilters(items, filters);
    } catch (error: any) {
      // Network errors - show empty state
      setDrafts([]);
      applyFilters([], filters);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string, ids: string[]) => {
    const response = await fetch(`/api/content-studio/${ids[0]}/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ids }),
    });

    const data = await response.json();
    if (data.success) {
      fetchDrafts();
    } else {
      throw new Error(data.error || "Bulk action failed");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDrafts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDrafts.map((d) => d.id));
    }
  };

  const applyFilters = (items: any[], currentFilters: ContentFiltersType) => {
    let filtered = [...items];

    // Search filter
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      filtered = filtered.filter((item) => {
        const localeContent = item.locales?.find((l: any) => l.locale === locale);
        return (
          localeContent?.title?.toLowerCase().includes(searchLower) ||
          localeContent?.excerpt?.toLowerCase().includes(searchLower) ||
          item.slug?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Type filter
    if (currentFilters.type !== "all") {
      filtered = filtered.filter((item) => item.type === currentFilters.type);
    }

    // Date range filter
    if (currentFilters.dateRange !== "all") {
      const now = new Date();
      let startDate: Date;
      switch (currentFilters.dateRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case "year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(0);
      }
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.created_at);
        return itemDate >= startDate;
      });
    }

    setFilteredDrafts(filtered);
  };

  const handleFiltersChange = (newFilters: ContentFiltersType) => {
    setFilters(newFilters);
    applyFilters(drafts, newFilters);
  };

  if (loading) {
    return <LoadingState variant="cards" skeletonCount={6} message="Taslaklar yükleniyor..." />;
  }

  return (
    <div className="space-y-4">
      {/* Export/Import */}
      <div className="flex justify-end">
        <ExportImport
          contentItems={filteredDrafts}
          onImport={async (items) => {
            // Handle import logic
            toast.success(`${items.length} içerik içe aktarıldı`);
            fetchDrafts();
          }}
        />
      </div>

      {/* Advanced Filters */}
      <ContentFilters onFiltersChange={handleFiltersChange} locale={locale} />

      {/* Search */}
      <ContentSearch
        locale={locale}
      />

      {filteredDrafts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Taslak bulunamadı"
          description={
            filters.search || filters.status !== "draft" || filters.type !== "all"
              ? "Arama kriterlerinize uygun taslak bulunamadı"
              : "Henüz taslak içerik yok. Yeni içerik oluşturmak için Content Studio'yu kullanın."
          }
          variant="compact"
          action={
            filters.search || filters.status !== "draft" || filters.type !== "all"
              ? undefined
              : {
                  label: "Yeni İçerik Oluştur",
                  onClick: () => router.push(`/seo/content-studio?tab=create`),
                }
          }
        />
      ) : (
        <>
          {filteredDrafts.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                className="h-9 px-3 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui hover-scale"
              >
                {selectedIds.length === filteredDrafts.length ? "Tümünü Kaldır" : "Tümünü Seç"}
              </Button>
              {selectedIds.length > 0 && (
                <span className="text-sm text-design-gray dark:text-gray-400 font-ui">
                  {selectedIds.length} seçili
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrafts.map((draft) => {
              const localeContent = draft.locales?.find((l: any) => l.locale === locale);
              const isSelected = selectedIds.includes(draft.id);

              return (
                <Card
                  key={draft.id}
                  className={cn(
                    "card-professional hover-lift cursor-pointer relative overflow-hidden transition-all duration-300",
                    isSelected && "ring-2 ring-design-light shadow-lg"
                  )}
                  onClick={() => !isSelected && toggleSelection(draft.id)}
                >
                  <div className="absolute top-3 right-3 z-10">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelection(draft.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded border-2 border-[#E7E7E7] dark:border-[#062F28] data-[state=checked]:bg-design-light data-[state=checked]:border-design-light"
                    />
                  </div>

                  <CardHeader className="pb-3 px-4 pt-4">
                    <CardTitle className="line-clamp-2 text-base font-display font-bold text-design-dark dark:text-white pr-8">
                      {localeContent?.title || draft.slug}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    {localeContent?.excerpt && (
                      <p className="text-sm text-design-gray dark:text-gray-400 font-ui line-clamp-2 mb-3">
                        {localeContent.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-design-light/15 text-design-dark dark:text-design-light font-ui font-semibold uppercase">
                        {draft.type}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E7E7E7] dark:bg-[#062F28] text-design-gray dark:text-gray-400 font-ui font-semibold">
                        {draft.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/seo/content-studio/${draft.id}`);
                        }}
                        className="flex-1 h-9 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui hover-scale"
                      >
                        <Edit className="h-3.5 w-3.5 mr-2" />
                        Düzenle
                      </Button>
                      {localeContent && (
                        <ContentPreview
                          content={{
                            title: localeContent.title,
                            content: localeContent.content || "",
                            excerpt: localeContent.excerpt,
                            metaDescription: localeContent.meta_description,
                            featuredImage: draft.featured_image_url,
                            locale: locale,
                          }}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <BulkActionsBar
            selectedIds={selectedIds}
            onClearSelection={() => setSelectedIds([])}
            onBulkAction={handleBulkAction}
          />
        </>
      )}
    </div>
  );
}

