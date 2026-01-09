"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  Link2,
  ExternalLink,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { cn } from "@karasu/lib";
import { toast } from "sonner";

interface Backlink {
  id: string;
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  domainAuthority?: number;
  status: "active" | "lost" | "pending";
  discoveredAt: string;
}

export function BacklinkMonitor({ locale }: { locale: string }) {
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "lost">("all");

  useEffect(() => {
    fetchBacklinks();
  }, [filter]);

  const fetchBacklinks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/seo/backlinks?filter=${filter}`);
      
      if (!response.ok) {
        throw new Error("Backlink'ler yüklenemedi");
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error("Geçersiz response formatı");
      }

      setBacklinks(data.backlinks || []);
    } catch (error: any) {
      console.error("Failed to fetch backlinks:", error);
      toast.error(error.message || "Backlink'ler yüklenemedi");
      setBacklinks([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Backlink["status"]) => {
    const variants = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      lost: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    };
    const labels = {
      active: "Aktif",
      lost: "Kayıp",
      pending: "Beklemede",
    };
    return (
      <Badge className={cn("text-[10px] px-2 py-0.5", variants[status])}>
        {labels[status]}
      </Badge>
    );
  };

  const activeCount = backlinks.filter((b) => b.status === "active").length;
  const lostCount = backlinks.filter((b) => b.status === "lost").length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-professional">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-design-gray dark:text-gray-400 font-ui mb-1">
                  Toplam Backlink
                </p>
                <p className="text-2xl font-bold text-design-dark dark:text-white">
                  {backlinks.length}
                </p>
              </div>
              <Link2 className="h-8 w-8 text-design-light opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-professional">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-design-gray dark:text-gray-400 font-ui mb-1">
                  Aktif Backlink
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {activeCount}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="card-professional">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-design-gray dark:text-gray-400 font-ui mb-1">
                  Kayıp Backlink
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {lostCount}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Tümü
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("active")}
        >
          Aktif
        </Button>
        <Button
          variant={filter === "lost" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("lost")}
        >
          Kayıp
        </Button>
      </div>

      {/* Backlinks List */}
      {loading ? (
        <div className="text-center py-8 text-design-gray dark:text-gray-400">
          Yükleniyor...
        </div>
      ) : backlinks.length === 0 ? (
        <Card className="card-professional">
          <CardContent className="p-8 text-center">
            <Globe className="h-12 w-12 mx-auto mb-4 text-design-gray dark:text-gray-400 opacity-50" />
            <p className="text-design-gray dark:text-gray-400 font-ui">
              Henüz backlink tespit edilmedi
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {backlinks.map((backlink) => (
            <Card key={backlink.id} className="card-professional hover-lift">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-design-dark dark:text-white font-ui">
                        {backlink.anchorText}
                      </h4>
                      {getStatusBadge(backlink.status)}
                      {backlink.domainAuthority && (
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                          DA: {backlink.domainAuthority}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-design-gray dark:text-gray-400 font-ui">Kaynak:</span>
                        <a
                          href={backlink.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-design-light hover:underline font-ui flex items-center gap-1"
                        >
                          {new URL(backlink.sourceUrl).hostname}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-design-gray dark:text-gray-400 font-ui">Hedef:</span>
                        <span className="text-design-dark dark:text-white font-ui">
                          {backlink.targetUrl}
                        </span>
                      </div>
                      <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
                        Keşfedildi: {new Date(backlink.discoveredAt).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
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

