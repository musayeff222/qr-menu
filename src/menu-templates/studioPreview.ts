import { remapLegacyTemplateId } from "./legacyRemap";

/** Panel / onboarding live preview — guest menu URL that cannot place real orders. */
export function studioPreviewPath(
  slug: string,
  templateId: string,
  opts?: { ticket?: string | null }
) {
  const id = remapLegacyTemplateId(templateId);
  const q = new URLSearchParams({
    preview: "true",
    previewTemplate: id,
    studioPreview: "1",
  });
  const ticket = String(opts?.ticket || "").trim();
  if (ticket) q.set("pt", ticket);
  return `/r/${encodeURIComponent(slug)}?${q.toString()}`;
}

export function isStudioPreviewSearch(search: string | URLSearchParams) {
  const q = typeof search === "string" ? new URLSearchParams(search) : search;
  return q.get("studioPreview") === "1";
}

export function readStudioPreviewTicket(search: string | URLSearchParams) {
  const q = typeof search === "string" ? new URLSearchParams(search) : search;
  return String(q.get("pt") || "").trim();
}

/** Mint a short-lived HMAC preview ticket (restaurant session required). */
export async function fetchStudioPreviewTicket(restaurantId: number): Promise<string> {
  const token =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("restaurantSession") || localStorage.getItem("adminSession")
      : null;
  if (!token) return "";
  const res = await fetch(`/api/admin/restaurants/${restaurantId}/studio-preview-ticket`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return "";
  const data = (await res.json().catch(() => ({}))) as { ticket?: string };
  return String(data.ticket || "").trim();
}
