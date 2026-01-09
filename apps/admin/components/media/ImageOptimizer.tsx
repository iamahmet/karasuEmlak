"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Label } from "@karasu/ui";
import {
  Zap,
  Download,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface ImageOptimizerProps {
  imageUrl: string;
  imageId: string;
  onOptimize?: (optimizedUrl: string) => void;
  locale?: string;
}

export function ImageOptimizer({
  imageUrl,
  imageId,
  onOptimize,
}: ImageOptimizerProps) {
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState(1920);
  const [format, setFormat] = useState<"webp" | "jpg" | "png">("webp");
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedUrl, setOptimizedUrl] = useState<string | null>(null);
  const [originalSize] = useState<number | null>(null);
  const [optimizedSize, setOptimizedSize] = useState<number | null>(null);

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      // In a real implementation, you'd call an API endpoint that optimizes the image
      // For now, we'll simulate the optimization
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate size reduction
      const reduction = Math.round(100 - quality);
      const simulatedSize = originalSize
        ? Math.round(originalSize * (1 - reduction / 100))
        : null;

      setOptimizedSize(simulatedSize);
      setOptimizedUrl(imageUrl); // In production, this would be the optimized URL
      toast.success("Görsel başarıyla optimize edildi");
      onOptimize?.(optimizedUrl || imageUrl);
    } catch (error: any) {
      toast.error(error.message || "Optimizasyon başarısız");
    } finally {
      setOptimizing(false);
    }
  };

  const handleDownload = () => {
    if (optimizedUrl) {
      const link = document.createElement("a");
      link.href = optimizedUrl;
      link.download = `optimized-${imageId}.${format}`;
      link.click();
    }
  };

  const sizeReduction = originalSize && optimizedSize
    ? Math.round(((originalSize - optimizedSize) / originalSize) * 100)
    : 0;

  return (
    <Card className="card-professional">
      <CardHeader className="pb-4 px-5 pt-5">
        <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-design-light" />
          Görsel Optimizasyonu
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        {/* Image Preview */}
        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-[#E7E7E7] dark:bg-[#062F28]">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Quality Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-ui font-semibold">Kalite</Label>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
              {quality}%
            </Badge>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            step={5}
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full h-2 bg-[#E7E7E7] dark:bg-[#062F28] rounded-lg appearance-none cursor-pointer accent-design-light"
            aria-label="Kalite seviyesi"
            aria-valuemin={50}
            aria-valuemax={100}
            aria-valuenow={quality}
          />
          <div className="flex justify-between text-xs text-design-gray dark:text-gray-400">
            <span>Düşük (Küçük dosya)</span>
            <span>Yüksek (Büyük dosya)</span>
          </div>
        </div>

        {/* Width Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-ui font-semibold">Genişlik</Label>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
              {width}px
            </Badge>
          </div>
          <input
            type="range"
            min={320}
            max={3840}
            step={160}
            value={width}
            onChange={(e) => setWidth(parseInt(e.target.value))}
            className="w-full h-2 bg-[#E7E7E7] dark:bg-[#062F28] rounded-lg appearance-none cursor-pointer accent-design-light"
            aria-label="Görsel genişliği"
            aria-valuemin={320}
            aria-valuemax={3840}
            aria-valuenow={width}
          />
          <div className="flex justify-between text-xs text-design-gray dark:text-gray-400">
            <span>320px</span>
            <span>3840px</span>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <Label className="text-xs font-ui font-semibold">Format</Label>
          <div className="flex gap-2">
            {(["webp", "jpg", "png"] as const).map((fmt) => (
              <Button
                key={fmt}
                variant={format === fmt ? "default" : "outline"}
                size="sm"
                onClick={() => setFormat(fmt)}
                className="flex-1 h-8 text-xs"
              >
                {fmt.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Optimization Results */}
        {optimizedSize && originalSize && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm font-semibold text-green-800 dark:text-green-400 font-ui">
                Optimizasyon Tamamlandı
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-green-700 dark:text-green-300">
              <div>
                <span className="font-ui">Orijinal: </span>
                <span className="font-semibold">{(originalSize / 1024).toFixed(2)} KB</span>
              </div>
              <div>
                <span className="font-ui">Optimize: </span>
                <span className="font-semibold">{(optimizedSize / 1024).toFixed(2)} KB</span>
              </div>
              <div className="col-span-2">
                <span className="font-ui">Tasarruf: </span>
                <span className="font-semibold">{sizeReduction}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-[#E7E7E7] dark:border-[#062F28]">
          <Button
            onClick={handleOptimize}
            disabled={optimizing}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
          >
            {optimizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Optimize Ediliyor...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Optimize Et
              </>
            )}
          </Button>
          {optimizedUrl && (
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              İndir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

