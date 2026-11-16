import { DEFAULT_SKIN_ID, SKIN_IDS } from "./skinCatalog";

/** Old 30-skin IDs plus earlier aliases → the 3 active designs. No DB write. */
const LEGACY: Record<string, string> = {
  smartweb: "fastfood-pro",
  "quick-kiosk": "fastfood-pro",
  "speed-lane": "fastfood-pro",
  "build-a-meal": "fastfood-pro",
  "pizza-slices": "fastfood-pro",
  "burger-stack": "fastfood-pro",
  "street-market": "fastfood-pro",
  "street-zine": "fastfood-pro",
  "street-filmstrip": "fastfood-pro",
  "street-map": "fastfood-pro",
  "street-tickets": "fastfood-pro",
  "cafe-homestead": "ocean-modern",
  "patisserie-sheets": "ocean-modern",
  "roastery-journal": "ocean-modern",
  "cafe-polaroid": "ocean-modern",
  "cafe-calendar": "ocean-modern",
  "lounge-glass": "ocean-modern",
  "neon-snap": "ocean-modern",
  "bistro-rail": "bella-classic",
  "bistro-split": "bella-classic",
  "bistro-ledger": "bella-classic",
  "bistro-market": "bella-classic",
  "bistro-counter": "bella-classic",
  "atelier-cover": "bella-classic",
  "noir-columns": "bella-classic",
  "tasting-chapters": "bella-classic",
  "gallery-plates": "bella-classic",
  "menu-paper": "bella-classic",
  "izakaya-night": "bella-classic",
  "speakeasy-book": "bella-classic",
  "midnight-table": "bella-classic",
};

export function remapLegacyTemplateId(id: string | null | undefined): string {
  const raw = String(id || "").trim();
  if (!raw) return DEFAULT_SKIN_ID;
  if (SKIN_IDS.includes(raw)) return raw;
  if (LEGACY[raw]) return LEGACY[raw];
  if (/^luxury-\d{2}$/.test(raw)) return "bella-classic";
  if (/^minimal-\d{2}$/.test(raw)) return "bella-classic";
  if (/^fast-food-\d{2}$/.test(raw)) return "fastfood-pro";
  if (/^cafe-\d{2}$/.test(raw)) return "ocean-modern";
  if (/^modern-\d{2}$/.test(raw)) return "bella-classic";
  return DEFAULT_SKIN_ID;
}
