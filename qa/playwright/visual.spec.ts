import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { SKIN_IDS, VIEWPORTS, type SkinId } from "./skins";
import { collapsedImages, layoutFingerprint, openSkin, overflowReport, writeJson } from "./helpers";

const SHOT_DIR = path.resolve("qa/playwright/shots");
fs.mkdirSync(SHOT_DIR, { recursive: true });
const FP_DIR = path.resolve("qa/playwright/fingerprints");
fs.mkdirSync(FP_DIR, { recursive: true });
const OV_DIR = path.resolve("qa/playwright/overflows");
fs.mkdirSync(OV_DIR, { recursive: true });

test.describe.configure({ mode: "parallel" });

for (const skin of SKIN_IDS) {
  for (const view of VIEWPORTS) {
    test(`${skin} @ ${view.id}px screenshot + overflow`, async ({ page }) => {
      await page.setViewportSize({ width: view.width, height: view.height });
      await openSkin(page, skin as SkinId);

      const collapsed = await collapsedImages(page);
      expect(collapsed, `${skin} collapsed <img> at ${view.id}`).toBe(0);

      const report = await overflowReport(page);
      writeJson(path.join(OV_DIR, `${skin}__${view.id}.json`), report);
      expect(report.extra, `${skin} horizontal overflow ${report.extra}px at ${view.id}`).toBeLessThanOrEqual(8);

      const shot = path.join(SHOT_DIR, `${skin}__${view.id}.png`);
      await page.screenshot({ path: shot, animations: "disabled" });
      expect(fs.statSync(shot).size).toBeGreaterThan(2000);

      if (view.id === "375" || view.id === "1280") {
        const full = path.join(SHOT_DIR, `${skin}__${view.id}-full.png`);
        await page.screenshot({ path: full, fullPage: true, animations: "disabled" });
        expect(fs.statSync(full).size).toBeGreaterThan(2000);
      }

      if (view.id === "375") {
        const fp = await layoutFingerprint(page);
        fs.writeFileSync(path.join(FP_DIR, `${skin}.json`), JSON.stringify(fp));
        expect(fp.skin).toBe(skin);
        expect(fp.marker).toBe(`skin-${skin}`);
      }
    });
  }
}
