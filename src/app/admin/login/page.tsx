import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/admin/LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Sign in to portfolio editor | Dan Jeshua",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col justify-center">
    <div className="mb-7">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">Private area</p>
      <h1 className="text-3xl font-bold tracking-tight">Sign in to edit</h1>
      <p className="mt-2 text-sm text-muted">Use the email address invited to this portfolio.</p>
    </div>
    {isSupabaseConfigured() ? <LoginForm /> : <div className="rounded-xl border border-border bg-card/40 p-5 text-sm leading-relaxed text-muted">
      Connect the Supabase project first. Follow <code>supabase/SETUP.md</code>, then open this page again.
    </div>}
    <Link href="/" className="mt-7 text-sm text-muted hover:text-fg">← Back to portfolio</Link>
  </div>;
}
