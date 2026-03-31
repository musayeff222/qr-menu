import "dotenv/config";
import knex, { type Knex } from "knex";

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
        table.integer("restaurant_id").references("id").inTable("restaurants");
        table.string("name").notNullable();
        table.text("translations");
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
        table.text("translations");
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

    if (await db.schema.hasTable("categories")) {
      await ensureColumn("categories", "translations", (table) => {
        table.text("translations");
      });
    }
    if (await db.schema.hasTable("products")) {
      await ensureColumn("products", "translations", (table) => {
        table.text("translations");
      });
      await ensureColumn("products", "description", (table) => {
        table.string("description");
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
      ]);
    }

    await seedUiLocale();

    const countResult = await db("restaurants").count("id as count").first();
    const count = Number((countResult as { count?: string | number })?.count ?? 0);
    if (count === 0) {
      await db("restaurants").insert({
        name: "The Burger Joint",
        slug: "burger-joint",
        whatsapp_number: "1234567890",
        primary_color: "#ef4444",
        theme: "modern",
        plan: "vip",
      });

      const rest = await db("restaurants").where({ slug: "burger-joint" }).first();
      if (rest) {
        const [catId] = await db("categories").insert({
          restaurant_id: rest.id,
          name: "Burgers",
        });
        await db("products").insert([
          {
            restaurant_id: rest.id,
            category_id: catId,
            name: "Classic Burger",
            price: 12.99,
            description: "Juicy beef patty with lettuce and tomato.",
          },
          {
            restaurant_id: rest.id,
            category_id: catId,
            name: "Cheese Burger",
            price: 14.99,
            description: "Classic burger with melted cheddar.",
          },
        ]);
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

    const ru = await db("restaurant_users").where({ username: "burger_admin" }).first();
    if (!ru) {
      const r = await db("restaurants").where({ slug: "burger-joint" }).first();
      if (r) {
        await db("restaurant_users").insert({
          restaurant_id: r.id,
          username: "burger_admin",
          password: "burger123",
        });
      }
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
