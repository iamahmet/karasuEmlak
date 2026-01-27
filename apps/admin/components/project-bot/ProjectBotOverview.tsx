"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { AlertCircle, CheckCircle2, Info, Play } from "lucide-react";
import { Button } from "@karasu/ui";
import { useRouter } from "@/i18n/routing";
import { toast } from "sonner";

interface ProjectBotOverviewProps {
  errorCount: number;
  warningCount: number;
  infoCount: number;
  nowCount: number;
  nextCount: number;
  laterCount: number;
  latestRuns: Array<{
    id: string;
    run_type: string;
    status: string;
    started_at: string;
    findings_count: number;
    errors_count: number;
    warnings_count: number;
  }>;
}

export function ProjectBotOverview({
  errorCount,
  warningCount,
  infoCount,
  nowCount,
  nextCount,
  laterCount,
  latestRuns,
}: ProjectBotOverviewProps) {
  const router = useRouter();

  const handleRunBot = async () => {
    try {
      toast.loading("Project Bot scan başlatılıyor...");
      
      const response = await fetch("/api/project-bot/run", {
        method: "POST",
      });
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Bot taraması başarıyla başlatıldı!");
        router.refresh();
      } else {
        toast.error(data.error || "Bot taraması başlatılamadı");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Bot çalıştırılamadı";
      toast.error(errorMessage);
      console.error("Failed to run bot:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards - Compact */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="card-modern hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-[10px] md:text-xs font-ui font-semibold text-muted-foreground uppercase tracking-wider">Errors</CardTitle>
            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">{errorCount}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground font-ui">Open error findings</p>
          </CardContent>
        </Card>

        <Card className="card-modern hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-[10px] md:text-xs font-ui font-semibold text-muted-foreground uppercase tracking-wider">Warnings</CardTitle>
            <Info className="h-3.5 w-3.5 text-primary" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">{warningCount}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground font-ui">Open warning findings</p>
          </CardContent>
        </Card>

        <Card className="card-modern hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
            <CardTitle className="text-[10px] md:text-xs font-ui font-semibold text-muted-foreground uppercase tracking-wider">Info</CardTitle>
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">{infoCount}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground font-ui">Info findings</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Summary - Compact */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="card-modern hover-scale">
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-[10px] md:text-xs font-ui font-semibold text-muted-foreground uppercase tracking-wider">Now</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">{nowCount}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground font-ui">High priority</p>
          </CardContent>
        </Card>

        <Card className="card-modern hover-scale">
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-[10px] md:text-xs font-ui font-semibold text-muted-foreground uppercase tracking-wider">Next</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">{nextCount}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground font-ui">Medium priority</p>
          </CardContent>
        </Card>

        <Card className="card-modern hover-scale">
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-[10px] md:text-xs font-ui font-semibold text-muted-foreground uppercase tracking-wider">Later</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">{laterCount}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground font-ui">Low priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-modern">
        <CardHeader className="pb-3 px-4 pt-4">
          <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
            <span className="w-0.5 h-5 bg-gradient-to-b from-design-light to-design-dark rounded-full"></span>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap px-4 pb-4">
          <Button 
            onClick={handleRunBot} 
            className="h-8 px-3 text-xs font-ui bg-design-dark hover:bg-primary/90/90 text-white rounded-lg hover-scale micro-bounce"
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Run Scan
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              const locale = window.location.pathname.split("/")[1] || "tr";
              router.push(`/${locale}/project-bot?tab=findings`);
            }}
            className="h-8 px-3 text-xs font-ui border border-border/40 dark:border-border/40 rounded-lg hover-scale"
          >
            Findings
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              const locale = window.location.pathname.split("/")[1] || "tr";
              router.push(`/${locale}/project-bot?tab=recommendations`);
            }}
            className="h-8 px-3 text-xs font-ui border border-border/40 dark:border-border/40 rounded-lg hover-scale"
          >
            Recommendations
          </Button>
        </CardContent>
      </Card>

      {/* Latest Runs - Compact */}
      {latestRuns.length > 0 && (
        <Card className="card-modern">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
              <span className="w-0.5 h-5 bg-gradient-to-b from-design-light to-design-dark rounded-full"></span>
              Latest Runs
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-1.5">
              {latestRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-2.5 border border-border/40 dark:border-border/40 rounded-lg hover:bg-design-light/5 dark:hover:bg-primary/10 hover:border-design-light/30 transition-all duration-200 hover-scale"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs font-medium capitalize text-foreground font-ui">{run.run_type}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded capitalize font-ui font-semibold ${
                        run.status === "completed"
                          ? "bg-design-light/20 text-design-dark dark:text-primary"
                          : run.status === "failed"
                          ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                          : "bg-design-light/15 text-design-dark dark:text-primary"
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-ui flex-shrink-0">
                    {new Date(run.started_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

