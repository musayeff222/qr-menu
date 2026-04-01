import type {
  MenuTemplateDef,
  MenuTemplateTheme,
  TemplateCategory,
  FontPairKey,
  HeaderLayout,
  ProductLayout,
  IconStyle,
} from "./types";

const HEADER_LAYOUTS: HeaderLayout[] = ["centered", "full-hero", "split", "side"];
const PRODUCT_LAYOUTS: ProductLayout[] = ["grid", "list", "card", "slider"];
const ICON_STYLES: IconStyle[] = ["rounded", "line", "filled", "minimal"];

const HERO_POOL = [
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
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1528605105345-5344ea20e61d?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544148103-0771bf50d2ab?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559339352-56e07322d453?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1200&q=80&auto=format&fit=crop",
];

const FONT_PAIRS: FontPairKey[] = [
  "space-dm",
  "playfair-dm",
  "bebas-nunito",
  "merriweather-lato",
  "montserrat-inter",
  "raleway-open",
  "lora-source",
  "oswald-roboto",
  "cormorant-work",
  "syne-manrope",
];

const NAV = ["pills", "tabs", "underline", "scroll"] as const;
const CARDS = ["flat", "elevated", "bordered", "glass"] as const;
const HERO = ["fullscreen", "compact", "split", "wave"] as const;
const DENSITY = ["compact", "comfortable", "spacious"] as const;
const RADII = ["sm", "md", "lg", "xl", "2xl"] as const;
const IMG_R = ["sm", "md", "lg", "xl", "2xl"] as const;
const WEIGHTS = [
  "font-light",
  "font-normal",
  "font-semibold",
  "font-bold",
  "font-black",
] as const;
const PATTERN = ["none", "dots", "grid", "noise"] as const;

function hsl(h: number, s: number, l: number) {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

function themeModern(i: number, global: number): MenuTemplateTheme {
  const h = (200 + i * 11 + global * 3) % 360;
  return {
    fontPair: FONT_PAIRS[i % FONT_PAIRS.length],
    headingWeight: WEIGHTS[(i + 1) % WEIGHTS.length],
    primary: hsl(h, 78, 48),
    secondary: hsl((h + 40) % 360, 45, 92),
    accent: hsl((h + 180) % 360, 70, 45),
    background: hsl(h, 25, 97),
    surface: "#ffffff",
    text: hsl(h, 35, 12),
    muted: hsl(h, 12, 45),
    radius: RADII[i % RADII.length],
    cardStyle: CARDS[(i + global) % CARDS.length],
    heroVariant: HERO[i % HERO.length],
    categoryNav: NAV[(i + 2) % NAV.length],
    density: DENSITY[i % DENSITY.length],
    showFab: i % 3 !== 0,
    showBottomNav: i % 4 === 0,
    overlayPercent: 35 + (i % 5) * 8,
    productImageRadius: IMG_R[(i + 3) % IMG_R.length],
    heroPattern: PATTERN[i % PATTERN.length],
  };
}

function themeLuxury(i: number, global: number): MenuTemplateTheme {
  const goldL = 44 + (i % 5) * 2;
  return {
    fontPair: FONT_PAIRS[(i + 3) % FONT_PAIRS.length],
    headingWeight: "font-light",
    primary: hsl(43, 72, goldL),
    secondary: hsl(43, 30, 22),
    accent: hsl(38, 80, 55),
    background: hsl(0, 0, 5 + (i % 3)),
    surface: hsl(0, 0, 10 + (i % 4) * 2),
    text: hsl(40, 20, 96),
    muted: hsl(40, 8, 65),
    radius: RADII[(i + 1) % RADII.length],
    cardStyle: CARDS[(i + global + 1) % CARDS.length],
    heroVariant: HERO[(i + 1) % HERO.length],
    categoryNav: NAV[(i + 1) % NAV.length],
    density: DENSITY[(i + 1) % DENSITY.length],
    showFab: true,
    showBottomNav: i % 3 === 0,
    overlayPercent: 55 + (i % 4) * 5,
    productImageRadius: IMG_R[i % IMG_R.length],
    heroPattern: PATTERN[(i + 2) % PATTERN.length],
  };
}

function themeMinimal(i: number, global: number): MenuTemplateTheme {
  const tint = (i * 17 + global) % 40;
  return {
    fontPair: FONT_PAIRS[(i + 5) % FONT_PAIRS.length],
    headingWeight: "font-semibold",
    primary: hsl(0, 0, 18 + (i % 8)),
    secondary: hsl(0, 0, 88 - tint / 2),
    accent: hsl(210, 15, 42 + (i % 6)),
    background: hsl(0, 0, 99 - (i % 2)),
    surface: "#ffffff",
    text: hsl(0, 0, 12),
    muted: hsl(0, 0, 48),
    radius: i % 2 === 0 ? "none" : "md",
    cardStyle: CARDS[(i + 2) % CARDS.length],
    heroVariant: HERO[(i + 2) % HERO.length],
    categoryNav: NAV[(i + 3) % NAV.length],
    density: DENSITY[i % DENSITY.length],
    showFab: i % 2 === 0,
    showBottomNav: false,
    overlayPercent: 25 + (i % 3) * 10,
    productImageRadius: i % 2 === 0 ? "sm" : "lg",
    heroPattern: PATTERN[i % PATTERN.length],
  };
}

function themeFastFood(i: number, global: number): MenuTemplateTheme {
  const hue = [0, 15, 340, 28, 48][i % 5];
  return {
    fontPair: FONT_PAIRS[(i + 2) % FONT_PAIRS.length],
    headingWeight: "font-black",
    primary: hsl(hue, 88, 48 + (i % 3) * 3),
    secondary: hsl((hue + 50) % 360, 95, 55),
    accent: hsl((hue + 200) % 360, 80, 42),
    background: hsl(hue, 40, 96),
    surface: "#ffffff",
    text: hsl(hue, 60, 14),
    muted: hsl(hue, 25, 38),
    radius: "lg",
    cardStyle: CARDS[(i + global + 2) % CARDS.length],
    heroVariant: HERO[i % HERO.length],
    categoryNav: NAV[i % NAV.length],
    density: "comfortable",
    showFab: true,
    showBottomNav: i % 2 === 0,
    overlayPercent: 30 + (i % 5) * 6,
    productImageRadius: "xl",
    heroPattern: PATTERN[(i + 1) % PATTERN.length],
  };
}

function themeCafe(i: number, global: number): MenuTemplateTheme {
  const h = 28 + (i % 8) * 3;
  return {
    fontPair: FONT_PAIRS[(i + 7) % FONT_PAIRS.length],
    headingWeight: WEIGHTS[i % WEIGHTS.length],
    primary: hsl(h, 35, 28 + (i % 4) * 2),
    secondary: hsl(h, 25, 88),
    accent: hsl((h + 320) % 360, 45, 42),
    background: hsl(h, 45, 94 - (i % 3)),
    surface: hsl(h, 35, 99),
    text: hsl(h, 40, 16),
    muted: hsl(h, 18, 42),
    radius: RADII[(i + 2) % RADII.length],
    cardStyle: CARDS[(i + 1) % CARDS.length],
    heroVariant: HERO[(i + 3) % HERO.length],
    categoryNav: NAV[(i + global) % NAV.length],
    density: DENSITY[(i + 2) % DENSITY.length],
    showFab: i % 3 !== 1,
    showBottomNav: i % 5 === 0,
    overlayPercent: 40 + (i % 4) * 7,
    productImageRadius: IMG_R[(i + 1) % IMG_R.length],
    heroPattern: PATTERN[(i + 3) % PATTERN.length],
  };
}

const GROUPS: {
  category: TemplateCategory;
  prefix: string;
  build: (i: number, g: number) => MenuTemplateTheme;
}[] = [
  { category: "Modern", prefix: "modern", build: themeModern },
  { category: "Luxury", prefix: "luxury", build: themeLuxury },
  { category: "Minimal", prefix: "minimal", build: themeMinimal },
  { category: "Fast Food", prefix: "fast-food", build: themeFastFood },
  { category: "Cafe", prefix: "cafe", build: themeCafe },
];

function buildTemplates(): MenuTemplateDef[] {
  const out: MenuTemplateDef[] = [];
  let globalIdx = 0;
  for (const g of GROUPS) {
    for (let i = 0; i < 10; i++) {
      const n = i + 1;
      const id = `${g.prefix}-${String(n).padStart(2, "0")}`;
      const themeBase = g.build(i, globalIdx);
      const headerLayout = HEADER_LAYOUTS[globalIdx % HEADER_LAYOUTS.length];
      const productLayout = PRODUCT_LAYOUTS[(globalIdx * 2 + i * 3) % PRODUCT_LAYOUTS.length];
      const iconStyle = ICON_STYLES[(globalIdx + i * 5) % ICON_STYLES.length];
      const theme: MenuTemplateTheme = {
        ...themeBase,
        headerLayout,
        productLayout,
        iconStyle,
      };
      out.push({
        id,
        name: `${g.category} ${String.fromCharCode(65 + i)}`,
        category: g.category,
        description: `${headerLayout} · ${productLayout} · ${theme.heroVariant} · ${theme.fontPair}`,
        heroImage: HERO_POOL[(globalIdx + i * 7) % HERO_POOL.length],
        theme,
      });
      globalIdx++;
    }
  }
  return out;
}

export const MENU_TEMPLATES: MenuTemplateDef[] = buildTemplates();

/** Exactly 50 templates: 10 × 5 style families */
export const MENU_TEMPLATE_COUNT = 50;
if (MENU_TEMPLATES.length !== MENU_TEMPLATE_COUNT) {
  console.warn(
    `[menu-templates] expected ${MENU_TEMPLATE_COUNT} templates, got ${MENU_TEMPLATES.length}`
  );
}

export const DEFAULT_TEMPLATE_ID = "modern-01";

export function getTemplateById(id: string | null | undefined): MenuTemplateDef {
  const found = MENU_TEMPLATES.find((t) => t.id === id);
  return found ?? MENU_TEMPLATES[0];
}

export function templatesByCategory(): Record<TemplateCategory, MenuTemplateDef[]> {
  const acc = {} as Record<TemplateCategory, MenuTemplateDef[]>;
  for (const t of MENU_TEMPLATES) {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
  }
  return acc;
}
