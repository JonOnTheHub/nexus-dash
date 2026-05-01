"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Robot, X, PaperPlaneTilt, Trash } from "@phosphor-icons/react";
import ChatMessage from "./ChatMessage";
import type { AIMessage } from "@/types";

const SUGGESTIONS = [
    "What's driving revenue this month?",
    "Which products are at risk of stockout?",
    "Who are my top customers?",
    "Summarise this week's order activity",
];

export default function ChatDrawer() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [input, setInput] = useState("");
    const [streaming, setStreaming] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 300);
    }, [open]);

    async function send(content: string) {
        if (!content.trim() || streaming) return;

        const userMsg: AIMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: content.trim(),
            timestamp: new Date(),
        };

        const next = [...messages, userMsg];
        setMessages(next);
        setInput("");
        setStreaming(true);

        const assistantId = crypto.randomUUID();
        const assistantMsg: AIMessage = {
            id: assistantId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
        };

        setMessages([...next, assistantMsg]);

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: next }),
            });

            if (!res.ok || !res.body) throw new Error("Stream failed");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                accumulated = accumulated + chunk;
                const captured = accumulated;
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === assistantId ? { ...m, content: captured } : m
                    )
                );
            }
        } catch {
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantId
                        ? { ...m, content: "Something went wrong. Try again." }
                        : m
                )
            );
        } finally {
            setStreaming(false);
        }
    }

    function handleKey(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send(input);
        }
    }

    return (
        <>
            {/* FAB */}
            <motion.button
                onClick={() => setOpen(true)}
                whileHover={{ scale: 1.05, boxShadow: "var(--glow-neon-strong)" }}
                whileTap={{ scale: 0.97 }}
                className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[var(--neon)] text-[var(--neon-fg)] flex items-center justify-center shadow-lg glow-neon transition-shadow duration-200"
            >
                <Robot size={20} weight="fill" />
            </motion.button>

            {/* Backdrop */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Drawer */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        className="fixed top-0 right-0 z-50 h-[100dvh] w-full max-w-md fluted-glass border-l border-border flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[var(--neon)]/10 border border-[var(--neon)]/20 flex items-center justify-center">
                                    <Robot size={14} weight="fill" className="text-[var(--neon)]" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        Nexus AI
                                    </p>
                                    <p className="text-[10px] font-mono text-muted-foreground">
                                        llama-3.3-70b · groq
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {messages.length > 0 && (
                                    <button
                                        onClick={() => setMessages([])}
                                        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-all duration-200"
                                    >
                                        <Trash size={14} />
                                    </button>
                                )}
                                <button
                                    onClick={() => setOpen(false)}
                                    className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-all duration-200"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
                            {messages.length === 0 ? (
                                <div className="flex flex-col gap-4 h-full">
                                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
                                        <div className="w-12 h-12 rounded-full bg-[var(--neon)]/10 border border-[var(--neon)]/20 flex items-center justify-center">
                                            <Robot size={22} weight="fill" className="text-[var(--neon)]" />
                                        </div>
                                        <p className="text-sm text-foreground font-medium">
                                            Ask me anything about your store
                                        </p>
                                        <p className="text-xs text-muted-foreground max-w-[240px]">
                                            I have access to your live metrics, orders, products, and customers.
                                        </p>
                                    </div>

                                    {/* Suggestions */}
                                    <div className="grid grid-cols-2 gap-2 pb-2">
                                        {SUGGESTIONS.map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => send(s)}
                                                className="text-left px-3 py-2.5 rounded-lg border border-border bg-surface-raised hover:border-[var(--neon)]/30 hover:bg-[var(--neon)]/5 transition-all duration-200 text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {messages.map((m) => (
                                        <ChatMessage key={m.id} message={m} />
                                    ))}
                                    {streaming &&
                                        messages[messages.length - 1]?.content === "" && (
                                            <div className="flex gap-1 items-center pl-8">
                                                {[0, 1, 2].map((i) => (
                                                    <motion.span
                                                        key={i}
                                                        className="w-1.5 h-1.5 rounded-full bg-[var(--neon)]"
                                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                                        transition={{
                                                            duration: 1,
                                                            repeat: Infinity,
                                                            delay: i * 0.2,
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    <div ref={bottomRef} />
                                </>
                            )}
                        </div>

                        {/* Input */}
                        <div className="px-4 py-4 border-t border-border shrink-0">
                            <div className="flex gap-2 items-center">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKey}
                                    placeholder="Ask about your store..."
                                    disabled={streaming}
                                    className="flex-1 px-3 py-2.5 rounded-lg bg-surface-raised border border-border text-sm text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:border-[var(--neon)]/50 focus:ring-1 focus:ring-[var(--neon)]/20 transition-all duration-200 disabled:opacity-50"
                                />
                                <button
                                    onClick={() => send(input)}
                                    disabled={!input.trim() || streaming}
                                    className="w-9 h-9 rounded-lg bg-[var(--neon)] text-[var(--neon-fg)] flex items-center justify-center hover:glow-neon transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                                >
                                    <PaperPlaneTilt size={15} weight="fill" />
                                </button>
                            </div>
                            <p className="text-[10px] font-mono text-muted-foreground mt-2 text-center">
                                Enter to send · responses are AI-generated
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}