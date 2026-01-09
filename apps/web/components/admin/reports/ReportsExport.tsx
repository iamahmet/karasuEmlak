"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { toast } from "sonner";
import {
  FileText,
  Download,
  FileSpreadsheet,
  FileJson,
  Calendar,
  TrendingUp,
  Users,
  MessageSquare,
} from "lucide-react";
import { cn } from "@karasu/lib";

interface ReportConfig {
  type: "articles" | "users" | "comments" | "analytics" | "content";
  format: "csv" | "json" | "excel";
  dateRange: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
}

export function ReportsExport({ locale: _locale }: { locale: string }) {
  const [loading, setLoading] = useState(false);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: "articles",
    format: "csv",
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
  });

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: reportConfig.type,
          dateRange: reportConfig.dateRange,
        }),
      });

      if (!response.ok) {
        throw new Error("Rapor oluşturulamadı");
      }

      const data = await response.json();
      
      if (!data.success || !data.report) {
        throw new Error("Invalid response format");
      }

      // Extract data from report based on type
      let exportData: any[] = [];
      switch (reportConfig.type) {
        case "articles":
          exportData = data.report.articles || [];
          break;
        case "users":
          exportData = data.report.users || [];
          break;
        case "comments":
          exportData = data.report.comments || [];
          break;
        case "analytics":
          exportData = data.report.eventsByType ? [data.report] : [];
          break;
        case "content":
          exportData = data.report.content || [];
          break;
      }

      if (exportData.length === 0) {
        toast.warning("Seçilen tarih aralığında veri bulunamadı");
        return;
      }

      // Export based on format
      if (reportConfig.format === "csv") {
        exportToCSV(exportData, reportConfig.type);
      } else if (reportConfig.format === "json") {
        exportToJSON(exportData, reportConfig.type);
      } else if (reportConfig.format === "excel") {
        exportToExcel(exportData, reportConfig.type);
      }

      toast.success(`${exportData.length} kayıt ${reportConfig.format.toUpperCase()} formatında dışa aktarıldı`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Rapor oluşturulamadı";
      toast.error(errorMessage);
      console.error("Failed to export report:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], type: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return "";
            if (typeof value === "object") return JSON.stringify(value);
            return String(value).replace(/"/g, '""');
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_report_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const exportToJSON = (data: any[], type: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_report_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  const exportToExcel = (data: any[], type: string) => {
    // For Excel, we'll export as CSV (proper Excel export would require a library)
    exportToCSV(data, type);
    toast.info("Excel formatı için CSV olarak dışa aktarıldı");
  };

  const reportTypes = [
    {
      value: "articles",
      label: "Makaleler",
      icon: FileText,
      description: "Yayınlanan makaleler ve istatistikleri",
    },
    {
      value: "users",
      label: "Kullanıcılar",
      icon: Users,
      description: "Kullanıcı listesi ve aktiviteleri",
    },
    {
      value: "comments",
      label: "Yorumlar",
      icon: MessageSquare,
      description: "Yorumlar ve moderasyon verileri",
    },
    {
      value: "analytics",
      label: "Analitik",
      icon: TrendingUp,
      description: "Site trafiği ve kullanıcı davranışları",
    },
    {
      value: "content",
      label: "İçerik",
      icon: FileText,
      description: "Content Studio içerikleri",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
            Rapor Türü
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setReportConfig({ ...reportConfig, type: type.value as any })}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-200 text-left hover-lift",
                    reportConfig.type === type.value
                      ? "border-design-light bg-green-50 dark:bg-green-900/10"
                      : "border-[#E7E7E7] dark:border-[#062F28] bg-white dark:bg-[#0a3d35]"
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-5 w-5 text-design-light" />
                    <p className="font-semibold text-sm text-design-dark dark:text-white">
                      {type.label}
                    </p>
                  </div>
                  <p className="text-xs text-design-gray dark:text-gray-400">{type.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Export Settings */}
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-design-light" />
            Dışa Aktarma Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date" className="text-xs font-ui font-semibold">
                Başlangıç Tarihi
              </Label>
              <input
                id="start_date"
                type="date"
                value={reportConfig.dateRange.start}
                onChange={(e) =>
                  setReportConfig({
                    ...reportConfig,
                    dateRange: { ...reportConfig.dateRange, start: e.target.value },
                  })
                }
                className="w-full mt-1 px-4 py-2 rounded-lg border border-[#E7E7E7] dark:border-[#062F28] bg-white dark:bg-[#0a3d35] text-sm font-ui"
              />
            </div>
            <div>
              <Label htmlFor="end_date" className="text-xs font-ui font-semibold">
                Bitiş Tarihi
              </Label>
              <input
                id="end_date"
                type="date"
                value={reportConfig.dateRange.end}
                onChange={(e) =>
                  setReportConfig({
                    ...reportConfig,
                    dateRange: { ...reportConfig.dateRange, end: e.target.value },
                  })
                }
                className="w-full mt-1 px-4 py-2 rounded-lg border border-[#E7E7E7] dark:border-[#062F28] bg-white dark:bg-[#0a3d35] text-sm font-ui"
              />
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <Label className="text-xs font-ui font-semibold mb-2 block">Dışa Aktarma Formatı</Label>
            <div className="flex gap-4">
              <button
                onClick={() => setReportConfig({ ...reportConfig, format: "csv" })}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200",
                  reportConfig.format === "csv"
                    ? "border-design-light bg-green-50 dark:bg-green-900/10"
                    : "border-[#E7E7E7] dark:border-[#062F28] bg-white dark:bg-[#0a3d35]"
                )}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="text-sm font-ui">CSV</span>
              </button>
              <button
                onClick={() => setReportConfig({ ...reportConfig, format: "json" })}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200",
                  reportConfig.format === "json"
                    ? "border-design-light bg-green-50 dark:bg-green-900/10"
                    : "border-[#E7E7E7] dark:border-[#062F28] bg-white dark:bg-[#0a3d35]"
                )}
              >
                <FileJson className="h-4 w-4" />
                <span className="text-sm font-ui">JSON</span>
              </button>
              <button
                onClick={() => setReportConfig({ ...reportConfig, format: "excel" })}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200",
                  reportConfig.format === "excel"
                    ? "border-design-light bg-green-50 dark:bg-green-900/10"
                    : "border-[#E7E7E7] dark:border-[#062F28] bg-white dark:bg-[#0a3d35]"
                )}
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="text-sm font-ui">Excel</span>
              </button>
            </div>
          </div>

          {/* Export Button */}
          <div className="pt-4">
            <Button
              onClick={handleExport}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover-scale micro-bounce rounded-xl w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {loading ? "Rapor Oluşturuluyor..." : "Raporu Dışa Aktar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

