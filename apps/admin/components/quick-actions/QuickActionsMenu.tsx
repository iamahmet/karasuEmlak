"use client";

import { Button } from "@karasu/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@karasu/ui";
import { Plus, Sparkles, FileText, Image, Video, Link2 } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/routing";

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
}

export function QuickActionsMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "tr";

  const actions: QuickAction[] = [
    {
      label: "Create Article",
      icon: FileText,
      action: () => router.push(`/${locale}/seo/content-studio?tab=create&type=blog`),
      shortcut: "⌘P",
    },
    {
      label: "Create Cornerstone",
      icon: Sparkles,
      action: () => router.push(`/${locale}/seo/content-studio?tab=create&type=cornerstone`),
    },
    {
      label: "Upload Image",
      icon: Image,
      action: () => {
        // Trigger file upload
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.click();
      },
    },
    {
      label: "Upload Video",
      icon: Video,
      action: () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "video/*";
        input.click();
      },
    },
    {
      label: "Add Link",
      icon: Link2,
      action: () => {
        // Open link dialog
        const url = prompt("Enter URL:");
        if (url) {
          // Handle link insertion
          console.log("Insert link:", url);
        }
      },
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-9 px-3 bg-design-dark hover:bg-design-dark/90 text-white rounded-lg font-ui hover-scale micro-bounce"
        >
          <Plus className="h-4 w-4 mr-2" />
          Quick Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-lg">
        <DropdownMenuLabel className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400">
          Quick Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={index}
              onClick={action.action}
              className="flex items-center gap-2 cursor-pointer font-ui text-sm px-3 py-2"
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{action.label}</span>
              {action.shortcut && (
                <kbd className="text-[10px] px-1.5 py-0.5 bg-[#E7E7E7] dark:bg-[#062F28] rounded font-mono">
                  {action.shortcut}
                </kbd>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

