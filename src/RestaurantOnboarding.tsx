import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, ChevronRight, Store } from "lucide-react";
import { TemplatePicker, resolveMenuTemplate, MENU_TEMPLATE_COUNT, type MenuTemplateDef } from "./menu-templates";
import { authAnyStaffHeaders } from "./lib/headers";
import { useI18nBundle } from "./i18n/bundleContext";

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
    menu_template: "modern-01",
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
        menu_template: r.menu_template || "modern-01",
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

  const host = typeof window !== "undefined" ? window.location.host : "qrmenu.site";

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white pb-24">
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-red-600">
          <Store size={22} />
          <span className="truncate max-w-[10rem]">{t("onboarding_title")}</span>
        </div>
        <div className="flex gap-2 text-xs text-gray-500">
          <span>{step}/3</span>
          <Link to={`/restaurant/${id}`} className="text-red-600 hover:underline">
            {t("onboarding_skip")}
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-red-100 bg-white shadow-lg p-6 space-y-4"
        >
          {step === 1 && (
            <>
              <h1 className="text-xl font-bold text-gray-900">{t("onboarding_step1_title")}</h1>
              <p className="text-sm text-gray-500">{t("onboarding_step1_sub")}</p>
              <input
                className="w-full p-3 border rounded-xl"
                placeholder={t("restaurant_name_label")}
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <input
                className="w-full p-3 border rounded-xl"
                placeholder="Instagram"
                value={profile.instagram}
                onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
              />
              <input
                className="w-full p-3 border rounded-xl"
                placeholder="TikTok"
                value={profile.tiktok}
                onChange={(e) => setProfile({ ...profile, tiktok: e.target.value })}
              />
              <input
                className="w-full p-3 border rounded-xl"
                placeholder={t("whatsapp")}
                value={profile.whatsapp_number}
                onChange={(e) => setProfile({ ...profile, whatsapp_number: e.target.value })}
              />
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">{t("onboarding_location")}</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={geoBusy}
                    onClick={pickGeo}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 text-sm font-medium"
                  >
                    <MapPin size={16} /> {geoBusy ? "…" : t("checkout_location_btn")}
                  </button>
                </div>
                <input
                  className="w-full p-3 border rounded-xl text-sm"
                  placeholder={t("maps_url_placeholder")}
                  value={profile.maps_url}
                  onChange={(e) => setProfile({ ...profile, maps_url: e.target.value })}
                />
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={nextFromStep1}
                className="w-full py-3 rounded-xl bg-red-600 text-white font-bold flex items-center justify-center gap-2"
              >
                {t("onboarding_next")} <ChevronRight size={18} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-xl font-bold text-gray-900">{t("onboarding_step2_title")}</h1>
              <p className="text-sm text-gray-500">{t("onboarding_step2_sub")}</p>
              <p className="text-xs font-mono bg-gray-50 p-3 rounded-lg break-all">
                {t("onboarding_link_example_prefix")} https://{host}/r/<span className="text-red-600">{profile.slug || "restoran-adı"}</span>
              </p>
              <input
                className="w-full p-3 border rounded-xl font-mono"
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
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border">
                  {t("onboarding_back")}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={nextFromStep2}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold"
                >
                  {t("onboarding_next")}
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-xl font-bold text-gray-900">{t("onboarding_step3_title")}</h1>
              <p className="text-sm text-gray-500 mb-2">
                {MENU_TEMPLATE_COUNT}+ {t("templates_section_sub")}
              </p>
              <TemplatePicker
                restaurantSlug={profile.slug || restaurant.slug}
                selectedId={profile.menu_template}
                onSelect={selectTemplate}
                extraTemplates={extraTemplates}
              />
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border">
                  {t("onboarding_back")}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={finish}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold"
                >
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
