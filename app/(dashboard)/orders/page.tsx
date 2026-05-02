export const dynamic = "force-dynamic";

import { getOrders } from "@/lib/data";
import OrdersTable from "@/components/dashboard/OrdersTable";
import Link from "next/link";

const STATUSES = [
    "ALL",
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
];

interface Props {
    searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function OrdersPage({ searchParams }: Props) {
    const { status, page } = await searchParams;
    const activeStatus = status && status !== "ALL" ? status : undefined;
    const currentPage = parseInt(page ?? "1");

    const { orders, total, pages } = await getOrders({
        status: activeStatus,
        page: currentPage,
        limit: 20,
    });

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-foreground tracking-tight">
                        Orders
                    </h1>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {total} total orders
                    </p>
                </div>
            </div>

            {/* Status filter */}
            <div className="flex gap-2 flex-wrap">
                {STATUSES.map((s) => {
                    const active = (status ?? "ALL") === s;
                    return (
                        <Link
                            key={s}
                            href={`/orders?status=${s}`}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-mono tracking-widest uppercase transition-all duration-200 border ${active
                                    ? "bg-[var(--neon)] text-[var(--neon-fg)] border-[var(--neon)]"
                                    : "border-border text-muted-foreground hover:text-foreground hover:border-border-bright"
                                }`}
                        >
                            {s}
                        </Link>
                    );
                })}
            </div>

            {/* Table */}
            <div className="fluted-glass rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
                        {activeStatus ?? "All Orders"}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] animate-pulse" />
                </div>
                <OrdersTable orders={orders} />
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex items-center gap-2 justify-end">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                        <Link
                            key={p}
                            href={`/orders?status=${status ?? "ALL"}&page=${p}`}
                            className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-mono border transition-all duration-200 ${p === currentPage
                                    ? "bg-[var(--neon)] text-[var(--neon-fg)] border-[var(--neon)]"
                                    : "border-border text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {p}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}