import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";

// Use a local Playwright installation or the desktop app's bundled module.
const require = createRequire(import.meta.url);
const { chromium, devices } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const baseUrl = process.env.RESPONSIVE_BASE_URL || "http://127.0.0.1:3000";
const widths = [280, 320, 360, 375, 390, 393, 412, 414, 430, 540, 640, 700, 768, 820, 912, 1023, 1024, 1180, 1280, 1440, 1920, 2560];
const routes = ["/", "/projects", "/experience", "/certifications", "/recommendations", "/stack", "/socials", "/gear", "/blog", "/editportfolio/login", "/editportfolio/setup"];
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
});
const failures = [];
let checks = 0;

async function resize(page, size) {
  await page.setViewportSize(size);
  // Chromium can update viewport dimensions before media/container layouts settle.
  await page.evaluate((size) => new Promise((resolve, reject) => {
    let previous = "";
    let stableFrames = 0;
    const deadline = performance.now() + 1000;
    const measure = () => {
      const bounds = document.querySelector("main").getBoundingClientRect();
      const current = JSON.stringify([innerWidth, innerHeight, bounds.x, bounds.y, bounds.width, bounds.height]);
      stableFrames = current === previous ? stableFrames + 1 : 0;
      previous = current;
      if (innerWidth === size.width && innerHeight === size.height && stableFrames >= 3) resolve();
      else if (performance.now() >= deadline) reject(new Error("Viewport layout did not settle"));
      else requestAnimationFrame(measure);
    };
    requestAnimationFrame(measure);
  }), size);
}

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
      await resize(page, { width, height: 900 });
      await checkLayout(page, `${route} at ${width}px`);
      if (["/", "/gear", "/certifications"].includes(route) && [390, 820, 1440].includes(width)) {
        await page.screenshot({ path: `.next/responsive/${route === "/" ? "home" : route.slice(1)}-${width}.png`, fullPage: true });
      }
    }
    for (const size of [{ width: 667, height: 375 }, { width: 1180, height: 820 }]) {
      await resize(page, size);
      await checkLayout(page, `${route} at ${size.width} × ${size.height} landscape`);
    }
    await resize(page, { width: 320, height: 900 });
    await page.evaluate(() => {
      const textElements = [...document.querySelectorAll("main, main *")].filter((element) => element instanceof HTMLElement);
      const fontSizes = textElements.map((element) => parseFloat(getComputedStyle(element).fontSize));
      document.documentElement.style.fontSize = "200%";
      textElements.forEach((element, index) => { element.style.fontSize = `${fontSizes[index] * 2}px`; });
    });
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await checkLayout(page, `${route} with 200% text (including pixel sizes) at 320px`);
    console.log(`Checked ${route} across ${widths.length} widths`);
  }

  for (const name of ["iPhone SE", "iPhone 13", "iPhone 14 Pro Max", "Pixel 7", "Galaxy S9+"]) {
    const phoneContext = await browser.newContext({ ...devices[name], reducedMotion: "reduce" });
    const phone = await phoneContext.newPage();
    for (const route of ["/", "/certifications", "/gear", "/socials", "/editportfolio/login"]) {
      await phone.goto(new URL(route, baseUrl).href, { waitUntil: "networkidle" });
      await phone.evaluate(() => document.fonts.ready);
      await checkLayout(phone, `${name}: ${route}`);
      assert.equal(await phone.evaluate(() => innerWidth), devices[name].viewport.width, `${name} must use the device viewport`);
      if (route === "/") {
        const columns = await phone.locator(".hero-stats").evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(" ").length);
        const expectedColumns = devices[name].viewport.width <= 320 ? 2 : 3;
        assert.equal(columns, expectedColumns, `${name} must reflow profile highlights to readable columns`);
        if (await phone.locator(".contribution-dot").count()) {
          await phone.locator(".contribution-dot").first().scrollIntoViewIfNeeded();
          assert.ok(await phone.locator(".contribution-dot").last().evaluate((element) => Number(getComputedStyle(element).opacity) > 0), "Reduced motion must keep contribution cells visible");
        } else {
          await phone.getByText("Contributions are temporarily unavailable.", { exact: false }).waitFor();
        }
        await phone.evaluate(() => window.scrollTo(0, 0));
        await phone.screenshot({ path: `.next/responsive/${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}.png` });
      }
      if (route === "/editportfolio/login") {
        assert.ok(await phone.locator('input[type="email"]').evaluate((element) => parseFloat(getComputedStyle(element).fontSize) >= 16), "Touch inputs must remain readable without focus zoom");
      }
      await resize(phone, { width: devices[name].viewport.height, height: devices[name].viewport.width });
      await checkLayout(phone, `${name}: ${route} landscape`);
      await resize(phone, devices[name].viewport);
    }
    await phone.emulateMedia({ colorScheme: "dark" });
    await phone.goto(baseUrl, { waitUntil: "networkidle" });
    await checkLayout(phone, `${name}: dark homepage`);
    await phoneContext.close();
    console.log(`Checked ${name} emulation, touch text, and landscape`);
  }

  const touchContext = await browser.newContext({ hasTouch: true, isMobile: true, reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
  const touch = await touchContext.newPage();
  await touch.goto(baseUrl, { waitUntil: "networkidle" });
  const opener = touch.getByRole("button", { name: "Open menu", exact: true });
  const menu = touch.getByRole("dialog", { name: "Site navigation", exact: true });
  for (const size of [{ width: 280, height: 653 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 820, height: 1180 }, { width: 1023, height: 600 }]) {
    await resize(touch, size);
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
  await resize(touch, { width: 1024, height: 768 });
  await menu.waitFor({ state: "hidden" });
  assert.notEqual(await touch.evaluate(() => document.body.style.overflow), "hidden");

  await resize(touch, { width: 390, height: 844 });
  await touch.goto(new URL("/socials", baseUrl).href, { waitUntil: "networkidle" });
  const qrTrigger = touch.getByRole("button", { name: "Show Instagram QR code" });
  await qrTrigger.click();
  const qrDialog = touch.getByRole("dialog", { name: "Instagram", exact: true });
  await qrDialog.waitFor({ state: "visible" });
  for (const size of [{ width: 280, height: 653 }, { width: 844, height: 390 }]) {
    await resize(touch, size);
    const rect = await qrDialog.boundingBox();
    assert.ok(rect && rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= size.width + 1 && rect.y + rect.height <= size.height + 1, "QR dialog must fit portrait and landscape viewports");
    const close = await qrDialog.getByRole("button", { name: "Close Instagram QR code" }).boundingBox();
    assert.ok(close && close.width >= 44 && close.height >= 44, "QR close control must keep its touch target");
  }
  await touch.addStyleTag({ content: ".instagram-qr-dialog { --dialog-inline-space: 44px; --dialog-block-space: 34px; }" });
  await touch.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const safeBounds = await qrDialog.boundingBox();
  assert.ok(safeBounds && safeBounds.x >= 43 && safeBounds.y >= 33 && safeBounds.x + safeBounds.width <= 801 && safeBounds.y + safeBounds.height <= 357, `QR dialog must respect simulated safe-area gutters: ${JSON.stringify(safeBounds)}`);
  await qrDialog.getByRole("link", { name: /Open @dn_jsh/ }).scrollIntoViewIfNeeded();
  const qrFooter = await qrDialog.getByRole("link", { name: /Open @dn_jsh/ }).boundingBox();
  assert.ok(qrFooter && qrFooter.y >= 0 && qrFooter.y + qrFooter.height <= 390, "QR footer must remain reachable in landscape");
  await touch.keyboard.press("Escape");
  await qrDialog.waitFor({ state: "hidden" });
  assert.ok(await qrTrigger.evaluate((element) => element === document.activeElement), "QR dialog must restore focus");

  assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));
  console.log(`Passed ${checks} layout checks, Android/iPhone emulation in Chromium, enlarged text, touch navigation, focus restoration, breakpoint changes, and QR dialogs.`);
} finally {
  await browser.close();
}
