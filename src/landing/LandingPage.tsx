import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  ArrowRight,
  Check,
  X,
  Globe,
  Instagram,
  LayoutDashboard,
  MessageSquare,
  QrCode,
  Send,
  Smartphone,
  Sparkles,
  Store,
  ChevronDown,
  ShieldCheck,
  Zap,
  Menu as MenuIcon,
  Star,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MENU_TEMPLATES } from "../menu-templates";
import { DEMO_MENU_PREVIEW_SLUG, DEMO_QR_PUBLIC_SLUG } from "../demoMenuSlug";
import { useI18nBundle } from "../i18n/bundleContext";
import type {
  LandingCms,
  LandingCmsCopy,
  LandingCmsFaqItem,
  LandingCmsShowcase,
  LandingCmsStat,
  LandingCmsTestimonial,
} from "../lib/landingCms";
import {
  CMS_COPY_I18N_KEYS,
  DEFAULT_FAQ,
  DEFAULT_HERO_SHOWCASE_SLIDES,
  DEFAULT_HERO_SHOWCASE_SLOGANS,
  DEFAULT_STATS,
  DEFAULT_TESTIMONIALS,
  parseLandingCms,
  sectionEnabled,
} from "../lib/landingCms";

function cn(...i: (string | boolean | undefined)[]) {
  return twMerge(clsx(i));
}

/** Dəstək xətti — yalnız rəqəmlər (ölkə kodu ilə). */
const LANDING_SUPPORT_WHATSAPP_DIGITS = "994501234567";

/** Rəsmi WhatsApp loqosu. */
function WhatsAppBrandIcon({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M20.52 3.48A11.88 11.88 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.59 5.96L0 24l6.31-1.65a11.8 11.8 0 0 0 5.74 1.46h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.44-8.43Zm-8.46 18.3h-.01a9.8 9.8 0 0 1-4.99-1.36l-.36-.21-3.75.98 1-3.66-.24-.38a9.83 9.83 0 0 1-1.51-5.24c0-5.44 4.43-9.87 9.87-9.87a9.8 9.8 0 0 1 6.98 2.9 9.81 9.81 0 0 1 2.89 6.98c0 5.44-4.43 9.87-9.87 9.87Zm5.41-7.4c-.3-.16-1.78-.88-2.06-.98-.28-.1-.48-.16-.68.16-.2.3-.78.97-.95 1.17-.18.2-.35.22-.65.07-.3-.16-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.67-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.16-.68-1.64-.94-2.25-.24-.57-.49-.49-.68-.5h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.06 2.87 1.2 3.07.15.2 2.08 3.18 5.03 4.46.7.3 1.25.48 1.67.62.7.22 1.34.19 1.84.12.56-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

function useT(lang: string) {
  const bundle = useI18nBundle();
  return (key: string) =>
    bundle[lang]?.[key] || bundle.en?.[key] || bundle.az?.[key] || key;
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

/** Hero-da telefon mockup: real menyu şablonlarını gözəl şəkildə göstərir. */
function HeroPhoneShowcase({
  showcase,
  scanLabel,
  waLabel,
}: {
  showcase?: LandingCms["showcase"];
  scanLabel: string;
  waLabel: string;
}) {
  const slides =
    Array.isArray(showcase?.slides) && showcase.slides.length > 0
      ? showcase.slides
      : DEFAULT_HERO_SHOWCASE_SLIDES;
  const slogans =
    Array.isArray(showcase?.slogans) && showcase.slogans.length > 0
      ? showcase.slogans
      : DEFAULT_HERO_SHOWCASE_SLOGANS;
  const [slide, setSlide] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setSlide((p) => (p + 1) % slides.length), 3400);
    return () => window.clearInterval(id);
  }, [slides.length, reduced]);

  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      {/* dekorativ aksent halqalar */}
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-rose-500/20 via-orange-500/10 to-transparent blur-2xl"
      />

      {/* Telefon çərçivəsi */}
      <div className="relative rounded-[2.4rem] border border-white/10 bg-gradient-to-b from-neutral-900 to-neutral-950 p-3 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]">
        <div className="absolute left-1/2 top-4 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black/90" aria-hidden />

        <div className="overflow-hidden rounded-[2rem] bg-black">
          {/* status bar imitation */}
          <div className="flex items-center justify-between px-5 pt-2.5 pb-1 text-[10px] font-semibold text-white/70">
            <span>9:41</span>
            <span className="flex gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/70" />
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/50" />
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/30" />
            </span>
          </div>

          {/* menyu ekranı */}
          <div className="relative h-[520px] w-full overflow-hidden">
            {slides.map((tpl, i) => (
              <div
                key={tpl.id}
                className={cn(
                  "absolute inset-0 transition-all duration-700 ease-out",
                  i === slide ? "opacity-100 scale-100" : "opacity-0 scale-105"
                )}
              >
                <img
                  src={tpl.heroImage}
                  alt={`${tpl.name} — MenuGo QR menyu şablonu (${tpl.category})`}
                  className="h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />

                {/* top brand strip */}
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur">
                    <QrCode size={12} /> MenuGo
                  </span>
                  <span className="rounded-lg bg-white/15 px-2 py-1 text-[10px] font-medium text-white/90 backdrop-blur">
                    AZ · EN · RU
                  </span>
                </div>

                {/* bottom sheet — yalnız aktiv slide-da mətn olsun */}
                {i === slide && (
                  <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 p-4 text-neutral-900 shadow-2xl">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                      {tpl.category}
                    </p>
                    <p className="mt-1 text-lg font-bold leading-tight" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                      {tpl.name}
                    </p>
                    <p className="mt-2 text-xs text-neutral-500">
                      {slogans[slide % slogans.length]}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1">
                        <WhatsAppBrandIcon size={12} className="text-emerald-600" />
                        <span className="text-[10px] font-semibold text-emerald-700">
                          {waLabel}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-neutral-500">
                        {slide + 1}/{slides.length}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sağda üzən QR kart */}
      <div className="absolute -right-4 top-16 hidden rounded-2xl border border-white/10 bg-neutral-900/90 p-3 shadow-2xl backdrop-blur-md sm:block">
        <div className="flex items-center gap-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-neutral-900">
            <QrCode size={20} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-300">
              {scanLabel}
            </p>
            <p className="text-xs font-bold">menugo.az/r/…</p>
          </div>
        </div>
      </div>

      {/* Solda üzən WhatsApp kart */}
      <div className="absolute -left-6 bottom-24 hidden rounded-2xl border border-white/10 bg-neutral-900/90 p-3 shadow-2xl backdrop-blur-md sm:block">
        <div className="flex items-center gap-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#25D366] text-white">
            <WhatsAppBrandIcon size={18} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
              {waLabel}
            </p>
            <p className="text-xs font-bold">+994 · anında</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type FaqItem = LandingCmsFaqItem;

const FaqRow: React.FC<{ item: FaqItem; defaultOpen?: boolean }> = ({ item, defaultOpen }) => {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-neutral-900/10 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-neutral-900 sm:text-lg">{item.q}</span>
        <span
          className={cn(
            "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition",
            open && "rotate-180 border-rose-500 bg-rose-500 text-white"
          )}
        >
          <ChevronDown size={16} />
        </span>
      </button>
      <div
        className={cn(
          "grid overflow-hidden transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0">
          <p className="pr-11 text-sm leading-relaxed text-neutral-600 sm:text-[15px]">{item.a}</p>
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const bundle = useI18nBundle();
  const [lang, setLang] = useState("az");
  const [cms, setCms] = useState<LandingCms>(() => parseLandingCms(null));
  const [plans, setPlans] = useState<
    Array<{
      id: number;
      name: string;
      slug: string;
      price_monthly: string | number;
      max_products: number;
      max_categories: number;
      max_templates: number;
      whatsapp_order_enabled: number | boolean;
      reservation_enabled: number | boolean;
      analytics_enabled: number | boolean;
      premium_templates_enabled: number | boolean;
    }>
  >([]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((s: { default_language?: string }) => {
        if (s.default_language) setLang(s.default_language);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/public/landing-cms")
      .then((r) => r.json())
      .then((data: unknown) => setCms(parseLandingCms(JSON.stringify(data))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/public/analytics/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/" }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/public/plans")
      .then((r) => r.json())
      .then((rows) => setPlans(Array.isArray(rows) ? rows : []))
      .catch(() => setPlans([]));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const t = useT(lang);

  const tc = (k: keyof LandingCmsCopy) => {
    const raw = cms.copy?.[k];
    if (raw != null && String(raw).trim()) return String(raw).trim();
    const ik = CMS_COPY_I18N_KEYS[k] as string;
    return t(ik);
  };

  const sec = (k: Parameters<typeof sectionEnabled>[1]) => sectionEnabled(cms, k);

  // Meta + canonical (dinamik yeniləmə — SPA rejiminə uyğun)
  useEffect(() => {
    const pickCopy = (key: keyof LandingCmsCopy) => {
      const raw = cms.copy?.[key];
      if (raw != null && String(raw).trim()) return String(raw).trim();
      const ik = CMS_COPY_I18N_KEYS[key];
      return (
        bundle[lang]?.[ik] || bundle.en?.[ik] || bundle.az?.[ik] || ""
      );
    };
    const title = pickCopy("meta_title") || "MenuGo";
    const desc = pickCopy("meta_description");
    document.title = title;

    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    if (desc) {
      setMeta("description", desc);
      setMeta("og:description", desc, "property");
      setMeta("twitter:description", desc);
    }
    setMeta("og:title", title, "property");
    setMeta("twitter:title", title);
    setMeta("og:url", "https://menugo.az/", "property");

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute(
      "href",
      typeof window !== "undefined" ? window.location.origin + "/" : "https://menugo.az/"
    );

    document.documentElement.setAttribute("lang", lang);
  }, [lang, bundle, cms.copy]);

  const brand = tc("brand_name") || "MenuGo";
  const lim = (n: number) => (n < 0 ? "∞" : String(n));

  const benefits = [
    { icon: QrCode, t: "landing_benefit_qr_t", d: "landing_benefit_qr_d" },
    { icon: Smartphone, t: "landing_benefit_mobile_t", d: "landing_benefit_mobile_d" },
    { icon: Sparkles, t: "landing_benefit_templates_t", d: "landing_benefit_templates_d" },
    { icon: MessageSquare, t: "landing_benefit_wa_t", d: "landing_benefit_wa_d" },
    { icon: LayoutDashboard, t: "landing_benefit_panel_t", d: "landing_benefit_panel_d" },
    { icon: Zap, t: "landing_benefit_save_t", d: "landing_benefit_save_d" },
    { icon: Globe, t: "landing_benefit_domain_t", d: "landing_benefit_domain_d" },
    { icon: Send, t: "landing_benefit_speed_t", d: "landing_benefit_speed_d" },
  ] as const;

  const showcaseTemplates = MENU_TEMPLATES.slice(0, 9);
  const demoBase = `/r/${DEMO_MENU_PREVIEW_SLUG}?preview=true`;
  const demoLeadUrl = `/demo/${DEMO_QR_PUBLIC_SLUG}`;

  const proIx = plans.findIndex((p) => p.slug === "pro" || p.slug === "standart");
  const popularPlanIndex =
    proIx >= 0 ? proIx : plans.length > 1 ? Math.min(1, plans.length - 1) : 0;

  const stats: LandingCmsStat[] = useMemo(() => {
    if (Array.isArray(cms.stats) && cms.stats.length > 0) return cms.stats;
    // fallback: dildən asılı etiketlər
    return [
      { value: "120+", label: t("landing_stat_label_restaurants") },
      { value: "50K+", label: t("landing_stat_label_views") },
      { value: "12s", label: t("landing_stat_label_order") },
      { value: "4", label: t("landing_stat_label_lang") },
    ];
  }, [cms.stats, t]);

  const testimonials: LandingCmsTestimonial[] =
    Array.isArray(cms.testimonials) && cms.testimonials.length > 0
      ? cms.testimonials
      : DEFAULT_TESTIMONIALS;

  const faq: FaqItem[] =
    Array.isArray(cms.faq) && cms.faq.length > 0 ? cms.faq : DEFAULT_FAQ;

  const comparisonRows: {
    labelKey: string;
    paperKey: string;
    usKey: string;
  }[] = [
    {
      labelKey: "landing_comparison_row_update",
      paperKey: "landing_comparison_paper_update",
      usKey: "landing_comparison_us_update",
    },
    {
      labelKey: "landing_comparison_row_print",
      paperKey: "landing_comparison_paper_print",
      usKey: "landing_comparison_us_print",
    },
    {
      labelKey: "landing_comparison_row_lang",
      paperKey: "landing_comparison_paper_lang",
      usKey: "landing_comparison_us_lang",
    },
    {
      labelKey: "landing_comparison_row_order",
      paperKey: "landing_comparison_paper_order",
      usKey: "landing_comparison_us_order",
    },
    {
      labelKey: "landing_comparison_row_stats",
      paperKey: "landing_comparison_paper_stats",
      usKey: "landing_comparison_us_stats",
    },
    {
      labelKey: "landing_comparison_row_design",
      paperKey: "landing_comparison_paper_design",
      usKey: "landing_comparison_us_design",
    },
  ];

  const navItems = [
    { href: "#features", label: t("landing_nav_features") },
    { href: "#templates", label: t("landing_nav_templates") },
    { href: "#pricing", label: t("landing_nav_pricing") },
    { href: "#faq", label: t("landing_nav_faq") },
  ];

  return (
    <div
      className="min-h-screen bg-neutral-950 text-neutral-100 antialiased selection:bg-rose-500/40 selection:text-white"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      <style>{`
        h1, h2, .font-serif { font-family: 'Fraunces', Georgia, serif; font-feature-settings: 'ss01', 'ss02'; letter-spacing: -0.01em; }
        .grain::before {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E");
          opacity: 0.06;
          pointer-events: none;
          mix-blend-mode: overlay;
        }
      `}</style>

      {/* ===== NAV ===== */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-neutral-900/10 bg-white/90 text-neutral-900 shadow-sm backdrop-blur-xl"
            : "border-b border-white/0 bg-neutral-950/50 text-white backdrop-blur"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl transition",
                scrolled
                  ? "bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/25"
                  : "bg-white text-neutral-900"
              )}
            >
              <QrCode size={18} strokeWidth={2.5} />
            </span>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {brand}
              <span className={cn("ml-0.5 text-sm font-medium", scrolled ? "text-rose-500" : "text-rose-400")}>
                .az
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className={cn(
                  "text-sm font-medium transition hover:opacity-70",
                  scrolled ? "text-neutral-700" : "text-neutral-200"
                )}
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className={cn(
                "hidden rounded-lg border px-2.5 py-1.5 text-xs font-semibold outline-none transition sm:inline-flex",
                scrolled
                  ? "border-neutral-300 bg-white text-neutral-700"
                  : "border-white/20 bg-white/10 text-white"
              )}
              aria-label={t("language")}
            >
              <option value="az">AZ</option>
              <option value="en">EN</option>
              <option value="ru">RU</option>
              <option value="tr">TR</option>
            </select>

            <Link
              to="/panel"
              className={cn(
                "hidden rounded-lg px-3.5 py-2 text-sm font-semibold transition sm:inline-flex sm:items-center sm:gap-1.5",
                scrolled ? "text-neutral-700 hover:bg-neutral-100" : "text-white/90 hover:bg-white/10"
              )}
            >
              <Store size={16} /> {t("restaurant_staff_login")}
            </Link>

            {sec("navRegisterLink") && (
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:brightness-110"
              >
                {tc("cta_primary")}
                <ArrowRight size={15} />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileNavOpen((v) => !v)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg md:hidden",
                scrolled ? "bg-neutral-100 text-neutral-800" : "bg-white/10 text-white"
              )}
              aria-label="Menu"
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </div>

        {/* Mobil menyu */}
        {mobileNavOpen && (
          <div className={cn("border-t md:hidden", scrolled ? "border-neutral-200 bg-white" : "border-white/10 bg-neutral-950")}>
            <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-3">
              {navItems.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium",
                    scrolled ? "text-neutral-700 hover:bg-neutral-100" : "text-neutral-200 hover:bg-white/5"
                  )}
                >
                  {n.label}
                </a>
              ))}
              <div className="mt-1 flex items-center gap-2 border-t border-inherit pt-3">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className={cn(
                    "flex-1 rounded-lg border px-2.5 py-2 text-sm font-semibold outline-none",
                    scrolled ? "border-neutral-300 bg-white text-neutral-700" : "border-white/20 bg-white/10 text-white"
                  )}
                >
                  <option value="az">Azərbaycan</option>
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                  <option value="tr">Türkçe</option>
                </select>
                <Link
                  to="/panel"
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-center text-sm font-semibold",
                    scrolled ? "bg-neutral-100 text-neutral-800" : "bg-white/10 text-white"
                  )}
                >
                  {t("restaurant_staff_login")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ===== HERO ===== */}
        {sec("hero") && (
          <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
            <div aria-hidden className="grain absolute inset-0" />
            {/* fon işıq nöqtələri */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-rose-500/25 blur-[110px]" />
              <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-orange-500/15 blur-[130px]" />
            </div>

            <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
              <motion.div initial="hidden" animate="show" variants={stagger}>
                <motion.p
                  variants={fadeUp}
                  className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-200 backdrop-blur"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                  </span>
                  {tc("hero_badge")}
                </motion.p>

                <motion.h1
                  variants={fadeUp}
                  className="text-[2.6rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.4rem]"
                >
                  <span className="bg-gradient-to-br from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
                    {tc("hero_title")}
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="mt-6 max-w-xl text-base leading-relaxed text-neutral-300 sm:text-lg"
                >
                  {tc("hero_sub")}
                </motion.p>

                <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/register"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-7 py-3.5 text-base font-bold text-white shadow-[0_18px_40px_-12px_rgba(244,63,94,0.55)] transition hover:shadow-[0_24px_50px_-8px_rgba(244,63,94,0.7)]"
                  >
                    {tc("cta_primary")}
                    <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
                  </Link>
                  <a
                    href={demoLeadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10"
                  >
                    <Globe size={18} /> {tc("cta_demo")}
                  </a>
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-neutral-400"
                >
                  <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-0.5 text-amber-400">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} size={13} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-white/80">4.9</span>
                  </div>
                  <span aria-hidden className="h-3 w-px bg-white/15" />
                  <span>{tc("hero_trust")}</span>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <HeroPhoneShowcase
                  showcase={cms.showcase}
                  scanLabel={t("landing_hero_scan_label")}
                  waLabel={t("landing_hero_wa_label")}
                />
              </motion.div>
            </div>
          </section>
        )}

        {/* ===== STATS ===== */}
        <section aria-label="Statistika" className="border-y border-neutral-900/60 bg-neutral-950">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-neutral-900/60 px-5 sm:grid-cols-4 sm:divide-x sm:px-8">
            {stats.map((s, i) => (
              <div key={i} className="py-8 text-center sm:py-10">
                <p className="text-3xl font-bold text-white sm:text-4xl" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                  {s.value}
                </p>
                <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.12em] text-neutral-500 sm:text-sm">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== HOW IT WORKS (krem bölmə) ===== */}
        {sec("howItWorks") && (
          <section className="bg-[#faf6ef] py-20 text-neutral-900 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
              <div className="mb-14 max-w-2xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                  01 · 02 · 03
                </p>
                <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  {tc("how_title")}
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3 md:gap-8">
                {[
                  { Icon: Store, n: "01", title: "landing_how_short_1", desc: "landing_how_1" },
                  { Icon: QrCode, n: "02", title: "landing_how_short_2", desc: "landing_how_2" },
                  { Icon: Send, n: "03", title: "landing_how_short_3", desc: "landing_how_3" },
                ].map((step, i) => (
                  <motion.div
                    key={step.n}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: i * 0.08 }}
                    className="group relative rounded-3xl border border-neutral-200 bg-white p-8 transition hover:border-rose-500/40 hover:shadow-[0_20px_50px_-20px_rgba(244,63,94,0.35)]"
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className="text-6xl font-semibold text-neutral-200"
                        style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                      >
                        {step.n}
                      </span>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-900 text-white transition group-hover:bg-rose-500">
                        <step.Icon size={20} />
                      </div>
                    </div>
                    <h3 className="mt-6 text-xl font-bold">{t(step.title)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-600">{t(step.desc)}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== FEATURES / BENEFITS ===== */}
        {sec("benefits") && (
          <section id="features" className="bg-neutral-950 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
              <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div className="max-w-2xl">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-400">
                    {t("landing_nav_features")}
                  </p>
                  <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                    {tc("benefits_title")}
                  </h2>
                </div>
                <p className="max-w-md text-neutral-400">{tc("benefits_sub")}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {benefits.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: (i % 4) * 0.05 }}
                    className="group rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 transition hover:border-rose-500/40 hover:bg-neutral-900"
                  >
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/10 text-rose-300 ring-1 ring-inset ring-white/10">
                      <b.icon size={20} />
                    </div>
                    <h3 className="mb-2 text-base font-bold text-white">{t(b.t)}</h3>
                    <p className="text-sm leading-relaxed text-neutral-400">{t(b.d)}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== TEMPLATES ===== */}
        {sec("templates") && (
          <section id="templates" className="bg-[#faf6ef] py-20 text-neutral-900 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
              <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                <div className="max-w-2xl">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                    {t("landing_nav_templates")}
                  </p>
                  <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
                    {tc("templates_title")}
                  </h2>
                  <p className="mt-4 max-w-md text-neutral-600">{tc("templates_sub")}</p>
                </div>
                <a
                  href={demoLeadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 self-start rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  {tc("cta_demo")} <ArrowRight size={15} />
                </a>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {showcaseTemplates.map((tpl, idx) => (
                  <motion.article
                    key={tpl.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ delay: (idx % 3) * 0.06 }}
                    className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:border-rose-500/40 hover:shadow-xl"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={tpl.heroImage}
                        alt={`${tpl.name} — MenuGo restoran menyu şablonu`}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <span className="absolute left-4 top-4 rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                        {tpl.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 p-5">
                      <p className="font-bold" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                        {tpl.name}
                      </p>
                      <a
                        href={`${demoBase}&previewTemplate=${encodeURIComponent(tpl.id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700"
                      >
                        {t("landing_preview_live")} <ArrowRight size={14} />
                      </a>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== COMPARISON ===== */}
        {sec("comparison") && (
          <section className="bg-neutral-950 py-20 sm:py-28">
            <div className="mx-auto max-w-5xl px-5 sm:px-8">
              <div className="mb-12 text-center">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-400">
                  vs.
                </p>
                <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  {tc("comparison_title")}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-neutral-400">{tc("comparison_sub")}</p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/60">
                <div className="grid grid-cols-[1.2fr_1fr_1fr] border-b border-neutral-800 bg-neutral-900 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  <div className="px-4 py-4 sm:px-6" />
                  <div className="px-4 py-4 text-center sm:px-6">
                    {t("landing_comparison_paper")}
                  </div>
                  <div className="border-l border-neutral-800 bg-gradient-to-b from-rose-500/15 to-transparent px-4 py-4 text-center text-rose-200 sm:px-6">
                    {t("landing_comparison_us")}
                  </div>
                </div>
                {comparisonRows.map((row, i) => (
                  <div
                    key={row.labelKey}
                    className={cn(
                      "grid grid-cols-[1.2fr_1fr_1fr] items-center",
                      i !== comparisonRows.length - 1 && "border-b border-neutral-800"
                    )}
                  >
                    <div className="px-4 py-5 text-sm font-semibold text-white sm:px-6 sm:text-base">
                      {t(row.labelKey)}
                    </div>
                    <div className="px-4 py-5 text-center text-sm text-neutral-400 sm:px-6">
                      <span className="inline-flex items-center gap-1.5">
                        <X size={14} className="text-neutral-600" />
                        <span>{t(row.paperKey)}</span>
                      </span>
                    </div>
                    <div className="border-l border-neutral-800 bg-rose-500/[0.04] px-4 py-5 text-center text-sm font-semibold text-white sm:px-6">
                      <span className="inline-flex items-center gap-1.5">
                        <Check size={15} className="text-emerald-400" />
                        <span>{t(row.usKey)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== PRICING ===== */}
        {sec("pricing") && (
          <section id="pricing" className="bg-[#faf6ef] py-20 text-neutral-900 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
              <div className="mb-14 text-center">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                  {t("landing_nav_pricing")}
                </p>
                <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  {tc("pricing_title")}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-neutral-600">{tc("pricing_sub")}</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((p, idx) => {
                  const popular = idx === popularPlanIndex;
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.06 }}
                      className={cn(
                        "relative flex flex-col rounded-3xl border p-8 transition",
                        popular
                          ? "border-rose-500 bg-neutral-900 text-white shadow-[0_30px_60px_-20px_rgba(244,63,94,0.35)]"
                          : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300"
                      )}
                    >
                      {popular && (
                        <span className="absolute -top-3 left-8 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                          {t("landing_plan_popular")}
                        </span>
                      )}
                      <h3 className="text-lg font-bold" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                        {p.name}
                      </h3>
                      <p className="mt-6 flex items-baseline gap-1">
                        <span className={cn("text-5xl font-semibold", popular ? "text-white" : "text-neutral-900")} style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                          ₼{Number(p.price_monthly).toFixed(0)}
                        </span>
                        <span className={cn("text-sm", popular ? "text-neutral-400" : "text-neutral-500")}>
                          / ay
                        </span>
                      </p>

                      <ul className={cn("mt-8 flex-1 space-y-3.5 text-sm", popular ? "text-neutral-300" : "text-neutral-700")}>
                        <li className="flex items-start gap-2.5">
                          <Check size={17} className={popular ? "text-rose-400" : "text-emerald-500"} />
                          {t("products")}: {lim(Number(p.max_products))}
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check size={17} className={popular ? "text-rose-400" : "text-emerald-500"} />
                          {t("categories")}: {lim(Number(p.max_categories))}
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Check size={17} className={popular ? "text-rose-400" : "text-emerald-500"} />
                          {t("plan_max_templates")}: {lim(Number(p.max_templates))}
                        </li>
                        <li className="flex items-start gap-2.5">
                          {p.whatsapp_order_enabled ? (
                            <Check size={17} className={popular ? "text-rose-400" : "text-emerald-500"} />
                          ) : (
                            <X size={17} className={popular ? "text-neutral-600" : "text-neutral-400"} />
                          )}
                          WhatsApp
                        </li>
                        <li className="flex items-start gap-2.5">
                          {p.analytics_enabled ? (
                            <Check size={17} className={popular ? "text-rose-400" : "text-emerald-500"} />
                          ) : (
                            <X size={17} className={popular ? "text-neutral-600" : "text-neutral-400"} />
                          )}
                          Analitika
                        </li>
                      </ul>

                      <Link
                        to="/register"
                        className={cn(
                          "mt-8 inline-flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition",
                          popular
                            ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:brightness-110"
                            : "bg-neutral-900 text-white hover:bg-neutral-800"
                        )}
                      >
                        {t("landing_buy")} <ArrowRight size={15} />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ===== TESTIMONIALS ===== */}
        {sec("testimonials") && (
          <section className="bg-neutral-950 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
              <div className="mb-14 max-w-2xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-400">
                  Rəylər
                </p>
                <h2 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  {tc("testimonials_title")}
                </h2>
                <p className="mt-4 text-neutral-400">{tc("testimonials_sub")}</p>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {testimonials.map((r, i) => (
                  <motion.figure
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: i * 0.08 }}
                    className="flex flex-col rounded-3xl border border-neutral-800 bg-neutral-900/60 p-7"
                  >
                    <div className="flex gap-0.5 text-amber-400">
                      {[0, 1, 2, 3, 4].map((s) => (
                        <Star key={s} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <blockquote className="mt-5 flex-1 text-[15px] leading-relaxed text-neutral-200">
                      “{r.quote}”
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-3 border-t border-neutral-800 pt-5">
                      {r.avatar ? (
                        <img
                          src={r.avatar}
                          alt={r.name}
                          className="h-11 w-11 rounded-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-800 text-sm font-bold text-white">
                          {r.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-white">{r.name}</p>
                        <p className="text-xs text-neutral-500">{r.role}</p>
                      </div>
                    </figcaption>
                  </motion.figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== FAQ ===== */}
        {sec("faq") && (
          <section id="faq" className="bg-[#faf6ef] py-20 text-neutral-900 sm:py-28">
            <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div className="lg:sticky lg:top-32 lg:self-start">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                  {t("landing_nav_faq")}
                </p>
                <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  {tc("faq_title")}
                </h2>
                <p className="mt-4 text-neutral-600">{tc("faq_sub")}</p>
                <a
                  href={`https://wa.me/${LANDING_SUPPORT_WHATSAPP_DIGITS}?text=${encodeURIComponent(
                    t("landing_whatsapp_support_prefill")
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  <WhatsAppBrandIcon size={16} /> WhatsApp
                </a>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white px-6 sm:px-8">
                {faq.map((item, i) => (
                  <FaqRow key={i} item={item} defaultOpen={i === 0} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== FINAL CTA ===== */}
        {sec("finalCta") && (
          <section className="relative overflow-hidden bg-neutral-950 py-20 sm:py-28">
            <div aria-hidden className="grain absolute inset-0" />
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-rose-500/30 to-orange-500/20 blur-[120px]" />
            </div>
            <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-200 backdrop-blur">
                <ShieldCheck size={13} /> Pulsuz sınaq · Kart tələb olunmur
              </div>
              <h2 className="text-4xl font-semibold leading-tight text-white sm:text-6xl">
                {tc("final_cta_title")}
              </h2>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-neutral-900 shadow-2xl transition hover:scale-[1.02]"
                >
                  {tc("cta_primary")}
                  <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
                </Link>
                <a
                  href={demoLeadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  <Globe size={18} /> {tc("cta_demo")}
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ===== FOOTER ===== */}
      {sec("footer") && (
        <footer className="border-t border-neutral-900 bg-black">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
            <div className="grid gap-10 md:grid-cols-4">
              <div className="md:col-span-2">
                <Link to="/" className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white">
                    <QrCode size={18} strokeWidth={2.5} />
                  </span>
                  <span className="text-xl font-bold text-white" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                    {brand}
                    <span className="text-rose-400">.az</span>
                  </span>
                </Link>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-neutral-500">
                  {tc("footer_tagline")}
                </p>
                <p className="mt-5 text-sm text-neutral-500">
                  {t("landing_footer_connect")}:{" "}
                  <a href="mailto:info@menugo.az" className="text-rose-400 hover:text-rose-300 hover:underline">
                    info@menugo.az
                  </a>
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">
                  {t("landing_footer_explore")}
                </p>
                <ul className="mt-5 space-y-3 text-sm text-neutral-400">
                  <li>
                    <a href="#features" className="transition hover:text-white">
                      {t("landing_nav_features")}
                    </a>
                  </li>
                  <li>
                    <a href="#templates" className="transition hover:text-white">
                      {t("landing_nav_templates")}
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="transition hover:text-white">
                      {t("landing_nav_pricing")}
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="transition hover:text-white">
                      {t("landing_nav_faq")}
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">
                  {t("landing_footer_social")}
                </p>
                <div className="mt-5 flex gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 transition hover:border-rose-500/40 hover:text-rose-400"
                    aria-label="Instagram"
                  >
                    <Instagram size={18} />
                  </a>
                  <a
                    href={`https://wa.me/${LANDING_SUPPORT_WHATSAPP_DIGITS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-emerald-400 transition hover:border-emerald-500/40"
                    aria-label="WhatsApp"
                  >
                    <WhatsAppBrandIcon size={18} />
                  </a>
                </div>
                <ul className="mt-6 space-y-2.5 text-sm text-neutral-500">
                  <li>
                    <Link to="/register" className="transition hover:text-white">
                      {tc("cta_primary")}
                    </Link>
                  </li>
                  <li>
                    <Link to="/panel" className="transition hover:text-white">
                      {t("restaurant_staff_login")}
                    </Link>
                  </li>
                  <li>
                    <Link to={demoLeadUrl} className="transition hover:text-white">
                      {tc("cta_demo")}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-neutral-900 pt-6 text-xs text-neutral-600 sm:flex-row">
              <p>© 2026 {brand}. Bütün hüquqlar qorunur.</p>
              <p>Made in Azerbaijan · menugo.az</p>
            </div>
          </div>
        </footer>
      )}

      {/* Mobile sticky CTA */}
      {sec("stickyBar") && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-900 bg-neutral-950/95 px-4 py-3 backdrop-blur-xl sm:hidden">
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/25"
          >
            {tc("sticky_bar")} <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* WhatsApp üzən düymə */}
      <a
        href={`https://wa.me/${LANDING_SUPPORT_WHATSAPP_DIGITS}?text=${encodeURIComponent(
          t("landing_whatsapp_support_prefill")
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/45 ring-2 ring-white/20 transition hover:scale-105 hover:brightness-110 sm:right-6",
          sec("stickyBar") ? "bottom-[4.75rem] sm:bottom-6" : "bottom-4 sm:bottom-6"
        )}
        aria-label={t("landing_whatsapp_support_tooltip")}
        title={t("landing_whatsapp_support_tooltip")}
      >
        <WhatsAppBrandIcon size={26} />
      </a>
    </div>
  );
}
