"use client";

import { useState } from "react";
import { Button } from "@karasu/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@karasu/ui";
import { Download, FileText, FileSpreadsheet, FileJson } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps<T> {
  data: T[];
  filename?: string;
  getRowData?: (item: T) => Record<string, any>;
}

export function ExportButton<T>({
  data,
  filename = "export",
  getRowData,
}: ExportButtonProps<T>) {
  const [exporting, setExporting] = useState(false);
  

  const exportToCSV = () => {
    setExporting(true);
    try {
      if (data.length === 0) {
        toast.error("No data to export");
        return;
      }

      const rows = getRowData
        ? data.map(getRowData)
        : (data as any[]).map((item) => item);

      const headers = Object.keys(rows[0]);
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          headers
            .map((header) => {
              const value = row[header];
              return typeof value === "string" && value.includes(",")
                ? `"${value}"`
                : value;
            })
            .join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Data exported to CSV successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const exportToJSON = () => {
    setExporting(true);
    try {
      if (data.length === 0) {
        toast.error("No data to export");
        return;
      }

      const jsonData = getRowData
        ? data.map(getRowData)
        : (data as any[]).map((item) => item);

      const jsonContent = JSON.stringify(jsonData, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Data exported to JSON successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = () => {
    // For Excel export, we'll use CSV format (can be enhanced with xlsx library)
    exportToCSV();
    toast.info("Excel export uses CSV format. Install xlsx library for native Excel support.");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={exporting || data.length === 0}
          className="h-9 px-3 text-sm border border-border/40 dark:border-border/40 rounded-lg font-ui hover-scale"
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="rounded-lg z-[100] bg-card border border-border shadow-xl backdrop-blur-xl"
      >
        <DropdownMenuItem
          onClick={exportToCSV}
          className="flex items-center gap-2 cursor-pointer font-ui text-sm px-3 py-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={exportToJSON}
          className="flex items-center gap-2 cursor-pointer font-ui text-sm px-3 py-2"
        >
          <FileJson className="h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={exportToExcel}
          className="flex items-center gap-2 cursor-pointer font-ui text-sm px-3 py-2"
        >
          <FileText className="h-4 w-4" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

