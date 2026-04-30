"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const res = await signIn("credentials", {
      email: "admin@nexus.com",
      password: "",
      redirect: false,
    });
    if (res?.ok) router.push("/");
    else setLoading(false);
  }

  return (
    <div className="fluted-glass rounded-xl p-8 w-full max-w-sm flex flex-col gap-6 border border-border">
      <div>
        <span className="font-mono text-xl font-bold tracking-widest text-neon uppercase">
          Nexus
        </span>
        <p className="text-muted-foreground text-sm mt-1">
          Sign in to your dashboard
        </p>
      </div>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full py-2.5 rounded-md bg-neon text-neon-fg text-sm font-bold font-mono tracking-widest uppercase hover:glow-neon-strong transition-all duration-200 disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Enter →"}
      </button>
    </div>
  );
}