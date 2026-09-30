-- Refresh the Hello World article to match the current portfolio stack.
begin;

with updated_post as (
  select
    'A look at the stack behind this portfolio: Next.js 16, React 19, TypeScript, Tailwind CSS v4, and Supabase.'::text as description,
    $body$
    {
      "type": "doc",
      "content": [
        { "type": "paragraph", "content": [{ "type": "text", "text": "Welcome to my digital garden." }] },
        { "type": "paragraph", "content": [{ "type": "text", "text": "I built this portfolio to load quickly, feel lively, and stay easy to update. Here is the stack behind it:" }] },
        { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Tech stack" }] },
        {
          "type": "bulletList",
          "content": [
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Next.js 16", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " with the App Router for routing and page rendering" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "React 19", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " and " }, { "type": "text", "text": "TypeScript", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " for reusable, typed UI" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Tailwind CSS v4", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " for responsive styling" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Supabase", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " with PostgreSQL for published content, drafts, editor accounts, and image storage" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Framer Motion", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " for page transitions and interface animations" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Three.js", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " for the interactive rotating gear models" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "MDX", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " with next-mdx-remote for file-based posts, plus " }, { "type": "text", "text": "TipTap", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " for rich-text editing in the portfolio CMS" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Lucide React", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " for interface icons" }] }] }
          ]
        },
        { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Why this stack?" }] },
        { "type": "paragraph", "content": [{ "type": "text", "text": "The Next.js App Router gives the site a clear structure for its pages and layouts, while React and TypeScript make the interactive parts easier to build and maintain. Tailwind keeps the styling close to the components, and Supabase lets me edit published content without hardcoding every change. Three.js adds a hands-on 3D view for my gear." }] },
        { "type": "paragraph", "content": [{ "type": "text", "text": "MDX keeps this post versioned alongside the code, while the portfolio editor uses TipTap so I can update content in the browser. Thanks for stopping by!" }] }
      ]
    }
    $body$::jsonb as body
)
update public.portfolio_drafts as draft
set draft = jsonb_set(
      jsonb_set(draft.draft, '{description}', to_jsonb(updated_post.description), true),
      '{body}', updated_post.body, true
    ),
    updated_at = now()
from updated_post
where draft.content_type = 'blog_post'
  and draft.slug = 'hello-world';

with updated_post as (
  select
    'A look at the stack behind this portfolio: Next.js 16, React 19, TypeScript, Tailwind CSS v4, and Supabase.'::text as description,
    $body$
    {
      "type": "doc",
      "content": [
        { "type": "paragraph", "content": [{ "type": "text", "text": "Welcome to my digital garden." }] },
        { "type": "paragraph", "content": [{ "type": "text", "text": "I built this portfolio to load quickly, feel lively, and stay easy to update. Here is the stack behind it:" }] },
        { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Tech stack" }] },
        {
          "type": "bulletList",
          "content": [
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Next.js 16", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " with the App Router for routing and page rendering" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "React 19", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " and " }, { "type": "text", "text": "TypeScript", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " for reusable, typed UI" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Tailwind CSS v4", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " for responsive styling" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Supabase", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " with PostgreSQL for published content, drafts, editor accounts, and image storage" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Framer Motion", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " for page transitions and interface animations" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Three.js", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " for the interactive rotating gear models" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "MDX", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " with next-mdx-remote for file-based posts, plus " }, { "type": "text", "text": "TipTap", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " for rich-text editing in the portfolio CMS" }] }] },
            { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Lucide React", "marks": [{ "type": "bold" }] }, { "type": "text", "text": " for interface icons" }] }] }
          ]
        },
        { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "Why this stack?" }] },
        { "type": "paragraph", "content": [{ "type": "text", "text": "The Next.js App Router gives the site a clear structure for its pages and layouts, while React and TypeScript make the interactive parts easier to build and maintain. Tailwind keeps the styling close to the components, and Supabase lets me edit published content without hardcoding every change. Three.js adds a hands-on 3D view for my gear." }] },
        { "type": "paragraph", "content": [{ "type": "text", "text": "MDX keeps this post versioned alongside the code, while the portfolio editor uses TipTap so I can update content in the browser. Thanks for stopping by!" }] }
      ]
    }
    $body$::jsonb as body
)
update public.portfolio_published as published
set data = jsonb_set(
      jsonb_set(published.data, '{description}', to_jsonb(updated_post.description), true),
      '{body}', updated_post.body, true
    )
from updated_post
where published.content_type = 'blog_post'
  and published.slug = 'hello-world';

commit;
