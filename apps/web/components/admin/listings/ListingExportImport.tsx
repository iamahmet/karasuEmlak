"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  FileJson,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface ListingExportImportProps {
  listing: any;
  onImport?: (data: any) => void;
  className?: string;
}

export function ListingExportImport({ listing, onImport, className }: ListingExportImportProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const exportToJSON = async () => {
    setExporting("json");
    try {
      const data = {
        ...listing,
        exported_at: new Date().toISOString(),
        version: "1.0",
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ilan-${listing.slug || listing.id}-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success("JSON olarak dışa aktarıldı");
    } catch (error) {
      toast.error("Dışa aktarma başarısız");
    } finally {
      setExporting(null);
    }
  };

  const exportToCSV = async () => {
    setExporting("csv");
    try {
      const csv = [
        ["Alan", "Değer"],
        ["Başlık", listing.title],
        ["Slug", listing.slug],
        ["Durum", listing.status],
        ["Emlak Tipi", listing.property_type],
        ["Mahalle", listing.location_neighborhood],
        ["Adres", listing.location_address || ""],
        ["Fiyat", listing.price_amount || ""],
        ["Para Birimi", listing.price_currency],
        ["Alan (m²)", listing.area_sqm || ""],
        ["Oda Sayısı", listing.room_count || ""],
        ["Kat", listing.floor || ""],
        ["Bina Yaşı", listing.building_age || ""],
        ["Yayınlandı", listing.published ? "Evet" : "Hayır"],
        ["Öne Çıkan", listing.featured ? "Evet" : "Hayır"],
        ["Müsait", listing.available ? "Evet" : "Hayır"],
      ].map(row => row.join(",")).join("\n");
      
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ilan-${listing.slug || listing.id}-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success("CSV olarak dışa aktarıldı");
    } catch (error) {
      toast.error("Dışa aktarma başarısız");
    } finally {
      setExporting(null);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      let data;

      if (file.name.endsWith(".json")) {
        data = JSON.parse(text);
      } else if (file.name.endsWith(".csv")) {
        // Simple CSV parser
        const lines = text.split("\n");
        data = {} as Record<string, any>;
        for (let i = 1; i < lines.length; i++) {
          const [key, value] = lines[i].split(",");
          if (key && value) {
            data[key.trim()] = value.trim();
          }
        }
      } else {
        throw new Error("Desteklenmeyen dosya formatı");
      }

      onImport?.(data);
      toast.success("İlan içe aktarıldı");
    } catch (error: any) {
      toast.error(error.message || "İçe aktarma başarısız");
    } finally {
      setImporting(false);
      // Reset input
      event.target.value = "";
    }
  };

  return (
    <Card className={cn("card-professional", className)}>
      <CardHeader>
        <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
          <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Dışa/İçe Aktarma
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Section */}
        <div>
          <h4 className="text-sm font-semibold text-design-dark dark:text-white mb-3">
            Dışa Aktar
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={exportToJSON}
              disabled={exporting !== null}
              className="h-10 text-xs"
            >
              {exporting === "json" ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Aktarılıyor...
                </>
              ) : (
                <>
                  <FileJson className="h-3 w-3 mr-1" />
                  JSON
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={exportToCSV}
              disabled={exporting !== null}
              className="h-10 text-xs"
            >
              {exporting === "csv" ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Aktarılıyor...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-3 w-3 mr-1" />
                  CSV
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled
              className="h-10 text-xs opacity-50"
              title="Yakında eklenecek"
            >
              <FileText className="h-3 w-3 mr-1" />
              Excel
              <Badge variant="outline" className="ml-1 text-[8px]">
                Yakında
              </Badge>
            </Button>
          </div>
        </div>

        {/* Import Section */}
        <div>
          <h4 className="text-sm font-semibold text-design-dark dark:text-white mb-3">
            İçe Aktar
          </h4>
          <div className="space-y-2">
            <label className="block">
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
                id="import-file"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("import-file")?.click()}
                disabled={importing}
                className="w-full h-10 text-xs"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Aktarılıyor...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3 mr-1" />
                    Dosya Seç (JSON/CSV)
                  </>
                )}
              </Button>
            </label>
            <p className="text-xs text-design-gray dark:text-gray-400">
              JSON veya CSV formatında ilan verilerini içe aktarabilirsiniz
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Not:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Dışa aktarma tüm ilan verilerini içerir</li>
                <li>İçe aktarma mevcut verileri günceller</li>
                <li>Yedekleme için düzenli olarak dışa aktarın</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
