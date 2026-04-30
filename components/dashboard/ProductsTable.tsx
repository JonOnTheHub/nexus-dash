"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Package, WarningCircle } from "@phosphor-icons/react";
import { formatCurrency, cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<string, string> = {
    ELECTRONICS: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    APPAREL: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    HOME: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    BEAUTY: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    SPORTS: "bg-[var(--neon)]/10 text-[var(--neon)] border-[var(--neon)]/20",
    FOOD: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

type Product = {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    isActive: boolean;
    _count: { orderItems: number };
};

interface Props {
    products: Product[];
}

function StockBar({ stock }: { stock: number }) {
    const max = 200;
    const pct = Math.min((stock / max) * 100, 100);
    const color =
        stock <= 10
            ? "bg-destructive"
            : stock <= 30
                ? "bg-yellow-400"
                : "bg-[var(--neon)]";

    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                <motion.div
                    className={cn("h-full rounded-full", color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </div>
            <span
                className={cn(
                    "text-xs font-mono",
                    stock <= 10 ? "text-destructive" : "text-muted-foreground"
                )}
            >
                {stock}
            </span>
            {stock <= 10 && (
                <WarningCircle size={13} className="text-destructive" weight="fill" />
            )}
        </div>
    );
}

const CATEGORIES = ["ALL", "ELECTRONICS", "APPAREL", "HOME", "BEAUTY", "SPORTS", "FOOD"];

export default function ProductsTable({ products }: Props) {
    const [filter, setFilter] = useState("ALL");

    const filtered =
        filter === "ALL"
            ? products
            : products.filter((p) => p.category === filter);

    return (
        <div className="flex flex-col gap-4">
            {/* Category filter */}
            <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((c) => (
                    <button
                        key={c}
                        onClick={() => setFilter(c)}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-mono tracking-widest uppercase transition-all duration-200 border ${filter === c
                                ? "bg-[var(--neon)] text-[var(--neon-fg)] border-[var(--neon)]"
                                : "border-border text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            {["Product", "SKU", "Category", "Price", "Stock", "Orders", "Status"].map(
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
                        {filtered.map((product, i) => (
                            <motion.tr
                                key={product.id}
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
                                        <div className="w-7 h-7 rounded-md bg-surface-raised border border-border flex items-center justify-center shrink-0">
                                            <Package size={13} className="text-muted-foreground" />
                                        </div>
                                        <span className="font-medium text-foreground">
                                            {product.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                                    {product.sku}
                                </td>
                                <td className="py-3 pr-4">
                                    <span
                                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wider border ${CATEGORY_STYLES[product.category]}`}
                                    >
                                        {product.category}
                                    </span>
                                </td>
                                <td className="py-3 pr-4 font-mono text-foreground">
                                    {formatCurrency(product.price)}
                                </td>
                                <td className="py-3 pr-4">
                                    <StockBar stock={product.stock} />
                                </td>
                                <td className="py-3 pr-4 font-mono text-muted-foreground">
                                    {product._count.orderItems}
                                </td>
                                <td className="py-3">
                                    <span
                                        className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wider border",
                                            product.isActive
                                                ? "bg-[var(--neon)]/10 text-[var(--neon)] border-[var(--neon)]/20"
                                                : "bg-border/20 text-muted-foreground border-border"
                                        )}
                                    >
                                        {product.isActive ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}