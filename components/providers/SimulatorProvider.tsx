"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SimulatorProvider() {
    const router = useRouter();
    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        started.current = true;

        // Start the simulator loop
        fetch("/api/simulate/start", { method: "POST" }).catch(() => { });

        // Connect to SSE stream for live refresh
        const source = new EventSource("/api/simulate/stream");

        source.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.type === "tick") {
                    router.refresh();
                }
            } catch {
                // silent
            }
        };

        source.onerror = () => {
            source.close();
        };

        return () => {
            source.close();
        };
    }, [router]);

    return null;
}