export function authSuperHeaders(): HeadersInit {
  const t = localStorage.getItem("adminSession");
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export function authRestaurantHeaders(): HeadersInit {
  const t = localStorage.getItem("restaurantSession");
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export function authAnyStaffHeaders(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const rt = localStorage.getItem("restaurantSession");
  const st = localStorage.getItem("adminSession");
  if (rt || st) h.Authorization = `Bearer ${rt || st}`;
  return h;
}
