"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from "@karasu/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karasu/ui";
import {
  Newspaper,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import Link from "next/link";
import { LoadingState } from "../ui/LoadingState";
import { EmptyState } from "../empty-states/EmptyState";

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  published_at: string | null;
  cover_image: string | null;
  source_domain: string | null;
  created_at: string;
  updated_at: string;
}

export function NewsManagement({ locale }: { locale: string }) {
  const router = useRouter();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");

  useEffect(() => {
    fetchNews();
  }, [publishedFilter]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (publishedFilter !== "all") {
        params.append("published", publishedFilter);
      }
      params.append("limit", "100");

      // Use retry mechanism for API calls
      const { fetchWithRetry } = await import("@/lib/utils/api-client");
      const data = await fetchWithRetry(`/api/news?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!data.success) {
        // If table doesn't exist, show empty state
        if (data.code === "TABLE_NOT_FOUND" || data.code === "INTERNAL_ERROR") {
          setNews([]);
          return;
        }
        throw new Error(data.error || "Haberler yüklenemedi");
      }

      setNews((data as any).data?.articles || (data as any).articles || []);
    } catch (error: any) {
      // News fetch failed, show user-friendly error
      const { handleApiError } = await import("@/lib/utils/api-client");
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.userFriendly);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchNews();
  };

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentStatus }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Güncelleme başarısız");
      }

      toast.success(
        currentStatus ? "Haber yayından kaldırıldı" : "Haber yayınlandı"
      );
      fetchNews();
    } catch (error: any) {
      toast.error(error.message || "Güncelleme başarısız");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu haberi silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/news/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Silme başarısız");
      }

      toast.success("Haber silindi");
      fetchNews();
    } catch (error: any) {
      toast.error(error.message || "Silme başarısız");
    }
  };

  const filteredNews = news.filter((article) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(query) ||
        article.slug.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Arama</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Haber başlığı veya slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Yayın Durumu
              </label>
              <Select
                value={publishedFilter}
                onValueChange={setPublishedFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="true">Yayında</SelectItem>
                  <SelectItem value="false">Taslak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Haberler ({filteredNews.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState variant="skeleton" skeletonCount={5} message="Haberler yükleniyor..." />
          ) : filteredNews.length === 0 ? (
            <EmptyState
              icon={Newspaper}
              title="Henüz haber bulunmuyor"
              description="İlk haberinizi oluşturmak için yukarıdaki 'Yeni Haber' butonuna tıklayın."
              variant="compact"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Başlık</th>
                    <th className="text-left p-4">Kaynak</th>
                    <th className="text-left p-4">Durum</th>
                    <th className="text-left p-4">Yayın Tarihi</th>
                    <th className="text-right p-4">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNews.map((article) => (
                    <tr key={article.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">{article.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {article.slug}
                        </div>
                      </td>
                      <td className="p-4">
                        {article.source_domain || "-"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {article.published ? (
                            <Badge variant="default" className="bg-green-500">
                              <Eye className="h-3 w-3 mr-1" />
                              Yayında
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Taslak
                            </Badge>
                          )}
                          {article.featured && (
                            <Badge variant="outline">Öne Çıkan</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString("tr-TR")
                          : "-"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleTogglePublished(article.id, article.published)
                            }
                            title={
                              article.published
                                ? "Yayından Kaldır"
                                : "Yayınla"
                            }
                          >
                            {article.published ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/haberler/${article.id}/edit`, { locale })}
                            title="Düzenle"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(article.id)}
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          {article.published && (
                            <Link
                              href={`http://localhost:3000/haberler/${article.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="ghost" size="icon" title="Görüntüle">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

