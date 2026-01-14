"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface ContentAnalysis {
  humanLikeScore: number;
  aiProbability: number;
  overallQuality: number;
  issues: string[];
  strengths: string[];
  suggestions: string[];
}

interface ImprovedContent {
  improvedText: string;
  changes: string[];
}

interface AdminAICheckerProps {
  articleId: string;
  title: string;
  content: string;
  onImproved?: () => void;
}

export function AdminAIChecker({
  articleId,
  title,
  content,
  onImproved,
}: AdminAICheckerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [improving, setImproving] = useState(false);
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [improvedContent, setImprovedContent] = useState<ImprovedContent | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/content/analyze-and-improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          title,
          action: "analyze",
        }),
      });

      if (!response.ok) throw new Error("Analiz başarısız");

      const data = await response.json();
      setAnalysis(data.analysis);
      toast.success("Analiz tamamlandı");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Analiz sırasında hata oluştu");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleImprove = async () => {
    setImproving(true);
    try {
      const response = await fetch("/api/content/analyze-and-improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          title,
          action: "improve",
        }),
      });

      if (!response.ok) throw new Error("İyileştirme başarısız");

      const data = await response.json();
      setImprovedContent(data.improved);
      toast.success("İçerik iyileştirildi");
    } catch (error) {
      console.error("Improvement error:", error);
      toast.error("İyileştirme sırasında hata oluştu");
    } finally {
      setImproving(false);
    }
  };

  const handleSave = async () => {
    if (!improvedContent) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: improvedContent.improvedText,
        }),
      });

      if (!response.ok) throw new Error("Kayıt başarısız");

      toast.success("İçerik kaydedildi");
      if (onImproved) onImproved();
      setImprovedContent(null);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Kayıt sırasında hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600 dark:text-green-400";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
    if (score >= 50) return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
    return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <Card className="card-professional">
        <CardHeader className="card-professional-header">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
            AI Analiz & İyileştirme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={analyzing || !content}
              className="btn-primary-professional"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analiz Ediliyor...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  İçeriği Analiz Et
                </>
              )}
            </Button>
            <Button
              onClick={handleImprove}
              disabled={improving || !content}
              variant="outline"
              className="btn-secondary-professional"
            >
              {improving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  İyileştiriliyor...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Otomatik İyileştir
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card className="card-professional">
          <CardHeader className="card-professional-header">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
              Analiz Sonuçları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scores */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl border border-[#E7E7E7] dark:border-[#0a3d35] bg-white/60 dark:bg-[#0a3d35]/60">
                <p className="text-xs text-design-gray dark:text-gray-400 mb-2">İnsan Benzeri</p>
                <p className={cn("text-2xl font-display font-bold", getScoreColor(analysis.humanLikeScore))}>
                  {analysis.humanLikeScore}
                </p>
              </div>
              <div className="text-center p-4 rounded-xl border border-[#E7E7E7] dark:border-[#0a3d35] bg-white/60 dark:bg-[#0a3d35]/60">
                <p className="text-xs text-design-gray dark:text-gray-400 mb-2">AI Olasılığı</p>
                <p className={cn("text-2xl font-display font-bold", getScoreColor(100 - analysis.aiProbability * 100))}>
                  {Math.round(analysis.aiProbability * 100)}%
                </p>
              </div>
              <div className="text-center p-4 rounded-xl border border-[#E7E7E7] dark:border-[#0a3d35] bg-white/60 dark:bg-[#0a3d35]/60">
                <p className="text-xs text-design-gray dark:text-gray-400 mb-2">Genel Kalite</p>
                <p className={cn("text-2xl font-display font-bold", getScoreColor(analysis.overallQuality))}>
                  {analysis.overallQuality}
                </p>
              </div>
            </div>

            {/* Issues */}
            {analysis.issues.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-design-dark dark:text-white mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  Tespit Edilen Sorunlar
                </h4>
                <ul className="space-y-2">
                  {analysis.issues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-design-gray dark:text-gray-400 flex items-start gap-2">
                      <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-design-dark dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Güçlü Yönler
                </h4>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-design-gray dark:text-gray-400 flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-design-dark dark:text-white mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-design-light" />
                  İyileştirme Önerileri
                </h4>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-design-gray dark:text-gray-400 flex items-start gap-2">
                      <span className="text-design-light mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Improved Content */}
      {improvedContent && (
        <Card className="card-professional">
          <CardHeader className="card-professional-header">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
                İyileştirilmiş İçerik
              </CardTitle>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary-professional"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#E7E7E7] dark:border-[#0a3d35] bg-white/60 dark:bg-[#0a3d35]/60">
                <p className="text-sm text-design-gray dark:text-gray-400 whitespace-pre-wrap">
                  {improvedContent.improvedText}
                </p>
              </div>
              {improvedContent.changes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-design-dark dark:text-white mb-2">
                    Yapılan Değişiklikler
                  </h4>
                  <ul className="space-y-1">
                    {improvedContent.changes.map((change, idx) => (
                      <li key={idx} className="text-xs text-design-gray dark:text-gray-400">
                        • {change}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
