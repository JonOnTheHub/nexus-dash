"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Robot,
    PaperPlaneTilt,
    Trash,
    Download,
} from "@phosphor-icons/react";
import ChatMessage from "./ChatMessage";
import type { AIMessage } from "@/types";

const SUGGESTIONS = [
    "What's driving revenue this month?",
    "Which products are at risk of stockout?",
    "Who are my top customers by spend?",
    "Summarise this week's order activity",
    "Draft a restock request for low inventory items",
    "Which product category has the best margins?",
    "Compare this month's performance to last month",
    "What should I prioritise to increase revenue?",
];

export default function ChatFull() {
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [input, setInput] = useState("");
    const [streaming, setStreaming] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
        setMessages([
            ...next,
            { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
        ]);

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

    function exportTranscript() {
        const text = messages
            .map(
                (m) =>
                    `[${m.role.toUpperCase()}] ${new Date(m.timestamp).toLocaleTimeString()}\n${m.content}`
            )
            .join("\n\n---\n\n");

        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nexus-chat-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="flex flex-col h-full fluted-glass rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[var(--neon)]/10 border border-[var(--neon)]/20 flex items-center justify-center">
                        <Robot size={16} weight="fill" className="text-[var(--neon)]" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">Nexus AI</p>
                        <p className="text-[10px] font-mono text-muted-foreground">
                            llama-3.3-70b-versatile · groq · store context loaded
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {messages.length > 0 && (
                        <>
                            <button
                                onClick={exportTranscript}
                                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-all duration-200"
                                title="Export transcript"
                            >
                                <Download size={14} />
                            </button>
                            <button
                                onClick={() => setMessages([])}
                                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-all duration-200"
                                title="Clear conversation"
                            >
                                <Trash size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col h-full gap-6">
                        {/* Empty state */}
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                                className="w-16 h-16 rounded-full bg-[var(--neon)]/10 border border-[var(--neon)]/20 flex items-center justify-center"
                            >
                                <Robot size={28} weight="fill" className="text-[var(--neon)]" />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <p className="text-base font-semibold text-foreground">
                                    Nexus AI Assistant
                                </p>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                    Ask me anything about your store — revenue, inventory, customers, or strategy.
                                </p>
                            </motion.div>
                        </div>

                        {/* Suggestions grid */}
                        <div className="grid grid-cols-2 gap-2 pb-2">
                            {SUGGESTIONS.map((s, i) => (
                                <motion.button
                                    key={s}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * i }}
                                    onClick={() => send(s)}
                                    className="text-left px-3 py-3 rounded-lg border border-border bg-surface-raised hover:border-[var(--neon)]/30 hover:bg-[var(--neon)]/5 transition-all duration-200 text-xs text-muted-foreground hover:text-foreground leading-relaxed"
                                >
                                    {s}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <AnimatePresence initial={false}>
                            {messages.map((m) => (
                                <ChatMessage key={m.id} message={m} />
                            ))}
                        </AnimatePresence>

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
            <div className="px-5 py-4 border-t border-border shrink-0">
                <div className="flex gap-2 items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Ask about your store..."
                        disabled={streaming}
                        className="flex-1 px-4 py-3 rounded-lg bg-surface-raised border border-border text-sm text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:border-[var(--neon)]/50 focus:ring-1 focus:ring-[var(--neon)]/20 transition-all duration-200 disabled:opacity-50"
                    />
                    <button
                        onClick={() => send(input)}
                        disabled={!input.trim() || streaming}
                        className="w-10 h-10 rounded-lg bg-[var(--neon)] text-[var(--neon-fg)] flex items-center justify-center hover:glow-neon transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                        <PaperPlaneTilt size={16} weight="fill" />
                    </button>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground mt-2 text-center">
                    Enter to send · Shift+Enter for new line · responses are AI-generated, grain of salt. 
                </p>
            </div>
        </div>
    );
}