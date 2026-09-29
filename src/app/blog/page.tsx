import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getAllPosts } from "@/lib/mdx";
import Link from "next/link";

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-3">blog</h1>
      <p className="text-muted mb-12 max-w-xl">
        Thoughts, tutorials, and notes on tech, engineering, and building things.
      </p>

      <div className="flex flex-col">
        {posts.map((post, i) => (
          <ScrollReveal key={post.slug} delay={i * 0.08}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex gap-6 py-6 border-b border-border hover:bg-card/50 -mx-4 px-4 rounded-lg transition-colors"
            >
              {/* Thumbnail placeholder */}
              <div className="w-28 h-20 rounded-lg bg-card border border-border/50 flex items-center justify-center text-muted text-[10px] font-mono shrink-0">
                cover
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-mono uppercase tracking-wider text-muted">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })}
                </span>
                <h3 className="text-lg font-semibold mt-1 mb-1.5 group-hover:text-muted transition-colors">
                  {post.title}
                </h3>
                <p className="text-[14px] text-fg/60 leading-relaxed line-clamp-2">
                  {post.description}
                </p>
                <span className="inline-flex items-center gap-2 mt-3 text-[12px] font-mono text-muted">
                  Read · 3 min
                </span>
              </div>
            </Link>
          </ScrollReveal>
        ))}
        {posts.length === 0 && (
          <p className="text-muted py-8">No posts yet. Check back soon.</p>
        )}
      </div>
    </div>
  );
}
