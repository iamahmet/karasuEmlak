"use client";

import { useRef } from "react";
import { Button } from "@karasu/ui";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface ImportButtonProps {
  onImport: (data: any[]) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
}

export function ImportButton({
  onImport,
  accept = ".csv,.json",
  maxSize = 10,
}: ImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Dosya boyutu ${maxSize}MB'dan küçük olmalı`);
      return;
    }

    try {
      const fileContent = await file.text();
      let data: any[] = [];

      if (file.name.endsWith(".json")) {
        data = JSON.parse(fileContent);
      } else if (file.name.endsWith(".csv")) {
        const lines = fileContent.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());
        data = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          const row: Record<string, any> = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          return row;
        });
      }

      await onImport(data);
      toast.success(`${data.length} record(s) imported successfully`);
    } catch (error: any) {
      toast.error(error.message || "Failed to import file");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="h-9 px-3 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui hover-scale"
      >
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>
    </>
  );
}

