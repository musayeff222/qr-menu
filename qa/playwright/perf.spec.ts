import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { SKIN_IDS, type SkinId } from "./skins";
import { openSkin } from "./helpers";

const OUT = path.resolve("qa/playwright/perf.json");

type VitalRow = {
  skin: string;
  lcpMs: number | null;
  cls: number | null;
  inpMs: number | null;
  notes: string[];
};

const rows: VitalRow[] = [];

test.describe.configure({ mode: "parallel" });

for (const skin of SKIN_IDS) {
  test(`${skin} mobile web vitals (375px)`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.addInitScript(() => {
      (window as unknown as { __mgVitals: { lcp: number; cls: number; inp: number } }).__mgVitals = {
        lcp: 0,
        cls: 0,
        inp: 0,
      };
      const w = window as unknown as { __mgVitals: { lcp: number; cls: number; inp: number } };
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            const t = (e as PerformanceEntry & { startTime: number }).startTime;
            w.__mgVitals.lcp = Math.max(w.__mgVitals.lcp, t);
          }
        }).observe({ type: "largest-contentful-paint", buffered: true });
      } catch {
        /* Chromium without LCP observer */
      }
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            const ls = e as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
            if (!ls.hadRecentInput) w.__mgVitals.cls += Number(ls.value || 0);
          }
        }).observe({ type: "layout-shift", buffered: true });
      } catch {
        /* */
      }
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            const ev = e as PerformanceEntry & { duration: number };
            w.__mgVitals.inp = Math.max(w.__mgVitals.inp, ev.duration);
          }
        }).observe({ type: "event", buffered: true, durationThreshold: 16 } as PerformanceObserverInit);
      } catch {
        /* INP Event Timing may be unavailable */
      }
    });
    await openSkin(page, skin as SkinId);
    await page.waitForTimeout(400);
    const add = page.locator("[data-skin] button[aria-label]").first();
    if (await add.isVisible().catch(() => false)) {
      await add.click({ force: true }).catch(() => {});
    }
    await page.waitForTimeout(500);
    const vitals = await page.evaluate(() => {
      const w = window as unknown as { __mgVitals?: { lcp: number; cls: number; inp: number } };
      return w.__mgVitals || { lcp: 0, cls: 0, inp: 0 };
    });
    const notes: string[] = [];
    const lcpMs = vitals.lcp > 0 ? Math.round(vitals.lcp) : null;
    const cls = Number.isFinite(vitals.cls) ? Number(vitals.cls.toFixed(4)) : null;
    const inpMs = vitals.inp > 0 ? Math.round(vitals.inp) : null;
    if (lcpMs == null) notes.push("LCP not observed");
    if (inpMs == null) notes.push("INP not observed (Event Timing empty)");
    const row = { skin, lcpMs, cls, inpMs, notes };
    rows.push(row);
    fs.mkdirSync(path.resolve("qa/playwright/perf"), { recursive: true });
    fs.writeFileSync(path.resolve("qa/playwright/perf", `${skin}.json`), JSON.stringify(row, null, 2));
    expect(lcpMs, `${skin} LCP observed`).not.toBeNull();
  });
}

test.afterAll(() => {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) as VitalRow[] : [];
  const bySkin = new Map(existing.map((r) => [r.skin, r]));
  for (const r of rows) bySkin.set(r.skin, r);
  fs.writeFileSync(OUT, JSON.stringify([...bySkin.values()], null, 2));
});
