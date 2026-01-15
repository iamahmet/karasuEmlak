"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@karasu/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { Switch } from "@karasu/ui";
import { Checkbox } from "@karasu/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karasu/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@karasu/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@karasu/ui";
import {
  Calendar,
  Clock,
  Cloud,
  Briefcase,
  User,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  X,
  ExternalLink,
  Loader2,
  Settings,
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";
import { LoadingState } from "../ui/LoadingState";
import { EmptyState } from "../empty-states/EmptyState";
import { getWebUrl } from "@/lib/utils/get-web-url";

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
  updated_at: string;
  views?: number;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  prayer_times: Clock,
  imsakiye: Calendar,
  iftar: Calendar,
  weather: Cloud,
  jobs: Briefcase,
  obituary: User,
  pharmacy: User,
  other: Settings,
};

const TYPE_LABELS: Record<string, string> = {
  prayer_times: "Namaz Vakitleri",
  imsakiye: "İmsakiye",
  iftar: "İftar Vakitleri",
  weather: "Hava Durumu",
  jobs: "İş İlanları",
  obituary: "Vefat İlanları",
  pharmacy: "Nöbetçi Eczane",
  other: "Diğer",
};

const TYPE_OPTIONS = [
  { value: "prayer_times", label: "Namaz Vakitleri", icon: Clock },
  { value: "imsakiye", label: "İmsakiye", icon: Calendar },
  { value: "iftar", label: "İftar Vakitleri", icon: Calendar },
  { value: "weather", label: "Hava Durumu", icon: Cloud },
  { value: "jobs", label: "İş İlanları", icon: Briefcase },
  { value: "obituary", label: "Vefat İlanları", icon: User },
  { value: "pharmacy", label: "Nöbetçi Eczane", icon: User },
  { value: "other", label: "Diğer", icon: Settings },
];

const UPDATE_FREQUENCY_OPTIONS = [
  { value: 15, label: "15 dakika" },
  { value: 30, label: "30 dakika" },
  { value: 60, label: "1 saat" },
  { value: 120, label: "2 saat" },
  { value: 240, label: "4 saat" },
  { value: 360, label: "6 saat" },
  { value: 720, label: "12 saat" },
  { value: 1440, label: "1 gün" },
  { value: 2880, label: "2 gün" },
  { value: 10080, label: "1 hafta" },
];

export function ProgrammaticPagesManagement({ locale }: { locale: string }) {
  const [pages, setPages] = useState<ProgrammaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<ProgrammaticPage | null>(null);
  const [formData, setFormData] = useState<Partial<ProgrammaticPage>>({
    slug: "",
    type: "prayer_times",
    title: "",
    description: "",
    update_frequency: 60,
    is_active: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchPages = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/admin/programmatic-pages");
      const result = await response.json();

      if (result.success) {
        // Handle both formats: { pages: [...] } or just [...]
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

  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const matchesSearch =
        !searchQuery ||
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || page.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && page.is_active) ||
        (statusFilter === "inactive" && !page.is_active);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [pages, searchQuery, typeFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: pages.length,
      active: pages.filter((p) => p.is_active).length,
      inactive: pages.filter((p) => !p.is_active).length,
      totalViews: pages.reduce((sum, p) => sum + (p.views || 0), 0),
      lastUpdated: pages.length > 0
        ? pages.sort((a, b) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime())[0].last_updated
        : null,
    };
  }, [pages]);

  const handleCreate = async () => {
    if (!formData.slug || !formData.type || !formData.title) {
      toast.error("Lütfen tüm gerekli alanları doldurun");
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch("/api/admin/programmatic-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Sayfa başarıyla oluşturuldu");
        setCreateDialogOpen(false);
        setFormData({
          slug: "",
          type: "prayer_times",
          title: "",
          description: "",
          update_frequency: 60,
          is_active: true,
        });
        await fetchPages();
      } else {
        toast.error(result.message || "Sayfa oluşturulamadı");
      }
    } catch (error: any) {
      toast.error(error.message || "Sayfa oluşturulamadı");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (page: ProgrammaticPage) => {
    setSelectedPage(page);
    setFormData({
      slug: page.slug,
      type: page.type,
      title: page.title,
      description: page.description || "",
      update_frequency: page.update_frequency,
      is_active: page.is_active,
      seo_title: page.seo_title,
      seo_description: page.seo_description,
      seo_keywords: page.seo_keywords,
      config: page.config,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedPage || !formData.slug || !formData.type || !formData.title) {
      toast.error("Lütfen tüm gerekli alanları doldurun");
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch(`/api/admin/programmatic-pages/${selectedPage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Sayfa başarıyla güncellendi");
        setEditDialogOpen(false);
        setSelectedPage(null);
        await fetchPages();
      } else {
        toast.error(result.message || "Sayfa güncellenemedi");
      }
    } catch (error: any) {
      toast.error(error.message || "Sayfa güncellenemedi");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPage) return;

    setFormLoading(true);
    try {
      const response = await fetch(`/api/admin/programmatic-pages/${selectedPage.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Sayfa başarıyla silindi");
        setDeleteDialogOpen(false);
        setSelectedPage(null);
        await fetchPages();
      } else {
        toast.error(result.message || "Sayfa silinemedi");
      }
    } catch (error: any) {
      toast.error(error.message || "Sayfa silinemedi");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRefresh = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/programmatic-pages/${id}/refresh`, {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Sayfa güncellendi");
        await fetchPages();
      } else {
        toast.error(result.message || "Güncelleme başarısız");
      }
    } catch (error: any) {
      toast.error(error.message || "Güncelleme başarısız");
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
        toast.error(result.message || "İşlem başarısız");
      }
    } catch (error: any) {
      toast.error(error.message || "İşlem başarısız");
    }
  };

  const handleBulkToggle = async (active: boolean) => {
    if (selectedIds.length === 0) {
      toast.error("Lütfen en az bir sayfa seçin");
      return;
    }

    setFormLoading(true);
    try {
      const promises = selectedIds.map((id) =>
        fetch(`/api/admin/programmatic-pages/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: active }),
        })
      );

      await Promise.all(promises);
      toast.success(`${selectedIds.length} sayfa ${active ? "aktif" : "pasif"} edildi`);
      setSelectedIds([]);
      await fetchPages();
    } catch (error: any) {
      toast.error(error.message || "Toplu işlem başarısız");
    } finally {
      setFormLoading(false);
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  if (loading) {
    return <LoadingState message="Sayfalar yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Toplam Sayfa
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Programatik sayfa
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
              Aktif Sayfa
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {stats.active}
            </div>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Yayında olan
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">
              Pasif Sayfa
            </CardTitle>
            <EyeOff className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
              {stats.inactive}
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
              Yayında olmayan
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Toplam Görüntülenme
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {stats.totalViews.toLocaleString("tr-TR")}
            </div>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              Tüm sayfalar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Programatik Sayfalar</CardTitle>
              <CardDescription>
                Dinamik içerik sayfalarını yönetin ve izleyin
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={fetchPages}
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
                Yenile
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Yeni Sayfa
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Sayfa ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tip Filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Tipler</SelectItem>
                  {TYPE_OPTIONS.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtreler
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedIds.length} sayfa seçildi
              </span>
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkToggle(true)}
                  disabled={formLoading}
                >
                  Aktif Et
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkToggle(false)}
                  disabled={formLoading}
                >
                  Pasif Et
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Pages Table */}
          {filteredPages.length === 0 ? (
            <EmptyState
              icon={Settings}
              title="Programatik sayfa bulunamadı"
              description={
                pages.length === 0
                  ? "Henüz programatik sayfa oluşturulmamış. Yeni bir sayfa oluşturmak için 'Yeni Sayfa' butonuna tıklayın."
                  : "Arama kriterlerinize uygun sayfa bulunamadı."
              }
              action={
                pages.length === 0 ? (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    İlk Sayfayı Oluştur
                  </Button>
                ) : null
              }
            />
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === filteredPages.length && filteredPages.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedIds(filteredPages.map((p) => p.id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Sayfa</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Güncelleme Sıklığı</TableHead>
                    <TableHead>Son Güncelleme</TableHead>
                    <TableHead>Görüntülenme</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPages.map((page) => {
                    const Icon = TYPE_ICONS[page.type] || Settings;
                    return (
                      <TableRow key={page.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(page.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedIds([...selectedIds, page.id]);
                              } else {
                                setSelectedIds(selectedIds.filter((id) => id !== page.id));
                              }
                            }}
                          />
                        </TableCell>
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
                          <Badge variant="outline">
                            {TYPE_LABELS[page.type] || page.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={page.is_active ? "default" : "secondary"}>
                            {page.is_active ? "Aktif" : "Pasif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatUpdateFrequency(page.update_frequency)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(page.last_updated)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {page.views?.toLocaleString("tr-TR") || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
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
                              {page.is_active ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const webUrl = getWebUrl(`/${locale}/${page.slug}`);
                                window.open(webUrl, "_blank");
                              }}
                              title="Önizle"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(page)}
                              title="Düzenle"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPage(page);
                                setDeleteDialogOpen(true);
                              }}
                              title="Sil"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Programatik Sayfa</DialogTitle>
            <DialogDescription>
              Dinamik içerik sayfası oluşturun. Sayfa otomatik olarak güncellenecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Sayfa Tipi *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  setFormData({ ...formData, type: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tip seçin" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData({
                    ...formData,
                    title,
                    slug: formData.slug || generateSlug(title),
                  });
                }}
                placeholder="Örn: Karasu Namaz Vakitleri"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="namaz-vakitleri"
              />
              <p className="text-xs text-muted-foreground">
                URL'de görünecek kısa isim (örn: /namaz-vakitleri)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Sayfa hakkında kısa açıklama..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update_frequency">Güncelleme Sıklığı (dakika) *</Label>
              <Select
                value={String(formData.update_frequency || 60)}
                onValueChange={(value) =>
                  setFormData({ ...formData, update_frequency: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UPDATE_FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Sayfa aktif olsun
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setFormData({
                  slug: "",
                  type: "prayer_times",
                  title: "",
                  description: "",
                  update_frequency: 60,
                  is_active: true,
                });
              }}
            >
              İptal
            </Button>
            <Button onClick={handleCreate} disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Oluştur
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sayfa Düzenle</DialogTitle>
            <DialogDescription>
              Programatik sayfa bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type">Sayfa Tipi *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => {
                  setFormData({ ...formData, type: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tip seçin" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-title">Başlık *</Label>
              <Input
                id="edit-title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug *</Label>
              <Input
                id="edit-slug"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Açıklama</Label>
              <Textarea
                id="edit-description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-update_frequency">Güncelleme Sıklığı (dakika) *</Label>
              <Select
                value={String(formData.update_frequency || 60)}
                onValueChange={(value) =>
                  setFormData({ ...formData, update_frequency: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UPDATE_FREQUENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="edit-is_active" className="cursor-pointer">
                Sayfa aktif olsun
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleUpdate} disabled={formLoading}>
              {formLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Güncelle
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sayfayı Sil</DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. "{selectedPage?.title}" sayfası kalıcı olarak silinecektir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
