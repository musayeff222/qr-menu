import type { Knex } from "knex";
import { DEMAE_RESTAURANT_SLUG, seedDemaeMenu, updateDemaeProductImages } from "./demaeMenuSeed.js";

const RESTAURANT_NAME = "Demae Sushi";
const STAFF_USERNAME = "demae";
const STAFF_PASSWORD = "demae123";
const STAFF_FULL_NAME = "Demae Admin";

export type DemaeSeedResult = {
  restaurantId: number;
  slug: string;
  username: string;
  password: string;
  menuCategories: number;
  menuProducts: number;
  imagesUpdated: number;
  created: boolean;
};

export async function runDemaeSeed(
  knex: Knex,
  opts?: { replace?: boolean; imagesOnly?: boolean }
): Promise<DemaeSeedResult> {
  const vipPlan = await knex("subscription_plans").where({ slug: "vip" }).first();
  const cover =
    "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1600&q=80&auto=format&fit=crop";
  const logo =
    "https://images.unsplash.com/photo-1617196034796-9b071cd76e45?w=400&q=80&auto=format&fit=crop";

  let restaurant = await knex("restaurants").where({ slug: DEMAE_RESTAURANT_SLUG }).first();
  let created = false;

  if (!restaurant) {
    const ids = await knex("restaurants").insert({
      name: RESTAURANT_NAME,
      slug: DEMAE_RESTAURANT_SLUG,
      whatsapp_number: "994501234567",
      primary_color: "#b91c1c",
      theme: "modern",
      plan: "vip",
      subscription_plan_id: vipPlan?.id ?? null,
      menu_template: "modern-01",
      tagline: "Yapon mətbəxi · Sushi, rollar və setlər",
      maps_url: "https://maps.google.com/?q=Baku+Azerbaijan",
      phone: "+994 12 555 00 00",
      cover_image_url: cover,
      logo_url: logo,
      onboarding_completed: true,
    });
    const restaurantId = Number(Array.isArray(ids) ? ids[0] : ids);
    restaurant = await knex("restaurants").where({ id: restaurantId }).first();
    created = true;
  }

  const restaurantId = Number(restaurant!.id);

  const staff = await knex("restaurant_users").where({ username: STAFF_USERNAME }).first();
  if (!staff) {
    await knex("restaurant_users").insert({
      restaurant_id: restaurantId,
      username: STAFF_USERNAME,
      password: STAFF_PASSWORD,
      full_name: STAFF_FULL_NAME,
    });
  } else if (Number(staff.restaurant_id) === restaurantId) {
    await knex("restaurant_users")
      .where({ id: staff.id })
      .update({ password: STAFF_PASSWORD, full_name: STAFF_FULL_NAME });
  }

  let menuCategories = 0;
  let menuProducts = 0;
  let imagesUpdated = 0;

  if (opts?.imagesOnly) {
    imagesUpdated = await updateDemaeProductImages(knex, restaurantId);
  } else {
    const stats = await seedDemaeMenu(knex, restaurantId, { replace: opts?.replace });
    menuCategories = stats.categories;
    menuProducts = stats.products;
    imagesUpdated = await updateDemaeProductImages(knex, restaurantId);
  }

  return {
    restaurantId,
    slug: DEMAE_RESTAURANT_SLUG,
    username: STAFF_USERNAME,
    password: STAFF_PASSWORD,
    menuCategories,
    menuProducts,
    imagesUpdated,
    created,
  };
}
