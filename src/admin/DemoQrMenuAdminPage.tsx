import React, { useEffect, useState } from "react";
import { ExternalLink, Copy, RefreshCw, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { authSuperHeaders } from "../lib/headers";
import { MENU_TEMPLATES } from "../menu-templates";
import { GhostButton, PrimaryButton, SurfaceCard, cn } from "./designSystem";

type DemoVisitRecent = {
  id: number;
  visitedAt: string;
  sessionKeyShort: string | null;
};

type DemoStatus = {
  internalSlug: string;
  publicDemoPath: string;
  fullDemoUrl: string;
  legacyPreviewUrl: string;
  restaurantId: number | null;
  categoryCount: number;
  productCount: number;
  exists: boolean;
  visits?: {
    totalOpens: number;
    approxUniqueSessions: number;
    todayOpens: number;
    last7DaysOpens: number;
    recent: DemoVisitRecent[];
  };
};

type DemoCategory = {
  id: number;
  name: string;
};

type TemplateOption = {
  id: string;
  name: string;
  source: "builtin" | "custom";
};

async function uploadImageFromDevice(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  const token = localStorage.getItem("adminSession") || localStorage.getItem("restaurantSession");
  if (!token) return null;
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) return null;
  const j = (await res.json()) as { url?: string };
  return j.url ?? null;
}

export default function DemoQrMenuAdminPage() {
  const [st, setSt] = useState<DemoStatus | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const [editorBusy, setEditorBusy] = useState(false);
  const [templateBusy, setTemplateBusy] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<DemoCategory[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category_id: 0,
    description: "",
    image_url: "",
  });

  const load = () => {
    setErr("");
    fetch("/api/admin/demo-qr", { headers: authSuperHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then(setSt)
      .catch((e) => setErr(String(e)));
  };

  useEffect(() => {
    load();
  }, []);

  const loadEditor = async (restaurantId: number) => {
    setEditorBusy(true);
    try {
      const res = await fetch(`/api/admin/restaurants/${restaurantId}/menu`, {
        headers: authSuperHeaders(),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as {
        restaurant?: { menu_template?: string };
        categories?: Array<{ id: number; name: string }>;
        customTemplates?: Array<{ slug_key: string; name: string }>;
      };
      const cats = Array.isArray(data.categories) ? data.categories : [];
      setCategories(cats.map((c) => ({ id: Number(c.id), name: String(c.name || "") })));
      const builtins: TemplateOption[] = MENU_TEMPLATES.map((tpl) => ({
        id: tpl.id,
        name: tpl.name,
        source: "builtin",
      }));
      const customRows = Array.isArray(data.customTemplates) ? data.customTemplates : [];
      const custom: TemplateOption[] = customRows
        .filter((x) => x?.slug_key)
        .map((x) => ({
          id: String(x.slug_key),
          name: String(x.name || x.slug_key),
          source: "custom",
        }));
      setTemplates([...builtins, ...custom]);
      const currentTemplate = String(data.restaurant?.menu_template || builtins[0]?.id || "");
      setSelectedTemplate(currentTemplate);
      setNewProduct((p) => ({
        ...p,
        category_id: p.category_id || Number(cats[0]?.id || 0),
      }));
    } catch (e) {
      setErr(String(e));
    } finally {
      setEditorBusy(false);
    }
  };

  useEffect(() => {
    if (!st?.restaurantId) return;
    void loadEditor(st.restaurantId);
  }, [st?.restaurantId]);

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
    alert("Kopyalandı");
  };

  const ensure = async () => {
    setBusy("ensure");
    setErr("");
    try {
      const r = await fetch("/api/admin/demo-qr/ensure", {
        method: "POST",
        headers: authSuperHeaders(),
      });
      if (!r.ok) throw new Error(await r.text());
      await load();
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(null);
    }
  };

  const reset = async () => {
    if (!confirm("Demo menyunu ilkin Azərbaycan nümunəsinə sıfırlamaq?")) return;
    setBusy("reset");
    setErr("");
    try {
      const r = await fetch("/api/admin/demo-qr/reset", {
        method: "POST",
        headers: authSuperHeaders(),
      });
      if (!r.ok) throw new Error(await r.text());
      await load();
    } catch (e) {
      setErr(String(e));
    } finally {
      setBusy(null);
    }
  };

  const rel = st?.fullDemoUrl || st?.publicDemoPath || "";

  const v = st?.visits;

  const saveTemplate = async () => {
    if (!st?.restaurantId || !selectedTemplate) return;
    setTemplateBusy(true);
    try {
      const r = await fetch(`/api/admin/restaurants/${st.restaurantId}/profile`, {
        method: "PUT",
        headers: authSuperHeaders(),
        body: JSON.stringify({ menu_template: selectedTemplate }),
      });
      if (!r.ok) throw new Error(await r.text());
      alert("Şablon yeniləndi");
    } catch (e) {
      alert(String(e));
    } finally {
      setTemplateBusy(false);
    }
  };

  const addCategory = async () => {
    if (!st?.restaurantId) return;
    if (!newCategoryName.trim()) {
      alert("Kateqoriya adını yazın");
      return;
    }
    setAddingCategory(true);
    try {
      const r = await fetch("/api/admin/categories", {
        method: "POST",
        headers: authSuperHeaders(),
        body: JSON.stringify({ restaurant_id: st.restaurantId, name: newCategoryName.trim() }),
      });
      if (!r.ok) throw new Error(await r.text());
      const row = (await r.json()) as { id: number; name: string };
      setCategories((prev) => [...prev, { id: Number(row.id), name: String(row.name || "") }]);
      setNewCategoryName("");
      setNewProduct((p) => ({
        ...p,
        category_id: p.category_id || Number(row.id),
      }));
      await load();
      alert("Kateqoriya əlavə olundu");
    } catch (e) {
      alert(String(e));
    } finally {
      setAddingCategory(false);
    }
  };

  const addProduct = async () => {
    if (!st?.restaurantId) return;
    const parsedPrice = Number(newProduct.price);
    if (!newProduct.name.trim()) {
      alert("Məhsul adını yazın");
      return;
    }
    if (!newProduct.category_id) {
      alert("Kateqoriya seçin");
      return;
    }
    if (newProduct.price === "" || Number.isNaN(parsedPrice)) {
      alert("Qiyməti daxil edin");
      return;
    }
    setAddingProduct(true);
    try {
      const r = await fetch("/api/admin/products", {
        method: "POST",
        headers: authSuperHeaders(),
        body: JSON.stringify({
          restaurant_id: st.restaurantId,
          category_id: newProduct.category_id,
          name: newProduct.name.trim(),
          description: newProduct.description.trim(),
          price: parsedPrice,
          image_url: newProduct.image_url.trim(),
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      setNewProduct({
        name: "",
        price: "",
        category_id: newProduct.category_id,
        description: "",
        image_url: "",
      });
      await load();
      alert("Məhsul əlavə olundu");
    } catch (e) {
      alert(String(e));
    } finally {
      setAddingProduct(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Demo QR Menu</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Müştərilərə göndərmək üçün xüsusi demo keçid. Məlumat real sistemdə ayrıca{" "}
          <span className="font-mono text-xs">{st?.internalSlug ?? "demo-az-menu"}</span> restoranı ilə saxlanılır
          (digər tenantlardan müstəqil məzmun).
        </p>
      </motion.div>

      {err ? (
        <SurfaceCard className="p-4 border-red-200 text-red-700 dark:border-red-900 dark:text-red-300 text-sm">
          {err}
        </SurfaceCard>
      ) : null}

      <SurfaceCard className="p-6 space-y-4" hoverLift={false}>
        {!st ? (
          <p className="text-gray-500">Yüklənir…</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <span
                className={cn(
                  "text-xs font-bold px-2 py-1 rounded-full",
                  st.exists ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                )}
              >
                {st.exists ? "Demo restoran aktiv" : "Demo yaradılmayıb"}
              </span>
              <span className="text-xs text-gray-500">
                Kateqoriya: {st.categoryCount} · Məhsul: {st.productCount}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Müştəri keçidi (paylaş)
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <code className="flex-1 min-w-[200px] text-sm bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded-lg break-all">
                  {rel}
                </code>
                <GhostButton type="button" onClick={() => copy(rel)}>
                  <Copy size={16} /> Kopyala
                </GhostButton>
                <a
                  href={rel || st.publicDemoPath}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold"
                >
                  <ExternalLink size={16} /> Aç
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Path: <span className="font-mono">{st.publicDemoPath}</span> · Daxili slug:{" "}
                <span className="font-mono">{st.internalSlug}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <PrimaryButton type="button" disabled={!!busy} onClick={() => void ensure()}>
                <Wrench size={16} />
                {busy === "ensure" ? "…" : "Demo restoranı yarat / yoxla"}
              </PrimaryButton>
              <GhostButton
                type="button"
                disabled={!!busy || !st.exists}
                onClick={() => void reset()}
                className="border-amber-300 text-amber-800 dark:text-amber-300"
              >
                <RefreshCw size={16} />
                {busy === "reset" ? "…" : "Menyunu sıfırla"}
              </GhostButton>
            </div>
          </>
        )}
      </SurfaceCard>

      {st?.exists && st.restaurantId ? (
        <SurfaceCard className="p-6 space-y-5" hoverLift={false}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Demo menyu idarəetməsi</h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Buradan demo restoranın şablonunu dəyişə və sürətli məhsul əlavə edə bilərsiniz.
              </p>
            </div>
            <Link
              to={`/restaurant/${st.restaurantId}`}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold"
            >
              Tam paneli aç
            </Link>
          </div>

          {editorBusy ? (
            <p className="text-sm text-gray-500">Yüklənir…</p>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 dark:border-slate-700 p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">Şablon dəyiş</p>
                  <select
                    className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                  >
                    {templates.map((t) => (
                      <option key={`${t.source}-${t.id}`} value={t.id}>
                        {t.name} {t.source === "custom" ? "(custom)" : ""}
                      </option>
                    ))}
                  </select>
                  <PrimaryButton type="button" disabled={templateBusy || !selectedTemplate} onClick={() => void saveTemplate()}>
                    {templateBusy ? "Yadda saxlanır..." : "Şablonu yadda saxla"}
                  </PrimaryButton>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-slate-700 p-4 space-y-3">
                  <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">Kateqoriya əlavə et</p>
                  <input
                    className="w-full p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                    placeholder="Məs: İçkilər"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <GhostButton type="button" disabled={addingCategory} onClick={() => void addCategory()}>
                    {addingCategory ? "Əlavə olunur..." : "Kateqoriya əlavə et"}
                  </GhostButton>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 dark:border-slate-700 p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">
                  Məhsul əlavə et
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                    placeholder="Məhsul adı"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                  />
                  <input
                    type="number"
                    className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                    placeholder="Qiymət"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                  />
                  <select
                    className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                    value={newProduct.category_id}
                    onChange={(e) =>
                      setNewProduct((p) => ({ ...p, category_id: Number(e.target.value) || 0 }))
                    }
                  >
                    <option value={0}>Kateqoriya seçin</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
                    placeholder="Şəkil URL"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct((p) => ({ ...p, image_url: e.target.value }))}
                  />
                  <textarea
                    className="p-2 border rounded-lg md:col-span-2 dark:bg-slate-800 dark:border-slate-600"
                    rows={3}
                    placeholder="Açıqlama (opsional)"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setUploadingImage(true);
                        try {
                          const url = await uploadImageFromDevice(f);
                          if (url) setNewProduct((p) => ({ ...p, image_url: url }));
                          else alert("Şəkil yüklənmədi");
                        } finally {
                          setUploadingImage(false);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    {uploadingImage ? "Şəkil yüklənir..." : "Cihazdan şəkil seç"}
                  </label>
                  <PrimaryButton type="button" disabled={addingProduct} onClick={() => void addProduct()}>
                    {addingProduct ? "Əlavə olunur..." : "Məhsul əlavə et"}
                  </PrimaryButton>
                </div>
              </div>
            </>
          )}
        </SurfaceCard>
      ) : null}

      {st && v ? (
        <SurfaceCard className="p-6 space-y-4" hoverLift={false}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Demo keçid statistikası</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Hər səhifə açılışı qeydə alınır. Sessiya təxmini: eyni brauzer tabı üçün bir UUID (unikal
              ziyarətçi deyil, amma təkrar yükləmələri ayırmağa kömək edir).
            </p>
            </div>
            <GhostButton type="button" className="shrink-0 text-xs" onClick={() => load()}>
              <RefreshCw size={14} /> Yenilə
            </GhostButton>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Ümumi açılış", val: v.totalOpens },
              { label: "Bu gün", val: v.todayOpens },
              { label: "Son 7 gün", val: v.last7DaysOpens },
              { label: "Təxmini unikal sessiya", val: v.approxUniqueSessions },
            ].map((x) => (
              <div
                key={x.label}
                className="rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/50 p-4"
              >
                <p className="text-[11px] font-semibold uppercase text-gray-500 dark:text-slate-400">
                  {x.label}
                </p>
                <p className="text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400 mt-1">
                  {x.val}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-slate-800/80 px-4 py-2 text-xs font-semibold text-gray-600 dark:text-slate-300">
              Son girişlər (ən yeni üstə) · max 150
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
                  <tr className="text-left text-xs text-gray-500 dark:text-slate-400">
                    <th className="px-4 py-2 font-semibold">#</th>
                    <th className="px-4 py-2 font-semibold">Tarix / saat</th>
                    <th className="px-4 py-2 font-semibold">Sessiya (qısa)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {v.recent.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                        Hələ qeyd yoxdur. Demo linki açılanda bura düşəcək.
                      </td>
                    </tr>
                  ) : (
                    v.recent.map((row) => (
                      <tr key={row.id} className="hover:bg-rose-50/30 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-2 font-mono text-xs text-gray-500">{row.id}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {row.visitedAt
                            ? new Date(row.visitedAt).toLocaleString(undefined, {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-600 dark:text-slate-400">
                          {row.sessionKeyShort ?? "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </SurfaceCard>
      ) : null}

      <SurfaceCard className="p-5 text-sm text-gray-600 dark:text-slate-400 space-y-2" hoverLift={false}>
        <p className="font-semibold text-gray-900 dark:text-white">Qeyd</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Demo səhifədə onboarding, şablon keçidi və CTA var.</li>
          <li>Menyu məzmunu «demoMenuSeed» ilə uyğun Azərbaycan nümunəsidir.</li>
          <li>
            Önizləmə üçün əlavə: klassik keçid{" "}
            {st ? <span className="font-mono text-xs">{st.legacyPreviewUrl}</span> : null}.
          </li>
        </ul>
      </SurfaceCard>
    </div>
  );
}
