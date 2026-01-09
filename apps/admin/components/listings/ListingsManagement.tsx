"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { LoadingState } from "../ui/LoadingState";
import { EmptyState } from "../empty-states/EmptyState";

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

export function ListingsManagement({ locale }: { locale: string }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

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

  const filteredListings = listings.filter((listing) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        listing.title.toLowerCase().includes(query) ||
        listing.location_neighborhood.toLowerCase().includes(query)
      );
    }
    return true;
  });

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
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
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
      </Card>

      {/* Listings Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            İlanlar ({filteredListings.length})
          </CardTitle>
          <Link href="/listings/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni İlan
            </Button>
          </Link>
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
                <div className="mb-4 p-4 bg-muted rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      {selectedIds.length} ilan seçildi
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("publish")}
                        disabled={bulkLoading}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Yayınla
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("unpublish")}
                        disabled={bulkLoading}
                      >
                        <EyeOff className="h-4 w-4 mr-2" />
                        Yayından Kaldır
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("feature")}
                        disabled={bulkLoading}
                      >
                        Öne Çıkar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBulkAction("delete")}
                        disabled={bulkLoading}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </Button>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedIds([])}
                  >
                    Seçimi Temizle
                  </Button>
                </div>
              )}

              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 w-12">
                      <Checkbox
                        checked={
                          filteredListings.length > 0 &&
                          selectedIds.length === filteredListings.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left p-4">Başlık</th>
                    <th className="text-left p-4">Durum</th>
                    <th className="text-left p-4">Tip</th>
                    <th className="text-left p-4">Mahalle</th>
                    <th className="text-left p-4">Fiyat</th>
                    <th className="text-left p-4">Durum</th>
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
                        <div className="font-medium">{listing.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {listing.slug}
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
                        <div className="flex items-center justify-end gap-2">
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
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(listing.id)}
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <Link
                            href={`http://localhost:3000/ilan/${listing.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="icon" title="Görüntüle">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
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


