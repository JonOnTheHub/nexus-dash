function SkeletonBlock({ className }: { className?: string }) {
    return (
        <div className={`rounded-lg bg-surface-raised relative overflow-hidden ${className}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        </div>
    );
}

export default function CustomersLoading() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <SkeletonBlock className="h-5 w-32" />
                <SkeletonBlock className="h-3 w-40" />
            </div>

            <div className="flex gap-3 flex-wrap">
                {[...Array(4)].map((_, i) => (
                    <SkeletonBlock key={i} className="h-10 w-36 rounded-lg" />
                ))}
            </div>

            <div className="fluted-glass rounded-xl border border-border p-5">
                <SkeletonBlock className="h-9 w-64 rounded-md mb-6" />
                <div className="flex flex-col gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 py-2 border-b border-border/50">
                            <div className="flex items-center gap-2.5 flex-1">
                                <SkeletonBlock className="h-7 w-7 rounded-full shrink-0" />
                                <div className="flex flex-col gap-1.5">
                                    <SkeletonBlock className="h-3 w-32" />
                                    <SkeletonBlock className="h-2.5 w-40" />
                                </div>
                            </div>
                            <SkeletonBlock className="h-3 w-16" />
                            <SkeletonBlock className="h-3 w-8" />
                            <SkeletonBlock className="h-3 w-20" />
                            <SkeletonBlock className="h-2 w-20 rounded-full" />
                            <SkeletonBlock className="h-3 w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}