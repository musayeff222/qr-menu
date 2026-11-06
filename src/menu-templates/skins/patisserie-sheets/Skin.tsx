import { ShoppingBag } from "lucide-react";
import type { GuestSkinProps } from "../../guestSkinContract";
import {
  CartCheckoutBar,
  CartLines,
  CartOverlay,
  DetailSheet,
  EmptyMenu,
  FallbackImg,
  LangSelect,
  PriceTag,
  SkinChrome,
} from "../../shared/primitives";
import { useSkinModel } from "../../shared/useSkinModel";

export default function Skin(props: GuestSkinProps) {
  const m = useSkinModel(props);

  return (
    <SkinChrome m={m}>
      <div className="skin-patisserie-sheets min-h-dvh">
        <header className="relative h-48">
          <div className="absolute inset-x-6 top-6 h-36 rotate-[-4deg] rounded-3xl bg-[var(--mt-secondary)]" />
          <div className="absolute inset-x-4 top-10 h-36 rotate-[3deg] rounded-3xl bg-[var(--mt-surface)] shadow" />
          <div className="relative flex h-48 items-end px-6 pb-4">
            <h1 className="font-[ui-serif] text-3xl italic">{m.name}</h1>
          </div>
          <LangSelect className="absolute right-4 top-4" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="flex gap-2 overflow-x-auto px-4 py-3" aria-label="Filter">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={`rounded-full px-3 py-1 text-xs font-bold ${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-secondary)]"}`}>
              {m.catName(c)}
            </button>
          ))}
        </nav>
        <div className="space-y-6">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)}>
              <button type="button" onClick={() => m.setDetail(p)} className="w-full">
                <FallbackImg src={m.productImg(p)} alt="" className="h-44 w-full object-cover" />
              </button>
              <div className="flex items-center justify-between px-4 py-3">
                <p className="font-[ui-serif] text-xl">{m.productName(p)}</p>
                <button type="button" disabled={!m.canOrder} onClick={() => m.handleAdd(p)} aria-label={m.tx("add_to_cart", "Əlavə et")} className="min-h-11 min-w-11 rounded-full bg-[var(--mt-primary)] px-3 py-1 text-xs font-bold text-[var(--mt-on-primary)] disabled:opacity-40">
                  {m.formatPrice(m.displayMinPrice(p))}
                </button>
              </div>
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed right-0 top-1/3 z-30 origin-right rotate-90 rounded-b-xl bg-[var(--mt-accent)] px-4 py-2 text-xs font-bold text-[var(--mt-on-primary)]">
          {m.tx("nav_cart", "Səbət")} {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
