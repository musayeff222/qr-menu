import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ROOT = path.resolve("qa/skin-gallery");
const BASE = process.env.GALLERY_BASE || "http://127.0.0.1:3010";
const ALL_IDS = [
  "bistro-rail", "bistro-split", "bistro-ledger", "bistro-market", "bistro-counter",
  "atelier-cover", "noir-columns", "tasting-chapters", "gallery-plates", "menu-paper",
  "cafe-homestead", "patisserie-sheets", "roastery-journal", "cafe-polaroid", "cafe-calendar",
  "quick-kiosk", "speed-lane", "build-a-meal", "pizza-slices", "burger-stack",
  "izakaya-night", "neon-snap", "lounge-glass", "speakeasy-book", "midnight-table",
  "street-market", "street-zine", "street-filmstrip", "street-map", "street-tickets",
];
const ALL_VIEWS = [
  { id: "320", w: 320, h: 680 },
  { id: "375", w: 375, h: 812 },
  { id: "390", w: 390, h: 844 },
  { id: "430", w: 430, h: 932 },
  { id: "1280", w: 1280, h: 860 },
];
const IDS = process.env.SKINS ? process.env.SKINS.split(",").map((s) => s.trim()).filter(Boolean) : ALL_IDS;
const VIEWS = process.env.VIEWS
  ? ALL_VIEWS.filter((v) => process.env.VIEWS.split(",").map((s) => s.trim()).includes(v.id))
  : ALL_VIEWS;

fs.mkdirSync(path.join(ROOT, "shots"), { recursive: true });

function capture(skin, view) {
  const out = path.join(ROOT, "shots", `${skin}__${view.id}.png`);
  const url = `${BASE}/r/demo-az-menu?preview=true&previewTemplate=${skin}`;
  const r = spawnSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--window-size=${view.w},${view.h}`,
      "--virtual-time-budget=12000",
      `--screenshot=${out}`,
      url,
    ],
    { encoding: "utf8", timeout: 45000 }
  );
  const ok = fs.existsSync(out) && fs.statSync(out).size > 2000;
  if (!ok) {
    console.error("FAIL", skin, view.id, r.status, r.stderr?.slice(0, 400));
    return false;
  }
  console.log("OK", skin, view.id, fs.statSync(out).size);
  return true;
}

let fail = 0;
for (const skin of IDS) {
  for (const view of VIEWS) {
    if (!capture(skin, view)) fail++;
  }
}

if (IDS.length !== ALL_IDS.length || VIEWS.length !== ALL_VIEWS.length) {
  console.log("partial capture; gallery HTML left unchanged. fails", fail);
  if (fail) process.exit(1);
  process.exit(0);
}

const cards = ALL_IDS.map((id) => {
  const shots = ALL_VIEWS.map(
    (v) =>
      `<figure><img src="shots/${id}__${v.id}.png" alt="${id} ${v.id}px" width="${v.w}"><figcaption>${v.id}px</figcaption></figure>`
  ).join("");
  return `<section id="${id}"><h2>${id}</h2><div class="row">${shots}</div></section>`;
}).join("\n");

const html = `<!doctype html>
<html lang="az">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MenuGo 30 skin QA gallery</title>
<style>
  :root { font-family: ui-sans-serif, system-ui, sans-serif; color: #0a1720; background: #f7faf8; }
  body { margin: 0; }
  header { position: sticky; top: 0; z-index: 2; background: #0a1720; color: #fff; padding: 12px 16px; }
  nav { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 16px; background: #fff; border-bottom: 1px solid #dce5e0; }
  nav a { font-size: 12px; color: #078363; }
  section { padding: 16px; border-bottom: 8px solid #e6eeea; }
  h2 { margin: 0 0 10px; font-size: 18px; }
  .row { display: flex; gap: 12px; overflow-x: auto; align-items: flex-start; }
  figure { margin: 0; background: #fff; padding: 8px; border-radius: 12px; box-shadow: 0 1px 6px #0001; }
  img { display: block; height: auto; max-width: none; border: 1px solid #e5e7eb; background: #fff; }
  figcaption { font-size: 11px; text-align: center; margin-top: 4px; color: #63747c; }
</style>
<header>
  <strong>MenuGo — 30 QR menü skin QA</strong>
  <div style="opacity:.7;font-size:12px">viewport: 320 / 375 / 390 / 430 / 1280 · demo-az-menu preview</div>
</header>
<nav>${ALL_IDS.map((id) => `<a href="#${id}">${id}</a>`).join("")}</nav>
${cards}
</html>
`;
fs.writeFileSync(path.join(ROOT, "index.html"), html);
console.log("gallery", path.join(ROOT, "index.html"), "fails", fail);
if (fail) process.exit(1);
