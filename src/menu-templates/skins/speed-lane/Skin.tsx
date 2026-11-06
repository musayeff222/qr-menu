import { ShoppingBag } from "lucide-react";
import type { GuestSkinProps } from "../../guestSkinContract";
import {
  AddBtn,
  CartCheckoutBar,
  CartLines,
  CartOverlay,
  DetailSheet,
  EmptyMenu,
  FallbackImg,
  LangSelect,
  PriceTag,
  ProductSearch,
  SkinChrome,
} from "../../shared/primitives";
import { useSkinModel } from "../../shared/useSkinModel";

export default function Skin(props: GuestSkinProps) {
  const m = useSkinModel(props);

  return (
    <SkinChrome m={m}>
      <div className="skin-speed-lane grid min-h-dvh grid-cols-[72px_1fr]">
        <nav className="flex flex-col gap-2 overflow-y-auto bg-[var(--mt-surface)] py-3" aria-label="Lane">
          {m.categories.map((c) => {
            const id = Number(c.id);
            return (
              <button key={id} type="button" onClick={() => m.setActiveCategory(id)} className={`mx-1 rounded-2xl px-1 py-3 text-[10px] font-bold leading-tight ${id === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : ""}`}>
                {m.catName(c)}
              </button>
            );
          })}
        </nav>
        <div className="flex min-w-0 flex-col">
          <header className="space-y-2 px-3 py-3">
            <div className="flex items-center gap-2">
              <h1 className="min-w-0 flex-1 truncate text-lg font-black">{m.name}</h1>
              <LangSelect value={m.currentLang} onChange={m.setCurrentLang} />
            </div>
            <ProductSearch m={m} />
          </header>
          <ul className="flex-1 divide-y">
            {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
            {m.filtered.map((p) => (
              <li key={String(p.id)} className="flex items-center gap-2 px-3 py-2">
                <FallbackImg src={m.productImg(p)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => m.setDetail(p)}>
                  <p className="truncate text-sm font-bold">{m.productName(p)}</p>
                  <PriceTag product={p} className="text-xs" />
                </button>
                <AddBtn m={m} product={p} compact className="h-10 w-10 rounded-full bg-[var(--mt-primary)] text-lg font-black text-[var(--mt-on-primary)] disabled:opacity-40" />
              </li>
            ))}
          </ul>
          <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="sticky bottom-0 flex items-center justify-between bg-[var(--mt-primary)] px-3 py-3 text-sm font-black text-[var(--mt-on-primary)]">
            <span>{m.cartCount} ədəd</span>
            <span>{m.formatPrice(m.cartTotal)}</span>
          </button>
        </div>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
