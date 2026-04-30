import { getCustomers } from "@/lib/data";
import CustomersTable from "@/components/dashboard/CustomersTable";

export default async function CustomersPage() {
    const customers = await getCustomers();

    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalOrders = customers.reduce((sum, c) => sum + c._count.orders, 0);
    const avgSpend = customers.length > 0 ? totalSpent / customers.length : 0;

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-foreground tracking-tight">
                        Customers
                    </h1>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {customers.length} total customers
                    </p>
                </div>
            </div>

            {/* Summary chips */}
            <div className="flex gap-3 flex-wrap">
                {[
                    { label: "Total Customers", value: customers.length, mono: true },
                    {
                        label: "Total Revenue",
                        value: new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                        }).format(totalSpent),
                        mono: true,
                    },
                    {
                        label: "Avg Spend",
                        value: new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                        }).format(avgSpend),
                        mono: true,
                    },
                    { label: "Total Orders", value: totalOrders, mono: true },
                ].map(({ label, value }) => (
                    <div
                        key={label}
                        className="fluted-glass rounded-lg px-4 py-2.5 border border-border flex items-center gap-3"
                    >
                        <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                            {label}
                        </span>
                        <span className="font-mono text-sm font-bold text-foreground">
                            {value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="fluted-glass rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground">
                        All Customers
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon)] animate-pulse" />
                </div>
                <CustomersTable customers={customers as never} />
            </div>
        </div>
    );
}