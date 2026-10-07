# Portfolio tickets

| ID | Task | Owner | Status |
| --- | --- | --- | --- |
| EXP-001 | Replace the two placeholder roles with Domain Seller at Domain Nerds, 2019–2020 | Codex | Blocked |
| CERT-001 | Remove the five demo AWS, Meta, and freeCodeCamp certifications | Codex | Blocked |
| REC-001 | Remove the three demo recommendations | Codex | Blocked |
| NAV-001 | Center the pink sidebar marker beside the active label | Codex | Done |
| RESP-001 | Adapt all website layouts and controls to Android and iPhone screen sizes | Codex; Laura review | Done |
| GH-001 | Display Dn-Jsh's real GitHub contributions instead of generated activity | Codex; Laura review | Done |

## GH-001 acceptance and scope

Replace the generated contribution cells with the public contribution calendar for the existing `Dn-Jsh` GitHub account. Display the real daily activity and yearly count, preserve chronological calendar layout and phone responsiveness, refresh cached data automatically, and show a clear unavailable state if GitHub cannot be read. Read only public GitHub data; require no browser-side secrets, new dependencies, account changes, or publishing. Codex owns implementation and ticket status. Laura independently reviews the candidate. Required checks: meaningful parser/fetch tests, TypeScript, scoped lint, production build, live-data comparison, responsive browser verification, independent review, and final diff review. Prior responsive edits remain in the working tree and must be preserved.

Review checkpoint: Laura independently passed all nine GitHub tests, four SEO tests, and scoped whitespace checks. No parsing, caching, chronology, or security regression was found. One P2 accessibility finding remains: nonfocusable daily-cell title tooltips do not expose dated counts to keyboard, touch, or screen-reader users. Add a native collapsible dated-count table and rendering coverage, then re-review the changed surface. The initial production build, TypeScript, and scoped lint passed. The real loader matched GitHub's public total of 12 across 368 days, including two contributions on 2026-10-07.

Follow-up review: the accessibility finding is resolved by a native disclosure and semantic date/count table, with newest dates first and a named, keyboard-scrollable region. Laura independently passed the nine GitHub tests and scoped whitespace check again and reported no remaining source findings. Reviewed component SHA256: `9A64CB3F503410CB807B63425DBCF02091AE371F01D8A38CE275902D2913E4B0`. Updated production build and live browser acceptance remain pending coordinator verification.

### GH-001 completion evidence

Connected the existing `Dn-Jsh` profile to GitHub's public contribution calendar through a server-side fetch cached for one hour, with a five-second timeout. The parser validates dates, counts, intensity levels, and complete consecutive calendar days. Only typed values render into the page; upstream HTML is never injected. Failure displays a clear unavailable state and a profile link. The calendar follows UTC weekdays, shows recent activity first on small screens through contained horizontal scrolling, and includes an accessible native disclosure with every dated count. No credentials, dependencies, account settings, or external resources were changed.

Validation passed:

- `npm run test:github`: all nine parser, fetch, failure-state, and rendered-component tests passed; Laura independently repeated them.
- `npm run test:seo`: all four existing tests passed.
- `npx tsc --noEmit`, scoped ESLint for affected source/tests and the browser verification script, and `git diff --check`: passed.
- `npm run build`: optimized production compilation, TypeScript, and page generation succeeded for the final component candidate.
- Live production verification matched all 368 rendered dates, daily counts, intensity levels, and the yearly total against [GitHub's public calendar](https://github.com/users/Dn-Jsh/contributions). On 2026-10-07 it showed 12 contributions across five active dates, including two on that date. The actual Next.js fetch cache recorded `revalidate: 3600` for the fixed public calendar URL.
- Dedicated browser checks passed at 280, 320, 390, 412, 844 landscape, and 1440 CSS pixels, including recent activity visibility, contained scrolling, keyboard and touch disclosure, all daily table rows, dark mode, and visible animation cells. No page errors or document overflow occurred.
- `npm run verify:responsive`: all 380 production checks passed across the existing 13 routes, 22 widths from 280 to 2560, Android/iPhone Chromium profiles, portrait/landscape, enlarged text, navigation, and QR dialogs.

The first full regression run exposed a transient resize measurement in the test harness: the new viewport dimensions arrived before the main container geometry updated. The helper now waits for the requested viewport and three identical geometry frames, bounded at one second. It still reports persistent overflow. Laura independently reviewed this final verification-script change, passed syntax/whitespace checks, and reported no findings. Reviewed script SHA256: `7525296D8510F2A779791EB40B2DF4CFD83E799A5A19F0CB0AAEDEB47924473D`.

Ignored local evidence: `.next/github-verification.log`, `.next/responsive-verification.log`, `.next/github-phone.png`, and `.next/github-counts-phone.png`. The calendar screenshots were visually reviewed. A persistent preview image is saved at `C:/Users/danje/.codex/visualizations/2026/10/07/01a11499-d8cf-7ef3-a300-89cc52ac3ab9/github-contributions.png`. The production preview remains served locally at `http://127.0.0.1:3000`.

Engineering Gates and Completion Mandate: intake/ownership gates 01–12, skills gate 14, code/style gates 15–18, rendering gate 20, external-input/error gates 21–22, and verification/review gates 30–37 passed through the evidence above. Parallel implementation gate 13, route/bundle gate 19, database gates 23–29, and gold-lane requirements are N/A for this standard-lane server-rendered integration. Dependencies are unchanged. Independent QA review and final diff review have no unresolved findings.

Limits: the public calendar's markup can change; validation then displays the unavailable state. Browser checks use Chromium emulation, not Safari/WebKit or physical devices. Changes are complete locally and have not been published. Current completion: 3/6 tickets. No GitHub or responsive work remains. The next backlog action is application and live verification of the three CMS migrations, blocked by the existing database permission denial.

## RESP-001 acceptance and scope

Acceptance criteria: keep every public page readable without page-level horizontal overflow at 280–2560 CSS pixels; support phone portrait and landscape orientations; keep mobile navigation and dialogs within the usable viewport; preserve zoom, keyboard access, safe-area padding, desktop layout, and existing content. Verify common Android and iPhone sizes, touch controls, enlarged text, and affected pages with the existing responsive browser check. Record browser-engine limitations explicitly.

Codex owns implementation, the responsive verification script, and ticket status. Laura owns independent read-only review. This is a standard-lane layout fix with no database, credential, dependency, or publishing changes. Existing blocked CMS tickets are not dependencies. Use the current installed Next.js documentation, existing styles, and native CSS before new logic. Required checks: production build, typecheck, lint, existing tests, responsive browser verification, independent review, and final diff review.

Review checkpoint: Laura independently reviewed the working diff against `c1580c8` and found no source regression. `node --check scripts/verify-responsive.mjs` and `git diff --check` passed independently. Required review skills and the installed Next.js CSS/viewport documentation were loaded. The reviewer identified two verification limits: root-font enlargement misses fixed-pixel text, and phone-context landscape checks cover only the last route. The coordinator will strengthen those checks before closure. Browser verification and production build remain pending; no WebKit or real-device validation is claimed.

Follow-up review: both coverage gaps were addressed. The test now snapshots and doubles computed fonts in the main content, including fixed-pixel text, and checks both orientations for every selected phone route. Laura independently reviewed script SHA256 `565517AE79C7C0B1E078824CE349233A274D519174AF918DBA5CAFF28190E302` and reported no findings. JavaScript syntax and scoped whitespace checks passed again. Text enlargement covers main content, while menu focus, scrolling, viewport fit, and dialog touch targets are checked separately. Phone profiles still run in Chromium; WebKit and physical devices are not tested.

### RESP-001 completion evidence

Implemented fluid homepage section spacing and page headings, content-sized profile highlight columns, full-height mobile-menu fallback, QR dialog safe-area gutters, and 44px touch-button minimum widths. The QR close button no longer shrinks. Reduced-motion users can see the contribution cells; their paused animation previously left them transparent. Existing responsive containers, content, desktop navigation, keyboard semantics, and browser zoom support are preserved. No dependencies, database records, credentials, or external services were changed.

Validation passed:

- `npm run build`: optimized production compilation, TypeScript, and page generation succeeded.
- `npx tsc --noEmit`: passed before and after the production build.
- `npx eslint src scripts tests next.config.ts proxy.ts eslint.config.mjs postcss.config.mjs`: passed. `npm run lint` was stopped because its unbounded scan included generated JavaScript in the local Python `venv`; the explicit application-source check is the meaningful alternative.
- `npm run test:seo`: all four existing tests passed.
- `node --check scripts/verify-responsive.mjs` and `git diff --check`: passed; Git reported only line-ending conversion notices.
- `npm run verify:responsive`: 380 checks passed against both the development preview and the completed production build. The script used the desktop-bundled Playwright module and installed headless Chromium via `PLAYWRIGHT_MODULE_PATH` and `PLAYWRIGHT_EXECUTABLE_PATH`.

Responsive coverage includes 13 public/authentication routes at 22 widths from 280 through 2560 CSS pixels, two general landscape sizes, and doubled main-content text including fixed-pixel fonts. iPhone SE, iPhone 13, iPhone 14 Pro Max, Pixel 7, and Galaxy S9+ profiles each covered the homepage, certifications, gear, socials, and sign-in page in portrait and landscape, plus the dark homepage. Mobile-navigation checks verified viewport fit, scroll locking/restoration, focus containment/restoration, footer reachability, link navigation, and desktop-breakpoint closure. QR checks verified portrait/landscape fit, 44px close controls, simulated safe-area margins, scrollable footer reachability, and focus restoration. The initial QR failure was a verification race after resizing; waiting for browser reflow resolved it.

Visually reviewed the production homepage at 390px and 1440px and the gear page at 390px. Ignored local evidence is in `.next/responsive/` and `.next/responsive-verification.log`; a subsequent Next.js build may clear it. The production preview is served locally at `http://127.0.0.1:3000`. Laura completed independent source and verification-script reviews with no remaining findings.

Engineering Gates and Completion Mandate: gates 01–12 passed through scoped intake, acceptance criteria, ownership, repository/installed Next.js inspection, data-flow review, and planned checks. Gates 14–18 and 20 passed for the changed CSS/TSX, naming, reuse, types, and unchanged server/client rendering contracts. Gates 30–37 passed through the production build, typecheck, lint, existing tests, responsive end-to-end checks, unchanged dependency/security boundaries, affected accessibility checks, independent review, and final diff review. Gates 13 and 19 are N/A: implementation was serial and no route/bundle boundary changed. Gates 21–29 are N/A: no application input, error-handling, schema, migration, or RLS changes. Gold lane is N/A for this standard-lane layout ticket. The engineering-gates installation contained no global checks script, so the project commands above were run explicitly.

Limits: device profiles use Chromium, not Safari/WebKit or physical phones; simulated safe-area gutters do not prove real-device notch behavior. The authenticated content-editor screen was not exercised. Existing reduced-motion hydration warnings in `Sidebar`/`ScrollReveal` were present in the baseline and remain outside this CSS/layout change; affected content is visible and the responsive checks pass. Changes are complete locally and have not been published.

Current completion: 2/5 tickets. RESP-001 and NAV-001 are complete locally. No responsive work remains. The next backlog action is authorized application and live verification of the three previously blocked CMS migrations.

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

## NAV-001 evidence

Acceptance criteria: center the pink line beside the active sidebar label on initial load and after navigation; preserve its existing appearance and animation; support reduced motion.

Changed only `.nav-active-indicator` in `src/app/globals.css`: use zero top and bottom insets with automatic block margins instead of a centering transform. Framer Motion's shared layout animation writes an inline transform, which previously overwrote the CSS translation after navigation. The local browser reproduced an 8.796875px downward offset with the original CSS. With the fix, Projects, Experience, Stack, Certifications, and Recommendations each aligned within 0.1px after navigation; reduced motion aligned exactly. Visually reviewed `.next/sidebar-aligned.png`.

Validation: `npx tsc --noEmit`, `npx eslint src/components/layout/Sidebar.tsx`, `git diff --check`, and `node .next/verify-sidebar.cjs` passed. The temporary browser check and screenshot are ignored local evidence. Next.js development compilation successfully served the affected routes. The configured browser MCP lacked its extension, so verification used the installed headless Chromium. The sandbox prevented serving the app and accessing localhost; authorized escalated runs completed these local checks.

Engineering Gates and Completion Mandate reviewed: relevant intake, ownership, scope, conventions, animation compatibility, security, accessibility, typecheck, lint, affected browser navigation, and final diff checks passed. No dependencies, semantics, focus behavior, or data boundaries changed. A full production build, new unit tests, schema gates, parallel work, and gold-lane independent review are N/A for this small CSS correction. No project brief or navigation guide was present. Ponytail was loaded from its installed skill path.

Current completion: 1/4 tickets. NAV-001 is complete locally. The three prior CMS tickets remain blocked by database access; next ready task requires authorized migration access.

Browser limitation: reduced-motion reload emitted an existing hydration warning for `ScrollReveal` animation styles. The active marker still aligned exactly; this unrelated component is outside NAV-001's scope.

## Git delivery

The user authorized pushing these changes to the current `main` branch. The final content diff and three migration files were reviewed before staging. `npm audit --omit=dev` ran before committing and reported three existing dependency vulnerabilities (two moderate and one high), affecting `postcss-selector-parser`, `@tailwindcss/typography`, and `source-map-js`. This content-only update changes no dependencies; dependency remediation is outside its scope. CMS application and live acceptance remain pending regardless of Git delivery.

2026-10-07 follow-up delivery candidate: the user authorized committing and pushing the completed RESP-001 and GH-001 changes to `origin/main` (`Dn-Jsh/Portfolio`). The final application/test diff was reviewed. All nine GitHub tests and four SEO tests passed again, as did the whitespace check. The previously completed production build, typecheck, scoped lint, independent Laura review, live-calendar comparison, and 380 responsive checks still apply to the unchanged application candidate. The required pre-commit `npm audit --omit=dev` again reported the same three existing vulnerabilities (two moderate and one high); dependency versions and the lockfile are unchanged. Only the reviewed responsive/GitHub source, tests, verification script, package test command, and ticket evidence are included. Remote delivery confirmation is reported after the push.
