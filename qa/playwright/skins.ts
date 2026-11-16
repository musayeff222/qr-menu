export const SKIN_IDS = ["fastfood-pro", "ocean-modern", "bella-classic"] as const;

export type SkinId = (typeof SKIN_IDS)[number];

/** 3 skins × 8 viewports */
export const VIEWPORTS = [
  { id: "320", width: 320, height: 680 },
  { id: "375", width: 375, height: 812 },
  { id: "390", width: 390, height: 844 },
  { id: "430", width: 430, height: 932 },
  { id: "768", width: 768, height: 1024 },
  { id: "1024", width: 1024, height: 768 },
  { id: "1280", width: 1280, height: 860 },
  { id: "1440", width: 1440, height: 900 },
] as const;

export const DEMO_SLUG = "demo-az-menu";
export const BASE_URL = process.env.QA_BASE_URL || "http://127.0.0.1:3010";
