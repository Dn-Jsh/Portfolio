import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, getSupabasePublicEnv } from "@/lib/supabase/env";

export type ContentType =
  | "site_settings"
  | "page_intro"
  | "blog_post"
  | "project"
  | "experience"
  | "certification"
  | "recommendation"
  | "gear"
  | "social"
  | "stack_group";

export type ContentRecord<T = Record<string, unknown>> = {
  id: string;
  content_type: ContentType;
  slug: string | null;
  sort_order: number;
  data: T;
  published_at?: string;
};

function publicClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

export async function getPublishedItems<T>(
  contentType: ContentType,
  fallback: T[] = [],
): Promise<ContentRecord<T>[]> {
  if (!isSupabaseConfigured()) {
    return fallback.map((data, index) => ({
      id: `fallback-${contentType}-${index}`,
      content_type: contentType,
      slug: null,
      sort_order: index,
      data,
    }));
  }

  const { data, error } = await publicClient()
    .from("portfolio_published")
    .select("id, content_type, slug, sort_order, data, published_at")
    .eq("content_type", contentType)
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false });

  if (error) {
    console.error(`Could not load published ${contentType} content:`, error.message);
    return fallback.map((item, index) => ({
      id: `fallback-${contentType}-${index}`,
      content_type: contentType,
      slug: null,
      sort_order: index,
      data: item,
    }));
  }

  return (data ?? []) as ContentRecord<T>[];
}

export async function getPublishedItemBySlug<T>(
  contentType: ContentType,
  slug: string,
): Promise<ContentRecord<T> | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await publicClient()
    .from("portfolio_published")
    .select("id, content_type, slug, sort_order, data, published_at")
    .eq("content_type", contentType)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`Could not load published ${contentType} content:`, error.message);
    return null;
  }

  return data as ContentRecord<T> | null;
}

export async function getSiteSettings<T>(fallback: T): Promise<T> {
  const items = await getPublishedItems<T>("site_settings", [fallback]);
  return items[0]?.data ?? fallback;
}

export async function getPageIntro<T>(slug: string, fallback: T): Promise<T> {
  const page = await getPublishedItemBySlug<T>("page_intro", slug);
  return page?.data ?? fallback;
}
