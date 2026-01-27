"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { 
  Sparkles, 
  Wand2, 
  Lightbulb, 
  TrendingUp, 
  DollarSign,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Zap,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface ListingData {
  title?: string;
  description?: string;
  price_amount?: number | null;
  property_type?: string;
  location_neighborhood?: string;
  area_sqm?: number;
  room_count?: number;
}

interface AIListingAssistantProps {
  listing: ListingData;
  onUpdate: (updates: Partial<ListingData>) => void;
  className?: string;
}

interface AISuggestion {
  type: "title" | "description" | "price" | "features";
  title: string;
  suggestion: string;
  confidence: number;
  reasoning?: string;
}

export function AIListingAssistant({ listing, onUpdate, className }: AIListingAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [optimizing, setOptimizing] = useState<string | null>(null);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      // Simulate AI API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newSuggestions: AISuggestion[] = [];

      // Title suggestions
      if (listing.property_type && listing.location_neighborhood) {
        const roomInfo = listing.room_count ? `${listing.room_count}+1` : "";
        newSuggestions.push({
          type: "title",
          title: "Başlık Önerileri",
          suggestion: `${listing.property_type.charAt(0).toUpperCase() + listing.property_type.slice(1)} ${roomInfo} ${listing.location_neighborhood} - Denize Sıfır`,
          confidence: 0.92,
          reasoning: "SEO dostu başlık, konum ve özellikleri içeriyor",
        });
        newSuggestions.push({
          type: "title",
          title: "Alternatif Başlık",
          suggestion: `Satılık ${listing.property_type} ${listing.location_neighborhood} - ${listing.room_count ? listing.room_count + "+1" : "Geniş"}`,
          confidence: 0.85,
          reasoning: "Daha kısa ve öz alternatif",
        });
      }

      // Description suggestions
      if (listing.description && listing.description.length < 300) {
        newSuggestions.push({
          type: "description",
          title: "Açıklama İyileştirme",
          suggestion: `${listing.description}\n\n${listing.property_type} özellikleri:\n• ${listing.area_sqm ? listing.area_sqm + " m²" : "Geniş"} alan\n• ${listing.room_count ? listing.room_count + "+1" : "Çok odalı"} oda düzeni\n• ${listing.location_neighborhood} konumunda\n• Ulaşım imkanları\n• Çevre olanakları`,
          confidence: 0.88,
          reasoning: "Daha detaylı açıklama SEO için önemli",
        });
      }

      // Price suggestions
      if (listing.price_amount && listing.area_sqm && listing.area_sqm > 0) {
        const pricePerM2 = Math.round(listing.price_amount / listing.area_sqm);
        const marketAvg = listing.property_type === "daire" ? 25000 : listing.property_type === "villa" ? 40000 : 10000;
        
        if (pricePerM2 > marketAvg * 1.15) {
          newSuggestions.push({
            type: "price",
            title: "Fiyat Önerisi",
            suggestion: `Piyasa ortalamasından %${Math.round(((pricePerM2 - marketAvg) / marketAvg) * 100)} yüksek. ${Math.round(marketAvg * listing.area_sqm).toLocaleString("tr-TR")} TRY civarı daha uygun olabilir.`,
            confidence: 0.90,
            reasoning: "Piyasa analizi",
          });
        } else if (pricePerM2 < marketAvg * 0.85) {
          newSuggestions.push({
            type: "price",
            title: "Fiyat Fırsatı",
            suggestion: `Fiyatınız piyasa ortalamasının altında. ${Math.round(marketAvg * listing.area_sqm).toLocaleString("tr-TR")} TRY'ye kadar çıkarabilirsiniz.`,
            confidence: 0.87,
            reasoning: "Fiyat optimizasyonu fırsatı",
          });
        }
      }

      // Feature suggestions
      if (listing.property_type) {
        const features = {
          daire: ["Balkon", "Asansör", "Otopark", "Güvenlik", "Spor Salonu"],
          villa: ["Bahçe", "Havuz", "Otopark", "Güvenlik", "Geniş Bahçe"],
          arsa: ["İmar Durumu", "Yol Durumu", "Elektrik", "Su", "Doğalgaz"],
        };
        
        const propertyFeatures = features[listing.property_type as keyof typeof features] || [];
        if (propertyFeatures.length > 0) {
          newSuggestions.push({
            type: "features",
            title: "Özellik Önerileri",
            suggestion: propertyFeatures.join(", "),
            confidence: 0.80,
            reasoning: "Bu emlak tipi için yaygın özellikler",
          });
        }
      }

      setSuggestions(newSuggestions);
      toast.success(`${newSuggestions.length} öneri oluşturuldu`);
    } catch (error: any) {
      console.error("AI suggestion error:", error);
      toast.error("Öneriler oluşturulamadı");
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    setOptimizing(suggestion.type);
    
    setTimeout(() => {
      if (suggestion.type === "title") {
        onUpdate({ title: suggestion.suggestion });
      } else if (suggestion.type === "description") {
        onUpdate({ description: suggestion.suggestion });
      }
      
      toast.success("Öneri uygulandı");
      setOptimizing(null);
    }, 500);
  };

  const optimizeAll = async () => {
    setOptimizing("all");
    try {
      // Apply best suggestions
      const bestSuggestions = suggestions
        .filter(s => s.confidence > 0.85)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);

      for (const suggestion of bestSuggestions) {
        if (suggestion.type === "title" || suggestion.type === "description") {
          applySuggestion(suggestion);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      toast.success("Tüm öneriler uygulandı");
    } catch (error) {
      toast.error("Optimizasyon başarısız");
    } finally {
      setOptimizing(null);
    }
  };

  return (
    <Card className={cn("card-professional border-gradient-to-r from-purple-200 to-pink-200", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            AI İlan Asistanı
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
            <Zap className="h-3 w-3 mr-1" />
            Beta
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={generateSuggestions}
            disabled={loading}
            className="h-9 text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Analiz...
              </>
            ) : (
              <>
                <Lightbulb className="h-3 w-3 mr-1" />
                Akıllı Öneriler
              </>
            )}
          </Button>
          {suggestions.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={optimizeAll}
              disabled={optimizing === "all"}
              className="h-9 text-xs"
            >
              {optimizing === "all" ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Uygulanıyor...
                </>
              ) : (
                <>
                  <Wand2 className="h-3 w-3 mr-1" />
                  Tümünü Uygula
                </>
              )}
            </Button>
          )}
        </div>

        {/* Suggestions List */}
        {suggestions.length > 0 && (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded-lg border transition-all",
                  suggestion.type === "title"
                    ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                    : suggestion.type === "description"
                    ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                    : suggestion.type === "price"
                    ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800"
                    : "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {suggestion.type === "title" && <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                    {suggestion.type === "description" && <FileText className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />}
                    {suggestion.type === "price" && <DollarSign className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />}
                    {suggestion.type === "features" && <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />}
                    <h4 className="text-sm font-semibold text-foreground">
                      {suggestion.title}
                    </h4>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] flex-shrink-0",
                        suggestion.confidence >= 0.9
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                          : suggestion.confidence >= 0.8
                          ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300"
                          : "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                      )}
                    >
                      %{Math.round(suggestion.confidence * 100)}
                    </Badge>
                  </div>
                  {(suggestion.type === "title" || suggestion.type === "description") && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => applySuggestion(suggestion)}
                      disabled={optimizing === suggestion.type}
                      className="h-7 px-2 text-xs flex-shrink-0"
                    >
                      {optimizing === suggestion.type ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Uygula
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-3 break-words">
                  {suggestion.suggestion}
                </p>
                {suggestion.reasoning && (
                  <p className="text-[10px] text-design-gray dark:text-gray-500 italic break-words">
                    💡 {suggestion.reasoning}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {suggestions.length === 0 && !loading && (
          <div className="text-center py-6 px-4">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
              AI önerileri almak için "Akıllı Öneriler" butonuna tıklayın
            </p>
            <p className="text-xs text-design-gray dark:text-gray-500 leading-relaxed">
              Başlık, açıklama, fiyat ve özellik önerileri alabilirsiniz
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
