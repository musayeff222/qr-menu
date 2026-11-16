import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const ROOT = path.resolve("src/menu-templates/skins");
const ids = ["fastfood-pro", "ocean-modern", "bella-classic"];

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
  const hasAdd = src.includes("handleAdd") || src.includes("AddBtn");
  if (!src.includes("useSkinModel") || !hasAdd || !src.includes("openCart")) {
    console.error(`FAIL ${id}: missing required hooks/actions`);
    process.exit(1);
  }
}
if (missing.length) {
  console.error("Missing skins:", missing.join(", "));
  process.exit(1);
}
const unique = new Set(markers.values());
if (unique.size !== 3) {
  console.error("Skin markers not unique", [...markers.entries()]);
  process.exit(1);
}

const require = createRequire(import.meta.url);
const policy = await import("../planTemplatePolicy.ts");
if (policy.MENU_TEMPLATE_IDS_ORDERED.length !== 3) {
  console.error("policy length", policy.MENU_TEMPLATE_IDS_ORDERED.length);
  process.exit(1);
}
if (policy.templateSelectionError("ocean-modern", 1, false)) {
  /* expected index lock when Free is capped to 1 */
} else {
  console.error("max_templates=1 should block ocean-modern");
  process.exit(1);
}
if (policy.templateSelectionError("bella-classic", 10, false)) {
  console.error("free should allow bella-classic");
  process.exit(1);
}
if (policy.templateSelectionError("bistro-rail", 10, false)) {
  console.error("legacy bistro-rail should remap to allowed skin");
  process.exit(1);
}
if (policy.templateSelectionError("modern-01", 10, false)) {
  console.error("legacy modern-01 should remap to allowed skin");
  process.exit(1);
}
if (policy.templateSelectionError("atelier-cover", 10, false)) {
  console.error("legacy atelier-cover should remap to allowed Free skin");
  process.exit(1);
}

const { sanitizeMenuAppearanceJson } = await import("../menuAppearance.ts");
const bad = sanitizeMenuAppearanceJson({
  version: 1,
  overridesByTemplate: {
    "bella-classic": { colors: { primary: "red", background: "#ffffff", text: "#111111" } },
  },
});
if (bad.includes("red") || !bad.includes("#ffffff")) {
  console.error("appearance sanitizer failed", bad);
  process.exit(1);
}

console.log("PASS 3 skins, unique layouts, policy, appearance sanitizer");
