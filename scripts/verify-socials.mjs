import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import jsQR from "jsqr";
import { PNG } from "pngjs";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
});
const baseUrl = process.env.RESPONSIVE_BASE_URL || "http://127.0.0.1:3000";
let checked = 0;

try {
  await mkdir(".next/socials", { recursive: true });
  const context = await browser.newContext({ reducedMotion: "reduce", hasTouch: true });
  const page = await context.newPage();
  for (const theme of ["light", "dark"]) {
    await page.addInitScript((theme) => localStorage.setItem("theme", theme), theme);
    for (const size of [{ width: 280, height: 653 }, { width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1440, height: 900 }]) {
      await page.setViewportSize(size);
      await page.goto(new URL("/socials", baseUrl).href, { waitUntil: "networkidle" });
      const rows = page.locator(".social-row");
      assert.equal(await rows.count(), 6);
      assert.equal(await page.locator(".social-qr-trigger").count(), 6);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      for (const row of await rows.all()) {
        const platform = await row.locator("h3").innerText();
        const link = await row.locator("a.social-profile").getAttribute("href");
        const trigger = row.getByRole("button", { name: `Show ${platform} QR code`, exact: true });
        await trigger.tap();
        const dialog = page.getByRole("dialog", { name: platform, exact: true });
        await dialog.waitFor({ state: "visible" });
        const bounds = await dialog.boundingBox();
        assert.ok(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= size.width + 1 && bounds.y + bounds.height <= size.height + 1, `${platform} viewport fit`);
        const close = dialog.getByRole("button", { name: `Close ${platform} QR code` });
        const closeBounds = await close.boundingBox();
        assert.ok(closeBounds.width >= 44 && closeBounds.height >= 44);
        assert.equal(await dialog.getByRole("link").getAttribute("href"), link);
        assert.equal(await dialog.getByRole("button").count(), 1, "only the close button remains");
        assert.doesNotMatch(await dialog.innerText(), /copy link|share link|open @/i);
        const image = dialog.getByRole("img");
        await image.scrollIntoViewIfNeeded();
        const png = PNG.sync.read(await image.screenshot());
        const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
        assert.equal(decoded?.data, link, `${platform} rendered QR decodes at ${size.width}px in ${theme}`);
        if (platform === "TikTok") {
          assert.equal(link, "https://www.tiktok.com/@j3shua_?_r=1&_t=ZS-9AeleydNBbw");
          assert.equal(await dialog.getByRole("link").innerText(), "@j3shua_");
          if (size.width === 390) await dialog.screenshot({ path: `.next/socials/tiktok-${theme}.png` });
        }
        if (platform === "Facebook") assert.equal(link, "https://www.facebook.com/share/19UKy3a1yC/");
        await page.keyboard.press("Tab");
        assert.ok(await dialog.evaluate((element) => element.contains(document.activeElement)), "focus stays in dialog");
        await page.keyboard.press("Escape");
        await dialog.waitFor({ state: "hidden" });
        assert.ok(await trigger.evaluate((element) => element === document.activeElement), "focus returns to trigger");
        checked++;
      }
      if (size.width === 390) await page.screenshot({ path: `.next/socials/accounts-${theme}.png`, fullPage: true });
    }
  }
  await context.close();
  console.log(`Passed ${checked} rendered QR decode/dialog checks across six accounts, four viewport sizes, light/dark, touch, keyboard and focus restoration.`);
} finally {
  await browser.close();
}
