import { getPostBySlug } from "@/lib/mdx";
import { RichTextContent } from "@/components/ui/RichTextContent";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const dynamic = "force-dynamic";

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="page-enter max-w-3xl">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg transition-colors mb-12">
        <ArrowLeft size={16} /> Back to blog
      </Link>
      
      <ScrollReveal>
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{post.meta.title}</h1>
          <div className="flex items-center gap-4 text-sm font-mono text-muted">
            <time dateTime={post.meta.date}>
              {new Date(post.meta.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </time>
          </div>
          {post.meta.coverImage && <div className="relative mt-7 aspect-video overflow-hidden rounded-xl border border-border"><Image src={post.meta.coverImage} alt="" fill unoptimized sizes="(max-width: 768px) 100vw, 768px" className="object-cover" /></div>}
        </header>

        <div className="prose prose-neutral dark:prose-invert prose-headings:font-semibold prose-a:text-fg hover:prose-a:text-muted transition-colors prose-pre:bg-card prose-pre:border prose-pre:border-border prose-img:rounded-xl">
          {post.isRichText ? <RichTextContent content={post.content as import("@tiptap/core").JSONContent} /> : post.content}
        </div>
      </ScrollReveal>
    </div>
  );
}
