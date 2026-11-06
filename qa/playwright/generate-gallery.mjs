import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("qa/playwright");
const SHOTS = path.join(ROOT, "shots");
const SKINS = [
  "bistro-rail", "bistro-split", "bistro-ledger", "bistro-market", "bistro-counter",
  "atelier-cover", "noir-columns", "tasting-chapters", "gallery-plates", "menu-paper",
  "cafe-homestead", "patisserie-sheets", "roastery-journal", "cafe-polaroid", "cafe-calendar",
  "quick-kiosk", "speed-lane", "build-a-meal", "pizza-slices", "burger-stack",
  "izakaya-night", "neon-snap", "lounge-glass", "speakeasy-book", "midnight-table",
  "street-market", "street-zine", "street-filmstrip", "street-map", "street-tickets",
];
const VIEWS = ["320", "375", "390", "430", "768", "1280", "1440"];
const EXTRAS = ["375-full", "1280-full", "375-cart", "375-checkout", "375-variant", "375-detail"];

fs.mkdirSync(SHOTS, { recursive: true });

function okFile(file) {
  const p = path.join(SHOTS, file);
  return fs.existsSync(p) && fs.statSync(p).size > 2000;
}

const missing = [];
const present = [];
for (const skin of SKINS) {
  for (const view of VIEWS) {
    const file = `${skin}__${view}.png`;
    if (okFile(file)) present.push(file);
    else missing.push(file);
  }
  for (const extra of EXTRAS) {
    const file = `${skin}__${extra}.png`;
    if (okFile(file)) present.push(file);
    else missing.push(file);
  }
}

const nav = SKINS.map((id) => `<a href="#${id}">${id}</a>`).join("");
const sections = SKINS.map((id) => {
  const views = VIEWS.map((v) => {
    const file = `${id}__${v}.png`;
    const ok = present.includes(file);
    return `<figure data-ok="${ok}"><img src="shots/${file}" alt="${id} ${v}px" loading="lazy"><figcaption>${v}px ${ok ? "" : "(yoxdur)"}</figcaption></figure>`;
  }).join("");
  const extras = EXTRAS.map((v) => {
    const file = `${id}__${v}.png`;
    const ok = present.includes(file);
    return `<figure data-ok="${ok}"><img src="shots/${file}" alt="${id} ${v}" loading="lazy"><figcaption>${v} ${ok ? "" : "(yoxdur)"}</figcaption></figure>`;
  }).join("");
  return `<section id="${id}"><h2>${id}</h2><div class="row">${views}</div><div class="row extras">${extras}</div></section>`;
}).join("\n");

const html = `<!doctype html>
<html lang="az">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MenuGo 30 skin — screenshot müqayisə</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; background: #101214; color: #e8eaed; }
  header { position: sticky; top: 0; z-index: 5; background: #16191d; border-bottom: 1px solid #2a3038; padding: 12px 16px; }
  h1 { margin: 0 0 8px; font-size: 18px; }
  .meta { font-size: 12px; color: #9aa3ad; }
  nav { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  nav a { color: #8bd4c4; font-size: 11px; text-decoration: none; background: #1d2329; padding: 4px 8px; border-radius: 999px; }
  nav a:hover { background: #2a333c; }
  section { padding: 20px 16px 8px; border-top: 1px solid #22282f; }
  h2 { margin: 0 0 12px; font-size: 15px; letter-spacing: .04em; }
  .row { display: grid; grid-template-columns: repeat(7, minmax(140px, 1fr)); gap: 10px; overflow-x: auto; }
  .row.extras { margin-top: 10px; grid-template-columns: repeat(6, minmax(140px, 1fr)); }
  figure { margin: 0; background: #1a1f24; border-radius: 10px; overflow: hidden; }
  figure[data-ok="false"] { outline: 2px solid #c45c5c; }
  img { display: block; width: 100%; height: auto; background: #0b0d0f; cursor: zoom-in; }
  figcaption { font-size: 11px; padding: 6px 8px; color: #9aa3ad; }
  dialog { border: 0; padding: 0; background: #000; max-width: 96vw; }
  dialog img { max-height: 92vh; width: auto; max-width: 96vw; }
</style>
</head>
<body>
<header>
  <h1>MenuGo 30 skin QA qalereyası</h1>
  <p class="meta">${present.length} ekran görüntüsü · viewport 320–1440 + fullPage 375/1280 + cart/checkout/variant/detail · çatışmayan: ${missing.length}</p>
  <nav>${nav}</nav>
</header>
${sections}
<dialog id="lb"><img alt=""></dialog>
<script>
  const lb = document.getElementById("lb");
  const img = lb.querySelector("img");
  document.querySelectorAll("figure img").forEach((el) => {
    el.addEventListener("click", () => { img.src = el.src; img.alt = el.alt; lb.showModal(); });
  });
  lb.addEventListener("click", () => lb.close());
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, "gallery.html"), html);
console.log("gallery", present.length, "present; missing", missing.length);
if (missing.length) console.log(missing.slice(0, 40).join("\n"));
process.exit(0);
