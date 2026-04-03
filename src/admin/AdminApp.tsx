import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Outlet,
  NavLink,
  useNavigate,
  Link,
} from "react-router-dom";
import {
  LayoutDashboard,
  CreditCard,
  Store,
  Palette,
  BarChart3,
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
} from "lucide-react";
import { motion } from "motion/react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { authSuperHeaders } from "../lib/headers";
import { MENU_TEMPLATES, type MenuTemplateDef } from "../menu-templates";
import WebsiteCmsPage from "./WebsiteCmsPage";
import UsersAdminPage from "./UsersAdminPage";

function cn(...i: (string | boolean | undefined)[]) {
  return twMerge(clsx(i));
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
  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem("adminSidebarCollapsed") === "1"
  );
  const [dark, setDark] = useState(() =>
    localStorage.getItem("adminTheme") === "dark"
  );

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
          <NavLink to="/admin/website" className={navCls}>
            <Globe size={20} /> {itemLabel("Web sayt")}
          </NavLink>
          <NavLink to="/admin/users" className={navCls}>
            <Users size={20} /> {itemLabel("İstifadəçilər")}
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
          <NavLink to="/admin/restaurants" className={navCls}>
            <Store size={20} /> {itemLabel("Restoranlar")}
          </NavLink>
          <NavLink to="/admin/templates" className={navCls}>
            <Palette size={20} /> {itemLabel("Şablonlar")}
          </NavLink>
          <NavLink to="/admin/statistics" className={navCls}>
            <BarChart3 size={20} /> {itemLabel("Statistikalar")}
          </NavLink>
          <NavLink to="/admin/notifications" className={navCls}>
            <Bell size={20} /> {itemLabel("Bildirişlər")}
          </NavLink>
          <NavLink to="/admin/settings" className={navCls}>
            <Settings size={20} /> {itemLabel("Ayarlar")}
          </NavLink>
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

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold">İdarə paneli</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          Platforma üzrə ümumi görüntü
        </p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            icon: Utensils,
            label: "Ümumi restoran",
            val: d.totalRestaurants,
            bg: "bg-blue-100 dark:bg-blue-900/40 text-blue-600",
          },
          {
            icon: Server,
            label: "Aktiv / deaktiv",
            val: `${d.activeRestaurants} / ${d.inactiveRestaurants}`,
            bg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600",
          },
          {
            icon: QrCode,
            label: "QR skanları",
            val: d.totalScans,
            bg: "bg-violet-100 dark:bg-violet-900/40 text-violet-600",
          },
          {
            icon: CreditCard,
            label: "Təxmini aylıq gəlir",
            val: `₼${Number(d.estimatedMonthlyRevenue).toFixed(0)}`,
            bg: "bg-amber-100 dark:bg-amber-900/40 text-amber-700",
          },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 320 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
          >
            <Card className="p-4 flex gap-3 items-center shadow-md hover:shadow-xl transition-shadow border-red-100/80 dark:border-red-900/30">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", item.bg)}>
                <item.icon />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">{item.label}</p>
                <p className="text-2xl font-bold">{item.val}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      <Card className="p-4">
        <p className="text-sm font-medium mb-2">Server</p>
        <p className={health?.ok ? "text-emerald-600 text-sm" : "text-red-600 text-sm"}>
          {health?.ok ? "Qoşulub" : "Xəta"} · {health?.driver} · {health?.latencyMs}ms
        </p>
        <p className="text-xs text-gray-500 mt-2">Ümumi səhifə b axışları: {d.totalPageViews}</p>
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
          <Card key={p.id} className="p-5 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{p.name}</h3>
                <p className="text-xs text-gray-500 font-mono">{p.slug}</p>
              </div>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  p.is_active
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-gray-200 text-gray-600"
                )}
              >
                {p.is_active ? "Aktiv" : "Deaktiv"}
              </span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              ${p.price_monthly}
              <span className="text-sm font-normal text-gray-500">/ay</span>
            </p>
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
    max_products: initial?.max_products ?? 20,
    max_categories: initial?.max_categories ?? 5,
    max_templates: initial?.max_templates ?? 5,
    max_qr_codes: initial?.max_qr_codes ?? 1,
    whatsapp_order_enabled: initial?.whatsapp_order_enabled !== 0 && initial?.whatsapp_order_enabled !== false,
    reservation_enabled: !!initial?.reservation_enabled,
    analytics_enabled: !!initial?.analytics_enabled,
    premium_templates_enabled: !!initial?.premium_templates_enabled,
    is_active: initial?.is_active !== 0 && initial?.is_active !== false,
    sort_order: initial?.sort_order ?? 10,
  });

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
              placeholder="Aylıq"
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
          {[
            ["max_products", "Məhsul limiti (-1 = ∞)"],
            ["max_categories", "Kateqoriya"],
            ["max_templates", "Şablon sayı"],
            ["max_qr_codes", "QR limiti"],
          ].map(([k, lab]) => (
            <label key={k} className="text-sm">
              {lab}
              <input
                type="number"
                className="w-full p-2 border rounded-lg mt-1"
                value={f[k as keyof typeof f] as number}
                onChange={(e) =>
                  setF({ ...f, [k]: Number(e.target.value) } as any)
                }
              />
            </label>
          ))}
          {(
            [
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
            onClick={() => onSave(f, initial?.id)}
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
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const nav = useNavigate();
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
    load();
  }, [status]);

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
      load();
    } else alert(await res.text());
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Restoranlar</h1>
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
      </Card>
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
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Plan</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Əməliyyat</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-700">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="p-3 font-medium">{r.name}</td>
                <td className="p-3 font-mono text-xs">/r/{r.slug}</td>
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
    </div>
  );
}

function AdminTemplatesPage() {
  const [custom, setCustom] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    category: "Modern",
    hero_image_url: "",
    theme_json: "",
  });
  const [editRow, setEditRow] = useState<any>(null);

  const load = () =>
    fetch("/api/admin/custom-templates", { headers: authSuperHeaders() })
      .then((r) => r.json())
      .then(setCustom);

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    const res = await fetch("/api/admin/custom-templates", {
      method: "POST",
      headers: authSuperHeaders(),
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: "", category: "Modern", hero_image_url: "", theme_json: "" });
      load();
    } else alert(await res.text());
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Şablonlar</h1>
      <p className="text-sm text-gray-500">
        {MENU_TEMPLATES.length} hazır şablon + fərdi şablonlar. Canlı baxış üçün bəzi restoranın
        slug-ından istifadə edin.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto pr-1">
        {MENU_TEMPLATES.map((tpl: MenuTemplateDef) => (
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
                “Edit” kod bazasındakı registry üçündür — fərdi şablon əlavə edin.
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="font-bold mb-4">Fərdi şablon əlavə et</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            className="p-2 border rounded-lg"
            placeholder="Ad"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            className="p-2 border rounded-lg"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {["Modern", "Luxury", "Minimal", "Fast Food", "Cafe"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <input
            className="p-2 border rounded-lg sm:col-span-2"
            placeholder="Hero şəkil URL"
            value={form.hero_image_url}
            onChange={(e) => setForm({ ...form, hero_image_url: e.target.value })}
          />
          <textarea
            className="p-2 border rounded-lg sm:col-span-2 font-mono text-xs"
            placeholder='İstəyə bağlı: theme JSON (theme obyektinin hissəsi)'
            rows={4}
            value={form.theme_json}
            onChange={(e) => setForm({ ...form, theme_json: e.target.value })}
          />
        </div>
        <Button onClick={add} className="mt-4 bg-red-600 text-white">
          Əlavə et
        </Button>
      </Card>

      <div className="space-y-2">
        <h3 className="font-bold">Fərdi şablonlar</h3>
        {custom.map((c) => (
          <Card key={c.id} className="p-4 flex flex-wrap justify-between gap-2">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs font-mono">{c.slug_key}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  window.open(
                    `/r/demo-az-menu?preview=true&previewTemplate=${encodeURIComponent(c.slug_key)}`,
                    "_blank"
                  )
                }
                className="border text-sm"
              >
                <Eye size={14} className="inline mr-1" /> Preview
              </Button>
              <Button
                onClick={() => setEditRow(c)}
                className="border text-sm"
              >
                Redaktə
              </Button>
              <Button
                onClick={async () => {
                  if (!confirm("Silmək?")) return;
                  await fetch(`/api/admin/custom-templates/${c.id}`, {
                    method: "DELETE",
                    headers: authSuperHeaders(),
                  });
                  load();
                }}
                className="border text-red-600 text-sm"
              >
                Sil
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {editRow && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full space-y-3 border dark:border-slate-700">
            <h3 className="font-bold">Redaktə</h3>
            <input
              className="w-full p-2 border rounded"
              value={editRow.name}
              onChange={(e) => setEditRow({ ...editRow, name: e.target.value })}
            />
            <Button
              onClick={async () => {
                await fetch(`/api/admin/custom-templates/${editRow.id}`, {
                  method: "PUT",
                  headers: authSuperHeaders(),
                  body: JSON.stringify({
                    name: editRow.name,
                    category: editRow.category,
                    hero_image_url: editRow.hero_image_url,
                    theme_json: editRow.theme_json,
                  }),
                });
                setEditRow(null);
                load();
              }}
              className="w-full bg-red-600 text-white"
            >
              Saxla
            </Button>
            <Button onClick={() => setEditRow(null)} className="w-full border">
              Bağla
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatisticsPage() {
  const [d, setD] = useState<any>(null);
  useEffect(() => {
    fetch("/api/admin/dashboard", { headers: authSuperHeaders() })
      .then((r) => r.json())
      .then(setD);
  }, []);
  if (!d) return <p>Yüklənir…</p>;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Statistikalar</h1>
      <Card className="p-6 grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Ümumi skan</p>
          <p className="text-3xl font-bold">{d.totalScans}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Səhifə baxışı (ümumi)</p>
          <p className="text-3xl font-bold">{d.totalPageViews}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Aktiv restoran</p>
          <p className="text-3xl font-bold">{d.activeRestaurants}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Təxmini MRR</p>
          <p className="text-3xl font-bold text-red-600">
            ${Number(d.estimatedMonthlyRevenue).toFixed(0)}
          </p>
        </div>
      </Card>
    </div>
  );
}

function NotificationsPage() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/admin/notifications", { headers: authSuperHeaders() })
      .then((r) => r.json())
      .then(setRows);
  }, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Bildirişlər</h1>
      {rows.map((n) => (
        <Card key={n.id} className="p-4">
          <p className="font-bold">{n.title}</p>
          <p className="text-sm text-gray-600 dark:text-slate-400">{n.body}</p>
        </Card>
      ))}
    </div>
  );
}

function CouponsAdminPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({
    code: "",
    max_uses: 1,
    active_hours: "" as string,
    notes: "",
  });

  const load = () =>
    fetch("/api/admin/coupons", { headers: authSuperHeaders() }).then((r) => r.json()).then(setRows);

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { ...authSuperHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        max_uses: Number(form.max_uses),
        active_hours: form.active_hours ? Number(form.active_hours) : null,
        notes: form.notes || null,
      }),
    });
    if (res.ok) {
      setForm({ code: "", max_uses: 1, active_hours: "", notes: "" });
      load();
    } else alert(await res.text());
  };

  return (
    <div className="space-y-8">
      <motion.h1
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold"
      >
        Promo kuponlar
      </motion.h1>
      <Card className="p-6 max-w-xl space-y-3">
        <input
          className="w-full p-2 border rounded-lg dark:bg-slate-800"
          placeholder="Kod (məs: YAZ2026)"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })}
        />
        <input
          type="number"
          className="w-full p-2 border rounded-lg dark:bg-slate-800"
          placeholder="Max istifadə sayı"
          value={form.max_uses}
          onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })}
        />
        <input
          className="w-full p-2 border rounded-lg dark:bg-slate-800"
          placeholder="Aktiv qalma (saat) — opsional"
          value={form.active_hours}
          onChange={(e) => setForm({ ...form, active_hours: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded-lg dark:bg-slate-800"
          placeholder="Qeyd"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <Button className="bg-red-600 text-white" onClick={create}>
          Yarat
        </Button>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((c) => (
          <motion.div key={c.id} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className="p-5 border-l-4 border-amber-500">
              <p className="font-mono font-bold text-lg">{c.code}</p>
              <p className="text-sm text-gray-600 dark:text-slate-300">
                İstifadə: {c.used_count} / {c.max_uses}
              </p>
              <p className="text-xs">
                Aktiv: {c.is_active ? "bəli" : "xeyr"} · Saat limiti: {c.active_hours ?? "—"}
              </p>
              <p className="text-xs text-gray-500">
                {c.valid_from || "—"} → {c.valid_until || "—"}
              </p>
              <p className="text-xs mt-2">{c.notes}</p>
            </Card>
          </motion.div>
        ))}
      </div>
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

  const load = () =>
    fetch("/api/admin/plan-requests", { headers: authSuperHeaders() })
      .then((r) => r.json())
      .then(setRows);

  React.useEffect(() => {
    load();
  }, []);

  const digits = (s: string) => String(s || "").replace(/\D/g, "");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold">Plan sorğuları</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          Restoranların plan yüksəltmə sorğuları — WhatsApp ilə əlaqə, ödəniş, sonra planı aktiv edin.
        </p>
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
        <Route path="website" element={<WebsiteCmsPage />} />
        <Route path="users" element={<UsersAdminPage />} />
        <Route path="coupons" element={<CouponsAdminPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="plan-requests" element={<PlanRequestsPage />} />
        <Route path="restaurants" element={<RestaurantsAdminPage />} />
        <Route path="templates" element={<AdminTemplatesPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
