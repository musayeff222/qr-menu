import type { Knex } from "knex";

/** Columns the app reads/writes. Inspect only — never ALTER here. */
export const REQUIRED_COLUMNS: Record<string, string[]> = {
  restaurants: [
    "id",
    "name",
    "slug",
    "logo_url",
    "primary_color",
    "whatsapp_number",
    "theme",
    "menu_template",
    "tagline",
    "maps_url",
    "phone",
    "reservation_url",
    "instagram",
    "tiktok",
    "facebook",
    "is_active",
    "plan",
    "cover_image_url",
    "subscription_plan_id",
    "total_page_views",
    "menu_appearance_json",
    "social_instagram_visible",
    "social_tiktok_visible",
    "social_facebook_visible",
    "opening_hours",
    "strict_opening_hours",
    "onboarding_completed",
    "subscription_ends_at",
    "subscription_overrides",
  ],
  admin_users: ["id", "username", "password"],
  restaurant_users: ["id", "restaurant_id", "username", "password", "full_name", "last_login_at"],
  settings: ["id", "key", "value"],
  categories: ["id", "restaurant_id", "name", "translations", "sort_order"],
  products: [
    "id",
    "category_id",
    "restaurant_id",
    "name",
    "description",
    "translations",
    "price",
    "image_url",
    "is_available",
    "active_hours_enabled",
    "active_from",
    "active_to",
    "view_count",
  ],
  product_variants: ["id", "product_id", "name", "price", "sort_order"],
  menu_orders: [
    "id",
    "restaurant_id",
    "payload",
    "status",
    "device_id",
    "order_type",
    "payment_method",
    "order_source",
    "customer_name",
    "customer_phone",
    "address_text",
    "geo_url",
    "note",
    "total_amount",
  ],
  order_status_logs: ["id", "order_id", "restaurant_id", "from_status", "to_status", "actor"],
  subscription_plans: [
    "id",
    "name",
    "slug",
    "price_monthly",
    "max_products",
    "max_categories",
    "max_templates",
    "max_qr_codes",
    "original_price_monthly",
    "is_featured",
  ],
  restaurant_media_assets: ["id", "restaurant_id", "kind", "url", "sort_order"],
  ui_locale: ["id", "string_key", "locale", "value"],
  scans: ["id", "restaurant_id"],
  promo_coupons: ["id", "code", "discount_type", "discount_value"],
  owner_notifications: ["id", "restaurant_id", "title", "channel"],
  analytics_daily: ["day", "metric", "value"],
  demo_link_visits: ["id", "demo_slug"],
  plan_upgrade_requests: ["id", "restaurant_id", "subscription_plan_id", "status"],
  custom_menu_templates: ["id", "slug_key", "name", "category"],
  admin_notifications: ["id", "title"],
};

export type SchemaInspectReport = {
  ok: boolean;
  missingTables: string[];
  missingColumns: string[];
  hasMenuAppearanceJson: boolean;
};

export async function inspectRequiredSchema(db: Knex): Promise<SchemaInspectReport> {
  const missingTables: string[] = [];
  const missingColumns: string[] = [];
  for (const [table, columns] of Object.entries(REQUIRED_COLUMNS)) {
    const exists = await db.schema.hasTable(table);
    if (!exists) {
      missingTables.push(table);
      for (const col of columns) missingColumns.push(`${table}.${col}`);
      continue;
    }
    for (const col of columns) {
      const has = await db.schema.hasColumn(table, col);
      if (!has) missingColumns.push(`${table}.${col}`);
    }
  }
  const hasMenuAppearanceJson =
    !missingTables.includes("restaurants") &&
    !missingColumns.includes("restaurants.menu_appearance_json");
  return {
    ok: missingTables.length === 0 && missingColumns.length === 0,
    missingTables,
    missingColumns,
    hasMenuAppearanceJson,
  };
}

export function schemaInspectPublic(report: SchemaInspectReport | null) {
  if (!report) return { ok: false, inspected: false };
  return {
    ok: report.ok,
    inspected: true,
    missingTableCount: report.missingTables.length,
    missingColumnCount: report.missingColumns.length,
    hasMenuAppearanceJson: report.hasMenuAppearanceJson,
  };
}
