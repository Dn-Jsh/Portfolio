import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export interface PostMeta {
  title: string;
  date: string;
  description: string;
  slug: string;
}

export async function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.mdx$/, "");
  const filePath = path.join(BLOG_DIR, `${realSlug}.mdx`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const fileContent = fs.readFileSync(filePath, "utf8");
  
  const { content, frontmatter } = await compileMDX<{
    title: string;
    date: string;
    description: string;
  }>({
    source: fileContent,
    options: {
      parseFrontmatter: true,
    },
  });
  
  return {
    meta: { ...frontmatter, slug: realSlug },
    content,
  };
}

export async function getAllPosts(): Promise<PostMeta[]> {
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
