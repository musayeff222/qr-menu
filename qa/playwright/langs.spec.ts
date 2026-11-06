import { test, expect } from "@playwright/test";
import { addFirstProduct, openCart, openSkin } from "./helpers";

const LANGS = [
  {
    id: "az",
    register: "Restoran hesabı yaradın",
    panelLogin: /Restoran panelinə giriş/,
    add: /Əlavə et/,
    cart: /Səbət/,
    checkout: /Sifarişi tamamla/,
    pickup: /Məkandan götür/,
  },
  {
    id: "en",
    register: "Create account",
    panelLogin: /Restaurant login/,
    add: /Add to cart/,
    cart: /^Cart$/,
    checkout: /Complete order/,
    pickup: /Pickup/,
  },
  {
    id: "ru",
    register: "Регистрация",
    panelLogin: /Вход для ресторана/,
    add: /Добавить/,
    cart: /Корзина/,
    checkout: /Оформить заказ/,
    pickup: /Самовывоз/,
  },
  {
    id: "tr",
    register: "Hesap oluştur",
    panelLogin: /Restoran girişi/,
    add: /Sepete ekle/,
    cart: /^Sepet$/,
    checkout: /Siparişi tamamla/,
    pickup: /Gel al/,
  },
] as const;

test.describe.configure({ mode: "serial" });

for (const lang of LANGS) {
  test(`${lang.id} register + panel + guest menu/cart/checkout copy`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.locator("select[aria-label]").first().selectOption(lang.id);
    await page.waitForTimeout(200);

    await page.goto("/register");
    await page.locator('select[aria-label]').first().selectOption(lang.id);
    await expect(page.getByText(lang.register).first()).toBeVisible();

    await page.goto("/panel");
    await page.locator('select[aria-label]').first().selectOption(lang.id);
    await expect(page.locator("body")).toContainText(lang.panelLogin);

    await page.locator("#rest-login-user").fill("demo");
    await page.locator("#rest-login-pass").fill("demo123");
    await page.getByRole("button", { name: /Daxil ol|Login|Giriş|Sign in|Войти/i }).click();
    await page.waitForURL(/\/restaurant\/\d+/, { timeout: 20000 });
    if (page.url().includes("/onboarding")) {
      await page.getByRole("link", { name: /Sonra|Later|Позже/i }).click();
      await page.waitForURL(/\/restaurant\/\d+\/?(?:\?.*)?$/, { timeout: 15000 });
    }
    await page
      .locator("select")
      .filter({ has: page.locator('option[value="en"]') })
      .locator("visible=true")
      .first()
      .selectOption(lang.id);
    await page.waitForTimeout(300);
    await expect(page.locator("body")).not.toContainText("undefined");

    await openSkin(page, "bistro-split");
    await page.locator('select[aria-label="Dil"]').first().selectOption(lang.id);
    await expect(page.getByRole("button", { name: lang.add }).first()).toBeVisible();
    await page.locator("[data-skin] article button").filter({ hasText: /Plov/i }).first().click();
    await expect(page.getByRole("dialog").getByText(/Plov/i).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    await addFirstProduct(page);
    await openCart(page);
    await expect(page.getByRole("button", { name: lang.checkout }).first()).toBeVisible();
    await page.getByRole("button", { name: lang.checkout }).first().click();
    await expect(page.getByRole("button", { name: lang.pickup }).first()).toBeVisible();
  });
}
