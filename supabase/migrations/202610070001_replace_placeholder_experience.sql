begin;

update public.portfolio_drafts
set draft = '{"company":"Domain Nerds","role":"Domain Seller","type":"Domain Sales","period":"2019 — 2020","location":"","description":"Sold domain names at Domain Nerds, helping buyers find domains for their businesses and online projects.","skills":["Domain Sales","Customer Communication"]}'::jsonb,
    updated_at = now()
where content_type = 'experience'
  and draft->>'company' = 'Tech Startup Co.'
  and draft->>'role' = 'Frontend Developer Intern';

update public.portfolio_published
set data = '{"company":"Domain Nerds","role":"Domain Seller","type":"Domain Sales","period":"2019 — 2020","location":"","description":"Sold domain names at Domain Nerds, helping buyers find domains for their businesses and online projects.","skills":["Domain Sales","Customer Communication"]}'::jsonb,
    published_at = now()
where content_type = 'experience'
  and data->>'company' = 'Tech Startup Co.'
  and data->>'role' = 'Frontend Developer Intern';

delete from public.portfolio_drafts
where content_type = 'experience'
  and draft->>'company' = 'PUP Developer Community'
  and draft->>'role' = 'Lead Developer';

delete from public.portfolio_published
where content_type = 'experience'
  and data->>'company' = 'PUP Developer Community'
  and data->>'role' = 'Lead Developer';

commit;
