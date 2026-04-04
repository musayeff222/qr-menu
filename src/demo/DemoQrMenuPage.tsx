import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Palette, Sparkles, X } from "lucide-react";
import CustomerMenuView from "../CustomerMenuView";
import { DEMO_MENU_PREVIEW_SLUG, DEMO_QR_PUBLIC_SLUG } from "../demoMenuSlug";
import { templatesByCategory } from "../menu-templates";
import type { MenuTemplateDef } from "../menu-templates/types";
import { cn } from "../menu-templates/cn";

const ONBOARD_KEY = "qrmenu_lead_demo_onboarding_v1";
const DEMO_SESSION_STORAGE = "qrmenu_demo_session";

const ONBOARD_STEPS = [
  "Bu sizin QR Menu nümunənizdir",
  "Müştərilər bu şəkildə menyunu görəcək",
  "Məhsullara baxıb sifariş verə bilərlər",
  "WhatsApp ilə sifariş göndərilir",
] as const;

function pickDemoTemplates(): MenuTemplateDef[] {
  const byCat = templatesByCategory();
  const order = ["Modern", "Luxury", "Minimal", "Fast Food", "Cafe"] as const;
  const out: MenuTemplateDef[] = [];
  for (const c of order) {
    const first = byCat[c]?.[0];
    if (first) out.push(first);
    const second = byCat[c]?.[1];
    if (second && out.length < 10) out.push(second);
  }
  return out.slice(0, 10);
}

/**
 * `/demo/restaurant-demo` — real demo menyusu, onboarding, şablon keçidi, CTA.
 */
export default function DemoQrMenuPage() {
  const { demoSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tpl, setTpl] = useState(() => searchParams.get("tpl") || "modern-01");
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [onboardIdx, setOnboardIdx] = useState(0);

  const demoTemplates = useMemo(() => pickDemoTemplates(), []);

  useEffect(() => {
    if (demoSlug !== DEMO_QR_PUBLIC_SLUG) return;
    let sk = sessionStorage.getItem(DEMO_SESSION_STORAGE);
    if (!sk) {
      sk =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `s-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      sessionStorage.setItem(DEMO_SESSION_STORAGE, sk);
    }
    void fetch("/api/public/demo-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: DEMO_QR_PUBLIC_SLUG, sessionKey: sk }),
    });
  }, [demoSlug]);

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tpl", tpl);
        return next;
      },
      { replace: true }
    );
  }, [tpl, setSearchParams]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = localStorage.getItem(ONBOARD_KEY) === "1";
    if (!done) {
      setOnboardOpen(true);
      setOnboardIdx(0);
    }
  }, []);

  if (demoSlug !== DEMO_QR_PUBLIC_SLUG) {
    return <Navigate to="/" replace />;
  }

  const finishOnboarding = () => {
    localStorage.setItem(ONBOARD_KEY, "1");
    setOnboardOpen(false);
  };

  const nextOnboard = () => {
    if (onboardIdx < ONBOARD_STEPS.length - 1) setOnboardIdx((i) => i + 1);
    else finishOnboarding();
  };

  return (
    <div className="relative min-h-screen pb-[14rem] sm:pb-[12rem]">
      <CustomerMenuView slug={DEMO_MENU_PREVIEW_SLUG} preview previewTemplateId={tpl} />

      <AnimatePresence>
        {onboardOpen ? (
          <motion.div
            className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/50 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                  <Sparkles size={18} /> Demo QR Menu
                </div>
                <button
                  type="button"
                  onClick={finishOnboarding}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
                  aria-label="Bağla"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">
                  Addım {onboardIdx + 1} / {ONBOARD_STEPS.length}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                  {ONBOARD_STEPS[onboardIdx]}
                </p>
                <div className="flex gap-1.5">
                  {ONBOARD_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-colors",
                        i <= onboardIdx ? "bg-rose-500" : "bg-gray-200 dark:bg-slate-700"
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={nextOnboard}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/25"
                >
                  {onboardIdx < ONBOARD_STEPS.length - 1 ? (
                    <>
                      Növbəti
                      <ChevronRight size={18} />
                    </>
                  ) : (
                    "Başa düşdüm"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 z-[230] border-t border-white/10 bg-slate-950/95 backdrop-blur-md text-white shadow-[0_-8px_32px_rgba(0,0,0,0.35)]">
        <div className="max-w-4xl mx-auto px-3 pt-3 pb-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 mb-2">
            <Palette size={14} />
            Canlı şablon seçimi
          </div>
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            {demoTemplates.map((def) => (
              <button
                key={def.id}
                type="button"
                onClick={() => setTpl(def.id)}
                className={cn(
                  "shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all",
                  tpl === def.id
                    ? "bg-rose-500 border-rose-400 text-white"
                    : "bg-white/5 border-white/15 text-slate-200 hover:bg-white/10"
                )}
              >
                {def.name}
              </button>
            ))}
          </div>
          <div className="border-t border-white/10 pt-3 pb-4 space-y-2">
            <p className="text-center text-xs text-slate-400 px-2">
              Siz də restoranınız üçün belə bir QR Menu yarada bilərsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-center">
              <Link
                to="/register"
                className="inline-flex justify-center items-center rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm py-3.5 px-5 shadow-lg"
              >
                Öz restoranını yarat
              </Link>
              <Link
                to="/register"
                className="inline-flex justify-center items-center rounded-xl border-2 border-white/25 hover:bg-white/10 font-bold text-sm py-3.5 px-5"
              >
                Pulsuz başla
              </Link>
            </div>
            <p className="text-center text-[10px] text-slate-500">
              Daxili menyuya baxış:{" "}
              <Link className="underline text-slate-400 hover:text-white" to={`/r/${DEMO_MENU_PREVIEW_SLUG}?preview=true`}>
                /r/{DEMO_MENU_PREVIEW_SLUG}
              </Link>
            </p>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(ONBOARD_KEY);
                setOnboardIdx(0);
                setOnboardOpen(true);
              }}
              className="block mx-auto text-[10px] text-slate-500 hover:text-slate-300 underline"
            >
              Addım-addım təlimatı yenidən göstər
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

