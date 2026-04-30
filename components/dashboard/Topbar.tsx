"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { MagnifyingGlass, Bell } from "@phosphor-icons/react";

const LABELS: Record<string, string> = {
  "/":             "Overview",
  "/orders":       "Orders",
  "/products":     "Products",
  "/customers":    "Customers",
  "/ai-assistant": "AI Assistant",
};

export default function Topbar() {
  const pathname = usePathname();
  const label = LABELS[pathname] ?? "Dashboard";

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-border bg-background/60 backdrop-blur-md"
    >
      {/* Page title */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-mono tracking-widest uppercase">
          {label}
        </span>
        {/* live pulse */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-neon" />
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-all duration-200 hover:glow-neon">
          <MagnifyingGlass size={17} />
        </button>
        <button className="relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-all duration-200">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-neon" />
        </button>

        {/* Avatar */}
        <div className="ml-1 w-7 h-7 rounded-full bg-neon flex items-center justify-center text-neon-fg text-xs font-bold font-mono cursor-pointer hover:glow-neon-strong transition-all duration-200">
          J
        </div>
      </div>
    </motion.header>
  );
}