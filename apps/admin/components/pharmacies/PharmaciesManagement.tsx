"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge } from "@karasu/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karasu/ui";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Loader2,
  Phone,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { LoadingState } from "../ui/LoadingState";
import { EmptyState } from "../empty-states/EmptyState";

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  district: string;
  city: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  is_on_duty: boolean;
  duty_date: string | null;
  duty_start_time: string | null;
  duty_end_time: string | null;
  source: string;
  published: boolean;
  verified: boolean;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export function PharmaciesManagement({ locale }: { locale: string }) {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [onDutyFilter, setOnDutyFilter] = useState<string>("all");
  const [publishedFilter, setPublishedFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Pharmacy>>({});

  useEffect(() => {
    fetchPharmacies();
  }, [cityFilter, districtFilter, onDutyFilter, publishedFilter]);

  const fetchPharmacies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cityFilter !== "all") params.append("city", cityFilter);
      if (districtFilter !== "all") params.append("district", districtFilter);
      if (onDutyFilter !== "all") params.append("is_on_duty", onDutyFilter);
      if (publishedFilter !== "all") params.append("published", publishedFilter);
      if (searchQuery) params.append("search", searchQuery);

      const { fetchWithRetry } = await import("@/lib/utils/api-client");
      const data = await fetchWithRetry(`/api/pharmacies?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!data.success) {
        if (data.code === "TABLE_NOT_FOUND" || data.code === "INTERNAL_ERROR") {
          setPharmacies([]);
          return;
        }
        throw new Error(data.error || "Eczaneler yüklenemedi");
      }

      setPharmacies((data as any).data?.pharmacies || []);
    } catch (error: any) {
      const { handleApiError } = await import("@/lib/utils/api-client");
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.userFriendly);
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPharmacies();
  };

  const handleTogglePublished = async (id: string, currentPublished: boolean) => {
    try {
      const { fetchWithRetry } = await import("@/lib/utils/api-client");
      const data = await fetchWithRetry(`/api/pharmacies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !currentPublished }),
      });

      if (data.success) {
        toast.success(currentPublished ? "Eczane gizlendi" : "Eczane yayınlandı");
        fetchPharmacies();
      } else {
        throw new Error(data.error || "İşlem başarısız");
      }
    } catch (error: any) {
      const { handleApiError } = await import("@/lib/utils/api-client");
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.userFriendly);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu eczaneyi silmek istediğinizden emin misiniz?")) return;

    try {
      const { fetchWithRetry } = await import("@/lib/utils/api-client");
      const data = await fetchWithRetry(`/api/pharmacies/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (data.success) {
        toast.success("Eczane silindi");
        fetchPharmacies();
      } else {
        throw new Error(data.error || "Silme işlemi başarısız");
      }
    } catch (error: any) {
      const { handleApiError } = await import("@/lib/utils/api-client");
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.userFriendly);
    }
  };

  const handleEdit = (pharmacy: Pharmacy) => {
    setEditingId(pharmacy.id);
    setEditForm({
      name: pharmacy.name,
      address: pharmacy.address,
      phone: pharmacy.phone,
      district: pharmacy.district,
      city: pharmacy.city,
      neighborhood: pharmacy.neighborhood,
      is_on_duty: pharmacy.is_on_duty,
      published: pharmacy.published,
    });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const { fetchWithRetry } = await import("@/lib/utils/api-client");
      const data = await fetchWithRetry(`/api/pharmacies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (data.success) {
        toast.success("Eczane güncellendi");
        setEditingId(null);
        setEditForm({});
        fetchPharmacies();
      } else {
        throw new Error(data.error || "Güncelleme başarısız");
      }
    } catch (error: any) {
      const { handleApiError } = await import("@/lib/utils/api-client");
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.userFriendly);
    }
  };

  const handleRefreshFromAPI = async () => {
    try {
      toast.info("Eczane verileri API'den güncelleniyor...");
      // Trigger API sync (this would call the web API to refresh data)
      const { fetchWithRetry } = await import("@/lib/utils/api-client");
      await fetchWithRetry(`/api/services/pharmacy?city=Sakarya&district=Karasu&cache=false`, {
        method: "GET",
      });
      toast.success("Veriler güncellendi");
      fetchPharmacies();
    } catch (error: any) {
      toast.error("API güncelleme başarısız");
    }
  };

  const filteredPharmacies = pharmacies.filter((pharmacy) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      pharmacy.name.toLowerCase().includes(query) ||
      pharmacy.address.toLowerCase().includes(query) ||
      (pharmacy.phone && pharmacy.phone.includes(query))
    );
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Eczane Yönetimi</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshFromAPI}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                API'den Güncelle
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Eczane ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Şehir" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Şehirler</SelectItem>
                <SelectItem value="Sakarya">Sakarya</SelectItem>
              </SelectContent>
            </Select>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger>
                <SelectValue placeholder="İlçe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm İlçeler</SelectItem>
                <SelectItem value="Karasu">Karasu</SelectItem>
                <SelectItem value="Kocaali">Kocaali</SelectItem>
              </SelectContent>
            </Select>
            <Select value={onDutyFilter} onValueChange={setOnDutyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Nöbetçi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="true">Nöbetçi</SelectItem>
                <SelectItem value="false">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <LoadingState variant="skeleton" skeletonCount={5} />
          ) : filteredPharmacies.length === 0 ? (
            <EmptyState
              icon={MapPin}
              title="Eczane Bulunamadı"
              description="Henüz eczane kaydı bulunmamaktadır."
            />
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Eczane
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      İletişim
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Konum
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Durum
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPharmacies.map((pharmacy) => (
                    <tr key={pharmacy.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {editingId === pharmacy.id ? (
                          <Input
                            value={editForm.name || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="w-full"
                          />
                        ) : (
                          <div>
                            <div className="font-medium text-gray-900">
                              {pharmacy.name}
                            </div>
                            {pharmacy.is_on_duty && (
                              <Badge variant="success" className="mt-1">
                                Nöbetçi
                              </Badge>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === pharmacy.id ? (
                          <Input
                            value={editForm.phone || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, phone: e.target.value })
                            }
                            className="w-full"
                            placeholder="Telefon"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {pharmacy.phone && (
                              <>
                                <Phone className="h-4 w-4" />
                                <a
                                  href={`tel:${pharmacy.phone}`}
                                  className="hover:text-primary"
                                >
                                  {pharmacy.phone}
                                </a>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === pharmacy.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editForm.address || ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, address: e.target.value })
                              }
                              placeholder="Adres"
                              className="w-full"
                            />
                            <Input
                              value={editForm.district || ""}
                              onChange={(e) =>
                                setEditForm({ ...editForm, district: e.target.value })
                              }
                              placeholder="İlçe"
                              className="w-full"
                            />
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {pharmacy.district}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {pharmacy.address}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={pharmacy.published ? "success" : "secondary"}
                          >
                            {pharmacy.published ? "Yayında" : "Gizli"}
                          </Badge>
                          {pharmacy.verified && (
                            <Badge variant="outline">Doğrulanmış</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {editingId === pharmacy.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditForm({});
                                }}
                              >
                                İptal
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSaveEdit(pharmacy.id)}
                              >
                                Kaydet
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTogglePublished(
                                  pharmacy.id,
                                  pharmacy.published
                                )}
                              >
                                {pharmacy.published ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(pharmacy)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(pharmacy.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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
