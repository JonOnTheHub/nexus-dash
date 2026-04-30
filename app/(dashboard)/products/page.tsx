import { getProducts } from "@/lib/data";
import ProductsTable from "@/components/dashboard/ProductsTable";

export default async function ProductsPage() {
    const products = await getProducts();

    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStock = products.filter((p) => p.stock <= 10).length;
    const totalProducts = products.length;

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-foreground tracking-tight">
                        Products
                    </h1>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {totalProducts} products · {totalStock} units in stock
                    </p>
                </div>
            </div>

            {/* Summary chips */}
            <div className="flex gap-3 flex-wrap">
                <div className="fluted-glass rounded-lg px-4 py-2.5 border border-border flex items-center gap-3">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                        Total SKUs
                    </span>
                    <span className="font-mono text-sm font-bold text-foreground">
                        {totalProducts}
                    </span>
                </div>
                <div className="fluted-glass rounded-lg px-4 py-2.5 border border-border flex items-center gap-3">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                        Units in Stock
                    </span>
                    <span className="font-mono text-sm font-bold text-foreground">
                        {totalStock}
                    </span>
                </div>
                <div
                    className={`fluted-glass rounded-lg px-4 py-2.5 border flex items-center gap-3 ${lowStock > 0
                        ? "border-destructive/30 bg-destructive/5"
                        : "border-border"
                        }`}
                >
                    <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                        Low Stock
                    </span>
                    <span
                        className={`font-mono text-sm font-bold ${lowStock > 0 ? "text-destructive" : "text-foreground"
                            }`}
                    >
                        {lowStock}
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="fluted-glass rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
                        Inventory
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] animate-pulse" />
                </div>
                <ProductsTable products={products as never} />
            </div>
        </div>
    );
}