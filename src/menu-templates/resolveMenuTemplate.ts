import type { MenuTemplateDef, MenuTemplateTheme, TemplateCategory } from "./types";
import { MENU_TEMPLATES, getTemplateById } from "./registry";

export type CustomTemplateRow = {
  slug_key: string;
  name: string;
  category: string;
  hero_image_url?: string | null;
  theme_json?: string | null;
};

export function resolveMenuTemplate(
  id: string | undefined | null,
  customRows: CustomTemplateRow[] | undefined
): MenuTemplateDef {
  const c = customRows?.find((r) => r.slug_key === id);
  if (c) {
    const base = MENU_TEMPLATES[0];
    let theme: MenuTemplateTheme = { ...base.theme };
    if (c.theme_json) {
      try {
        const parsed = JSON.parse(c.theme_json) as Partial<MenuTemplateTheme>;
        theme = { ...theme, ...parsed };
      } catch {
        /* ignore invalid json */
      }
    }
    return {
      id: c.slug_key,
      name: c.name,
      category: (c.category as TemplateCategory) || "Modern",
      description: "Fərdi şablon",
      heroImage: c.hero_image_url || base.heroImage,
      theme,
    };
  }
  return getTemplateById(id);
}
