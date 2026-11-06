import { test, expect } from "@playwright/test";
import { SKIN_CATALOG } from "../../src/menu-templates/skinCatalog";
import {
  THEME_PRESETS,
  ensureAaTokens,
  sanitizeTokens,
  tokenContrastReport,
  type SkinColorTokens,
} from "../../src/menu-templates/theme/tokens";

function assertAa(label: string, tokens: SkinColorTokens) {
  const fails = tokenContrastReport(tokens).filter((r) => !r.pass);
  expect(fails, `${label}: ${fails.map((f) => `${f.pair} ${f.ratio.toFixed(2)}`).join("; ")}`).toEqual([]);
}

test("THEME_PRESETS meet WCAG AA for text and button pairs", () => {
  for (const p of THEME_PRESETS) {
    assertAa(`preset ${p.id}`, p.tokens);
  }
});

test("30 skin default palettes meet WCAG AA", () => {
  expect(SKIN_CATALOG.length).toBe(30);
  for (const skin of SKIN_CATALOG) {
    assertAa(`skin ${skin.id}`, skin.defaults);
  }
});

test("savable low-contrast custom mix is corrected on sanitize", () => {
  const raw = {
    primary: "#888888",
    secondary: "#dddddd",
    accent: "#999999",
    background: "#c8c8c8",
    surface: "#bcbcbc",
    text: "#b0b0b0",
    muted: "#adadad",
  };
  const fixed = sanitizeTokens(raw, SKIN_CATALOG[0].defaults);
  assertAa("sanitized custom", fixed);
  const untouched = tokenContrastReport(raw as SkinColorTokens).some((r) => !r.pass);
  expect(untouched, "fixture should start failing AA").toBeTruthy();
  const afterEnsure = tokenContrastReport(ensureAaTokens(raw as SkinColorTokens));
  expect(afterEnsure.every((r) => r.pass)).toBeTruthy();
});
