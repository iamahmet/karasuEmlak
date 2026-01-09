"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { Download, Upload, FileText, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ContentExportImportProps {
  locale: string;
}

export function ContentExportImport({ locale }: ContentExportImportProps) {
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "excel">("json");
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFormat, setImportFormat] = useState<"json" | "csv">("json");
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    try {
      setExportStatus("exporting");
      const response = await fetch(`/api/content-studio/export?format=${exportFormat}&locale=${locale}`);

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `content-export-${new Date().toISOString().split("T")[0]}.${exportFormat === "excel" ? "json" : exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("İçerik başarıyla dışa aktarıldı");
      setExportStatus(null);
    } catch (error: any) {
      toast.error(error.message || "Dışa aktarma başarısız");
      setExportStatus(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Lütfen bir dosya seçin");
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("format", importFormat);

      const response = await fetch("/api/content-studio/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Import failed");
      }

      toast.success(`İçe aktarma tamamlandı: ${data.results.success} başarılı, ${data.results.failed} başarısız`);
      setImportFile(null);
      
      // Refresh the page or trigger a refetch
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "İçe aktarma başarısız");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Export */}
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Download className="h-5 w-5 text-design-light" />
            İçerik Dışa Aktar
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          <div>
            <Label htmlFor="export-format" className="text-xs font-ui font-semibold mb-2 block">
              Format Seç
            </Label>
            <Select value={exportFormat} onValueChange={(value: "json" | "csv" | "excel") => setExportFormat(value)}>
              <SelectTrigger className="w-full px-4 py-2 rounded-lg border border-[#E7E7E7] dark:border-[#062F28] bg-white dark:bg-[#0a3d35] text-sm font-ui">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel (JSON)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleExport}
            disabled={exportStatus === "exporting"}
            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover-scale micro-bounce rounded-xl"
          >
            {exportStatus === "exporting" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Dışa Aktarılıyor...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Dışa Aktar
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Import */}
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-design-light" />
            İçerik İçe Aktar
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          <div>
            <Label htmlFor="import-format" className="text-xs font-ui font-semibold mb-2 block">
              Format Seç
            </Label>
            <Select value={importFormat} onValueChange={(value: "json" | "csv") => setImportFormat(value)}>
              <SelectTrigger className="w-full px-4 py-2 rounded-lg border border-[#E7E7E7] dark:border-[#062F28] bg-white dark:bg-[#0a3d35] text-sm font-ui">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="import-file" className="text-xs font-ui font-semibold mb-2 block">
              Dosya Seç
            </Label>
            <Input
              id="import-file"
              type="file"
              accept={importFormat === "json" ? ".json" : ".csv"}
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="input-modern"
            />
          </div>
          <Button
            onClick={handleImport}
            disabled={!importFile || importing}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl hover-scale micro-bounce rounded-xl"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                İçe Aktarılıyor...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                İçe Aktar
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

