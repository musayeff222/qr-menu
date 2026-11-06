import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const ROOT = path.resolve("src/menu-templates/skins");
const ids = [
  "bistro-rail", "bistro-split", "bistro-ledger", "bistro-market", "bistro-counter",
  "atelier-cover", "noir-columns", "tasting-chapters", "gallery-plates", "menu-paper",
  "cafe-homestead", "patisserie-sheets", "roastery-journal", "cafe-polaroid", "cafe-calendar",
  "quick-kiosk", "speed-lane", "build-a-meal", "pizza-slices", "burger-stack",
  "izakaya-night", "neon-snap", "lounge-glass", "speakeasy-book", "midnight-table",
  "street-market", "street-zine", "street-filmstrip", "street-map", "street-tickets",
];

const missing = [];
const markers = new Map();
for (const id of ids) {
  const p = path.join(ROOT, id, "Skin.tsx");
  if (!fs.existsSync(p)) {
    missing.push(id);
    continue;
  }
  const src = fs.readFileSync(p, "utf8");
  const m = src.match(/className="skin-[^"]+"/);
  markers.set(id, m ? m[0] : "NO_MARKER");
  if (!src.includes("useSkinModel") || !src.includes("handleAdd") || !src.includes("openCart")) {
    console.error(`FAIL ${id}: missing required hooks/actions`);
    process.exit(1);
  }
}
if (missing.length) {
  console.error("Missing skins:", missing.join(", "));
  process.exit(1);
}
const unique = new Set(markers.values());
if (unique.size !== 30) {
  console.error("Skin markers not unique", [...markers.entries()]);
  process.exit(1);
}

const require = createRequire(import.meta.url);
const policy = await import("../planTemplatePolicy.ts");
if (policy.MENU_TEMPLATE_IDS_ORDERED.length !== 30) {
  console.error("policy length", policy.MENU_TEMPLATE_IDS_ORDERED.length);
  process.exit(1);
}
if (policy.templateSelectionError("atelier-cover", 10, false)) {
  /* expected lock */
} else {
  console.error("premium lock failed");
  process.exit(1);
}
if (policy.templateSelectionError("bistro-rail", 10, false)) {
  console.error("free should allow bistro-rail");
  process.exit(1);
}
if (policy.templateSelectionError("modern-01", 10, false)) {
  console.error("legacy modern-01 should remap to allowed skin");
  process.exit(1);
}

const { sanitizeMenuAppearanceJson } = await import("../menuAppearance.ts");
const bad = sanitizeMenuAppearanceJson({
  version: 1,
  overridesByTemplate: {
    "bistro-rail": { colors: { primary: "red", background: "#ffffff", text: "#111111" } },
  },
});
if (bad.includes("red") || !bad.includes("#ffffff")) {
  console.error("appearance sanitizer failed", bad);
  process.exit(1);
}

console.log("PASS 30 skins, unique layouts, policy, appearance sanitizer");
