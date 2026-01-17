"use client";

import { ReactNode } from "react";
import { cn } from "@karasu/lib";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@karasu/ui";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  className?: string;
  sticky?: boolean;
}

interface CompactTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  selectedRows?: string[];
  onSelectRow?: (key: string) => void;
  className?: string;
}

export function CompactTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  selectedRows = [],
  onSelectRow,
  className,
}: CompactTableProps<T>) {
  return (
    <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="h-10 bg-muted/50">
              {onSelectRow && (
                <TableHead className="w-10 p-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={(e) => {
                      // Toggle all selection
                    }}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "h-10 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                    column.sticky && "sticky left-0 bg-background z-10",
                    column.className
                  )}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (onSelectRow ? 1 : 0)}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Veri bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const key = keyExtractor(item);
                const isSelected = selectedRows.includes(key);

                return (
                  <TableRow
                    key={key}
                    className={cn(
                      "h-10 hover:bg-muted/50 transition-colors cursor-pointer",
                      isSelected && "bg-primary/5",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {onSelectRow && (
                      <TableCell className="p-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border"
                          checked={isSelected}
                          onChange={() => onSelectRow(key)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell
                        key={column.key}
                        className={cn(
                          "px-3 py-2 text-sm",
                          column.sticky && "sticky left-0 bg-background z-10",
                          column.className
                        )}
                      >
                        {column.render
                          ? column.render(item)
                          : (item[column.key] as ReactNode)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
