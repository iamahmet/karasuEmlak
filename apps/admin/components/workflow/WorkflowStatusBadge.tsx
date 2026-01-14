"use client";

import { Badge } from "@karasu/ui";
import { cn } from "@karasu/lib";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Archive,
  AlertCircle,
} from "lucide-react";

export type WorkflowStatus = "draft" | "review" | "approved" | "rejected" | "published" | "archived" | "changes_requested";

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
  className?: string;
  showIcon?: boolean;
}

export function WorkflowStatusBadge({
  status,
  className,
  showIcon = true,
}: WorkflowStatusBadgeProps) {
  const statusConfig = {
    draft: {
      label: "Taslak",
      icon: FileText,
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    },
    review: {
      label: "İncelemede",
      icon: Clock,
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    },
    approved: {
      label: "Onaylandı",
      icon: CheckCircle2,
      className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    },
    rejected: {
      label: "Reddedildi",
      icon: XCircle,
      className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    },
    published: {
      label: "Yayında",
      icon: Eye,
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    },
    archived: {
      label: "Arşivlendi",
      icon: Archive,
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    },
    changes_requested: {
      label: "Değişiklik Gerekli",
      icon: AlertCircle,
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        "text-[10px] px-2 py-0.5 font-ui font-semibold flex items-center gap-1",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
