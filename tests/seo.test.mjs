import assert from "node:assert/strict";
import test from "node:test";
import { loadModule } from "./load-typescript.mjs";

const seo = loadModule("../src/lib/seo.ts");

test("public pages have unique titles and self-referencing production canonicals", () => {
  const titles = new Set();
  for (const pathname of Object.keys(seo.PUBLIC_PAGES)) {
    const metadata = seo.getPublicPageMetadata(pathname);
    assert.equal(metadata.alternates.canonical, new URL(pathname, seo.SITE_URL).href);
    assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
    assert.ok(metadata.description.length > 0);
    assert.match(metadata.title, /dnjsh/);
    titles.add(metadata.title);
  }
  assert.equal(titles.size, Object.keys(seo.PUBLIC_PAGES).length);
  assert.equal(seo.getPublicPageMetadata("/").title, "dnjsh | Dan Jeshua — Full-stack Developer");
  assert.equal(seo.getPublicPageMetadata("/").description,
    "Dan Jeshua, also known as dnjsh, is a developer building web and mobile apps. Explore his projects, experience, and certifications.");
});

test("profile structured data connects the person and website using valid, deduplicated social links", () => {
  const data = seo.createProfileStructuredData("Dan Jeshua", [
    "https://github.com/Dn-Jsh",
    "https://github.com/Dn-Jsh?tracking=1#profile",
    "https://www.instagram.com/dn_jsh?tracking=1",
    "javascript:alert(1)",
    "/relative-link",
    "invalid",
  ]);
  const [website, person] = data["@graph"];
  assert.equal(data["@context"], "https://schema.org");
  assert.equal(website.name, "dnjsh");
  assert.equal(website.publisher["@id"], person["@id"]);
  assert.equal(person.name, "Dan Jeshua D. Fiscal");
  assert.ok(person.alternateName.includes("dnjsh"));
  assert.deepEqual(Array.from(person.sameAs), [
    "https://github.com/Dn-Jsh", "https://www.instagram.com/dn_jsh",
  ]);
});

test("robots permits crawling noindex pages and advertises the production sitemap", () => {
  const { default: robots } = loadModule("../src/app/robots.ts", { "@/lib/seo": seo });
  const result = robots();
  assert.equal(result.rules.allow, "/");
  assert.equal(result.rules.disallow, undefined);
  assert.equal(result.sitemap, "https://dnjsh.site/sitemap.xml");
});

test("sitemap reflects additions and removals from the published post loader", async () => {
  let posts = [{ slug: "published-post" }, { slug: "" }, { slug: ".." }, { slug: "invalid/path" }];
  const { default: sitemap, dynamic } = loadModule("../src/app/sitemap.ts", {
    "@/lib/seo": seo,
    "@/lib/mdx": { getAllPosts: async () => posts },
  });
  assert.equal(dynamic, "force-dynamic");
  const first = Array.from(await sitemap(), (entry) => entry.url);
  assert.equal(first.length, Object.keys(seo.PUBLIC_PAGES).length + 1);
  assert.ok(first.includes("https://dnjsh.site/blog/published-post"));
  assert.ok(first.every((url) => !/admin|editportfolio|auth/.test(new URL(url).pathname)));

  posts = [{ slug: "new-post" }, { slug: "new-post" }];
  const second = Array.from(await sitemap(), (entry) => entry.url);
  assert.ok(!second.includes("https://dnjsh.site/blog/published-post"));
  assert.equal(second.filter((url) => url.endsWith("/blog/new-post")).length, 1);
});
