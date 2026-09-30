import Link from "next/link";
import { SetPasswordForm } from "@/components/admin/SetPasswordForm";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminSetupPage() {
  let canSetPassword = false;

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const { data: auth } = await supabase.auth.getClaims();
    if (auth?.claims?.sub) {
      const { data: isEditor } = await supabase.rpc("is_portfolio_editor");
      canSetPassword = isEditor === true;
    }
  }

  return <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col justify-center">
    <div className="mb-7">
      <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">Private area</p>
      <h1 className="text-3xl font-bold tracking-tight">Set your editor password</h1>
      <p className="mt-2 text-sm text-muted">Choose a password for future sign-ins to your portfolio editor.</p>
    </div>
    {canSetPassword ? <SetPasswordForm /> : <div role="alert" className="rounded-xl border border-border bg-card/40 p-5 text-sm leading-relaxed text-muted">
      This link is invalid or expired, or this account does not have editor access. Request a new invitation and open its latest link.
    </div>}
    <Link href="/editportfolio/login" className="mt-7 text-sm text-muted hover:text-fg">Back to sign in</Link>
  </div>;
}
