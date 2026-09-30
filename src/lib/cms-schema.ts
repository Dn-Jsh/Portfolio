import type { ContentType } from "@/lib/portfolio-content";

export type EditorFieldType = "text" | "textarea" | "url" | "date" | "list" | "image" | "richtext" | "select" | "stats";

export type EditorField = {
  name: string;
  label: string;
  type: EditorFieldType;
  required?: boolean;
  options?: string[];
  hint?: string;
};

export type EditorSection = {
  type: ContentType;
  label: string;
  singular: string;
  fields: EditorField[];
};

export const EDITOR_SECTIONS: EditorSection[] = [
  {
    type: "site_settings",
    label: "Profile",
    singular: "Profile",
    fields: [
      { name: "heroKicker", label: "Short introduction", type: "text", required: true },
      { name: "firstName", label: "First name", type: "text", required: true },
      { name: "lastName", label: "Last name", type: "text", required: true },
      { name: "bioFirst", label: "About you · first paragraph", type: "textarea", required: true },
      { name: "bioSecond", label: "About you · second paragraph", type: "textarea" },
      { name: "profileImage", label: "Profile photo", type: "image" },
      { name: "stats", label: "Profile highlights", type: "stats" },
    ],
  },
  {
    type: "page_intro",
    label: "Page descriptions",
    singular: "Page description",
    fields: [
      { name: "route", label: "Page", type: "select", required: true, options: ["blog", "projects", "experience", "stack", "certifications", "recommendations", "gear", "socials"] },
      { name: "title", label: "Page heading", type: "text", required: true },
      { name: "description", label: "Page description", type: "textarea", required: true },
    ],
  },
  {
    type: "blog_post",
    label: "Blog posts",
    singular: "Blog post",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Web address", type: "text", required: true, hint: "Use lowercase words separated by hyphens." },
      { name: "date", label: "Publish date", type: "date", required: true },
      { name: "description", label: "Short summary", type: "textarea", required: true },
      { name: "coverImage", label: "Cover image", type: "image" },
      { name: "body", label: "Article", type: "richtext", required: true },
    ],
  },
  {
    type: "project",
    label: "Projects",
    singular: "Project",
    fields: [
      { name: "title", label: "Project name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "tags", label: "Technology tags", type: "list" },
      { name: "link", label: "Project link", type: "text", hint: "Paste a full web address, or leave # if there is no public link yet." },
      { name: "status", label: "Status", type: "text" },
    ],
  },
  {
    type: "experience",
    label: "Experience",
    singular: "Experience entry",
    fields: [
      { name: "company", label: "Company or group", type: "text", required: true },
      { name: "role", label: "Role", type: "text", required: true },
      { name: "type", label: "Type", type: "text" },
      { name: "period", label: "Dates", type: "text", required: true },
      { name: "location", label: "Location", type: "text" },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "skills", label: "Skills", type: "list" },
    ],
  },
  {
    type: "certification",
    label: "Certifications",
    singular: "Certification",
    fields: [
      { name: "title", label: "Certification name", type: "text", required: true },
      { name: "provider", label: "Provider", type: "text", required: true },
      { name: "category", label: "Category", type: "text" },
      { name: "date", label: "Year or date", type: "text" },
      { name: "link", label: "Verification link", type: "text", hint: "Paste a full web address, or leave # if there is no verification page." },
    ],
  },
  {
    type: "recommendation",
    label: "Recommendations",
    singular: "Recommendation",
    fields: [
      { name: "name", label: "Person's name", type: "text", required: true },
      { name: "role", label: "Role or organization", type: "text", required: true },
      { name: "quote", label: "Recommendation", type: "textarea", required: true },
      { name: "date", label: "Year", type: "text" },
    ],
  },
  {
    type: "gear",
    label: "Gear",
    singular: "Gear item",
    fields: [
      { name: "name", label: "Item name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "category", label: "Group", type: "select", required: true, options: ["DESK SETUP", "EVERYDAY CARRY"] },
      { name: "model", label: "Visual model", type: "select", required: true, options: ["laptop", "keyboard", "mouse", "earbuds", "phone"] },
      { name: "image", label: "Image", type: "image", required: true },
      { name: "imageAlt", label: "Image description", type: "text", required: true },
      { name: "referenceImage", label: "Reference image", type: "image" },
    ],
  },
  {
    type: "social",
    label: "Social links",
    singular: "Social link",
    fields: [
      { name: "platform", label: "Platform", type: "text", required: true },
      { name: "handle", label: "Name or handle", type: "text", required: true },
      { name: "description", label: "Description", type: "text" },
      { name: "link", label: "Profile link", type: "url", required: true },
      { name: "icon", label: "Icon name", type: "text" },
    ],
  },
  {
    type: "stack_group",
    label: "Tech stack",
    singular: "Tech stack group",
    fields: [
      { name: "category", label: "Group name", type: "text", required: true },
      { name: "items", label: "Technologies", type: "list", required: true, hint: "Enter one technology per line." },
    ],
  },
];

export function getSection(type: ContentType) {
  return EDITOR_SECTIONS.find((section) => section.type === type)!;
}

export function emptyDraft(type: ContentType): Record<string, unknown> {
  return Object.fromEntries(
    getSection(type).fields.map((field) => [field.name, field.type === "list" ? [] : field.type === "stats" ? [] : field.type === "richtext" ? { type: "doc", content: [{ type: "paragraph" }] } : ""]),
  );
}

export function makeSlug(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
