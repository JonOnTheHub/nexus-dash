function SkeletonBlock({ className }: { className?: string }) {
    return (
        <div className={`rounded-lg bg-surface-raised relative overflow-hidden ${className}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        </div>
    );
}

export default function OrdersLoading() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <SkeletonBlock className="h-5 w-24" />
                    <SkeletonBlock className="h-3 w-32" />
                </div>
            </div>

            <div className="flex gap-2 flex-wrap">
                {[...Array(7)].map((_, i) => (
                    <SkeletonBlock key={i} className="h-8 w-20 rounded-md" />
                ))}
            </div>

            <div className="fluted-glass rounded-xl border border-border p-5">
                <div className="flex flex-col gap-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 py-2 border-b border-border/50">
                            <div className="flex flex-col gap-1.5 flex-1">
                                <SkeletonBlock className="h-3 w-36" />
                                <SkeletonBlock className="h-2.5 w-28" />
                            </div>
                            <SkeletonBlock className="h-3 w-12" />
                            <SkeletonBlock className="h-3 w-8" />
                            <SkeletonBlock className="h-3 w-16" />
                            <SkeletonBlock className="h-5 w-24 rounded-md" />
                            <SkeletonBlock className="h-3 w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}