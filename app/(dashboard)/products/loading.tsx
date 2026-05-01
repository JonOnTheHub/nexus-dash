function SkeletonBlock({ className }: { className?: string }) {
    return (
        <div className={`rounded-lg bg-surface-raised relative overflow-hidden ${className}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        </div>
    );
}

export default function ProductsLoading() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <SkeletonBlock className="h-5 w-28" />
                <SkeletonBlock className="h-3 w-48" />
            </div>

            <div className="flex gap-3 flex-wrap">
                {[...Array(3)].map((_, i) => (
                    <SkeletonBlock key={i} className="h-10 w-36 rounded-lg" />
                ))}
            </div>

            <div className="fluted-glass rounded-xl border border-border p-5">
                <div className="flex gap-2 mb-6 flex-wrap">
                    {[...Array(7)].map((_, i) => (
                        <SkeletonBlock key={i} className="h-7 w-20 rounded-md" />
                    ))}
                </div>
                <div className="flex flex-col gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 py-2 border-b border-border/50">
                            <div className="flex items-center gap-2.5 flex-1">
                                <SkeletonBlock className="h-7 w-7 rounded-md shrink-0" />
                                <SkeletonBlock className="h-3 w-40" />
                            </div>
                            <SkeletonBlock className="h-3 w-16" />
                            <SkeletonBlock className="h-5 w-24 rounded-md" />
                            <SkeletonBlock className="h-3 w-16" />
                            <SkeletonBlock className="h-2 w-20 rounded-full" />
                            <SkeletonBlock className="h-3 w-8" />
                            <SkeletonBlock className="h-5 w-16 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}