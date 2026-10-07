# Portfolio tickets

| ID | Task | Owner | Status |
| --- | --- | --- | --- |
| EXP-001 | Replace the two placeholder roles with Domain Seller at Domain Nerds, 2019–2020 | Codex | Blocked |
| CERT-001 | Remove the five demo AWS, Meta, and freeCodeCamp certifications | Codex | Blocked |
| REC-001 | Remove the three demo recommendations | Codex | Blocked |

## EXP-001 evidence

Acceptance criteria: replace Tech Startup Co. and PUP Developer Community with one Domain Nerds entry; use Domain Seller and 2019–2020; preserve Freelance; synchronize CMS drafts and published content.

The local experience data is updated in `src/data/experience.ts`. A transactional forward migration is prepared in `supabase/migrations/202610070001_replace_placeholder_experience.sql`. It targets only the two named placeholder roles in drafts and published content. No schema, permissions, rendering, or dependencies change. Original values remain available in the initial migration for recovery.

Validation: `npx tsc --noEmit`, `npx eslint src/data/experience.ts`, and `git diff --check` passed. The final diff was reviewed. Both the homepage preview and experience page consume this shared data, unless Supabase supplies published content.

Engineering gates: intake, ownership, data flow, conventions, TypeScript, scoped migration compatibility, recovery, security review, and local verification passed. A full build, new tests, and browser testing are unnecessary for this static content edit. Layout, accessibility, RLS, schema, and dependencies are unchanged. Independent specialist review and parallel work are N/A for this small content change. No project brief or navigation guide was present.

Blocker: a read-only Supabase query returned “You do not have permission to perform this action.” The migration has not been applied or database-tested. Live acceptance remains unverified. Apply the prepared migration through an authorized database connection, then check the homepage and experience page.

## CERT-001 evidence

Acceptance criteria: remove the five certification entries in the screenshot; preserve all DICT and TESDA certificates; remove corresponding CMS drafts and published rows.

Removed the five entries from `src/data/certifications.ts`. Prepared `supabase/migrations/202610070002_remove_demo_certifications.sql`, which deletes only certification records with the five specified titles in a transaction. Historical migrations are preserved for recovery. Schema, RLS, rendering, and dependencies are unchanged.

Validation: `npx tsc --noEmit`, `npx eslint src/data/certifications.ts`, and `git diff --check` passed. A Node assertion against the transpiled data confirmed six retained certificates: one DICT and five TESDA. Reviewed the final diff. The certification page groups only existing records, so empty demo categories disappear after the content update.

Relevant engineering gates passed for local intake, ownership, data flow, scope, conventions, types, migration compatibility, recovery, security, and verification. Full build, new persisted tests, independent specialist review, and browser testing are N/A for this static content removal. Layout, accessibility, schema, RLS, and dependencies are unchanged. Live verification remains pending; the existing Supabase permission denial still prevents applying and testing either migration.

## REC-001 evidence

Acceptance criteria: remove recommendations from Maria Santos, Carlos Reyes, and Prof. Ana Cruz from the homepage preview and recommendations page; add no replacements; synchronize CMS drafts and published content.

Emptied `src/data/recommendations.ts` while preserving an explicit item type for existing components and future CMS entries. Prepared `supabase/migrations/202610070003_remove_demo_recommendations.sql`, targeting only recommendation records matching the three names and roles in a transaction. Both views use the shared data source. No replacement testimonials were added.

Validation: `npx tsc --noEmit`, `npx eslint src/data/recommendations.ts`, and `git diff --check` passed. Reviewed the final diff and both consuming views. Local recommendations are empty. Historical seed data remains available for recovery.

Relevant engineering gates passed for local intake, ownership, data flow, scope, conventions, types, migration compatibility, recovery, security, and verification. A full build, new persisted tests, independent specialist review, and browser testing are N/A for this content removal. Layout, accessibility, schema, RLS, and dependencies are unchanged. The existing Supabase permission denial prevents applying and testing the migration; live removal remains unverified.

Completed: 0/3 tickets. All local edits are ready. Next task: apply and verify the three CMS migrations with authorized access.

## Git delivery

The user authorized pushing these changes to the current `main` branch. The final content diff and three migration files were reviewed before staging. `npm audit --omit=dev` ran before committing and reported three existing dependency vulnerabilities (two moderate and one high), affecting `postcss-selector-parser`, `@tailwindcss/typography`, and `source-map-js`. This content-only update changes no dependencies; dependency remediation is outside its scope. CMS application and live acceptance remain pending regardless of Git delivery.
