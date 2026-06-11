import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  Check,
  Clock3,
  Instagram,
  MapPin,
  Minus,
  Phone,
  Plus,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";
import { resolveAssetUrl } from "../lib/assetUrl";
import { cn } from "./cn";
import type { CartLine } from "./MenuTemplateView";

const RED = "#E12B30";

export type SmartWebCheckoutBridge = {
  fullName: string;
  setFullName: (v: string) => void;
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  addressText: string;
  setAddressText: (v: string) => void;
  geoUrl: string;
  setGeoUrl: (v: string) => void;
  customerNote: string;
  setCustomerNote: (v: string) => void;
  pickGeo: () => void;
  geoBusy: boolean;
  submitOrder: () => Promise<void>;
  checkoutErr: string;
  checkoutOk: string;
  checkoutBusy: boolean;
};

export type SmartWebMenuViewProps = {
  restaurant: Record<string, unknown>;
  categories: Array<Record<string, unknown>>;
  products: Array<Record<string, unknown>>;
  activeCategory: number | null;
  setActiveCategory: (id: number) => void;
  currentLang: string;
  cart: CartLine[];
  addToCart: (item: {
    product: Record<string, unknown>;
    variantId?: number;
    variantLabel?: string;
    unitPrice: number;
    note?: string;
  }) => void;
  increaseCartLineQty: (lineId: string) => void;
  decreaseCartLineQty: (lineId: string) => void;
  removeCartLine: (lineId: string) => void;
  ordersAllowed: boolean;
  ordersClosedHint?: string;
  menuView?: "browse" | "cart";
  onMenuViewChange?: (v: "browse" | "cart") => void;
  checkout: SmartWebCheckoutBridge;
  heroImageSrc: string;
};

function formatPrice(p: unknown) {
  const n = Number(p);
  if (Number.isNaN(n)) return "—";
  return `${n.toFixed(2)} ₼`;
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Səbət" },
    { n: 2, label: "Əlaqə" },
    { n: 3, label: "Çatdırılma" },
  ] as const;

  return (
    <div className="flex items-center justify-center gap-0 px-6 py-4">
      {steps.map((s, i) => {
        const done = step > s.n;
        const active = step === s.n;
        return (
          <React.Fragment key={s.n}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition-colors",
                  done || active
                    ? "bg-[#E12B30] text-white"
                    : "border-2 border-gray-300 bg-white text-gray-400"
                )}
                style={active && !done ? { background: "white", color: RED, border: `2px solid ${RED}` } : undefined}
              >
                {done ? <Check size={18} strokeWidth={3} /> : s.n}
              </div>
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  active || done ? "text-[#E12B30]" : "text-gray-400"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <div
                className={cn(
                  "mx-2 mb-5 h-0.5 w-10 sm:w-16",
                  step > s.n ? "bg-[#E12B30]" : "bg-gray-200"
                )}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M20.52 3.48A11.88 11.88 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.59 5.96L0 24l6.31-1.65a11.8 11.8 0 0 0 5.74 1.46h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.44-8.43Zm-8.46 18.3h-.01a9.8 9.8 0 0 1-4.99-1.36l-.36-.21-3.75.98 1-3.66-.24-.38a9.83 9.83 0 0 1-1.51-5.24c0-5.44 4.43-9.87 9.87-9.87a9.8 9.8 0 0 1 6.98 2.9 9.81 9.81 0 0 1 2.89 6.98c0 5.44-4.43 9.87-9.87 9.87Zm5.41-7.4c-.3-.16-1.78-.88-2.06-.98-.28-.1-.48-.16-.68.16-.2.3-.78.97-.95 1.17-.18.2-.35.22-.65.07-.3-.16-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.67-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.16-.68-1.64-.94-2.25-.24-.57-.49-.49-.68-.5h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.06 2.87 1.2 3.07.15.2 2.08 3.18 5.03 4.46.7.3 1.25.48 1.67.62.7.22 1.34.19 1.84.12.56-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

export function SmartWebMenuView({
  restaurant,
  categories,
  products,
  activeCategory,
  setActiveCategory,
  currentLang,
  cart,
  addToCart,
  increaseCartLineQty,
  decreaseCartLineQty,
  removeCartLine,
  ordersAllowed,
  ordersClosedHint,
  menuView = "browse",
  onMenuViewChange,
  checkout,
  heroImageSrc,
}: SmartWebMenuViewProps) {
  const [checkoutStep, setCheckoutStep] = useState<0 | 1 | 2 | 3>(0);
  const [promoDraft, setPromoDraft] = useState("");
  const [variantPick, setVariantPick] = useState<Record<string, unknown> | null>(null);
  const [localErr, setLocalErr] = useState("");

  const restaurantName = String(restaurant.name ?? "");
  const logoUrl = resolveAssetUrl(restaurant.logo_url ? String(restaurant.logo_url) : "");
  const whatsapp = restaurant.whatsapp_number
    ? String(restaurant.whatsapp_number).replace(/\D/g, "")
    : "";
  const instagram =
    restaurant.instagram && restaurant.social_instagram_visible !== false
      ? String(restaurant.instagram)
      : "";

  const cartCount = cart.reduce((s, l) => s + Number(l.quantity || 1), 0);
  const cartTotal = cart.reduce(
    (s, l) => s + Number(l.unitPrice) * Number(l.quantity || 1),
    0
  );

  const filteredProducts = products.filter(
    (p) => Number(p.category_id) === Number(activeCategory)
  );

  const variantsOf = (p: Record<string, unknown>) =>
    (Array.isArray(p.variants) ? p.variants : []) as Array<Record<string, unknown>>;

  const productName = (prod: Record<string, unknown>) => {
    const tr = prod.translations as Record<string, { name?: string }> | undefined;
    return tr?.[currentLang]?.name || String(prod.name ?? "");
  };

  const categoryName = (cat: Record<string, unknown>) => {
    const tr = cat.translations as Record<string, string> | undefined;
    return (tr?.[currentLang] as string) || String(cat.name);
  };

  useEffect(() => {
    if (cart.length === 0 && checkoutStep > 0) {
      setCheckoutStep(0);
      onMenuViewChange?.("browse");
    }
  }, [cart.length, checkoutStep, onMenuViewChange]);

  useEffect(() => {
    if (menuView === "cart" && checkoutStep === 0 && cart.length > 0) {
      setCheckoutStep(1);
    }
    if (menuView === "browse" && checkoutStep === 1) {
      setCheckoutStep(0);
    }
  }, [menuView, checkoutStep, cart.length]);

  useEffect(() => {
    if (checkout.checkoutOk) {
      setCheckoutStep(0);
      onMenuViewChange?.("browse");
    }
  }, [checkout.checkoutOk, onMenuViewChange]);

  const openCart = () => {
    if (!ordersAllowed || cart.length === 0) return;
    setCheckoutStep(1);
    onMenuViewChange?.("cart");
  };

  const closeCheckout = () => {
    setCheckoutStep(0);
    setLocalErr("");
    onMenuViewChange?.("browse");
  };

  const handleAdd = (prod: Record<string, unknown>) => {
    if (!ordersAllowed) return;
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
      variantLabel: String(v.name ?? ""),
      unitPrice: Number(v.price ?? prod.price),
      note: "",
    });
    setVariantPick(null);
  };

  const goContact = () => {
    if (!ordersAllowed) return;
    setCheckoutStep(2);
  };

  const goDelivery = () => {
    if (!checkout.fullName.trim() || !checkout.phoneNumber.trim()) {
      setLocalErr("Ad soyad və telefon mütləqdir");
      return;
    }
    setLocalErr("");
    setCheckoutStep(3);
  };

  const checkoutHeader = (title: string, subtitle: string, onBack: () => void, backIcon: "x" | "chevron") => (
    <header className="sticky top-0 z-20 border-b border-gray-100 bg-white pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
      <div className="relative flex items-center justify-center px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="absolute left-4 grid h-10 w-10 place-items-center text-gray-700"
          aria-label="Geri"
        >
          {backIcon === "x" ? <X size={22} /> : <ChevronLeft size={24} />}
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
      <Stepper step={checkoutStep as 1 | 2 | 3} />
    </header>
  );

  const primaryBtn = (label: string, onClick: () => void, disabled?: boolean) => (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#E12B30] text-base font-bold text-white shadow-lg shadow-red-500/20 transition-opacity disabled:opacity-50"
      >
        {label}
        <ChevronLeft size={18} className="rotate-180" />
      </button>
    </div>
  );

  if (checkoutStep >= 1) {
    if (checkoutStep === 1) {
      return (
        <div id="menu-template-root" className="min-h-screen bg-white text-gray-900 antialiased">
          {checkoutHeader(
            "Səbətiniz",
            `${cartCount} ədəd · ${formatPrice(cartTotal)} · ${restaurantName}`,
            closeCheckout,
            "x"
          )}
          <div className="mx-auto max-w-lg px-4 pb-32 pt-2">
            <div className="space-y-3">
              {cart.map((line) => {
                const pn = productName(line.product);
                const label = line.variantLabel ? `${line.variantLabel} · ${pn}` : pn;
                const img = resolveAssetUrl(
                  line.product.image_url ? String(line.product.image_url) : ""
                );
                const lineTotal = Number(line.unitPrice) * Number(line.quantity || 1);
                return (
                  <div
                    key={line.lineId}
                    className="relative flex gap-3 rounded-2xl bg-gray-50 p-3"
                  >
                    <button
                      type="button"
                      onClick={() => removeCartLine(line.lineId)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-red-500"
                      aria-label="Sil"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-200">
                      {img ? (
                        <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 pr-8">
                      <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{label}</h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {formatPrice(line.unitPrice)} × {Number(line.quantity || 1)}
                      </p>
                      <p className="mt-1 text-base font-bold text-[#E12B30]">{formatPrice(lineTotal)}</p>
                      <div className="mt-2 inline-flex items-center gap-3 rounded-full border border-gray-200 bg-white px-2 py-1 shadow-sm">
                        <button
                          type="button"
                          className="grid h-7 w-7 place-items-center text-gray-600"
                          onClick={() => decreaseCartLineQty(line.lineId)}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-4 text-center text-sm font-bold">
                          {Number(line.quantity || 1)}
                        </span>
                        <button
                          type="button"
                          className="grid h-7 w-7 place-items-center font-bold text-[#E12B30]"
                          onClick={() => increaseCartLineQty(line.lineId)}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-base font-semibold text-gray-700">Cəmi</span>
              <span className="text-2xl font-extrabold text-[#E12B30]">{formatPrice(cartTotal)}</span>
            </div>
          </div>
          {primaryBtn("Təsdiq et", goContact, !ordersAllowed)}
        </div>
      );
    }

    if (checkoutStep === 2) {
      return (
        <div id="menu-template-root" className="min-h-screen bg-white text-gray-900 antialiased">
          {checkoutHeader("Əlaqə", "Ad və telefon", () => setCheckoutStep(1), "chevron")}
          <div className="mx-auto max-w-lg px-6 pb-32 pt-4">
            <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-2xl bg-gray-100">
              <User size={40} className="text-[#E12B30]" strokeWidth={1.5} />
            </div>
            <p className="mb-8 text-center text-sm text-gray-600">
              Sifarişiniz üçün əlaqə məlumatlarını daxil edin
            </p>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <User size={16} className="text-gray-500" />
              Ad, soyad *
            </label>
            <input
              value={checkout.fullName}
              onChange={(e) => checkout.setFullName(e.target.value)}
              className="mb-5 w-full rounded-xl border-0 bg-blue-50/80 px-4 py-3.5 text-sm text-gray-900 ring-1 ring-blue-100 outline-none focus:ring-2 focus:ring-[#E12B30]/30"
              placeholder="Adınız"
              autoComplete="name"
            />
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Phone size={16} className="text-gray-500" />
              Telefon *
            </label>
            <input
              value={checkout.phoneNumber}
              onChange={(e) => checkout.setPhoneNumber(e.target.value)}
              className="mb-4 w-full rounded-xl border-0 bg-blue-50/80 px-4 py-3.5 text-sm text-gray-900 ring-1 ring-blue-100 outline-none focus:ring-2 focus:ring-[#E12B30]/30"
              placeholder="+994..."
              type="tel"
              autoComplete="tel"
            />
            {localErr || checkout.checkoutErr ? (
              <p className="mb-3 text-sm text-red-600">{localErr || checkout.checkoutErr}</p>
            ) : null}
          </div>
          {primaryBtn("Davam et", goDelivery)}
        </div>
      );
    }

    return (
      <div id="menu-template-root" className="min-h-screen bg-white text-gray-900 antialiased">
        {checkoutHeader("Çatdırılma", "Ünvan və qeyd", () => setCheckoutStep(2), "chevron")}
        <div className="mx-auto max-w-lg space-y-5 px-4 pb-40 pt-2">
          {checkout.geoUrl ? (
            <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <Check size={20} className="mt-0.5 shrink-0 text-green-600" strokeWidth={3} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-green-800">Konum alındı</p>
                <p className="text-xs text-green-700">GPS sifarişə əlavə olunacaq</p>
              </div>
              <button
                type="button"
                onClick={() => checkout.setGeoUrl("")}
                className="shrink-0 text-sm font-semibold text-[#E12B30]"
              >
                Sil
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={checkout.pickGeo}
              disabled={checkout.geoBusy}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-3 text-sm font-semibold text-gray-700"
            >
              <MapPin size={18} className="text-[#E12B30]" />
              {checkout.geoBusy ? "Konum alınır..." : "GPS konumunu əlavə et"}
            </button>
          )}

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <MapPin size={16} className="text-gray-500" />
              Ünvan
            </label>
            <textarea
              value={checkout.addressText}
              onChange={(e) => checkout.setAddressText(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#E12B30]/50 focus:ring-2 focus:ring-[#E12B30]/20"
              placeholder="Mənzil, giriş, zəng zəngi..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
              Qeyd (istəyə bağlı)
            </label>
            <input
              value={checkout.customerNote}
              onChange={(e) => checkout.setCustomerNote(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#E12B30]/50 focus:ring-2 focus:ring-[#E12B30]/20"
              placeholder="Xüsusi istək..."
            />
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <Tag size={16} className="text-gray-500" />
              Promo kod
            </label>
            <div className="flex gap-2">
              <input
                value={promoDraft}
                onChange={(e) => setPromoDraft(e.target.value.toUpperCase())}
                className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm uppercase outline-none focus:border-[#E12B30]/50"
                placeholder="MƏS: ENDİRİM10"
              />
              <button
                type="button"
                className="shrink-0 rounded-xl bg-[#E12B30] px-4 py-3 text-sm font-bold text-white"
                onClick={() => setPromoDraft(promoDraft.trim())}
              >
                Tətbiq et
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm text-gray-600">Ödəniləcək</span>
            <span className="text-xl font-extrabold text-[#E12B30]">{formatPrice(cartTotal)}</span>
          </div>

          {checkout.checkoutErr ? (
            <p className="text-sm text-red-600">{checkout.checkoutErr}</p>
          ) : null}
          {checkout.checkoutOk ? (
            <p className="text-sm text-green-700">{checkout.checkoutOk}</p>
          ) : null}
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
          <button
            type="button"
            disabled={checkout.checkoutBusy || !ordersAllowed}
            onClick={() => void checkout.submitOrder()}
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#E12B30] text-base font-bold text-white shadow-lg shadow-red-500/20 disabled:opacity-50"
          >
            {checkout.checkoutBusy
              ? "..."
              : `Sifarişi göndər · ${formatPrice(cartTotal)}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="menu-template-root" className="min-h-screen bg-black pb-28 text-white antialiased">
      <div
        className="relative h-48 w-full bg-cover bg-center sm:h-56"
        style={{ backgroundImage: `url(${heroImageSrc})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
      </div>

      <div className="-mt-14 relative z-10 flex flex-col items-center px-4">
        {logoUrl ? (
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-black shadow-xl">
            <img src={logoUrl} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-white bg-gray-900 text-lg font-black">
            {restaurantName.slice(0, 2).toUpperCase()}
          </div>
        )}
        <h1 className="mt-3 text-center text-xl font-extrabold uppercase tracking-wide">
          {restaurantName}
        </h1>
        {restaurant.opening_hours ? (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-3 py-1.5 text-xs text-gray-300">
            <Clock3 size={14} />
            Açılış: {String(restaurant.opening_hours)}
          </div>
        ) : null}
        <div className="mt-3 flex items-center gap-3">
          {instagram ? (
            <a
              href={instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
          ) : null}
          {whatsapp ? (
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="grid h-10 w-10 place-items-center rounded-full bg-[#25D366] text-white"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon />
            </a>
          ) : null}
        </div>
      </div>

      <div className="sticky top-0 z-20 mt-4 border-b border-gray-800 bg-black/95 backdrop-blur-md">
        <div className="scrollbar-hide flex gap-6 overflow-x-auto px-4">
          {categories.map((cat) => {
            const cname = categoryName(cat).toUpperCase();
            const active = Number(cat.id) === Number(activeCategory);
            return (
              <button
                key={cat.id as number}
                type="button"
                onClick={() => setActiveCategory(cat.id as number)}
                className={cn(
                  "shrink-0 whitespace-nowrap border-b-2 py-3 text-xs font-bold tracking-wide transition-colors",
                  active
                    ? "border-[#E12B30] text-[#E12B30]"
                    : "border-transparent text-gray-500"
                )}
              >
                {cname}
              </button>
            );
          })}
        </div>
      </div>

      {!ordersAllowed && ordersClosedHint ? (
        <p className="mx-4 mt-3 rounded-xl bg-gray-900 px-4 py-3 text-center text-xs text-gray-400">
          {ordersClosedHint}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 px-3 pb-4 pt-4">
        {filteredProducts.map((prod) => {
          const pname = productName(prod);
          const img = resolveAssetUrl(prod.image_url ? String(prod.image_url) : "");
          return (
            <article key={prod.id as number} className="flex flex-col">
              <div className="relative overflow-hidden rounded-2xl bg-gray-900">
                {img ? (
                  <img
                    src={img}
                    alt=""
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="aspect-square w-full bg-gray-800" />
                )}
                {ordersAllowed ? (
                  <button
                    type="button"
                    onClick={() => handleAdd(prod)}
                    className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-[#E12B30] text-white shadow-lg"
                    aria-label={`Əlavə et ${pname}`}
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </button>
                ) : null}
              </div>
              <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-white">
                {pname}
              </h3>
              <p className="mt-0.5 text-sm font-bold text-[#E12B30]">{formatPrice(prod.price)}</p>
            </article>
          );
        })}
      </div>

      {ordersAllowed && cart.length > 0 ? (
        <button
          type="button"
          onClick={openCart}
          className="fixed bottom-4 left-4 right-4 z-30 flex h-14 items-center justify-between rounded-2xl bg-[#E12B30] px-5 text-sm font-bold text-white shadow-xl shadow-red-900/40"
        >
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            Sifariş ({cartCount})
          </span>
          <span>{formatPrice(cartTotal)}</span>
        </button>
      ) : null}

      {variantPick ? (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-4 sm:items-center"
          onClick={() => setVariantPick(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 text-gray-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-bold">{productName(variantPick)}</h3>
            <div className="space-y-2">
              {variantsOf(variantPick).map((v) => (
                <button
                  key={String(v.id)}
                  type="button"
                  onClick={() => pickVariant(variantPick, v)}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-left hover:border-[#E12B30]"
                >
                  <span className="font-medium">{String(v.name ?? "")}</span>
                  <span className="font-bold text-[#E12B30]">{formatPrice(v.price)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
