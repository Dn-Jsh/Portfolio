import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PageIntro } from "@/components/ui/PageIntro";
import { getAllPosts } from "@/lib/mdx";
import { getPageIntro } from "@/lib/portfolio-content";
import Image from "next/image";
import Link from "next/link";
import { getPublicPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = getPublicPageMetadata("/blog");

export default async function BlogPage() {
  const posts = await getAllPosts();
  const intro = await getPageIntro("blog", { title: "blog", description: "Thoughts, tutorials, and notes on tech, engineering, and building things." });

  return (
    <div className="page-enter">
      <PageIntro title={intro.title} description={intro.description} />

      <div className="flex flex-col">
        {posts.map((post, i) => (
          <ScrollReveal key={post.slug} delay={i * 0.08}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex flex-col sm:flex-row gap-4 sm:gap-6 py-6 border-b border-border hover:bg-card/50 content-row rounded-lg transition-colors"
            >
              <div className="relative w-full sm:w-28 h-40 sm:h-20 rounded-lg bg-card border border-border/50 flex items-center justify-center text-muted text-[10px] font-mono shrink-0 overflow-hidden">
                {post.coverImage ? <Image src={post.coverImage} alt="" fill unoptimized sizes="(max-width: 640px) 100vw, 112px" className="object-cover" /> : "cover"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className="text-[12px] font-mono uppercase tracking-wider text-muted">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                  })}
                </span>
                <h3 className="text-lg font-semibold mt-1 mb-1.5 group-hover:text-muted transition-colors break-words">
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
