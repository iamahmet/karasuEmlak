"use client";

import { ReactNode } from "react";
import { cn } from "@karasu/lib";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "narrow" | "wide" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

export function ResponsiveContainer({
  children,
  className,
  variant = "default",
  padding = "md",
}: ResponsiveContainerProps) {
  const variantClasses = {
    default: "max-w-7xl",
    narrow: "max-w-4xl",
    wide: "max-w-[90rem]",
    full: "max-w-full",
  };

  const paddingClasses = {
    none: "",
    sm: "px-3 sm:px-4",
    md: "px-4 sm:px-6 lg:px-8",
    lg: "px-6 sm:px-8 lg:px-12",
  };

  return (
    <div
      className={cn(
        "w-full mx-auto",
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
