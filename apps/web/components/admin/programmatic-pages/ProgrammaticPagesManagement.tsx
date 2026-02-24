"use client";

import { useState, useEffect } from "react";
import { Button } from "@karasu/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@karasu/ui";
import { Calendar, Clock, Cloud, Briefcase, User, RefreshCw, Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface ProgrammaticPage {
  id: string;
  slug: string;
  type: string;
  title: string;
  description?: string;
  is_active: boolean;
  update_frequency: number;
  last_updated: string;
  created_at: string;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  prayer_times: Clock,
  imsakiye: Calendar,
  iftar: Calendar,
  weather: Cloud,
  jobs: Briefcase,
  obituary: User,
};

const TYPE_LABELS: Record<string, string> = {
  prayer_times: "Namaz Vakitleri",
  imsakiye: "İmsakiye",
  iftar: "İftar Vakitleri",
  weather: "Hava Durumu",
  jobs: "İş İlanları",
  obituary: "Vefat İlanları",
};

export function ProgrammaticPagesManagement({ locale }: { locale: string }) {
  const [pages, setPages] = useState<ProgrammaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPages = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/admin/programmatic-pages");
      const result = await response.json();

      if (result.success) {
        const pagesData = result.data?.pages || result.data || [];
        setPages(Array.isArray(pagesData) ? pagesData : []);
      } else {
        toast.error("Sayfalar yüklenirken bir hata oluştu");
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      toast.error("Sayfalar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleRefresh = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/programmatic-pages/${id}/refresh`, {
        method: "POST",
      });
      const result = await response.json();

      if (result.success) {
        toast.success(result.data?.message || "Sayfa güncellendi");
        await fetchPages();
        return;
      }

      toast.error(result.message || result.error?.message || "Güncelleme başarısız");
    } catch (_error) {
      toast.error("Güncelleme başarısız");
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/programmatic-pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Sayfa ${!currentStatus ? "aktif" : "pasif"} edildi`);
        await fetchPages();
      } else {
        toast.error("İşlem başarısız");
      }
    } catch (error) {
      toast.error("İşlem başarısız");
    }
  };

  const formatUpdateFrequency = (minutes: number) => {
    if (minutes < 60) return `${minutes} dakika`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} saat`;
    return `${Math.floor(minutes / 1440)} gün`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sayfa</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Sayfa</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pages.filter((p) => p.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pasif Sayfa</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pages.filter((p) => !p.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Son Güncelleme</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {pages.length > 0
                ? formatDate(pages.sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime())[0].last_updated)
                : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pages Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Programatik Sayfalar</CardTitle>
              <CardDescription>Dinamik içerik sayfalarını yönetin</CardDescription>
            </div>
            <Button onClick={fetchPages} disabled={refreshing} variant="outline" size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Yenile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sayfa</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Güncelleme Sıklığı</TableHead>
                <TableHead>Son Güncelleme</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Henüz programatik sayfa yok
                  </TableCell>
                </TableRow>
              ) : (
                pages.map((page) => {
                  const Icon = TYPE_ICONS[page.type] || Calendar;
                  return (
                    <TableRow key={page.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{page.title}</div>
                            <div className="text-sm text-muted-foreground">/{page.slug}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{TYPE_LABELS[page.type] || page.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={page.is_active ? "default" : "secondary"}>
                          {page.is_active ? "Aktif" : "Pasif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatUpdateFrequency(page.update_frequency)}</TableCell>
                      <TableCell className="text-sm">{formatDate(page.last_updated)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRefresh(page.id)}
                            title="Manuel Güncelle"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(page.id, page.is_active)}
                            title={page.is_active ? "Pasif Et" : "Aktif Et"}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/${locale}/${page.slug}`, "_blank")}
                            title="Önizle"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
