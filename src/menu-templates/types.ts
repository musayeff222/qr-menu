export type TemplateCategory =
  | "Modern"
  | "Luxury"
  | "Minimal"
  | "Fast Food"
  | "Cafe";

export type CategoryNavStyle = "pills" | "tabs" | "underline" | "scroll";
export type CardStyle = "flat" | "elevated" | "bordered" | "glass";
export type HeroVariant = "fullscreen" | "compact" | "split" | "wave";
export type Density = "compact" | "comfortable" | "spacious";
export type FontPairKey =
  | "space-dm"
  | "playfair-dm"
  | "bebas-nunito"
  | "merriweather-lato"
  | "montserrat-inter"
  | "raleway-open"
  | "lora-source"
  | "oswald-roboto"
  | "cormorant-work"
  | "syne-manrope";

export interface MenuTemplateTheme {
  fontPair: FontPairKey;
  headingWeight: "font-light" | "font-normal" | "font-semibold" | "font-bold" | "font-black";
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  radius: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  cardStyle: CardStyle;
  heroVariant: HeroVariant;
  categoryNav: CategoryNavStyle;
  density: Density;
  showFab: boolean;
  showBottomNav: boolean;
  overlayPercent: number;
  productImageRadius: "sm" | "md" | "lg" | "xl" | "2xl";
  heroPattern: "none" | "dots" | "grid" | "noise";
}

export interface MenuTemplateDef {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  heroImage: string;
  theme: MenuTemplateTheme;
}
