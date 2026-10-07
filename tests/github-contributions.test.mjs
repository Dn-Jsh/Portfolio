import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadModule } from "./load-typescript.mjs";

const { parseGitHubContributions } = loadModule("../src/lib/github-contributions.ts");

function calendarHTML() {
  const activeDays = { "2026-09-29": 1, "2026-09-30": 5, "2026-10-01": 3, "2026-10-05": 1, "2026-10-07": 2 };
  const cells = Array.from({ length: 368 }, (_, index) => {
    const date = new Date(Date.UTC(2025, 9, 5 + index)).toISOString().slice(0, 10);
    const count = activeDays[date] ?? 0;
    return `<td data-level="${Math.min(count, 4)}" id="day-${date}" data-date="${date}"></td>
      <tool-tip for="day-${date}">${count || "No"} ${count === 1 ? "contribution" : "contributions"} on ${date}.</tool-tip>`;
  });
  return `<h2>12\n contributions\n in the last year</h2>${cells.reverse().join("")}`;
}

test("parses real daily counts and orders GitHub's nonchronological cells by UTC date", () => {
  const calendar = parseGitHubContributions(calendarHTML());
  assert.equal(calendar.total, 12);
  assert.equal(calendar.days.length, 368);
  assert.equal(calendar.days[0].date, "2025-10-05");
  assert.equal(calendar.days.at(-1).date, "2026-10-07");
  assert.equal(calendar.days.find((day) => day.date === "2026-09-30").count, 5);
  assert.equal(calendar.days.reduce((sum, day) => sum + day.count, 0), 12);
});

test("rejects unavailable, malformed, duplicated, and incomplete calendars", () => {
  const html = calendarHTML();
  for (const invalid of [
    "<h1>Service unavailable</h1>",
    html.replace('data-level="2"', 'data-level="9"'),
    html.replace('data-date="2026-10-07"', 'data-date="2026-02-30"'),
    html.replace('for="day-2026-10-07"', 'for="missing-day"'),
    html.replace('data-date="2026-10-07"', 'data-date="2026-10-06"'),
    "<h2>0 contributions in the last year</h2>",
  ]) assert.throws(() => parseGitHubContributions(invalid), /GitHub contribution/);
});

test("loads only the configured public GitHub calendar with hourly caching and a bounded request", async () => {
  let request;
  const { getGitHubContributions } = loadModule("../src/lib/github-contributions.ts", {}, {
    AbortSignal,
    console,
    fetch: async (url, options) => { request = { url, options }; return { ok: true, text: async () => calendarHTML() }; },
  });
  const calendar = await getGitHubContributions();
  assert.equal(calendar.total, 12);
  assert.equal(request.url, "https://github.com/users/Dn-Jsh/contributions");
  assert.equal(request.options.next.revalidate, 3600);
  assert.equal(request.options.headers["Accept-Language"], "en-US");
  assert.ok(request.options.signal instanceof AbortSignal);
  assert.equal(request.options.headers.Authorization, undefined);
});

test("HTTP, network, and markup failures return unavailable rather than invented activity", async (context) => {
  for (const [label, fetch] of [
    ["rate limit", async () => ({ ok: false, status: 429 })],
    ["network timeout", async () => { throw new Error("Request timed out"); }],
    ["changed markup", async () => ({ ok: true, text: async () => "<html>Error</html>" })],
  ]) await context.test(label, async () => {
    const errors = [];
    const { getGitHubContributions } = loadModule("../src/lib/github-contributions.ts", {}, {
      AbortSignal, fetch, console: { error: (...message) => errors.push(message) },
    });
    assert.equal(await getGitHubContributions(), null);
    assert.equal(errors.length, 1);
  });
});

async function renderCalendar(calendar) {
  const { GitHubPreview } = loadModule("../src/components/home/GitHubPreview.tsx", {
    "@/lib/github-contributions": { getGitHubContributions: async () => calendar, GITHUB_USERNAME: "Dn-Jsh", GITHUB_PROFILE_URL: "https://github.com/Dn-Jsh" },
    "@/components/ui/ScrollReveal": { ScrollReveal: ({ children }) => createElement("div", null, children) },
    "@/components/ui/SectionTitle": { SectionTitle: ({ title, action }) => createElement("header", null, title, action) },
  });
  return renderToStaticMarkup(await GitHubPreview());
}

test("renders the actual total, daily values, UTC week positions, and accessible profile link", async () => {
  const markup = await renderCalendar(parseGitHubContributions(calendarHTML()));
  assert.match(markup, /12 contributions in the last year/);
  assert.match(markup, /data-date="2026-10-07" data-count="2"/);
  assert.match(markup, /grid-column:53;grid-row:5/);
  assert.match(markup, /href="https:\/\/github.com\/Dn-Jsh"/);
  assert.match(markup, /<summary[^>]*>Daily contribution counts<\/summary>/);
  assert.match(markup, /<time dateTime="2026-10-07">2026-10-07<\/time><\/th><td[^>]*>2<\/td>/);
});

test("renders a useful unavailable state with no fake or empty activity grid", async () => {
  const markup = await renderCalendar(null);
  assert.match(markup, /Contributions are temporarily unavailable/);
  assert.match(markup, /View on GitHub/);
  assert.doesNotMatch(markup, /class="contribution-dot"/);
});
