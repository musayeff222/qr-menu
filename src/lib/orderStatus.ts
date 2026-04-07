export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "sent"
  | "delivered"
  | "cancelled"
  | "accepted";

const LABELS_AZ: Record<OrderStatus, string> = {
  pending: "Gözləmədə",
  preparing: "Hazırlanır",
  ready: "Hazırlandı",
  sent: "Göndərildi",
  delivered: "Çatdırıldı",
  cancelled: "Ləğv edildi",
  accepted: "Gözləmədə",
};

const LABELS_EN: Record<OrderStatus, string> = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  sent: "Sent",
  delivered: "Delivered",
  cancelled: "Cancelled",
  accepted: "Pending",
};

const BADGE_BY_STATUS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  preparing: "bg-blue-100 text-blue-800 border-blue-200",
  ready: "bg-emerald-100 text-emerald-800 border-emerald-200",
  sent: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-green-200 text-green-900 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  accepted: "bg-amber-100 text-amber-800 border-amber-200",
};

export const ORDER_STATUS_FLOW: Array<Exclude<OrderStatus, "accepted">> = [
  "pending",
  "preparing",
  "ready",
  "sent",
  "delivered",
  "cancelled",
];

export function normalizeOrderStatus(v: unknown): OrderStatus {
  const s = String(v || "").toLowerCase();
  if (s === "accepted") return "pending";
  if (ORDER_STATUS_FLOW.includes(s as Exclude<OrderStatus, "accepted">)) {
    return s as OrderStatus;
  }
  return "pending";
}

export function orderStatusLabel(status: unknown, lang: string): string {
  const s = normalizeOrderStatus(status);
  return lang === "en" ? LABELS_EN[s] : LABELS_AZ[s];
}

export function orderStatusBadgeClass(status: unknown): string {
  return BADGE_BY_STATUS[normalizeOrderStatus(status)];
}
