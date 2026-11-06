import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, ChevronRight } from "lucide-react";
import { TemplatePicker, resolveMenuTemplate, MENU_TEMPLATE_COUNT, type MenuTemplateDef } from "./menu-templates";
import { authAnyStaffHeaders } from "./lib/headers";
import { useI18nBundle } from "./i18n/bundleContext";
import { BrandMark, BrandWordmark } from "./ui/BrandMark";

function asBool(v: unknown) {
  return v === true || v === 1 || v === "1";
}

export default function RestaurantOnboarding() {
  const bundle = useI18nBundle();
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState("az");
  const [busy, setBusy] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [extraTemplates, setExtraTemplates] = useState<MenuTemplateDef[]>([]);
  const [geoBusy, setGeoBusy] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    instagram: "",
    tiktok: "",
    whatsapp_number: "",
    maps_url: "",
    slug: "",
    menu_template: "bistro-rail",
  });

  const t = (k: string) => bundle[lang]?.[k] || bundle.az?.[k] || k;

  useEffect(() => {
    const n = typeof navigator !== "undefined" ? navigator.language?.slice(0, 2).toLowerCase() : "az";
    if (["az", "en", "ru", "tr"].includes(n)) setLang(n);
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((s: { default_language?: string }) => {
        if (s.default_language) setLang(s.default_language);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/admin/restaurants/${id}/menu`, { headers: authAnyStaffHeaders() });
      if (!res.ok) {
        navigate("/panel", { replace: true });
        return;
      }
      const data = await res.json();
      setRestaurant(data.restaurant);
      const r = data.restaurant;
      if (asBool(r.onboarding_completed)) {
        navigate(`/restaurant/${id}`, { replace: true });
        return;
      }
      setProfile({
        name: r.name || "",
        instagram: r.instagram || "",
        tiktok: r.tiktok || "",
        whatsapp_number: r.whatsapp_number || "",
        maps_url: r.maps_url || "",
        slug: r.slug || "",
        menu_template: r.menu_template || "bistro-rail",
      });
      const rows = data.customTemplates || [];
      setExtraTemplates(
        rows.map((row: { slug_key: string; name: string; category: string; hero_image_url?: string }) =>
          resolveMenuTemplate(row.slug_key, [row])
        )
      );
    })();
  }, [id, navigate]);

  const savePartial = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/restaurants/${id}/profile`, {
      method: "PUT",
      headers: authAnyStaffHeaders(),
      body: JSON.stringify(body),
    });
    return res.ok;
  };

  const pickGeo = () => {
    if (!navigator.geolocation) return;
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setProfile((p) => ({
          ...p,
          maps_url: `https://www.google.com/maps?q=${latitude},${longitude}`,
        }));
        setGeoBusy(false);
      },
      () => setGeoBusy(false),
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  };

  const nextFromStep1 = async () => {
    if (!profile.name.trim()) return;
    setBusy(true);
    await savePartial({
      name: profile.name.trim(),
      instagram: profile.instagram.trim(),
      tiktok: profile.tiktok.trim(),
      whatsapp_number: profile.whatsapp_number.trim(),
      maps_url: profile.maps_url.trim(),
    });
    setBusy(false);
    setStep(2);
  };

  const nextFromStep2 = async () => {
    if (!profile.slug.trim()) return;
    setBusy(true);
    await savePartial({ slug: profile.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") });
    setBusy(false);
    setStep(3);
  };

  const finish = async () => {
    setBusy(true);
    await savePartial({ menu_template: profile.menu_template, onboarding_completed: true });
    setBusy(false);
    navigate(`/restaurant/${id}`, { replace: true });
  };

  const selectTemplate = async (tpl: MenuTemplateDef) => {
    setProfile((p) => ({ ...p, menu_template: tpl.id }));
    await savePartial({ menu_template: tpl.id });
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">{t("loading")}</p>
      </div>
    );
  }

  const host = typeof window !== "undefined" ? window.location.host : "menugo.az";
  const fieldCls =
    "w-full min-h-[48px] rounded-xl border border-[var(--mg-border)] bg-white px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-[var(--mg-brand)]/35";
  const primaryCls =
    "min-h-[48px] flex-1 rounded-xl bg-[var(--mg-brand)] py-3 font-bold text-white disabled:opacity-60";
  const ghostCls = "min-h-[48px] flex-1 rounded-xl border border-[var(--mg-border)] bg-white py-3 font-semibold";

  return (
    <div className="min-h-screen bg-[var(--mg-paper)] pb-24">
      <header className="sticky top-0 z-10 border-b border-[var(--mg-border)] bg-white/90 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2 font-bold text-[var(--mg-ink)]">
          <BrandMark className="h-8 w-8 shrink-0" />
          <BrandWordmark className="truncate text-base" ink />
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--mg-muted)]">
          <span aria-current="step">{step}/3</span>
          <select
            aria-label={t("language")}
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-lg border border-[var(--mg-border)] bg-white px-2 py-1 text-xs font-bold"
          >
            <option value="az">AZ</option>
            <option value="en">EN</option>
            <option value="ru">RU</option>
            <option value="tr">TR</option>
          </select>
          <Link to={`/restaurant/${id}`} className="min-h-11 inline-flex items-center text-[var(--mg-brand-strong)] hover:underline">
            {t("onboarding_skip")}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-6">
        <ol className="mb-5 grid grid-cols-3 gap-2" aria-hidden>
          {[1, 2, 3].map((n) => (
            <li key={n} className={`h-1.5 rounded-full ${step >= n ? "bg-[var(--mg-brand)]" : "bg-[var(--mg-border)]"}`} />
          ))}
        </ol>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 rounded-2xl border border-[var(--mg-border)] bg-white p-6 shadow-lg"
        >
          {step === 1 && (
            <>
              <h1 className="text-xl font-bold text-[var(--mg-ink)]">{t("onboarding_step1_title")}</h1>
              <p className="text-sm text-[var(--mg-muted)]">{t("onboarding_step1_sub")}</p>
              <label className="block text-sm font-medium text-[var(--mg-ink)]">
                {t("restaurant_name_label")}
                <input
                  className={`${fieldCls} mt-1.5`}
                  placeholder={t("restaurant_name_label")}
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </label>
              <details className="rounded-xl border border-[var(--mg-border)] bg-[var(--mg-paper)] p-3">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--mg-ink)]">
                  {t("onboarding_optional")}
                </summary>
                <div className="mt-3 space-y-3">
                  <input
                    className={fieldCls}
                    placeholder="Instagram"
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                  />
                  <input
                    className={fieldCls}
                    placeholder="TikTok"
                    value={profile.tiktok}
                    onChange={(e) => setProfile({ ...profile, tiktok: e.target.value })}
                  />
                  <input
                    className={fieldCls}
                    placeholder={t("whatsapp")}
                    value={profile.whatsapp_number}
                    onChange={(e) => setProfile({ ...profile, whatsapp_number: e.target.value })}
                  />
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[var(--mg-muted)]">{t("onboarding_location")}</label>
                    <button
                      type="button"
                      disabled={geoBusy}
                      onClick={pickGeo}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium"
                    >
                      <MapPin size={16} /> {geoBusy ? "…" : t("checkout_location_btn")}
                    </button>
                    <input
                      className={`${fieldCls} text-sm`}
                      placeholder={t("maps_url_placeholder")}
                      value={profile.maps_url}
                      onChange={(e) => setProfile({ ...profile, maps_url: e.target.value })}
                    />
                  </div>
                </div>
              </details>
              <button
                type="button"
                disabled={busy || !profile.name.trim()}
                onClick={nextFromStep1}
                className={`${primaryCls} flex w-full items-center justify-center gap-2`}
              >
                {t("onboarding_next")} <ChevronRight size={18} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-xl font-bold text-[var(--mg-ink)]">{t("onboarding_step2_title")}</h1>
              <p className="text-sm text-[var(--mg-muted)]">{t("onboarding_step2_sub")}</p>
              <p className="break-all rounded-lg bg-[var(--mg-paper)] p-3 font-mono text-xs">
                {t("onboarding_link_example_prefix")} https://{host}/r/
                <span className="text-[var(--mg-brand-strong)]">{profile.slug || "restoran-adi"}</span>
              </p>
              <input
                className={`${fieldCls} font-mono`}
                placeholder={t("slug_label")}
                value={profile.slug}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  })
                }
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)} className={ghostCls}>
                  {t("onboarding_back")}
                </button>
                <button type="button" disabled={busy || !profile.slug.trim()} onClick={nextFromStep2} className={primaryCls}>
                  {t("onboarding_next")}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-xl font-bold text-[var(--mg-ink)]">{t("onboarding_step3_title")}</h1>
              <p className="mb-2 text-sm text-[var(--mg-muted)]">
                {MENU_TEMPLATE_COUNT}+ {t("templates_section_sub")}
              </p>
              <TemplatePicker
                restaurantSlug={profile.slug || restaurant.slug}
                selectedId={profile.menu_template}
                onSelect={selectTemplate}
                extraTemplates={extraTemplates}
                t={t}
              />
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setStep(2)} className={ghostCls}>
                  {t("onboarding_back")}
                </button>
                <button type="button" disabled={busy} onClick={finish} className={primaryCls}>
                  {t("onboarding_finish")}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
