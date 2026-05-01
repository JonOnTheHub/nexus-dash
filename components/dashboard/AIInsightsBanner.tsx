"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Robot, X, ArrowsClockwise } from "@phosphor-icons/react";

interface Props {
  refreshKey: number;
}

export default function AIInsightsBanner({ refreshKey }: Props) {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const cancelRef = useRef(false);

  useEffect(() => {
    cancelRef.current = true; // cancels any in-flight stream

    const timer = setTimeout(() => {
      cancelRef.current = false;
      setInsight("");
      setLoading(true);
      setDismissed(false);

      fetch("/api/ai/insights", { cache: "no-store" })
        .then(async (res) => {
          if (!res.ok || !res.body) return;
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let text = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done || cancelRef.current) break;
            const chunk = decoder.decode(value, { stream: true });
            text = text + chunk;
            const captured = text;
            setInsight(captured);
            setLoading(false);
          }
        })
        .catch(() => setLoading(false));
    }, 0);

    return () => {
      clearTimeout(timer);
      cancelRef.current = true;
    };
  }, [refreshKey]);

  return (
    <AnimatePresence mode="wait">
      {!dismissed && (
        <motion.div
          key={refreshKey}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className="fluted-glass rounded-xl border border-[var(--neon)]/20 px-5 py-4 mb-6 flex items-start gap-3"
        >
          <div className="mt-0.5 p-1.5 rounded-md bg-[var(--neon)]/10 shrink-0">
            <Robot size={15} weight="fill" className="text-[var(--neon)]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-mono tracking-widest uppercase text-[var(--neon)]">
                AI Insight
              </p>
              {!loading && (
                <span className="text-[10px] font-mono text-muted-foreground">
                  · updated {new Date().toLocaleTimeString()}
                </span>
              )}
            </div>
            {loading ? (
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1 h-1 rounded-full bg-[var(--neon)]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground leading-relaxed">{insight}</p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                setInsight("");
                setLoading(true);
                cancelRef.current = false;
                fetch("/api/ai/insights", { cache: "no-store" })
                  .then(async (res) => {
                    if (!res.ok || !res.body) return;
                    const reader = res.body.getReader();
                    const decoder = new TextDecoder();
                    let text = "";
                    while (true) {
                      const { done, value } = await reader.read();
                      if (done || cancelRef.current) break;
                      const chunk = decoder.decode(value, { stream: true });
                      text = text + chunk;
                      const captured = text;
                      setInsight(captured);
                      setLoading(false);
                    }
                  })
                  .catch(() => setLoading(false));
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-[var(--neon)] transition-colors"
              title="Refresh insight"
            >
              <ArrowsClockwise size={13} />
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
