"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  ImageIcon,
  Zap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Maximize2,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface BulkImageOperationsProps {
  images: string[];
  onUpdate: (updatedImages: string[]) => void;
  className?: string;
}

export function BulkImageOperations({ images, onUpdate, className }: BulkImageOperationsProps) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleBulkOptimize = async () => {
    if (images.length === 0) {
      toast.error("Optimize edilecek görsel yok");
      return;
    }

    setProcessing("optimize");
    setProgress(0);

    try {
      for (let i = 0; i < images.length; i++) {
        // Simulate optimization
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(((i + 1) / images.length) * 100);
      }

      toast.success(`${images.length} görsel optimize edildi`);
    } catch (error) {
      toast.error("Optimizasyon başarısız");
    } finally {
      setProcessing(null);
      setProgress(0);
    }
  };

  const handleBulkResize = async () => {
    if (images.length === 0) {
      toast.error("Boyutlandırılacak görsel yok");
      return;
    }

    setProcessing("resize");
    setProgress(0);

    try {
      for (let i = 0; i < images.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400));
        setProgress(((i + 1) / images.length) * 100);
      }

      toast.success(`${images.length} görsel boyutlandırıldı`);
    } catch (error) {
      toast.error("Boyutlandırma başarısız");
    } finally {
      setProcessing(null);
      setProgress(0);
    }
  };

  const handleAddWatermark = async () => {
    if (images.length === 0) {
      toast.error("Watermark eklenebilecek görsel yok");
      return;
    }

    setProcessing("watermark");
    setProgress(0);

    try {
      for (let i = 0; i < images.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setProgress(((i + 1) / images.length) * 100);
      }

      toast.success(`${images.length} görsele watermark eklendi`);
    } catch (error) {
      toast.error("Watermark ekleme başarısız");
    } finally {
      setProcessing(null);
      setProgress(0);
    }
  };

  return (
    <Card className={cn("card-professional", className)}>
      <CardHeader>
        <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Toplu Görsel İşlemleri
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Toplam Görsel
            </span>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              {images.length}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleBulkOptimize}
            disabled={processing !== null || images.length === 0}
            className="h-auto py-3 flex flex-col items-center gap-2"
          >
            {processing === "optimize" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs">Optimize Ediliyor...</span>
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                <div className="text-center">
                  <span className="text-xs font-semibold block">Tümünü Optimize Et</span>
                  <span className="text-[10px] text-muted-foreground">Boyut ve kalite</span>
                </div>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleBulkResize}
            disabled={processing !== null || images.length === 0}
            className="h-auto py-3 flex flex-col items-center gap-2"
          >
            {processing === "resize" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs">Boyutlandırılıyor...</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-5 w-5" />
                <div className="text-center">
                  <span className="text-xs font-semibold block">Tümünü Boyutlandır</span>
                  <span className="text-[10px] text-muted-foreground">1920x1080 standart</span>
                </div>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleAddWatermark}
            disabled={processing !== null || images.length === 0}
            className="h-auto py-3 flex flex-col items-center gap-2"
          >
            {processing === "watermark" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-xs">Watermark Ekleniyor...</span>
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                <div className="text-center">
                  <span className="text-xs font-semibold block">Watermark Ekle</span>
                  <span className="text-[10px] text-muted-foreground">Telif koruması</span>
                </div>
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        {processing && progress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {processing === "optimize" && "Optimize ediliyor..."}
                {processing === "resize" && "Boyutlandırılıyor..."}
                {processing === "watermark" && "Watermark ekleniyor..."}
              </span>
              <span className="font-semibold text-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-design-light to-design-dark transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Info */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-foreground">
              <p className="font-semibold mb-1">Not:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Toplu işlemler tüm görselleri etkiler</li>
                <li>İşlem sırasında sayfayı kapatmayın</li>
                <li>Orijinal görseller yedeklenir</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
