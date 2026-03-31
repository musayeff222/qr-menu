import React, { useMemo } from "react";
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

export type MenuTemplateViewProps = {
  template: MenuTemplateDef;
  restaurant: Record<string, unknown>;
  categories: Array<Record<string, unknown>>;
  products: Array<Record<string, unknown>>;
  activeCategory: number | null;
  setActiveCategory: (id: number) => void;
  currentLang: string;
  setCurrentLang: (l: string) => void;
  cart: Array<Record<string, unknown>>;
  addToCart: (p: Record<string, unknown>) => void;
  onWhatsAppOrder: () => void;
  t: (k: string) => string;
  /** Plan limitləri: WhatsApp sifariş / rezervasiya söndürülə bilər */
  planFeatures?: {
    whatsapp_order?: boolean;
    reservation?: boolean;
  };
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
  onWhatsAppOrder,
  t,
  planFeatures,
}: MenuTemplateViewProps) {
  const allowWa = planFeatures?.whatsapp_order !== false;
  const allowRes = planFeatures?.reservation !== false;
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
        className={cn(
          "flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14",
          r,
          "bg-[var(--mt-surface)]/90 text-[var(--mt-text)] shadow-sm border border-black/5 active:scale-95 transition-transform"
        )}
      >
        {children}
      </a>
    ) : null;

  const filteredProducts = products.filter(
    (p) => Number(p.category_id) === Number(activeCategory)
  );

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

      <header>
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
              backgroundImage: `url(${template.heroImage})`,
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
            <div className="flex justify-end">
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
            </div>

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

            <nav
              aria-label="Quick actions"
              className="flex flex-wrap justify-center gap-2 mt-4"
            >
              <ActionBtn href={mapsUrl} label="Location">
                <MapPin size={20} />
              </ActionBtn>
              <ActionBtn href={phone ? `tel:${phone.replace(/\s/g, "")}` : ""} label="Call">
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
          </div>
        </div>
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
              <CategoryButton
                key={cat.id as number}
                cat={cat}
                active={Number(cat.id) === Number(activeCategory)}
              />
            ))}
          </div>
        </nav>

        <section aria-label="Menu items" className="px-3 sm:px-4 py-4 space-y-3">
          {filteredProducts.map((prod) => {
            const pname =
              ((prod.translations as Record<string, { name?: string }> | undefined)?.[
                currentLang
              ]?.name) || String(prod.name);
            const pdesc =
              ((prod.translations as Record<string, { desc?: string }> | undefined)?.[
                currentLang
              ]?.desc) || String(prod.description ?? "");
            const img = prod.image_url ? String(prod.image_url) : "";
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
                  th.cardStyle === "glass" && "bg-[var(--mt-surface)]/80"
                )}
                style={
                  th.cardStyle === "glass"
                    ? undefined
                    : { backgroundColor: "var(--mt-surface)" }
                }
              >
                <div
                  className={cn(
                    "w-24 h-24 sm:w-28 sm:h-28 shrink-0 overflow-hidden bg-gradient-to-br from-[var(--mt-secondary)] to-[var(--mt-primary)]/30",
                    pir
                  )}
                >
                  {img ? (
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
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
                      ${prod.price}
                    </span>
                    {allowWa ? (
                      <button
                        type="button"
                        onClick={() => addToCart(prod)}
                        className={cn(
                          "w-10 h-10 flex items-center justify-center text-white shadow-md active:scale-90 transition-transform",
                          RADIUS_MAP.full
                        )}
                        style={{ backgroundColor: "var(--mt-primary)" }}
                        aria-label={`${t("add_product")} ${pname}`}
                      >
                        <Plus size={20} />
                      </button>
                    ) : null}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>
      </main>

      {allowWa && th.showFab && waOrderUrl && (
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
      )}

      {th.showBottomNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-[var(--mt-surface)]/95 backdrop-blur flex justify-around py-2 pb-safe"
          aria-label="Bottom navigation"
        >
          <a href={`#main-menu`} className="flex flex-col items-center text-[10px] text-[var(--mt-muted)]">
            <Utensils size={22} style={{ color: "var(--mt-primary)" }} />
            Menu
          </a>
          <a href={mapsUrl || "#"} className="flex flex-col items-center text-[10px] text-[var(--mt-muted)]">
            <MapPin size={22} />
            Map
          </a>
          <a
            href={allowWa ? waOrderUrl || "#" : "#main-menu"}
            className="flex flex-col items-center text-[10px] text-[var(--mt-muted)]"
          >
            <MessageCircle size={22} className="text-green-600" />
            Order
          </a>
          <button
            type="button"
            onClick={() => allowWa && onWhatsAppOrder()}
            className="flex flex-col items-center text-[10px] text-[var(--mt-muted)]"
          >
            <ShoppingCart size={22} />
            Cart
          </button>
        </nav>
      )}

      <AnimatePresence>
        {allowWa && cart.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className={cn("fixed z-[60] left-3 right-3", th.showBottomNav ? "bottom-16" : "bottom-4")}
          >
            <button
              type="button"
              onClick={onWhatsAppOrder}
              className="w-full flex justify-between items-center text-white p-4 shadow-2xl active:scale-[0.99] transition-transform font-bold"
              style={{
                backgroundColor: "var(--mt-primary)",
                borderRadius:
                  th.radius === "full" ? "9999px" : undefined,
              }}
            >
              <span className="flex items-center gap-3">
                <ShoppingCart size={22} />
                {cart.length} {t("items_in_cart")}
              </span>
              <span className="flex items-center gap-1">
                {t("order_via_whatsapp")}
                <ChevronRight size={20} />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
