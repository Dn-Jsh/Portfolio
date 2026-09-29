import { getPostBySlug, getAllPosts } from "@/lib/mdx";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl">
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
        </header>

        <div className="prose prose-neutral dark:prose-invert prose-headings:font-semibold prose-a:text-fg hover:prose-a:text-muted transition-colors prose-pre:bg-card prose-pre:border prose-pre:border-border prose-img:rounded-xl">
          {post.content}
        </div>
      </ScrollReveal>
    </div>
  );
}
