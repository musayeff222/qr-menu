import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Utensils, 
  QrCode, 
  Settings, 
  Plus, 
  Trash2, 
  ChevronRight, 
  X,
  ShoppingCart,
  MessageSquare,
  Globe,
  ShieldCheck,
  Server,
  Wifi,
  LogIn,
  Sparkles,
  ArrowRight,
  Store
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function authSuperHeaders(): HeadersInit {
  const t = localStorage.getItem("adminSession");
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

function authRestaurantHeaders(): HeadersInit {
  const t = localStorage.getItem("restaurantSession");
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

/** Restoran işçisi və ya super admin (restoran idarəetməsi üçün). */
function authAnyStaffHeaders(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const rt = localStorage.getItem("restaurantSession");
  const st = localStorage.getItem("adminSession");
  if (rt || st) h.Authorization = `Bearer ${rt || st}`;
  return h;
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

const AdminLoginPage = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const bundle = useI18nBundle();
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      localStorage.setItem("adminSession", data.token);
      onLogin(data.user);
      localStorage.setItem("adminUser", JSON.stringify(data.user));
    } else {
      setError(data.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="text-3xl font-bold text-red-600 mb-8 flex items-center gap-2 justify-center">
          <ShieldCheck size={32} /> Super Admin
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("username")}</label>
            <input 
              type="text" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("password")}</label>
            <input 
              type="password" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" className="w-full bg-red-600 text-white py-3 text-lg">{t("login")}</Button>
        </form>
      </Card>
    </div>
  );
};

const SuperAdminSettings = () => {
  const bundle = useI18nBundle();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState("az");

  useEffect(() => {
    fetch("/api/admin/settings", { headers: authSuperHeaders() })
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.default_language) setCurrentLang(data.default_language);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const t = (key: string) => bundle[currentLang]?.[key] || key;

  const saveSettings = async (newSettings: any) => {
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: authSuperHeaders(),
      body: JSON.stringify({ settings: newSettings })
    });
    setSettings({ ...settings, ...newSettings });
    if (newSettings.default_language) setCurrentLang(newSettings.default_language);
    alert("Settings saved!");
  };

  if (loading) return <div className="p-10">{t("loading")}</div>;

  const supportedLanguages = JSON.parse(settings.supported_languages || "[]");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{t("settings")}</h1>
        <p className="text-gray-500">Manage global application configurations.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
              <Globe size={20} />
            </div>
            <h2 className="text-xl font-bold">{t("language")}</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("default_language")}</label>
              <select 
                className="w-full p-3 border rounded-lg"
                value={settings.default_language}
                onChange={e => saveSettings({ default_language: e.target.value })}
              >
                <option value="az">Azerbaijani</option>
                <option value="ru">Russian</option>
                <option value="tr">Turkish</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">{t("supported_languages")}</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "az", name: "Azerbaijani" },
                  { id: "ru", name: "Russian" },
                  { id: "tr", name: "Turkish" },
                  { id: "en", name: "English" }
                ].map(lang => (
                  <label key={lang.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-red-600"
                      checked={supportedLanguages.includes(lang.id)}
                      onChange={e => {
                        const newLangs = e.target.checked 
                          ? [...supportedLanguages, lang.id]
                          : supportedLanguages.filter((l: string) => l !== lang.id);
                        saveSettings({ supported_languages: JSON.stringify(newLangs) });
                      }}
                    />
                    <span className="text-sm font-medium">{lang.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-xl font-bold">Security</h2>
          </div>
          <p className="text-gray-500 mb-4 text-sm">Update your super admin password.</p>
          <div className="space-y-4">
            <input type="password" placeholder="Current Password" className="w-full p-3 border rounded-lg" />
            <input type="password" placeholder="New Password" className="w-full p-3 border rounded-lg" />
            <Button className="w-full bg-black text-white">Update Password</Button>
          </div>
        </Card>
      </div>
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

const SuperAdminPanel = () => {
  const bundle = useI18nBundle();
  const [user, setUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [stats, setStats] = useState({ totalRestaurants: 0, totalScans: 0 });
  const [health, setHealth] = useState<{
    ok: boolean;
    database?: string;
    driver?: string;
    latencyMs?: number;
  } | null>(null);
  const [newRest, setNewRest] = useState({
    name: "",
    slug: "",
    whatsapp: "",
    admin_user: "",
    admin_pass: "",
  });
  const [view, setView] = useState<"dashboard" | "settings">("dashboard");
  const [currentLang, setCurrentLang] = useState("az");

  const loadDashboard = () => {
    fetch("/api/restaurants", { headers: authSuperHeaders() })
      .then((res) => (res.ok ? res.json() : []))
      .then(setRestaurants);
    fetch("/api/stats", { headers: authSuperHeaders() })
      .then((res) => (res.ok ? res.json() : { totalRestaurants: 0, totalScans: 0 }))
      .then(setStats);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("adminUser");
    const tok = localStorage.getItem("adminSession");
    if (savedUser && tok) setUser(JSON.parse(savedUser));
    else {
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminSession");
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadDashboard();
    fetch("/api/admin/settings", { headers: authSuperHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data.default_language) setCurrentLang(data.default_language);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const poll = () => {
      fetch("/api/health")
        .then((r) => r.json())
        .then(setHealth)
        .catch(() => setHealth({ ok: false }));
    };
    poll();
    const i = setInterval(poll, 15000);
    return () => clearInterval(i);
  }, []);

  const t = (key: string) => bundle[currentLang]?.[key] || key;

  const handleCreate = async () => {
    const res = await fetch("/api/restaurants", {
      method: "POST",
      headers: authSuperHeaders(),
      body: JSON.stringify({
        name: newRest.name,
        slug: newRest.slug,
        whatsapp_number: newRest.whatsapp,
        admin_username: newRest.admin_user,
        admin_password: newRest.admin_pass,
      }),
    });
    if (res.ok) {
      const row = await res.json();
      setRestaurants((prev) => [...prev, { ...row, staff_username: newRest.admin_user } as Restaurant]);
      setNewRest({ name: "", slug: "", whatsapp: "", admin_user: "", admin_pass: "" });
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Create failed");
    }
  };

  const resetStaff = async (id: number) => {
    const u = window.prompt(t("admin_acc_user"));
    const p = window.prompt(t("password"));
    if (!u || !p) return;
    const res = await fetch(`/api/admin/restaurants/${id}/staff`, {
      method: "POST",
      headers: authSuperHeaders(),
      body: JSON.stringify({ username: u, password: p }),
    });
    if (res.ok) loadDashboard();
    else alert("Failed");
  };

  if (!user) return <AdminLoginPage onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 shrink-0 bg-white border-b md:border-b-0 md:border-r border-gray-200 md:min-h-screen flex md:flex-col flex-row md:items-stretch items-center justify-between md:justify-start gap-1 p-3 md:p-6 md:space-y-2 overflow-x-auto md:overflow-visible">
        <div className="hidden md:flex text-xl font-bold text-red-600 mb-6 items-center gap-2 px-1">
          <ShieldCheck /> Super Admin
        </div>
        <button
          type="button"
          onClick={() => setView("dashboard")}
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 md:w-full md:px-3 rounded-lg font-medium whitespace-nowrap transition-colors",
            view === "dashboard" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <LayoutDashboard size={20} /> <span className="hidden sm:inline">{t("dashboard")}</span>
        </button>
        <button
          type="button"
          onClick={() => setView("settings")}
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 md:w-full rounded-lg font-medium whitespace-nowrap transition-colors",
            view === "settings" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"
          )}
        >
          <Settings size={20} /> <span className="hidden sm:inline">{t("settings")}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            localStorage.removeItem("adminUser");
            localStorage.removeItem("adminSession");
            setUser(null);
          }}
          className="flex items-center gap-2 px-3 py-2.5 md:w-full md:mt-auto text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium"
        >
          <X size={20} /> <span className="hidden sm:inline">{t("logout")}</span>
        </button>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-10 pb-24 md:pb-10 w-full min-w-0">
        {view === "settings" ? (
          <SuperAdminSettings />
        ) : (
          <>
            <header className="flex flex-col lg:flex-row lg:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{t("super_dashboard")}</h1>
                <p className="text-gray-500 text-sm mt-1">{t("server_health")}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Card
                  className={cn(
                    "p-4 flex items-center gap-3 border",
                    health?.ok ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"
                  )}
                >
                  <Server className={health?.ok ? "text-emerald-600" : "text-red-600"} size={24} />
                  <div>
                    <p className="text-xs text-gray-500">{t("server_health")}</p>
                    <p className="font-bold text-sm">
                      {health?.ok ? t("server_online") : t("server_error")}
                    </p>
                    {health?.driver && (
                      <p className="text-xs text-gray-500">
                        {t("db_driver")}: {health.driver} · {health.latencyMs ?? "—"} {t("response_ms")}
                      </p>
                    )}
                  </div>
                </Card>
                <Card className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <Utensils size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{t("restaurants")}</p>
                    <p className="text-xl font-bold">{stats.totalRestaurants}</p>
                  </div>
                </Card>
                <Card className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">QR scans</p>
                    <p className="text-xl font-bold">{stats.totalScans}</p>
                  </div>
                </Card>
              </div>
            </header>

            <Card className="p-4 sm:p-6 mb-8">
              <h2 className="text-xl font-bold mb-2">{t("create_restaurant")}</h2>
              <p className="text-sm text-gray-500 mb-4">{t("staff_note")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <input
                  placeholder={t("name")}
                  className="p-3 border rounded-lg"
                  value={newRest.name}
                  onChange={(e) => setNewRest({ ...newRest, name: e.target.value })}
                />
                <input
                  placeholder={t("slug")}
                  className="p-3 border rounded-lg"
                  value={newRest.slug}
                  onChange={(e) => setNewRest({ ...newRest, slug: e.target.value })}
                />
                <input
                  placeholder={t("whatsapp")}
                  className="p-3 border rounded-lg"
                  value={newRest.whatsapp}
                  onChange={(e) => setNewRest({ ...newRest, whatsapp: e.target.value })}
                />
                <input
                  placeholder={t("admin_acc_user")}
                  className="p-3 border rounded-lg"
                  value={newRest.admin_user}
                  onChange={(e) => setNewRest({ ...newRest, admin_user: e.target.value })}
                />
                <input
                  type="password"
                  placeholder={t("admin_acc_pass")}
                  className="p-3 border rounded-lg"
                  value={newRest.admin_pass}
                  onChange={(e) => setNewRest({ ...newRest, admin_pass: e.target.value })}
                />
                <Button onClick={handleCreate} className="bg-red-600 text-white h-[46px]">
                  {t("create")}
                </Button>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold">{t("restaurants")}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[640px]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <th className="p-3 sm:p-4">{t("name")}</th>
                      <th className="p-3 sm:p-4">{t("slug")}</th>
                      <th className="p-3 sm:p-4">{t("staff_username_col")}</th>
                      <th className="p-3 sm:p-4">Plan</th>
                      <th className="p-3 sm:p-4 text-right">{t("dashboard")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {restaurants.map((rest) => (
                      <tr key={rest.id} className="hover:bg-gray-50">
                        <td className="p-3 sm:p-4 font-medium">{rest.name}</td>
                        <td className="p-3 sm:p-4 text-gray-500 font-mono text-xs">/r/{rest.slug}</td>
                        <td className="p-3 sm:p-4 text-gray-600">{rest.staff_username || "—"}</td>
                        <td className="p-3 sm:p-4">
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold uppercase">
                            {rest.plan}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-right space-x-2 whitespace-nowrap">
                          <Link
                            to={`/restaurant/${rest.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {t("manage")}
                          </Link>
                          <button
                            type="button"
                            onClick={() => resetStaff(rest.id)}
                            className="text-amber-700 hover:underline"
                          >
                            {t("reset_staff_short")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

const RestaurantPanel = () => {
  const bundle = useI18nBundle();
  const navigate = useNavigate();
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newCat, setNewCat] = useState("");
  const [newProd, setNewProd] = useState({ name: "", price: 0, category_id: 0, description: "" });
  const [qrCode, setQrCode] = useState("");
  const [profile, setProfile] = useState({ name: "", slug: "", whatsapp_number: "", primary_color: "#ef4444" });
  const [editingTranslations, setEditingTranslations] = useState<{ type: 'category' | 'product', id: number, data: any } | null>(null);
  const [currentLang, setCurrentLang] = useState("az");
  const [loadError, setLoadError] = useState("");

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
      });
      const menuUrl = `${window.location.origin}/r/${r.slug}`;
      const qr = await fetch(`/api/qrcode?url=${encodeURIComponent(menuUrl)}`).then((x) => x.json());
      setQrCode(qr.qrDataUrl);
    };
    load();
  }, [id, navigate]);

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
    }
  };

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
        <div className="flex md:flex-col flex-row gap-1 min-w-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 font-medium text-sm whitespace-nowrap">
            <LayoutDashboard size={18} /> {t("dashboard")}
          </div>
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
          <h1 className="text-2xl sm:text-3xl font-bold">Menu</h1>
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
            <div className="flex gap-2 items-center">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
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
                        onClick={() => setEditingTranslations({ type: 'category', id: cat.id, data: cat.translations || {} })}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Globe size={16} />
                      </button>
                      <button className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
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
          </div>

          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <h3 className="font-bold mb-4">{t("add_product")}</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
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
                  className="p-2 border rounded-lg"
                  value={newProd.category_id}
                  onChange={e => setNewProd({ ...newProd, category_id: Number(e.target.value) })}
                >
                  <option value={0}>{t("select_category")}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.translations?.[currentLang] || cat.name}</option>
                  ))}
                </select>
                <Button onClick={addProduct} className="bg-red-600 text-white">{t("add_product")}</Button>
              </div>
            </Card>

            <div className="space-y-4">
              {categories.map(cat => (
                <div key={cat.id}>
                  <h4 className="font-bold text-gray-500 uppercase text-xs tracking-wider mb-2">{cat.translations?.[currentLang] || cat.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.filter(p => p.category_id === cat.id).map(prod => (
                      <Card key={prod.id} className="p-4 flex gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h5 className="font-bold">{prod.translations?.[currentLang]?.name || prod.name}</h5>
                            <span className="font-bold text-red-600">${prod.price}</span>
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2">{prod.translations?.[currentLang]?.desc || prod.description}</p>
                          <div className="mt-2 flex justify-end">
                            <button 
                              onClick={() => setEditingTranslations({ type: 'product', id: prod.id, data: prod.translations || {} })}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-bold"
                            >
                              <Globe size={14} /> {t("translations")}
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
        </div>
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
    fetch(`/api/restaurants/${slug}`).then(res => res.json()).then(res => {
      setData(res);
      if (res.categories.length > 0) setActiveCategory(res.categories[0].id);
    });
  }, [slug]);

  const t = (key: string) => bundle[currentLang]?.[key] || key;

  if (!data) return <div className="p-10 text-center">{t("loading")}</div>;

  const addToCart = (product: any) => {
    setCart([...cart, product]);
  };

  const sendWhatsApp = () => {
    const text = `Hello! I'd like to order:\n${cart.map(p => `- ${p.translations?.[currentLang]?.name || p.name} ($${p.price})`).join("\n")}\nTotal: $${cart.reduce((s, p) => s + p.price, 0)}`;
    window.open(`https://wa.me/${data.whatsapp_number}?text=${encodeURIComponent(text)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div 
        className="h-48 bg-cover bg-center relative"
        style={{ backgroundColor: data.primary_color }}
      >
        <div className="absolute top-4 right-4 z-20">
          <select 
            className="bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-lg p-1 text-xs font-bold outline-none"
            value={currentLang}
            onChange={e => setCurrentLang(e.target.value)}
          >
            <option value="az" className="text-black">AZ</option>
            <option value="en" className="text-black">EN</option>
            <option value="ru" className="text-black">RU</option>
            <option value="tr" className="text-black">TR</option>
          </select>
        </div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-24 h-24 bg-white rounded-full shadow-xl p-2">
          <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
            <Utensils size={32} style={{ color: data.primary_color }} />
          </div>
        </div>
      </div>

      <div className="mt-14 text-center px-6">
        <h1 className="text-2xl font-bold">{data.name}</h1>
        <p className="text-gray-500 text-sm">{t("scan_order_enjoy")}</p>
      </div>

      {/* Categories */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 mt-6 border-b overflow-x-auto whitespace-nowrap px-4 py-3 no-scrollbar">
        {data.categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-bold mr-2 transition-colors",
              activeCategory === cat.id 
                ? "bg-black text-white" 
                : "bg-gray-100 text-gray-600"
            )}
          >
            {cat.translations?.[currentLang] || cat.name}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="px-4 mt-6 space-y-4">
        {data.products.filter((p: any) => p.category_id === activeCategory).map((prod: any) => (
          <motion.div 
            layout
            key={prod.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-3 flex gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0"></div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold">{prod.translations?.[currentLang]?.name || prod.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{prod.translations?.[currentLang]?.desc || prod.description}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-lg" style={{ color: data.primary_color }}>${prod.price}</span>
                  <button 
                    onClick={() => addToCart(prod)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: data.primary_color }}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Cart Button */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-6 right-6 z-20"
          >
            <button 
              onClick={sendWhatsApp}
              className="w-full bg-green-600 text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center font-bold"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <ShoppingCart size={20} />
                </div>
                <span>{cart.length} {t("items_in_cart")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{t("order_via_whatsapp")}</span>
                <ChevronRight size={20} />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
          <Route path="/admin" element={<SuperAdminPanel />} />
          <Route path="/panel" element={<RestaurantLoginPage />} />
          <Route path="/restaurant/:id" element={<RestaurantPanel />} />
          <Route path="/r/:slug" element={<CustomerMenu />} />
        </Routes>
      </Router>
    </I18nBundleContext.Provider>
  );
}
