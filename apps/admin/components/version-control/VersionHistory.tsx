"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import {
  History,
  RotateCcw,
  Eye,
  GitCompare,
  Loader2,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";

interface ContentVersion {
  id: string;
  version_number: number;
  data: Record<string, unknown>;
  created_by: string | null;
  change_note: string | null;
  is_current: boolean;
  created_at: string;
}

interface VersionHistoryProps {
  contentType: "article" | "news" | "listing" | "page";
  contentId: string;
  onRestore?: (versionNumber: number) => void;
}

export function VersionHistory({
  contentType,
  contentId,
  onRestore,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<number | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<{
    v1: number | null;
    v2: number | null;
  }>({ v1: null, v2: null });

  useEffect(() => {
    fetchVersions();
  }, [contentType, contentId]);

  const fetchVersions = async () => {
    try {
      const response = await fetch(
        `/api/content-versions?contentType=${contentType}&contentId=${contentId}`
      );
      if (!response.ok) throw new Error("Failed to fetch versions");

      const data = await response.json();
      setVersions(data.versions || []);
    } catch (error) {
      console.error("Error fetching versions:", error);
      toast.error("Versiyonlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionNumber: number) => {
    if (!confirm(`Versiyon ${versionNumber}'e geri dönmek istediğinize emin misiniz?`)) {
      return;
    }

    setRestoring(versionNumber);
    try {
      const response = await fetch("/api/content-versions/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType,
          contentId,
          versionNumber,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Geri dönme başarısız");
      }

      toast.success(`Versiyon ${versionNumber}'e geri dönüldü`);
      onRestore?.(versionNumber);
      await fetchVersions();
    } catch (error: any) {
      toast.error(error.message || "Geri dönme başarısız");
    } finally {
      setRestoring(null);
    }
  };

  const handleCompare = () => {
    if (!selectedVersions.v1 || !selectedVersions.v2) {
      toast.error("Karşılaştırmak için iki versiyon seçin");
      return;
    }

    // Navigate to compare page or open modal
    window.open(
      `/admin/version-compare?contentType=${contentType}&contentId=${contentId}&v1=${selectedVersions.v1}&v2=${selectedVersions.v2}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Versiyon Geçmişi
          </CardTitle>
          {selectedVersions.v1 && selectedVersions.v2 && (
            <Button size="sm" onClick={handleCompare} variant="outline">
              <GitCompare className="h-4 w-4 mr-2" />
              Karşılaştır
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              Henüz versiyon geçmişi yok
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <div
                key={version.id}
                className={cn(
                  "flex items-center justify-between p-4 border rounded-lg",
                  version.is_current && "bg-muted border-primary"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={version.is_current ? "default" : "outline"}
                      className="text-[10px]"
                    >
                      v{version.version_number}
                      {version.is_current && " (Mevcut)"}
                    </Badge>
                    {version.change_note && (
                      <span className="text-sm text-muted-foreground truncate">
                        {version.change_note}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(version.created_at).toLocaleString("tr-TR")}
                    </span>
                    {version.created_by && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Kullanıcı ID: {version.created_by.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {selectedVersions.v1 !== version.version_number &&
                    selectedVersions.v2 !== version.version_number && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (!selectedVersions.v1) {
                            setSelectedVersions({ ...selectedVersions, v1: version.version_number });
                          } else if (!selectedVersions.v2) {
                            setSelectedVersions({ ...selectedVersions, v2: version.version_number });
                          }
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  {!version.is_current && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestore(version.version_number)}
                      disabled={restoring === version.version_number}
                    >
                      {restoring === version.version_number ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Geri Dön
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
