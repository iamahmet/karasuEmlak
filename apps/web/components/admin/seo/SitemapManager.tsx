"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "@karasu/ui";
import { FileText, RefreshCw, Download, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@karasu/lib/supabase/client";

interface SitemapManagerProps {
  locale: string;
}

export function SitemapManager({ locale }: SitemapManagerProps) {
  const [regenerating, setRegenerating] = useState(false);
  const [sitemapInfo, setSitemapInfo] = useState<any>(null);
  const [lastRegenerated, setLastRegenerated] = useState<Date | null>(null);

  useEffect(() => {
    fetchSitemapInfo();
  }, []);

  const fetchSitemapInfo = async () => {
    try {
      const response = await fetch("/api/seo/sitemap/info");
      if (response.ok) {
        const data = await response.json();
        setSitemapInfo(data);
        if (data.lastGenerated) {
          setLastRegenerated(new Date(data.lastGenerated));
        }
      }
    } catch (error) {
      console.error("Failed to fetch sitemap info:", error);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const response = await fetch("/api/seo/sitemap/regenerate", {
        method: "POST",
      });

      if (response.ok) {
        setLastRegenerated(new Date());
        toast.success("Sitemap yeniden oluşturuldu");
        fetchSitemapInfo();
      } else {
        throw new Error("Regeneration failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Sitemap oluşturulamadı");
    } finally {
      setRegenerating(false);
    }
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const sitemapUrl = `${siteUrl}/sitemap.xml`;

  return (
    <Card className="card-professional">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Sitemap Yönetimi
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={regenerating}
              className="hover-scale"
            >
              {regenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yeniden Oluştur
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(sitemapUrl, "_blank")}
              className="hover-scale"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Görüntüle
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Toplam URL</label>
            <p className="text-2xl font-bold mt-1">{sitemapInfo?.totalUrls || 0}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Son Güncelleme</label>
            <p className="text-sm mt-1">
              {lastRegenerated
                ? lastRegenerated.toLocaleString("tr-TR")
                : sitemapInfo?.lastGenerated
                ? new Date(sitemapInfo.lastGenerated).toLocaleString("tr-TR")
                : "Henüz oluşturulmadı"}
            </p>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Sitemap URL</span>
            <Badge variant="outline" className="text-xs">
              <Check className="h-3 w-3 mr-1" />
              Aktif
            </Badge>
          </div>
          <a
            href={sitemapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            {sitemapUrl}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            Sitemap otomatik olarak güncellenir. Yeni içerik yayınlandığında veya mevcut içerik
            güncellendiğinde sitemap'e eklenir.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

