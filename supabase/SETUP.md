# Portfolio editor setup

The editor lives at `/editportfolio` on the existing website. Supabase stores content, editor accounts, and uploaded images. The SQL migration seeds the published tables with the portfolio content that is currently in the project.

## 1. Use the Supabase project

Use your existing project and keep its project URL and publishable key available. The portfolio does not need a Supabase secret or service-role key.

## 2. Create the tables and initial content

In Supabase, open **SQL Editor**, paste the contents of `supabase/migrations/202609300001_portfolio_cms.sql`, and run it once. It creates the content tables, public image bucket, access rules, publish actions, and initial published content.

For later content updates, run each newer numbered SQL migration once, in order. Current migrations refresh the Hello World post and update the Instagram profile in drafts and published content.

The migration separates drafts from public content. Signed-out visitors can read only `portfolio_published`; draft rows require an allowlisted, signed-in editor.

## 3. Invite your editor account

Set **Authentication → URL Configuration → Site URL** to your portfolio's public address before inviting anyone. Add the same address and `http://localhost:3000/**` as allowed redirect URLs. Then use **Authentication → Users → Add user → Send invitation** with your email. The default Supabase invitation link returns to the site and opens `/editportfolio/setup`, where you set your password. The login page also has a password reset link.

Run this in SQL Editor, replacing the email with the invited account:

```sql
insert into public.portfolio_editors (user_id)
select id from auth.users where email = 'you@example.com'
on conflict (user_id) do nothing;
```

In **Authentication → Sign In / Providers**, turn off new user signups. Only the editor account you add to `portfolio_editors` can use `/editportfolio` or change content.

## 4. Connect the website

For local development, create a `.env.local` file in the project root with:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Add the same two values to the Vercel project under **Settings → Environment Variables**, for Development, Preview, and Production. Redeploy after adding them so the client bundle receives the public connection values. The older `NEXT_PUBLIC_SUPABASE_ANON_KEY` name is also supported for existing deployments.

Set Supabase Auth's Site URL to your portfolio's public address. Add `http://localhost:3000/**` and your Vercel site address to the allowed redirect URLs for password recovery and local development.

## 5. Use the editor

Open `/editportfolio`, sign in, and choose a content section. Edit an existing item or add a new one. **Save draft** keeps the public copy unchanged; **Preview draft** shows what you are about to publish; **Publish** updates the public copy. Use **Unpublish** to hide an item while keeping its draft.

Blog posts have a visual editor for headings, lists, links, quotes, code blocks, and images. Images uploaded in the editor go to the public `portfolio-media` bucket; only an allowlisted editor can upload or delete files.

## Costs and limits

The database and storage fit Supabase's free plan for a small personal portfolio. The current free tier can pause projects after a week without activity and has storage and bandwidth limits. Vercel keeps serving the site, but Supabase content will not load while its project is paused; resume the project in Supabase to restore it.

The dashboard manages entries and text in the current page layouts. Creating a new page type or changing a page's layout still needs a code change.
