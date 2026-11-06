import { test, expect } from "@playwright/test";
import { SKIN_IDS, type SkinId } from "./skins";
import { openSkin } from "./helpers";

const ENGLISH_ACTIONS = /^(ADD|Add|Select|Seat|Mark|Cup|Pin add|SIZE \+|Tear & add)$/i;

test.describe.configure({ mode: "parallel" });

for (const skin of SKIN_IDS) {
  test(`${skin} AZ UI has no English action labels`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openSkin(page, skin as SkinId);
    const labels = await page.locator("[data-skin] button").evaluateAll((btns) =>
      btns.map((b) => ((b as HTMLButtonElement).innerText || "").trim()).filter(Boolean)
    );
    const leaks = labels.filter((t) => ENGLISH_ACTIONS.test(t));
    expect(leaks, `${skin} English action leaks: ${leaks.join(", ")}`).toEqual([]);

    const add = page.locator("[data-skin] button").filter({
      hasText: /^(Əlavə et|\+)$/,
    });
    const aria = page.locator('[data-skin] button[aria-label="Əlavə et"]');
    expect(
      (await add.count()) + (await aria.count()),
      `${skin} missing AZ add control`
    ).toBeGreaterThan(0);
  });
}

const LANG_SAMPLES: SkinId[] = ["bistro-split", "menu-paper", "neon-snap"];

for (const skin of LANG_SAMPLES) {
  test(`${skin} EN/RU/TR add + cart labels`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openSkin(page, skin);

    const lang = page.locator('select[aria-label="Dil"]');
    await expect(lang.first()).toBeVisible();

    await lang.first().selectOption("en");
    await expect(page.getByRole("button", { name: /^Add to cart$/i }).first()).toBeVisible();
    await expect(page.locator('[data-skin] button[aria-label="Cart"]').first()).toBeVisible();

    await lang.first().selectOption("ru");
    await expect(page.getByRole("button", { name: /^Добавить$/i }).first()).toBeVisible();
    await expect(page.locator('[data-skin] button[aria-label="Корзина"]').first()).toBeVisible();

    await lang.first().selectOption("tr");
    await expect(page.getByRole("button", { name: /^Sepete ekle$/i }).first()).toBeVisible();
    await expect(page.locator('[data-skin] button[aria-label="Sepet"]').first()).toBeVisible();
  });
}
