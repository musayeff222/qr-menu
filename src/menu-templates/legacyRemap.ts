import { DEFAULT_SKIN_ID, SKIN_IDS } from "./skinCatalog";

const LEGACY: Record<string, string> = {
  smartweb: "quick-kiosk",
};

export function remapLegacyTemplateId(id: string | null | undefined): string {
  const raw = String(id || "").trim();
  if (!raw) return DEFAULT_SKIN_ID;
  if (SKIN_IDS.includes(raw)) return raw;
  if (LEGACY[raw]) return LEGACY[raw];
  if (/^luxury-\d{2}$/.test(raw)) return "atelier-cover";
  if (/^minimal-\d{2}$/.test(raw)) return "menu-paper";
  if (/^fast-food-\d{2}$/.test(raw)) return "quick-kiosk";
  if (/^cafe-\d{2}$/.test(raw)) return "cafe-homestead";
  if (/^modern-\d{2}$/.test(raw)) return "bistro-rail";
  return DEFAULT_SKIN_ID;
}
