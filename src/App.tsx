import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  MenuTemplateView,
  resolveMenuTemplate,
  TemplatePicker,
  MENU_TEMPLATE_COUNT,
  type MenuTemplateDef,
  type CartLine,
} from "./menu-templates";
import AdminLoginPage from "./admin/AdminLoginPage";
import AdminApp from "./admin/AdminApp";
import { 
  LayoutDashboard, 
  Utensils, 
  QrCode, 
  Plus, 
  Trash2, 
  ChevronRight, 
  X,
  ShoppingCart,
  MessageSquare,
  Globe,
  ShieldCheck,
  Wifi,
  LogIn,
  Sparkles,
  ArrowRight,
  Store,
  Smartphone,
  Layers,
  ShoppingBag,
  CircleCheck,
  Menu,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { authRestaurantHeaders, authAnyStaffHeaders } from "./lib/headers";
import { I18nBundleContext, useI18nBundle } from "./i18n/bundleContext";
import RestaurantOnboarding from "./RestaurantOnboarding";
import LandingPage from "./landing/LandingPage";
import { UI_TRANSLATIONS } from "./i18n/uiBuiltIn";
import { AuthSplitLayout } from "./auth/AuthSplitLayout";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Restaurant {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
  cover_image_url?: string;
  primary_color: string;
  whatsapp_number: string;
  theme: string;
  is_active: boolean;
  plan: string;
  staff_username?: string;
  menu_template?: string;
  tagline?: string;
  maps_url?: string;
  phone?: string;
  reservation_url?: string;
  instagram?: string;
  tiktok?: string;
}

interface Category {
  id: number;
  restaurant_id: number;
  name: string;
  sort_order: number;
  translations?: Record<string, string>;
}

interface ProductVariantRow {
  id: number;
  product_id: number;
  name: string;
  price: number;
  sort_order?: number;
}

interface Product {
  id: number;
  category_id: number;
  restaurant_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  translations?: Record<string, { name?: string; desc?: string }>;
  variants?: ProductVariantRow[];
}

// --- Components ---

const Button = ({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button 
    className={cn(
      "px-4 py-2 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50",
      className
    )} 
    {...props} 
  />
);

const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden", className)} {...props}>
    {children}
  </div>
);

// --- Pages ---

const RegisterPage = () => {
  const bundle = useI18nBundle();
  const navigate = useNavigate();
  const [lang, setLang] = useState("az");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [doneUsername, setDoneUsername] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((s: { default_language?: string }) => {
        if (s.default_language) setLang(s.default_language);
      })
      .catch(() => {});
  }, []);

  const t = (key: string) => bundle[lang]?.[key] || key;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/public/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          username: username.trim().toLowerCase(),
          password,
          phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("server_error"));
        return;
      }
      setDoneUsername(String(username).trim().toLowerCase());
    } catch {
      setError(t("server_error"));
    } finally {
      setBusy(false);
    }
  };

  if (doneUsername) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-red-950 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <Card className="p-6 sm:p-8 border border-white/10 bg-white/95 backdrop-blur shadow-2xl text-center space-y-6">
            <div className="text-4xl">✓</div>
            <h1 className="text-xl font-bold text-gray-900">{t("register_success_title")}</h1>
            <p className="text-sm text-gray-600">{t("register_success_note")}</p>
            <div className="flex flex-col gap-3">
              <Button
                type="button"
                className="w-full bg-red-600 text-white py-3 font-bold"
                onClick={() =>
                  navigate("/panel", { replace: true, state: { username: doneUsername, startOnboarding: true } })
                }
              >
                {t("btn_prepare_menu")}
              </Button>
              <Button
                type="button"
                className="w-full border border-gray-200 bg-white py-3 font-semibold text-gray-800"
                onClick={() => navigate("/panel", { replace: true, state: { username: doneUsername } })}
              >
                {t("btn_continue")}
              </Button>
            </div>
            <Link to="/" className="inline-block text-sm text-red-600 hover:underline">
              ← {t("landing_nav_start")}
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthSplitLayout defaultTitle={t("landing_sales_title")} defaultSubtitle={t("register_sub")}>
      <Card className="p-6 sm:p-8 border border-white/10 bg-white/95 backdrop-blur shadow-2xl rounded-2xl">
          <div className="flex items-center gap-2 text-red-600 font-bold text-xl mb-2 justify-center">
            <Store /> {t("register_title")}
          </div>
          <p className="text-center text-gray-500 text-sm mb-6">{t("register_sub_profile")}</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("full_name_label")}</label>
              <input
                className="w-full p-3 border rounded-lg"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("username")}</label>
              <input
                className="w-full p-3 border rounded-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("password")}</label>
              <input
                type="password"
                className="w-full p-3 border rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("phone_label")}</label>
              <input
                className="w-full p-3 border rounded-lg"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" disabled={busy} className="w-full bg-red-600 text-white py-3 disabled:opacity-60">
              {busy ? "…" : t("register_submit")}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
            <p>
              {t("register_have_account")}{" "}
              <Link to="/panel" className="text-red-600 font-medium hover:underline">
                {t("login")}
              </Link>
            </p>
            <Link to="/" className="block text-red-600 hover:underline">
              ← {t("landing_nav_start")}
            </Link>
          </div>
        </Card>
    </AuthSplitLayout>
  );
};

const RestaurantLoginPage = () => {
  const bundle = useI18nBundle();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from;
  const regState = location.state as { registered?: boolean; username?: string } | undefined;
  const [lang, setLang] = useState("az");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((s: { default_language?: string }) => {
        if (s.default_language) setLang(s.default_language);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const u = regState?.username;
    if (u) setUsername(u);
  }, [regState?.username]);

  const t = (key: string) => bundle[lang]?.[key] || key;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/restaurant/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem("restaurantSession", data.token);
      localStorage.setItem("restaurantId", String(data.restaurantId));
      const st = location.state as { startOnboarding?: boolean } | undefined;
      try {
        const menuRes = await fetch(`/api/admin/restaurants/${data.restaurantId}/menu`, {
          headers: authAnyStaffHeaders(),
        });
        if (menuRes.ok) {
          const menuData = await menuRes.json();
          const ob = menuData.restaurant?.onboarding_completed;
          const completed = ob === true || ob === 1 || ob === "1";
          if (st?.startOnboarding === true || !completed) {
            navigate(`/restaurant/${data.restaurantId}/onboarding`, { replace: true });
            return;
          }
        }
      } catch {
        /* ignore */
      }
      navigate(from || `/restaurant/${data.restaurantId}`, { replace: true });
    } else {
      setError(data.error || "Login failed");
    }
  };

  return (
    <AuthSplitLayout defaultTitle={t("landing_sales_title")} defaultSubtitle={t("landing_hero_display_sub")}>
      <Card className="p-6 sm:p-8 border border-white/10 bg-white/95 backdrop-blur shadow-2xl rounded-2xl">
          <div className="flex items-center gap-2 text-red-600 font-bold text-xl mb-2 justify-center">
            <LogIn /> {t("rest_login_title")}
          </div>
          <p className="text-center text-gray-500 text-sm mb-6">{t("rest_login_sub")}</p>
          <p className="text-xs text-center text-amber-700 bg-amber-50 rounded-lg p-2 mb-4">{t("demo_login")}</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("username")}</label>
              <input
                className="w-full p-3 border rounded-lg"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("password")}</label>
              <input
                type="password"
                className="w-full p-3 border rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-red-600 text-white py-3">
              {t("login")}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
            <p>
              <Link to="/register" className="text-red-600 font-medium hover:underline">
                {t("register_title")}
              </Link>
            </p>
            <Link to="/" className="text-red-600 hover:underline">
              ← {t("landing_nav_start")}
            </Link>
          </div>
        </Card>
    </AuthSplitLayout>
  );
};

const RestaurantPanel = () => {
  const bundle = useI18nBundle();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const basePath = `/restaurant/${id}`;
  const pathParts = location.pathname.replace(/\/$/, "").split("/").filter(Boolean);
  const section = pathParts[2] || "dashboard";
  const productsNew = pathParts[2] === "products" && pathParts[3] === "new";
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newCat, setNewCat] = useState("");
  const [newProd, setNewProd] = useState({
    name: "",
    price: 0,
    category_id: 0,
    description: "",
    image_url: "",
  });
  const [newProdVariants, setNewProdVariants] = useState<Array<{ name: string; price: string }>>([]);
  const [qrCode, setQrCode] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    slug: "",
    whatsapp_number: "",
    primary_color: "#ef4444",
    menu_template: "modern-01",
    tagline: "",
    maps_url: "",
    phone: "",
    reservation_url: "",
    instagram: "",
    tiktok: "",
    logo_url: "",
    cover_image_url: "",
  });
  const [editingTranslations, setEditingTranslations] = useState<{ type: 'category' | 'product', id: number, data: any } | null>(null);
  const [currentLang, setCurrentLang] = useState(() => {
    if (typeof navigator === "undefined") return "az";
    const n = navigator.language?.slice(0, 2).toLowerCase();
    return ["az", "en", "ru", "tr"].includes(n) ? n : "az";
  });
  const [loadError, setLoadError] = useState("");
  const [extraTemplates, setExtraTemplates] = useState<MenuTemplateDef[]>([]);
  const [dashStats, setDashStats] = useState<{ scans: number; pageViews: number; topProducts: any[] } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [planRow, setPlanRow] = useState<Record<string, unknown> | null>(null);
  const [pendingPlanRequest, setPendingPlanRequest] = useState<{
    id: number;
    status: string;
    plan_name: string;
  } | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [planUpgradeOpen, setPlanUpgradeOpen] = useState(false);
  const [planSuccessOpen, setPlanSuccessOpen] = useState(false);
  const [selectedUpgradePlanId, setSelectedUpgradePlanId] = useState<number | null>(null);
  const [catalogPlans, setCatalogPlans] = useState<
    Array<{
      id: number;
      name: string;
      slug: string;
      max_products: number;
      max_categories: number;
      max_templates: number;
      price_monthly: string | number;
    }>
  >([]);

  const isSuper = typeof window !== "undefined" && !!localStorage.getItem("adminSession");

  useEffect(() => {
    const st = localStorage.getItem("adminSession");
    const rt = localStorage.getItem("restaurantSession");
    const rid = localStorage.getItem("restaurantId");
    if (!st && !rt) {
      navigate("/panel", { replace: true, state: { from: `/restaurant/${id}` } });
      return;
    }
    if (rt && rid && rid !== String(id)) {
      navigate("/panel", { replace: true });
    }
  }, [id, navigate]);

  useEffect(() => {
    const load = async () => {
      setLoadError("");
      const res = await fetch(`/api/admin/restaurants/${id}/menu`, {
        headers: authAnyStaffHeaders(),
      });
      if (!res.ok) {
        setLoadError("Unauthorized");
        navigate("/panel", { replace: true, state: { from: `/restaurant/${id}` } });
        return;
      }
      const data = await res.json();
      setRestaurant(data.restaurant);
      setCategories(data.categories);
      setProducts(data.products);
      setPlanRow((data.plan as Record<string, unknown>) ?? null);
      setPendingPlanRequest(data.pendingPlanRequest ?? null);
      const r = data.restaurant;
      setProfile({
        name: r.name || "",
        slug: r.slug || "",
        whatsapp_number: r.whatsapp_number || "",
        primary_color: r.primary_color || "#ef4444",
        menu_template: r.menu_template || "modern-01",
        tagline: r.tagline || "",
        maps_url: r.maps_url || "",
        phone: r.phone || "",
        reservation_url: r.reservation_url || "",
        instagram: r.instagram || "",
        tiktok: r.tiktok || "",
        logo_url: r.logo_url || "",
        cover_image_url: r.cover_image_url || "",
      });
      const menuUrl = `${window.location.origin}/r/${r.slug}`;
      const qr = await fetch(`/api/qrcode?url=${encodeURIComponent(menuUrl)}`).then((x) => x.json());
      setQrCode(qr.qrDataUrl);
      const rows = data.customTemplates || [];
      setExtraTemplates(
        rows.map((row: { slug_key: string; name: string; category: string; hero_image_url?: string; theme_json?: string }) =>
          resolveMenuTemplate(row.slug_key, [row])
        )
      );
    };
    load();
  }, [id, navigate]);

  useEffect(() => {
    if (!id || section !== "dashboard") return;
    fetch(`/api/admin/restaurants/${id}/dashboard`, {
      headers: authAnyStaffHeaders(),
    })
      .then((r) => r.json())
      .then(setDashStats)
      .catch(() => setDashStats(null));
  }, [id, section]);

  useEffect(() => {
    if (!id || section !== "orders") return;
    fetch(`/api/admin/restaurants/${id}/orders`, { headers: authAnyStaffHeaders() })
      .then((r) => r.json())
      .then(setOrders);
  }, [id, section]);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((s: { default_language?: string }) => {
        const d = s?.default_language;
        if (d && ["az", "en", "ru", "tr"].includes(d)) setCurrentLang(d);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (section !== "plan" && !planUpgradeOpen) return;
    fetch("/api/public/plans")
      .then((r) => r.json())
      .then((rows) => setCatalogPlans(Array.isArray(rows) ? rows : []))
      .catch(() => setCatalogPlans([]));
  }, [section, planUpgradeOpen]);

  const t = (key: string) => bundle[currentLang]?.[key] || key;

  const closeMobileNav = () => setMobileNavOpen(false);

  const lim = (n: number) => (n < 0 ? "∞" : String(n));

  const submitPlanRequest = async () => {
    if (!selectedUpgradePlanId) return;
    const res = await fetch(`/api/admin/restaurants/${id}/plan-request`, {
      method: "POST",
      headers: authAnyStaffHeaders(),
      body: JSON.stringify({ subscription_plan_id: selectedUpgradePlanId }),
    });
    if (res.ok) {
      setPlanUpgradeOpen(false);
      setPlanSuccessOpen(true);
      const reload = await fetch(`/api/admin/restaurants/${id}/menu`, { headers: authAnyStaffHeaders() });
      const d = await reload.json();
      setPendingPlanRequest(d.pendingPlanRequest ?? null);
    } else {
      const err = await res.json().catch(() => ({}));
      alert((err as { error?: string }).error || t("server_error"));
    }
  };

  const saveProfile = async () => {
    const res = await fetch(`/api/admin/restaurants/${id}/profile`, {
      method: "PUT",
      headers: authAnyStaffHeaders(),
      body: JSON.stringify(profile),
    });
    if (res.ok) {
      const data = await res.json();
      setRestaurant(data.restaurant);
      const menuUrl = `${window.location.origin}/r/${data.restaurant.slug}`;
      const qr = await fetch(`/api/qrcode?url=${encodeURIComponent(menuUrl)}`).then((x) => x.json());
      setQrCode(qr.qrDataUrl);
      alert("OK");
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Error");
    }
  };

  const staffLogout = () => {
    localStorage.removeItem("restaurantSession");
    localStorage.removeItem("restaurantId");
    navigate("/panel");
  };

  const uploadAsset = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const token =
      localStorage.getItem("restaurantSession") || localStorage.getItem("adminSession");
    if (!token) return null;
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { url?: string };
    return j.url ?? null;
  };

  const selectTemplate = async (tpl: MenuTemplateDef) => {
    const res = await fetch(`/api/admin/restaurants/${id}/profile`, {
      method: "PUT",
      headers: authAnyStaffHeaders(),
      body: JSON.stringify({ menu_template: tpl.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setRestaurant(data.restaurant);
      setProfile((p) => ({ ...p, menu_template: tpl.id }));
    } else alert("Template save failed");
  };

  const addCategory = async () => {
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: authAnyStaffHeaders(),
      body: JSON.stringify({ restaurant_id: Number(id), name: newCat })
    });
    if (res.ok) {
      const data = await res.json();
      setCategories([...categories, data]);
      setNewCat("");
    }
  };

  const addProduct = async () => {
    const variants = newProdVariants
      .filter((v) => v.name.trim() && v.price.trim() !== "")
      .map((v) => ({ name: v.name.trim(), price: Number(v.price) }))
      .filter((v) => !Number.isNaN(v.price));
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: authAnyStaffHeaders(),
      body: JSON.stringify({
        ...newProd,
        restaurant_id: Number(id),
        variants: variants.length ? variants : undefined,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setProducts([...products, data]);
      setNewProd({ name: "", price: 0, category_id: 0, description: "", image_url: "" });
      setNewProdVariants([]);
      if (productsNew) navigate(`${basePath}/products`);
    }
  };

  const deleteCategory = async (cid: number) => {
    if (!confirm(t("confirm_delete_category"))) return;
    const res = await fetch(`/api/admin/categories/${cid}`, {
      method: "DELETE",
      headers: authAnyStaffHeaders(),
    });
    if (res.ok) {
      setCategories((c) => c.filter((x) => x.id !== cid));
      setProducts((p) => p.filter((x) => x.category_id !== cid));
    }
  };

  const deleteProduct = async (pid: number) => {
    if (!confirm(t("confirm_delete_product"))) return;
    const res = await fetch(`/api/admin/products/${pid}`, {
      method: "DELETE",
      headers: authAnyStaffHeaders(),
    });
    if (res.ok) setProducts((p) => p.filter((x) => x.id !== pid));
  };

  const sidebarCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
      isActive ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-50"
    );

  const saveTranslations = async () => {
    if (!editingTranslations) return;
    const { type, id: targetId, data } = editingTranslations;
    const endpoint = type === 'category' ? `/api/admin/categories/${targetId}` : `/api/admin/products/${targetId}`;
    
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: authAnyStaffHeaders(),
      body: JSON.stringify({ translations: data })
    });

    if (res.ok) {
      if (type === 'category') {
        setCategories(categories.map(c => c.id === targetId ? { ...c, translations: data } : c));
      } else {
        setProducts(products.map(p => p.id === targetId ? { ...p, translations: data } : p));
      }
      setEditingTranslations(null);
      alert("Translations saved!");
    } else {
      alert("Failed to save translations.");
    }
  };

  if (loadError) return <div className="p-10 text-center text-red-600">{loadError}</div>;
  if (!restaurant) return <div className="p-10">{t("loading")}</div>;

  const navLinks = (
    <>
      <NavLink to={basePath} end className={sidebarCls} onClick={closeMobileNav}>
        <LayoutDashboard size={18} /> {t("dashboard")}
      </NavLink>
      <NavLink to={`${basePath}/categories`} className={sidebarCls} onClick={closeMobileNav}>
        <Utensils size={18} /> {t("categories")}
      </NavLink>
      <NavLink to={`${basePath}/products`} className={sidebarCls} onClick={closeMobileNav}>
        <Plus size={18} /> {t("products")}
      </NavLink>
      <NavLink to={`${basePath}/templates`} className={sidebarCls} onClick={closeMobileNav}>
        <QrCode size={18} /> {t("templates_section_title")}
      </NavLink>
      <NavLink to={`${basePath}/plan`} className={sidebarCls} onClick={closeMobileNav}>
        <CreditCard size={18} /> {t("panel_plan")}
      </NavLink>
      <NavLink to={`${basePath}/orders`} className={sidebarCls} onClick={closeMobileNav}>
        <ShoppingCart size={18} /> {t("orders_section_title")}
      </NavLink>
      <NavLink to={`${basePath}/settings`} className={sidebarCls} onClick={closeMobileNav}>
        <Globe size={18} /> {t("settings")}
      </NavLink>
      <a
        href={`/r/${restaurant.slug}`}
        target="_blank"
        rel="noreferrer"
        onClick={closeMobileNav}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm whitespace-nowrap"
      >
        <Globe size={18} /> {t("view_live")}
      </a>
      {isSuper && (
        <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 whitespace-nowrap" onClick={closeMobileNav}>
          {t("back_admin")}
        </Link>
      )}
      {!isSuper && (
        <button
          type="button"
          onClick={() => {
            closeMobileNav();
            staffLogout();
          }}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 whitespace-nowrap"
        >
          <X size={18} /> {t("logout")}
        </button>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pb-safe">
      <div className="md:hidden sticky top-0 z-30 flex items-center gap-2 border-b border-gray-200 bg-white/95 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <button
          type="button"
          aria-label="Menyu"
          onClick={() => setMobileNavOpen(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-800 shadow-sm active:scale-95"
        >
          <Menu size={22} />
        </button>
        <span className="min-w-0 flex-1 truncate text-center text-sm font-bold text-red-600">{restaurant.name}</span>
        <span className="w-11 shrink-0" />
      </div>

      <AnimatePresence>
        {mobileNavOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="BaДџla"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/45 md:hidden"
              onClick={closeMobileNav}
            />
            <motion.aside
              initial={{ x: "-105%" }}
              animate={{ x: 0 }}
              exit={{ x: "-105%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 z-50 flex w-[min(88vw,300px)] flex-col overflow-y-auto border-r border-gray-200 bg-white shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <span className="flex items-center gap-2 font-bold text-red-600">
                  <Utensils size={20} />
                  <span className="truncate max-w-[11rem]">{restaurant.name}</span>
                </span>
                <button
                  type="button"
                  onClick={closeMobileNav}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-1 p-3">{navLinks}</div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white p-4">
        <div className="mb-4 flex items-center gap-2 px-1 text-lg font-bold text-red-600">
          <Utensils /> <span className="truncate max-w-[10rem]">{restaurant.name}</span>
        </div>
        <div className="flex flex-col gap-1">{navLinks}</div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-8 w-full min-w-0">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {section === "dashboard" && t("dashboard")}
            {section === "settings" && t("settings")}
            {section === "categories" && t("categories")}
            {section === "products" && (productsNew ? t("add_product") : t("products"))}
            {section === "templates" && t("templates_section_title")}
            {section === "plan" && t("panel_plan")}
            {section === "orders" && t("orders_section_title")}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <select 
              className="p-2 border rounded-lg bg-white text-sm"
              value={currentLang}
              onChange={e => setCurrentLang(e.target.value)}
            >
              <option value="az">AZ</option>
              <option value="en">EN</option>
              <option value="ru">RU</option>
              <option value="tr">TR</option>
            </select>
            <a 
              href={`/r/${restaurant.slug}`} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-red-600 font-bold text-sm hover:underline"
            >
              <Globe size={18} /> {t("view_live")}
            </a>
          </div>
        </header>

        {section === "dashboard" && dashStats && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4">
              <p className="text-xs text-gray-500">{t("dash_qr_scans")}</p>
              <p className="text-2xl font-bold text-red-600">{dashStats.scans}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-gray-500">{t("dash_menu_views")}</p>
              <p className="text-2xl font-bold">{dashStats.pageViews}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-gray-500 mb-2">{t("dash_top_viewed")}</p>
              <ul className="text-sm space-y-1">
                {(dashStats.topProducts || []).slice(0, 5).map((p: any) => (
                  <li key={p.id}>
                    {p.name} <span className="text-gray-400">({p.view_count})</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {section === "orders" && (
          <Card className="p-6">
            <p className="text-sm text-gray-500 mb-4">{t("orders_stub_note")}</p>
            {orders.length === 0 ? (
              <p className="text-gray-400 text-sm">{t("orders_empty")}</p>
            ) : (
              <ul className="text-sm space-y-2">
                {orders.map((o) => (
                  <li key={o.id} className="border rounded-lg p-3">
                    #{o.id} · {o.status}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {section === "plan" && planRow ? (
          <>
            <Card className="p-6 mb-6 shadow-md">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900">{t("plan_active_label")}</h2>
                <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">
                  {String(planRow.name ?? "")}
                </span>
                {pendingPlanRequest ? (
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-bold uppercase text-amber-900">
                    {t("plan_processing_badge")}
                  </span>
                ) : null}
              </div>
              <h3 className="mb-3 font-semibold text-gray-800">{t("plan_limits_title")}</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  {t("plan_max_categories")}: <strong>{lim(Number(planRow.max_categories))}</strong>
                </li>
                <li>
                  {t("plan_max_products")}: <strong>{lim(Number(planRow.max_products))}</strong>
                </li>
                <li>
                  {t("plan_max_templates")}: <strong>{lim(Number(planRow.max_templates))}</strong>
                </li>
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  className="bg-red-600 text-white shadow-lg hover:bg-red-500"
                  onClick={() => {
                    setSelectedUpgradePlanId(null);
                    setPlanUpgradeOpen(true);
                  }}
                >
                  {t("plan_upgrade_btn")}
                </Button>
              </div>
            </Card>

            <AnimatePresence>
              {planUpgradeOpen ? (
                <motion.div
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setPlanUpgradeOpen(false)}
                >
                  <motion.div
                    initial={{ scale: 0.94, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.94, opacity: 0 }}
                    className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="mb-4 text-lg font-bold">{t("plan_upgrade_modal_title")}</h3>
                    <div className="mb-6 space-y-2">
                      {catalogPlans.map((p) => (
                        <label
                          key={p.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                            selectedUpgradePlanId === p.id ? "border-red-500 bg-red-50" : "border-gray-200"
                          )}
                        >
                          <input
                            type="radio"
                            name="plan-upgrade"
                            checked={selectedUpgradePlanId === p.id}
                            onChange={() => setSelectedUpgradePlanId(p.id)}
                          />
                          <div>
                            <div className="font-bold">{p.name}</div>
                            <div className="text-xs text-gray-500">
                              ₼{p.price_monthly}
                              {t("plan_price_month_suffix")} · {t("plan_max_products")}: {lim(p.max_products)}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" className="flex-1 border border-gray-200 bg-white" onClick={() => setPlanUpgradeOpen(false)}>
                        {t("checkout_cancel")}
                      </Button>
                      <Button
                        type="button"
                        disabled={!selectedUpgradePlanId}
                        className="flex-1 bg-red-600 text-white disabled:opacity-50"
                        onClick={() => void submitPlanRequest()}
                      >
                        {t("plan_request_submit")}
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {planSuccessOpen ? (
                <motion.div
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="max-w-md space-y-4 rounded-2xl bg-white p-8 text-center shadow-2xl"
                  >
                    <p className="text-xl font-bold text-green-700">{t("plan_request_ok_title")}</p>
                    <p className="text-sm text-gray-600">{t("plan_request_ok_body")}</p>
                    <Button
                      type="button"
                      className="w-full bg-red-600 text-white"
                      onClick={() => {
                        setPlanSuccessOpen(false);
                        navigate(`${basePath}/plan`);
                      }}
                    >
                      {t("plan_back_panel")}
                    </Button>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </>
        ) : null}

        {section === "settings" && (
        <Card className="p-4 sm:p-6 mb-8 border-red-100">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <QrCode size={20} className="text-red-600" /> {t("your_link")}
          </h3>
          <p className="text-xs text-gray-500 mb-4 font-mono break-all">
            {typeof window !== "undefined" ? `${window.location.origin}/r/${profile.slug}` : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              className="p-2 border rounded-lg text-sm"
              placeholder={t("name")}
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
            <input
              className="p-2 border rounded-lg text-sm font-mono"
              placeholder={t("slug_label")}
              value={profile.slug}
              onChange={(e) => setProfile({ ...profile, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
            />
            <input
              className="p-2 border rounded-lg text-sm"
              placeholder={t("whatsapp")}
              value={profile.whatsapp_number}
              onChange={(e) => setProfile({ ...profile, whatsapp_number: e.target.value })}
            />
            <textarea
              className="p-2 border rounded-lg text-sm sm:col-span-2"
              placeholder="Tagline / short description"
              rows={2}
              value={profile.tagline}
              onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
            />
            <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">{t("logo_upload_label")}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {profile.logo_url ? (
                    <img
                      src={profile.logo_url}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                    />
                  ) : null}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="text-xs max-w-[200px]"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = await uploadAsset(f);
                      if (url) setProfile((p) => ({ ...p, logo_url: url }));
                      e.target.value = "";
                    }}
                  />
                </div>
                <input
                  className="mt-2 w-full p-2 border rounded-lg text-xs font-mono"
                  placeholder="Logo URL (ixtiyari)"
                  value={profile.logo_url}
                  onChange={(e) => setProfile({ ...profile, logo_url: e.target.value })}
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">{t("cover_upload_label")}</p>
                {profile.cover_image_url ? (
                  <img
                    src={profile.cover_image_url}
                    alt=""
                    className="w-full h-20 object-cover rounded-lg border mb-2"
                  />
                ) : null}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="text-xs max-w-[200px]"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const url = await uploadAsset(f);
                    if (url) setProfile((p) => ({ ...p, cover_image_url: url }));
                    e.target.value = "";
                  }}
                />
                <input
                  className="mt-2 w-full p-2 border rounded-lg text-xs font-mono"
                  placeholder="Cover URL (ixtiyari)"
                  value={profile.cover_image_url}
                  onChange={(e) => setProfile({ ...profile, cover_image_url: e.target.value })}
                />
              </div>
            </div>
            <input
              className="p-2 border rounded-lg text-sm"
              placeholder="Google Maps URL"
              value={profile.maps_url}
              onChange={(e) => setProfile({ ...profile, maps_url: e.target.value })}
            />
            <input
              className="p-2 border rounded-lg text-sm"
              placeholder="Phone (call)"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
            <input
              className="p-2 border rounded-lg text-sm"
              placeholder="Reservation URL"
              value={profile.reservation_url}
              onChange={(e) => setProfile({ ...profile, reservation_url: e.target.value })}
            />
            <input
              className="p-2 border rounded-lg text-sm"
              placeholder="Instagram URL"
              value={profile.instagram}
              onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
            />
            <input
              className="p-2 border rounded-lg text-sm"
              placeholder="TikTok URL"
              value={profile.tiktok}
              onChange={(e) => setProfile({ ...profile, tiktok: e.target.value })}
            />
            <div className="flex gap-2 items-center sm:col-span-2">
              <input
                type="color"
                className="h-10 w-14 rounded border cursor-pointer"
                value={profile.primary_color}
                onChange={(e) => setProfile({ ...profile, primary_color: e.target.value })}
              />
              <Button onClick={saveProfile} className="bg-red-600 text-white text-sm flex-1">
                {t("save_profile")}
              </Button>
            </div>
          </div>
        </Card>
        )}

        {section === "settings" && (
        <Card className="p-6 mb-8 max-w-md">
              <h3 className="font-bold mb-4">{t("panel_qr_title")}</h3>
              <div className="bg-white border rounded-xl flex flex-col items-center justify-center p-6 text-center">
                {qrCode ? (
                  <img src={qrCode} alt="QR Code" className="w-48 h-48 mb-4" />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 animate-pulse mb-4 rounded-lg"></div>
                )}
                <p className="text-sm text-gray-500 mb-4">{t("panel_qr_scan_hint")}</p>
                <div className="flex gap-2 w-full">
                  <Button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = qrCode;
                      link.download = `${restaurant.slug}-qr.png`;
                      link.click();
                    }}
                    className="flex-1 bg-red-600 text-white text-sm"
                  >
                    {t("panel_download")}
                  </Button>
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/r/${restaurant.slug}`);
                      alert(t("link_copied"));
                    }}
                    className="flex-1 bg-gray-100 text-gray-600 text-sm"
                  >
                    {t("panel_copy_link")}
                  </Button>
                </div>
              </div>
            </Card>
        )}

        {section === "templates" && (
        <Card className="p-4 sm:p-6 mb-8">
          <h3 className="font-bold text-lg mb-1">{t("templates_section_title")}</h3>
          <p className="text-sm text-gray-500 mb-4">
            {MENU_TEMPLATE_COUNT}+ {t("templates_section_sub")}
          </p>
          <TemplatePicker
            restaurantSlug={restaurant.slug}
            selectedId={profile.menu_template}
            onSelect={selectTemplate}
            extraTemplates={extraTemplates}
          />
        </Card>
        )}

        {section === "categories" && (
            <Card className="p-6 max-w-xl mb-8">
              <h3 className="font-bold mb-4">{t("add_category")}</h3>
              <div className="flex gap-2">
                <input 
                  placeholder={t("name")} 
                  className="flex-1 p-2 border rounded-lg"
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                />
                <Button onClick={addCategory} className="bg-black text-white p-2">
                  <Plus size={20} />
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span>{cat.translations?.[currentLang] || cat.name}</span>
                    <div className="flex gap-1">
                      <button 
                        type="button"
                        onClick={() => setEditingTranslations({ type: 'category', id: cat.id, data: cat.translations || {} })}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Globe size={16} />
                      </button>
                      <button type="button" onClick={() => deleteCategory(cat.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
        )}

        {section === "products" && !productsNew && (
          <div className="space-y-6">
            <Link
              to={`${basePath}/products/new`}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm"
            >
              <Plus size={18} /> {t("add_product")}
            </Link>
            <div className="space-y-4">
              {categories.map(cat => (
                <div key={cat.id}>
                  <h4 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-2">{cat.translations?.[currentLang] || cat.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.filter(p => p.category_id === cat.id).map(prod => (
                      <Card key={prod.id} className="p-4 flex gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                          {prod.image_url ? (
                            <img
                              src={prod.image_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between gap-2">
                            <h5 className="font-bold">{prod.translations?.[currentLang]?.name || prod.name}</h5>
                            <span className="font-bold text-red-600">₼{Number(prod.price).toFixed(2)}</span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">{prod.translations?.[currentLang]?.desc || prod.description}</p>
                          {prod.variants && prod.variants.length > 0 ? (
                            <ul className="mt-2 text-xs text-gray-600 space-y-0.5 list-disc list-inside">
                              {prod.variants.map((v) => (
                                <li key={v.id}>
                                  {v.name} — ₼{Number(v.price).toFixed(2)}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          <div className="mt-2 flex justify-end gap-2">
                            <button 
                              type="button"
                              onClick={() => setEditingTranslations({ type: 'product', id: prod.id, data: prod.translations || {} })}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-bold"
                            >
                              <Globe size={14} /> {t("translations")}
                            </button>
                            <button type="button" onClick={() => deleteProduct(prod.id)} className="text-red-500 p-1"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {productsNew && (
            <Card className="p-6 mb-6 max-w-xl">
              <h3 className="font-bold mb-4">{t("add_product")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input 
                  placeholder={t("name")} 
                  className="p-2 border rounded-lg"
                  value={newProd.name}
                  onChange={e => setNewProd({ ...newProd, name: e.target.value })}
                />
                <input 
                  type="number" 
                  placeholder={t("price")} 
                  className="p-2 border rounded-lg"
                  value={newProd.price}
                  onChange={e => setNewProd({ ...newProd, price: Number(e.target.value) })}
                />
                <select 
                  className="p-2 border rounded-lg sm:col-span-2"
                  value={newProd.category_id}
                  onChange={e => setNewProd({ ...newProd, category_id: Number(e.target.value) })}
                >
                  <option value={0}>{t("select_category")}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.translations?.[currentLang] || cat.name}</option>
                  ))}
                </select>
                <textarea
                  className="p-2 border rounded-lg sm:col-span-2 text-sm"
                  placeholder={t("description")}
                  rows={3}
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                />
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">{t("product_image_upload_label")}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    {newProd.image_url ? (
                      <img src={newProd.image_url} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                    ) : null}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="text-xs max-w-full"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const url = await uploadAsset(f);
                        if (url) setNewProd((p) => ({ ...p, image_url: url }));
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
                <div className="sm:col-span-2 border-t pt-4 mt-2">
                  <p className="text-sm font-semibold text-gray-800 mb-2">{t("product_variants_heading")}</p>
                  <div className="space-y-2 mb-2">
                    {newProdVariants.map((row, idx) => (
                      <div key={idx} className="flex flex-wrap gap-2 items-center">
                        <input
                          className="flex-1 min-w-[140px] p-2 border rounded-lg text-sm"
                          placeholder={t("variant_name_short")}
                          value={row.name}
                          onChange={(e) =>
                            setNewProdVariants((rows) =>
                              rows.map((r, i) => (i === idx ? { ...r, name: e.target.value } : r))
                            )
                          }
                        />
                        <input
                          type="number"
                          step="0.01"
                          className="w-28 p-2 border rounded-lg text-sm"
                          placeholder={t("variant_price_short")}
                          value={row.price}
                          onChange={(e) =>
                            setNewProdVariants((rows) =>
                              rows.map((r, i) => (i === idx ? { ...r, price: e.target.value } : r))
                            )
                          }
                        />
                        <button
                          type="button"
                          className="text-xs text-red-600 font-semibold px-2"
                          onClick={() => setNewProdVariants((rows) => rows.filter((_, i) => i !== idx))}
                        >
                          {t("remove_variant_btn")}
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="text-sm text-red-600 font-bold"
                    onClick={() => setNewProdVariants((rows) => [...rows, { name: "", price: "" }])}
                  >
                    + {t("add_variant_btn")}
                  </button>
                </div>
                <Button type="button" onClick={() => navigate(`${basePath}/products`)} className="border">
                  {t("onboarding_back")}
                </Button>
                <Button type="button" onClick={addProduct} className="bg-red-600 text-white">{t("add_product")}</Button>
              </div>
            </Card>
        )}

      </main>

      {/* Translation Modal */}
      <AnimatePresence>
        {editingTranslations && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold">{t("translations")}</h3>
                <button onClick={() => setEditingTranslations(null)} className="text-gray-400 hover:text-black">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {["az", "en", "ru", "tr"].map(lang => (
                  <div key={lang} className="p-4 border rounded-xl bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe size={16} className="text-red-600" />
                      <span className="font-bold uppercase text-sm">{lang}</span>
                    </div>
                    {editingTranslations.type === 'category' ? (
                      <input 
                        className="w-full p-2 border rounded-lg"
                        placeholder={`${lang} Name`}
                        value={editingTranslations.data[lang] || ""}
                        onChange={e => setEditingTranslations({
                          ...editingTranslations,
                          data: { ...editingTranslations.data, [lang]: e.target.value }
                        })}
                      />
                    ) : (
                      <div className="space-y-2">
                        <input 
                          className="w-full p-2 border rounded-lg"
                          placeholder={`${lang} Name`}
                          value={editingTranslations.data[lang]?.name || ""}
                          onChange={e => setEditingTranslations({
                            ...editingTranslations,
                            data: { 
                              ...editingTranslations.data, 
                              [lang]: { ...(editingTranslations.data[lang] || {}), name: e.target.value } 
                            }
                          })}
                        />
                        <textarea 
                          className="w-full p-2 border rounded-lg"
                          placeholder={`${lang} Description`}
                          value={editingTranslations.data[lang]?.desc || ""}
                          onChange={e => setEditingTranslations({
                            ...editingTranslations,
                            data: { 
                              ...editingTranslations.data, 
                              [lang]: { ...(editingTranslations.data[lang] || {}), desc: e.target.value } 
                            }
                          })}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-6 border-t bg-gray-50 flex gap-3">
                <Button onClick={() => setEditingTranslations(null)} className="flex-1 bg-white border">{t("translation_cancel")}</Button>
                <Button onClick={saveTranslations} className="flex-1 bg-red-600 text-white">{t("save")}</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomerMenu = () => {
  const bundle = useI18nBundle();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const preview = searchParams.get("preview") === "true";
  const previewTemplateId = searchParams.get("previewTemplate") ?? "";

  const [data, setData] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [currentLang, setCurrentLang] = useState("az");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [addressText, setAddressText] = useState("");
  const [geoUrl, setGeoUrl] = useState("");
  const [payment, setPayment] = useState<"cash" | "card">("cash");
  const [geoBusy, setGeoBusy] = useState(false);
  const [checkoutErr, setCheckoutErr] = useState("");
  const [menuView, setMenuView] = useState<"browse" | "cart">("browse");

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((s: { default_language?: string }) => {
        if (s.default_language) setCurrentLang(s.default_language);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const qs = preview ? "?preview=true" : "";
    fetch(`/api/restaurants/${slug}${qs}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        if (res.categories?.length > 0) setActiveCategory(res.categories[0].id);
      });
  }, [slug, preview]);

  const t = (key: string) => bundle[currentLang]?.[key] || key;

  useEffect(() => {
    if (!data?.name) return;
    const tid = previewTemplateId || data.menu_template || "modern-01";
    const tpl = resolveMenuTemplate(tid, data.custom_templates);
    document.title = `${data.name} · ${tpl.name}`;
    return () => {
      document.title = "QRMenu";
    };
  }, [data, previewTemplateId]);

  if (!data) return <div className="p-10 text-center">{t("loading")}</div>;

  const { categories, products, custom_templates, plan_features, orders_allowed, ...restaurantRow } = data;
  const template = resolveMenuTemplate(
    previewTemplateId || data.menu_template || "modern-01",
    custom_templates
  );

  const ordersAllowed = orders_allowed !== false;
  const ordersClosedHint = t("orders_closed_hint");

  const newLineId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `l-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const addToCart = (item: {
    product: Record<string, unknown>;
    variantId?: number;
    variantLabel?: string;
    unitPrice: number;
  }) => {
    const lineId = newLineId();
    setCart((c) => [
      ...c,
      {
        lineId,
        productId: Number(item.product.id),
        product: item.product,
        variantId: item.variantId,
        variantLabel: item.variantLabel,
        unitPrice: item.unitPrice,
        note: "",
      },
    ]);
  };

  const updateCartLineNote = (lineId: string, note: string) => {
    setCart((c) => c.map((l) => (l.lineId === lineId ? { ...l, note } : l)));
  };

  const removeCartLine = (lineId: string) => {
    setCart((c) => c.filter((l) => l.lineId !== lineId));
  };

  const openCheckout = () => {
    setCheckoutErr("");
    setCheckoutOpen(true);
  };

  const pickGeo = () => {
    if (!navigator.geolocation) return;
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGeoUrl(`https://www.google.com/maps?q=${latitude},${longitude}`);
        setGeoBusy(false);
      },
      () => setGeoBusy(false),
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  };

  const sendOrderWhatsApp = () => {
    const wa = String(data.whatsapp_number ?? "").replace(/\D/g, "");
    if (!wa) return;
    if (!addressText.trim() && !geoUrl.trim()) {
      setCheckoutErr(t("checkout_address_required"));
      return;
    }
    const addrLines: string[] = [];
    if (addressText.trim()) addrLines.push(`${t("checkout_address_placeholder")}: ${addressText.trim()}`);
    if (geoUrl.trim()) addrLines.push(`${t("checkout_geo_prefix")}: ${geoUrl.trim()}`);
    const payLabel = payment === "cash" ? t("checkout_cash") : t("checkout_card");
    const lines = cart.map((line) => {
      const tr = line.product.translations as Record<string, { name?: string }> | undefined;
      const pn = tr?.[currentLang]?.name || String(line.product.name ?? "");
      const label = line.variantLabel ? `${line.variantLabel} · ${pn}` : pn;
      const note = line.note?.trim() ? ` — ${line.note.trim()}` : "";
      return `- ${label}${note} (₼${Number(line.unitPrice).toFixed(2)})`;
    });
    const total = cart.reduce((s, l) => s + Number(l.unitPrice), 0).toFixed(2);
    const text = [
      t("whatsapp_order_prefix"),
      "",
      ...lines,
      "",
      `${t("total")}: ₼${total}`,
      "",
      ...addrLines,
      "",
      `${t("checkout_payment")}: ${payLabel}`,
    ].join("\n");
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`);
    setCheckoutOpen(false);
    setAddressText("");
    setGeoUrl("");
    setCheckoutErr("");
    setCart([]);
    setMenuView("browse");
  };

  return (
    <>
      <MenuTemplateView
        template={template}
        restaurant={restaurantRow}
        categories={categories}
        products={products}
        activeCategory={activeCategory}
        setActiveCategory={(id) => setActiveCategory(id)}
        currentLang={currentLang}
        setCurrentLang={setCurrentLang}
        cart={cart}
        addToCart={addToCart}
        updateCartLineNote={updateCartLineNote}
        removeCartLine={removeCartLine}
        onCheckout={openCheckout}
        ordersAllowed={ordersAllowed}
        ordersClosedHint={ordersClosedHint}
        menuView={menuView}
        onMenuViewChange={setMenuView}
        t={t}
        planFeatures={{
          whatsapp_order: plan_features?.whatsapp_order !== false,
          reservation: plan_features?.reservation !== false,
        }}
      />
      <AnimatePresence>
        {checkoutOpen ? (
          <motion.div
            key="ck"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 flex items-end sm:items-center justify-center p-4"
            onClick={() => setCheckoutOpen(false)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              className="w-full max-w-md rounded-2xl bg-white text-gray-900 shadow-2xl p-5 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold mb-4">{t("checkout_title")}</h2>
              <label className="block text-sm font-medium mb-1">{t("checkout_address_placeholder")}</label>
              <textarea
                className="w-full border rounded-xl p-3 text-sm mb-3 min-h-[72px]"
                value={addressText}
                onChange={(e) => {
                  setAddressText(e.target.value);
                  setCheckoutErr("");
                }}
                placeholder={t("checkout_address_placeholder")}
              />
              <button
                type="button"
                disabled={geoBusy}
                onClick={() => {
                  setCheckoutErr("");
                  pickGeo();
                }}
                className="w-full mb-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
              >
                {geoBusy ? t("checkout_location_busy") : t("checkout_location_btn")}
              </button>
              {geoUrl ? (
                <p className="text-xs text-green-700 mb-4 break-all">✓ {geoUrl}</p>
              ) : null}
              <p className="text-sm font-medium mb-2">{t("checkout_payment")}</p>
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setPayment("cash")}
                  className={cn(
                    "flex-1 py-2 rounded-xl border text-sm font-semibold",
                    payment === "cash" ? "border-red-600 bg-red-50 text-red-800" : "border-gray-200"
                  )}
                >
                  {t("checkout_cash")}
                </button>
                <button
                  type="button"
                  onClick={() => setPayment("card")}
                  className={cn(
                    "flex-1 py-2 rounded-xl border text-sm font-semibold",
                    payment === "card" ? "border-red-600 bg-red-50 text-red-800" : "border-gray-200"
                  )}
                >
                  {t("checkout_card")}
                </button>
              </div>
              {checkoutErr ? <p className="text-sm text-red-600 mb-3">{checkoutErr}</p> : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-medium"
                  onClick={() => setCheckoutOpen(false)}
                >
                  {t("checkout_cancel")}
                </button>
                <button
                  type="button"
                  className="flex-1 py-3 rounded-xl bg-green-600 text-white font-bold"
                  onClick={sendOrderWhatsApp}
                >
                  {t("checkout_send")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default function App() {
  const [bundle, setBundle] = useState(UI_TRANSLATIONS);

  useEffect(() => {
    fetch("/api/ui-translations")
      .then((r) => r.json())
      .then((remote: Record<string, Record<string, string>>) => {
        const merged: Record<string, Record<string, string>> = {};
        const locales = new Set([
          ...Object.keys(UI_TRANSLATIONS),
          ...Object.keys(remote),
        ]);
        for (const loc of locales) {
          merged[loc] = {
            ...remote[loc],
            ...(UI_TRANSLATIONS as Record<string, Record<string, string>>)[loc],
          };
        }
        setBundle(merged as typeof UI_TRANSLATIONS);
      })
      .catch(() => {});
  }, []);

  return (
    <I18nBundleContext.Provider value={bundle}>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin-login-page" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/panel" element={<RestaurantLoginPage />} />
          <Route path="/restaurant/:id/onboarding" element={<RestaurantOnboarding />} />
          <Route path="/restaurant/:id/*" element={<RestaurantPanel />} />
          <Route path="/r/:slug" element={<CustomerMenu />} />
          <Route path="/menu/:slug" element={<CustomerMenu />} />
        </Routes>
      </Router>
    </I18nBundleContext.Provider>
  );
}
