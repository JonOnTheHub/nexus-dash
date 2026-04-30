"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
    DELIVERED: "bg-[var(--neon)]/10 text-[var(--neon)] border-[var(--neon)]/20",
    SHIPPED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    PROCESSING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    PENDING: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
    REFUNDED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

type OrderItem = {
    quantity: number;
    unitPrice: number;
    product: { name: string };
};

type Order = {
    id: string;
    total: number;
    status: string;
    createdAt: Date;
    customer: { name: string; email: string; city: string | null };
    items: OrderItem[];
};

interface Props {
    orders: Order[];
}

export default function OrdersTable({ orders }: Props) {
    const [expanded, setExpanded] = useState<string | null>(null);

    const toggle = (id: string) =>
        setExpanded((prev) => (prev === id ? null : id));

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border">
                        {["Customer", "City", "Items", "Total", "Status", "Date", ""].map(
                            (h, i) => (
                                <th
                                    key={i}
                                    className="text-left text-[10px] font-mono tracking-widest uppercase text-muted-foreground pb-3 pr-4 last:pr-0"
                                >
                                    {h}
                                </th>
                            )
                        )}
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order, i) => (
                        <>
                            <motion.tr
                                key={order.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 120,
                                    damping: 18,
                                    delay: i * 0.03,
                                }}
                                onClick={() => toggle(order.id)}
                                className={cn(
                                    "border-b border-border/50 cursor-pointer transition-colors duration-150",
                                    expanded === order.id
                                        ? "bg-surface-raised"
                                        : "hover:bg-surface-raised"
                                )}
                            >
                                <td className="py-3 pr-4">
                                    <p className="font-medium text-foreground">
                                        {order.customer.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {order.customer.email}
                                    </p>
                                </td>
                                <td className="py-3 pr-4 text-muted-foreground font-mono text-xs">
                                    {order.customer.city ?? "—"}
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
                                <td className="py-3 pr-4 text-xs text-muted-foreground font-mono">
                                    {formatDate(order.createdAt)}
                                </td>
                                <td className="py-3 text-muted-foreground">
                                    {expanded === order.id ? (
                                        <CaretUp size={13} />
                                    ) : (
                                        <CaretDown size={13} />
                                    )}
                                </td>
                            </motion.tr>

                            {/* Expanded row */}
                            <AnimatePresence>
                                {expanded === order.id && (
                                    <tr key={`${order.id}-expanded`}>
                                        <td colSpan={7} className="p-0">
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 py-3 bg-surface-raised border-b border-border/50">
                                                    <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-3">
                                                        Order Items
                                                    </p>
                                                    <div className="flex flex-col gap-2">
                                                        {order.items.map((item, j) => (
                                                            <div
                                                                key={j}
                                                                className="flex items-center justify-between text-xs"
                                                            >
                                                                <span className="text-foreground">
                                                                    {item.product.name}
                                                                </span>
                                                                <div className="flex items-center gap-6 font-mono text-muted-foreground">
                                                                    <span>×{item.quantity}</span>
                                                                    <span className="text-foreground">
                                                                        {formatCurrency(
                                                                            item.unitPrice * item.quantity
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/50">
                                                        <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                                                            Order ID
                                                        </span>
                                                        <span className="text-[10px] font-mono text-muted-foreground">
                                                            {order.id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </>
                    ))}
                </tbody>
            </table>
        </div>
    );
}