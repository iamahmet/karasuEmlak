"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  Download,
  Upload,
  Database,
  FileText,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@karasu/ui";

interface Backup {
  id: string;
  name: string;
  type: "full" | "database" | "files" | "settings";
  size: number;
  created_at: string;
  status: "completed" | "failed" | "in_progress";
}

export function BackupRestore() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings/backups");
      const data = await response.json();
      
      if (data.success) {
        setBackups(data.backups || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch backups:", error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (type: Backup["type"]) => {
    setCreatingBackup(true);
    try {
      const response = await fetch("/api/settings/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Yedekleme başarısız");
      }

      toast.success(`${getBackupTypeLabel(type)} yedeği oluşturuldu`);
      fetchBackups();
    } catch (error: any) {
      toast.error(error.message || "Yedekleme başarısız");
    } finally {
      setCreatingBackup(false);
    }
  };

  const downloadBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/settings/backups/${backupId}/download`);
      
      if (!response.ok) {
        throw new Error("İndirme başarısız");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${backupId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Yedek indirildi");
    } catch (error: any) {
      toast.error(error.message || "İndirme başarısız");
    }
  };

  const restoreBackup = async (backupId: string) => {
    if (!confirm("Bu yedeği geri yüklemek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      return;
    }

    try {
      const response = await fetch(`/api/settings/backups/${backupId}/restore`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Geri yükleme başarısız");
      }

      toast.success("Yedek başarıyla geri yüklendi");
    } catch (error: any) {
      toast.error(error.message || "Geri yükleme başarısız");
    }
  };

  const getBackupTypeLabel = (type: Backup["type"]) => {
    switch (type) {
      case "full":
        return "Tam";
      case "database":
        return "Veritabanı";
      case "files":
        return "Dosyalar";
      case "settings":
        return "Ayarlar";
    }
  };

  const getBackupTypeIcon = (type: Backup["type"]) => {
    switch (type) {
      case "full":
        return <Database className="h-4 w-4" />;
      case "database":
        return <Database className="h-4 w-4" />;
      case "files":
        return <FileText className="h-4 w-4" />;
      case "settings":
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Card className="card-professional">
      <CardHeader className="pb-4 px-5 pt-5">
        <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
          <Database className="h-5 w-5 text-design-light" />
          Yedekleme ve Geri Yükleme
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-6">
        {/* Create Backup */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-design-dark dark:text-white font-ui">
            Yeni Yedek Oluştur
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(["full", "database", "files", "settings"] as Backup["type"][]).map((type) => (
              <Button
                key={type}
                variant="outline"
                onClick={() => createBackup(type)}
                disabled={creatingBackup}
                className="h-auto py-3 flex flex-col items-center gap-2"
              >
                {creatingBackup ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  getBackupTypeIcon(type)
                )}
                <span className="text-xs font-ui">{getBackupTypeLabel(type)}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Backup List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-design-dark dark:text-white font-ui">
              Mevcut Yedekler
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBackups}
              disabled={loading}
              className="h-8 px-3 text-xs"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Yenile"
              )}
            </Button>
          </div>

          {backups.length === 0 ? (
            <div className="text-center py-8 text-design-gray dark:text-gray-400">
              <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-ui">Henüz yedek bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-2">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28] hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getBackupTypeIcon(backup.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-design-dark dark:text-white truncate font-ui">
                          {backup.name}
                        </p>
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                          {getBackupTypeLabel(backup.type)}
                        </Badge>
                        {backup.status === "completed" && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                        {backup.status === "failed" && (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-design-gray dark:text-gray-400 font-ui">
                        <span>{formatFileSize(backup.size)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(backup.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadBackup(backup.id)}
                      className="h-8 px-3 text-xs gap-1"
                    >
                      <Download className="h-3.5 w-3.5" />
                      İndir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreBackup(backup.id)}
                      disabled={backup.status !== "completed"}
                      className="h-8 px-3 text-xs gap-1"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Geri Yükle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

