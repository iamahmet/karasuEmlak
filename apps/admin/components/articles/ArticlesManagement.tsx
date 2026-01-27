"use client";

import { useState, useEffect, useMemo } from "react";
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
  Filter,
  X,
  RefreshCw,
  Grid3x3,
  List,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import Link from "next/link";
import { cn } from "@karasu/lib";

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
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

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

  // Calculate statistics
  const stats = useMemo(() => {
    const total = articles.length;
    const published = articles.filter(a => a.status === "published" || a.published_at).length;
    const drafts = articles.filter(a => a.status === "draft" || !a.published_at).length;
    const featured = articles.filter(a => a.is_featured).length;
    const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
    
    return {
      total,
      published,
      drafts,
      featured,
      totalViews,
    };
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
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
  }, [articles, searchQuery]);

  const getWebUrl = (slug: string) => {
    if (typeof window === "undefined") return "";
    const baseUrl = window.location.origin.replace(":3001", ":3000");
    return `${baseUrl}/blog/${slug}`;
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Makaleler</h1>
            <p className="text-xs text-muted-foreground">{stats.total} makale</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchArticles}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Yenile
          </Button>
          <Button
            onClick={() => router.push("/articles/new", { locale: _locale })}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Yeni Makale
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border border-border/40 bg-card/95 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Toplam</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
              </div>
              <FileText className="h-5 w-5 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40 bg-card/95 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Yayında</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.published}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stats.drafts} taslak</p>
              </div>
              <Eye className="h-5 w-5 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40 bg-card/95 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Öne Çıkan</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.featured}</p>
              </div>
              <Sparkles className="h-5 w-5 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40 bg-card/95 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Toplam Görüntülenme</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stats.totalViews.toLocaleString("tr-TR")}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compact Filters */}
      <Card className={cn("transition-all", !showFilters && "border-dashed")}>
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold">Filtreler</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                fetchArticles();
              }}
              className="h-7 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Temizle
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-7 px-2 text-xs"
            >
              {showFilters ? "Gizle" : "Göster"}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent className="pt-0 px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="h-9 text-sm"
                  />
                  <Button onClick={handleSearch} size="icon" variant="outline" className="h-9 w-9">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="published">Yayınlanmış</SelectItem>
                    <SelectItem value="draft">Taslak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-end text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredArticles.length}</span>
                <span className="ml-1">makale</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Articles List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Makaleler ({filteredArticles.length})
          </CardTitle>
          <div className="flex items-center gap-1 border rounded-md p-0.5">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-7 px-2"
            >
              <List className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-7 px-2"
            >
              <Grid3x3 className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Arama kriterlerinize uygun makale bulunamadı" : "Henüz makale bulunmuyor"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => router.push("/articles/new", { locale: _locale })}
                  size="sm"
                  className="mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  İlk Makaleyi Oluştur
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/30 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {article.title}
                      </h3>
                      {article.status === "published" ? (
                        <Badge variant="default" className="bg-green-600 text-[10px] px-1.5 py-0 h-5 gap-1">
                          <Eye className="h-2.5 w-2.5" />
                          Yayında
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 gap-1">
                          <EyeOff className="h-2.5 w-2.5" />
                          Taslak
                        </Badge>
                      )}
                      {article.is_featured && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                          <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                          Öne Çıkan
                        </Badge>
                      )}
                      {article.is_breaking && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-destructive border-destructive">
                          Son Dakika
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="truncate font-mono">/{article.slug}</span>
                      {article.category_slug && (
                        <span className="truncate">• {article.category_slug}</span>
                      )}
                      {article.views > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {article.views.toLocaleString("tr-TR")}
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
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(`/blog/${article.slug}`);
                        toast.success("URL kopyalandı");
                      }}
                      className="h-8 w-8"
                      title="URL'yi kopyala"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/articles/${article.id}`, { locale: _locale })}
                      className="h-8 w-8"
                      title="Düzenle"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePublished(article)}
                      className="h-8 w-8"
                      title={article.status === "published" ? "Yayından Kaldır" : "Yayınla"}
                    >
                      {article.status === "published" ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    {article.status === "published" && (
                      <Link
                        href={getWebUrl(article.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Sitede Görüntüle">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(article.id)}
                      disabled={deletingId === article.id}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Sil"
                    >
                      {deletingId === article.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
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
