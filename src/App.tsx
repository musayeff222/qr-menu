import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useParams, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  MenuTemplateView,
  resolveMenuTemplate,
  TemplatePicker,
  MENU_TEMPLATE_COUNT,
  type MenuTemplateDef,
} from "./menu-templates";
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
  Store
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { authRestaurantHeaders, authAnyStaffHeaders } from "./lib/headers";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Translations ---
const UI_TRANSLATIONS: any = {
  az: {
    dashboard: "Panel",
    settings: "Ayarlar",
    restaurants: "Restoranlar",
    create_restaurant: "Yeni Restoran Yarat",
    name: "Ad",
    slug: "Slug",
    whatsapp: "WhatsApp Nömrəsi",
    create: "Yarat",
    manage: "İdarə et",
    block: "Blokla",
    logout: "Çıxış",
    categories: "Kateqoriyalar",
    products: "Məhsullar",
    add_category: "Kateqoriya Əlavə Et",
    add_product: "Məhsul Əlavə Et",
    price: "Qiymət",
    description: "Təsvir",
    save: "Yadda saxla",
    language: "Dil",
    default_language: "Əsas Dil",
    supported_languages: "Dəstəklənən Dillər",
    view_live: "Canlı Menyuya Bax",
    scan_order_enjoy: "Skan et, Sifariş et, Zövq al!",
    items_in_cart: "Məhsul səbətdə",
    order_via_whatsapp: "WhatsApp ilə sifariş et",
    total: "Cəmi",
    loading: "Yüklənir...",
    select_category: "Kateqoriya seçin",
    translations: "Tərcümələr",
    login: "Daxil ol",
    username: "İstifadəçi adı",
    password: "Şifrə",
    landing_nav_admin: "Super Admin",
    landing_nav_start: "Başla",
    landing_hero_1: "Restoran menyunuz,",
    landing_hero_2: "rəqəmsal.",
    landing_hero_sub: "Dəqiqələr içində gözəl digital menyu yaradın. QR kodlar, kateqoriyalar və WhatsApp sifarişi.",
    landing_cta: "Menyu yarat",
    landing_feat1_t: "Sürətli quraşdırma",
    landing_feat1_d: "Bir kliklə restoran və menyu.",
    landing_feat2_t: "QR kod",
    landing_feat2_d: "Avtomatik QR kodlar.",
    landing_feat3_t: "WhatsApp",
    landing_feat3_d: "Birbaşa telefonunuza sifariş.",
    server_health: "Server və baza",
    server_online: "Qoşulub",
    server_error: "Xəta",
    db_driver: "Növ",
    response_ms: "ms",
    rest_login_title: "Restoran girişi",
    rest_login_sub: "Menyunuzu idarə etmək üçün daxil olun",
    restaurant_staff_login: "Restoran paneli",
    admin_acc_user: "Restoran admin login",
    admin_acc_pass: "Restoran şifrə",
    staff_note: "Hər restoran öz menyusuna bu hesabla girir",
    staff_username_col: "Restoran login",
    reset_staff_short: "Girişi yenilə",
    your_link: "İctimai link",
    slug_label: "URL (slug)",
    save_profile: "Yadda saxla",
    super_dashboard: "İdarə paneli",
    demo_login: "Demo: burger_admin / burger123"
  },
  en: {
    dashboard: "Dashboard",
    settings: "Settings",
    restaurants: "Restaurants",
    create_restaurant: "Create New Restaurant",
    name: "Name",
    slug: "Slug",
    whatsapp: "WhatsApp Number",
    create: "Create",
    manage: "Manage",
    block: "Block",
    logout: "Logout",
    categories: "Categories",
    products: "Products",
    add_category: "Add Category",
    add_product: "Add Product",
    price: "Price",
    description: "Description",
    save: "Save",
    language: "Language",
    default_language: "Default Language",
    supported_languages: "Supported Languages",
    view_live: "View Live Menu",
    scan_order_enjoy: "Scan, Order, Enjoy!",
    items_in_cart: "Items in Cart",
    order_via_whatsapp: "Order via WhatsApp",
    total: "Total",
    loading: "Loading...",
    select_category: "Select Category",
    translations: "Translations",
    login: "Login",
    username: "Username",
    password: "Password",
    landing_nav_admin: "Super Admin",
    landing_nav_start: "Get Started",
    landing_hero_1: "Your Restaurant Menu,",
    landing_hero_2: "Digitalized.",
    landing_hero_sub: "Create a beautiful digital menu in minutes. QR codes, categories, and WhatsApp orders.",
    landing_cta: "Create Your Menu",
    landing_feat1_t: "Fast Setup",
    landing_feat1_d: "One click to create your restaurant and menu.",
    landing_feat2_t: "QR Generation",
    landing_feat2_d: "Auto-generated QR codes for every table.",
    landing_feat3_t: "WhatsApp Orders",
    landing_feat3_d: "Receive orders directly on your phone.",
    server_health: "Server & database",
    server_online: "Connected",
    server_error: "Error",
    db_driver: "Driver",
    response_ms: "ms",
    rest_login_title: "Restaurant login",
    rest_login_sub: "Sign in to manage your menu",
    restaurant_staff_login: "Restaurant panel",
    admin_acc_user: "Restaurant admin username",
    admin_acc_pass: "Restaurant admin password",
    staff_note: "Each restaurant uses these credentials for its panel",
    staff_username_col: "Staff login",
    reset_staff_short: "Reset access",
    your_link: "Public menu link",
    slug_label: "URL (slug)",
    save_profile: "Save",
    super_dashboard: "Dashboard",
    demo_login: "Demo: burger_admin / burger123"
  },
  ru: {
    dashboard: "Панель",
    settings: "Настройки",
    restaurants: "Рестораны",
    create_restaurant: "Создать новый ресторан",
    name: "Имя",
    slug: "Слаг",
    whatsapp: "Номер WhatsApp",
    create: "Создать",
    manage: "Управлять",
    block: "Блокировать",
    logout: "Выйти",
    categories: "Категории",
    products: "Продукты",
    add_category: "Добавить категорию",
    add_product: "Добавить продукт",
    price: "Цена",
    description: "Описание",
    save: "Сохранить",
    language: "Язык",
    default_language: "Язык по умолчанию",
    supported_languages: "Поддерживаемые языки",
    view_live: "Посмотреть меню",
    scan_order_enjoy: "Сканируй, Заказывай, Наслаждайся!",
    items_in_cart: "Товаров в корзине",
    order_via_whatsapp: "Заказать через WhatsApp",
    total: "Итого",
    loading: "Загрузка...",
    select_category: "Выберите категорию",
    translations: "Переводы",
    login: "Войти",
    username: "Логин",
    password: "Пароль",
    landing_nav_admin: "Супер админ",
    landing_nav_start: "Начать",
    landing_hero_1: "Меню вашего ресторана,",
    landing_hero_2: "в цифре.",
    landing_hero_sub: "Создайте цифровое меню за минуты. QR-коды, категории и заказы в WhatsApp.",
    landing_cta: "Создать меню",
    landing_feat1_t: "Быстрый старт",
    landing_feat1_d: "Ресторан и меню в один клик.",
    landing_feat2_t: "QR-коды",
    landing_feat2_d: "Автоматические QR для столов.",
    landing_feat3_t: "WhatsApp",
    landing_feat3_d: "Заказы прямо на телефон.",
    server_health: "Сервер и БД",
    server_online: "Подключено",
    server_error: "Ошибка",
    db_driver: "Тип",
    response_ms: "мс",
    rest_login_title: "Вход для ресторана",
    rest_login_sub: "Войдите для управления меню",
    restaurant_staff_login: "Панель ресторана",
    admin_acc_user: "Логин администратора",
    admin_acc_pass: "Пароль администратора",
    staff_note: "Каждый ресторан входит со своей учётной записью",
    staff_username_col: "Логин персонала",
    reset_staff_short: "Сбросить доступ",
    your_link: "Публичная ссылка",
    slug_label: "URL (slug)",
    save_profile: "Сохранить",
    super_dashboard: "Панель",
    demo_login: "Демо: burger_admin / burger123"
  },
  tr: {
    dashboard: "Panel",
    settings: "Ayarlar",
    restaurants: "Restoranlar",
    create_restaurant: "Yeni Restoran Oluştur",
    name: "Ad",
    slug: "Slug",
    whatsapp: "WhatsApp Numarası",
    create: "Oluştur",
    manage: "Yönet",
    block: "Engelle",
    logout: "Çıkış",
    categories: "Kategoriler",
    products: "Ürünler",
    add_category: "Kategori Ekle",
    add_product: "Ürün Ekle",
    price: "Fiyat",
    description: "Açıklama",
    save: "Kaydet",
    language: "Dil",
    default_language: "Varsayılan Dil",
    supported_languages: "Desteklenen Diller",
    view_live: "Canlı Menüyü Görüntüle",
    scan_order_enjoy: "Tara, Sipariş Ver, Keyfini Çıkar!",
    items_in_cart: "Sepetteki Ürünler",
    order_via_whatsapp: "WhatsApp ile Sipariş Ver",
    total: "Toplam",
    loading: "Yükleniyor...",
    select_category: "Kategori seçin",
    translations: "Çeviriler",
    login: "Giriş",
    username: "Kullanıcı adı",
    password: "Şifre",
    landing_nav_admin: "Süper Admin",
    landing_nav_start: "Başla",
    landing_hero_1: "Restoran menünüz,",
    landing_hero_2: "dijital.",
    landing_hero_sub: "Dakikalar içinde dijital menü oluşturun. QR kodlar, kategoriler ve WhatsApp siparişleri.",
    landing_cta: "Menü oluştur",
    landing_feat1_t: "Hızlı kurulum",
    landing_feat1_d: "Tek tıkla restoran ve menü.",
    landing_feat2_t: "QR üretimi",
    landing_feat2_d: "Otomatik QR kodlar.",
    landing_feat3_t: "WhatsApp sipariş",
    landing_feat3_d: "Siparişler doğrudan telefona.",
    server_health: "Sunucu ve veritabanı",
    server_online: "Bağlı",
    server_error: "Hata",
    db_driver: "Sürücü",
    response_ms: "ms",
    rest_login_title: "Restoran girişi",
    rest_login_sub: "Menünüzü yönetmek için giriş yapın",
    restaurant_staff_login: "Restoran paneli",
    admin_acc_user: "Restoran admin kullanıcı adı",
    admin_acc_pass: "Restoran admin şifre",
    staff_note: "Her restoran kendi hesabıyla paneline girer",
    staff_username_col: "Personel girişi",
    reset_staff_short: "Erişimi sıfırla",
    your_link: "Genel menü linki",
    slug_label: "URL (slug)",
    save_profile: "Kaydet",
    super_dashboard: "Panel",
    demo_login: "Demo: burger_admin / burger123"
  }
};

const I18nBundleContext = React.createContext(UI_TRANSLATIONS);

function useI18nBundle() {
  return React.useContext(I18nBundleContext);
}

// --- Types ---
interface Restaurant {
  id: number;
  name: string;
  slug: string;
  logo_url: string;
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

const LandingPage = () => {
  const bundle = useI18nBundle();
  const [lang, setLang] = useState("az");

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((s: { default_language?: string }) => {
        if (s.default_language) setLang(s.default_language);
      })
      .catch(() => {});
  }, []);

  const t = (key: string) => bundle[lang]?.[key] || key;

  const feats = [
    { titleKey: "landing_feat1_t", descKey: "landing_feat1_d", icon: Plus },
    { titleKey: "landing_feat2_t", descKey: "landing_feat2_d", icon: QrCode },
    { titleKey: "landing_feat3_t", descKey: "landing_feat3_d", icon: MessageSquare },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/80 to-slate-950 text-white overflow-x-hidden">
      <motion.div
        className="absolute inset-0 opacity-40 pointer-events-none"
        animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(239,68,68,0.35), transparent 45%), radial-gradient(circle at 80% 20%, rgba(248,113,113,0.2), transparent 40%)",
          backgroundSize: "120% 120%",
        }}
      />

      <nav className="relative z-10 px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-3 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-white"
        >
          <Sparkles className="text-red-400 shrink-0" size={26} />
          QRMenu
        </motion.div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          <select
            className="text-xs sm:text-sm border border-white/20 bg-white/10 backdrop-blur rounded-lg px-2 py-2 text-white outline-none"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="az" className="text-gray-900">AZ</option>
            <option value="en" className="text-gray-900">EN</option>
            <option value="ru" className="text-gray-900">RU</option>
            <option value="tr" className="text-gray-900">TR</option>
          </select>
          <Link
            to="/panel"
            className="text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors flex items-center gap-1"
          >
            <Store size={18} /> {t("restaurant_staff_login")}
          </Link>
          <Link
            to="/admin"
            className="text-sm px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition-colors font-medium"
          >
            {t("landing_nav_admin")}
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-16 pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 22 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs sm:text-sm text-red-100 mb-6"
          >
            <Wifi size={14} className="text-red-300" />
            QR · WhatsApp · Çoxdilli
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6"
          >
            {t("landing_hero_1")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-amber-200">
              {t("landing_hero_2")}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="text-base sm:text-lg md:text-xl text-red-100/90 mb-10 max-w-2xl mx-auto"
          >
            {t("landing_hero_sub")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center"
          >
            <Link
              to="/panel"
              className="inline-flex items-center justify-center gap-2 bg-white text-red-900 px-6 py-3.5 rounded-xl text-base font-bold shadow-xl hover:shadow-red-500/20 active:scale-[0.98] transition-transform"
            >
              {t("landing_cta")} <ArrowRight size={20} />
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center justify-center gap-2 border border-white/25 px-6 py-3.5 rounded-xl font-medium hover:bg-white/10 transition-colors"
            >
              <ShieldCheck size={20} /> {t("landing_nav_admin")}
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
          className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
        >
          {feats.map((feat, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <Card className="p-6 sm:p-8 h-full bg-white/5 border-white/10 backdrop-blur-md hover:border-red-400/30 transition-colors text-left">
                <div className="w-11 h-11 bg-red-500/20 text-red-200 rounded-xl flex items-center justify-center mb-4">
                  <feat.icon size={22} />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{t(feat.titleKey)}</h3>
                <p className="text-sm text-red-100/75">{t(feat.descKey)}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

const RestaurantLoginPage = () => {
  const bundle = useI18nBundle();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from;
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
      navigate(from || `/restaurant/${data.restaurantId}`, { replace: true });
    } else {
      setError(data.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-red-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-6 sm:p-8 border border-white/10 bg-white/95 backdrop-blur shadow-2xl">
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
          <div className="mt-6 text-center text-sm text-gray-500">
            <Link to="/" className="text-red-600 hover:underline">
              ← {t("landing_nav_start")}
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
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
  const [newProd, setNewProd] = useState({ name: "", price: 0, category_id: 0, description: "" });
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
  });
  const [editingTranslations, setEditingTranslations] = useState<{ type: 'category' | 'product', id: number, data: any } | null>(null);
  const [currentLang, setCurrentLang] = useState("az");
  const [loadError, setLoadError] = useState("");
  const [extraTemplates, setExtraTemplates] = useState<MenuTemplateDef[]>([]);
  const [dashStats, setDashStats] = useState<{ scans: number; pageViews: number; topProducts: any[] } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

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

  const t = (key: string) => bundle[currentLang]?.[key] || key;

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
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: authAnyStaffHeaders(),
      body: JSON.stringify({ ...newProd, restaurant_id: Number(id) })
    });
    if (res.ok) {
      const data = await res.json();
      setProducts([...products, data]);
      setNewProd({ name: "", price: 0, category_id: 0, description: "" });
      if (productsNew) navigate(`${basePath}/products`);
    }
  };

  const deleteCategory = async (cid: number) => {
    if (!confirm("Kateqoriya və məhsulları silinsin?")) return;
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
    if (!confirm("Məhsul silinsin?")) return;
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pb-safe">
      <aside className="w-full md:w-56 shrink-0 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex md:flex-col flex-row gap-1 p-3 md:p-4 overflow-x-auto md:overflow-visible">
        <div className="hidden md:flex text-lg font-bold text-red-600 mb-4 items-center gap-2 px-1 whitespace-nowrap">
          <Utensils /> <span className="truncate max-w-[10rem]">{restaurant.name}</span>
        </div>
        <div className="flex md:flex-col flex-row gap-1 min-w-0 md:space-y-1">
          <NavLink to={basePath} end className={sidebarCls}>
            <LayoutDashboard size={18} /> {t("dashboard")}
          </NavLink>
          <NavLink to={`${basePath}/categories`} className={sidebarCls}>
            <Utensils size={18} /> {t("categories")}
          </NavLink>
          <NavLink to={`${basePath}/products`} className={sidebarCls}>
            <Plus size={18} /> {t("products")}
          </NavLink>
          <NavLink to={`${basePath}/templates`} className={sidebarCls}>
            <QrCode size={18} /> Şablonlar
          </NavLink>
          <NavLink to={`${basePath}/orders`} className={sidebarCls}>
            <ShoppingCart size={18} /> Sifarişlər
          </NavLink>
          <NavLink to={`${basePath}/settings`} className={sidebarCls}>
            <Globe size={18} /> {t("settings")}
          </NavLink>
          <a
            href={`/r/${restaurant.slug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm whitespace-nowrap"
          >
            <Globe size={18} /> {t("view_live")}
          </a>
          {isSuper && (
            <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 whitespace-nowrap">
              ← Admin
            </Link>
          )}
          {!isSuper && (
            <button
              type="button"
              onClick={staffLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 whitespace-nowrap"
            >
              <X size={18} /> {t("logout")}
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-8 w-full min-w-0">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {section === "dashboard" && t("dashboard")}
            {section === "settings" && t("settings")}
            {section === "categories" && t("categories")}
            {section === "products" && (productsNew ? t("add_product") : t("products"))}
            {section === "templates" && "Şablonlar"}
            {section === "orders" && "Sifarişlər"}
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
              <p className="text-xs text-gray-500">QR skan sayı</p>
              <p className="text-2xl font-bold text-red-600">{dashStats.scans}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-gray-500">Menyu baxışı</p>
              <p className="text-2xl font-bold">{dashStats.pageViews}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-gray-500 mb-2">Ən çox baxılan məhsullar</p>
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
            <p className="text-sm text-gray-500 mb-4">
              Son sifarişlər (stub — API hazırdır).
            </p>
            {orders.length === 0 ? (
              <p className="text-gray-400 text-sm">Hələ sifariş yoxdur.</p>
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
              <h3 className="font-bold mb-4">Your QR Code</h3>
              <div className="bg-white border rounded-xl flex flex-col items-center justify-center p-6 text-center">
                {qrCode ? (
                  <img src={qrCode} alt="QR Code" className="w-48 h-48 mb-4" />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 animate-pulse mb-4 rounded-lg"></div>
                )}
                <p className="text-sm text-gray-500 mb-4">Scan this to view your menu</p>
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
                    Download
                  </Button>
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/r/${restaurant.slug}`);
                      alert("Link copied!");
                    }}
                    className="flex-1 bg-gray-100 text-gray-600 text-sm"
                  >
                    Copy Link
                  </Button>
                </div>
              </div>
            </Card>
        )}

        {section === "templates" && (
        <Card className="p-4 sm:p-6 mb-8">
          <h3 className="font-bold text-lg mb-1">Menu templates</h3>
          <p className="text-sm text-gray-500 mb-4">
            {MENU_TEMPLATE_COUNT}+ şablon. Canlı baxış menyunu açır.
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
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex justify-between gap-2">
                            <h5 className="font-bold">{prod.translations?.[currentLang]?.name || prod.name}</h5>
                            <span className="font-bold text-red-600">${prod.price}</span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">{prod.translations?.[currentLang]?.desc || prod.description}</p>
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
                <Button type="button" onClick={() => navigate(`${basePath}/products`)} className="border">Geri</Button>
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
                <Button onClick={() => setEditingTranslations(null)} className="flex-1 bg-white border">Cancel</Button>
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
  const [cart, setCart] = useState<any[]>([]);
  const [currentLang, setCurrentLang] = useState("az");

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

  const { categories, products, custom_templates, plan_features, ...restaurantRow } = data;
  const template = resolveMenuTemplate(
    previewTemplateId || data.menu_template || "modern-01",
    custom_templates
  );

  const addToCart = (product: Record<string, unknown>) => {
    setCart((c) => [...c, product]);
  };

  const sendWhatsApp = () => {
    const wa = String(data.whatsapp_number ?? "").replace(/\D/g, "");
    if (!wa) return;
    const text = `Hello! I'd like to order:\n${cart
      .map(
        (p) =>
          `- ${(p.translations as any)?.[currentLang]?.name || p.name} ($${p.price})`
      )
      .join("\n")}\nTotal: $${cart.reduce((s, p) => s + Number(p.price), 0)}`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(text)}`);
  };

  return (
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
      onWhatsAppOrder={sendWhatsApp}
      t={t}
      planFeatures={{
        whatsapp_order: plan_features?.whatsapp_order !== false,
        reservation: plan_features?.reservation !== false,
      }}
    />
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
            ...(UI_TRANSLATIONS as any)[loc],
            ...remote[loc],
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
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/panel" element={<RestaurantLoginPage />} />
          <Route path="/restaurant/:id/*" element={<RestaurantPanel />} />
          <Route path="/r/:slug" element={<CustomerMenu />} />
          <Route path="/menu/:slug" element={<CustomerMenu />} />
        </Routes>
      </Router>
    </I18nBundleContext.Provider>
  );
}
