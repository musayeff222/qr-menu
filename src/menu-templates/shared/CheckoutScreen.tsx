import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Check, MapPin } from "lucide-react";
import type { CartLine } from "../guestSkinContract";
import { remapLegacyTemplateId } from "../legacyRemap";
import { getSkinMeta } from "../skinCatalog";
import { parseAppearance } from "../theme/appearance";
import { PREVIEW_MSG, formatManat, productName } from "./useSkinModel";
import { sanitizeTokens, tokensToCssVars, type SkinColorTokens } from "../theme/tokens";
import { resolveAssetUrl } from "../../lib/assetUrl";
import { cn } from "../cn";
import { FallbackImg } from "./primitives";

export type CheckoutPhase = "form" | "success";

export type CheckoutScreenProps = {
  templateId: string;
  restaurant: Record<string, unknown>;
  cart: CartLine[];
  lang: string;
  t: (key: string) => string;
  phase: CheckoutPhase;
  placedOrderId: number | null;
  fullName: string;
  setFullName: (v: string) => void;
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  addressText: string;
  setAddressText: (v: string) => void;
  customerNote: string;
  setCustomerNote: (v: string) => void;
  orderType: "pickup" | "delivery";
  setOrderType: (v: "pickup" | "delivery") => void;
  payment: "cash" | "card";
  setPayment: (v: "cash" | "card") => void;
  orderSource: "web" | "whatsapp";
  setOrderSource: (v: "web" | "whatsapp") => void;
  geoUrl: string;
  geoBusy: boolean;
  onPickLocation: () => void;
  checkoutErr: string;
  checkoutBusy: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onOpenOrders: () => void;
  onBackToMenu: () => void;
};

function tx(t: (k: string) => string, key: string, fallback: string) {
  const v = t(key);
  return !v || v === key ? fallback : v;
}

function skinClasses(skinId: string) {
  if (skinId === "fastfood-pro") {
    return {
      title: "text-[1.15rem] font-black uppercase tracking-tight sm:text-2xl",
      back: "min-h-12 min-w-12 rounded-none bg-[var(--mt-secondary)] text-[var(--mt-text)]",
      header: "border-b-4 border-[var(--mt-secondary)] bg-[var(--mt-text)] text-[var(--mt-secondary)]",
      summary: "border-2 border-[var(--mt-text)] bg-[var(--mt-surface)]",
      field:
        "min-h-12 rounded-none border-2 border-[var(--mt-text)] bg-[var(--mt-surface)] px-4 py-3 text-base font-semibold outline-none focus:border-[var(--mt-accent)]",
      pillOn:
        "rounded-none bg-[var(--mt-accent)] text-white shadow-none font-black uppercase tracking-wide",
      pillOff:
        "rounded-none border-2 border-[var(--mt-text)] bg-[var(--mt-surface)] font-black uppercase tracking-wide text-[var(--mt-text)]",
      footer: "border-t-4 border-[var(--mt-secondary)] bg-[var(--mt-text)] text-[var(--mt-secondary)]",
      cta: "min-h-14 rounded-none bg-[var(--mt-secondary)] text-[var(--mt-text)] text-lg font-black uppercase tracking-wide",
      ctaWa: "min-h-14 rounded-none bg-[#128C7E] text-white text-lg font-black uppercase tracking-wide",
      successIcon: "rounded-none bg-[var(--mt-secondary)] text-[var(--mt-text)]",
    };
  }
  if (skinId === "bella-classic") {
    return {
      title: "font-serif text-xl italic tracking-[0.04em] sm:text-2xl",
      back: "min-h-11 min-w-11 rounded-full border border-[color-mix(in_oklab,var(--mt-primary)_40%,transparent)] bg-[var(--mt-surface)]",
      header:
        "border-b border-[color-mix(in_oklab,var(--mt-primary)_28%,transparent)] bg-[var(--mt-bg)]",
      summary:
        "rounded-sm border border-[color-mix(in_oklab,var(--mt-primary)_22%,transparent)] bg-[var(--mt-surface)] shadow-[0_12px_40px_rgba(42,33,24,0.06)]",
      field:
        "min-h-12 rounded-sm border border-[color-mix(in_oklab,var(--mt-primary)_28%,transparent)] bg-[var(--mt-surface)] px-4 py-3 font-serif outline-none focus:border-[var(--mt-primary)]",
      pillOn:
        "rounded-sm bg-[var(--mt-primary)] font-serif text-[var(--mt-on-primary)] shadow-none",
      pillOff:
        "rounded-sm border border-[color-mix(in_oklab,var(--mt-primary)_30%,transparent)] bg-[var(--mt-surface)] font-serif text-[var(--mt-muted)]",
      footer:
        "border-t border-[color-mix(in_oklab,var(--mt-primary)_22%,transparent)] bg-[var(--mt-bg)]",
      cta: "min-h-12 rounded-sm bg-[var(--mt-primary)] font-serif text-base tracking-wide text-[var(--mt-on-primary)]",
      ctaWa: "min-h-12 rounded-sm bg-[#3d5c45] font-serif text-base text-white",
      successIcon: "rounded-full bg-[var(--mt-primary)] text-[var(--mt-on-primary)]",
    };
  }
  return {
    title: "text-lg font-semibold tracking-tight sm:text-xl",
    back: "min-h-11 min-w-11 rounded-full bg-[var(--mt-surface)] shadow-sm",
    header: "border-b border-[color-mix(in_oklab,var(--mt-primary)_16%,transparent)] bg-[var(--mt-bg)]/92 backdrop-blur-md",
    summary: "rounded-[1.6rem] bg-[var(--mt-surface)] shadow-[0_18px_50px_rgba(27,42,51,0.08)]",
    field:
      "min-h-12 rounded-2xl border-0 bg-[var(--mt-surface)] px-4 py-3 shadow-sm ring-1 ring-[color-mix(in_oklab,var(--mt-primary)_18%,transparent)] outline-none focus:ring-2 focus:ring-[var(--mt-primary)]",
    pillOn: "rounded-full bg-[var(--mt-primary)] font-semibold text-[var(--mt-on-primary)] shadow-sm",
    pillOff: "rounded-full bg-[var(--mt-surface)] font-semibold text-[var(--mt-muted)] shadow-sm",
    footer:
      "rounded-t-[1.75rem] bg-[var(--mt-surface)] shadow-[0_-18px_40px_rgba(27,42,51,0.08)]",
    cta: "min-h-12 rounded-full bg-[var(--mt-primary)] text-base font-semibold text-[var(--mt-on-primary)]",
    ctaWa: "min-h-12 rounded-full bg-[#25D366] text-base font-semibold text-white",
    successIcon: "rounded-full bg-[var(--mt-accent)] text-white",
  };
}

function Seg({
  active,
  onClick,
  children,
  className,
  "data-testid": testId,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className: { pillOn: string; pillOff: string };
  "data-testid"?: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "min-h-12 flex-1 px-3 text-sm transition-all duration-200",
        active ? className.pillOn : className.pillOff
      )}
    >
      {children}
    </button>
  );
}

export function CheckoutScreen(props: CheckoutScreenProps) {
  const {
    templateId,
    restaurant,
    cart,
    lang,
    t,
    phase,
    placedOrderId,
    fullName,
    setFullName,
    phoneNumber,
    setPhoneNumber,
    addressText,
    setAddressText,
    customerNote,
    setCustomerNote,
    orderType,
    setOrderType,
    payment,
    setPayment,
    orderSource,
    setOrderSource,
    geoUrl,
    geoBusy,
    onPickLocation,
    checkoutErr,
    checkoutBusy,
    onBack,
    onSubmit,
    onOpenOrders,
    onBackToMenu,
  } = props;

  const skinId = remapLegacyTemplateId(templateId);
  const meta = getSkinMeta(skinId);
  const saved = useMemo(
    () => parseAppearance(restaurant.menu_appearance_json),
    [restaurant.menu_appearance_json]
  );
  const [previewTokens, setPreviewTokens] = useState<SkinColorTokens | null>(null);

  useEffect(() => {
    const onMsg = (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin) return;
      const d = ev.data;
      if (!d || d.type !== PREVIEW_MSG) return;
      if (d.templateId && remapLegacyTemplateId(d.templateId) !== skinId) return;
      if (d.colors) setPreviewTokens(sanitizeTokens(d.colors, meta.defaults));
      if (d.reset) setPreviewTokens(null);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [skinId, meta.defaults]);

  const tokens: SkinColorTokens =
    previewTokens || saved.overridesByTemplate[skinId]?.colors || meta.defaults;
  const cssVars = tokensToCssVars(tokens);
  const ui = skinClasses(skinId);
  const shellRef = useRef<HTMLDivElement>(null);
  const isDelivery = orderType === "delivery";
  const grandTotal = cart.reduce(
    (sum, line) => sum + Number(line.unitPrice) * Number(line.quantity || 1),
    0
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const el = shellRef.current;
    const vv = window.visualViewport;
    if (!el) return;
    const apply = () => {
      if (!vv) {
        el.style.height = "100dvh";
        el.style.top = "0px";
        return;
      }
      el.style.height = `${vv.height}px`;
      el.style.top = `${vv.offsetTop}px`;
    };
    apply();
    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);
    return () => {
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (phase === "success") onBackToMenu();
      else onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onBack, onBackToMenu]);

  const ctaLabel =
    orderSource === "whatsapp"
      ? tx(t, "checkout_send", "WhatsApp ilə göndər")
      : tx(t, "checkout_place", "Sifarişi ver");

  return (
    <motion.div
      ref={shellRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      data-skin={skinId}
      data-checkout="full"
      data-checkout-phase={phase}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-x-0 top-0 z-[200] flex w-full flex-col overflow-hidden"
      style={{
        ...cssVars,
        height: "100dvh",
        maxHeight: "100dvh",
        background: "var(--mt-bg)",
        color: "var(--mt-text)",
        paddingTop: "env(safe-area-inset-top)",
      }}
    >
      <header
        className={cn(
          "flex shrink-0 items-center gap-3 px-4 py-3 sm:px-8",
          ui.header
        )}
      >
        <button
          type="button"
          data-testid="checkout-back"
          aria-label={tx(t, "checkout_back", "Geri")}
          onClick={phase === "success" ? onBackToMenu : onBack}
          className={cn("grid place-items-center", ui.back)}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="min-w-0">
          <h2 id="checkout-title" className={cn("truncate", ui.title)}>
            {phase === "success"
              ? tx(t, "checkout_success_title", "Sifarişiniz qəbul edildi")
              : tx(t, "checkout_title", "Sifarişi tamamla")}
          </h2>
          <p className="truncate text-xs opacity-80">{String(restaurant.name || "")}</p>
        </div>
      </header>

      {phase === "success" ? (
        <div
          className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10 text-center"
          data-testid="checkout-success"
        >
          <div className={cn("mb-6 grid h-20 w-20 place-items-center", ui.successIcon)}>
            <Check size={40} strokeWidth={2.6} />
          </div>
          <h3 className={cn("mb-2", ui.title)}>
            {tx(t, "checkout_success_title", "Sifarişiniz qəbul edildi")}
          </h3>
          <p className="mb-4 max-w-md text-sm text-[var(--mt-muted)]">
            {tx(t, "checkout_success_body", "Ən qısa zamanda sizinlə əlaqə saxlanılacaq.")}
          </p>
          {placedOrderId ? (
            <p className="mb-8 text-sm font-semibold" data-testid="checkout-order-id">
              {tx(t, "checkout_order_no", "Sifariş nömrəsi")} #{placedOrderId}
            </p>
          ) : null}
          <div className="flex w-full max-w-sm flex-col gap-3">
            <button type="button" className={cn("w-full px-4", ui.cta)} onClick={onOpenOrders}>
              {tx(t, "checkout_my_orders", "Sifarişlərim")}
            </button>
            <button
              type="button"
              data-testid="checkout-back-menu"
              className={cn("w-full px-4", ui.pillOff, "min-h-12")}
              onClick={onBackToMenu}
            >
              {tx(t, "checkout_back_menu", "Menyuya qayıt")}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            data-checkout-scroll
            className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto overscroll-contain lg:grid-cols-2 lg:overflow-hidden"
          >
            <section
              className="space-y-4 px-4 py-5 sm:px-8 lg:overflow-y-auto lg:overscroll-contain"
              aria-label={tx(t, "checkout_summary", "Sifariş xülasəsi")}
            >
              <h3 className={cn("text-sm font-semibold uppercase tracking-[0.14em] text-[var(--mt-muted)]")}>
                {tx(t, "checkout_summary", "Sifariş xülasəsi")}
              </h3>
              <ul className="space-y-3">
                {cart.map((line) => {
                  const name = productName(line.product, lang);
                  const qty = Number(line.quantity || 1);
                  const lineTotal = Number(line.unitPrice) * qty;
                  const img = resolveAssetUrl(String(line.product.image_url || ""));
                  return (
                    <li
                      key={line.lineId}
                      data-testid="checkout-line"
                      className={cn("flex gap-3 p-3", ui.summary)}
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden bg-[var(--mt-secondary)]">
                        <FallbackImg src={img} alt={name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{name}</p>
                        {line.variantLabel ? (
                          <p className="truncate text-xs text-[var(--mt-muted)]">{line.variantLabel}</p>
                        ) : null}
                        {line.note ? (
                          <p className="mt-1 truncate text-xs italic text-[var(--mt-muted)]">
                            {tx(t, "note", "Qeyd")}: {line.note}
                          </p>
                        ) : null}
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="text-[var(--mt-muted)]">
                            {tx(t, "checkout_qty", "əd")} × {qty}
                          </span>
                          <span className="tabular-nums font-bold">{formatManat(lineTotal)}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className={cn("flex items-center justify-between p-4 text-base font-bold", ui.summary)}>
                <span>{tx(t, "total", "Cəmi")}</span>
                <span className="tabular-nums" data-testid="checkout-grand-total">
                  {formatManat(grandTotal)}
                </span>
              </div>
            </section>

            <section className="space-y-4 px-4 pb-8 pt-2 sm:px-8 lg:overflow-y-auto lg:overscroll-contain lg:pt-5">
              <div className="grid grid-cols-2 gap-2">
                <Seg
                  active={orderType === "pickup"}
                  onClick={() => setOrderType("pickup")}
                  className={ui}
                  data-testid="checkout-pickup"
                >
                  {tx(t, "checkout_pickup", "Məkandan götür")}
                </Seg>
                <Seg
                  active={orderType === "delivery"}
                  onClick={() => setOrderType("delivery")}
                  className={ui}
                  data-testid="checkout-delivery"
                >
                  {tx(t, "checkout_delivery", "Çatdırılma")}
                </Seg>
              </div>

              <label className="block text-sm font-medium">
                {tx(t, "full_name_label", "Ad soyad")}
                <input
                  className={cn("mt-1 w-full", ui.field)}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={tx(t, "full_name_label", "Ad soyad")}
                  autoComplete="name"
                />
              </label>
              <label className="block text-sm font-medium">
                {tx(t, "phone_label", "Telefon")}
                <input
                  className={cn("mt-1 w-full", ui.field)}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+994..."
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>

              {isDelivery ? (
                <>
                  <label className="block text-sm font-medium">
                    {tx(t, "checkout_address_placeholder", "Çatdırılma ünvanı")}
                    <textarea
                      data-testid="checkout-address"
                      className={cn("mt-1 min-h-[84px] w-full", ui.field)}
                      value={addressText}
                      onChange={(e) => setAddressText(e.target.value)}
                      placeholder={tx(t, "checkout_address_placeholder", "Çatdırılma ünvanı")}
                    />
                  </label>
                  <button
                    type="button"
                    data-testid="checkout-location"
                    disabled={geoBusy}
                    onClick={onPickLocation}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-semibold disabled:opacity-60",
                      ui.pillOff
                    )}
                  >
                    <MapPin size={16} />
                    {geoBusy
                      ? tx(t, "checkout_location_busy", "Konum alınır…")
                      : tx(t, "checkout_location_btn", "Konumumu göndər")}
                  </button>
                  {geoUrl ? (
                    <p className="break-all text-xs text-[var(--mt-accent)]">✓ {geoUrl}</p>
                  ) : null}
                </>
              ) : null}

              <label className="block text-sm font-medium">
                {tx(t, "note", "Qeyd")}
                <textarea
                  className={cn("mt-1 min-h-[72px] w-full", ui.field)}
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder={tx(t, "cart_note_placeholder", "Qeyd")}
                />
              </label>

              <div>
                <p className="mb-2 text-sm font-medium">{tx(t, "checkout_payment", "Ödəniş üsulu")}</p>
                <div className="flex gap-2">
                  <Seg active={payment === "cash"} onClick={() => setPayment("cash")} className={ui}>
                    {tx(t, "checkout_cash", "Nağd")}
                  </Seg>
                  <Seg active={payment === "card"} onClick={() => setPayment("card")} className={ui}>
                    {tx(t, "checkout_card", "Kart")}
                  </Seg>
                </div>
                {payment === "card" ? (
                  <p className="mt-2 text-xs text-[var(--mt-muted)]" data-testid="checkout-card-hint">
                    {tx(
                      t,
                      "checkout_card_hint",
                      "Kart ödənişi restoran tərəfindən qəbul olunur. Onlayn ödəniş deyil."
                    )}
                  </p>
                ) : null}
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">{tx(t, "checkout_send_via", "Göndərmə üsulu")}</p>
                <div className="flex gap-2">
                  <Seg active={orderSource === "web"} onClick={() => setOrderSource("web")} className={ui}>
                    {tx(t, "checkout_web", "Web sayt")}
                  </Seg>
                  <Seg
                    active={orderSource === "whatsapp"}
                    onClick={() => setOrderSource("whatsapp")}
                    className={ui}
                  >
                    {tx(t, "checkout_whatsapp", "WhatsApp")}
                  </Seg>
                </div>
              </div>
            </section>
          </div>

          <footer
            data-checkout-footer
            data-testid="checkout-footer"
            className={cn("shrink-0 px-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-3 sm:px-8", ui.footer)}
          >
            {checkoutErr ? (
              <p className="mb-2 text-sm font-semibold text-[var(--mt-danger)]" data-testid="checkout-error">
                {checkoutErr}
              </p>
            ) : null}
            <div className="mb-2 flex items-center justify-between text-sm font-bold">
              <span>{tx(t, "total", "Cəmi")}</span>
              <span className="tabular-nums">{formatManat(grandTotal)}</span>
            </div>
            <button
              type="button"
              data-testid="checkout-submit"
              disabled={checkoutBusy}
              className={cn("w-full px-4 disabled:opacity-60", orderSource === "whatsapp" ? ui.ctaWa : ui.cta)}
              onClick={onSubmit}
            >
              {checkoutBusy ? "…" : ctaLabel}
            </button>
          </footer>
        </>
      )}
    </motion.div>
  );
}
