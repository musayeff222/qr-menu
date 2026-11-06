const HEX = /^#[0-9a-fA-F]{6}$/;
const KEYS = ["primary", "secondary", "accent", "background", "surface", "text", "muted"] as const;

export function sanitizeMenuAppearanceJson(raw: unknown): string {
  let src: unknown = raw;
  if (typeof raw === "string") {
    try {
      src = JSON.parse(raw);
    } catch {
      return JSON.stringify({ version: 1, overridesByTemplate: {} });
    }
  }
  const o = src && typeof src === "object" ? (src as Record<string, unknown>) : {};
  const overrides: Record<string, { preset?: string; colors: Record<string, string> }> = {};
  const bag =
    o.overridesByTemplate && typeof o.overridesByTemplate === "object"
      ? (o.overridesByTemplate as Record<string, unknown>)
      : {};
  for (const [id, row] of Object.entries(bag)) {
    if (!/^[a-z0-9-]{2,40}$/.test(id) || !row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const colorsIn = r.colors && typeof r.colors === "object" ? (r.colors as Record<string, unknown>) : {};
    const colors: Record<string, string> = {};
    for (const k of KEYS) {
      const v = String(colorsIn[k] || "").trim();
      if (HEX.test(v)) colors[k] = v;
    }
    if (Object.keys(colors).length === 0) continue;
    overrides[id] = {
      preset: typeof r.preset === "string" ? r.preset.slice(0, 32) : "custom",
      colors,
    };
  }
  return JSON.stringify({
    version: 1,
    activeTemplateId: typeof o.activeTemplateId === "string" ? o.activeTemplateId.slice(0, 64) : undefined,
    overridesByTemplate: overrides,
  });
}
