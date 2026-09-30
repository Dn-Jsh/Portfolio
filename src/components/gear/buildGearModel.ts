import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { GearModelKind } from "@/data/gear";

const matteBlack = new THREE.MeshStandardMaterial({ color: 0x151820, roughness: 0.76, metalness: 0.16 });
const darkEdge = new THREE.MeshStandardMaterial({ color: 0x292d37, roughness: 0.48, metalness: 0.5 });
const pale = new THREE.MeshStandardMaterial({ color: 0xe8e9e7, roughness: 0.68 });
const icyBlue = new THREE.MeshStandardMaterial({ color: 0x9faec9, roughness: 0.3, metalness: 0.55 });
const glass = new THREE.MeshStandardMaterial({ color: 0x101521, roughness: 0.15, metalness: 0.24 });
const pink = new THREE.MeshStandardMaterial({ color: 0xff4fa5, emissive: 0xb31a62, emissiveIntensity: 0.55, roughness: 0.4 });
const rogRed = new THREE.MeshStandardMaterial({ color: 0xe84249, emissive: 0x7e1018, emissiveIntensity: 0.35, roughness: 0.5 });
const cyan = new THREE.MeshStandardMaterial({ color: 0x49e4df, emissive: 0x0c898a, emissiveIntensity: 0.6, roughness: 0.36 });
const navyKey = new THREE.MeshStandardMaterial({ color: 0x202537, roughness: 0.72 });
const silver = new THREE.MeshStandardMaterial({ color: 0xbfc4c7, metalness: 0.8, roughness: 0.28 });
const rubber = new THREE.MeshStandardMaterial({ color: 0x0b0d10, roughness: 0.92 });
const rgbBlue = new THREE.MeshStandardMaterial({ color: 0x7468ff, emissive: 0x3430b4, emissiveIntensity: 0.7 });
const rgbGreen = new THREE.MeshStandardMaterial({ color: 0xa2fc4c, emissive: 0x4f9f18, emissiveIntensity: 0.7 });
const charcoal = new THREE.MeshStandardMaterial({ color: 0x30343a, roughness: 0.58, metalness: 0.08 });
const graphite = new THREE.MeshStandardMaterial({ color: 0x454a51, roughness: 0.4, metalness: 0.12 });
const glossBlack = new THREE.MeshStandardMaterial({ color: 0x20242a, roughness: 0.25, metalness: 0.15 });

function rounded(
  parent: THREE.Group,
  size: [number, number, number],
  position: [number, number, number],
  material: THREE.Material,
  radius = 0.05,
) {
  const safeRadius = Math.max(0.0001, Math.min(radius, size[0] / 2 - 0.0001, size[1] / 2 - 0.0001, size[2] / 2 - 0.0001));
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 3, safeRadius), material);
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function cylinder(
  parent: THREE.Group,
  radius: number,
  height: number,
  position: [number, number, number],
  material: THREE.Material,
  segments = 24,
) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material);
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function sphere(
  parent: THREE.Group,
  radius: number,
  position: [number, number, number],
  scale: [number, number, number],
  material: THREE.Material,
) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 24, 16), material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  parent.add(mesh);
  return mesh;
}

function line(parent: THREE.Group, points: THREE.Vector3[], radius: number, material: THREE.Material) {
  const curve = new THREE.CatmullRomCurve3(points);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, radius, 8, false), material);
  parent.add(mesh);
  return mesh;
}

function label(
  parent: THREE.Group,
  content: string,
  position: [number, number, number],
  width: number,
  height: number,
  color = "#ffffff",
  topFacing = false,
) {
  if (!content) return;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, 256, 96);
  ctx.fillStyle = color;
  ctx.font = `700 ${content.length > 7 ? 38 : 56}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(content, 128, 50, 240);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide }),
  );
  mesh.position.set(...position);
  if (topFacing) mesh.rotation.x = -Math.PI / 2;
  parent.add(mesh);
  return mesh;
}

function displayTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const base = ctx.createLinearGradient(0, 0, 640, 400);
  base.addColorStop(0, "#090e1a");
  base.addColorStop(0.56, "#221124");
  base.addColorStop(1, "#080c15");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 640, 400);
  const glow = ctx.createRadialGradient(405, 195, 12, 405, 195, 340);
  glow.addColorStop(0, "#ef5363");
  glow.addColorStop(0.38, "#942139");
  glow.addColorStop(1, "#47141d00");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 640, 400);
  ctx.beginPath();
  ctx.ellipse(330, 280, 280, 75, -0.36, 0, Math.PI * 2);
  ctx.strokeStyle = "#e94455";
  ctx.lineWidth = 18;
  ctx.shadowColor = "#d9233b";
  ctx.shadowBlur = 38;
  ctx.stroke();
  ctx.shadowBlur = 24;
  ctx.fillStyle = "#f45560";
  ctx.font = "italic 900 78px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("ROG", 320, 215);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function phoneWallpaperTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const gradient = ctx.createLinearGradient(70, 0, 440, 768);
  gradient.addColorStop(0, "#202640");
  gradient.addColorStop(0.46, "#7080b7");
  gradient.addColorStop(1, "#10172c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 768);
  const halo = ctx.createRadialGradient(220, 380, 20, 220, 380, 370);
  halo.addColorStop(0, "#c9d5fb");
  halo.addColorStop(0.55, "#798ac3");
  halo.addColorStop(1, "#29325200");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, 512, 768);
  ctx.lineWidth = 72;
  ctx.strokeStyle = "#1c2442";
  ctx.beginPath();
  ctx.arc(275, 380, 230, -1.5, 1.12);
  ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function laptop() {
  const group = new THREE.Group();
  // G713 proportions follow ASUS's 39.5 × 28.2 cm chassis and 17.3-inch lid.
  rounded(group, [3.72, 0.22, 2.66], [0, -0.82, 0.20], matteBlack, 0.075);
  rounded(group, [3.61, 0.02, 2.51], [0, -0.699, 0.20], darkEdge, 0.048);
  rounded(group, [3.43, 0.014, 1.48], [0, -0.678, -0.13], rubber, 0.035);
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 15; col++) {
      const x = -1.54 + col * 0.219;
      const z = -0.72 + row * 0.265;
      rounded(group, [0.176, 0.035, 0.194], [x, -0.653, z], row === 0 ? darkEdge : matteBlack, 0.022);
      if (row === 0 || (row > 0 && col > 3 && col < 7)) {
        rounded(group, [0.08, 0.003, 0.008], [x, -0.633, z + 0.035], row === 0 ? rogRed : cyan, 0.003);
      }
    }
  }
  rounded(group, [1.02, 0.008, 0.47], [0, -0.68, 1.06], matteBlack, 0.04);
  rounded(group, [0.95, 0.003, 0.39], [0, -0.673, 1.06], darkEdge, 0.035);
  for (const x of [-1.42, 1.42]) {
    cylinder(group, 0.056, 0.24, [x, -0.68, -1.08], darkEdge);
    rounded(group, [0.37, 0.045, 0.09], [x, -0.94, 1.2], rubber, 0.02);
    rounded(group, [0.47, 0.035, 0.1], [x, -0.94, -0.78], rubber, 0.02);
    rounded(group, [0.85, 0.16, 0.24], [x, -0.81, -1.16], matteBlack, 0.035);
    for (let slot = 0; slot < 8; slot++) {
      rounded(group, [0.055, 0.07, 0.012], [x - 0.35 + slot * 0.1, -0.8, -1.287], rubber, 0.005);
    }
  }
  for (let i = 0; i < 17; i++) {
    rounded(group, [0.09, 0.007, 0.45], [-1.5 + i * 0.19, -0.936, -0.05], rubber, 0.004);
  }
  // Side I/O, rear exhausts and the thin RGB front light bar.
  for (const z of [-0.25, 0.08]) rounded(group, [0.008, 0.065, 0.16], [-1.865, -0.805, z], rubber, 0.003);
  cylinder(group, 0.04, 0.012, [-1.868, -0.81, 0.51], rubber).rotation.z = Math.PI / 2;
  for (const x of [-0.67, -0.31, 0.24, 0.59, 1.04]) {
    rounded(group, [0.24, 0.065, 0.008], [x, -0.8, -1.289], rubber, 0.005);
  }
  rounded(group, [3.29, 0.018, 0.014], [0, -0.865, 1.539], pink, 0.006);

  const lid = new THREE.Group();
  lid.position.set(0, -0.69, -1.06);
  lid.rotation.x = -0.18;
  rounded(lid, [3.64, 2.08, 0.12], [0, 1.04, -0.02], matteBlack, 0.052);
  rounded(lid, [3.46, 1.93, 0.012], [0, 1.06, 0.052], glass, 0.018);
  const texture = displayTexture();
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(3.35, 1.88),
    new THREE.MeshBasicMaterial({ map: texture, color: texture ? 0xffffff : 0x653875 }),
  );
  screen.position.set(0, 1.06, 0.063);
  lid.add(screen);
  sphere(lid, 0.013, [0, 2.015, 0.069], [1, 1, 0.5], rubber);
  const logo = label(lid, "ROG", [0.46, 1.10, -0.087], 0.76, 0.29, "#e64750");
  if (logo) logo.rotation.y = Math.PI;
  rounded(lid, [0.65, 0.025, 0.005], [1.23, 0.26, -0.085], rogRed, 0.004);
  group.add(lid);
  group.userData.lid = lid;
  return group;
}

function keyboard() {
  const group = new THREE.Group();
  // Use the supplied F75 photo for the exact key arrangement, legends and colors.
  // The fitted rounded case, feet and knob give it volume when viewed from the side.
  rounded(group, [3.58, 0.22, 1.59], [0, -0.18, 0], pale, 0.095);
  rounded(group, [3.49, 0.06, 1.48], [0, -0.038, 0], darkEdge, 0.06);
  const texture = new THREE.TextureLoader().load("/gear/aula-f75.png");
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repeat.set(0.924, 0.73);
  texture.offset.set(0.038, 0.145);
  texture.anisotropy = 8;
  const top = new THREE.Mesh(
    new THREE.PlaneGeometry(3.53, 1.52),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.02 }),
  );
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.012;
  group.add(top);
  // The knob also has a real side profile; its photographic face sits above it.
  cylinder(group, 0.105, 0.065, [1.55, 0.013, -0.61], silver, 40);
  cylinder(group, 0.079, 0.004, [1.55, 0.048, -0.61], pale, 40);
  rounded(group, [0.025, 0.052, 0.14], [-1.787, -0.15, -0.18], navyKey, 0.008);
  rounded(group, [0.22, 0.057, 0.012], [-1.1, -0.15, -0.802], rubber, 0.006);
  for (const x of [-1.35, 1.35]) {
    rounded(group, [0.39, 0.035, 0.17], [x, -0.306, -0.48], rubber, 0.018);
    rounded(group, [0.31, 0.04, 0.1], [x, -0.314, 0.52], rubber, 0.016);
  }
  return group;
}

function mouse() {
  const group = new THREE.Group();
  // The X11 has a continuous, broad rear palm rest that tapers to two low clicks.
  const crossSections: Array<[number, number, number]> = [
    [-1.17, 0.025, 0.06], [-1.02, 0.32, 0.22], [-0.73, 0.48, 0.39],
    [-0.28, 0.53, 0.46], [0.15, 0.52, 0.43], [0.58, 0.47, 0.30],
    [0.99, 0.35, 0.18], [1.19, 0.10, 0.085],
  ];
  const vertices: number[] = [];
  const indices: number[] = [];
  const ringSegments = 40;
  const profile = new THREE.CatmullRomCurve3(
    crossSections.map(([z, width, height]) => new THREE.Vector3(width, height, z)),
  );
  const ringCount = 36;
  for (let ring = 0; ring < ringCount; ring++) {
    const point = profile.getPoint(ring / (ringCount - 1));
    for (let i = 0; i < ringSegments; i++) {
      const angle = i / ringSegments * Math.PI * 2;
      const side = Math.cos(angle);
      const vertical = Math.sin(angle);
      vertices.push(
        point.x * side,
        0.045 + (vertical > 0 ? point.y : 0.16) * vertical,
        point.z,
      );
    }
  }
  for (let ring = 0; ring < ringCount - 1; ring++) {
    for (let i = 0; i < ringSegments; i++) {
      const a = ring * ringSegments + i;
      const b = ring * ringSegments + (i + 1) % ringSegments;
      const c = (ring + 1) * ringSegments + i;
      const d = (ring + 1) * ringSegments + (i + 1) % ringSegments;
      indices.push(a, b, c, b, d, c);
    }
  }
  const rearCenter = vertices.length / 3;
  vertices.push(0, 0.045, -1.17);
  const frontCenter = vertices.length / 3;
  vertices.push(0, 0.045, 1.19);
  for (let i = 0; i < ringSegments; i++) {
    indices.push(rearCenter, (i + 1) % ringSegments, i);
    const last = (ringCount - 1) * ringSegments;
    indices.push(frontCenter, last + i, last + (i + 1) % ringSegments);
  }
  const shellGeometry = new THREE.BufferGeometry();
  shellGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  shellGeometry.setIndex(indices);
  shellGeometry.computeVertexNormals();
  group.add(new THREE.Mesh(shellGeometry, charcoal));
  // Subtle seam separates the rear shell and the click surfaces.
  line(group, [
    new THREE.Vector3(-0.49, 0.20, 0.28),
    new THREE.Vector3(-0.36, 0.38, 0.32),
    new THREE.Vector3(0, 0.45, 0.33),
    new THREE.Vector3(0.36, 0.38, 0.32),
    new THREE.Vector3(0.49, 0.20, 0.28),
  ], 0.006, rubber);
  const left = rounded(group, [0.44, 0.055, 0.71], [-0.23, 0.348, 0.72], graphite, 0.052);
  left.rotation.x = 0.22;
  left.rotation.z = -0.09;
  const right = rounded(group, [0.44, 0.055, 0.71], [0.23, 0.348, 0.72], charcoal, 0.052);
  right.rotation.x = 0.22;
  right.rotation.z = 0.09;
  const wheel = cylinder(group, 0.105, 0.16, [0, 0.405, 0.72], rubber, 36);
  wheel.rotation.z = Math.PI / 2;
  for (const x of [-0.086, 0.086]) {
    const ring = cylinder(group, 0.105, 0.013, [x, 0.405, 0.72], silver, 36);
    ring.rotation.z = Math.PI / 2;
  }
  // The two thumb buttons and cyan status LED match the reference view.
  rounded(group, [0.018, 0.07, 0.27], [-0.505, 0.205, 0.18], rubber, 0.008);
  rounded(group, [0.026, 0.055, 0.24], [-0.522, 0.207, 0.18], graphite, 0.011);
  rounded(group, [0.018, 0.07, 0.24], [-0.51, 0.185, -0.16], rubber, 0.008);
  rounded(group, [0.026, 0.055, 0.21], [-0.527, 0.187, -0.16], graphite, 0.011);
  rounded(group, [0.095, 0.012, 0.035], [0, 0.466, -0.09], cyan, 0.01);
  const sideLogo = label(group, "ATTACK SHARK", [-0.526, 0.075, -0.38], 0.61, 0.14, "#e0e2e2");
  if (sideLogo) sideLogo.rotation.y = -Math.PI / 2;
  rounded(group, [0.34, 0.012, 0.21], [0, -0.12, -0.7], rubber, 0.03);
  rounded(group, [0.31, 0.012, 0.2], [0, -0.12, 0.84], rubber, 0.03);
  cylinder(group, 0.1, 0.01, [0, -0.13, 0], rubber);

  // Charging stand: sloping upper deck, gold contacts and a thin RGB base.
  rounded(group, [1.03, 0.1, 0.87], [-1.08, -0.50, -0.47], rubber, 0.09);
  const dock = rounded(group, [0.77, 0.4, 0.61], [-1.08, -0.25, -0.47], charcoal, 0.075);
  dock.rotation.x = -0.23;
  rounded(group, [0.59, 0.017, 0.32], [-1.08, -0.016, -0.57], graphite, 0.024);
  for (const x of [-1.18, -0.98]) cylinder(group, 0.026, 0.05, [x, 0.018, -0.57], silver);
  rounded(group, [0.24, 0.02, 0.027], [-1.45, -0.49, -0.016], pink, 0.009);
  rounded(group, [0.24, 0.02, 0.027], [-1.2, -0.49, -0.016], rgbBlue, 0.009);
  rounded(group, [0.24, 0.02, 0.027], [-0.96, -0.49, -0.016], cyan, 0.009);
  rounded(group, [0.24, 0.02, 0.027], [-0.72, -0.49, -0.016], rgbGreen, 0.009);
  return group;
}

function earbuds() {
  const group = new THREE.Group();
  // The R50i case is a wide pebble with a shallow lid, front latch and fabric loop.
  rounded(group, [2.06, 0.69, 0.98], [0, -0.78, 0], graphite, 0.34);
  rounded(group, [2.07, 0.42, 0.99], [0, -0.39, 0], charcoal, 0.21);
  rounded(group, [1.89, 0.01, 0.012], [0, -0.59, 0.494], rubber, 0.004);
  rounded(group, [0.39, 0.055, 0.019], [0, -0.60, 0.498], glossBlack, 0.018);
  label(group, "soundcore", [0, -0.39, 0.504], 0.7, 0.16, "#8d949a");
  sphere(group, 0.019, [0, -1.005, 0.496], [1, 1, 0.3], pale);
  rounded(group, [0.19, 0.17, 0.19], [-1.02, -0.65, 0.12], graphite, 0.06);
  line(group, [
    new THREE.Vector3(-1.05, -0.65, 0.12), new THREE.Vector3(-1.42, -0.74, 0.13),
    new THREE.Vector3(-1.63, -1.00, 0.13), new THREE.Vector3(-1.38, -1.18, 0.13),
    new THREE.Vector3(-1.05, -1.10, 0.13), new THREE.Vector3(-1.05, -0.65, 0.12),
  ], 0.026, graphite);
  rounded(group, [0.26, 0.17, 0.13], [-1.43, -0.80, 0.13], charcoal, 0.06);
  for (const direction of [-1, 1]) {
    const x = direction * 0.48;
    sphere(group, 0.275, [x, 0.69, 0.09], [1.06, 0.89, 0.96], glossBlack);
    sphere(group, 0.225, [x, 0.68, 0.245], [0.9, 0.84, 0.45], graphite);
    const tip = sphere(group, 0.155, [x - direction * 0.21, 0.68, -0.075], [1, 0.82, 1.04], rubber);
    tip.rotation.z = -direction * 0.22;
    const stem = rounded(group, [0.235, 0.66, 0.17], [x + direction * 0.065, 0.33, 0.31], graphite, 0.095);
    stem.rotation.z = direction * 0.17;
    rounded(group, [0.167, 0.48, 0.015], [x + direction * 0.065, 0.34, 0.405], charcoal, 0.007).rotation.z = direction * 0.17;
    sphere(group, 0.035, [x + direction * 0.065, 0.51, 0.414], [1, 1, 0.28], rubber);
    sphere(group, 0.018, [x + direction * 0.065, 0.07, 0.412], [1, 1, 0.24], pale);
  }
  return group;
}

function phone() {
  const group = new THREE.Group();
  // Fold5 open aspect ratio: 132.6 × 153.5 mm, with Icy Blue back and cover display.
  rounded(group, [1.13, 2.65, 0.11], [-0.58, 0, 0], icyBlue, 0.07);
  rounded(group, [1.13, 2.65, 0.11], [0.58, 0, 0], icyBlue, 0.07);
  cylinder(group, 0.047, 2.52, [0, 0, -0.015], silver, 24);
  rounded(group, [1.025, 2.49, 0.012], [0.58, 0, 0.065], glass, 0.05);
  const wallpaper = phoneWallpaperTexture();
  const cover = new THREE.Mesh(
    new THREE.PlaneGeometry(0.99, 2.43),
    new THREE.MeshBasicMaterial({ map: wallpaper, color: wallpaper ? 0xffffff : 0x465375 }),
  );
  cover.position.set(0.58, 0, 0.074);
  group.add(cover);
  sphere(group, 0.025, [0.58, 1.22, 0.081], [1, 1, 0.2], rubber);
  // Outside rear panel: separate raised rings, lenses and LED flash.
  for (let i = 0; i < 3; i++) {
    const ring = cylinder(group, 0.116, 0.049, [-0.91, 0.93 - i * 0.32, 0.077], silver);
    const lens = cylinder(group, 0.086, 0.057, [-0.91, 0.93 - i * 0.32, 0.105], glass);
    ring.rotation.x = Math.PI / 2;
    lens.rotation.x = Math.PI / 2;
  }
  sphere(group, 0.036, [-0.66, 0.87, 0.059], [1, 1, 0.25], pale);
  rounded(group, [0.023, 0.34, 0.06], [1.155, 0.45, 0], silver, 0.009);
  rounded(group, [0.023, 0.15, 0.06], [1.155, -0.05, 0], silver, 0.009);

  // One continuous flexible inner screen on the reverse face.
  rounded(group, [2.19, 2.51, 0.012], [0, 0, -0.066], glass, 0.045);
  const inner = new THREE.Mesh(
    new THREE.PlaneGeometry(2.13, 2.45),
    new THREE.MeshBasicMaterial({ map: wallpaper, color: wallpaper ? 0xffffff : 0x465375, side: THREE.DoubleSide }),
  );
  inner.position.set(0, 0, -0.076);
  inner.rotation.y = Math.PI;
  group.add(inner);
  rounded(group, [0.009, 2.34, 0.003], [0, 0, -0.078], darkEdge, 0.001);
  return group;
}

export function buildGearModel(kind: GearModelKind) {
  switch (kind) {
    case "laptop": return laptop();
    case "keyboard": return keyboard();
    case "mouse": return mouse();
    case "earbuds": return earbuds();
    case "phone": return phone();
  }
}
