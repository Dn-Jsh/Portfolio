import assert from "node:assert/strict";
import test from "node:test";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import QRCode from "qrcode";
import { loadModule } from "./load-typescript.mjs";

const { SOCIALS } = loadModule("../src/data/socials.ts");
const { createSocialQrDataUrl } = loadModule("../src/lib/social-qr.ts", { qrcode: { default: QRCode } });
const { resolveSocialProfile } = loadModule("../src/lib/social-profile.ts");

test("every social QR independently decodes to its exact account URL with a transparent quiet zone", async () => {
  assert.equal(SOCIALS.length, 6);
  for (const social of SOCIALS) {
    const source = await createSocialQrDataUrl(social.link);
    const png = PNG.sync.read(Buffer.from(source.split(",")[1], "base64"));
    assert.equal(png.data[3], 0, `${social.platform} background must be transparent`);
    // Composite the transparent source onto the same white scan surface as the UI.
    for (let pixel = 0; pixel < png.data.length; pixel += 4) {
      if (png.data[pixel + 3] === 0) png.data.fill(255, pixel, pixel + 4);
    }
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    assert.equal(decoded?.data, social.link, `${social.platform} QR destination`);
    assert.ok(decoded.location.topLeftCorner.x >= 4 * png.width / 65, `${social.platform} quiet zone`);
  }
});

test("corrects old published TikTok/Facebook/X seeds and preserves future CMS accounts", () => {
  for (const [oldLink, platform] of [
    ["https://tiktok.com/@danjeshua", "TikTok"],
    ["https://facebook.com/danjeshua", "Facebook"],
    ["https://x.com/danjeshua", "X"],
  ]) {
    const expected = SOCIALS.find((social) => social.platform === platform);
    const old = { ...expected, link: oldLink, handle: platform === "Facebook" ? expected.handle : "@danjeshua" };
    const updated = resolveSocialProfile(old);
    assert.equal(updated.link, expected.link);
    assert.equal(updated.handle, expected.handle);
    assert.equal(old.link, oldLink, "does not mutate published data");
  }
  const custom = { ...SOCIALS[3], link: "https://www.tiktok.com/@new-account", handle: "@new-account" };
  assert.equal(resolveSocialProfile(custom), custom);
  const customX = { ...SOCIALS[5], link: "https://x.com/new-account", handle: "@new-account" };
  assert.equal(resolveSocialProfile(customX), customX);
});
