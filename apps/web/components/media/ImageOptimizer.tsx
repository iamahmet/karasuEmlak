"use client";

import { useState, useCallback } from "react";
import { Image as ImageIcon, Settings, Download, Loader2 } from "lucide-react";
import { Button } from "@karasu/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Slider } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";

interface ImageOptimizerProps {
  imageUrl?: string;
  onOptimize?: (optimizedUrl: string) => void;
  className?: string;
}

export function ImageOptimizer({
  imageUrl,
  onOptimize,
  className,
}: ImageOptimizerProps) {
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState("webp");
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = useCallback(async () => {
    if (!imageUrl) return;

    setIsOptimizing(true);
    try {
      // Placeholder optimization logic
      // In production, this would call an image optimization API
      const optimizedUrl = `${imageUrl}?quality=${quality}&format=${format}`;

      if (onOptimize) {
        onOptimize(optimizedUrl);
      }
    } catch (error) {
      console.error("Image optimization failed:", error);
    } finally {
      setIsOptimizing(false);
    }
  }, [imageUrl, quality, format, onOptimize]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Settings className="h-4 w-4" />
          Image Optimizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {imageUrl ? (
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg">
            <ImageIcon className="h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">No image selected</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quality">Quality: {quality}%</Label>
            <Slider
              id="quality"
              value={[quality]}
              onValueChange={(value) => setQuality(value[0])}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Output Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webp">WebP</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="avif">AVIF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleOptimize}
            disabled={!imageUrl || isOptimizing}
            className="w-full"
          >
            {isOptimizing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Optimize Image
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
