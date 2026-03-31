/** Plan limit sırası — src/menu-templates/registry.ts içindəki MENU_TEMPLATES sırası ilə eyni olmalıdır */
const PREFIXES = ["modern", "luxury", "minimal", "fast-food", "cafe"] as const;

export const MENU_TEMPLATE_IDS_ORDERED: string[] = PREFIXES.flatMap((p) =>
  Array.from({ length: 10 }, (_, i) => `${p}-${String(i + 1).padStart(2, "0")}`)
);

export function templateIndex(templateId: string): number {
  return MENU_TEMPLATE_IDS_ORDERED.indexOf(templateId);
}

/** maxTemplates: -1 = limitsiz. premiumTemplates: Luxury kateqoriyaya icazə */
export function templateSelectionError(
  templateId: string,
  maxTemplates: number,
  premiumTemplatesEnabled: boolean
): string | null {
  if (!templateId) return "Boş şablon";
  if (!premiumTemplatesEnabled && templateId.startsWith("luxury-")) {
    return "Bu plan Luxury şablonları dəstəkləmir";
  }
  if (maxTemplates < 0) return null;
  const idx = templateIndex(templateId);
  if (idx < 0) return "Naməlum şablon";
  if (idx >= maxTemplates) {
    return `Plan yalnız ilk ${maxTemplates} şablona icazə verir`;
  }
  return null;
}
