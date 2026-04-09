import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
  Navigate,
} from "react-router-dom";
import {
  MenuTemplateView,
  resolveMenuTemplate,
  TemplatePicker,
  MenuPhoneMockup,
  MENU_TEMPLATE_COUNT,
  type MenuTemplateDef,
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
  Settings,
  Upload,
  Clock3,
  Pencil,
  ShieldCheck,
  Wifi,
  LogIn,
  Sparkles,
  Moon,
  Sun,
  ArrowRight,
  Store,
  Smartphone,
  Layers,
  ShoppingBag,
  CircleCheck,
  Menu,
  CreditCard,
  PanelLeft,
  PanelLeftClose,
  TrendingUp,
  UserCircle,
  Palette,
  Share2,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { authRestaurantHeaders, authAnyStaffHeaders } from "./lib/headers";
import { I18nBundleContext, useI18nBundle } from "./i18n/bundleContext";
import { ORDER_STATUS_FLOW, orderStatusBadgeClass, orderStatusLabel } from "./lib/orderStatus";
import RestaurantOnboarding from "./RestaurantOnboarding";
import LandingPage from "./landing/LandingPage";
import { UI_TRANSLATIONS } from "./i18n/uiBuiltIn";
import { AuthSplitLayout } from "./auth/AuthSplitLayout";
import CustomerMenuView from "./CustomerMenuView";
import DemoQrMenuPage from "./demo/DemoQrMenuPage";
import { DEMO_QR_PUBLIC_SLUG } from "./demoMenuSlug";

const RESTAURANT_SETTINGS_TABS = [
  "general",
  "social",
  "hours",
  "contact",
  "design",
  "media",
  "qr",
] as const;
type RestaurantSettingsTab = (typeof RESTAURANT_SETTINGS_TABS)[number];

function isRestaurantSettingsTab(s: string | undefined): s is RestaurantSettingsTab {
  return !!s && (RESTAURANT_SETTINGS_TABS as readonly string[]).includes(s);
}

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
  facebook?: string;
  social_instagram_visible?: boolean | number;
  social_tiktok_visible?: boolean | number;
  social_facebook_visible?: boolean | number;
  opening_hours?: string;
  strict_opening_hours?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Category {
  id: number;
  restaurant_id: number;
  name: string;
  sort_order: number;
  translations?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
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
  active_hours_enabled?: boolean;
  active_from?: string;
  active_to?: string;
  created_at?: string;
  updated_at?: string;
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
      <Card className="w-full rounded-2xl border border-white/10 bg-white/95 p-5 shadow-2xl backdrop-blur sm:p-8">
          <div className="mb-1 flex items-center justify-center gap-2 text-xl font-bold text-red-600">
            <Store className="shrink-0" size={22} aria-hidden /> {t("register_title")}
          </div>
          <p className="mb-6 text-center text-sm leading-relaxed text-gray-500">{t("register_sub_profile")}</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t("full_name_label")}</label>
              <input
                className="min-h-[48px] w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t("username")}</label>
              <input
                className="min-h-[48px] w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoCapitalize="none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t("password")}</label>
              <input
                type="password"
                className="min-h-[48px] w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t("phone_label")}</label>
              <input
                className="min-h-[48px] w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={busy}
              className="min-h-[48px] w-full touch-manipulation bg-red-600 py-3 text-base font-semibold text-white disabled:opacity-60"
            >
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
      <Card className="w-full rounded-2xl border border-white/10 bg-white/95 p-5 shadow-2xl backdrop-blur sm:p-8">
          <div className="mb-1 flex items-center justify-center gap-2 text-xl font-bold text-red-600">
            <LogIn className="shrink-0" size={22} aria-hidden /> {t("rest_login_title")}
          </div>
          <p className="mb-5 text-center text-sm leading-relaxed text-gray-500">{t("rest_login_sub")}</p>
          <p className="mb-4 rounded-xl bg-amber-50 p-3 text-center text-xs leading-snug text-amber-800">{t("demo_login")}</p>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t("username")}</label>
              <input
                className="min-h-[48px] w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-shadow focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">{t("password")}</label>
              <input
                type="password"
                className="min-h-[48px] w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-900 outline-none transition-shadow focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button
              type="submit"
              className="min-h-[48px] w-full touch-manipulation bg-red-600 py-3 text-base font-semibold text-white hover:bg-red-500"
            >
              {t("login")}
            </Button>
          </form>
          <div className="mt-6 space-y-3">
            <Link
              to="/register"
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500 touch-manipulation active:scale-[0.99]"
            >
              {t("landing_cta_free")}
            </Link>
            <div className="text-center">
              <Link
                to="/"
                className="inline-flex min-h-[44px] items-center justify-center px-2 text-xs text-gray-500 transition-colors hover:text-red-600 hover:underline"
              >
                ← {t("landing_nav_start")}
              </Link>
            </div>
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
  const settingsTab: RestaurantSettingsTab | null =
    pathParts[2] === "settings" && isRestaurantSettingsTab(pathParts[3]) ? pathParts[3] : null;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newCat, setNewCat] = useState("");
  const [newProd, setNewProd] = useState({
    name: "",
    price: "",
    category_id: 0,
    description: "",
    image_url: "",
    active_hours_enabled: false,
    active_from: "",
    active_to: "",
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProd, setEditProd] = useState({
    name: "",
    price: "",
    description: "",
    image_url: "",
    active_hours_enabled: false,
    active_from: "",
    active_to: "",
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
    facebook: "",
    social_instagram_visible: true,
    social_tiktok_visible: true,
    social_facebook_visible: true,
    logo_url: "",
    cover_image_url: "",
    opening_hours: "",
    strict_opening_hours: false,
  });
  const [mediaAssets, setMediaAssets] = useState<Array<{ id: number; kind: "image" | "video"; url: string; sort_order: number }>>([]);
  const [editingTranslations, setEditingTranslations] = useState<{ type: 'category' | 'product', id: number, data: any } | null>(null);
  const [currentLang, setCurrentLang] = useState(() => {
    if (typeof navigator === "undefined") return "az";
    const n = navigator.language?.slice(0, 2).toLowerCase();
    return ["az", "en", "ru", "tr"].includes(n) ? n : "az";
  });
  const [loadError, setLoadError] = useState("");
  const [extraTemplates, setExtraTemplates] = useState<MenuTemplateDef[]>([]);
  /** Şablon kartında hover — iframe önizləməsi */
  const [hoveredTemplatePreviewId, setHoveredTemplatePreviewId] = useState<string | null>(null);
  /** Saxlanma / media sonrası telefon iframe yeniləməsi */
  const [menuPreviewNonce, setMenuPreviewNonce] = useState(0);
  /** Şablonlar: redaktə rejimi — sağda telefon, solda forma */
  const [templatesStudioEdit, setTemplatesStudioEdit] = useState(false);
  /** Önizləmə üçün pin (redaktə və iframe ilə üst-üstə düşür) */
  const [templatePinnedPreviewId, setTemplatePinnedPreviewId] = useState<string | null>(null);
  const [dashStats, setDashStats] = useState<{ scans: number; pageViews: number; topProducts: any[] } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  /** Son 100 sifariş — yalnız dashboard göstəriciləri üçün */
  const [dashOrders, setDashOrders] = useState<any[]>([]);
  const [planRow, setPlanRow] = useState<Record<string, unknown> | null>(null);
  const [planUsage, setPlanUsage] = useState<{
    categories: { used: number; max: number; remaining: number | null };
    products: { used: number; max: number; remaining: number | null };
    templates: { used: number; max: number; remaining: number | null };
  } | null>(null);
  const [pendingPlanRequest, setPendingPlanRequest] = useState<{
    id: number;
    status: string;
    plan_name: string;
  } | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("restaurantSidebarCollapsed") === "1"
  );
  const [darkMode, setDarkMode] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [planUpgradeOpen, setPlanUpgradeOpen] = useState(false);
  const [planSuccessOpen, setPlanSuccessOpen] = useState(false);
  const [selectedUpgradePlanId, setSelectedUpgradePlanId] = useState<number | null>(null);
  /** Plan səhifəsində «Plan müqayisəsi» üçün ayrıca seçim */
  const [comparisonSelectedPlanId, setComparisonSelectedPlanId] = useState<number | null>(null);
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
      setPlanUsage(data.planUsage ?? null);
      setPendingPlanRequest(data.pendingPlanRequest ?? null);
      setMediaAssets(Array.isArray(data.media_assets) ? data.media_assets : []);
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
        facebook: r.facebook || "",
        social_instagram_visible: r.social_instagram_visible !== false && r.social_instagram_visible !== 0,
        social_tiktok_visible: r.social_tiktok_visible !== false && r.social_tiktok_visible !== 0,
        social_facebook_visible: r.social_facebook_visible !== false && r.social_facebook_visible !== 0,
        logo_url: r.logo_url || "",
        cover_image_url: r.cover_image_url || "",
        opening_hours: r.opening_hours || "",
        strict_opening_hours: !!r.strict_opening_hours,
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
    if (section === "templates") {
      setTemplatesStudioEdit(false);
      setTemplatePinnedPreviewId(null);
      setHoveredTemplatePreviewId(null);
    }
  }, [section]);

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
    if (!id || section !== "dashboard") return;
    fetch(`/api/admin/restaurants/${id}/orders`, { headers: authAnyStaffHeaders() })
      .then((r) => r.json())
      .then((rows) => setDashOrders(Array.isArray(rows) ? rows : []))
      .catch(() => setDashOrders([]));
  }, [id, section]);

  useEffect(() => {
    if (!id || section !== "orders") return;
    const loadOrders = () => {
      fetch(`/api/admin/restaurants/${id}/orders`, { headers: authAnyStaffHeaders() })
        .then((r) => r.json())
        .then(setOrders)
        .catch(() => {});
    };
    loadOrders();
    const intv = setInterval(loadOrders, 5000);
    return () => clearInterval(intv);
  }, [id, section]);

  useEffect(() => {
    if (!id || section !== "plan") return;
    const reloadPlanData = async () => {
      const res = await fetch(`/api/admin/restaurants/${id}/menu`, {
        headers: authAnyStaffHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setPlanRow((data.plan as Record<string, unknown>) ?? null);
      setPlanUsage(data.planUsage ?? null);
      setPendingPlanRequest(data.pendingPlanRequest ?? null);
    };
    void reloadPlanData();
    const intv = setInterval(() => {
      void reloadPlanData();
    }, 10000);
    return () => clearInterval(intv);
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
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (section !== "plan" && !planUpgradeOpen) return;
    fetch("/api/public/plans")
      .then((r) => r.json())
      .then((rows) => setCatalogPlans(Array.isArray(rows) ? rows : []))
      .catch(() => setCatalogPlans([]));
  }, [section, planUpgradeOpen]);

  const t = (key: string) => bundle[currentLang]?.[key] || key;

  const terminalOrderStatuses = new Set(["delivered", "cancelled"]);
  const dashActiveOrderCount = dashOrders.filter(
    (o) => !terminalOrderStatuses.has(String(o.status || ""))
  ).length;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const dashTodayRevenue = dashOrders.reduce((s, o) => {
    const raw = o.created_at;
    const created = raw != null ? new Date(String(raw)) : null;
    const amt = Number(o.total_amount ?? o.payload?.total_amount ?? 0);
    if (!created || Number.isNaN(created.getTime()) || created < todayStart) return s;
    return s + (Number.isFinite(amt) ? amt : 0);
  }, 0);
  const dashRecentList = dashOrders.slice(0, 8);

  const closeMobileNav = () => setMobileNavOpen(false);

  const lim = (n: number) => (n < 0 ? "∞" : String(n));
  const isLimitReached = (row: { remaining: number | null } | null | undefined) => row?.remaining === 0;
  const activePlanName = String(planRow?.name ?? "Plan təyin edilməyib");
  /** Limit yoxdursa (VIP və s.) — 100% göstərmə; bar üçün null */
  const usagePercent = (used: number, max: number): number | null => {
    if (max < 0) return null;
    if (max === 0) return 0;
    return Math.max(0, Math.min(100, Math.round((used / max) * 100)));
  };
  const planBreakdown: Array<{
    key: string;
    label: string;
    used: number;
    max: number;
    color: string;
    percent: number | null;
  }> = [
    {
      key: "categories",
      label: t("plan_max_categories"),
      used: planUsage?.categories.used ?? 0,
      max: planUsage?.categories.max ?? -1,
      color: "#6366f1",
      percent: usagePercent(planUsage?.categories.used ?? 0, planUsage?.categories.max ?? -1),
    },
    {
      key: "products",
      label: t("plan_max_products"),
      used: planUsage?.products.used ?? 0,
      max: planUsage?.products.max ?? -1,
      color: "#0ea5e9",
      percent: usagePercent(planUsage?.products.used ?? 0, planUsage?.products.max ?? -1),
    },
    {
      key: "templates",
      label: t("plan_max_templates"),
      used: planUsage?.templates.used ?? 0,
      max: planUsage?.templates.max ?? -1,
      color: "#22c55e",
      percent: usagePercent(planUsage?.templates.used ?? 0, planUsage?.templates.max ?? -1),
    },
  ];
  const pageCardCls = "rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shadow-sm";
  const inputCls =
    "w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-500/30";
  const primaryBtnCls =
    "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 transition-all active:scale-[0.98]";
  const secondaryBtnCls =
    "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all";

  const submitPlanRequest = async (explicitPlanId?: number | null) => {
    const pid =
      typeof explicitPlanId === "number" && !Number.isNaN(explicitPlanId)
        ? explicitPlanId
        : selectedUpgradePlanId;
    if (!pid) return;
    const res = await fetch(`/api/admin/restaurants/${id}/plan-request`, {
      method: "POST",
      headers: authAnyStaffHeaders(),
      body: JSON.stringify({ subscription_plan_id: pid }),
    });
    if (res.ok) {
      setPlanUpgradeOpen(false);
      setPlanSuccessOpen(true);
      setSelectedUpgradePlanId(null);
      setComparisonSelectedPlanId(null);
      const reload = await fetch(`/api/admin/restaurants/${id}/menu`, { headers: authAnyStaffHeaders() });
      const d = await reload.json();
      setPlanRow((d.plan as Record<string, unknown>) ?? null);
      setPlanUsage(d.planUsage ?? null);
      setPendingPlanRequest(d.pendingPlanRequest ?? null);
    } else {
      const err = await res.json().catch(() => ({}));
      alert((err as { error?: string }).error || t("server_error"));
    }
  };

  const isPlanSlugVip = (slug: string | undefined) => String(slug || "").toLowerCase() === "vip";
  const isCatalogPlanActive = (planId: number) => {
    const aid = Number(planRow?.id);
    return Number.isFinite(aid) && aid === Number(planId);
  };
  const isVipActiveLocked = (p: { id: number; slug: string }) =>
    isCatalogPlanActive(p.id) && isPlanSlugVip(p.slug);

  const normalizeSocialUrl = (raw: string, kind: "instagram" | "tiktok" | "facebook"): string => {
    const s = String(raw ?? "").trim();
    if (!s) return "";
    if (/^https?:\/\//i.test(s)) return s;
    const h = s.replace(/^@+/, "").trim();
    if (!h) return "";
    if (kind === "instagram")
      return `https://instagram.com/${h.replace(/^(www\.)?instagram\.com\/?/i, "")}`;
    if (kind === "tiktok") {
      const u = h.replace(/^(www\.)?tiktok\.com\/@?/i, "").replace(/^@/, "");
      return `https://www.tiktok.com/@${u}`;
    }
    return `https://facebook.com/${h.replace(/^(www\.)?facebook\.com\/?/i, "")}`;
  };

  const saveProfile = async () => {
    const payload = {
      ...profile,
      instagram: normalizeSocialUrl(profile.instagram, "instagram"),
      tiktok: normalizeSocialUrl(profile.tiktok, "tiktok"),
      facebook: normalizeSocialUrl(profile.facebook, "facebook"),
    };
    const res = await fetch(`/api/admin/restaurants/${id}/profile`, {
      method: "PUT",
      headers: authAnyStaffHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      setRestaurant(data.restaurant);
      setProfile((p) => ({
        ...p,
        instagram: payload.instagram,
        tiktok: payload.tiktok,
        facebook: payload.facebook,
      }));
      const menuUrl = `${window.location.origin}/r/${data.restaurant.slug}`;
      const qr = await fetch(`/api/qrcode?url=${encodeURIComponent(menuUrl)}`).then((x) => x.json());
      setQrCode(qr.qrDataUrl);
      setMenuPreviewNonce((n) => n + 1);
      alert("OK");
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Error");
    }
  };

  const refreshMediaAssets = async () => {
    const res = await fetch(`/api/admin/restaurants/${id}/menu`, {
      headers: authAnyStaffHeaders(),
    });
    if (!res.ok) return;
    const data = await res.json();
    setMediaAssets(Array.isArray(data.media_assets) ? data.media_assets : []);
  };

  const addMediaAsset = async (kind: "image" | "video", url: string) => {
    const res = await fetch(`/api/admin/restaurants/${id}/media-assets`, {
      method: "POST",
      headers: authAnyStaffHeaders(),
      body: JSON.stringify({ kind, url }),
    });
    if (!res.ok) return;
    await refreshMediaAssets();
  };

  const deleteMediaAsset = async (assetId: number) => {
    const res = await fetch(`/api/admin/media-assets/${assetId}`, {
      method: "DELETE",
      headers: authAnyStaffHeaders(),
    });
    if (!res.ok) return;
    await refreshMediaAssets();
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    const res = await fetch(`/api/admin/restaurants/${id}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: authAnyStaffHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    setOrders((rows) => rows.map((r) => (r.id === orderId ? { ...r, status } : r)));
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
      setTemplatePinnedPreviewId(tpl.id);
      setMenuPreviewNonce((n) => n + 1);
    } else alert("Template save failed");
  };

  const addCategory = async () => {
    if (!newCat.trim()) {
      alert("Kateqoriya adını yazın");
      return;
    }
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: authAnyStaffHeaders(),
      body: JSON.stringify({ restaurant_id: Number(id), name: newCat })
    });
    if (res.ok) {
      const data = await res.json();
      setCategories([...categories, data]);
      setNewCat("");
      setPlanUsage((u) =>
        u
          ? {
              ...u,
              categories: {
                ...u.categories,
                used: u.categories.used + 1,
                remaining: u.categories.remaining == null ? null : Math.max(0, u.categories.remaining - 1),
              },
            }
          : u
      );
    } else {
      const err = await res.json().catch(() => ({} as { error?: string }));
      const msg = err.error || "Kateqoriya əlavə edilə bilmədi";
      alert(msg);
      if (msg.toLowerCase().includes("limit")) {
        setSelectedUpgradePlanId(null);
        setPlanUpgradeOpen(true);
      }
    }
  };

  const addProduct = async () => {
    const parsedPrice = Number(newProd.price);
    if (!newProd.name.trim()) {
      alert("Məhsul adını yazın");
      return;
    }
    if (!newProd.category_id) {
      alert("Kateqoriya seçin");
      return;
    }
    if (newProd.price === "" || Number.isNaN(parsedPrice)) {
      alert("Qiyməti daxil edin");
      return;
    }
    const variants = newProdVariants
      .filter((v) => v.name.trim() && v.price.trim() !== "")
      .map((v) => ({ name: v.name.trim(), price: Number(v.price) }))
      .filter((v) => !Number.isNaN(v.price));
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: authAnyStaffHeaders(),
      body: JSON.stringify({
        ...newProd,
        price: parsedPrice,
        active_hours_enabled: newProd.active_hours_enabled,
        active_from: newProd.active_hours_enabled ? newProd.active_from || null : null,
        active_to: newProd.active_hours_enabled ? newProd.active_to || null : null,
        restaurant_id: Number(id),
        variants: variants.length ? variants : undefined,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setProducts([...products, data]);
      setPlanUsage((u) =>
        u
          ? {
              ...u,
              products: {
                ...u.products,
                used: u.products.used + 1,
                remaining: u.products.remaining == null ? null : Math.max(0, u.products.remaining - 1),
              },
            }
          : u
      );
      setNewProd({
        name: "",
        price: "",
        category_id: 0,
        description: "",
        image_url: "",
        active_hours_enabled: false,
        active_from: "",
        active_to: "",
      });
      setNewProdVariants([]);
      if (productsNew) navigate(`${basePath}/products`);
    } else {
      const err = await res.json().catch(() => ({} as { error?: string }));
      const msg = err.error || "Məhsul əlavə edilə bilmədi";
      alert(msg);
      if (msg.toLowerCase().includes("limit")) {
        setSelectedUpgradePlanId(null);
        setPlanUpgradeOpen(true);
      }
    }
  };

  const openEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setEditProd({
      name: prod.name || "",
      price: prod.price != null ? String(prod.price) : "",
      description: prod.description || "",
      image_url: prod.image_url || "",
      active_hours_enabled: !!prod.active_hours_enabled,
      active_from: prod.active_from || "",
      active_to: prod.active_to || "",
    });
  };

  const saveEditedProduct = async () => {
    if (!editingProduct) return;
    const parsedPrice = Number(editProd.price);
    if (!editProd.name.trim()) {
      alert("Məhsul adını yazın");
      return;
    }
    if (editProd.price === "" || Number.isNaN(parsedPrice)) {
      alert("Qiyməti daxil edin");
      return;
    }
    const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
      method: "PUT",
      headers: authAnyStaffHeaders(),
      body: JSON.stringify({
        name: editProd.name,
        description: editProd.description,
        price: parsedPrice,
        image_url: editProd.image_url,
        active_hours_enabled: editProd.active_hours_enabled,
        active_from: editProd.active_hours_enabled ? editProd.active_from || null : null,
        active_to: editProd.active_hours_enabled ? editProd.active_to || null : null,
        translations: editingProduct.translations || null,
      }),
    });
    if (!res.ok) {
      alert("Məhsul yenilənmədi");
      return;
    }
    setProducts((rows) =>
      rows.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: editProd.name,
              description: editProd.description,
              price: parsedPrice,
              image_url: editProd.image_url,
              active_hours_enabled: editProd.active_hours_enabled,
              active_from: editProd.active_hours_enabled ? editProd.active_from : "",
              active_to: editProd.active_hours_enabled ? editProd.active_to : "",
            }
          : p
      )
    );
    setEditingProduct(null);
  };

  const deleteCategory = async (cid: number) => {
    if (!confirm(t("confirm_delete_category"))) return;
    const res = await fetch(`/api/admin/categories/${cid}`, {
      method: "DELETE",
      headers: authAnyStaffHeaders(),
    });
    if (res.ok) {
      const removedProducts = products.filter((x) => x.category_id === cid).length;
      setCategories((c) => c.filter((x) => x.id !== cid));
      setProducts((p) => p.filter((x) => x.category_id !== cid));
      setPlanUsage((u) =>
        u
          ? {
              ...u,
              categories: {
                ...u.categories,
                used: Math.max(0, u.categories.used - 1),
                remaining:
                  u.categories.remaining == null ? null : Math.min(u.categories.max, u.categories.remaining + 1),
              },
              products: {
                ...u.products,
                used: Math.max(0, u.products.used - removedProducts),
                remaining:
                  u.products.remaining == null ? null : Math.min(u.products.max, u.products.remaining + removedProducts),
              },
            }
          : u
      );
    }
  };

  const deleteProduct = async (pid: number) => {
    if (!confirm(t("confirm_delete_product"))) return;
    const res = await fetch(`/api/admin/products/${pid}`, {
      method: "DELETE",
      headers: authAnyStaffHeaders(),
    });
    if (res.ok) {
      setProducts((p) => p.filter((x) => x.id !== pid));
      setPlanUsage((u) =>
        u
          ? {
              ...u,
              products: {
                ...u.products,
                used: Math.max(0, u.products.used - 1),
                remaining: u.products.remaining == null ? null : Math.min(u.products.max, u.products.remaining + 1),
              },
            }
          : u
      );
    }
  };

  const sidebarCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all duration-300 font-semibold tracking-tight whitespace-nowrap",
      sidebarCollapsed && "justify-center px-2",
      isActive
        ? "bg-red-600 text-white shadow-md dark:shadow-red-900/20"
        : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
    );

  const itemLabel = (label: string) =>
    sidebarCollapsed ? <span className="sr-only">{label}</span> : <span>{label}</span>;

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
        <span className="material-symbols-outlined shrink-0">dashboard</span>
        {itemLabel("Panel")}
      </NavLink>
      <NavLink to={`${basePath}/categories`} className={sidebarCls} onClick={closeMobileNav}>
        <span className="material-symbols-outlined shrink-0">category</span>
        {itemLabel(t("categories"))}
      </NavLink>
      <NavLink to={`${basePath}/products`} className={sidebarCls} onClick={closeMobileNav}>
        <span className="material-symbols-outlined shrink-0">restaurant</span>
        {itemLabel(t("products"))}
      </NavLink>
      <NavLink to={`${basePath}/templates`} className={sidebarCls} onClick={closeMobileNav}>
        <span className="material-symbols-outlined shrink-0">menu_book</span>
        {itemLabel(t("templates_section_title"))}
      </NavLink>
      <NavLink to={`${basePath}/plan`} className={sidebarCls} onClick={closeMobileNav}>
        <span className="material-symbols-outlined shrink-0">layers</span>
        {itemLabel(t("panel_plan"))}
      </NavLink>
      <NavLink to={`${basePath}/orders`} className={sidebarCls} onClick={closeMobileNav}>
        <span className="material-symbols-outlined shrink-0">receipt_long</span>
        {itemLabel(t("orders_section_title"))}
      </NavLink>
      <NavLink
        to={`${basePath}/settings/general`}
        className={({ isActive }) =>
          sidebarCls({
            isActive: isActive || location.pathname.startsWith(`${basePath}/settings/`),
          })
        }
        onClick={closeMobileNav}
      >
        <span className="material-symbols-outlined shrink-0">settings</span>
        {itemLabel(t("settings"))}
      </NavLink>
      {isSuper && (
        <Link
          to="/admin"
          className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 whitespace-nowrap",
            sidebarCollapsed && "justify-center px-2"
          )}
          onClick={closeMobileNav}
        >
          {sidebarCollapsed ? (
            <>
              <span className="sr-only">{t("back_admin")}</span>
              <ShieldCheck className="shrink-0" size={20} aria-hidden />
            </>
          ) : (
            t("back_admin")
          )}
        </Link>
      )}
      {!isSuper && (
        <button
          type="button"
          onClick={() => {
            closeMobileNav();
            setLogoutConfirmOpen(true);
          }}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 whitespace-nowrap w-full",
            sidebarCollapsed && "justify-center px-2"
          )}
        >
          <X size={18} className="shrink-0" />
          {itemLabel(t("logout"))}
        </button>
      )}
    </>
  );

  const panelSectionTitle =
    section === "dashboard"
      ? t("dashboard")
      : section === "settings"
        ? `${t("settings")} — ${t(`settings_tab_${settingsTab ?? "general"}`)}`
        : section === "categories"
          ? t("categories")
          : section === "products"
            ? productsNew
              ? t("add_product")
              : t("products")
            : section === "templates"
              ? t("templates_section_title")
              : section === "plan"
                ? t("panel_plan")
                : section === "orders"
                  ? t("orders_section_title")
                  : "";

  const renderPanelToolbar = (compact: boolean) => {
    const iconBtn =
      "inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-red-200 hover:text-red-600 transition-all active:scale-[0.97] touch-manipulation";
    const btnSize = compact ? "h-11 w-11 min-h-[44px] min-w-[44px]" : "h-10 w-10";
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 sm:gap-3",
          compact ? "flex-col items-stretch w-full" : "justify-end"
        )}
      >
        <span
          className={cn(
            "inline-flex min-w-0 items-center gap-2 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-500/10 px-3 font-bold text-indigo-700 dark:text-indigo-300",
            compact ? "w-full min-h-11 py-2.5 text-[11px] leading-snug" : "max-w-[16rem] h-10 text-xs"
          )}
        >
          <CreditCard size={compact ? 15 : 16} className="shrink-0" />
          <span className="line-clamp-2 break-words" title={`Aktiv plan: ${activePlanName}`}>
            Aktiv plan: {activePlanName}
          </span>
        </span>
        <div className={cn("flex flex-wrap items-center gap-2", compact && "w-full justify-between")}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`${basePath}/settings/general`)}
              className={cn(iconBtn, btnSize)}
              title="Ayarlar"
              aria-label="Ayarlar"
            >
              <Settings size={18} />
            </button>
            <button
              type="button"
              onClick={() => setDarkMode((v) => !v)}
              className={cn(iconBtn, btnSize)}
              title="Theme"
              aria-label="Theme"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <select
              className={cn(
                "px-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-100 touch-manipulation",
                compact ? "h-11 min-h-[44px]" : "h-10"
              )}
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
            >
              <option value="az">AZ</option>
              <option value="en">EN</option>
              <option value="ru">RU</option>
              <option value="tr">TR</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => navigate(`${basePath}/settings/general`)}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 font-bold text-xs hover:border-red-200 hover:text-red-600 dark:hover:border-red-500/40 transition-colors touch-manipulation active:scale-[0.97]",
              compact
                ? "flex-1 min-h-[44px] min-w-0 px-3 sm:flex-initial sm:px-4"
                : "h-10 px-3"
            )}
          >
            <UserCircle size={18} className="shrink-0" />
            <span className={cn(compact && "truncate")}>{t("panel_profile")}</span>
          </button>
        </div>
      </div>
    );
  };

  const panelTopRightToolbar = renderPanelToolbar(false);

  const restaurantStatCards: Array<{
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
    label: string;
    val: React.ReactNode;
    accent: string;
    iconBg: string;
    link: string;
    valClassName?: string;
  }> = [
    {
      icon: ShoppingCart,
      label: "Aktiv sifarişlər",
      val: dashActiveOrderCount,
      accent: "from-emerald-500/25 to-emerald-600/5",
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      link: `${basePath}/orders`,
    },
    {
      icon: TrendingUp,
      label: "Bugünkü gəlir",
      val: `₼${dashTodayRevenue.toFixed(2)}`,
      accent: "from-sky-500/20 to-blue-600/5",
      iconBg: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
      link: `${basePath}/orders`,
    },
    {
      icon: Utensils,
      label: "Ümumi məhsullar",
      val: products.length,
      accent: "from-violet-500/20 to-fuchsia-600/10",
      iconBg: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
      link: `${basePath}/products`,
    },
    {
      icon: CreditCard,
      label: "Aktiv plan",
      val: activePlanName,
      accent: "from-amber-400/25 to-yellow-600/5",
      iconBg: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
      link: `${basePath}/plan`,
      valClassName: "text-lg sm:text-2xl break-words font-bold",
    },
    {
      icon: QrCode,
      label: "QR skan",
      val: dashStats?.scans ?? "—",
      accent: "from-indigo-500/20 to-purple-600/10",
      iconBg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
      link: `${basePath}/settings/general`,
    },
    {
      icon: Globe,
      label: t("dash_menu_views"),
      val: dashStats?.pageViews ?? "—",
      accent: "from-rose-500/20 to-red-600/10",
      iconBg: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
      link: `${basePath}/settings/general`,
    },
  ];

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 w-full max-w-[100vw] flex-col overflow-hidden bg-gray-50 pb-safe text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="sticky top-0 z-30 shrink-0 border-b border-slate-200/70 bg-white/95 shadow-sm backdrop-blur-xl safe-area-pt dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
        <div className="flex items-center gap-1.5 py-2 sm:gap-2 sm:py-2.5 px-comfort">
          <button
            type="button"
            aria-label="Menyu"
            onClick={() => setMobileNavOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm active:scale-95 touch-manipulation"
          >
            <Menu size={22} />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate px-1">
              {panelSectionTitle || t("dashboard")}
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate leading-tight">
              {restaurant.name}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setDarkMode((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 active:scale-95 touch-manipulation"
              aria-label="Theme"
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              type="button"
              onClick={() => navigate(`${basePath}/settings/general`)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 active:scale-95 touch-manipulation"
              aria-label={t("panel_profile")}
            >
              <UserCircle size={18} />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileNavOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Bağla"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/45 md:hidden touch-manipulation"
              onClick={closeMobileNav}
            />
            <motion.aside
              initial={{ x: "-105%" }}
              animate={{ x: 0 }}
              exit={{ x: "-105%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 z-50 flex w-[min(92vw,20rem)] flex-col overflow-y-auto overscroll-contain border-r border-slate-200 bg-white shadow-2xl safe-area-pb dark:border-slate-700 dark:bg-slate-900 md:hidden"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-700 px-4 py-3.5 safe-area-pt">
                <span className="flex min-w-0 items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white">
                    <Utensils size={20} />
                  </span>
                  <span className="truncate text-[15px] leading-snug">{restaurant.name}</span>
                </span>
                <button
                  type="button"
                  onClick={closeMobileNav}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 touch-manipulation"
                  aria-label="Bağla"
                >
                  <X size={22} />
                </button>
              </div>
              <NavLink
                to={`${basePath}/settings/general`}
                onClick={closeMobileNav}
                className="mx-3 mt-3 flex min-h-[52px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-800/80"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600 text-lg font-bold text-white">
                  {(restaurant.name || "?").trim().charAt(0).toUpperCase() || "?"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("panel_profile")}
                  </p>
                  <p className="truncate font-bold text-slate-900 dark:text-slate-100">{restaurant.name}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{t("panel_profile_hint")}</p>
                </div>
                <UserCircle className="shrink-0 text-slate-400" size={22} aria-hidden />
              </NavLink>
              <div className="flex flex-col gap-1.5 p-3 [&_a]:min-h-[48px] [&_a]:py-3 [&_button]:min-h-[48px] [&_button]:py-3 [&_a]:rounded-xl [&_button]:rounded-xl">
                {navLinks}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className="flex flex-1 min-h-0 min-w-0 flex-col md:flex-row">
        <aside
          className={cn(
            "hidden shrink-0 border-r transition-[width] duration-300 ease-out dark:border-slate-800 md:flex md:flex-col",
            sidebarCollapsed ? "w-[72px]" : "w-64",
            "bg-white dark:bg-slate-900"
          )}
        >
          <div
            className={cn(
              "p-3 flex items-center border-b border-gray-200 dark:border-slate-800 min-h-[52px] gap-2",
              sidebarCollapsed ? "justify-center" : "justify-between"
            )}
          >
            {!sidebarCollapsed ? (
              <span className="font-bold text-red-600 flex items-center gap-2 min-w-0 text-sm">
                <Utensils size={20} className="shrink-0" />
                <span className="truncate">{restaurant.name}</span>
              </span>
            ) : (
              <span className="sr-only">{restaurant.name}</span>
            )}
            <button
              type="button"
              aria-label={sidebarCollapsed ? "Yan paneli aç" : "Yan paneli bağla"}
              onClick={() => {
                const n = !sidebarCollapsed;
                setSidebarCollapsed(n);
                localStorage.setItem("restaurantSidebarCollapsed", n ? "1" : "0");
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 shrink-0"
            >
              {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
            </button>
          </div>
          {!sidebarCollapsed ? (
            <div className="border-b border-gray-200 px-2 pb-3 pt-0 dark:border-slate-800">
              <NavLink
                to={`${basePath}/settings/general`}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl border border-slate-200/90 bg-slate-50/90 p-2.5 transition-colors dark:border-slate-700 dark:bg-slate-800/60",
                    isActive &&
                      "border-red-200 bg-red-50/80 ring-1 ring-red-500/25 dark:border-red-500/35 dark:bg-red-950/30"
                  )
                }
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-sm font-bold text-white">
                  {(restaurant.name || "?").trim().charAt(0).toUpperCase() || "?"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t("panel_profile")}
                  </p>
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{restaurant.name}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{t("panel_profile_hint")}</p>
                </div>
                <UserCircle className="shrink-0 text-slate-400" size={20} aria-hidden />
              </NavLink>
            </div>
          ) : (
            <div className="flex justify-center border-b border-gray-200 px-2 pb-2 pt-0 dark:border-slate-800">
              <NavLink
                to={`${basePath}/settings/general`}
                title={t("panel_profile")}
                className={({ isActive }) =>
                  cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-sm font-bold text-red-600 dark:text-red-400",
                    isActive && "ring-2 ring-red-500/50"
                  )
                }
              >
                {(restaurant.name || "?").trim().charAt(0).toUpperCase() || "?"}
              </NavLink>
            </div>
          )}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">{navLinks}</nav>
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-clip overscroll-y-contain">
          <div className="px-comfort pt-3 pb-10 sm:px-6 sm:pt-5 sm:pb-10 lg:p-8">
            <div className="md:hidden mb-6 space-y-4">
              {section !== "dashboard" ? (
                <h1 className="text-[1.35rem] font-bold tracking-tight text-gray-900 dark:text-white leading-snug">
                  {panelSectionTitle}
                </h1>
              ) : null}
              {section === "dashboard" ? (
                <>
                  <h1 className="sr-only">{t("dashboard")}</h1>
                  <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                    Restoran göstəriciləri, plan limitləri və son sifarişlər.
                  </p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px] pointer-events-none">
                      search
                    </span>
                    <input
                      className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/30 touch-manipulation"
                      placeholder="Search orders..."
                      type="text"
                      autoComplete="off"
                    />
                  </div>
                </>
              ) : null}
              {renderPanelToolbar(true)}
            </div>

            <header className="hidden md:flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-8">
              <div className="min-w-0 flex-1">
                {section === "dashboard" ? (
                  <>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {t("dashboard")}
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 max-w-xl">
                      Restoran göstəriciləri, plan limitləri və son sifarişlər — idarə paneli ilə uyğun məzmun axını.
                    </p>
                    <div className="relative mt-4 max-w-md">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">
                        search
                      </span>
                      <input
                        className="h-10 w-full bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20"
                        placeholder="Search orders..."
                        type="text"
                      />
                    </div>
                  </>
                ) : (
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {panelSectionTitle}
                  </h1>
                )}
              </div>
              <div className="shrink-0 w-full lg:w-auto lg:max-w-[50%]">{panelTopRightToolbar}</div>
            </header>

            {section === "dashboard" ? (
              <div className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {restaurantStatCards.map((item, i) => {
                    const inner = (
                      <Card
                        className={cn(
                          "p-4 h-full relative border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-br overflow-hidden",
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
                        <div className="relative flex gap-2 sm:gap-3 items-start">
                          <div
                            className={cn(
                              "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0",
                              item.iconBg
                            )}
                          >
                            <item.icon size={20} strokeWidth={2.2} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 leading-tight">
                              {item.label}
                            </p>
                            <p
                              className={cn(
                                "text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-0.5 tabular-nums leading-snug",
                                item.valClassName
                              )}
                            >
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
                        className="min-w-0"
                      >
                        <Link
                          to={item.link}
                          className="block h-full min-h-[92px] sm:min-h-[100px] touch-manipulation active:opacity-90"
                        >
                          {inner}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                  <Card className={cn(pageCardCls, "xl:col-span-2 p-4 sm:p-6 overflow-x-auto")}>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 min-w-0">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white sm:truncate">
                        Plan limitləri və menyu baxışları
                      </h3>
                      <span className="text-[11px] text-slate-500 shrink-0">Last snapshot</span>
                    </div>
                    <div className="h-48 sm:h-52 rounded-xl bg-slate-50 dark:bg-slate-900/50 p-3 sm:p-4 flex items-end gap-2 sm:gap-3 min-w-0 overflow-x-auto">
                      {planBreakdown.map((row) => (
                        <div key={row.key} className="flex-1 min-w-[3rem] flex flex-col items-center gap-2">
                          <div className="w-full rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden h-36 flex items-end justify-center">
                            {row.percent == null ? (
                              <div
                                className="w-full h-full flex flex-col items-center justify-center gap-1 bg-emerald-500/15 dark:bg-emerald-500/25"
                                title={t("plan_unlimited_badge")}
                              >
                                <span className="text-xl font-black leading-none text-emerald-700 dark:text-emerald-300">
                                  ∞
                                </span>
                                <span className="text-[9px] font-semibold uppercase tracking-wide text-emerald-800/90 dark:text-emerald-400/90 px-1 text-center">
                                  {t("plan_unlimited_badge")}
                                </span>
                              </div>
                            ) : (
                              <div
                                className="w-full rounded-lg transition-all duration-500"
                                style={{
                                  height: `${row.percent}%`,
                                  background:
                                    row.key === "categories"
                                      ? "#6366F1"
                                      : row.key === "products"
                                        ? "#22C55E"
                                        : "#0EA5E9",
                                }}
                              />
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center leading-tight">
                            {row.label}
                          </span>
                        </div>
                      ))}
                      <div className="flex-1 min-w-[3rem] flex flex-col items-center gap-2">
                        <div className="w-full rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden h-36 flex items-end">
                          <div
                            className="w-full rounded-lg transition-all duration-500 bg-red-500"
                            style={{ height: `${Math.min(100, Number(dashStats?.pageViews ?? 0) * 5)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center leading-tight">
                          {t("dash_menu_views")}
                        </span>
                      </div>
                    </div>
                  </Card>
                  <Card className={cn(pageCardCls, "p-4 sm:p-6 min-w-0")}>
                    <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                      Son sifarişlər
                    </h3>
                    <div className="space-y-2.5 sm:space-y-3">
                      {dashRecentList.slice(0, 6).map((o) => (
                        <div
                          key={o.id}
                          className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 sm:p-3 bg-white/50 dark:bg-slate-900/30 touch-manipulation"
                        >
                          <div className="flex items-center justify-between gap-2 min-w-0">
                            <p className="text-sm font-semibold truncate min-w-0">
                              {o.customer_name || o.payload?.customer_name || `#${o.id}`}
                            </p>
                            <span
                              className={cn(
                                "text-[10px] px-2 py-1 rounded-full font-semibold shrink-0",
                                orderStatusBadgeClass(o.status)
                              )}
                            >
                              {orderStatusLabel(o.status, currentLang)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            ₼{Number(o.total_amount || o.payload?.total_amount || 0).toFixed(2)}
                          </p>
                        </div>
                      ))}
                      {!dashRecentList.length ? <p className="text-sm text-slate-400">Sifariş yoxdur.</p> : null}
                      <button
                        type="button"
                        onClick={() => navigate(`${basePath}/orders`)}
                        className={cn(primaryBtnCls, "w-full mt-2 bg-red-600 hover:bg-red-500")}
                      >
                        Bütün sifarişlər
                      </button>
                    </div>
                  </Card>
                </div>
              </div>
            ) : null}

        {(section === "categories" || section === "products" || productsNew) && (
          <div className="mb-5">
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <Link
                to={`${basePath}/categories`}
                className={cn(
                  "h-9 px-4 rounded-lg text-sm font-semibold inline-flex items-center",
                  section === "categories" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm" : "text-slate-500"
                )}
              >
                Kateqoriyalar
              </Link>
              <Link
                to={`${basePath}/products`}
                className={cn(
                  "h-9 px-4 rounded-lg text-sm font-semibold inline-flex items-center",
                  section === "products" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm" : "text-slate-500"
                )}
              >
                Məhsullar
              </Link>
            </div>
          </div>
        )}

        {section === "templates" && (
          <div className="mb-8 space-y-6">
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl border p-4 sm:p-6 lg:p-7",
                "border-slate-200/90 bg-gradient-to-br from-white via-slate-50/90 to-red-50/50",
                "dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-red-950/25"
              )}
            >
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-red-500/10 blur-3xl dark:bg-red-500/15"
                aria-hidden
              />
              <div className="relative flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 sm:h-14 sm:w-14">
                    <Layers className="h-7 w-7" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                        {t("templates_section_title")}
                      </h2>
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-500/20 dark:text-red-300">
                        {MENU_TEMPLATE_COUNT}+
                      </span>
                      {templatesStudioEdit ? (
                        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-200">
                          Redaktə rejimi
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {templatesStudioEdit
                        ? "Sağda aktiv şablon və son saxlanmış məlumatlar göstərilir. Düzəlişdən sonra «Yadda saxla» basın — önizləmə yenilənəcək."
                        : `${t("templates_section_sub")} Əvvəlcə şablon seçin, Önizləmə ilə yoxlayın, sonra Redaktə et ilə fərdiləşdirin.`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2.5 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-300 sm:px-4 sm:py-3">
                  <Smartphone className="h-4 w-4 shrink-0 text-red-500" />
                  <span className="max-w-[16rem] leading-snug sm:max-w-none">
                    {templatesStudioEdit
                      ? "Telefon önizləməsi seçdiyiniz şablona uyğundur"
                      : "Redaktə et — telefon önizləməsi orada açılır"}
                  </span>
                  <Sparkles className="hidden h-3.5 w-3.5 shrink-0 text-amber-500 sm:block" />
                </div>
              </div>
            </div>

            {!templatesStudioEdit ? (
              <div className="space-y-6">
                <div
                  className={cn(
                    "flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Aktiv şablon
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">
                      {resolveMenuTemplate(profile.menu_template, extraTemplates).name}
                    </p>
                    {templatePinnedPreviewId && templatePinnedPreviewId !== profile.menu_template ? (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Önizləmə pin:{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {resolveMenuTemplate(templatePinnedPreviewId, extraTemplates).name}
                        </span>{" "}
                        — yadda saxlanmayıb, &quot;Seç&quot; düyməsini basın.
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      setTemplatesStudioEdit(true);
                      setMenuPreviewNonce((n) => n + 1);
                    }}
                    className="inline-flex w-full items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 px-5 text-white shadow-md shadow-red-500/20 sm:w-auto"
                  >
                    <Pencil className="h-4 w-4" />
                    Redaktə et
                  </Button>
                </div>

                <Card className={cn(pageCardCls, "overflow-hidden p-0 shadow-md dark:shadow-none")}>
                  <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/50">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Şablon seçimi</h3>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                      Kateqoriya ilə süzün, <strong className="font-semibold text-slate-700 dark:text-slate-300">Önizləmə</strong> ilə pin
                      edin, <strong className="font-semibold text-slate-700 dark:text-slate-300">Seç</strong> ilə saxlayın.
                    </p>
                  </div>
                  <div className="p-5 sm:p-6">
                    <TemplatePicker
                      restaurantSlug={restaurant.slug}
                      selectedId={profile.menu_template}
                      onSelect={selectTemplate}
                      extraTemplates={extraTemplates}
                      mode="studio"
                      pinnedPreviewId={templatePinnedPreviewId}
                      onPinPreview={(tid) => {
                        setTemplatePinnedPreviewId(tid);
                        setHoveredTemplatePreviewId(tid);
                      }}
                    />
                  </div>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1 space-y-6">
                  <button
                    type="button"
                    onClick={() => {
                      setTemplatesStudioEdit(false);
                      setHoveredTemplatePreviewId(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Şablon seçiminə qayıt
                  </button>

                  <Card className={cn(pageCardCls, "overflow-hidden p-0 shadow-md dark:shadow-none")}>
                    <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent px-5 py-4 dark:border-slate-700 dark:from-slate-800/80 dark:to-transparent">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
                          <Palette className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">Menyu görünüşü — düzəliş</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            «Yadda saxla» ilə serverə yazdıqdan sonra sağdakı önizləmə yenilənir. Sosial ikonlar üçün menyuda
                            göstər/gizlət və tam URL və ya @ad kifayətdir.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6 p-5 sm:p-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                            Restoran adı (menyuda)
                          </label>
                          <input
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
                            Qısa mətn (tagline)
                          </label>
                          <input
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                            placeholder="Məsələn ünvan və ya sloqan"
                            value={profile.tagline}
                            onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            <Upload className="h-3.5 w-3.5" />
                            {t("logo_upload_label")}
                          </p>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800">
                              {profile.logo_url ? (
                                <img src={profile.logo_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <ImageIcon className="h-6 w-6 text-slate-300 dark:text-slate-600" />
                              )}
                            </div>
                            <label className="cursor-pointer rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-800 dark:text-red-400 dark:ring-slate-600">
                              Fayl seç
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={async (e) => {
                                  const f = e.target.files?.[0];
                                  if (!f) return;
                                  const url = await uploadAsset(f);
                                  if (url) setProfile((p) => ({ ...p, logo_url: url }));
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          </div>
                          <input
                            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-inner focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                            placeholder="və ya logo URL"
                            value={profile.logo_url}
                            onChange={(e) => setProfile({ ...profile, logo_url: e.target.value })}
                          />
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            <ImageIcon className="h-3.5 w-3.5" />
                            {t("cover_upload_label")}
                          </p>
                          <div className="relative mb-3 h-20 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
                            {profile.cover_image_url ? (
                              <img src={profile.cover_image_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                Üz qabığı əlavə edin
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <label className="cursor-pointer rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-800 dark:text-red-400 dark:ring-slate-600">
                              Şəkil yüklə
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={async (e) => {
                                  const f = e.target.files?.[0];
                                  if (!f) return;
                                  const url = await uploadAsset(f);
                                  if (url) setProfile((p) => ({ ...p, cover_image_url: url }));
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          </div>
                          <input
                            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-inner focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                            placeholder="Cover URL"
                            value={profile.cover_image_url}
                            onChange={(e) => setProfile({ ...profile, cover_image_url: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900/50">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Brend rəngi</span>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            className="h-11 w-14 cursor-pointer rounded-xl border-2 border-slate-200 bg-white p-1 dark:border-slate-600"
                            value={profile.primary_color}
                            onChange={(e) => setProfile({ ...profile, primary_color: e.target.value })}
                          />
                          <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {profile.primary_color}
                          </code>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                          <Share2 className="h-4 w-4 text-red-500" />
                          Sosial şəbəkələr
                        </p>
                        <p className="mb-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          Menyuda göstər üçün işarə qoyun. Link tam URL və ya istifadəçi adı (@ad) ola bilər — saxlayarkən avtomatik
                          düzəldilir.
                        </p>
                        <div className="space-y-3">
                          {(
                            [
                              {
                                key: "instagram" as const,
                                vis: "social_instagram_visible" as const,
                                label: "Instagram",
                              },
                              {
                                key: "tiktok" as const,
                                vis: "social_tiktok_visible" as const,
                                label: "TikTok",
                              },
                              {
                                key: "facebook" as const,
                                vis: "social_facebook_visible" as const,
                                label: "Facebook",
                              },
                            ] as const
                          ).map((row) => (
                            <div
                              key={row.key}
                              className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-900 sm:flex-row sm:items-center"
                            >
                              <label className="flex shrink-0 cursor-pointer items-center gap-2 sm:w-36">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                                  checked={profile[row.vis] as boolean}
                                  onChange={(e) =>
                                    setProfile({ ...profile, [row.vis]: e.target.checked } as typeof profile)
                                  }
                                />
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                  {row.label}
                                </span>
                              </label>
                              <input
                                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/15 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                placeholder="https://… və ya @istifadəçi"
                                value={profile[row.key]}
                                onChange={(e) => setProfile({ ...profile, [row.key]: e.target.value })}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl border border-dashed border-slate-200 bg-amber-50/40 p-4 dark:border-slate-600 dark:bg-amber-950/20">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Header slayder (baner)</p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                          Bəzi şablonlarda üst karusel üçün şəkil əlavə edin.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600">
                            <Upload className="h-3.5 w-3.5 text-red-500" />
                            Şəkil əlavə et
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              className="hidden"
                              onChange={async (e) => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                const url = await uploadAsset(f);
                                if (url) await addMediaAsset("image", url);
                                setMenuPreviewNonce((n) => n + 1);
                                e.target.value = "";
                              }}
                            />
                          </label>
                          <Link
                            to={`${basePath}/settings/media`}
                            className="inline-flex items-center rounded-xl px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-white/80 dark:text-red-400"
                          >
                            Bütün media →
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/40">
                      <Link
                        to={`${basePath}/settings/design`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                      >
                        Tam dizayn parametrləri
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                      <Button
                        type="button"
                        onClick={() => void saveProfile()}
                        className="bg-gradient-to-r from-red-600 to-rose-600 px-6 text-white shadow-md shadow-red-500/25 hover:from-red-500 hover:to-rose-500 sm:w-auto"
                      >
                        {t("save_profile")}
                      </Button>
                    </div>
                  </Card>
                </div>

                <Card
                  className={cn(
                    pageCardCls,
                    "shrink-0 overflow-hidden border-slate-200/80 p-0 shadow-lg shadow-slate-200/50 dark:border-slate-700 dark:shadow-black/40 lg:sticky lg:top-20 lg:w-[min(100%,380px)] lg:self-start"
                  )}
                >
                  <MenuPhoneMockup
                    iframeSrc={
                      restaurant.slug
                        ? `/r/${encodeURIComponent(restaurant.slug)}?preview=true&previewTemplate=${encodeURIComponent(
                            templatePinnedPreviewId ?? profile.menu_template
                          )}`
                        : ""
                    }
                    reloadKey={menuPreviewNonce}
                  />
                </Card>
              </div>
            )}
          </div>
        )}

        {section === "plan" && planRow ? (
          <>
            <Card className={cn(pageCardCls, "p-6 mb-6")}>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("plan_active_label")}</h2>
                <span className="rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-3 py-1 text-sm font-semibold">
                  {String(planRow.name ?? "")}
                </span>
                {pendingPlanRequest ? (
                  <span className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200 px-2 py-1 text-xs font-bold uppercase">
                    {t("plan_processing_badge")}
                  </span>
                ) : null}
              </div>
            </Card>

            <Card className={cn(pageCardCls, "p-6 mb-6")}>
              <h3 className="text-base font-semibold mb-2 text-slate-900 dark:text-slate-100">
                {t("plan_comparison_title")}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t("plan_comparison_hint")}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {catalogPlans.map((p, ix) => {
                  const price = Number(p.price_monthly || 0);
                  const oldPrice = (price * 1.2).toFixed(0);
                  const popular = ix === 1;
                  const activeCatalogId = Number(planRow?.id);
                  const isRestaurantActivePlan =
                    Number.isFinite(activeCatalogId) && activeCatalogId === Number(p.id);
                  const vipLocked = isVipActiveLocked(p);
                  const disabledPick = vipLocked || !!pendingPlanRequest;
                  return (
                    <label
                      key={p.id}
                      className={cn(
                        "rounded-2xl border p-4 flex flex-col gap-2 transition-colors cursor-pointer text-left",
                        popular ? "border-indigo-300 bg-indigo-50/50 dark:bg-indigo-500/10" : "border-slate-200 dark:border-slate-700",
                        comparisonSelectedPlanId === p.id && !disabledPick
                          ? "ring-2 ring-indigo-500 border-indigo-400"
                          : "",
                        disabledPick && "cursor-not-allowed opacity-60"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="radio"
                          name="plan-comparison"
                          className="mt-1 shrink-0"
                          disabled={disabledPick}
                          checked={comparisonSelectedPlanId === p.id}
                          onChange={() => {
                            if (!disabledPick) setComparisonSelectedPlanId(p.id);
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          {popular ? (
                            <span className="inline-flex mb-1 text-[10px] uppercase font-bold rounded-full bg-indigo-100 text-indigo-700 px-2 py-1">
                              Popular
                            </span>
                          ) : null}
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            {isRestaurantActivePlan ? (
                              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                                {t("plan_list_current_badge")}
                              </span>
                            ) : null}
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</span>
                          </div>
                          {vipLocked ? (
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">{t("plan_vip_active_locked")}</p>
                          ) : null}
                          <div className="mt-2">
                            <span className="text-xs line-through text-slate-400 mr-2">₼{oldPrice}</span>
                            <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">₼{price}</span>
                            <span className="text-xs text-slate-500"> / ay</span>
                          </div>
                          <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
                            {t("plan_max_products")}: {lim(p.max_products)} · {t("plan_max_categories")}:{" "}
                            {lim(p.max_categories)}
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
                <Button
                  type="button"
                  className={cn(primaryBtnCls, "bg-red-600 hover:bg-red-500 sm:w-auto w-full disabled:opacity-50")}
                  disabled={
                    comparisonSelectedPlanId == null ||
                    !!pendingPlanRequest ||
                    (Number.isFinite(Number(planRow?.id)) && comparisonSelectedPlanId === Number(planRow?.id))
                  }
                  onClick={() => void submitPlanRequest(comparisonSelectedPlanId)}
                >
                  {t("plan_comparison_submit")}
                </Button>
                {pendingPlanRequest ? (
                  <span className="text-sm text-amber-700 dark:text-amber-400">{t("plan_processing_badge")}</span>
                ) : null}
              </div>
            </Card>
          </>
        ) : null}

        {section === "orders" && (
          <Card className="p-6 border-0 bg-white/90 shadow-sm">
            <p className="text-sm text-gray-500 mb-4">Gələn sifarişlər və status idarəsi</p>
            {orders.length === 0 ? (
              <p className="text-gray-400 text-sm">{t("orders_empty")}</p>
            ) : (
              <ul className="text-sm space-y-2">
                {orders.map((o) => (
                  <li key={o.id} className="border border-slate-200/80 bg-white rounded-xl p-3 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold">
                        #{o.id} · {o.customer_name || o.payload?.customer_name || "Müştəri"}
                      </div>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${orderStatusBadgeClass(o.status)}`}>
                        {orderStatusLabel(o.status, currentLang)}
                      </span>
                      <select
                        className="text-xs border rounded-lg px-2 py-1"
                        value={String(o.status || "pending")}
                        onChange={(e) => void updateOrderStatus(Number(o.id), e.target.value)}
                      >
                        {ORDER_STATUS_FLOW.map((st) => (
                          <option key={st} value={st}>
                            {orderStatusLabel(st, "az")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {o.customer_phone || o.payload?.customer_phone || "-"} · {o.order_type || o.payload?.order_type || "-"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Məbləğ: ₼{Number(o.total_amount || o.payload?.total_amount || 0).toFixed(2)}
                    </p>
                    {Array.isArray(o.payload?.cart) && o.payload.cart.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-xs text-gray-600">
                        {o.payload.cart.map((line: any, idx: number) => (
                          <li key={`${o.id}-${idx}`}>
                            • {line.label || "Məhsul"} x{line.qty || 1}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {section === "settings" && (
          <>
            {!pathParts[3] || !isRestaurantSettingsTab(pathParts[3]) ? (
              <Navigate to={`${basePath}/settings/general`} replace />
            ) : (
              <div className="mb-8 space-y-5">
                <div className="sticky top-0 z-10 -mx-1 overflow-x-auto scrollbar-hide border-b border-slate-200 bg-gray-50/95 px-1 pb-2 pt-0 backdrop-blur-md dark:border-slate-700 dark:bg-slate-950/90 sm:static sm:z-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0 sm:backdrop-blur-0">
                  <div className="flex min-w-min gap-1 rounded-xl bg-slate-100/80 p-1 dark:bg-slate-800/80">
                    {RESTAURANT_SETTINGS_TABS.map((tabId) => (
                      <NavLink
                        key={tabId}
                        to={`${basePath}/settings/${tabId}`}
                        className={({ isActive }) =>
                          cn(
                            "shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-all sm:text-sm",
                            isActive
                              ? "bg-red-600 text-white shadow-md"
                              : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                          )
                        }
                      >
                        {t(`settings_tab_${tabId}`)}
                      </NavLink>
                    ))}
                  </div>
                </div>

                {settingsTab === "general" ? (
                  <div className="max-w-3xl space-y-5">
                    <Card className="border-red-100 p-4 sm:p-6 dark:border-red-900/40">
                      <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                        <QrCode size={20} className="text-red-600" /> {t("your_link")}
                      </h3>
                      <p className="break-all font-mono text-xs text-slate-500 dark:text-slate-400">
                        {typeof window !== "undefined" ? `${window.location.origin}/r/${profile.slug}` : ""}
                      </p>
                    </Card>
                    <Card className="space-y-5 p-5 dark:border-slate-700">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Ümumi məlumatlar</h3>
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                        placeholder={t("name")}
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 font-mono text-sm dark:border-slate-600 dark:bg-slate-900"
                        placeholder={t("slug_label")}
                        value={profile.slug}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                          })
                        }
                      />
                      <textarea
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                        placeholder="Qısa restoran açıqlaması"
                        rows={3}
                        value={profile.tagline}
                        onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                      />
                    </Card>
                    <div className="flex justify-end">
                      <Button type="button" onClick={saveProfile} className="bg-red-600 text-white sm:w-auto">
                        {t("save_profile")}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {settingsTab === "social" ? (
                  <div className="max-w-3xl space-y-5">
                    <Card className="space-y-4 p-5 dark:border-slate-700">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Sosial şəbəkələr</h3>
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                        placeholder="Instagram URL"
                        value={profile.instagram}
                        onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                      />
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                        placeholder="TikTok URL"
                        value={profile.tiktok}
                        onChange={(e) => setProfile({ ...profile, tiktok: e.target.value })}
                      />
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                        placeholder="Facebook URL"
                        value={profile.facebook}
                        onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                      />
                    </Card>
                    <div className="flex justify-end">
                      <Button type="button" onClick={saveProfile} className="bg-red-600 text-white sm:w-auto">
                        {t("save_profile")}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {settingsTab === "hours" ? (
                  <div className="max-w-3xl space-y-5">
                    <Card className="space-y-4 p-5 dark:border-slate-700">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">İş saatları</h3>
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                        placeholder="Məsələn: Hər gün 09:00 - 23:00"
                        value={profile.opening_hours}
                        onChange={(e) => setProfile({ ...profile, opening_hours: e.target.value })}
                      />
                      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={profile.strict_opening_hours}
                          onChange={(e) => setProfile({ ...profile, strict_opening_hours: e.target.checked })}
                        />
                        Menyu bu saatlardan kənarda sifarişi bağlasın
                      </label>
                    </Card>
                    <div className="flex justify-end">
                      <Button type="button" onClick={saveProfile} className="bg-red-600 text-white sm:w-auto">
                        {t("save_profile")}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {settingsTab === "contact" ? (
                  <div className="max-w-3xl space-y-5">
                    <Card className="space-y-4 p-5 dark:border-slate-700">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Kontakt məlumatları</h3>
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                        placeholder={t("whatsapp")}
                        value={profile.whatsapp_number}
                        onChange={(e) => setProfile({ ...profile, whatsapp_number: e.target.value })}
                      />
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                        placeholder="Telefon nömrəsi"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                        placeholder="Google Maps URL"
                        value={profile.maps_url}
                        onChange={(e) => setProfile({ ...profile, maps_url: e.target.value })}
                      />
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-600 dark:bg-slate-900"
                        placeholder="Rezervasiya linki"
                        value={profile.reservation_url}
                        onChange={(e) => setProfile({ ...profile, reservation_url: e.target.value })}
                      />
                    </Card>
                    <div className="flex justify-end">
                      <Button type="button" onClick={saveProfile} className="bg-red-600 text-white sm:w-auto">
                        {t("save_profile")}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {settingsTab === "design" ? (
                  <div className="max-w-3xl space-y-5">
                    <Card className="space-y-4 p-5 dark:border-slate-700">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Dizayn ayarları</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="mb-1 text-xs text-slate-500">{t("logo_upload_label")}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            {profile.logo_url ? (
                              <img
                                src={profile.logo_url}
                                alt=""
                                className="h-16 w-16 rounded-xl border border-gray-200 object-cover dark:border-slate-600"
                              />
                            ) : null}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              className="max-w-[200px] text-xs"
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
                            className="mt-2 w-full rounded-lg border border-slate-200 p-2 font-mono text-xs dark:border-slate-600 dark:bg-slate-900"
                            placeholder="Logo URL (ixtiyari)"
                            value={profile.logo_url}
                            onChange={(e) => setProfile({ ...profile, logo_url: e.target.value })}
                          />
                        </div>
                        <div>
                          <p className="mb-1 text-xs text-slate-500">{t("cover_upload_label")}</p>
                          {profile.cover_image_url ? (
                            <img
                              src={profile.cover_image_url}
                              alt=""
                              className="mb-2 h-20 w-full rounded-lg border object-cover dark:border-slate-600"
                            />
                          ) : null}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="max-w-[200px] text-xs"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const url = await uploadAsset(f);
                              if (url) setProfile((p) => ({ ...p, cover_image_url: url }));
                              e.target.value = "";
                            }}
                          />
                          <input
                            className="mt-2 w-full rounded-lg border border-slate-200 p-2 font-mono text-xs dark:border-slate-600 dark:bg-slate-900"
                            placeholder="Cover URL (ixtiyari)"
                            value={profile.cover_image_url}
                            onChange={(e) => setProfile({ ...profile, cover_image_url: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Əsas rəng</span>
                        <input
                          type="color"
                          className="h-10 w-14 cursor-pointer rounded border dark:border-slate-600"
                          value={profile.primary_color}
                          onChange={(e) => setProfile({ ...profile, primary_color: e.target.value })}
                        />
                      </div>
                    </Card>
                    <div className="flex justify-end">
                      <Button type="button" onClick={saveProfile} className="bg-red-600 text-white sm:w-auto">
                        {t("save_profile")}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {settingsTab === "media" ? (
                  <div className="max-w-3xl space-y-5">
                    <Card className="space-y-4 p-5 dark:border-slate-700">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Header media slider</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        FastFood şablonu üçün şəkil/video əlavə edin.
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                          Şəkil əlavə et
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const url = await uploadAsset(f);
                              if (url) await addMediaAsset("image", url);
                              e.target.value = "";
                            }}
                          />
                        </label>
                        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
                          Video əlavə et
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const url = await uploadAsset(f);
                              if (url) await addMediaAsset("video", url);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                      <div className="space-y-2">
                        {mediaAssets.length === 0 ? (
                          <p className="text-xs text-slate-400">Hələ media yoxdur.</p>
                        ) : (
                          mediaAssets.map((m) => (
                            <div key={m.id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-600">
                              <span className="w-14 text-xs font-semibold uppercase text-slate-500">{m.kind}</span>
                              <input
                                className="flex-1 rounded-md border px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-900"
                                value={m.url}
                                onChange={(e) =>
                                  setMediaAssets((rows) =>
                                    rows.map((x) => (x.id === m.id ? { ...x, url: e.target.value } : x))
                                  )
                                }
                                onBlur={async () => {
                                  await fetch(`/api/admin/media-assets/${m.id}`, {
                                    method: "PUT",
                                    headers: authAnyStaffHeaders(),
                                    body: JSON.stringify({ url: m.url }),
                                  });
                                  await refreshMediaAssets();
                                }}
                              />
                              <button
                                type="button"
                                className="text-xs font-semibold text-red-600"
                                onClick={() => void deleteMediaAsset(m.id)}
                              >
                                Sil
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  </div>
                ) : null}

                {settingsTab === "qr" ? (
                  <Card className="max-w-md p-6 dark:border-slate-700">
                    <h3 className="mb-4 font-bold text-slate-900 dark:text-slate-100">{t("panel_qr_title")}</h3>
                    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-600 dark:bg-slate-900/50">
                      {qrCode ? (
                        <img src={qrCode} alt="QR Code" className="mb-4 h-48 w-48" />
                      ) : (
                        <div className="mb-4 h-48 w-48 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                      )}
                      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t("panel_qr_scan_hint")}</p>
                      <div className="flex w-full gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = qrCode;
                            link.download = `${restaurant.slug}-qr.png`;
                            link.click();
                          }}
                          className="flex-1 bg-red-600 text-sm text-white"
                        >
                          {t("panel_download")}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            void navigator.clipboard.writeText(`${window.location.origin}/r/${restaurant.slug}`);
                            alert(t("link_copied"));
                          }}
                          className="flex-1 bg-slate-100 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                        >
                          {t("panel_copy_link")}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : null}
              </div>
            )}
          </>
        )}

        {section === "categories" && (
            <Card className="p-6 max-w-xl mb-8">
              <h3 className="font-bold mb-4">{t("add_category")}</h3>
              {isLimitReached(planUsage?.categories) ? (
                <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  Kateqoriya limitiniz dolub. Planı yüksəldin.
                  <button
                    type="button"
                    className="ml-2 underline font-semibold"
                    onClick={() => {
                      setSelectedUpgradePlanId(null);
                      setPlanUpgradeOpen(true);
                    }}
                  >
                    Plan yüksəlt
                  </button>
                </div>
              ) : null}
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
            {isLimitReached(planUsage?.products) ? (
              <Card className="p-4 border-amber-200 bg-amber-50">
                <p className="text-sm text-amber-900">
                  Məhsul limitiniz dolub. Yeni məhsul üçün planı yüksəltməlisiniz.
                </p>
                <Button
                  type="button"
                  className="mt-2 bg-amber-600 text-white"
                  onClick={() => {
                    setSelectedUpgradePlanId(null);
                    setPlanUpgradeOpen(true);
                  }}
                >
                  Plan yüksəlt
                </Button>
              </Card>
            ) : null}
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
                      <Card
                        key={prod.id}
                        className="p-4 flex gap-4 border-gray-200 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => openEditProduct(prod)}
                      >
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
                          {prod.active_hours_enabled ? (
                            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">
                              <Clock3 size={12} />
                              Aktiv: {prod.active_from || "--:--"} - {prod.active_to || "--:--"}
                            </div>
                          ) : null}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditProduct(prod);
                              }}
                              className="text-gray-700 hover:text-red-600 flex items-center gap-1 text-xs font-bold"
                            >
                              <Pencil size={14} /> Redaktə
                            </button>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTranslations({ type: 'product', id: prod.id, data: prod.translations || {} });
                              }}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-bold"
                            >
                              <Globe size={14} /> {t("translations")}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteProduct(prod.id);
                              }}
                              className="text-red-500 p-1"
                            >
                              <Trash2 size={16} />
                            </button>
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
            <Card className="p-6 mb-6 max-w-2xl">
              <h3 className="font-bold mb-4">{t("add_product")}</h3>
              {isLimitReached(planUsage?.products) ? (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  Məhsul limiti dolub. Plan yüksəltmədən yeni məhsul əlavə etmək olmur.
                </div>
              ) : null}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input 
                  placeholder="Məhsul adını yazın"
                  className="p-2 border rounded-lg"
                  value={newProd.name}
                  onChange={e => setNewProd({ ...newProd, name: e.target.value })}
                />
                <input 
                  type="number" 
                  placeholder="Qiyməti daxil edin"
                  className="p-2 border rounded-lg"
                  value={newProd.price}
                  onChange={e => setNewProd({ ...newProd, price: e.target.value })}
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
                  placeholder="Qısa açıqlama yazın"
                  rows={3}
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                />
                <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-gray-50/70 p-3">
                  <label className="flex items-center justify-between gap-3 text-sm font-semibold text-gray-800">
                    Aktiv saatlar seç
                    <button
                      type="button"
                      role="switch"
                      aria-checked={newProd.active_hours_enabled}
                      onClick={() =>
                        setNewProd((p) => ({ ...p, active_hours_enabled: !p.active_hours_enabled }))
                      }
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        newProd.active_hours_enabled ? "bg-red-600" : "bg-gray-300"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                          newProd.active_hours_enabled ? "translate-x-5" : "translate-x-1"
                        )}
                      />
                    </button>
                  </label>
                  {newProd.active_hours_enabled ? (
                    <div className="mt-3 grid sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs mb-1 text-gray-600">Başlanğıc saat</p>
                        <input
                          type="time"
                          className="w-full p-2 border rounded-lg text-sm bg-white"
                          value={newProd.active_from}
                          onChange={(e) => setNewProd((p) => ({ ...p, active_from: e.target.value }))}
                        />
                      </div>
                      <div>
                        <p className="text-xs mb-1 text-gray-600">Bitiş saat</p>
                        <input
                          type="time"
                          className="w-full p-2 border rounded-lg text-sm bg-white"
                          value={newProd.active_to}
                          onChange={(e) => setNewProd((p) => ({ ...p, active_to: e.target.value }))}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">{t("product_image_upload_label")}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    {newProd.image_url ? (
                      <img src={newProd.image_url} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                    ) : null}
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      <Upload size={16} />
                      Şəkil yüklə
                      <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const url = await uploadAsset(f);
                        if (url) setNewProd((p) => ({ ...p, image_url: url }));
                        e.target.value = "";
                      }}
                    />
                    </label>
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
                <Button
                  type="button"
                  onClick={addProduct}
                  disabled={isLimitReached(planUsage?.products)}
                  className="bg-red-600 text-white"
                >
                  {t("add_product")}
                </Button>
              </div>
            </Card>
        )}

        {editingProduct ? (
          <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
            <Card className="w-full max-w-xl p-5 sm:p-6">
              <h3 className="text-lg font-bold mb-4">Məhsulu redaktə et</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  className="p-2.5 border rounded-lg sm:col-span-2"
                  placeholder="Məhsul adını yazın"
                  value={editProd.name}
                  onChange={(e) => setEditProd((p) => ({ ...p, name: e.target.value }))}
                />
                <input
                  type="number"
                  className="p-2.5 border rounded-lg"
                  placeholder="Qiyməti daxil edin"
                  value={editProd.price}
                  onChange={(e) => setEditProd((p) => ({ ...p, price: e.target.value }))}
                />
                <input
                  className="p-2.5 border rounded-lg"
                  placeholder="Şəkil URL (ixtiyari)"
                  value={editProd.image_url}
                  onChange={(e) => setEditProd((p) => ({ ...p, image_url: e.target.value }))}
                />
                <textarea
                  className="p-2.5 border rounded-lg sm:col-span-2"
                  rows={3}
                  placeholder="Qısa açıqlama yazın"
                  value={editProd.description}
                  onChange={(e) => setEditProd((p) => ({ ...p, description: e.target.value }))}
                />
                <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <label className="flex items-center justify-between gap-3 text-sm font-semibold text-gray-800">
                    Aktiv saatlar seç
                    <button
                      type="button"
                      role="switch"
                      aria-checked={editProd.active_hours_enabled}
                      onClick={() =>
                        setEditProd((p) => ({ ...p, active_hours_enabled: !p.active_hours_enabled }))
                      }
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        editProd.active_hours_enabled ? "bg-red-600" : "bg-gray-300"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                          editProd.active_hours_enabled ? "translate-x-5" : "translate-x-1"
                        )}
                      />
                    </button>
                  </label>
                  {editProd.active_hours_enabled ? (
                    <div className="mt-3 grid sm:grid-cols-2 gap-3">
                      <input
                        type="time"
                        className="p-2.5 border rounded-lg bg-white"
                        value={editProd.active_from}
                        onChange={(e) => setEditProd((p) => ({ ...p, active_from: e.target.value }))}
                      />
                      <input
                        type="time"
                        className="p-2.5 border rounded-lg bg-white"
                        value={editProd.active_to}
                        onChange={(e) => setEditProd((p) => ({ ...p, active_to: e.target.value }))}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <Button type="button" onClick={() => setEditingProduct(null)} className="flex-1 border">
                  Ləğv
                </Button>
                <Button type="button" onClick={saveEditedProduct} className="flex-1 bg-red-600 text-white">
                  Saxla
                </Button>
              </div>
            </Card>
          </div>
        ) : null}

          </div>
        </main>
      </div>

      <AnimatePresence>
        {logoutConfirmOpen ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLogoutConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className={cn(pageCardCls, "w-full max-w-sm p-6")}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-2">Çıxış</h3>
              <p className="text-sm text-slate-500 mb-5">Çıxmaq istədiyinizə əminsiniz?</p>
              <div className="flex gap-2">
                <button type="button" className={cn(secondaryBtnCls, "flex-1")} onClick={() => setLogoutConfirmOpen(false)}>
                  Ləğv et
                </button>
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center h-10 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
                  onClick={() => {
                    setLogoutConfirmOpen(false);
                    staffLogout();
                  }}
                >
                  Bəli
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
              className={cn(pageCardCls, "max-h-[88vh] w-full max-w-lg overflow-y-auto p-6")}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-4 text-lg font-bold">{t("plan_upgrade_modal_title")}</h3>
              <div className="mb-6 space-y-2">
                {catalogPlans.map((p) => {
                  const activeCatalogId = Number(planRow?.id);
                  const isRestaurantActivePlan =
                    Number.isFinite(activeCatalogId) && activeCatalogId === Number(p.id);
                  const vipLocked = isVipActiveLocked(p);
                  return (
                  <label
                    key={p.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                      selectedUpgradePlanId === p.id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-slate-200 dark:border-slate-700",
                      vipLocked && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <input
                      type="radio"
                      name="plan-upgrade"
                      disabled={vipLocked}
                      checked={selectedUpgradePlanId === p.id}
                      onChange={() => {
                        if (!vipLocked) setSelectedUpgradePlanId(p.id);
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        {isRestaurantActivePlan ? (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                            {t("plan_list_current_badge")}
                          </span>
                        ) : null}
                        <span className="font-bold text-slate-900 dark:text-slate-100">{p.name}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        ₼{p.price_monthly}
                        {t("plan_price_month_suffix")} · {t("plan_max_products")}: {lim(p.max_products)}
                      </div>
                      {vipLocked ? (
                        <p className="text-[11px] text-amber-700 dark:text-amber-400">{t("plan_vip_active_locked")}</p>
                      ) : null}
                    </div>
                  </label>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <button type="button" className={cn(secondaryBtnCls, "flex-1")} onClick={() => setPlanUpgradeOpen(false)}>
                  {t("checkout_cancel")}
                </button>
                <button
                  type="button"
                  disabled={
                    !selectedUpgradePlanId ||
                    catalogPlans.some(
                      (p) =>
                        selectedUpgradePlanId === p.id &&
                        isCatalogPlanActive(p.id) &&
                        isPlanSlugVip(p.slug)
                    )
                  }
                  className={cn(primaryBtnCls, "flex-1 disabled:opacity-50")}
                  onClick={() => void submitPlanRequest()}
                >
                  {t("plan_request_submit")}
                </button>
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
              className={cn(pageCardCls, "max-w-md space-y-4 p-8 text-center")}
            >
              <p className="text-xl font-bold text-green-700">{t("plan_request_ok_title")}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t("plan_request_ok_body")}</p>
              <button
                type="button"
                className={cn(primaryBtnCls, "w-full")}
                onClick={() => {
                  setPlanSuccessOpen(false);
                  navigate(`${basePath}/plan`);
                }}
              >
                {t("plan_back_panel")}
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const preview = searchParams.get("preview") === "true";
  const previewTemplateId = searchParams.get("previewTemplate") ?? "";
  if (!slug) return <div className="p-10 text-center text-gray-500">Menyu tapılmadı</div>;
  return (
    <CustomerMenuView slug={slug} preview={preview} previewTemplateId={previewTemplateId} />
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
          <Route path="/demo/:demoSlug" element={<DemoQrMenuPage />} />
          <Route path="/demo" element={<Navigate to={`/demo/${DEMO_QR_PUBLIC_SLUG}`} replace />} />
          <Route path="/demoMENU" element={<Navigate to={`/demo/${DEMO_QR_PUBLIC_SLUG}`} replace />} />
          <Route path="/demomenu" element={<Navigate to={`/demo/${DEMO_QR_PUBLIC_SLUG}`} replace />} />
          <Route path="/r/:slug" element={<CustomerMenu />} />
          <Route path="/menu/:slug" element={<CustomerMenu />} />
        </Routes>
      </Router>
    </I18nBundleContext.Provider>
  );
}
