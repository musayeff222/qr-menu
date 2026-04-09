/** Public landing / auth marketing copy overrides (stored in settings.landing_cms as JSON). */

export type LandingCmsSections = {
  hero?: boolean;
  benefits?: boolean;
  templates?: boolean;
  howItWorks?: boolean;
  pricing?: boolean;
  finalCta?: boolean;
  footer?: boolean;
  stickyBar?: boolean;
  navRegisterLink?: boolean;
};

/** Keys map to optional overrides; empty string = use i18n. */
export type LandingCmsCopy = Partial<{
  hero_badge: string;
  hero_title: string;
  hero_sub: string;
  cta_primary: string;
  cta_demo: string;
  benefits_title: string;
  benefits_sub: string;
  templates_title: string;
  templates_sub: string;
  how_title: string;
  pricing_title: string;
  pricing_sub: string;
  final_cta_title: string;
  footer_tagline: string;
  meta_title: string;
  meta_description: string;
  sticky_bar: string;
}>;

export type LandingCmsAuth = {
  image_url?: string;
  title?: string;
  subtitle?: string;
};

export type LandingCmsShowcaseSlide = {
  id: string;
  name: string;
  category: string;
  heroImage: string;
};

export type LandingCmsShowcase = {
  slogans?: string[];
  slides?: LandingCmsShowcaseSlide[];
};

export const DEFAULT_HERO_SHOWCASE_SLOGANS: string[] = [
  "Çap xərclərinə son",
  "menu.brendiniz.az ilə prestij",
  "Skan et, seç, WhatsApp-a göndər",
  "Menyu anında yenilənir",
  "Müştəri üçün daha premium təcrübə",
  "Restoranınız üçün müasir təqdimat",
];

export const DEFAULT_HERO_SHOWCASE_SLIDES: LandingCmsShowcaseSlide[] = [
  {
    id: "az-grill",
    name: "Qril Menyusu",
    category: "Azerbaijan Kitchen",
    heroImage:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "az-breakfast",
    name: "Səhər Menyusu",
    category: "Cafe & Breakfast",
    heroImage:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "az-dessert",
    name: "Şirniyyat Menyusu",
    category: "Dessert House",
    heroImage:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "az-fastfood",
    name: "Fast Food Menyusu",
    category: "Street Food",
    heroImage:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "az-steak",
    name: "Steak Menyusu",
    category: "Fine Dining",
    heroImage:
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80&auto=format&fit=crop",
  },
  {
    id: "az-drinks",
    name: "İçki Menyusu",
    category: "Bar & Lounge",
    heroImage:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80&auto=format&fit=crop",
  },
];

export type LandingCms = {
  sections?: LandingCmsSections;
  copy?: LandingCmsCopy;
  auth?: LandingCmsAuth;
  showcase?: LandingCmsShowcase;
};

export const DEFAULT_LANDING_CMS: LandingCms = {
  sections: {},
  copy: {},
  auth: {},
  showcase: {
    slogans: [...DEFAULT_HERO_SHOWCASE_SLOGANS],
    slides: [...DEFAULT_HERO_SHOWCASE_SLIDES],
  },
};

export function parseLandingCms(raw: string | null | undefined): LandingCms {
  if (!raw || !String(raw).trim()) return { ...DEFAULT_LANDING_CMS };
  try {
    const j = JSON.parse(raw) as LandingCms;
    const slogans =
      Array.isArray(j.showcase?.slogans) && j.showcase!.slogans!.length > 0
        ? j.showcase!.slogans!.map((x) => String(x))
        : [...DEFAULT_HERO_SHOWCASE_SLOGANS];
    const slidesRaw =
      Array.isArray(j.showcase?.slides) && j.showcase!.slides!.length > 0
        ? j.showcase!.slides!
        : DEFAULT_HERO_SHOWCASE_SLIDES;
    const slides = slidesRaw.map((s, i) => ({
      id: String((s as LandingCmsShowcaseSlide).id || `slide-${i + 1}`),
      name: String((s as LandingCmsShowcaseSlide).name || `Slide ${i + 1}`),
      category: String((s as LandingCmsShowcaseSlide).category || ""),
      heroImage: String((s as LandingCmsShowcaseSlide).heroImage || ""),
    }));
    return {
      sections: { ...DEFAULT_LANDING_CMS.sections, ...j.sections },
      copy: { ...DEFAULT_LANDING_CMS.copy, ...j.copy },
      auth: { ...DEFAULT_LANDING_CMS.auth, ...j.auth },
      showcase: { slogans, slides },
    };
  } catch {
    return { ...DEFAULT_LANDING_CMS };
  }
}

export function sectionEnabled(cms: LandingCms, key: keyof LandingCmsSections, defaultOn = true): boolean {
  const v = cms.sections?.[key];
  if (v === undefined) return defaultOn;
  return !!v;
}

/** i18n key mapping for copy overrides */
export const CMS_COPY_I18N_KEYS: Record<keyof LandingCmsCopy, string> = {
  hero_badge: "landing_hero_badge",
  hero_title: "landing_sales_title",
  hero_sub: "landing_hero_display_sub",
  cta_primary: "landing_cta_free",
  cta_demo: "landing_cta_demo",
  benefits_title: "landing_benefits_title",
  benefits_sub: "landing_value_line",
  templates_title: "landing_templates_showcase_title",
  templates_sub: "landing_templates_showcase_sub",
  how_title: "landing_how_title",
  pricing_title: "landing_plans_title",
  pricing_sub: "landing_plans_sub",
  final_cta_title: "landing_final_cta_title",
  footer_tagline: "landing_footer_tagline",
  meta_title: "landing_meta_title",
  meta_description: "landing_meta_description",
  sticky_bar: "landing_sticky",
};
