"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import {
  User,
  Mail,
  Shield,
  MoreVertical,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Ban,
  CheckCircle2,
  Calendar,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Key,
  Send,
  RefreshCw,
  Upload,
  Users,
  FileText,
  LayoutGrid,
  List,
  Columns,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@karasu/lib";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@karasu/ui";
import { formatDateTime } from "@karasu/ui";

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  roles: string[];
  created_at: string;
  last_sign_in_at: string | null;
  email_verified: boolean;
  is_active: boolean;
}

interface UsersTableProps {
  users: User[];
  loading?: boolean;
  onRoleChange: (userId: string, role: string, action: "add" | "remove") => Promise<void>;
  onUserUpdate: (userId: string) => void;
  onUserEdit?: (userId: string) => void;
  onUserDelete: (userId: string) => Promise<void>;
  onSendEmail?: (userId: string) => Promise<void>;
  onResetPassword?: (userId: string) => Promise<void>;
  onSendMagicLink?: (userId: string) => Promise<void>;
  locale: string;
}

export function UsersTable({
  users,
  loading = false,
  onRoleChange,
  onUserUpdate,
  onUserEdit,
  onUserDelete,
  onSendEmail,
  onResetPassword,
  onSendMagicLink,
}: UsersTableProps) {
  const t = useTranslations("users.table");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<"all" | "today" | "week" | "month" | "year" | "custom">("all");
  const [customDateStart, setCustomDateStart] = useState<string>("");
  const [customDateEnd, setCustomDateEnd] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sortField, setSortField] = useState<"name" | "email" | "created_at" | "last_sign_in_at" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    user: true,
    email: true,
    roles: true,
    status: true,
    lastSignIn: true,
    createdAt: true,
    actions: true,
  });
  const [bulkActionModalOpen, setBulkActionModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"role" | "email" | null>(null);
  const [bulkRoleValue, setBulkRoleValue] = useState<string>("");
  const [bulkEmailSubject, setBulkEmailSubject] = useState<string>("");
  const [bulkEmailBody, setBulkEmailBody] = useState<string>("");
  const [csvImportModalOpen, setCsvImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvImportLoading, setCsvImportLoading] = useState(false);

  const filteredAndSortedUsers = useMemo(() => {
    // First filter
    let filtered = users.filter((user) => {
      // Safe access to user properties
      const userEmail = user?.email || "";
      const userName = user?.name || "";
      const userRoles = Array.isArray(user?.roles) ? user.roles : [];
      const isActive = user?.is_active ?? true;
      const emailVerified = user?.email_verified ?? false;

      const matchesSearch =
        userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === "all" || userRoles.includes(roleFilter);
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);

      const matchesEmailVerified = emailVerifiedFilter === "all" ||
        (emailVerifiedFilter === "verified" && emailVerified) ||
        (emailVerifiedFilter === "unverified" && !emailVerified);

      // Date range filter
      let matchesDateRange = true;
      if (dateRangeFilter !== "all") {
        const userCreatedAt = new Date(user.created_at);
        let startDate: Date = new Date();
        let endDate: Date = new Date();
        endDate.setHours(23, 59, 59, 999);

        if (dateRangeFilter === "custom") {
          if (customDateStart && customDateEnd) {
            startDate = new Date(customDateStart);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(customDateEnd);
            endDate.setHours(23, 59, 59, 999);
            matchesDateRange = userCreatedAt >= startDate && userCreatedAt <= endDate;
          } else {
            matchesDateRange = true; // If custom dates not set, show all
          }
        } else {
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);

          switch (dateRangeFilter) {
            case "today":
              // Already set to today
              break;
            case "week":
              startDate.setDate(startDate.getDate() - 7);
              break;
            case "month":
              startDate.setMonth(startDate.getMonth() - 1);
              break;
            case "year":
              startDate.setFullYear(startDate.getFullYear() - 1);
              break;
          }
          matchesDateRange = userCreatedAt >= startDate && userCreatedAt <= endDate;
        }
      }

      return matchesSearch && matchesRole && matchesStatus && matchesEmailVerified && matchesDateRange;
    });

    // Then sort
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: string | number | null = null;
        let bValue: string | number | null = null;

        switch (sortField) {
          case "name":
            aValue = a.name || a.email || "";
            bValue = b.name || b.email || "";
            break;
          case "email":
            aValue = a.email || "";
            bValue = b.email || "";
            break;
          case "created_at":
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
          case "last_sign_in_at":
            aValue = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
            bValue = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
            break;
        }

        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          const comparison = aValue.localeCompare(bValue, undefined, { sensitivity: "base" });
          return sortDirection === "asc" ? comparison : -comparison;
        } else {
          const comparison = (aValue as number) - (bValue as number);
          return sortDirection === "asc" ? comparison : -comparison;
        }
      });
    }

    return filtered;
  }, [users, searchQuery, roleFilter, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter, emailVerifiedFilter, dateRangeFilter, customDateStart, customDateEnd, sortField, sortDirection]);

  const handleSort = (field: "name" | "email" | "created_at" | "last_sign_in_at") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: "name" | "email" | "created_at" | "last_sign_in_at" }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1 text-design-light" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1 text-design-light" />
    );
  };

  const handleBulkAction = async (action: "delete" | "ban" | "activate") => {
    if (selectedUsers.length === 0) {
      toast.error(t("errors.noUsersSelected"));
      return;
    }

    const confirmMessage =
      action === "delete"
        ? t("confirmations.bulkDelete", { count: selectedUsers.length })
        : action === "ban"
        ? t("confirmations.bulkBan", { count: selectedUsers.length })
        : t("confirmations.bulkActivate", { count: selectedUsers.length });

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const promises = selectedUsers.map(async (userId) => {
        if (action === "delete") {
          return onUserDelete(userId);
        } else if (action === "ban") {
          const response = await fetch(`/api/users/${userId}/ban`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "ban" }),
          });
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Ban işlemi başarısız");
          }
        } else if (action === "activate") {
          const response = await fetch(`/api/users/${userId}/ban`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "unban" }),
          });
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Aktifleştirme işlemi başarısız");
          }
        }
      });

      await Promise.all(promises);
      setSelectedUsers([]);
      toast.success(`${selectedUsers.length} kullanıcı üzerinde işlem tamamlandı`);
      
      // Refresh the table
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "İşlem başarısız");
    }
  };

  const handleBulkRoleAssign = async () => {
    if (selectedUsers.length === 0 || !bulkRoleValue) {
      toast.error("Lütfen kullanıcı ve rol seçin");
      return;
    }

    try {
      const promises = selectedUsers.map(async (userId) => {
        await onRoleChange(userId, bulkRoleValue, "add");
      });

      await Promise.all(promises);
      setSelectedUsers([]);
      setBulkActionModalOpen(false);
      setBulkRoleValue("");
      toast.success(`${selectedUsers.length} kullanıcıya ${bulkRoleValue} rolü atandı`);
    } catch (error: any) {
      toast.error(error.message || "Rol atama başarısız");
    }
  };

  const handleBulkEmailSend = async () => {
    if (selectedUsers.length === 0 || !bulkEmailSubject || !bulkEmailBody) {
      toast.error("Lütfen konu ve mesaj girin");
      return;
    }

    try {
      const promises = selectedUsers.map(async (userId) => {
        const response = await fetch(`/api/users/${userId}/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "custom",
            subject: bulkEmailSubject,
            body: bulkEmailBody,
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Email gönderilemedi");
        }
      });

      await Promise.all(promises);
      setSelectedUsers([]);
      setBulkActionModalOpen(false);
      setBulkEmailSubject("");
      setBulkEmailBody("");
      toast.success(`${selectedUsers.length} kullanıcıya email gönderildi`);
    } catch (error: any) {
      toast.error(error.message || "Email gönderme başarısız");
    }
  };

  const handleCsvImport = async () => {
    if (!csvFile) {
      toast.error("Lütfen bir CSV dosyası seçin");
      return;
    }

    setCsvImportLoading(true);
    try {
      const text = await csvFile.text();
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim());

      // Expected headers: Email, Name, Role (optional)
      const emailIndex = headers.findIndex((h) => h.toLowerCase().includes("email"));
      const nameIndex = headers.findIndex((h) => h.toLowerCase().includes("name"));
      const roleIndex = headers.findIndex((h) => h.toLowerCase().includes("role"));

      if (emailIndex === -1) {
        throw new Error("CSV dosyasında 'Email' kolonu bulunamadı");
      }

      const usersToCreate = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const email = values[emailIndex];
        if (email && email.includes("@")) {
          usersToCreate.push({
            email,
            name: nameIndex >= 0 ? values[nameIndex] : "",
            role: roleIndex >= 0 ? values[roleIndex] : "",
          });
        }
      }

      // Create users via API
      const promises = usersToCreate.map(async (userData) => {
        const response = await fetch("/api/users/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userData.email,
            name: userData.name,
            role: userData.role,
            sendMagicLink: true,
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Kullanıcı oluşturulamadı: ${userData.email}`);
        }
      });

      await Promise.all(promises);
      setCsvImportModalOpen(false);
      setCsvFile(null);
      toast.success(`${usersToCreate.length} kullanıcı başarıyla oluşturuldu`);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "CSV import başarısız");
    } finally {
      setCsvImportLoading(false);
    }
  };

  const handleExport = (format: "csv" | "excel" | "pdf" = "csv") => {
    const headers = ["Email", "İsim", "Roller", "Durum", "Email Doğrulama", "Kayıt Tarihi", "Son Giriş"];
    const rows = filteredAndSortedUsers.map((user) => {
        const userRoles = Array.isArray(user?.roles) ? user.roles : [];
        return [
          user?.email || "",
          user?.name || "",
          userRoles.join("; "),
          user?.is_active ? "Aktif" : "Pasif",
        user?.email_verified ? "Doğrulanmış" : "Doğrulanmamış",
        user?.created_at ? formatDateTime(user.created_at) : "",
        user?.last_sign_in_at ? formatDateTime(user.last_sign_in_at) : "Hiç giriş yapmamış",
      ];
    });

    if (format === "csv") {
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `kullanicilar_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
      toast.success("Kullanıcılar CSV olarak dışa aktarıldı");
    } else if (format === "excel") {
      // Excel format (TSV-like format that Excel can open)
      const excelContent = [
        headers.join("\t"),
        ...rows.map((row) => row.join("\t")),
      ].join("\n");

      const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `kullanicilar_${new Date().toISOString().split("T")[0]}.xls`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Kullanıcılar Excel olarak dışa aktarıldı");
    } else if (format === "pdf") {
      // Generate PDF using HTML table
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Kullanıcı Listesi</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background-color: #f0f0f0; padding: 10px; text-align: left; border: 1px solid #ddd; }
              td { padding: 8px; border: 1px solid #ddd; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .footer { margin-top: 30px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <h1>Kullanıcı Listesi</h1>
            <p>Oluşturulma Tarihi: ${new Date().toLocaleString("tr-TR")}</p>
            <p>Toplam Kullanıcı: ${filteredAndSortedUsers.length}</p>
            <table>
              <thead>
                <tr>
                  ${headers.map((h) => `<th>${h}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${rows
                  .map(
                    (row) =>
                      `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="footer">
              <p>Bu rapor ${new Date().toLocaleString("tr-TR")} tarihinde oluşturulmuştur.</p>
            </div>
          </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            toast.success("PDF oluşturuldu. Yazdırma penceresinden PDF olarak kaydedebilirsiniz.");
          }, 250);
        };
      } else {
        toast.error("Popup engellendi. Lütfen popup izni verin.");
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "staff":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "user":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <Card className="card-professional">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-1 gap-3 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-design-gray dark:text-gray-400" />
                <Input
                  placeholder="Kullanıcı ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px] border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui">
                  <SelectValue placeholder={t("filters.role")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.all")}</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui">
                  <SelectValue placeholder={t("filters.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.all")}</SelectItem>
                  <SelectItem value="active">{t("filters.active")}</SelectItem>
                  <SelectItem value="inactive">{t("filters.inactive")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={emailVerifiedFilter} onValueChange={setEmailVerifiedFilter}>
                <SelectTrigger className="w-[160px] border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui">
                  <SelectValue placeholder={t("filters.emailVerified")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.emailVerifiedAll")}</SelectItem>
                  <SelectItem value="verified">{t("filters.emailVerifiedYes")}</SelectItem>
                  <SelectItem value="unverified">{t("filters.emailVerifiedNo")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRangeFilter} onValueChange={(value: any) => setDateRangeFilter(value)}>
                <SelectTrigger className="w-[140px] border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui">
                  <SelectValue placeholder={t("filters.dateRange")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.dateRangeAll")}</SelectItem>
                  <SelectItem value="today">{t("filters.dateRangeToday")}</SelectItem>
                  <SelectItem value="week">{t("filters.dateRangeWeek")}</SelectItem>
                  <SelectItem value="month">{t("filters.dateRangeMonth")}</SelectItem>
                  <SelectItem value="year">{t("filters.dateRangeYear")}</SelectItem>
                  <SelectItem value="custom">{t("filters.dateRangeCustom")}</SelectItem>
                </SelectContent>
              </Select>
              {dateRangeFilter === "custom" && (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={customDateStart}
                    onChange={(e) => setCustomDateStart(e.target.value)}
                    className="w-[140px] border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui"
                    placeholder={t("filters.dateRangeStart")}
                  />
                  <span className="text-design-gray dark:text-gray-400">-</span>
                  <Input
                    type="date"
                    value={customDateEnd}
                    onChange={(e) => setCustomDateEnd(e.target.value)}
                    className="w-[140px] border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui"
                    placeholder={t("filters.dateRangeEnd")}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {selectedUsers.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      handleBulkAction("activate");
                    }}
                    className="gap-2"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Aktifleştir ({selectedUsers.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      handleBulkAction("ban");
                    }}
                    className="gap-2"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <Ban className="h-4 w-4" />
                    Yasakla ({selectedUsers.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      handleBulkAction("delete");
                    }}
                    className="gap-2 text-red-600"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Sil ({selectedUsers.length})
                  </Button>
                </>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => setViewMode("table")}
                  style={{ pointerEvents: 'auto' }}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() => setViewMode("grid")}
                  style={{ pointerEvents: 'auto' }}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2" style={{ pointerEvents: 'auto' }}>
                      <Columns className="h-4 w-4" />
                      Kolonlar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {Object.entries({
                      user: "Kullanıcı",
                      email: "E-posta",
                      roles: "Roller",
                      status: "Durum",
                      lastSignIn: "Son Giriş",
                      createdAt: "Kayıt Tarihi",
                      actions: "İşlemler",
                    }).map(([key, label]) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={(e) => {
                          e.stopPropagation();
                          setVisibleColumns((prev) => ({
                            ...prev,
                            [key]: !prev[key],
                          }));
                        }}
                        className="flex items-center gap-2"
                      >
                        {visibleColumns[key] ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        {label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setCsvImportModalOpen(true)}
                style={{ pointerEvents: 'auto' }}
              >
                <Upload className="h-4 w-4" />
                CSV İçe Aktar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2" style={{ pointerEvents: 'auto' }}>
                <Download className="h-4 w-4" />
                Dışa Aktar
              </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                    <FileText className="h-4 w-4 mr-2" />
                    CSV olarak dışa aktar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("excel")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Excel olarak dışa aktar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <FileText className="h-4 w-4 mr-2" />
                    PDF olarak dışa aktar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {selectedUsers.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setBulkActionType("role");
                      setBulkActionModalOpen(true);
                    }}
                    style={{ pointerEvents: 'auto' }}
                  >
                    <Shield className="h-4 w-4" />
                    Toplu Rol Ata
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setBulkActionType("email");
                      setBulkActionModalOpen(true);
                    }}
                    style={{ pointerEvents: 'auto' }}
                  >
                    <Send className="h-4 w-4" />
                    Toplu Email Gönder
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table/Grid */}
      <Card className="card-professional">
        <CardContent className="p-0">
          {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#E7E7E7] dark:bg-[#062F28] border-b border-[#E7E7E7] dark:border-[#062F28]">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      aria-label="Tümünü seç"
                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUsers.includes(u.id))}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, ...paginatedUsers.map((u) => u.id).filter(id => !selectedUsers.includes(id))]);
                        } else {
                            setSelectedUsers(selectedUsers.filter(id => !paginatedUsers.some(u => u.id === id)));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                    {visibleColumns.user && (
                  <th className="px-4 py-3 text-left text-xs font-ui font-semibold text-design-gray dark:text-gray-400 uppercase">
                        <button
                          onClick={() => handleSort("name")}
                          className="flex items-center hover:text-design-light dark:hover:text-design-light transition-colors"
                        >
                    Kullanıcı
                          <SortIcon field="name" />
                        </button>
                  </th>
                    )}
                    {visibleColumns.email && (
                  <th className="px-4 py-3 text-left text-xs font-ui font-semibold text-design-gray dark:text-gray-400 uppercase">
                        <button
                          onClick={() => handleSort("email")}
                          className="flex items-center hover:text-design-light dark:hover:text-design-light transition-colors"
                        >
                    E-posta
                          <SortIcon field="email" />
                        </button>
                  </th>
                    )}
                    {visibleColumns.roles && (
                  <th className="px-4 py-3 text-left text-xs font-ui font-semibold text-design-gray dark:text-gray-400 uppercase">
                    Roller
                  </th>
                    )}
                    {visibleColumns.status && (
                  <th className="px-4 py-3 text-left text-xs font-ui font-semibold text-design-gray dark:text-gray-400 uppercase">
                    Durum
                  </th>
                    )}
                    {visibleColumns.lastSignIn && (
                  <th className="px-4 py-3 text-left text-xs font-ui font-semibold text-design-gray dark:text-gray-400 uppercase">
                        <button
                          onClick={() => handleSort("last_sign_in_at")}
                          className="flex items-center hover:text-design-light dark:hover:text-design-light transition-colors"
                        >
                    Son Giriş
                          <SortIcon field="last_sign_in_at" />
                        </button>
                  </th>
                    )}
                    {visibleColumns.createdAt && (
                  <th className="px-4 py-3 text-left text-xs font-ui font-semibold text-design-gray dark:text-gray-400 uppercase">
                        <button
                          onClick={() => handleSort("created_at")}
                          className="flex items-center hover:text-design-light dark:hover:text-design-light transition-colors"
                        >
                    Kayıt Tarihi
                          <SortIcon field="created_at" />
                        </button>
                  </th>
                    )}
                    {visibleColumns.actions && (
                  <th className="px-4 py-3 text-right text-xs font-ui font-semibold text-design-gray dark:text-gray-400 uppercase">
                    İşlemler
                  </th>
                    )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E7E7] dark:divide-[#062F28]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="px-4 py-3">
                        <div className="h-12 w-full skeleton-professional rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : filteredAndSortedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="px-4 py-12 text-center">
                      <User className="h-12 w-12 mx-auto mb-3 text-design-gray dark:text-gray-400 opacity-50" />
                      <p className="text-design-gray dark:text-gray-400 font-ui">
                        {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                          ? "Arama kriterlerinize uygun kullanıcı bulunamadı"
                          : "Henüz kullanıcı yok"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-design-light/5 dark:hover:bg-design-light/10 transition-colors cursor-pointer"
                      onClick={(e) => {
                        // Don't trigger row click if clicking on interactive elements
                        const target = e.target as HTMLElement;
                        // Check if clicked element or its parent is interactive
                        const isInteractive = 
                          target.tagName === 'BUTTON' ||
                          target.tagName === 'INPUT' ||
                          target.tagName === 'A' ||
                          target.closest('button') !== null ||
                          target.closest('input') !== null ||
                          target.closest('a') !== null ||
                          target.closest('[role="button"]') !== null ||
                          target.closest('[data-radix-popper-content-wrapper]') !== null ||
                          target.closest('[data-state]') !== null;
                        
                        if (!isInteractive) {
                          onUserUpdate(user.id);
                        }
                      }}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`${user?.name || user?.email || "Kullanıcı"} seç`}
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                            }
                          }}
                          className="rounded border-gray-300 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      {visibleColumns.user && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-design-light to-green-600 flex items-center justify-center text-white font-bold">
                                    {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-design-dark dark:text-white font-ui">
                                      {user?.name || "İsimsiz"}
                                    </p>
                                    <p className="text-xs text-design-gray dark:text-gray-400 font-ui">
                                      {user?.id ? `${user.id.slice(0, 8)}...` : "N/A"}
                                    </p>
                                  </div>
                        </div>
                      </td>
                      )}
                      {visibleColumns.email && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-design-gray dark:text-gray-400" />
                                      <span className="text-sm text-design-dark dark:text-white font-ui">
                                        {user?.email || "N/A"}
                                      </span>
                          {user.email_verified && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </td>
                      )}
                      {visibleColumns.roles && (
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.roles && Array.isArray(user.roles) && user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <Badge
                                key={role}
                                className={cn("text-[10px] px-2 py-0.5", getRoleBadgeColor(role))}
                              >
                                {role}
                              </Badge>
                            ))
                          ) : (
                            <Badge className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                              user
                            </Badge>
                          )}
                        </div>
                      </td>
                      )}
                      {visibleColumns.status && (
                      <td className="px-4 py-3">
                        <Badge
                          className={cn(
                            "text-[10px] px-2 py-0.5",
                            user.is_active
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          )}
                        >
                          {user.is_active ? "Aktif" : "Pasif"}
                        </Badge>
                      </td>
                      )}
                      {visibleColumns.lastSignIn && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-design-gray dark:text-gray-400" />
                                      <span className="text-xs text-design-gray dark:text-gray-400 font-ui">
                                        {user?.last_sign_in_at
                                          ? formatDateTime(user.last_sign_in_at)
                                          : "Hiç giriş yapmamış"}
                                      </span>
                        </div>
                      </td>
                      )}
                      {visibleColumns.createdAt && (
                      <td className="px-4 py-3">
                                    <span className="text-xs text-design-gray dark:text-gray-400 font-ui">
                                      {user?.created_at ? formatDateTime(user.created_at) : "N/A"}
                                    </span>
                      </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              onUserUpdate(user.id);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Detayları Gör
                            </DropdownMenuItem>
                            {onUserEdit && (
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                onUserEdit(user.id);
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Düzenle
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {user.roles && user.roles.includes("admin") ? (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRoleChange(user.id, "admin", "remove");
                                }}
                                style={{ pointerEvents: 'auto' }}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Admin Yetkisini Kaldır
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRoleChange(user.id, "admin", "add");
                                }}
                                style={{ pointerEvents: 'auto' }}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Admin Yap
                              </DropdownMenuItem>
                            )}
                            {user.roles && user.roles.includes("staff") ? (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRoleChange(user.id, "staff", "remove");
                                }}
                                style={{ pointerEvents: 'auto' }}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Staff Yetkisini Kaldır
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRoleChange(user.id, "staff", "add");
                                }}
                                style={{ pointerEvents: 'auto' }}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Staff Yap
                              </DropdownMenuItem>
                            )}
                            {!user.is_active && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const response = await fetch(`/api/users/${user.id}/ban`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ action: "unban" }),
                                      });
                                      if (!response.ok) {
                                        const data = await response.json();
                                        throw new Error(data.error || "Aktifleştirme başarısız");
                                      }
                                      toast.success("Kullanıcı aktifleştirildi");
                                      // Refresh will be handled by parent component
                                      setTimeout(() => window.location.reload(), 500);
                                    } catch (error: any) {
                                      toast.error(error.message || "Aktifleştirme başarısız");
                                    }
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Aktifleştir
                                </DropdownMenuItem>
                              </>
                            )}
                            {user.is_active && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!confirm("Bu kullanıcıyı yasaklamak istediğinize emin misiniz?")) {
                                      return;
                                    }
                                    try {
                                      const response = await fetch(`/api/users/${user.id}/ban`, {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ action: "ban" }),
                                      });
                                      if (!response.ok) {
                                        const data = await response.json();
                                        throw new Error(data.error || "Yasaklama başarısız");
                                      }
                                      toast.success("Kullanıcı yasaklandı");
                                      // Refresh will be handled by parent component
                                      setTimeout(() => window.location.reload(), 500);
                                    } catch (error: any) {
                                      toast.error(error.message || "Yasaklama başarısız");
                                    }
                                  }}
                                  className="text-orange-600"
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Yasakla
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onUserDelete(user.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-48 skeleton-professional rounded-lg" />
                ))}
              </div>
            ) : filteredAndSortedUsers.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto mb-3 text-design-gray dark:text-gray-400 opacity-50" />
                <p className="text-design-gray dark:text-gray-400 font-ui">
                  {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                    ? "Arama kriterlerinize uygun kullanıcı bulunamadı"
                    : "Henüz kullanıcı yok"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedUsers.map((user) => (
                  <Card
                    key={user.id}
                    className="card-professional hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => onUserUpdate(user.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-design-light to-green-600 flex items-center justify-center text-white font-bold text-lg">
                            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-design-dark dark:text-white font-ui truncate">
                              {user?.name || "İsimsiz"}
                            </p>
                            {visibleColumns.email && (
                              <p className="text-xs text-design-gray dark:text-gray-400 font-ui truncate">
                                {user?.email || "N/A"}
                              </p>
                            )}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          aria-label={`${user?.name || user?.email || "Kullanıcı"} seç`}
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            e.stopPropagation();
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                            }
                          }}
                          className="rounded border-gray-300 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ pointerEvents: 'auto' }}
                        />
                      </div>
                      {visibleColumns.roles && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {user.roles && Array.isArray(user.roles) && user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <Badge
                                key={role}
                                className={cn("text-[10px] px-2 py-0.5", getRoleBadgeColor(role))}
                              >
                                {role}
                              </Badge>
                            ))
                          ) : (
                            <Badge className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                              user
                            </Badge>
                          )}
                        </div>
                      )}
                      {visibleColumns.status && (
                        <div className="mb-3">
                          <Badge
                            className={cn(
                              "text-[10px] px-2 py-0.5",
                              user.is_active
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            )}
                          >
                            {user.is_active ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                      )}
                      <div className="space-y-2 text-xs text-design-gray dark:text-gray-400 font-ui">
                        {visibleColumns.lastSignIn && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span className="truncate">
                              {user?.last_sign_in_at
                                ? formatDateTime(user.last_sign_in_at)
                                : "Hiç giriş yapmamış"}
                            </span>
                          </div>
                        )}
                        {visibleColumns.createdAt && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{user?.created_at ? formatDateTime(user.created_at) : "N/A"}</span>
                          </div>
                        )}
                      </div>
                      {visibleColumns.actions && (
                        <div className="mt-3 pt-3 border-t border-[#E7E7E7] dark:border-[#062F28]">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4 mr-2" />
                                İşlemler
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUserUpdate(user.id);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Detayları Gör
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUserEdit?.(user.id);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Düzenle
                              </DropdownMenuItem>
                              {user.is_active ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        const response = await fetch(`/api/users/${user.id}`, {
                                          method: "PATCH",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ action: "ban" }),
                                        });
                                        if (!response.ok) {
                                          const data = await response.json();
                                          throw new Error(data.error || "Yasaklama başarısız");
                                        }
                                        toast.success("Kullanıcı yasaklandı");
                                        setTimeout(() => window.location.reload(), 500);
                                      } catch (error: any) {
                                        toast.error(error.message || "Yasaklama başarısız");
                                      }
                                    }}
                                    className="text-orange-600"
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Yasakla
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <>
                                  <DropdownMenuItem
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        const response = await fetch(`/api/users/${user.id}`, {
                                          method: "PATCH",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ action: "activate" }),
                                        });
                                        if (!response.ok) {
                                          const data = await response.json();
                                          throw new Error(data.error || "Aktifleştirme başarısız");
                                        }
                                        toast.success("Kullanıcı aktifleştirildi");
                                        setTimeout(() => window.location.reload(), 500);
                                      } catch (error: any) {
                                        toast.error(error.message || "Aktifleştirme başarısız");
                                      }
                                    }}
                                    className="text-green-600"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Aktifleştir
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUserDelete(user.id);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredAndSortedUsers.length > 0 && (
        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
          <p className="text-sm text-design-gray dark:text-gray-400 font-ui">
                  Toplam <span className="font-semibold text-design-dark dark:text-white">{filteredAndSortedUsers.length}</span> kullanıcıdan{" "}
                  <span className="font-semibold text-design-dark dark:text-white">
                    {startIndex + 1}-{Math.min(endIndex, filteredAndSortedUsers.length)}
                  </span>{" "}
                  arası gösteriliyor
          </p>
          <div className="flex items-center gap-2">
                  <label className="text-xs text-design-gray dark:text-gray-400 font-ui">Sayfa başına:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-xs border border-[#E7E7E7] dark:border-[#062F28] rounded-lg px-2 py-1 bg-white dark:bg-[#0a3d35] text-design-dark dark:text-white font-ui"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
          </div>
        </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8 w-8 p-0 ${currentPage === pageNum ? "bg-design-light text-white" : ""}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Action Modal */}
      <Dialog open={bulkActionModalOpen} onOpenChange={setBulkActionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {bulkActionType === "role" ? "Toplu Rol Ata" : "Toplu Email Gönder"}
            </DialogTitle>
            <DialogDescription>
              {bulkActionType === "role"
                ? `${selectedUsers.length} kullanıcıya rol atayın`
                : `${selectedUsers.length} kullanıcıya email gönderin`}
            </DialogDescription>
          </DialogHeader>
          {bulkActionType === "role" ? (
            <div className="space-y-4">
              <div>
                <Label>Rol Seçin</Label>
                <Select value={bulkRoleValue} onValueChange={setBulkRoleValue}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rol seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setBulkActionModalOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleBulkRoleAssign} disabled={!bulkRoleValue}>
                  Rol Ata
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Konu</Label>
                <Input
                  value={bulkEmailSubject}
                  onChange={(e) => setBulkEmailSubject(e.target.value)}
                  placeholder="Email konusu"
                />
              </div>
              <div>
                <Label>Mesaj</Label>
                <Textarea
                  value={bulkEmailBody}
                  onChange={(e) => setBulkEmailBody(e.target.value)}
                  placeholder="Email içeriği"
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setBulkActionModalOpen(false)}>
                  İptal
                </Button>
                <Button
                  onClick={handleBulkEmailSend}
                  disabled={!bulkEmailSubject || !bulkEmailBody}
                >
                  Email Gönder
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CSV Import Modal */}
      <Dialog open={csvImportModalOpen} onOpenChange={setCsvImportModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>CSV İçe Aktar</DialogTitle>
            <DialogDescription>
              CSV dosyasından kullanıcıları içe aktarın. Dosya formatı: Email, Name, Role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>CSV Dosyası</Label>
              <Input
                type="file"
                accept=".csv"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCsvFile(file);
                  }
                }}
                className="mt-1"
              />
              <p className="text-xs text-design-gray dark:text-gray-400 mt-2">
                Örnek format: Email, Name, Role<br />
                user@example.com, John Doe, staff
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCsvImportModalOpen(false)}>
                İptal
              </Button>
              <Button
                onClick={handleCsvImport}
                disabled={!csvFile || csvImportLoading}
              >
                {csvImportLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    İçe Aktarılıyor...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    İçe Aktar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

