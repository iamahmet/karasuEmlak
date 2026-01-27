"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@karasu/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { SEOOverview } from "./SEOOverview";
import { SEOAnalyzer } from "./SEOAnalyzer";
import { KeywordTracker } from "./KeywordTracker";
import { TechnicalAudit } from "./TechnicalAudit";
import { ContentOptimizer as SEOContentOptimizer } from "./ContentOptimizer";
import { BulkSEOOptimizer } from "./BulkSEOOptimizer";
import { SERPTracker as SEOSERPTracker } from "./SERPTracker";
import { BacklinkMonitor } from "./BacklinkMonitor";
import { SEOReports } from "./SEOReports";
import { CompetitorAnalysis } from "./CompetitorAnalysis";
import { SEOSuggestions } from "./SEOSuggestions";
import { SEOPerformanceMetrics } from "./SEOPerformanceMetrics";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { cn } from "@karasu/lib";

export function SEOBoosterDashboard({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || "overview");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    } else if (!tab && activeTab !== "overview") {
      setActiveTab("overview");
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (value: string) => {
    if (value === activeTab) return;
    
    setActiveTab(value);
    const newUrl = `/${locale}/seo/booster?tab=${value}`;
    router.push(newUrl, { scroll: false });
  };

  const tabs = [
    { id: "overview", label: "Genel Bakış", badge: null },
    { id: "analyzer", label: "SEO Analiz", badge: null },
    { id: "keywords", label: "Keyword Takibi", badge: null },
    { id: "technical", label: "Teknik SEO", badge: null },
    { id: "content", label: "İçerik Optimizasyonu", badge: null },
    { id: "serp", label: "SERP Takibi", badge: null },
    { id: "backlinks", label: "Backlink İzleme", badge: null },
    { id: "competitors", label: "Rakip Analizi", badge: null },
    { id: "suggestions", label: "Öneriler", badge: null },
    { id: "reports", label: "Raporlar", badge: null },
  ];

  return (
    <Card className="card-professional border-2 border-design-light/10">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="border-b border-border bg-gradient-to-r from-design-light/5 via-transparent to-design-light/5 sticky top-0 z-10 bg-card">
            <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto overflow-x-auto scrollbar-modern">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-design-light rounded-none px-6 py-4 font-ui font-semibold text-sm transition-all duration-200 cursor-pointer select-none",
                    activeTab === tab.id
                      ? "text-foreground border-b-2 border-design-light"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                  {tab.badge && (
                    <Badge className="ml-2 text-[10px] px-1.5 py-0.5">
                      {tab.badge}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="overview" className="m-0 p-6 space-y-6">
            <SEOOverview locale={locale} />
            <SEOPerformanceMetrics locale={locale} />
          </TabsContent>

          <TabsContent value="analyzer" className="m-0 p-6">
            <SEOAnalyzer locale={locale} />
          </TabsContent>

          <TabsContent value="keywords" className="m-0 p-6">
            <KeywordTracker locale={locale} />
          </TabsContent>

          <TabsContent value="technical" className="m-0 p-6">
            <TechnicalAudit locale={locale} />
          </TabsContent>

          <TabsContent value="content" className="m-0 p-6 space-y-6">
            <div>
              <h3 className="text-lg font-display font-bold text-foreground mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Destekli Tek Tıkla SEO Optimizasyonu
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tüm içeriklerinizi tek tıkla optimize edin. Makaleler ve haberler için kapsamlı SEO optimizasyonu.
              </p>
            </div>
            <BulkSEOOptimizer locale={locale} />
            <div className="pt-6 border-t border-slate-200/50 dark:border-[#0a3d35]/50">
              <h3 className="text-lg font-display font-bold text-foreground mb-4">
                İçerik Analizi
              </h3>
              <SEOContentOptimizer locale={locale} />
            </div>
          </TabsContent>

          <TabsContent value="serp" className="m-0 p-6">
            <SEOSERPTracker locale={locale} />
          </TabsContent>

          <TabsContent value="backlinks" className="m-0 p-6">
            <BacklinkMonitor locale={locale} />
          </TabsContent>

          <TabsContent value="competitors" className="m-0 p-6">
            <CompetitorAnalysis locale={locale} />
          </TabsContent>

          <TabsContent value="suggestions" className="m-0 p-6">
            <SEOSuggestions locale={locale} />
          </TabsContent>

          <TabsContent value="reports" className="m-0 p-6">
            <SEOReports locale={locale} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
