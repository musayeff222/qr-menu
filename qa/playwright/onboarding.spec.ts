import { test, expect } from "@playwright/test";

test("isolated register → auto login → onboarding → template → product → QR menu → order", async ({
  page,
  request,
}) => {
  const stamp = Date.now();
  const username = `qaonb${stamp}`;
  const password = "QaOnb123!";
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/register");
  await page.getByLabel(/Ad soyad|Full name|ФИО/i).fill("QA Onboarding User");
  await page.getByLabel(/İstifadəçi|Username|Логин|Kullanıcı/i).fill(username);
  await page.getByRole("button", { name: /Növbəti|Next|Далее|İleri/i }).click();
  await page.getByLabel(/Telefon|Phone|Телефон/i).fill("+994501110022");
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("button", { name: /Növbəti|Next|Далее|İleri/i }).click();
  const create = page.getByRole("button", {
    name: /Hesabımı yarat|Create my account|Создать аккаунт|Hesabımı oluştur/i,
  });
  if (await create.isVisible({ timeout: 4000 }).catch(() => false)) {
    await create.click();
  }
  await page.waitForURL(/\/restaurant\/\d+\/onboarding/, { timeout: 25000 });

  const restId = page.url().match(/\/restaurant\/(\d+)/)?.[1];
  expect(restId).toBeTruthy();

  const nameField = page.getByPlaceholder(/Restoran adı|Restaurant name|Название ресторана/i);
  await expect(nameField).toBeVisible({ timeout: 15000 });
  await nameField.fill(`QA Rest ${stamp}`);
  await page.getByRole("button", { name: /Növbəti|Next|Далее|İleri/i }).click();
  await expect(page.getByText(/Menyu link|menu link|ссылк/i).first()).toBeVisible({ timeout: 10000 });
  await page.getByRole("button", { name: /Növbəti|Next|Далее|İleri/i }).click();
  await expect(page.getByText(/Şablon|template|шаблон/i).first()).toBeVisible({ timeout: 10000 });
  const tpl = page.getByRole("button").filter({ hasText: /Bistro Rail|Quick Kiosk|Rail/i }).first();
  if (await tpl.count()) await tpl.click().catch(() => {});
  await page.getByRole("button", { name: /Bitir|Finish|Готово/i }).click();
  await page.waitForURL(new RegExp(`/restaurant/${restId}/?(?:\\?.*)?$`), { timeout: 20000 });

  await page.goto(`/restaurant/${restId}/products/new`);
  await page.getByPlaceholder(/Məhsul|Product|блюда|Ürün/i).first().fill("QA E2E Dish");
  await page.getByPlaceholder(/Qiymət|Price|Цена|Fiyat/i).first().fill("4.5");
  const cat = page.locator("select").filter({
    hasText: /Kateqoriya seçin|Select category|Выберите|Kategori/i,
  }).first();
  await expect.poll(async () => cat.locator("option").count(), { timeout: 15000 }).toBeGreaterThan(1);
  await cat.selectOption({ index: 1 });
  await page.getByRole("button", { name: /Məhsul Əlavə Et|Add Product|Добавить продукт|Ürün Ekle/i }).last().click();
  await expect(page.getByText("QA E2E Dish").first()).toBeVisible({ timeout: 15000 });

  const me = await request.get("/api/restaurant/me", {
    headers: { Authorization: `Bearer ${await page.evaluate(() => localStorage.getItem("restaurantSession") || "")}` },
  });
  expect(me.ok()).toBeTruthy();
  const body = await me.json();
  const slug = body.restaurant?.slug;
  expect(slug).toBeTruthy();

  await page.goto(`/r/${slug}`);
  await page.locator("[data-skin]").waitFor({ timeout: 25000 });
  await expect(page.getByText("QA E2E Dish").first()).toBeVisible();

  const pub = await request.get(`/api/restaurants/${slug}`);
  expect(pub.ok()).toBeTruthy();
  const menu = await pub.json();
  const products = (menu.products || menu.menu?.products || []) as Array<{ id: number; name?: string }>;
  const dish = products.find((p) => String(p.name || "").includes("QA E2E Dish"));
  expect(dish?.id, "QA E2E Dish id").toBeTruthy();

  const order = await request.post(`/api/restaurants/${slug}/orders`, {
    data: {
      device_id: `qa-e2e-${stamp}`,
      order_type: "pickup",
      payment_method: "cash",
      order_source: "web",
      customer_name: "QA E2E Musteri",
      customer_phone: "+994501110022",
      address_text: "",
      geo_url: "",
      note: "isolated onboarding e2e",
      total_amount: 4.5,
      cart: [
        {
          line_id: `qa-e2e-${stamp}`,
          product_id: dish!.id,
          label: "QA E2E Dish",
          variant_id: null,
          qty: 1,
          unit_price: 4.5,
          note: "",
        },
      ],
    },
  });
  expect(order.ok(), await order.text()).toBeTruthy();
});
