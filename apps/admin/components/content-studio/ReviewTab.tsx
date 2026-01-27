"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { useRouter } from "../../i18n/routing";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Eye, Clock, FileText, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { LoadingState } from "../ui/LoadingState";
import { EmptyState } from "../empty-states/EmptyState";
import { cn } from "@karasu/lib";

export function ReviewTab({ locale }: { locale: string }) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // Fetch draft articles from articles table (Karasu Emlak uses articles, not content_items)
      const response = await fetch("/api/articles?status=draft&limit=50");
      const data = await response.json();
      
      if (!data.success && data.error) {
        toast.error(data.message || "İnceleme bekleyen içerikler yüklenemedi");
        setItems([]);
        return;
      }
      
      // Map articles to review format
      const articles = data.data?.articles || data.articles || [];
      const reviewItems = articles.map((article: any) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        status: article.status || 'draft',
        type: article.category || 'blog',
        created_at: article.created_at,
        updated_at: article.updated_at,
        excerpt: article.excerpt,
        meta_description: article.meta_description,
        author: article.author,
        seo_score: article.seo_score,
      }));
      
      setItems(reviewItems);
    } catch (error) {
      console.error("Failed to fetch review items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const item = items.find((item) => item.id === id);
      if (!item) {
        toast.error("İçerik bulunamadı");
        return;
      }

      // First, get the full article to preserve content
      const getResponse = await fetch(`/api/articles/${id}`);
      const getData = await getResponse.json();
      
      if (!getData.success && !getData.article) {
        toast.error("İçerik yüklenemedi");
        return;
      }

      const article = getData.data?.article || getData.article;
      
      // Update article status to published
      const response = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title || item.title,
          slug: article.slug || item.slug,
          content: article.content || "",
          excerpt: article.excerpt || item.excerpt || "",
          metaDescription: article.meta_description || item.meta_description || "",
          isPublished: true,
          status: "published",
        }),
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        toast.success("✅ İçerik onaylandı ve yayınlandı!");
        fetchItems();
      } else {
        toast.error(data.message || data.error || "İçerik onaylanamadı");
      }
    } catch (error: any) {
      toast.error(error.message || "İçerik onaylanırken bir hata oluştu");
      console.error("Failed to approve:", error);
    }
  };

  const handleReject = async (id: string) => {
    // Modern rejection dialog
    const reason = window.prompt("Reddetme nedeni (opsiyonel):\n\nÖrnek: 'AI kokusu var', 'Yerel bilgi eksik', 'SEO optimizasyonu gerekli'");
    
    if (reason === null) {
      // User cancelled
      return;
    }
    
    try {
      // Keep article as draft (no need to update, just show message)
      toast.success(`İçerik taslak olarak kaldı${reason ? `: ${reason}` : ""}`);
      fetchItems();
    } catch (error: any) {
      toast.error(error.message || "İşlem sırasında bir hata oluştu");
    }
  };

  if (loading) {
    return <LoadingState variant="cards" skeletonCount={6} message="İnceleme bekleyen içerikler yükleniyor..." />;
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="İnceleme bekleyen içerik yok"
          description="Şu anda inceleme bekleyen içerik bulunmuyor. Tüm içerikler onaylandı veya reddedildi."
          variant="compact"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const seoScore = item.seo_score || 0;
            const scoreColor = seoScore >= 80 ? "text-green-600" : seoScore >= 60 ? "text-yellow-600" : "text-red-600";
            const scoreBg = seoScore >= 80 ? "bg-green-50 dark:bg-green-900/20" : seoScore >= 60 ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-red-50 dark:bg-red-900/20";
            
            return (
              <Card key={item.id} className="card-professional hover-lift group relative overflow-hidden">
                {/* Score indicator */}
                {seoScore > 0 && (
                  <div className={cn("absolute top-4 right-4 rounded-xl px-3 py-1.5 text-xs font-bold", scoreBg, scoreColor)}>
                    SEO: {seoScore}
                  </div>
                )}
                
                <CardHeader className="pb-4 px-5 pt-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-16">
                      <CardTitle className="text-base font-display font-bold text-foreground mb-2 line-clamp-2 leading-snug">
                        {item.title || item.slug}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-ui truncate">
                        /blog/{item.slug}
                      </p>
                    </div>
                  </div>
                  
                  {/* Meta Info */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-ui capitalize border-slate-200/80">
                      {item.type || 'Blog'}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-ui flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(item.created_at || item.updated_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  
                  {/* Excerpt Preview */}
                  {item.excerpt && (
                    <p className="text-xs text-muted-foreground font-ui line-clamp-2 leading-relaxed">
                      {item.excerpt}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="px-5 pb-5 space-y-3">
                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/articles/${item.id}`)}
                      className="flex-1 h-9 text-xs font-ui border border-slate-200/80 hover:border-[#006AFF]/40 hover:bg-[#006AFF]/5 hover:text-[#006AFF] rounded-xl transition-all hover-scale micro-bounce"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      İncele
                    </Button>
                  </div>
                  
                  {/* Approve/Reject Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-200/60">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleApprove(item.id)}
                      className="flex-1 h-9 text-xs font-ui bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg rounded-xl transition-all hover-scale micro-bounce"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      Onayla & Yayınla
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(item.id)}
                      className="h-9 px-3 text-xs font-ui border border-red-200/80 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl transition-all hover-scale micro-bounce"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

