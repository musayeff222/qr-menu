import { test, expect } from "@playwright/test";
import { DEMO_SLUG, SKIN_IDS, type SkinId } from "./skins";

function canonicalTemplate(id: string) {
  const x = String(id || "").toLowerCase();
  if (x === "fastfood-pro" || x.includes("fast-food") || x.includes("fastfood")) return "fastfood-pro";
  if (x === "ocean-modern" || x.includes("ocean")) return "ocean-modern";
  return "bella-classic";
}

async function loginDemoPanel(page: import("@playwright/test").Page) {
  await page.goto("/panel");
  await page.locator("#rest-login-user").fill("demo");
  await page.locator("#rest-login-pass").fill("demo123");
  await page.getByRole("button", { name: /Daxil ol|Login|Giriş/i }).click();
  try {
    await page.waitForURL(/\/restaurant\/\d+/, { timeout: 20000 });
  } catch {
    await page.waitForTimeout(1500);
    await page.getByRole("button", { name: /Daxil ol|Login|Giriş/i }).click();
    await page.waitForURL(/\/restaurant\/\d+/, { timeout: 25000 });
  }
  if (page.url().includes("/onboarding")) {
    await page.getByRole("link", { name: /Sonra|Later|Позже/i }).click();
    await page.waitForURL(/\/restaurant\/\d+\/?(?:\?.*)?$/, { timeout: 15000 });
  }
  return page.url().match(/\/restaurant\/(\d+)/)?.[1] || "";
}

async function openStudioPreview(page: import("@playwright/test").Page, skin: SkinId) {
  await page.locator(`article[title="${skin}"]`).getByRole("button", { name: /Önizləmə|Preview|Предпросмотр/i }).click();
  await expect(page.getByTestId("studio-preview-overlay")).toBeVisible();
  const frame = page.frameLocator('[data-testid="studio-preview-frame"]');
  await frame.locator(`[data-skin="${skin}"]`).first().waitFor({ timeout: 25000 });
  return frame;
}

test("panel Önizle: 3 skins, selected+unselected, 375/1280, signed ticket, no real order", async ({
  page,
  request,
}) => {
  const beforeRes = await request.get(`/api/restaurants/${DEMO_SLUG}?preview=true`);
  expect(beforeRes.ok()).toBeTruthy();
  const beforeMenu = await beforeRes.json();
  const savedTemplate = canonicalTemplate(String(beforeMenu.menu_template || ""));
  const ownNames = ((beforeMenu.products || []) as Array<{ name?: string }>)
    .map((p) => String(p.name || ""))
    .filter(Boolean);
  expect(ownNames.length, "restaurant products").toBeGreaterThan(0);

  await page.setViewportSize({ width: 375, height: 812 });
  const id = await loginDemoPanel(page);
  expect(id).toBeTruthy();
  await page.goto(`/restaurant/${id}/templates`);

  for (const skin of SKIN_IDS) {
    await page.setViewportSize({ width: 375, height: 812 });
    const frame = await openStudioPreview(page, skin as SkinId);
    const iframe = page.getByTestId("studio-preview-frame");
    await expect(iframe).toHaveAttribute("src", new RegExp(`/r/${DEMO_SLUG}.*studioPreview=1`));
    await expect(iframe).toHaveAttribute("src", new RegExp(`previewTemplate=${skin}`));
    await expect(iframe).toHaveAttribute("src", /[?&]pt=pt1\./);
    await expect(frame.getByText(ownNames[0]!, { exact: false }).first()).toBeVisible();

    const src = (await iframe.getAttribute("src")) || "";
    const pt = new URL(src, "http://127.0.0.1:3010").searchParams.get("pt") || "";
    expect(pt.startsWith("pt1."), `${skin} signed preview ticket`).toBeTruthy();

    const ticketBlock = await request.post(`/api/restaurants/${DEMO_SLUG}/orders`, {
      data: {
        device_id: `qa-preview-${skin}`,
        customer_name: "QA Studio Preview",
        customer_phone: "994501119900",
        order_type: "pickup",
        payment_method: "cash",
        preview_ticket: pt,
        cart: [{ product_id: 1, qty: 1 }],
      },
      headers: { "X-MenuGo-Preview-Ticket": pt },
    });
    expect(ticketBlock.status(), `${skin} signed ticket must block order`).toBe(403);
    const ticketJson = await ticketBlock.json();
    expect(String(ticketJson.code || "")).toBe("PREVIEW_READONLY");

    let posted = false;
    await page.route(`**/api/restaurants/${DEMO_SLUG}/orders**`, async (route) => {
      if (route.request().method() === "POST") posted = true;
      await route.continue();
    });

    const add = frame.getByRole("button", { name: /Əlavə et|Add to cart|Добавить|Sepete ekle/i }).first();
    await expect(add).toBeVisible();
    await add.click();
    const variantDlg = frame.getByRole("dialog").filter({
      hasText: /Çeşid|Ölçü|Variant|вариант|çeşit|Boyut|Choose size/i,
    });
    try {
      await variantDlg.waitFor({ state: "visible", timeout: 2500 });
      await variantDlg.getByRole("button", { name: /₼/ }).first().click();
      await variantDlg.waitFor({ state: "hidden", timeout: 4000 }).catch(() => {});
    } catch {
      /* no variant sheet */
    }
    await frame.getByRole("button", { name: /^(Səbət|Cart|Корзина|Sepet)$/ }).click();
    await frame
      .getByRole("button", { name: /Sifarişi tamamla|Complete order|Оформить заказ|Siparişi tamamla/i })
      .click();
    await expect(frame.locator('[data-checkout="full"]')).toBeVisible();
    await expect(frame.locator("[data-checkout-footer]")).toBeVisible();
    await frame.getByPlaceholder(/Ad soyad|Full name|ФИО/i).fill("QA Studio Preview");
    await frame.getByPlaceholder("+994...").fill("994501119900");
    await frame.getByTestId("checkout-submit").click();
    await expect(frame.getByTestId("checkout-error")).toBeVisible();
    await expect(frame.getByTestId("checkout-success")).toHaveCount(0);
    expect(posted, `${skin} client must short-circuit (no order POST)`).toBeFalsy();
    await page.unroute(`**/api/restaurants/${DEMO_SLUG}/orders**`);

    await page.setViewportSize({ width: 1280, height: 860 });
    await expect(page.getByTestId("studio-preview-overlay")).toBeVisible();
    await expect(frame.locator(`[data-skin="${skin}"]`).first()).toBeVisible();

    await page.getByTestId("studio-preview-back").click();
    await expect(page.getByTestId("studio-preview-overlay")).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/restaurant/${id}/templates`));
  }

  const other = SKIN_IDS.find((s) => s !== savedTemplate) || "ocean-modern";
  await openStudioPreview(page, other);
  await page.getByTestId("studio-preview-back").click();
  await openStudioPreview(page, savedTemplate as SkinId);
  await page.getByTestId("studio-preview-back").click();

  const afterRes = await request.get(`/api/restaurants/${DEMO_SLUG}?preview=true`);
  const afterMenu = await afterRes.json();
  expect(canonicalTemplate(String(afterMenu.menu_template || ""))).toBe(savedTemplate);
});
