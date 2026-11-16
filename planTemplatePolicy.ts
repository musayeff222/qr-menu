/** Free max_templates=10 covers all 3. None are premium-gated. */
export const MENU_TEMPLATE_IDS_ORDERED: string[] = [
  "bella-classic",
  "ocean-modern",
  "fastfood-pro",
];

const PREMIUM = new Set<string>([]);

export const EXTRA_TEMPLATE_IDS = [] as const;

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

function remap(id: string): string {
  const raw = String(id || "").trim();
  if (!raw) return "bella-classic";
  if (MENU_TEMPLATE_IDS_ORDERED.includes(raw)) return raw;
  if (LEGACY[raw]) return LEGACY[raw];
  if (/^luxury-\d{2}$/.test(raw)) return "bella-classic";
  if (/^minimal-\d{2}$/.test(raw)) return "bella-classic";
  if (/^fast-food-\d{2}$/.test(raw)) return "fastfood-pro";
  if (/^cafe-\d{2}$/.test(raw)) return "ocean-modern";
  if (/^modern-\d{2}$/.test(raw)) return "bella-classic";
  return "bella-classic";
}

export function templateIndex(templateId: string): number {
  return MENU_TEMPLATE_IDS_ORDERED.indexOf(remap(templateId));
}

/** maxTemplates: -1 = limitsiz. */
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
