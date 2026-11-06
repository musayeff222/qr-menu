import fs from "node:fs";
import path from "node:path";
import { expect, type Page } from "@playwright/test";
import { DEMO_SLUG, type SkinId } from "./skins";

const ADD_RE =
  /^(Əlavə et|Sifarişə əlavə et|Add to cart|Добавить|Sepete ekle|\+)$/i;
const ADD_ARIA = /Əlavə et|Sifarişə əlavə et|Add to cart|Добавить|Sepete ekle/;
const CART_ARIA = /^(Səbət|Cart|Корзина|Sepet)$/;

export function guestUrl(skin: SkinId) {
  return `/r/${DEMO_SLUG}?preview=true&previewTemplate=${skin}`;
}

export async function waitForMedia(page: Page) {
  await page.evaluate(async () => {
    await (document.fonts?.ready ?? Promise.resolve());
    const imgs = [...document.images];
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((res) => {
            if (img.complete) {
              res();
              return;
            }
            const done = () => {
              clearTimeout(t);
              res();
            };
            const t = setTimeout(done, 6000);
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
          })
      )
    );
  });
}

export async function collapsedImages(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("[data-skin] img")].filter((img) => {
      const r = img.getBoundingClientRect();
      return r.width > 80 && r.height < 12;
    }).length
  );
}

export async function openSkin(page: Page, skin: SkinId) {
  await page.goto(guestUrl(skin), { waitUntil: "domcontentloaded" });
  await page.locator(`[data-skin="${skin}"]`).waitFor({ timeout: 25000 });
  await waitForMedia(page);
}

export async function overflowReport(page: Page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const pageExtra = (document.body?.scrollWidth || 0) - vw;
    let boxExtra = 0;
    const overflowing: Array<{ tag: string; className: string; extra: number }> = [];
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      let clipped = false;
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip") {
          clipped = true;
          break;
        }
      }
      if (clipped) continue;
      const r = el.getBoundingClientRect();
      const extra = r.right - vw;
      if (extra > 8) {
        overflowing.push({
          tag: el.tagName,
          className: String((el as HTMLElement).className || "").slice(0, 80),
          extra: Math.round(extra),
        });
      }
      boxExtra = Math.max(boxExtra, extra);
    }
    overflowing.sort((a, b) => b.extra - a.extra);
    return {
      extra: Math.max(pageExtra, boxExtra),
      pageExtra,
      boxExtra,
      overflowing: overflowing.slice(0, 8),
    };
  });
}

export async function overflowPx(page: Page) {
  const r = await overflowReport(page);
  return r.extra;
}

export async function layoutFingerprint(page: Page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-skin]") as HTMLElement | null;
    if (!root) return { skin: "", marker: "", bg: "", primary: "", layout: "" };
    const cs = getComputedStyle(root);
    const marked = root.querySelector("[class*='skin-']") as HTMLElement | null;
    const marker = (marked?.className || "").toString().match(/skin-[a-z0-9-]+/)?.[0] || "";
    const nodes = [...root.querySelectorAll("h1, nav, header, article, ul, section, button")].slice(0, 48);
    const layout = nodes
      .map((el) => {
        const r = el.getBoundingClientRect();
        return `${el.tagName}:${Math.round(r.x / 4) * 4}:${Math.round(r.y / 4) * 4}:${Math.round(r.width / 8) * 8}:${Math.round(r.height / 8) * 8}`;
      })
      .join("|");
    return {
      skin: root.getAttribute("data-skin") || "",
      marker,
      bg: cs.backgroundColor,
      primary: cs.getPropertyValue("--mt-primary").trim(),
      layout,
    };
  });
}

export async function visibleProductCount(page: Page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-skin]");
    if (!root) return 0;
    const articles = root.querySelectorAll("article").length;
    const priced = [...root.querySelectorAll("button, p, span, li, article")].filter((el) =>
      /₼\d/.test(el.textContent || "")
    ).length;
    return Math.max(articles, priced);
  });
}

export async function categoryCount(page: Page) {
  return page.locator("[data-skin] nav button").count();
}

async function clickVisibleAdd(page: Page) {
  const dlg = page.getByRole("dialog");
  if (await dlg.isVisible().catch(() => false)) {
    const inDlg = dlg.getByRole("button", { name: ADD_ARIA });
    if ((await inDlg.count()) > 0) {
      await inDlg.first().click();
      return true;
    }
  }
  const candidates = page.locator("[data-skin] button");
  const n = await candidates.count();
  for (let i = 0; i < n; i++) {
    const btn = candidates.nth(i);
    if (!(await btn.isVisible().catch(() => false))) continue;
    const label = (await btn.getAttribute("aria-label")) || "";
    const text = ((await btn.textContent()) || "").trim();
    if (ADD_ARIA.test(label) || ADD_RE.test(text)) {
      await btn.click({ timeout: 4000 }).catch(async () => btn.click({ force: true }));
      return true;
    }
  }
  return false;
}

export async function expandThenAdd(page: Page) {
  if (await clickVisibleAdd(page)) return;

  const expanded = await page.evaluate(() => {
    const root = document.querySelector("[data-skin]");
    if (!root) return false;
    const nav = root.querySelector("nav");
    const btns = [...root.querySelectorAll("button")].filter((b) => {
      if (nav?.contains(b)) return false;
      const t = (b.textContent || "").trim();
      if (!t || t.length > 80) return false;
      if (/^(AZ|EN|RU|TR|\+)$/i.test(t)) return false;
      const r = b.getBoundingClientRect();
      return r.width > 8 && r.height > 8;
    });
    const target = btns[0];
    if (!target) return false;
    (target as HTMLButtonElement).click();
    return true;
  });
  if (expanded) {
    await page.waitForTimeout(250);
    if (await clickVisibleAdd(page)) return;
  }
  throw new Error("Add button not found");
}

export async function pickVariantIfOpen(page: Page, shotPath?: string) {
  const dlg = page.getByRole("dialog").filter({
    hasText: /Çeşid|Ölçü|Variant|вариант|çeşit|Boyut|Choose size/i,
  });
  try {
    await dlg.waitFor({ state: "visible", timeout: 2500 });
  } catch {
    return false;
  }
  if (shotPath) {
    await page.screenshot({ path: shotPath, animations: "disabled" });
  }
  const opt = dlg.locator("button").filter({ hasText: /₼/ }).first();
  await opt.click();
  await dlg.waitFor({ state: "hidden", timeout: 3000 }).catch(() => {});
  return true;
}

export async function addFirstProduct(page: Page) {
  await expandThenAdd(page);
  await page.waitForTimeout(200);
  await pickVariantIfOpen(page);
  await page.waitForTimeout(200);
}

export async function addNamedProduct(page: Page, name: RegExp, variantShot?: string) {
  const named = page.locator("[data-skin] button, [data-skin] p, [data-skin] h3, [data-skin] article").filter({
    hasText: name,
  });
  if ((await named.count()) === 0) {
    const cats = page.locator("[data-skin] nav button");
    const n = await cats.count();
    for (let i = 0; i < n; i++) {
      await cats.nth(i).click();
      await page.waitForTimeout(200);
      if ((await named.count()) > 0) break;
    }
  }
  expect(await named.count(), `product ${name} not in any category`).toBeGreaterThan(0);
  const article = page.locator("[data-skin] article").filter({ hasText: name }).first();
  const addInArticle = article.getByRole("button", { name: ADD_ARIA });
  if ((await addInArticle.count()) > 0 && (await addInArticle.first().isVisible().catch(() => false))) {
    await addInArticle.first().click();
  } else {
    await named.first().click();
    await page.waitForTimeout(250);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
    if (!(await clickVisibleAdd(page))) {
      await expandThenAdd(page);
    }
  }
  const picked = await pickVariantIfOpen(page, variantShot);
  if (variantShot) {
    expect(picked, `variant dialog for ${name} (${variantShot})`).toBeTruthy();
    expect(fs.existsSync(variantShot), `variant screenshot ${variantShot}`).toBeTruthy();
  }
  return picked;
}

export async function openCart(page: Page) {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(150);
  const labeled = page.getByRole("button", { name: CART_ARIA });
  if ((await labeled.count()) > 0 && (await labeled.first().isVisible().catch(() => false))) {
    await labeled.first().click({ force: true });
    return;
  }
  const named = page.locator("[data-skin] button").filter({
    hasText: /^(Səbət|Cart|Корзина|Sepet)\b|ədəd|Günün sifarişi/i,
  });
  if ((await named.count()) > 0) {
    await named.last().click();
    return;
  }
  throw new Error("Cart trigger not found");
}

export async function cartHasLine(page: Page) {
  const dlg = page.getByRole("dialog").filter({ hasText: /Səbət|Cəmi|Cart|Корзина|Sepet/ });
  if (await dlg.isVisible().catch(() => false)) {
    const empty = await dlg
      .getByText(/Səbət boşdur|Cart is empty|Корзина пуста|Sepet boş/i)
      .isVisible()
      .catch(() => false);
    return !empty;
  }
  const empty = await page
    .getByText(/Səbət boşdur/i)
    .isVisible()
    .catch(() => false);
  if (empty) return false;
  return (await page.getByText(/Cəmi|Total|Итого|Toplam/i).count()) > 0;
}

export function writeJson(rel: string, data: unknown) {
  const p = path.resolve(rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}
