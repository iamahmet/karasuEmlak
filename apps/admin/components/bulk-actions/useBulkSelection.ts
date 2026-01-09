import { useState, useCallback } from "react";

export function useBulkSelection<T>(items: T[], getItemId: (item: T) => string) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isSelected = useCallback(
    (item: T) => {
      return selectedIds.has(getItemId(item));
    },
    [selectedIds, getItemId]
  );

  const toggleSelection = useCallback(
    (item: T) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        const id = getItemId(item);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    },
    [getItemId]
  );

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map(getItemId)));
  }, [items, getItemId]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectedItems = items.filter((item) => selectedIds.has(getItemId(item)));

  return {
    selectedIds,
    selectedItems,
    isSelected,
    toggleSelection,
    selectAll,
    clearSelection,
    hasSelection: selectedIds.size > 0,
    selectionCount: selectedIds.size,
  };
}

