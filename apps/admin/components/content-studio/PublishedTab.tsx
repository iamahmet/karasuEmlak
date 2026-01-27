"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { useRouter } from "../../i18n/routing";
import { ExternalLink, CheckCircle2, FileText, Edit2, Trash2 } from "lucide-react";
import { ContentPreview } from "./ContentPreview";
import { toast } from "sonner";

export function PublishedTab({ locale }: { locale: string }) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/content-studio?status=published");
      const data = await response.json();
      
      if (!data.success) {
        // If table doesn't exist, show empty state
        if (data.code === "TABLE_NOT_FOUND" || data.code === "INTERNAL_ERROR") {
          setItems([]);
          return;
        }
        toast.error(data.message || "Yayınlanan içerikler yüklenemedi");
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

  const handleUnpublish = async (itemId: string) => {
    if (!confirm("Bu içeriği yayından kaldırmak istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/content-studio/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });

      if (response.ok) {
        toast.success("İçerik yayından kaldırıldı");
        fetchItems();
      } else {
        throw new Error("Yayından kaldırma başarısız");
      }
    } catch (error: any) {
      toast.error(error.message || "Yayından kaldırma başarısız");
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="card-modern animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-[#E7E7E7] dark:bg-muted rounded mb-2"></div>
              <div className="h-4 bg-[#E7E7E7] dark:bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <Card className="card-professional">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-ui">
              Yayınlanan içerik yok
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="card-professional hover-lift">
              <CardHeader className="pb-4 px-5 pt-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-display font-bold text-foreground mb-1 line-clamp-2">
                      {item.title || item.slug}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-ui truncate">
                      {item.slug}
                    </p>
                  </div>
                  <Badge className="text-[10px] px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 font-ui capitalize ml-2 flex-shrink-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {item.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-ui capitalize">
                    {item.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-ui">
                    {item.published_at 
                      ? new Date(item.published_at).toLocaleDateString("tr-TR")
                      : "Yayınlanmadı"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/seo/content-studio/${item.id}`)}
                      className="flex-1 hover-scale micro-bounce rounded-xl"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Düzenle
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 hover-scale micro-bounce rounded-xl"
                      onClick={() => {
                        const baseUrl = typeof window !== "undefined"
                          ? window.location.origin.replace("admin.", "").replace(":3001", ":3000")
                          : process.env.NEXT_PUBLIC_SITE_URL || "https://www.karasuemlak.net";
                        window.open(`${baseUrl}/${locale}/haber/${item.slug}`, "_blank");
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Canlı Görüntüle
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    {item.locales && item.locales.length > 0 && (
                      <ContentPreview
                        content={{
                          title: item.locales[0]?.title || item.title || item.slug,
                          content: item.locales[0]?.content || "",
                          excerpt: item.locales[0]?.excerpt,
                          metaDescription: item.locales[0]?.meta_description,
                          featuredImage: item.featured_image_url,
                          locale: item.locales[0]?.locale || locale,
                        }}
                        className="flex-1"
                      />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnpublish(item.id)}
                      className="hover-scale micro-bounce rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Yayından Kaldır
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

