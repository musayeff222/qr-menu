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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { authRestaurantHeaders, authAnyStaffHeaders } from "./lib/headers";
import { DEMO_MENU_PREVIEW_SLUG } from "./demoMenuSlug";

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
    landing_sales_title: "Restoranınız üçün Rəqəmsal QR Menu yaradın",
    landing_sales_sub:
      "QR kod ilə qonaqlar menyuya bir saniyədə daxil olsun. WhatsApp sifariş, 50-dən çox şablon, tam mobil uyğunluq.",
    landing_cta_free: "Pulsuz başla",
    landing_cta_demo: "Demo bax",
    landing_feat4_t: "50+ fərqli şablon",
    landing_feat4_d: "Hər şablon fərqli layout, rəng və fontlarla.",
    landing_how_title: "Necə işləyir?",
    landing_how_1: "Qeydiyyat — hesab yaradın",
    landing_how_2: "Menu — məhsul və şəkil əlavə edin",
    landing_how_3: "QR — masada paylaşın",
    landing_plans_title: "Tariflər",
    landing_buy: "Satın al",
    landing_demo_title: "Canlı demo menyusu",
    landing_footer_contact: "Əlaqə",
    landing_sticky: "Başla",
    landing_plans_sub: "Super Admin panelindən idarə olunur — dəyişikliklər avtomatik burada görünür.",
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
    full_name_label: "Ad soyad",
    phone_label: "Telefon nömrəsi",
    register_title: "Hesab yaradın",
    register_sub: "Pulsuz başlayın — restoran və demo menyu avtomatik yaradılır",
    register_submit: "Qeydiyyat",
    register_success_note: "Hesab hazırdır. Aşağıdan daxil olun.",
    register_have_account: "Artıq hesabınız var?",
    orders_closed_hint: "Hal-hazırda sifariş qəbul edilmir (iş saatları).",
    checkout_title: "Sifarişi tamamla",
    checkout_address_placeholder: "Ünvanı yazın",
    checkout_location_btn: "Konumumu göndər",
    checkout_location_busy: "Konum alınır…",
    checkout_geo_prefix: "Konum",
    checkout_payment: "Ödəniş üsulu",
    checkout_cash: "Nağd",
    checkout_card: "Kart",
    checkout_send: "WhatsApp ilə göndər",
    checkout_address_required: "Ünvan yazın və ya konumu seçin",
    checkout_cancel: "Bağla",
    demo_login: "Demo: demo / demo123 (nümunə menyusu)"
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
    landing_sales_title: "Build a digital QR menu for your restaurant",
    landing_sales_sub:
      "Guests open your menu in one scan. WhatsApp ordering, 50+ templates, mobile-first.",
    landing_cta_free: "Start free",
    landing_cta_demo: "View demo",
    landing_feat4_t: "50+ unique templates",
    landing_feat4_d: "Different layouts, colors, and typography.",
    landing_how_title: "How it works",
    landing_how_1: "Sign up — create your account",
    landing_how_2: "Menu — add dishes and photos",
    landing_how_3: "QR — share at tables",
    landing_plans_title: "Plans",
    landing_buy: "Subscribe",
    landing_demo_title: "Live demo menu",
    landing_footer_contact: "Contact",
    landing_sticky: "Get started",
    landing_plans_sub: "Managed from Super Admin — changes sync here automatically.",
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
    full_name_label: "Full name",
    phone_label: "Phone",
    register_title: "Create account",
    register_sub: "Start free — your restaurant and demo menu are created automatically",
    register_submit: "Sign up",
    register_success_note: "You're all set. Sign in below.",
    register_have_account: "Already have an account?",
    orders_closed_hint: "Orders are closed right now (outside opening hours).",
    checkout_title: "Complete order",
    checkout_address_placeholder: "Delivery address",
    checkout_location_btn: "Share my location",
    checkout_location_busy: "Getting location…",
    checkout_geo_prefix: "Location",
    checkout_payment: "Payment",
    checkout_cash: "Cash",
    checkout_card: "Card",
    checkout_send: "Send via WhatsApp",
    checkout_address_required: "Enter an address or share your location",
    checkout_cancel: "Close",
    demo_login: "Demo: demo / demo123 (nümunə menyusu)"
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
    landing_sales_title: "Создайте цифровое QR-меню для ресторана",
    landing_sales_sub:
      "Гости открывают меню за секунду. WhatsApp, 50+ шаблонов, мобильная вёрстка.",
    landing_cta_free: "Начать бесплатно",
    landing_cta_demo: "Демо",
    landing_feat4_t: "50+ шаблонов",
    landing_feat4_d: "Разные макеты, цвета и шрифты.",
    landing_how_title: "Как это работает",
    landing_how_1: "Регистрация",
    landing_how_2: "Меню и фото",
    landing_how_3: "QR на столах",
    landing_plans_title: "Тарифы",
    landing_buy: "Оформить",
    landing_demo_title: "Живое демо",
    landing_footer_contact: "Контакты",
    landing_sticky: "Начать",
    landing_plans_sub: "Тарифы из панели Super Admin — обновляются автоматически.",
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
    full_name_label: "ФИО",
    phone_label: "Телефон",
    register_title: "Регистрация",
    register_sub: "Бесплатно — ресторан и демо-меню создаются автоматически",
    register_submit: "Зарегистрироваться",
    register_success_note: "Готово. Войдите ниже.",
    register_have_account: "Уже есть аккаунт?",
    orders_closed_hint: "Сейчас заказы не принимаются (не рабочее время).",
    checkout_title: "Оформить заказ",
    checkout_address_placeholder: "Адрес",
    checkout_location_btn: "Отправить геолокацию",
    checkout_location_busy: "Определение…",
    checkout_geo_prefix: "Локация",
    checkout_payment: "Оплата",
    checkout_cash: "Наличные",
    checkout_card: "Карта",
    checkout_send: "Отправить в WhatsApp",
    checkout_address_required: "Укажите адрес или геолокацию",
    checkout_cancel: "Закрыть",
    demo_login: "Демо: demo / demo123 (пример меню)"
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
    landing_sales_title: "Restoranınız için dijital QR menü oluşturun",
    landing_sales_sub:
      "Misafirler menüyü bir saniyede açar. WhatsApp, 50+ şablon, mobil uyum.",
    landing_cta_free: "Ücretsiz başla",
    landing_cta_demo: "Demoyu gör",
    landing_feat4_t: "50+ şablon",
    landing_feat4_d: "Farklı yerleşim ve renk paletleri.",
    landing_how_title: "Nasıl çalışır?",
    landing_how_1: "Kayıt",
    landing_how_2: "Menü ve fotoğraf",
    landing_how_3: "QR paylaş",
    landing_plans_title: "Planlar",
    landing_buy: "Satın al",
    landing_demo_title: "Canlı demo",
    landing_footer_contact: "İletişim",
    landing_sticky: "Başla",
    landing_plans_sub: "Super Admin panelinden yönetilir — değişiklikler otomatik senkron.",
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
    full_name_label: "Ad soyad",
    phone_label: "Telefon",
    register_title: "Hesap oluştur",
    register_sub: "Ücretsiz başlayın — restoran ve demo menü otomatik oluşturulur",
    register_submit: "Kayıt ol",
    register_success_note: "Hesabınız hazır. Aşağıdan giriş yapın.",
    register_have_account: "Zaten hesabınız var mı?",
    orders_closed_hint: "Şu an sipariş alınmıyor (çalışma saatleri dışında).",
    checkout_title: "Siparişi tamamla",
    checkout_address_placeholder: "Adres yazın",
    checkout_location_btn: "Konumumu gönder",
    checkout_location_busy: "Konum alınıyor…",
    checkout_geo_prefix: "Konum",
    checkout_payment: "Ödeme",
    checkout_cash: "Nakit",
    checkout_card: "Kart",
    checkout_send: "WhatsApp ile gönder",
    checkout_address_required: "Adres yazın veya konum seçin",
    checkout_cancel: "Kapat",
    demo_login: "Demo: demo / demo123 (nümunə menyusu)"
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
  const [plans, setPlans] = useState<
    Array<{
      id: number;
      name: string;
      slug: string;
      price_monthly: string | number;
      price_yearly: string | number;
      max_products: number;
      max_categories: number;
      max_templates: number;
      whatsapp_order_enabled: number | boolean;
      reservation_enabled: number | boolean;
      analytics_enabled: number | boolean;
      premium_templates_enabled: number | boolean;
    }>
  >([]);

  useEffect(() => {
    fetch("/api/public/settings")
      .then((r) => r.json())
      .then((s: { default_language?: string }) => {
        if (s.default_language) setLang(s.default_language);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/public/plans")
      .then((r) => r.json())
      .then((rows) => setPlans(Array.isArray(rows) ? rows : []))
      .catch(() => setPlans([]));
  }, []);

  const t = (key: string) => bundle[lang]?.[key] || key;

  const feats = [
    { titleKey: "landing_feat2_t", descKey: "landing_feat2_d", icon: QrCode },
    { titleKey: "landing_feat1_t", descKey: "landing_feat1_d", icon: Smartphone },
    { titleKey: "landing_feat4_t", descKey: "landing_feat4_d", icon: Layers },
    { titleKey: "landing_feat3_t", descKey: "landing_feat3_d", icon: MessageSquare },
  ] as const;

  const lim = (n: number) => (n < 0 ? "∞" : String(n));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/80 to-slate-950 text-white overflow-x-hidden pb-24">
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
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-24">
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
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6"
          >
            {t("landing_sales_title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="text-base sm:text-lg md:text-xl text-red-100/90 mb-10 max-w-2xl mx-auto"
          >
            {t("landing_sales_sub")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center"
          >
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-red-900 px-6 py-3.5 rounded-xl text-base font-bold shadow-xl hover:shadow-red-500/20 active:scale-[0.98] transition-transform"
            >
              {t("landing_cta_free")} <ArrowRight size={20} />
            </Link>
            <a
              href={`/r/${DEMO_MENU_PREVIEW_SLUG}?preview=true&previewTemplate=modern-01`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-white/25 px-6 py-3.5 rounded-xl font-medium hover:bg-white/10 transition-colors"
            >
              <Globe size={20} /> {t("landing_cta_demo")}
            </a>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
          className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
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

        <section className="mt-20 sm:mt-28">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">{t("landing_demo_title")}</h2>
          <p className="text-center text-red-100/80 text-sm mb-6 max-w-xl mx-auto">
            {t("landing_cta_demo")} — login tələb olunmur.
          </p>
          <div className="relative rounded-2xl border border-white/15 overflow-hidden bg-black/40 shadow-2xl max-w-4xl mx-auto aspect-[10/16] sm:aspect-[16/10] md:h-[min(70vh,520px)] md:aspect-auto">
            <iframe
              title="Demo menu"
              src={`/r/${DEMO_MENU_PREVIEW_SLUG}?preview=true&previewTemplate=modern-01`}
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        </section>

        <section className="mt-20 sm:mt-28 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">{t("landing_how_title")}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { n: "1", text: t("landing_how_1") },
              { n: "2", text: t("landing_how_2") },
              { n: "3", text: t("landing_how_3") },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
              >
                <div className="flex justify-center mb-3">
                  <span className="w-12 h-12 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-lg">
                    {s.n}
                  </span>
                </div>
                <p className="text-sm text-red-100/90">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20 sm:mt-28">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">{t("landing_plans_title")}</h2>
          <p className="text-center text-red-100/70 text-sm mb-10 max-w-2xl mx-auto">
            {t("landing_plans_sub")}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => (
              <Card
                key={p.id}
                className="p-6 sm:p-8 bg-white/5 border-white/10 backdrop-blur-md hover:border-red-400/30 transition-colors flex flex-col"
              >
                <h3 className="text-xl font-bold text-white mb-1">{p.name}</h3>
                <p className="text-3xl font-extrabold text-red-300 mb-4">
                  ₼{Number(p.price_monthly).toFixed(0)}
                  <span className="text-sm font-normal text-red-100/60"> / ay</span>
                </p>
                <ul className="text-sm text-red-100/85 space-y-2 mb-4 flex-1">
                  <li>
                    ✓ {t("products")}: {lim(Number(p.max_products))}
                  </li>
                  <li>
                    ✓ {t("categories")}: {lim(Number(p.max_categories))}
                  </li>
                  <li>
                    ✓ Şablonlar: {lim(Number(p.max_templates))}
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleCheck
                      size={16}
                      className={p.whatsapp_order_enabled ? "text-green-400" : "text-white/30"}
                    />{" "}
                    WhatsApp
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleCheck
                      size={16}
                      className={p.reservation_enabled ? "text-green-400" : "text-white/30"}
                    />{" "}
                    Rezervasiya
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleCheck
                      size={16}
                      className={p.analytics_enabled ? "text-green-400" : "text-white/30"}
                    />{" "}
                    Statistikalar
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleCheck
                      size={16}
                      className={p.premium_templates_enabled ? "text-green-400" : "text-white/30"}
                    />{" "}
                    Premium şablonlar
                  </li>
                </ul>
                <Link
                  to="/register"
                  className="mt-auto inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold text-sm"
                >
                  <ShoppingBag size={18} /> {t("landing_buy")}
                </Link>
              </Card>
            ))}
          </div>
        </section>

        <footer className="mt-24 pt-10 border-t border-white/10 text-center text-sm text-red-100/70">
          <p className="font-semibold text-white mb-2">{t("landing_footer_contact")}</p>
          <p>QRMenu · {t("landing_nav_start")}</p>
        </footer>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-red-100/90 hidden sm:inline line-clamp-1">{t("landing_sales_title")}</span>
          <Link
            to="/register"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold"
          >
            {t("landing_sticky")} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

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
      navigate("/panel", {
        replace: true,
        state: { registered: true, username: String(username).trim().toLowerCase() },
      });
    } catch {
      setError(t("server_error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-red-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="p-6 sm:p-8 border border-white/10 bg-white/95 backdrop-blur shadow-2xl">
          <div className="flex items-center gap-2 text-red-600 font-bold text-xl mb-2 justify-center">
            <Store /> {t("register_title")}
          </div>
          <p className="text-center text-gray-500 text-sm mb-6">{t("register_sub")}</p>
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
      </motion.div>
    </div>
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
          {regState?.registered ? (
            <p className="text-xs text-center text-green-800 bg-green-50 rounded-lg p-2 mb-4">{t("register_success_note")}</p>
          ) : null}
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
  const [newProd, setNewProd] = useState({
    name: "",
    price: 0,
    category_id: 0,
    description: "",
    image_url: "",
  });
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
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: authAnyStaffHeaders(),
      body: JSON.stringify({ ...newProd, restaurant_id: Number(id) })
    });
    if (res.ok) {
      const data = await res.json();
      setProducts([...products, data]);
      setNewProd({ name: "", price: 0, category_id: 0, description: "", image_url: "" });
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
            <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Logo (profil şəkli)</p>
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
                <p className="text-xs text-gray-500 mb-1">Cover (yuxarı fon şəkli)</p>
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
                  <p className="text-xs text-gray-500 mb-1">{t("description")} — şəkil</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {newProd.image_url ? (
                      <img src={newProd.image_url} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                    ) : null}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="text-xs"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const url = await uploadAsset(f);
                        if (url) setNewProd((p) => ({ ...p, image_url: url }));
                        e.target.value = "";
                      }}
                    />
                    <input
                      className="flex-1 min-w-[180px] p-2 border rounded-lg text-xs font-mono"
                      placeholder="image URL"
                      value={newProd.image_url}
                      onChange={(e) => setNewProd({ ...newProd, image_url: e.target.value })}
                    />
                  </div>
                </div>
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
  const [cart, setCart] = useState<CartLine[]>([]);
  const [currentLang, setCurrentLang] = useState("az");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [addressText, setAddressText] = useState("");
  const [geoUrl, setGeoUrl] = useState("");
  const [payment, setPayment] = useState<"cash" | "card">("cash");
  const [geoBusy, setGeoBusy] = useState(false);
  const [checkoutErr, setCheckoutErr] = useState("");

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
      "Salam, sifariş:",
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
          <Route path="/admin-login-page" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
