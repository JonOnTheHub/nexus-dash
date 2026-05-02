"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
    SquaresFour, ShoppingCart, Package, Users,
    Robot, SignOut, X,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useSidebar } from "@/components/providers/SidebarProvider";

const NAV = [
    { href: "/", label: "Overview", icon: SquaresFour },
    { href: "/orders", label: "Orders", icon: ShoppingCart },
    { href: "/products", label: "Products", icon: Package },
    { href: "/customers", label: "Customers", icon: Users },
    { href: "/ai-assistant", label: "AI Assistant", icon: Robot },
];

const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const item: Variants = {
    hidden: { opacity: 0, x: -12 },
    show: {
        opacity: 1,
        x: 0,
        transition: { type: "spring" as const, stiffness: 120, damping: 18 },
    },
};

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();

    return (
        <>
            <div className="px-3 mb-8">
                <span className="font-orbitron text-lg font-bold tracking-widest text-neon uppercase">
                    Nexus
                </span>
                <span className="block text-[10px] text-muted-foreground tracking-[0.2em] uppercase mt-0.5 font-mono">
                    Dashboard
                </span>
            </div>

            <motion.nav
                variants={container}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-1 flex-1"
            >
                {NAV.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                        <motion.div key={href} variants={item}>
                            <Link
                                href={href}
                                onClick={onNavigate}
                                className={cn(
                                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200",
                                    active
                                        ? "text-neon-fg bg-neon"
                                        : "text-muted-foreground hover:text-foreground hover:bg-surface-raised"
                                )}
                            >
                                {active && (
                                    <motion.span
                                        layoutId="nav-glow"
                                        className="absolute inset-0 rounded-md glow-neon"
                                        transition={{ type: "spring", stiffness: 120, damping: 18 }}
                                    />
                                )}
                                <Icon
                                    size={17}
                                    weight={active ? "fill" : "regular"}
                                    className="shrink-0 relative z-10"
                                />
                                <span className="relative z-10 font-medium">{label}</span>
                                {active && (
                                    <motion.span
                                        layoutId="nav-bar"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full bg-neon-fg"
                                    />
                                )}
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.nav>

            <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-all duration-200 w-full"
            >
                <SignOut size={17} />
                <span className="font-medium">Sign out</span>
            </button>
        </>
    );
}

export default function Sidebar() {
    const { mobileOpen, closeMobile } = useSidebar();

    return (
        <>
            {/* Desktop */}
            <aside className="fluted-glass hidden md:flex flex-col w-[220px] shrink-0 min-h-[100dvh] border-r border-border px-3 py-6">
                <NavContent />
            </aside>

            {/* Mobile backdrop */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeMobile}
                        className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Mobile drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.aside
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        className="md:hidden fixed top-0 left-0 z-50 h-[100dvh] w-[240px] fluted-glass border-r border-border flex flex-col px-3 py-6"
                    >
                        <button
                            onClick={closeMobile}
                            className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={16} />
                        </button>
                        <NavContent onNavigate={closeMobile} />
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}