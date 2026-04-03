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

export type LandingCms = {
  sections?: LandingCmsSections;
  copy?: LandingCmsCopy;
  auth?: LandingCmsAuth;
};

export const DEFAULT_LANDING_CMS: LandingCms = {
  sections: {},
  copy: {},
  auth: {},
};

export function parseLandingCms(raw: string | null | undefined): LandingCms {
  if (!raw || !String(raw).trim()) return { ...DEFAULT_LANDING_CMS };
  try {
    const j = JSON.parse(raw) as LandingCms;
    return {
      sections: { ...DEFAULT_LANDING_CMS.sections, ...j.sections },
      copy: { ...DEFAULT_LANDING_CMS.copy, ...j.copy },
      auth: { ...DEFAULT_LANDING_CMS.auth, ...j.auth },
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
