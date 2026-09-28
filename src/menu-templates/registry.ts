import type { MenuTemplateDef, TemplateCategory } from "./types";
import { buildConceptMenuTemplates } from "./conceptRegistry";
import { SMARTWEB_MENU_TEMPLATE } from "./smartwebTemplate";

export const MENU_TEMPLATES: MenuTemplateDef[] = [
  ...buildConceptMenuTemplates(),
  SMARTWEB_MENU_TEMPLATE,
];

/** Plan limiti üçün 50 əsas şablon (+ əlavə smartweb və s.) */
export const MENU_TEMPLATE_COUNT = 50;
const builtinCount = MENU_TEMPLATES.length - 1;
if (builtinCount !== MENU_TEMPLATE_COUNT) {
  console.warn(
    `[menu-templates] expected ${MENU_TEMPLATE_COUNT} builtin templates, got ${builtinCount}`
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
