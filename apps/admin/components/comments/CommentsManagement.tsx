"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import { toast } from "sonner";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Trash2,
  FileText,
  User,
  Mail,
  Calendar,
  Globe,
  Eye,
  Reply,
  MoreVertical,
  Filter,
  Download,
  RefreshCw,
  Star,
  ThumbsUp,
  ThumbsDown,
  Shield,
  Ban,
  Edit,
  Copy,
  ExternalLink,
  X,
} from "lucide-react";
import { DataTable } from "../data-table/DataTable";
import { LoadingState } from "../ui/LoadingState";
import { EmptyState } from "../empty-states/EmptyState";
import { cn } from "@karasu/lib";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@karasu/ui";

interface Comment {
  id: string;
  article_id: string;
  user_id: string | null;
  author_name: string;
  author_email: string | null;
  content: string;
  status?: "pending" | "approved" | "rejected" | "spam";
  created_at: string;
  updated_at: string;
  article?: {
    title: string;
    slug: string;
  };
  user?: {
    email: string;
    name: string | null;
  };
}

export function CommentsManagement({
  locale: _locale,
  initialStatus = "all",
  initialArticle,
}: {
  locale: string;
  initialStatus?: string;
  initialArticle?: string;
}) {
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(initialStatus);
  const [selectedArticle, _setSelectedArticle] = useState(initialArticle || "all");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchComments();
  }, [selectedArticle]);

  useEffect(() => {
    filterComments();
  }, [searchQuery, comments, activeTab]);

  // Calculate stats - MUST be before any conditional returns to maintain hook order
  const stats = useMemo(() => {
    return {
      total: comments.length,
      pending: comments.filter((c) => c.status === "pending").length,
      approved: comments.filter((c) => c.status === "approved").length,
      rejected: comments.filter((c) => c.status === "rejected").length,
      spam: comments.filter((c) => c.status === "spam").length,
    };
  }, [comments]);

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) {
      toast.error("Lütfen en az bir yorum seçin");
      return;
    }

    try {
      if (action === "delete") {
        if (!confirm(`${selectedIds.length} yorumu silmek istediğinizden emin misiniz?`)) {
          return;
        }
        const response = await fetch(`/api/comments?ids=${selectedIds.join(",")}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Yorumlar silinemedi");
        toast.success(`${selectedIds.length} yorum silindi`);
      } else {
        const response = await fetch("/api/comments/bulk", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds, status: action }),
        });
        if (!response.ok) throw new Error("Yorumlar güncellenemedi");
        toast.success(`${selectedIds.length} yorum ${action === "approved" ? "onaylandı" : "reddedildi"}`);
      }
      setSelectedIds([]);
      fetchComments();
    } catch (error: any) {
      toast.error(error.message || "İşlem başarısız");
    }
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      // Use retry mechanism for API calls
      const { fetchWithRetry } = await import("@/lib/utils/api-client");
      const data = await fetchWithRetry("/api/comments", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      // Handle both success and error responses gracefully
      if (!data.success) {
        // If it's a table/cache issue, show empty state instead of error
        if (
          data.code === "TABLE_NOT_FOUND" ||
          data.code === "RESOURCE_NOT_FOUND" ||
          data.code === "POSTGREST_SCHEMA_STALE" ||
          data.error?.includes("cache")
        ) {
          if (process.env.NODE_ENV === "development") {
            console.warn("Table/cache issue, showing empty state");
          }
          setComments([]);
          setFilteredComments([]);
          return;
        }
        throw new Error(data.error || "Yorumlar yüklenemedi");
      }

      // Extract comments from response (handle different response formats)
      let commentsArray: any[] = [];
      
      if (data.data && Array.isArray(data.data.comments)) {
        commentsArray = data.data.comments;
      } else if (Array.isArray(data.data)) {
        commentsArray = data.data;
      } else if (Array.isArray((data as any).comments)) {
        commentsArray = (data as any).comments;
      }
      
      const commentsWithData: Comment[] = (commentsArray || []).map((comment: any) => ({
        id: comment.id,
        article_id: comment.content_id || comment.article_id,
        user_id: comment.user_id,
        author_name: comment.author_name || comment.profiles?.name || "Anonim",
        author_email: comment.author_email || comment.profiles?.email || null,
        content: comment.content || comment.comment,
        status: comment.status,
        // status field is used instead of is_approved
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        article: comment.content_items
          ? {
              title: comment.content_items.content_locales?.[0]?.title || comment.content_items.slug,
              slug: comment.content_items.slug,
            }
          : undefined,
        user: comment.profiles
          ? {
              email: comment.profiles.email || "",
              name: comment.profiles.name,
            }
          : undefined,
      }));

      setComments(commentsWithData);
      setFilteredComments(commentsWithData);
    } catch (error: any) {
      // Error logged via error handler (development only)
      // Set empty arrays to show empty state instead of error
      setComments([]);
      setFilteredComments([]);
      
      // Only show error toast for non-cache issues
      if (error.message && 
          !error.message.includes("empty") && 
          !error.message.includes("cache") &&
          !error.message.includes("PGRST") &&
          !error.message.includes("does not exist") &&
          !error.message.includes("TABLE_NOT_FOUND") &&
          !error.message.includes("RESOURCE_NOT_FOUND")) {
        toast.error(error.message || "Yorumlar yüklenemedi");
      } else {
        // Silent fail for cache issues - empty state will be shown
      }
    } finally {
      setLoading(false);
      // Loading complete
    }
  };

  const filterComments = () => {
    let filtered = comments;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (comment) =>
          comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comment.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comment.article?.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    if (activeTab === "pending") {
      filtered = filtered.filter((c) => c.status === "pending");
    } else if (activeTab === "approved") {
      filtered = filtered.filter((c) => c.status === "approved");
    } else if (activeTab === "rejected") {
      filtered = filtered.filter((c) => c.status === "rejected");
    } else if (activeTab === "spam") {
      filtered = filtered.filter((c) => c.status === "spam");
    }

    setFilteredComments(filtered);
  };

  const handleStatusChange = async (commentId: string, newStatus: Comment["status"]) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Yorum durumu güncellenemedi");
      }

      toast.success("Yorum durumu güncellendi");

      fetchComments();
    } catch (error: any) {
      toast.error(error.message || "Durum güncellenemedi");
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("Bu yorumu silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Yorum silinemedi");
      }

      toast.success("Yorum silindi");

      fetchComments();
    } catch (error: any) {
      toast.error(error.message || "Yorum silinemedi");
    }
  };

  const getStatusBadge = (comment: Comment) => {
    const status = comment.status || "pending";
    const variants = {
      pending: { label: "Beklemede", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
      approved: { label: "Onaylandı", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
      rejected: { label: "Reddedildi", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
      spam: { label: "Spam", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400" },
    };
    const variant = variants[status as keyof typeof variants] || variants.pending;
    return (
      <Badge className={cn("text-[10px] px-2 py-0.5", variant.color)}>
        {variant.label}
      </Badge>
    );
  };

  const columns = [
    {
      id: "select",
      header: ({ table }: any) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-gray-300"
          title="Tümünü seç"
          aria-label="Tümünü seç"
        />
      ),
      cell: ({ row }: any) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-gray-300"
          onClick={(e) => e.stopPropagation()}
          title="Yorumu seç"
          aria-label="Yorumu seç"
        />
      ),
    },
    {
      accessorKey: "content",
      header: "Yorum",
      cell: ({ row }: any) => {
        const comment = row.original as Comment;
        return (
          <div className="max-w-md">
            <p className="text-sm text-design-dark dark:text-white line-clamp-2 mb-2">
              {comment.content}
            </p>
            {comment.article && (
              <button
                type="button"
                onClick={() => {
                  const baseUrl = typeof window !== "undefined" 
                    ? window.location.origin.replace(":3001", ":3000")
                    : "http://localhost:3000";
                  window.open(`${baseUrl}/blog/${comment.article?.slug}`, "_blank");
                }}
                className="text-xs text-design-light hover:text-design-dark dark:hover:text-design-light flex items-center gap-1 hover:underline transition-colors"
              >
                <FileText className="h-3 w-3" />
                {comment.article.title}
                <ExternalLink className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "author_name",
      header: "Yazar",
      cell: ({ row }: any) => {
        const comment = row.original as Comment;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-bold text-design-dark dark:text-white">
                {comment.author_name}
              </p>
            </div>
            {(comment.author_email || comment.user?.email) && (
              <div className="flex items-center gap-1.5 text-xs text-design-gray dark:text-gray-400">
                <Mail className="h-3 w-3" />
                <span>{comment.author_email || comment.user?.email}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Durum",
      cell: ({ row }: any) => {
        const comment = row.original as Comment;
        return getStatusBadge(comment);
      },
    },
    {
      accessorKey: "created_at",
      header: "Tarih",
      cell: ({ row }: any) => {
        const comment = row.original as Comment;
        const date = new Date(comment.created_at);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        let timeAgo = "";
        if (diffDays === 0) {
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          if (diffHours === 0) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            timeAgo = diffMins <= 1 ? "Az önce" : `${diffMins} dakika önce`;
          } else {
            timeAgo = `${diffHours} saat önce`;
          }
        } else if (diffDays === 1) {
          timeAgo = "Dün";
        } else if (diffDays < 7) {
          timeAgo = `${diffDays} gün önce`;
        } else {
          timeAgo = date.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
        }
        
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-design-gray dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
            <p className="text-[10px] text-design-gray dark:text-gray-500">
              {date.toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "İşlemler",
      cell: ({ row }: any) => {
        const comment = row.original as Comment;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <AlertCircle className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {comment.status !== "approved" && (
                <DropdownMenuItem onClick={() => handleStatusChange(comment.id, "approved")}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Onayla
                </DropdownMenuItem>
              )}
              {comment.status !== "rejected" && (
                <DropdownMenuItem onClick={() => handleStatusChange(comment.id, "rejected")}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reddet
                </DropdownMenuItem>
              )}
              {comment.status !== "spam" && (
                <DropdownMenuItem onClick={() => handleStatusChange(comment.id, "spam")}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Spam İşaretle
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => handleDelete(comment.id)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Early return for loading state - AFTER all hooks
  if (loading) {
    return <LoadingState variant="skeleton" skeletonCount={5} message="Yorumlar yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="card-professional animate-slide-in-up hover-lift border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                Toplam
              </Badge>
            </div>
            <div>
              <p className="text-sm text-design-gray dark:text-gray-400 mb-1">Toplam Yorum</p>
              <p className="text-2xl font-bold text-design-dark dark:text-white">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-professional animate-slide-in-up hover-lift border-2 border-transparent hover:border-yellow-300 dark:hover:border-yellow-700 transition-all duration-300" style={{ animationDelay: "50ms" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                Beklemede
              </Badge>
            </div>
            <div>
              <p className="text-sm text-design-gray dark:text-gray-400 mb-1">Bekleyen</p>
              <p className="text-2xl font-bold text-design-dark dark:text-white">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-professional animate-slide-in-up hover-lift border-2 border-transparent hover:border-green-300 dark:hover:border-green-700 transition-all duration-300" style={{ animationDelay: "100ms" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                Onaylı
              </Badge>
            </div>
            <div>
              <p className="text-sm text-design-gray dark:text-gray-400 mb-1">Onaylanan</p>
              <p className="text-2xl font-bold text-design-dark dark:text-white">{stats.approved}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-professional animate-slide-in-up hover-lift border-2 border-transparent hover:border-red-300 dark:hover:border-red-700 transition-all duration-300" style={{ animationDelay: "150ms" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
                Reddedilen
              </Badge>
            </div>
            <div>
              <p className="text-sm text-design-gray dark:text-gray-400 mb-1">Reddedilen</p>
              <p className="text-2xl font-bold text-design-dark dark:text-white">{stats.rejected}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-professional animate-slide-in-up hover-lift border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300" style={{ animationDelay: "200ms" }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-900/30">
                <Shield className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800">
                Spam
              </Badge>
            </div>
            <div>
              <p className="text-sm text-design-gray dark:text-gray-400 mb-1">Spam</p>
              <p className="text-2xl font-bold text-design-dark dark:text-white">{stats.spam}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-professional animate-slide-in-up border-2 border-transparent hover:border-design-light/20 transition-all duration-300">
        <CardHeader className="pb-4 border-b border-[#E7E7E7] dark:border-[#062F28] bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg font-display font-bold text-design-dark dark:text-white">
                Yorum Yönetimi
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchComments}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Yenile
              </Button>
              {selectedIds.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Toplu İşlem ({selectedIds.length})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkAction("approved")}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Onayla
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("rejected")}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reddet
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("spam")}>
                      <Shield className="h-4 w-4 mr-2" />
                      Spam İşaretle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction("delete")} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Sil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Enhanced Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-design-gray dark:text-gray-400" />
                <Input
                  placeholder="Yorum, yazar, email veya makale ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-2 focus:border-design-light focus:ring-2 focus:ring-design-light/20 transition-all duration-200"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedIds([]);
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Temizle
              </Button>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/40 dark:to-gray-900/20 border-2 border-gray-200 dark:border-gray-800 rounded-xl p-1.5 flex-wrap h-auto shadow-sm">
              <TabsTrigger 
                value="all" 
                className="text-xs font-semibold font-ui flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:scale-105"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Tümü</span>
                <Badge className="ml-1 bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {stats.total}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                className="text-xs font-semibold font-ui flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:scale-105"
              >
                <AlertCircle className="h-4 w-4" />
                <span>Beklemede</span>
                <Badge className="ml-1 bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {stats.pending}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="approved" 
                className="text-xs font-semibold font-ui flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:scale-105"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Onaylanan</span>
                <Badge className="ml-1 bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {stats.approved}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="rejected" 
                className="text-xs font-semibold font-ui flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-md hover:scale-105"
              >
                <XCircle className="h-4 w-4" />
                <span>Reddedilen</span>
                <Badge className="ml-1 bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {stats.rejected}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="spam" 
                className="text-xs font-semibold font-ui flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-gray-600 data-[state=active]:to-gray-700 data-[state=active]:text-white data-[state=active]:shadow-md hover:scale-105"
              >
                <Shield className="h-4 w-4" />
                <span>Spam</span>
                <Badge className="ml-1 bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {stats.spam}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredComments.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title={searchQuery ? "Arama sonucu bulunamadı" : activeTab === "all" ? "Henüz yorum yok" : activeTab === "pending" ? "Bekleyen yorum yok" : activeTab === "approved" ? "Onaylanmış yorum yok" : activeTab === "rejected" ? "Reddedilmiş yorum yok" : "Spam yorum yok"}
                  description={
                    searchQuery
                      ? "Arama kriterlerinize uygun yorum bulunamadı. Farklı bir arama terimi deneyin."
                      : activeTab === "all"
                      ? "Henüz hiç yorum bulunmuyor. Yorumlar burada görünecek."
                      : activeTab === "pending"
                      ? "Bekleyen yorum bulunmuyor. Tüm yorumlar onaylandı."
                      : activeTab === "approved"
                      ? "Onaylanmış yorum bulunmuyor."
                      : activeTab === "rejected"
                      ? "Reddedilmiş yorum bulunmuyor."
                      : "Spam yorum bulunmuyor."
                  }
                  action={
                    searchQuery
                      ? {
                          label: "Aramayı Temizle",
                          onClick: () => setSearchQuery(""),
                        }
                      : undefined
                  }
                  variant="compact"
                />
              ) : (
                <DataTable 
                  columns={columns} 
                  data={filteredComments}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Comment Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-design-light" />
              Yorum Detayları
            </DialogTitle>
          </DialogHeader>
          {selectedComment && (
            <div className="space-y-6 mt-4">
              {/* Comment Content */}
              <Card className="card-professional">
                <CardHeader>
                  <CardTitle className="text-sm font-display font-bold text-design-dark dark:text-white">
                    Yorum İçeriği
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-design-dark dark:text-white leading-relaxed whitespace-pre-wrap">
                    {selectedComment.content}
                  </p>
                </CardContent>
              </Card>

              {/* Author Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="card-professional">
                  <CardHeader>
                    <CardTitle className="text-sm font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Yazar Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-xs text-design-gray dark:text-gray-400">İsim</Label>
                      <p className="text-sm font-semibold text-design-dark dark:text-white">
                        {selectedComment.author_name}
                      </p>
                    </div>
                    {(selectedComment.author_email || selectedComment.user?.email) && (
                      <div>
                        <Label className="text-xs text-design-gray dark:text-gray-400">Email</Label>
                        <p className="text-sm text-design-dark dark:text-white">
                          {selectedComment.author_email || selectedComment.user?.email}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Status & Actions */}
                <Card className="card-professional">
                  <CardHeader>
                    <CardTitle className="text-sm font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Durum ve İşlemler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-xs text-design-gray dark:text-gray-400 mb-2 block">Durum</Label>
                      {getStatusBadge(selectedComment)}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedComment.status !== "approved" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            handleStatusChange(selectedComment.id, "approved");
                            setDetailModalOpen(false);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Onayla
                        </Button>
                      )}
                      {selectedComment.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            handleStatusChange(selectedComment.id, "rejected");
                            setDetailModalOpen(false);
                          }}
                          className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reddet
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleDelete(selectedComment.id);
                          setDetailModalOpen(false);
                        }}
                        className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Article/Listing Info */}
              {selectedComment.article && (
                <Card className="card-professional">
                  <CardHeader>
                    <CardTitle className="text-sm font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      İlgili İçerik
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-design-dark dark:text-white">
                          {selectedComment.article.title}
                        </p>
                        <p className="text-xs text-design-gray dark:text-gray-400 mt-1">
                          Slug: {selectedComment.article.slug}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const baseUrl = typeof window !== "undefined" 
                            ? window.location.origin.replace(":3001", ":3000")
                            : "http://localhost:3000";
                          window.open(`${baseUrl}/blog/${selectedComment.article?.slug}`, "_blank");
                        }}
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Görüntüle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-xs text-design-gray dark:text-gray-400">
                <div>
                  <Label className="text-xs mb-1 block">Oluşturulma</Label>
                  <p>{new Date(selectedComment.created_at).toLocaleString("tr-TR")}</p>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Güncelleme</Label>
                  <p>{new Date(selectedComment.updated_at).toLocaleString("tr-TR")}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
