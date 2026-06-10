/**
 * Hər Demae məhsulu üçün internetdən (Unsplash / Pexels) uyğun real yemək şəkli.
 * URL-lər hotlink üçün stabil CDN formatındadır.
 */
const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

const p = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;

/** Məhsul adı → şəkil (seed və DB yeniləməsi üçün) */
export const DEMAE_PRODUCT_IMAGES: Record<string, string> = {
  // Salatlar
  "Sezar salatı (toyuq ilə)": u("1546793665-c74683f339c1"),
  "Sezar salatı (krevetka ilə)": p(262978),
  "Krab salatı": p(3294696),
  "Salmon salatı": u("1512621776951-a57141f2eefd"),
  "Chukka salatı": p(674574),
  Edamame: p(674574),
  "Edamame Spicy": p(725991),
  "Tuna salatı": u("1768326119762-20c2a9f5c1f2"),
  "Tərəvəz Box": p(12804299),
  "Yapon üsulu düyü salatı": p(6962184),
  "Avokadolu qızıl balıq salatı": p(2097090),

  // Şorbalar
  "Miso qızılbalıq ilə": u("1604908176997-125f25cc6f3d"),
  "Acılı krevetka supu": p(539451),
  "Tom Yum": p(2232),

  // Noodle
  "Dəniz məhsulları ilə soba əriştəsi": p(8846006),
  "Krevetka ilə soba əriştəsi": p(725991),
  "Toyuq ilə soba əriştəsi": p(60616),
  "Tərəvəz ilə soba əriştəsi": p(1435907),

  // İsti Qəlyanaltılar
  "Midye (qara, 8 ədəd)": p(566345),
  "Kalmar (5 ədəd)": p(53148),
  "Midye (yaşıl, 5 ədəd)": p(248444),
  "Tempura krevetka (6 ədəd)": u("1582450871992-f3a37d3f5e5"),
  "Nuggets + French Fries": p(2097090),
  "French Fries": u("1573086215449-89a9e5a1e4f5"),
  "Kaşarlı krevetka (5 ədəd)": p(566566),
  "Soğan halqaları (6 ədəd)": p(158694),
  "Pendir çubuqları (4 ədəd)": p(410911),
  "Corn Dog": p(2238380),

  // Əsas Yeməklər
  "Mancuriya steyk": p(361184),
  "Yapon toyuğu": p(60616),
  "Pekin ördəyi": p(2232),
  "Norveç qızıl balığı": u("1519708225918-c084eb702b9"),

  // Hot Roll
  "Hot California Roll": u("1574183118053-258a7b31e784"),
  "Hot Filadelfia Roll": u("1759646828324-c215a83828ae"),
  "Hot Baked Roll": p(3756942),
  "Hot Krevet Roll": p(2098085),
  "Hot Cheese Roll": p(5409661),
  "Tori Hot Roll": p(60616),
  "Hot Demae Special Roll": p(9585450),
  "Hot Sakura Roll": p(769289),

  // Maki
  "Salmon Maki": p(842642),
  "Manqo Maki": p(1132047),
  "Sake Maki": p(5958787),
  "Unagi Maki": p(2893975),
  "Tərəvəzli Maki": p(4518843),
  "Kani Maki": p(6248864),

  // Soyuq Rollar
  "Filadelfia Grill Roll": u("1759646828324-c215a83828ae"),
  "Baked Roll": p(2484688),
  "Yasai Cheese Roll": p(1435902),
  "Sezar Roll": u("1546793665-c74683f339c1"),
  "San Fransisko": u("1574183118053-258a7b31e784"),
  "Unagi Roll": p(8675374),
  "California Salmon Roll": u("1519708225918-c084eb702b9"),
  "Alaska Roll": p(8425717),
  "Filadelfia Roll": p(5409662),
  "California Krevet Roll": p(5958788),
  "California Roll": u("1574183118053-258a7b31e784"),
  "Sake Roll": p(7679620),
  "Crab Mix Roll": p(7679621),
  "Shrimp Tempura Roll": u("1582450871992-f3a37d3f5e5"),
  "Tərəvəzli Roll": p(7679622),
  "Dragon Roll": u("1563379926893-2573d9b9f436"),
  "Fuciyama Lux Roll": p(8846006),
  "Yaşıl Əjdaha Roll": p(12804299),
  "Bonito Roll": p(248444),
  "Sushi Dürüm": p(357756),
  "Sushi Burger": p(2238380),

  // Premium Roll
  "Hawaii Roll": p(1132047),
  "Spicy Roll": p(725991),
  "Snow Roll": p(674574),
  "Karides Roll": p(566566),
  "Snow Crab Roll": p(3294696),
  "Geisha Roll": p(2097090),
  "Demae Roll": u("1579584425555-c3ce17fd4351"),
  "Demae Premium Roll": p(12832119),
  "Sakura Roll": p(262978),
  "Ebi Roll": p(539451),

  // Nigiri
  "Nigiri Avokado": p(1132047),
  "Nigiri Salmon": u("1617196034796-9b071cd76e45"),
  "Unagi Kunsei": p(8675375),
  "Amazu Nigiri": p(8425718),
  "Sake Kunsei": u("1553621042-f6e147245754"),

  // Gunkan
  "Amazu Spice": p(725991),
  "Syake Spice": p(5958787),
  "Chukka Gunkan": p(674574),
  "Hiashi Wakame ilə Gunkan": p(357756),
  "Unagi Kunsei Spice": p(2893975),

  // Dragon Roll
  "Red Dragon": u("1563379926893-2573d9b9f436"),
  "Green Dragon": p(1435907),
  "Gold Dragon": p(9585450),

  // Sushi Setlər
  "Culfa Set (30 ədəd)": p(12832119),
  "Şərur Set (40 ədəd)": u("1611141936605-14ca0dd9d36b"),
  "Hot Set (50 ədəd)": p(3756942),
  "Hot Set (30 ədəd)": u("1574183118053-258a7b31e784"),
  "Şahbuz Set (30 ədəd)": p(769289),
  "Sədərək Set (40 ədəd)": p(842642),
  "Ordubad Set (40 ədəd)": p(5958787),
  "Lüx Demae Set (70 ədəd)": u("1579584425555-c3ce17fd4351"),
  "Hot Set (20 ədəd)": u("1759646828324-c215a83828ae"),
  "Naxçıvan Set (80 ədəd)": p(9585450),

  // Qəhvə və Desert
  Espresso: u("1510591509098-08b7c5d91e0e"),
  Latte: u("1461024350315-8b9d8e1b3c0f"),
  Cappuccino: u("1495474472287-4d71bcdd2085"),
  Americano: u("1511920170033-c7a8fc2a5beb"),
  "Türk qəhvəsi": p(3127387),
  "Iced Americano": p(302899),
  "Iced Latte": p(1469005),
  "Iced Mocha": p(302899),
  Mochi: p(7241060),
  Waffle: u("1562376552-9d392f1f0b59"),
  "San Sebastian": u("1578985545062-69928b1d9587"),

  // İçkilər
  "Cola 330 ml": p(50552),
  "Fanta 330 ml": p(2999278),
  "Sprite 330 ml": p(2789328),
  "Cappy 500 ml": p(143133),
  "Cappy Kids": p(774909),
  Sarıkız: p(367696),
  "Su (qazlı/qazsız)": p(416528),
  "Milkshake növləri": u("1572490122747-3968b75cc929"),
  "Mojito növləri": u("1551632816-3a12314a2392"),
};

export function imageForDemaeProduct(name: string): string | undefined {
  return DEMAE_PRODUCT_IMAGES[name];
}
