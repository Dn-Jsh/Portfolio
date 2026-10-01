"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import type { JSONContent } from "@tiptap/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, Plus, Eye, Save, Send, EyeOff, Trash2, ImagePlus } from "lucide-react";
import { EDITOR_SECTIONS, emptyDraft, getSection, makeSlug, type EditorField, type EditorSection } from "@/lib/cms-schema";
import type { ContentType } from "@/lib/portfolio-content";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { RichTextContent } from "@/components/ui/RichTextContent";

type DraftRow = { id: string; content_type: ContentType; slug: string | null; sort_order: number; draft: Record<string, unknown>; updated_at: string };
type PublishedRow = { id: string; content_type: ContentType; slug: string | null; sort_order: number; data: Record<string, unknown>; published_at: string };

function initialData(type: ContentType) {
  const data = emptyDraft(type);
  if (type === "blog_post") data.date = new Date().toISOString().slice(0, 10);
  if (type === "gear") {
    data.category = "DESK SETUP";
    data.model = "laptop";
  }
  if (type === "page_intro") data.route = "blog";
  return data;
}

function titleFor(section: EditorSection, data: Record<string, unknown>, slug: string | null) {
  if (section.type === "site_settings") return "Profile & highlights";
  return String(data.title ?? data.name ?? data.platform ?? data.category ?? data.company ?? data.route ?? slug ?? `New ${section.singular}`).trim() || `New ${section.singular}`;
}

function sectionSlug(type: ContentType, data: Record<string, unknown>, existingSlug: string | null) {
  if (type === "site_settings") return "main";
  if (type === "blog_post") return makeSlug(String(data.slug ?? ""));
  if (type === "page_intro") return String(data.route ?? "");
  if (type === "stack_group") return makeSlug(String(data.category ?? ""));
  return existingSlug;
}

function hasRichContent(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const node = value as { text?: string; content?: unknown[] };
  return Boolean(node.text?.trim() || node.content?.some(hasRichContent));
}

export function ContentAdmin({ initialDrafts, initialPublished }: { initialDrafts: DraftRow[]; initialPublished: PublishedRow[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState(initialDrafts);
  const [published, setPublished] = useState(initialPublished);
  const [type, setType] = useState<ContentType>("blog_post");
  const [activeId, setActiveId] = useState<string | null>(initialDrafts.find((row) => row.content_type === "blog_post")?.id ?? null);
  const [formState, setFormState] = useState({ key: "blog_post:new", data: initialData("blog_post"), order: 10 });
  const [previewState, setPreviewState] = useState({ key: "", value: false });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState({ key: "", notice: "", error: "" });

  const section = getSection(type);
  const activeDraft = drafts.find((row) => row.id === activeId && row.content_type === type) ?? null;
  const activePublished = activeDraft ? published.find((row) => row.id === activeDraft.id) ?? null : null;
  const editorKey = `${type}:${activeId ?? "new"}`;
  const hydratedDraft = activeDraft ? {
    ...activeDraft.draft,
    ...(type === "page_intro" ? { route: activeDraft.slug ?? activeDraft.draft.route ?? "blog" } : {}),
    ...(type === "blog_post" ? { slug: activeDraft.slug ?? activeDraft.draft.slug ?? "" } : {}),
  } : null;
  const nextOrder = (drafts.filter((row) => row.content_type === type).reduce((maximum, row) => Math.max(maximum, row.sort_order), 0) || 0) + 10;
  const data: Record<string, unknown> = formState.key === editorKey ? formState.data : hydratedDraft ?? initialData(type);
  const order = formState.key === editorKey ? formState.order : activeDraft?.sort_order ?? nextOrder;
  const previewing = previewState.key === editorKey && previewState.value;
  const notice = feedback.key === editorKey ? feedback.notice : "";
  const error = feedback.key === editorKey ? feedback.error : "";
  const hasChanges = Boolean(activeDraft && hydratedDraft && JSON.stringify(data) !== JSON.stringify(hydratedDraft));

  function setData(next: Record<string, unknown>) {
    setFormState({ key: editorKey, data: next, order });
  }

  function setOrder(next: number) {
    setFormState({ key: editorKey, data, order: next });
  }

  function setNotice(next: string) {
    setFeedback((current) => ({ ...current, key: editorKey, notice: next }));
  }

  function setError(next: string) {
    setFeedback((current) => ({ ...current, key: editorKey, error: next }));
  }

  function setPreviewing(next: boolean) {
    setPreviewState({ key: editorKey, value: next });
  }

  const items = drafts
    .filter((row) => row.content_type === type)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => ({ row, title: titleFor(section, row.draft, row.slug) }));

  function chooseType(nextType: ContentType) {
    setType(nextType);
    setActiveId(drafts.find((row) => row.content_type === nextType)?.id ?? null);
  }

  function chooseItem(id: string) {
    setActiveId(id);
    setPreviewState({ key: `${type}:${id}`, value: false });
  }

  function newItem() {
    if (type === "site_settings" && drafts.some((row) => row.content_type === "site_settings")) {
      chooseItem(drafts.find((row) => row.content_type === "site_settings")!.id);
      return;
    }
    setActiveId(null);
    setFormState({ key: `${type}:new`, data: initialData(type), order: nextOrder });
    setPreviewState({ key: `${type}:new`, value: false });
    setNotice("");
    setError("");
  }

  function updateField(name: string, value: unknown) {
    const next = { ...data, [name]: value };
    if (type === "blog_post" && name === "title" && !data.slug) next.slug = makeSlug(String(value));
    setData(next);
  }

  async function saveDraft(event?: FormEvent) {
    event?.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const missing = section.fields.find((field) => field.required && isEmpty(data[field.name], field.type));
      if (missing) throw new Error(`${missing.label} is required.`);
      const supabase = createBrowserSupabaseClient();
      const slug = sectionSlug(type, data, activeDraft?.slug ?? null);
      const payload = {
        ...(activeDraft ? { id: activeDraft.id } : {}),
        content_type: type,
        slug,
        sort_order: order,
        draft: data,
        updated_at: new Date().toISOString(),
      };
      const { data: saved, error: saveError } = await supabase.from("portfolio_drafts").upsert(payload).select().single();
      if (saveError) throw new Error(saveError.message);
      const savedRow = saved as DraftRow;
      setDrafts((current) => [...current.filter((row) => row.id !== savedRow.id), savedRow]);
      setActiveId(savedRow.id);
      setFormState({ key: `${type}:${savedRow.id}`, data: { ...savedRow.draft, ...(type === "page_intro" ? { route: savedRow.slug } : {}), ...(type === "blog_post" ? { slug: savedRow.slug } : {}) }, order: savedRow.sort_order });
      setFeedback({ key: `${type}:${savedRow.id}`, notice: "Draft saved. Publish it when you are ready for it to appear on the site.", error: "" });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save this draft.");
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!activeDraft || hasChanges) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: publishError } = await supabase.rpc("publish_portfolio_item", { p_content_id: activeDraft.id });
      if (publishError) throw new Error(publishError.message);
      setPublished((current) => [
        ...current.filter((row) => row.id !== activeDraft.id),
        { id: activeDraft.id, content_type: type, slug: sectionSlug(type, data, activeDraft.slug), sort_order: order, data: activeDraft.draft, published_at: new Date().toISOString() },
      ]);
      setNotice("Published. Your portfolio will show the new content on its next page load.");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not publish this content.");
    } finally {
      setBusy(false);
    }
  }

  async function unpublish() {
    if (!activeDraft || !activePublished || !window.confirm("Hide this item from the public portfolio? The draft will stay in the editor.")) return;
    setBusy(true);
    setError("");
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: actionError } = await supabase.rpc("unpublish_portfolio_item", { p_content_id: activeDraft.id });
      if (actionError) throw new Error(actionError.message);
      setPublished((current) => current.filter((row) => row.id !== activeDraft.id));
      setNotice("This item is now hidden from visitors. Its draft is still saved.");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not unpublish this content.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteItem() {
    if (!activeDraft || type === "site_settings" || !window.confirm(`Permanently delete “${titleFor(section, data, activeDraft.slug)}”?`)) return;
    setBusy(true);
    setError("");
    try {
      const supabase = createBrowserSupabaseClient();
      const { error: actionError } = await supabase.rpc("delete_portfolio_item", { p_content_id: activeDraft.id });
      if (actionError) throw new Error(actionError.message);
      setDrafts((current) => current.filter((row) => row.id !== activeDraft.id));
      setPublished((current) => current.filter((row) => row.id !== activeDraft.id));
      setActiveId(null);
      setFeedback({ key: `${type}:new`, notice: "Item deleted.", error: "" });
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete this item.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/editportfolio/login");
    router.refresh();
  }

  if (!isSupabaseConfigured()) {
    return <SetupMessage />;
  }

  return (
    <div className="min-h-[75vh]">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">Portfolio editor</p>
          <h1 className="text-3xl font-bold tracking-tight">Manage your content</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">Edit an item, save it as a draft, preview the changes, then publish when it looks right.</p>
        </div>
        <button type="button" onClick={() => void signOut()} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-fg">
          <LogOut size={15} /> Sign out
        </button>
      </header>

      <div className="grid min-w-0 gap-6">
        <nav aria-label="Content types" className="flex min-w-0 gap-2 overflow-x-auto pb-1">
          {EDITOR_SECTIONS.map((option) => (
            <button key={option.type} type="button" onClick={() => chooseType(option.type)} className={`block shrink-0 rounded-lg px-3 py-2 text-left text-sm transition-colors ${option.type === type ? "bg-fg/10 font-semibold text-fg" : "text-muted hover:bg-card hover:text-fg"}`}>
              {option.label}
              <span className="ml-2 font-mono text-[10px] opacity-60">{drafts.filter((row) => row.content_type === option.type).length}</span>
            </button>
          ))}
        </nav>

        <div className="editor-content-grid grid min-w-0 gap-6">
          <section className="rounded-xl border border-border bg-card/40 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">{section.label}</h2>
              <button type="button" onClick={newItem} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs font-mono hover:text-fg">
                <Plus size={13} /> Add
              </button>
            </div>
            <div className="space-y-1">
              {items.map(({ row, title }) => {
                const isPublished = published.some((record) => record.id === row.id);
                return (
                  <button key={row.id} type="button" onClick={() => chooseItem(row.id)} className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${row.id === activeId ? "bg-fg/10 text-fg" : "text-fg/80 hover:bg-card"}`}>
                    <span className="min-w-0 truncate">{title}</span>
                    <span className={`h-2 w-2 shrink-0 rounded-full ${isPublished ? "bg-emerald-500" : "bg-amber-500"}`} title={isPublished ? "Published" : "Draft only"} />
                  </button>
                );
              })}
              {items.length === 0 && <p className="px-3 py-5 text-sm text-muted">No items yet. Add one to get started.</p>}
            </div>
            <p className="mt-5 text-[11px] leading-relaxed text-muted">Green means visitors can see the published version. Amber means the item is still a draft.</p>
          </section>

          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-mono ${activePublished ? "border-emerald-500/30 text-emerald-600" : "border-amber-500/30 text-amber-600"}`}>
                  {activePublished ? hasChanges ? "PUBLISHED · DRAFT CHANGES" : "PUBLISHED" : "DRAFT"}
                </span>
                {activeDraft && <span className="text-xs text-muted">Saved {new Date(activeDraft.updated_at).toLocaleDateString()}</span>}
              </div>
              {activePublished && activeDraft && <a href={publicUrl(type, activeDraft)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted hover:text-fg"><Eye size={13} /> View published</a>}
            </div>

            {notice && <p role="status" className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">{notice}</p>}
            {error && <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">{error}</p>}

            <div className="mb-4 flex gap-2">
              <button type="button" onClick={() => setPreviewing(false)} className={`rounded-md px-3 py-1.5 text-xs font-mono ${!previewing ? "bg-fg text-bg" : "border border-border text-muted"}`}>Edit</button>
              <button type="button" onClick={() => setPreviewing(true)} className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-mono ${previewing ? "bg-fg text-bg" : "border border-border text-muted"}`}><Eye size={13} /> Preview draft</button>
            </div>

            {previewing ? (
              <DraftPreview type={type} data={data} />
            ) : (
              <form onSubmit={(event) => void saveDraft(event)} className="space-y-5 rounded-xl border border-border bg-card/30 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                  <h2 className="text-lg font-semibold">{activeDraft ? `Edit ${section.singular.toLowerCase()}` : `New ${section.singular.toLowerCase()}`}</h2>
                  <label className="flex items-center gap-2 text-xs text-muted">
                    Display order
                    <input type="number" value={order} onChange={(event) => setOrder(Number(event.target.value))} className="w-20 rounded-md border border-border bg-bg px-2 py-1.5 text-fg" />
                  </label>
                </div>
                {section.fields.map((field) => (
                  <EditorFieldControl key={`${activeId ?? "new"}-${field.name}`} field={field} value={data[field.name]} onChange={(value) => updateField(field.name, value)} />
                ))}
                <div className="flex flex-wrap gap-2 border-t border-border pt-5">
                  <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm font-medium hover:bg-card disabled:opacity-50">
                    <Save size={15} /> {busy ? "Saving…" : "Save draft"}
                  </button>
                  <button type="button" onClick={() => void publish()} disabled={busy || !activeDraft || hasChanges} title={hasChanges ? "Save your draft changes first." : undefined} className="inline-flex items-center gap-2 rounded-lg bg-fg px-3.5 py-2 text-sm font-semibold text-bg disabled:cursor-not-allowed disabled:opacity-40">
                    <Send size={15} /> Publish
                  </button>
                  {activePublished && type !== "site_settings" && <button type="button" onClick={() => void unpublish()} disabled={busy} className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-sm text-muted hover:text-fg disabled:opacity-50"><EyeOff size={15} /> Unpublish</button>}
                  {activeDraft && type !== "site_settings" && <button type="button" onClick={() => void deleteItem()} disabled={busy} className="ml-auto inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3.5 py-2 text-sm text-red-600 hover:bg-red-500/10 disabled:opacity-50"><Trash2 size={15} /> Delete</button>}
                </div>
                <p className="text-xs leading-relaxed text-muted">Saving keeps the current public version unchanged. Publishing replaces it immediately; visitors see only published content.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function isEmpty(value: unknown, type: EditorField["type"]) {
  if (type === "richtext") return !hasRichContent(value);
  if (type === "list") return !Array.isArray(value) || value.length === 0;
  return value === null || value === undefined || String(value).trim() === "";
}

function EditorFieldControl({ field, value, onChange }: { field: EditorField; value: unknown; onChange: (value: unknown) => void }) {
  const base = "w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-fg/50";
  const label = <span className="flex items-center gap-1 text-sm font-medium">{field.label}{field.required && <span aria-hidden="true" className="text-red-500">*</span>}</span>;

  if (field.type === "richtext") {
    return <div className="space-y-2"><label>{label}</label><RichTextEditor value={(value as JSONContent) ?? { type: "doc", content: [{ type: "paragraph" }] }} onChange={onChange as (content: JSONContent) => void} /></div>;
  }

  if (field.type === "list") {
    return <label className="block space-y-2">{label}{field.hint && <span className="block text-xs text-muted">{field.hint}</span>}<textarea rows={5} value={Array.isArray(value) ? value.join("\n") : ""} onChange={(event) => onChange(event.target.value.split("\n").map((item) => item.trim()).filter(Boolean))} className={base} /></label>;
  }

  if (field.type === "stats") {
    const stats = Array.isArray(value) ? value as Array<{ value?: string; label?: string }> : [];
    return (
      <div className="space-y-3">
        {label}
        {stats.map((stat, index) => <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
          <input aria-label={`Highlight ${index + 1} value`} value={stat.value ?? ""} onChange={(event) => onChange(stats.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} placeholder="Value" className={base} />
          <input aria-label={`Highlight ${index + 1} label`} value={stat.label ?? ""} onChange={(event) => onChange(stats.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} placeholder="Label" className={base} />
          <button type="button" onClick={() => onChange(stats.filter((_, itemIndex) => itemIndex !== index))} className="rounded-md border border-border px-2 text-xs text-muted hover:text-red-600">Remove</button>
        </div>)}
        <button type="button" onClick={() => onChange([...stats, { value: "", label: "" }])} className="rounded-md border border-border px-3 py-2 text-xs text-muted hover:text-fg">Add highlight</button>
      </div>
    );
  }

  if (field.type === "image") return <ImageField field={field} value={String(value ?? "")} onChange={onChange} />;

  if (field.type === "select") {
    return <label className="block space-y-2">{label}<select value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} className={base}><option value="">Choose…</option>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
  }

  if (field.type === "textarea") return <label className="block space-y-2">{label}<textarea rows={4} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} className={base} /></label>;

  return <label className="block space-y-2">{label}{field.hint && <span className="block text-xs text-muted">{field.hint}</span>}<input type={field.type === "date" ? "date" : field.type === "url" ? "url" : "text"} required={field.required} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} className={base} /></label>;
}

function ImageField({ field, value, onChange }: { field: EditorField; value: string; onChange: (value: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Choose an image file.");
    if (file.size > 10 * 1024 * 1024) return setError("Images must be 10 MB or smaller.");
    setBusy(true);
    setError("");
    try {
      const supabase = createBrowserSupabaseClient();
      const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `portfolio/${crypto.randomUUID()}-${name}`;
      const { error: uploadError } = await supabase.storage.from("portfolio-media").upload(path, file, { upsert: false });
      if (uploadError) throw uploadError;
      onChange(supabase.storage.from("portfolio-media").getPublicUrl(path).data.publicUrl);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not upload this image.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="space-y-2">
    <span className="text-sm font-medium">{field.label}{field.required && <span aria-hidden="true" className="ml-1 text-red-500">*</span>}</span>
    <div className="flex flex-wrap items-center gap-2">
      <input type="text" aria-label={`${field.label} URL`} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Paste an image URL or upload a file" className="min-w-0 basis-full flex-1 rounded-lg border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-fg/50 sm:basis-56" />
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-muted hover:text-fg">
        <ImagePlus size={15} /> {busy ? "Uploading…" : "Upload image"}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={busy} onChange={(event) => void upload(event)} className="sr-only" />
      </label>
    </div>
    {value && <a href={value} target="_blank" rel="noopener noreferrer" className="block max-w-xs truncate text-xs text-muted underline">{value}</a>}
    {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
  </div>;
}

function DraftPreview({ type, data }: { type: ContentType; data: Record<string, unknown> }) {
  if (type === "blog_post") {
    return <article className="prose prose-neutral dark:prose-invert max-w-none rounded-xl border border-border bg-card/30 p-5 sm:p-8">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">Draft preview · {String(data.date ?? "")}</p>
      <h1>{String(data.title || "Your post title")}</h1>
      <p className="lead">{String(data.description || "Your summary will appear here.")}</p>
      {typeof data.coverImage === "string" && data.coverImage && <Image src={data.coverImage} alt="" width={1200} height={600} unoptimized className="my-5 max-h-80 w-full rounded-xl object-cover" />}
      <RichTextContent content={data.body as JSONContent} />
    </article>;
  }
  if (type === "site_settings") return <div className="rounded-xl border border-border bg-card/30 p-6"><p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">Homepage preview</p><h1 className="text-4xl font-bold">{String(data.firstName || "First name")} <span className="text-accent">{String(data.lastName || "Last name")}</span></h1><p className="mt-2 text-sm text-muted">{String(data.heroKicker || "Introduction")}</p><p className="mt-5 max-w-xl">{String(data.bioFirst || "Your biography will appear here.")}</p><p className="mt-3 max-w-xl text-muted">{String(data.bioSecond || "")}</p></div>;
  return <div className="rounded-xl border border-border bg-card/30 p-6">
    <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">Draft preview</p>
    <h2 className="text-2xl font-semibold">{String(data.title ?? data.name ?? data.platform ?? data.category ?? data.company ?? data.route ?? "New item")}</h2>
    {Object.entries(data).filter(([key, value]) => key !== "body" && key !== "title" && value !== "" && value !== null).map(([key, value]) => <p key={key} className="mt-3 text-sm text-fg/75"><span className="mr-2 font-mono text-xs uppercase text-muted">{key}</span>{Array.isArray(value) ? value.join(", ") : typeof value === "object" ? "" : String(value)}</p>)}
  </div>;
}

function publicUrl(type: ContentType, row: DraftRow) {
  if (type === "blog_post") return `/blog/${row.slug}`;
  const paths: Partial<Record<ContentType, string>> = { project: "/projects", experience: "/experience", certification: "/certifications", recommendation: "/recommendations", gear: "/gear", social: "/socials", stack_group: "/stack" };
  return paths[type] ?? "/";
}

function SetupMessage() {
  return <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card/40 p-6 sm:p-8">
    <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">One-time setup</p>
    <h1 className="text-2xl font-bold">Connect Supabase to open your editor</h1>
    <p className="mt-3 text-sm leading-relaxed text-muted">The portfolio editor is ready once the database migration is applied and the Supabase project keys are added to this app.</p>
    <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm">
      <li>Create a Supabase project.</li>
      <li>Run <code>supabase/migrations/202609300001_portfolio_cms.sql</code> in its SQL Editor.</li>
      <li>Set the two public Supabase environment values in local development and Vercel.</li>
      <li>Create your editor account and add its user ID to <code>portfolio_editors</code>.</li>
    </ol>
    <p className="mt-5 text-xs text-muted">Step-by-step instructions are in <code>supabase/SETUP.md</code>.</p>
  </div>;
}
