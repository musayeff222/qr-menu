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

  if (!data) return <div className="p-10 text-center">{t("loading")}</div>;

  const { categories, products, custom_templates, plan_features, orders_allowed, ...restaurantRow } =
    data;
  const template = resolveMenuTemplate(
    previewTemplateId || data.menu_template || "modern-01",
    custom_templates
  );
  const mega1Mode = template.theme.renderMode === "fastfood-pro";

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

  const sendOrderWhatsApp = () => {
    const wa = String(data.whatsapp_number ?? "").replace(/\D/g, "");
    if (!wa) return;
    if (!validateCheckout()) {
      return;
    }
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
    const text = [
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
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`);
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
      />
      <AnimatePresence>
        {checkoutOpen ? (
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
                mega1Mode ? "rounded-3xl p-6" : "rounded-2xl p-5"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className={cn("font-black mb-6", mega1Mode ? "text-2xl" : "text-lg")}>
                {mega1Mode ? "Məlumatlar" : t("checkout_title")}
              </h2>
              <div className={cn("mb-4 grid grid-cols-2 gap-2", mega1Mode && "rounded-2xl bg-gray-200 p-1")}>
                <button
                  type="button"
                  onClick={() => setOrderType("pickup")}
                  className={cn(
                    "rounded-xl py-3 text-sm font-bold transition-colors",
                    mega1Mode
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
                    mega1Mode
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
                  mega1Mode ? "rounded-2xl border-0 shadow-sm ring-1 ring-gray-200" : "border rounded-xl"
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
                  mega1Mode ? "rounded-2xl border-0 shadow-sm ring-1 ring-gray-200" : "border rounded-xl"
                )}
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setCheckoutErr("");
                }}
                placeholder="+994..."
              />
              <label className="block text-sm font-medium mb-1">{t("checkout_address_placeholder")}</label>
              <textarea
                className={cn(
                  "w-full p-4 text-sm mb-3 min-h-[72px]",
                  mega1Mode ? "rounded-2xl border-0 shadow-sm ring-1 ring-gray-200" : "border rounded-xl"
                )}
                value={addressText}
                onChange={(e) => {
                  setAddressText(e.target.value);
                  setCheckoutErr("");
                }}
                placeholder={t("checkout_address_placeholder")}
                disabled={orderType !== "delivery"}
              />
              <button
                type="button"
                disabled={geoBusy}
                onClick={() => {
                  setCheckoutErr("");
                  setMapOpen(true);
                }}
                className={cn(
                  "w-full mb-4 text-sm font-semibold disabled:opacity-60",
                  mega1Mode
                    ? "h-40 rounded-3xl border-4 border-white bg-slate-200 shadow-lg"
                    : "py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50"
                )}
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
                  mega1Mode ? "rounded-2xl border-0 shadow-sm ring-1 ring-gray-200" : "border rounded-xl"
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
              {checkoutErr ? <p className="text-sm text-red-600 mb-3">{checkoutErr}</p> : null}
              {checkoutOk ? <p className="text-sm text-green-700 mb-3">{checkoutOk}</p> : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 py-3 rounded-2xl border border-gray-200 font-medium"
                  onClick={() => setCheckoutOpen(false)}
                >
                  {t("checkout_cancel")}
                </button>
                <button
                  type="button"
                  disabled={checkoutBusy}
                  className={cn(
                    "flex-1 py-3 rounded-2xl text-white font-bold disabled:opacity-60",
                    orderSource === "whatsapp" ? "bg-green-500" : mega1Mode ? "bg-indigo-600" : "bg-green-600"
                  )}
                  onClick={orderSource === "whatsapp" ? sendOrderWhatsApp : () => void sendOrderWeb()}
                >
                  {checkoutBusy ? "..." : orderSource === "whatsapp" ? t("checkout_send") : "Sifarişi ver"}
                </button>
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
              className="w-full max-w-md rounded-2xl bg-white text-gray-900 shadow-2xl p-5 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold mb-3">Sifarişlərim</h2>
              {ordersHistory.length === 0 ? (
                <p className="text-sm text-gray-500">Bu cihaz üçün sifariş tapılmadı.</p>
              ) : (
                <ul className="space-y-2">
                  {ordersHistory.map((o) => (
                    <li key={o.id} className="rounded-xl border p-3 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="font-semibold">#{o.id}</span>
                        <span className="text-xs text-gray-500">{String(o.status || "-")}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        ₼{Number(o.total_amount || o.payload?.total_amount || 0).toFixed(2)}
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
