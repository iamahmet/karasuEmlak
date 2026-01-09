"use client";

import { useState } from "react";
import { Button } from "@karasu/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Sparkles, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface KeywordContent {
  keyword: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  contentType: "article" | "news" | "guide";
  status: "pending" | "generating" | "completed" | "failed";
  contentId?: string;
}

const KEYWORD_PRIORITIES: Record<string, "high" | "medium" | "low"> = {
  "Sakarya haber": "high",
  "Sakarya son dakika": "high",
  "Sakarya namaz vakitleri": "high",
  "Sakarya hava durumu": "high",
  "Sakarya iş ilanları": "high",
  "Sakarya bugün vefat edenler": "high",
  "Sakarya serdivan": "medium",
  "Sakarya imsakiye": "medium",
  "Sakarya iftar vakitleri": "medium",
  "Karasu iftar saati": "medium",
  "Karasu ezan saatleri": "medium",
  "Karasu plajı": "medium",
  "Sakarya plajı": "medium",
  "Karaali": "low",
  "Sakarya karaali": "low",
  "Karasu karaali": "low",
};

export function KeywordBasedContentGenerator({ locale }: { locale: string }) {
  const router = useRouter();
  const [keywords, setKeywords] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [generatedContents, setGeneratedContents] = useState<KeywordContent[]>([]);

  const parseKeywords = (input: string): string[] => {
    return input
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  };

  const determineContentType = (keyword: string): "article" | "news" | "guide" => {
    if (keyword.includes("haber") || keyword.includes("son dakika")) return "news";
    if (keyword.includes("rehber") || keyword.includes("nasıl")) return "guide";
    return "article";
  };

  const generateContentForKeyword = async (keyword: string): Promise<string | null> => {
    try {
      const contentType = determineContentType(keyword);
      const response = await fetch("/api/content-studio/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentType === "news" ? "breaking" : "normal",
          template: contentType === "guide" ? "howto" : "blog",
          topic: keyword,
          locale: locale,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const contentId = data.data?.contentId || data.contentId;
        if (contentId) {
          return contentId;
        }
      }
      return null;
    } catch (error) {
      // Content generation failed for keyword
      return null;
    }
  };

  const handleGenerate = async () => {
    const keywordList = parseKeywords(keywords);
    if (keywordList.length === 0) {
      toast.error("Lütfen en az bir anahtar kelime girin");
      return;
    }

    setGenerating(true);
    const contents: KeywordContent[] = keywordList.map((keyword) => ({
      keyword,
      title: keyword,
      description: `${keyword} için içerik oluşturuluyor...`,
      priority: KEYWORD_PRIORITIES[keyword] || "medium",
      contentType: determineContentType(keyword),
      status: "pending",
    }));

    setGeneratedContents(contents);

    // Generate content for each keyword
    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      setGeneratedContents((prev) =>
        prev.map((c, idx) => (idx === i ? { ...c, status: "generating" } : c))
      );

      const contentId = await generateContentForKeyword(content.keyword);

      setGeneratedContents((prev) =>
        prev.map((c, idx) =>
          idx === i
            ? {
                ...c,
                status: contentId ? "completed" : "failed",
                contentId: contentId || undefined,
              }
            : c
        )
      );

      // Small delay between generations
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setGenerating(false);
    toast.success(`${contents.filter((c) => c.status === "completed").length} içerik oluşturuldu`);
  };

  return (
    <Card className="card-professional">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Anahtar Kelime Bazlı İçerik Üretimi</CardTitle>
        </div>
        <CardDescription>
          Anahtar kelimelere göre toplu içerik oluşturun. Her anahtar kelime için otomatik olarak
          içerik üretilir.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="keywords">Anahtar Kelimeler (Her satıra bir kelime)</Label>
          <Textarea
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Sakarya haber&#10;Sakarya son dakika&#10;Sakarya namaz vakitleri&#10;..."
            rows={8}
            className="mt-2 font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Her satıra bir anahtar kelime yazın. Sistem otomatik olarak içerik tipini belirleyecektir.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleGenerate} disabled={generating || !keywords.trim()}>
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                İçerik Oluştur
              </>
            )}
          </Button>
          {keywords && (
            <span className="text-sm text-muted-foreground">
              {parseKeywords(keywords).length} anahtar kelime
            </span>
          )}
        </div>

        {/* Generated Contents List */}
        {generatedContents.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-semibold mb-3">Oluşturulan İçerikler</h3>
            {generatedContents.map((content, index) => (
              <div
                key={index}
                className="p-3 bg-muted/50 rounded-lg border flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{content.keyword}</span>
                    <Badge variant={content.priority === "high" ? "default" : "secondary"}>
                      {content.priority}
                    </Badge>
                    <Badge variant="outline">{content.contentType}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{content.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {content.status === "generating" && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  {content.status === "completed" && (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {content.contentId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/seo/content-studio/${content.contentId}`)}
                        >
                          Aç
                        </Button>
                      )}
                    </>
                  )}
                  {content.status === "failed" && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

