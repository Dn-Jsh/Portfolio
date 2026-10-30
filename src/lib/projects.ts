import { RED_CROSS_PROJECT, SUNDAY_SETLIST_PROJECT, type Project } from "@/data/projects";

// Keep this source-authored addition visible alongside existing published CMS rows.
// Prefer the owner's published summary and links when they add the same project.
export function includeRedCrossProject<T extends { id: string; data: Project }>(rows: T[]): (T | { id: string; data: Project })[] {
  const existing = rows.find((row) => row.data.id === RED_CROSS_PROJECT.id || row.data.title.trim().toLowerCase() === RED_CROSS_PROJECT.title.toLowerCase());
  const featured = existing
    ? { ...existing, data: { ...existing.data, details: existing.data.details ?? RED_CROSS_PROJECT.details, image: existing.data.image ?? RED_CROSS_PROJECT.image } }
    : { id: RED_CROSS_PROJECT.id!, data: RED_CROSS_PROJECT };
  return [featured, ...rows.filter((row) => row !== existing)];
}

export function includeSundaySetlistProject<T extends { id: string; data: Project }>(rows: T[]): (T | { id: string; data: Project })[] {
  const titleOf = (row: T) => row.data.title.trim().toLowerCase();
  const existing = rows.find((row) => titleOf(row) === "sunday setlist") ?? rows.find((row) => titleOf(row) === "anointed worship");
  const data = existing && titleOf(existing) === "sunday setlist"
    ? {
      ...SUNDAY_SETLIST_PROJECT,
      ...existing.data,
      title: SUNDAY_SETLIST_PROJECT.title,
      icon: SUNDAY_SETLIST_PROJECT.icon,
      details: existing.data.details ?? SUNDAY_SETLIST_PROJECT.details,
      image: existing.data.image ?? SUNDAY_SETLIST_PROJECT.image,
      link: existing.data.link && existing.data.link !== "#" ? existing.data.link : SUNDAY_SETLIST_PROJECT.link,
    }
    : SUNDAY_SETLIST_PROJECT;
  return [
    { id: existing?.id ?? SUNDAY_SETLIST_PROJECT.id!, data },
    ...rows.filter((row) => !["sunday setlist", "anointed worship"].includes(titleOf(row))),
  ];
}
