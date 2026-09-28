import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  NavLink,
  useNavigate,
  Link,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Store,
  Palette,
  Bell,
  Settings,
  LogOut,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeft,
  Server,
  Utensils,
  QrCode,
  Globe,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  Ticket,
  Users,
  Inbox,
  ChevronDown,
  TrendingUp,
  AlertTriangle,
  CalendarClock,
  Star,
  Ban,
  Sparkles,
  Info,
} from "lucide-react";
import { motion } from "motion/react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { authSuperHeaders } from "../lib/headers";
import { MENU_TEMPLATES, type MenuTemplateDef } from "../menu-templates";
import WebsiteCmsPage from "./WebsiteCmsPage";
import DemoQrMenuAdminPage from "./DemoQrMenuAdminPage";

function cn(...i: (string | boolean | undefined)[]) {
  return twMerge(clsx(i));
}

function MiniSparkline({
  series,
  className,
  color = "rgb(225 29 72)",
}: {
  series: { day: string; count: number }[];
  className?: string;
  color?: string;
}) {
  const data = series?.length ? series.map((s) => s.count) : [0];
  const max = Math.max(...data, 1);
  const w = 140;
  const h = 40;
  const pad = 3;
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const pts = data
    .map((v, i) => {
      const x = pad + i * step;
      const y = pad + (1 - v / max) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg
      className={cn("shrink-0", className)}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts}
        className="drop-shadow-sm"
      />
    </svg>
  );
}

function Card({
  className,
  children,
  ...p
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900/80 shadow-sm overflow-hidden",
        className
      )}
      {...p}
    >
      {children}
    </div>
  );
}

function Button({
  className,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50",
        className
      )}
      {...p}
    />
  );
}

function AdminLayoutShell() {
  const nav = useNavigate();
  const loc = useLocation();
  const settingsPaths =
    loc.pathname.startsWith("/admin/settings") || loc.pathname.startsWith("/admin/website");
  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem("adminSidebarCollapsed") === "1"
  );
  const [dark, setDark] = useState(() =>
    localStorage.getItem("adminTheme") === "dark"
  );
  const [settingsOpen, setSettingsOpen] = useState(settingsPaths);

  useEffect(() => {
    if (settingsPaths) setSettingsOpen(true);
  }, [settingsPaths]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("adminTheme", dark ? "dark" : "light");
  }, [dark]);

  const tok =
    typeof window !== "undefined" ? localStorage.getItem("adminSession") : null;

  useEffect(() => {
    if (!tok) nav("/admin-login-page", { replace: true });
  }, [tok, nav]);

  if (!tok) return null;

  const navCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
      isActive
        ? "bg-red-600 text-white shadow-md"
        : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
    );
  const subNavCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all",
      isActive
        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
        : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
    );

  const itemLabel = (label: string) =>
    collapsed ? (
      <span className="sr-only">{label}</span>
    ) : (
      <span>{label}</span>
    );

  return (
    <div
      className={cn(
        "min-h-screen flex w-full",
        dark ? "bg-slate-950 text-slate-100" : "bg-gray-50 text-gray-900"
      )}
    >
      <aside
        className={cn(
          "shrink-0 border-r dark:border-slate-800 flex flex-col transition-[width] duration-300 ease-out",
          collapsed ? "w-[72px]" : "w-64",
          dark ? "bg-slate-900" : "bg-white"
        )}
      >
        <div className="p-3 flex items-center justify-between gap-2 border-b dark:border-slate-800">
          {!collapsed && (
            <span className="font-bold text-red-600 flex items-center gap-2">
              <QrCode size={22} /> QRMenu
            </span>
          )}
          <button
            type="button"
            aria-label="Daralt"
            onClick={() => {
              const n = !collapsed;
              setCollapsed(n);
              localStorage.setItem("adminSidebarCollapsed", n ? "1" : "0");
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500"
          >
            {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <NavLink to="/admin" end className={navCls}>
            <LayoutDashboard size={20} /> {itemLabel("İdarə paneli")}
          </NavLink>
          <NavLink to="/admin/users" className={navCls}>
            <Users size={20} /> {itemLabel("İstifadəçilər & Restoranlar")}
          </NavLink>
          <NavLink to="/admin/coupons" className={navCls}>
            <Ticket size={20} /> {itemLabel("Kuponlar")}
          </NavLink>
          <NavLink to="/admin/plans" className={navCls}>
            <CreditCard size={20} /> {itemLabel("Planlar")}
          </NavLink>
          <NavLink to="/admin/plan-requests" className={navCls}>
            <Inbox size={20} /> {itemLabel("Plan sorğuları")}
          </NavLink>
          <NavLink to="/admin/templates" className={navCls}>
            <Palette size={20} /> {itemLabel("Şablonlar")}
          </NavLink>
          <NavLink to="/admin/demo-qr-menu" className={navCls}>
            <Sparkles size={20} /> {itemLabel("Demo QR Menu")}
          </NavLink>
          <NavLink to="/admin/notifications" className={navCls}>
            <Bell size={20} /> {itemLabel("Bildirişlər")}
          </NavLink>
          {collapsed ? (
            <>
              <NavLink to="/admin/settings" className={navCls} title="Platform ayarları">
                <Settings size={20} /> {itemLabel("Ayarlar")}
              </NavLink>
              <NavLink to="/admin/website/general" className={navCls} title="Web sayt">
                <Globe size={20} /> {itemLabel("Web sayt")}
              </NavLink>
            </>
          ) : (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all",
                  settingsPaths
                    ? "bg-red-600/15 text-red-700 dark:text-red-300"
                    : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                )}
              >
                <Settings size={20} />
                <span className="flex-1">Ayarlar</span>
                <ChevronDown
                  size={18}
                  className={cn("opacity-70 transition-transform", settingsOpen && "rotate-180")}
                />
              </button>
              {settingsOpen ? (
                <div className="ml-2 pl-3 border-l-2 border-gray-200 dark:border-slate-600 space-y-0.5 py-1">
                  <NavLink to="/admin/settings" className={subNavCls}>
                    Platform ayarları
                  </NavLink>
                  <NavLink to="/admin/website/general" className={subNavCls}>
                    Web sayt ayarları
                  </NavLink>
                </div>
              ) : null}
            </div>
          )}
        </nav>
        <div className="p-2 border-t dark:border-slate-800 space-y-1">
          <button
            type="button"
            onClick={() => setDark(!dark)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
            {!collapsed && <span>{dark ? "İşıq rejimi" : "Qaranlıq rejim"}</span>}
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("adminSession");
              localStorage.removeItem("adminUser");
              nav("/admin-login-page", { replace: true });
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <LogOut size={20} /> {!collapsed && "Çıxış"}
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

function DashboardPage() {
  const [d, setD] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard", { headers: authSuperHeaders() })
      .then((r) => r.json())
      .then(setD);
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ ok: false }));
  }, []);

  if (!d) return <p className="p-10">Yüklənir…</p>;

  const regSeries = d.registrationsSeries || [];
  const landSeries = d.landingSeries || [];

  const statCards = [
    {
      icon: Utensils,
      label: "Ümumi restoran",
      val: d.totalRestaurants,
      accent: "from-sky-500/20 to-blue-600/5",
      iconBg: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
      link: "/admin/users",
    },
    {
      icon: Server,
      label: "Aktiv restoran",
      val: d.activeRestaurants,
      accent: "from-emerald-500/25 to-emerald-600/5",
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      link: "/admin/users?status=active",
    },
    {
      icon: Ban,
      label: "Deaktiv restoran",
      val: d.inactiveRestaurants ?? d.totalRestaurants - d.activeRestaurants,
      accent: "from-slate-400/20 to-slate-600/5",
      iconBg: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
      link: "/admin/users?status=inactive",
    },
    {
      icon: AlertTriangle,
      label: "Abunəlik 3 günə bitir",
      val: d.expiringSubscriptionsCount ?? 0,
      accent: "from-amber-500/25 to-orange-600/10",
      iconBg: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
      pulse: (d.expiringSubscriptionsCount ?? 0) > 0,
      link: "/admin/users",
    },
    {
      icon: TrendingUp,
      label: "Plan sorğusu (gözləyir)",
      val: d.pendingPlanRequests ?? 0,
      accent: "from-violet-500/20 to-fuchsia-600/10",
      iconBg: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
      link: "/admin/plan-requests",
    },
    {
      icon: CalendarClock,
      label: "Bu gün qeydiyyat",
      val: d.registrationsToday ?? 0,
      accent: "from-rose-500/20 to-red-600/10",
      iconBg: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
      link: "/admin/users",
    },
    {
      icon: CreditCard,
      label: "Ümumi aylıq gəlir (MRR)",
      val: `₼${Number(d.estimatedMonthlyRevenue).toFixed(0)}`,
      accent: "from-amber-400/25 to-yellow-600/5",
      iconBg: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
      link: "/admin/plans",
    },
    {
      icon: QrCode,
      label: "QR skan (ümumi)",
      val: d.totalScans,
      accent: "from-indigo-500/20 to-purple-600/10",
      iconBg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
      link: "/admin/statistics",
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">İdarə paneli</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 max-w-xl">
            Satış və platforma göstəriciləri — kartlar üzrə ani baxış, tendensiyalar və son fəaliyyət.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((item, i) => {
          const inner = (
            <Card
              className={cn(
                "p-4 h-full relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br",
                item.accent,
                "ring-1 ring-black/5 dark:ring-white/10"
              )}
            >
              <div
                className={cn(
                  "absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-30 blur-2xl pointer-events-none",
                  item.iconBg.split(" ")[0]
                )}
              />
              <div className="relative flex gap-3 items-start">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                    item.iconBg,
                    item.pulse && "animate-pulse"
                  )}
                >
                  <item.icon size={22} strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    {item.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5 tabular-nums">
                    {item.val}
                  </p>
                </div>
              </div>
            </Card>
          );
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 320 }}
              whileHover={{ y: -4, transition: { duration: 0.18 } }}
            >
              {item.link ? (
                <Link to={item.link} className="block h-full">
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-5 border-rose-100/80 dark:border-rose-900/40">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Yeni qeydiyyatlar</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Son 7 gün</p>
              </div>
              <MiniSparkline series={regSeries} color="rgb(244 63 94)" />
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">
                Ümumi səhifə baxışı (restoran menyu):{" "}
                <span className="font-semibold text-gray-800 dark:text-slate-200">{d.totalPageViews}</span>
            </p>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
        >
          <Card className="p-5 border-violet-100/80 dark:border-violet-900/40">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Landing trafiki</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">Ziyarət (günlük ping)</p>
              </div>
              <MiniSparkline series={landSeries} color="rgb(139 92 246)" />
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Real istifadəçi sessiyası yoxdur — göstərici veb sayt ziyarət təxminidir.
            </p>
          </Card>
        </motion.div>
      </div>

      <Card className="p-4">
        <p className="text-sm font-medium mb-2">Server</p>
        <p className={health?.ok ? "text-emerald-600 text-sm" : "text-red-600 text-sm"}>
          {health?.ok ? "Qoşulub" : "Xəta"} · {health?.driver} · {health?.latencyMs}ms
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="font-bold text-lg mb-4">Son restoranlar</h2>
        <div className="divide-y dark:divide-slate-700">
          {(d.recentRestaurants || []).map((r: any) => (
            <div
              key={r.id}
              className="py-3 flex flex-wrap justify-between gap-2 items-center"
            >
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-xs font-mono text-gray-500">/r/{r.slug}</p>
              </div>
              <Link
                to={`/restaurant/${r.id}`}
                className="text-red-600 text-sm font-semibold hover:underline"
              >
                İdarə et
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

type Plan = Record<string, any>;

function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [creating, setCreating] = useState(false);

  const load = () =>
    fetch("/api/admin/plans", { headers: authSuperHeaders() })
      .then((r) => r.json())
      .then(setPlans);

  useEffect(() => {
    load();
  }, []);
  const save = async (patch: any, id?: number) => {
    const url = id ? `/api/admin/plans/${id}` : "/api/admin/plans";
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: authSuperHeaders(),
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setEditing(null);
      setCreating(false);
      load();
    } else alert(await res.text());
  };

  const del = async (id: number) => {
    if (!confirm("Silmək?")) return;
    const res = await fetch(`/api/admin/plans/${id}`, {
      method: "DELETE",
      headers: authSuperHeaders(),
    });
    if (res.ok) load();
    else alert(await res.text());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <h1 className="text-2xl font-bold">Abunə planları</h1>
        <Button
          onClick={() => setCreating(true)}
          className="bg-red-600 text-white"
        >
          <Plus className="inline mr-1" size={18} /> Yeni plan
        </Button>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plans.map((p) => (
          <motion.div
            key={p.id}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
          >
            <Card className="p-5 flex flex-col gap-3 h-full border-2 border-transparent hover:border-rose-200/80 dark:hover:border-rose-900/50 transition-colors">
            <div className="flex justify-between items-start gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  {p.is_featured ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100 text-[10px] font-bold uppercase px-2 py-0.5">
                      <Star size={10} fill="currentColor" /> Ən populyar
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-gray-500 font-mono">{p.slug}</p>
              </div>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full shrink-0",
                  p.is_active
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gray-200 text-gray-600"
                )}
              >
                {p.is_active ? "Aktiv" : "Deaktiv"}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-2">
              {p.original_price_monthly != null &&
              Number(p.original_price_monthly) > Number(p.price_monthly) ? (
                <span className="text-lg text-gray-400 line-through decoration-rose-400/80">
                  ₼{Number(p.original_price_monthly).toFixed(0)}
                </span>
              ) : null}
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                ₼{Number(p.price_monthly).toFixed(0)}
                <span className="text-sm font-normal text-gray-500">/ay</span>
              </p>
            </div>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-slate-300">
              <li>Məhsul limiti: {Number(p.max_products) < 0 ? "∞" : p.max_products}</li>
              <li>Kateqoriya: {Number(p.max_categories) < 0 ? "∞" : p.max_categories}</li>
              <li>Şablon: {Number(p.max_templates) < 0 ? "∞" : p.max_templates}</li>
              <li>QR: {Number(p.max_qr_codes) < 0 ? "∞" : p.max_qr_codes}</li>
              <li>WhatsApp sifariş: {p.whatsapp_order_enabled ? "bəli" : "xeyr"}</li>
              <li>Rezervasiya: {p.reservation_enabled ? "bəli" : "xeyr"}</li>
              <li>Statistika: {p.analytics_enabled ? "bəli" : "xeyr"}</li>
              <li>Premium şablon: {p.premium_templates_enabled ? "bəli" : "xeyr"}</li>
            </ul>
            <div className="flex gap-2 mt-auto pt-2">
              <Button
                onClick={() => setEditing(p)}
                className="flex-1 border dark:border-slate-600"
              >
                <Pencil size={16} className="inline mr-1" /> Redaktə
              </Button>
              <Button
                onClick={() => del(p.id)}
                className="flex-1 border border-red-200 text-red-600"
              >
                <Trash2 size={16} className="inline mr-1" /> Sil
              </Button>
            </div>
          </Card>
          </motion.div>
        ))}
      </div>

      {(creating || editing) && (
        <PlanModal
          initial={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSave={(body, id) => save(body, id)}
        />
      )}
    </div>
  );
}

function PlanModal({
  initial,
  onClose,
  onSave,
}: {
  initial: Plan | null;
  onClose: () => void;
  onSave: (b: any, id?: number) => void;
}) {
  const [f, setF] = useState({
    name: initial?.name || "",
    slug: initial?.slug || "",
    price_monthly: initial?.price_monthly ?? 0,
    price_yearly: initial?.price_yearly ?? 0,
    original_price_monthly:
      initial?.original_price_monthly != null && initial?.original_price_monthly !== ""
        ? Number(initial.original_price_monthly)
        : ("" as number | ""),
    max_products: initial?.max_products ?? 20,
    max_categories: initial?.max_categories ?? 5,
    max_templates: initial?.max_templates ?? 5,
    max_qr_codes: initial?.max_qr_codes ?? 1,
    whatsapp_order_enabled: initial?.whatsapp_order_enabled !== 0 && initial?.whatsapp_order_enabled !== false,
    reservation_enabled: !!initial?.reservation_enabled,
    analytics_enabled: !!initial?.analytics_enabled,
    premium_templates_enabled: !!initial?.premium_templates_enabled,
    is_active: initial?.is_active !== 0 && initial?.is_active !== false,
    is_featured: !!initial?.is_featured,
    sort_order: initial?.sort_order ?? 10,
  });
  const [unlimited, setUnlimited] = useState({
    max_products: Number(initial?.max_products ?? 20) < 0,
    max_categories: Number(initial?.max_categories ?? 5) < 0,
    max_templates: Number(initial?.max_templates ?? 5) < 0,
    max_qr_codes: Number(initial?.max_qr_codes ?? 1) < 0,
  });

  useEffect(() => {
    setF({
      name: initial?.name || "",
      slug: initial?.slug || "",
      price_monthly: initial?.price_monthly ?? 0,
      price_yearly: initial?.price_yearly ?? 0,
      original_price_monthly:
        initial?.original_price_monthly != null && initial?.original_price_monthly !== ""
          ? Number(initial.original_price_monthly)
          : "",
      max_products: initial?.max_products ?? 20,
      max_categories: initial?.max_categories ?? 5,
      max_templates: initial?.max_templates ?? 5,
      max_qr_codes: initial?.max_qr_codes ?? 1,
      whatsapp_order_enabled: initial?.whatsapp_order_enabled !== 0 && initial?.whatsapp_order_enabled !== false,
      reservation_enabled: !!initial?.reservation_enabled,
      analytics_enabled: !!initial?.analytics_enabled,
      premium_templates_enabled: !!initial?.premium_templates_enabled,
      is_active: initial?.is_active !== 0 && initial?.is_active !== false,
      is_featured: !!initial?.is_featured,
      sort_order: initial?.sort_order ?? 10,
    });
    setUnlimited({
      max_products: Number(initial?.max_products ?? 20) < 0,
      max_categories: Number(initial?.max_categories ?? 5) < 0,
      max_templates: Number(initial?.max_templates ?? 5) < 0,
      max_qr_codes: Number(initial?.max_qr_codes ?? 1) < 0,
    });
  }, [initial]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 border dark:border-slate-700"
      >
        <h3 className="font-bold text-lg mb-4">{initial ? "Plan redaktə" : "Yeni plan"}</h3>
        <div className="grid gap-3">
          <input
            className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            placeholder="Ad"
          />
          <input
            className="p-2 border rounded-lg dark:bg-slate-800 dark:border-slate-600"
            value={f.slug}
            onChange={(e) => setF({ ...f, slug: e.target.value })}
            placeholder="slug"
            disabled={!!initial}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              className="p-2 border rounded-lg"
              value={f.price_monthly}
              onChange={(e) =>
                setF({ ...f, price_monthly: Number(e.target.value) })
              }
              placeholder="Aylıq (endirimli)"
            />
            <input
              type="number"
              className="p-2 border rounded-lg"
              value={f.price_yearly}
              onChange={(e) =>
                setF({ ...f, price_yearly: Number(e.target.value) })
              }
              placeholder="İllik"
            />
          </div>
          <label className="text-sm">
            Köhnə qiymət (üstündən xətt — opsional)
            <input
              type="number"
              className="w-full p-2 border rounded-lg mt-1 dark:bg-slate-800 dark:border-slate-600"
              value={f.original_price_monthly === "" ? "" : f.original_price_monthly}
              placeholder="Boş = endirim göstərilmir"
              onChange={(e) =>
                setF({
                  ...f,
                  original_price_monthly: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
          </label>
          {[
            ["max_products", "Məhsul limiti (-1 = ∞)"],
            ["max_categories", "Kateqoriya"],
            ["max_templates", "Şablon sayı"],
            ["max_qr_codes", "QR limiti"],
          ].map(([k, lab]) => (
            <label key={k} className="text-sm">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span>{lab}</span>
                <label className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={unlimited[k as keyof typeof unlimited]}
                    onChange={(e) =>
                      setUnlimited((u) => ({ ...u, [k]: e.target.checked }))
                    }
                  />
                  Limitsiz
                </label>
              </div>
              <input
                type="number"
                className="w-full p-2 border rounded-lg mt-1"
                disabled={unlimited[k as keyof typeof unlimited]}
                value={f[k as keyof typeof f] as number}
                onChange={(e) =>
                  setF({ ...f, [k]: Number(e.target.value) } as any)
                }
              />
            </label>
          ))}
          {(
            [
              ["is_featured", "Ən populyar badge"],
              ["whatsapp_order_enabled", "WhatsApp sifariş"],
              ["reservation_enabled", "Rezervasiya"],
              ["analytics_enabled", "Statistika"],
              ["premium_templates_enabled", "Premium şablon"],
              ["is_active", "Plan aktiv"],
            ] as const
          ).map(([k, lab]) => (
            <label key={k} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!f[k]}
                onChange={(e) => setF({ ...f, [k]: e.target.checked })}
              />
              {lab}
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-6">
          <Button onClick={onClose} className="flex-1 border">
            Ləğv
          </Button>
          <Button
            onClick={() =>
              onSave(
                {
                  ...f,
                  max_products: unlimited.max_products ? -1 : Number(f.max_products),
                  max_categories: unlimited.max_categories ? -1 : Number(f.max_categories),
                  max_templates: unlimited.max_templates ? -1 : Number(f.max_templates),
                  max_qr_codes: unlimited.max_qr_codes ? -1 : Number(f.max_qr_codes),
                  original_price_monthly:
                    f.original_price_monthly === "" ? null : Number(f.original_price_monthly),
                },
                initial?.id
              )
            }
            className="flex-1 bg-red-600 text-white"
          >
            Saxla
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function RestaurantsAdminPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const loc = useLocation();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const nav = useNavigate();
  const createFormRef = useRef<HTMLDivElement | null>(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    whatsapp: "",
    admin_user: "",
    admin_pass: "",
    plan_id: "",
    seed_demo: true,
  });

  const load = () => {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (status !== "all") qs.set("status", status);
    fetch(`/api/restaurants?${qs}`, { headers: authSuperHeaders() })
      .then((r) => r.json())
      .then(setRows);
  };

  useEffect(() => {
    fetch("/api/admin/plans", { headers: authSuperHeaders() })
      .then((r) => r.json())
      .then(setPlans);
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams(loc.search);
    const s = sp.get("status");
    if (s === "all" || s === "active" || s === "inactive") setStatus(s);
  }, [loc.search]);

  useEffect(() => {
    const t = setTimeout(() => load(), q ? 320 : 0);
    return () => clearTimeout(t);
  }, [q, status]);

  const toggleBlock = async (r: any) => {
    await fetch(`/api/admin/restaurants/${r.id}`, {
      method: "PATCH",
      headers: authSuperHeaders(),
      body: JSON.stringify({ is_active: !r.is_active }),
    });
    load();
  };

  const setPlan = async (rid: number, planId: number) => {
    await fetch(`/api/admin/restaurants/${rid}`, {
      method: "PATCH",
      headers: authSuperHeaders(),
      body: JSON.stringify({ subscription_plan_id: planId }),
    });
    load();
  };

  const impersonate = async (rid: number) => {
    const res = await fetch(`/api/admin/impersonate/${rid}`, {
      method: "POST",
      headers: authSuperHeaders(),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("restaurantSession", data.token);
      localStorage.setItem("restaurantId", String(data.restaurantId));
      nav(`/restaurant/${rid}`);
    } else alert("Xəta");
  };

  const createRestaurant = async () => {
    const res = await fetch("/api/restaurants", {
      method: "POST",
      headers: authSuperHeaders(),
      body: JSON.stringify({
        name: createForm.name,
        slug: createForm.slug,
        whatsapp_number: createForm.whatsapp,
        admin_username: createForm.admin_user,
        admin_password: createForm.admin_pass,
        subscription_plan_id: createForm.plan_id
          ? Number(createForm.plan_id)
          : undefined,
        seed_demo: createForm.seed_demo,
      }),
    });
    if (res.ok) {
      setCreateForm({
        name: "",
        slug: "",
        whatsapp: "",
        admin_user: "",
        admin_pass: "",
        plan_id: "",
        seed_demo: true,
      });
      setShowCreateForm(false);
      load();
    } else alert(await res.text());
  };

  const openCreateForm = () => {
    setShowCreateForm(true);
    setTimeout(() => {
      createFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">İstifadəçilər & Restoranlar</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="bg-emerald-600 text-white"
            onClick={async () => {
              if (!confirm("Demae Sushi (demae/demae123) yaradılsın və menyu yüklənsin?")) return;
              const res = await fetch("/api/admin/seed/demae", {
                method: "POST",
                headers: { ...authSuperHeaders(), "Content-Type": "application/json" },
                body: JSON.stringify({ replace: true }),
              });
              const data = await res.json();
              if (data.success) {
                alert(
                  `Demae hazırdır.\nPanel: demae / demae123\nMenyu: ${data.menuProducts} məhsul\n/r/${data.slug}`
                );
                load();
              } else alert(data.error || "Xəta");
            }}
          >
            Demae menyu yüklə
          </Button>
          <Button
            type="button"
            onClick={openCreateForm}
            className="bg-red-600 text-white"
          >
            <Plus className="inline mr-1" size={16} /> Yeni restoran
          </Button>
        </div>
      </div>
      <p className="text-sm rounded-xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50/90 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100 px-4 py-3">
        Restoran <strong>silinməsi</strong> siyasəti: məxfilik və data qorunması üçün birbaşa silmə menyuda
        mövcud deyil. Bloklama və plan dəyişikliyi ilə idarə edin; abunə bitmə tarixini aşağıda yeniləyə
        bilərsiniz.
      </p>
      {showCreateForm ? (
      <div ref={createFormRef}>
      <Card className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <input
          className="p-2 border rounded-lg"
          placeholder="Ad"
          value={createForm.name}
          onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
        />
        <input
          className="p-2 border rounded-lg font-mono"
          placeholder="slug"
          value={createForm.slug}
          onChange={(e) =>
            setCreateForm({ ...createForm, slug: e.target.value.toLowerCase() })
          }
        />
        <input
          className="p-2 border rounded-lg"
          placeholder="WhatsApp"
          value={createForm.whatsapp}
          onChange={(e) => setCreateForm({ ...createForm, whatsapp: e.target.value })}
        />
        <input
          className="p-2 border rounded-lg"
          placeholder="Restoran admin login"
          value={createForm.admin_user}
          onChange={(e) => setCreateForm({ ...createForm, admin_user: e.target.value })}
        />
        <input
          type="password"
          className="p-2 border rounded-lg"
          placeholder="Restoran şifrə"
          value={createForm.admin_pass}
          onChange={(e) => setCreateForm({ ...createForm, admin_pass: e.target.value })}
        />
        <select
          className="p-2 border rounded-lg"
          value={createForm.plan_id}
          onChange={(e) => setCreateForm({ ...createForm, plan_id: e.target.value })}
        >
          <option value="">Plan (default Free)</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <label className="sm:col-span-2 lg:col-span-3 flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={createForm.seed_demo}
            onChange={(e) => setCreateForm({ ...createForm, seed_demo: e.target.checked })}
          />
          Azərbaycan nümunə məhsullarını avtomatik əlavə et (plan limitinə uyğun kəsilir)
        </label>
        <Button
          onClick={createRestaurant}
          className="sm:col-span-2 lg:col-span-3 bg-red-600 text-white"
        >
          Yeni restoran yarat
        </Button>
        <Button
          type="button"
          onClick={() => setShowCreateForm(false)}
          className="sm:col-span-2 lg:col-span-3 border"
        >
          Bağla
        </Button>
      </Card>
      </div>
      ) : null}
      <Card className="p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="text-gray-400" size={18} />
          <input
            className="flex-1 p-2 border rounded-lg dark:bg-slate-800"
            placeholder="Axtarış (ad, slug)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
          <Button onClick={load} className="bg-red-600 text-white">
            Axtar
          </Button>
        </div>
        <select
          className="p-2 border rounded-lg dark:bg-slate-800"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Hamısı</option>
          <option value="active">Aktiv</option>
          <option value="inactive">Bloklu</option>
        </select>
      </Card>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50 dark:bg-slate-800/50">
            <tr>
              <th className="text-left p-3">Ad</th>
              <th className="text-left p-3">İstifadəçi</th>
              <th className="text-left p-3">Plan</th>
              <th className="text-left p-3 min-w-[10rem]">Abunə bitir</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Əməliyyat</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-700">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="p-3 font-medium">
                  <div className="flex items-center gap-2">
                    <span>{r.name}</span>
                    {r.created_at &&
                    Date.now() - new Date(r.created_at).getTime() < 7 * 24 * 60 * 60 * 1000 ? (
                      <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200 px-2 py-0.5 text-[10px] font-bold uppercase">
                        New
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="p-3 font-mono text-xs">{r.staff_username || "-"}</td>
                <td className="p-3">
                  <select
                    className="text-xs p-1 border rounded dark:bg-slate-800"
                    value={r.subscription_plan_id || ""}
                    onChange={(e) => setPlan(r.id, Number(e.target.value))}
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <input
                    key={`${r.id}-${r.subscription_ends_at ?? "x"}`}
                    type="datetime-local"
                    className="text-xs p-1.5 border rounded-lg dark:bg-slate-800 w-full max-w-[11.5rem]"
                    defaultValue={
                      r.subscription_ends_at
                        ? new Date(r.subscription_ends_at).toISOString().slice(0, 16)
                        : ""
                    }
                    onBlur={async (e) => {
                      const v = e.target.value;
                      const iso = v ? new Date(v).toISOString() : null;
                      const cur = r.subscription_ends_at
                        ? new Date(r.subscription_ends_at).toISOString().slice(0, 16)
                        : "";
                      if (v === cur) return;
                      const res = await fetch(`/api/admin/restaurants/${r.id}`, {
                        method: "PATCH",
                        headers: { ...authSuperHeaders(), "Content-Type": "application/json" },
                        body: JSON.stringify({ subscription_ends_at: iso }),
                      });
                      if (!res.ok) alert(await res.text());
                      else load();
                    }}
                  />
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => toggleBlock(r)}
                    className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      r.is_active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {r.is_active ? "Aktiv" : "Bloklu"}
                  </button>
                </td>
                <td className="p-3 text-right space-x-2">
                  <Link
                    to={`/restaurant/${r.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Panel
                  </Link>
                  <button
                    type="button"
                    onClick={() => impersonate(r.id)}
                    className="text-amber-700 hover:underline"
                  >
                    Kimlik
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <button
        type="button"
        onClick={openCreateForm}
        className="fixed bottom-6 right-6 z-40 rounded-full shadow-xl bg-red-600 hover:bg-red-700 text-white p-4 sm:hidden"
        aria-label="Yeni restoran yarat"
      >
        <Plus size={22} />
      </button>
    </div>
  );
}

function AdminTemplatesPage() {
  const chunkByTen = (arr: MenuTemplateDef[]): MenuTemplateDef[][] => {
    const out: MenuTemplateDef[][] = [];
    for (let i = 0; i < arr.length; i += 10) out.push(arr.slice(i, i + 10));
    return out;
  };

  const groupedBuiltins = useMemo(() => {
    const map = new Map<string, MenuTemplateDef[]>();
    for (const tpl of MENU_TEMPLATES) {
      const key = tpl.category || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(tpl);
    }
    return [...map.entries()];
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Şablonlar</h1>
      <p className="text-sm text-gray-500">
        {MENU_TEMPLATES.length} hazır şablon. Canlı baxış üçün bəzi restoranın slug-ından istifadə edin.
      </p>
      <div className="space-y-5 max-h-[56vh] overflow-y-auto pr-1">
        {groupedBuiltins.map(([category, items]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">{category}</h3>
            {chunkByTen(items).map((group, groupIx) => (
              <div key={`${category}-${groupIx}`} className="space-y-2">
                <p className="text-[11px] font-semibold text-gray-400">
                  Qrup {groupIx + 1} ({groupIx * 10 + 1}-{groupIx * 10 + group.length})
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {group.map((tpl) => (
                    <Card key={tpl.id} className="overflow-hidden flex flex-col">
                      <div
                        className="h-28 bg-cover bg-center"
                        style={{ backgroundImage: `url(${tpl.heroImage})` }}
                      />
                      <div className="p-3 flex-1 flex flex-col gap-2">
                        <p className="text-xs text-amber-700 font-bold">{tpl.category}</p>
                        <p className="font-bold text-sm">{tpl.name}</p>
                        <a
                          href={`/r/demo-az-menu?preview=true&previewTemplate=${encodeURIComponent(tpl.id)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-red-600 font-semibold inline-flex items-center gap-1 mt-auto"
                        >
                          <Eye size={14} /> Preview
                        </a>
                        <span className="text-[10px] text-gray-400">
                          Bu şablon kod bazası registry-sindən gəlir.
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatisticsPage() {
  const [dash, setDash] = useState<any>(null);
  const [an, setAn] = useState<any>(null);
  const [range, setRange] = useState<7 | 30 | 90>(30);

  useEffect(() => {
    fetch("/api/admin/dashboard", { headers: authSuperHeaders() })
      .then((r) => r.json())
      .then(setDash);
  }, []);

  useEffect(() => {
    fetch(`/api/admin/analytics?days=${range}`, { headers: authSuperHeaders() })
      .then((r) => r.json())
      .then(setAn);
  }, [range]);

  if (!dash || !an) return <p className="p-8">Yüklənir…</p>;

  type DailyRow = { day: string; metric: string; value: number };
  const daily: DailyRow[] = an.daily || [];
  const byDay = new Map<string, { landing: number; qr: number }>();
  for (const r of daily) {
    const k = r.day;
    if (!byDay.has(k)) byDay.set(k, { landing: 0, qr: 0 });
    const b = byDay.get(k)!;
    if (r.metric === "landing_hit") b.landing += Number(r.value);
    if (r.metric === "qr_scan") b.qr += Number(r.value);
  }
  const sortedDays = [...byDay.keys()].sort();
  const landingPts = sortedDays.map((d) => ({ day: d, count: byDay.get(d)!.landing }));
  const qrPts = sortedDays.map((d) => ({ day: d, count: byDay.get(d)!.qr }));
  const landingSum = landingPts.reduce((a, x) => a + x.count, 0);
  const qrSum = qrPts.reduce((a, x) => a + x.count, 0);

  const topPages = (an.topPages || []).map((x: any) => ({
    path: String(x.path || "").replace(/^page:/, "") || "/",
    hits: Number(x.hits ?? 0),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Statistika və analitika</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Günlük / həftəlik / aylıq pəncərə, landing və QR trafiki, ən çox baxılan səhifələr.
          </p>
        </div>
        <div className="flex rounded-xl border border-gray-200 dark:border-slate-600 p-1 bg-gray-50 dark:bg-slate-800/50">
          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setRange(d)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                range === d
                  ? "bg-white dark:bg-slate-900 shadow text-rose-600 dark:text-rose-400"
                  : "text-gray-600 dark:text-slate-400 hover:text-gray-900"
              )}
            >
              {d === 7 ? "Həftəlik" : d === 30 ? "Aylıq" : "90 gün"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Ümumi QR skan", val: dash.totalScans, sub: "Bütün zamanlar (DB)" },
          { label: "Menyu baxışı", val: dash.totalPageViews, sub: "Restoran üzrə toplam" },
          { label: `Landing ziyarət · ${range}g`, val: landingSum, sub: "Ping sayı (təxmini)" },
          { label: `QR hadisə · ${range}g`, val: qrSum, sub: "Yeni skan qeydləri" },
        ].map((c) => (
          <motion.div key={c.label} whileHover={{ y: -3 }}>
            <Card className="p-5 border-rose-100/60 dark:border-rose-900/40">
              <p className="text-xs font-semibold uppercase text-gray-500">{c.label}</p>
              <p className="text-3xl font-bold mt-1 tabular-nums">{c.val}</p>
              <p className="text-xs text-gray-500 mt-1">{c.sub}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="font-bold mb-3">Landing trafiki</h2>
          <MiniSparkline series={landingPts.length ? landingPts : [{ day: "", count: 0 }]} />
        </Card>
        <Card className="p-5">
          <h2 className="font-bold mb-3">QR skan (günlük)</h2>
          <MiniSparkline
            series={qrPts.length ? qrPts : [{ day: "", count: 0 }]}
            color="rgb(99 102 241)"
          />
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="font-bold mb-3">Ən çox baxılan səhifələr</h2>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {topPages.length === 0 ? (
              <p className="text-sm text-gray-500">Hələ məlumat yoxdur.</p>
            ) : (
              topPages.map((p: { path: string; hits: number }, i: number) => (
                <div
                  key={i}
                  className="flex justify-between gap-2 text-sm py-2 border-b border-gray-100 dark:border-slate-800"
                >
                  <span className="font-mono text-xs truncate">{p.path}</span>
                  <span className="font-bold tabular-nums text-rose-600">{p.hits}</span>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold mb-3">Menyu baxışı — top restoranlar</h2>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {(an.topMenus || []).length === 0 ? (
              <p className="text-sm text-gray-500">Məlumat yoxdur.</p>
            ) : (
              (an.topMenus as any[]).map((m) => (
                <div
                  key={m.id}
                  className="flex justify-between gap-2 text-sm py-2 border-b border-gray-100 dark:border-slate-800"
                >
                  <span className="truncate">{m.name}</span>
                  <span className="font-mono text-xs text-gray-500">{m.total_page_views}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function NotificationsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const load = () =>
    fetch(`/api/admin/notifications?filter=${filter}&sort=${sort}`, {
      headers: authSuperHeaders(),
    })
      .then((r) => r.json())
      .then(setRows);

  useEffect(() => {
    load();
  }, [filter, sort]);

  const markRead = async (id: number) => {
    await fetch(`/api/admin/notifications/${id}/read`, {
      method: "PATCH",
      headers: authSuperHeaders(),
    });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Platforma bildirişləri</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Oxunma statusu, süzgəc və tarix sırası.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 text-sm font-medium"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
          >
            <option value="all">Hamısı</option>
            <option value="unread">Oxunmamış</option>
            <option value="read">Oxunmuş</option>
          </select>
          <select
            className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-600 dark:bg-slate-800 text-sm font-medium"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
          >
            <option value="newest">Ən yeni</option>
            <option value="oldest">Ən köhnə</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {rows.length === 0 ? (
          <Card className="p-10 text-center text-gray-500">Bildiriş yoxdur.</Card>
        ) : (
          rows.map((n) => {
            const read = !!(n.is_read === true || n.is_read === 1);
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.005 }}
              >
                <Card
                  className={cn(
                    "p-5 border-l-4 transition-shadow",
                    read
                      ? "border-l-gray-300 dark:border-l-slate-600 opacity-90"
                      : "border-l-rose-500 shadow-md"
                  )}
                >
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <p className="font-bold text-lg">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {n.created_at ? new Date(n.created_at).toLocaleString() : "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full",
                          read ? "bg-gray-100 text-gray-600" : "bg-rose-100 text-rose-700"
                        )}
                      >
                        {read ? "Oxundu" : "Oxunmadı"}
                      </span>
                      {!read ? (
                        <button
                          type="button"
                          onClick={() => void markRead(n.id)}
                          className="text-xs font-semibold text-rose-600 hover:underline"
                        >
                          Oxundu işarələ
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {n.body ? (
                    <p className="text-sm text-gray-600 dark:text-slate-300 mt-3 whitespace-pre-wrap">
                      {n.body}
                    </p>
                  ) : null}
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

function CouponsAdminPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [editing, setEditing] = useState<any | null>(null);
  const nav = useNavigate();
  const [form, setForm] = useState({
    code: "",
    discount_type: "percent" as "percent" | "fixed",
    discount_value: 10,
    max_uses: 100,
    active_hours: "" as string,
    valid_from: "" as string,
    valid_until: "" as string,
    is_active: true,
    notes: "",
  });

  const load = () =>
    fetch("/api/admin/coupons", { headers: authSuperHeaders() })
      .then((r) => r.json())
      .then(setRows);

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((c) => {
      if (status === "active" && !c.is_active) return false;
      if (status === "inactive" && c.is_active) return false;
      if (!needle) return true;
      return String(c.code).toLowerCase().includes(needle);
    });
  }, [rows, q, status]);

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      code: c.code,
      discount_type: c.discount_type === "fixed" ? "fixed" : "percent",
      discount_value: Number(c.discount_value ?? 0),
      max_uses: Number(c.max_uses ?? 1),
      active_hours: c.active_hours != null ? String(c.active_hours) : "",
      valid_from: c.valid_from ? String(c.valid_from).slice(0, 16) : "",
      valid_until: c.valid_until ? String(c.valid_until).slice(0, 16) : "",
      is_active: !!c.is_active,
      notes: c.notes ? String(c.notes) : "",
    });
  };

  const saveCoupon = async () => {
    const body = {
      code: form.code,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      max_uses: Number(form.max_uses),
      active_hours: form.active_hours ? Number(form.active_hours) : null,
      valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : null,
      valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
      is_active: form.is_active,
      notes: form.notes || null,
    };
    if (editing) {
      const res = await fetch(`/api/admin/coupons/${editing.id}`, {
        method: "PUT",
        headers: { ...authSuperHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) alert(await res.text());
      else {
        setEditing(null);
        load();
      }
    }
  };

  const del = async (id: number) => {
    if (!confirm("Kuponu silmək?")) return;
    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: "DELETE",
      headers: authSuperHeaders(),
    });
    if (!res.ok) alert(await res.text());
    else load();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between gap-4 items-center">
        <motion.h1
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold"
        >
          Promo kuponlar
        </motion.h1>
        <Button className="bg-rose-600 text-white" onClick={() => nav("/admin/coupons/new")}>
          <Plus size={18} className="inline mr-1" /> Yeni kupon
        </Button>
      </div>

      <Card className="p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="text-gray-400" size={18} />
          <input
            className="flex-1 p-2 border rounded-lg dark:bg-slate-800"
            placeholder="Kod üzrə axtarış…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          className="p-2 border rounded-lg dark:bg-slate-800"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        >
          <option value="all">Status: hamısı</option>
          <option value="active">Aktiv</option>
          <option value="inactive">Deaktiv</option>
        </select>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm min-w-[960px]">
          <thead className="bg-gray-50 dark:bg-slate-800/80 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Kod</th>
              <th className="p-3">Endirim</th>
              <th className="p-3">İstifadə</th>
              <th className="p-3">Müddət</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Əməl.</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-700">
            {filtered.map((c) => {
              const max = Math.max(1, Number(c.max_uses));
              const used = Math.min(Number(c.used_count), max);
              const pct = (used / max) * 100;
              const disc =
                c.discount_type === "fixed"
                  ? `₼${Number(c.discount_value).toFixed(2)}`
                  : `${Number(c.discount_value)}%`;
              return (
                <tr key={c.id} className="hover:bg-rose-50/40 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold">{c.code}</td>
                  <td className="p-3">{disc}</td>
                  <td className="p-3 min-w-[140px]">
                    <div className="text-xs mb-1">{used} / {max}</div>
                    <div className="h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </td>
                  <td className="p-3 text-xs text-gray-600 dark:text-slate-400">
                    {c.valid_from || "—"}
                    <br />→ {c.valid_until || "—"}
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-semibold",
                        c.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-200 text-gray-600"
                      )}
                    >
                      {c.is_active ? "Aktiv" : "Off"}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="text-rose-600 font-semibold text-xs hover:underline"
                    >
                      Redaktə
                    </button>
                    <button
                      type="button"
                      onClick={() => del(c.id)}
                      className="text-gray-500 text-xs hover:text-red-600"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-gray-500">Uyğun kupon yoxdur.</p>
        ) : null}
      </Card>

      {editing ? (
      <Card className="p-6 max-w-xl space-y-3 border-2 border-rose-100 dark:border-rose-900/50">
          <h2 className="font-bold">Kupon redaktəsi</h2>
          <input
            className="w-full p-2 border rounded-lg dark:bg-slate-800"
            placeholder="Kod"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            disabled={!!editing}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              className="p-2 border rounded-lg dark:bg-slate-800"
              value={form.discount_type}
              onChange={(e) =>
                setForm({ ...form, discount_type: e.target.value as "percent" | "fixed" })
              }
            >
              <option value="percent">Faiz (%)</option>
              <option value="fixed">Məbləğ (₼)</option>
            </select>
            <input
              type="number"
              className="p-2 border rounded-lg dark:bg-slate-800"
              value={form.discount_value}
              onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
            />
          </div>
          <input
            type="number"
            className="w-full p-2 border rounded-lg dark:bg-slate-800"
            placeholder="İstifadə limiti"
            value={form.max_uses}
            onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="datetime-local"
              className="p-2 border rounded-lg dark:bg-slate-800 text-xs"
              value={form.valid_from}
              onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
            />
            <input
              type="datetime-local"
              className="p-2 border rounded-lg dark:bg-slate-800 text-xs"
              value={form.valid_until}
              onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
            />
          </div>
          <input
            className="w-full p-2 border rounded-lg dark:bg-slate-800"
            placeholder="Saat limiti (opsional)"
            value={form.active_hours}
            onChange={(e) => setForm({ ...form, active_hours: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Aktiv
          </label>
          <input
            className="w-full p-2 border rounded-lg dark:bg-slate-800"
            placeholder="Qeyd"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex gap-2">
            <Button className="flex-1 bg-rose-600 text-white" onClick={() => void saveCoupon()}>
              Saxla
            </Button>
            <Button className="flex-1 border" onClick={() => setEditing(null)}>
              Ləğv
            </Button>
          </div>
      </Card>
      ) : null}
    </div>
  );
}

function CouponsCreatePage() {
  const nav = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discount_type: "percent" as "percent" | "fixed",
    discount_value: 10,
    max_uses: 100,
    active_hours: "" as string,
    valid_from: "" as string,
    valid_until: "" as string,
    is_active: true,
    notes: "",
  });

  const save = async () => {
    setSaving(true);
    try {
      const body = {
        code: form.code,
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        max_uses: Number(form.max_uses),
        active_hours: form.active_hours ? Number(form.active_hours) : null,
        valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : null,
        valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
        is_active: form.is_active,
        notes: form.notes || null,
      };
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { ...authSuperHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        alert(await res.text());
        return;
      }
      nav("/admin/coupons");
    } finally {
      setSaving(false);
    }
  };

  const tipCls = "text-[11px] text-gray-500 mt-1 flex items-start gap-1";
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Yeni kupon yarat</h1>
        <Button className="border" onClick={() => nav("/admin/coupons")}>
          Geri
        </Button>
      </div>
      <Card className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Kupon kodu</label>
          <input
            className="w-full p-2 border rounded-lg mt-1"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="Məs: YAZ10"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Endirim tipi</label>
            <select
              className="w-full p-2 border rounded-lg mt-1"
              value={form.discount_type}
              onChange={(e) =>
                setForm({ ...form, discount_type: e.target.value as "percent" | "fixed" })
              }
            >
              <option value="percent">Faiz (%)</option>
              <option value="fixed">Məbləğ (₼)</option>
            </select>
            <p className={tipCls}>
              <Info size={12} /> Faiz ümumi məbləğdən çıxılır, məbləğ isə sabit endirim verir.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Endirim dəyəri</label>
            <input
              type="number"
              className="w-full p-2 border rounded-lg mt-1"
              value={form.discount_value}
              onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">İstifadə limiti</label>
            <input
              type="number"
              className="w-full p-2 border rounded-lg mt-1"
              value={form.max_uses}
              onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })}
            />
            <p className={tipCls}>
              <Info size={12} /> Kupon neçə dəfə işlədilə bilər.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Saat limiti (opsional)</label>
            <input
              className="w-full p-2 border rounded-lg mt-1"
              value={form.active_hours}
              onChange={(e) => setForm({ ...form, active_hours: e.target.value })}
              placeholder="Məs: 48"
            />
            <p className={tipCls}>
              <Info size={12} /> Yaradıldıqdan sonra neçə saat aktiv qalacağını məhdudlaşdırır.
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Başlama tarixi</label>
            <input
              type="datetime-local"
              className="w-full p-2 border rounded-lg mt-1"
              value={form.valid_from}
              onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Bitmə tarixi</label>
            <input
              type="datetime-local"
              className="w-full p-2 border rounded-lg mt-1"
              value={form.valid_until}
              onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
            />
          </div>
        </div>
        <p className={tipCls}>
          <Info size={12} /> Tarixlər boş buraxılsa kupon daimi aktiv qala bilər.
        </p>
        <div>
          <label className="text-sm font-medium">Qeyd</label>
          <textarea
            className="w-full p-2 border rounded-lg mt-1"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Aktiv et
        </label>
        <div className="flex gap-2">
          <Button className="bg-rose-600 text-white" disabled={saving} onClick={() => void save()}>
            {saving ? "Saxlanılır..." : "Kuponu yarat"}
          </Button>
          <Button className="border" onClick={() => nav("/admin/coupons")}>
            Ləğv
          </Button>
        </div>
      </Card>
    </div>
  );
}

function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  useEffect(() => {
    fetch("/api/admin/settings", { headers: authSuperHeaders() })
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  const save = async (patch: any) => {
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: authSuperHeaders(),
      body: JSON.stringify({ settings: patch }),
    });
    setSettings({ ...settings, ...patch });
    alert("Saxlanıldı");
  };

  const langs = JSON.parse(settings.supported_languages || "[]");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ayarlar</h1>
      <Card className="p-6 max-w-xl">
        <label className="block text-sm font-medium mb-2">Əsas dil</label>
        <select
          className="w-full p-3 border rounded-lg dark:bg-slate-800"
          value={settings.default_language}
          onChange={(e) => save({ default_language: e.target.value })}
        >
          <option value="az">AZ</option>
          <option value="en">EN</option>
          <option value="ru">RU</option>
          <option value="tr">TR</option>
        </select>
      </Card>
      <Card className="p-6 max-w-xl">
        <p className="font-medium mb-3">Dəstəklənən dillər</p>
        {["az", "en", "ru", "tr"].map((id) => (
          <label key={id} className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={langs.includes(id)}
              onChange={(e) => {
                const next = e.target.checked
                  ? [...langs, id]
                  : langs.filter((x: string) => x !== id);
                save({ supported_languages: JSON.stringify(next) });
              }}
            />
            {id}
          </label>
        ))}
      </Card>
    </div>
  );
}

function PlanRequestsPage() {
  const [rows, setRows] = React.useState<any[]>([]);
  const [includeHistory, setIncludeHistory] = React.useState(false);

  const load = () =>
    fetch(`/api/admin/plan-requests${includeHistory ? "?all=1" : ""}`, { headers: authSuperHeaders() })
      .then((r) => r.json())
      .then(setRows);

  React.useEffect(() => {
    load();
  }, [includeHistory]);

  const digits = (s: string) => String(s || "").replace(/\D/g, "");

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Plan sorğuları</h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
              Restoranların plan yüksəltmə sorğuları — WhatsApp ilə əlaqə, ödəniş, sonra planı aktiv edin.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 px-3 py-2">
            <input
              type="checkbox"
              checked={includeHistory}
              onChange={(e) => setIncludeHistory(e.target.checked)}
            />
            Arxiv (tam tarixçə)
          </label>
        </div>
      </header>
      <div className="grid gap-4">
        {rows.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">Hələ sorğu yoxdur.</Card>
        ) : (
          rows.map((r) => (
            <Card key={r.id} className="p-4 sm:p-6 space-y-3">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-bold text-lg">{r.restaurant_name}</p>
                  <p className="text-sm text-gray-500 font-mono">/{r.restaurant_slug}</p>
                </div>
                <span className="text-xs font-semibold uppercase px-2 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100 h-fit">
                  {r.status}
                </span>
              </div>
              <p className="text-sm">
                İstənən plan: <strong>{r.plan_name}</strong>
              </p>
              <p className="text-xs text-gray-500">
                Tarix: {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {r.whatsapp_number ? (
                  <a
                    href={`https://wa.me/${digits(r.whatsapp_number)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium"
                  >
                    WhatsApp
                  </a>
                ) : null}
                <Button
                  type="button"
                  className="rounded-xl bg-gray-100 dark:bg-slate-800"
                  onClick={async () => {
                    await fetch(`/api/admin/plan-requests/${r.id}`, {
                      method: "PATCH",
                      headers: authSuperHeaders(),
                      body: JSON.stringify({ status: "processing" }),
                    });
                    load();
                  }}
                >
                  İcradadır
                </Button>
                <Button
                  type="button"
                  className="rounded-xl bg-red-600 text-white"
                  onClick={async () => {
                    await fetch(`/api/admin/plan-requests/${r.id}`, {
                      method: "PATCH",
                      headers: authSuperHeaders(),
                      body: JSON.stringify({ status: "completed", apply_plan: true }),
                    });
                    load();
                  }}
                >
                  Ödənişi qəbul et · Planı aktiv et
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

/** Super admin marşrutları — App içində `/admin/*` altında mount olunur */
export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<Navigate to="/admin-login-page" replace />} />
      <Route element={<AdminLayoutShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="website/*" element={<WebsiteCmsPage />} />
        <Route path="users" element={<RestaurantsAdminPage />} />
        <Route path="coupons" element={<CouponsAdminPage />} />
        <Route path="coupons/new" element={<CouponsCreatePage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="plan-requests" element={<PlanRequestsPage />} />
        <Route path="restaurants" element={<Navigate to="/admin/users" replace />} />
        <Route path="templates" element={<AdminTemplatesPage />} />
        <Route path="demo-qr-menu" element={<DemoQrMenuAdminPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
