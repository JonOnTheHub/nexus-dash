"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";

export default function NotFound() {
    return (
        <div className="relative min-h-[100dvh] flex items-center justify-center bg-background overflow-hidden">
            {/* Grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
            linear-gradient(var(--neon) 1px, transparent 1px),
            linear-gradient(90deg, var(--neon) 1px, transparent 1px)
          `,
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Glow */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, oklch(0.96 0.234 120.7 / 0.05) 0%, transparent 70%)",
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="relative z-10 flex flex-col items-center gap-6 text-center px-4"
            >
                {/* Glitchy 404 */}
                <div className="relative">
                    <span
                        className="font-orbitron font-bold text-[120px] leading-none text-neon select-none"
                        style={{ textShadow: "0 0 40px oklch(0.96 0.234 120.7 / 0.4)" }}
                    >
                        404
                    </span>
                    <motion.span
                        className="absolute inset-0 font-mono font-bold text-[120px] leading-none text-destructive select-none opacity-0"
                        animate={{
                            opacity: [0, 0.6, 0],
                            x: [0, -4, 0],
                        }}
                        transition={{
                            duration: 0.15,
                            repeat: Infinity,
                            repeatDelay: 3,
                        }}
                    >
                        404
                    </motion.span>
                </div>

                <div className="flex flex-col gap-2">
                    <p className="text-sm font-mono tracking-widest uppercase text-muted-foreground">
                        Route not found
                    </p>
                    <p className="text-xs text-muted-foreground max-w-xs">
                        This page doesn&apos;t exist in the system. Navigate back to the dashboard.
                    </p>
                </div>

                <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neon text-neon-fg text-sm font-mono font-bold tracking-widest uppercase hover:glow-neon-strong transition-all duration-200"
                >
                    <ArrowLeft size={14} weight="bold" />
                    Back to Dashboard
                </Link>
            </motion.div>
        </div>
    );
}