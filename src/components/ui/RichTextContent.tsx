import Image from "next/image";
import type { ReactNode } from "react";
import type { JSONContent } from "@tiptap/react";

type RichNode = JSONContent & { marks?: Array<{ type?: string; attrs?: Record<string, unknown> }> };

function safeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (/^(https?:|mailto:)/i.test(value)) return value;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (value.startsWith("#")) return value;
  return null;
}

function safeImageSrc(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return null;
}

function renderNode(node: RichNode, key: number | string): ReactNode {
  if (node.type === "text") {
    let text: ReactNode = node.text ?? "";
    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") text = <strong key={`${key}-bold`}>{text}</strong>;
      else if (mark.type === "italic") text = <em key={`${key}-italic`}>{text}</em>;
      else if (mark.type === "strike") text = <s key={`${key}-strike`}>{text}</s>;
      else if (mark.type === "code") text = <code key={`${key}-code`}>{text}</code>;
      else if (mark.type === "link") {
        const href = safeHref(mark.attrs?.href);
        if (href) text = <a key={`${key}-link`} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}>{text}</a>;
      }
    }
    return text;
  }

  const children = (node.content ?? []).map((child, index) => renderNode(child as RichNode, `${key}-${index}`));
  switch (node.type) {
    case "doc": return <>{children}</>;
    case "paragraph": return <p key={key}>{children}</p>;
    case "heading": {
      const level = node.attrs?.level === 3 ? 3 : 2;
      return level === 3 ? <h3 key={key}>{children}</h3> : <h2 key={key}>{children}</h2>;
    }
    case "bulletList": return <ul key={key}>{children}</ul>;
    case "orderedList": return <ol key={key}>{children}</ol>;
    case "listItem": return <li key={key}>{children}</li>;
    case "blockquote": return <blockquote key={key}>{children}</blockquote>;
    case "codeBlock": return <pre key={key}><code>{children}</code></pre>;
    case "hardBreak": return <br key={key} />;
    case "horizontalRule": return <hr key={key} />;
    case "image": {
      const src = safeImageSrc(node.attrs?.src);
      if (!src) return null;
      return <Image key={key} src={src} alt={String(node.attrs?.alt ?? "")} width={1200} height={675} unoptimized className="my-6 h-auto w-full rounded-xl" />;
    }
    default: return <>{children}</>;
  }
}

export function RichTextContent({ content }: { content: JSONContent | null | undefined }) {
  if (!content || typeof content !== "object") return null;
  return <>{renderNode(content as RichNode, "root")}</>;
}
