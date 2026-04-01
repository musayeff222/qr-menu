import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  Instagram,
  Music2,
  Plus,
  ShoppingCart,
  ChevronRight,
  Utensils,
} from "lucide-react";
import type { MenuTemplateDef } from "./types";
import type { FontPairKey } from "./types";
import { cn } from "./cn";

const FONT_STACKS: Record<
  FontPairKey,
  { heading: string; body: string }
> = {
  "space-dm": {
    heading: "'Space Grotesk', ui-sans-serif, system-ui",
    body: "'DM Sans', ui-sans-serif, system-ui",
  },
  "playfair-dm": {
    heading: "'Playfair Display', Georgia, serif",
    body: "'DM Sans', ui-sans-serif, system-ui",
  },
  "bebas-nunito": {
    heading: "'Bebas Neue', Impact, sans-serif",
    body: "'Nunito', ui-sans-serif, system-ui",
  },
  "merriweather-lato": {
    heading: "'Merriweather', Georgia, serif",
    body: "'Lato', ui-sans-serif, system-ui",
  },
  "montserrat-inter": {
    heading: "'Montserrat', ui-sans-serif, system-ui",
    body: "'Inter', ui-sans-serif, system-ui",
  },
  "raleway-open": {
    heading: "'Raleway', ui-sans-serif, system-ui",
    body: "'Open Sans', ui-sans-serif, system-ui",
  },
  "lora-source": {
    heading: "'Lora', Georgia, serif",
    body: "'Source Sans 3', ui-sans-serif, system-ui",
  },
  "oswald-roboto": {
    heading: "'Oswald', ui-sans-serif, system-ui",
    body: "'Roboto', ui-sans-serif, system-ui",
  },
  "cormorant-work": {
    heading: "'Cormorant Garamond', Georgia, serif",
    body: "'Work Sans', ui-sans-serif, system-ui",
  },
  "syne-manrope": {
    heading: "'Syne', ui-sans-serif, system-ui",
    body: "'Manrope', ui-sans-serif, system-ui",
  },
};

export type CartLine = {
  lineId: string;
  productId: number;
  product: Record<string, unknown>;
  variantId?: number;
  variantLabel?: string;
  unitPrice: number;
  note?: string;
};

export type MenuTemplateViewProps = {
  template: MenuTemplateDef;
  restaurant: Record<string, unknown>;
  categories: Array<Record<string, unknown>>;
  products: Array<Record<string, unknown>>;
  activeCategory: number | null;
  setActiveCategory: (id: number) => void;
  currentLang: string;
  setCurrentLang: (l: string) => void;
  cart: CartLine[];
  addToCart: (item: {
    product: Record<string, unknown>;
    variantId?: number;
    variantLabel?: string;
    unitPrice: number;
  }) => void;
  updateCartLineNote: (lineId: string, note: string) => void;
  removeCartLine: (lineId: string) => void;
  onCheckout: () => void;
  ordersAllowed: boolean;
  ordersClosedHint?: string;
  t: (k: string) => string;
  planFeatures?: {
    whatsapp_order?: boolean;
    reservation?: boolean;
  };
  /** Full-screen cart vs inline peek (customer menu). */
  menuView?: "browse" | "cart";
  onMenuViewChange?: (v: "browse" | "cart") => void;
};

const RADIUS_MAP = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
} as const;

const IMG_R_MAP = {
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  xl: "rounded-2xl",
  "2xl": "rounded-3xl",
} as const;

export function MenuTemplateView({
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
  removeCartLine,
  onCheckout,
  ordersAllowed,
  ordersClosedHint,
  t,
  planFeatures,
  menuView = "browse",
  onMenuViewChange,
}: MenuTemplateViewProps) {
  const allowWa = planFeatures?.whatsapp_order !== false;
  const allowRes = planFeatures?.reservation !== false;
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const navCartRef = useRef<HTMLButtonElement | null>(null);
  const [fly, setFly] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(
    null
  );

  useEffect(() => {
    if (cart.length === 0 && menuView === "cart") onMenuViewChange?.("browse");
  }, [cart.length, menuView, onMenuViewChange]);

  const triggerFly = (clientX: number, clientY: number) => {
    const el = fabRef.current || navCartRef.current;
    let x1 = clientX;
    let y1 = clientY - 80;
    if (el) {
      const r = el.getBoundingClientRect();
      x1 = r.left + r.width / 2;
      y1 = r.top + r.height / 2;
    }
    setFly({ x0: clientX, y0: clientY, x1, y1 });
    window.setTimeout(() => setFly(null), 550);
  };
  const th = template.theme;
  const r = RADIUS_MAP[th.radius];
  const pir = IMG_R_MAP[th.productImageRadius];

  const cssVars = useMemo(
    () =>
      ({
        "--mt-primary": th.primary,
        "--mt-secondary": th.secondary,
        "--mt-accent": th.accent,
        "--mt-bg": th.background,
        "--mt-surface": th.surface,
        "--mt-text": th.text,
        "--mt-muted": th.muted,
      }) as React.CSSProperties,
    [th]
  );

  const name = String(restaurant.name ?? "");
  const tagline =
    String(restaurant.tagline ?? "") || t("scan_order_enjoy");
  const logoUrl = restaurant.logo_url ? String(restaurant.logo_url) : "";
  const whatsapp = restaurant.whatsapp_number
    ? String(restaurant.whatsapp_number).replace(/\D/g, "")
    : "";
  const phone = restaurant.phone ? String(restaurant.phone) : "";
  const mapsUrl = restaurant.maps_url ? String(restaurant.maps_url) : "";
  const reservationUrl = restaurant.reservation_url
    ? String(restaurant.reservation_url)
    : "";
  const instagram = restaurant.instagram ? String(restaurant.instagram) : "";
  const tiktok = restaurant.tiktok ? String(restaurant.tiktok) : "";
  const coverUrl = restaurant.cover_image_url ? String(restaurant.cover_image_url) : "";
  const heroImageSrc = coverUrl || template.heroImage;
  const headerLayout = th.headerLayout ?? "centered";
  const productLayout = th.productLayout ?? "list";
  const iconStyle = th.iconStyle ?? "rounded";

  const waOrderUrl =
    allowWa && whatsapp
      ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(t("order_via_whatsapp"))}`
      : "";

  const heroH =
    th.heroVariant === "fullscreen"
      ? "min-h-[48vh]"
      : th.heroVariant === "compact"
        ? "min-h-[26vh]"
        : th.heroVariant === "split"
          ? "min-h-[40vh]"
          : "min-h-[42vh]";

  const densityPad =
    th.density === "compact" ? "p-2.5" : th.density === "spacious" ? "p-5" : "p-3.5";

  const fonts = FONT_STACKS[th.fontPair];

  const fixCard = cn(
    th.cardStyle === "elevated" && "shadow-lg border-0",
    th.cardStyle === "flat" && "border shadow-none",
    th.cardStyle === "bordered" && "border-2 shadow-sm",
    th.cardStyle === "glass" && "backdrop-blur-md border shadow-md",
    r
  );

  const patternOverlay =
    th.heroPattern === "dots" ? (
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--mt-surface) 1px, transparent 0)`,
          backgroundSize: "18px 18px",
        }}
      />
    ) : th.heroPattern === "grid" ? (
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--mt-muted) 1px, transparent 1px), linear-gradient(90deg, var(--mt-muted) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    ) : th.heroPattern === "noise" ? (
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence baseFrequency=%220.9%22/%3E%3C/filter%3E%3Crect width=%22100%22 height=%22100%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')]" />
    ) : null;

  const CategoryButton = ({
    cat,
    active,
  }: {
    cat: Record<string, unknown>;
    active: boolean;
  }) => {
    const cname =
      ((cat.translations as Record<string, string> | undefined)?.[
        currentLang
      ] as string) || String(cat.name);
    const base =
      "shrink-0 transition-all duration-200 font-medium whitespace-nowrap ";
    if (th.categoryNav === "pills") {
      return (
        <button
          type="button"
          onClick={() => setActiveCategory(cat.id as number)}
          className={cn(
            base,
            "px-4 py-2 text-sm",
            r,
            active
              ? "text-white shadow-md"
              : "opacity-80 hover:opacity-100",
            active ? "" : "bg-[var(--mt-surface)] text-[var(--mt-text)] border border-black/5"
          )}
          style={active ? { backgroundColor: "var(--mt-primary)" } : undefined}
        >
          {cname}
        </button>
      );
    }
    if (th.categoryNav === "tabs") {
      return (
        <button
          type="button"
          onClick={() => setActiveCategory(cat.id as number)}
          className={cn(
            base,
            "px-3 py-2 text-sm border-b-2",
            active ? "border-[var(--mt-primary)] text-[var(--mt-primary)]" : "border-transparent text-[var(--mt-muted)]"
          )}
        >
          {cname}
        </button>
      );
    }
    if (th.categoryNav === "underline") {
      return (
        <button
          type="button"
          onClick={() => setActiveCategory(cat.id as number)}
          className={cn(
            base,
            "px-2 py-1 text-sm relative",
            active ? "text-[var(--mt-text)]" : "text-[var(--mt-muted)]"
          )}
        >
          {cname}
          {active && (
            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--mt-primary)] rounded-full" />
          )}
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => setActiveCategory(cat.id as number)}
        className={cn(
          base,
          "px-3 py-1.5 text-xs uppercase tracking-wider",
          r,
          active ? "bg-[var(--mt-primary)] text-white" : "bg-black/5 text-[var(--mt-text)]"
        )}
      >
        {cname}
      </button>
    );
  };

  const iconShell = (() => {
    const base = "flex flex-col items-center justify-center active:scale-95 transition-transform";
    switch (iconStyle) {
      case "line":
        return cn(
          base,
          "w-12 h-12 sm:w-14 sm:h-14 border-2 border-[var(--mt-primary)] bg-transparent text-[var(--mt-primary)] shadow-none rounded-2xl"
        );
      case "filled":
        return cn(
          base,
          "w-12 h-12 sm:w-14 sm:h-14 bg-[var(--mt-primary)] text-white border-0 shadow-lg rounded-2xl"
        );
      case "minimal":
        return cn(
          base,
          "w-11 h-11 sm:w-12 sm:h-12 bg-transparent border-0 text-white shadow-none rounded-xl"
        );
      default:
        return cn(
          base,
          "w-12 h-12 sm:w-14 sm:h-14",
          r,
          "bg-[var(--mt-surface)]/90 text-[var(--mt-text)] shadow-sm border border-black/5"
        );
    }
  })();

  const ActionBtn = ({
    href,
    label,
    children,
  }: {
    href: string;
    label: string;
    children: React.ReactNode;
  }) =>
    href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={iconShell}
      >
        {children}
      </a>
    ) : null;

  const formatPrice = (p: unknown) => {
    const n = Number(p);
    if (Number.isNaN(n)) return "—";
    return `₼${n.toFixed(2)}`;
  };

  const filteredProducts = products.filter(
    (p) => Number(p.category_id) === Number(activeCategory)
  );

  const [variantPick, setVariantPick] = useState<Record<string, unknown> | null>(null);

  const variantsOf = (p: Record<string, unknown>) =>
    (Array.isArray(p.variants) ? p.variants : []) as Array<Record<string, unknown>>;

  const displayMinPrice = (prod: Record<string, unknown>) => {
    const base = Number(prod.price);
    const v = variantsOf(prod).map((x) => Number(x.price)).filter((n) => !Number.isNaN(n));
    if (!v.length) return base;
    return Math.min(base, ...v);
  };

  const handleAddProduct = (
    prod: Record<string, unknown>,
    e?: React.MouseEvent | React.TouchEvent
  ) => {
    if (!allowWa || !ordersAllowed) return;
    const vars = variantsOf(prod);
    if (vars.length > 0) {
      setVariantPick(prod);
      return;
    }
    if ("clientX" in (e || {}) && e) triggerFly(e.clientX, e.clientY);
    addToCart({ product: prod, unitPrice: Number(prod.price) });
  };

  const pickVariant = (
    prod: Record<string, unknown>,
    v: Record<string, unknown>,
    e?: React.MouseEvent
  ) => {
    if (e) triggerFly(e.clientX, e.clientY);
    addToCart({
      product: prod,
      variantId: Number(v.id),
      variantLabel: String(v.name),
      unitPrice: Number(v.price),
    });
    setVariantPick(null);
  };

  const socialRow = (
    <nav
      aria-label="Quick actions"
      className={cn(
        "flex flex-wrap justify-center gap-2",
        headerLayout === "full-hero" ? "mt-2" : "mt-4"
      )}
    >
      <ActionBtn href={mapsUrl} label="Google Maps">
        <MapPin size={20} />
      </ActionBtn>
      <ActionBtn href={phone ? `tel:${phone.replace(/\s/g, "")}` : ""} label="Telefon">
        <Phone size={20} />
      </ActionBtn>
      <ActionBtn href={waOrderUrl} label="WhatsApp">
        <MessageCircle size={20} />
      </ActionBtn>
      <ActionBtn href={allowRes ? reservationUrl : ""} label="Reservation">
        <Calendar size={20} />
      </ActionBtn>
      <ActionBtn href={instagram} label="Instagram">
        <Instagram size={20} />
      </ActionBtn>
      <ActionBtn href={tiktok} label="TikTok">
        <Music2 size={20} />
      </ActionBtn>
    </nav>
  );

  const langSelect = (
    <>
      <label className="sr-only" htmlFor="menu-lang">
        Language
      </label>
      <select
        id="menu-lang"
        value={currentLang}
        onChange={(e) => setCurrentLang(e.target.value)}
        className={cn(
          "text-xs font-bold px-2 py-1.5 border border-white/25 bg-black/35 text-white backdrop-blur rounded-lg outline-none",
          r
        )}
      >
        <option value="az">AZ</option>
        <option value="en">EN</option>
        <option value="ru">RU</option>
        <option value="tr">TR</option>
      </select>
    </>
  );

  const renderProductArticle = (prod: Record<string, unknown>, layout: "list" | "grid" | "card" | "slider") => {
    const pname =
      ((prod.translations as Record<string, { name?: string }> | undefined)?.[currentLang]?.name) ||
      String(prod.name);
    const pdesc =
      ((prod.translations as Record<string, { desc?: string }> | undefined)?.[currentLang]?.desc) ||
      String(prod.description ?? "");
    const img = prod.image_url ? String(prod.image_url) : "";
    const vars = variantsOf(prod);
    const showFrom = vars.length > 0;
    const innerAdd = allowWa ? (
      <button
        type="button"
        onClick={(e) => handleAddProduct(prod, e)}
        disabled={!ordersAllowed}
        className={cn(
          "w-10 h-10 flex items-center justify-center text-white shadow-md active:scale-90 transition-transform shrink-0",
          !ordersAllowed && "opacity-40 pointer-events-none",
          RADIUS_MAP.full
        )}
        style={{ backgroundColor: "var(--mt-primary)" }}
        aria-label={`${t("add_product")} ${pname}`}
      >
        <Plus size={20} />
      </button>
    ) : null;

    if (layout === "card") {
      return (
        <motion.article
          key={prod.id as number}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("flex flex-col overflow-hidden", fixCard, th.cardStyle === "glass" && "bg-[var(--mt-surface)]/80")}
          style={th.cardStyle === "glass" ? undefined : { backgroundColor: "var(--mt-surface)" }}
        >
          <div
            className={cn(
              "aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[var(--mt-secondary)] to-[var(--mt-primary)]/30",
              pir
            )}
          >
            {img ? (
              <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            ) : null}
          </div>
          <div className={cn("flex flex-col flex-1", densityPad)}>
            <h2
              className={cn("text-base sm:text-lg leading-tight", th.headingWeight)}
              style={{ fontFamily: fonts.heading }}
            >
              {pname}
            </h2>
            {pdesc ? (
              <p className="text-xs sm:text-sm mt-1 line-clamp-3 flex-1" style={{ color: "var(--mt-muted)" }}>
                {pdesc}
              </p>
            ) : null}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5">
              <span className="font-bold text-lg" style={{ color: "var(--mt-primary)" }}>
                {showFrom ? <>ən azı {formatPrice(displayMinPrice(prod))}</> : formatPrice(prod.price)}
              </span>
              {innerAdd}
            </div>
          </div>
        </motion.article>
      );
    }

    if (layout === "grid") {
      return (
        <motion.article
          key={prod.id as number}
          layout
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "flex flex-col gap-2",
            fixCard,
            densityPad,
            th.cardStyle === "glass" && "bg-[var(--mt-surface)]/80"
          )}
          style={th.cardStyle === "glass" ? undefined : { backgroundColor: "var(--mt-surface)" }}
        >
          <div
            className={cn(
              "w-full aspect-square max-h-36 overflow-hidden bg-gradient-to-br from-[var(--mt-secondary)] to-[var(--mt-primary)]/30",
              pir
            )}
          >
            {img ? (
              <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            ) : null}
          </div>
          <h2
            className={cn("text-sm font-semibold leading-tight line-clamp-2", th.headingWeight)}
            style={{ fontFamily: fonts.heading }}
          >
            {pname}
          </h2>
          <div className="flex items-center justify-between gap-2 mt-auto">
            <span className="font-bold" style={{ color: "var(--mt-primary)" }}>
              {showFrom ? <>ən azı {formatPrice(displayMinPrice(prod))}</> : formatPrice(prod.price)}
            </span>
            {innerAdd}
          </div>
        </motion.article>
      );
    }

    return (
      <motion.article
        key={prod.id as number}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex gap-3 sm:gap-4",
          fixCard,
          densityPad,
          layout === "slider" && "min-w-[min(88vw,320px)] snap-start shrink-0",
          th.cardStyle === "glass" && "bg-[var(--mt-surface)]/80"
        )}
        style={th.cardStyle === "glass" ? undefined : { backgroundColor: "var(--mt-surface)" }}
      >
        <div
          className={cn(
            "w-24 h-24 sm:w-28 sm:h-28 shrink-0 overflow-hidden bg-gradient-to-br from-[var(--mt-secondary)] to-[var(--mt-primary)]/30",
            pir
          )}
        >
          {img ? (
            <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
          ) : null}
        </div>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h2
              className={cn("text-base sm:text-lg leading-tight", th.headingWeight)}
              style={{ fontFamily: fonts.heading }}
            >
              {pname}
            </h2>
            {pdesc ? (
              <p className="text-xs sm:text-sm mt-1 line-clamp-3" style={{ color: "var(--mt-muted)" }}>
                {pdesc}
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-lg" style={{ color: "var(--mt-primary)" }}>
              {showFrom ? <>ən azı {formatPrice(displayMinPrice(prod))}</> : formatPrice(prod.price)}
            </span>
            {innerAdd}
          </div>
        </div>
      </motion.article>
    );
  };

  const showFullCart = allowWa && cart.length > 0 && menuView === "cart";
  const showCompactCartDrawer = allowWa && cart.length > 0 && menuView !== "cart";

  const cartLineBlocks = cart.map((line) => {
    const tr = line.product.translations as Record<string, { name?: string }> | undefined;
    const pn = tr?.[currentLang]?.name || String(line.product.name ?? "");
    const label = line.variantLabel ? `${line.variantLabel} · ${pn}` : pn;
    return (
      <div key={line.lineId} className="p-3 text-sm space-y-2 border-b border-black/5">
        <div className="flex justify-between gap-2">
          <span className="font-medium line-clamp-2">{label}</span>
          <span className="font-bold shrink-0">₼{Number(line.unitPrice).toFixed(2)}</span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {["az duzlu", "ədviyyatlı", "sos"].map((q) => (
            <button
              key={q}
              type="button"
              className="text-[10px] px-2 py-0.5 rounded-full border border-black/10"
              onClick={() => updateCartLineNote(line.lineId, [line.note, q].filter(Boolean).join(", "))}
            >
              {q}
            </button>
          ))}
        </div>
        <input
          className="w-full text-xs p-2 rounded-lg border border-black/10 bg-transparent"
          placeholder={t("cart_note_placeholder")}
          value={line.note || ""}
          onChange={(e) => updateCartLineNote(line.lineId, e.target.value)}
        />
        <button
          type="button"
          className="text-xs text-red-600"
          onClick={() => removeCartLine(line.lineId)}
        >
          {t("cart_remove_line")}
        </button>
      </div>
    );
  });

  return (
    <div
      id="menu-template-root"
      className="mt-menu min-h-screen pb-28 antialiased"
      style={{
        ...cssVars,
        backgroundColor: "var(--mt-bg)",
        color: "var(--mt-text)",
        fontFamily: fonts.body,
      }}
    >
      <a
        href="#main-menu"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:p-2 focus:rounded"
      >
        Skip to menu
      </a>

      <AnimatePresence>
        {fly ? (
          <motion.div
            key="fly"
            className="pointer-events-none fixed z-[320] h-4 w-4 rounded-full bg-emerald-400 shadow-lg"
            initial={{ left: fly.x0, top: fly.y0, opacity: 1, scale: 1.1 }}
            animate={{ left: fly.x1, top: fly.y1, opacity: 0.15, scale: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.52, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ position: "fixed" }}
          />
        ) : null}
      </AnimatePresence>

      {showFullCart ? (
        <div
          className="fixed inset-0 z-[55] flex flex-col pb-safe"
          style={{ backgroundColor: "var(--mt-bg)", color: "var(--mt-text)" }}
        >
          <div
            className="flex shrink-0 items-center gap-3 border-b border-black/10 px-4 py-3 pt-safe"
            style={{ backgroundColor: "var(--mt-surface)" }}
          >
            <button
              type="button"
              className="rounded-lg px-2 py-1.5 text-sm font-semibold"
              style={{ color: "var(--mt-primary)" }}
              onClick={() => onMenuViewChange?.("browse")}
            >
              ← {t("cart_back_menu")}
            </button>
            <h2 className="text-lg font-bold">{t("cart_screen_title")}</h2>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 py-2">
            <div
              className="rounded-2xl border border-black/10 bg-[var(--mt-surface)] shadow-lg"
              style={{ color: "var(--mt-text)" }}
            >
              {cartLineBlocks}
            </div>
            {!ordersAllowed && ordersClosedHint ? (
              <p className="rounded-lg bg-amber-100 px-2 py-2 text-center text-xs text-amber-800">
                {ordersClosedHint}
              </p>
            ) : null}
          </div>
          <div className="shrink-0 border-t border-black/10 p-3" style={{ backgroundColor: "var(--mt-surface)" }}>
            <button
              type="button"
              onClick={() => ordersAllowed && onCheckout()}
              disabled={!ordersAllowed}
              className="flex w-full items-center justify-between p-4 font-bold text-white shadow-xl active:scale-[0.99] disabled:opacity-50"
              style={{
                backgroundColor: "var(--mt-primary)",
                borderRadius: th.radius === "full" ? "9999px" : "1rem",
              }}
            >
              <span className="flex items-center gap-3">
                <ShoppingCart size={22} />
                {cart.length} · ₼{cart.reduce((s, l) => s + Number(l.unitPrice), 0).toFixed(2)}
              </span>
              <span className="flex items-center gap-1">
                {t("order_via_whatsapp")}
                <ChevronRight size={20} />
              </span>
            </button>
          </div>
        </div>
      ) : null}

      {!showFullCart ? (
        <>
      <header>
        {headerLayout === "split" ? (
          <div
            className={cn(
              "relative flex flex-col md:flex-row md:min-h-[44vh] overflow-hidden",
              th.heroVariant === "wave" && "rounded-b-[2.5rem]"
            )}
          >
            <div className="relative md:w-1/2 min-h-[36vh] md:min-h-[44vh]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImageSrc})` }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom, rgba(0,0,0,${th.overlayPercent / 200}) 0%, rgba(0,0,0,${th.overlayPercent / 100}) 100%)`,
                }}
              />
              {patternOverlay}
              <div className="absolute top-3 right-3 z-10">{langSelect}</div>
            </div>
            <div
              className="relative md:w-1/2 flex flex-col justify-center px-5 py-8 md:py-12 text-[var(--mt-text)]"
              style={{ backgroundColor: "var(--mt-bg)" }}
            >
              <div
                className={cn(
                  "w-20 h-20 md:w-24 md:h-24 border-4 border-[var(--mt-primary)]/30 shadow-xl overflow-hidden bg-[var(--mt-surface)] flex items-center justify-center mx-auto md:mx-0 mb-4",
                  "rounded-2xl"
                )}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Utensils className="w-9 h-9 opacity-70 text-[var(--mt-primary)]" aria-hidden />
                )}
              </div>
              <h1
                className={cn(
                  "text-2xl sm:text-3xl tracking-tight text-center md:text-left",
                  th.headingWeight
                )}
                style={{ fontFamily: fonts.heading }}
              >
                {name}
              </h1>
              <p className="mt-2 text-sm text-[var(--mt-muted)] text-center md:text-left line-clamp-3">
                {tagline}
              </p>
              <div className="mt-4 [&_a]:text-[var(--mt-text)] [&_svg]:text-[var(--mt-primary)]">
                {socialRow}
              </div>
            </div>
          </div>
        ) : headerLayout === "side" ? (
          <div
            className={cn(
              "relative overflow-hidden",
              heroH,
              th.heroVariant === "wave" && "rounded-b-[2.5rem]"
            )}
          >
            <div
              className="absolute inset-0 bg-cover bg-center scale-105"
              style={{ backgroundImage: `url(${heroImageSrc})` }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, rgba(0,0,0,${th.overlayPercent / 120}) 0%, rgba(0,0,0,${th.overlayPercent / 90}) 100%)`,
              }}
            />
            {patternOverlay}
            <div className="relative z-10 p-4 pt-safe flex flex-row gap-4 items-start">
              <div className="shrink-0 flex flex-col items-center gap-3">
                <div className="flex justify-end w-full md:hidden">{langSelect}</div>
                <div
                  className={cn(
                    "w-24 h-24 sm:w-28 sm:h-28 border-4 border-white/90 shadow-2xl overflow-hidden bg-[var(--mt-surface)] flex items-center justify-center",
                    "rounded-2xl"
                  )}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Utensils className="w-10 h-10 opacity-70" aria-hidden />
                  )}
                </div>
                <div className="hidden md:block w-full">{socialRow}</div>
              </div>
              <div className="flex-1 min-w-0 text-white pt-1">
                <div className="flex justify-end mb-2 hidden md:flex">{langSelect}</div>
                <h1
                  className={cn("text-2xl sm:text-3xl tracking-tight drop-shadow-md", th.headingWeight)}
                  style={{ fontFamily: fonts.heading }}
                >
                  {name}
                </h1>
                <p className="mt-2 text-sm text-white/85 drop-shadow line-clamp-3">{tagline}</p>
                <div className="md:hidden mt-4">{socialRow}</div>
              </div>
            </div>
          </div>
        ) : headerLayout === "full-hero" ? (
          <div className="relative">
            <div className={cn("relative overflow-hidden min-h-[52vh]", th.heroVariant === "wave" && "rounded-b-[2.5rem]")}>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroImageSrc})` }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,${th.overlayPercent / 140}) 100%)`,
                }}
              />
              {patternOverlay}
              <div className="relative z-10 flex justify-end p-4 pt-safe">{langSelect}</div>
              <div className="relative z-10 flex flex-col items-center justify-end min-h-[40vh] px-4 pb-6 text-center text-white">
                <div
                  className={cn(
                    "-mb-10 w-28 h-28 sm:w-32 sm:h-32 border-4 border-white shadow-2xl overflow-hidden bg-[var(--mt-surface)] flex items-center justify-center rounded-full z-20"
                  )}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Utensils className="w-12 h-12 opacity-70" aria-hidden />
                  )}
                </div>
              </div>
            </div>
            <div
              className="relative z-10 px-4 pt-14 pb-6 text-center border-b border-black/5"
              style={{ backgroundColor: "var(--mt-bg)" }}
            >
              <h1
                className={cn("text-2xl sm:text-3xl tracking-tight text-[var(--mt-text)]", th.headingWeight)}
                style={{ fontFamily: fonts.heading }}
              >
                {name}
              </h1>
              <p className="mt-2 text-sm text-[var(--mt-muted)] line-clamp-2 max-w-lg mx-auto">{tagline}</p>
              <div className="mt-5">{socialRow}</div>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "relative overflow-hidden",
              heroH,
              th.heroVariant === "wave" && "rounded-b-[2.5rem]"
            )}
          >
            <div
              className="absolute inset-0 bg-cover bg-center scale-105"
              style={{
                backgroundImage: `url(${heroImageSrc})`,
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, rgba(0,0,0,${th.overlayPercent / 200}) 0%, rgba(0,0,0,${th.overlayPercent / 100}) 100%)`,
              }}
            />
            {patternOverlay}

            <div className="relative z-10 h-full flex flex-col justify-between p-4 pt-safe">
              <div className="flex justify-end">{langSelect}</div>

              <div
                className={cn(
                  "flex flex-col items-center text-center text-white",
                  th.heroVariant === "split" && "sm:flex-row sm:text-center sm:justify-center sm:gap-6"
                )}
              >
                <div
                  className={cn(
                    "w-24 h-24 sm:w-28 sm:h-28 border-4 border-white/90 shadow-2xl overflow-hidden bg-[var(--mt-surface)] flex items-center justify-center",
                    "rounded-full"
                  )}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Utensils className="w-10 h-10 opacity-70" aria-hidden />
                  )}
                </div>
                <div className="mt-4 sm:mt-0">
                  <h1
                    className={cn(
                      "text-2xl sm:text-3xl tracking-tight drop-shadow-md",
                      th.headingWeight
                    )}
                    style={{ fontFamily: fonts.heading }}
                  >
                    {name}
                  </h1>
                  <p className="mt-1 text-sm text-white/85 max-w-md mx-auto drop-shadow line-clamp-2">
                    {tagline}
                  </p>
                </div>
              </div>

              {socialRow}
            </div>
          </div>
        )}
      </header>

      <main id="main-menu">
        <nav
          aria-label="Menu categories"
          className={cn(
            "sticky top-0 z-40 backdrop-blur-lg border-b border-black/5",
            th.categoryNav === "scroll" && "overflow-x-auto scrollbar-hide"
          )}
          style={{ backgroundColor: `${th.background}ee` }}
        >
          <div
            className={cn(
              "flex gap-2 px-3 py-3",
              th.categoryNav === "scroll" && "w-max min-w-full sm:justify-center flex-nowrap",
              th.categoryNav !== "scroll" && "flex-wrap justify-center"
            )}
          >
            {categories.map((cat) => (
              <React.Fragment key={cat.id as number}>
                <CategoryButton
                  cat={cat}
                  active={Number(cat.id) === Number(activeCategory)}
                />
              </React.Fragment>
            ))}
          </div>
        </nav>

        <section
          aria-label="Menu items"
          className={cn(
            "px-3 sm:px-4 py-4",
            productLayout === "grid" && "grid grid-cols-1 sm:grid-cols-2 gap-3",
            productLayout === "card" && "grid grid-cols-1 sm:grid-cols-2 gap-4",
            productLayout === "slider" &&
              "flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-1 px-1 scrollbar-hide scroll-smooth",
            productLayout === "list" && "space-y-3"
          )}
        >
          {filteredProducts.map((prod) => renderProductArticle(prod, productLayout))}
        </section>
      </main>

      {allowWa && th.showFab && waOrderUrl && (
        cart.length > 0 ? (
          <button
            ref={fabRef}
            type="button"
            onClick={() =>
              ordersAllowed &&
              (menuView === "browse" ? onMenuViewChange?.("cart") : onCheckout())
            }
            className={cn(
              "fixed bottom-24 right-4 z-50 w-14 h-14 flex items-center justify-center text-white shadow-2xl active:scale-95 transition-transform",
              RADIUS_MAP.full,
              !ordersAllowed && "opacity-50"
            )}
            style={{ backgroundColor: "#22c55e" }}
            aria-label={t("nav_cart")}
          >
            <ShoppingCart size={26} />
          </button>
        ) : (
          <a
            href={waOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "fixed bottom-24 right-4 z-50 w-14 h-14 flex items-center justify-center text-white shadow-2xl active:scale-95 transition-transform",
              RADIUS_MAP.full
            )}
            style={{ backgroundColor: "#22c55e" }}
            aria-label="WhatsApp"
          >
            <MessageCircle size={26} />
          </a>
        )
      )}

      {th.showBottomNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-[var(--mt-surface)]/95 backdrop-blur flex justify-around py-2 pb-safe"
          aria-label="Bottom navigation"
        >
          <a href={`#main-menu`} className="flex flex-col items-center text-[10px] text-[var(--mt-muted)]">
            <Utensils size={22} style={{ color: "var(--mt-primary)" }} />
            {t("nav_menu")}
          </a>
          <a href={mapsUrl || "#"} className="flex flex-col items-center text-[10px] text-[var(--mt-muted)]">
            <MapPin size={22} />
            {t("nav_map")}
          </a>
          <a
            href={allowWa ? waOrderUrl || "#" : "#main-menu"}
            className="flex flex-col items-center text-[10px] text-[var(--mt-muted)]"
          >
            <MessageCircle size={22} className="text-green-600" />
            {t("nav_order")}
          </a>
          <button
            ref={navCartRef}
            type="button"
            onClick={() =>
              allowWa &&
              ordersAllowed &&
              (cart.length > 0 ? onMenuViewChange?.("cart") : onCheckout())
            }
            className="flex flex-col items-center text-[10px] text-[var(--mt-muted)]"
          >
            <ShoppingCart size={22} />
            {t("nav_cart")}
          </button>
        </nav>
      )}

      <AnimatePresence>
        {showCompactCartDrawer && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className={cn("fixed z-[60] left-3 right-3 max-h-[55vh] flex flex-col gap-2", th.showBottomNav ? "bottom-16" : "bottom-4")}
          >
            <div className="flex justify-end px-1">
              <button
                type="button"
                className="text-[11px] font-semibold underline opacity-80"
                style={{ color: "var(--mt-primary)" }}
                onClick={() => onMenuViewChange?.("cart")}
              >
                {t("cart_open_full")}
              </button>
            </div>
            <div
              className="rounded-2xl border border-black/10 overflow-hidden flex flex-col max-h-[40vh] bg-[var(--mt-surface)] shadow-xl"
              style={{ color: "var(--mt-text)" }}
            >
              <div className="overflow-y-auto divide-y divide-black/5">{cartLineBlocks}</div>
            </div>
            {!ordersAllowed && ordersClosedHint ? (
              <p className="text-center text-xs px-2 text-amber-800 bg-amber-100 rounded-lg py-2">
                {ordersClosedHint}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => ordersAllowed && onCheckout()}
              disabled={!ordersAllowed}
              className="w-full flex justify-between items-center text-white p-4 shadow-2xl active:scale-[0.99] transition-transform font-bold disabled:opacity-50"
              style={{
                backgroundColor: "var(--mt-primary)",
                borderRadius: th.radius === "full" ? "9999px" : undefined,
              }}
            >
              <span className="flex items-center gap-3">
                <ShoppingCart size={22} />
                {cart.length} · ₼
                {cart.reduce((s, l) => s + Number(l.unitPrice), 0).toFixed(2)}
              </span>
              <span className="flex items-center gap-1">
                {t("order_via_whatsapp")}
                <ChevronRight size={20} />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      ) : null}

      <AnimatePresence>
        {variantPick ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setVariantPick(null)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              className="w-full max-w-md rounded-2xl p-4 shadow-2xl"
              style={{ backgroundColor: "var(--mt-surface)", color: "var(--mt-text)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-bold mb-3">{String(variantPick.name)}</p>
              <p className="text-xs text-[var(--mt-muted)] mb-2">Ölçü / çeşid seçin</p>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {variantsOf(variantPick).map((v) => (
                  <button
                    key={String(v.id)}
                    type="button"
                    className="w-full flex justify-between p-3 rounded-xl border border-black/10 text-left"
                    onClick={(e) => pickVariant(variantPick, v, e)}
                  >
                    <span>{String(v.name)}</span>
                    <span className="font-bold">{formatPrice(v.price)}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="mt-3 w-full py-2 text-sm text-[var(--mt-muted)]"
                onClick={() => setVariantPick(null)}
              >
                Bağla
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
