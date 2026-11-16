import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { GuestSkinProps } from "./guestSkinContract";
import { SKIN_IDS } from "./skinCatalog";

type SkinComp = LazyExoticComponent<ComponentType<GuestSkinProps>>;

export const SKIN_LOADERS: Record<string, SkinComp> = {
  "fastfood-pro": lazy(() => import("./skins/fastfood-pro/Skin")),
  "ocean-modern": lazy(() => import("./skins/ocean-modern/Skin")),
  "bella-classic": lazy(() => import("./skins/bella-classic/Skin")),
};

if (Object.keys(SKIN_LOADERS).length !== 3) {
  throw new Error(`skinRegistry expected 3 loaders, got ${Object.keys(SKIN_LOADERS).length}`);
}

for (const id of SKIN_IDS) {
  if (!SKIN_LOADERS[id]) throw new Error(`Missing skin loader: ${id}`);
}
