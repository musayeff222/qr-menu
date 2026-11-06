import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { GuestSkinProps } from "./guestSkinContract";
import { SKIN_IDS } from "./skinCatalog";

type SkinComp = LazyExoticComponent<ComponentType<GuestSkinProps>>;

export const SKIN_LOADERS: Record<string, SkinComp> = {
  "bistro-rail": lazy(() => import("./skins/bistro-rail/Skin")),
  "bistro-split": lazy(() => import("./skins/bistro-split/Skin")),
  "bistro-ledger": lazy(() => import("./skins/bistro-ledger/Skin")),
  "bistro-market": lazy(() => import("./skins/bistro-market/Skin")),
  "bistro-counter": lazy(() => import("./skins/bistro-counter/Skin")),
  "atelier-cover": lazy(() => import("./skins/atelier-cover/Skin")),
  "noir-columns": lazy(() => import("./skins/noir-columns/Skin")),
  "tasting-chapters": lazy(() => import("./skins/tasting-chapters/Skin")),
  "gallery-plates": lazy(() => import("./skins/gallery-plates/Skin")),
  "menu-paper": lazy(() => import("./skins/menu-paper/Skin")),
  "cafe-homestead": lazy(() => import("./skins/cafe-homestead/Skin")),
  "patisserie-sheets": lazy(() => import("./skins/patisserie-sheets/Skin")),
  "roastery-journal": lazy(() => import("./skins/roastery-journal/Skin")),
  "cafe-polaroid": lazy(() => import("./skins/cafe-polaroid/Skin")),
  "cafe-calendar": lazy(() => import("./skins/cafe-calendar/Skin")),
  "quick-kiosk": lazy(() => import("./skins/quick-kiosk/Skin")),
  "speed-lane": lazy(() => import("./skins/speed-lane/Skin")),
  "build-a-meal": lazy(() => import("./skins/build-a-meal/Skin")),
  "pizza-slices": lazy(() => import("./skins/pizza-slices/Skin")),
  "burger-stack": lazy(() => import("./skins/burger-stack/Skin")),
  "izakaya-night": lazy(() => import("./skins/izakaya-night/Skin")),
  "neon-snap": lazy(() => import("./skins/neon-snap/Skin")),
  "lounge-glass": lazy(() => import("./skins/lounge-glass/Skin")),
  "speakeasy-book": lazy(() => import("./skins/speakeasy-book/Skin")),
  "midnight-table": lazy(() => import("./skins/midnight-table/Skin")),
  "street-market": lazy(() => import("./skins/street-market/Skin")),
  "street-zine": lazy(() => import("./skins/street-zine/Skin")),
  "street-filmstrip": lazy(() => import("./skins/street-filmstrip/Skin")),
  "street-map": lazy(() => import("./skins/street-map/Skin")),
  "street-tickets": lazy(() => import("./skins/street-tickets/Skin")),
};

if (Object.keys(SKIN_LOADERS).length !== 30) {
  throw new Error(`skinRegistry expected 30 loaders, got ${Object.keys(SKIN_LOADERS).length}`);
}

for (const id of SKIN_IDS) {
  if (!SKIN_LOADERS[id]) throw new Error(`Missing skin loader: ${id}`);
}
