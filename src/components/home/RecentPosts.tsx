import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getAllPosts } from "@/lib/mdx";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export async function RecentPosts() {
  const posts = await getAllPosts();
  const recentPosts = posts.slice(0, 2);

  return (
    <section className="mb-24">
      <ScrollReveal>
        <SectionTitle
          number="01"
          title="blog"
          action={
            <Link href="/blog" className="text-sm font-mono flex items-center gap-1 hover:text-muted transition-colors">
              ALL POSTS <ArrowRight size={14} />
            </Link>
          }
        />
        <div className="flex flex-col gap-4">
          {recentPosts.map((post, i) => (
            <ScrollReveal key={post.slug} delay={i * 0.1}>
              <Link href={`/blog/${post.slug}`} className="project-row flex flex-col sm:flex-row sm:justify-between items-start sm:items-center group py-2 gap-1 sm:gap-4 rounded-md">
                <span className="text-lg font-medium group-hover:text-muted transition-colors break-words">{post.title}</span>
                <span className="text-sm font-mono text-muted shrink-0">
                  {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                </span>
              </Link>
            </ScrollReveal>
          ))}
          {recentPosts.length === 0 && (
            <p className="text-muted">No posts found.</p>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
