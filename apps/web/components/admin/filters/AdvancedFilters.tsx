"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@karasu/ui";
import { Checkbox } from "@karasu/ui";
import { Filter, X } from "lucide-react";

export interface FilterConfig {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "checkbox" | "number";
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
}

interface AdvancedFiltersProps {
  filters: FilterConfig[];
  onApply: (filters: Record<string, any>) => void;
  onReset: () => void;
  defaultValues?: Record<string, any>;
}

export function AdvancedFilters({
  filters,
  onApply,
  onReset,
  defaultValues = {},
}: AdvancedFiltersProps) {
  const [filterValues, setFilterValues] = useState<Record<string, any>>(
    defaultValues
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    onApply(filterValues);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilterValues({});
    onReset();
    setIsOpen(false);
  };

  const activeFiltersCount = Object.values(filterValues).filter(
    (v) => v !== undefined && v !== null && v !== ""
  ).length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui hover-scale relative"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="ml-2 px-1.5 py-0.5 bg-design-light text-design-dark text-[10px] rounded-full font-semibold">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-modal-backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden={!isOpen}
            style={{ zIndex: 'var(--z-modal-backdrop)' }}
          />
          <Card className="absolute top-full left-0 mt-2 z-popover w-96 card-modern shadow-xl" style={{ zIndex: 'var(--z-popover)' }}>
            <CardHeader className="pb-3 px-4 pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
                  Filters
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-lg hover-scale"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <Label className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400">
                    {filter.label}
                  </Label>
                  {filter.type === "text" && (
                    <Input
                      value={filterValues[filter.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(filter.key, e.target.value)
                      }
                      placeholder={filter.placeholder}
                      className="h-9 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui"
                    />
                  )}
                  {filter.type === "select" && (
                    <Select
                      value={filterValues[filter.key] || ""}
                      onValueChange={(value) =>
                        handleFilterChange(filter.key, value)
                      }
                    >
                      <SelectTrigger className="h-9 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui">
                        <SelectValue placeholder={filter.placeholder} />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        {filter.options?.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-sm font-ui"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {filter.type === "date" && (
                    <Input
                      type="date"
                      value={filterValues[filter.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(filter.key, e.target.value)
                      }
                      className="h-9 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui"
                    />
                  )}
                  {filter.type === "number" && (
                    <Input
                      type="number"
                      value={filterValues[filter.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(filter.key, e.target.value)
                      }
                      placeholder={filter.placeholder}
                      className="h-9 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui"
                    />
                  )}
                  {filter.type === "checkbox" && filter.options && (
                    <div className="space-y-2">
                      {filter.options.map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={`${filter.key}-${option.value}`}
                            checked={
                              filterValues[filter.key]?.includes(
                                option.value
                              ) || false
                            }
                            onCheckedChange={(checked) => {
                              const currentValues =
                                filterValues[filter.key] || [];
                              const newValues = checked
                                ? [...currentValues, option.value]
                                : currentValues.filter(
                                    (v: string) => v !== option.value
                                  );
                              handleFilterChange(filter.key, newValues);
                            }}
                          />
                          <Label
                            htmlFor={`${filter.key}-${option.value}`}
                            className="text-sm font-ui cursor-pointer"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleApply}
                  className="flex-1 h-9 bg-design-dark hover:bg-design-dark/90 text-white rounded-lg font-ui hover-scale micro-bounce"
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="h-9 px-4 border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui hover-scale"
                >
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

