import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import knex from "knex";
import QRCode from "qrcode";

console.log("Server script started.");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database initialization
const db = knex({
  client: "better-sqlite3",
  connection: {
    filename: "./qrmenu.sqlite",
  },
  useNullAsDefault: true,
});

async function initDb() {
  console.log("Initializing database schema...");
  try {
    if (!(await db.schema.hasTable("restaurants"))) {
      console.log("Creating restaurants table...");
    await db.schema.createTable("restaurants", (table) => {
      table.increments("id");
      table.string("name").notNullable();
      table.string("slug").unique().notNullable();
      table.string("logo_url");
      table.string("primary_color").defaultTo("#ef4444");
      table.string("whatsapp_number");
      table.string("theme").defaultTo("modern");
      table.boolean("is_active").defaultTo(true);
      table.string("plan").defaultTo("free");
      table.timestamps(true, true);
    });
  }

  if (!(await db.schema.hasTable("admin_users"))) {
    console.log("Creating admin_users table...");
    await db.schema.createTable("admin_users", (table) => {
      table.increments("id");
      table.string("username").unique().notNullable();
      table.string("password").notNullable();
      table.timestamps(true, true);
    });
  }

  if (!(await db.schema.hasTable("settings"))) {
    console.log("Creating settings table...");
    await db.schema.createTable("settings", (table) => {
      table.increments("id");
      table.string("key").unique().notNullable();
      table.string("value");
      table.timestamps(true, true);
    });
  }

  if (!(await db.schema.hasTable("categories"))) {
    await db.schema.createTable("categories", (table) => {
      table.increments("id");
      table.integer("restaurant_id").references("id").inTable("restaurants");
      table.string("name").notNullable();
      table.text("translations"); // JSON string: { "az": "...", "en": "..." }
      table.integer("sort_order").defaultTo(0);
      table.timestamps(true, true);
    });
  }

  if (!(await db.schema.hasTable("products"))) {
    await db.schema.createTable("products", (table) => {
      table.increments("id");
      table.integer("category_id").references("id").inTable("categories");
      table.integer("restaurant_id").references("id").inTable("restaurants");
      table.string("name").notNullable();
      table.string("description");
      table.text("translations"); // JSON string: { "az": { "name": "...", "desc": "..." }, "en": { ... } }
      table.decimal("price", 10, 2);
      table.string("image_url");
      table.boolean("is_available").defaultTo(true);
      table.timestamps(true, true);
    });
  }

  if (!(await db.schema.hasTable("scans"))) {
    await db.schema.createTable("scans", (table) => {
      table.increments("id");
      table.integer("restaurant_id").references("id").inTable("restaurants");
      table.timestamp("scanned_at").defaultTo(db.fn.now());
    });
  }

  // Initial Data
  console.log("Checking for initial data...");
  const countResult = await db("restaurants").count("id as count").first();
  const count = Number(countResult?.count || 0);
  console.log(`Current restaurant count: ${count}`);
  if (count === 0) {
    console.log("Inserting initial data...");
    await db("restaurants").insert({
      name: "The Burger Joint",
      slug: "burger-joint",
      whatsapp_number: "1234567890",
      primary_color: "#ef4444",
      theme: "modern",
      plan: "vip"
    });
    
    const rest = await db("restaurants").where({ slug: "burger-joint" }).first();
    const [catId] = await db("categories").insert({ restaurant_id: rest.id, name: "Burgers" });
    await db("products").insert([
      { restaurant_id: rest.id, category_id: catId, name: "Classic Burger", price: 12.99, description: "Juicy beef patty with lettuce and tomato." },
      { restaurant_id: rest.id, category_id: catId, name: "Cheese Burger", price: 14.99, description: "Classic burger with melted cheddar." }
    ]);
    console.log("Initial data inserted.");
  }

  // Admin User
  const adminUser = await db("admin_users").where({ username: "admin" }).first();
  if (!adminUser) {
    console.log("Creating default admin user...");
    await db("admin_users").insert({
      username: "admin",
      password: "admin123"
    });
  } else {
    // Ensure password is reset to admin123 if it was somehow different
    await db("admin_users").where({ username: "admin" }).update({ password: "admin123" });
  }

  // Default Settings
  const settingsCount = await db("settings").count("id as count").first();
  if (Number(settingsCount?.count || 0) === 0) {
    console.log("Creating default settings...");
    await db("settings").insert([
      { key: "default_language", value: "az" },
      { key: "supported_languages", value: JSON.stringify(["az", "ru", "tr", "en"]) }
    ]);
  }
  } catch (err) {
    console.error("Error in initDb:", err);
    throw err;
  }
}

async function startServer() {
  console.log("Starting server initialization...");
  try {
    await initDb();
    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Database initialization failed:", err);
    process.exit(1);
  }
  
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  console.log("Express middleware configured.");

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
      translations: cat.translations ? JSON.parse(cat.translations) : {}
    }));

    const parsedProducts = products.map(prod => ({
      ...prod,
      translations: prod.translations ? JSON.parse(prod.translations) : {}
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
      translations: cat.translations ? JSON.parse(cat.translations) : {}
    }));

    const parsedProducts = products.map(prod => ({
      ...prod,
      translations: prod.translations ? JSON.parse(prod.translations) : {}
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
