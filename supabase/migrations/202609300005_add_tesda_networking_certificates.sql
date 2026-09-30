with new_certifications as materialized (
  select
    gen_random_uuid() as id,
    'certification'::text as content_type,
    null::text as slug,
    30 as sort_order,
    jsonb_build_object(
      'title', 'Maintaining Computer Systems and Networks',
      'provider', 'TESDA Online Program',
      'category', 'TECHNICAL',
      'date', 'February 3, 2025',
      'link', '#'
    ) as draft
  union all
  select
    gen_random_uuid(),
    'certification',
    null::text,
    40,
    jsonb_build_object(
      'title', 'Setting Up Computer Servers',
      'provider', 'TESDA Online Program',
      'category', 'TECHNICAL',
      'date', 'February 3, 2025',
      'link', '#'
    )
  union all
  select
    gen_random_uuid(),
    'certification',
    null::text,
    60,
    jsonb_build_object(
      'title', 'Setting Up Computer Networks',
      'provider', 'TESDA Online Program',
      'category', 'TECHNICAL',
      'date', 'October 12, 2024',
      'link', '#'
    )
),
inserted_drafts as (
  insert into public.portfolio_drafts (id, content_type, slug, sort_order, draft)
  select item.id, item.content_type, item.slug, item.sort_order, item.draft
  from new_certifications item
  where not exists (
    select 1 from public.portfolio_published published
    where published.content_type = 'certification'
      and published.data->>'title' = item.draft->>'title'
  )
    and not exists (
      select 1 from public.portfolio_drafts draft
      where draft.content_type = 'certification'
        and draft.draft->>'title' = item.draft->>'title'
    )
  returning id, content_type, slug, sort_order, draft
)
insert into public.portfolio_published (id, content_type, slug, sort_order, data)
select id, content_type, slug, sort_order, draft
from inserted_drafts;

update public.portfolio_drafts
set sort_order = case draft->>'title'
  when 'Introduction to Computer Systems Servicing' then 50
  when 'Meta Front-End Developer' then 70
  when 'React Native Specialization' then 80
  when 'JavaScript Algorithms & Data Structures' then 90
  when 'Responsive Web Design' then 100
  else sort_order
end
where content_type = 'certification'
  and draft->>'title' in (
    'Introduction to Computer Systems Servicing',
    'Meta Front-End Developer',
    'React Native Specialization',
    'JavaScript Algorithms & Data Structures',
    'Responsive Web Design'
  );

update public.portfolio_published
set sort_order = case data->>'title'
  when 'Introduction to Computer Systems Servicing' then 50
  when 'Meta Front-End Developer' then 70
  when 'React Native Specialization' then 80
  when 'JavaScript Algorithms & Data Structures' then 90
  when 'Responsive Web Design' then 100
  else sort_order
end
where content_type = 'certification'
  and data->>'title' in (
    'Introduction to Computer Systems Servicing',
    'Meta Front-End Developer',
    'React Native Specialization',
    'JavaScript Algorithms & Data Structures',
    'Responsive Web Design'
  );
