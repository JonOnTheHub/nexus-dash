import { motion } from "framer-motion";
import { Robot, User } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { AIMessage } from "@/types";

interface Props {
    message: AIMessage;
}

export default function ChatMessage({ message }: Props) {
    const isAssistant = message.role === "assistant";

    function formatContent(text: string) {
        const lines = text.split("\n").filter((l) => l.trim() !== "");

        return lines.map((line, i) => {
            // Numbered list item: "1. Something"
            if (/^\d+\.\s/.test(line)) {
                const content = line.replace(/^\d+\.\s/, "");
                const num = line.match(/^(\d+)/)?.[1];
                return (
                    <div key={i} className="flex gap-2 items-start">
                        <span className="text-[var(--neon)] font-mono text-[10px] mt-0.5 shrink-0 w-4">
                            {num}.
                        </span>
                        <span>{content}</span>
                    </div>
                );
            }

            // Bold label: "**Label:** text"
            if (/\*\*(.+?)\*\*/.test(line)) {
                const parts = line.split(/\*\*(.+?)\*\*/g);
                return (
                    <p key={i}>
                        {parts.map((part, j) =>
                            j % 2 === 1 ? (
                                <span key={j} className="text-[var(--neon)] font-semibold">
                                    {part.replace(/:$/, "")}:{" "}
                                </span>
                            ) : (
                                part
                            )
                        )}
                    </p>
                );
            }

            // Regular paragraph
            return <p key={i}>{line}</p>;
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className={cn(
                "flex gap-2.5",
                isAssistant ? "items-start" : "items-start flex-row-reverse"
            )}
        >
            {/* Avatar */}
            <div
                className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                    isAssistant
                        ? "bg-[var(--neon)]/10 border border-[var(--neon)]/20"
                        : "bg-surface-raised border border-border"
                )}
            >
                {isAssistant ? (
                    <Robot size={12} weight="fill" className="text-[var(--neon)]" />
                ) : (
                    <User size={12} className="text-muted-foreground" />
                )}
            </div>

            {/* Bubble */}
            <div
                className={cn(
                    "max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                    isAssistant
                        ? "bg-surface-raised border border-border text-foreground"
                        : "bg-[var(--neon)] text-[var(--neon-fg)] font-medium"
                )}
            >
                {isAssistant ? (
                    <div className="flex flex-col gap-1.5">
                        {formatContent(message.content)}
                    </div>
                ) : (
                    message.content
                )}
            </div>
        </motion.div>
    );
}