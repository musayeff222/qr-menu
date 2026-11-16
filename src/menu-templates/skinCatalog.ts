import { ensureAaTokens, type SkinColorTokens } from "./theme/tokens";

export type SkinFamily = "Bistro" | "Fine dining" | "Cafe" | "QSR" | "Night" | "Street";

export type SkinMeta = {
  id: string;
  name: string;
  family: SkinFamily;
  premium: boolean;
  summary: string;
  header: string;
  navigation: string;
  productCards: string;
  detail: string;
  cart: string;
  page: string;
  cover: string;
  defaults: SkinColorTokens;
};

const COVERS = {
  fastfood: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=1400&q=80&auto=format&fit=crop",
  ocean: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&q=80&auto=format&fit=crop",
  bella: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80&auto=format&fit=crop",
};

function pal(
  primary: string,
  secondary: string,
  background: string,
  text: string,
  extra?: Partial<SkinColorTokens>
): SkinColorTokens {
  const darkBg = background.toLowerCase() < "#666666";
  return ensureAaTokens({
    primary,
    secondary,
    accent: extra?.accent || secondary,
    background,
    surface: extra?.surface || (darkBg ? "#1c1f24" : "#ffffff"),
    text,
    muted: extra?.muted || (darkBg ? "#9aa3ad" : "#66756f"),
  });
}

export const SKIN_CATALOG: SkinMeta[] = [
  {
    id: "fastfood-pro",
    name: "FastFood Pro",
    family: "QSR",
    premium: false,
    summary: "Burger, pizza və döner üçün enerjili, sürətli sifariş menyusu.",
    header: "cover banner, overlapping logo, View Menu CTA and contact card",
    navigation: "sticky underline category tabs plus featured scroller",
    productCards: "list rows with large photo on the right and price plus add",
    detail: "bottom sheet with photo",
    cart: "full-width sticky bottom dock",
    page: "landing then filtered list",
    cover: COVERS.fastfood,
    defaults: pal("#111111", "#FFD000", "#F3F4F6", "#111111", {
      accent: "#E10600",
      surface: "#FFFFFF",
      muted: "#5C5C66",
    }),
  },
  {
    id: "ocean-modern",
    name: "Ocean Modern",
    family: "Cafe",
    premium: false,
    summary: "Restoran və kafeler üçün ferah, müasir 2 sütunlu menyu.",
    header: "full-bleed cinematic hero with serif title and info",
    navigation: "sticky search plus jump-to category select",
    productCards: "two-column photo-top cards with discount badges",
    detail: "centered product sheet",
    cart: "floating corner pill",
    page: "scroll-all grouped sections",
    cover: COVERS.ocean,
    defaults: pal("#2F6F8F", "#D5E7F0", "#F3F7FA", "#1B2A33", {
      accent: "#2F9E96",
      surface: "#FFFFFF",
      muted: "#5B6E78",
    }),
  },
  {
    id: "bella-classic",
    name: "Bella Classic",
    family: "Bistro",
    premium: false,
    summary: "Ailə restoranları üçün klassik, oxunaqlı kağız menyu.",
    header: "centered serif wordmark on cream paper",
    navigation: "desktop left table-of-contents, mobile text index",
    productCards: "single-column photo-left rows with dotted price leaders",
    detail: "inline description unfold",
    cart: "centered receipt overlay",
    page: "printed menu sheet",
    cover: COVERS.bella,
    defaults: pal("#6B3A2A", "#E8D5B5", "#F7F1E6", "#2A2118", {
      accent: "#C4A574",
      surface: "#FFFBF4",
      muted: "#7A6A58",
    }),
  },
];

if (SKIN_CATALOG.length !== 3) {
  throw new Error(`skinCatalog expected 3, got ${SKIN_CATALOG.length}`);
}

export const SKIN_IDS = SKIN_CATALOG.map((s) => s.id);
export const DEFAULT_SKIN_ID = "bella-classic";
export const PREMIUM_SKIN_IDS = SKIN_CATALOG.filter((s) => s.premium).map((s) => s.id);

export const SKIN_POLICY_ORDER: string[] = SKIN_CATALOG.map((s) => s.id);

export function getSkinMeta(id: string | null | undefined): SkinMeta {
  return SKIN_CATALOG.find((s) => s.id === id) || SKIN_CATALOG.find((s) => s.id === DEFAULT_SKIN_ID) || SKIN_CATALOG[0]!;
}
