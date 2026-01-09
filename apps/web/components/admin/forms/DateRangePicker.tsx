"use client";

import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Label } from "@karasu/ui";
import { cn } from "@karasu/lib";

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onDateChange: (startDate: string, endDate: string) => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  className,
}: DateRangePickerProps) {
  const handleStartDateChange = (date: string) => {
    onDateChange(date, endDate || "");
  };

  const handleEndDateChange = (date: string) => {
    onDateChange(startDate || "", date);
  };

  const quickRanges = [
    { label: "Today", start: new Date().toISOString().split("T")[0], end: new Date().toISOString().split("T")[0] },
    {
      label: "Last 7 days",
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
    {
      label: "Last 30 days",
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
    {
      label: "This month",
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
      end: new Date().toISOString().split("T")[0],
    },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Label className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 mb-1 block">
            Start Date
          </Label>
          <Input
            type="date"
            value={startDate || ""}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="h-9 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui"
          />
        </div>
        <div className="flex-1">
          <Label className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 mb-1 block">
            End Date
          </Label>
          <Input
            type="date"
            value={endDate || ""}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="h-9 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickRanges.map((range) => (
          <Button
            key={range.label}
            variant="outline"
            size="sm"
            onClick={() => {
              handleStartDateChange(range.start);
              handleEndDateChange(range.end);
            }}
            className="h-7 px-2 text-xs border border-[#E7E7E7] dark:border-[#062F28] rounded-lg font-ui hover-scale"
          >
            {range.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

