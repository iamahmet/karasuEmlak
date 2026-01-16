"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { cn } from "@karasu/lib";

interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

interface QueueItem {
  id: string;
  status: string;
  progress: number;
  content_type: string;
  content_id: string;
  content_title: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export function ImprovementQueue() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QueueStats>({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    total: 0,
  });
  const [recent, setRecent] = useState<QueueItem[]>([]);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/content-improvement/queue");
      
      // Check if response is OK
      if (!response.ok) {
        // If 500 or other error, return empty stats
        setStats({
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
          total: 0,
        });
        setRecent([]);
        return;
      }
      
      // Try to parse JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parse fails, return empty stats
        console.warn("Queue API: JSON parse failed, using empty stats");
        setStats({
          pending: 0,
          processing: 0,
          completed: 0,
          failed: 0,
          total: 0,
        });
        setRecent([]);
        return;
      }
      
      // Always set stats and recent, even if empty (graceful degradation)
      setStats(data.stats || {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        total: 0,
      });
      setRecent(data.recent || []);
    } catch (error) {
      console.error("Queue fetch error:", error);
      // Set empty stats on error
      setStats({
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        total: 0,
      });
      setRecent([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: "secondary", icon: Clock, label: "Bekliyor" },
      processing: { variant: "default", icon: Loader2, label: "İşleniyor" },
      completed: { variant: "default", icon: CheckCircle, label: "Tamamlandı" },
      failed: { variant: "destructive", icon: XCircle, label: "Başarısız" },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge
        variant={config.variant}
        className={cn(
          "text-xs px-2 py-0.5 flex items-center gap-1",
          status === "processing" && "animate-pulse"
        )}
      >
        {status === "processing" ? (
          <Icon className="h-3 w-3 animate-spin" />
        ) : (
          <Icon className="h-3 w-3" />
        )}
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Az önce";
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return date.toLocaleDateString("tr-TR");
  };

  return (
    <Card className="card-professional">
      <CardHeader className="card-professional-header">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-design-light" />
            İyileştirme Kuyruğu
          </CardTitle>
          <button
            onClick={fetchQueue}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-muted/40 transition-colors"
            title="Yenile"
          >
            <RefreshCw
              className={cn(
                "h-4 w-4 text-design-gray dark:text-gray-400",
                loading && "animate-spin"
              )}
            />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistics */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-3 rounded-lg border border-[#E7E7E7] dark:border-[#0a3d35] bg-white/60 dark:bg-[#0a3d35]/60">
            <div className="text-2xl font-display font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pending}
            </div>
            <div className="text-[10px] text-design-gray dark:text-gray-400 mt-1">
              Bekliyor
            </div>
          </div>
          <div className="text-center p-3 rounded-lg border border-[#E7E7E7] dark:border-[#0a3d35] bg-white/60 dark:bg-[#0a3d35]/60">
            <div className="text-2xl font-display font-bold text-blue-600 dark:text-blue-400">
              {stats.processing}
            </div>
            <div className="text-[10px] text-design-gray dark:text-gray-400 mt-1">
              İşleniyor
            </div>
          </div>
          <div className="text-center p-3 rounded-lg border border-[#E7E7E7] dark:border-[#0a3d35] bg-white/60 dark:bg-[#0a3d35]/60">
            <div className="text-2xl font-display font-bold text-green-600 dark:text-green-400">
              {stats.completed}
            </div>
            <div className="text-[10px] text-design-gray dark:text-gray-400 mt-1">
              Tamamlandı
            </div>
          </div>
          <div className="text-center p-3 rounded-lg border border-[#E7E7E7] dark:border-[#0a3d35] bg-white/60 dark:bg-[#0a3d35]/60">
            <div className="text-2xl font-display font-bold text-red-600 dark:text-red-400">
              {stats.failed}
            </div>
            <div className="text-[10px] text-design-gray dark:text-gray-400 mt-1">
              Başarısız
            </div>
          </div>
        </div>

        {/* Recent Improvements */}
        {recent.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-design-dark dark:text-white mb-3">
              Son İyileştirmeler ({recent.length})
            </h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-modern">
              {recent.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg border border-[#E7E7E7] dark:border-[#0a3d35] bg-white/60 dark:bg-[#0a3d35]/60"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-design-dark dark:text-white truncate">
                        {item.content_title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {getStatusBadge(item.status)}
                        {item.status === "processing" && item.progress > 0 && (
                          <span className="text-[10px] text-design-gray dark:text-gray-400">
                            %{item.progress}
                          </span>
                        )}
                        <span className="text-[10px] text-design-gray dark:text-gray-400">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                      {item.error_message && (
                        <p className="text-[10px] text-red-600 dark:text-red-400 mt-1 truncate">
                          {item.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recent.length === 0 && !loading && (
          <div className="text-center py-6 text-design-gray dark:text-gray-400">
            <AlertCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Henüz iyileştirme kaydı yok</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
