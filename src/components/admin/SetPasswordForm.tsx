"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function SetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/editportfolio");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not set your password.");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="w-full max-w-sm space-y-5">
    <label className="block space-y-2 text-sm">
      <span className="font-medium">New password</span>
      <input autoComplete="new-password" type="password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 outline-none focus:border-fg/50" />
    </label>
    <label className="block space-y-2 text-sm">
      <span className="font-medium">Confirm password</span>
      <input autoComplete="new-password" type="password" minLength={12} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 outline-none focus:border-fg/50" />
    </label>
    {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">{error}</p>}
    <button disabled={busy} className="w-full rounded-lg bg-fg px-4 py-2.5 text-sm font-semibold text-bg disabled:opacity-50">
      {busy ? "Saving password…" : "Set password"}
    </button>
  </form>;
}
