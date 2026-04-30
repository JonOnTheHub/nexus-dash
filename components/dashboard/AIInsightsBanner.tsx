"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Robot, X } from "@phosphor-icons/react";

export default function AIInsightsBanner() {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchInsight() {
      try {
        const res = await fetch("/api/ai/insights");
        if (!res.ok || !res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let text = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;
          text += decoder.decode(value, { stream: true });
          setInsight(text);
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    }

    fetchInsight();
    return () => { cancelled = true; };
  }, []);

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
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
            <p className="text-[10px] font-mono tracking-widest uppercase text-[var(--neon)] mb-1">
              AI Insight
            </p>
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

          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}