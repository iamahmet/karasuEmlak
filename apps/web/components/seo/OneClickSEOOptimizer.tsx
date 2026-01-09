"use client";

import { useState, useCallback } from "react";
import { Search, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@karasu/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Progress } from "@karasu/ui";

interface SEOAnalysis {
  score: number;
  title: { status: "good" | "warning" | "error"; message: string };
  description: { status: "good" | "warning" | "error"; message: string };
  keywords: { status: "good" | "warning" | "error"; message: string };
  headings: { status: "good" | "warning" | "error"; message: string };
  images: { status: "good" | "warning" | "error"; message: string };
}

interface OneClickSEOOptimizerProps {
  title?: string;
  description?: string;
  content?: string;
  keywords?: string[];
  onOptimize?: (suggestions: { title?: string; description?: string; keywords?: string[] }) => void;
  className?: string;
}

export function OneClickSEOOptimizer({
  title = "",
  description = "",
  content = "",
  keywords = [],
  onOptimize,
  className,
}: OneClickSEOOptimizerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SEOAnalysis | null>(null);

  const analyzeSEO = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      // Simulated SEO analysis
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const titleLength = title.length;
      const descLength = description.length;

      const newAnalysis: SEOAnalysis = {
        score: 0,
        title: {
          status: titleLength >= 30 && titleLength <= 60 ? "good" : titleLength > 0 ? "warning" : "error",
          message:
            titleLength >= 30 && titleLength <= 60
              ? "Title length is optimal"
              : titleLength > 60
              ? "Title is too long (max 60 chars)"
              : titleLength > 0
              ? "Title is too short (min 30 chars)"
              : "Title is missing",
        },
        description: {
          status: descLength >= 120 && descLength <= 160 ? "good" : descLength > 0 ? "warning" : "error",
          message:
            descLength >= 120 && descLength <= 160
              ? "Meta description length is optimal"
              : descLength > 160
              ? "Meta description is too long (max 160 chars)"
              : descLength > 0
              ? "Meta description is too short (min 120 chars)"
              : "Meta description is missing",
        },
        keywords: {
          status: keywords.length >= 3 ? "good" : keywords.length > 0 ? "warning" : "error",
          message:
            keywords.length >= 3
              ? "Good keyword coverage"
              : keywords.length > 0
              ? "Consider adding more keywords"
              : "No keywords specified",
        },
        headings: {
          status: content.includes("<h1") || content.includes("<h2") ? "good" : "warning",
          message: content.includes("<h1") || content.includes("<h2") ? "Headings detected" : "Add headings for better structure",
        },
        images: {
          status: "good",
          message: "Images are optimized",
        },
      };

      // Calculate score
      const statusScores = { good: 20, warning: 10, error: 0 };
      newAnalysis.score =
        statusScores[newAnalysis.title.status] +
        statusScores[newAnalysis.description.status] +
        statusScores[newAnalysis.keywords.status] +
        statusScores[newAnalysis.headings.status] +
        statusScores[newAnalysis.images.status];

      setAnalysis(newAnalysis);
    } catch (error) {
      console.error("SEO analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [title, description, content, keywords]);

  const handleOptimize = useCallback(() => {
    if (onOptimize) {
      // Generate optimization suggestions
      const suggestions: { title?: string; description?: string; keywords?: string[] } = {};

      if (title.length < 30) {
        suggestions.title = title + " - Professional Real Estate Services";
      }
      if (description.length < 120) {
        suggestions.description = description + " Discover more about our professional real estate services and expert guidance.";
      }
      if (keywords.length < 3) {
        suggestions.keywords = [...keywords, "real estate", "property", "karasu"];
      }

      onOptimize(suggestions);
    }
  }, [title, description, keywords, onOptimize]);

  const getStatusIcon = (status: "good" | "warning" | "error") => {
    switch (status) {
      case "good":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Search className="h-4 w-4" />
          SEO Optimizer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={analyzeSEO}
            disabled={isAnalyzing}
            variant="outline"
            size="sm"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze SEO
              </>
            )}
          </Button>
          <Button
            onClick={handleOptimize}
            disabled={!analysis || isAnalyzing}
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Optimize
          </Button>
        </div>

        {analysis && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">SEO Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.score}/100
              </span>
            </div>
            <Progress value={analysis.score} className="h-2" />

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                {getStatusIcon(analysis.title.status)}
                <div>
                  <p className="text-sm font-medium">Title</p>
                  <p className="text-xs text-gray-500">{analysis.title.message}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                {getStatusIcon(analysis.description.status)}
                <div>
                  <p className="text-sm font-medium">Meta Description</p>
                  <p className="text-xs text-gray-500">{analysis.description.message}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                {getStatusIcon(analysis.keywords.status)}
                <div>
                  <p className="text-sm font-medium">Keywords</p>
                  <p className="text-xs text-gray-500">{analysis.keywords.message}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                {getStatusIcon(analysis.headings.status)}
                <div>
                  <p className="text-sm font-medium">Headings</p>
                  <p className="text-xs text-gray-500">{analysis.headings.message}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                {getStatusIcon(analysis.images.status)}
                <div>
                  <p className="text-sm font-medium">Images</p>
                  <p className="text-xs text-gray-500">{analysis.images.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
