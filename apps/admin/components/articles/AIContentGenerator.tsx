"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { 
  Sparkles, 
  Loader2, 
  Wand2, 
  X,
  Check,
  Copy,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface AIContentGeneratorProps {
  onGenerate: (content: {
    title: string;
    content: string;
    excerpt: string;
    metaDescription: string;
    keywords: string;
  }) => void;
  className?: string;
}

export function AIContentGenerator({ onGenerate, className }: AIContentGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<"professional" | "casual" | "formal">("professional");
  const [wordCount, setWordCount] = useState(800);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<any>(null);

  const generateContent = async () => {
    if (!topic.trim()) {
      toast.error("Lütfen bir konu girin");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          tone,
          wordCount,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.content) {
        setGenerated(data.content);
        toast.success("İçerik oluşturuldu");
      } else {
        throw new Error(data.error || "İçerik oluşturulamadı");
      }
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast.error(error.message || "İçerik oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  const applyGenerated = () => {
    if (generated) {
      onGenerate(generated);
      toast.success("İçerik uygulandı");
    }
  };

  return (
    <Card className={cn("card-professional", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-design-light" />
            AI İçerik Üretici
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Beta
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Topic Input */}
        <div>
          <label className="text-sm font-semibold mb-2 block">
            Konu / Başlık
          </label>
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Örn: Kocaali'de yeni park açıldı"
            className="input-modern"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                generateContent();
              }
            }}
          />
        </div>

        {/* Tone Selection */}
        <div>
          <label className="text-sm font-semibold mb-2 block">
            Yazım Tarzı
          </label>
          <div className="flex gap-2">
            {(["professional", "casual", "formal"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-lg border transition-all",
                  tone === t
                    ? "bg-design-light text-white border-design-light"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-design-light/50"
                )}
              >
                {t === "professional" ? "Profesyonel" : t === "casual" ? "Günlük" : "Resmi"}
              </button>
            ))}
          </div>
        </div>

        {/* Word Count */}
        <div>
          <label className="text-sm font-semibold mb-2 block">
            Kelime Sayısı: {wordCount}
          </label>
          <input
            type="range"
            min="300"
            max="2000"
            step="100"
            value={wordCount}
            onChange={(e) => setWordCount(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>300</span>
            <span>2000</span>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          type="button"
          onClick={generateContent}
          disabled={loading || !topic.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Oluşturuluyor...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              İçerik Oluştur
            </>
          )}
        </Button>

        {/* Generated Content Preview */}
        {generated && (
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-design-light" />
                Oluşturulan İçerik
              </h3>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(generated, null, 2));
                    toast.success("Kopyalandı");
                  }}
                  className="h-7 w-7 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setGenerated(null)}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Başlık:</p>
                <p className="text-design-dark dark:text-white">{generated.title}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Özet:</p>
                <p className="text-design-dark dark:text-white">{generated.excerpt}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">İçerik:</p>
                <div 
                  className="text-design-dark dark:text-white prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: generated.content.substring(0, 200) + "..." }}
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={applyGenerated}
              className="w-full"
              variant="default"
            >
              <Check className="h-4 w-4 mr-2" />
              İçeriği Uygula
            </Button>
          </div>
        )}

        {!generated && !loading && (
          <div className="text-center py-6 text-gray-400">
            <Sparkles className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Konu girin ve AI ile içerik oluşturun
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

