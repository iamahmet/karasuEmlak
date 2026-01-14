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
  FileText,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Loader2,
  ExternalLink,
  Calendar,
  TrendingUp,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  featured_image: string | null;
  category_slug: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  views: number;
  reading_time: number | null;
  is_featured: boolean;
  is_breaking: boolean;
  created_at: string;
  updated_at: string;
}

export function ArticlesManagement({ locale: _locale }: { locale: string }) {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, [statusFilter]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // Use retry mechanism for API calls
      const { fetchWithRetry } = await import("@/lib/utils/api-client");
      const data = await fetchWithRetry(`/api/articles?limit=100`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!data.success) {
        // If table doesn't exist, show empty state
        if (data.code === "TABLE_NOT_FOUND" || data.code === "INTERNAL_ERROR") {
          setArticles([]);
          return;
        }
        throw new Error(data.error || "Makaleler yüklenemedi");
      }

      // API returns { success: true, data: { articles: [...] } } or { success: true, articles: [...] }
      const articlesData = (data as any).data?.articles || (data as any).articles || [];

      // Filter by status if needed (client-side filtering for admin)
      let filtered = articlesData;
      if (statusFilter === "published") {
        filtered = filtered.filter((a: Article) => a.status === "published" || a.published_at);
      } else if (statusFilter === "draft") {
        filtered = filtered.filter((a: Article) => a.status === "draft" || !a.published_at);
      }

      setArticles(filtered);
    } catch (error: any) {
      // Articles fetch failed, show error and empty state
      const { handleApiError } = await import("@/lib/utils/api-client");
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.userFriendly);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchArticles();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu makaleyi silmek istediğinize emin misiniz?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Silme başarısız");
      }

      toast.success("Makale silindi");
      fetchArticles();
    } catch (error: any) {
      toast.error(error.message || "Silme başarısız");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublished = async (article: Article) => {
    try {
      const newStatus = article.status === "published" ? "draft" : "published";
      const response = await fetch(`/api/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...article,
          isPublished: newStatus === "published",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Güncelleme başarısız");
      }

      toast.success(newStatus === "published" ? "Makale yayınlandı" : "Makale taslağa alındı");
      fetchArticles();
    } catch (error: any) {
      toast.error(error.message || "Güncelleme başarısız");
    }
  };

  const filteredArticles = articles.filter((article) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(query) ||
        article.slug.toLowerCase().includes(query) ||
        (article.category_slug && article.category_slug.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const getWebUrl = (slug: string) => {
    if (typeof window === "undefined") return "";
    const baseUrl = window.location.origin.replace(":3001", ":3000");
    return `${baseUrl}/blog/${slug}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-design-dark dark:text-white">
            Makale Yönetimi
          </h2>
          <p className="text-sm text-design-gray dark:text-gray-400 mt-1">
            Blog makalelerini görüntüleyin, düzenleyin ve yönetin
          </p>
        </div>
        <Button
          onClick={() => router.push("/articles/new", { locale: _locale })}
          className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Makale
        </Button>
      </div>

      {/* Filters */}
      <Card className="card-professional">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 mb-2 block">
                Arama
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Makale başlığı, slug veya kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="input-modern"
                />
                <Button onClick={handleSearch} size="icon" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 mb-2 block">
                Durum
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="input-modern">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="published">Yayınlanmış</SelectItem>
                  <SelectItem value="draft">Taslak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-design-gray dark:text-gray-400">
                <span className="font-semibold">{filteredArticles.length}</span> makale bulundu
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-design-light" />
            Makaleler ({filteredArticles.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-design-light" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-design-gray dark:text-gray-400 mx-auto mb-4 opacity-50" />
              <p className="text-sm text-design-gray dark:text-gray-400 font-ui">
                {searchQuery ? "Arama kriterlerinize uygun makale bulunamadı" : "Henüz makale bulunmuyor"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => router.push("/articles/new", { locale: _locale })}
                  className="mt-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  İlk Makaleyi Oluştur
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 border border-[#E7E7E7] dark:border-[#062F28] rounded-lg hover:border-design-light transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="text-sm font-display font-bold text-design-dark dark:text-white group-hover:text-design-light transition-colors truncate">
                        {article.title}
                      </h3>
                      {article.status === "published" ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-[10px] px-2 py-0.5">
                          <Eye className="h-3 w-3 mr-1" />
                          Yayında
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Taslak
                        </Badge>
                      )}
                      {article.is_featured && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-[10px] px-2 py-0.5">
                          Öne Çıkan
                        </Badge>
                      )}
                      {article.is_breaking && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-[10px] px-2 py-0.5">
                          Son Dakika
                        </Badge>
                      )}
                      {/* AI Checker Badge - Show if content might be AI-like */}
                      <Badge 
                        className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 text-[10px] px-2 py-0.5 cursor-help"
                        title="AI Checker ile kontrol edin"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Check
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-design-gray dark:text-gray-400">
                      <span className="truncate">/{article.slug}</span>
                      {article.category_slug && (
                        <span className="truncate">• {article.category_slug}</span>
                      )}
                      {article.views > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {article.views.toLocaleString("tr-TR")} görüntülenme
                        </span>
                      )}
                      {article.reading_time && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {article.reading_time} dk
                        </span>
                      )}
                      {article.published_at && (
                        <span>
                          {new Date(article.published_at).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/articles/${article.id}`, { locale: _locale })}
                      className="h-9"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublished(article)}
                      className="h-9"
                    >
                      {article.status === "published" ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Yayından Kaldır
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Yayınla
                        </>
                      )}
                    </Button>
                    {article.status === "published" && (
                      <Link
                        href={getWebUrl(article.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="h-9">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Görüntüle
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(article.id)}
                      disabled={deletingId === article.id}
                      className="h-9 text-destructive hover:text-destructive"
                    >
                      {deletingId === article.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
