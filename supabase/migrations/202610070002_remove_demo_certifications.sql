begin;

delete from public.portfolio_drafts
where content_type = 'certification'
  and draft->>'title' in (
    'AWS Certified Cloud Practitioner',
    'Meta Front-End Developer',
    'React Native Specialization',
    'JavaScript Algorithms & Data Structures',
    'Responsive Web Design'
  );

delete from public.portfolio_published
where content_type = 'certification'
  and data->>'title' in (
    'AWS Certified Cloud Practitioner',
    'Meta Front-End Developer',
    'React Native Specialization',
    'JavaScript Algorithms & Data Structures',
    'Responsive Web Design'
  );

commit;
