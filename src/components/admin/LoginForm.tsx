"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      router.replace("/editportfolio");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  async function sendResetLink() {
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    setResetBusy(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (resetError) throw resetError;
      setMessage("If this address has editor access, a password reset link is on its way.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not send a reset link.");
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm space-y-5">
      <label className="block space-y-2 text-sm">
        <span className="font-medium">Email</span>
        <input autoComplete="username" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 outline-none focus:border-fg/50" />
      </label>
      <label className="block space-y-2 text-sm">
        <span className="font-medium">Password</span>
        <input autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 outline-none focus:border-fg/50" />
      </label>
      {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}
      {message && <p role="status" className="rounded-lg border border-border bg-card/40 p-3 text-sm text-muted">{message}</p>}
      <button disabled={busy} className="w-full rounded-lg bg-fg px-4 py-2.5 text-sm font-semibold text-bg disabled:opacity-50">
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <button type="button" disabled={resetBusy} onClick={sendResetLink} className="text-sm text-muted hover:text-fg disabled:opacity-50">
        {resetBusy ? "Sending link…" : "Forgot password?"}
      </button>
    </form>
  );
}
