import type { Knex } from "knex";
import { DEMAE_PRODUCT_IMAGES, imageForDemaeProduct } from "./demaeProductImages.js";

export const DEMAE_RESTAURANT_SLUG = "demae";

type DemoItem = { name: string; price: number; description: string; image_url: string };
type DemoCat = { name: string; sort_order: number; items: DemoItem[] };

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80&auto=format&fit=crop";

function item(name: string, price: number, hint: string): DemoItem {
  return {
    name,
    price,
    description: hint,
    image_url: imageForDemaeProduct(name) ?? FALLBACK_IMAGE,
  };
}

function buildCategories(): DemoCat[] {
  const cats: Array<{ name: string; hint: string; rows: [string, number][] }> = [
    {
      name: "Salatlar",
      hint: "T?z? salat v? yapon t?r?v?zl?ri.",
      rows: [
        ["Sezar salat? (toyuq il?)", 8],
        ["Sezar salat? (krevetka il?)", 10],
        ["Krab salat?", 10],
        ["Salmon salat?", 15],
        ["Chukka salat?", 6],
        ["Edamame", 6],
        ["Edamame Spicy", 6],
        ["Tuna salat?", 10],
        ["T?r?v?z Box", 15],
        ["Yapon üsulu düyü salat?", 7],
        ["Avokadolu q?z?l bal?q salat?", 15],
      ],
    },
    {
      name: "?orbalar",
      hint: "?sti yapon ?orbalar?.",
      rows: [
        ["Miso q?z?lbal?q il?", 15],
        ["Ac?l? krevetka supu", 8],
        ["Tom Yum", 10],
      ],
    },
    {
      name: "Noodle",
      hint: "Soba ?ri?t?si il? haz?rlanm?? yem?kl?r.",
      rows: [
        ["D?niz m?hsullar? il? soba ?ri?t?si", 10],
        ["Krevetka il? soba ?ri?t?si", 10],
        ["Toyuq il? soba ?ri?t?si", 8],
        ["T?r?v?z il? soba ?ri?t?si", 7],
      ],
    },
    {
      name: "?sti Q?lyanalt?lar",
      hint: "Q?zard?lm?? v? tempura q?lyanalt?lar.",
      rows: [
        ["Midye (qara, 8 ?d?d)", 10],
        ["Kalmar (5 ?d?d)", 8],
        ["Midye (ya??l, 5 ?d?d)", 10],
        ["Tempura krevetka (6 ?d?d)", 7],
        ["Nuggets + French Fries", 7],
        ["French Fries", 4],
        ["Ka?arl? krevetka (5 ?d?d)", 5],
        ["So?an halqalar? (6 ?d?d)", 7],
        ["Pendir çubuqlar? (4 ?d?d)", 8],
        ["Corn Dog", 6],
      ],
    },
    {
      name: "?sas Yem?kl?r",
      hint: "?sas yem?k seçiml?ri.",
      rows: [
        ["Mancuriya steyk", 8],
        ["Yapon toyu?u", 15],
        ["Pekin örd?yi", 11],
        ["Norveç q?z?l bal???", 50],
      ],
    },
    {
      name: "Hot Roll",
      hint: "?sti servis edil?n rollar.",
      rows: [
        ["Hot California Roll", 10],
        ["Hot Filadelfia Roll", 12],
        ["Hot Baked Roll", 10],
        ["Hot Krevet Roll", 11],
        ["Hot Cheese Roll", 10],
        ["Tori Hot Roll", 9],
        ["Hot Demae Special Roll", 14],
        ["Hot Sakura Roll", 12],
      ],
    },
    {
      name: "Maki",
      hint: "Klassik maki rulonlar?.",
      rows: [
        ["Salmon Maki", 7],
        ["Manqo Maki", 7],
        ["Sake Maki", 7],
        ["Unagi Maki", 7],
        ["T?r?v?zli Maki", 7],
        ["Kani Maki", 7],
      ],
    },
    {
      name: "Soyuq Rollar",
      hint: "Soyuq servis edil?n rollar.",
      rows: [
        ["Filadelfia Grill Roll", 12],
        ["Baked Roll", 10],
        ["Yasai Cheese Roll", 9],
        ["Sezar Roll", 9],
        ["San Fransisko", 12],
        ["Unagi Roll", 12],
        ["California Salmon Roll", 11],
        ["Alaska Roll", 11],
        ["Filadelfia Roll", 11],
        ["California Krevet Roll", 11],
        ["California Roll", 10],
        ["Sake Roll", 13],
        ["Crab Mix Roll", 12],
        ["Shrimp Tempura Roll", 13],
        ["T?r?v?zli Roll", 9],
        ["Dragon Roll", 12],
        ["Fuciyama Lux Roll", 13],
        ["Ya??l ?jdaha Roll", 13],
        ["Bonito Roll", 12],
        ["Sushi Dürüm", 13],
        ["Sushi Burger", 10],
      ],
    },
    {
      name: "Premium Roll",
      hint: "Premium seçim rollar.",
      rows: [
        ["Hawaii Roll", 15],
        ["Spicy Roll", 15],
        ["Snow Roll", 18],
        ["Karides Roll", 16],
        ["Snow Crab Roll", 14],
        ["Geisha Roll", 14],
        ["Demae Roll", 16],
        ["Demae Premium Roll", 20],
        ["Sakura Roll", 18],
        ["Ebi Roll", 15],
      ],
    },
    {
      name: "Nigiri",
      hint: "?n?n?vi nigiri sushi.",
      rows: [
        ["Nigiri Avokado", 4],
        ["Nigiri Salmon", 4],
        ["Unagi Kunsei", 4],
        ["Amazu Nigiri", 4],
        ["Sake Kunsei", 4],
      ],
    },
    {
      name: "Gunkan",
      hint: "Gunkan format?nda sushi.",
      rows: [
        ["Amazu Spice", 7],
        ["Syake Spice", 7],
        ["Chukka Gunkan", 5],
        ["Hiashi Wakame il? Gunkan", 8],
        ["Unagi Kunsei Spice", 7],
      ],
    },
    {
      name: "Dragon Roll",
      hint: "Dragon roll seriyas?.",
      rows: [
        ["Red Dragon", 12],
        ["Green Dragon", 12],
        ["Gold Dragon", 12],
      ],
    },
    {
      name: "Sushi Setl?r",
      hint: "Haz?r sushi setl?ri.",
      rows: [
        ["Culfa Set (30 ?d?d)", 28],
        ["??rur Set (40 ?d?d)", 32],
        ["Hot Set (50 ?d?d)", 45],
        ["Hot Set (30 ?d?d)", 24],
        ["?ahbuz Set (30 ?d?d)", 32],
        ["S?d?r?k Set (40 ?d?d)", 35],
        ["Ordubad Set (40 ?d?d)", 45],
        ["Lüx Demae Set (70 ?d?d)", 60],
        ["Hot Set (20 ?d?d)", 18],
        ["Naxç?van Set (80 ?d?d)", 75],
      ],
    },
    {
      name: "Q?hv? v? Desert",
      hint: "Q?hv? v? ?irniyyatlar.",
      rows: [
        ["Espresso", 4],
        ["Latte", 8],
        ["Cappuccino", 8],
        ["Americano", 4],
        ["Türk q?hv?si", 4],
        ["Iced Americano", 5],
        ["Iced Latte", 8],
        ["Iced Mocha", 10],
        ["Mochi", 3],
        ["Waffle", 10],
        ["San Sebastian", 7],
      ],
    },
    {
      name: "?çkil?r",
      hint: "Soyuq içkil?r v? kokteyll?r.",
      rows: [
        ["Cola 330 ml", 3],
        ["Fanta 330 ml", 3],
        ["Sprite 330 ml", 3],
        ["Cappy 500 ml", 3],
        ["Cappy Kids", 1.5],
        ["Sar?k?z", 1.5],
        ["Su (qazl?/qazs?z)", 1],
        ["Milkshake növl?ri", 8],
        ["Mojito növl?ri", 8],
      ],
    },
  ];

  return cats.map((c, sort_order) => ({
    name: c.name,
    sort_order,
    items: c.rows.map(([name, price]) => item(name, price, c.hint)),
  }));
}

export async function seedDemaeMenu(
  knex: Knex,
  restaurantId: number,
  opts?: { replace?: boolean }
): Promise<{ categories: number; products: number }> {
  if (opts?.replace) {
    await knex("products").where({ restaurant_id: restaurantId }).delete();
    await knex("categories").where({ restaurant_id: restaurantId }).delete();
  }

  const existing = await knex("categories").where({ restaurant_id: restaurantId }).count("* as c").first();
  const catCount = Number((existing as { c?: string | number })?.c ?? 0);
  if (catCount > 0 && !opts?.replace) {
    return { categories: catCount, products: 0 };
  }

  const categories = buildCategories();
  let nCat = 0;
  let nProd = 0;

  for (const cat of categories) {
    const ids = await knex("categories").insert({
      restaurant_id: restaurantId,
      name: cat.name,
      sort_order: cat.sort_order,
    });
    const cid = Number(Array.isArray(ids) ? ids[0] : ids);
    nCat++;
    const batch = cat.items.map((p) => ({
      restaurant_id: restaurantId,
      category_id: cid,
      name: p.name,
      description: p.description,
      price: p.price,
      image_url: p.image_url,
      is_available: true,
    }));
    await knex.batchInsert("products", batch, 50);
    nProd += batch.length;
  }

  return { categories: nCat, products: nProd };
}

/** Mövcud m?hsullar?n ??kill?rini ad üzr? yenil?yir (menyunu silm?d?n). */
export async function updateDemaeProductImages(knex: Knex, restaurantId: number): Promise<number> {
  let updated = 0;
  for (const [name, image_url] of Object.entries(DEMAE_PRODUCT_IMAGES)) {
    const n = await knex("products").where({ restaurant_id: restaurantId, name }).update({ image_url });
    updated += Number(n);
  }
  return updated;
}
