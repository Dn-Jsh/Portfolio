# Google Search setup for dnjsh.site

The website changes are local until approved and deployed to the existing Vercel project. Google indexing and ranking are separate from deployment; first position for `dnjsh` is a goal, not a guarantee.

## 1. Deploy and verify public access

After approving the SEO changes, deploy them through the existing Vercel workflow. In the project's **Settings → Domains**, confirm that `dnjsh.site` has a valid configuration and HTTPS certificate. Check the website while signed out or in a private window. Do not change DNS if it is already correct. If Vercel identifies a problem, use the exact DNS records shown for this project, preserving existing email and verification records.

Source: [Vercel domain configuration](https://vercel.com/docs/domains/working-with-domains/add-a-domain).

Check the deployed sitemap and crawl rules:

- `https://dnjsh.site/sitemap.xml`
- `https://dnjsh.site/robots.txt`

Run the repeatable HTTP checks against the deployment:

```powershell
npm.cmd run verify:seo -- https://dnjsh.site
```

For local verification, run `npm.cmd run build`, start the production server with `npm.cmd run start`, and run `npm.cmd run verify:seo` in another terminal. The default verification URL is `http://localhost:3000`; pass a different URL when using another port. Run the isolated metadata/sitemap tests with `npm.cmd run test:seo`.

The verification checks every sitemap URL, per-page metadata and canonicals, homepage structured data, agreement with the visible blog listing, missing-post 404s, and editor/authentication indexing exclusions. Sitemap entries come from the same published content loader as the blog. Drafts live in a separate CMS table. The sitemap is generated on demand so publishing or unpublishing does not require rebuilding it.

## 2. Verify your domain in Google Search Console

1. Sign in to [Google Search Console](https://search.google.com/search-console) using the Google account that should own the website property.
2. Add a **Domain** property and enter `dnjsh.site`, without `https://` or a path.
3. Copy the TXT verification value Google supplies.
4. Add that exact TXT record at the provider currently managing your DNS. Use its root-domain host field (`@` or blank, according to the provider). Keep existing records.
5. Return to Search Console and click **Verify**. If the record has not propagated, retry after it becomes visible. Keep the verification record after verification succeeds.

This step requires the owner's Google and DNS-provider accounts. No passwords or verification values belong in source code.

Source: [Google ownership verification](https://support.google.com/webmasters/answer/9008080).

## 3. Submit the site

1. In **Sitemaps**, submit `https://dnjsh.site/sitemap.xml`.
2. In **URL inspection**, inspect `https://dnjsh.site/` and run **Test live URL**.
3. Confirm that Google can access the page and that indexing is allowed, then select **Request indexing**.
4. Review **Page indexing** and the selected canonical once data becomes available. Address reported errors rather than repeatedly submitting the same request.

Google decides whether and when to index a URL. Requesting indexing does not guarantee inclusion or a ranking.

Source: [Google recrawling and indexing requests](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).

## 4. Connect your public profiles

Update your profiles manually after deployment:

- **GitHub:** website `https://dnjsh.site`; include `Dan Jeshua · dnjsh` naturally in your bio or profile README.
- **LinkedIn:** add `https://dnjsh.site` to your contact information or featured links; mention `dnjsh` in your About section as your developer handle.

No changes to third-party profiles are included in the local implementation.

## 5. Review progress weekly for the first month

In Search Console, check homepage indexing, sitemap processing, and **Performance → Search results** with the query filtered to `dnjsh`. Track impressions, clicks, and average position. Use `Dan Jeshua` and `Dan Jeshua Fiscal` as additional identity queries. Results can vary by location and device, so one personal search is not sufficient evidence of ranking progress.

If the homepage remains excluded, investigate the reason in URL inspection. If indexed but ranking poorly, review the competing results and improve relevant portfolio content and legitimate links to the site.

Source: [Google SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).
