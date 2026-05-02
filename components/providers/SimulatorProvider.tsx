"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SimulatorProvider() {
    const router = useRouter();
    const interval = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        async function tick() {
            try {
                await fetch("/api/simulate/cron", { method: "POST" });
                router.refresh();
            } catch { }
        }

        interval.current = setInterval(tick, 60000);

        return () => {
            if (interval.current) clearInterval(interval.current);
        };
    }, [router]);

    return null;
}