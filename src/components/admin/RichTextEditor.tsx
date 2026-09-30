"use client";

import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useRef } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function RichTextEditor({
  value,
  onChange,
}: {
  value: JSONContent;
  onChange: (value: JSONContent) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ allowBase64: false }),
    ],
    content: value,
    onUpdate: ({ editor: activeEditor }) => onChange(activeEditor.getJSON()),
    editorProps: {
      attributes: {
        class: "prose prose-neutral dark:prose-invert max-w-none min-h-64 px-4 py-3 focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    if (current !== JSON.stringify(value)) editor.commands.setContent(value);
  }, [editor, value]);

  async function uploadInlineImage(file?: File) {
    if (!file || !editor) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(file.type)) {
      window.alert("Choose a JPG, PNG, WebP, GIF, or AVIF image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      window.alert("Images must be 10 MB or smaller.");
      return;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `blog/${crypto.randomUUID()}-${safeName}`;
      const { error } = await supabase.storage.from("portfolio-media").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("portfolio-media").getPublicUrl(path);
      editor.chain().focus().setImage({ src: data.publicUrl, alt: file.name }).run();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not upload the image.");
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  if (!editor) {
    return <div className="min-h-72 rounded-lg border border-border bg-card" aria-label="Loading article editor" />;
  }

  const toolButton = (label: string, active: boolean, run: () => void) => (
    <button
      key={label}
      type="button"
      onClick={run}
      aria-pressed={active}
      className={`rounded-md border px-2.5 py-1.5 text-xs font-mono transition-colors ${active ? "border-fg/40 bg-fg/10 text-fg" : "border-border text-muted hover:text-fg"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-bg">
      <div className="flex flex-wrap gap-2 border-b border-border p-3">
        {toolButton("Paragraph", false, () => editor.chain().focus().setParagraph().run())}
        {toolButton("Heading", editor.isActive("heading"), () => editor.chain().focus().toggleHeading({ level: 2 }).run())}
        {toolButton("Bold", editor.isActive("bold"), () => editor.chain().focus().toggleBold().run())}
        {toolButton("Italic", editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run())}
        {toolButton("List", editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run())}
        {toolButton("Numbered", editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run())}
        {toolButton("Quote", editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run())}
        {toolButton("Code block", editor.isActive("codeBlock"), () => editor.chain().focus().toggleCodeBlock().run())}
        {toolButton("Link", editor.isActive("link"), () => {
          const href = window.prompt("Link address");
          if (href && /^(https?:|mailto:)/i.test(href)) editor.chain().focus().setLink({ href }).run();
          else if (href) window.alert("Use a link that starts with https://, http://, or mailto:.");
        })}
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="rounded-md border border-border px-2.5 py-1.5 text-xs font-mono text-muted hover:text-fg"
        >
          Add image
        </button>
        <input ref={fileInput} type="file" accept="image/*" className="sr-only" onChange={(event) => void uploadInlineImage(event.target.files?.[0])} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
