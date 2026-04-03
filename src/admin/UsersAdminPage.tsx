import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  Search,
  Filter,
  Bell,
  CreditCard,
  Ban,
  CheckCircle,
  X,
} from "lucide-react";
import { authSuperHeaders } from "../lib/headers";
import {
  GhostButton,
  inputCn,
  labelCn,
  PageHeader,
  PageShell,
  PrimaryButton,
  SurfaceCard,
  cn,
} from "./designSystem";

type Row = {
  restaurant: {
    id: number;
    name: string;
    slug: string;
    is_active: boolean | number;
    whatsapp_number?: string;
    created_at?: string;
  };
  user: {
    id: number;
    username: string;
    full_name?: string;
    last_login_at?: string;
  } | null;
  plan: { id: number; name: string } | null;
};

const filterOptions = [
  { value: "all", label: "Hamısı" },
  { value: "active", label: "Aktiv" },
  { value: "inactive", label: "Bloklu" },
  { value: "week", label: "Son 7 gün" },
] as const;

type ListFilter = (typeof filterOptions)[number]["value"];

export default function UsersAdminPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [plans, setPlans] = useState<{ id: number; name: string }[]>([]);
  const [q, setQ] = useState("");
  const [listFilter, setListFilter] = useState<ListFilter>("all");
  const [view, setView] = useState<Row | null>(null);

  const load = () => {
    fetch("/api/admin/owner-accounts", { headers: authSuperHeaders() })
      .then((r) => r.json())
      .then(setRows);
  };

  useEffect(() => {
    load();
    fetch("/api/admin/plans", { headers: authSuperHeaders() })
      .then((r) => r.json())
      .then(setPlans);
  }, []);

  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(({ restaurant: r, user: u }) => {
      const active = r.is_active === true || r.is_active === 1;
      if (listFilter === "active" && !active) return false;
      if (listFilter === "inactive" && active) return false;
      if (listFilter === "week") {
        const t = r.created_at ? new Date(r.created_at).getTime() : 0;
        if (t <= weekAgo) return false;
      }
      if (!needle) return true;
      return (
        r.name.toLowerCase().includes(needle) ||
        r.slug.toLowerCase().includes(needle) ||
        (u?.username && u.username.toLowerCase().includes(needle)) ||
        (u?.full_name && u.full_name.toLowerCase().includes(needle))
      );
    });
  }, [rows, q, listFilter, weekAgo]);

  const notify = async (rid: number) => {
    const title = prompt("Bildiriş başlığı");
    if (!title) return;
    const body = prompt("Mətn (ixtiyari)") || "";
    await fetch(`/api/admin/restaurants/${rid}/owner-notify`, {
      method: "POST",
      headers: { ...authSuperHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    alert("Göndərildi");
  };

  const planOffer = async (rid: number) => {
    const pid = prompt(`Plan ID (mövcud: ${plans.map((p) => `${p.id}=${p.name}`).join(", ")})`);
    if (!pid) return;
    const message = prompt("Əlavə mesaj (ixtiyari)") || "";
    await fetch(`/api/admin/restaurants/${rid}/plan-offer`, {
      method: "POST",
      headers: { ...authSuperHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: Number(pid), message }),
    });
    alert("Təklif bildirişi yaradıldı");
  };

  const toggleBlock = async (r: Row["restaurant"]) => {
    await fetch(`/api/admin/restaurants/${r.id}`, {
      method: "PATCH",
      headers: { ...authSuperHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !(r.is_active === true || r.is_active === 1) }),
    });
    load();
    setView(null);
  };

  return (
    <PageShell>
      <PageHeader
        title="İstifadəçilər"
        subtitle="Restoran sahibləri — cədvəl, axtarış və filtr. “Bax” ilə tam məlumat."
      />

      <SurfaceCard className="p-4 sm:p-5" hoverLift>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className={labelCn}>Axtarış</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                className={cn(inputCn, "pl-10")}
                placeholder="Restoran adı, slug, login, ad soyad…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full sm:w-56">
            <label className={labelCn}>
              <Filter className="inline size-4 mr-1 opacity-70" />
              Filtr
            </label>
            <select
              className={inputCn}
              value={listFilter}
              onChange={(e) => setListFilter(e.target.value as ListFilter)}
            >
              {filterOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-slate-400">
           Nəticə: {filtered.length} / {rows.length}
        </p>
      </SurfaceCard>

      <SurfaceCard className="overflow-hidden p-0 border-2 border-gray-100/80 dark:border-slate-700/80" hoverLift={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[920px]">
            <thead>
              <tr className="bg-gray-50/90 dark:bg-slate-800/90 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                <th className="px-4 py-3">Restoran</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">İstifadəçi</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Qeydiyyat</th>
                <th className="px-4 py-3 text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filtered.map((row) => {
                const r = row.restaurant;
                const u = row.user;
                const pl = row.plan;
                const active = r.is_active === true || r.is_active === 1;
                return (
                  <motion.tr
                    key={r.id}
                    initial={false}
                    className="bg-white dark:bg-slate-900/40 hover:bg-rose-50/40 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-slate-100">{r.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">/r/{r.slug}</td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs">{u?.username ?? "—"}</div>
                      {u?.full_name ? (
                        <div className="text-xs text-gray-500 dark:text-slate-400">{u.full_name}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{pl?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          active
                            ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/35 dark:text-emerald-100"
                            : "bg-red-100 text-red-800 dark:bg-red-900/35 dark:text-red-100"
                        )}
                      >
                        {active ? <CheckCircle size={12} /> : <Ban size={12} />}
                        {active ? "Aktiv" : "Bloklu"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setView(row)}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-gray-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                        >
                          <Eye size={14} /> Bax
                        </button>
                        <button
                          type="button"
                          onClick={() => notify(r.id)}
                          className="rounded-lg border border-gray-200 dark:border-slate-600 p-1.5 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          title="Bildiriş"
                        >
                          <Bell size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => planOffer(r.id)}
                          className="rounded-lg border border-gray-200 dark:border-slate-600 p-1.5 text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                          title="Plan təklifi"
                        >
                          <CreditCard size={16} />
                        </button>
                        <Link
                          to={`/restaurant/${r.id}`}
                          className="rounded-lg border border-rose-200 dark:border-rose-800 px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          Panel
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-gray-500 dark:text-slate-400">Uyğun qeyd tapılmadı.</p>
        ) : null}
      </SurfaceCard>

      <AnimatePresence>
        {view ? (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setView(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="w-full max-w-lg rounded-2xl border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 px-5 py-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">İstifadəçi məlumatı</h3>
                <button
                  type="button"
                  onClick={() => setView(null)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
                  aria-label="Bağla"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
                <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/50 p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">Restoran</p>
                  <p className="font-bold text-gray-900 dark:text-white">{view.restaurant.name}</p>
                  <p className="font-mono text-xs text-gray-600 dark:text-slate-400">/r/{view.restaurant.slug}</p>
                  <p className="text-xs text-gray-600 dark:text-slate-300">
                    WhatsApp: {view.restaurant.whatsapp_number || "—"}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-slate-300">
                    Yaradılıb:{" "}
                    {view.restaurant.created_at
                      ? new Date(view.restaurant.created_at).toLocaleString()
                      : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/50 p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">Hesab</p>
                  <p>
                    <span className="text-gray-500">Login:</span>{" "}
                    <span className="font-mono font-medium">{view.user?.username ?? "—"}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Ad soyad:</span> {view.user?.full_name ?? "—"}
                  </p>
                  <p className="text-xs">
                    Son giriş:{" "}
                    {view.user?.last_login_at
                      ? new Date(view.user.last_login_at).toLocaleString()
                      : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/50 p-4">
                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400 mb-1">Plan</p>
                  <p className="font-medium">{view.plan?.name ?? "—"}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <PrimaryButton type="button" className="text-sm" onClick={() => notify(view.restaurant.id)}>
                    Bildiriş göndər
                  </PrimaryButton>
                  <GhostButton type="button" className="text-sm" onClick={() => planOffer(view.restaurant.id)}>
                    Plan təklifi
                  </GhostButton>
                  <GhostButton type="button" className="text-sm" onClick={() => toggleBlock(view.restaurant)}>
                    {view.restaurant.is_active ? "Blokla" : "Aktiv et"}
                  </GhostButton>
                  <Link
                    to={`/restaurant/${view.restaurant.id}`}
                    className="inline-flex items-center justify-center rounded-xl border border-rose-300 dark:border-rose-700 px-4 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    Restoran paneli
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageShell>
  );
}
