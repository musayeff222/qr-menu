import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { authSuperHeaders } from "../lib/headers";
import type { LandingCms, LandingCmsCopy, LandingCmsSections } from "../lib/landingCms";
import { CMS_COPY_I18N_KEYS, DEFAULT_LANDING_CMS, parseLandingCms } from "../lib/landingCms";
import { GhostButton, inputCn, labelCn, PageHeader, PageShell, PrimaryButton, SurfaceCard, cn } from "./designSystem";

const SECTION_DEFS: { key: keyof LandingCmsSections; label: string }[] = [
  { key: "hero", label: "Hero (başlıq + telefon)" },
  { key: "benefits", label: "Üstünlüklər" },
  { key: "templates", label: "Şablon slayderi" },
  { key: "howItWorks", label: "Necə işləyir" },
  { key: "pricing", label: "Qiymət cədvəli" },
  { key: "finalCta", label: "Son çağırış (CTA)" },
  { key: "footer", label: "Footer" },
  { key: "stickyBar", label: "Mobil altdan yapışan düymə" },
  { key: "navRegisterLink", label: "Naviqasiyada “Pulsuz başla” linki" },
];

const COPY_FIELDS: { key: keyof LandingCmsCopy; label: string; rows?: number }[] = [
  { key: "hero_badge", label: "Hero nişanı (kiçik badge)" },
  { key: "hero_title", label: "Əsas başlıq (H1)" },
  { key: "hero_sub", label: "Alt mətn (hero)" },
  { key: "cta_primary", label: "Birinci CTA ( məs. Pulsuz başla )" },
  { key: "cta_demo", label: "İkinci CTA ( Demo )" },
  { key: "benefits_title", label: "Üstünlüklər bölmə başlığı" },
  { key: "benefits_sub", label: "Üstünlüklər alt mətni" },
  { key: "templates_title", label: "Şablonlar başlığı" },
  { key: "templates_sub", label: "Şablonlar alt mətni" },
  { key: "how_title", label: "“Necə işləyir” başlığı" },
  { key: "pricing_title", label: "Planlar başlığı" },
  { key: "pricing_sub", label: "Planlar alt mətni" },
  { key: "final_cta_title", label: "Son CTA başlığı" },
  { key: "footer_tagline", label: "Footer təsviri" },
  { key: "sticky_bar", label: "Mobil altdan yapışan düymə mətni" },
  { key: "meta_title", label: "Səhifə title (SEO)", rows: 1 },
  { key: "meta_description", label: "Meta description (SEO)", rows: 3 },
];

export default function WebsiteCmsPage() {
  const [cms, setCms] = useState<LandingCms>({ ...DEFAULT_LANDING_CMS });
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings", { headers: authSuperHeaders() })
      .then((r) => r.json())
      .then((map: Record<string, string>) => {
        setCms(parseLandingCms(map.landing_cms));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: authSuperHeaders(),
        body: JSON.stringify({ settings: { landing_cms: JSON.stringify(cms) } }),
      });
      if (!res.ok) alert(await res.text());
      else alert("Yadda saxlanıldı");
    } finally {
      setBusy(false);
    }
  };

  const setSection = (key: keyof LandingCmsSections, v: boolean) => {
    setCms((c) => ({ ...c, sections: { ...c.sections, [key]: v } }));
  };

  const setCopy = (key: keyof LandingCmsCopy, v: string) => {
    setCms((c) => ({ ...c, copy: { ...c.copy, [key]: v } }));
  };

  const setAuth = (patch: Partial<NonNullable<LandingCms["auth"]>>) => {
    setCms((c) => ({ ...c, auth: { ...c.auth, ...patch } }));
  };

  if (!loaded) return <p className="p-8 text-slate-500">Yüklənir…</p>;

  return (
    <PageShell>
      <PageHeader
        title="Web sayt (Landing)"
        subtitle="Bütün əsas yazılar və bölmələri buradan idarə edin. Boş saxlanan sahələr sistem tərcüməsindən (dil seçiminə görə) götürülür."
      >
        <div className="flex gap-2">
          <GhostButton type="button" onClick={() => window.open("/", "_blank")}>
            Sayta bax
          </GhostButton>
          <PrimaryButton type="button" disabled={busy} onClick={() => void save()}>
            {busy ? "…" : "Saxla"}
          </PrimaryButton>
        </div>
      </PageHeader>

      <SurfaceCard className="p-6" hoverLift>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Bölmələri göstər / gizlət</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTION_DEFS.map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-slate-700 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50"
            >
              <input
                type="checkbox"
                checked={cms.sections?.[key] !== false}
                onChange={(e) => setSection(key, e.target.checked)}
              />
              <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{label}</span>
            </label>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-6" hoverLift>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Mətnlər</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-6">
          Hər sahənin altında i18n açarı göstərilir — boş buraxsanız həmin tərcümə istifadə olunur.
        </p>
        <div className="space-y-5 max-w-3xl">
          {COPY_FIELDS.map(({ key, label, rows }) => (
            <div key={key}>
              <label className={labelCn}>
                {label}{" "}
                <span className="font-normal text-gray-400">({CMS_COPY_I18N_KEYS[key]})</span>
              </label>
              <textarea
                className={cn(inputCn, "min-h-[2.75rem] resize-y")}
                rows={rows ?? 2}
                value={cms.copy?.[key] ?? ""}
                placeholder="Boş — default tərcümə"
                onChange={(e) => setCopy(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard className="p-6" hoverLift>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Giriş / Qeydiyyat səhifəsi (PC)</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          Sol tərəf: böyük şəkil və marketinq mətnləri. Boşdursa default şəkil və fallback mətn.
        </p>
        <div className="grid gap-4 max-w-3xl">
          <div>
            <label className={labelCn}>Şəkil URL</label>
            <input
              className={inputCn}
              value={cms.auth?.image_url ?? ""}
              placeholder="https://..."
              onChange={(e) => setAuth({ image_url: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCn}>Başlıq</label>
            <textarea
              className={cn(inputCn, "min-h-[4rem]")}
              rows={2}
              value={cms.auth?.title ?? ""}
              placeholder="Məs: Restoranınızı rəqəmsallaşdırın"
              onChange={(e) => setAuth({ title: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCn}>Alt mətn</label>
            <textarea
              className={cn(inputCn, "min-h-[4rem]")}
              rows={2}
              value={cms.auth?.subtitle ?? ""}
              placeholder="QR Menu ilə qonaqlara müasir təcrübə verin"
              onChange={(e) => setAuth({ subtitle: e.target.value })}
            />
          </div>
        </div>
      </SurfaceCard>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
        <PrimaryButton type="button" disabled={busy} onClick={() => void save()}>
          Dəyişiklikləri saxla
        </PrimaryButton>
      </motion.div>
    </PageShell>
  );
}
