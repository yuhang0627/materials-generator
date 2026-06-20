"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<"signin" | "signup" | "">("");

  async function handleSignIn() {
    setLoading("signin");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
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

  async function handleSignUp() {
    setLoading("signup");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      setMessage(error.message);
      setLoading("");
      return;
    }

    setMessage(
      "Account created. If email confirmation is enabled in Supabase, confirm your email first, then sign in."
    );
    setLoading("");
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
        <span className="mb-2 block text-sm font-semibold text-ink">Email</span>
        <div className="field-shell rounded-2xl px-4 py-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teacher@example.com"
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
          className="inline-flex flex-1 items-center justify-center rounded-full bg-sage px-5 py-3 text-sm font-bold text-white transition hover:bg-[#8cab99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading === "signin" ? "Signing in..." : "Sign In"}
        </button>
        <button
          type="button"
          disabled={loading !== ""}
          onClick={() => void handleSignUp()}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-ink transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading === "signup" ? "Creating..." : "Create Account"}
        </button>
      </div>

      <p className="text-sm leading-6 text-ink/70">
        Use your Supabase Auth email and password. Only logged-in users can open
        the dashboard or generator.
      </p>

      {message ? (
        <p className="text-sm font-semibold text-sage">{message}</p>
      ) : null}
    </form>
  );
}
