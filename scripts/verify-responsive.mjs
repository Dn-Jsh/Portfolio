import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";

// Use a local Playwright installation or the desktop app's bundled module.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const baseUrl = process.env.RESPONSIVE_BASE_URL || "http://127.0.0.1:3000";
const widths = [280, 320, 360, 390, 414, 540, 640, 700, 768, 820, 912, 1023, 1024, 1180, 1280, 1440, 1920, 2560];
const routes = ["/", "/projects", "/experience", "/certifications", "/recommendations", "/stack", "/socials", "/gear", "/blog", "/editportfolio/login", "/editportfolio/setup"];
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
});
const failures = [];
let checks = 0;

async function checkLayout(page, label) {
  const issues = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const issues = [];
    if (document.documentElement.scrollWidth > viewport + 1) issues.push("Document scrolls horizontally");
    for (const element of document.querySelectorAll("main *")) {
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (!bounds.width || !bounds.height || style.visibility === "hidden" || style.display === "none") continue;
      if (bounds.left >= -1 && bounds.right <= viewport + 1) continue;
      let clipped = false;
      for (let parent = element.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        if (["auto", "scroll", "hidden", "clip"].includes(getComputedStyle(parent).overflowX)) {
          const parentBounds = parent.getBoundingClientRect();
          if (parentBounds.left >= -1 && parentBounds.right <= viewport + 1) clipped = true;
        }
      }
      if (!clipped) issues.push(`${element.tagName}.${String(element.className).slice(0, 70)} extends outside viewport`);
    }
    for (const heading of document.querySelectorAll(".section-heading")) {
      const title = heading.firstElementChild?.getBoundingClientRect();
      const action = heading.querySelector(".motion-link")?.getBoundingClientRect();
      if (title && action && title.right > action.left + 1 && title.top < action.bottom && title.bottom > action.top) issues.push("Section title overlaps its action");
    }
    return issues.slice(0, 12);
  });
  checks++;
  if (issues.length) failures.push({ label, issues });
}

try {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await mkdir(".next/responsive", { recursive: true });
  for (const route of routes) {
    const response = await page.goto(new URL(route, baseUrl).href, { waitUntil: "networkidle", timeout: 90000 });
    assert.ok(response?.ok(), `${route} returned ${response?.status()}`);
    await page.locator("main h1").first().waitFor();
    await page.evaluate(() => document.fonts.ready);
    if (route === "/blog") {
      const posts = await page.locator('main a[href^="/blog/"]').evaluateAll((links) => links.map((link) => new URL(link.href).pathname));
      for (const post of new Set(posts)) if (!routes.includes(post)) routes.push(post);
    }
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await checkLayout(page, `${route} at ${width}px`);
      if (["/", "/gear", "/certifications"].includes(route) && [390, 820, 1440].includes(width)) {
        await page.screenshot({ path: `.next/responsive/${route === "/" ? "home" : route.slice(1)}-${width}.png`, fullPage: true });
      }
    }
    for (const size of [{ width: 667, height: 375 }, { width: 1180, height: 820 }]) {
      await page.setViewportSize(size);
      await checkLayout(page, `${route} at ${size.width} × ${size.height} landscape`);
    }
    console.log(`Checked ${route} across ${widths.length} widths`);
  }

  const touchContext = await browser.newContext({ hasTouch: true, isMobile: true, reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
  const touch = await touchContext.newPage();
  await touch.goto(baseUrl, { waitUntil: "networkidle" });
  const opener = touch.getByRole("button", { name: "Open menu", exact: true });
  const menu = touch.getByRole("dialog", { name: "Site navigation", exact: true });
  for (const size of [{ width: 280, height: 653 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 820, height: 1180 }, { width: 1023, height: 600 }]) {
    await touch.setViewportSize(size);
    await opener.click();
    await menu.waitFor({ state: "visible" });
    const geometry = await menu.boundingBox();
    assert.ok(geometry && Math.abs(geometry.height - size.height) <= 1, "Menu must fit the viewport height");
    assert.ok(geometry && geometry.x >= 0 && geometry.width <= size.width, "Menu must fit the viewport width");
    assert.equal(await touch.evaluate(() => document.body.style.overflow), "hidden", "Background scrolling must be locked");
    await touch.keyboard.press("Shift+Tab");
    assert.ok(await touch.evaluate(() => document.querySelector("#mobile-navigation").contains(document.activeElement)), "Focus must stay inside the menu");
    await menu.getByRole("link", { name: /danjeshuaf@gmail.com/ }).scrollIntoViewIfNeeded();
    const contact = await menu.getByRole("link", { name: /danjeshuaf@gmail.com/ }).boundingBox();
    assert.ok(contact && contact.y >= 0 && contact.y + contact.height <= size.height + 1, "Menu footer must remain reachable in landscape");
    await touch.keyboard.press("Escape");
    await menu.waitFor({ state: "hidden" });
    await opener.waitFor();
    assert.ok(await opener.evaluate((element) => element === document.activeElement), "Focus must return to the opener");
    assert.notEqual(await touch.evaluate(() => document.body.style.overflow), "hidden", "Background scrolling must be restored");
    console.log(`Checked touch menu at ${size.width} × ${size.height}`);
  }
  await opener.click();
  await menu.getByRole("link", { name: "Projects", exact: true }).click();
  await touch.waitForURL("**/projects");
  await menu.waitFor({ state: "hidden" });
  assert.notEqual(await touch.evaluate(() => document.body.style.overflow), "hidden");
  await opener.click();
  await touch.setViewportSize({ width: 1024, height: 768 });
  await menu.waitFor({ state: "hidden" });
  assert.notEqual(await touch.evaluate(() => document.body.style.overflow), "hidden");

  await touch.setViewportSize({ width: 390, height: 844 });
  await touch.goto(new URL("/socials", baseUrl).href, { waitUntil: "networkidle" });
  const qrTrigger = touch.getByRole("button", { name: "Show Instagram QR code" });
  await qrTrigger.click();
  const qrDialog = touch.getByRole("dialog", { name: "Instagram", exact: true });
  await qrDialog.waitFor({ state: "visible" });
  for (const size of [{ width: 280, height: 653 }, { width: 844, height: 390 }]) {
    await touch.setViewportSize(size);
    const rect = await qrDialog.boundingBox();
    assert.ok(rect && rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= size.width + 1 && rect.y + rect.height <= size.height + 1, "QR dialog must fit portrait and landscape viewports");
  }
  await touch.keyboard.press("Escape");
  await qrDialog.waitFor({ state: "hidden" });
  assert.ok(await qrTrigger.evaluate((element) => element === document.activeElement), "QR dialog must restore focus");

  // Probe browser zoom/reflow using doubled text at a narrow viewport.
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await checkLayout(page, "Home with 200% base text at 320px");
  assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));
  console.log(`Passed ${checks} layout checks, touch navigation, focus restoration, breakpoint changes, and QR dialogs.`);
} finally {
  await browser.close();
}
