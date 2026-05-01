"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { EnvelopeSimple, LockSimple, ArrowRight } from "@phosphor-icons/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@nexus.com");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password: "",
      redirect: false,
    });

    if (res?.ok) {
      router.push("/");
    } else {
      setError("No account found with that email.");
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <div className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden bg-background">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(var(--neon) 1px, transparent 1px),
            linear-gradient(90deg, var(--neon) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow orb */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.96 0.234 120.7 / 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="fluted-glass rounded-2xl border border-border p-8 flex flex-col gap-7">
          {/* Logo */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 120, damping: 18 }}
            >
              <span className="font-mono text-2xl font-bold tracking-widest text-neon uppercase">
                Nexus
              </span>
              <span
                className="block text-[10px] tracking-[0.25em] uppercase mt-1 font-mono"
                style={{ color: "oklch(0.45 0 0)" }}
              >
                Operations Dashboard
              </span>
            </motion.div>
          </div>

          {/* Fields */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col gap-3"
          >
            {/* Email */}
            <div className="relative">
              <EnvelopeSimple
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Email address"
                className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-surface-raised border border-border text-sm text-foreground placeholder:text-muted-foreground font-mono focus:outline-none focus:border-[var(--neon)]/50 focus:ring-1 focus:ring-[var(--neon)]/20 transition-all duration-200"
              />
            </div>

            {/* Password — MVP placeholder */}
            <div className="relative">
              <LockSimple
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="password"
                placeholder="Password"
                disabled
                className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-surface-raised border border-border text-sm text-muted-foreground placeholder:text-muted-foreground font-mono opacity-40 cursor-not-allowed"
              />
            </div>

            <p className="text-[10px] font-mono text-muted-foreground">
              MVP mode — password auth not required. Use{" "}
              <span className="text-[var(--neon)]">admin@nexus.com</span>
            </p>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-destructive font-mono"
            >
              {error}
            </motion.p>
          )}

          {/* CTA */}
          <motion.button
            onClick={handleLogin}
            disabled={loading}
            whileHover={{ scale: 1.01, boxShadow: "var(--glow-neon-strong)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 rounded-lg bg-[var(--neon)] text-[var(--neon-fg)] text-sm font-bold font-mono tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[var(--neon-fg)]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </span>
            ) : (
              <>
                Sign In
                <ArrowRight size={14} weight="bold" />
              </>
            )}
          </motion.button>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] font-mono text-muted-foreground mt-4">
          NEXUS DASH · MVP · {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}