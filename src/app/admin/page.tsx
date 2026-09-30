import { redirect } from "next/navigation";
import { ContentAdmin } from "@/components/admin/ContentAdmin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ContentType } from "@/lib/portfolio-content";

export const dynamic = "force-dynamic";

type DraftRow = { id: string; content_type: ContentType; slug: string | null; sort_order: number; draft: Record<string, unknown>; updated_at: string };
type PublishedRow = { id: string; content_type: ContentType; slug: string | null; sort_order: number; data: Record<string, unknown>; published_at: string };

export default async function AdminPage() {
  if (!isSupabaseConfigured()) return <ContentAdmin initialDrafts={[]} initialPublished={[]} />;

  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims?.sub) redirect("/editportfolio/login");

  const { data: isEditor, error: accessError } = await supabase.rpc("is_portfolio_editor");
  if (accessError || !isEditor) {
    return <div className="mx-auto max-w-xl rounded-xl border border-border p-6">
      <h1 className="text-2xl font-bold">This account cannot edit the portfolio</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">Add this Supabase user to the <code>portfolio_editors</code> table, then sign in again.</p>
      <a href="/editportfolio/login" className="mt-5 inline-flex rounded-lg border border-border px-3 py-2 text-sm hover:bg-card">Return to sign in</a>
    </div>;
  }

  const [{ data: drafts, error: draftsError }, { data: published, error: publishedError }] = await Promise.all([
    supabase.from("portfolio_drafts").select("id,content_type,slug,sort_order,draft,updated_at").order("content_type").order("sort_order"),
    supabase.from("portfolio_published").select("id,content_type,slug,sort_order,data,published_at").order("content_type").order("sort_order"),
  ]);

  if (draftsError || publishedError) {
    return <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-700">Could not load portfolio content. Confirm that the Supabase migration has been applied and try again.</div>;
  }

  return <ContentAdmin initialDrafts={(drafts ?? []) as DraftRow[]} initialPublished={(published ?? []) as PublishedRow[]} />;
}
