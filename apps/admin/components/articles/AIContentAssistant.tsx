"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { 
  Sparkles, 
  Loader2, 
  Wand2, 
  Lightbulb, 
  FileText, 
  Search,
  TrendingUp,
  Check,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface AIContentAssistantProps {
  title?: string;
  content?: string;
  excerpt?: string;
  onUpdate: (updates: { metaDescription?: string; seoKeywords?: string; excerpt?: string; title?: string }) => void;
  className?: string;
}

export function AIContentAssistant({ 
  title = "", 
  content = "", 
  excerpt = "",
  onUpdate,
  className 
}: AIContentAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    metaDescription?: string[];
    seoKeywords?: string[];
    excerpt?: string[];
    title?: string[];
  }>({});
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<string, string>>({});

  const generateSuggestions = async (type: "metaDescription" | "seoKeywords" | "excerpt" | "title") => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/content-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          content,
          excerpt,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.suggestions) {
        setSuggestions(prev => ({
          ...prev,
          [type]: data.suggestions,
        }));
        toast.success(`${type === "metaDescription" ? "Meta açıklama" : type === "seoKeywords" ? "SEO anahtar kelimeleri" : type === "excerpt" ? "Özet" : "Başlık"} önerileri oluşturuldu`);
      } else {
        throw new Error(data.error || "Öneriler oluşturulamadı");
      }
    } catch (error: any) {
      console.error("AI suggestion error:", error);
      toast.error(error.message || "Öneriler oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (type: string, suggestion: string) => {
    setSelectedSuggestions(prev => ({
      ...prev,
      [type]: suggestion,
    }));
    
    if (type === "metaDescription") {
      onUpdate({ metaDescription: suggestion });
    } else if (type === "seoKeywords") {
      onUpdate({ seoKeywords: suggestion });
    } else if (type === "excerpt") {
      onUpdate({ excerpt: suggestion });
    } else if (type === "title") {
      onUpdate({ title: suggestion });
    }
    
    toast.success("Öneri uygulandı");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Kopyalandı");
  };

  return (
    <Card className={cn("card-professional", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-design-light" />
            AI İçerik Asistanı
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Beta
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Meta Description Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" />
              Meta Açıklama Önerileri
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => generateSuggestions("metaDescription")}
              disabled={loading}
              className="h-8 px-3 text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Wand2 className="h-3 w-3 mr-1" />
                  Oluştur
                </>
              )}
            </Button>
          </div>
          {suggestions.metaDescription && suggestions.metaDescription.length > 0 && (
            <div className="space-y-2">
              {suggestions.metaDescription.map((suggestion, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    selectedSuggestions.metaDescription === suggestion
                      ? "bg-design-light/10 border-design-light"
                      : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 hover:border-design-light/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-design-dark dark:text-white flex-1">
                      {suggestion}
                    </p>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.length} karakter
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(suggestion)}
                        className="h-7 w-7 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => applySuggestion("metaDescription", suggestion)}
                        className={cn(
                          "h-7 w-7 p-0",
                          selectedSuggestions.metaDescription === suggestion && "bg-design-light text-white"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO Keywords Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              SEO Anahtar Kelime Önerileri
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => generateSuggestions("seoKeywords")}
              disabled={loading}
              className="h-8 px-3 text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Wand2 className="h-3 w-3 mr-1" />
                  Oluştur
                </>
              )}
            </Button>
          </div>
          {suggestions.seoKeywords && suggestions.seoKeywords.length > 0 && (
            <div className="space-y-2">
              {suggestions.seoKeywords.map((suggestion, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    selectedSuggestions.seoKeywords === suggestion
                      ? "bg-design-light/10 border-design-light"
                      : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 hover:border-design-light/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-design-dark dark:text-white flex-1">
                      {suggestion}
                    </p>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.split(",").length} kelime
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(suggestion)}
                        className="h-7 w-7 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => applySuggestion("seoKeywords", suggestion)}
                        className={cn(
                          "h-7 w-7 p-0",
                          selectedSuggestions.seoKeywords === suggestion && "bg-design-light text-white"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Excerpt Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Özet Önerileri
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => generateSuggestions("excerpt")}
              disabled={loading}
              className="h-8 px-3 text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Wand2 className="h-3 w-3 mr-1" />
                  Oluştur
                </>
              )}
            </Button>
          </div>
          {suggestions.excerpt && suggestions.excerpt.length > 0 && (
            <div className="space-y-2">
              {suggestions.excerpt.map((suggestion, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    selectedSuggestions.excerpt === suggestion
                      ? "bg-design-light/10 border-design-light"
                      : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 hover:border-design-light/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-design-dark dark:text-white flex-1">
                      {suggestion}
                    </p>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.length} karakter
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(suggestion)}
                        className="h-7 w-7 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => applySuggestion("excerpt", suggestion)}
                        className={cn(
                          "h-7 w-7 p-0",
                          selectedSuggestions.excerpt === suggestion && "bg-design-light text-white"
                        )}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Title Suggestions */}
        {title && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Başlık Önerileri
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateSuggestions("title")}
                disabled={loading}
                className="h-8 px-3 text-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-3 w-3 mr-1" />
                    Oluştur
                  </>
                )}
              </Button>
            </div>
            {suggestions.title && suggestions.title.length > 0 && (
              <div className="space-y-2">
                {suggestions.title.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-3 rounded-lg border transition-all",
                      selectedSuggestions.title === suggestion
                        ? "bg-design-light/10 border-design-light"
                        : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 hover:border-design-light/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-design-dark dark:text-white flex-1 font-semibold">
                        {suggestion}
                      </p>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {suggestion.length} karakter
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(suggestion)}
                          className="h-7 w-7 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => applySuggestion("title", suggestion)}
                          className={cn(
                            "h-7 w-7 p-0",
                            selectedSuggestions.title === suggestion && "bg-design-light text-white"
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!suggestions.metaDescription && !suggestions.seoKeywords && !suggestions.excerpt && !suggestions.title && (
          <div className="text-center py-8 text-design-gray dark:text-gray-400">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              AI ile içerik önerileri oluşturmak için yukarıdaki butonlara tıklayın
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

