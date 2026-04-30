"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import type { RevenueDataPoint } from "@/types";

interface Props {
  data: RevenueDataPoint[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="fluted-glass rounded-lg px-3 py-2 border border-border text-xs font-mono">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="text-[var(--neon)]">
        ${payload[0]?.value?.toLocaleString()}
      </p>
      <p className="text-muted-foreground">{payload[1]?.value} orders</p>
    </div>
  );
}

export default function RevenueChart({ data }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.35 }}
      className="fluted-glass rounded-xl border border-border p-5 col-span-2"
    >
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
          Revenue — Last 30 Days
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] animate-pulse" />
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="neonGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--neon)" stopOpacity={0.18} />
              <stop offset="95%" stopColor="var(--neon)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(1 0 0 / 5%)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "oklch(0.45 0 0)" }}
            axisLine={false}
            tickLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "oklch(0.45 0 0)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--neon)"
            strokeWidth={2}
            fill="url(#neonGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "var(--neon)", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}