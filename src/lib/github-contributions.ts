export const GITHUB_USERNAME = "Dn-Jsh";
export const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;

export type ContributionDay = {
  date: string;
  count: number;
  level: number;
};

export type ContributionCalendar = {
  total: number;
  days: ContributionDay[];
};

function attribute(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];
}

// GitHub's public calendar exposes dates/levels on cells and counts in tooltips.
// Parse those values only; never render upstream HTML into the portfolio.
export function parseGitHubContributions(html: string): ContributionCalendar {
  const summary = html.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/)?.[1];
  const totalText = summary?.match(/([\d,]+)\s+contributions?\s+in the last year/)?.[1];
  const total = totalText === undefined ? NaN : Number(totalText.replaceAll(",", ""));
  if (!Number.isSafeInteger(total) || total < 0) throw new Error("Invalid GitHub contribution total");

  const counts = new Map<string, number>();
  for (const tooltip of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const id = attribute(tooltip[1], "for");
    const countText = tooltip[2].trim().match(/^(No|[\d,]+) contributions?\b/)?.[1];
    if (id && countText !== undefined) {
      counts.set(id, countText === "No" ? 0 : Number(countText.replaceAll(",", "")));
    }
  }

  const days: ContributionDay[] = [];
  for (const cell of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
    const date = attribute(cell[0], "data-date") ?? "";
    const levelText = attribute(cell[0], "data-level");
    const level = levelText === undefined ? NaN : Number(levelText);
    const count = counts.get(attribute(cell[0], "id") ?? "");
    const timestamp = Date.parse(`${date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(timestamp)
      || new Date(timestamp).toISOString().slice(0, 10) !== date
      || !Number.isInteger(level) || level < 0 || level > 4
      || count === undefined || !Number.isSafeInteger(count) || count < 0) {
      throw new Error("Invalid GitHub contribution day");
    }
    days.push({ date, count, level });
  }

  days.sort((first, second) => first.date.localeCompare(second.date));
  // GitHub includes partial weeks around the year's boundaries.
  if (days.length < 365 || days.length > 371) throw new Error("Incomplete GitHub contribution calendar");
  for (let index = 1; index < days.length; index++) {
    if (Date.parse(days[index].date) - Date.parse(days[index - 1].date) !== 86_400_000) {
      throw new Error("GitHub contribution dates are not consecutive");
    }
  }
  return { total, days };
}

export async function getGitHubContributions(): Promise<ContributionCalendar | null> {
  try {
    const response = await fetch(`https://github.com/users/${GITHUB_USERNAME}/contributions`, {
      headers: { Accept: "text/html", "Accept-Language": "en-US" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}`);
    return parseGitHubContributions(await response.text());
  } catch (reason) {
    console.error("Could not load GitHub contributions:", reason instanceof Error ? reason.message : "Unknown error");
    return null;
  }
}
