import type { MenuTemplateDef } from "./types";

const SMARTWEB_HERO =
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80&auto=format&fit=crop";

/** AKIDO Sushi tərzi — qara menyu, 3 mərhələli sifariş (Səbət → Əlaqə → Çatdırılma). */
export const SMARTWEB_MENU_TEMPLATE: MenuTemplateDef = {
  id: "smartweb",
  name: "SmartWeb",
  category: "Mega",
  description: "smartweb · qaranlıq menyu · 3 mərhələli sifariş",
  heroImage: SMARTWEB_HERO,
  theme: {
    fontPair: "montserrat-inter",
    headingWeight: "font-bold",
    radius: "xl",
    cardStyle: "flat",
    heroVariant: "fullscreen",
    categoryNav: "scroll",
    density: "compact",
    showFab: false,
    showBottomNav: false,
    overlayPercent: 45,
    productImageRadius: "lg",
    heroPattern: "none",
    headerLayout: "full-hero",
    productLayout: "grid",
    iconStyle: "filled",
    renderMode: "smartweb",
    primary: "#E12B30",
    secondary: "#1a1a1a",
    accent: "#E12B30",
    background: "#000000",
    surface: "#111111",
    text: "#ffffff",
    muted: "#9ca3af",
    customFonts: {
      heading: "'Inter', ui-sans-serif, system-ui, sans-serif",
      body: "'Inter', ui-sans-serif, system-ui, sans-serif",
    },
  },
};
