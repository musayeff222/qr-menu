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
  Minus,
  ShoppingCart,
  ChevronRight,
  Utensils,
  Facebook,
  Clock3,
  Trash2,
  House,
  History,
  Search,
} from "lucide-react";
import type { MenuTemplateDef } from "./types";
import type { FontPairKey } from "./types";
import { cn } from "./cn";
import { productCardSkin, templateRootSkin } from "./templateSkin";

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
  quantity: number;
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
    note?: string;
  }) => void;
  updateCartLineNote: (lineId: string, note: string) => void;
  increaseCartLineQty: (lineId: string) => void;
  decreaseCartLineQty: (lineId: string) => void;
  removeCartLine: (lineId: string) => void;
  onCheckout: () => void;
  onOpenOrders?: () => void;
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
  demoMode?: boolean;
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
  demoMode = false,
}: MenuTemplateViewProps) {
  const allowWa = planFeatures?.whatsapp_order !== false;
  const allowRes = planFeatures?.reservation !== false;
  const fabRef = useRef<HTMLButtonElement | null>(null);
  const navCartRef = useRef<HTMLButtonElement | null>(null);
  const [fly, setFly] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(
    null
  );
  const [cartPulse, setCartPulse] = useState(0);

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
  const playAddedSound = () => {
    try {
      const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(620, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.08);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.11);
      window.setTimeout(() => {
        void ctx.close();
      }, 160);
    } catch {
      /* sound is optional */
    }
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
  const facebook = restaurant.facebook ? String(restaurant.facebook) : "";
  const coverUrl = restaurant.cover_image_url ? String(restaurant.cover_image_url) : "";
  const heroImageSrc = coverUrl || template.heroImage;
  const headerLayout = th.headerLayout ?? "centered";
  const productLayout = th.productLayout ?? "list";
  const iconStyle = th.iconStyle ?? "rounded";
  const rm = th.renderMode ?? "";
  const storyCategories = rm === "story-mode-menu";
  const useSidebarNav = rm === "sidebar-menu-style";
  const instagramGrid = rm === "instagram-feed-menu";
  const tiktokVertical = rm === "tiktok-vertical-menu";
  const fullImageBgMenu = rm === "full-image-background-menu";
  const icon3d = rm === "icon-3d-ui";
  const fastFoodMode = rm === "fastfood-pro";
  const mega2Mode = rm === "mega2-kinetic";
  const mediaAssets = Array.isArray(restaurant.media_assets)
    ? (restaurant.media_assets as Array<{ id: number; kind: string; url: string }>)
    : [];
  const bannerAssets = mediaAssets.length
    ? mediaAssets
    : [
        { id: 1, kind: "image", url: heroImageSrc },
        { id: 2, kind: "image", url: template.heroImage },
      ];
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    if (!fastFoodMode || bannerAssets.length <= 1) return;
    const intv = window.setInterval(() => {
      setBannerIdx((i) => (i + 1) % bannerAssets.length);
    }, 3600);
    return () => window.clearInterval(intv);
  }, [fastFoodMode, bannerAssets.length]);

  const pulseCart = () => setCartPulse((n) => n + 1);

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

  const fonts = th.customFonts ?? FONT_STACKS[th.fontPair];

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
    const base =
      "flex flex-col items-center justify-center active:scale-95 transition-transform motion-safe:transition-transform";
    const lift3d = icon3d
      ? "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45)] sm:hover:-translate-y-1 sm:hover:shadow-xl"
      : "";
    switch (iconStyle) {
      case "line":
        return cn(
          base,
          lift3d,
          "w-12 h-12 sm:w-14 sm:h-14 border-2 border-[var(--mt-primary)] bg-transparent text-[var(--mt-primary)] shadow-none rounded-2xl"
        );
      case "filled":
        return cn(
          base,
          lift3d,
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
          lift3d,
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
  const [noteModalLineId, setNoteModalLineId] = useState<string | null>(null);
  const [noteModalDraft, setNoteModalDraft] = useState("");

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
    playAddedSound();
    const pid = Number(prod.id);
    addToCart({
      product: prod,
      unitPrice: Number(prod.price),
      note: "",
    });
    pulseCart();
  };

  const pickVariant = (
    prod: Record<string, unknown>,
    v: Record<string, unknown>,
    e?: React.MouseEvent
  ) => {
    if (e) triggerFly(e.clientX, e.clientY);
    playAddedSound();
    const pid = Number(prod.id);
    addToCart({
      product: prod,
      variantId: Number(v.id),
      variantLabel: String(v.name),
      unitPrice: Number(v.price),
      note: "",
    });
    pulseCart();
    setVariantPick(null);
  };

  const socialRow = fastFoodMode ? (
    <nav aria-label="Quick actions" className="flex flex-wrap justify-center gap-6">
      <a href={instagram || "https://instagram.com"} target="_blank" rel="noopener noreferrer" className="text-pink-600">
        <Instagram size={24} />
      </a>
      <a href={tiktok || "https://tiktok.com"} target="_blank" rel="noopener noreferrer" className="text-slate-900">
        <Music2 size={24} />
      </a>
      <a href={facebook || "https://facebook.com"} target="_blank" rel="noopener noreferrer" className="text-blue-600">
        <Facebook size={24} />
      </a>
      <a href={phone ? `tel:${phone.replace(/\s/g, "")}` : "tel:+994501112233"} className="text-slate-700">
        <Phone size={24} />
      </a>
    </nav>
  ) : (
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
      <ActionBtn href={facebook} label="Facebook">
        <Facebook size={20} />
      </ActionBtn>
      {!instagram && !tiktok && !facebook && !phone ? (
        <>
          <ActionBtn href="https://instagram.com" label="Instagram demo">
            <Instagram size={20} />
          </ActionBtn>
          <ActionBtn href="https://tiktok.com" label="TikTok demo">
            <Music2 size={20} />
          </ActionBtn>
          <ActionBtn href="https://facebook.com" label="Facebook demo">
            <Facebook size={20} />
          </ActionBtn>
          <ActionBtn href="tel:+994501112233" label="Telefon demo">
            <Phone size={20} />
          </ActionBtn>
        </>
      ) : null}
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
    const layoutEff: typeof layout = tiktokVertical ? "list" : layout;
    const pname =
      ((prod.translations as Record<string, { name?: string }> | undefined)?.[currentLang]?.name) ||
      String(prod.name);
    const pdesc =
      ((prod.translations as Record<string, { desc?: string }> | undefined)?.[currentLang]?.desc) ||
      String(prod.description ?? "");
    const img = prod.image_url ? String(prod.image_url) : "";
    const vars = variantsOf(prod);
    const pid = Number(prod.id);
    const showFrom = vars.length > 0;
    const innerAdd = allowWa ? (
      <motion.button
        type="button"
        onClick={(e) => handleAddProduct(prod, e)}
        disabled={!ordersAllowed}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.04 }}
        className={cn(
          "w-10 h-10 flex items-center justify-center text-white shadow-md shrink-0 relative overflow-hidden",
          "before:absolute before:inset-0 before:rounded-[inherit] before:bg-white/20 before:scale-0 before:opacity-0",
          "hover:before:scale-150 hover:before:opacity-30 before:transition before:duration-500",
          !ordersAllowed && "opacity-40 pointer-events-none",
          RADIUS_MAP.full
        )}
        style={{ backgroundColor: "var(--mt-primary)" }}
        aria-label={`${t("add_product")} ${pname}`}
      >
        <Plus size={20} className="relative z-10" />
      </motion.button>
    ) : null;

    if (mega2Mode) {
      return (
        <motion.article
          key={prod.id as number}
          layout
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20px" }}
          className="group relative"
        >
          <div className="rounded-[2rem] bg-white p-6 shadow-[0_24px_48px_rgba(156,63,0,0.08)] transition-transform duration-300 group-hover:-translate-y-1">
            <div className="relative mb-5 h-56 overflow-hidden rounded-[2rem] sm:h-64">
              {img ? (
                <img
                  src={img}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
            </div>
            <h2 className="text-xl font-bold leading-tight text-[var(--mt-text)]" style={{ fontFamily: fonts.heading }}>
              {pname}
            </h2>
            {pdesc ? <p className="mt-1 text-sm text-[var(--mt-muted)] line-clamp-2">{pdesc}</p> : null}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-2xl font-black text-orange-600">
                {showFrom ? `${t("price_from")} ${formatPrice(displayMinPrice(prod))}` : formatPrice(prod.price)}
              </span>
              {allowWa ? (
                <motion.button
                  type="button"
                  onClick={(e) => handleAddProduct(prod, e)}
                  disabled={!ordersAllowed}
                  whileTap={{ scale: 0.92 }}
                  className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[var(--mt-primary)] to-[var(--mt-accent)] text-white shadow-lg"
                >
                  <Plus size={20} />
                </motion.button>
              ) : null}
            </div>
          </div>
        </motion.article>
      );
    }

    if (fastFoodMode) {
      return (
        <motion.article
          key={prod.id as number}
          layout
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-24px" }}
          className="flex flex-col rounded-3xl border border-gray-100 bg-white p-3 shadow-sm"
        >
          <div className="mb-3 h-32 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--mt-secondary)] to-[var(--mt-primary)]/20">
            {img ? (
              <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            ) : null}
          </div>
          <h2 className="text-sm font-bold text-slate-800 line-clamp-2" style={{ fontFamily: fonts.heading }}>
            {pname}
          </h2>
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-base font-black text-red-500">
              {showFrom ? (
                <>
                  {t("price_from")} {formatPrice(displayMinPrice(prod))}
                </>
              ) : (
                formatPrice(prod.price)
              )}
            </span>
            {allowWa ? (
              <motion.button
                type="button"
                onClick={(e) => handleAddProduct(prod, e)}
                disabled={!ordersAllowed}
                whileTap={{ scale: 0.9 }}
                className="rounded-xl bg-orange-500 p-2 text-white shadow active:scale-90 disabled:opacity-40"
              >
                <Plus size={18} />
              </motion.button>
            ) : null}
          </div>
        </motion.article>
      );
    }

    const imgBox = (aspectCls: string) => (
      <motion.div
        className={cn(
          aspectCls,
          "w-full overflow-hidden bg-gradient-to-br from-[var(--mt-secondary)] to-[var(--mt-primary)]/30",
          pir
        )}
        whileHover={{ scale: instagramGrid ? 1.03 : 1.06 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
      >
        {img ? (
          <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        ) : null}
      </motion.div>
    );

    if (layoutEff === "card") {
      return (
        <motion.article
          key={prod.id as number}
          layout
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-32px" }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "flex flex-col overflow-hidden",
            fixCard,
            productCardSkin(th.renderMode),
            th.cardStyle === "glass" && "bg-[var(--mt-surface)]/80"
          )}
          style={th.cardStyle === "glass" ? undefined : { backgroundColor: "var(--mt-surface)" }}
        >
          {imgBox(instagramGrid ? "aspect-square max-h-44" : "aspect-[4/3]")}
          <div className={cn("flex flex-col flex-1", densityPad)}>
            <h2
              className={cn(
                instagramGrid ? "text-xs sm:text-sm" : "text-base sm:text-lg",
                "leading-tight",
                th.headingWeight
              )}
              style={{ fontFamily: fonts.heading }}
            >
              {pname}
            </h2>
            {pdesc ? (
              <p
                className={cn(
                  instagramGrid ? "text-[10px] line-clamp-2" : "text-xs sm:text-sm line-clamp-3",
                  "mt-1 flex-1"
                )}
                style={{ color: "var(--mt-muted)" }}
              >
                {pdesc}
              </p>
            ) : null}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5">
              <span className="font-bold text-lg" style={{ color: "var(--mt-primary)" }}>
                {showFrom ? (
                  <>
                    {t("price_from")} {formatPrice(displayMinPrice(prod))}
                  </>
                ) : (
                  formatPrice(prod.price)
                )}
              </span>
              {innerAdd}
            </div>
          </div>
        </motion.article>
      );
    }

    if (layoutEff === "grid") {
      return (
        <motion.article
          key={prod.id as number}
          layout
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-28px" }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className={cn(
            "flex flex-col gap-2",
            fixCard,
            densityPad,
            productCardSkin(th.renderMode),
            th.cardStyle === "glass" && "bg-[var(--mt-surface)]/80"
          )}
          style={th.cardStyle === "glass" ? undefined : { backgroundColor: "var(--mt-surface)" }}
        >
          {imgBox("w-full aspect-square max-h-36")}
          <h2
            className={cn("text-sm font-semibold leading-tight line-clamp-2", th.headingWeight)}
            style={{ fontFamily: fonts.heading }}
          >
            {pname}
          </h2>
          <div className="flex items-center justify-between gap-2 mt-auto">
            <span className="font-bold" style={{ color: "var(--mt-primary)" }}>
              {showFrom ? (
                <>
                  {t("price_from")} {formatPrice(displayMinPrice(prod))}
                </>
              ) : (
                formatPrice(prod.price)
              )}
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
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-32px" }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "flex",
          tiktokVertical ? "flex-col gap-3" : "flex-row gap-3 sm:gap-4",
          fixCard,
          densityPad,
          productCardSkin(th.renderMode),
          layoutEff === "slider" && "min-w-[min(88vw,320px)] snap-start shrink-0",
          th.cardStyle === "glass" && "bg-[var(--mt-surface)]/80"
        )}
        style={th.cardStyle === "glass" ? undefined : { backgroundColor: "var(--mt-surface)" }}
      >
        {tiktokVertical ? (
          imgBox("w-full aspect-[9/16] max-h-[min(72vh,520px)]")
        ) : (
          <motion.div
            className={cn(
              "w-24 h-24 sm:w-28 sm:h-28 shrink-0 overflow-hidden bg-gradient-to-br from-[var(--mt-secondary)] to-[var(--mt-primary)]/30",
              pir
            )}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
          >
            {img ? (
              <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            ) : null}
          </motion.div>
        )}
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
              {showFrom ? (
                <>
                  {t("price_from")} {formatPrice(displayMinPrice(prod))}
                </>
              ) : (
                formatPrice(prod.price)
              )}
            </span>
            {innerAdd}
          </div>
        </div>
      </motion.article>
    );
  };

  const showFullCart = allowWa && cart.length > 0 && menuView === "cart";
  const showCompactCartDrawer = false;
  const cartCount = cart.reduce((s, l) => s + Number(l.quantity || 1), 0);
  const cartTotal = cart.reduce((s, l) => s + Number(l.unitPrice) * Number(l.quantity || 1), 0);

  const cartLineBlocks = cart.map((line) => {
    const tr = line.product.translations as Record<string, { name?: string }> | undefined;
    const pn = tr?.[currentLang]?.name || String(line.product.name ?? "");
    const label = line.variantLabel ? `${line.variantLabel} · ${pn}` : pn;
    return (
      <div key={line.lineId} className="p-3 text-sm space-y-2 border-b border-black/5">
        <div className="flex justify-between gap-2 items-start">
          <span className="font-medium line-clamp-2">{label}</span>
          <span className="font-bold shrink-0">₼{(Number(line.unitPrice) * Number(line.quantity || 1)).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 px-2 py-1">
            <button
              type="button"
              className="h-6 w-6 rounded-full bg-black/5 grid place-items-center"
              onClick={() => decreaseCartLineQty(line.lineId)}
            >
              <Minus size={14} />
            </button>
            <span className="min-w-5 text-center text-xs font-semibold">{Number(line.quantity || 1)}</span>
            <button
              type="button"
              className="h-6 w-6 rounded-full bg-black/5 grid place-items-center"
              onClick={() => increaseCartLineQty(line.lineId)}
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            type="button"
            className="text-red-600"
            onClick={() => removeCartLine(line.lineId)}
            aria-label={t("cart_remove_line")}
          >
            <Trash2 size={16} />
          </button>
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
        <button
          type="button"
          className="w-full text-left text-xs p-2 rounded-lg border border-black/10 bg-transparent hover:bg-black/5"
          onClick={() => {
            setNoteModalLineId(line.lineId);
            setNoteModalDraft(line.note || "");
          }}
        >
          {line.note?.trim() ? `Qeyd: ${line.note}` : "Qeyd əlavə et"}
        </button>
      </div>
    );
  });

  const fastFoodCartLineBlocks = cart.map((line) => {
    const tr = line.product.translations as Record<string, { name?: string }> | undefined;
    const pn = tr?.[currentLang]?.name || String(line.product.name ?? "");
    const label = line.variantLabel ? `${line.variantLabel} · ${pn}` : pn;
    return (
      <motion.div
        key={line.lineId}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800">{label}</h4>
            <p className="text-xs font-bold text-red-500">₼{Number(line.unitPrice).toFixed(2)}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 font-bold"
              onClick={() => decreaseCartLineQty(line.lineId)}
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-bold">{Number(line.quantity || 1)}</span>
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-full bg-slate-800 text-white font-bold"
              onClick={() => increaseCartLineQty(line.lineId)}
            >
              <Plus size={14} />
            </button>
            <button
              type="button"
              className="ml-1 text-gray-400 hover:text-red-600"
              onClick={() => removeCartLine(line.lineId)}
              aria-label={t("cart_remove_line")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        <button
          type="button"
          className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-xs text-slate-600"
          onClick={() => {
            setNoteModalLineId(line.lineId);
            setNoteModalDraft(line.note || "");
          }}
        >
          {line.note?.trim() ? `Qeyd: ${line.note}` : "Qeyd əlavə et"}
        </button>
      </motion.div>
    );
  });

  return (
    <div
      id="menu-template-root"
      className={cn(
        "mt-menu min-h-screen pb-28 antialiased relative",
        templateRootSkin(th.renderMode),
        fullImageBgMenu && "min-h-[120vh]"
      )}
      style={{
        ...cssVars,
        backgroundColor:
          fastFoodMode ? "#f1f2f6" : mega2Mode ? "#f9f6f5" : fullImageBgMenu ? "transparent" : "var(--mt-bg)",
        color: "var(--mt-text)",
        fontFamily: fonts.body,
      }}
    >
      {fullImageBgMenu ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 opacity-[0.22] bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${heroImageSrc})` }}
        />
      ) : null}
      {!fullImageBgMenu ? null : (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[var(--mt-bg)] via-[var(--mt-bg)]/88 to-[var(--mt-bg)]"
        />
      )}
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
            className="pointer-events-none fixed z-[320] h-7 w-7 rounded-full bg-emerald-500/90 shadow-xl grid place-items-center text-white text-[10px] font-black"
            initial={{ left: fly.x0, top: fly.y0, opacity: 1, scale: 1 }}
            animate={{ left: fly.x1, top: fly.y1, opacity: 0.1, scale: 0.25, rotate: 18 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.52, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ position: "fixed" }}
          >
            +
          </motion.div>
        ) : null}
      </AnimatePresence>

      {showFullCart ? (
        <div
          className="fixed inset-0 z-[55] flex flex-col pb-safe"
          style={{
            backgroundColor: fastFoodMode ? "#f1f2f6" : mega2Mode ? "#f9f6f5" : "var(--mt-bg)",
            color: "var(--mt-text)",
          }}
        >
          {mega2Mode ? (
            <>
              <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-[var(--mt-bg)]/60 px-6 py-4 backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => onMenuViewChange?.("browse")}
                  className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm active:scale-95"
                >
                  <ChevronRight size={18} className="rotate-180 text-[var(--mt-primary)]" />
                </button>
                <h2 className="text-xl font-extrabold">Səbətiniz</h2>
                <div className="h-12 w-12" />
              </div>
              <div className="mt-20 flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-40">
                <div className="space-y-4">{cartLineBlocks}</div>
              </div>
              <div className="fixed bottom-0 left-0 right-0 rounded-t-[3rem] bg-white/70 px-6 pb-10 pt-6 backdrop-blur-2xl">
                <div className="mx-auto max-w-2xl space-y-3">
                  <div className="flex items-center justify-between px-1 text-sm text-[var(--mt-muted)]">
                    <span>Cəmi</span>
                    <span>₼{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between px-1 pt-1">
                    <span className="text-2xl font-extrabold">Yekun</span>
                    <span className="text-2xl font-extrabold text-[var(--mt-primary)]">₼{cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => ordersAllowed && onCheckout()}
                    disabled={!ordersAllowed}
                    className="mt-2 flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-br from-[var(--mt-primary)] to-[var(--mt-accent)] py-5 text-lg font-extrabold text-white shadow-[0_24px_48px_rgba(156,63,0,0.25)] disabled:opacity-50"
                  >
                    Ödənişə davam et
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : fastFoodMode ? (
            <>
              <div className="flex items-center px-6 pt-8 pb-5">
                <button
                  type="button"
                  onClick={() => onMenuViewChange?.("browse")}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-md"
                >
                  <ChevronRight size={18} className="rotate-180" />
                </button>
                <h2 className="ml-4 text-2xl font-black text-slate-900">Səbətim</h2>
              </div>
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-4">
                <div className="space-y-3">{fastFoodCartLineBlocks}</div>
              </div>
              <div className="px-6 pb-24">
                <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-gray-500">Cəmi:</span>
                    <span className="text-xl font-black text-red-500">₼{cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => ordersAllowed && onCheckout()}
                    disabled={!ordersAllowed}
                    className="w-full flex items-center justify-between rounded-2xl bg-slate-900 px-6 py-4 font-bold text-white disabled:opacity-50"
                  >
                    <span>Davam et</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                className="flex shrink-0 items-center gap-3 border-b border-black/10 px-4 py-3 pt-safe"
                style={{ backgroundColor: "var(--mt-surface)" }}
              >
                <button
                  type="button"
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold border border-black/10"
                  style={{ color: "var(--mt-primary)", backgroundColor: "var(--mt-bg)" }}
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
                <div className="mb-2 text-sm font-semibold text-right">Cəmi: ₼{cartTotal.toFixed(2)}</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onMenuViewChange?.("browse")}
                    className="rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={() => ordersAllowed && onCheckout()}
                    disabled={!ordersAllowed}
                    className="flex-1 flex items-center justify-between p-4 font-bold text-white shadow-xl active:scale-[0.99] disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--mt-primary)",
                      borderRadius: th.radius === "full" ? "9999px" : "1rem",
                    }}
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingCart size={22} />
                      {cartCount} · ₼{cartTotal.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1">
                      Sifarişi ver
                      <ChevronRight size={20} />
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
          {(fastFoodMode || mega2Mode) && !ordersAllowed && ordersClosedHint ? (
            <p className="px-6 pb-3 text-center text-xs text-amber-800">{ordersClosedHint}</p>
          ) : null}
        </div>
      ) : null}

      {!showFullCart ? (
        <>
      <header>
        {mega2Mode ? (
          <div className="relative overflow-hidden">
            <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-[var(--mt-bg)]/60 px-6 py-4 backdrop-blur-xl shadow-[0_24px_48px_rgba(156,63,0,0.08)]">
              <span className="text-2xl font-black italic tracking-tight text-orange-600">Kinetic Gourmet</span>
              <button
                ref={navCartRef}
                type="button"
                onClick={() => allowWa && ordersAllowed && cart.length > 0 && onMenuViewChange?.("cart")}
                className="relative text-orange-600"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 ? (
                  <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
            <div className="relative mt-16 h-[54vh] overflow-hidden">
              <img src={heroImageSrc} alt="" className="h-full w-full scale-105 object-cover brightness-75" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--mt-bg)]/90" />
            </div>
            <section className="relative -mt-20 px-6 pb-8 text-center">
              <h1 className="text-5xl font-black italic tracking-tighter text-[var(--mt-text)] sm:text-7xl">{name}</h1>
              <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-[var(--mt-muted)] sm:text-base">{tagline}</p>
              {restaurant.opening_hours ? (
                <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-[var(--mt-surface)] px-4 py-2 text-xs font-semibold text-[var(--mt-muted)]">
                  <Clock3 size={14} /> {String(restaurant.opening_hours)}
                </div>
              ) : null}
              <div className="mt-5">{socialRow}</div>
            </section>
          </div>
        ) : fastFoodMode ? (
          <div className="relative overflow-hidden border-b border-black/10">
            <div className="absolute right-3 top-3 z-20">{langSelect}</div>
            <div className="relative h-64 sm:h-72">
              {bannerAssets.map((asset, idx) => (
                <div
                  key={asset.id}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    idx === bannerIdx ? "opacity-100" : "opacity-0"
                  )}
                >
                  {String(asset.kind) === "video" ? (
                    <video
                      src={asset.url}
                      className="h-full w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img src={asset.url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {bannerAssets.map((asset, idx) => (
                  <span
                    key={`dot-${asset.id}`}
                    className={cn("h-2 w-2 rounded-full", idx === bannerIdx ? "bg-white" : "bg-white/50")}
                  />
                ))}
              </div>
            </div>
            <div className="bg-[var(--mt-surface)] px-4 pb-6 pt-5 text-center">
              <h1
                className={cn("text-4xl tracking-tighter italic", th.headingWeight)}
                style={{ fontFamily: fonts.heading }}
              >
                {name}
              </h1>
              {restaurant.opening_hours ? (
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--mt-muted)]">
                  <Clock3 size={14} />
                  {String(restaurant.opening_hours)}
                </div>
              ) : null}
              <div className="mt-4">{socialRow}</div>
            </div>
          </div>
        ) : headerLayout === "split" ? (
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
        ) : fastFoodMode ? (
          <nav
            aria-label="Menu categories"
            className="sticky top-0 z-40 overflow-x-auto bg-white/80 px-4 py-4 backdrop-blur-md"
          >
            <div className="flex w-max min-w-full gap-3">
              {categories.map((cat) => {
                const cname =
                  ((cat.translations as Record<string, string> | undefined)?.[currentLang] as string) ||
                  String(cat.name);
                const active = Number(cat.id) === Number(activeCategory);
                return (
                  <button
                    key={cat.id as number}
                    type="button"
                    onClick={() => setActiveCategory(cat.id as number)}
                    className={cn(
                      "whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold shadow-sm transition-all",
                      active ? "text-white shadow-lg" : "bg-white text-slate-700"
                    )}
                    style={active ? { backgroundColor: "var(--mt-primary)" } : undefined}
                  >
                    {cname}
                  </button>
                );
              })}
            </div>
          </nav>
        ) : mega2Mode ? (
          <nav
            aria-label="Menu categories"
            className="mb-8 overflow-x-auto px-6 no-scrollbar"
          >
            <div className="flex w-max min-w-full gap-4">
              {categories.map((cat) => {
                const cname =
                  ((cat.translations as Record<string, string> | undefined)?.[currentLang] as string) ||
                  String(cat.name);
                const active = Number(cat.id) === Number(activeCategory);
                return (
                  <button
                    key={cat.id as number}
                    type="button"
                    onClick={() => setActiveCategory(cat.id as number)}
                    className={cn(
                      "shrink-0 rounded-full px-8 py-3 text-sm font-bold transition-colors",
                      active ? "bg-yellow-400 text-yellow-900 shadow-lg" : "bg-[var(--mt-surface)] text-[var(--mt-muted)]"
                    )}
                  >
                    {cname}
                  </button>
                );
              })}
            </div>
          </nav>
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

      <main id="main-menu" className={cn(useSidebarNav && "md:flex md:flex-row md:items-start")}>
        {useSidebarNav ? (
          <>
            <nav
              aria-label="Menu categories"
              className={cn(
                "md:hidden sticky top-0 z-40 backdrop-blur-lg border-b border-black/5",
                th.categoryNav === "scroll" && "overflow-x-auto scrollbar-hide"
              )}
              style={{ backgroundColor: `${th.background}ee` }}
            >
              <div
                className={cn(
                  "flex gap-2 px-3 py-3",
                  th.categoryNav === "scroll" && "w-max min-w-full flex-nowrap",
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
            <aside
              aria-label="Kateqoriyalar"
              className="hidden md:flex flex-col w-44 shrink-0 sticky top-0 z-30 max-h-[88vh] overflow-y-auto border-r border-black/10 dark:border-white/10 py-4 px-2 gap-1 motion-safe:scroll-smooth"
              style={{ backgroundColor: `color-mix(in srgb, ${th.surface} 94%, transparent)` }}
            >
              {categories.map((cat) => {
                const cname =
                  ((cat.translations as Record<string, string> | undefined)?.[currentLang] as string) ||
                  String(cat.name);
                const active = Number(cat.id) === Number(activeCategory);
                return (
                  <button
                    key={cat.id as number}
                    type="button"
                    onClick={() => setActiveCategory(cat.id as number)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      active
                        ? "text-white shadow-lg"
                        : "text-[var(--mt-text)] hover:bg-black/5 dark:hover:bg-white/10"
                    )}
                    style={active ? { backgroundColor: "var(--mt-primary)" } : undefined}
                  >
                    {cname}
                  </button>
                );
              })}
            </aside>
          </>
        ) : (
          <nav
            aria-label="Menu categories"
            className={cn(
              "sticky top-0 z-40 backdrop-blur-lg border-b border-black/5 mt-glass-skin",
              th.categoryNav === "scroll" && "overflow-x-auto scrollbar-hide"
            )}
            style={{ backgroundColor: `${th.background}ee` }}
          >
            {storyCategories ? (
              <div className="flex gap-4 px-3 py-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                {categories.map((cat) => {
                  const cname =
                    ((cat.translations as Record<string, string> | undefined)?.[currentLang] as string) ||
                    String(cat.name);
                  const active = Number(cat.id) === Number(activeCategory);
                  const letter = cname.trim().slice(0, 1).toUpperCase() || "?";
                  return (
                    <button
                      key={cat.id as number}
                      type="button"
                      onClick={() => setActiveCategory(cat.id as number)}
                      className="flex flex-col items-center gap-1.5 shrink-0 snap-start min-w-[4.5rem]"
                    >
                      <span
                        className={cn(
                          "w-16 h-16 rounded-full border-[3px] flex items-center justify-center text-lg font-bold shadow-lg transition-transform motion-safe:duration-200",
                          active
                            ? "border-[var(--mt-primary)] scale-105 text-white"
                            : "border-white/40 text-white/95 dark:border-white/20"
                        )}
                        style={{
                          backgroundColor: active ? "var(--mt-primary)" : "rgba(0,0,0,0.35)",
                          boxShadow: active
                            ? "0 12px 28px color-mix(in srgb, var(--mt-primary) 45%, transparent)"
                            : undefined,
                        }}
                      >
                        {letter}
                      </span>
                      <span className="text-[10px] font-semibold text-center leading-tight line-clamp-2 text-[var(--mt-text)] max-w-[4.75rem]">
                        {cname}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
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
            )}
          </nav>
        )}

        <div className={cn("flex-1 min-w-0 w-full")}>
          <section
            aria-label="Menu items"
            className={cn(
              "px-3 sm:px-4 py-4",
              fastFoodMode && "grid grid-cols-2 gap-4",
              mega2Mode && "px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10",
              instagramGrid && "grid grid-cols-3 gap-1.5 sm:gap-2",
              !instagramGrid && productLayout === "grid" && "grid grid-cols-1 sm:grid-cols-2 gap-3",
              !instagramGrid && productLayout === "card" && "grid grid-cols-1 sm:grid-cols-2 gap-4",
              !instagramGrid &&
                productLayout === "slider" &&
                "flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-1 px-1 scrollbar-hide scroll-smooth",
              !instagramGrid && productLayout === "list" && "space-y-3",
              !instagramGrid && tiktokVertical && "flex flex-col gap-5 max-w-lg mx-auto"
            )}
          >
            {filteredProducts.map((prod) => renderProductArticle(prod, productLayout))}
          </section>
        </div>
      </main>

      {allowWa && th.showFab && !fastFoodMode && !mega2Mode && waOrderUrl && (!demoMode || cart.length > 0) && (
        cart.length > 0 ? (
          <motion.button
            ref={fabRef}
            type="button"
            onClick={() => ordersAllowed && cart.length > 0 && onMenuViewChange?.("cart")}
            className={cn(
              "fixed bottom-24 right-4 z-50 w-14 h-14 flex items-center justify-center text-white shadow-2xl active:scale-95 transition-transform",
              RADIUS_MAP.full,
              !ordersAllowed && "opacity-50"
            )}
            style={{ backgroundColor: "#22c55e" }}
            aria-label={t("nav_cart")}
          >
            <motion.div
              key={`fab-${cartPulse}`}
              animate={{ rotate: [0, -9, 9, -6, 0], scale: [1, 1.12, 1] }}
              transition={{ duration: 0.45 }}
              className="relative"
            >
              <ShoppingCart size={26} />
              {cartCount > 0 ? (
                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
                  {cartCount}
                </span>
              ) : null}
            </motion.div>
          </motion.button>
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
          className={cn(
            "fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 backdrop-blur flex justify-around py-2 pb-safe",
            fastFoodMode || mega2Mode ? "bg-white/90 px-4" : "bg-[var(--mt-surface)]/95"
          )}
          aria-label="Bottom navigation"
        >
          {fastFoodMode ? (
            <>
              <a href={`#main-menu`} className="flex flex-col items-center text-[10px] text-slate-500">
                <House size={22} />
              </a>
              <button
                ref={navCartRef}
                type="button"
                onClick={() => allowWa && ordersAllowed && cart.length > 0 && onMenuViewChange?.("cart")}
                className="relative flex flex-col items-center text-[10px] text-slate-800"
              >
                <motion.div
                  key={`nav-cart-${cartPulse}`}
                  animate={{ scale: [1, 1.18, 1], rotate: [0, -7, 7, 0] }}
                  transition={{ duration: 0.38 }}
                  className="relative"
                >
                  <ShoppingCart size={22} />
                  {cartCount > 0 ? (
                    <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  ) : null}
                </motion.div>
              </button>
              <button type="button" onClick={() => onOpenOrders?.()} className="flex flex-col items-center text-[10px] text-slate-500">
                <History size={22} />
              </button>
            </>
          ) : mega2Mode ? (
            <>
              <a href={`#main-menu`} className="flex flex-col items-center text-[10px] text-slate-500">
                <Utensils size={22} />
                <span className="mt-1 font-bold uppercase tracking-widest">Menyu</span>
              </a>
              <button type="button" className="flex flex-col items-center text-[10px] text-slate-500">
                <Search size={22} />
                <span className="mt-1 font-bold uppercase tracking-widest">Axtarış</span>
              </button>
              <button type="button" onClick={() => onOpenOrders?.()} className="flex flex-col items-center text-[10px] text-orange-700">
                <History size={22} />
                <span className="mt-1 font-bold uppercase tracking-widest">Sifarişlərim</span>
              </button>
            </>
          ) : (
            <>
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
            onClick={() => allowWa && ordersAllowed && cart.length > 0 && onMenuViewChange?.("cart")}
            className="relative flex flex-col items-center text-[10px] text-[var(--mt-muted)]"
          >
            <motion.div
              key={`nav-cart-${cartPulse}`}
              animate={{ scale: [1, 1.18, 1], rotate: [0, -7, 7, 0] }}
              transition={{ duration: 0.38 }}
              className="relative"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 ? (
                <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </motion.div>
            {t("nav_cart")}
          </button>
          <button
            type="button"
            onClick={() => onOpenOrders?.()}
            className="flex flex-col items-center text-[10px] text-[var(--mt-muted)]"
          >
            <Calendar size={22} />
            Sifarişlərim
          </button>
            </>
          )}
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
                {cartCount} · ₼{cartTotal.toFixed(2)}
              </span>
              <span className="flex items-center gap-1">
                Sifarişi ver
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
              <p className="text-xs text-[var(--mt-muted)] mb-2">{t("menu_variant_subtitle")}</p>
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
                {t("btn_close")}
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {noteModalLineId ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/55 flex items-end sm:items-center justify-center p-4"
            onClick={() => setNoteModalLineId(null)}
          >
            <motion.div
              initial={{ y: 36 }}
              animate={{ y: 0 }}
              exit={{ y: 36 }}
              className="w-full max-w-md rounded-2xl p-4 shadow-2xl"
              style={{ backgroundColor: "var(--mt-surface)", color: "var(--mt-text)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base font-bold mb-2">Qeyd</h3>
              <textarea
                className="w-full min-h-[100px] rounded-xl border border-black/10 bg-transparent p-3 text-sm"
                placeholder={t("cart_note_placeholder")}
                value={noteModalDraft}
                onChange={(e) => setNoteModalDraft(e.target.value)}
              />
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-black/10 py-2 text-sm font-medium"
                  onClick={() => setNoteModalLineId(null)}
                >
                  Ləğv et
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl py-2 text-sm font-bold text-white"
                  style={{ backgroundColor: "var(--mt-primary)" }}
                  onClick={() => {
                    if (noteModalLineId) updateCartLineNote(noteModalLineId, noteModalDraft);
                    setNoteModalLineId(null);
                  }}
                >
                  Yadda saxla
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
