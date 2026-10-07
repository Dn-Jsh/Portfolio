begin;

delete from public.portfolio_drafts
where content_type = 'recommendation'
  and (draft->>'name', draft->>'role') in (
    ('Maria Santos', 'Project Manager at StartupPH'),
    ('Carlos Reyes', 'Senior Developer at WebDev Co.'),
    ('Prof. Ana Cruz', 'Faculty, College of Computer Studies, PUP')
  );

delete from public.portfolio_published
where content_type = 'recommendation'
  and (data->>'name', data->>'role') in (
    ('Maria Santos', 'Project Manager at StartupPH'),
    ('Carlos Reyes', 'Senior Developer at WebDev Co.'),
    ('Prof. Ana Cruz', 'Faculty, College of Computer Studies, PUP')
  );

commit;
