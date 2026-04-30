"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, MagnifyingGlass } from "@phosphor-icons/react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

type Customer = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    city: string | null;
    totalOrders: number;
    totalSpent: number;
    createdAt: Date;
    _count: { orders: number };
};

interface Props {
    customers: Customer[];
}

function SpendBar({ value, max }: { value: number; max: number }) {
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div className="w-20 h-1.5 rounded-full bg-border overflow-hidden">
            <motion.div
                className="h-full rounded-full bg-[var(--neon)]"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            />
        </div>
    );
}

export default function CustomersTable({ customers }: Props) {
    const [search, setSearch] = useState("");

    const maxSpend = Math.max(...customers.map((c) => c.totalSpent), 1);

    const filtered = customers.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase()) ||
            (c.city ?? "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative w-full max-w-sm">
                <MagnifyingGlass
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                    type="text"
                    placeholder="Search customers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 rounded-md bg-surface-raised border border-border text-sm text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:border-[var(--neon)]/50 focus:ring-1 focus:ring-[var(--neon)]/20 transition-all duration-200"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            {["Customer", "City", "Orders", "Total Spent", "Spend", "Joined"].map(
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
                        {filtered.map((customer, i) => (
                            <motion.tr
                                key={customer.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 120,
                                    damping: 18,
                                    delay: i * 0.03,
                                }}
                                className="border-b border-border/50 hover:bg-surface-raised transition-colors duration-150"
                            >
                                <td className="py-3 pr-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-[var(--neon)]/10 border border-[var(--neon)]/20 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-mono font-bold text-[var(--neon)]">
                                                {customer.name.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {customer.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {customer.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 pr-4 text-xs font-mono text-muted-foreground">
                                    {customer.city ?? "—"}
                                </td>
                                <td className="py-3 pr-4 font-mono text-muted-foreground">
                                    {customer._count.orders}
                                </td>
                                <td className="py-3 pr-4 font-mono text-foreground font-medium">
                                    {formatCurrency(customer.totalSpent)}
                                </td>
                                <td className="py-3 pr-4">
                                    <SpendBar value={customer.totalSpent} max={maxSpend} />
                                </td>
                                <td className="py-3 text-xs text-muted-foreground font-mono">
                                    {formatDate(customer.createdAt)}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <User size={32} className="text-muted-foreground" weight="thin" />
                        <p className="text-sm text-muted-foreground font-mono">
                            No customers found
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}