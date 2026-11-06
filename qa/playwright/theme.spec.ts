import { test, expect } from "@playwright/test";
import { DEMO_SLUG, SKIN_IDS, type SkinId } from "./skins";
import { openSkin } from "./helpers";

const MINT_PRIMARY = "#0dbe91";
const PREVIEW_COLORS = {
  primary: "#ff00aa",
  secondary: "#ffe0f4",
  accent: "#aa0066",
  background: "#fff7fb",
  surface: "#ffffff",
  text: "#1a0a12",
  muted: "#7a5568",
};

test("panel color editor preview + save + reload isolation", async ({ page, request }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto("/panel");
  await page.locator("#rest-login-user").fill("demo");
  await page.locator("#rest-login-pass").fill("demo123");
  await page.getByRole("button", { name: /Daxil ol|Login|Giriş/i }).click();
  await page.waitForURL(/\/restaurant\/\d+/, { timeout: 20000 });

  const restUrl = page.url();
  const id = restUrl.match(/\/restaurant\/(\d+)/)?.[1];
  expect(id).toBeTruthy();

  await page.goto(`/restaurant/${id}/templates`);
  await page.getByRole("button", { name: /Redaktə et|Edit|Düzenle/i }).click();
  await expect(page.getByText(/Rəng palitrası/i)).toBeVisible();

  const iframe = page.locator("#menugo-menu-preview");
  await expect(iframe).toBeVisible();
  const frame = page.frameLocator("#menugo-menu-preview");
  await frame.locator("[data-skin]").waitFor({ timeout: 25000 });
  const before = await frame.locator("[data-skin]").evaluate((el) =>
    getComputedStyle(el).getPropertyValue("--mt-primary").trim()
  );

  await page.getByRole("button", { name: "MenuGo mint" }).click();
  await expect
    .poll(async () =>
      frame.locator("[data-skin]").evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--mt-primary").trim().toLowerCase()
      )
    , { timeout: 8000 })
    .toMatch(/#0dbe91|rgb\(13,\s*190,\s*145\)/);
  const after = await frame.locator("[data-skin]").evaluate((el) =>
    getComputedStyle(el).getPropertyValue("--mt-primary").trim()
  );
  expect(after.toLowerCase()).not.toBe(before.toLowerCase());

  await page.getByRole("button", { name: /Rəngləri saxla/i }).click();
  await page.waitForTimeout(800);

  const pub = await request.get(`/api/restaurants/${DEMO_SLUG}?preview=true`);
  expect(pub.ok()).toBeTruthy();
  const menu = await pub.json();
  const saved = JSON.parse(menu.menu_appearance_json || "{}");
  const active = saved.activeTemplateId || "quick-kiosk";
  const primary =
    saved.overridesByTemplate?.[active]?.colors?.primary ||
    saved.overridesByTemplate?.["quick-kiosk"]?.colors?.primary;
  expect(String(primary || "").toLowerCase()).toBe(MINT_PRIMARY);

  await page.goto(`/r/${DEMO_SLUG}?preview=true&previewTemplate=quick-kiosk`);
  await page.locator("[data-skin]").waitFor();
  const guestPrimary = await page.locator("[data-skin]").evaluate((el) =>
    getComputedStyle(el).getPropertyValue("--mt-primary").trim().toLowerCase()
  );
  expect(guestPrimary === MINT_PRIMARY || guestPrimary.includes("13, 190, 145")).toBeTruthy();

  await page.goto(`/restaurant/${id}/templates`);
  await page.getByRole("button", { name: /Redaktə et|Edit|Düzenle/i }).click();
  await page.getByRole("button", { name: /Başlanğıc rənglərinə dön/i }).click();
  await page.waitForTimeout(600);
});

for (const skin of SKIN_IDS) {
  test(`${skin} live color preview 7 tokens`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openSkin(page, skin as SkinId);
    await page.evaluate(
      ({ templateId, colors }) => {
        window.postMessage(
          { type: "MENUGO_THEME_PREVIEW", version: 1, templateId, colors },
          "*"
        );
      },
      { templateId: skin, colors: PREVIEW_COLORS }
    );
    await expect
      .poll(async () =>
        page.locator("[data-skin]").evaluate((el) =>
          getComputedStyle(el).getPropertyValue("--mt-primary").trim().toLowerCase()
        )
      , { timeout: 6000 })
      .toMatch(/#ff00aa|rgb\(255,\s*0,\s*170\)/);

    const vars = await page.locator("[data-skin]").evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        primary: cs.getPropertyValue("--mt-primary").trim().toLowerCase(),
        secondary: cs.getPropertyValue("--mt-secondary").trim().toLowerCase(),
        accent: cs.getPropertyValue("--mt-accent").trim().toLowerCase(),
        bg: cs.getPropertyValue("--mt-bg").trim().toLowerCase(),
        surface: cs.getPropertyValue("--mt-surface").trim().toLowerCase(),
        text: cs.getPropertyValue("--mt-text").trim().toLowerCase(),
        muted: cs.getPropertyValue("--mt-muted").trim().toLowerCase(),
        onPrimary: cs.getPropertyValue("--mt-on-primary").trim(),
      };
    });
    expect(vars.secondary).toMatch(/#ffe0f4|255,\s*224,\s*244/);
    expect(vars.accent).toMatch(/#aa0066|170,\s*0,\s*102/);
    expect(vars.bg).toMatch(/#fff7fb|255,\s*247,\s*251/);
    expect(vars.surface).toMatch(/#ffffff|255,\s*255,\s*255/);
    expect(vars.text).toMatch(/#1a0a12|26,\s*10,\s*18/);
    expect(vars.muted).toMatch(/#7a5568|122,\s*85,\s*104/);
    expect(vars.onPrimary.length).toBeGreaterThan(0);
  });
}
