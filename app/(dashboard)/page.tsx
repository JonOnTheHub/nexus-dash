export const dynamic = "force-dynamic";

import { getOverviewMetrics, getRevenueChart, getRecentOrders } from "@/lib/data";
import MetricCard from "@/components/dashboard/MetricCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import AIInsightsBanner from "@/components/dashboard/AIInsightsBanner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

const STATUS_STYLES: Record<string, string> = {
    DELIVERED: "bg-[var(--neon)]/10 text-[var(--neon)] border-[var(--neon)]/20",
    SHIPPED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    PROCESSING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    PENDING: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
    REFUNDED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default async function OverviewPage() {
    const [metrics, chartData, recentOrders, latestOrder] = await Promise.all([
        getOverviewMetrics(),
        getRevenueChart(),
        getRecentOrders(8),
        prisma.order.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    ]);

    const METRIC_CARDS: {
        label: string;
        value: number;
        format: "currency" | "number";
        delta?: number;
        deltaLabel?: string;
        trend: "up" | "down" | "neutral";
    }[] = [
            {
                label: "Revenue",
                value: Math.round(metrics.revenue),
                format: "currency",
                delta: metrics.revenueDelta,
                trend: metrics.revenueDelta >= 0 ? "up" : "down",
            },
            {
                label: "Orders",
                value: metrics.orders,
                format: "number",
                delta: metrics.ordersDelta,
                trend: metrics.ordersDelta >= 0 ? "up" : "down",
            },
            {
                label: "Customers",
                value: metrics.customers,
                format: "number",
                deltaLabel: `${metrics.newCustomers} new this month`,
                trend: "neutral",
            },
            {
                label: "Low Stock",
                value: metrics.lowStock,
                format: "number",
                deltaLabel: "products under 10 units",
                trend: metrics.lowStock > 3 ? "down" : "neutral",
            },
        ];

    return (
        <div className="flex flex-col gap-6">
            <AIInsightsBanner refreshKey={latestOrder?.createdAt.getTime() ?? 0} />

            {/* Metric cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {METRIC_CARDS.map((card, i) => (
                    <MetricCard key={card.label} {...card} index={i} />
                ))}
            </div>

            {/* Chart */}
            <div className="grid grid-cols-2 gap-4">
                <RevenueChart data={chartData} />
            </div>

            {/* Recent orders */}
            <div className="fluted-glass rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
                        Recent Orders
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] animate-pulse" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                {["Customer", "Items", "Total", "Status", "Date"].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left text-[10px] font-mono tracking-widest uppercase text-muted-foreground pb-3 pr-4"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="border-b border-border/50 hover:bg-surface-raised transition-colors duration-150"
                                >
                                    <td className="py-3 pr-4">
                                        <p className="font-medium text-foreground">
                                            {order.customer.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {order.customer.email}
                                        </p>
                                    </td>
                                    <td className="py-3 pr-4 font-mono text-muted-foreground">
                                        {order.items.length}
                                    </td>
                                    <td className="py-3 pr-4 font-mono text-foreground">
                                        {formatCurrency(order.total)}
                                    </td>
                                    <td className="py-3 pr-4">
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wider border ${STATUS_STYLES[order.status]}`}
                                        >
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-3 text-xs text-muted-foreground font-mono">
                                        {formatDate(order.createdAt)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}