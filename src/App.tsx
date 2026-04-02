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
    whatsapp: "WhatsApp NГ¶mrЙ™si",
    create: "Yarat",
    manage: "Д°darЙ™ et",
    block: "Blokla",
    logout: "Г‡Д±xД±Еџ",
    categories: "Kateqoriyalar",
    products: "MЙ™hsullar",
    add_category: "Kateqoriya ЖЏlavЙ™ Et",
    add_product: "MЙ™hsul ЖЏlavЙ™ Et",
    price: "QiymЙ™t",
    description: "TЙ™svir",
    save: "Yadda saxla",
    language: "Dil",
    default_language: "ЖЏsas Dil",
    supported_languages: "DЙ™stЙ™klЙ™nЙ™n DillЙ™r",
    view_live: "CanlД± Menyuya Bax",
    scan_order_enjoy: "Skan et, SifariЕџ et, ZГ¶vq al!",
    items_in_cart: "MЙ™hsul sЙ™bЙ™tdЙ™",
    order_via_whatsapp: "WhatsApp ilЙ™ sifariЕџ et",
    total: "CЙ™mi",
    loading: "YГјklЙ™nir...",
    select_category: "Kateqoriya seГ§in",
    translations: "TЙ™rcГјmЙ™lЙ™r",
    login: "Daxil ol",
    username: "Д°stifadЙ™Г§i adД±",
    password: "ЕћifrЙ™",
    landing_nav_admin: "Super Admin",
    landing_nav_start: "BaЕџla",
    landing_hero_1: "Restoran menyunuz,",
    landing_hero_2: "rЙ™qЙ™msal.",
    landing_hero_sub: "DЙ™qiqЙ™lЙ™r iГ§indЙ™ gГ¶zЙ™l digital menyu yaradД±n. QR kodlar, kateqoriyalar vЙ™ WhatsApp sifariЕџi.",
    landing_cta: "Menyu yarat",
    landing_feat1_t: "SГјrЙ™tli quraЕџdД±rma",
    landing_feat1_d: "Bir kliklЙ™ restoran vЙ™ menyu.",
    landing_feat2_t: "QR kod",
    landing_feat2_d: "Avtomatik QR kodlar.",
    landing_feat3_t: "WhatsApp",
    landing_feat3_d: "BirbaЕџa telefonunuza sifariЕџ.",
    landing_sales_title: "RestoranД±nД±z ГјГ§Гјn RЙ™qЙ™msal QR Menu yaradД±n",
    landing_sales_sub:
      "QR kod ilЙ™ qonaqlar menyuya bir saniyЙ™dЙ™ daxil olsun. WhatsApp sifariЕџ, 50-dЙ™n Г§ox Еџablon, tam mobil uyДџunluq.",
    landing_cta_free: "Pulsuz baЕџla",
    landing_cta_demo: "Demo bax",
    landing_feat4_t: "50+ fЙ™rqli Еџablon",
    landing_feat4_d: "HЙ™r Еџablon fЙ™rqli layout, rЙ™ng vЙ™ fontlarla.",
    landing_how_title: "NecЙ™ iЕџlЙ™yir?",
    landing_how_1: "Qeydiyyat вЂ” hesab yaradД±n",
    landing_how_2: "Menu вЂ” mЙ™hsul vЙ™ ЕџЙ™kil Й™lavЙ™ edin",
    landing_how_3: "QR вЂ” masada paylaЕџД±n",
    landing_plans_title: "TariflЙ™r",
    landing_buy: "SatД±n al",
    landing_demo_title: "CanlД± demo menyusu",
    landing_footer_contact: "ЖЏlaqЙ™",
    landing_sticky: "BaЕџla",
    landing_plans_sub: "Super Admin panelindЙ™n idarЙ™ olunur вЂ” dЙ™yiЕџikliklЙ™r avtomatik burada gГ¶rГјnГјr.",
    server_health: "Server vЙ™ baza",
    server_online: "QoЕџulub",
    server_error: "XЙ™ta",
    db_driver: "NГ¶v",
    response_ms: "ms",
    rest_login_title: "Restoran giriЕџi",
    rest_login_sub: "Menyunuzu idarЙ™ etmЙ™k ГјГ§Гјn daxil olun",
    restaurant_staff_login: "Restoran paneli",
    admin_acc_user: "Restoran admin login",
    admin_acc_pass: "Restoran ЕџifrЙ™",
    staff_note: "HЙ™r restoran Г¶z menyusuna bu hesabla girir",
    staff_username_col: "Restoran login",
    reset_staff_short: "GiriЕџi yenilЙ™",
    your_link: "Д°ctimai link",
    slug_label: "URL (slug)",
    save_profile: "Yadda saxla",
    super_dashboard: "Д°darЙ™ paneli",
    full_name_label: "Ad soyad",
    phone_label: "Telefon nГ¶mrЙ™si",
    register_title: "Hesab yaradД±n",
    register_sub: "Pulsuz baЕџlayД±n вЂ” restoran vЙ™ demo menyu avtomatik yaradД±lД±r",
    register_submit: "Qeydiyyat",
    register_success_note: "Hesab hazД±rdД±r. AЕџaДџД±dan daxil olun.",
    register_have_account: "ArtД±q hesabД±nД±z var?",
    orders_closed_hint: "Hal-hazД±rda sifariЕџ qЙ™bul edilmir (iЕџ saatlarД±).",
    checkout_title: "SifariЕџi tamamla",
    checkout_address_placeholder: "ГњnvanД± yazД±n",
    checkout_location_btn: "Konumumu gГ¶ndЙ™r",
    checkout_location_busy: "Konum alД±nД±rвЂ¦",
    checkout_geo_prefix: "Konum",
    checkout_payment: "Г–dЙ™niЕџ Гјsulu",
    checkout_cash: "NaДџd",
    checkout_card: "Kart",
    checkout_send: "WhatsApp ilЙ™ gГ¶ndЙ™r",
    checkout_address_required: "Гњnvan yazД±n vЙ™ ya konumu seГ§in",
    checkout_cancel: "BaДџla",
    nav_menu: "Menyu",
    nav_map: "XЙ™ritЙ™",
    nav_order: "SifariЕџ",
    nav_cart: "SЙ™bЙ™t",
    cart_back_menu: "Menyuya qayД±t",
    cart_screen_title: "SЙ™bЙ™t",
    cart_note_placeholder: "Qeyd (istЙ™sЙ™n yaz)",
    cart_remove_line: "Sil",
    cart_open_full: "Tam sЙ™bЙ™tЙ™ keГ§",
    register_sub_profile:
      "Profil adД±nД±zД± yazД±n (restoran adД± deyil). Restoran mЙ™lumatlarД±nД± sonradan tЙ™kmillЙ™ЕџdirЙ™ bilЙ™rsiniz.",
    register_success_title: "HesabД±nД±z uДџurla yaradД±ldД±",
    btn_prepare_menu: "Menyu hazД±rla",
    btn_continue: "Davam et",
    onboarding_title: "QoЕџulma",
    onboarding_skip: "Sonra",
    onboarding_step1_title: "Restoran mЙ™lumatlarД±",
    onboarding_step1_sub: "QonaqlarД±nД±zД±n gГ¶rmЙ™li olduДџu Й™sas mЙ™lumatlar.",
    restaurant_name_label: "Restoran adД±",
    onboarding_location: "Konum",
    maps_url_placeholder: "Google Maps linki",
    onboarding_next: "NГ¶vbЙ™ti",
    onboarding_back: "Geri",
    onboarding_step2_title: "Menyu linkiniz",
    onboarding_step2_sub: "Qonaqlar bu Гјnvanla menyunuza daxil olacaq.",
    onboarding_link_example_prefix: "NГјmunЙ™: ",
    onboarding_step3_title: "Ећablon seГ§imi",
    onboarding_finish: "Bitir",
    panel_plan: "Plan vЙ™ limitlЙ™r",
    plan_active_label: "Aktiv plan",
    plan_limits_title: "LimitlЙ™r",
    plan_max_products: "MЙ™hsul",
    plan_max_categories: "Kateqoriya",
    plan_max_templates: "Ећablon",
    plan_upgrade_btn: "PlanД± yГјksЙ™lt",
    plan_processing_badge: "Д°cradadД±r",
    plan_upgrade_modal_title: "Plan seГ§in",
    plan_request_submit: "SorДџu gГ¶ndЙ™r",
    plan_request_ok_title: "SorДџunuz uДџurla gГ¶ndЙ™rildi",
    plan_request_ok_body:
      "ЖЏn qД±sa zamanda WhatsApp ГјzЙ™rindЙ™n sizinlЙ™ Й™laqЙ™ saxlanД±lacaq.",
    plan_back_panel: "PanelЙ™ qayД±t",
    panel_qr_title: "QR kodunuz",
    panel_qr_scan_hint: "Menyuya baxmaq ГјГ§Гјn skan edin",
    panel_download: "YГјklЙ™",
    panel_copy_link: "Linki kopyala",
    link_copied: "Link kopyalandД±!",
    templates_section_title: "Menyu ЕџablonlarД±",
    templates_section_sub: "Еџablon. CanlД± Г¶nizlЙ™mЙ™ menyunu aГ§Д±r.",
    translation_cancel: "LЙ™Дџv et",
    landing_hero_kicker: "Yeni nЙ™sil restoran tЙ™crГјbЙ™si",
    landing_hero_headline: "Qonaqlar bir skanla menyuda вЂ” sifariЕџ bir toxunuЕџla WhatsApp-da",
    landing_hero_highlight: "KЙ™nardan sifariЕџ вЂ” iГ§Й™ridЙ™n nЙ™zarЙ™t",
    landing_value_line: "Mobil Г¶ncГјllГјklГј В· Г‡oxdilli В· AnД±nda yenilЙ™nЙ™n",
    orders_section_title: "SifariЕџlЙ™r",
    landing_hero_display_sub:
      "KaДџД±z menyunu unudun, mГјЕџtЙ™rilЙ™rinizЙ™ modern tЙ™crГјbЙ™ tЙ™qdim edin",
    landing_meta_title: "QRMenu вЂ” RestoranД±nД±z ГјГ§Гјn rЙ™qЙ™msal QR menyu",
    landing_meta_description:
      "Pulsuz baЕџlayД±n: QR kod, 50+ Еџablon, WhatsApp sifariЕџ, mobil uyДџun menyu vЙ™ asan idarЙ™ paneli.",
    landing_benefits_title: "ГњstГјnlГјklЙ™r",
    landing_benefit_qr_t: "QR ilЙ™ sГјrЙ™tli giriЕџ",
    landing_benefit_qr_d: "Qonaqlar bir skanla menyunu aГ§Д±r вЂ” gГ¶zlЙ™mЙ™ vЙ™ xЙ™ta azalД±r.",
    landing_benefit_mobile_t: "Mobil uyДџun dizayn",
    landing_benefit_mobile_d: "Telefon vЙ™ planЕџet ГјГ§Гјn optimallaЕџdД±rД±lmД±Еџ, sГјrЙ™tli yГјklЙ™nmЙ™.",
    landing_benefit_templates_t: "50+ fЙ™rqli Еџablon",
    landing_benefit_templates_d: "RestoranД±nД±za uyДџun premium gГ¶rГјnГјЕџ вЂ” bir kliklЙ™ dЙ™yiЕџdirin.",
    landing_benefit_wa_t: "WhatsApp sifariЕџ",
    landing_benefit_wa_d: "SifariЕџlЙ™r birbaЕџa sizin nГ¶mrЙ™nizЙ™ dГјЕџГјr.",
    landing_benefit_panel_t: "Asan idarЙ™ paneli",
    landing_benefit_panel_d: "Menyu, qiymЙ™t vЙ™ ЕџЙ™killЙ™ri Г¶zГјnГјz idarЙ™ edin.",
    landing_templates_showcase_title: "Ећablon Г¶nizlЙ™mЙ™",
    landing_templates_showcase_sub: "HazД±r UI gГ¶rГјnГјЕџГј ilЙ™ canlД± nГјmunЙ™yЙ™ baxД±n.",
    landing_preview_live: "CanlД± bax",
    landing_how_short_1: "Qeydiyyat ol",
    landing_how_short_2: "Menyu Й™lavЙ™ et",
    landing_how_short_3: "QR kodu paylaЕџ",
    landing_plan_popular: "ЖЏn populyar",
    landing_final_cta_title: "Д°ndi baЕџla vЙ™ restoranД±nД± rЙ™qЙ™msallaЕџdД±r",
    landing_footer_tagline: "Restoranlar ГјГ§Гјn mГјasir QR menyu platformasД±.",
    landing_footer_legal: "В© 2026 QRMenu. BГјtГјn hГјquqlar qorunur.",
    landing_footer_connect: "ЖЏlaqЙ™",
    landing_footer_explore: "KeЕџf et",
    landing_footer_social: "Bizi izlЙ™yin",
    demo_login: "Demo: demo / demo123 (nГјmunЙ™ menyusu)"
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
    landing_how_1: "Sign up вЂ” create your account",
    landing_how_2: "Menu вЂ” add dishes and photos",
    landing_how_3: "QR вЂ” share at tables",
    landing_plans_title: "Plans",
    landing_buy: "Subscribe",
    landing_demo_title: "Live demo menu",
    landing_footer_contact: "Contact",
    landing_sticky: "Get started",
    landing_plans_sub: "Managed from Super Admin вЂ” changes sync here automatically.",
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
    register_sub: "Start free вЂ” your restaurant and demo menu are created automatically",
    register_submit: "Sign up",
    register_success_note: "You're all set. Sign in below.",
    register_have_account: "Already have an account?",
    orders_closed_hint: "Orders are closed right now (outside opening hours).",
    checkout_title: "Complete order",
    checkout_address_placeholder: "Delivery address",
    checkout_location_btn: "Share my location",
    checkout_location_busy: "Getting locationвЂ¦",
    checkout_geo_prefix: "Location",
    checkout_payment: "Payment",
    checkout_cash: "Cash",
    checkout_card: "Card",
    checkout_send: "Send via WhatsApp",
    checkout_address_required: "Enter an address or share your location",
    checkout_cancel: "Close",
    nav_menu: "Menu",
    nav_map: "Map",
    nav_order: "Order",
    nav_cart: "Cart",
    cart_back_menu: "Back to menu",
    cart_screen_title: "Cart",
    cart_note_placeholder: "Note (optional)",
    cart_remove_line: "Remove",
    cart_open_full: "Open full cart",
    register_sub_profile: "Your profile name (not the restaurant name). You can add restaurant details later.",
    register_success_title: "Account created successfully",
    btn_prepare_menu: "Set up menu",
    btn_continue: "Continue",
    onboarding_title: "Onboarding",
    onboarding_skip: "Later",
    onboarding_step1_title: "Restaurant details",
    onboarding_step1_sub: "Information your guests will see.",
    restaurant_name_label: "Restaurant name",
    onboarding_location: "Location",
    maps_url_placeholder: "Google Maps link",
    onboarding_next: "Next",
    onboarding_back: "Back",
    onboarding_step2_title: "Your menu link",
    onboarding_step2_sub: "Guests will open your menu at this URL.",
    onboarding_link_example_prefix: "Example: ",
    onboarding_step3_title: "Choose a template",
    onboarding_finish: "Finish",
    panel_plan: "Plan & limits",
    plan_active_label: "Current plan",
    plan_limits_title: "Limits",
    plan_max_products: "Products",
    plan_max_categories: "Categories",
    plan_max_templates: "Templates",
    plan_upgrade_btn: "Upgrade plan",
    plan_processing_badge: "In progress",
    plan_upgrade_modal_title: "Choose a plan",
    plan_request_submit: "Send request",
    plan_request_ok_title: "Request sent",
    plan_request_ok_body: "We will contact you shortly via WhatsApp.",
    plan_back_panel: "Back to panel",
    panel_qr_title: "Your QR code",
    panel_qr_scan_hint: "Scan to open your menu",
    panel_download: "Download",
    panel_copy_link: "Copy link",
    link_copied: "Link copied!",
    templates_section_title: "Menu templates",
    templates_section_sub: "templates. Live preview opens your menu.",
    translation_cancel: "Cancel",
    landing_hero_kicker: "The modern restaurant stack",
    landing_hero_headline: "Guests scan once вЂ” orders land in WhatsApp",
    landing_hero_highlight: "sales-driven",
    landing_value_line: "Mobile-first В· Multilingual В· Always up to date",
    orders_section_title: "Orders",
    landing_hero_display_sub:
      "Ditch paper menus вЂ” give guests a modern experience.",
    landing_meta_title: "QRMenu вЂ” Digital QR menus for restaurants",
    landing_meta_description:
      "Start free: QR codes, 50+ templates, WhatsApp ordering, mobile-first menus, easy dashboard.",
    landing_benefits_title: "Why QRMenu",
    landing_benefit_qr_t: "Instant access with QR",
    landing_benefit_qr_d: "Guests open your menu in one scan вЂ” less waiting, fewer errors.",
    landing_benefit_mobile_t: "Mobile-first design",
    landing_benefit_mobile_d: "Optimized for phones and tablets, fast loading.",
    landing_benefit_templates_t: "50+ unique templates",
    landing_benefit_templates_d: "Premium look & feel вЂ” switch designs in one click.",
    landing_benefit_wa_t: "WhatsApp ordering",
    landing_benefit_wa_d: "Orders go straight to your number.",
    landing_benefit_panel_t: "Easy admin panel",
    landing_benefit_panel_d: "Manage items, prices, and photos yourself.",
    landing_templates_showcase_title: "Template previews",
    landing_templates_showcase_sub: "See real menu UI before you publish.",
    landing_preview_live: "Live preview",
    landing_how_short_1: "Sign up",
    landing_how_short_2: "Add your menu",
    landing_how_short_3: "Share your QR",
    landing_plan_popular: "Most popular",
    landing_final_cta_title: "Go digital today",
    landing_footer_tagline: "Modern QR menu platform for restaurants.",
    landing_footer_legal: "В© 2026 QRMenu. All rights reserved.",
    landing_footer_connect: "Contact",
    landing_footer_explore: "Explore",
    landing_footer_social: "Follow us",
    demo_login: "Demo: demo / demo123 (nГјmunЙ™ menyusu)"
  },
  ru: {
    dashboard: "РџР°РЅРµР»СЊ",
    settings: "РќР°СЃС‚СЂРѕР№РєРё",
    restaurants: "Р РµСЃС‚РѕСЂР°РЅС‹",
    create_restaurant: "РЎРѕР·РґР°С‚СЊ РЅРѕРІС‹Р№ СЂРµСЃС‚РѕСЂР°РЅ",
    name: "РРјСЏ",
    slug: "РЎР»Р°Рі",
    whatsapp: "РќРѕРјРµСЂ WhatsApp",
    create: "РЎРѕР·РґР°С‚СЊ",
    manage: "РЈРїСЂР°РІР»СЏС‚СЊ",
    block: "Р‘Р»РѕРєРёСЂРѕРІР°С‚СЊ",
    logout: "Р’С‹Р№С‚Рё",
    categories: "РљР°С‚РµРіРѕСЂРёРё",
    products: "РџСЂРѕРґСѓРєС‚С‹",
    add_category: "Р”РѕР±Р°РІРёС‚СЊ РєР°С‚РµРіРѕСЂРёСЋ",
    add_product: "Р”РѕР±Р°РІРёС‚СЊ РїСЂРѕРґСѓРєС‚",
    price: "Р¦РµРЅР°",
    description: "РћРїРёСЃР°РЅРёРµ",
    save: "РЎРѕС…СЂР°РЅРёС‚СЊ",
    language: "РЇР·С‹Рє",
    default_language: "РЇР·С‹Рє РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ",
    supported_languages: "РџРѕРґРґРµСЂР¶РёРІР°РµРјС‹Рµ СЏР·С‹РєРё",
    view_live: "РџРѕСЃРјРѕС‚СЂРµС‚СЊ РјРµРЅСЋ",
    scan_order_enjoy: "РЎРєР°РЅРёСЂСѓР№, Р—Р°РєР°Р·С‹РІР°Р№, РќР°СЃР»Р°Р¶РґР°Р№СЃСЏ!",
    items_in_cart: "РўРѕРІР°СЂРѕРІ РІ РєРѕСЂР·РёРЅРµ",
    order_via_whatsapp: "Р—Р°РєР°Р·Р°С‚СЊ С‡РµСЂРµР· WhatsApp",
    total: "РС‚РѕРіРѕ",
    loading: "Р—Р°РіСЂСѓР·РєР°...",
    select_category: "Р’С‹Р±РµСЂРёС‚Рµ РєР°С‚РµРіРѕСЂРёСЋ",
    translations: "РџРµСЂРµРІРѕРґС‹",
    login: "Р’РѕР№С‚Рё",
    username: "Р›РѕРіРёРЅ",
    password: "РџР°СЂРѕР»СЊ",
    landing_nav_admin: "РЎСѓРїРµСЂ Р°РґРјРёРЅ",
    landing_nav_start: "РќР°С‡Р°С‚СЊ",
    landing_hero_1: "РњРµРЅСЋ РІР°С€РµРіРѕ СЂРµСЃС‚РѕСЂР°РЅР°,",
    landing_hero_2: "РІ С†РёС„СЂРµ.",
    landing_hero_sub: "РЎРѕР·РґР°Р№С‚Рµ С†РёС„СЂРѕРІРѕРµ РјРµРЅСЋ Р·Р° РјРёРЅСѓС‚С‹. QR-РєРѕРґС‹, РєР°С‚РµРіРѕСЂРёРё Рё Р·Р°РєР°Р·С‹ РІ WhatsApp.",
    landing_cta: "РЎРѕР·РґР°С‚СЊ РјРµРЅСЋ",
    landing_feat1_t: "Р‘С‹СЃС‚СЂС‹Р№ СЃС‚Р°СЂС‚",
    landing_feat1_d: "Р РµСЃС‚РѕСЂР°РЅ Рё РјРµРЅСЋ РІ РѕРґРёРЅ РєР»РёРє.",
    landing_feat2_t: "QR-РєРѕРґС‹",
    landing_feat2_d: "РђРІС‚РѕРјР°С‚РёС‡РµСЃРєРёРµ QR РґР»СЏ СЃС‚РѕР»РѕРІ.",
    landing_feat3_t: "WhatsApp",
    landing_feat3_d: "Р—Р°РєР°Р·С‹ РїСЂСЏРјРѕ РЅР° С‚РµР»РµС„РѕРЅ.",
    landing_sales_title: "РЎРѕР·РґР°Р№С‚Рµ С†РёС„СЂРѕРІРѕРµ QR-РјРµРЅСЋ РґР»СЏ СЂРµСЃС‚РѕСЂР°РЅР°",
    landing_sales_sub:
      "Р“РѕСЃС‚Рё РѕС‚РєСЂС‹РІР°СЋС‚ РјРµРЅСЋ Р·Р° СЃРµРєСѓРЅРґСѓ. WhatsApp, 50+ С€Р°Р±Р»РѕРЅРѕРІ, РјРѕР±РёР»СЊРЅР°СЏ РІС‘СЂСЃС‚РєР°.",
    landing_cta_free: "РќР°С‡Р°С‚СЊ Р±РµСЃРїР»Р°С‚РЅРѕ",
    landing_cta_demo: "Р”РµРјРѕ",
    landing_feat4_t: "50+ С€Р°Р±Р»РѕРЅРѕРІ",
    landing_feat4_d: "Р Р°Р·РЅС‹Рµ РјР°РєРµС‚С‹, С†РІРµС‚Р° Рё С€СЂРёС„С‚С‹.",
    landing_how_title: "РљР°Рє СЌС‚Рѕ СЂР°Р±РѕС‚Р°РµС‚",
    landing_how_1: "Р РµРіРёСЃС‚СЂР°С†РёСЏ",
    landing_how_2: "РњРµРЅСЋ Рё С„РѕС‚Рѕ",
    landing_how_3: "QR РЅР° СЃС‚РѕР»Р°С…",
    landing_plans_title: "РўР°СЂРёС„С‹",
    landing_buy: "РћС„РѕСЂРјРёС‚СЊ",
    landing_demo_title: "Р–РёРІРѕРµ РґРµРјРѕ",
    landing_footer_contact: "РљРѕРЅС‚Р°РєС‚С‹",
    landing_sticky: "РќР°С‡Р°С‚СЊ",
    landing_plans_sub: "РўР°СЂРёС„С‹ РёР· РїР°РЅРµР»Рё Super Admin вЂ” РѕР±РЅРѕРІР»СЏСЋС‚СЃСЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё.",
    server_health: "РЎРµСЂРІРµСЂ Рё Р‘Р”",
    server_online: "РџРѕРґРєР»СЋС‡РµРЅРѕ",
    server_error: "РћС€РёР±РєР°",
    db_driver: "РўРёРї",
    response_ms: "РјСЃ",
    rest_login_title: "Р’С…РѕРґ РґР»СЏ СЂРµСЃС‚РѕСЂР°РЅР°",
    rest_login_sub: "Р’РѕР№РґРёС‚Рµ РґР»СЏ СѓРїСЂР°РІР»РµРЅРёСЏ РјРµРЅСЋ",
    restaurant_staff_login: "РџР°РЅРµР»СЊ СЂРµСЃС‚РѕСЂР°РЅР°",
    admin_acc_user: "Р›РѕРіРёРЅ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°",
    admin_acc_pass: "РџР°СЂРѕР»СЊ Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°",
    staff_note: "РљР°Р¶РґС‹Р№ СЂРµСЃС‚РѕСЂР°РЅ РІС…РѕРґРёС‚ СЃРѕ СЃРІРѕРµР№ СѓС‡С‘С‚РЅРѕР№ Р·Р°РїРёСЃСЊСЋ",
    staff_username_col: "Р›РѕРіРёРЅ РїРµСЂСЃРѕРЅР°Р»Р°",
    reset_staff_short: "РЎР±СЂРѕСЃРёС‚СЊ РґРѕСЃС‚СѓРї",
    your_link: "РџСѓР±Р»РёС‡РЅР°СЏ СЃСЃС‹Р»РєР°",
    slug_label: "URL (slug)",
    save_profile: "РЎРѕС…СЂР°РЅРёС‚СЊ",
    super_dashboard: "РџР°РЅРµР»СЊ",
    full_name_label: "Р¤РРћ",
    phone_label: "РўРµР»РµС„РѕРЅ",
    register_title: "Р РµРіРёСЃС‚СЂР°С†РёСЏ",
    register_sub: "Р‘РµСЃРїР»Р°С‚РЅРѕ вЂ” СЂРµСЃС‚РѕСЂР°РЅ Рё РґРµРјРѕ-РјРµРЅСЋ СЃРѕР·РґР°СЋС‚СЃСЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё",
    register_submit: "Р—Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°С‚СЊСЃСЏ",
    register_success_note: "Р“РѕС‚РѕРІРѕ. Р’РѕР№РґРёС‚Рµ РЅРёР¶Рµ.",
    register_have_account: "РЈР¶Рµ РµСЃС‚СЊ Р°РєРєР°СѓРЅС‚?",
    orders_closed_hint: "РЎРµР№С‡Р°СЃ Р·Р°РєР°Р·С‹ РЅРµ РїСЂРёРЅРёРјР°СЋС‚СЃСЏ (РЅРµ СЂР°Р±РѕС‡РµРµ РІСЂРµРјСЏ).",
    checkout_title: "РћС„РѕСЂРјРёС‚СЊ Р·Р°РєР°Р·",
    checkout_address_placeholder: "РђРґСЂРµСЃ",
    checkout_location_btn: "РћС‚РїСЂР°РІРёС‚СЊ РіРµРѕР»РѕРєР°С†РёСЋ",
    checkout_location_busy: "РћРїСЂРµРґРµР»РµРЅРёРµвЂ¦",
    checkout_geo_prefix: "Р›РѕРєР°С†РёСЏ",
    checkout_payment: "РћРїР»Р°С‚Р°",
    checkout_cash: "РќР°Р»РёС‡РЅС‹Рµ",
    checkout_card: "РљР°СЂС‚Р°",
    checkout_send: "РћС‚РїСЂР°РІРёС‚СЊ РІ WhatsApp",
    checkout_address_required: "РЈРєР°Р¶РёС‚Рµ Р°РґСЂРµСЃ РёР»Рё РіРµРѕР»РѕРєР°С†РёСЋ",
    checkout_cancel: "Р—Р°РєСЂС‹С‚СЊ",
    nav_menu: "РњРµРЅСЋ",
    nav_map: "РљР°СЂС‚Р°",
    nav_order: "Р—Р°РєР°Р·",
    nav_cart: "РљРѕСЂР·РёРЅР°",
    cart_back_menu: "Рљ РјРµРЅСЋ",
    cart_screen_title: "РљРѕСЂР·РёРЅР°",
    cart_note_placeholder: "РџСЂРёРјРµС‡Р°РЅРёРµ",
    cart_remove_line: "РЈРґР°Р»РёС‚СЊ",
    cart_open_full: "РћС‚РєСЂС‹С‚СЊ РєРѕСЂР·РёРЅСѓ",
    register_sub_profile: "РРјСЏ РїСЂРѕС„РёР»СЏ (РЅРµ РЅР°Р·РІР°РЅРёРµ СЂРµСЃС‚РѕСЂР°РЅР°). Р”Р°РЅРЅС‹Рµ СЂРµСЃС‚РѕСЂР°РЅР° РґРѕР±Р°РІРёС‚Рµ РїРѕР·Р¶Рµ.",
    register_success_title: "РђРєРєР°СѓРЅС‚ СЃРѕР·РґР°РЅ",
    btn_prepare_menu: "РќР°СЃС‚СЂРѕРёС‚СЊ РјРµРЅСЋ",
    btn_continue: "РџСЂРѕРґРѕР»Р¶РёС‚СЊ",
    onboarding_title: "РћРЅР±РѕСЂРґРёРЅРі",
    onboarding_skip: "РџРѕР·Р¶Рµ",
    onboarding_step1_title: "Р”Р°РЅРЅС‹Рµ СЂРµСЃС‚РѕСЂР°РЅР°",
    onboarding_step1_sub: "Р§С‚Рѕ СѓРІРёРґСЏС‚ РіРѕСЃС‚Рё.",
    restaurant_name_label: "РќР°Р·РІР°РЅРёРµ СЂРµСЃС‚РѕСЂР°РЅР°",
    onboarding_location: "Р›РѕРєР°С†РёСЏ",
    maps_url_placeholder: "РЎСЃС‹Р»РєР° Google Maps",
    onboarding_next: "Р”Р°Р»РµРµ",
    onboarding_back: "РќР°Р·Р°Рґ",
    onboarding_step2_title: "РЎСЃС‹Р»РєР° РјРµРЅСЋ",
    onboarding_step2_sub: "Р“РѕСЃС‚Рё РѕС‚РєСЂРѕСЋС‚ РјРµРЅСЋ РїРѕ СЌС‚РѕРјСѓ Р°РґСЂРµСЃСѓ.",
    onboarding_link_example_prefix: "РџСЂРёРјРµСЂ: ",
    onboarding_step3_title: "РЁР°Р±Р»РѕРЅ",
    onboarding_finish: "Р“РѕС‚РѕРІРѕ",
    panel_plan: "РџР»Р°РЅ Рё Р»РёРјРёС‚С‹",
    plan_active_label: "РўРµРєСѓС‰РёР№ РїР»Р°РЅ",
    plan_limits_title: "Р›РёРјРёС‚С‹",
    plan_max_products: "РўРѕРІР°СЂС‹",
    plan_max_categories: "РљР°С‚РµРіРѕСЂРёРё",
    plan_max_templates: "РЁР°Р±Р»РѕРЅС‹",
    plan_upgrade_btn: "РЎРјРµРЅРёС‚СЊ РїР»Р°РЅ",
    plan_processing_badge: "Р’ СЂР°Р±РѕС‚Рµ",
    plan_upgrade_modal_title: "Р’С‹Р±РµСЂРёС‚Рµ РїР»Р°РЅ",
    plan_request_submit: "РћС‚РїСЂР°РІРёС‚СЊ Р·Р°РїСЂРѕСЃ",
    plan_request_ok_title: "Р—Р°РїСЂРѕСЃ РѕС‚РїСЂР°РІР»РµРЅ",
    plan_request_ok_body: "РњС‹ СЃРІСЏР¶РµРјСЃСЏ СЃ РІР°РјРё РІ WhatsApp.",
    plan_back_panel: "Р’ РїР°РЅРµР»СЊ",
    panel_qr_title: "QR-РєРѕРґ",
    panel_qr_scan_hint: "РЎРєР°РЅРёСЂСѓР№С‚Рµ, С‡С‚РѕР±С‹ РѕС‚РєСЂС‹С‚СЊ РјРµРЅСЋ",
    panel_download: "РЎРєР°С‡Р°С‚СЊ",
    panel_copy_link: "РљРѕРїРёСЂРѕРІР°С‚СЊ СЃСЃС‹Р»РєСѓ",
    link_copied: "РЎРєРѕРїРёСЂРѕРІР°РЅРѕ!",
    templates_section_title: "РЁР°Р±Р»РѕРЅС‹ РјРµРЅСЋ",
    templates_section_sub: "С€Р°Р±Р»РѕРЅРѕРІ. Р–РёРІРѕР№ РїСЂРµРґРїСЂРѕСЃРјРѕС‚СЂ.",
    translation_cancel: "РћС‚РјРµРЅР°",
    landing_hero_kicker: "Р¦РёС„СЂРѕРІРѕРµ РјРµРЅСЋ РґР»СЏ РіРѕСЃС‚РµР№",
    landing_hero_headline: "Р“РѕСЃС‚Рё СЃРєР°РЅРёСЂСѓСЋС‚ РѕРґРёРЅ СЂР°Р· вЂ” Р·Р°РєР°Р·С‹ РІ WhatsApp",
    landing_hero_highlight: "Р‘РѕР»СЊС€Рµ Р·Р°РєР°Р·РѕРІ вЂ” РјРµРЅСЊС€Рµ С…Р°РѕСЃР°",
    landing_value_line: "РњРѕР±РёР»СЊРЅРѕ В· РњСѓР»СЊС‚РёСЏР·С‹С‡РЅРѕ В· Р’СЃРµРіРґР° Р°РєС‚СѓР°Р»СЊРЅРѕ",
    orders_section_title: "Р—Р°РєР°Р·С‹",
    landing_hero_display_sub: "Р—Р°Р±СѓРґСЊС‚Рµ Р±СѓРјР°Р¶РЅРѕРµ РјРµРЅСЋ вЂ” СЃРѕРІСЂРµРјРµРЅРЅС‹Р№ РѕРїС‹С‚ РґР»СЏ РіРѕСЃС‚РµР№.",
    landing_meta_title: "QRMenu вЂ” Р¦РёС„СЂРѕРІРѕРµ QR-РјРµРЅСЋ",
    landing_meta_description:
      "РќР°С‡РЅРёС‚Рµ Р±РµСЃРїР»Р°С‚РЅРѕ: QR, 50+ С€Р°Р±Р»РѕРЅРѕРІ, Р·Р°РєР°Р·С‹ РІ WhatsApp, РјРѕР±РёР»СЊРЅРѕРµ РјРµРЅСЋ.",
    landing_benefits_title: "РџСЂРµРёРјСѓС‰РµСЃС‚РІР°",
    landing_benefit_qr_t: "Р‘С‹СЃС‚СЂС‹Р№ РІС…РѕРґ РїРѕ QR",
    landing_benefit_qr_d: "РњРµРЅСЋ РѕС‚РєСЂС‹РІР°РµС‚СЃСЏ Р·Р° СЃРµРєСѓРЅРґСѓ.",
    landing_benefit_mobile_t: "РњРѕР±РёР»СЊРЅС‹Р№ РґРёР·Р°Р№РЅ",
    landing_benefit_mobile_d: "РћРїС‚РёРјРёР·Р°С†РёСЏ РїРѕРґ СЃРјР°СЂС‚С„РѕРЅС‹.",
    landing_benefit_templates_t: "50+ С€Р°Р±Р»РѕРЅРѕРІ",
    landing_benefit_templates_d: "РњРµРЅСЏР№С‚Рµ СЃС‚РёР»СЊ РѕРґРЅРёРј РєР»РёРєРѕРј.",
    landing_benefit_wa_t: "Р—Р°РєР°Р· РІ WhatsApp",
    landing_benefit_wa_d: "Р—Р°СЏРІРєРё РїСЂСЏРјРѕ РЅР° РІР°С€ РЅРѕРјРµСЂ.",
    landing_benefit_panel_t: "РџСЂРѕСЃС‚Р°СЏ РїР°РЅРµР»СЊ",
    landing_benefit_panel_d: "РЈРїСЂР°РІР»СЏР№С‚Рµ РјРµРЅСЋ СЃР°РјРѕСЃС‚РѕСЏС‚РµР»СЊРЅРѕ.",
    landing_templates_showcase_title: "РЁР°Р±Р»РѕРЅС‹",
    landing_templates_showcase_sub: "Р–РёРІРѕР№ РїСЂРµРґРїСЂРѕСЃРјРѕС‚СЂ РёРЅС‚РµСЂС„РµР№СЃР°.",
    landing_preview_live: "РЎРјРѕС‚СЂРµС‚СЊ",
    landing_how_short_1: "Р РµРіРёСЃС‚СЂР°С†РёСЏ",
    landing_how_short_2: "Р”РѕР±Р°РІСЊС‚Рµ РјРµРЅСЋ",
    landing_how_short_3: "РџРѕРґРµР»РёС‚РµСЃСЊ QR",
    landing_plan_popular: "РџРѕРїСѓР»СЏСЂРЅС‹Р№",
    landing_final_cta_title: "Р¦РёС„СЂРѕРІРёР·РёСЂСѓР№С‚Рµ СЂРµСЃС‚РѕСЂР°РЅ СЃРµРіРѕРґРЅСЏ",
    landing_footer_tagline: "РЎРѕРІСЂРµРјРµРЅРЅР°СЏ РїР»Р°С‚С„РѕСЂРјР° QR-РјРµРЅСЋ.",
    landing_footer_legal: "В© 2026 QRMenu",
    landing_footer_connect: "РљРѕРЅС‚Р°РєС‚С‹",
    landing_footer_explore: "Р Р°Р·РґРµР»С‹",
    landing_footer_social: "РЎРѕС†СЃРµС‚Рё",
    demo_login: "Р”РµРјРѕ: demo / demo123 (РїСЂРёРјРµСЂ РјРµРЅСЋ)"
  },
  tr: {
    dashboard: "Panel",
    settings: "Ayarlar",
    restaurants: "Restoranlar",
    create_restaurant: "Yeni Restoran OluЕџtur",
    name: "Ad",
    slug: "Slug",
    whatsapp: "WhatsApp NumarasД±",
    create: "OluЕџtur",
    manage: "YГ¶net",
    block: "Engelle",
    logout: "Г‡Д±kД±Еџ",
    categories: "Kategoriler",
    products: "ГњrГјnler",
    add_category: "Kategori Ekle",
    add_product: "ГњrГјn Ekle",
    price: "Fiyat",
    description: "AГ§Д±klama",
    save: "Kaydet",
    language: "Dil",
    default_language: "VarsayД±lan Dil",
    supported_languages: "Desteklenen Diller",
    view_live: "CanlД± MenГјyГј GГ¶rГјntГјle",
    scan_order_enjoy: "Tara, SipariЕџ Ver, Keyfini Г‡Д±kar!",
    items_in_cart: "Sepetteki ГњrГјnler",
    order_via_whatsapp: "WhatsApp ile SipariЕџ Ver",
    total: "Toplam",
    loading: "YГјkleniyor...",
    select_category: "Kategori seГ§in",
    translations: "Г‡eviriler",
    login: "GiriЕџ",
    username: "KullanД±cД± adД±",
    password: "Ећifre",
    landing_nav_admin: "SГјper Admin",
    landing_nav_start: "BaЕџla",
    landing_hero_1: "Restoran menГјnГјz,",
    landing_hero_2: "dijital.",
    landing_hero_sub: "Dakikalar iГ§inde dijital menГј oluЕџturun. QR kodlar, kategoriler ve WhatsApp sipariЕџleri.",
    landing_cta: "MenГј oluЕџtur",
    landing_feat1_t: "HД±zlД± kurulum",
    landing_feat1_d: "Tek tД±kla restoran ve menГј.",
    landing_feat2_t: "QR Гјretimi",
    landing_feat2_d: "Otomatik QR kodlar.",
    landing_feat3_t: "WhatsApp sipariЕџ",
    landing_feat3_d: "SipariЕџler doДџrudan telefona.",
    landing_sales_title: "RestoranД±nД±z iГ§in dijital QR menГј oluЕџturun",
    landing_sales_sub:
      "Misafirler menГјyГј bir saniyede aГ§ar. WhatsApp, 50+ Еџablon, mobil uyum.",
    landing_cta_free: "Гњcretsiz baЕџla",
    landing_cta_demo: "Demoyu gГ¶r",
    landing_feat4_t: "50+ Еџablon",
    landing_feat4_d: "FarklД± yerleЕџim ve renk paletleri.",
    landing_how_title: "NasД±l Г§alД±ЕџД±r?",
    landing_how_1: "KayД±t",
    landing_how_2: "MenГј ve fotoДџraf",
    landing_how_3: "QR paylaЕџ",
    landing_plans_title: "Planlar",
    landing_buy: "SatД±n al",
    landing_demo_title: "CanlД± demo",
    landing_footer_contact: "Д°letiЕџim",
    landing_sticky: "BaЕџla",
    landing_plans_sub: "Super Admin panelinden yГ¶netilir вЂ” deДџiЕџiklikler otomatik senkron.",
    server_health: "Sunucu ve veritabanД±",
    server_online: "BaДџlД±",
    server_error: "Hata",
    db_driver: "SГјrГјcГј",
    response_ms: "ms",
    rest_login_title: "Restoran giriЕџi",
    rest_login_sub: "MenГјnГјzГј yГ¶netmek iГ§in giriЕџ yapД±n",
    restaurant_staff_login: "Restoran paneli",
    admin_acc_user: "Restoran admin kullanД±cД± adД±",
    admin_acc_pass: "Restoran admin Еџifre",
    staff_note: "Her restoran kendi hesabД±yla paneline girer",
    staff_username_col: "Personel giriЕџi",
    reset_staff_short: "EriЕџimi sД±fД±rla",
    your_link: "Genel menГј linki",
    slug_label: "URL (slug)",
    save_profile: "Kaydet",
    super_dashboard: "Panel",
    full_name_label: "Ad soyad",
    phone_label: "Telefon",
    register_title: "Hesap oluЕџtur",
    register_sub: "Гњcretsiz baЕџlayД±n вЂ” restoran ve demo menГј otomatik oluЕџturulur",
    register_submit: "KayД±t ol",
    register_success_note: "HesabД±nД±z hazД±r. AЕџaДџД±dan giriЕџ yapД±n.",
    register_have_account: "Zaten hesabД±nД±z var mД±?",
    orders_closed_hint: "Ећu an sipariЕџ alД±nmД±yor (Г§alД±Еџma saatleri dД±ЕџД±nda).",
    checkout_title: "SipariЕџi tamamla",
    checkout_address_placeholder: "Adres yazД±n",
    checkout_location_btn: "Konumumu gГ¶nder",
    checkout_location_busy: "Konum alД±nД±yorвЂ¦",
    checkout_geo_prefix: "Konum",
    checkout_payment: "Г–deme",
    checkout_cash: "Nakit",
    checkout_card: "Kart",
    checkout_send: "WhatsApp ile gГ¶nder",
    checkout_address_required: "Adres yazД±n veya konum seГ§in",
    checkout_cancel: "Kapat",
    nav_menu: "MenГј",
    nav_map: "Harita",
    nav_order: "SipariЕџ",
    nav_cart: "Sepet",
    cart_back_menu: "MenГјye dГ¶n",
    cart_screen_title: "Sepet",
    cart_note_placeholder: "Not",
    cart_remove_line: "KaldД±r",
    cart_open_full: "Tam sepet",
    register_sub_profile: "Profil adД±nД±z (restoran adД± deДџil). RestoranД± sonra tamamlayД±n.",
    register_success_title: "Hesap oluЕџturuldu",
    btn_prepare_menu: "MenГј kur",
    btn_continue: "Devam",
    onboarding_title: "BaЕџlangД±Г§",
    onboarding_skip: "Sonra",
    onboarding_step1_title: "Restoran bilgileri",
    onboarding_step1_sub: "Misafirlerin gГ¶receДџi temel bilgiler.",
    restaurant_name_label: "Restoran adД±",
    onboarding_location: "Konum",
    maps_url_placeholder: "Google Maps linki",
    onboarding_next: "Д°leri",
    onboarding_back: "Geri",
    onboarding_step2_title: "MenГј baДџlantД±nД±z",
    onboarding_step2_sub: "Misafirler bu URL ile menГјye girer.",
    onboarding_link_example_prefix: "Г–rnek: ",
    onboarding_step3_title: "Ећablon seГ§in",
    onboarding_finish: "Bitir",
    panel_plan: "Plan ve limitler",
    plan_active_label: "Aktif plan",
    plan_limits_title: "Limitler",
    plan_max_products: "ГњrГјn",
    plan_max_categories: "Kategori",
    plan_max_templates: "Ећablon",
    plan_upgrade_btn: "PlanД± yГјkselt",
    plan_processing_badge: "Д°Еџlemde",
    plan_upgrade_modal_title: "Plan seГ§in",
    plan_request_submit: "Talep gГ¶nder",
    plan_request_ok_title: "Talebiniz gГ¶nderildi",
    plan_request_ok_body: "WhatsApp Гјzerinden en kД±sa sГјrede dГ¶nГјЕџ yapД±lacaktД±r.",
    plan_back_panel: "Panele dГ¶n",
    panel_qr_title: "QR kodunuz",
    panel_qr_scan_hint: "MenГјyГј gГ¶rmek iГ§in tarayД±n",
    panel_download: "Д°ndir",
    panel_copy_link: "Linki kopyala",
    link_copied: "KopyalandД±!",
    templates_section_title: "MenГј ЕџablonlarД±",
    templates_section_sub: "Еџablon. CanlД± Г¶nizleme.",
    translation_cancel: "Д°ptal",
    landing_hero_kicker: "Modern restoran deneyimi",
    landing_hero_headline: "Misafirler tek tarama вЂ” sipariЕџ WhatsApp'ta",
    landing_hero_highlight: "Daha Г§ok sipariЕџ В· daha az karmaЕџa",
    landing_value_line: "Mobil Г¶ncelikli В· Г‡ok dilli В· Her zaman gГјncel",
    orders_section_title: "SipariЕџler",
    landing_hero_display_sub: "KaДџД±t menГјyГј unutun вЂ” misafirlerinize modern deneyim sunun.",
    landing_meta_title: "QRMenu вЂ” Dijital QR menГј",
    landing_meta_description:
      "Гњcretsiz baЕџlayД±n: QR, 50+ Еџablon, WhatsApp sipariЕџ, mobil menГј.",
    landing_benefits_title: "Avantajlar",
    landing_benefit_qr_t: "QR ile hД±zlД± giriЕџ",
    landing_benefit_qr_d: "MenГј tek taramada aГ§Д±lД±r.",
    landing_benefit_mobile_t: "Mobil uyumlu",
    landing_benefit_mobile_d: "Telefon iГ§in optimize.",
    landing_benefit_templates_t: "50+ Еџablon",
    landing_benefit_templates_d: "Tek tД±kla gГ¶rГјnГјm deДџiЕџtirin.",
    landing_benefit_wa_t: "WhatsApp sipariЕџ",
    landing_benefit_wa_d: "SipariЕџler numaranД±za gelsin.",
    landing_benefit_panel_t: "Kolay panel",
    landing_benefit_panel_d: "MenГјyГј kendiniz yГ¶netin.",
    landing_templates_showcase_title: "Ећablon Г¶nizleme",
    landing_templates_showcase_sub: "CanlД± arayГјz Г¶nizlemesi.",
    landing_preview_live: "CanlД± bak",
    landing_how_short_1: "KayД±t ol",
    landing_how_short_2: "MenГј ekle",
    landing_how_short_3: "QR paylaЕџ",
    landing_plan_popular: "PopГјler",
    landing_final_cta_title: "RestoranД±nД±zД± dijitalleЕџtirin",
    landing_footer_tagline: "Restoranlar iГ§in modern QR menГј.",
    landing_footer_legal: "В© 2026 QRMenu",
    landing_footer_connect: "Д°letiЕџim",
    landing_footer_explore: "KeЕџfet",
    landing_footer_social: "Sosyal",
    demo_login: "Demo: demo / demo123 (nГјmunЙ™ menyusu)"
  }
};

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
            <div className="text-4xl">вњ“</div>
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
              в†ђ {t("landing_nav_start")}
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-red-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="p-6 sm:p-8 border border-white/10 bg-white/95 backdrop-blur shadow-2xl">
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
              {busy ? "вЂ¦" : t("register_submit")}
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
              в†ђ {t("landing_nav_start")}
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
          <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
            <p>
              <Link to="/register" className="text-red-600 font-medium hover:underline">
                {t("register_title")}
              </Link>
            </p>
            <Link to="/" className="text-red-600 hover:underline">
              в†ђ {t("landing_nav_start")}
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

  const lim = (n: number) => (n < 0 ? "в€ћ" : String(n));

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
      alert((err as { error?: string }).error || "XЙ™ta");
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
    if (!confirm("Kateqoriya vЙ™ mЙ™hsullarД± silinsin?")) return;
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
    if (!confirm("MЙ™hsul silinsin?")) return;
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
          в†ђ Admin
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
              <p className="text-xs text-gray-500">QR skan sayД±</p>
              <p className="text-2xl font-bold text-red-600">{dashStats.scans}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-gray-500">Menyu baxД±ЕџД±</p>
              <p className="text-2xl font-bold">{dashStats.pageViews}</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-gray-500 mb-2">ЖЏn Г§ox baxД±lan mЙ™hsullar</p>
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
              Son sifariЕџlЙ™r (stub вЂ” API hazД±rdД±r).
            </p>
            {orders.length === 0 ? (
              <p className="text-gray-400 text-sm">HЙ™lЙ™ sifariЕџ yoxdur.</p>
            ) : (
              <ul className="text-sm space-y-2">
                {orders.map((o) => (
                  <li key={o.id} className="border rounded-lg p-3">
                    #{o.id} В· {o.status}
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
                              в‚ј{p.price_monthly} / ay В· {t("plan_max_products")}: {lim(p.max_products)}
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
                <p className="text-xs text-gray-500 mb-1">Logo (profil ЕџЙ™kli)</p>
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
                <p className="text-xs text-gray-500 mb-1">Cover (yuxarД± fon ЕџЙ™kli)</p>
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
                            <span className="font-bold text-red-600">в‚ј{Number(prod.price).toFixed(2)}</span>
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
                  <p className="text-xs text-gray-500 mb-1">{t("description")} вЂ” ЕџЙ™kil</p>
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
    document.title = `${data.name} В· ${tpl.name}`;
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
    setMenuView("cart");
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
      const label = line.variantLabel ? `${line.variantLabel} В· ${pn}` : pn;
      const note = line.note?.trim() ? ` вЂ” ${line.note.trim()}` : "";
      return `- ${label}${note} (в‚ј${Number(line.unitPrice).toFixed(2)})`;
    });
    const total = cart.reduce((s, l) => s + Number(l.unitPrice), 0).toFixed(2);
    const text = [
      "Salam, sifariЕџ:",
      "",
      ...lines,
      "",
      `${t("total")}: в‚ј${total}`,
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
                <p className="text-xs text-green-700 mb-4 break-all">вњ“ {geoUrl}</p>
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
          <Route path="/restaurant/:id/onboarding" element={<RestaurantOnboarding />} />
          <Route path="/restaurant/:id/*" element={<RestaurantPanel />} />
          <Route path="/r/:slug" element={<CustomerMenu />} />
          <Route path="/menu/:slug" element={<CustomerMenu />} />
        </Routes>
      </Router>
    </I18nBundleContext.Provider>
  );
}
