import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.GALLERY_BASE || "http://127.0.0.1:3010";
const IDS = [
  "bistro-rail", "bistro-split", "bistro-ledger", "bistro-market", "bistro-counter",
  "atelier-cover", "noir-columns", "tasting-chapters", "gallery-plates", "menu-paper",
  "cafe-homestead", "patisserie-sheets", "roastery-journal", "cafe-polaroid", "cafe-calendar",
  "quick-kiosk", "speed-lane", "build-a-meal", "pizza-slices", "burger-stack",
  "izakaya-night", "neon-snap", "lounge-glass", "speakeasy-book", "midnight-table",
  "street-market", "street-zine", "street-filmstrip", "street-map", "street-tickets",
];

let fail = 0;
for (const id of IDS) {
  const dump = path.join(os.tmpdir(), `menugo-smoke-${id}.html`);
  spawnSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--virtual-time-budget=7000",
      `--dump-dom`,
      `${BASE}/r/demo-az-menu?preview=true&previewTemplate=${id}`,
    ],
    { encoding: "utf8", timeout: 25000 }
  );
  const r = spawnSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--virtual-time-budget=7000",
      `--dump-dom`,
      `${BASE}/r/demo-az-menu?preview=true&previewTemplate=${id}`,
    ],
    { encoding: "utf8", timeout: 25000 }
  );
  const html = `${r.stdout || ""}${r.stderr || ""}`;
  fs.writeFileSync(dump, html);
  const hasSkin = html.includes(`data-skin="${id}"`);
  const hasCart = /səbət|sebət|cart|bag|receipt|tray|drawer|ribbon|stall|reel|tasting/i.test(html);
  const hasAdd = html.includes("handleAdd") || /Əlavə et|\+|ADD|Add|Select|Cup|Seat|Mark|SIZE/i.test(html);
  const ok = hasSkin && html.length > 8000;
  if (!ok) {
    fail++;
    console.error("FAIL", id, { hasSkin, len: html.length, hasCart, hasAdd });
  } else {
    console.log("OK", id, html.length);
  }
}
if (fail) process.exit(1);
console.log("PASS 30 skins rendered");
