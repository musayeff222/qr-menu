import { ensureAaTokens, type SkinColorTokens } from "./theme/tokens";

export type SkinFamily = "Bistro" | "Fine dining" | "Cafe" | "QSR" | "Night" | "Street";

export type SkinMeta = {
  id: string;
  name: string;
  family: SkinFamily;
  premium: boolean;
  header: string;
  navigation: string;
  productCards: string;
  detail: string;
  cart: string;
  page: string;
  cover: string;
  defaults: SkinColorTokens;
};

const COVERS = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1476224203411-9f585f6ec80f?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528605105345-5344ea20e61d?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544148103-0771bf50d2ab?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559339352-56e07322d453?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544025162-dab5424da621?w=1200&q=80&auto=format&fit=crop",
];

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
  { id: "bistro-rail", name: "Bistro Rail", family: "Bistro", premium: false, header: "sticky wordmark + reservation strip", navigation: "left vertical alphabet rail", productCards: "horizontal dish rows", detail: "inline row unfold", cart: "floating circle bag", page: "rail + canvas", cover: COVERS[0], defaults: pal("#167D74", "#F5B85C", "#F6F4EF", "#17322F") },
  { id: "bistro-split", name: "Bistro Split", family: "Bistro", premium: false, header: "half-screen photo badge", navigation: "segmented underline", productCards: "alternating photo cards", detail: "side drawer", cart: "sticky footer summary", page: "split cover + grid", cover: COVERS[1], defaults: pal("#C05A39", "#E7AC62", "#FFF9F1", "#28221F") },
  { id: "bistro-ledger", name: "Bistro Ledger", family: "Bistro", premium: false, header: "receipt dotted rules", navigation: "accordion headings", productCards: "numbered price list", detail: "inline variant chips", cart: "receipt bag tab", page: "price ledger", cover: COVERS[2], defaults: pal("#7B583A", "#E4B877", "#FBF7EC", "#2D231C") },
  { id: "bistro-market", name: "Bistro Market", family: "Bistro", premium: false, header: "asymmetric mosaic", navigation: "square photo wall", productCards: "masonry produce cards", detail: "full page dish", cart: "side sliding drawer", page: "mosaic + masonry", cover: COVERS[3], defaults: pal("#20725E", "#F0A845", "#F4F6EC", "#1D332E") },
  { id: "bistro-counter", name: "Bistro Counter", family: "Bistro", premium: false, header: "deli ticker", navigation: "numbered steps", productCards: "compact tiles large +", detail: "tiny popover", cart: "inline cart chip", page: "dense counter grid", cover: COVERS[4], defaults: pal("#E45E37", "#F3CA64", "#FAFAF6", "#2E2722") },
  { id: "atelier-cover", name: "Atelier Cover", family: "Fine dining", premium: true, header: "full-viewport serif cover", navigation: "floating anchors", productCards: "full-width plate stories", detail: "editorial full page", cart: "upper monogram bag", page: "cinematic scroll", cover: COVERS[5], defaults: pal("#8D8B66", "#D6C49A", "#181A18", "#F7F2E7", { surface: "#222422", muted: "#a8a48c" }) },
  { id: "noir-columns", name: "Noir Columns", family: "Fine dining", premium: true, header: "centered monogram border", navigation: "vertical chapter index", productCards: "alternating columns", detail: "left slide-over", cart: "right sheet bag", page: "dual columns", cover: COVERS[6], defaults: pal("#AA886B", "#B9A68C", "#181A1A", "#EFE9DD", { surface: "#222424", muted: "#b0a898" }) },
  { id: "tasting-chapters", name: "Tasting Chapters", family: "Fine dining", premium: true, header: "chapter title card", navigation: "numbered mini index", productCards: "course panel + list", detail: "expand course inline", cart: "bottom tasting summary", page: "chaptered sections", cover: COVERS[7], defaults: pal("#826648", "#D7B87B", "#F4F0E5", "#2A2521") },
  { id: "gallery-plates", name: "Gallery Plates", family: "Fine dining", premium: true, header: "photography ribbon", navigation: "thumbnail strip", productCards: "asymmetrical gallery", detail: "lightbox sheet", cart: "gallery rail bag", page: "image mosaic", cover: COVERS[8], defaults: pal("#5A7061", "#BDA68A", "#F6F4EE", "#29342D") },
  { id: "menu-paper", name: "Menu Paper", family: "Fine dining", premium: true, header: "letterpress heading", navigation: "text section index", productCards: "dotted-leader lines", detail: "under-line reveal", cart: "folded paper receipt", page: "narrow printed sheet", cover: COVERS[9], defaults: pal("#85724E", "#E5D7B7", "#F7F2E4", "#322C25") },
  { id: "cafe-homestead", name: "Café Homestead", family: "Cafe", premium: false, header: "hand-lettered collage", navigation: "soft rounded tabs", productCards: "plush bakery tiles", detail: "rounded bottom sheet", cart: "floating purchase pill", page: "warm home grid", cover: COVERS[10], defaults: pal("#9E6651", "#F7C791", "#FBF5EE", "#3F2C2A") },
  { id: "patisserie-sheets", name: "Patisserie Sheets", family: "Cafe", premium: false, header: "stacked pastel sheets", navigation: "mini filter chips", productCards: "full-bleed pastry photos", detail: "paper bottom sheet", cart: "pastel ribbon bag", page: "portrait sheets", cover: COVERS[11], defaults: pal("#B76E85", "#E5BE8C", "#FFF7F5", "#422C39") },
  { id: "roastery-journal", name: "Roastery Journal", family: "Cafe", premium: false, header: "magazine masthead", navigation: "table of contents", productCards: "story + compact items", detail: "inline prose reveal", cart: "bookmark bag", page: "editorial columns", cover: COVERS[12], defaults: pal("#6F4D3B", "#D0A87C", "#F1E9DF", "#31271E") },
  { id: "cafe-polaroid", name: "Café Polaroid", family: "Cafe", premium: false, header: "overlapping prints", navigation: "circular story icons", productCards: "rotated mini-photos", detail: "flip-front sheet", cart: "mini tray", page: "playful collage", cover: COVERS[13], defaults: pal("#48877C", "#EFCDAD", "#FFF9EF", "#3F3833") },
  { id: "cafe-calendar", name: "Café Calendar", family: "Cafe", premium: false, header: "daily-special badge", navigation: "weekday ribbon", productCards: "timeline rows", detail: "side modal", cart: "day-order dock", page: "chronological timeline", cover: COVERS[14], defaults: pal("#8C7959", "#D9B879", "#FBF8EA", "#383229") },
  { id: "quick-kiosk", name: "Quick Kiosk", family: "QSR", premium: false, header: "oversized headline", navigation: "giant category tiles", productCards: "large tap squares", detail: "giant option sheet", cart: "full-width bottom dock", page: "big-button kiosk", cover: COVERS[15], defaults: pal("#E75C2B", "#FFCC3B", "#FFF6E9", "#34251F") },
  { id: "speed-lane", name: "Speed Lane", family: "QSR", premium: false, header: "search-first compact", navigation: "left chip rail", productCards: "dense list + add", detail: "short bottom sheet", cart: "sticky subtotal", page: "one-hand lane", cover: COVERS[16], defaults: pal("#036D62", "#B5E275", "#EFF8F2", "#11312E") },
  { id: "build-a-meal", name: "Build a Meal", family: "QSR", premium: false, header: "progress wizard", navigation: "meal-stage selector", productCards: "combo component cards", detail: "configurator sheet", cart: "step-progress overview", page: "step-by-step", cover: COVERS[17], defaults: pal("#E27B3F", "#F8D57F", "#FFF9EE", "#352820") },
  { id: "pizza-slices", name: "Pizza Slices", family: "QSR", premium: false, header: "circular pizza badge", navigation: "swipe carousel", productCards: "round artwork + price", detail: "inline size chips", cart: "floating checkout pill", page: "radial reel", cover: COVERS[18], defaults: pal("#BA403A", "#F6C95C", "#FCF5E9", "#3B2721") },
  { id: "burger-stack", name: "Burger Stack", family: "QSR", premium: false, header: "layered stacked title", navigation: "compressed tabs", productCards: "overlap image panels", detail: "slide-up details", cart: "segmented shelf", page: "overlapping cards", cover: COVERS[19], defaults: pal("#D3572F", "#EBC15A", "#191F1E", "#FFF6DE", { surface: "#242c2a", muted: "#c4b89a" }) },
  { id: "izakaya-night", name: "Izakaya Night", family: "Night", premium: true, header: "dark signboard", navigation: "thin side index", productCards: "dark split plates", detail: "side option panel", cart: "hanging badge", page: "vertical night rail", cover: COVERS[20], defaults: pal("#C65E46", "#D5B66D", "#181B21", "#F5EFE3", { surface: "#22262e", muted: "#b8b0a0" }) },
  { id: "neon-snap", name: "Neon Snap", family: "Night", premium: true, header: "full-bleed overlay type", navigation: "edge progress dots", productCards: "full-screen product panels", detail: "modal over slide", cart: "translucent tray", page: "snap scrolling", cover: COVERS[21], defaults: pal("#A6F46D", "#C9A1FF", "#14151D", "#F0F6F2", { surface: "#1c1d28", muted: "#9aa8a0" }) },
  { id: "lounge-glass", name: "Lounge Glass", family: "Night", premium: true, header: "frosted cover card", navigation: "floating glass tabs", productCards: "transparent panes", detail: "in-card glass expand", cart: "translucent rail", page: "blurred layers", cover: COVERS[22], defaults: pal("#9BB8C8", "#B0AED6", "#1B2630", "#F1F6F8", { surface: "#243340", muted: "#a8b8c0" }) },
  { id: "speakeasy-book", name: "Speakeasy Book", family: "Night", premium: true, header: "embossed book cover", navigation: "chapter swipe index", productCards: "two-page spread", detail: "book-page inline", cart: "corner folded bag", page: "paper book", cover: COVERS[23], defaults: pal("#B99068", "#D5BD94", "#262321", "#EEE3D1", { surface: "#322e2b", muted: "#c4b8a4" }) },
  { id: "midnight-table", name: "Midnight Table", family: "Night", premium: true, header: "circular spotlight", navigation: "radial category wheel", productCards: "staggered silhouettes", detail: "curved bottom sheet", cart: "icon-only dock", page: "dark tabletop", cover: COVERS[24], defaults: pal("#77B8AE", "#F7B96B", "#121D21", "#E8F1EC", { surface: "#1a2a30", muted: "#8aada4" }) },
  { id: "street-market", name: "Street Market", family: "Street", premium: false, header: "produce stand banner", navigation: "market sign tiles", productCards: "masonry stall cards", detail: "inline fast add", cart: "left slide cart", page: "stall mosaic", cover: COVERS[25], defaults: pal("#237D5E", "#E0A23D", "#F9F1DA", "#252D23") },
  { id: "street-zine", name: "Street Zine", family: "Street", premium: false, header: "bold poster stamps", navigation: "label marquee", productCards: "sticker cutouts", detail: "comic popover", cart: "ticket footer", page: "poster collage", cover: COVERS[26], defaults: pal("#E54C3D", "#F7D050", "#FFF8E9", "#272324") },
  { id: "street-filmstrip", name: "Street Filmstrip", family: "Street", premium: false, header: "film-strip track", navigation: "horizontal reel", productCards: "wide product strips", detail: "expanding reel window", cart: "bottom cart reel", page: "horizontal reels", cover: COVERS[27], defaults: pal("#A55B39", "#E1B878", "#191C20", "#F1EFEA", { surface: "#242830", muted: "#b8b0a4" }) },
  { id: "street-map", name: "Street Map", family: "Street", premium: false, header: "neighborhood route cover", navigation: "numbered route stops", productCards: "pin-card landmarks", detail: "map card sheet", cart: "floating corner bag", page: "itinerary map", cover: COVERS[28], defaults: pal("#327A92", "#E8B963", "#F4F7F4", "#23353C") },
  { id: "street-tickets", name: "Street Tickets", family: "Street", premium: false, header: "perforated receipt banner", navigation: "huge numbered tabs", productCards: "perforated tickets", detail: "ticket unfold", cart: "receipt drawer", page: "ticket strip", cover: COVERS[29], defaults: pal("#BE593F", "#E9B65E", "#F8F3E7", "#392E26") },
];

if (SKIN_CATALOG.length !== 30) {
  throw new Error(`skinCatalog expected 30, got ${SKIN_CATALOG.length}`);
}

export const SKIN_IDS = SKIN_CATALOG.map((s) => s.id);
export const DEFAULT_SKIN_ID = "bistro-rail";
export const PREMIUM_SKIN_IDS = SKIN_CATALOG.filter((s) => s.premium).map((s) => s.id);

/** Policy order: non-premium first so Free=10 still has 10 usable skins. */
export const SKIN_POLICY_ORDER: string[] = [
  ...SKIN_CATALOG.filter((s) => !s.premium).map((s) => s.id),
  ...SKIN_CATALOG.filter((s) => s.premium).map((s) => s.id),
];

export function getSkinMeta(id: string | null | undefined): SkinMeta {
  return SKIN_CATALOG.find((s) => s.id === id) || SKIN_CATALOG[0]!;
}
