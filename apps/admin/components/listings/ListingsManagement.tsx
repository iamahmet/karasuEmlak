"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Checkbox } from "@karasu/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karasu/ui";
import {
  Home,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Loader2,
  ExternalLink,
  Grid3x3,
  List,
  Filter,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
  Building2,
  RefreshCw,
  Download,
  Upload,
  MoreVertical,
  Copy,
  Archive,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { LoadingState } from "../ui/LoadingState";
import { EmptyState } from "../empty-states/EmptyState";
import { cn } from "@karasu/lib";
import { formatCurrency, formatNumber } from "@karasu/lib/utils";

interface Listing {
  id: string;
  title: string;
  slug: string;
  status: "satilik" | "kiralik";
  property_type: string;
  location_neighborhood: string;
  price_amount: number | null;
  price_currency: string;
  published: boolean;
  featured: boolean;
  available: boolean;
  created_at: string;
  updated_at: string;
}

type ViewMode = "table" | "grid";
type SortField = "title" | "price" | "created_at" | "updated_at";
type SortOrder = "asc" | "desc";

export function ListingsManagement({ locale }: { locale: string }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetchListings();
  }, [statusFilter, propertyTypeFilter, publishedFilter]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (propertyTypeFilter !== "all")
        params.append("property_type", propertyTypeFilter);
      if (publishedFilter !== "all")
        params.append("published", publishedFilter);
      if (searchQuery) params.append("search", searchQuery);

      // Use retry mechanism for API calls
      const { fetchWithRetry } = await import("@/lib/utils/api-client");
      const data = await fetchWithRetry(`/api/listings?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!data.success) {
        // If table doesn't exist, show empty state
        if (data.code === "TABLE_NOT_FOUND" || data.code === "INTERNAL_ERROR") {
          setListings([]);
          return;
        }
        throw new Error(data.error || "İlanlar yüklenemedi");
      }

      setListings((data as any).data?.listings || (data as any).listings || []);
    } catch (error: any) {
      // Listings fetch failed, show user-friendly error
      const { handleApiError } = await import("@/lib/utils/api-client");
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.userFriendly);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchListings();
  };

  const handleTogglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentStatus }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Güncelleme başarısız");
      }

      toast.success(
        currentStatus ? "İlan yayından kaldırıldı" : "İlan yayınlandı"
      );
      fetchListings();
    } catch (error: any) {
      toast.error(error.message || "Güncelleme başarısız");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Silme başarısız");
      }

      toast.success("İlan silindi");
      fetchListings();
    } catch (error: any) {
      toast.error(error.message || "Silme başarısız");
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.length === 0) {
      toast.error("Lütfen en az bir ilan seçin");
      return;
    }

    const confirmMessages: Record<string, string> = {
      publish: `${selectedIds.length} ilanı yayınlamak istediğinize emin misiniz?`,
      unpublish: `${selectedIds.length} ilanı yayından kaldırmak istediğinize emin misiniz?`,
      delete: `${selectedIds.length} ilanı silmek istediğinize emin misiniz?`,
      feature: `${selectedIds.length} ilanı öne çıkarmak istediğinize emin misiniz?`,
      unfeature: `${selectedIds.length} ilanın öne çıkarma durumunu kaldırmak istediğinize emin misiniz?`,
    };

    if (confirmMessages[action] && !confirm(confirmMessages[action])) {
      return;
    }

    setBulkLoading(true);
    try {
      const response = await fetch("/api/listings/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: selectedIds }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Toplu işlem başarısız");
      }

      toast.success(`${selectedIds.length} ilan için işlem tamamlandı`);
      setSelectedIds([]);
      fetchListings();
    } catch (error: any) {
      toast.error(error.message || "Toplu işlem başarısız");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredListings.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = listings.length;
    const published = listings.filter(l => l.published).length;
    const drafts = listings.filter(l => !l.published).length;
    const featured = listings.filter(l => l.featured).length;
    const satilik = listings.filter(l => l.status === "satilik").length;
    const kiralik = listings.filter(l => l.status === "kiralik").length;
    const totalValue = listings.reduce((sum, l) => sum + (l.price_amount || 0), 0);
    
    return {
      total,
      published,
      drafts,
      featured,
      satilik,
      kiralik,
      totalValue,
    };
  }, [listings]);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let filtered = listings.filter((listing) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          listing.title.toLowerCase().includes(query) ||
          listing.location_neighborhood.toLowerCase().includes(query) ||
          listing.slug.toLowerCase().includes(query)
        );
      }
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "price":
          aValue = a.price_amount || 0;
          bValue = b.price_amount || 0;
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case "updated_at":
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [listings, searchQuery, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary" />
    );
  };

  const propertyTypeLabels: Record<string, string> = {
    daire: "Daire",
    villa: "Villa",
    ev: "Ev",
    yazlik: "Yazlık",
    arsa: "Arsa",
    isyeri: "İşyeri",
    dukkan: "Dükkan",
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam İlan</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.total}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <Home className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Yayında</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.published}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.drafts} taslak</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-yellow-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Öne Çıkan</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stats.featured}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Toplam Değer</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {formatCurrency(stats.totalValue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.satilik} satılık, {stats.kiralik} kiralık
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className={cn("transition-all duration-300", !showFilters && "border-dashed")}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filtreler ve Arama</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setPropertyTypeFilter("all");
                setPublishedFilter("all");
                fetchListings();
              }}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Temizle
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Gizle" : "Göster"}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Arama</label>
              <div className="flex gap-2">
                <Input
                  placeholder="İlan başlığı veya mahalle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Durum</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="satilik">Satılık</SelectItem>
                  <SelectItem value="kiralik">Kiralık</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Emlak Tipi
              </label>
              <Select
                value={propertyTypeFilter}
                onValueChange={setPropertyTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {Object.entries(propertyTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Yayın Durumu
              </label>
              <Select
                value={publishedFilter}
                onValueChange={setPublishedFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="true">Yayında</SelectItem>
                  <SelectItem value="false">Taslak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        )}
      </Card>

      {/* Listings Table/Grid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>
              İlanlar ({filteredListings.length})
            </CardTitle>
            {selectedIds.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                {selectedIds.length} seçili
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchListings}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Yenile
            </Button>
            <Link href="/listings/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Yeni İlan
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState variant="skeleton" skeletonCount={5} message="İlanlar yükleniyor..." />
          ) : filteredListings.length === 0 ? (
            <EmptyState
              icon={Home}
              title="Henüz ilan bulunmuyor"
              description="İlk ilanınızı oluşturmak için yukarıdaki 'Yeni İlan' butonuna tıklayın."
              variant="compact"
            />
          ) : (
            <div className="overflow-x-auto">
              {/* Bulk Actions Bar */}
              {selectedIds.length > 0 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="default" className="gap-2">
                      <span>{selectedIds.length}</span>
                      <span>ilan seçildi</span>
                    </Badge>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleBulkAction("publish")}
                        disabled={bulkLoading}
                        className="gap-2"
                      >
                        {bulkLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        Yayınla
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("unpublish")}
                        disabled={bulkLoading}
                        className="gap-2"
                      >
                        {bulkLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        Yayından Kaldır
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("feature")}
                        disabled={bulkLoading}
                        className="gap-2"
                      >
                        {bulkLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                        Öne Çıkar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("delete")}
                        disabled={bulkLoading}
                        className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        {bulkLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Sil
                      </Button>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedIds([])}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Temizle
                  </Button>
                </div>
              )}

              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={
                          filteredListings.length > 0 &&
                          selectedIds.length === filteredListings.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4">
                      <button
                        onClick={() => handleSort("title")}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        Başlık
                        <SortIcon field="title" />
                      </button>
                    </th>
                    <th className="text-left p-4">Durum</th>
                    <th className="text-left p-4">Tip</th>
                    <th className="text-left p-4">Mahalle</th>
                    <th className="text-left p-4">
                      <button
                        onClick={() => handleSort("price")}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        Fiyat
                        <SortIcon field="price" />
                      </button>
                    </th>
                    <th className="text-left p-4">Yayın</th>
                    <th className="text-left p-4">
                      <button
                        onClick={() => handleSort("updated_at")}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        Güncelleme
                        <SortIcon field="updated_at" />
                      </button>
                    </th>
                    <th className="text-right p-4">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.map((listing) => (
                    <tr key={listing.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedIds.includes(listing.id)}
                          onCheckedChange={(checked) =>
                            handleSelectItem(listing.id, checked as boolean)
                          }
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-foreground">{listing.title}</div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <span>/ilan/{listing.slug}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={() => {
                              navigator.clipboard.writeText(`/ilan/${listing.slug}`);
                              toast.success("URL kopyalandı");
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            listing.status === "satilik"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {listing.status === "satilik" ? "Satılık" : "Kiralık"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {propertyTypeLabels[listing.property_type] ||
                          listing.property_type}
                      </td>
                      <td className="p-4">{listing.location_neighborhood}</td>
                      <td className="p-4">
                        {listing.price_amount
                          ? `${new Intl.NumberFormat("tr-TR").format(
                              listing.price_amount
                            )} ${listing.price_currency}`
                          : "-"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {listing.published ? (
                            <Badge variant="default" className="bg-green-500">
                              <Eye className="h-3 w-3 mr-1" />
                              Yayında
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Taslak
                            </Badge>
                          )}
                          {listing.featured && (
                            <Badge variant="outline">Öne Çıkan</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleTogglePublished(
                                listing.id,
                                listing.published
                              )
                            }
                            title={
                              listing.published
                                ? "Yayından Kaldır"
                                : "Yayınla"
                            }
                            className="h-8 w-8"
                          >
                            {listing.published ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Link href={`/listings/${listing.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Düzenle"
                              className="h-8 w-8"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link
                            href={`/ilan/${listing.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              title="Sitede Görüntüle"
                              className="h-8 w-8"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(listing.id)}
                            title="Sil"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


