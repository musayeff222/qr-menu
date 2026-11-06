import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Check,
  X,
  Globe,
  LayoutDashboard,
  Menu as MenuIcon,
  MessageSquare,
  Pencil,
  QrCode,
  Smartphone,
  Sparkles,
  Store,
  ChevronDown,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MENU_TEMPLATES } from "../menu-templates";
import { DEMO_MENU_PREVIEW_SLUG, DEMO_QR_PUBLIC_SLUG } from "../demoMenuSlug";
import { useI18nBundle } from "../i18n/bundleContext";
import type { LandingCms, LandingCmsCopy, LandingCmsFaqItem } from "../lib/landingCms";
import {
  CMS_COPY_I18N_KEYS,
  DEFAULT_FAQ,
  DEFAULT_HERO_SHOWCASE_SLIDES,
  parseLandingCms,
  sectionEnabled,
} from "../lib/landingCms";
import { BrandMark, BrandWordmark } from "../ui/BrandMark";

function cn(...i: (string | boolean | undefined)[]) {
  return twMerge(clsx(i));
}

function useT(lang: string) {
  const bundle = useI18nBundle();
  return (key: string) => bundle[lang]?.[key] || bundle.en?.[key] || bundle.az?.[key] || key;
}

function HeroPhoneShowcase({
  showcase,
}: {
  showcase?: LandingCms["showcase"];
}) {
  const slides =
    Array.isArray(showcase?.slides) && showcase.slides.length > 0
      ? showcase.slides
      : DEFAULT_HERO_SHOWCASE_SLIDES;
  const [slide, setSlide] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setSlide((p) => (p + 1) % slides.length), 3800);
    return () => window.clearInterval(id);
  }, [slides.length, reduced]);

  const tpl = slides[slide % slides.length];

  return (
    <div className="relative mx-auto flex h-[380px] w-full max-w-[420px] items-center justify-center sm:h-[490px]">
      <div className="absolute h-[280px] w-[280px] rounded-full bg-[#14ca9536] blur-[58px] sm:h-[400px] sm:w-[400px]" aria-hidden />
      <div className="relative z-[2] h-[377px] w-[214px] rotate-6 overflow-hidden rounded-[35px] border-[7px] border-[#172630] bg-[#111922] shadow-[0_26px_80px_#0008] sm:h-[486px] sm:w-[253px] sm:rounded-[42px] sm:border-8">
        <div className="absolute left-[79px] top-[11px] z-10 hidden h-[21px] w-[91px] rounded-full bg-[#0a1218] sm:block" aria-hidden />
        <img
          src={tpl.heroImage}
          alt={`${tpl.name} — MenuGo nümunə menyu şablonu`}
          className="h-full w-full object-cover"
          width={253}
          height={486}
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">{tpl.category}</p>
          <p className="text-sm font-bold text-white">{tpl.name}</p>
        </div>
      </div>
      <div className="absolute left-0 top-16 z-[3] hidden rotate-[-7deg] rounded-[17px] bg-white p-3.5 shadow-xl sm:block">
        <div className="flex items-center gap-2.5 text-[var(--mg-ink)]">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d8fbec] text-[#087b5e]">
            <Check size={18} />
          </span>
          <span>
            <b className="block text-xs">Hər şey bir paneldə</b>
            <small className="text-[10px] text-[#72837d]">Rahat menyu idarəetməsi</small>
          </span>
        </div>
      </div>
      <div className="absolute bottom-16 right-0 z-[3] hidden rotate-[-5deg] rounded-[17px] bg-white p-3.5 shadow-xl sm:block">
        <div className="flex items-center gap-2.5 text-[var(--mg-ink)]">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d8fbec] text-[#087b5e]">
            <QrCode size={18} />
          </span>
          <span>
            <b className="block text-xs">QR kodunuz hazır</b>
            <small className="text-[10px] text-[#72837d]">Paylaşın və göstərin</small>
          </span>
        </div>
      </div>
    </div>
  );
}

const FaqRow: React.FC<{ item: LandingCmsFaqItem; defaultOpen?: boolean }> = ({ item, defaultOpen }) => {
  const [open, setOpen] = useState(!!defaultOpen);
  const id = `faq-${item.q.slice(0, 24).replace(/\s+/g, "-")}`;
  return (
    <div className="border-b border-[var(--mg-border)] last:border-b-0">
      <button
        type="button"
        id={id}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-12 w-full items-start justify-between gap-4 py-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mg-brand-strong)]"
      >
        <span className="text-base font-semibold text-[var(--mg-ink)] sm:text-lg">{item.q}</span>
        <span
          className={cn(
            "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--mg-border)] text-[var(--mg-muted)] transition",
            open && "rotate-180 border-[var(--mg-brand)] bg-[var(--mg-brand)] text-[var(--mg-ink)]"
          )}
        >
          <ChevronDown size={16} />
        </span>
      </button>
      <div id={`${id}-panel`} role="region" hidden={!open} className={open ? "pb-5" : ""}>
        {open ? <p className="pr-11 text-sm leading-relaxed text-[var(--mg-muted)]">{item.a}</p> : null}
      </div>
    </div>
  );
};

type PlanRow = {
  id: number;
  name: string;
  slug: string;
  price_monthly: string | number;
  max_products: number;
  max_categories: number;
  max_templates: number;
  whatsapp_order_enabled: number | boolean;
  analytics_enabled: number | boolean;
};

export default function LandingPage() {
  const bundle = useI18nBundle();
  const reduced = useReducedMotion();
  const [lang, setLang] = useState("az");
  const [cms, setCms] = useState<LandingCms>(() => parseLandingCms(null));
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [plansError, setPlansError] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
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

  const loadPlans = () => {
    setPlansLoading(true);
    setPlansError(false);
    fetch("/api/public/plans")
      .then((r) => r.json())
      .then((rows) => {
        setPlans(Array.isArray(rows) ? rows : []);
        setPlansError(false);
      })
      .catch(() => {
        setPlans([]);
        setPlansError(true);
      })
      .finally(() => setPlansLoading(false));
  };

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const t = useT(lang);
  const tc = (k: keyof LandingCmsCopy) => {
    const raw = cms.copy?.[k];
    if (raw != null && String(raw).trim()) return String(raw).trim();
    return t(CMS_COPY_I18N_KEYS[k]);
  };
  const sec = (k: Parameters<typeof sectionEnabled>[1]) => sectionEnabled(cms, k);

  useEffect(() => {
    const pickCopy = (key: keyof LandingCmsCopy) => {
      const raw = cms.copy?.[key];
      if (raw != null && String(raw).trim()) return String(raw).trim();
      const ik = CMS_COPY_I18N_KEYS[key];
      return bundle[lang]?.[ik] || bundle.en?.[ik] || bundle.az?.[ik] || "";
    };
    const title = pickCopy("meta_title") || "MenuGo — Restoranlar üçün QR Menyu Yaratma Platforması";
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
    canonical.setAttribute("href", "https://menugo.az/");
    document.documentElement.setAttribute("lang", lang);
  }, [lang, bundle, cms.copy]);

  const lim = (n: number) => (n < 0 ? "∞" : String(n));
  const brand = tc("brand_name") || "MenuGo";
  const demoLeadUrl = `/demo/${DEMO_QR_PUBLIC_SLUG}`;
  const demoBase = `/r/${DEMO_MENU_PREVIEW_SLUG}?preview=true`;
  const showcaseTemplates = MENU_TEMPLATES.slice(0, 6);
  const faq: LandingCmsFaqItem[] = Array.isArray(cms.faq) && cms.faq.length > 0 ? cms.faq : DEFAULT_FAQ;
  const verifiedTestimonials = (cms.testimonials || []).filter((r) => r.quote && r.name);
  const popularIx = plans.findIndex((p) => p.slug === "pro" || p.slug === "standart" || p.slug === "premium");
  const popularPlanIndex = popularIx >= 0 ? popularIx : plans.length > 1 ? 1 : 0;

  const fade = reduced
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  const navItems = [
    { href: "#how", label: t("landing_nav_how") },
    { href: "#features", label: t("landing_nav_features") },
    { href: "#templates", label: t("landing_nav_templates") },
    { href: "#pricing", label: t("landing_nav_pricing") },
  ];

  const benefits = [
    { icon: Pencil, t: "landing_benefit_save_t", d: "landing_benefit_save_d" },
    { icon: Sparkles, t: "landing_benefit_templates_t", d: "landing_benefit_templates_d" },
    { icon: QrCode, t: "landing_benefit_qr_t", d: "landing_benefit_qr_d" },
    { icon: Store, t: "landing_benefit_panel_t", d: "landing_benefit_panel_d" },
    { icon: Smartphone, t: "landing_benefit_mobile_t", d: "landing_benefit_mobile_d" },
    { icon: LayoutDashboard, t: "landing_benefit_speed_t", d: "landing_benefit_speed_d" },
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--mg-paper)] text-[var(--mg-ink)] antialiased">
      <header className="sticky top-0 z-50 bg-[var(--mg-paper)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1230px] items-center justify-between gap-4 px-4 sm:h-[88px] sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label={`${brand} ana səhifə`}>
            <BrandMark className="h-9 w-9 shrink-0 rounded-[14px] sm:h-10 sm:w-10" />
            <BrandWordmark className="hidden text-[1.2rem] font-extrabold tracking-tight min-[380px]:inline sm:text-[1.35rem]" ink />
          </Link>
          <nav className="hidden items-center gap-7 text-[13px] font-semibold text-[#45535c] md:flex" aria-label="Əsas menyu">
            {navItems.map((n) => (
              <a key={n.href} href={n.href} className="hover:text-[var(--mg-brand-strong)]">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="hidden min-h-11 rounded-xl border border-[var(--mg-border)] bg-white px-2.5 text-xs font-semibold sm:inline-flex"
              aria-label={t("language")}
            >
              <option value="az">AZ</option>
              <option value="en">EN</option>
              <option value="ru">RU</option>
              <option value="tr">TR</option>
            </select>
            <Link to="/panel" className="hidden text-sm font-bold md:inline-flex">
              {t("restaurant_staff_login")}
            </Link>
            {sec("navRegisterLink") ? (
              <Link
                to="/register"
                className="inline-flex min-h-11 max-w-[46vw] items-center gap-1 truncate rounded-[13px] bg-[var(--mg-ink)] px-3 text-xs font-extrabold text-white sm:min-h-12 sm:max-w-none sm:px-4 sm:text-sm"
              >
                {tc("cta_primary")}
                <ArrowRight size={15} />
              </Link>
            ) : null}
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white md:hidden"
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? "Menyunu bağla" : "Menyunu aç"}
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              {mobileNavOpen ? <X size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </div>
        {mobileNavOpen ? (
          <div className="border-t border-[var(--mg-border)] bg-white px-4 py-3 md:hidden">
            {navItems.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="block min-h-12 px-2 py-3 font-semibold"
                onClick={() => setMobileNavOpen(false)}
              >
                {n.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="min-h-12 flex-1 rounded-xl border border-[var(--mg-border)] px-3"
              >
                <option value="az">Azərbaycan</option>
                <option value="en">English</option>
                <option value="ru">Русский</option>
                <option value="tr">Türkçe</option>
              </select>
              <Link
                to="/panel"
                className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-[var(--mg-paper)] font-semibold"
                onClick={() => setMobileNavOpen(false)}
              >
                {t("restaurant_staff_login")}
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main>
        {sec("hero") ? (
          <section className="px-4 pb-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1230px] overflow-hidden rounded-[23px] bg-[radial-gradient(circle_at_72%_18%,#1d6051_0,transparent_39%),linear-gradient(135deg,#09171e,#123138_65%,#0a2229)] px-5 py-10 text-white sm:rounded-[33px] sm:px-12 sm:py-16 lg:px-16">
              <div className="grid items-center gap-8 lg:grid-cols-[1.03fr_0.97fr]">
                <motion.div initial="hidden" animate="show" variants={fade}>
                  <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#5bbf9b4d] bg-[#0aa9821c] px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-wide text-[#b7ffe3]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#30eeb3]" />
                    {tc("hero_badge")}
                  </p>
                  <h1 className="max-w-[660px] text-[clamp(2.1rem,4.3vw,3.9rem)] font-semibold leading-[1.09] tracking-tight">
                    {tc("hero_title")}
                  </h1>
                  <p className="mt-5 max-w-[530px] text-base leading-relaxed text-[#c4d6d4]">{tc("hero_sub")}</p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to="/register"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[13px] bg-[#19d6a3] px-6 text-base font-extrabold text-[var(--mg-ink)]"
                    >
                      {tc("cta_primary")} <ArrowRight size={16} />
                    </Link>
                    <a
                      href={demoLeadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[13px] border border-[#58737a] px-6 text-base font-bold text-white"
                    >
                      <Globe size={16} /> {tc("cta_demo")}
                    </a>
                  </div>
                  <p className="mt-6 text-xs font-semibold text-[#b6d2ce]">{tc("hero_trust")}</p>
                </motion.div>
                <HeroPhoneShowcase showcase={cms.showcase} />
              </div>
            </div>
          </section>
        ) : null}

        {sec("howItWorks") ? (
          <section id="how" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-[1230px]">
              <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--mg-brand-strong)]">
                {t("landing_how_title")}
              </p>
              <h2 className="mt-3 text-center text-[clamp(1.8rem,3vw,2.7rem)] font-semibold tracking-tight">
                {tc("how_title")}
              </h2>
              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {[
                  { n: "01", title: "landing_how_short_1", desc: "landing_how_1" },
                  { n: "02", title: "landing_how_short_2", desc: "landing_how_2" },
                  { n: "03", title: "landing_how_short_3", desc: "landing_how_3" },
                ].map((step) => (
                  <article
                    key={step.n}
                    className="rounded-[23px] border border-[var(--mg-border)] bg-white p-8"
                  >
                    <span className="inline-grid place-items-center rounded-xl bg-[#e1f8ee] px-3 py-2 text-sm font-extrabold text-[var(--mg-brand-strong)]">
                      {step.n}
                    </span>
                    <h3 className="mt-6 text-xl font-bold">{t(step.title)}</h3>
                    <p className="mt-2 text-sm text-[var(--mg-muted)]">{t(step.desc)}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {sec("benefits") ? (
          <section id="features" className="scroll-mt-24 px-4 pb-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1230px] rounded-[36px] bg-white px-5 py-12 sm:px-9 sm:py-16">
              <h2 className="text-center text-[clamp(1.8rem,3vw,2.7rem)] font-semibold">{tc("benefits_title")}</h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-[var(--mg-muted)]">{tc("benefits_sub")}</p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {benefits.map((b) => (
                  <article key={b.t} className="rounded-[20px] border border-[#e8efeb] bg-[#fbfdfc] p-7">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#daf9e9] text-[var(--mg-brand-strong)]">
                      <b.icon size={20} />
                    </div>
                    <h3 className="mt-4 text-lg font-bold">{t(b.t)}</h3>
                    <p className="mt-2 text-sm text-[var(--mg-muted)]">{t(b.d)}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {sec("templates") ? (
          <section id="templates" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-[1230px]">
              <h2 className="text-[clamp(1.8rem,3vw,2.7rem)] font-semibold">{tc("templates_title")}</h2>
              <p className="mt-3 max-w-xl text-[var(--mg-muted)]">{tc("templates_sub")}</p>
              <p className="mt-2 text-xs text-[var(--mg-muted)]">{t("landing_demo_disclaimer")}</p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {showcaseTemplates.map((tpl) => (
                  <article key={tpl.id} className="overflow-hidden rounded-[23px] border border-[var(--mg-border)] bg-white">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={tpl.heroImage}
                        alt={`${tpl.name} — MenuGo menyu şablonu`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        width={400}
                        height={300}
                      />
                    </div>
                    <div className="flex items-center justify-between p-5">
                      <p className="font-bold">{tpl.name}</p>
                      <a
                        href={`${demoBase}&previewTemplate=${encodeURIComponent(tpl.id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-[var(--mg-brand-strong)]"
                      >
                        {t("landing_preview_live")}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
              <a
                href={demoLeadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-[13px] bg-[var(--mg-ink)] px-5 text-sm font-bold text-white"
              >
                {tc("cta_demo")} <ArrowRight size={15} />
              </a>
            </div>
          </section>
        ) : null}

        {sec("comparison") ? (
          <section className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-center text-[clamp(1.8rem,3vw,2.7rem)] font-semibold">{tc("comparison_title")}</h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-[var(--mg-muted)]">{tc("comparison_sub")}</p>
              <div className="mt-10 overflow-hidden rounded-[22px] border border-[var(--mg-border)] bg-white">
                {[
                  ["landing_comparison_row_update", "landing_comparison_paper_update", "landing_comparison_us_update"],
                  ["landing_comparison_row_print", "landing_comparison_paper_print", "landing_comparison_us_print"],
                  ["landing_comparison_row_lang", "landing_comparison_paper_lang", "landing_comparison_us_lang"],
                  ["landing_comparison_row_order", "landing_comparison_paper_order", "landing_comparison_us_order"],
                ].map(([label, paper, us]) => (
                  <div key={label} className="grid grid-cols-[1.2fr_1fr_1fr] items-center border-b border-[var(--mg-border)] last:border-b-0">
                    <div className="px-4 py-4 text-sm font-semibold sm:px-6">{t(label)}</div>
                    <div className="px-3 py-4 text-center text-sm text-[var(--mg-muted)]">
                      <X size={14} className="mr-1 inline text-neutral-400" /> {t(paper)}
                    </div>
                    <div className="bg-[#f4fbf7] px-3 py-4 text-center text-sm font-semibold">
                      <Check size={14} className="mr-1 inline text-[var(--mg-brand-strong)]" /> {t(us)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {sec("pricing") ? (
          <section id="pricing" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-[1230px]">
              <h2 className="text-center text-[clamp(1.8rem,3vw,2.7rem)] font-semibold">{tc("pricing_title")}</h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-[var(--mg-muted)]">{tc("pricing_sub")}</p>
              {plansLoading ? (
                <p className="mt-10 text-center text-sm text-[var(--mg-muted)]">{t("loading")}</p>
              ) : plansError ? (
                <div className="mt-10 text-center">
                  <p className="text-sm text-[var(--mg-danger)]">{t("register_network_error")}</p>
                  <button
                    type="button"
                    onClick={loadPlans}
                    className="mt-3 min-h-12 rounded-xl bg-[var(--mg-ink)] px-5 text-sm font-bold text-white"
                  >
                    {t("btn_continue")}
                  </button>
                </div>
              ) : (
                <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {plans.map((p, idx) => {
                    const popular = idx === popularPlanIndex;
                    return (
                      <article
                        key={p.id}
                        className={cn(
                          "flex flex-col rounded-[22px] border p-8",
                          popular
                            ? "border-[#0a2227] bg-[#0a2227] text-white"
                            : "border-[var(--mg-border)] bg-white"
                        )}
                      >
                        <h3 className="text-2xl font-bold">{p.name}</h3>
                        <p className="mt-4 text-4xl font-semibold">
                          ₼{Number(p.price_monthly).toFixed(0)}
                          <span className={cn("text-base font-normal", popular ? "text-[#b9d2c8]" : "text-[var(--mg-muted)]")}>
                            {t("plan_price_month_suffix")}
                          </span>
                        </p>
                        <ul className={cn("mt-6 flex-1 space-y-2 text-sm", popular ? "text-[#b9d2c8]" : "text-[var(--mg-muted)]")}>
                          <li>{t("products")}: {lim(Number(p.max_products))}</li>
                          <li>{t("categories")}: {lim(Number(p.max_categories))}</li>
                          <li>{t("plan_max_templates")}: {lim(Number(p.max_templates))}</li>
                          <li>WhatsApp: {p.whatsapp_order_enabled ? t("landing_comparison_us_order") : "—"}</li>
                        </ul>
                        <Link
                          to="/register"
                          className={cn(
                            "mt-8 inline-flex min-h-12 items-center justify-center rounded-[13px] text-sm font-extrabold",
                            popular ? "bg-[#19d6a3] text-[var(--mg-ink)]" : "bg-[var(--mg-ink)] text-white"
                          )}
                        >
                          {Number(p.price_monthly) === 0 ? tc("cta_primary") : t("landing_buy")}
                        </Link>
                      </article>
                    );
                  })}
                </div>
              )}
              <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-[var(--mg-muted)]">{t("landing_pricing_note")}</p>
            </div>
          </section>
        ) : null}

        {sec("testimonials") && verifiedTestimonials.length > 0 ? (
          <section className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1230px]">
              <h2 className="text-[clamp(1.8rem,3vw,2.7rem)] font-semibold">{tc("testimonials_title")}</h2>
              <div className="mt-8 grid gap-5 lg:grid-cols-3">
                {verifiedTestimonials.map((r, i) => (
                  <figure key={i} className="rounded-[22px] border border-[var(--mg-border)] bg-white p-6">
                    <blockquote className="text-sm leading-relaxed">“{r.quote}”</blockquote>
                    <figcaption className="mt-4 text-sm font-bold">
                      {r.name}
                      {r.role ? <span className="block text-xs font-normal text-[var(--mg-muted)]">{r.role}</span> : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {sec("faq") ? (
          <section id="faq" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <h2 className="text-[clamp(1.8rem,3vw,2.7rem)] font-semibold">{tc("faq_title")}</h2>
                <p className="mt-3 text-[var(--mg-muted)]">{tc("faq_sub")}</p>
              </div>
              <div className="rounded-[22px] border border-[var(--mg-border)] bg-white px-6 sm:px-8">
                {faq.map((item, i) => (
                  <FaqRow key={item.q} item={item} defaultOpen={i === 0} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {sec("finalCta") ? (
          <section className="px-4 pb-16 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1230px] flex-col items-start justify-between gap-6 rounded-[31px] bg-[#0a2129] px-7 py-12 text-white sm:flex-row sm:items-center sm:px-16 sm:py-16">
              <h2 className="max-w-[660px] text-[clamp(1.7rem,3vw,2.2rem)] font-semibold leading-tight">
                {tc("final_cta_title")}
              </h2>
              <Link
                to="/register"
                className="inline-flex min-h-12 items-center gap-2 rounded-[13px] bg-[#19d6a3] px-6 text-sm font-extrabold text-[var(--mg-ink)]"
              >
                {tc("cta_primary")} <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        ) : null}
      </main>

      {sec("footer") ? (
        <footer className="border-t border-[var(--mg-border)] px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1230px] flex-col justify-between gap-4 text-sm text-[var(--mg-muted)] sm:flex-row">
            <div className="flex items-center gap-2 text-[var(--mg-ink)]">
              <BrandMark className="h-8 w-8" />
              <BrandWordmark ink className="text-lg font-extrabold" />
            </div>
            <p>{tc("footer_tagline")}</p>
            <a href="mailto:info@menugo.az" className="text-[var(--mg-brand-strong)] hover:underline">
              info@menugo.az
            </a>
          </div>
          <p className="mx-auto mt-6 max-w-[1230px] text-xs text-[var(--mg-muted)]">© 2026 {brand}</p>
        </footer>
      ) : null}

      {sec("stickyBar") ? (
        <div className="fixed bottom-3 left-3 right-3 z-40 rounded-[15px] bg-[var(--mg-ink)] p-1.5 shadow-lg sm:hidden">
          <Link
            to="/register"
            className="flex min-h-12 items-center justify-center rounded-[11px] bg-[#19d6a3] text-sm font-extrabold text-[var(--mg-ink)]"
          >
            {tc("sticky_bar")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
