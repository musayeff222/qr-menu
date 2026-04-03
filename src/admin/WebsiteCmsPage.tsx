import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, NavLink, Outlet, useOutletContext } from "react-router-dom";
import { motion } from "motion/react";
import { authSuperHeaders } from "../lib/headers";
import type { LandingCms, LandingCmsCopy, LandingCmsSections } from "../lib/landingCms";
import { CMS_COPY_I18N_KEYS, DEFAULT_LANDING_CMS, parseLandingCms } from "../lib/landingCms";
import { GhostButton, inputCn, labelCn, PageHeader, PrimaryButton, SurfaceCard, cn } from "./designSystem";

type CmsCtx = {
  cms: LandingCms;
  setCms: React.Dispatch<React.SetStateAction<LandingCms>>;
  busy: boolean;
  save: () => Promise<void>;
};

const CMS_TABS = [
  { path: "general", label: "Ümumi ayarlar" },
  { path: "hero", label: "Hero bölməsi" },
  { path: "cta", label: "CTA və düymələr" },
  { path: "seo", label: "SEO" },
  { path: "footer", label: "Footer" },
] as const;

function useCmsSection() {
  return useOutletContext<CmsCtx>();
}

function SectionToggles({
  keys,
  labels,
}: {
  keys: (keyof LandingCmsSections)[];
  labels: Record<string, string>;
}) {
  const { cms, setCms } = useCmsSection();
  const setSection = (key: keyof LandingCmsSections, v: boolean) => {
    setCms((c) => ({ ...c, sections: { ...c.sections, [key]: v } }));
  };
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {keys.map((key) => (
        <label
          key={key}
          className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-slate-700 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50"
        >
          <input
            type="checkbox"
            checked={cms.sections?.[key] !== false}
            onChange={(e) => setSection(key, e.target.checked)}
          />
          <span className="text-sm font-medium text-gray-800 dark:text-slate-200">{labels[key as string]}</span>
        </label>
      ))}
    </div>
  );
}

function CopyFields({ items }: { items: { key: keyof LandingCmsCopy; label: string; rows?: number }[] }) {
  const { cms, setCms } = useCmsSection();
  const setCopy = (key: keyof LandingCmsCopy, v: string) => {
    setCms((c) => ({ ...c, copy: { ...c.copy, [key]: v } }));
  };
  return (
    <div className="space-y-5 max-w-3xl">
      {items.map(({ key, label, rows }) => (
        <div key={key}>
          <label className={labelCn}>
            {label} <span className="font-normal text-gray-400">({CMS_COPY_I18N_KEYS[key]})</span>
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
  );
}

function CmsGeneralSection() {
  return (
    <div className="space-y-8">
      <SurfaceCard className="p-6" hoverLift>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ümumi bölmələr</h2>
        <SectionToggles
          keys={["benefits", "templates", "howItWorks", "pricing"]}
          labels={{
            benefits: "Üstünlüklər",
            templates: "Şablon slayderi",
            howItWorks: "Necə işləyir",
            pricing: "Qiymət cədvəli",
          }}
        />
      </SurfaceCard>
      <SurfaceCard className="p-6" hoverLift>
        <h2 className="text-lg font-bold mb-4">Üstünlüklər və plan başlıqları</h2>
        <CopyFields
          items={[
            { key: "benefits_title", label: "Üstünlüklər başlığı" },
            { key: "benefits_sub", label: "Üstünlüklər alt mətn" },
            { key: "templates_title", label: "Şablonlar başlığı" },
            { key: "templates_sub", label: "Şablonlar alt mətn" },
            { key: "how_title", label: "“Necə işləyir” başlığı" },
            { key: "pricing_title", label: "Planlar başlığı" },
            { key: "pricing_sub", label: "Planlar alt mətn" },
          ]}
        />
      </SurfaceCard>
      <SurfaceCard className="p-6" hoverLift>
        <h2 className="text-lg font-bold mb-4">Giriş / qeydiyyat (sol panel)</h2>
        <AuthFields />
      </SurfaceCard>
    </div>
  );
}

function AuthFields() {
  const { cms, setCms } = useCmsSection();
  const setAuth = (patch: Partial<NonNullable<LandingCms["auth"]>>) => {
    setCms((c) => ({ ...c, auth: { ...c.auth, ...patch } }));
  };
  return (
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
          onChange={(e) => setAuth({ title: e.target.value })}
        />
      </div>
      <div>
        <label className={labelCn}>Alt mətn</label>
        <textarea
          className={cn(inputCn, "min-h-[4rem]")}
          rows={2}
          value={cms.auth?.subtitle ?? ""}
          onChange={(e) => setAuth({ subtitle: e.target.value })}
        />
      </div>
    </div>
  );
}

function CmsHeroSection() {
  return (
    <SurfaceCard className="p-6 space-y-6" hoverLift>
      <div>
        <h2 className="text-lg font-bold mb-4">Hero bölməsi</h2>
        <SectionToggles keys={["hero"]} labels={{ hero: "Hero (başlıq + telefon)" }} />
      </div>
      <CopyFields
        items={[
          { key: "hero_badge", label: "Hero nişanı (badge)" },
          { key: "hero_title", label: "Əsas başlıq (H1)" },
          { key: "hero_sub", label: "Alt mətn", rows: 3 },
        ]}
      />
    </SurfaceCard>
  );
}

function CmsCtaSection() {
  return (
    <SurfaceCard className="p-6 space-y-6" hoverLift>
      <div>
        <h2 className="text-lg font-bold mb-4">CTA bölmələri</h2>
        <SectionToggles
          keys={["finalCta", "stickyBar", "navRegisterLink"]}
          labels={{
            finalCta: "Son çağırış (CTA)",
            stickyBar: "Mobil yapışan düymə",
            navRegisterLink: "Naviqasiyada “Pulsuz başla”",
          }}
        />
      </div>
      <CopyFields
        items={[
          { key: "cta_primary", label: "Birinci CTA mətni" },
          { key: "cta_demo", label: "İkinci CTA (Demo)" },
          { key: "sticky_bar", label: "Yapışan düymə mətni" },
          { key: "final_cta_title", label: "Son CTA başlığı" },
        ]}
      />
    </SurfaceCard>
  );
}

function CmsSeoSection() {
  return (
    <SurfaceCard className="p-6" hoverLift>
      <h2 className="text-lg font-bold mb-4">SEO</h2>
      <CopyFields
        items={[
          { key: "meta_title", label: "Səhifə title", rows: 1 },
          { key: "meta_description", label: "Meta description", rows: 4 },
        ]}
      />
    </SurfaceCard>
  );
}

function CmsFooterSection() {
  return (
    <SurfaceCard className="p-6 space-y-6" hoverLift>
      <div>
        <h2 className="text-lg font-bold mb-4">Footer</h2>
        <SectionToggles keys={["footer"]} labels={{ footer: "Footer bölməsi" }} />
      </div>
      <CopyFields items={[{ key: "footer_tagline", label: "Footer təsviri", rows: 3 }]} />
    </SurfaceCard>
  );
}

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

  if (!loaded) return <p className="p-8 text-slate-500">Yüklənir…</p>;

  const ctx: CmsCtx = { cms, setCms, busy, save };

  return (
    <div className="space-y-8 lg:space-y-10">
      <Routes>
        <Route element={<CmsShellWrapped ctx={ctx} />}>
          <Route index element={<Navigate to="general" replace />} />
          <Route path="general" element={<CmsGeneralSection />} />
          <Route path="hero" element={<CmsHeroSection />} />
          <Route path="cta" element={<CmsCtaSection />} />
          <Route path="seo" element={<CmsSeoSection />} />
          <Route path="footer" element={<CmsFooterSection />} />
          <Route path="*" element={<Navigate to="general" replace />} />
        </Route>
      </Routes>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
        <PrimaryButton type="button" disabled={busy} onClick={() => void save()}>
          Bütün dəyişiklikləri saxla
        </PrimaryButton>
      </motion.div>
    </div>
  );
}

function CmsShellWrapped({ ctx }: { ctx: CmsCtx }) {
  const { busy, save } = ctx;
  const tabCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
      isActive
        ? "bg-rose-600 text-white shadow-md"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    );

  return (
    <>
      <PageHeader
        title="Web sayt ayarları"
        subtitle="Bölmələrə ayırılmış struktur — ümumi, hero, CTA, SEO, footer."
      >
        <div className="flex flex-wrap gap-2">
          <GhostButton type="button" onClick={() => window.open("/", "_blank")}>
            Sayta bax
          </GhostButton>
          <PrimaryButton type="button" disabled={busy} onClick={() => void save()}>
            {busy ? "…" : "Saxla"}
          </PrimaryButton>
        </div>
      </PageHeader>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide border-b border-gray-200 dark:border-slate-700">
        {CMS_TABS.map((t) => (
          <NavLink key={t.path} to={`/admin/website/${t.path}`} className={tabCls}>
            {t.label}
          </NavLink>
        ))}
      </div>
      <Outlet context={ctx} />
    </>
  );
}
