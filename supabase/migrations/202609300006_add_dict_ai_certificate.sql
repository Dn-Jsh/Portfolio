with new_certifications as materialized (
  select
    gen_random_uuid() as id,
    'certification'::text as content_type,
    null::text as slug,
    5 as sort_order,
    jsonb_build_object(
      'title', 'Leveraging ICT Competitiveness in AI Era',
      'provider', 'DICT Aurora',
      'category', 'TECHNICAL',
      'date', 'April 23, 2026',
      'link', '#'
    ) as draft
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
