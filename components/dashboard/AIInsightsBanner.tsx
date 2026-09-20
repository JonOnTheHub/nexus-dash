"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Robot, X, ArrowsClockwise } from "@phosphor-icons/react";

interface Props {
  refreshKey: number;
}

export default function AIInsightsBanner({ refreshKey }: Props) {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  async function refresh() {
    setInsight("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/insights", { cache: "no-store" });
      if (!res.ok) return;
      const text = await res.text();
      setInsight(text);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function init() {
      setInsight("");
      setDismissed(false);
      setLoading(true);
      try {
        const res = await fetch("/api/ai/insights", {
          cache: "no-store",
          signal,
        });
        if (signal.aborted || !res.ok) return;
        const text = await res.text();
        if (!signal.aborted) {
          setInsight(text);
          setLoading(false);
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setLoading(false);
      }
    }

    init();

    return () => controller.abort();
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
          className="fluted-glass rounded-xl border border-(--neon)/20 px-5 py-4 mb-6 flex items-start gap-3"
        >
          <div className="mt-0.5 p-1.5 rounded-md bg-(--neon)/10 shrink-0">
            <Robot size={15} weight="fill" className="text-neon" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-mono tracking-widest uppercase text-neon">
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
                    className="w-1 h-1 rounded-full bg-neon"
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
              onClick={refresh}
              className="p-1.5 rounded-md text-muted-foreground hover:text-neon transition-colors"
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