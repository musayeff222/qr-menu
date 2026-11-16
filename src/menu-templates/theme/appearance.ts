import { remapLegacyTemplateId } from "../legacyRemap";
import { SKIN_IDS } from "../skinCatalog";
import { sanitizeTokens, type SkinColorTokens } from "./tokens";

export type AppearanceDoc = {
  version: 1;
  activeTemplateId?: string;
  overridesByTemplate: Record<string, { preset?: string; colors: SkinColorTokens }>;
};

export function emptyAppearance(): AppearanceDoc {
  return { version: 1, overridesByTemplate: {} };
}

export function parseAppearance(raw: unknown): AppearanceDoc {
  if (typeof raw === "string") {
    try {
      return parseAppearance(JSON.parse(raw));
    } catch {
      return emptyAppearance();
    }
  }
  if (!raw || typeof raw !== "object") return emptyAppearance();
  const o = raw as Record<string, unknown>;
  const overrides: AppearanceDoc["overridesByTemplate"] = {};
  const src =
    o.overridesByTemplate && typeof o.overridesByTemplate === "object"
      ? (o.overridesByTemplate as Record<string, unknown>)
      : {};
  const fallback: SkinColorTokens = {
    primary: "#0dbe91",
    secondary: "#dcf8ec",
    accent: "#078363",
    background: "#f7faf8",
    surface: "#ffffff",
    text: "#0a1720",
    muted: "#63747c",
  };
  const write = (id: string, row: unknown) => {
    if (!row || typeof row !== "object") return;
    const mapped = remapLegacyTemplateId(id);
    const r = row as Record<string, unknown>;
    overrides[mapped] = {
      preset: typeof r.preset === "string" ? r.preset : "custom",
      colors: sanitizeTokens(r.colors, fallback),
    };
  };
  const activeRaw = typeof o.activeTemplateId === "string" ? o.activeTemplateId : undefined;
  for (const [id, row] of Object.entries(src)) {
    if (!SKIN_IDS.includes(id)) write(id, row);
  }
  for (const [id, row] of Object.entries(src)) {
    if (SKIN_IDS.includes(id)) write(id, row);
  }
  if (activeRaw && src[activeRaw]) write(activeRaw, src[activeRaw]);
  return {
    version: 1,
    activeTemplateId: activeRaw ? remapLegacyTemplateId(activeRaw) : undefined,
    overridesByTemplate: overrides,
  };
}

export function serializeAppearance(doc: AppearanceDoc): string {
  return JSON.stringify({ version: 1, activeTemplateId: doc.activeTemplateId, overridesByTemplate: doc.overridesByTemplate });
}
