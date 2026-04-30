"use client";

import { motion } from "framer-motion";
import { TrendUp, TrendDown, Minus } from "@phosphor-icons/react";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  format?: "currency" | "number";
  delta?: number;
  deltaLabel?: string;
  trend?: "up" | "down" | "neutral";
  index?: number;
}

function useCountUp(target: number, duration = 1200) {
  const [current, setCurrent] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
      else setCurrent(target);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return current;
}

export default function MetricCard({
  label,
  value,
  format = "number",
  delta,
  deltaLabel,
  trend = "neutral",
  index = 0,
}: MetricCardProps) {
  const counted = useCountUp(value);

  const displayed =
    format === "currency" ? formatCurrency(counted) : formatNumber(counted);

  const TrendIcon =
    trend === "up" ? TrendUp : trend === "down" ? TrendDown : Minus;

  const trendColor =
    trend === "up"
      ? "text-[var(--neon)]"
      : trend === "down"
      ? "text-destructive"
      : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 18,
        delay: index * 0.08,
      }}
      whileHover={{ y: -2, boxShadow: "var(--glow-neon)" }}
      className="fluted-glass rounded-xl p-5 border border-border flex flex-col gap-4 cursor-default transition-shadow duration-200"
    >
      {/* Label + live dot */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
          {label}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] animate-pulse" />
      </div>

      {/* Value */}
      <div className="font-mono text-3xl font-bold tracking-tight text-foreground">
        {displayed}
      </div>

      {/* Delta */}
      {delta !== undefined && (
        <div className={cn("flex items-center gap-1.5 text-xs font-mono", trendColor)}>
          <TrendIcon size={13} weight="bold" />
          <span>
            {delta > 0 ? "+" : ""}
            {delta}% {deltaLabel ?? "vs last 30d"}
          </span>
        </div>
      )}
    </motion.div>
  );
}