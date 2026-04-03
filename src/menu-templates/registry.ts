import type { MenuTemplateDef, TemplateCategory } from "./types";
import { buildConceptMenuTemplates } from "./conceptRegistry";

export const MENU_TEMPLATES: MenuTemplateDef[] = buildConceptMenuTemplates();

/** Exactly 50 templates: 10 × 5 style families (ID sırası planTemplatePolicy ilə eyni) */
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
