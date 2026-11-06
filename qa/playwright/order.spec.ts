import { test, expect } from "@playwright/test";
import { DEMO_SLUG } from "./skins";
import { openSkin } from "./helpers";

test("isolated web order POST on local demo restaurant", async ({ request }) => {
  const stamp = Date.now();
  const res = await request.post(`/api/restaurants/${DEMO_SLUG}/orders`, {
    data: {
      device_id: `qa-pw-${stamp}`,
      order_type: "pickup",
      payment_method: "cash",
      order_source: "web",
      customer_name: "QA Playwright Musteri",
      customer_phone: "+994501119911",
      address_text: "",
      geo_url: "",
      note: "QA playwright isolated order",
      total_amount: 9.5,
      cart: [
        {
          line_id: `qa-pw-${stamp}`,
          product_id: 4,
          label: "QA Düşbərə",
          variant_id: null,
          qty: 1,
          unit_price: 9.5,
          note: "QA test qeydi",
        },
      ],
    },
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  const body = await res.json();
  const id = body.id || body.order?.id;
  expect(id, JSON.stringify(body)).toBeTruthy();
});

test("orders_allowed=false disables add-to-cart", async ({ page }) => {
  await page.route(`**/api/restaurants/${DEMO_SLUG}*`, async (route) => {
    const res = await route.fetch();
    const json = await res.json();
    json.orders_allowed = false;
    await route.fulfill({
      status: res.status(),
      contentType: "application/json",
      body: JSON.stringify(json),
    });
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await openSkin(page, "bistro-split");
  const add = page.getByRole("button", { name: /Əlavə et/i }).first();
  await expect(add).toBeDisabled();
  const before = await page.locator("[data-skin]").innerText();
  await add.click({ force: true }).catch(() => {});
  await page.waitForTimeout(300);
  const cartOpen = await page.getByRole("dialog").filter({ hasText: /Səbət/ }).isVisible().catch(() => false);
  if (cartOpen) {
    await expect(page.getByText(/Səbət boşdur/i)).toBeVisible();
  }
  expect(before.length).toBeGreaterThan(0);
});

test("lazy chunk: visiting one skin does not fetch all 30 Skin-*.js", async ({ page }) => {
  const skinChunks: string[] = [];
  page.on("response", (res) => {
    const url = res.url();
    if (/Skin-.*\.js/.test(url) && res.ok()) skinChunks.push(url);
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/r/${DEMO_SLUG}?preview=true&previewTemplate=bistro-rail`);
  await page.locator('[data-skin="bistro-rail"]').waitFor();
  await page.waitForTimeout(1500);
  const unique = [...new Set(skinChunks)];
  expect(unique.length, unique.join("\n")).toBeLessThanOrEqual(2);
});
