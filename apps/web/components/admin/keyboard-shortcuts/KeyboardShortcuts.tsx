"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@karasu/ui";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcuts({ open, onOpenChange }: KeyboardShortcutsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "tr";

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Command Palette
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // Already handled by AdminLayout
      }
      
      // Quick Navigation
      if (e.key === "p" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        router.push(`/${locale}/seo/content-studio?tab=create`);
      }
      
      // Dashboard
      if (e.key === "d" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        router.push(`/${locale}/dashboard`);
      }
      
      // Show Shortcuts
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [router, locale, onOpenChange]);

  const shortcuts = [
    {
      category: "Navigation",
      items: [
        { keys: ["⌘", "K"], description: "Open command palette" },
        { keys: ["⌘", "P"], description: "Create new content" },
        { keys: ["⌘", "⇧", "D"], description: "Go to dashboard" },
        { keys: ["⌘", "/"], description: "Show keyboard shortcuts" },
      ],
    },
    {
      category: "General",
      items: [
        { keys: ["Esc"], description: "Close modals/dialogs" },
        { keys: ["⌘", "S"], description: "Save (when editing)" },
        { keys: ["⌘", "Enter"], description: "Submit forms" },
      ],
    },
  ];

  const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <Keyboard className="h-5 w-5 text-design-light" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="text-sm text-design-gray dark:text-gray-400 font-ui">
            Use these shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h3 className="text-sm font-semibold text-design-dark dark:text-white mb-3 font-ui uppercase tracking-wider">
                {category.category}
              </h3>
              <div className="space-y-2">
                {category.items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#E7E7E7] dark:hover:bg-[#062F28] transition-colors"
                  >
                    <span className="text-sm text-design-gray dark:text-gray-400 font-ui">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-mono bg-[#E7E7E7] dark:bg-[#062F28] border border-[#E7E7E7] dark:border-[#062F28] rounded text-design-dark dark:text-white min-w-[24px] text-center"
                        >
                          {key === "⌘" && !isMac ? "Ctrl" : key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-[#E7E7E7] dark:border-[#062F28]">
          <p className="text-xs text-design-gray dark:text-gray-400 text-center font-ui">
            Press <kbd className="px-1.5 py-0.5 bg-[#E7E7E7] dark:bg-[#062F28] rounded text-xs">Esc</kbd> to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

