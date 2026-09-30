import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import { getPublishedItems, getPublishedItemBySlug, type ContentRecord } from "@/lib/portfolio-content";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export interface PostMeta {
  title: string;
  date: string;
  description: string;
  slug: string;
  coverImage?: string;
}

export type BlogPostData = PostMeta & {
  body: import("@tiptap/core").JSONContent;
};

export async function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.mdx$/, "");

  if (isSupabaseConfigured()) {
    const record = await getPublishedItemBySlug<BlogPostData>("blog_post", realSlug);
    if (!record) return null;
    return {
      meta: { ...record.data, slug: record.slug ?? record.data.slug },
      content: record.data.body,
      isRichText: true as const,
    };
  }

  const filePath = path.join(BLOG_DIR, `${realSlug}.mdx`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const fileContent = fs.readFileSync(filePath, "utf8");
  
  const { content, frontmatter } = await compileMDX<{
    title: string;
    date: string;
    description: string;
    coverImage?: string;
  }>({
    source: fileContent,
    options: {
      parseFrontmatter: true,
    },
  });
  
  return {
    meta: { ...frontmatter, slug: realSlug },
    content,
    isRichText: false as const,
  };
}

export async function getAllPosts(): Promise<PostMeta[]> {
  if (isSupabaseConfigured()) {
    const records = await getPublishedItems<BlogPostData>("blog_post");
    return records
      .map((record: ContentRecord<BlogPostData>) => ({
        title: record.data.title,
        date: record.data.date,
        description: record.data.description,
        coverImage: record.data.coverImage,
        slug: record.slug ?? record.data.slug ?? "",
      }))
      .sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));
  }

  if (!fs.existsSync(BLOG_DIR)) return [];
  
  const files = fs.readdirSync(BLOG_DIR);
  const posts = [];
  
  for (const file of files) {
    if (file.endsWith(".mdx")) {
      const post = await getPostBySlug(file);
      if (post) {
        posts.push(post.meta);
      }
    }
  }
  
  return posts.sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1));
}
