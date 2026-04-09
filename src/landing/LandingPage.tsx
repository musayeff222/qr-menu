import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValueEvent,
  type Variants,
} from "motion/react";
import {
  ArrowRight,
  Check,
  Globe,
  Instagram,
  LayoutDashboard,
  MessageSquare,
  QrCode,
  Send,
  Smartphone,
  Sparkles,
  Store,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MENU_TEMPLATES } from "../menu-templates";
import { DEMO_MENU_PREVIEW_SLUG, DEMO_QR_PUBLIC_SLUG } from "../demoMenuSlug";
import { useI18nBundle } from "../i18n/bundleContext";
import type { LandingCms, LandingCmsCopy } from "../lib/landingCms";
import {
  CMS_COPY_I18N_KEYS,
  DEFAULT_HERO_SHOWCASE_SLIDES,
  DEFAULT_HERO_SHOWCASE_SLOGANS,
  parseLandingCms,
  sectionEnabled,
} from "../lib/landingCms";

function cn(...i: (string | boolean | undefined)[]) {
  return twMerge(clsx(i));
}

function useT(lang: string) {
  const bundle = useI18nBundle();
  return (key: string) =>
    bundle[lang]?.[key] || bundle.en?.[key] || bundle.az?.[key] || key;
}

/** Primary CTA with soft ripple on click */
function RippleLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  return (
    <Link
      to={to}
      className={cn("relative block overflow-hidden", className)}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const id = Date.now();
        setRipples((xs) => [...xs, { x: e.clientX - r.left, y: e.clientY - r.top, id }]);
        window.setTimeout(() => setRipples((xs) => xs.filter((k) => k.id !== id)), 600);
      }}
    >
      {children}
      {ripples.map((rk) => (
        <span
          key={rk.id}
          className="pointer-events-none absolute rounded-full bg-white/35"
          style={{
            left: rk.x,
            top: rk.y,
            width: 100,
            height: 100,
            transform: "translate(-50%, -50%) scale(0)",
            animation: "landingRipple 0.55s ease-out forwards",
          }}
        />
      ))}
      <style>{`@keyframes landingRipple { to { transform: translate(-50%, -50%) scale(3); opacity: 0; } }`}</style>
    </Link>
  );
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

function AutoMenuShowcase({ showcase }: { showcase?: LandingCms["showcase"] }) {
  const slides =
    Array.isArray(showcase?.slides) && showcase.slides.length > 0
      ? showcase.slides
      : DEFAULT_HERO_SHOWCASE_SLIDES;
  const slogans =
    Array.isArray(showcase?.slogans) && showcase.slogans.length > 0
      ? showcase.slogans
      : DEFAULT_HERO_SHOWCASE_SLOGANS;
  const slideMs = 3200;
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setSlide((p) => (p + 1) % slides.length), slideMs);
    return () => window.clearInterval(id);
  }, [slideMs, slides.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[590px] overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-[#141826] via-[#111428] to-[#0a0e1b] p-4 shadow-[0_35px_80px_-20px_rgba(0,0,0,0.8)]"
    >
      <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div className="absolute -right-12 -bottom-12 h-36 w-36 rounded-full bg-amber-400/20 blur-3xl" />
      <motion.div
        className="pointer-events-none absolute -left-1/3 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ["0%", "420%"] }}
        transition={{ duration: 4.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.2 }}
      />

      <div className="relative mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-2.5 py-2">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-fuchsia-600 shadow-lg shadow-rose-500/30">
            <QrCode size={18} />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#111428]" />
          </span>
          <span className="text-xs font-black uppercase tracking-[0.15em] text-rose-100">QRMENU</span>
        </div>
        <div className="w-20" />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/25 p-3">
        <motion.div
          key={`s-${slide}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 rounded-xl border border-rose-300/30 bg-gradient-to-r from-rose-500/20 to-fuchsia-500/20 px-3 py-2 text-sm font-bold text-rose-100"
        >
          {slogans[slide % slogans.length]}
        </motion.div>

        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
          {slides.map((tpl, i) => (
            <motion.div
              key={tpl.id}
              className="absolute inset-0"
              animate={{
                opacity: i === slide ? 1 : 0,
                scale: i === slide ? 1 : 1.06,
                x: i === slide ? 0 : i < slide ? -16 : 16,
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.img
                src={tpl.heroImage}
                alt={tpl.name}
                className="h-full w-full object-cover"
                loading="lazy"
                animate={i === slide ? { scale: 1.06 } : { scale: 1.02 }}
                transition={{ duration: slideMs / 1000, ease: "linear" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm font-bold text-white">{tpl.name}</p>
                <p className="text-[11px] text-slate-300">{tpl.category}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {slides.map((tpl, i) => (
              <span
                key={tpl.id}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === slide ? "w-6 bg-rose-400" : "w-2 bg-white/30"
                )}
              />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-slate-300">
            Şablon {slide + 1}/{slides.length}
          </span>
        </div>
        <div className="mt-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            key={`p-${slide}`}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: slideMs / 1000, ease: "linear" }}
            className="h-1 rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-amber-400"
          />
        </div>
      </div>
    </motion.div>
  );
}

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
  const templateStripRef = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  const [scrollPct, setScrollPct] = useState(0);
  useMotionValueEvent(smoothProgress, "change", (v) => setScrollPct(v));

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

  const t = useT(lang);

  const tc = (k: keyof LandingCmsCopy) => {
    const raw = cms.copy?.[k];
    if (raw != null && String(raw).trim()) return String(raw).trim();
    const ik = CMS_COPY_I18N_KEYS[k] as string;
    return t(ik);
  };

  const sec = (k: Parameters<typeof sectionEnabled>[1]) => sectionEnabled(cms, k);

  useEffect(() => {
    const title =
      (cms.copy?.meta_title && String(cms.copy.meta_title).trim()) ||
      bundle[lang]?.["landing_meta_title"] ||
      bundle.en?.["landing_meta_title"] ||
      bundle.az?.["landing_meta_title"] ||
      "QRMenu";
    const desc =
      (cms.copy?.meta_description && String(cms.copy.meta_description).trim()) ||
      bundle[lang]?.["landing_meta_description"] ||
      bundle.en?.["landing_meta_description"] ||
      bundle.az?.["landing_meta_description"] ||
      "";
    document.title = title;
    let el = document.querySelector('meta[name="description"]');
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute("name", "description");
      document.head.appendChild(el);
    }
    el.setAttribute("content", desc);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical && typeof window !== "undefined") {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    if (canonical && typeof window !== "undefined") {
      canonical.setAttribute("href", window.location.origin + "/");
    }
  }, [lang, bundle, cms.copy?.meta_title, cms.copy?.meta_description]);

  const lim = (n: number) => (n < 0 ? "∞" : String(n));

  const benefits = [
    { icon: QrCode, t: "landing_benefit_qr_t", d: "landing_benefit_qr_d" },
    { icon: Smartphone, t: "landing_benefit_mobile_t", d: "landing_benefit_mobile_d" },
    { icon: Sparkles, t: "landing_benefit_templates_t", d: "landing_benefit_templates_d" },
    { icon: MessageSquare, t: "landing_benefit_wa_t", d: "landing_benefit_wa_d" },
    { icon: LayoutDashboard, t: "landing_benefit_panel_t", d: "landing_benefit_panel_d" },
    { icon: Check, t: "landing_benefit_save_t", d: "landing_benefit_save_d" },
    { icon: Globe, t: "landing_benefit_domain_t", d: "landing_benefit_domain_d" },
    { icon: Send, t: "landing_benefit_speed_t", d: "landing_benefit_speed_d" },
  ] as const;

  const showcaseTemplates = MENU_TEMPLATES.slice(0, 12);
  const demoBase = `/r/${DEMO_MENU_PREVIEW_SLUG}?preview=true`;
  const demoLeadUrl = `/demo/${DEMO_QR_PUBLIC_SLUG}`;

  const proIx = plans.findIndex((p) => p.slug === "pro" || p.slug === "standart");
  const popularPlanIndex =
    proIx >= 0 ? proIx : plans.length > 1 ? Math.min(1, plans.length - 1) : 0;

  const scrollTemplates = (dir: -1 | 1) => {
    const el = templateStripRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(320, el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#07080f] pb-24 text-white antialiased overflow-x-hidden selection:bg-rose-500/40 selection:text-white sm:pb-0">
      {/* Progress bar */}
      <div
        className="fixed left-0 top-0 z-[100] h-[3px] origin-left bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400"
        style={{ transform: `scaleX(${scrollPct})` }}
        aria-hidden
      />

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-fuchsia-600/25 blur-[120px]"
          style={{ animation: "float1 18s ease-in-out infinite" }}
        />
        <div
          className="absolute -right-1/4 top-1/3 h-[500px] w-[500px] rounded-full bg-rose-600/20 blur-[100px]"
          style={{ animation: "float2 22s ease-in-out infinite" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.06)_0%,transparent_55%)]" />
        <style>{`@keyframes float1 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(40px,30px) scale(1.05);} }
          @keyframes float2 { 0%,100%{transform:translate(0,0);} 50%{transform:translate(-50px,20px);} }`}</style>
      </div>

      {/* Nav */}
      <header className="relative z-20 border-b border-white/[0.07] bg-[#07080f]/75 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 shadow-lg shadow-rose-500/25">
              <QrCode className="text-white" size={22} />
            </span>
            QRMenu
          </Link>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none backdrop-blur"
              aria-label={t("language")}
            >
              <option value="az" className="bg-slate-900">
                AZ
              </option>
              <option value="en" className="bg-slate-900">
                EN
              </option>
              <option value="ru" className="bg-slate-900">
                RU
              </option>
              <option value="tr" className="bg-slate-900">
                TR
              </option>
            </select>
            {sec("navRegisterLink") ? (
              <Link
                to="/register"
                className="hidden rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur transition hover:border-white/35 hover:bg-white/10 sm:inline-flex"
              >
                {tc("cta_primary")}
              </Link>
            ) : null}
            <Link
              to="/panel"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-fuchsia-600 px-4 py-2 text-sm font-semibold shadow-lg shadow-rose-500/30 transition hover:brightness-110"
            >
              <Store size={18} /> {t("restaurant_staff_login")}
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        {sec("hero") ? (
        <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pb-28 sm:pt-12 lg:pt-14">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 lg:items-start">
            <motion.div initial="hidden" animate="show" variants={stagger} className="text-center lg:text-left lg:-mt-1">
              <motion.p
                variants={fadeUp}
                className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-gradient-to-r from-amber-500/15 to-rose-500/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-100/95 shadow-sm backdrop-blur-md sm:text-xs"
              >
                <Sparkles size={14} className="text-amber-300" /> {tc("hero_badge")}
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="text-4xl font-black leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.35rem] lg:leading-[1.05]"
              >
                <span className="bg-gradient-to-r from-white via-rose-100 to-amber-200 bg-clip-text text-transparent">
                  {tc("hero_title")}
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-xl text-lg text-slate-300 lg:mx-0 lg:text-xl">
                {tc("hero_sub")}
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:justify-start"
              >
                <RippleLink
                  to="/register"
                  className="group rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-fuchsia-600 px-8 py-4 text-base font-bold text-white shadow-[0_20px_50px_-12px_rgba(244,63,94,0.55)] transition hover:shadow-[0_24px_60px_-8px_rgba(244,63,94,0.65)]"
                >
                  <span className="flex items-center justify-center gap-2">
                    {tc("cta_primary")}
                    <ArrowRight className="transition group-hover:translate-x-1" size={20} />
                  </span>
                </RippleLink>
                <a
                  href={demoLeadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-md transition hover:border-white/35 hover:bg-white/10"
                >
                  <Globe size={20} /> {tc("cta_demo")}
                </a>
              </motion.div>
            </motion.div>

            <AutoMenuShowcase showcase={cms.showcase} />
          </div>
        </section>
        ) : null}

        {/* Benefits */}
        {sec("benefits") ? (
        <section className="relative z-10 border-t border-white/[0.06] bg-gradient-to-b from-transparent to-[#0a0c14]/90 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="mb-14 text-center"
            >
              <h2 className="text-3xl font-bold sm:text-4xl">{tc("benefits_title")}</h2>
              <p className="mx-auto mt-3 max-w-2xl text-slate-400">{tc("benefits_sub")}</p>
            </motion.div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -6 }}
                  className="group rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.5)] backdrop-blur-md transition duration-300 hover:border-rose-500/30 hover:shadow-[0_20px_50px_-12px_rgba(244,63,94,0.2)]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/25 to-fuchsia-500/20 text-rose-300 transition group-hover:scale-110">
                    <b.icon size={24} />
                  </div>
                  <h3 className="mb-2 font-bold text-white">{t(b.t)}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{t(b.d)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        ) : null}

        {/* Templates slider */}
        {sec("templates") ? (
        <section className="relative z-10 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <h2 className="text-3xl font-bold sm:text-4xl">{tc("templates_title")}</h2>
                <p className="mt-2 max-w-xl text-slate-400">{tc("templates_sub")}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Previous"
                  onClick={() => scrollTemplates(-1)}
                  className="rounded-xl border border-white/15 bg-white/5 p-3 backdrop-blur transition hover:bg-white/10"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  onClick={() => scrollTemplates(1)}
                  className="rounded-xl border border-white/15 bg-white/5 p-3 backdrop-blur transition hover:bg-white/10"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
            <div
              ref={templateStripRef}
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {showcaseTemplates.map((tpl, idx) => (
                <motion.article
                  key={tpl.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={{ y: -4 }}
                  className="w-[min(85vw,280px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-xl backdrop-blur-md"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={tpl.heroImage}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-white">{tpl.name}</p>
                    <a
                      href={`${demoBase}&previewTemplate=${encodeURIComponent(tpl.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-rose-400 hover:text-rose-300"
                    >
                      {t("landing_preview_live")} <ArrowRight size={16} />
                    </a>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
        ) : null}

        {/* How it works */}
        {sec("howItWorks") ? (
        <section className="relative z-10 border-y border-white/[0.06] bg-[#080a12]/80 py-20 backdrop-blur-sm sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-14 text-center text-3xl font-bold sm:text-4xl"
            >
              {tc("how_title")}
            </motion.h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { Icon: Store, n: "1", title: "landing_how_short_1", desc: "landing_how_1" },
                { Icon: QrCode, n: "2", title: "landing_how_short_2", desc: "landing_how_2" },
                { Icon: Send, n: "3", title: "landing_how_short_3", desc: "landing_how_3" },
              ].map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-8 text-center backdrop-blur-md"
                >
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 shadow-lg">
                    <step.Icon size={28} className="text-white" />
                  </div>
                  <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-rose-300">
                    {step.n}
                  </span>
                  <h3 className="mt-2 text-lg font-bold">{t(step.title)}</h3>
                  <p className="mt-3 text-sm text-slate-400">{t(step.desc)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        ) : null}

        {/* Pricing */}
        {sec("pricing") ? (
        <section className="relative z-10 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="text-3xl font-bold sm:text-4xl">{tc("pricing_title")}</h2>
              <p className="mx-auto mt-3 max-w-2xl text-slate-400">{tc("pricing_sub")}</p>
            </motion.div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((p, idx) => {
                const popular = idx === popularPlanIndex;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.06 }}
                    whileHover={{ y: -6 }}
                    className={cn(
                      "relative flex flex-col overflow-hidden rounded-2xl border bg-white/[0.04] p-8 backdrop-blur-md transition",
                      popular
                        ? "border-rose-500/50 shadow-[0_0_0_1px_rgba(244,63,94,0.3),0_24px_60px_-12px_rgba(244,63,94,0.25)]"
                        : "border-white/10 hover:border-white/20"
                    )}
                  >
                    {popular ? (
                      <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-600 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                        {t("landing_plan_popular")}
                      </span>
                    ) : null}
                    <h3 className="text-xl font-bold text-white">{p.name}</h3>
                    <p className="mt-4 text-4xl font-black text-white">
                      ₼{Number(p.price_monthly).toFixed(0)}
                      <span className="text-base font-normal text-slate-500"> / ay</span>
                    </p>
                    <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-300">
                      <li className="flex gap-2">
                        <Check className="mt-0.5 shrink-0 text-emerald-400" size={18} /> {t("products")}:{" "}
                        {lim(Number(p.max_products))}
                      </li>
                      <li className="flex gap-2">
                        <Check className="mt-0.5 shrink-0 text-emerald-400" size={18} /> {t("categories")}:{" "}
                        {lim(Number(p.max_categories))}
                      </li>
                      <li className="flex gap-2">
                        <Check className="mt-0.5 shrink-0 text-emerald-400" size={18} /> {t("plan_max_templates")}:{" "}
                        {lim(Number(p.max_templates))}
                      </li>
                      <li className="flex gap-2">
                        <Check
                          className={cn(
                            "mt-0.5 shrink-0",
                            p.whatsapp_order_enabled ? "text-emerald-400" : "text-slate-600"
                          )}
                          size={18}
                        />{" "}
                        WhatsApp
                      </li>
                    </ul>
                    <Link
                      to="/register"
                      className={cn(
                        "mt-8 inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-center text-sm font-bold transition",
                        popular
                          ? "bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white shadow-lg shadow-rose-500/30 hover:brightness-110"
                          : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                      )}
                    >
                      <Store size={18} /> {t("landing_buy")}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
        ) : null}

        {/* Final CTA */}
        {sec("finalCta") ? (
        <section className="relative z-10 px-4 pb-24 sm:px-6 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-rose-600/30 via-fuchsia-600/20 to-amber-500/10 p-10 text-center shadow-2xl backdrop-blur-xl sm:p-14"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
            <h2 className="relative text-3xl font-black sm:text-4xl">{tc("final_cta_title")}</h2>
            <Link
              to="/register"
              className="relative mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-10 py-4 text-base font-bold text-slate-900 shadow-xl transition hover:scale-[1.02] active:scale-[0.98]"
            >
              {tc("cta_primary")} <ArrowRight size={20} />
            </Link>
          </motion.div>
        </section>
        ) : null}
      </main>

      {/* Footer */}
      {sec("footer") ? (
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#05060a]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <Link to="/" className="flex items-center gap-2 text-lg font-bold">
                <QrCode className="text-rose-400" size={22} /> QRMenu
              </Link>
              <p className="mt-4 text-sm text-slate-500">{tc("footer_tagline")}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-200">{t("landing_footer_explore")}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li>
                  <Link to="/register" className="hover:text-white">
                    {tc("cta_primary")}
                  </Link>
                </li>
                <li>
                  <Link to="/panel" className="hover:text-white">
                    {t("restaurant_staff_login")}
                  </Link>
                </li>
                <li>
                  <Link to={demoLeadUrl} className="hover:text-white">
                    {tc("cta_demo")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-200">{t("landing_footer_social")}</p>
              <div className="mt-4 flex gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:border-rose-500/40 hover:bg-rose-500/10"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="https://wa.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:border-emerald-500/40 hover:bg-emerald-500/10"
                  aria-label="WhatsApp"
                >
                  <MessageSquare size={20} />
                </a>
              </div>
              <p className="mt-6 text-sm text-slate-500">
                {t("landing_footer_connect")}:{" "}
                <a href="mailto:hello@qrmenu.az" className="text-rose-300 hover:underline">
                  hello@qrmenu.az
                </a>
              </p>
            </div>
          </div>
          <p className="mt-12 border-t border-white/5 pt-8 text-center text-xs text-slate-600">
            {t("landing_footer_legal")}
          </p>
        </div>
      </footer>
      ) : null}

      {/* Sticky mobile CTA */}
      {sec("stickyBar") ? (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#07080f]/92 px-4 py-3 backdrop-blur-xl safe-area-pb sm:hidden">
        <Link
          to="/register"
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-fuchsia-600 py-3.5 text-sm font-bold shadow-lg"
        >
          {tc("sticky_bar")} <ArrowRight size={18} />
        </Link>
      </div>
      ) : null}
    </div>
  );
}
