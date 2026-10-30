import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
});
const baseUrl = process.env.RESPONSIVE_BASE_URL || "http://127.0.0.1:3100";
let checks = 0;
try {
  await mkdir(".next/projects", { recursive: true });
  const context = await browser.newContext();
  // Check navigation without depending on the temporary site's availability.
  await context.route("https://anointed-worship-app.vercel.app/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<title>Sunday Setlist destination check</title>" }));
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const theme of ["light", "dark"]) {
    await page.emulateMedia({ reducedMotion: theme === "dark" ? "reduce" : "no-preference" });
    await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
    for (const viewport of [{ width: 280, height: 653 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1440, height: 900 }]) {
      await page.setViewportSize(viewport);
      for (const route of ["/projects", "/"]) {
        for (const project of [
          { title: "Red Cross Blood Bank Portal", slug: "red-cross", workflow: "Donation workflow", caveat: /qualified personnel retain clinical clearance/, ratio: 1890 / 986, features: 8, url: undefined },
          { title: "Sunday Setlist", slug: "sunday-setlist", workflow: "Service preparation", caveat: /full Presenter workspace and Sync Center downloads run in the separate Windows app/, ratio: 1850 / 1024, features: 10, url: "https://anointed-worship-app.vercel.app/" },
        ]) {
        await page.goto(new URL(route, baseUrl).href, { waitUntil: "networkidle" });
        assert.equal(await page.getByRole("heading", { name: "Anointed Worship", exact: true }).count(), 0);
        const trigger = page.getByRole("button", { name: `View ${project.title} details`, exact: true });
        assert.equal(await trigger.count(), 1);
        assert.doesNotMatch(await trigger.innerText(), /view project details/i);
        await trigger.scrollIntoViewIfNeeded();
        await trigger.focus();
        await page.keyboard.press("Enter");
        const dialog = page.getByRole("dialog", { name: project.title, exact: true });
        const scrollBody = dialog.locator(".project-dialog-body");
        await dialog.waitFor({ state: "visible" });
        assert.equal(await dialog.evaluate((element) => getComputedStyle(element, "::backdrop").backdropFilter), "none", "Project backdrop must keep the page sharp");
        await page.evaluate(() => document.fonts.ready);
        await dialog.evaluate(async (element) => { await Promise.all(element.getAnimations().map((animation) => animation.finished)); });
        if (theme === "dark") assert.equal(await dialog.evaluate((element) => getComputedStyle(element).animationName), "none");
        for (const heading of ["Key features", "Who it serves", project.workflow, "Technology stack", "Architecture"]) {
          assert.equal(await dialog.getByRole("heading", { name: heading, exact: true }).count(), 1);
        }
        assert.match(await dialog.innerText(), project.caveat);
        const siteHeadingFont = await page.locator("h1").evaluate((element) => getComputedStyle(element).fontFamily);
        assert.equal(await dialog.getByRole("heading", { level: 2 }).evaluate((element) => getComputedStyle(element).fontFamily), siteHeadingFont);
        for (const heading of await dialog.locator("h3").all()) {
          assert.equal(await heading.evaluate((element) => getComputedStyle(element).fontFamily), siteHeadingFont);
        }
        assert.equal(await dialog.locator(".project-stack-preview").count(), 0);
        assert.ok(await dialog.locator(".project-summary").evaluate((element) => element.nextElementSibling?.classList.contains("project-technologies")));
        const preview = dialog.locator(".project-preview img");
        await preview.scrollIntoViewIfNeeded();
        await preview.evaluate((element) => element.decode());
        assert.ok(await preview.evaluate((element) => element.naturalWidth > 0 && element.naturalHeight > 0 && element.alt.length > 0));
        if (project.url) {
          const link = dialog.locator(".project-preview > a");
          assert.equal(await link.getAttribute("href"), project.url);
          assert.equal(await link.getAttribute("target"), "_blank");
          assert.equal(await link.getAttribute("rel"), "noopener noreferrer");
          assert.match(await link.getAttribute("aria-label"), /opens in a new tab/);
          const popupPromise = page.waitForEvent("popup");
          await preview.click();
          const popup = await popupPromise;
          await popup.waitForURL(project.url);
          await popup.close();
          assert.ok(await dialog.isVisible());
        } else {
          assert.ok(await preview.evaluate((element) => !element.closest("a, button, [role=button]") && element.tabIndex === -1));
        }
        const previewBounds = await preview.boundingBox();
        const heroBounds = await dialog.locator(".project-hero-copy").boundingBox();
        assert.ok(Math.abs(previewBounds.width / previewBounds.height - project.ratio) < 0.02);
        if (viewport.width > 900) {
          assert.ok(previewBounds.x >= heroBounds.x + heroBounds.width);
          assert.ok(previewBounds.y < heroBounds.y + heroBounds.height);
        } else {
          assert.ok(previewBounds.y >= heroBounds.y + heroBounds.height);
        }
        await scrollBody.evaluate((element) => { element.scrollTop = 0; });
        await page.waitForFunction(() => !document.querySelector(".project-dialog[open] .project-dialog-body")?.hasAttribute("data-scrolling"));
        assert.equal(await dialog.locator(".project-workflow-section").evaluate((element) => getComputedStyle(element).backgroundColor), "rgba(0, 0, 0, 0)");
        assert.equal(await dialog.locator(".project-features .lucide-check").count(), 0);
        assert.equal(await dialog.locator(".project-features > li > svg").count(), project.features);
        assert.ok(await dialog.locator(".project-features > li").evaluateAll((elements) => elements.every((element) => getComputedStyle(element).backgroundColor === "rgba(0, 0, 0, 0)")));
        assert.equal(await scrollBody.evaluate((element) => getComputedStyle(element).fontFamily), await page.locator("body").evaluate((element) => getComputedStyle(element).fontFamily));
        assert.equal(await dialog.locator(".project-technologies > span").first().evaluate((element) => getComputedStyle(element).fontFamily), await page.locator(".font-mono").first().evaluate((element) => getComputedStyle(element).fontFamily));
        assert.equal(await scrollBody.getAttribute("data-scrolling"), null);
        const bounds = await dialog.boundingBox();
        assert.ok(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= viewport.width + 1 && bounds.y + bounds.height <= viewport.height + 1);
        assert.ok(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth + 1));
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        // Chromium can tab to browser chrome when the dialog has one control;
        // background document controls must still remain inert.
        for (let tab = 0; tab < 3; tab++) {
          await page.keyboard.press("Tab");
          assert.ok(await dialog.evaluate((element) => document.activeElement === document.body || element.contains(document.activeElement)));
        }
        await trigger.evaluate((element) => element.focus());
        assert.ok(await trigger.evaluate((element) => element !== document.activeElement));
        const close = dialog.getByRole("button", { name: `Close ${project.title} details` });
        const closeBounds = await close.boundingBox();
        assert.ok(closeBounds.width >= 44 && closeBounds.height >= 44);
        await scrollBody.focus();
        await page.keyboard.press("PageDown");
        // Read scroll state and resolved color together, before the idle timer.
        await page.waitForFunction(() => {
          const region = document.querySelector(".project-dialog[open] .project-dialog-body");
          const mark = document.querySelector(".project-dialog[open] .project-dialog-mark");
          return region && mark && region.hasAttribute("data-scrolling") && getComputedStyle(region).scrollbarColor === `${getComputedStyle(mark).color} rgba(0, 0, 0, 0)`;
        });
        await scrollBody.evaluate((element) => { element.scrollTop = element.scrollHeight; });
        assert.equal(await dialog.evaluate((element) => element.scrollTop), 0);
        assert.ok(await scrollBody.evaluate((element) => element.scrollTop > 0));
        assert.ok(await close.isVisible());
        const scrolledClose = await close.boundingBox();
        assert.ok(scrolledClose.y >= 0 && scrolledClose.y + scrolledClose.height <= viewport.height);
        assert.equal(scrolledClose.y, closeBounds.y);
        const scrollBounds = await scrollBody.boundingBox();
        assert.ok(scrollBounds.x > bounds.x && scrollBounds.x + scrollBounds.width < bounds.x + bounds.width);
        await page.waitForFunction(() => {
          const region = document.querySelector(".project-dialog[open] .project-dialog-body");
          return region && !region.hasAttribute("data-scrolling") && getComputedStyle(region).scrollbarColor === "rgba(0, 0, 0, 0) rgba(0, 0, 0, 0)";
        });
        if (route === "/projects" && [390, 1440].includes(viewport.width)) {
          await scrollBody.evaluate((element) => { element.scrollTop = 0; });
          await dialog.locator(".project-summary").click();
          await page.waitForFunction(() => !document.querySelector(".project-dialog[open] .project-dialog-body")?.hasAttribute("data-scrolling"));
          await page.screenshot({ path: `.next/projects/${project.slug}-${viewport.width}-${theme}.png` });
        }
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden" });
        assert.ok(await trigger.evaluate((element) => element === document.activeElement));
        await trigger.click();
        await close.click();
        await dialog.waitFor({ state: "hidden" });
        assert.ok(await trigger.evaluate((element) => element === document.activeElement));
        await trigger.click();
        await page.mouse.click(2, 2);
        await dialog.waitFor({ state: "hidden" });
        checks++;
        }
      }
    }
  }
  assert.deepEqual(errors, []);
  console.log(`Passed ${checks} project dialog checks across both routes, light/dark themes, normal/reduced motion, phone, landscape and desktop.`);
  await context.close();
} finally {
  await browser.close();
}
