import type { Knex } from "knex";
import { DEMO_AZ_SLUG } from "./demoConstants.js";

export { DEMO_AZ_SLUG } from "./demoConstants.js";
export { DEMO_QR_PUBLIC_SLUG } from "./demoConstants.js";

type DemoItem = {
  name: string;
  price: number;
  description: string;
  image_url: string;
};

type DemoCat = { name: string; sort_order: number; items: DemoItem[] };

/** Unsplash / açıq mənbəli nümunə şəkillər (hər məhsul üçün fərqli kadrlar) */
const IMG = {
  plov: "https://images.unsplash.com/photo-1589302168068-964664d93a0d?w=800&q=80&auto=format&fit=crop",
  dumpling: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80&auto=format&fit=crop",
  dolma: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80&auto=format&fit=crop",
  kebab1: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80&auto=format&fit=crop",
  kebab2: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80&auto=format&fit=crop",
  sac: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&auto=format&fit=crop",
  soup1: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80&auto=format&fit=crop",
  soup2: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&q=80&auto=format&fit=crop",
  soup3: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80&auto=format&fit=crop",
  breakfast1: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80&auto=format&fit=crop",
  breakfast2: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&q=80&auto=format&fit=crop",
  breakfast3: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80&auto=format&fit=crop",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format&fit=crop",
  hotdog: "https://images.unsplash.com/photo-1612392062631-1520f6f6bf21?w=800&q=80&auto=format&fit=crop",
  drink1: "https://images.unsplash.com/photo-1572490122747-3968b75cc929?w=800&q=80&auto=format&fit=crop",
  drink2: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80&auto=format&fit=crop",
  drink3: "https://images.unsplash.com/photo-1554866585-cd948608f0e0?w=800&q=80&auto=format&fit=crop",
  drink4: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&q=80&auto=format&fit=crop",
  dessert1: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80&auto=format&fit=crop",
  dessert2: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80&auto=format&fit=crop",
  dessert3: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80&auto=format&fit=crop",
};

const DEMO_CATEGORIES: DemoCat[] = [
  {
    name: "Əsas yeməklər",
    sort_order: 0,
    items: [
      { name: "Plov", price: 12, description: "Ənənəvi düyü, ət və göyərti ilə.", image_url: IMG.plov },
      { name: "Düşbərə", price: 9, description: "Kiçik xəmir içlikli, ədviyyatlı şorba.", image_url: IMG.dumpling },
      { name: "Dolma", price: 9.5, description: "Üzüm yarpağında ət və düyü.", image_url: IMG.dolma },
      { name: "Tikə kabab", price: 14, description: "Manqalda bişmiş ət tikələri.", image_url: IMG.kebab1 },
      { name: "Lülə kabab", price: 13, description: "Əzilmiş ətdən lülə, lavaş ilə.", image_url: IMG.kebab2 },
      { name: "Sac", price: 16, description: "Sacda qızardılmış ət və tərəvəz.", image_url: IMG.sac },
    ],
  },
  {
    name: "Şorbalar",
    sort_order: 1,
    items: [
      { name: "Dovğa", price: 6, description: "Yayxətən xəmirli, sərtən sərin şorba.", image_url: IMG.soup1 },
      { name: "Küftə bozbaş", price: 8, description: "Ət küftəsi, ədviyyatlı şorba.", image_url: IMG.soup2 },
      { name: "Toyuq şorbası", price: 7, description: "Evə hazırlanmış təmiz təbii şorba.", image_url: IMG.soup3 },
    ],
  },
  {
    name: "Səhər yeməkləri",
    sort_order: 2,
    items: [
      { name: "Yumurta pomidor", price: 5, description: "Qəlyanaltı klassik səhər yeməyi.", image_url: IMG.breakfast1 },
      { name: "Şor pendir", price: 4.5, description: "Evə hazırlanmış şor pendir.", image_url: IMG.breakfast2 },
      { name: "Bal qaymaq", price: 6, description: "Təzə bal və qaymaq.", image_url: IMG.breakfast3 },
    ],
  },
  {
    name: "Fast Food",
    sort_order: 3,
    items: [
      { name: "Burger", price: 10, description: "Ət kotlet, pendir, tərəvəz.", image_url: IMG.burger },
      { name: "Pizza", price: 12, description: "İncə xəmir, pendir və sous.", image_url: IMG.pizza },
      { name: "Hot-dog", price: 5, description: "Sosis, sos və xəmir.", image_url: IMG.hotdog },
    ],
  },
  {
    name: "İçkilər",
    sort_order: 4,
    items: [
      { name: "Ayran", price: 2, description: "Süzmə və sərin.", image_url: IMG.drink1 },
      { name: "Çay", price: 2, description: "Qara və ya yaşıl çay.", image_url: IMG.drink2 },
      { name: "Kola", price: 3, description: "Qazlı içki.", image_url: IMG.drink3 },
      { name: "Təzə sıxılmış şirələr", price: 5, description: "Portağal, alma və ya qarışıq.", image_url: IMG.drink4 },
    ],
  },
  {
    name: "Desertlər",
    sort_order: 5,
    items: [
      { name: "Paxlava", price: 7, description: "Qozlu şərbətli şirniyyat.", image_url: IMG.dessert1 },
      { name: "Şəki halvası", price: 6, description: "Ənənəvi Şəki halvası.", image_url: IMG.dessert2 },
      { name: "Tort", price: 8, description: "Günün tortu — kremli.", image_url: IMG.dessert3 },
    ],
  },
];

export async function seedDemoAzMenu(
  knex: Knex,
  restaurantId: number,
  opts?: { maxCategories?: number; maxProducts?: number }
): Promise<void> {
  const maxC = opts?.maxCategories ?? 99;
  const maxP = opts?.maxProducts ?? 999;
  let nCat = 0;
  let nProd = 0;
  for (const cat of DEMO_CATEGORIES) {
    if (nCat >= maxC || nProd >= maxP) break;
    const ids = await knex("categories").insert({
      restaurant_id: restaurantId,
      name: cat.name,
      sort_order: cat.sort_order,
    });
    const cid = Number(Array.isArray(ids) ? ids[0] : ids);
    nCat++;
    for (const item of cat.items) {
      if (nProd >= maxP) break;
      await knex("products").insert({
        restaurant_id: restaurantId,
        category_id: cid,
        name: item.name,
        description: item.description,
        price: item.price,
        image_url: item.image_url,
        is_available: true,
      });
      nProd++;
    }
  }
}
