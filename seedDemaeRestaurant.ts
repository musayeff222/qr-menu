/**
 * Demae Sushi restoran? + tam menyu seed.
 * ??? sal: npx tsx seedDemaeRestaurant.ts
 * Menyunu yenid?n y?kl?m?k: npx tsx seedDemaeRestaurant.ts --replace
 */
import { db, getDbDriver, initDatabase } from "./database.js";
import { DEMAE_RESTAURANT_SLUG, seedDemaeMenu, updateDemaeProductImages } from "./demaeMenuSeed.js";

const RESTAURANT_NAME = "Demae Sushi";
const STAFF_USERNAME = "demae";
const STAFF_PASSWORD = "demae123";
const STAFF_FULL_NAME = "Demae Admin";

const replaceMenu = process.argv.includes("--replace");
const imagesOnly = process.argv.includes("--images");

async function main() {
  console.log(`DB: ${getDbDriver()} (ayr? skript ? server restart etmir)`);
  await initDatabase();

  const vipPlan = await db("subscription_plans").where({ slug: "vip" }).first();
  const cover =
    "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1600&q=80&auto=format&fit=crop";
  const logo =
    "https://images.unsplash.com/photo-1617196034796-9b071cd76e45?w=400&q=80&auto=format&fit=crop";

  let restaurant = await db("restaurants").where({ slug: DEMAE_RESTAURANT_SLUG }).first();

  if (!restaurant) {
    const ids = await db("restaurants").insert({
      name: RESTAURANT_NAME,
      slug: DEMAE_RESTAURANT_SLUG,
      whatsapp_number: "994501234567",
      primary_color: "#b91c1c",
      theme: "modern",
      plan: "vip",
      subscription_plan_id: vipPlan?.id ?? null,
      menu_template: "modern-01",
      tagline: "Yapon m?tb?xi ? Sushi, rollar v? setl?r",
      maps_url: "https://maps.google.com/?q=Baku+Azerbaijan",
      phone: "+994 12 555 00 00",
      cover_image_url: cover,
      logo_url: logo,
      onboarding_completed: true,
    });
    const restaurantId = Number(Array.isArray(ids) ? ids[0] : ids);
    restaurant = await db("restaurants").where({ id: restaurantId }).first();
    console.log(`? Restoran yarad?ld?: ${RESTAURANT_NAME} (id=${restaurantId})`);
  } else {
    console.log(`? Restoran art?q m?vcuddur: ${RESTAURANT_NAME} (id=${restaurant.id})`);
  }

  const restaurantId = Number(restaurant!.id);

  const staff = await db("restaurant_users").where({ username: STAFF_USERNAME }).first();
  if (!staff) {
    await db("restaurant_users").insert({
      restaurant_id: restaurantId,
      username: STAFF_USERNAME,
      password: STAFF_PASSWORD,
      full_name: STAFF_FULL_NAME,
    });
    console.log(`? Panel giri?i yarad?ld?: ${STAFF_USERNAME} / ${STAFF_PASSWORD}`);
  } else if (Number(staff.restaurant_id) !== restaurantId) {
    console.warn(
      `? "${STAFF_USERNAME}" ba?qa restorana ba?l?d?r (id=${staff.restaurant_id}). Yeni login ???n f?rqli username se?in.`
    );
  } else {
    await db("restaurant_users")
      .where({ id: staff.id })
      .update({ password: STAFF_PASSWORD, full_name: STAFF_FULL_NAME });
    console.log(`? Panel giri?i yenil?ndi: ${STAFF_USERNAME} / ${STAFF_PASSWORD}`);
  }

  if (imagesOnly) {
    const n = await updateDemaeProductImages(db, restaurantId);
    console.log(`? ${n} m?hsulun ??kli yenil?ndi (h?r biri ???n uy?un internet ??kli).`);
  } else {
    const stats = await seedDemaeMenu(db, restaurantId, { replace: replaceMenu });
    if (stats.products > 0) {
      console.log(`? Menyu y?kl?ndi: ${stats.categories} kateqoriya, ${stats.products} m?hsul`);
    } else if (!replaceMenu) {
      console.log("? Menyu art?q var. Yenid?n y?kl?m?k ???n: npx tsx seedDemaeRestaurant.ts --replace");
    }
    const imgN = await updateDemaeProductImages(db, restaurantId);
    console.log(`? ??kill?r t?yin olundu: ${imgN} m?hsul`);
  }

  console.log("\n--- Giri? m?lumatlar? ---");
  console.log(`Canl? menyu: /r/${DEMAE_RESTAURANT_SLUG}`);
  console.log(`Panel: /panel ? login: ${STAFF_USERNAME} / ${STAFF_PASSWORD}`);
  console.log(`Restoran id (URL): /restaurant/${restaurantId}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.destroy();
  });
