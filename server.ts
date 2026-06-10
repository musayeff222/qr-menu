import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";
import multer from "multer";
import QRCode from "qrcode";
import { db, initDatabase, getUiTranslationsForApi, getDbDriver } from "./database.js";
import { templateSelectionError } from "./planTemplatePolicy.js";
import { DEMO_AZ_SLUG, DEMO_QR_PUBLIC_SLUG } from "./demoConstants.js";
import { seedDemoAzMenu } from "./demoMenuSeed.js";

console.log("Server script started.");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Hostinger: NODE_ENV olmasa belə dist/ varsa production static. */
function useProductionStatic(): boolean {
  if (process.env.NODE_ENV === "production") return true;
  if (process.env.NODE_ENV === "development") return false;
  return fs.existsSync(path.join(process.cwd(), "dist", "index.html"));
}

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

type Session =
  | { kind: "super"; userId: number; username: string }
  | { kind: "restaurant"; restaurantId: number; username: string };

const sessions = new Map<string, { session: Session; expires: number }>();

function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}

function storeSession(session: Session): string {
  const token = createSessionToken();
  sessions.set(token, { session, expires: Date.now() + SESSION_MS });
  return token;
}

function getBearer(req: express.Request): string | null {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice(7).trim();
}

function getSession(req: express.Request): Session | null {
  const token = getBearer(req);
  if (!token) return null;
  const rec = sessions.get(token);
  if (!rec || rec.expires < Date.now()) {
    if (rec) sessions.delete(token);
    return null;
  }
  return rec.session;
}

function requireSuper(req: express.Request, res: express.Response): Session | null {
  const s = getSession(req);
  if (!s || s.kind !== "super") {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return s;
}

function requireRestaurantOrSuper(
  req: express.Request,
  res: express.Response,
  restaurantId: number
): boolean {
  const s = getSession(req);
  if (!s) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  if (s.kind === "super") return true;
  if (s.kind === "restaurant" && s.restaurantId === restaurantId) return true;
  res.status(403).json({ error: "Forbidden" });
  return false;
}

function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (raw == null || raw === "") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

type PlanRow = {
  id: number;
  max_products: number;
  max_categories: number;
  max_templates: number;
  max_qr_codes: number;
  whatsapp_order_enabled: number | boolean;
  reservation_enabled: number | boolean;
  analytics_enabled: number | boolean;
  premium_templates_enabled: number | boolean;
  price_monthly: string | number;
};

async function getRestaurantWithPlan(restaurantId: number) {
  const restaurant = await db("restaurants").where({ id: restaurantId }).first();
  if (!restaurant) return { restaurant: null as any, plan: null as PlanRow | null };
  let plan: PlanRow | undefined;
  if (restaurant.subscription_plan_id) {
    plan = (await db("subscription_plans")
      .where({ id: restaurant.subscription_plan_id, is_active: true })
      .first()) as PlanRow | undefined;
  }
  if (!plan) {
    plan = (await db("subscription_plans").where({ slug: "free", is_active: true }).first()) as
      | PlanRow
      | undefined;
  }
  let merged = plan ?? null;
  if (merged && restaurant?.subscription_overrides) {
    const ov = safeJsonParse<Record<string, unknown>>(String(restaurant.subscription_overrides), {});
    const pickNum = (k: keyof PlanRow): number => {
      if (ov[k] != null && !Number.isNaN(Number(ov[k]))) return Number(ov[k]);
      return Number(merged![k]);
    };
    merged = {
      ...merged,
      max_products: pickNum("max_products"),
      max_categories: pickNum("max_categories"),
      max_templates: pickNum("max_templates"),
      max_qr_codes: pickNum("max_qr_codes"),
    };
  }
  return { restaurant, plan: merged };
}

function asBool(v: unknown): boolean {
  return v === true || v === 1 || v === "1";
}

async function countWhere(table: string, w: Record<string, unknown>) {
  const row = await db(table).where(w).count("* as c").first();
  return Number((row as { c?: string | number })?.c ?? 0);
}

async function bumpAnalyticsMetric(metric: string) {
  const day = new Date().toISOString().slice(0, 10);
  const existing = await db("analytics_daily").where({ day, metric }).first();
  if (existing) {
    await db("analytics_daily")
      .where({ day, metric })
      .update({ value: Number((existing as { value?: number }).value ?? 0) + 1 });
  } else {
    await db("analytics_daily").insert({ day, metric, value: 1 });
  }
}

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function ordersAllowedForRestaurant(r: Record<string, unknown>): boolean {
  if (!asBool(r.strict_opening_hours)) return true;
  const raw = (r.opening_hours as string) || "";
  if (!raw.trim()) return true;
  let parsed: { slots?: Record<string, Array<{ open: string; close: string }>> };
  try {
    parsed = JSON.parse(raw) as { slots?: Record<string, Array<{ open: string; close: string }>> };
  } catch {
    return true;
  }
  const slots = parsed.slots;
  if (!slots || typeof slots !== "object") return true;
  const key = DAY_KEYS[new Date().getDay()];
  const daySlots = slots[key];
  if (!daySlots || daySlots.length === 0) return false;
  const n = new Date().getHours() * 60 + new Date().getMinutes();
  for (const slot of daySlots) {
    const [oh, om] = String(slot.open).split(":").map((x) => Number(x));
    const [ch, cm] = String(slot.close).split(":").map((x) => Number(x));
    if (Number.isNaN(oh) || Number.isNaN(om) || Number.isNaN(ch) || Number.isNaN(cm)) continue;
    const a = oh * 60 + om;
    const b = ch * 60 + cm;
    if (a <= n && n <= b) return true;
  }
  return false;
}

function isProductActiveNow(product: Record<string, unknown>): boolean {
  if (!asBool(product.active_hours_enabled)) return true;
  const from = String(product.active_from || "");
  const to = String(product.active_to || "");
  if (!from || !to) return true;
  const [fh, fm] = from.split(":").map((x) => Number(x));
  const [th, tm] = to.split(":").map((x) => Number(x));
  if ([fh, fm, th, tm].some((x) => Number.isNaN(x))) return true;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const start = fh * 60 + fm;
  const end = th * 60 + tm;
  if (start <= end) return cur >= start && cur <= end;
  return cur >= start || cur <= end;
}

async function attachVariantsToProducts(
  parsedProducts: Array<Record<string, unknown>>
): Promise<Array<Record<string, unknown>>> {
  if (parsedProducts.length === 0) return parsedProducts;
  const ids = parsedProducts.map((p) => Number(p.id)).filter((x) => !Number.isNaN(x));
  if (!ids.length) return parsedProducts.map((p) => ({ ...p, variants: [] }));
  const rows = await db("product_variants").whereIn("product_id", ids).orderBy("sort_order");
  const m = new Map<number, typeof rows>();
  for (const row of rows) {
    const pid = Number((row as { product_id: number }).product_id);
    if (!m.has(pid)) m.set(pid, []);
    m.get(pid)!.push(row);
  }
  return parsedProducts.map((p) => ({ ...p, variants: m.get(Number(p.id)) || [] }));
}

async function startServer() {
  console.log("Starting server initialization...");
  try {
    await initDatabase();
    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Database initialization failed:", err);
    process.exit(1);
  }

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  const uploadsDir = path.join(process.cwd(), "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });
  const uploadStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      cb(null, `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`);
    },
  });
  const upload = multer({
    storage: uploadStorage,
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ok =
        /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype) ||
        /^video\/(mp4|webm|quicktime)$/i.test(file.mimetype);
      cb(null, ok);
    },
  });

  app.use(express.json());
  app.use("/uploads", express.static(uploadsDir));
  console.log("Express middleware configured.");

  app.post("/api/public/analytics/ping", async (req, res) => {
    try {
      const p = String(req.body?.path ?? "/").slice(0, 120);
      const metric = p === "/" || p === "" ? "landing_hit" : `page:${p}`;
      await bumpAnalyticsMetric(metric);
      res.json({ ok: true });
    } catch {
      res.status(500).json({ ok: false });
    }
  });

  app.post("/api/public/demo-visit", async (req, res) => {
    try {
      const slug = String(req.body?.slug || DEMO_QR_PUBLIC_SLUG).trim().slice(0, 64);
      if (!slug) {
        res.status(400).json({ ok: false });
        return;
      }
      const sessionKey = req.body?.sessionKey
        ? String(req.body.sessionKey).trim().slice(0, 80)
        : null;
      await db("demo_link_visits").insert({
        demo_slug: slug,
        session_key: sessionKey || null,
      });
      await bumpAnalyticsMetric("demo_link_hit");
      res.json({ ok: true });
    } catch {
      res.status(500).json({ ok: false });
    }
  });

  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of sessions) {
      if (v.expires < now) sessions.delete(k);
    }
  }, 60_000).unref?.();

  app.get("/api/health", async (_req, res) => {
    const driver = getDbDriver();
    const t0 = Date.now();
    try {
      await db.raw(driver === "mysql" ? "SELECT 1 AS ok" : "SELECT 1");
      res.json({
        ok: true,
        database: "connected",
        driver,
        latencyMs: Date.now() - t0,
      });
    } catch (e) {
      res.status(503).json({
        ok: false,
        database: "error",
        driver,
        message: String(e),
      });
    }
  });

  app.get("/api/ui-translations", async (_req, res) => {
    try {
      const data = await getUiTranslationsForApi();
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Failed to load translations" });
    }
  });

  app.get("/api/public/settings", async (_req, res) => {
    try {
      const rows = await db("settings")
        .select("key", "value")
        .whereIn("key", ["default_language", "supported_languages", "seed_demo_on_create"]);
      const map: Record<string, string> = {};
      for (const r of rows as { key: string; value: string }[]) {
        map[r.key] = r.value;
      }
      res.json(map);
    } catch (e) {
      res.status(500).json({ error: "Failed to load settings" });
    }
  });

  app.get("/api/public/landing-cms", async (_req, res) => {
    try {
      const row = await db("settings").where({ key: "landing_cms" }).first();
      const raw = (row as { value?: string } | undefined)?.value;
      let parsed: Record<string, unknown> = {};
      if (raw && String(raw).trim()) {
        try {
          parsed = JSON.parse(String(raw)) as Record<string, unknown>;
        } catch {
          parsed = {};
        }
      }
      res.json(parsed);
    } catch {
      res.json({});
    }
  });

  app.get("/api/public/plans", async (_req, res) => {
    try {
      const rows = await db("subscription_plans")
        .where({ is_active: true })
        .orderBy("sort_order", "asc")
        .select("*");
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: "Failed to load plans" });
    }
  });

  app.post("/api/public/register", async (req, res) => {
    const { full_name, username, password, phone } = req.body;
    if (!full_name || !username || !password || !phone) {
      res.status(400).json({ error: "Ad soyad, login, parol və telefon tələb olunur" });
      return;
    }
    const uname = String(username).toLowerCase().trim().slice(0, 64);
    const takenUser = await db("restaurant_users").where({ username: uname }).first();
    if (takenUser) {
      res.status(400).json({ error: "Bu login artıq götürülüb" });
      return;
    }
    let slugBase = uname.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "restoran";
    let slug = slugBase;
    let n = 0;
    while (await db("restaurants").where({ slug }).first()) {
      n++;
      slug = `${slugBase}-${n}`;
    }
    const freePlan = await db("subscription_plans").where({ slug: "free" }).first();
    const planId = freePlan?.id ?? null;
    const wa = String(phone).replace(/\D/g, "");
    try {
      let newId = 0;
      await db.transaction(async (trx) => {
        const ids = await trx("restaurants").insert({
          name: "Yeni restoran",
          slug,
          whatsapp_number: wa || null,
          phone: String(phone).slice(0, 64),
          menu_template: "modern-01",
          subscription_plan_id: planId,
          onboarding_completed: false,
        });
        newId = Number(Array.isArray(ids) ? ids[0] : ids);
        await trx("restaurant_users").insert({
          restaurant_id: newId,
          username: uname,
          password: String(password),
          full_name: String(full_name).slice(0, 200),
        });
      });
      const seedRow = await db("settings").where({ key: "seed_demo_on_create" }).first();
      const defaultSeed = (seedRow as { value?: string } | undefined)?.value !== "false";
      if (defaultSeed && newId) {
        const pl = planId
          ? await db("subscription_plans").where({ id: planId }).first()
          : await db("subscription_plans").where({ slug: "free" }).first();
        const mc = pl ? Number(pl.max_categories) : 5;
        const mp = pl ? Number(pl.max_products) : 20;
        await seedDemoAzMenu(db, newId, {
          maxCategories: mc < 0 ? undefined : mc,
          maxProducts: mp < 0 ? undefined : mp,
        });
      }
      res.json({ success: true, restaurantId: newId, slug });
    } catch (e) {
      console.error(e);
      res.status(400).json({ error: "Qeydiyyat tamamlanmadı" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await db("admin_users").where({ username, password }).first();
    if (user) {
      const token = storeSession({
        kind: "super",
        userId: user.id,
        username: user.username,
      });
      res.json({
        success: true,
        token,
        user: { id: user.id, username: user.username },
      });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  });

  app.post("/api/restaurant/login", async (req, res) => {
    const { username, password } = req.body;
    const row = await db("restaurant_users")
      .where({ username, password })
      .first();
    if (!row) {
      res.status(401).json({ success: false, error: "Invalid credentials" });
      return;
    }
    await db("restaurant_users").where({ id: row.id }).update({ last_login_at: db.fn.now() });
    const token = storeSession({
      kind: "restaurant",
      restaurantId: row.restaurant_id,
      username: row.username,
    });
    res.json({
      success: true,
      token,
      restaurantId: row.restaurant_id,
    });
  });

  app.get("/api/restaurant/me", async (req, res) => {
    const s = getSession(req);
    if (!s || s.kind !== "restaurant") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const restaurant = await db("restaurants")
      .where({ id: s.restaurantId })
      .first();
    if (!restaurant) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ restaurant, username: s.username });
  });

  app.get("/api/restaurant/owner-notifications", async (req, res) => {
    const s = getSession(req);
    if (!s || s.kind !== "restaurant") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const rows = await db("owner_notifications")
      .where({ restaurant_id: s.restaurantId })
      .orderBy("id", "desc")
      .limit(100);
    res.json(rows);
  });

  app.patch("/api/restaurant/owner-notifications/:id/read", async (req, res) => {
    const s = getSession(req);
    if (!s || s.kind !== "restaurant") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const nid = Number(req.params.id);
    const row = await db("owner_notifications").where({ id: nid }).first();
    if (!row || Number(row.restaurant_id) !== s.restaurantId) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    await db("owner_notifications").where({ id: nid }).update({ is_read: true });
    res.json({ success: true });
  });

  app.post("/api/upload", upload.single("file"), (req, res) => {
    const s = getSession(req);
    if (!s) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!req.file) {
      res
        .status(400)
        .json({ error: "Media faylı tələb olunur (JPEG, PNG, WebP, GIF, MP4, WebM, MOV)" });
      return;
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  app.put("/api/admin/restaurants/:id/profile", async (req, res) => {
    const id = Number(req.params.id);
    if (!requireRestaurantOrSuper(req, res, id)) return;
    const {
      name,
      slug,
      whatsapp_number,
      primary_color,
      menu_template,
      tagline,
      maps_url,
      phone,
      reservation_url,
      instagram,
      tiktok,
      facebook,
      social_instagram_visible,
      social_tiktok_visible,
      social_facebook_visible,
      logo_url,
      cover_image_url,
      opening_hours,
      strict_opening_hours,
      onboarding_completed,
    } = req.body;
    const patch: Record<string, unknown> = {};
    if (typeof name === "string") patch.name = name;
    if (typeof whatsapp_number === "string")
      patch.whatsapp_number = whatsapp_number;
    if (typeof primary_color === "string") patch.primary_color = primary_color;
    if (typeof tagline === "string") patch.tagline = tagline;
    if (typeof maps_url === "string") patch.maps_url = maps_url;
    if (typeof phone === "string") patch.phone = phone;
    if (typeof reservation_url === "string") patch.reservation_url = reservation_url;
    if (typeof instagram === "string") patch.instagram = instagram;
    if (typeof tiktok === "string") patch.tiktok = tiktok;
    if (typeof facebook === "string") patch.facebook = facebook;
    if (typeof social_instagram_visible === "boolean")
      patch.social_instagram_visible = social_instagram_visible;
    if (typeof social_tiktok_visible === "boolean")
      patch.social_tiktok_visible = social_tiktok_visible;
    if (typeof social_facebook_visible === "boolean")
      patch.social_facebook_visible = social_facebook_visible;
    if (typeof logo_url === "string") patch.logo_url = logo_url;
    if (typeof cover_image_url === "string") patch.cover_image_url = cover_image_url;
    if (typeof opening_hours === "string") patch.opening_hours = opening_hours;
    if (typeof strict_opening_hours === "boolean")
      patch.strict_opening_hours = strict_opening_hours;
    if (typeof onboarding_completed === "boolean")
      patch.onboarding_completed = onboarding_completed;
    if (typeof menu_template === "string" && menu_template.trim()) {
      const tid = menu_template.trim();
      const { plan } = await getRestaurantWithPlan(id);
      if (plan) {
        const terr = templateSelectionError(
          tid,
          Number(plan.max_templates),
          asBool(plan.premium_templates_enabled)
        );
        if (terr) {
          res.status(403).json({ error: terr });
          return;
        }
      }
      patch.menu_template = tid;
    }
    if (typeof slug === "string" && slug.trim()) {
      const taken = await db("restaurants")
        .where({ slug: slug.trim() })
        .whereNot("id", id)
        .first();
      if (taken) {
        res.status(400).json({ error: "Slug already in use" });
        return;
      }
      patch.slug = slug.trim();
    }
    if (Object.keys(patch).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }
    await db("restaurants").where({ id }).update(patch);
    const restaurant = await db("restaurants").where({ id }).first();
    res.json({ success: true, restaurant });
  });

  app.put("/api/restaurant/me", async (req, res) => {
    const s = getSession(req);
    if (!s || s.kind !== "restaurant") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const {
      name,
      slug,
      whatsapp_number,
      primary_color,
      menu_template,
      tagline,
      maps_url,
      phone,
      reservation_url,
      instagram,
      tiktok,
      facebook,
      social_instagram_visible,
      social_tiktok_visible,
      social_facebook_visible,
      logo_url,
      cover_image_url,
      opening_hours,
      strict_opening_hours,
    } = req.body;
    const patch: Record<string, unknown> = {};
    if (typeof name === "string") patch.name = name;
    if (typeof whatsapp_number === "string") patch.whatsapp_number = whatsapp_number;
    if (typeof primary_color === "string") patch.primary_color = primary_color;
    if (typeof tagline === "string") patch.tagline = tagline;
    if (typeof maps_url === "string") patch.maps_url = maps_url;
    if (typeof phone === "string") patch.phone = phone;
    if (typeof reservation_url === "string") patch.reservation_url = reservation_url;
    if (typeof instagram === "string") patch.instagram = instagram;
    if (typeof tiktok === "string") patch.tiktok = tiktok;
    if (typeof facebook === "string") patch.facebook = facebook;
    if (typeof social_instagram_visible === "boolean")
      patch.social_instagram_visible = social_instagram_visible;
    if (typeof social_tiktok_visible === "boolean")
      patch.social_tiktok_visible = social_tiktok_visible;
    if (typeof social_facebook_visible === "boolean")
      patch.social_facebook_visible = social_facebook_visible;
    if (typeof logo_url === "string") patch.logo_url = logo_url;
    if (typeof cover_image_url === "string") patch.cover_image_url = cover_image_url;
    if (typeof opening_hours === "string") patch.opening_hours = opening_hours;
    if (typeof strict_opening_hours === "boolean")
      patch.strict_opening_hours = strict_opening_hours;
    if (typeof menu_template === "string" && menu_template.trim()) {
      const tid = menu_template.trim();
      const { plan } = await getRestaurantWithPlan(s.restaurantId);
      if (plan) {
        const terr = templateSelectionError(
          tid,
          Number(plan.max_templates),
          asBool(plan.premium_templates_enabled)
        );
        if (terr) {
          res.status(403).json({ error: terr });
          return;
        }
      }
      patch.menu_template = tid;
    }
    if (typeof slug === "string" && slug.trim()) {
      const taken = await db("restaurants")
        .where({ slug: slug.trim() })
        .whereNot("id", s.restaurantId)
        .first();
      if (taken) {
        res.status(400).json({ error: "Slug already in use" });
        return;
      }
      patch.slug = slug.trim();
    }
    if (Object.keys(patch).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }
    await db("restaurants").where({ id: s.restaurantId }).update(patch);
    const restaurant = await db("restaurants")
      .where({ id: s.restaurantId })
      .first();
    res.json({ success: true, restaurant });
  });

  app.get("/api/admin/settings", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const settings = await db("settings").select("*");
    const settingsMap = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsMap);
  });

  app.post("/api/admin/settings", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const { settings } = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await db("settings")
        .insert({
          key,
          value: typeof value === "string" ? value : JSON.stringify(value),
        })
        .onConflict("key")
        .merge();
    }
    res.json({ success: true });
  });

  async function getDemoRestaurantRow() {
    return db("restaurants").where({ slug: DEMO_AZ_SLUG }).first();
  }

  async function ensureDemoRestaurantExists(): Promise<{ id: number }> {
    const existing = await getDemoRestaurantRow();
    if (existing) return { id: Number((existing as { id: number }).id) };
    const vipPlan = await db("subscription_plans").where({ slug: "vip" }).first();
    const coverDemo =
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80&auto=format&fit=crop";
    const logoDemo =
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80&auto=format&fit=crop";
    const ids = await db("restaurants").insert({
      name: "Nümunə Azərbaycan Menyusu",
      slug: DEMO_AZ_SLUG,
      whatsapp_number: "994501234567",
      primary_color: "#b45309",
      theme: "modern",
      plan: "vip",
      subscription_plan_id: vipPlan?.id ?? null,
      menu_template: "modern-01",
      tagline: "Milli mətbəx · QR kod ilə canlı menyuya baxın",
      maps_url: "https://maps.google.com/?q=Baku+Azerbaijan",
      phone: "+994 12 555 00 00",
      reservation_url: "https://example.com/book",
      instagram: "https://instagram.com",
      tiktok: "https://tiktok.com",
      cover_image_url: coverDemo,
      logo_url: logoDemo,
    });
    const newRid = Number(Array.isArray(ids) ? ids[0] : ids);
    await seedDemoAzMenu(db, newRid);
    const ruDemo = await db("restaurant_users").where({ restaurant_id: newRid }).first();
    if (!ruDemo) {
      await db("restaurant_users").insert({
        restaurant_id: newRid,
        username: "demo",
        password: "demo123",
        full_name: "Demo istifadəçi",
      });
    }
    return { id: newRid };
  }

  async function resetDemoRestaurantMenu(): Promise<void> {
    const row = await getDemoRestaurantRow();
    if (!row) throw new Error("Demo restoran tapılmadı");
    const rid = Number((row as { id: number }).id);
    const pids = (await db("products").where({ restaurant_id: rid }).pluck("id")) as number[];
    if (pids.length) {
      await db("product_variants").whereIn("product_id", pids).delete();
    }
    await db("products").where({ restaurant_id: rid }).delete();
    await db("categories").where({ restaurant_id: rid }).delete();
    await seedDemoAzMenu(db, rid);
  }

  app.get("/api/admin/demo-qr", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const row = await getDemoRestaurantRow();
    const catRow = row
      ? await db("categories").where({ restaurant_id: (row as { id: number }).id }).count("* as c").first()
      : { c: 0 };
    const prodRow = row
      ? await db("products").where({ restaurant_id: (row as { id: number }).id }).count("* as c").first()
      : { c: 0 };
    const host = req.get("host") || "";
    const proto = (req.headers["x-forwarded-proto"] as string) || "http";
    const base = host ? `${proto}://${host}` : "";

    const slug = DEMO_QR_PUBLIC_SLUG;
    const totalRow = await db("demo_link_visits").where({ demo_slug: slug }).count("* as c").first();
    const distinctRow = await db("demo_link_visits")
      .where({ demo_slug: slug })
      .whereNotNull("session_key")
      .countDistinct("session_key as c")
      .first();
    const startToday = new Date();
    startToday.setUTCHours(0, 0, 0, 0);
    const todayRow = await db("demo_link_visits")
      .where({ demo_slug: slug })
      .where("visited_at", ">=", startToday.toISOString())
      .count("* as c")
      .first();
    const d7 = new Date(Date.now() - 7 * 86400000);
    const last7Row = await db("demo_link_visits")
      .where({ demo_slug: slug })
      .where("visited_at", ">=", d7.toISOString())
      .count("* as c")
      .first();
    const recentRows = await db("demo_link_visits")
      .where({ demo_slug: slug })
      .orderBy("visited_at", "desc")
      .limit(150)
      .select("id", "visited_at", "session_key");

    res.json({
      internalSlug: DEMO_AZ_SLUG,
      publicDemoPath: `/demo/${DEMO_QR_PUBLIC_SLUG}`,
      fullDemoUrl: base ? `${base}/demo/${DEMO_QR_PUBLIC_SLUG}` : `/demo/${DEMO_QR_PUBLIC_SLUG}`,
      legacyPreviewUrl: base ? `${base}/r/${DEMO_AZ_SLUG}?preview=true` : `/r/${DEMO_AZ_SLUG}?preview=true`,
      restaurantId: row ? Number((row as { id: number }).id) : null,
      categoryCount: Number((catRow as { c?: string | number })?.c ?? 0),
      productCount: Number((prodRow as { c?: string | number })?.c ?? 0),
      exists: !!row,
      visits: {
        totalOpens: Number((totalRow as { c?: string | number })?.c ?? 0),
        approxUniqueSessions: Number((distinctRow as { c?: string | number })?.c ?? 0),
        todayOpens: Number((todayRow as { c?: string | number })?.c ?? 0),
        last7DaysOpens: Number((last7Row as { c?: string | number })?.c ?? 0),
        recent: recentRows.map((r: Record<string, unknown>) => ({
          id: r.id,
          visitedAt: r.visited_at,
          sessionKeyShort:
            r.session_key && String(r.session_key).length > 0
              ? `${String(r.session_key).slice(0, 8)}…`
              : null,
        })),
      },
    });
  });

  app.post("/api/admin/demo-qr/ensure", async (req, res) => {
    if (!requireSuper(req, res)) return;
    try {
      const { id } = await ensureDemoRestaurantExists();
      res.json({ success: true, restaurantId: id });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: String(e) });
    }
  });

  app.post("/api/admin/demo-qr/reset", async (req, res) => {
    if (!requireSuper(req, res)) return;
    try {
      await resetDemoRestaurantMenu();
      res.json({ success: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      res.status(400).json({ error: msg });
    }
  });

  app.get("/api/qrcode", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send("URL required");
    try {
      const qrDataUrl = await QRCode.toDataURL(url as string);
      res.json({ qrDataUrl });
    } catch (err) {
      res.status(500).send("Error generating QR code");
    }
  });

  app.get("/api/restaurants", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const q = String(req.query.q || "").trim().toLowerCase();
    const status = String(req.query.status || "all");
    let qb = db("restaurants")
      .leftJoin(
        "restaurant_users",
        "restaurants.id",
        "restaurant_users.restaurant_id"
      )
      .leftJoin(
        "subscription_plans",
        "restaurants.subscription_plan_id",
        "subscription_plans.id"
      )
      .select(
        "restaurants.*",
        "restaurant_users.username as staff_username",
        "subscription_plans.name as plan_name",
        "subscription_plans.slug as plan_slug"
      );
    if (q) {
      qb = qb.where(function () {
        this.whereRaw("LOWER(restaurants.name) LIKE ?", [`%${q}%`]).orWhereRaw(
          "LOWER(restaurants.slug) LIKE ?",
          [`%${q}%`]
        );
      });
    }
    if (status === "active") qb = qb.where("restaurants.is_active", true);
    if (status === "inactive") qb = qb.where("restaurants.is_active", false);
    const restaurants = await qb.orderBy("restaurants.id", "desc");
    res.json(restaurants);
  });

  app.patch("/api/admin/restaurants/:id", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const id = Number(req.params.id);
    const { is_active, subscription_plan_id, subscription_ends_at, subscription_overrides } = req.body;
    const patch: Record<string, unknown> = {};
    if (typeof is_active === "boolean") patch.is_active = is_active;
    if (subscription_plan_id != null) {
      const pid = Number(subscription_plan_id);
      const pl = await db("subscription_plans").where({ id: pid }).first();
      if (!pl) {
        res.status(400).json({ error: "Invalid plan" });
        return;
      }
      patch.subscription_plan_id = pid;
    }
    if (subscription_ends_at !== undefined) {
      patch.subscription_ends_at =
        subscription_ends_at === null || subscription_ends_at === ""
          ? null
          : new Date(String(subscription_ends_at)).toISOString();
    }
    if (subscription_overrides !== undefined) {
      if (subscription_overrides === null || subscription_overrides === "") {
        patch.subscription_overrides = null;
      } else {
        patch.subscription_overrides =
          typeof subscription_overrides === "string"
            ? subscription_overrides
            : JSON.stringify(subscription_overrides);
      }
    }
    if (Object.keys(patch).length === 0) {
      res.status(400).json({ error: "No fields" });
      return;
    }
    await db("restaurants").where({ id }).update(patch);
    const restaurant = await db("restaurants").where({ id }).first();
    res.json({ success: true, restaurant });
  });

  app.post("/api/restaurants", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const {
      name,
      slug,
      whatsapp_number,
      admin_username,
      admin_password,
      subscription_plan_id,
      seed_demo,
    } = req.body;
    if (!admin_username || !admin_password) {
      res.status(400).json({
        error: "Restaurant admin username and password are required",
      });
      return;
    }
    try {
      let newId = 0;
      const freePlan = await db("subscription_plans").where({ slug: "free" }).first();
      const planId =
        subscription_plan_id != null
          ? Number(subscription_plan_id)
          : Number(freePlan?.id) || null;
      if (planId) {
        const pl = await db("subscription_plans").where({ id: planId }).first();
        if (!pl) {
          res.status(400).json({ error: "Invalid subscription plan" });
          return;
        }
      }
      const seedRow = await db("settings").where({ key: "seed_demo_on_create" }).first();
      const defaultSeed = (seedRow as { value?: string } | undefined)?.value !== "false";
      const shouldSeed =
        typeof seed_demo === "boolean" ? Boolean(seed_demo) : defaultSeed;

      await db.transaction(async (trx) => {
        const ids = await trx("restaurants").insert({
          name,
          slug,
          whatsapp_number,
          menu_template: "modern-01",
          subscription_plan_id: planId,
        });
        newId = Number(Array.isArray(ids) ? ids[0] : ids);
        await trx("restaurant_users").insert({
          restaurant_id: newId,
          username: admin_username,
          password: admin_password,
        });
      });

      if (shouldSeed && newId) {
        const pl =
          planId != null
            ? await db("subscription_plans").where({ id: planId }).first()
            : await db("subscription_plans").where({ slug: "free" }).first();
        const mc = pl ? Number(pl.max_categories) : 5;
        const mp = pl ? Number(pl.max_products) : 20;
        await seedDemoAzMenu(db, newId, {
          maxCategories: mc < 0 ? undefined : mc,
          maxProducts: mp < 0 ? undefined : mp,
        });
      }

      res.json({ id: newId, name, slug });
    } catch {
      res.status(400).json({ error: "Slug exists or invalid user" });
    }
  });

  /** Super admin: create / reset restaurant staff login */
  app.post("/api/admin/restaurants/:id/staff", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const restaurantId = Number(req.params.id);
    const rest = await db("restaurants").where({ id: restaurantId }).first();
    if (!rest) return res.status(404).json({ error: "Not found" });
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "username and password required" });
      return;
    }
    try {
      const existing = await db("restaurant_users").where({ username }).first();
      if (existing && existing.restaurant_id !== restaurantId) {
        res.status(400).json({ error: "Username already taken" });
        return;
      }
      await db("restaurant_users")
        .where({ restaurant_id: restaurantId })
        .delete();
      await db("restaurant_users").insert({
        restaurant_id: restaurantId,
        username,
        password,
      });
      res.json({ success: true, username });
    } catch {
      res.status(400).json({ error: "Could not save staff login" });
    }
  });

  app.get("/api/restaurants/:slug", async (req, res) => {
    const restaurant = await db("restaurants")
      .where({ slug: req.params.slug })
      .first();
    if (!restaurant) return res.status(404).json({ error: "Not found" });
    if (!restaurant.is_active)
      return res.status(403).json({ error: "Restaurant inactive" });

    const { plan } = await getRestaurantWithPlan(restaurant.id);

    const categories = await db("categories")
      .where({ restaurant_id: restaurant.id })
      .orderBy("sort_order");

    const products = await db("products").where({
      restaurant_id: restaurant.id,
    });

    const parsedCategories = categories.map((cat) => ({
      ...cat,
      translations: safeJsonParse(cat.translations as string, {}),
    }));

    const parsedProductsAll = await attachVariantsToProducts(
      products.map((prod) => ({
        ...prod,
        translations: safeJsonParse(prod.translations as string, {}),
      }))
    );
    const parsedProducts = parsedProductsAll.filter((prod) => isProductActiveNow(prod));

    const skipScan = String(req.query.preview) === "true";
    if (!skipScan) {
      await db("scans").insert({ restaurant_id: restaurant.id });
      await bumpAnalyticsMetric("qr_scan");
      await db("restaurants").where({ id: restaurant.id }).increment("total_page_views", 1);
      const pids = parsedProducts.map((p) => p.id).filter(Boolean);
      if (pids.length)
        await db("products").whereIn("id", pids).increment("view_count", 1);
    }

    const plan_features = plan
      ? {
          whatsapp_order: asBool(plan.whatsapp_order_enabled),
          reservation: asBool(plan.reservation_enabled),
          analytics: asBool(plan.analytics_enabled),
          premium_templates: asBool(plan.premium_templates_enabled),
        }
      : {
          whatsapp_order: true,
          reservation: true,
          analytics: true,
          premium_templates: true,
        };

    const custom_templates = await db("custom_menu_templates")
      .where({ is_active: true })
      .select("slug_key", "name", "category", "hero_image_url", "theme_json");
    const media_assets = await db("restaurant_media_assets")
      .where({ restaurant_id: restaurant.id })
      .orderBy("sort_order")
      .orderBy("id");

    const orders_allowed = ordersAllowedForRestaurant(restaurant);

    res.json({
      ...restaurant,
      plan_features,
      orders_allowed,
      categories: parsedCategories,
      products: parsedProducts,
      custom_templates,
      media_assets,
    });
  });

  app.post("/api/restaurants/:slug/orders", async (req, res) => {
    const restaurant = await db("restaurants").where({ slug: req.params.slug }).first();
    if (!restaurant) return res.status(404).json({ error: "Not found" });
    if (!restaurant.is_active) return res.status(403).json({ error: "Restaurant inactive" });
    if (!ordersAllowedForRestaurant(restaurant)) {
      return res.status(403).json({ error: "Orders closed" });
    }
    const body = req.body as Record<string, unknown>;
    const cart = Array.isArray(body.cart) ? body.cart : [];
    const deviceId = String(body.device_id || "").trim().slice(0, 120);
    const customerName = String(body.customer_name || "").trim().slice(0, 200);
    const customerPhone = String(body.customer_phone || "").trim().slice(0, 64);
    if (!deviceId || cart.length === 0 || !customerName || !customerPhone) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const orderType = String(body.order_type || "pickup");
    const paymentMethod = String(body.payment_method || "cash");
    const orderSource = String(body.order_source || "web");
    const addressText = String(body.address_text || "");
    const geoUrl = String(body.geo_url || "");
    const note = String(body.note || "");
    const total = Number(body.total_amount || 0);
    const payload = JSON.stringify(body);
    const ids = await db("menu_orders").insert({
      restaurant_id: restaurant.id,
      payload,
      status: "pending",
      device_id: deviceId,
      order_type: orderType,
      payment_method: paymentMethod,
      order_source: orderSource,
      customer_name: customerName,
      customer_phone: customerPhone,
      address_text: addressText,
      geo_url: geoUrl,
      note,
      total_amount: Number.isFinite(total) ? total : 0,
    });
    const orderId = Number(Array.isArray(ids) ? ids[0] : ids);
    await db("order_status_logs").insert({
      order_id: orderId,
      restaurant_id: restaurant.id,
      from_status: null,
      to_status: "pending",
      actor: "system",
    });
    res.json({
      success: true,
      order: {
        id: orderId,
        status: "pending",
      },
      message: "Sifarişiniz qeydə alındı. Ən qısa zamanda sizinlə əlaqə saxlanılacaq",
    });
  });

  app.get("/api/restaurants/:slug/orders", async (req, res) => {
    const restaurant = await db("restaurants").where({ slug: req.params.slug }).first();
    if (!restaurant) return res.status(404).json({ error: "Not found" });
    const deviceId = String(req.query.device_id || "").trim().slice(0, 120);
    if (!deviceId) return res.status(400).json({ error: "device_id is required" });
    const rows = await db("menu_orders")
      .where({ restaurant_id: restaurant.id, device_id: deviceId })
      .orderBy("id", "desc")
      .limit(100);
    res.json(
      rows.map((row) => ({
        ...row,
        payload: safeJsonParse(row.payload as string, {}),
      }))
    );
  });

  app.get("/api/admin/restaurants/:id/menu", async (req, res) => {
    const id = Number(req.params.id);
    if (!requireRestaurantOrSuper(req, res, id)) return;

    const restaurant = await db("restaurants").where({ id }).first();
    if (!restaurant) return res.status(404).json({ error: "Not found" });

    const categories = await db("categories")
      .where({ restaurant_id: id })
      .orderBy("sort_order");
    const products = await db("products").where({ restaurant_id: id });

    const parsedCategories = categories.map((cat) => ({
      ...cat,
      translations: safeJsonParse(cat.translations as string, {}),
    }));

    const parsedProducts = await attachVariantsToProducts(
      products.map((prod) => ({
        ...prod,
        translations: safeJsonParse(prod.translations as string, {}),
      }))
    );

    const { plan } = await getRestaurantWithPlan(id);
    const customTemplates = await db("custom_menu_templates")
      .where({ is_active: true })
      .orderBy("id", "desc");
    const mediaAssets = await db("restaurant_media_assets")
      .where({ restaurant_id: id })
      .orderBy("sort_order")
      .orderBy("id");

    const pendingRow = await db("plan_upgrade_requests")
      .where({ restaurant_id: id })
      .whereIn("status", ["pending", "processing"])
      .orderBy("created_at", "desc")
      .first();
    let pendingPlanRequest: {
      id: number;
      status: string;
      plan_id: number;
      plan_name: string;
    } | null = null;
    if (pendingRow) {
      const pl = await db("subscription_plans")
        .where({ id: (pendingRow as { subscription_plan_id: number }).subscription_plan_id })
        .first();
      pendingPlanRequest = {
        id: Number((pendingRow as { id: number }).id),
        status: String((pendingRow as { status: string }).status),
        plan_id: Number((pendingRow as { subscription_plan_id: number }).subscription_plan_id),
        plan_name: pl ? String((pl as { name: string }).name) : "",
      };
    }

    const maxCategories = Number(plan?.max_categories ?? -1);
    const maxProducts = Number(plan?.max_products ?? -1);
    const maxTemplates = Number(plan?.max_templates ?? -1);
    const usedCategories = parsedCategories.length;
    const usedProducts = parsedProducts.length;
    const usedTemplates = restaurant.menu_template ? 1 : 0;
    const remaining = (used: number, max: number) => (max < 0 ? null : Math.max(0, max - used));
    const planUsage = {
      categories: { used: usedCategories, max: maxCategories, remaining: remaining(usedCategories, maxCategories) },
      products: { used: usedProducts, max: maxProducts, remaining: remaining(usedProducts, maxProducts) },
      templates: { used: usedTemplates, max: maxTemplates, remaining: remaining(usedTemplates, maxTemplates) },
    };

    res.json({
      restaurant,
      categories: parsedCategories,
      products: parsedProducts,
      plan,
      planUsage,
      customTemplates,
      media_assets: mediaAssets,
      pendingPlanRequest,
    });
  });

  app.post("/api/admin/restaurants/:id/media-assets", async (req, res) => {
    const restaurantId = Number(req.params.id);
    if (!requireRestaurantOrSuper(req, res, restaurantId)) return;
    const kindRaw = String(req.body.kind || "image").toLowerCase();
    const kind = kindRaw === "video" ? "video" : "image";
    const url = String(req.body.url || "").trim();
    const sortOrder = Number(req.body.sort_order || 0);
    if (!url) return res.status(400).json({ error: "url is required" });
    const ids = await db("restaurant_media_assets").insert({
      restaurant_id: restaurantId,
      kind,
      url,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    });
    const id = Number(Array.isArray(ids) ? ids[0] : ids);
    const row = await db("restaurant_media_assets").where({ id }).first();
    res.json(row);
  });

  app.put("/api/admin/media-assets/:id", async (req, res) => {
    const id = Number(req.params.id);
    const row = await db("restaurant_media_assets").where({ id }).first();
    if (!row) return res.status(404).json({ error: "Not found" });
    if (!requireRestaurantOrSuper(req, res, Number(row.restaurant_id))) return;
    const patch: Record<string, unknown> = {};
    if (typeof req.body.url === "string" && req.body.url.trim()) patch.url = req.body.url.trim();
    if (typeof req.body.kind === "string") {
      patch.kind = req.body.kind.toLowerCase() === "video" ? "video" : "image";
    }
    if (req.body.sort_order !== undefined) {
      const so = Number(req.body.sort_order);
      if (Number.isFinite(so)) patch.sort_order = so;
    }
    if (Object.keys(patch).length === 0) return res.status(400).json({ error: "No fields" });
    await db("restaurant_media_assets").where({ id }).update(patch);
    const fresh = await db("restaurant_media_assets").where({ id }).first();
    res.json(fresh);
  });

  app.delete("/api/admin/media-assets/:id", async (req, res) => {
    const id = Number(req.params.id);
    const row = await db("restaurant_media_assets").where({ id }).first();
    if (!row) return res.status(404).json({ error: "Not found" });
    if (!requireRestaurantOrSuper(req, res, Number(row.restaurant_id))) return;
    await db("restaurant_media_assets").where({ id }).delete();
    res.json({ success: true });
  });

  app.post("/api/admin/restaurants/:id/plan-request", async (req, res) => {
    const id = Number(req.params.id);
    if (!requireRestaurantOrSuper(req, res, id)) return;
    const subscription_plan_id = Number(req.body.subscription_plan_id);
    if (!subscription_plan_id) {
      res.status(400).json({ error: "Plan seçilməlidir" });
      return;
    }
    const planRow = await db("subscription_plans")
      .where({ id: subscription_plan_id, is_active: true })
      .first();
    if (!planRow) {
      res.status(400).json({ error: "Plan tapılmadı" });
      return;
    }
    const existing = await db("plan_upgrade_requests")
      .where({ restaurant_id: id })
      .whereIn("status", ["pending", "processing"])
      .first();
    if (existing) {
      res.status(400).json({ error: "Artıq gözləyən sorğunuz var" });
      return;
    }
    await db("plan_upgrade_requests").insert({
      restaurant_id: id,
      subscription_plan_id,
      status: "pending",
    });
    res.json({ success: true });
  });

  app.get("/api/admin/plan-requests", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const includeCompleted = String(req.query.all || "") === "1";
    const rows = await db("plan_upgrade_requests as pr")
      .join("restaurants as r", "pr.restaurant_id", "r.id")
      .join("subscription_plans as sp", "pr.subscription_plan_id", "sp.id")
      .modify((qb) => {
        if (!includeCompleted) qb.whereIn("pr.status", ["pending", "processing"]);
      })
      .select(
        "pr.id",
        "pr.restaurant_id",
        "pr.subscription_plan_id",
        "pr.status",
        "pr.created_at",
        "r.name as restaurant_name",
        "r.slug as restaurant_slug",
        "r.whatsapp_number",
        "sp.name as plan_name",
        "sp.slug as plan_slug"
      )
      .orderBy("pr.created_at", "desc");
    res.json(rows);
  });

  app.patch("/api/admin/plan-requests/:prid", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const prid = Number(req.params.prid);
    const { status, apply_plan } = req.body as { status?: string; apply_plan?: boolean };
    const row = await db("plan_upgrade_requests").where({ id: prid }).first();
    if (!row) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const allowed = ["pending", "processing", "completed", "cancelled"];
    if (typeof status === "string" && allowed.includes(status)) {
      await db("plan_upgrade_requests").where({ id: prid }).update({ status });
    }
    const rid = Number((row as { restaurant_id: number }).restaurant_id);
    const pid = Number((row as { subscription_plan_id: number }).subscription_plan_id);
    if (apply_plan === true && status === "completed") {
      await db("restaurants").where({ id: rid }).update({ subscription_plan_id: pid });
    }
    const updated = await db("plan_upgrade_requests").where({ id: prid }).first();
    res.json({ success: true, request: updated });
  });

  app.get("/api/admin/restaurants/:id/dashboard", async (req, res) => {
    const id = Number(req.params.id);
    if (!requireRestaurantOrSuper(req, res, id)) return;
    const restaurant = await db("restaurants").where({ id }).first();
    if (!restaurant) return res.status(404).json({ error: "Not found" });
    const scans = await db("scans").where({ restaurant_id: id }).count("* as c").first();
    const topProducts = await db("products")
      .where({ restaurant_id: id })
      .orderBy("view_count", "desc")
      .limit(5)
      .select("id", "name", "view_count", "price");
    res.json({
      scans: Number((scans as { c?: string | number })?.c ?? 0),
      pageViews: Number(restaurant.total_page_views ?? 0),
      topProducts,
    });
  });

  app.post("/api/admin/categories", async (req, res) => {
    const { restaurant_id, name, translations } = req.body;
    const rid = Number(restaurant_id);
    if (!requireRestaurantOrSuper(req, res, rid)) return;
    const { plan } = await getRestaurantWithPlan(rid);
    if (plan && Number(plan.max_categories) >= 0) {
      const c = await countWhere("categories", { restaurant_id: rid });
      if (c >= Number(plan.max_categories)) {
        res.status(403).json({ error: "Kateqoriya limiti dolub" });
        return;
      }
    }
    const [cid] = await db("categories").insert({
      restaurant_id: rid,
      name,
      translations: translations ? JSON.stringify(translations) : null,
    });
    res.json({ id: cid, name, translations });
  });

  app.post("/api/admin/products", async (req, res) => {
    const {
      restaurant_id,
      category_id,
      name,
      description,
      price,
      image_url,
      translations,
      variants,
      active_hours_enabled,
      active_from,
      active_to,
    } = req.body;
    const rid = Number(restaurant_id);
    if (!requireRestaurantOrSuper(req, res, rid)) return;
    const { plan } = await getRestaurantWithPlan(rid);
    if (plan && Number(plan.max_products) >= 0) {
      const c = await countWhere("products", { restaurant_id: rid });
      if (c >= Number(plan.max_products)) {
        res.status(403).json({ error: "Məhsul limiti dolub" });
        return;
      }
    }
    const [pid] = await db("products").insert({
      restaurant_id: rid,
      category_id,
      name,
      description,
      price,
      image_url,
      translations: translations ? JSON.stringify(translations) : null,
      active_hours_enabled: asBool(active_hours_enabled),
      active_from: asBool(active_hours_enabled) && typeof active_from === "string" ? active_from : null,
      active_to: asBool(active_hours_enabled) && typeof active_to === "string" ? active_to : null,
    });
    if (Array.isArray(variants) && variants.length > 0) {
      let i = 0;
      for (const v of variants) {
        if (!v?.name || v.price == null) continue;
        await db("product_variants").insert({
          product_id: Number(pid),
          name: String(v.name).slice(0, 128),
          price: Number(v.price),
          sort_order: i++,
        });
      }
    }
    const row = await db("products").where({ id: pid }).first();
    const vrows = await db("product_variants").where({ product_id: pid }).orderBy("sort_order");
    res.json({
      ...row,
      translations: safeJsonParse((row as { translations?: string }).translations, {}),
      variants: vrows,
    });
  });

  app.delete("/api/admin/categories/:id", async (req, res) => {
    const cat = await db("categories").where({ id: req.params.id }).first();
    if (!cat) return res.status(404).json({ error: "Not found" });
    if (!requireRestaurantOrSuper(req, res, cat.restaurant_id)) return;
    const pids = (await db("products").where({ category_id: cat.id }).select("id")).map(
      (r) => r.id
    );
    if (pids.length) await db("product_variants").whereIn("product_id", pids).delete();
    await db("products").where({ category_id: cat.id }).delete();
    await db("categories").where({ id: cat.id }).delete();
    res.json({ success: true });
  });

  app.delete("/api/admin/products/:id", async (req, res) => {
    const prod = await db("products").where({ id: req.params.id }).first();
    if (!prod) return res.status(404).json({ error: "Not found" });
    if (!requireRestaurantOrSuper(req, res, prod.restaurant_id)) return;
    await db("product_variants").where({ product_id: prod.id }).delete();
    await db("products").where({ id: prod.id }).delete();
    res.json({ success: true });
  });

  app.put("/api/admin/categories/:id", async (req, res) => {
    const cat = await db("categories").where({ id: req.params.id }).first();
    if (!cat) return res.status(404).json({ error: "Not found" });
    if (!requireRestaurantOrSuper(req, res, cat.restaurant_id)) return;
    const { name, translations } = req.body;
    await db("categories")
      .where({ id: req.params.id })
      .update({
        name,
        translations: translations ? JSON.stringify(translations) : null,
      });
    res.json({ success: true });
  });

  app.put("/api/admin/products/:id", async (req, res) => {
    const prod = await db("products").where({ id: req.params.id }).first();
    if (!prod) return res.status(404).json({ error: "Not found" });
    if (!requireRestaurantOrSuper(req, res, prod.restaurant_id)) return;
    const {
      name,
      description,
      price,
      image_url,
      translations,
      active_hours_enabled,
      active_from,
      active_to,
    } = req.body;
    await db("products")
      .where({ id: req.params.id })
      .update({
        name,
        description,
        price,
        image_url,
        translations: translations ? JSON.stringify(translations) : null,
        active_hours_enabled: asBool(active_hours_enabled),
        active_from: asBool(active_hours_enabled) && typeof active_from === "string" ? active_from : null,
        active_to: asBool(active_hours_enabled) && typeof active_to === "string" ? active_to : null,
      });
    res.json({ success: true });
  });

  app.post("/api/admin/products/:pid/variants", async (req, res) => {
    const pid = Number(req.params.pid);
    const prod = await db("products").where({ id: pid }).first();
    if (!prod) return res.status(404).json({ error: "Not found" });
    if (!requireRestaurantOrSuper(req, res, Number(prod.restaurant_id))) return;
    const { name, price, sort_order } = req.body;
    if (!name || price == null) {
      res.status(400).json({ error: "Ad və qiymət lazımdır" });
      return;
    }
    const ids = await db("product_variants").insert({
      product_id: pid,
      name: String(name).slice(0, 128),
      price: Number(price),
      sort_order: sort_order != null ? Number(sort_order) : 0,
    });
    const vid = Number(Array.isArray(ids) ? ids[0] : ids);
    const row = await db("product_variants").where({ id: vid }).first();
    res.json(row);
  });

  app.put("/api/admin/variants/:vid", async (req, res) => {
    const vid = Number(req.params.vid);
    const v = await db("product_variants").where({ id: vid }).first();
    if (!v) return res.status(404).json({ error: "Not found" });
    const prod = await db("products").where({ id: v.product_id }).first();
    if (!prod || !requireRestaurantOrSuper(req, res, Number(prod.restaurant_id))) return;
    const { name, price, sort_order } = req.body;
    const patch: Record<string, unknown> = {};
    if (typeof name === "string") patch.name = name.slice(0, 128);
    if (price != null) patch.price = Number(price);
    if (sort_order != null) patch.sort_order = Number(sort_order);
    if (Object.keys(patch).length === 0) {
      res.status(400).json({ error: "Boş" });
      return;
    }
    await db("product_variants").where({ id: vid }).update(patch);
    const row = await db("product_variants").where({ id: vid }).first();
    res.json(row);
  });

  app.delete("/api/admin/variants/:vid", async (req, res) => {
    const vid = Number(req.params.vid);
    const v = await db("product_variants").where({ id: vid }).first();
    if (!v) return res.status(404).json({ error: "Not found" });
    const prod = await db("products").where({ id: v.product_id }).first();
    if (!prod || !requireRestaurantOrSuper(req, res, Number(prod.restaurant_id))) return;
    await db("product_variants").where({ id: vid }).delete();
    res.json({ success: true });
  });

  app.get("/api/stats", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const totalRestaurants = await db("restaurants")
      .count("id as count")
      .first();
    const totalScans = await db("scans").count("id as count").first();
    res.json({
      totalRestaurants: totalRestaurants?.count || 0,
      totalScans: totalScans?.count || 0,
    });
  });

  app.get("/api/admin/dashboard", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const totalRow = await db("restaurants").count("* as c").first();
    const activeRow = await db("restaurants").where({ is_active: true }).count("* as c").first();
    const scanRow = await db("scans").count("* as c").first();
    const pvRow = await db("restaurants").sum("total_page_views as v").first();
    const totalRestaurants = Number((totalRow as { c?: string | number })?.c ?? 0);
    const activeRestaurants = Number((activeRow as { c?: string | number })?.c ?? 0);
    const totalScans = Number((scanRow as { c?: string | number })?.c ?? 0);
    const totalPageViews = Number((pvRow as { v?: string | number })?.v ?? 0);

    const mrrRows = await db("restaurants as r")
      .leftJoin("subscription_plans as p", "r.subscription_plan_id", "p.id")
      .where("r.is_active", true)
      .select(db.raw("SUM(COALESCE(p.price_monthly, 0)) as mrr"));
    const estimatedMonthlyRevenue = Number((mrrRows[0] as { mrr?: string | number })?.mrr ?? 0);

    const recentRestaurants = await db("restaurants")
      .orderBy("created_at", "desc")
      .limit(8)
      .select("id", "name", "slug", "is_active", "created_at");

    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const registrationsTodayRow = await db("restaurants")
      .where("created_at", ">=", startOfToday.toISOString())
      .count("* as c")
      .first();
    const registrationsToday = Number((registrationsTodayRow as { c?: string | number })?.c ?? 0);

    const pendingPlanRow = await db("plan_upgrade_requests")
      .where({ status: "pending" })
      .count("* as c")
      .first();
    const pendingPlanRequests = Number((pendingPlanRow as { c?: string | number })?.c ?? 0);

    const now = new Date();
    const in3d = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const expRow = await db("restaurants")
      .whereNotNull("subscription_ends_at")
      .where("subscription_ends_at", ">=", now.toISOString())
      .where("subscription_ends_at", "<=", in3d.toISOString())
      .count("* as c")
      .first();
    const expiringSubscriptionsCount = Number((expRow as { c?: string | number })?.c ?? 0);

    const registrationsSeries: { day: string; count: number }[] = [];
    const landingSeries: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d0 = new Date();
      d0.setUTCDate(d0.getUTCDate() - i);
      d0.setUTCHours(0, 0, 0, 0);
      const d1 = new Date(d0);
      d1.setUTCDate(d1.getUTCDate() + 1);
      const dayKey = d0.toISOString().slice(0, 10);
      const cr = await db("restaurants")
        .where("created_at", ">=", d0.toISOString())
        .where("created_at", "<", d1.toISOString())
        .count("* as c")
        .first();
      registrationsSeries.push({
        day: dayKey,
        count: Number((cr as { c?: string | number })?.c ?? 0),
      });
      const lr = await db("analytics_daily").where({ day: dayKey, metric: "landing_hit" }).first();
      landingSeries.push({
        day: dayKey,
        count: Number((lr as { value?: number })?.value ?? 0),
      });
    }

    res.json({
      totalRestaurants,
      activeRestaurants,
      inactiveRestaurants: totalRestaurants - activeRestaurants,
      totalScans,
      totalPageViews,
      estimatedMonthlyRevenue,
      recentRestaurants,
      registrationsToday,
      pendingPlanRequests,
      expiringSubscriptionsCount,
      registrationsSeries,
      landingSeries,
    });
  });

  app.get("/api/admin/analytics", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - (days - 1));
    start.setUTCHours(0, 0, 0, 0);
    const startKey = start.toISOString().slice(0, 10);

    const daily = await db("analytics_daily").where("day", ">=", startKey).orderBy("day", "asc");

    const topPagesRaw = await db("analytics_daily")
      .where("metric", "like", "page:%")
      .select(db.raw("metric as path"), db.raw("SUM(value) as hits"))
      .groupBy("metric")
      .orderBy("hits", "desc")
      .limit(15);

    const topMenus = await db("restaurants")
      .orderBy("total_page_views", "desc")
      .limit(12)
      .select("id", "name", "slug", "total_page_views");

    res.json({
      daily,
      topPages: topPagesRaw,
      topMenus,
    });
  });

  app.get("/api/admin/plans", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const rows = await db("subscription_plans").orderBy("sort_order", "asc");
    res.json(rows);
  });

  app.post("/api/admin/plans", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const b = req.body;
    if (!b?.name || !b?.slug) {
      res.status(400).json({ error: "name və slug lazımdır" });
      return;
    }
    const exists = await db("subscription_plans").where({ slug: b.slug }).first();
    if (exists) {
      res.status(400).json({ error: "Slug mövcuddur" });
      return;
    }
    const [id] = await db("subscription_plans").insert({
      name: String(b.name),
      slug: String(b.slug).toLowerCase().replace(/[^a-z0-9-]/g, ""),
      price_monthly: b.price_monthly ?? 0,
      price_yearly: b.price_yearly ?? 0,
      original_price_monthly:
        b.original_price_monthly != null && b.original_price_monthly !== ""
          ? Number(b.original_price_monthly)
          : null,
      is_featured: !!b.is_featured,
      max_products: b.max_products ?? 20,
      max_categories: b.max_categories ?? 5,
      max_templates: b.max_templates ?? 5,
      max_qr_codes: b.max_qr_codes ?? 1,
      whatsapp_order_enabled: b.whatsapp_order_enabled !== false,
      reservation_enabled: !!b.reservation_enabled,
      analytics_enabled: !!b.analytics_enabled,
      premium_templates_enabled: !!b.premium_templates_enabled,
      is_active: b.is_active !== false,
      sort_order: b.sort_order ?? 99,
    });
    res.json({ id });
  });

  app.put("/api/admin/plans/:id", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const id = Number(req.params.id);
    const b = req.body;
    const patch: Record<string, unknown> = {};
    const fields = [
      "name",
      "slug",
      "price_monthly",
      "price_yearly",
      "original_price_monthly",
      "max_products",
      "max_categories",
      "max_templates",
      "max_qr_codes",
      "sort_order",
    ] as const;
    for (const k of fields) {
      if (b[k] !== undefined) patch[k] = b[k];
    }
    if (b.whatsapp_order_enabled !== undefined)
      patch.whatsapp_order_enabled = !!b.whatsapp_order_enabled;
    if (b.reservation_enabled !== undefined)
      patch.reservation_enabled = !!b.reservation_enabled;
    if (b.analytics_enabled !== undefined)
      patch.analytics_enabled = !!b.analytics_enabled;
    if (b.premium_templates_enabled !== undefined)
      patch.premium_templates_enabled = !!b.premium_templates_enabled;
    if (b.is_active !== undefined) patch.is_active = !!b.is_active;
    if (b.is_featured !== undefined) patch.is_featured = !!b.is_featured;
    if (b.original_price_monthly !== undefined) {
      patch.original_price_monthly =
        b.original_price_monthly === null || b.original_price_monthly === ""
          ? null
          : Number(b.original_price_monthly);
    }
    if (Object.keys(patch).length === 0) {
      res.status(400).json({ error: "Boş" });
      return;
    }
    await db("subscription_plans").where({ id }).update(patch);
    const row = await db("subscription_plans").where({ id }).first();
    res.json({ success: true, plan: row });
  });

  app.delete("/api/admin/plans/:id", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const id = Number(req.params.id);
    const used = await db("restaurants").where({ subscription_plan_id: id }).count("* as c").first();
    if (Number((used as { c?: string | number })?.c ?? 0) > 0) {
      res.status(400).json({ error: "Plana bağlı restoranlar var" });
      return;
    }
    await db("subscription_plans").where({ id }).delete();
    res.json({ success: true });
  });

  app.get("/api/admin/owner-accounts", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const rests = await db("restaurants").orderBy("created_at", "desc");
    const rows = await Promise.all(
      rests.map(async (rest) => {
        const user = await db("restaurant_users")
          .where({ restaurant_id: rest.id })
          .first();
        const plan = rest.subscription_plan_id
          ? await db("subscription_plans").where({ id: rest.subscription_plan_id }).first()
          : null;
        return { restaurant: rest, user, plan };
      })
    );
    res.json(rows);
  });

  app.post("/api/admin/restaurants/:id/owner-notify", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const rid = Number(req.params.id);
    const rest = await db("restaurants").where({ id: rid }).first();
    if (!rest) return res.status(404).json({ error: "Not found" });
    const { title, body } = req.body;
    if (!title) {
      res.status(400).json({ error: "Başlıq lazımdır" });
      return;
    }
    const channel = String(req.body?.channel || "system").slice(0, 24);
    const allowed = new Set(["system", "whatsapp", "email"]);
    await db("owner_notifications").insert({
      restaurant_id: rid,
      title: String(title),
      body: body ? String(body) : null,
      channel: allowed.has(channel) ? channel : "system",
    });
    res.json({ success: true });
  });

  app.post("/api/admin/restaurants/:id/plan-offer", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const rid = Number(req.params.id);
    const rest = await db("restaurants").where({ id: rid }).first();
    if (!rest) return res.status(404).json({ error: "Not found" });
    const { plan_id, message } = req.body;
    const plan = plan_id
      ? await db("subscription_plans").where({ id: Number(plan_id) }).first()
      : null;
    const title = `Plan təklifi${plan ? `: ${plan.name}` : ""}`;
    const body =
      (message ? String(message) : "") +
      (plan
        ? `\n\nTəklif olunan plan: ${plan.name} (aylıq ₼${Number(plan.price_monthly).toFixed(2)})`
        : "");
    await db("owner_notifications").insert({
      restaurant_id: rid,
      title,
      body: body.trim() || null,
    });
    res.json({ success: true });
  });

  app.get("/api/admin/coupons", async (req, res) => {
    if (!requireSuper(req, res)) return;
    res.json(await db("promo_coupons").orderBy("id", "desc"));
  });

  app.post("/api/admin/coupons", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const { code, max_uses, is_active, valid_from, valid_until, active_hours, notes } =
      req.body;
    if (!code) {
      res.status(400).json({ error: "Kod lazımdır" });
      return;
    }
    try {
      const discount_type =
        req.body?.discount_type === "fixed" ? "fixed" : "percent";
      const discount_value =
        req.body?.discount_value != null ? Number(req.body.discount_value) : 0;
      const ids = await db("promo_coupons").insert({
        code: String(code).toUpperCase().trim().slice(0, 64),
        max_uses: max_uses != null ? Number(max_uses) : 1,
        used_count: 0,
        is_active: is_active !== false,
        valid_from: valid_from || null,
        valid_until: valid_until || null,
        active_hours: active_hours != null ? Number(active_hours) : null,
        notes: notes ? String(notes) : null,
        discount_type,
        discount_value,
      });
      const id = Number(Array.isArray(ids) ? ids[0] : ids);
      const row = await db("promo_coupons").where({ id }).first();
      res.json(row);
    } catch {
      res.status(400).json({ error: "Kod təkrar ola bilər" });
    }
  });

  app.put("/api/admin/coupons/:id", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const id = Number(req.params.id);
    const b = req.body;
    const patch: Record<string, unknown> = {};
    if (typeof b.code === "string") patch.code = b.code.toUpperCase().trim().slice(0, 64);
    if (b.max_uses != null) patch.max_uses = Number(b.max_uses);
    if (b.used_count != null) patch.used_count = Number(b.used_count);
    if (b.is_active !== undefined) patch.is_active = !!b.is_active;
    if (b.valid_from !== undefined) patch.valid_from = b.valid_from || null;
    if (b.valid_until !== undefined) patch.valid_until = b.valid_until || null;
    if (b.active_hours !== undefined) patch.active_hours = b.active_hours;
    if (b.notes !== undefined) patch.notes = b.notes;
    if (b.discount_type !== undefined)
      patch.discount_type = b.discount_type === "fixed" ? "fixed" : "percent";
    if (b.discount_value !== undefined) patch.discount_value = Number(b.discount_value);
    await db("promo_coupons").where({ id }).update(patch);
    res.json({ success: true, row: await db("promo_coupons").where({ id }).first() });
  });

  app.delete("/api/admin/coupons/:id", async (req, res) => {
    if (!requireSuper(req, res)) return;
    await db("promo_coupons").where({ id: req.params.id }).delete();
    res.json({ success: true });
  });

  app.get("/api/admin/notifications", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const filter = String(req.query.filter || "all");
    let qb = db("admin_notifications");
    if (filter === "unread") qb = qb.where({ is_read: false });
    else if (filter === "read") qb = qb.where({ is_read: true });
    const sort = String(req.query.sort || "newest");
    qb = qb.orderBy("created_at", sort === "oldest" ? "asc" : "desc").limit(200);
    res.json(await qb);
  });

  app.patch("/api/admin/notifications/:id/read", async (req, res) => {
    if (!requireSuper(req, res)) return;
    await db("admin_notifications").where({ id: req.params.id }).update({ is_read: true });
    res.json({ success: true });
  });

  app.get("/api/admin/custom-templates", async (req, res) => {
    if (!requireSuper(req, res)) return;
    res.json(await db("custom_menu_templates").orderBy("id", "desc"));
  });

  app.post("/api/admin/custom-templates", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const { name, category, hero_image_url, theme_json } = req.body;
    if (!name || !category) {
      res.status(400).json({ error: "Ad və kateqoriya lazımdır" });
      return;
    }
    const slug_key = `custom-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
    const [id] = await db("custom_menu_templates").insert({
      slug_key,
      name: String(name),
      category: String(category),
      hero_image_url: hero_image_url || null,
      theme_json: theme_json ? String(theme_json) : null,
      is_active: true,
    });
    res.json({ id, slug_key });
  });

  app.put("/api/admin/custom-templates/:id", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const id = Number(req.params.id);
    const b = req.body;
    const patch: Record<string, unknown> = {};
    if (typeof b.name === "string") patch.name = b.name;
    if (typeof b.category === "string") patch.category = b.category;
    if (b.hero_image_url !== undefined) patch.hero_image_url = b.hero_image_url;
    if (b.theme_json !== undefined) patch.theme_json = b.theme_json;
    if (b.is_active !== undefined) patch.is_active = !!b.is_active;
    await db("custom_menu_templates").where({ id }).update(patch);
    res.json({ success: true });
  });

  app.delete("/api/admin/custom-templates/:id", async (req, res) => {
    if (!requireSuper(req, res)) return;
    await db("custom_menu_templates").where({ id: req.params.id }).delete();
    res.json({ success: true });
  });

  app.patch("/api/admin/restaurant-users/:uid", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const uid = Number(req.params.uid);
    const row = await db("restaurant_users").where({ id: uid }).first();
    if (!row) {
      res.status(404).json({ error: "Tapılmadı" });
      return;
    }
    const patch: Record<string, unknown> = {};
    if (req.body.full_name !== undefined) {
      patch.full_name = req.body.full_name ? String(req.body.full_name) : null;
    }
    if (req.body.username !== undefined) {
      const u = String(req.body.username).trim();
      const clash = await db("restaurant_users").where({ username: u }).whereNot("id", uid).first();
      if (clash) {
        res.status(400).json({ error: "Bu login artıq mövcuddur" });
        return;
      }
      patch.username = u;
    }
    if (req.body.new_password != null && String(req.body.new_password).length > 0) {
      patch.password = String(req.body.new_password);
    }
    if (Object.keys(patch).length === 0) {
      res.status(400).json({ error: "Heç bir dəyişiklik yoxdur" });
      return;
    }
    await db("restaurant_users").where({ id: uid }).update(patch);
    res.json({ success: true });
  });

  app.delete("/api/admin/restaurant-users/:uid", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const uid = Number(req.params.uid);
    const row = await db("restaurant_users").where({ id: uid }).first();
    if (!row) {
      res.status(404).json({ error: "Tapılmadı" });
      return;
    }
    const cntRow = await db("restaurant_users")
      .where({ restaurant_id: row.restaurant_id })
      .count("* as c")
      .first();
    if (Number((cntRow as { c?: string | number })?.c ?? 0) <= 1) {
      res.status(400).json({ error: "Restoranın son istifadəçisi silinə bilməz" });
      return;
    }
    await db("restaurant_users").where({ id: uid }).delete();
    res.json({ success: true });
  });

  app.post("/api/admin/impersonate/:restaurantId", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const restaurantId = Number(req.params.restaurantId);
    const ru = await db("restaurant_users").where({ restaurant_id: restaurantId }).first();
    if (!ru) {
      res.status(404).json({ error: "Restoran işçisi yoxdur" });
      return;
    }
    const token = storeSession({
      kind: "restaurant",
      restaurantId,
      username: ru.username as string,
    });
    res.json({ token, restaurantId });
  });

  app.get("/api/admin/restaurants/:id/orders", async (req, res) => {
    const id = Number(req.params.id);
    if (!requireRestaurantOrSuper(req, res, id)) return;
    const rows = await db("menu_orders").where({ restaurant_id: id }).orderBy("id", "desc").limit(100);
    res.json(
      rows.map((row) => ({
        ...row,
        payload: safeJsonParse(row.payload as string, {}),
      }))
    );
  });

  app.patch("/api/admin/restaurants/:id/orders/:orderId/status", async (req, res) => {
    const id = Number(req.params.id);
    if (!requireRestaurantOrSuper(req, res, id)) return;
    const s = getSession(req);
    const orderId = Number(req.params.orderId);
    const status = String(req.body?.status || "");
    const allowed = new Set(["pending", "preparing", "ready", "sent", "delivered", "cancelled", "accepted"]);
    if (!allowed.has(status)) return res.status(400).json({ error: "Invalid status" });
    const row = await db("menu_orders").where({ id: orderId, restaurant_id: id }).first();
    if (!row) return res.status(404).json({ error: "Not found" });
    const fromStatus = String(row.status || "pending");
    const nextStatus = status === "accepted" ? "pending" : status;
    await db("menu_orders").where({ id: orderId }).update({ status: nextStatus });
    await db("order_status_logs").insert({
      order_id: orderId,
      restaurant_id: id,
      from_status: fromStatus,
      to_status: nextStatus,
      actor: s?.kind === "super" ? "super" : "restaurant",
    });
    res.json({ success: true });
  });

  const prodStatic = useProductionStatic();
  if (prodStatic) {
    const distPath = path.join(process.cwd(), "dist");
    const indexHtml = path.join(distPath, "index.html");
    if (!fs.existsSync(indexHtml)) {
      console.error(
        "ERROR: dist/index.html yoxdur. Deploy: npm install && npm run build && npm start"
      );
      process.exit(1);
    }
    console.log(`Mode: production static (dist/) | NODE_ENV=${process.env.NODE_ENV ?? "(unset)"}`);
    app.use(express.static(distPath));
    app.get(/^\/(.*)$/, (_req, res) => {
      res.sendFile(indexHtml);
    });
  } else {
    console.log("Mode: development (Vite)");
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware attached.");
    } catch (err) {
      console.error("Vite server creation failed:", err);
      process.exit(1);
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Server ready | PORT=${PORT} (env PORT=${process.env.PORT ?? "unset"}) | pid=${process.pid}`
    );
  });
}

startServer();
