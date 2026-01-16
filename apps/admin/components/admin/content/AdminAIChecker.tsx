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
  contentType?: 'blog' | 'article' | 'guide' | 'news';
  onImproved?: (improvedContent?: string) => void;
  onQueueUpdate?: () => void; // Callback to refresh queue
}

export function AdminAIChecker({
  articleId,
  title,
  content,
  contentType = 'blog',
  onImproved,
  onQueueUpdate,
}: AdminAICheckerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [improving, setImproving] = useState(false);
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [improvedContent, setImprovedContent] = useState<ImprovedContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [schemaCacheStale, setSchemaCacheStale] = useState(false);
  const [reloadingSchema, setReloadingSchema] = useState(false);
  const [improvementId, setImprovementId] = useState<string | null>(null);

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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Analiz başarısız");
      }

      const data = await response.json();
      // Handle both formats: { analysis } or { data: { analysis } }
      const analysisData = data.analysis || data.data?.analysis;
      if (analysisData) {
        setAnalysis(analysisData);
        toast.success("Analiz tamamlandı");
      } else {
        throw new Error("Analiz sonucu alınamadı");
      }
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
          articleId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "İyileştirme başarısız");
      }

      const data = await response.json();
      // Handle both formats: { improved } or { data: { improved } }
      const improvedData = data.improved || data.data?.improved;
      const currentImprovementId = data.improvementId || data.data?.improvementId;
      
      if (improvedData) {
        setImprovedContent(improvedData);
        // Store improvement ID for tracking when saved
        if (currentImprovementId) {
          setImprovementId(currentImprovementId);
        }
        toast.success("İçerik iyileştirildi");
        // Refresh queue if callback provided
        if (onQueueUpdate) {
          setTimeout(() => onQueueUpdate(), 1000);
        }
      } else {
        throw new Error("İyileştirme sonucu alınamadı");
      }
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Check for PostgREST schema cache stale error
        if (
          errorData.code === "POSTGREST_SCHEMA_STALE" ||
          errorData.message?.includes("schema cache") ||
          errorData.message?.includes("reload-postgrest")
        ) {
          const errorMessage = errorData.message || "PostgREST schema cache is stale. Please reload the schema cache.";
          throw new Error(errorMessage);
        }
        
        const errorMessage = errorData.error || errorData.message || "Kayıt başarısız";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Mark improvement as applied in database
      if (improvementId) {
        try {
          await fetch("/api/content-improvement/apply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              improvementId,
              articleId,
            }),
          });
        } catch (applyError) {
          console.warn("Failed to mark improvement as applied:", applyError);
          // Don't fail the save if this fails
        }
      } else if (improvedContent) {
        // If no improvementId but we have improved content, create a record
        try {
          await fetch("/api/content-improvement/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content_type: contentType === 'blog' ? 'article' : contentType,
              content_id: articleId,
              field: 'content',
              original_content: content,
              improved_content: improvedContent.improvedText,
              quality_analysis: analysis ? {
                score: analysis.overallQuality,
                humanLikeScore: analysis.humanLikeScore,
                aiProbability: analysis.aiProbability,
                issues: analysis.issues,
                suggestions: analysis.suggestions,
              } : null,
              improvement_result: {
                changes: improvedContent.changes,
              },
              applied: true,
            }),
          });
        } catch (createError) {
          console.warn("Failed to create improvement record:", createError);
          // Don't fail the save if this fails
        }
      }
      
      toast.success("İçerik kaydedildi");
      if (onImproved) onImproved();
      setImprovedContent(null);
      setImprovementId(null);
    } catch (error: any) {
      console.error("Save error:", error);
      
      // Special handling for PostgREST schema cache stale error
      if (
        error.message?.includes("schema cache") ||
        error.message?.includes("reload-postgrest") ||
        error.message?.includes("PostgREST")
      ) {
        setSchemaCacheStale(true);
        toast.error("Veritabanı şema önbelleği güncel değil. Lütfen şema önbelleğini yenileyin.");
      } else {
        toast.error(error.message || "Kayıt sırasında hata oluştu");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReloadSchema = async () => {
    setReloadingSchema(true);
    try {
      const reloadResponse = await fetch("/api/admin/reload-postgrest", {
        method: "POST",
      });
      
      if (reloadResponse.ok) {
        toast.success("Şema önbelleği yenilendi. 2 saniye sonra tekrar denenecek...");
        setSchemaCacheStale(false);
        // Retry save after reload
        setTimeout(() => {
          handleSave();
        }, 2000);
      } else {
        const errorData = await reloadResponse.json().catch(() => ({}));
        toast.error(errorData.message || "Şema önbelleği yenilenemedi. Lütfen terminal'de çalıştırın: pnpm supabase:reload-postgrest");
      }
    } catch (reloadError) {
      toast.error("Şema önbelleği yenilenemedi. Lütfen terminal'de çalıştırın: pnpm supabase:reload-postgrest");
    } finally {
      setReloadingSchema(false);
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

      {/* Schema Cache Stale Warning */}
      {schemaCacheStale && (
        <Card className="card-professional border-yellow-500 dark:border-yellow-600">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-design-dark dark:text-white mb-1">
                  Veritabanı Şema Önbelleği Güncel Değil
                </h3>
                <p className="text-xs text-design-gray dark:text-gray-400 mb-3">
                  PostgREST şema önbelleği güncel değil. İçeriği kaydetmek için önce şema önbelleğini yenileyin.
                </p>
                <Button
                  onClick={handleReloadSchema}
                  disabled={reloadingSchema}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  {reloadingSchema ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Yenileniyor...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Şema Önbelleğini Yenile
                    </>
                  )}
                </Button>
              </div>
            </div>
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
