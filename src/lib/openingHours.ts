/** opening_hours JSON: { slots: { mon?: {open,close}[], ... } } — boş gün = bağlı */

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

export type OpeningHoursJson = {
  slots?: Partial<
    Record<
      DayKey,
      Array<{ open: string; close: string }>
    >
  >;
};

function parseHm(s: string): number {
  const [h, m] = s.split(":").map((x) => Number(x));
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
}

function nowMinutes(d = new Date()): number {
  return d.getHours() * 60 + d.getMinutes();
}

export function todayDayKey(d = new Date()): DayKey {
  return DAY_KEYS[d.getDay()];
}

/** Əgər cədvəl yoxdursa və ya boşdursa — həmişə açıq sayılır */
export function isWithinOpeningHours(
  raw: string | null | undefined,
  now = new Date()
): boolean {
  if (!raw || raw.trim() === "") return true;
  let parsed: OpeningHoursJson;
  try {
    parsed = JSON.parse(raw) as OpeningHoursJson;
  } catch {
    return true;
  }
  const slots = parsed.slots;
  if (!slots || typeof slots !== "object") return true;

  const key = todayDayKey(now);
  const daySlots = slots[key];
  if (!daySlots || daySlots.length === 0) return false;

  const n = nowMinutes(now);
  for (const slot of daySlots) {
    const a = parseHm(slot.open);
    const b = parseHm(slot.close);
    if (Number.isNaN(a) || Number.isNaN(b)) continue;
    if (a <= n && n <= b) return true;
  }
  return false;
}

/** strict_opening_hours=true → yalnız iş saatlarında sifariş */
export function restaurantAcceptsOrders(
  openingHoursJson: string | null | undefined,
  strictOpeningHours: boolean | number | undefined,
  now = new Date()
): boolean {
  if (!strictOpeningHours || strictOpeningHours === 0) return true;
  return isWithinOpeningHours(openingHoursJson, now);
}
