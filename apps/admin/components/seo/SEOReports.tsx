"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import {
  FileDown,
  Calendar,
  Download,
  FileText,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

export function SEOReports({ locale }: { locale: string }) {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [generating, setGenerating] = useState(false);

  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/seo/reports");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.reports) {
          setReports(data.reports);
        }
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    }
  };

  const handleGenerateReport = async (type: "summary" | "detailed" | "technical") => {
    setGenerating(true);
    try {
      const response = await fetch("/api/seo/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          dateRange: dateRange.start && dateRange.end ? dateRange : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Rapor oluşturulamadı");
      }

      const data = await response.json();
      if (!data.success || !data.report) {
        throw new Error("Geçersiz response formatı");
      }

      toast.success(`${type === "summary" ? "Özet" : type === "detailed" ? "Detaylı" : "Teknik"} rapor oluşturuldu`);
      fetchReports(); // Refresh reports list
    } catch (error: any) {
      toast.error(error.message || "Rapor oluşturulamadı");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Range */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Rapor Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-ui font-semibold text-foreground mb-2 block">
                Başlangıç Tarihi
              </label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-ui font-semibold text-foreground mb-2 block">
                Bitiş Tarihi
              </label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card-professional hover-lift">
          <CardHeader>
            <CardTitle className="text-base font-ui">Özet Rapor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground font-ui mb-4">
              Genel SEO performans özeti ve temel metrikler
            </p>
            <Button
              onClick={() => handleGenerateReport("summary")}
              disabled={generating}
              className="w-full bg-design-light hover:bg-green-600"
            >
              <FileText className="h-4 w-4 mr-2" />
              Oluştur
            </Button>
          </CardContent>
        </Card>

        <Card className="card-professional hover-lift">
          <CardHeader>
            <CardTitle className="text-base font-ui">Detaylı Rapor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground font-ui mb-4">
              Kapsamlı SEO analizi ve önerileri içeren detaylı rapor
            </p>
            <Button
              onClick={() => handleGenerateReport("detailed")}
              disabled={generating}
              className="w-full bg-design-light hover:bg-green-600"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Oluştur
            </Button>
          </CardContent>
        </Card>

        <Card className="card-professional hover-lift">
          <CardHeader>
            <CardTitle className="text-base font-ui">Teknik SEO Raporu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground font-ui mb-4">
              Teknik SEO kontrolleri ve site sağlık raporu
            </p>
            <Button
              onClick={() => handleGenerateReport("technical")}
              disabled={generating}
              className="w-full bg-design-light hover:bg-green-600"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Oluştur
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="text-base font-ui">Son Raporlar</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Henüz rapor oluşturulmamış</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                >
                  <div>
                    <p className="font-semibold text-foreground font-ui text-sm">
                      {report.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-ui">
                      {new Date(report.created_at || report.date).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    İndir
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

