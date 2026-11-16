import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  GuestSkinLoader,
  resolveMenuTemplate,
  DEFAULT_TEMPLATE_ID,
  type CartLine,
} from "./menu-templates";
import { CheckoutScreen, type CheckoutPhase } from "./menu-templates/shared/CheckoutScreen";
import { readStudioPreviewTicket } from "./menu-templates/studioPreview";
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
  const [searchParams] = useSearchParams();
  const previewTicket = readStudioPreviewTicket(searchParams);
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
  const [checkoutPhase, setCheckoutPhase] = useState<CheckoutPhase>("form");
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);
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

  const orderAccessKey = () => `qrmenu-order-access-${slug}`;
  const getOrderAccessTokens = (): string[] => {
    const raw = localStorage.getItem(orderAccessKey()) || "";
    if (!raw) return [];
    if (raw.startsWith("v2.")) return [raw];
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === "string" ? item : String((item as { token?: string }).token || "")))
          .filter((t) => t.startsWith("v2."))
          .slice(-50);
      }
    } catch {
      /* phase-1 hex tokens are not accepted */
    }
    return [];
  };
  const addOrderAccessToken = (token: string) => {
    const tkn = String(token || "").trim();
    if (!tkn.startsWith("v2.")) return;
    const next = getOrderAccessTokens().filter((x) => x !== tkn);
    next.push(tkn);
    localStorage.setItem(orderAccessKey(), JSON.stringify(next.slice(-50)));
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
    fetch(`/api/restaurants/${encodeURIComponent(slug)}${qs}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        if (res.categories?.length > 0) setActiveCategory(res.categories[0].id);
      });
  }, [slug, preview]);

  const t = (key: string) => bundle[currentLang]?.[key] || key;

  useEffect(() => {
    if (!data?.name) return;
    const tid = previewTemplateId || data.menu_template || DEFAULT_TEMPLATE_ID;
    const tpl = resolveMenuTemplate(tid, data.custom_templates);
    document.title = `${data.name} · ${tpl.name}`;
    return () => {
      document.title = "MenuGo";
    };
  }, [data, previewTemplateId]);

  useEffect(() => {
    if (!data) return;
    const tpl = resolveMenuTemplate(
      previewTemplateId || data.menu_template || DEFAULT_TEMPLATE_ID,
      data.custom_templates
    );
    if (tpl.theme.renderMode === "smartweb") setOrderType("delivery");
  }, [data, previewTemplateId]);

  if (!data) return <div className="p-10 text-center">{t("loading")}</div>;

  const { categories, products, custom_templates, plan_features, orders_allowed, ...restaurantRow } =
    data;
  const template = resolveMenuTemplate(
    previewTemplateId || data.menu_template || DEFAULT_TEMPLATE_ID,
    custom_templates
  );
  const mega2Mode = false;
  const smartwebMode = false;

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
    setCheckoutPhase("form");
    setPlacedOrderId(null);
    setCheckoutOpen(true);
  };

  const closeCheckoutKeepCart = () => {
    setCheckoutOpen(false);
    setCheckoutErr("");
    setCheckoutOk("");
    setCheckoutPhase("form");
  };

  const leaveCheckoutToMenu = () => {
    setCheckoutOpen(false);
    setCheckoutErr("");
    setCheckoutOk("");
    setCheckoutPhase("form");
    setPlacedOrderId(null);
    setMenuView("browse");
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
      setCheckoutErr(t("checkout_contact_required"));
      return false;
    }
    if (orderType === "delivery" && !addressText.trim() && !geoUrl.trim()) {
      setCheckoutErr(t("checkout_address_required"));
      return false;
    }
    return true;
  };

  const fetchOrderHistory = async () => {
    const tokens = getOrderAccessTokens();
    if (tokens.length === 0) {
      setOrdersHistory([]);
      return;
    }
    const r = await fetch(`/api/restaurants/${encodeURIComponent(slug)}/orders`, {
      headers: { "X-Order-Access": tokens.join(",") },
    });
    if (!r.ok) {
      setOrdersHistory([]);
      return;
    }
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
      `Növ: ${orderType === "pickup" ? t("checkout_pickup") : t("checkout_delivery")}`,
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

  const orderHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (demoMode) headers["X-MenuGo-Preview"] = "studio";
    if (previewTicket) headers["X-MenuGo-Preview-Ticket"] = previewTicket;
    return headers;
  };

  const orderPostUrl = () => {
    const base = `/api/restaurants/${encodeURIComponent(slug)}/orders`;
    const q = new URLSearchParams();
    if (demoMode) q.set("studioPreview", "1");
    if (previewTicket) q.set("pt", previewTicket);
    const qs = q.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const orderBody = (extra: Record<string, unknown> = {}) => ({
    ...orderPayload(),
    ...extra,
    ...(demoMode ? { preview_mode: "studio" } : {}),
    ...(previewTicket ? { preview_ticket: previewTicket } : {}),
  });

  const sendOrderWeb = async () => {
    if (!validateCheckout()) return;
    // Studio / demo preview: never create a real order (client short-circuit).
    if (demoMode || previewTicket) {
      setCheckoutErr(t("checkout_preview_blocked"));
      setCheckoutPhase("form");
      setPlacedOrderId(null);
      return;
    }
    setCheckoutBusy(true);
    setCheckoutErr("");
    try {
      const res = await fetch(orderPostUrl(), {
        method: "POST",
        headers: orderHeaders(),
        body: JSON.stringify(orderBody()),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCheckoutErr(String(data.error || t("server_error")));
        setCheckoutPhase("form");
        setPlacedOrderId(null);
        return;
      }
      if (data.access_token) addOrderAccessToken(String(data.access_token));
      const oid = Number(data.order?.id);
      setPlacedOrderId(Number.isFinite(oid) && oid > 0 ? oid : null);
      setCheckoutOk("");
      setCheckoutPhase("success");
      setCart([]);
      setMenuView("browse");
      await fetchOrderHistory();
    } finally {
      setCheckoutBusy(false);
    }
  };

  const sendOrderSmartWeb = async () => {
    if (!validateCheckout()) return;
    if (demoMode || previewTicket) {
      setCheckoutErr(t("checkout_preview_blocked"));
      return;
    }
    const waAllowed = plan_features?.whatsapp_order !== false;
    const wa = String(data.whatsapp_number ?? "").replace(/\D/g, "");
    if (waAllowed && !wa) {
      setCheckoutErr("Restoran WhatsApp nömrəsi təyin edilməyib. Paneldə WhatsApp əlavə edin.");
      return;
    }
    setCheckoutBusy(true);
    setCheckoutErr("");
    try {
      const res = await fetch(orderPostUrl(), {
        method: "POST",
        headers: orderHeaders(),
        body: JSON.stringify(
          orderBody({
            order_source: waAllowed && wa ? "whatsapp" : "web",
          })
        ),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCheckoutErr(String(body.error || t("server_error")));
        return;
      }
      if (body.access_token) addOrderAccessToken(String(body.access_token));
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
    if (demoMode || previewTicket) {
      if (!validateCheckout()) return;
      setCheckoutErr(t("checkout_preview_blocked"));
      return;
    }
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
      <GuestSkinLoader
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
        {checkoutOpen && !smartwebMode ? (
          <CheckoutScreen
            templateId={template.id}
            restaurant={restaurantRow}
            cart={cart}
            lang={currentLang}
            t={t}
            phase={checkoutPhase}
            placedOrderId={placedOrderId}
            fullName={fullName}
            setFullName={(v) => {
              setFullName(v);
              setCheckoutErr("");
            }}
            phoneNumber={phoneNumber}
            setPhoneNumber={(v) => {
              setPhoneNumber(v);
              setCheckoutErr("");
            }}
            addressText={addressText}
            setAddressText={(v) => {
              setAddressText(v);
              setCheckoutErr("");
            }}
            customerNote={customerNote}
            setCustomerNote={setCustomerNote}
            orderType={orderType}
            setOrderType={setOrderType}
            payment={payment}
            setPayment={setPayment}
            orderSource={orderSource}
            setOrderSource={setOrderSource}
            geoUrl={geoUrl}
            geoBusy={geoBusy}
            onPickLocation={() => {
              setCheckoutErr("");
              setMapOpen(true);
            }}
            checkoutErr={checkoutErr}
            checkoutBusy={checkoutBusy}
            onBack={closeCheckoutKeepCart}
            onSubmit={orderSource === "whatsapp" ? sendOrderWhatsApp : () => void sendOrderWeb()}
            onOpenOrders={() => {
              void fetchOrderHistory();
              setHistoryOpen(true);
            }}
            onBackToMenu={leaveCheckoutToMenu}
          />
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
