import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";
import QRCode from "qrcode";
import { db, initDatabase, getUiTranslationsForApi, getDbDriver } from "./database.js";

console.log("Server script started.");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  app.use(express.json());
  console.log("Express middleware configured.");

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
        .whereIn("key", ["default_language", "supported_languages"]);
      const map: Record<string, string> = {};
      for (const r of rows as { key: string; value: string }[]) {
        map[r.key] = r.value;
      }
      res.json(map);
    } catch (e) {
      res.status(500).json({ error: "Failed to load settings" });
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
    if (typeof menu_template === "string" && menu_template.trim())
      patch.menu_template = menu_template.trim();
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
    if (typeof menu_template === "string" && menu_template.trim())
      patch.menu_template = menu_template.trim();
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
    const restaurants = await db("restaurants")
      .leftJoin(
        "restaurant_users",
        "restaurants.id",
        "restaurant_users.restaurant_id"
      )
      .select("restaurants.*", "restaurant_users.username as staff_username");
    res.json(restaurants);
  });

  app.post("/api/restaurants", async (req, res) => {
    if (!requireSuper(req, res)) return;
    const { name, slug, whatsapp_number, admin_username, admin_password } =
      req.body;
    if (!admin_username || !admin_password) {
      res.status(400).json({
        error: "Restaurant admin username and password are required",
      });
      return;
    }
    try {
      let newId = 0;
      await db.transaction(async (trx) => {
        const ids = await trx("restaurants").insert({
          name,
          slug,
          whatsapp_number,
          menu_template: "modern-01",
        });
        newId = Number(Array.isArray(ids) ? ids[0] : ids);
        await trx("restaurant_users").insert({
          restaurant_id: newId,
          username: admin_username,
          password: admin_password,
        });
      });
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

    const parsedProducts = products.map((prod) => ({
      ...prod,
      translations: safeJsonParse(prod.translations as string, {}),
    }));

    const skipScan = String(req.query.preview) === "true";
    if (!skipScan) {
      await db("scans").insert({ restaurant_id: restaurant.id });
    }

    res.json({
      ...restaurant,
      categories: parsedCategories,
      products: parsedProducts,
    });
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

    const parsedProducts = products.map((prod) => ({
      ...prod,
      translations: safeJsonParse(prod.translations as string, {}),
    }));

    res.json({
      restaurant,
      categories: parsedCategories,
      products: parsedProducts,
    });
  });

  app.post("/api/admin/categories", async (req, res) => {
    const { restaurant_id, name, translations } = req.body;
    const rid = Number(restaurant_id);
    if (!requireRestaurantOrSuper(req, res, rid)) return;
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
    } = req.body;
    const rid = Number(restaurant_id);
    if (!requireRestaurantOrSuper(req, res, rid)) return;
    const [pid] = await db("products").insert({
      restaurant_id: rid,
      category_id,
      name,
      description,
      price,
      image_url,
      translations: translations ? JSON.stringify(translations) : null,
    });
    res.json({ id: pid, name, translations });
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
    const { name, description, price, image_url, translations } = req.body;
    await db("products")
      .where({ id: req.params.id })
      .update({
        name,
        description,
        price,
        image_url,
        translations: translations ? JSON.stringify(translations) : null,
      });
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

  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite middleware in development mode...");
    try {
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
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Server is ready to accept connections.");
  });
}

startServer();
