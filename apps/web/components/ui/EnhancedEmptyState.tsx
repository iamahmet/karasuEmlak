"use client";

import { FileText, Search, Home, AlertCircle } from "lucide-react";
import { Button } from "@karasu/ui";
import Link from "next/link";
import { cn } from "@karasu/lib";

interface EnhancedEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function EnhancedEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EnhancedEmptyStateProps) {
  const defaultIcon = icon || <FileText className="h-12 w-12 text-gray-400" />;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 md:py-24 px-4 text-center",
      className
    )}>
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-full">
        {defaultIcon}
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
        {title}
      </h3>
      <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      {action && (
        <Button
          size="lg"
          className="bg-[#006AFF] hover:bg-[#0052CC] text-white px-6 py-3 font-semibold"
          asChild
        >
          <Link href={action.href}>
            {action.label}
          </Link>
        </Button>
      )}
    </div>
  );
}
