function SkeletonBlock({ className }: { className?: string }) {
    return (
        <div
            className={`rounded-lg bg-surface-raised relative overflow-hidden ${className}`}
        >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        </div>
    );
}

export default function DashboardLoading() {
    return (
        <div className="flex flex-col gap-6">
            {/* AI Banner skeleton */}
            <SkeletonBlock className="h-16 w-full" />

            {/* Metric cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="fluted-glass rounded-xl p-5 border border-border flex flex-col gap-4"
                    >
                        <div className="flex items-center justify-between">
                            <SkeletonBlock className="h-3 w-20" />
                            <SkeletonBlock className="h-2 w-2 rounded-full" />
                        </div>
                        <SkeletonBlock className="h-8 w-32" />
                        <SkeletonBlock className="h-3 w-24" />
                    </div>
                ))}
            </div>

            {/* Chart skeleton */}
            <div className="grid grid-cols-2 gap-4">
                <div className="fluted-glass rounded-xl border border-border p-5 col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <SkeletonBlock className="h-3 w-40" />
                        <SkeletonBlock className="h-2 w-2 rounded-full" />
                    </div>
                    <SkeletonBlock className="h-[220px] w-full" />
                </div>
            </div>

            {/* Recent orders skeleton */}
            <div className="fluted-glass rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-5">
                    <SkeletonBlock className="h-3 w-28" />
                    <SkeletonBlock className="h-2 w-2 rounded-full" />
                </div>
                <div className="flex flex-col gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 py-2">
                            <div className="flex flex-col gap-1.5 flex-1">
                                <SkeletonBlock className="h-3 w-32" />
                                <SkeletonBlock className="h-2.5 w-24" />
                            </div>
                            <SkeletonBlock className="h-3 w-8" />
                            <SkeletonBlock className="h-3 w-16" />
                            <SkeletonBlock className="h-5 w-20 rounded-md" />
                            <SkeletonBlock className="h-3 w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}