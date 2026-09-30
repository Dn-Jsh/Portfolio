import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/mdx";
import { PUBLIC_PAGES, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const paths = [
    ...Object.keys(PUBLIC_PAGES),
    ...posts
      .filter((post) => post.slug && ![".", ".."].includes(post.slug) && !post.slug.includes("/"))
      .map((post) => `/blog/${encodeURIComponent(post.slug)}`),
  ];

  return [...new Set(paths)].map((pathname) => ({
    url: new URL(pathname, SITE_URL).href,
  }));
}
