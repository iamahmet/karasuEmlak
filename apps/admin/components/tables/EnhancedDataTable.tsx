"use client";

import { useState, useMemo } from "react";
import { 
  Search, Filter, Download, MoreVertical, Edit, Trash2, Eye, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUpDown, ArrowUp, ArrowDown, Columns, RefreshCw
} from "lucide-react";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@karasu/ui";
import { CompactTable } from "./CompactTable";
import { cn } from "@karasu/lib";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  sticky?: boolean;
  sortable?: boolean;
}

interface EnhancedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  searchKey?: string;
  searchPlaceholder?: string;
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
  onRowClick?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onBulkAction?: (selected: string[], action: string) => void;
  className?: string;
}

export function EnhancedDataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  searchKey,
  searchPlaceholder = "Ara...",
  filters = [],
  onRowClick,
  onEdit,
  onDelete,
  onView,
  onBulkAction,
  className,
}: EnhancedDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Filter data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (searchQuery && searchKey) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => {
        const value = item[searchKey];
        return value && String(value).toLowerCase().includes(query);
      });
    }

    // Filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((item) => {
          const itemValue = item[key];
          return String(itemValue) === value;
        });
      }
    });

    // Sort
    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchQuery, searchKey, activeFilters, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectRow = (key: string) => {
    setSelectedRows((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedData.map((item) => keyExtractor(item)));
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
  };

  // Enhanced columns with actions
  const enhancedColumns: Column<T>[] = [
    ...columns,
    {
      key: "actions",
      label: "İşlemler",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(item);
              }}
              className="h-7 w-7 p-0"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className="h-7 w-7 p-0"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 h-9"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={activeFilters[filter.key] || "all"}
              onValueChange={(value) =>
                setActiveFilters((prev) => ({ ...prev, [filter.key]: value }))
              }
            >
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button variant="outline" size="sm" className="h-9 gap-2">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <span className="text-sm font-medium text-primary">
            {selectedRows.length} öğe seçildi
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {onBulkAction && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction(selectedRows, "delete")}
                  className="h-8"
                >
                  Seçilenleri Sil
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction(selectedRows, "publish")}
                  className="h-8"
                >
                  Yayınla
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRows([])}
              className="h-8"
            >
              Temizle
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <CompactTable
        data={paginatedData}
        columns={enhancedColumns.map((col) => ({
          ...col,
          label: (
            <div className="flex items-center gap-1.5">
              {col.label}
              {col.sortable && (
                <button
                  onClick={() => handleSort(col.key)}
                  className="hover:text-foreground transition-colors"
                >
                  {getSortIcon(col.key)}
                </button>
              )}
            </div>
          ) as any,
        }))}
        keyExtractor={keyExtractor}
        onRowClick={onRowClick}
        selectedRows={selectedRows}
        onSelectRow={handleSelectRow}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredData.length} toplam, sayfa {currentPage} / {totalPages || 1}
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(itemsPerPage)} onValueChange={(v) => setItemsPerPage(Number(v))}>
            <SelectTrigger className="h-8 w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
