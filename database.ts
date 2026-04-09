import "dotenv/config";
import knex, { type Knex } from "knex";
import { DEMO_AZ_SLUG } from "./demoConstants.js";
import { seedDemoAzMenu } from "./demoMenuSeed.js";

function mysqlConnectionFromEnv():
  | { host: string; port: number; user: string; password: string; database: string }
  | null {
  const url = process.env.DATABASE_URL;
  if (url?.startsWith("mysql://")) {
    const u = new URL(url);
    const database = u.pathname.replace(/^\//, "").split("?")[0];
    if (!database) return null;
    return {
      host: u.hostname,
      port: Number(u.port || 3306),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database,
    };
  }
  if (process.env.MYSQL_HOST) {
    return {
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "qrmenu",
    };
  }
  if (process.env.DB_CLIENT === "mysql") {
    throw new Error(
      "DB_CLIENT is mysql but MYSQL_HOST or DATABASE_URL is not set."
    );
  }
  return null;
}

export function createKnex(): Knex {
  const mysql = mysqlConnectionFromEnv();
  if (mysql) {
    return knex({
      client: "mysql2",
      connection: {
        ...mysql,
        charset: "utf8mb4",
        timezone: "Z",
      },
      pool: { min: 0, max: 10 },
      useNullAsDefault: true,
    });
  }
  return knex({
    client: "better-sqlite3",
    connection: {
      filename: process.env.SQLITE_PATH || "./qrmenu.sqlite",
    },
    useNullAsDefault: true,
  });
}

export const db = createKnex();

export function getDbDriver(): "mysql" | "sqlite" {
  return mysqlConnectionFromEnv() ? "mysql" : "sqlite";
}

/** Default UI strings (seeded into ui_locale; frontend merges with built-in fallbacks). */
export const DEFAULT_UI_STRINGS: Record<string, Record<string, string>> = {
  az: {
    dashboard: "Panel",
    settings: "Ayarlar",
    restaurants: "Restoranlar",
    create_restaurant: "Yeni Restoran Yarat",
    name: "Ad",
    slug: "Slug",
    whatsapp: "WhatsApp Nömrəsi",
    create: "Yarat",
    manage: "İdarə et",
    block: "Blokla",
    logout: "Çıxış",
    categories: "Kateqoriyalar",
    products: "Məhsullar",
    add_category: "Kateqoriya Əlavə Et",
    add_product: "Məhsul Əlavə Et",
    price: "Qiymət",
    description: "Təsvir",
    save: "Yadda saxla",
    language: "Dil",
    default_language: "Əsas Dil",
    supported_languages: "Dəstəklənən Dillər",
    view_live: "Canlı Menyuya Bax",
    scan_order_enjoy: "Skan et, Sifariş et, Zövq al!",
    items_in_cart: "Məhsul səbətdə",
    order_via_whatsapp: "WhatsApp ilə sifariş et",
    total: "Cəmi",
    loading: "Yüklənir...",
    select_category: "Kateqoriya seçin",
    translations: "Tərcümələr",
    login: "Daxil ol",
    username: "İstifadəçi adı",
    password: "Şifrə",
    landing_nav_admin: "Super Admin",
    landing_nav_start: "Başla",
    landing_hero_1: "Restoran menyunuz,",
    landing_hero_2: "rəqəmsal.",
    landing_hero_sub:
      "Dəqiqələr içində gözəl digital menyu yaradın. QR kodlar, kateqoriyalar və WhatsApp sifarişi.",
    landing_cta: "Menyu yarat",
    landing_feat1_t: "Sürətli quraşdırma",
    landing_feat1_d: "Bir kliklə restoran və menyu.",
    landing_feat2_t: "QR kod",
    landing_feat2_d: "Avtomatik QR kodlar.",
    landing_feat3_t: "WhatsApp",
    landing_feat3_d: "Birbaşa telefonunuza sifariş.",
  },
  en: {
    dashboard: "Dashboard",
    settings: "Settings",
    restaurants: "Restaurants",
    create_restaurant: "Create New Restaurant",
    name: "Name",
    slug: "Slug",
    whatsapp: "WhatsApp Number",
    create: "Create",
    manage: "Manage",
    block: "Block",
    logout: "Logout",
    categories: "Categories",
    products: "Products",
    add_category: "Add Category",
    add_product: "Add Product",
    price: "Price",
    description: "Description",
    save: "Save",
    language: "Language",
    default_language: "Default Language",
    supported_languages: "Supported Languages",
    view_live: "View Live Menu",
    scan_order_enjoy: "Scan, Order, Enjoy!",
    items_in_cart: "Items in Cart",
    order_via_whatsapp: "Order via WhatsApp",
    total: "Total",
    loading: "Loading...",
    select_category: "Select Category",
    translations: "Translations",
    login: "Login",
    username: "Username",
    password: "Password",
    landing_nav_admin: "Super Admin",
    landing_nav_start: "Get Started",
    landing_hero_1: "Your Restaurant Menu,",
    landing_hero_2: "Digitalized.",
    landing_hero_sub:
      "Create a beautiful digital menu in minutes. QR codes, categories, and WhatsApp orders.",
    landing_cta: "Create Your Menu",
    landing_feat1_t: "Fast Setup",
    landing_feat1_d: "One click to create your restaurant and menu.",
    landing_feat2_t: "QR Generation",
    landing_feat2_d: "Auto-generated QR codes for every table.",
    landing_feat3_t: "WhatsApp Orders",
    landing_feat3_d: "Receive orders directly on your phone.",
  },
  ru: {
    dashboard: "Панель",
    settings: "Настройки",
    restaurants: "Рестораны",
    create_restaurant: "Создать новый ресторан",
    name: "Имя",
    slug: "Слаг",
    whatsapp: "Номер WhatsApp",
    create: "Создать",
    manage: "Управлять",
    block: "Блокировать",
    logout: "Выйти",
    categories: "Категории",
    products: "Продукты",
    add_category: "Добавить категорию",
    add_product: "Добавить продукт",
    price: "Цена",
    description: "Описание",
    save: "Сохранить",
    language: "Язык",
    default_language: "Язык по умолчанию",
    supported_languages: "Поддерживаемые языки",
    view_live: "Посмотреть меню",
    scan_order_enjoy: "Сканируй, Заказывай, Наслаждайся!",
    items_in_cart: "Товаров в корзине",
    order_via_whatsapp: "Заказать через WhatsApp",
    total: "Итого",
    loading: "Загрузка...",
    select_category: "Выберите категорию",
    translations: "Переводы",
    login: "Войти",
    username: "Логин",
    password: "Пароль",
    landing_nav_admin: "Супер админ",
    landing_nav_start: "Начать",
    landing_hero_1: "Меню вашего ресторана,",
    landing_hero_2: "в цифре.",
    landing_hero_sub:
      "Создайте цифровое меню за минуты. QR-коды, категории и заказы в WhatsApp.",
    landing_cta: "Создать меню",
    landing_feat1_t: "Быстрый старт",
    landing_feat1_d: "Ресторан и меню в один клик.",
    landing_feat2_t: "QR-коды",
    landing_feat2_d: "Автоматические QR для столов.",
    landing_feat3_t: "WhatsApp",
    landing_feat3_d: "Заказы прямо на телефон.",
  },
  tr: {
    dashboard: "Panel",
    settings: "Ayarlar",
    restaurants: "Restoranlar",
    create_restaurant: "Yeni Restoran Oluştur",
    name: "Ad",
    slug: "Slug",
    whatsapp: "WhatsApp Numarası",
    create: "Oluştur",
    manage: "Yönet",
    block: "Engelle",
    logout: "Çıkış",
    categories: "Kategoriler",
    products: "Ürünler",
    add_category: "Kategori Ekle",
    add_product: "Ürün Ekle",
    price: "Fiyat",
    description: "Açıklama",
    save: "Kaydet",
    language: "Dil",
    default_language: "Varsayılan Dil",
    supported_languages: "Desteklenen Diller",
    view_live: "Canlı Menüyü Görüntüle",
    scan_order_enjoy: "Tara, Sipariş Ver, Keyfini Çıkar!",
    items_in_cart: "Sepetteki Ürünler",
    order_via_whatsapp: "WhatsApp ile Sipariş Ver",
    total: "Toplam",
    loading: "Yükleniyor...",
    select_category: "Kategori seçin",
    translations: "Çeviriler",
    login: "Giriş",
    username: "Kullanıcı adı",
    password: "Şifre",
    landing_nav_admin: "Süper Admin",
    landing_nav_start: "Başla",
    landing_hero_1: "Restoran menünüz,",
    landing_hero_2: "dijital.",
    landing_hero_sub:
      "Dakikalar içinde dijital menü oluşturun. QR kodlar, kategoriler ve WhatsApp siparişleri.",
    landing_cta: "Menü oluştur",
    landing_feat1_t: "Hızlı kurulum",
    landing_feat1_d: "Tek tıkla restoran ve menü.",
    landing_feat2_t: "QR üretimi",
    landing_feat2_d: "Otomatik QR kodlar.",
    landing_feat3_t: "WhatsApp sipariş",
    landing_feat3_d: "Siparişler doğrudan telefona.",
  },
};

async function ensureColumn(
  tableName: string,
  columnName: string,
  alter: (table: Knex.AlterTableBuilder) => void
) {
  const has = await db.schema.hasColumn(tableName, columnName);
  if (!has) {
    console.log(`Adding column ${tableName}.${columnName}`);
    await db.schema.alterTable(tableName, alter);
  }
}

async function seedSubscriptionPlans() {
  const row = await db("subscription_plans").count("id as c").first();
  if (Number((row as { c?: string | number })?.c ?? 0) > 0) return;
  console.log("Seeding subscription_plans…");
  await db("subscription_plans").insert([
    {
      name: "Free",
      slug: "free",
      price_monthly: 0,
      price_yearly: 0,
      max_products: 30,
      max_categories: 6,
      max_templates: 10,
      max_qr_codes: 1,
      whatsapp_order_enabled: true,
      reservation_enabled: false,
      analytics_enabled: false,
      premium_templates_enabled: false,
      is_active: true,
      sort_order: 1,
    },
    {
      name: "Premium",
      slug: "premium",
      price_monthly: 29,
      price_yearly: 290,
      max_products: 200,
      max_categories: 40,
      max_templates: 35,
      max_qr_codes: 10,
      whatsapp_order_enabled: true,
      reservation_enabled: true,
      analytics_enabled: true,
      premium_templates_enabled: true,
      is_active: true,
      sort_order: 2,
    },
    {
      name: "VIP",
      slug: "vip",
      price_monthly: 79,
      price_yearly: 790,
      max_products: -1,
      max_categories: -1,
      max_templates: -1,
      max_qr_codes: -1,
      whatsapp_order_enabled: true,
      reservation_enabled: true,
      analytics_enabled: true,
      premium_templates_enabled: true,
      is_active: true,
      sort_order: 3,
    },
  ]);
}

async function seedUiLocale() {
  const row = await db("ui_locale").count("id as c").first();
  const n = Number((row as { c?: string | number })?.c ?? 0);
  if (n > 0) return;
  console.log("Seeding ui_locale…");
  const batch: { string_key: string; locale: string; value: string }[] = [];
  for (const [locale, dict] of Object.entries(DEFAULT_UI_STRINGS)) {
    for (const [string_key, value] of Object.entries(dict)) {
      batch.push({ string_key, locale, value });
    }
  }
  await db.batchInsert("ui_locale", batch, 200);
}

export async function initDatabase() {
  console.log("Initializing database schema…");
  try {
    if (!(await db.schema.hasTable("restaurants"))) {
      await db.schema.createTable("restaurants", (table) => {
        table.increments("id");
        table.string("name").notNullable();
        table.string("slug").unique().notNullable();
        table.string("logo_url");
        table.string("primary_color").defaultTo("#ef4444");
        table.string("whatsapp_number");
        table.string("theme").defaultTo("modern");
        table.string("menu_template", 64).defaultTo("modern-01");
        table.text("tagline");
        table.string("maps_url", 500);
        table.string("phone", 64);
        table.string("reservation_url", 500);
        table.string("instagram", 200);
        table.string("tiktok", 200);
        table.boolean("is_active").defaultTo(true);
        table.string("plan").defaultTo("free");
        table.timestamps(true, true);
      });
    }

    if (!(await db.schema.hasTable("admin_users"))) {
      await db.schema.createTable("admin_users", (table) => {
        table.increments("id");
        table.string("username").unique().notNullable();
        table.string("password").notNullable();
        table.timestamps(true, true);
      });
    }

    if (!(await db.schema.hasTable("settings"))) {
      await db.schema.createTable("settings", (table) => {
        table.increments("id");
        table.string("key").unique().notNullable();
        table.text("value");
        table.timestamps(true, true);
      });
    }

    if (!(await db.schema.hasTable("categories"))) {
      await db.schema.createTable("categories", (table) => {
        table.increments("id");
        table
          .integer("restaurant_id")
          .unsigned()
          .references("id")
          .inTable("restaurants");
        table.string("name").notNullable();
        table.text("translations");
        table.integer("sort_order").defaultTo(0);
        table.timestamps(true, true);
      });
    }

    if (!(await db.schema.hasTable("products"))) {
      await db.schema.createTable("products", (table) => {
        table.increments("id");
        table
          .integer("category_id")
          .unsigned()
          .references("id")
          .inTable("categories");
        table
          .integer("restaurant_id")
          .unsigned()
          .references("id")
          .inTable("restaurants");
        table.string("name").notNullable();
        table.string("description");
        table.text("translations");
        table.decimal("price", 10, 2);
        table.string("image_url");
        table.boolean("is_available").defaultTo(true);
        table.boolean("active_hours_enabled").defaultTo(false);
        table.string("active_from", 5);
        table.string("active_to", 5);
        table.timestamps(true, true);
      });
    }

    if (!(await db.schema.hasTable("scans"))) {
      await db.schema.createTable("scans", (table) => {
        table.increments("id");
        table
          .integer("restaurant_id")
          .unsigned()
          .references("id")
          .inTable("restaurants");
        table.timestamp("scanned_at").defaultTo(db.fn.now());
      });
    }

    if (!(await db.schema.hasTable("subscription_plans"))) {
      await db.schema.createTable("subscription_plans", (table) => {
        table.increments("id");
        table.string("name", 128).notNullable();
        table.string("slug", 64).unique().notNullable();
        table.decimal("price_monthly", 10, 2).defaultTo(0);
        table.decimal("price_yearly", 10, 2).defaultTo(0);
        table.integer("max_products").notNullable().defaultTo(20);
        table.integer("max_categories").notNullable().defaultTo(5);
        table.integer("max_templates").notNullable().defaultTo(5);
        table.integer("max_qr_codes").notNullable().defaultTo(1);
        table.boolean("whatsapp_order_enabled").defaultTo(true);
        table.boolean("reservation_enabled").defaultTo(false);
        table.boolean("analytics_enabled").defaultTo(false);
        table.boolean("premium_templates_enabled").defaultTo(false);
        table.boolean("is_active").defaultTo(true);
        table.integer("sort_order").defaultTo(0);
        table.timestamps(true, true);
      });
    }

    if (!(await db.schema.hasTable("custom_menu_templates"))) {
      await db.schema.createTable("custom_menu_templates", (table) => {
        table.increments("id");
        table.string("slug_key", 96).unique().notNullable();
        table.string("name", 160).notNullable();
        table.string("category", 64).notNullable();
        table.text("hero_image_url");
        table.text("theme_json");
        table.boolean("is_active").defaultTo(true);
        table.timestamps(true, true);
      });
    }

    if (!(await db.schema.hasTable("admin_notifications"))) {
      await db.schema.createTable("admin_notifications", (table) => {
        table.increments("id");
        table.string("title", 255).notNullable();
        table.text("body");
        table.boolean("is_read").defaultTo(false);
        table.timestamp("created_at").defaultTo(db.fn.now());
      });
    }

    if (!(await db.schema.hasTable("menu_orders"))) {
      await db.schema.createTable("menu_orders", (table) => {
        table.increments("id");
        table
          .integer("restaurant_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("restaurants")
          .onDelete("CASCADE");
        table.text("payload");
        table.string("status", 32).defaultTo("new");
        table.string("device_id", 120).index();
        table.string("order_type", 24);
        table.string("payment_method", 24);
        table.string("order_source", 24);
        table.string("customer_name", 200);
        table.string("customer_phone", 64);
        table.text("address_text");
        table.text("geo_url");
        table.text("note");
        table.decimal("total_amount", 10, 2).defaultTo(0);
        table.timestamps(true, true);
      });
    }

    if (!(await db.schema.hasTable("order_status_logs"))) {
      await db.schema.createTable("order_status_logs", (table) => {
        table.increments("id");
        table
          .integer("order_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("menu_orders")
          .onDelete("CASCADE");
        table
          .integer("restaurant_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("restaurants")
          .onDelete("CASCADE");
        table.string("from_status", 32);
        table.string("to_status", 32).notNullable();
        table.string("actor", 64).defaultTo("system");
        table.timestamp("created_at").defaultTo(db.fn.now());
      });
    }

    if (!(await db.schema.hasTable("restaurant_media_assets"))) {
      await db.schema.createTable("restaurant_media_assets", (table) => {
        table.increments("id");
        table
          .integer("restaurant_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("restaurants")
          .onDelete("CASCADE");
        table.string("kind", 16).notNullable().defaultTo("image");
        table.string("url", 600).notNullable();
        table.integer("sort_order").defaultTo(0);
        table.timestamps(true, true);
      });
    }

    if (!(await db.schema.hasTable("ui_locale"))) {
      await db.schema.createTable("ui_locale", (table) => {
        table.increments("id");
        table.string("string_key", 128).notNullable();
        table.string("locale", 10).notNullable();
        table.text("value").notNullable();
        table.unique(["string_key", "locale"]);
      });
    }

    if (!(await db.schema.hasTable("restaurant_users"))) {
      await db.schema.createTable("restaurant_users", (table) => {
        table.increments("id");
        table
          .integer("restaurant_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("restaurants")
          .onDelete("CASCADE");
        table.string("username", 64).unique().notNullable();
        table.string("password", 255).notNullable();
        table.timestamps(true, true);
      });
    }

    if (!(await db.schema.hasTable("product_variants"))) {
      await db.schema.createTable("product_variants", (table) => {
        table.increments("id");
        table
          .integer("product_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("products")
          .onDelete("CASCADE");
        table.string("name", 128).notNullable();
        table.decimal("price", 10, 2).notNullable();
        table.integer("sort_order").defaultTo(0);
        table.timestamps(true, true);
      });
    }

    if (!(await db.schema.hasTable("promo_coupons"))) {
      await db.schema.createTable("promo_coupons", (table) => {
        table.increments("id");
        table.string("code", 64).unique().notNullable();
        table.integer("max_uses").notNullable().defaultTo(1);
        table.integer("used_count").notNullable().defaultTo(0);
        table.boolean("is_active").defaultTo(true);
        table.timestamp("valid_from").nullable();
        table.timestamp("valid_until").nullable();
        table.integer("active_hours").nullable();
        table.text("notes");
        table.timestamps(true, true);
      });
    }

    if (!(await db.schema.hasTable("owner_notifications"))) {
      await db.schema.createTable("owner_notifications", (table) => {
        table.increments("id");
        table
          .integer("restaurant_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("restaurants")
          .onDelete("CASCADE");
        table.string("title", 255).notNullable();
        table.text("body");
        table.boolean("is_read").defaultTo(false);
        table.timestamp("created_at").defaultTo(db.fn.now());
      });
    }

    if (!(await db.schema.hasTable("analytics_daily"))) {
      await db.schema.createTable("analytics_daily", (table) => {
        table.string("day", 10).notNullable();
        table.string("metric", 64).notNullable();
        table.integer("value").notNullable().defaultTo(0);
        table.primary(["day", "metric"]);
      });
    }

    if (!(await db.schema.hasTable("demo_link_visits"))) {
      await db.schema.createTable("demo_link_visits", (table) => {
        table.increments("id");
        table.string("demo_slug", 64).notNullable().index();
        table.string("session_key", 80).nullable().index();
        table.timestamp("visited_at").defaultTo(db.fn.now());
      });
    }

    if (!(await db.schema.hasTable("plan_upgrade_requests"))) {
      await db.schema.createTable("plan_upgrade_requests", (table) => {
        table.increments("id");
        table
          .integer("restaurant_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("restaurants")
          .onDelete("CASCADE");
        table
          .integer("subscription_plan_id")
          .unsigned()
          .notNullable()
          .references("id")
          .inTable("subscription_plans");
        table.string("status", 32).notNullable().defaultTo("pending");
        table.timestamps(true, true);
      });
    }

    if (await db.schema.hasTable("categories")) {
      await ensureColumn("categories", "translations", (table) => {
        table.text("translations");
      });
    }
    if (await db.schema.hasTable("products")) {
      await ensureColumn("products", "view_count", (table) => {
        table.integer("view_count").defaultTo(0);
      });
      await ensureColumn("products", "translations", (table) => {
        table.text("translations");
      });
      await ensureColumn("products", "description", (table) => {
        table.string("description");
      });
      await ensureColumn("products", "active_hours_enabled", (table) => {
        table.boolean("active_hours_enabled").defaultTo(false);
      });
      await ensureColumn("products", "active_from", (table) => {
        table.string("active_from", 5);
      });
      await ensureColumn("products", "active_to", (table) => {
        table.string("active_to", 5);
      });
    }

    if (await db.schema.hasTable("restaurants")) {
      await ensureColumn("restaurants", "cover_image_url", (table) => {
        table.string("cover_image_url", 500);
      });
      await ensureColumn("restaurants", "subscription_plan_id", (table) => {
        table.integer("subscription_plan_id").unsigned();
      });
      await ensureColumn("restaurants", "total_page_views", (table) => {
        table.integer("total_page_views").defaultTo(0);
      });
      await ensureColumn("restaurants", "menu_template", (table) => {
        table.string("menu_template", 64);
      });
      await ensureColumn("restaurants", "tagline", (table) => {
        table.text("tagline");
      });
      await ensureColumn("restaurants", "maps_url", (table) => {
        table.string("maps_url", 500);
      });
      await ensureColumn("restaurants", "phone", (table) => {
        table.string("phone", 64);
      });
      await ensureColumn("restaurants", "reservation_url", (table) => {
        table.string("reservation_url", 500);
      });
      await ensureColumn("restaurants", "instagram", (table) => {
        table.string("instagram", 200);
      });
      await ensureColumn("restaurants", "tiktok", (table) => {
        table.string("tiktok", 200);
      });
      await ensureColumn("restaurants", "facebook", (table) => {
        table.string("facebook", 200);
      });
      await ensureColumn("restaurants", "social_instagram_visible", (table) => {
        table.boolean("social_instagram_visible").defaultTo(true);
      });
      await ensureColumn("restaurants", "social_tiktok_visible", (table) => {
        table.boolean("social_tiktok_visible").defaultTo(true);
      });
      await ensureColumn("restaurants", "social_facebook_visible", (table) => {
        table.boolean("social_facebook_visible").defaultTo(true);
      });
      await ensureColumn("restaurants", "opening_hours", (table) => {
        table.text("opening_hours");
      });
      await ensureColumn("restaurants", "strict_opening_hours", (table) => {
        table.boolean("strict_opening_hours").defaultTo(false);
      });
      await ensureColumn("restaurants", "onboarding_completed", (table) => {
        table.boolean("onboarding_completed").defaultTo(true);
      });
      await ensureColumn("restaurants", "subscription_ends_at", (table) => {
        table.timestamp("subscription_ends_at").nullable();
      });
      await ensureColumn("restaurants", "subscription_overrides", (table) => {
        table.text("subscription_overrides").nullable();
      });
    }

    if (await db.schema.hasTable("restaurant_users")) {
      await ensureColumn("restaurant_users", "full_name", (table) => {
        table.string("full_name", 200);
      });
      await ensureColumn("restaurant_users", "last_login_at", (table) => {
        table.timestamp("last_login_at").nullable();
      });
    }

    if (await db.schema.hasTable("subscription_plans")) {
      await ensureColumn("subscription_plans", "original_price_monthly", (table) => {
        table.decimal("original_price_monthly", 10, 2).nullable();
      });
      await ensureColumn("subscription_plans", "is_featured", (table) => {
        table.boolean("is_featured").defaultTo(false);
      });
    }

    if (await db.schema.hasTable("promo_coupons")) {
      await ensureColumn("promo_coupons", "discount_type", (table) => {
        table.string("discount_type", 16).defaultTo("percent");
      });
      await ensureColumn("promo_coupons", "discount_value", (table) => {
        table.decimal("discount_value", 10, 2).defaultTo(0);
      });
    }

    if (await db.schema.hasTable("owner_notifications")) {
      await ensureColumn("owner_notifications", "channel", (table) => {
        table.string("channel", 24).defaultTo("system");
      });
    }

    if (await db.schema.hasTable("menu_orders")) {
      await ensureColumn("menu_orders", "device_id", (table) => {
        table.string("device_id", 120).index();
      });
      await ensureColumn("menu_orders", "order_type", (table) => {
        table.string("order_type", 24);
      });
      await ensureColumn("menu_orders", "payment_method", (table) => {
        table.string("payment_method", 24);
      });
      await ensureColumn("menu_orders", "order_source", (table) => {
        table.string("order_source", 24);
      });
      await ensureColumn("menu_orders", "customer_name", (table) => {
        table.string("customer_name", 200);
      });
      await ensureColumn("menu_orders", "customer_phone", (table) => {
        table.string("customer_phone", 64);
      });
      await ensureColumn("menu_orders", "address_text", (table) => {
        table.text("address_text");
      });
      await ensureColumn("menu_orders", "geo_url", (table) => {
        table.text("geo_url");
      });
      await ensureColumn("menu_orders", "note", (table) => {
        table.text("note");
      });
      await ensureColumn("menu_orders", "total_amount", (table) => {
        table.decimal("total_amount", 10, 2).defaultTo(0);
      });
    }

    const settingsRow = await db("settings").count("id as c").first();
    if (Number((settingsRow as { c?: string | number })?.c ?? 0) === 0) {
      await db("settings").insert([
        { key: "default_language", value: "az" },
        {
          key: "supported_languages",
          value: JSON.stringify(["az", "ru", "tr", "en"]),
        },
        { key: "seed_demo_on_create", value: "true" },
        { key: "landing_cms", value: "{}" },
      ]);
    } else {
      const sd = await db("settings").where({ key: "seed_demo_on_create" }).first();
      if (!sd) {
        await db("settings").insert({ key: "seed_demo_on_create", value: "true" });
      }
      const lc = await db("settings").where({ key: "landing_cms" }).first();
      if (!lc) {
        await db("settings").insert({ key: "landing_cms", value: "{}" });
      }
    }

    await seedUiLocale();
    await seedSubscriptionPlans();

    const countResult = await db("restaurants").count("id as count").first();
    const count = Number((countResult as { count?: string | number })?.count ?? 0);
    if (count === 0) {
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
      await db("restaurant_users").insert({
        restaurant_id: newRid,
        username: "demo",
        password: "demo123",
        full_name: "Demo istifadəçi",
      });
    }

    const demoRow = await db("restaurants").where({ slug: DEMO_AZ_SLUG }).first();
    if (!demoRow) {
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
      const ruDemo = await db("restaurant_users").where({ username: "demo" }).first();
      if (!ruDemo) {
        await db("restaurant_users").insert({
          restaurant_id: newRid,
          username: "demo",
          password: "demo123",
          full_name: "Demo istifadəçi",
        });
      }
    }

    const adminUser = await db("admin_users").where({ username: "admin" }).first();
    if (!adminUser) {
      await db("admin_users").insert({
        username: "admin",
        password: "admin123",
      });
    } else {
      await db("admin_users")
        .where({ username: "admin" })
        .update({ password: "admin123" });
    }

    await db("restaurants").whereNull("menu_template").update({ menu_template: "modern-01" });

    const freePlan = await db("subscription_plans").where({ slug: "free" }).first();
    if (freePlan) {
      await db("restaurants")
        .whereNull("subscription_plan_id")
        .update({ subscription_plan_id: freePlan.id });
    }

    const notifCount = await db("admin_notifications").count("id as c").first();
    if (Number((notifCount as { c?: string | number })?.c ?? 0) === 0) {
      await db("admin_notifications").insert({
        title: "QRMenu hazırdır",
        body: "Super Admin paneldən planlar və restoranları idarə edə bilərsiniz.",
        is_read: false,
      });
    }

  } catch (err) {
    console.error("initDatabase error:", err);
    throw err;
  }
}

export async function getUiTranslationsForApi(): Promise<
  Record<string, Record<string, string>>
> {
  const rows = await db("ui_locale").select("locale", "string_key", "value");
  const out: Record<string, Record<string, string>> = {};
  for (const r of rows as { locale: string; string_key: string; value: string }[]) {
    if (!out[r.locale]) out[r.locale] = {};
    out[r.locale][r.string_key] = r.value;
  }
  return out;
}
