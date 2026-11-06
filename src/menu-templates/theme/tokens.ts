import type { CSSProperties } from "react";

export type SkinColorTokens = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
};

export const TOKEN_KEYS = [
  "primary",
  "secondary",
  "accent",
  "background",
  "surface",
  "text",
  "muted",
] as const;

const HEX = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(v: unknown): v is string {
  return typeof v === "string" && HEX.test(v.trim());
}

export function sanitizeTokens(raw: unknown, fallback: SkinColorTokens): SkinColorTokens {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const out = { ...fallback };
  for (const k of TOKEN_KEYS) {
    if (isHexColor(src[k])) out[k] = String(src[k]).trim();
  }
  return ensureAaTokens(out);
}

function hexLum(hex: string) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a: string, b: string) {
  const l1 = hexLum(a);
  const l2 = hexLum(b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

function mixHex(a: string, b: string, t: number) {
  const pa = a.replace("#", "");
  const pb = b.replace("#", "");
  const ch = (i: number) => {
    const x = parseInt(pa.slice(i, i + 2), 16);
    const y = parseInt(pb.slice(i, i + 2), 16);
    return Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${ch(0)}${ch(2)}${ch(4)}`;
}

/** Nudge foreground toward black or white until WCAG AA (or the better extreme). */
export function nudgeContrast(fg: string, bg: string, minRatio = 4.5) {
  if (!isHexColor(fg) || !isHexColor(bg)) return fg;
  if (contrastRatio(fg, bg) >= minRatio) return fg;
  const white = contrastRatio("#ffffff", bg);
  const black = contrastRatio("#111111", bg);
  const target = white >= black ? "#ffffff" : "#111111";
  let cur = fg;
  for (let i = 0; i < 32; i++) {
    cur = mixHex(cur, target, 0.14);
    if (contrastRatio(cur, bg) >= minRatio) return cur;
  }
  return target;
}

export function onColor(bg: string) {
  const light = "#ffffff";
  const dark = "#14201c";
  return contrastRatio(light, bg) >= contrastRatio(dark, bg) ? light : dark;
}

/** Darken/lighten a fill until white or ink text meets 4.5:1 (button labels). */
export function ensureUiFill(bg: string) {
  if (!isHexColor(bg)) return bg;
  let cur = bg;
  for (let i = 0; i < 40; i++) {
    const cW = contrastRatio("#ffffff", cur);
    const cK = contrastRatio("#14201c", cur);
    if (Math.max(cW, cK) >= 4.5) return cur;
    cur = mixHex(cur, cW >= cK ? "#111111" : "#f7faf8", 0.1);
  }
  return cur;
}

export function ensureAaTokens(t: SkinColorTokens): SkinColorTokens {
  const text = nudgeContrast(nudgeContrast(t.text, t.background, 4.5), t.surface, 4.5);
  const muted = nudgeContrast(t.muted, t.background, 4.5);
  return {
    ...t,
    primary: ensureUiFill(t.primary),
    accent: ensureUiFill(t.accent),
    text,
    muted,
  };
}

export function tokenContrastReport(t: SkinColorTokens) {
  const onPrimary = onColor(t.primary);
  const onAccent = onColor(t.accent);
  const pairs = [
    { pair: "text/background", fg: t.text, bg: t.background, min: 4.5 },
    { pair: "text/surface", fg: t.text, bg: t.surface, min: 4.5 },
    { pair: "muted/background", fg: t.muted, bg: t.background, min: 4.5 },
    { pair: "on-primary/primary", fg: onPrimary, bg: t.primary, min: 4.5 },
    { pair: "on-accent/accent", fg: onAccent, bg: t.accent, min: 4.5 },
  ];
  return pairs.map((p) => {
    const ratio = contrastRatio(p.fg, p.bg);
    return { ...p, ratio, pass: ratio >= p.min };
  });
}

export function tokensToCssVars(t: SkinColorTokens): CSSProperties {
  return {
    "--mt-primary": t.primary,
    "--mt-secondary": t.secondary,
    "--mt-accent": t.accent,
    "--mt-bg": t.background,
    "--mt-surface": t.surface,
    "--mt-text": t.text,
    "--mt-muted": t.muted,
    "--mt-on-primary": onColor(t.primary),
    "--mt-danger": "#c6384d",
  } as CSSProperties;
}

export const THEME_PRESETS: { id: string; name: string; tokens: SkinColorTokens }[] = [
  {
    id: "mint",
    name: "MenuGo mint",
    tokens: {
      primary: "#0dbe91",
      secondary: "#dcf8ec",
      accent: "#078363",
      background: "#f7faf8",
      surface: "#ffffff",
      text: "#0a1720",
      muted: "#63747c",
    },
  },
  {
    id: "ink",
    name: "Gecə mürəkkəbi",
    tokens: {
      primary: "#c4a574",
      secondary: "#2a2420",
      accent: "#e8d5b0",
      background: "#141210",
      surface: "#1e1b18",
      text: "#f4efe6",
      muted: "#9a9084",
    },
  },
  {
    id: "sun",
    name: "İsti günəş",
    tokens: {
      primary: "#e45e37",
      secondary: "#f3ca64",
      accent: "#c05a39",
      background: "#fff6e9",
      surface: "#ffffff",
      text: "#34251f",
      muted: "#7a6558",
    },
  },
];

for (const p of THEME_PRESETS) {
  p.tokens = ensureAaTokens(p.tokens);
}
