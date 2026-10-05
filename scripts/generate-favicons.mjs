import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const SRC_IMAGE = process.argv[2] || 'C:/Users/danje/OneDrive/Desktop/02_icon_only.png';

function createDibIconData(rawBuffer, width, height) {
  const andStride = Math.ceil(width / 32) * 4;
  const xorSize = width * height * 4;
  const andSize = andStride * height;
  const biSizeImage = xorSize + andSize;

  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0); // biSize
  header.writeInt32LE(width, 4); // biWidth
  header.writeInt32LE(height * 2, 8); // biHeight (double for XOR + AND)
  header.writeUInt16LE(1, 12); // biPlanes
  header.writeUInt16LE(32, 14); // biBitCount
  header.writeUInt32LE(0, 16); // biCompression
  header.writeUInt32LE(biSizeImage, 20); // biSizeImage

  const xorData = Buffer.alloc(xorSize);
  const andData = Buffer.alloc(andSize, 0);

  // Bottom-up scanlines
  for (let y = 0; y < height; y++) {
    const srcRow = height - 1 - y;
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcRow * width + x) * 4;
      const dstIdx = (y * width + x) * 4;
      const r = rawBuffer[srcIdx];
      const g = rawBuffer[srcIdx + 1];
      const b = rawBuffer[srcIdx + 2];
      const a = rawBuffer[srcIdx + 3];

      // BGRA format for DIB
      xorData[dstIdx] = b;
      xorData[dstIdx + 1] = g;
      xorData[dstIdx + 2] = r;
      xorData[dstIdx + 3] = a;

      if (a === 0) {
        const bytePos = y * andStride + (x >> 3);
        const bitPos = 7 - (x & 7);
        andData[bytePos] |= (1 << bitPos);
      }
    }
  }

  return Buffer.concat([header, xorData, andData]);
}

async function buildIco(imageBuffer) {
  const sizes = [16, 32, 48];
  const datas = [];

  for (const s of sizes) {
    const raw = await sharp(imageBuffer)
      .resize(s, s, { kernel: 'lanczos3' })
      .ensureAlpha()
      .raw()
      .toBuffer();
    const dib = createDibIconData(raw, s, s);
    datas.push({ width: s, height: s, buffer: dib, bpp: 32 });
  }

  // 256x256 as PNG
  const png256 = await sharp(imageBuffer)
    .resize(256, 256, { kernel: 'lanczos3' })
    .png()
    .toBuffer();
  datas.push({ width: 256, height: 256, buffer: png256, bpp: 32 });

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(datas.length, 4);

  let offset = 6 + datas.length * 16;
  const dirEntries = [];
  const body = [];

  for (const d of datas) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(d.width >= 256 ? 0 : d.width, 0);
    entry.writeUInt8(d.height >= 256 ? 0 : d.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(d.bpp, 6);
    entry.writeUInt32LE(d.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);

    dirEntries.push(entry);
    body.push(d.buffer);
    offset += d.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...body]);
}

async function main() {
  console.log('Reading source image:', SRC_IMAGE);
  
  // Extract 180x180 centered on logo (cx=166, cy=150)
  const extracted = await sharp(SRC_IMAGE)
    .extract({ left: 76, top: 60, width: 180, height: 180 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const cleaned = Buffer.from(extracted.data);
  for (let i = 0; i < cleaned.length; i += 4) {
    const r = cleaned[i], g = cleaned[i+1], b = cleaned[i+2];
    // Threshold out any faint grid / guide lines (brightness < 65)
    if (r < 65 && g < 65 && b < 65) {
      cleaned[i] = 14;
      cleaned[i+1] = 15;
      cleaned[i+2] = 15;
      cleaned[i+3] = 255;
    }
  }

  // 1. High-resolution 512x512 base with solid dark background
  const solid512 = await sharp(cleaned, { raw: { width: 180, height: 180, channels: 4 } })
    .resize(512, 512, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  // 2. High-resolution 512x512 rounded squircle (iOS/macOS icon style) with transparent corners
  const rx = 115;
  const maskSvg = Buffer.from(`<svg width="512" height="512"><rect x="0" y="0" width="512" height="512" rx="${rx}" ry="${rx}" fill="white"/></svg>`);
  const squircle512 = await sharp(solid512)
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 3. Apple touch icon: 180x180 with solid background (iOS clips corners natively)
  const appleIcon180 = await sharp(solid512)
    .resize(180, 180, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  // 4. Generate multi-resolution ICO file
  const icoBuffer = await buildIco(squircle512);

  // Write files
  const appFaviconPath = path.join(ROOT_DIR, 'src/app/favicon.ico');
  const appIconPath = path.join(ROOT_DIR, 'src/app/icon.png');
  const appAppleIconPath = path.join(ROOT_DIR, 'src/app/apple-icon.png');
  const publicFaviconPath = path.join(ROOT_DIR, 'public/favicon.ico');
  const publicIconPath = path.join(ROOT_DIR, 'public/icon.png');

  fs.writeFileSync(appFaviconPath, icoBuffer);
  console.log('Wrote', appFaviconPath, '(' + icoBuffer.length + ' bytes)');

  fs.writeFileSync(appIconPath, squircle512);
  console.log('Wrote', appIconPath, '(' + squircle512.length + ' bytes)');

  fs.writeFileSync(appAppleIconPath, appleIcon180);
  console.log('Wrote', appAppleIconPath, '(' + appleIcon180.length + ' bytes)');

  fs.writeFileSync(publicFaviconPath, icoBuffer);
  console.log('Wrote', publicFaviconPath, '(' + icoBuffer.length + ' bytes)');

  fs.writeFileSync(publicIconPath, squircle512);
  console.log('Wrote', publicIconPath, '(' + squircle512.length + ' bytes)');

  console.log('All favicon and icon assets generated successfully!');
}

main().catch(console.error);
