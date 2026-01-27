"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface BatchResult {
  articleId: string;
  title: string;
  success: boolean;
  improved: boolean;
  score?: number;
  error?: string;
}

export function BatchImprovement() {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [autoApply, setAutoApply] = useState(false);

  const handleBatchImprove = async () => {
    setProcessing(true);
    setResults([]);

    try {
      const response = await fetch("/api/content/batch-improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoApply,
        }),
      });

      if (!response.ok) throw new Error("Toplu iyileştirme başarısız");

      const data = await response.json();
      setResults(data.results || []);
      
      const successCount = data.results?.filter((r: BatchResult) => r.success).length || 0;
      const improvedCount = data.results?.filter((r: BatchResult) => r.improved).length || 0;
      
      toast.success(
        `${successCount} içerik işlendi, ${improvedCount} içerik iyileştirildi`
      );
    } catch (error) {
      console.error("Batch improvement error:", error);
      toast.error("Toplu iyileştirme sırasında hata oluştu");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="card-professional">
      <CardHeader className="card-professional-header">
        <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Toplu İçerik İyileştirme
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={handleBatchImprove}
            disabled={processing}
            className="btn-primary-professional"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Tüm İçerikleri İyileştir
              </>
            )}
          </Button>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={autoApply}
              onChange={(e) => setAutoApply(e.target.checked)}
              className="rounded"
            />
            <span>Otomatik uygula (kalite skoru düşük olanları)</span>
          </label>
        </div>

        {results.length > 0 && (
          <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto scrollbar-modern">
            <h4 className="text-sm font-semibold text-foreground mb-2">
              İşlem Sonuçları ({results.length})
            </h4>
            {results.map((result) => (
              <div
                key={result.articleId}
                className="p-3 rounded-lg border border-border/40 dark:border-[#0a3d35] bg-white/60 dark:bg-card/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {result.title}
                    </p>
                    {result.score !== undefined && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Kalite Skoru: {result.score}
                      </p>
                    )}
                    {result.error && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {result.error}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                    {result.improved && (
                      <Badge className="bg-design-light/20 text-primary text-xs">
                        İyileştirildi
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
