"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Globe,
  FileText,
  ImageIcon,
  Link2,
  Gauge,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface TechnicalIssue {
  id: string;
  category: string;
  title: string;
  status: "pass" | "warning" | "fail";
  description: string;
  impact: "high" | "medium" | "low";
  fix?: string;
}

export function TechnicalAudit({ locale }: { locale: string }) {
  const [issues, setIssues] = useState<TechnicalIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastAudit, setLastAudit] = useState<Date | null>(null);

  const runAudit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/seo/technical-audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Kontrol başarısız");
      }

      const data = await response.json();
      
      if (!data.success || !data.issues) {
        throw new Error("Kontrol başarısız");
      }

      setIssues(data.issues);
      setLastAudit(new Date());
      toast.success("Teknik SEO kontrolü tamamlandı");
    } catch (error: any) {
      toast.error(error.message || "Kontrol başarısız");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  const getStatusIcon = (status: TechnicalIssue["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "fail":
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: TechnicalIssue["status"]) => {
    const variants = {
      pass: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      fail: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };
    const labels = {
      pass: "Başarılı",
      warning: "Uyarı",
      fail: "Başarısız",
    };
    return (
      <Badge className={cn("text-[10px] px-2 py-0.5", variants[status])}>
        {labels[status]}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Performance":
        return <Gauge className="h-4 w-4" />;
      case "Mobile":
        return <Globe className="h-4 w-4" />;
      case "Crawlability":
        return <FileText className="h-4 w-4" />;
      case "Indexing":
        return <FileText className="h-4 w-4" />;
      case "Security":
        return <AlertCircle className="h-4 w-4" />;
      case "Structured Data":
        return <FileText className="h-4 w-4" />;
      case "Images":
        return <ImageIcon className="h-4 w-4" />;
      case "Links":
        return <Link2 className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const passedCount = issues.filter((i) => i.status === "pass").length;
  const warningCount = issues.filter((i) => i.status === "warning").length;
  const failCount = issues.filter((i) => i.status === "fail").length;
  const totalScore = issues.length > 0 ? Math.round((passedCount / issues.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-bold text-design-dark dark:text-white mb-2">
            Teknik SEO Kontrolü
          </h3>
          {lastAudit && (
            <p className="text-sm text-design-gray dark:text-gray-400 font-ui">
              Son kontrol: {lastAudit.toLocaleString("tr-TR")}
            </p>
          )}
        </div>
        <Button
          onClick={runAudit}
          disabled={loading}
          className="bg-design-light hover:bg-green-600"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Yeniden Kontrol Et
        </Button>
      </div>

      {/* Score */}
      <Card className="card-professional bg-gradient-to-br from-design-light/10 via-design-light/5 to-transparent border-2 border-design-light/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-ui font-semibold text-design-gray dark:text-gray-400 mb-1">
                Teknik SEO Skoru
              </h4>
              <div className="text-3xl font-display font-bold text-design-dark dark:text-white">
                {totalScore}%
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{passedCount}</div>
                <div className="text-xs text-design-gray dark:text-gray-400 font-ui">Başarılı</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                <div className="text-xs text-design-gray dark:text-gray-400 font-ui">Uyarı</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{failCount}</div>
                <div className="text-xs text-design-gray dark:text-gray-400 font-ui">Başarısız</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues */}
      {loading ? (
        <div className="text-center py-8 text-design-gray dark:text-gray-400">
          Kontrol ediliyor...
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <Card key={issue.id} className="card-professional">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(issue.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(issue.category)}
                        <h4 className="font-semibold text-design-dark dark:text-white font-ui">
                          {issue.title}
                        </h4>
                      </div>
                      {getStatusBadge(issue.status)}
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                        {issue.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-design-gray dark:text-gray-400 font-ui mb-2">
                      {issue.description}
                    </p>
                    {issue.fix && (
                      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/20 rounded-lg p-3 mt-2">
                        <p className="text-xs font-semibold text-blue-800 dark:text-blue-400 mb-1 font-ui">
                          Öneri:
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-ui">
                          {issue.fix}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

