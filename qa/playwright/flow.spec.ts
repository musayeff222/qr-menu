import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { SKIN_IDS, type SkinId } from "./skins";
import {
  addFirstProduct,
  addNamedProduct,
  cartHasLine,
  categoryCount,
  openCart,
  openSkin,
  visibleProductCount,
} from "./helpers";

const SHOT_DIR = path.resolve("qa/playwright/shots");
fs.mkdirSync(SHOT_DIR, { recursive: true });

test.describe.configure({ mode: "parallel" });

for (const skin of SKIN_IDS) {
  test(`${skin} categories, products, cart, qty, note, checkout`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openSkin(page, skin as SkinId);

    const cats = await categoryCount(page);
    expect(cats, `${skin} categories`).toBeGreaterThan(0);

    const products = await visibleProductCount(page);
    expect(products, `${skin} priced products`).toBeGreaterThan(0);

    const productHit = page.locator("[data-skin] article button, [data-skin] button").filter({ hasText: /[A-Za-zƏəĞğİıÖöŞşÇçÜü]/ }).first();
    if ((await productHit.count()) > 0) {
      await productHit.click().catch(() => {});
      await page.waitForTimeout(200);
      await page.screenshot({
        path: path.join(SHOT_DIR, `${skin}__375-detail.png`),
        animations: "disabled",
      });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(150);
    }

    await addFirstProduct(page);
    await openCart(page);
    expect(await cartHasLine(page), `${skin} cart line after add`).toBeTruthy();
    await page.screenshot({
      path: path.join(SHOT_DIR, `${skin}__375-cart.png`),
      animations: "disabled",
    });

    const plus = page.getByRole("button", { name: "Artır" }).first();
    if (await plus.isVisible().catch(() => false)) {
      await plus.click();
    }
    const noteBtn = page.getByRole("button", { name: /Qeyd|Note|Заметка|Not/i }).first();
    await expect(noteBtn, `${skin} line note`).toBeVisible();
    await noteBtn.click();
    await page.locator("textarea").last().fill("QA qeyd — az duz");
    await page.getByRole("button", { name: /Saxla|Save|Сохранить|Kaydet/i }).click();
    await expect(page.getByText(/QA qeyd/)).toBeVisible();

    const remove = page.getByRole("button", { name: /Sil|Remove|Удалить|Kaldır/i }).first();
    await expect(remove, `${skin} remove line`).toBeVisible();

    const checkoutName = /Sifarişi tamamla|Complete order|Оформить заказ|Siparişi tamamla/i;
    let checkout = page.getByRole("dialog").getByRole("button", { name: checkoutName });
    if ((await checkout.count()) === 0) {
      checkout = page.getByRole("button", { name: checkoutName });
    }
    expect(await checkout.count(), `${skin} checkout control`).toBeGreaterThan(0);
    await checkout.first().click();
    await expect(page.getByRole("button", { name: /Məkandan götür|Pickup/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Çatdırılma|Delivery/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Web sayt|Website/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /WhatsApp/i }).first()).toBeVisible();
    await page.screenshot({
      path: path.join(SHOT_DIR, `${skin}__375-checkout.png`),
      animations: "disabled",
    });
  });

  test(`${skin} variant picker on Plov`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openSkin(page, skin as SkinId);
    await addNamedProduct(page, /Plov/i, path.join(SHOT_DIR, `${skin}__375-variant.png`));
    await openCart(page);
    const line = page.getByText(/QA Kiçik|QA Böyük|Plov/i);
    await expect(line.first(), `${skin} Plov in cart`).toBeVisible();
  });
}
