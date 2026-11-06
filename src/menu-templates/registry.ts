import type { MenuTemplateDef, TemplateCategory } from "./types";
import { remapLegacyTemplateId } from "./legacyRemap";
import { DEFAULT_SKIN_ID, SKIN_CATALOG, type SkinMeta } from "./skinCatalog";

function skinToTemplate(meta: SkinMeta): MenuTemplateDef {
  return {
    id: meta.id,
    name: meta.name,
    category: meta.family as TemplateCategory,
    description: `${meta.header} · ${meta.navigation} · ${meta.productCards}`,
    heroImage: meta.cover,
    theme: {
      fontPair: "space-dm",
      headingWeight: "font-bold",
      primary: meta.defaults.primary,
      secondary: meta.defaults.secondary,
      accent: meta.defaults.accent,
      background: meta.defaults.background,
      surface: meta.defaults.surface,
      text: meta.defaults.text,
      muted: meta.defaults.muted,
      radius: "lg",
      cardStyle: "elevated",
      heroVariant: "compact",
      categoryNav: "pills",
      density: "comfortable",
      showFab: true,
      showBottomNav: false,
      overlayPercent: 40,
      productImageRadius: "lg",
      heroPattern: "none",
      renderMode: meta.id,
    },
  };
}

export const MENU_TEMPLATES: MenuTemplateDef[] = SKIN_CATALOG.map(skinToTemplate);

export const MENU_TEMPLATE_COUNT = MENU_TEMPLATES.length;
export const DEFAULT_TEMPLATE_ID = DEFAULT_SKIN_ID;

export function getTemplateById(id: string | null | undefined): MenuTemplateDef {
  const mapped = remapLegacyTemplateId(id);
  return MENU_TEMPLATES.find((t) => t.id === mapped) || MENU_TEMPLATES[0];
}

export function templatesByCategory(): Record<TemplateCategory, MenuTemplateDef[]> {
  const acc = {} as Record<TemplateCategory, MenuTemplateDef[]>;
  for (const t of MENU_TEMPLATES) {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
  }
  return acc;
}
