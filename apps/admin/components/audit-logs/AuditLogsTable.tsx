"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Input } from "@karasu/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karasu/ui";
import {
  Loader2,
  Search,
  Download,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  resource_slug: string | null;
  changes: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface AuditLogsTableProps {
  initialFilters?: {
    userId?: string;
    action?: string;
    resourceType?: string;
    startDate?: Date;
    endDate?: Date;
  };
}

export function AuditLogsTable({ initialFilters }: AuditLogsTableProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userId: initialFilters?.userId || "",
    action: initialFilters?.action || "",
    resourceType: initialFilters?.resourceType || "",
    startDate: initialFilters?.startDate || null as Date | null,
    endDate: initialFilters?.endDate || null as Date | null,
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  useEffect(() => {
    fetchLogs();
  }, [filters, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.userId) params.append("userId", filters.userId);
      if (filters.action) params.append("action", filters.action);
      if (filters.resourceType) params.append("resourceType", filters.resourceType);
      if (filters.startDate) params.append("startDate", filters.startDate.toISOString());
      if (filters.endDate) params.append("endDate", filters.endDate.toISOString());
      params.append("limit", limit.toString());
      params.append("offset", ((page - 1) * limit).toString());

      const response = await fetch(`/api/audit-logs?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch audit logs");

      const data = await response.json();
      setLogs(data.logs || []);
      setTotal(data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    const colors: Record<string, string> = {
      create: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      update: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      delete: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      publish: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      approve: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      reject: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };
    return colors[action] || "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`/api/audit-logs/export?${params.toString()}`);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting audit logs:", error);
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Action..."
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
        />
        <Select
          value={filters.resourceType}
          onValueChange={(value) => setFilters({ ...filters, resourceType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Resource Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tümü</SelectItem>
            <SelectItem value="article">Article</SelectItem>
            <SelectItem value="news">News</SelectItem>
            <SelectItem value="listing">Listing</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          placeholder="Start Date"
          value={filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              startDate: e.target.value ? new Date(e.target.value) : null,
            })
          }
        />
        <div className="flex gap-2">
          <Input
            type="date"
            placeholder="End Date"
            value={filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                endDate: e.target.value ? new Date(e.target.value) : null,
              })
            }
          />
          <Button onClick={handleExport} variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Kullanıcı</TableHead>
              <TableHead>Aksiyon</TableHead>
              <TableHead>Kaynak</TableHead>
              <TableHead>Detaylar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Log bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(log.created_at), "dd MMM yyyy HH:mm", {
                          locale: tr,
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.user_id ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{log.user_id.slice(0, 8)}...</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionBadgeColor(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.resource_type ? (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {log.resource_type}
                          {log.resource_slug && ` (${log.resource_slug})`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.changes && Object.keys(log.changes).length > 0 ? (
                      <Button variant="ghost" size="sm">
                        Detayları Gör
                      </Button>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Sayfa {page} / {Math.ceil(total / limit)}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / limit)}
            >
              Sonraki
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
