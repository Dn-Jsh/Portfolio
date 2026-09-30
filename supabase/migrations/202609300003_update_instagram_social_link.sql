update public.portfolio_drafts
set draft = jsonb_set(
  jsonb_set(draft, '{handle}', to_jsonb('@dn_jsh'::text)),
  '{link}',
  to_jsonb('https://www.instagram.com/dn_jsh?stkn=M2diNm1jenQwamN1'::text)
),
updated_at = now()
where content_type = 'social'
  and lower(draft->>'platform') = 'instagram';

update public.portfolio_published
set data = jsonb_set(
  jsonb_set(data, '{handle}', to_jsonb('@dn_jsh'::text)),
  '{link}',
  to_jsonb('https://www.instagram.com/dn_jsh?stkn=M2diNm1jenQwamN1'::text)
)
where content_type = 'social'
  and lower(data->>'platform') = 'instagram';
