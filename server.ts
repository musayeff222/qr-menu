import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";
import { db, initDatabase, getUiTranslationsForApi } from "./database.js";

console.log("Server script started.");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // Auth API
  app.post("/api/admin/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await db("admin_users").where({ username, password }).first();
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  });

  // Settings API
  app.get("/api/admin/settings", async (req, res) => {
    const settings = await db("settings").select("*");
    const settingsMap = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsMap);
  });

  app.post("/api/admin/settings", async (req, res) => {
    const { settings } = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await db("settings")
        .insert({ key, value: typeof value === 'string' ? value : JSON.stringify(value) })
        .onConflict("key")
        .merge();
    }
    res.json({ success: true });
  });

  // API Routes
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
    const restaurants = await db("restaurants").select("*");
    res.json(restaurants);
  });

  app.post("/api/restaurants", async (req, res) => {
    const { name, slug, whatsapp_number } = req.body;
    try {
      const [id] = await db("restaurants").insert({ name, slug, whatsapp_number });
      res.json({ id, name, slug });
    } catch (error) {
      res.status(400).json({ error: "Slug already exists" });
    }
  });

  app.get("/api/restaurants/:slug", async (req, res) => {
    const restaurant = await db("restaurants").where({ slug: req.params.slug }).first();
    if (!restaurant) return res.status(404).json({ error: "Not found" });
    
    const categories = await db("categories")
      .where({ restaurant_id: restaurant.id })
      .orderBy("sort_order");
    
    const products = await db("products")
      .where({ restaurant_id: restaurant.id });

    // Parse translations
    const parsedCategories = categories.map(cat => ({
      ...cat,
      translations: safeJsonParse(cat.translations as string, {}),
    }));

    const parsedProducts = products.map(prod => ({
      ...prod,
      translations: safeJsonParse(prod.translations as string, {}),
    }));

    // Track scan
    await db("scans").insert({ restaurant_id: restaurant.id });

    res.json({ ...restaurant, categories: parsedCategories, products: parsedProducts });
  });

  // Admin API for categories and products
  app.get("/api/admin/restaurants/:id/menu", async (req, res) => {
    const categories = await db("categories").where({ restaurant_id: req.params.id }).orderBy("sort_order");
    const products = await db("products").where({ restaurant_id: req.params.id });
    
    const parsedCategories = categories.map(cat => ({
      ...cat,
      translations: safeJsonParse(cat.translations as string, {}),
    }));

    const parsedProducts = products.map(prod => ({
      ...prod,
      translations: safeJsonParse(prod.translations as string, {}),
    }));

    res.json({ categories: parsedCategories, products: parsedProducts });
  });

  app.post("/api/admin/categories", async (req, res) => {
    const { restaurant_id, name, translations } = req.body;
    const [id] = await db("categories").insert({ 
      restaurant_id, 
      name, 
      translations: translations ? JSON.stringify(translations) : null 
    });
    res.json({ id, name, translations });
  });

  app.post("/api/admin/products", async (req, res) => {
    const { restaurant_id, category_id, name, description, price, image_url, translations } = req.body;
    const [id] = await db("products").insert({ 
      restaurant_id, 
      category_id, 
      name, 
      description, 
      price, 
      image_url,
      translations: translations ? JSON.stringify(translations) : null
    });
    res.json({ id, name, translations });
  });

  app.put("/api/admin/categories/:id", async (req, res) => {
    const { name, translations } = req.body;
    await db("categories")
      .where({ id: req.params.id })
      .update({ 
        name, 
        translations: translations ? JSON.stringify(translations) : null 
      });
    res.json({ success: true });
  });

  app.put("/api/admin/products/:id", async (req, res) => {
    const { name, description, price, image_url, translations } = req.body;
    await db("products")
      .where({ id: req.params.id })
      .update({ 
        name, 
        description, 
        price, 
        image_url,
        translations: translations ? JSON.stringify(translations) : null
      });
    res.json({ success: true });
  });

  app.get("/api/stats", async (req, res) => {
    const totalRestaurants = await db("restaurants").count("id as count").first();
    const totalScans = await db("scans").count("id as count").first();
    res.json({ 
      totalRestaurants: totalRestaurants?.count || 0,
      totalScans: totalScans?.count || 0
    });
  });

  // Vite middleware for development
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
