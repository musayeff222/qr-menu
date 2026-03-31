import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Utensils, 
  QrCode, 
  Settings, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Menu as MenuIcon,
  X,
  ShoppingCart,
  MessageSquare,
  Globe,
  Palette,
  BarChart3,
  Users,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
    translations: "Tərcümələr"
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
    translations: "Translations"
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
    translations: "Переводы"
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
    translations: "Çeviriler"
  }
};

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
}

interface Category {
  id: number;
  restaurant_id: number;
  name: string;
  sort_order: number;
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

const LandingPage = () => (
  <div className="min-h-screen bg-white">
    <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
      <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
        <Utensils /> QRMenu
      </div>
      <div className="flex gap-4">
        <Link to="/admin" className="text-gray-600 hover:text-black">Super Admin</Link>
        <Link to="/restaurant/1" className="bg-red-600 text-white px-4 py-2 rounded-lg">Get Started</Link>
      </div>
    </nav>
    
    <main className="max-w-7xl mx-auto px-6 py-20 text-center">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl font-extrabold tracking-tight mb-6"
      >
        Your Restaurant Menu, <span className="text-red-600">Digitalized.</span>
      </motion.h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
        Create a beautiful digital menu for your restaurant in minutes. 
        Generate QR codes, manage categories, and receive orders via WhatsApp.
      </p>
      <div className="flex justify-center gap-4">
        <Link to="/restaurant/1" className="bg-black text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl">
          Create Your Menu
        </Link>
      </div>
      
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Fast Setup", desc: "One click to create your restaurant and menu.", icon: <Plus /> },
          { title: "QR Generation", desc: "Auto-generated QR codes for every table.", icon: <QrCode /> },
          { title: "WhatsApp Orders", desc: "Receive orders directly on your phone.", icon: <MessageSquare /> }
        ].map((feat, i) => (
          <Card key={i} className="p-8 text-left hover:border-red-200 transition-colors">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-4">
              {feat.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
            <p className="text-gray-600">{feat.desc}</p>
          </Card>
        ))}
      </div>
    </main>
  </div>
);

const AdminLoginPage = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      onLogin(data.user);
      localStorage.setItem("adminUser", JSON.stringify(data.user));
    } else {
      setError(data.error);
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" className="w-full bg-red-600 text-white py-3 text-lg">Login</Button>
        </form>
      </Card>
    </div>
  );
};

const SuperAdminSettings = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState("az");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.default_language) setCurrentLang(data.default_language);
        setLoading(false);
      });
  }, []);

  const t = (key: string) => UI_TRANSLATIONS[currentLang]?.[key] || key;

  const saveSettings = async (newSettings: any) => {
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

const SuperAdminPanel = () => {
  const [user, setUser] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [stats, setStats] = useState({ totalRestaurants: 0, totalScans: 0 });
  const [newRest, setNewRest] = useState({ name: "", slug: "", whatsapp: "" });
  const [view, setView] = useState<"dashboard" | "settings">("dashboard");
  const [currentLang, setCurrentLang] = useState("az");

  useEffect(() => {
    const savedUser = localStorage.getItem("adminUser");
    if (savedUser) setUser(JSON.parse(savedUser));

    fetch("/api/restaurants").then(res => res.json()).then(setRestaurants);
    fetch("/api/stats").then(res => res.json()).then(setStats);
    
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (data.default_language) setCurrentLang(data.default_language);
      });
  }, []);

  const t = (key: string) => UI_TRANSLATIONS[currentLang]?.[key] || key;

  const handleCreate = async () => {
    const res = await fetch("/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRest.name, slug: newRest.slug, whatsapp_number: newRest.whatsapp })
    });
    if (res.ok) {
      const data = await res.json();
      setRestaurants([...restaurants, data]);
      setNewRest({ name: "", slug: "", whatsapp: "" });
    }
  };

  if (!user) return <AdminLoginPage onLogin={setUser} />;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6">
        <div className="text-xl font-bold text-red-600 mb-10 flex items-center gap-2">
          <ShieldCheck /> Super Admin
        </div>
        <nav className="space-y-2">
          <button 
            onClick={() => setView("dashboard")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors",
              view === "dashboard" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <LayoutDashboard size={20} /> {t("dashboard")}
          </button>
          <button 
            onClick={() => setView("settings")}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors",
              view === "settings" ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Settings size={20} /> {t("settings")}
          </button>
          <div className="flex items-center gap-3 p-3 text-gray-400 hover:bg-gray-50 rounded-lg cursor-not-allowed">
            <Users size={20} /> All Users
          </div>
          <div className="flex items-center gap-3 p-3 text-gray-400 hover:bg-gray-50 rounded-lg cursor-not-allowed">
            <BarChart3 size={20} /> Revenue
          </div>
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <button 
            onClick={() => {
              localStorage.removeItem("adminUser");
              setUser(null);
            }}
            className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium transition-colors"
          >
            <X size={20} /> {t("logout")}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        {view === "settings" ? (
          <SuperAdminSettings />
        ) : (
          <>
            <header className="flex justify-between items-center mb-10">
              <h1 className="text-3xl font-bold">Dashboard Overview</h1>
              <div className="flex gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <Utensils size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Restaurants</p>
                    <p className="text-xl font-bold">{stats.totalRestaurants}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Scans</p>
                    <p className="text-xl font-bold">{stats.totalScans}</p>
                  </div>
                </div>
              </div>
            </header>

            <Card className="p-6 mb-10">
              <h2 className="text-xl font-bold mb-6">{t("create_restaurant")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input 
                  placeholder={t("name")} 
                  className="p-3 border rounded-lg"
                  value={newRest.name}
                  onChange={e => setNewRest({ ...newRest, name: e.target.value })}
                />
                <input 
                  placeholder={t("slug")} 
                  className="p-3 border rounded-lg"
                  value={newRest.slug}
                  onChange={e => setNewRest({ ...newRest, slug: e.target.value })}
                />
                <input 
                  placeholder={t("whatsapp")} 
                  className="p-3 border rounded-lg"
                  value={newRest.whatsapp}
                  onChange={e => setNewRest({ ...newRest, whatsapp: e.target.value })}
                />
                <Button onClick={handleCreate} className="bg-red-600 text-white">{t("create")}</Button>
              </div>
            </Card>

            <Card>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold">{t("restaurants")}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                      <th className="p-4">{t("name")}</th>
                      <th className="p-4">{t("slug")}</th>
                      <th className="p-4">Plan</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {restaurants.map(rest => (
                      <tr key={rest.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium">{rest.name}</td>
                        <td className="p-4 text-gray-500">/r/{rest.slug}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold uppercase">
                            {rest.plan}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-bold uppercase">
                            Active
                          </span>
                        </td>
                        <td className="p-4 flex gap-2">
                          <Link to={`/restaurant/${rest.id}`} className="text-blue-600 hover:underline">{t("manage")}</Link>
                          <button className="text-red-600 hover:underline">{t("block")}</button>
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
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newCat, setNewCat] = useState("");
  const [newProd, setNewProd] = useState({ name: "", price: 0, category_id: 0, description: "" });
  const [qrCode, setQrCode] = useState("");
  const [editingTranslations, setEditingTranslations] = useState<{ type: 'category' | 'product', id: number, data: any } | null>(null);
  const [currentLang, setCurrentLang] = useState("az");

  useEffect(() => {
    fetch(`/api/admin/restaurants/${id}/menu`).then(res => res.json()).then(data => {
      setCategories(data.categories);
      setProducts(data.products);
    });
    
    fetch("/api/restaurants").then(res => res.json()).then(data => {
      const rest = data.find((r: any) => r.id === Number(id)) || data[0];
      setRestaurant(rest);
      
      const menuUrl = `${window.location.origin}/r/${rest.slug}`;
      fetch(`/api/qrcode?url=${encodeURIComponent(menuUrl)}`)
        .then(res => res.json())
        .then(data => setQrCode(data.qrDataUrl));
    });
  }, [id]);

  const t = (key: string) => UI_TRANSLATIONS[currentLang]?.[key] || key;

  const addCategory = async () => {
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurant_id: id, name: newCat })
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newProd, restaurant_id: id })
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
      headers: { "Content-Type": "application/json" },
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

  if (!restaurant) return <div className="p-10">{t("loading")}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 p-6">
        <div className="text-xl font-bold text-red-600 mb-10 flex items-center gap-2">
          <Utensils /> {restaurant.name}
        </div>
        <nav className="space-y-2">
          <button className="w-full flex items-center gap-3 p-3 bg-red-50 text-red-600 rounded-lg font-medium">
            <LayoutDashboard size={20} /> {t("dashboard")}
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <MenuIcon size={20} /> {t("products")}
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <QrCode size={20} /> QR Codes
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Palette size={20} /> Themes
          </button>
          <button className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Settings size={20} /> {t("settings")}
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <div className="flex items-center gap-4">
            <select 
              className="p-2 border rounded-lg bg-white"
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
              className="flex items-center gap-2 text-red-600 font-bold hover:underline"
            >
              <Globe size={18} /> {t("view_live")}
            </a>
          </div>
        </header>

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
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [currentLang, setCurrentLang] = useState("az");

  useEffect(() => {
    fetch(`/api/restaurants/${slug}`).then(res => res.json()).then(res => {
      setData(res);
      if (res.categories.length > 0) setActiveCategory(res.categories[0].id);
    });
  }, [slug]);

  const t = (key: string) => UI_TRANSLATIONS[currentLang]?.[key] || key;

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
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<SuperAdminPanel />} />
        <Route path="/restaurant/:id" element={<RestaurantPanel />} />
        <Route path="/r/:slug" element={<CustomerMenu />} />
      </Routes>
    </Router>
  );
}
