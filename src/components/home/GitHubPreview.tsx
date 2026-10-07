import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import { getGitHubContributions, GITHUB_PROFILE_URL, GITHUB_USERNAME } from "@/lib/github-contributions";

export async function GitHubPreview() {
  const calendar = await getGitHubContributions();
  const firstDate = calendar ? new Date(`${calendar.days[0].date}T00:00:00Z`) : null;
  const firstSunday = firstDate ? firstDate.getTime() - firstDate.getUTCDay() * 86_400_000 : 0;
  const cells = calendar?.days.map((day) => {
    const date = new Date(`${day.date}T00:00:00Z`);
    return {
      ...day,
      column: Math.floor((date.getTime() - firstSunday) / (7 * 86_400_000)) + 1,
      row: date.getUTCDay() + 2,
      month: date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      label: `${day.count} ${day.count === 1 ? "contribution" : "contributions"} on ${day.date}`,
      startsMonth: date.getUTCDate() === 1,
    };
  }) ?? [];
  const weeks = cells.at(-1)?.column ?? 0;

  return (
    <section className="mb-12">
      <ScrollReveal>
        <SectionTitle
          number="06"
          title="github"
          action={
            <a
              href={GITHUB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono flex items-center gap-1 hover:text-muted transition-colors"
            >
              @{GITHUB_USERNAME.toUpperCase()} <ArrowUpRight size={14} />
            </a>
          }
        />
      </ScrollReveal>

      <ScrollReveal delay={0.08}>
        <div className="w-full min-w-0 rounded-xl border border-border p-4 sm:p-6">
          {calendar ? (
            <>
              <div className="contribution-scroll" dir="rtl" tabIndex={0} role="region" aria-label="GitHub contribution calendar. Scroll horizontally to explore the year.">
                <div className="contribution-calendar" dir="ltr" role="img" aria-label={`${GITHUB_USERNAME}: ${calendar.total} contributions in the last year`} style={{ "--contribution-weeks": weeks } as CSSProperties}>
                  {cells.filter((cell, index) => index === 0 || cell.startsMonth).map((cell) => (
                    <span key={`month-${cell.date}`} className="contribution-month" aria-hidden="true" style={{ gridColumn: cell.column, gridRow: 1 }}>{cell.month}</span>
                  ))}
                  {cells.map((cell, index) => (
                    <span key={cell.date} className="contribution-dot" data-date={cell.date} data-count={cell.count} data-level={cell.level} title={cell.label} aria-hidden="true" style={{ gridColumn: cell.column, gridRow: cell.row, "--cell-delay": `${index % 53 * 8}ms` } as CSSProperties} />
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12px] font-mono text-muted">
                <p>{calendar.total.toLocaleString("en-US")} contributions in the last year</p>
                <div className="contribution-legend" aria-hidden="true">
                  <span>Less</span>
                  {[0, 1, 2, 3, 4].map((level) => <span key={level} className="contribution-legend-cell" data-level={level} />)}
                  <span>More</span>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-muted">Updated hourly · Scroll to explore daily activity</p>
              <details className="mt-3 text-[12px] text-muted">
                <summary className="min-h-11 cursor-pointer content-center">Daily contribution counts</summary>
                <div className="mt-2 max-h-64 overflow-y-auto overscroll-contain" tabIndex={0} role="region" aria-label="Daily contribution counts, newest first">
                  <table className="w-full text-left font-mono text-[12px]">
                    <caption className="sr-only">GitHub contributions by UTC date, newest first</caption>
                    <thead className="sticky top-0 bg-bg"><tr><th scope="col" className="py-2 pr-4">Date</th><th scope="col" className="py-2">Contributions</th></tr></thead>
                    <tbody>
                      {calendar.days.slice().reverse().map((day) => (
                        <tr key={day.date} className="border-t border-border/50">
                          <th scope="row" className="py-2 pr-4 font-normal"><time dateTime={day.date}>{day.date}</time></th>
                          <td className="py-2 text-fg">{day.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          ) : (
            <p className="text-sm text-muted">Contributions are temporarily unavailable. <a href={GITHUB_PROFILE_URL} target="_blank" rel="noopener noreferrer" className="text-fg underline underline-offset-4">View on GitHub</a>.</p>
          )}
        </div>
      </ScrollReveal>
    </section>
  );
}
