"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@karasu/ui";
import { History, Clock, User, Eye, RotateCcw } from "lucide-react";
import { createClient } from "@karasu/lib/supabase/client";
import { formatDateTime } from "@karasu/ui";
import { cn } from "@karasu/lib";

interface ContentHistoryProps {
  contentItemId: string;
  locale: string;
  className?: string;
}

interface Version {
  id: string;
  version_number: number;
  title: string;
  content: string;
  excerpt?: string;
  meta_description?: string;
  created_by?: string;
  created_at: string;
  user?: {
    email?: string;
    name?: string;
  };
}

export function ContentHistory({ contentItemId, locale, className }: ContentHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, [contentItemId, locale]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("content_versions")
        .select("*")
        .eq("content_item_id", contentItemId)
        .eq("locale", locale)
        .order("version_number", { ascending: false });

      if (error) {
        console.error("Failed to fetch versions:", error);
        return;
      }

      // Note: User info would need to be fetched from a profiles table or similar
      // For now, we'll just use the versions as-is
      const versionsWithUsers = (data || []).map((version: any) => ({
        ...version,
        user: version.created_by ? { email: "User" } : undefined,
      }));

      setVersions(versionsWithUsers);
    } catch (error) {
      console.error("Failed to fetch versions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version: Version) => {
    if (!confirm(`Bu versiyonu geri yüklemek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/content-studio/${contentItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          title: version.title,
          content: version.content,
          excerpt: version.excerpt,
          meta_description: version.meta_description,
        }),
      });

      if (response.ok) {
        alert("Versiyon geri yüklendi!");
        window.location.reload();
      } else {
        throw new Error("Restore failed");
      }
    } catch (error) {
      console.error("Failed to restore version:", error);
      alert("Geri yükleme başarısız oldu");
    }
  };

  if (loading) {
    return (
      <Card className={cn("card-professional", className)}>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 skeleton-professional rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-professional", className)}>
      <CardHeader className="pb-4 px-5 pt-5">
        <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
          <History className="h-5 w-5 text-design-light" />
          Versiyon Geçmişi
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {versions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#E7E7E7] to-[#E7E7E7]/80 dark:from-[#062F28] dark:to-[#062F28]/80 flex items-center justify-center shadow-lg">
              <History className="h-8 w-8 text-design-gray dark:text-gray-400" />
            </div>
            <p className="text-sm text-design-gray dark:text-gray-400 font-ui font-medium">
              Henüz versiyon geçmişi yok
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-300 hover-lift",
                  index === 0
                    ? "border-design-light bg-gradient-to-r from-design-light/10 to-transparent"
                    : "border-[#E7E7E7] dark:border-[#062F28] bg-white dark:bg-[#0a3d35]"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-design-light/20 to-design-light/10">
                      <Clock className="h-4 w-4 text-design-dark dark:text-design-light" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-display font-bold text-design-dark dark:text-white">
                          Versiyon {version.version_number}
                        </span>
                        {index === 0 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-2 py-0.5 bg-design-light/15 text-design-dark dark:text-design-light border-design-light/30 font-ui font-semibold"
                          >
                            Güncel
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-design-gray dark:text-gray-400 font-ui mt-0.5">
                        {formatDateTime(version.created_at)}
                      </p>
                    </div>
                  </div>
                  {version.user && (
                    <div className="flex items-center gap-1.5 text-xs text-design-gray dark:text-gray-400 font-ui">
                      <User className="h-3.5 w-3.5" />
                      <span>{version.user.email || "Bilinmeyen"}</span>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <p className="text-sm font-ui font-semibold text-design-dark dark:text-white line-clamp-1 mb-1">
                    {version.title}
                  </p>
                  {version.excerpt && (
                    <p className="text-xs text-design-gray dark:text-gray-400 font-ui line-clamp-2">
                      {version.excerpt}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedVersion(version);
                      setIsPreviewOpen(true);
                    }}
                    className="h-8 px-3 text-xs border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui hover-scale"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Önizle
                  </Button>
                  {index > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(version)}
                      className="h-8 px-3 text-xs border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui hover-scale"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                      Geri Yükle
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Version Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-modern">
            <DialogHeader>
              <DialogTitle className="text-lg font-display font-bold text-design-dark dark:text-white">
                Versiyon {selectedVersion?.version_number} Önizleme
              </DialogTitle>
            </DialogHeader>
            {selectedVersion && (
              <div className="space-y-4 mt-4">
                <div>
                  <h3 className="text-sm font-ui font-semibold text-design-gray dark:text-gray-400 mb-2">
                    Başlık
                  </h3>
                  <p className="text-base font-ui text-design-dark dark:text-white">
                    {selectedVersion.title}
                  </p>
                </div>
                {selectedVersion.excerpt && (
                  <div>
                    <h3 className="text-sm font-ui font-semibold text-design-gray dark:text-gray-400 mb-2">
                      Özet
                    </h3>
                    <p className="text-sm font-ui text-design-dark dark:text-white">
                      {selectedVersion.excerpt}
                    </p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-ui font-semibold text-design-gray dark:text-gray-400 mb-2">
                    İçerik
                  </h3>
                  <div
                    className="prose prose-sm prose-slate dark:prose-invert max-w-none
                      prose-headings:font-bold prose-headings:tracking-tight
                      prose-p:leading-relaxed prose-p:mb-4
                      prose-a:text-design-dark dark:prose-a:text-design-light
                      prose-strong:font-semibold
                      prose-ul:my-4 prose-ol:my-4
                      prose-li:my-1"
                    dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
                  />
                </div>
                {selectedVersion.meta_description && (
                  <div>
                    <h3 className="text-sm font-ui font-semibold text-design-gray dark:text-gray-400 mb-2">
                      Meta Açıklama
                    </h3>
                    <p className="text-sm font-ui text-design-dark dark:text-white">
                      {selectedVersion.meta_description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

