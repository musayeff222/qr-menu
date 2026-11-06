export const SKIN_IDS = [
  "bistro-rail",
  "bistro-split",
  "bistro-ledger",
  "bistro-market",
  "bistro-counter",
  "atelier-cover",
  "noir-columns",
  "tasting-chapters",
  "gallery-plates",
  "menu-paper",
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
  "izakaya-night",
  "neon-snap",
  "lounge-glass",
  "speakeasy-book",
  "midnight-table",
  "street-market",
  "street-zine",
  "street-filmstrip",
  "street-map",
  "street-tickets",
] as const;

export type SkinId = (typeof SKIN_IDS)[number];

/** 30 skins × 7 viewports = 210 screenshots, plus fullPage at 375/1280 */
export const VIEWPORTS = [
  { id: "320", width: 320, height: 680 },
  { id: "375", width: 375, height: 812 },
  { id: "390", width: 390, height: 844 },
  { id: "430", width: 430, height: 932 },
  { id: "768", width: 768, height: 1024 },
  { id: "1280", width: 1280, height: 860 },
  { id: "1440", width: 1440, height: 900 },
] as const;

export const DEMO_SLUG = "demo-az-menu";
export const BASE_URL = process.env.QA_BASE_URL || "http://127.0.0.1:3010";
