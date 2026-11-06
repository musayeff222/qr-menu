/** Plan limit sırası — Free 10 = 5 Bistro + 5 Cafe. Premium = Fine dining + Night. */
export const MENU_TEMPLATE_IDS_ORDERED: string[] = [
  "bistro-rail",
  "bistro-split",
  "bistro-ledger",
  "bistro-market",
  "bistro-counter",
  "cafe-homestead",
  "patisserie-sheets",
  "roastery-journal",
  "cafe-polaroid",
  "cafe-calendar",
  "quick-kiosk",
  "speed-lane",
  "build-a-meal",
  "pizza-slices",
  "burger-stack",
  "street-market",
  "street-zine",
  "street-filmstrip",
  "street-map",
  "street-tickets",
  "atelier-cover",
  "noir-columns",
  "tasting-chapters",
  "gallery-plates",
  "menu-paper",
  "izakaya-night",
  "neon-snap",
  "lounge-glass",
  "speakeasy-book",
  "midnight-table",
];

const PREMIUM = new Set([
  "atelier-cover",
  "noir-columns",
  "tasting-chapters",
  "gallery-plates",
  "menu-paper",
  "izakaya-night",
  "neon-snap",
  "lounge-glass",
  "speakeasy-book",
  "midnight-table",
]);

export const EXTRA_TEMPLATE_IDS = [] as const;

function remap(id: string): string {
  const raw = String(id || "").trim();
  if (MENU_TEMPLATE_IDS_ORDERED.includes(raw)) return raw;
  if (raw === "smartweb") return "quick-kiosk";
  if (/^luxury-\d{2}$/.test(raw)) return "atelier-cover";
  if (/^minimal-\d{2}$/.test(raw)) return "menu-paper";
  if (/^fast-food-\d{2}$/.test(raw)) return "quick-kiosk";
  if (/^cafe-\d{2}$/.test(raw)) return "cafe-homestead";
  if (/^modern-\d{2}$/.test(raw)) return "bistro-rail";
  return "bistro-rail";
}

export function templateIndex(templateId: string): number {
  return MENU_TEMPLATE_IDS_ORDERED.indexOf(remap(templateId));
}

/** maxTemplates: -1 = limitsiz. premiumTemplates: Fine dining + Night */
export function templateSelectionError(
  templateId: string,
  maxTemplates: number,
  premiumTemplatesEnabled: boolean
): string | null {
  if (!templateId) return "Boş şablon";
  const id = remap(templateId);
  if ((EXTRA_TEMPLATE_IDS as readonly string[]).includes(id)) return null;
  if (!premiumTemplatesEnabled && PREMIUM.has(id)) {
    return "Bu plan Premium şablonları dəstəkləmir";
  }
  if (maxTemplates < 0) return null;
  const idx = templateIndex(id);
  if (idx < 0) return "Naməlum şablon";
  if (idx >= maxTemplates) {
    return `Plan yalnız ilk ${maxTemplates} şablona icazə verir`;
  }
  return null;
}
