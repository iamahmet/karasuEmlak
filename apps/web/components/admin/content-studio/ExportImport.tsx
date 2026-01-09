"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { Download, Upload, FileText, FileJson, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface ExportImportProps {
  contentItems: any[];
  onImport?: (items: any[]) => void;
  className?: string;
}

export function ExportImport({ contentItems, onImport, className }: ExportImportProps) {
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "excel">("json");
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    let content = "";
    let filename = "";
    let mimeType = "";

    switch (exportFormat) {
      case "json":
        content = JSON.stringify(contentItems, null, 2);
        filename = `content-export-${Date.now()}.json`;
        mimeType = "application/json";
        break;
      case "csv":
        if (contentItems.length === 0) {
          toast.error("Dışa aktarılacak içerik yok");
          return;
        }
        const headers = Object.keys(contentItems[0]).join(",");
        const rows = contentItems.map((item) =>
          Object.values(item)
            .map((val) => `"${String(val).replace(/"/g, '""')}"`)
            .join(",")
        );
        content = [headers, ...rows].join("\n");
        filename = `content-export-${Date.now()}.csv`;
        mimeType = "text/csv";
        break;
      case "excel":
        // For Excel, we'll export as CSV (can be opened in Excel)
        if (contentItems.length === 0) {
          toast.error("Dışa aktarılacak içerik yok");
          return;
        }
        const excelHeaders = Object.keys(contentItems[0]).join("\t");
        const excelRows = contentItems.map((item) =>
          Object.values(item)
            .map((val) => String(val).replace(/\t/g, " "))
            .join("\t")
        );
        content = [excelHeaders, ...excelRows].join("\n");
        filename = `content-export-${Date.now()}.xls`;
        mimeType = "application/vnd.ms-excel";
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`${contentItems.length} içerik dışa aktarıldı`);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      let items: any[] = [];

      if (file.name.endsWith(".json")) {
        items = JSON.parse(text);
      } else if (file.name.endsWith(".csv")) {
        const lines = text.split("\n");
        const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, ""));
        items = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.replace(/^"|"$/g, "").replace(/""/g, '"'));
          const item: any = {};
          headers.forEach((header, index) => {
            item[header] = values[index] || "";
          });
          return item;
        });
      } else {
        throw new Error("Desteklenmeyen dosya formatı");
      }

      if (onImport) {
        onImport(items);
      }

      toast.success(`${items.length} içerik içe aktarıldı`);
    } catch (error: any) {
      toast.error(error.message || "İçe aktarma başarısız");
    } finally {
      setImporting(false);
      // Reset input
      event.target.value = "";
    }
  };

  const Icon =
    exportFormat === "json"
      ? FileJson
      : exportFormat === "csv"
      ? FileText
      : FileSpreadsheet;

  return (
    <Card className={cn("card-professional", className)}>
      <CardHeader className="pb-4 px-5 pt-5">
        <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
          Dışa/İçe Aktarma
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-4">
        {/* Export */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Download className="h-4 w-4 text-design-light" />
            <span className="text-sm font-ui font-semibold text-design-dark dark:text-white">
              Dışa Aktar
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as any)}>
              <SelectTrigger className="h-10 w-32 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-xl font-ui">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="json" className="text-sm font-ui flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  JSON
                </SelectItem>
                <SelectItem value="csv" className="text-sm font-ui flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CSV
                </SelectItem>
                <SelectItem value="excel" className="text-sm font-ui flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleExport}
              disabled={contentItems.length === 0}
              className="flex-1 h-10 bg-gradient-to-r from-design-dark to-design-dark/90 hover:from-design-dark/95 hover:to-design-dark/90 text-white rounded-xl font-ui hover-scale micro-bounce shadow-lg"
            >
              <Icon className="h-4 w-4 mr-2" />
              Dışa Aktar ({contentItems.length})
            </Button>
          </div>
        </div>

        {/* Import */}
        <div className="space-y-3 pt-4 border-t border-[#E7E7E7] dark:border-[#062F28]">
          <div className="flex items-center gap-2 mb-2">
            <Upload className="h-4 w-4 text-design-light" />
            <span className="text-sm font-ui font-semibold text-design-dark dark:text-white">
              İçe Aktar
            </span>
          </div>
          <label className="block">
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
            />
            <Button
              variant="outline"
              disabled={importing}
              className="w-full h-10 border border-[#E7E7E7] dark:border-[#062F28] rounded-xl font-ui hover-scale"
              asChild
            >
              <span className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {importing ? "Yükleniyor..." : "Dosya Seç (JSON/CSV)"}
              </span>
            </Button>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}

