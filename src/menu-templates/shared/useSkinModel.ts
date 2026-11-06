import { useEffect, useMemo, useState } from "react";
import { resolveAssetUrl } from "../../lib/assetUrl";
import type { GuestSkinProps } from "../guestSkinContract";
import { getSkinMeta } from "../skinCatalog";
import { remapLegacyTemplateId } from "../legacyRemap";
import { parseAppearance } from "../theme/appearance";
import {
  contrastRatio,
  sanitizeTokens,
  tokensToCssVars,
  type SkinColorTokens,
} from "../theme/tokens";

export const PREVIEW_MSG = "MENUGO_THEME_PREVIEW";

function sizedAsset(url: string) {
  if (!url) return "";
  if (!/images\.unsplash\.com/i.test(url)) return url;
  const u = new URL(url);
  if (!u.searchParams.has("w")) u.searchParams.set("w", "800");
  if (!u.searchParams.has("q")) u.searchParams.set("q", "70");
  if (!u.searchParams.has("auto")) u.searchParams.set("auto", "format");
  if (!u.searchParams.has("fit")) u.searchParams.set("fit", "crop");
  return u.toString();
}

export function variantsOf(p: Record<string, unknown>) {
  return (Array.isArray(p.variants) ? p.variants : []) as Array<Record<string, unknown>>;
}

export function formatManat(p: unknown) {
  const n = Number(p);
  if (Number.isNaN(n)) return "—";
  return `₼${n.toFixed(2)}`;
}

export function productName(prod: Record<string, unknown>, lang: string) {
  const tr = prod.translations as Record<string, { name?: string }> | undefined;
  return (tr?.[lang]?.name && String(tr[lang].name)) || String(prod.name || "");
}

export function productDesc(prod: Record<string, unknown>, lang: string) {
  const tr = prod.translations as Record<string, { desc?: string; description?: string }> | undefined;
  return (
    (tr?.[lang]?.desc && String(tr[lang].desc)) ||
    (tr?.[lang]?.description && String(tr[lang].description)) ||
    String(prod.description ?? "")
  );
}

export function displayMinPrice(prod: Record<string, unknown>) {
  const base = Number(prod.price);
  const v = variantsOf(prod)
    .map((x) => Number(x.price))
    .filter((n) => !Number.isNaN(n));
  if (!v.length) return base;
  return Math.min(base, ...v);
}

export function useSkinModel(props: GuestSkinProps) {
  const {
    template,
    restaurant,
    categories,
    products,
    activeCategory,
    setActiveCategory,
    currentLang,
    setCurrentLang,
    cart,
    addToCart,
    updateCartLineNote,
    increaseCartLineQty,
    decreaseCartLineQty,
    removeCartLine,
    onCheckout,
    onOpenOrders,
    ordersAllowed,
    ordersClosedHint,
    t,
    planFeatures,
    menuView = "browse",
    onMenuViewChange,
  } = props;

  const meta = getSkinMeta(template.id);
  const saved = useMemo(() => parseAppearance(restaurant.menu_appearance_json), [restaurant.menu_appearance_json]);
  const [previewTokens, setPreviewTokens] = useState<SkinColorTokens | null>(null);

  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin) return;
      const d = ev.data;
      if (!d || d.type !== PREVIEW_MSG) return;
      if (
        d.templateId &&
        remapLegacyTemplateId(d.templateId) !== remapLegacyTemplateId(template.id)
      ) {
        return;
      }
      if (d.colors) setPreviewTokens(sanitizeTokens(d.colors, meta.defaults));
      if (d.reset) setPreviewTokens(null);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [template.id, meta.defaults]);

  const tokens: SkinColorTokens = previewTokens || saved.overridesByTemplate[template.id]?.colors || meta.defaults;
  const cssVars = tokensToCssVars(tokens);
  const readable = contrastRatio(tokens.text, tokens.background) >= 3;

  const [variantPick, setVariantPick] = useState<Record<string, unknown> | null>(null);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [noteLineId, setNoteLineId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (menuView === "cart") setCartOpen(true);
  }, [menuView]);

  const name = String(restaurant.name || "MenuGo");
  const tagline = String(restaurant.tagline || "");
  const logo = resolveAssetUrl(restaurant.logo_url ? String(restaurant.logo_url) : "");
  const cover = resolveAssetUrl(
    restaurant.cover_image_url ? String(restaurant.cover_image_url) : meta.cover
  );
  const phone = String(restaurant.phone || "");
  const mapsUrl = String(restaurant.maps_url || "");
  const wa = String(restaurant.whatsapp_number || "").replace(/\D/g, "");
  const instagram = String(restaurant.instagram || "");
  const tiktok = String(restaurant.tiktok || "");
  const facebook = String(restaurant.facebook || "");
  const allowWa = planFeatures?.whatsapp_order !== false;
  const allowRes = planFeatures?.reservation !== false;
  const reservationUrl = String(restaurant.reservation_url || "");
  const canOrder = allowWa && ordersAllowed;

  const q = query.trim().toLowerCase();
  const matchesQuery = (p: Record<string, unknown>) => {
    if (!q) return true;
    const name = productName(p, currentLang).toLowerCase();
    const desc = productDesc(p, currentLang).toLowerCase();
    return name.includes(q) || desc.includes(q);
  };
  const filtered = products.filter((p) => Number(p.category_id) === Number(activeCategory)).filter(matchesQuery);
  const grouped = categories.map((c) => ({
    cat: c,
    items: products.filter((p) => Number(p.category_id) === Number(c.id)).filter(matchesQuery),
  }));

  const cartCount = cart.reduce((n, l) => n + l.quantity, 0);
  const cartTotal = cart.reduce((n, l) => n + l.unitPrice * l.quantity, 0);

  const openCart = () => {
    setCartOpen(true);
    onMenuViewChange?.("cart");
  };
  const closeCart = () => {
    setCartOpen(false);
    onMenuViewChange?.("browse");
  };

  const handleAdd = (prod: Record<string, unknown>) => {
    if (!canOrder) return;
    const vars = variantsOf(prod);
    if (vars.length > 0) {
      setVariantPick(prod);
      return;
    }
    addToCart({ product: prod, unitPrice: Number(prod.price), note: "" });
  };

  const pickVariant = (prod: Record<string, unknown>, v: Record<string, unknown>) => {
    addToCart({
      product: prod,
      variantId: Number(v.id),
      variantLabel: String(v.name),
      unitPrice: Number(v.price),
      note: "",
    });
    setVariantPick(null);
  };

  const openNote = (lineId: string, current?: string) => {
    setNoteLineId(lineId);
    setNoteDraft(current || "");
  };

  const saveNote = () => {
    if (noteLineId) updateCartLineNote(noteLineId, noteDraft);
    setNoteLineId(null);
  };

  const catName = (c: Record<string, unknown>) => {
    const tr = c.translations as Record<string, { name?: string }> | undefined;
    return (tr?.[currentLang]?.name && String(tr[currentLang].name)) || String(c.name || "");
  };

  return {
    meta,
    tokens,
    cssVars,
    readable,
    name,
    tagline,
    logo,
    cover,
    phone,
    mapsUrl,
    wa,
    instagram,
    tiktok,
    facebook,
    allowWa,
    allowRes,
    reservationUrl,
    canOrder,
    ordersAllowed,
    ordersClosedHint,
    currentLang,
    setCurrentLang,
    categories,
    products,
    filtered,
    grouped,
    activeCategory,
    setActiveCategory,
    cart,
    cartCount,
    cartTotal,
    cartOpen,
    openCart,
    closeCart,
    handleAdd,
    pickVariant,
    variantPick,
    setVariantPick,
    detail,
    setDetail,
    noteLineId,
    noteDraft,
    setNoteDraft,
    openNote,
    saveNote,
    setNoteLineId,
    increaseCartLineQty,
    decreaseCartLineQty,
    removeCartLine,
    onCheckout,
    onOpenOrders,
    t,
    tx: (k: string, fb: string) => {
      const v = t(k);
      return v && v !== k ? v : fb;
    },
    formatPrice: formatManat,
    productName: (p: Record<string, unknown>) => productName(p, currentLang),
    productDesc: (p: Record<string, unknown>) => productDesc(p, currentLang),
    productImg: (p: Record<string, unknown>) =>
      sizedAsset(resolveAssetUrl(p.image_url ? String(p.image_url) : "")),
    displayMinPrice,
    variantsOf,
    catName,
    menuView,
    query,
    setQuery,
  };
}

export type SkinModel = ReturnType<typeof useSkinModel>;
