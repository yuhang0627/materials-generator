"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<"signin" | "">("");

  function normalizeIdentifier(value: string) {
    const trimmed = value.trim().toLowerCase();

    if (!trimmed) {
      return "";
    }

    if (trimmed.includes("@")) {
      return trimmed;
    }

    return `${trimmed}@materials-generator.local`;
  }

  async function handleSignIn() {
    setLoading("signin");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizeIdentifier(identifier),
      password
    });

    if (error) {
      setMessage(error.message);
      setLoading("");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSignIn();
      }}
    >
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink">
          Username or email
        </span>
        <div className="field-shell rounded-2xl px-4 py-3">
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="audrey or yuhang"
            className="w-full border-0 bg-transparent text-ink outline-none"
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-ink">
          Password
        </span>
        <div className="field-shell rounded-2xl px-4 py-3">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            className="w-full border-0 bg-transparent text-ink outline-none"
          />
        </div>
      </label>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="submit"
          disabled={loading !== ""}
          className="inline-flex w-full items-center justify-center rounded-full bg-sage px-5 py-3 text-sm font-bold text-white transition hover:bg-[#8cab99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading === "signin" ? "Signing in..." : "Sign In"}
        </button>
      </div>

      <p className="text-sm leading-6 text-ink/70">
        Only approved accounts can sign in. Use `audrey` or `yuhang` with the
        assigned password to open the dashboard and generator.
      </p>

      {message ? (
        <p className="text-sm font-semibold text-sage">{message}</p>
      ) : null}
    </form>
  );
}
