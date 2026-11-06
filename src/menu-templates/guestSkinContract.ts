import type { MenuTemplateDef } from "./types";

export type CartLine = {
  lineId: string;
  productId: number;
  product: Record<string, unknown>;
  variantId?: number;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
  note?: string;
};

/** Guest skin contract — same callbacks as the commerce shell. Skins never POST orders. */
export type GuestSkinProps = {
  template: MenuTemplateDef;
  restaurant: Record<string, unknown>;
  categories: Array<Record<string, unknown>>;
  products: Array<Record<string, unknown>>;
  activeCategory: number | null;
  setActiveCategory: (id: number) => void;
  currentLang: string;
  setCurrentLang: (l: string) => void;
  cart: CartLine[];
  addToCart: (item: {
    product: Record<string, unknown>;
    variantId?: number;
    variantLabel?: string;
    unitPrice: number;
    note?: string;
  }) => void;
  updateCartLineNote: (lineId: string, note: string) => void;
  increaseCartLineQty: (lineId: string) => void;
  decreaseCartLineQty: (lineId: string) => void;
  removeCartLine: (lineId: string) => void;
  onCheckout: () => void;
  onOpenOrders?: () => void;
  ordersAllowed: boolean;
  ordersClosedHint?: string;
  t: (k: string) => string;
  planFeatures?: {
    whatsapp_order?: boolean;
    reservation?: boolean;
  };
  menuView?: "browse" | "cart";
  onMenuViewChange?: (v: "browse" | "cart") => void;
  demoMode?: boolean;
};
