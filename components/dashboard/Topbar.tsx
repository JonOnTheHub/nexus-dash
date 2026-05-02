"use client";

import { usePathname } from "next/navigation";
import { MagnifyingGlass, Bell, List } from "@phosphor-icons/react";
import { useSidebar } from "@/components/providers/SidebarProvider";

const LABELS: Record<string, string> = {
  "/": "Overview",
  "/orders": "Orders",
  "/products": "Products",
  "/customers": "Customers",
  "/ai-assistant": "AI Assistant",
};

export default function Topbar() {
  const pathname = usePathname();
  const label = LABELS[pathname] ?? "Dashboard";
  const { openMobile } = useSidebar();

  return (
    <header className="h-14 shrink-0 sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger — inline in topbar */}
        <button
          onClick={openMobile}
          className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-all duration-200"
        >
          <List size={18} />
        </button>

        <span className="font-orbitron text-xs tracking-widest uppercase text-muted-foreground">
          {label}
        </span>

        {/* live pulse */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-neon" />
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-all duration-200">
          <MagnifyingGlass size={17} />
        </button>
        <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-all duration-200">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-neon" />
        </button>
        <div className="ml-1 w-7 h-7 rounded-full bg-neon flex items-center justify-center text-neon-fg text-xs font-bold font-orbitron cursor-pointer hover:glow-neon-strong transition-all duration-200">
          J
        </div>
      </div>
    </header>
  );
}