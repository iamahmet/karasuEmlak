"use client";

import { ReactNode } from "react";
import { cn } from "@karasu/lib";

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
  gap?: "none" | "sm" | "md" | "lg" | "xl";
}

export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
  gap = "md",
}: ResponsiveGridProps) {
  const gapClasses = {
    none: "gap-0",
    sm: "gap-2 sm:gap-3",
    md: "gap-3 sm:gap-4 md:gap-5",
    lg: "gap-4 sm:gap-5 md:gap-6",
    xl: "gap-5 sm:gap-6 md:gap-8",
  };

  const gridColsMap: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };

  const mobileCols = cols.mobile || 1;
  const tabletCols = cols.tablet || mobileCols;
  const desktopCols = cols.desktop || tabletCols;
  const wideCols = cols.wide || desktopCols;

  return (
    <div
      className={cn(
        "grid",
        gridColsMap[mobileCols] || "grid-cols-1",
        tabletCols !== mobileCols && (gridColsMap[tabletCols] ? `sm:${gridColsMap[tabletCols]}` : ""),
        desktopCols !== tabletCols && (gridColsMap[desktopCols] ? `md:${gridColsMap[desktopCols]}` : ""),
        wideCols !== desktopCols && (gridColsMap[wideCols] ? `lg:${gridColsMap[wideCols]}` : ""),
        gapClasses[gap],
        "touch-manipulation", // Optimize touch interactions
        className
      )}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </div>
  );
}
