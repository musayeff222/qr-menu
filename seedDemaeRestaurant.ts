/**
 * Demae Sushi restoran? + tam menyu seed.
 * ??? sal: npm run seed:demae
 * Menyunu yenid?n yükl?m?k: npm run seed:demae:replace
 */
import { db, getDbDriver, initDatabase } from "./database.js";
import { runDemaeSeed } from "./demaeSeedRunner.js";

const replaceMenu = process.argv.includes("--replace");
const imagesOnly = process.argv.includes("--images");

async function main() {
  console.log(`DB: ${getDbDriver()} (ayr? skript ? server restart etmir)`);
  await initDatabase();

  const result = await runDemaeSeed(db, { replace: replaceMenu, imagesOnly });
  if (result.created) {
    console.log(`? Restoran yarad?ld?: Demae Sushi (id=${result.restaurantId})`);
  } else {
    console.log(`? Restoran art?q mövcuddur (id=${result.restaurantId})`);
  }
  console.log(`? Panel: ${result.username} / ${result.password}`);
  if (!imagesOnly && result.menuProducts > 0) {
    console.log(`? Menyu: ${result.menuCategories} kateqoriya, ${result.menuProducts} m?hsul`);
  }
  console.log(`? ??kill?r: ${result.imagesUpdated} m?hsul`);
  console.log(`\nCanl? menyu: /r/${result.slug}`);
  console.log(`Panel: /panel`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.destroy();
  });
