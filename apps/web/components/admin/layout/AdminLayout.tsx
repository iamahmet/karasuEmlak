"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { CommandPalette } from "../command-palette/CommandPalette";
import { KeyboardShortcuts } from "../keyboard-shortcuts/KeyboardShortcuts";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.includes("/login") || pathname?.includes("/signup");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen((open) => !open);
      }
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#E7E7E7] via-white to-[#E7E7E7] dark:from-[#062F28] dark:via-[#062F28] dark:to-[#0a3d35] relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(159,232,112,0.05)_1px,transparent_0)] bg-[length:40px_40px] dark:bg-[radial-gradient(circle_at_2px_2px,rgba(159,232,112,0.03)_1px,transparent_0)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-design-light/5 via-transparent to-transparent dark:from-design-light/3 pointer-events-none"></div>
        
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64 relative z-10">
          <AdminHeader />
          <main role="main" className="flex-1 overflow-y-auto bg-transparent relative">{children}</main>
        </div>
      </div>
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
      <KeyboardShortcuts open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  );
}

