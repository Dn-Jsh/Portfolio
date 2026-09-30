create extension if not exists pgcrypto;

create table public.portfolio_editors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.portfolio_drafts (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('site_settings','page_intro','blog_post','project','experience','certification','recommendation','gear','social','stack_group')),
  slug text,
  sort_order integer not null default 0,
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  updated_at timestamptz not null default now()
);
create unique index portfolio_drafts_slug_unique on public.portfolio_drafts(content_type, slug) where slug is not null;
create unique index portfolio_drafts_settings_unique on public.portfolio_drafts(content_type) where content_type = 'site_settings';

create table public.portfolio_published (
  id uuid primary key,
  content_type text not null check (content_type in ('site_settings','page_intro','blog_post','project','experience','certification','recommendation','gear','social','stack_group')),
  slug text,
  sort_order integer not null default 0,
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  published_at timestamptz not null default now()
);
create unique index portfolio_published_slug_unique on public.portfolio_published(content_type, slug) where slug is not null;
create unique index portfolio_published_settings_unique on public.portfolio_published(content_type) where content_type = 'site_settings';
create index portfolio_published_order_idx on public.portfolio_published(content_type, sort_order, published_at desc);

alter table public.portfolio_editors enable row level security;
alter table public.portfolio_drafts enable row level security;
alter table public.portfolio_published enable row level security;
revoke all on public.portfolio_editors, public.portfolio_drafts, public.portfolio_published from anon, authenticated;
grant select on public.portfolio_published to anon, authenticated;
grant select, insert, update, delete on public.portfolio_drafts to authenticated;

create function public.is_portfolio_editor() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.portfolio_editors e where e.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_portfolio_editor() from public, anon;
grant execute on function public.is_portfolio_editor() to authenticated;

create policy "Editors can read their membership" on public.portfolio_editors
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Editors can manage drafts" on public.portfolio_drafts
  for all to authenticated using (public.is_portfolio_editor()) with check (public.is_portfolio_editor());
create policy "Public can read published content" on public.portfolio_published
  for select to anon, authenticated using (true);
create policy "Editors can manage published content" on public.portfolio_published
  for all to authenticated using (public.is_portfolio_editor()) with check (public.is_portfolio_editor());

create function public.publish_portfolio_item(p_content_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare item public.portfolio_drafts%rowtype;
begin
  if not public.is_portfolio_editor() then raise exception 'Not authorized'; end if;
  select * into item from public.portfolio_drafts where id = p_content_id;
  if not found then raise exception 'Draft not found'; end if;
  insert into public.portfolio_published(id, content_type, slug, sort_order, data, published_at)
  values (item.id, item.content_type, item.slug, item.sort_order, item.draft, now())
  on conflict (id) do update set content_type = excluded.content_type, slug = excluded.slug,
    sort_order = excluded.sort_order, data = excluded.data, published_at = excluded.published_at;
end;
$$;
create function public.unpublish_portfolio_item(p_content_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_portfolio_editor() then raise exception 'Not authorized'; end if;
  delete from public.portfolio_published where id = p_content_id;
end;
$$;
create function public.delete_portfolio_item(p_content_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_portfolio_editor() then raise exception 'Not authorized'; end if;
  delete from public.portfolio_published where id = p_content_id;
  delete from public.portfolio_drafts where id = p_content_id;
end;
$$;
revoke all on function public.publish_portfolio_item(uuid) from public, anon;
revoke all on function public.unpublish_portfolio_item(uuid) from public, anon;
revoke all on function public.delete_portfolio_item(uuid) from public, anon;
grant execute on function public.publish_portfolio_item(uuid) to authenticated;
grant execute on function public.unpublish_portfolio_item(uuid) to authenticated;
grant execute on function public.delete_portfolio_item(uuid) to authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-media', 'portfolio-media', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif','image/avif'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy "Portfolio media is public" on storage.objects
  for select to anon, authenticated using (bucket_id = 'portfolio-media');
create policy "Editors upload portfolio media" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio-media' and public.is_portfolio_editor());
create policy "Editors update portfolio media" on storage.objects
  for update to authenticated using (bucket_id = 'portfolio-media' and public.is_portfolio_editor())
  with check (bucket_id = 'portfolio-media' and public.is_portfolio_editor());
create policy "Editors delete portfolio media" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio-media' and public.is_portfolio_editor());

with seed(content_type, slug, sort_order, draft) as (values
  ('site_settings','main',0,'{"heroKicker":"Full-stack developer · BSIT / PUP","firstName":"Dan","lastName":"Jeshua","bioFirst":"I''m a full-stack developer and 4th-year BSIT student at PUP. I build modern web & mobile apps, and these days I''m focused on shipping real products.","bioSecond":"Right now I''m freelancing, sharpening my craft, and working toward landing a dev role and building my own startup.","profileImage":"/profile-nobg.png","stats":[{"value":"10+","label":"Projects Shipped"},{"value":"3+ yrs","label":"Building"},{"value":"4th yr","label":"BSIT · PUP"}]}'::jsonb),
  ('page_intro','blog',0,'{"title":"blog","description":"Thoughts, tutorials, and notes on tech, engineering, and building things."}'::jsonb),
  ('page_intro','projects',1,'{"title":"projects","description":"Products and platforms I''ve designed and shipped — spanning web apps, mobile apps, and developer tools."}'::jsonb),
  ('page_intro','experience',2,'{"title":"experience","description":"Building across web and mobile development — from freelance projects to team collaborations."}'::jsonb),
  ('page_intro','stack',3,'{"title":"tech stack","description":"The tools, frameworks, and platforms I reach for — across the front end, back end, and infrastructure."}'::jsonb),
  ('page_intro','certifications',4,'{"title":"certifications","description":"Credentials across cloud, engineering, and development — each verifiable at its source."}'::jsonb),
  ('page_intro','recommendations',5,'{"title":"recommendations","description":"What leaders, teammates, and mentors say about working with me."}'::jsonb),
  ('page_intro','gear',6,'{"title":"gear","description":"The five devices I use every day. Explore the details, from my desk to my everyday carry."}'::jsonb),
  ('page_intro','socials',7,'{"title":"socials","description":"Where to find me across the internet."}'::jsonb),
  ('stack_group','frontend',10,'{"category":"FRONTEND","items":["JavaScript","TypeScript","React","Next.js","Tailwind CSS","HTML","CSS","Framer Motion"]}'::jsonb),
  ('stack_group','backend',20,'{"category":"BACKEND","items":["Node.js","Express","Python","PHP","REST APIs","GraphQL"]}'::jsonb),
  ('stack_group','database',30,'{"category":"DATABASE","items":["PostgreSQL","MongoDB","MySQL","Firebase","Supabase"]}'::jsonb),
  ('stack_group','mobile',40,'{"category":"MOBILE","items":["React Native","Expo","Flutter"]}'::jsonb),
  ('stack_group','devops-tools',50,'{"category":"DEVOPS & TOOLS","items":["Git","GitHub","Docker","Vercel","Netlify","VS Code","Figma"]}'::jsonb),
  ('project',null,10,'{"title":"Anointed Worship","description":"A church and worship application featuring media playback, synchronized lyrics, and worship set management for modern congregations.","tags":["React Native","Firebase","TypeScript"],"link":"#","status":"Released"}'::jsonb),
  ('project',null,20,'{"title":"TaskFlow","description":"A minimalist project management tool with drag-and-drop kanban boards, time tracking, and team collaboration features.","tags":["Next.js","Prisma","PostgreSQL"],"link":"#","status":"In Development"}'::jsonb),
  ('project',null,30,'{"title":"QuickBite","description":"A food ordering platform for local restaurants with real-time order tracking, payment integration, and restaurant dashboard.","tags":["React","Node.js","MongoDB"],"link":"#","status":"Released"}'::jsonb),
  ('project',null,40,'{"title":"DevNotes","description":"A markdown-based note-taking app designed for developers with code snippet support, syntax highlighting, and cloud sync.","tags":["Electron","React","SQLite"],"link":"#","status":"Side Project"}'::jsonb),
  ('experience',null,10,'{"company":"Freelance","role":"Web Developer","type":"Self-Employed","period":"2025 — Present","location":"Remote","description":"Building custom web applications and mobile apps for clients. Working with React, Next.js, and React Native to deliver modern, performant solutions.","skills":["React","Next.js","Tailwind CSS","TypeScript"]}'::jsonb),
  ('experience',null,20,'{"company":"Tech Startup Co.","role":"Frontend Developer Intern","type":"Internship","period":"Jun 2024 — Aug 2024","location":"Metro Manila, Philippines","description":"Contributed to the development of internal tools and customer-facing dashboards. Worked closely with senior engineers on component architecture and API integration.","skills":["React","JavaScript","REST APIs"]}'::jsonb),
  ('experience',null,30,'{"company":"PUP Developer Community","role":"Lead Developer","type":"Student Organization","period":"2023 — Present","location":"PUP Manila","description":"Leading a team of student developers in building community projects. Organized workshops and hackathons to promote software development skills.","skills":["Leadership","Project Management","Mentoring"]}'::jsonb),
  ('certification',null,10,'{"title":"AWS Certified Cloud Practitioner","provider":"Amazon Web Services","category":"CLOUD","date":"2025","link":"#"}'::jsonb),
  ('certification',null,20,'{"title":"Meta Front-End Developer","provider":"Meta · Coursera","category":"ENGINEERING","date":"2024","link":"#"}'::jsonb),
  ('certification',null,30,'{"title":"React Native Specialization","provider":"Meta · Coursera","category":"MOBILE","date":"2024","link":"#"}'::jsonb),
  ('certification',null,40,'{"title":"JavaScript Algorithms & Data Structures","provider":"freeCodeCamp","category":"ENGINEERING","date":"2023","link":"#"}'::jsonb),
  ('certification',null,50,'{"title":"Responsive Web Design","provider":"freeCodeCamp","category":"ENGINEERING","date":"2023","link":"#"}'::jsonb),
  ('recommendation',null,10,'{"name":"Maria Santos","role":"Project Manager at StartupPH","quote":"Dan is one of the most dedicated developers I''ve worked with. His attention to detail and willingness to go the extra mile made our project a success.","date":"2025"}'::jsonb),
  ('recommendation',null,20,'{"name":"Carlos Reyes","role":"Senior Developer at WebDev Co.","quote":"Working with Dan was a great experience. He picks up new technologies quickly and delivers clean, well-structured code consistently.","date":"2024"}'::jsonb),
  ('recommendation',null,30,'{"name":"Prof. Ana Cruz","role":"Faculty, College of Computer Studies, PUP","quote":"Dan stands out among his peers for his initiative and technical skills. He consistently produces work that exceeds expectations.","date":"2024"}'::jsonb),
  ('social',null,10,'{"platform":"GitHub","handle":"@Dn-Jsh","description":"Open source projects & contributions","link":"https://github.com/Dn-Jsh","icon":"github"}'::jsonb),
  ('social',null,20,'{"platform":"LinkedIn","handle":"Dan Jeshua","description":"Professional network & updates","link":"https://www.linkedin.com/in/dan-jeshua-48b687288","icon":"linkedin"}'::jsonb),
  ('social',null,30,'{"platform":"Instagram","handle":"@danjeshua","description":"Photos, stories, behind the scenes","link":"https://instagram.com/danjeshua","icon":"instagram"}'::jsonb),
  ('social',null,40,'{"platform":"TikTok","handle":"@danjeshua","description":"Short-form content","link":"https://tiktok.com/@danjeshua","icon":"tiktok"}'::jsonb),
  ('social',null,50,'{"platform":"Facebook","handle":"Dan Jeshua","description":"Personal updates & community","link":"https://facebook.com/danjeshua","icon":"facebook"}'::jsonb),
  ('social',null,60,'{"platform":"X","handle":"@danjeshua","description":"Thoughts and tech posts","link":"https://x.com/danjeshua","icon":"twitter"}'::jsonb),
  ('gear',null,10,'{"name":"ASUS ROG Strix G17 (G713QE)","description":"Ryzen 9 5900HX · RTX 3050 Ti 4GB · 16GB RAM · 512GB SSD.","category":"DESK SETUP","model":"laptop","image":"/gear/rog-strix-g713qe.png","imageAlt":"Representative cutout of a black ROG Strix G17 gaming laptop."}'::jsonb),
  ('gear',null,20,'{"name":"AULA F75","description":"75% mechanical keyboard.","category":"DESK SETUP","model":"keyboard","image":"/gear/aula-f75.png","referenceImage":"/gear/references/aula-f75.png","imageAlt":"Enhanced cutout of a white and blue AULA F75 mechanical keyboard."}'::jsonb),
  ('gear',null,30,'{"name":"Attack Shark X11","description":"Wireless gaming mouse.","category":"DESK SETUP","model":"mouse","image":"/gear/attack-shark-x11.png","referenceImage":"/gear/references/attack-shark-x11.png","imageAlt":"Enhanced cutout of an Attack Shark X11 mouse with charging dock."}'::jsonb),
  ('gear',null,40,'{"name":"Soundcore R50i","description":"Wireless earbuds with charging case.","category":"EVERYDAY CARRY","model":"earbuds","image":"/gear/soundcore-r50i.png","referenceImage":"/gear/references/soundcore-r50i.png","imageAlt":"Enhanced cutout of black Soundcore R50i earbuds with charging case."}'::jsonb),
  ('gear',null,50,'{"name":"Samsung Galaxy Z Fold5","description":"Foldable smartphone.","category":"EVERYDAY CARRY","model":"phone","image":"/gear/galaxy-z-fold5.png","referenceImage":"/gear/references/galaxy-z-fold5.png","imageAlt":"Enhanced cutout of Samsung Galaxy Z Fold5 front and rear product views."}'::jsonb),
  ('blog_post','hello-world',10,'{"title":"Hello World: Building My New Portfolio","slug":"hello-world","date":"2026-09-29","description":"A look into how I built this portfolio using Next.js 15, Tailwind CSS v4, and MDX.","coverImage":"","body":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Welcome to my new digital garden."}]},{"type":"paragraph","content":[{"type":"text","text":"This portfolio is designed to be minimal, content-forward, and fast."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Why this stack?"}]},{"type":"paragraph","content":[{"type":"text","text":"I wanted a tech stack that I''m comfortable with but also pushes the boundaries of modern web development. The App Router makes data fetching and layouts a breeze, while Tailwind''s new v4 engine is incredibly fast."}]},{"type":"paragraph","content":[{"type":"text","text":"This is just the beginning. I''ll be sharing my journey, technical learnings, and projects here. Thanks for stopping by!"}]}]}}'::jsonb)
), inserted as (
  insert into public.portfolio_drafts(content_type,slug,sort_order,draft)
  select content_type,slug,sort_order,draft from seed
  on conflict do nothing
  returning id,content_type,slug,sort_order,draft
)
insert into public.portfolio_published(id,content_type,slug,sort_order,data,published_at)
select id,content_type,slug,sort_order,draft,now() from inserted
on conflict (id) do nothing;

update public.portfolio_drafts set draft = jsonb_set(draft, '{body}', $post$
{"type":"doc","content":[
  {"type":"paragraph","content":[{"type":"text","text":"Welcome to my new digital garden."}]},
  {"type":"paragraph","content":[{"type":"text","text":"This portfolio is designed to be minimal, content-forward, and fast. I built it using:"}]},
  {"type":"bulletList","content":[
    {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Next.js 15","marks":[{"type":"bold"}]},{"type":"text","text":" with the App Router"}]}]},
    {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Tailwind CSS v4","marks":[{"type":"bold"}]},{"type":"text","text":" for styling"}]}]},
    {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Framer Motion","marks":[{"type":"bold"}]},{"type":"text","text":" for subtle scroll animations"}]}]},
    {"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"MDX","marks":[{"type":"bold"}]},{"type":"text","text":" for blog posts"}]}]}
  ]},
  {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Why this stack?"}]},
  {"type":"paragraph","content":[{"type":"text","text":"I wanted a tech stack that I'm comfortable with but also pushes the boundaries of modern web development. The App Router makes data fetching and layouts a breeze, while Tailwind's new v4 engine is incredibly fast."}]},
  {"type":"codeBlock","attrs":{"language":"typescript"},"content":[{"type":"text","text":"export default function HelloWorld() {\n  console.log(\"Welcome to my site!\");\n  return <p>Stay tuned for more updates.</p>;\n}"}]},
  {"type":"paragraph","content":[{"type":"text","text":"This is just the beginning. I'll be sharing my journey, technical learnings, and projects here. Thanks for stopping by!"}]}
]}
$post$::jsonb) where content_type = 'blog_post' and slug = 'hello-world';

update public.portfolio_published set data = jsonb_set(data, '{body}', draft.draft->'body')
from public.portfolio_drafts draft
where public.portfolio_published.id = draft.id
  and public.portfolio_published.content_type = 'blog_post'
  and public.portfolio_published.slug = 'hello-world';

comment on table public.portfolio_drafts is 'Private working copies for the portfolio editor.';
comment on table public.portfolio_published is 'Public portfolio content. Drafts live in a separate table.';
