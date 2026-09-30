import assert from "node:assert/strict";

const baseUrl = new URL(process.argv[2] ?? "http://localhost:3000");
const siteUrl = "https://dnjsh.site";
const publicPaths = ["/", "/blog", "/projects", "/experience", "/stack", "/certifications", "/recommendations", "/gear", "/socials"];

function decode(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#x[\da-f]+|#\d+);/gi, (entity) => {
    const named = { "&amp;": "&", "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">" };
    if (entity in named) return named[entity];
    return String.fromCodePoint(entity.startsWith("&#x")
      ? parseInt(entity.slice(3, -1), 16) : parseInt(entity.slice(2, -1), 10));
  });
}

function attribute(tag, name) {
  return decode(tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? "");
}

function meta(html, name) {
  const tag = [...html.matchAll(/<meta\b[^>]*>/g)]
    .find(([tag]) => attribute(tag, "name") === name || attribute(tag, "property") === name);
  return tag ? attribute(tag[0], "content") : "";
}

async function read(pathname, redirect = "follow") {
  const response = await fetch(new URL(pathname, baseUrl), {
    redirect,
    headers: { "User-Agent": "Bingbot" },
    signal: AbortSignal.timeout(60_000),
  });
  return { response, html: await response.text() };
}

const { response: robotsResponse, html: robots } = await read("/robots.txt");
assert.equal(robotsResponse.status, 200);
assert.match(robots, /Allow: \/\s/);
assert.ok(!robots.includes("Disallow:"));
assert.ok(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`));

const { response: sitemapResponse, html: sitemap } = await read("/sitemap.xml");
assert.equal(sitemapResponse.status, 200);
assert.match(sitemapResponse.headers.get("content-type"), /xml/);
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, value]) => new URL(decode(value)));
assert.equal(new Set(urls.map((url) => url.href)).size, urls.length);
assert.ok(urls.length >= publicPaths.length);
assert.ok(urls.every((url) => url.origin === siteUrl));
assert.ok(urls.every((url) => !/^\/(admin|editportfolio|auth)(\/|$)/.test(url.pathname)));
assert.ok(publicPaths.every((path) => urls.some((url) => url.pathname === path)));

const titles = new Set();
const pages = new Map();
for (const url of urls) {
  const { response, html } = await read(url.pathname);
  assert.equal(response.status, 200, `${url.pathname} must be public`);
  assert.ok(!response.headers.get("x-robots-tag")?.includes("noindex"));
  assert.ok(!meta(html, "robots").includes("noindex"));
  const canonicals = [...html.matchAll(/<link\b[^>]*>/g)]
    .filter(([tag]) => attribute(tag, "rel") === "canonical");
  assert.equal(canonicals.length, 1, `${url.pathname} must have one canonical`);
  assert.equal(new URL(attribute(canonicals[0][0], "href")).href, url.href);
  const title = decode(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? "");
  assert.match(title, /dnjsh/);
  assert.ok(meta(html, "description"), `${url.pathname} needs a description`);
  assert.ok(!titles.has(title), `${url.pathname} needs a unique title`);
  titles.add(title);
  pages.set(url.pathname, html);
}

const home = pages.get("/");
assert.equal(decode(home.match(/<title>(.*?)<\/title>/s)[1]), "dnjsh | Dan Jeshua — Full-stack Developer");
assert.equal(meta(home, "description"), "Dan Jeshua, also known as dnjsh, is a developer building web and mobile apps. Explore his projects, experience, and certifications.");
assert.match(home, /Also known as <span[^>]*>dnjsh<\/span>/);
const structuredData = [...home.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
  .map(([, json]) => JSON.parse(json)).find((data) => data["@graph"]);
assert.equal(structuredData["@context"], "https://schema.org");
const person = structuredData["@graph"].find((item) => item["@type"] === "Person");
const website = structuredData["@graph"].find((item) => item["@type"] === "WebSite");
assert.equal(website.name, "dnjsh");
assert.equal(website.publisher["@id"], person["@id"]);
assert.ok(person.alternateName.includes("dnjsh"));
assert.ok(person.sameAs.every((url) => /^https?:\/\//.test(url)));

// The sitemap and visible blog listing must agree about which posts are public.
const listedPosts = new Set([...pages.get("/blog").matchAll(/href="(\/blog\/[^"?#]+)"/g)].map(([, path]) => decode(path)));
const mappedPosts = new Set(urls.filter((url) => url.pathname.startsWith("/blog/")).map((url) => url.pathname));
assert.deepEqual(mappedPosts, listedPosts);
for (const pathname of listedPosts) {
  const html = pages.get(pathname);
  assert.equal(meta(html, "og:type"), "article");
  const heading = decode(html.match(/<h1\b[^>]*>(.*?)<\/h1>/s)?.[1] ?? "");
  assert.ok(decode(html.match(/<title>(.*?)<\/title>/s)[1]).startsWith(heading));
}

for (const pathname of ["/admin", "/admin/login", "/admin/setup", "/editportfolio", "/editportfolio/login", "/editportfolio/setup", "/auth/confirm"]) {
  const { response, html } = await read(pathname, "manual");
  assert.match(response.headers.get("x-robots-tag") ?? "", /noindex/);
  if (response.status === 200) assert.match(meta(html, "robots"), /noindex/);
}

const missing = await read("/blog/seo-verification-nonexistent-post");
assert.equal(missing.response.status, 404);
console.log(`SEO verification passed: ${urls.length} public URLs, sitemap, robots, structured data, blog listing, editor exclusions, and missing-post 404.`);
