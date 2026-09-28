/** Şəkil/video URL — relative /uploads/ yollarını cari domenə çevirir. */
export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url) return "";
  const s = String(url).trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (typeof window !== "undefined" && s.startsWith("/")) {
    return `${window.location.origin}${s}`;
  }
  return s;
}
