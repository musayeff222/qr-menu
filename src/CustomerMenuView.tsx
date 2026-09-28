import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  MenuTemplateView,
  resolveMenuTemplate,
  type CartLine,
} from "./menu-templates";
import { useI18nBundle } from "./i18n/bundleContext";
import { orderStatusBadgeClass, orderStatusLabel } from "./lib/orderStatus";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CustomerMenuViewProps = {
  slug: string;
  preview?: boolean;
  previewTemplateId?: string;
  demoMode?: boolean;
};

/**
 * Müştəri menyusu (ümumi / demo / önizləmə) — slug + şablon ötürülür.
 */
export default function CustomerMenuView({
  slug,
  preview = false,
  previewTemplateId = "",
  demoMode = false,
}: CustomerMenuViewProps) {
  const bundle = useI18nBundle();
  const [data, setData] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [currentLang, setCurrentLang] = useState("az");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [addressText, setAddressText] = useState("");
  const [geoUrl, setGeoUrl] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");
  const [orderSource, setOrderSource] = useState<"web" | "whatsapp">("web");
  const [payment, setPayment] = useState<"cash" | "card">("cash");
  const [geoBusy, setGeoBusy] = useState(false);
  const [checkoutErr, setCheckoutErr] = useState("");
  const [checkoutOk, setCheckoutOk] = useState("");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [ordersHistory, setOrdersHistory] = useState<any[]>([]);
  const [mapOpen, setMapOpen] = useState(false);
  const [menuView, setMenuView] = useState<"browse" | "cart">("browse");

  const getDeviceId = () => {
    const k = `qrmenu-device-${slug}`;
    const ex = localStorage.getItem(k);
    if (ex) return ex;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `d-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(k, id);
    return id;
  };

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((s: { default_language?: string }) => {
        if (s.default_language) setCurrentLang(s.default_language);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const qs = preview ? "?preview=true" : "";
    fetch(`/api/restaurants/${encodeURIComponent(slug)}${qs}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        if (res.categories?.length > 0) setActiveCategory(res.categories[0].id);
      });
  }, [slug, preview]);

  const t = (key: string) => bundle[currentLang]?.[key] || key;

  useEffect(() => {
    if (!data?.name) return;
    const tid = previewTemplateId || data.menu_template || "modern-01";
    const tpl = resolveMenuTemplate(tid, data.custom_templates);
    document.title = `${data.name} · ${tpl.name}`;
    return () => {
      document.title = "QRMenu";
    };
  }, [data, previewTemplateId]);

  useEffect(() => {
    if (!data) return;
    const tpl = resolveMenuTemplate(
      previewTemplateId || data.menu_template || "modern-01",
      data.custom_templates
    );
    if (tpl.theme.renderMode === "smartweb") setOrderType("delivery");
  }, [data, previewTemplateId]);

  if (!data) return <div className="p-10 text-center">{t("loading")}</div>;

  const { categories, products, custom_templates, plan_features, orders_allowed, ...restaurantRow } =
    data;
  const template = resolveMenuTemplate(
    previewTemplateId || data.menu_template || "modern-01",
    custom_templates
  );
  const mega1Mode = template.theme.renderMode === "fastfood-pro";
  const mega2Mode = template.theme.renderMode === "mega2-kinetic";
  const smartwebMode = template.theme.renderMode === "smartweb";

  const ordersAllowed = orders_allowed !== false;
  const ordersClosedHint = t("orders_closed_hint");

  const newLineId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `l-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const addToCart = (item: {
    product: Record<string, unknown>;
    variantId?: number;
    variantLabel?: string;
    unitPrice: number;
    note?: string;
  }) => {
    const key = `${Number(item.product.id)}:${item.variantId ?? 0}:${item.note || ""}`;
    setCart((rows) => {
      const idx = rows.findIndex(
        (r) => `${r.productId}:${r.variantId ?? 0}:${r.note || ""}` === key
      );
      if (idx < 0) {
        const lineId = newLineId();
        return [
          ...rows,
          {
            lineId,
            productId: Number(item.product.id),
            product: item.product,
            variantId: item.variantId,
            variantLabel: item.variantLabel,
            unitPrice: item.unitPrice,
            quantity: 1,
            note: item.note || "",
          },
        ];
      }
      return rows.map((r, i) =>
        i === idx ? { ...r, quantity: Number(r.quantity || 1) + 1 } : r
      );
    });
  };

  const updateCartLineNote = (lineId: string, note: string) => {
    setCart((c) => c.map((l) => (l.lineId === lineId ? { ...l, note } : l)));
  };

  const removeCartLine = (lineId: string) => {
    setCart((c) => c.filter((l) => l.lineId !== lineId));
  };

  const increaseCartLineQty = (lineId: string) => {
    setCart((rows) =>
      rows.map((r) => (r.lineId === lineId ? { ...r, quantity: Number(r.quantity || 1) + 1 } : r))
    );
  };

  const decreaseCartLineQty = (lineId: string) => {
    setCart((rows) =>
      rows
        .map((r) =>
          r.lineId === lineId ? { ...r, quantity: Math.max(0, Number(r.quantity || 1) - 1) } : r
        )
        .filter((r) => Number(r.quantity || 0) > 0)
    );
  };

  const openCheckout = () => {
    setCheckoutErr("");
    setCheckoutOk("");
    setCheckoutOpen(true);
  };

  const pickGeo = () => {
    if (!navigator.geolocation) return;
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGeoUrl(`https://www.google.com/maps?q=${latitude},${longitude}`);
        setGeoBusy(false);
      },
      () => setGeoBusy(false),
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  };

  const orderPayload = () => {
    const total = cart.reduce((s, l) => s + Number(l.unitPrice) * Number(l.quantity || 1), 0);
    return {
      device_id: getDeviceId(),
      order_type: orderType,
      payment_method: payment,
      order_source: orderSource,
      customer_name: fullName.trim(),
      customer_phone: phoneNumber.trim(),
      address_text: addressText.trim(),
      geo_url: geoUrl.trim(),
      note: customerNote.trim(),
      total_amount: Number(total.toFixed(2)),
      cart: cart.map((line) => {
        const tr = line.product.translations as Record<string, { name?: string }> | undefined;
        const pn = tr?.[currentLang]?.name || String(line.product.name ?? "");
        return {
          line_id: line.lineId,
          product_id: line.productId,
          label: line.variantLabel ? `${line.variantLabel} · ${pn}` : pn,
          variant_id: line.variantId ?? null,
          qty: Number(line.quantity || 1),
          unit_price: Number(line.unitPrice),
          note: line.note || "",
        };
      }),
    };
  };

  const validateCheckout = () => {
    if (!fullName.trim() || !phoneNumber.trim()) {
      setCheckoutErr("Ad soyad və telefon mütləqdir");
      return false;
    }
    if (orderType === "delivery" && !addressText.trim() && !geoUrl.trim()) {
      setCheckoutErr(t("checkout_address_required"));
      return false;
    }
    return true;
  };

  const fetchOrderHistory = async () => {
    const deviceId = getDeviceId();
    const r = await fetch(`/api/restaurants/${encodeURIComponent(slug)}/orders?device_id=${encodeURIComponent(deviceId)}`);
    if (!r.ok) return;
    const rows = await r.json();
    setOrdersHistory(Array.isArray(rows) ? rows : []);
  };

  const buildWhatsAppOrderText = () => {
    const addrLines: string[] = [];
    if (addressText.trim()) addrLines.push(`${t("checkout_address_placeholder")}: ${addressText.trim()}`);
    if (geoUrl.trim()) addrLines.push(`${t("checkout_geo_prefix")}: ${geoUrl.trim()}`);
    const payLabel = payment === "cash" ? t("checkout_cash") : t("checkout_card");
    const lines = cart.map((line) => {
      const tr = line.product.translations as Record<string, { name?: string }> | undefined;
      const pn = tr?.[currentLang]?.name || String(line.product.name ?? "");
      const label = line.variantLabel ? `${line.variantLabel} · ${pn}` : pn;
      const note = line.note?.trim() ? ` — ${line.note.trim()}` : "";
      return `- ${label} x${Number(line.quantity || 1)}${note} (₼${(Number(line.unitPrice) * Number(line.quantity || 1)).toFixed(2)})`;
    });
    const total = cart
      .reduce((s, l) => s + Number(l.unitPrice) * Number(l.quantity || 1), 0)
      .toFixed(2);
    return [
      t("whatsapp_order_prefix"),
      "",
      `Müştəri: ${fullName.trim()}`,
      `Telefon: ${phoneNumber.trim()}`,
      `Növ: ${orderType === "pickup" ? "Məkandan götür" : "Çatdırılma"}`,
      "",
      ...lines,
      "",
      `${t("total")}: ₼${total}`,
      "",
      ...addrLines,
      "",
      customerNote.trim() ? `Qeyd: ${customerNote.trim()}` : "",
      `${t("checkout_payment")}: ${payLabel}`,
    ].join("\n");
  };

  const openRestaurantWhatsApp = () => {
    const wa = String(data.whatsapp_number ?? "").replace(/\D/g, "");
    if (!wa) return false;
    const text = buildWhatsAppOrderText();
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`, "_blank");
    return true;
  };

  const sendOrderWeb = async () => {
    if (!validateCheckout()) return;
    setCheckoutBusy(true);
    setCheckoutErr("");
    try {
      const res = await fetch(`/api/restaurants/${encodeURIComponent(slug)}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload()),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCheckoutErr(String(data.error || t("server_error")));
        return;
      }
      setCheckoutOk(
        "Sifarişiniz qeydə alındı. Ən qısa zamanda sizinlə əlaqə saxlanılacaq"
      );
      setCart([]);
      setMenuView("browse");
      await fetchOrderHistory();
    } finally {
      setCheckoutBusy(false);
    }
  };

  const sendOrderSmartWeb = async () => {
    if (!validateCheckout()) return;
    const waAllowed = plan_features?.whatsapp_order !== false;
    const wa = String(data.whatsapp_number ?? "").replace(/\D/g, "");
    if (waAllowed && !wa) {
      setCheckoutErr("Restoran WhatsApp nömrəsi təyin edilməyib. Paneldə WhatsApp əlavə edin.");
      return;
    }
    setCheckoutBusy(true);
    setCheckoutErr("");
    try {
      const res = await fetch(`/api/restaurants/${encodeURIComponent(slug)}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderPayload(),
          order_source: waAllowed && wa ? "whatsapp" : "web",
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCheckoutErr(String(body.error || t("server_error")));
        return;
      }
      if (waAllowed && wa) {
        openRestaurantWhatsApp();
      }
      setCheckoutOk(
        waAllowed && wa
          ? "Sifariş qeydə alındı. WhatsApp açılır..."
          : "Sifarişiniz qeydə alındı. Ən qısa zamanda sizinlə əlaqə saxlanılacaq"
      );
      setCart([]);
      setMenuView("browse");
      await fetchOrderHistory();
    } finally {
      setCheckoutBusy(false);
    }
  };

  const sendOrderWhatsApp = () => {
    const wa = String(data.whatsapp_number ?? "").replace(/\D/g, "");
    if (!wa) return;
    if (!validateCheckout()) {
      return;
    }
    openRestaurantWhatsApp();
    setCheckoutOpen(false);
    setAddressText("");
    setGeoUrl("");
    setCheckoutErr("");
    setCheckoutOk("");
    setCart([]);
    setMenuView("browse");
    void fetchOrderHistory();
  };

  return (
    <>
      <MenuTemplateView
        template={template}
        restaurant={restaurantRow}
        categories={categories}
        products={products}
        activeCategory={activeCategory}
        setActiveCategory={(id) => setActiveCategory(id)}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        cart={cart}
        addToCart={addToCart}
        updateCartLineNote={updateCartLineNote}
        increaseCartLineQty={increaseCartLineQty}
        decreaseCartLineQty={decreaseCartLineQty}
        removeCartLine={removeCartLine}
        onCheckout={openCheckout}
        onOpenOrders={() => {
          void fetchOrderHistory();
          setHistoryOpen(true);
        }}
        ordersAllowed={ordersAllowed}
        ordersClosedHint={ordersClosedHint}
        menuView={menuView}
        onMenuViewChange={setMenuView}
        demoMode={demoMode}
        t={t}
        planFeatures={{
          whatsapp_order: plan_features?.whatsapp_order !== false,
          reservation: plan_features?.reservation !== false,
        }}
        smartWebCheckout={
          smartwebMode
            ? {
                fullName,
                setFullName,
                phoneNumber,
                setPhoneNumber,
                addressText,
                setAddressText,
                geoUrl,
                setGeoUrl,
                customerNote,
                setCustomerNote,
                pickGeo,
                geoBusy,
                submitOrder: sendOrderSmartWeb,
                checkoutErr,
                checkoutOk,
                checkoutBusy,
              }
            : undefined
        }
      />
      <AnimatePresence>
        {checkoutOpen && !smartwebMode ? (
          <motion.div
            key="ck"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 flex items-end sm:items-center justify-center p-4"
            onClick={() => setCheckoutOpen(false)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              className={cn(
                "w-full max-w-md bg-white text-gray-900 shadow-2xl max-h-[90vh] overflow-y-auto",
                mega1Mode ? "rounded-3xl p-6" : mega2Mode ? "rounded-3xl p-6" : "rounded-2xl p-5"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={cn("font-black mb-6", mega1Mode || mega2Mode ? "text-2xl" : "text-lg")}>
                {mega1Mode ? "Məlumatlar" : mega2Mode ? "Sifarişi Tamamla" : t("checkout_title")}
              </h2>
              {mega2Mode ? (
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--mt-primary)]">
                  Mərhələ 2 / 2
                </p>
              ) : null}
              <div className={cn("mb-4 grid grid-cols-2 gap-2", mega1Mode && "rounded-2xl bg-gray-200 p-1")}>
                <button
                  type="button"
                  onClick={() => setOrderType("pickup")}
                  className={cn(
                    "rounded-xl py-3 text-sm font-bold transition-colors",
                  mega1Mode || mega2Mode
                      ? orderType === "pickup"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-gray-500"
                      : orderType === "pickup"
                        ? "border border-red-600 bg-red-50 text-red-700"
                        : "border border-gray-200"
                  )}
                >
                  Məkandan götür
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType("delivery")}
                  className={cn(
                    "rounded-xl py-3 text-sm font-bold transition-colors",
                  mega1Mode || mega2Mode
                      ? orderType === "delivery"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-gray-500"
                      : orderType === "delivery"
                        ? "border border-red-600 bg-red-50 text-red-700"
                        : "border border-gray-200"
                  )}
                >
                  Çatdırılma
                </button>
              </div>
              <label className="block text-sm font-medium mb-1">Ad soyad</label>
              <input
                className={cn(
                  "w-full p-4 text-sm mb-3",
                  mega1Mode || mega2Mode
                    ? "rounded-2xl border-0 shadow-sm ring-1 ring-gray-200"
                    : "border rounded-xl"
                )}
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setCheckoutErr("");
                }}
                placeholder="Ad soyad"
              />
              <label className="block text-sm font-medium mb-1">Telefon nömrəsi</label>
              <input
                className={cn(
                  "w-full p-4 text-sm mb-3",
                  mega1Mode || mega2Mode
                    ? "rounded-2xl border-0 shadow-sm ring-1 ring-gray-200"
                    : "border rounded-xl"
                )}
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setCheckoutErr("");
                }}
                placeholder="+994..."
              />
              <label className="block text-sm font-medium mb-1">{t("checkout_address_placeholder")}</label>
              {!mega2Mode ? (
                <textarea
                  className={cn(
                    "w-full p-4 text-sm mb-3 min-h-[72px]",
                    mega1Mode || mega2Mode
                      ? "rounded-2xl border-0 shadow-sm ring-1 ring-gray-200"
                      : "border rounded-xl"
                  )}
                  value={addressText}
                  onChange={(e) => {
                    setAddressText(e.target.value);
                    setCheckoutErr("");
                  }}
                  placeholder={t("checkout_address_placeholder")}
                  disabled={orderType !== "delivery"}
                />
              ) : null}
              {mega2Mode ? (
                <section className="mb-4 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                  <div className="px-4 pt-4">
                    <h3 className="text-base font-bold">Çatdırılma Ünvanı</h3>
                    <p className="text-xs text-gray-500">Xəritədə yeri dəqiqləşdirmək üçün toxunun</p>
                  </div>
                  <button
                    type="button"
                    disabled={geoBusy}
                    onClick={() => {
                      setCheckoutErr("");
                      setMapOpen(true);
                    }}
                    className="mt-3 h-36 w-full bg-slate-200/80 text-sm font-semibold text-slate-700"
                  >
                    {geoBusy ? t("checkout_location_busy") : "Xəritədən seç"}
                  </button>
                  <div className="p-4">
                    <input
                      className="w-full rounded-full bg-gray-100 px-4 py-3 text-sm outline-none"
                      value={addressText}
                      onChange={(e) => {
                        setAddressText(e.target.value);
                        setCheckoutErr("");
                      }}
                      placeholder="Mərtəbə, mənzil və ya nişangah daxil edin"
                      disabled={orderType !== "delivery"}
                    />
                  </div>
                </section>
              ) : null}
              <button
                type="button"
                disabled={geoBusy}
                onClick={() => {
                  setCheckoutErr("");
                  setMapOpen(true);
                }}
                className={cn(
                  "w-full mb-4 text-sm font-semibold disabled:opacity-60",
                  mega1Mode || mega2Mode
                    ? "h-40 rounded-3xl border-4 border-white bg-slate-200 shadow-lg"
                    : "py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50"
                )}
                style={mega2Mode ? { display: "none" } : undefined}
              >
                {geoBusy ? t("checkout_location_busy") : "Xəritədə konum seç"}
              </button>
              {geoUrl ? (
                <p className="text-xs text-green-700 mb-4 break-all">✓ {geoUrl}</p>
              ) : null}
              <label className="block text-sm font-medium mb-1">Qeyd</label>
              <textarea
                className={cn(
                  "w-full p-4 text-sm mb-4 min-h-[60px]",
                  mega1Mode || mega2Mode
                    ? "rounded-2xl border-0 shadow-sm ring-1 ring-gray-200"
                    : "border rounded-xl"
                )}
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Qeyd (istəyə görə)"
              />
              <p className="text-sm font-medium mb-2">{t("checkout_payment")}</p>
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setPayment("cash")}
                  className={cn(
                    "flex-1 py-3 rounded-2xl border text-sm font-bold",
                    payment === "cash" ? "border-red-500 bg-red-50 text-red-800" : "border-gray-200"
                  )}
                >
                  {t("checkout_cash")}
                </button>
                <button
                  type="button"
                  onClick={() => setPayment("card")}
                  className={cn(
                    "flex-1 py-3 rounded-2xl border text-sm font-bold",
                    payment === "card" ? "border-red-500 bg-red-50 text-red-800" : "border-gray-200"
                  )}
                >
                  {t("checkout_card")}
                </button>
              </div>
              {!mega2Mode ? (
                <>
                  <p className="text-sm font-medium mb-2">Göndərmə üsulu</p>
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setOrderSource("web")}
                      className={cn(
                        "flex-1 py-3 rounded-2xl border text-sm font-bold",
                        orderSource === "web" ? "border-red-600 bg-red-50 text-red-800" : "border-gray-200"
                      )}
                    >
                      Web sayt
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderSource("whatsapp")}
                      className={cn(
                        "flex-1 py-3 rounded-2xl border text-sm font-bold",
                        orderSource === "whatsapp" ? "border-red-600 bg-red-50 text-red-800" : "border-gray-200"
                      )}
                    >
                      WhatsApp
                    </button>
                  </div>
                </>
              ) : null}
              {checkoutErr ? <p className="text-sm text-red-600 mb-3">{checkoutErr}</p> : null}
              {checkoutOk ? <p className="text-sm text-green-700 mb-3">{checkoutOk}</p> : null}
              <div className={cn("flex gap-2", mega2Mode && "mt-3 flex-col rounded-3xl bg-slate-900 p-4")}>
                <button
                  type="button"
                  className={cn(
                    "flex-1 py-3 rounded-2xl border border-gray-200 font-medium",
                    mega2Mode && "hidden"
                  )}
                  onClick={() => setCheckoutOpen(false)}
                >
                  {t("checkout_cancel")}
                </button>
                <button
                  type="button"
                  disabled={checkoutBusy}
                  className={cn(
                    "flex-1 py-3 rounded-2xl text-white font-bold disabled:opacity-60",
                    !mega2Mode && orderSource === "whatsapp"
                      ? "bg-green-500"
                      : mega1Mode
                        ? "bg-indigo-600"
                        : mega2Mode
                          ? "bg-gradient-to-r from-[#9c3f00] to-[#ff7a2f]"
                          : "bg-green-600"
                  )}
                  onClick={mega2Mode ? () => void sendOrderWeb() : orderSource === "whatsapp" ? sendOrderWhatsApp : () => void sendOrderWeb()}
                >
                  {checkoutBusy ? "..." : mega2Mode ? "Web vasitəsilə tamamla" : orderSource === "whatsapp" ? t("checkout_send") : "Sifarişi ver"}
                </button>
                {mega2Mode ? (
                  <button
                    type="button"
                    disabled={checkoutBusy}
                    className="flex-1 py-3 rounded-2xl border border-white/10 bg-white/10 text-white font-bold backdrop-blur-md disabled:opacity-60"
                    onClick={sendOrderWhatsApp}
                  >
                    WhatsApp vasitəsilə sifariş et
                  </button>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {mapOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] bg-black/60 flex items-end sm:items-center justify-center p-4"
            onClick={() => setMapOpen(false)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              className="w-full max-w-md rounded-2xl bg-white text-gray-900 shadow-2xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-bold mb-3">Xəritədə konum seç</h3>
              <iframe
                title="map"
                src={
                  geoUrl
                    ? `https://maps.google.com/maps?q=${encodeURIComponent(geoUrl)}&z=15&output=embed`
                    : "https://maps.google.com/maps?q=Baku&t=&z=13&ie=UTF8&iwloc=&output=embed"
                }
                className="w-full h-56 rounded-xl border"
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 font-medium"
                  onClick={() => setMapOpen(false)}
                >
                  Bağla
                </button>
                <button
                  type="button"
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold"
                  onClick={() => {
                    pickGeo();
                    setMapOpen(false);
                  }}
                >
                  Konumu təsdiqlə
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {historyOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[210] bg-black/60 flex items-end sm:items-center justify-center p-4"
            onClick={() => setHistoryOpen(false)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              className={cn(
                "w-full max-h-[90vh] overflow-y-auto text-gray-900 shadow-2xl",
                mega2Mode ? "max-w-lg rounded-[2rem] bg-[#f9f6f5] p-0" : "max-w-md rounded-2xl bg-white p-5"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {mega2Mode ? (
                <div className="sticky top-0 z-10 rounded-t-[2rem] bg-[#f9f6f5]/95 px-5 pb-4 pt-5 backdrop-blur-xl">
                  <h2 className="text-2xl font-black tracking-tight">Sifariş Tarixçəsi</h2>
                  <p className="text-xs text-gray-500">Bu cihazdan verilən sifarişlər</p>
                </div>
              ) : (
                <h2 className="text-lg font-bold mb-3">Sifarişlərim</h2>
              )}
              {ordersHistory.length === 0 ? (
                <p className={cn("text-sm text-gray-500", mega2Mode && "px-5 pb-5")}>Bu cihaz üçün sifariş tapılmadı.</p>
              ) : (
                <ul className={cn("space-y-2", mega2Mode && "px-5 pb-5 space-y-4")}>
                  {ordersHistory.map((o) => (
                    <li
                      key={o.id}
                      className={cn(
                        "text-sm",
                        mega2Mode
                          ? "rounded-[1.5rem] bg-white p-4 shadow-[0_18px_35px_rgba(156,63,0,0.06)]"
                          : "rounded-xl border p-3"
                      )}
                    >
                      <div className="flex justify-between gap-2 items-start">
                        <div>
                          <span className="font-semibold">Sifariş #{o.id}</span>
                          <p className="mt-1 text-xs text-gray-500">
                            {(o.payload?.items || [])
                              .slice(0, 2)
                              .map((it: { name?: string; qty?: number }) => `${Number(it.qty || 1)}x ${it.name || "Məhsul"}`)
                              .join(", ") || "Məhsul məlumatı yoxdur"}
                          </p>
                        </div>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${orderStatusBadgeClass(o.status)}`}>
                          {orderStatusLabel(o.status, currentLang)}
                        </span>
                      </div>
                      <p className={cn("text-xs mt-2", mega2Mode ? "font-bold text-[var(--mt-primary)]" : "text-gray-500")}>
                        Cəmi: ₼{Number(o.total_amount || o.payload?.total_amount || 0).toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
