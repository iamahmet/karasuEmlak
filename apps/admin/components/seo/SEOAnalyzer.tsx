"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  Search,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  TrendingUp,
  FileText,
  Image as ImageIcon,
  Link2,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface SEOIssue {
  type: "error" | "warning" | "info";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  fix?: string;
}

interface SEOAnalysis {
  url: string;
  score: number;
  issues: SEOIssue[];
  metrics: {
    titleLength: number;
    metaDescriptionLength: number;
    headingCount: number;
    imageCount: number;
    internalLinks: number;
    externalLinks: number;
    wordCount: number;
  };
}

export function SEOAnalyzer({ locale }: { locale: string }) {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error("Lütfen bir URL girin");
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch("/api/seo/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        throw new Error("Analiz başarısız");
      }

      const data = await response.json();
      
      if (!data.success || !data.analysis) {
        throw new Error("Geçersiz analiz sonucu");
      }

      setAnalysis(data.analysis);
      toast.success("SEO analizi tamamlandı");
    } catch (error: any) {
      toast.error(error.message || "Analiz sırasında bir hata oluştu");
    } finally {
      setAnalyzing(false);
    }
  };

  const getImpactColor = (impact: SEOIssue["impact"]) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    }
  };

  const getTypeIcon = (type: SEOIssue["type"]) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "info":
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-design-light" />
            SEO Analiz Aracı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="url"
              placeholder="https://example.com/page"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            />
            <Button
              onClick={handleAnalyze}
              disabled={analyzing || !url.trim()}
              className="bg-design-light hover:bg-green-600"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analiz Ediliyor...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Analiz Et
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Score Card */}
          <Card className="card-professional bg-gradient-to-br from-design-light/10 via-design-light/5 to-transparent border-2 border-design-light/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-display font-bold text-design-dark dark:text-white mb-2">
                    SEO Skoru
                  </h3>
                  <p className="text-sm text-design-gray dark:text-gray-400 font-ui">
                    {analysis.url}
                  </p>
                </div>
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-design-light/20 to-design-light/10 flex items-center justify-center border-4 border-design-light/30">
                    <div className="text-center">
                      <div className={cn("text-4xl font-display font-bold", getScoreColor(analysis.score))}>
                        {analysis.score}
                      </div>
                      <div className="text-xs text-design-gray dark:text-gray-400 font-ui">/ 100</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics */}
          <Card className="card-professional">
            <CardHeader>
              <CardTitle>Sayfa Metrikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <p className="text-xs text-design-gray dark:text-gray-400 font-ui">Kelime Sayısı</p>
                  </div>
                  <p className="text-2xl font-bold text-design-dark dark:text-white">
                    {analysis.metrics.wordCount}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-design-gray dark:text-gray-400 font-ui">İç Link</p>
                  </div>
                  <p className="text-2xl font-bold text-design-dark dark:text-white">
                    {analysis.metrics.internalLinks}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="h-4 w-4 text-purple-600" />
                    <p className="text-xs text-design-gray dark:text-gray-400 font-ui">Görsel</p>
                  </div>
                  <p className="text-2xl font-bold text-design-dark dark:text-white">
                    {analysis.metrics.imageCount}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-orange-600" />
                    <p className="text-xs text-design-gray dark:text-gray-400 font-ui">Dış Link</p>
                  </div>
                  <p className="text-2xl font-bold text-design-dark dark:text-white">
                    {analysis.metrics.externalLinks}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues */}
          <Card className="card-professional">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Tespit Edilen Sorunlar</span>
                <Badge className="bg-design-light/20 text-design-dark dark:text-design-light">
                  {analysis.issues.length} sorun
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.issues.map((issue, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-xl border-2 border-[#E7E7E7] dark:border-[#062F28] hover:border-design-light/50 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-0.5">
                        {getTypeIcon(issue.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-design-dark dark:text-white font-ui">
                            {issue.title}
                          </h4>
                          <Badge className={cn("text-[10px] px-2 py-0.5", getImpactColor(issue.impact))}>
                            {issue.impact === "high" ? "Yüksek" : issue.impact === "medium" ? "Orta" : "Düşük"}
                          </Badge>
                        </div>
                        <p className="text-sm text-design-gray dark:text-gray-400 font-ui mb-3">
                          {issue.description}
                        </p>
                        {issue.fix && (
                          <div className="p-3 rounded-lg bg-design-light/10 border border-design-light/20">
                            <p className="text-xs font-semibold text-design-dark dark:text-white font-ui mb-1">
                              Çözüm:
                            </p>
                            <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
                              {issue.fix}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!analysis && !analyzing && (
        <Card className="card-professional">
          <CardContent className="p-12 text-center">
            <Search className="h-16 w-16 mx-auto mb-4 text-design-gray dark:text-gray-400 opacity-50" />
            <p className="text-design-gray dark:text-gray-400 font-ui">
              Analiz etmek için bir URL girin
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
