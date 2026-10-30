import assert from "node:assert/strict";
import test from "node:test";
import { loadModule } from "./load-typescript.mjs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const { PROJECTS, RED_CROSS_PROJECT, SUNDAY_SETLIST_PROJECT } = loadModule("../src/data/projects.ts");
const { includeRedCrossProject, includeSundaySetlistProject } = loadModule("../src/lib/projects.ts", {
  "@/data/projects": { RED_CROSS_PROJECT, SUNDAY_SETLIST_PROJECT },
});
const { ProjectDetails } = loadModule("../src/components/ui/ProjectDetails.tsx");

test("project screenshots link to valid website URLs while unlinked previews stay passive", () => {
  for (const [project, linked] of [[SUNDAY_SETLIST_PROJECT, true], [RED_CROSS_PROJECT, false], [{ ...SUNDAY_SETLIST_PROJECT, link: "javascript:alert(1)" }, false]]) {
    const markup = renderToStaticMarkup(createElement(ProjectDetails, { project, details: project.details }));
    const preview = markup.match(/<figure class="project-preview">([\s\S]*?)<\/figure>/)?.[1];
    assert.ok(preview);
    if (linked) {
      assert.match(preview, /href="https:\/\/anointed-worship-app.vercel.app\/"/);
      assert.match(preview, /target="_blank"/);
      assert.match(preview, /rel="noopener noreferrer"/);
      assert.match(preview, /opens in a new tab/);
    } else {
      assert.doesNotMatch(preview, /<a\b|<button\b|tabindex=/);
    }
  }
});

test("Sunday Setlist replaces legacy Anointed Worship content and removes duplicate entries", () => {
  const legacy = { id: "cms-worship", data: { title: " Anointed Worship ", description: "Old mobile app", tags: ["Firebase"], link: "#", status: "Released" } };
  const custom = { id: "custom", data: { title: "Custom project", description: "Keep", tags: [], link: "#", status: "" } };
  const migrated = includeSundaySetlistProject([custom, legacy]);
  assert.equal(migrated[0].id, "cms-worship");
  assert.equal(migrated[0].data.title, "Sunday Setlist");
  assert.equal(migrated[0].data.link, "https://anointed-worship-app.vercel.app/");
  assert.ok(migrated[0].data.tags.includes("Supabase"));
  assert.ok(!migrated[0].data.tags.includes("Firebase"));
  assert.equal(migrated[0].data.image.src, "/projects/sunday-setlist.png");
  assert.equal(migrated[1], custom);
  assert.equal(includeSundaySetlistProject([])[0].data, SUNDAY_SETLIST_PROJECT);
  const current = { id: "cms-current", data: { ...SUNDAY_SETLIST_PROJECT, description: "Owner's new summary", image: undefined, details: undefined, link: "#" } };
  const normalized = includeSundaySetlistProject([legacy, current, custom]);
  assert.equal(normalized.length, 2);
  assert.equal(normalized[0].id, "cms-current");
  assert.equal(normalized[0].data.description, "Owner's new summary");
  assert.equal(normalized[0].data.image, SUNDAY_SETLIST_PROJECT.image);
  assert.equal(normalized[0].data.details, SUNDAY_SETLIST_PROJECT.details);
  assert.equal(normalized[0].data.link, SUNDAY_SETLIST_PROJECT.link);
  assert.equal(includeSundaySetlistProject(PROJECTS.map((data) => ({ id: data.id, data }))).length, PROJECTS.length);
});

test("Red Cross remains visible with CMS content and fallback content without duplicates", () => {
  const custom = { id: "cms-custom", data: { title: "Custom project", description: "Keep this", tags: [], link: "#", status: "" } };
  const rows = includeRedCrossProject([custom]);
  assert.equal(rows[0].data.title, "Red Cross Blood Bank Portal");
  assert.equal(rows[0].data.image?.src, "/projects/red-cross-blood-bank.png");
  assert.equal(rows[1], custom);
  assert.equal(includeRedCrossProject([]).length, 1);
  const fallback = PROJECTS.map((data) => ({ id: data.id, data }));
  assert.equal(includeRedCrossProject(fallback).length, PROJECTS.length);

  const edited = { id: "cms-red-cross", data: { ...RED_CROSS_PROJECT, details: undefined, image: undefined, description: "Owner's edited summary", link: "https://example.com/portal" } };
  const merged = includeRedCrossProject([custom, edited]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].data.description, "Owner's edited summary");
  assert.equal(merged[0].id, "cms-red-cross");
  assert.equal(merged[0].data.link, "https://example.com/portal");
  assert.ok(merged[0].data.details);
  assert.equal(merged[0].data.image, RED_CROSS_PROJECT.image);
  const customImage = { src: "/custom-project.png", alt: "Owner's screenshot", width: 800, height: 400 };
  assert.equal(includeRedCrossProject([{ ...edited, data: { ...edited.data, image: customImage } }])[0].data.image, customImage);
  assert.equal(merged[1], custom);
});
