import type { CSSProperties } from "react";
import { cn } from "./cn";

/** Şablonun kök wrapper / kart üçün əlavə siniflər (3D, neon, şüşə və s.) */
export function templateRootSkin(renderMode: string | undefined): string {
  const m = renderMode ?? "";
  return cn(
    ["floating-3d-cards", "product-3d-showcase", "metallic-3d-ui", "interactive-motion-ui", "icon-3d-ui"].includes(
      m
    ) && "[perspective:1400px]",
    ["shadow-depth-ui", "luxury-hotel-style"].includes(m) && "mt-depth-skin",
    ["neon-cyberpunk", "futuristic-ui", "dark-neon-buttons"].includes(m) && "mt-neon-skin",
    ["glassmorphism-ui", "blur-background-modern", "colorful-gradient-cards"].includes(m) && "mt-glass-skin",
    m === "organic-shape-ui" && "mt-organic-skin",
    m === "animated-loading-menu" && "mt-shimmer-skin",
    m === "retro-vintage-ui" && "mt-retro-skin"
  );
}

export function productCardSkin(renderMode: string | undefined): string {
  const m = renderMode ?? "";
  return cn(
    "mt-product-card transition-[transform,box-shadow] duration-300 will-change-transform",
    ["floating-3d-cards", "product-3d-showcase", "interactive-motion-ui"].includes(m) &&
      "hover:-translate-y-1 hover:shadow-2xl sm:hover:[transform:translateY(-4px)_rotateX(4deg)]",
    ["metallic-3d-ui", "icon-3d-ui"].includes(m) && "hover:-translate-y-0.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
    m === "instagram-feed-menu" && "!rounded-md overflow-hidden",
    m === "tiktok-vertical-menu" && "border border-white/10"
  );
}

export function templateHeroExtraStyle(renderMode: string | undefined): CSSProperties | undefined {
  const m = renderMode ?? "";
  if (m === "modern-gradient-ui") {
    return {
      backgroundImage: `linear-gradient(135deg, color-mix(in srgb, var(--mt-primary) 55%, transparent), color-mix(in srgb, var(--mt-accent) 40%, transparent))`,
    };
  }
  if (m === "colorful-gradient-cards") {
    return {
      backgroundImage: `linear-gradient(120deg, var(--mt-primary), var(--mt-accent), var(--mt-secondary))`,
      opacity: 0.35,
    };
  }
  return undefined;
}
