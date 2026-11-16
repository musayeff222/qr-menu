import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import { DEMO_SLUG, SKIN_IDS, type SkinId } from "./skins";
import {
  addFirstProduct,
  cartHasLine,
  expectFullscreenCheckout,
  openCart,
  openCheckoutFromCart,
  openSkin,
} from "./helpers";

const SHOT_DIR = path.resolve("qa/playwright/shots");
fs.mkdirSync(SHOT_DIR, { recursive: true });

const CHECKOUT_VIEWS = [
  { id: "320", width: 320, height: 680 },
  { id: "375", width: 375, height: 812 },
  { id: "390", width: 390, height: 844 },
  { id: "430", width: 430, height: 932 },
  { id: "1280", width: 1280, height: 860 },
  { id: "1440", width: 1440, height: 900 },
] as const;

const LANGS = [
  { id: "az", pickup: /Məkandan götür/, title: /Sifarişi tamamla/, place: /Sifarişi ver/ },
  { id: "en", pickup: /Pickup/, title: /Complete order/, place: /Place order/ },
  { id: "ru", pickup: /Самовывоз/, title: /Оформить заказ/, place: /Оформить/ },
  { id: "tr", pickup: /Gel al/, title: /Siparişi tamamla/, place: /Siparişi ver/ },
] as const;

async function fillContact(page: import("@playwright/test").Page, suffix: string) {
  await page.getByPlaceholder(/Ad soyad|Full name|ФИО/i).fill(`QA Checkout ${suffix}`);
  await page.getByPlaceholder("+994...").fill("994501112233");
}

test.describe.configure({ mode: "parallel" });

for (const skin of SKIN_IDS) {
  test(`${skin} fullscreen checkout form, summary, sticky footer, back keeps cart`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openSkin(page, skin as SkinId);
    await addFirstProduct(page);
    await openCart(page);
    expect(await cartHasLine(page), `${skin} cart before checkout`).toBeTruthy();
    await openCheckoutFromCart(page);

    expect(page.url()).toContain(`/r/${DEMO_SLUG}`);
    expect(page.url()).not.toMatch(/checkout/i);
    await expectFullscreenCheckout(page);
    await expect(page.locator('[data-checkout-phase="form"]')).toBeVisible();
    await expect(page.getByTestId("checkout-line").first()).toBeVisible();
    await expect(page.getByTestId("checkout-grand-total")).toContainText("₼");
    await expect(page.getByTestId("checkout-footer")).toBeVisible();
    await expect(page.getByTestId("checkout-submit")).toBeVisible();

    const footer = page.locator("[data-checkout-footer]");
    const fbox = await footer.boundingBox();
    expect(fbox, `${skin} sticky footer box`).toBeTruthy();
    expect(fbox!.y + fbox!.height).toBeLessThanOrEqual(812 + 8);

    const scroll = page.locator("[data-checkout-scroll]");
    const overflowY = await scroll.evaluate((el) => getComputedStyle(el).overflowY);
    expect(overflowY, `${skin} scroll region`).toMatch(/auto|scroll/);

    await expect(page.getByTestId("checkout-address")).toHaveCount(0);
    await expect(page.getByTestId("checkout-location")).toHaveCount(0);
    await page.getByTestId("checkout-delivery").click();
    await expect(page.getByTestId("checkout-address")).toBeVisible();
    await expect(page.getByTestId("checkout-location")).toBeVisible();
    await page.getByTestId("checkout-pickup").click();
    await expect(page.getByTestId("checkout-address")).toHaveCount(0);

    await page.getByRole("button", { name: /Kart|Card|Карта/i }).click();
    await expect(page.getByTestId("checkout-card-hint")).toBeVisible();
    await expect(page.getByTestId("checkout-card-hint")).not.toContainText(
      /stripe|paypal|online ödəniş|online payment gateway/i
    );

    await page.getByTestId("checkout-submit").click();
    await expect(page.getByTestId("checkout-error")).toBeVisible();
    await expect(page.locator('[data-checkout-phase="success"]')).toHaveCount(0);

    await page.getByPlaceholder("+994...").focus();
    await expect(footer).toBeVisible();

    await page.getByTestId("checkout-back").click();
    await expect(page.locator('[data-checkout="full"]')).toHaveCount(0);
    expect(await cartHasLine(page), `${skin} cart after back`).toBeTruthy();
  });

  test(`${skin} failed order stays on form; success shows accepted screen`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openSkin(page, skin as SkinId);
    await addFirstProduct(page);
    await openCart(page);
    await openCheckoutFromCart(page);
    await fillContact(page, `${skin}-err`);

    await page.route(`**/api/restaurants/${DEMO_SLUG}/orders`, async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "QA invalid cart" }),
      });
    });
    await page.getByTestId("checkout-submit").click();
    await expect(page.getByTestId("checkout-error")).toContainText(/QA invalid cart/i);
    await expect(page.locator('[data-testid="checkout-success"]')).toHaveCount(0);
    await expect(page.locator('[data-checkout-phase="form"]')).toBeVisible();
    await page.unroute(`**/api/restaurants/${DEMO_SLUG}/orders`);

    await page.route(`**/api/restaurants/${DEMO_SLUG}/orders`, async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          order: { id: 9001, status: "pending", total_amount: 12.5 },
          access_token: "v2.qa-synthetic.not-a-real-hmac",
        }),
      });
    });
    await page.getByTestId("checkout-submit").click();
    await expect(page.getByTestId("checkout-success")).toBeVisible();
    await expect(page.getByTestId("checkout-order-id")).toContainText("9001");
    await expect(page.getByTestId("checkout-success").getByRole("heading")).toContainText(
      /Sifarişiniz qəbul edildi|Your order was accepted|Ваш заказ принят|Siparişiniz kabul edildi/i
    );
    await page.screenshot({
      path: path.join(SHOT_DIR, `${skin}__390-checkout-success.png`),
      animations: "disabled",
    });
  });

  test(`${skin} WhatsApp path does not claim accepted and does not POST`, async ({ page }) => {
    let posted = false;
    await page.addInitScript(() => {
      Object.defineProperty(window, "open", {
        configurable: true,
        writable: true,
        value: () => null,
      });
    });
    await page.route(`**/api/restaurants/${DEMO_SLUG}/orders`, async (route) => {
      if (route.request().method() === "POST") {
        posted = true;
        await route.abort();
        return;
      }
      await route.continue();
    });
    await page.setViewportSize({ width: 375, height: 812 });
    await openSkin(page, skin as SkinId);
    await addFirstProduct(page);
    await openCart(page);
    await openCheckoutFromCart(page);
    await fillContact(page, `${skin}-wa`);
    await page.getByRole("button", { name: /^WhatsApp$/i }).click();
    await page.getByTestId("checkout-submit").click();
    await page.waitForTimeout(400);
    expect(posted, `${skin} WhatsApp must not POST`).toBeFalsy();
    await expect(page.getByTestId("checkout-success")).toHaveCount(0);
    await expect(page.getByText(/Sifarişiniz qəbul edildi/i)).toHaveCount(0);
  });

  test(`${skin} checkout screenshots 320/375/390/430/1280/1440`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openSkin(page, skin as SkinId);
    await addFirstProduct(page);
    await openCart(page);
    await openCheckoutFromCart(page);

    for (const vp of CHECKOUT_VIEWS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(180);
      await expectFullscreenCheckout(page);
      if (vp.width >= 1280) {
        const cols = await page.locator("[data-checkout-scroll]").evaluate((el) =>
          getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean)
        );
        expect(cols.length, `${skin} desktop columns @${vp.id}`).toBeGreaterThanOrEqual(2);
      }
      await page.screenshot({
        path: path.join(SHOT_DIR, `${skin}__${vp.id}-checkout-full.png`),
        animations: "disabled",
      });
    }
  });
}

test("AZ/TR/RU/EN checkout copy on Bella Classic", async ({ page }) => {
  for (const lang of LANGS) {
    await page.setViewportSize({ width: 375, height: 812 });
    await openSkin(page, "bella-classic");
    const langSelect = page.locator("[data-skin] select").first();
    await langSelect.selectOption(lang.id);
    await page.waitForTimeout(200);
    await addFirstProduct(page);
    await openCart(page);
    await openCheckoutFromCart(page);
    await expect(page.getByRole("heading", { name: lang.title })).toBeVisible();
    await expect(page.getByRole("button", { name: lang.pickup }).first()).toBeVisible();
    await expect(page.getByTestId("checkout-submit")).toContainText(lang.place);
    await page.getByTestId("checkout-back").click();
  }
});
