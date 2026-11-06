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
  SkinChrome,
} from "../../shared/primitives";
import { useSkinModel } from "../../shared/useSkinModel";

export default function Skin(props: GuestSkinProps) {
  const m = useSkinModel(props);

  return (
    <SkinChrome m={m}>
      <div className="skin-midnight-table min-h-dvh bg-[var(--mt-bg)]">
        <header className="flex flex-col items-center pt-10">
          <div className="grid h-36 w-36 place-items-center rounded-full bg-[radial-gradient(circle,var(--mt-primary),transparent_70%)]">
            <h1 className="max-w-[7rem] text-center font-[ui-serif] text-xl leading-tight">{m.name}</h1>
          </div>
          <LangSelect className="mt-4" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mx-auto mt-6 flex max-w-xs flex-wrap justify-center gap-2" aria-label="Wheel">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={`h-16 w-16 rounded-full text-[10px] font-bold ${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}`}>
              {m.catName(c)}
            </button>
          ))}
        </nav>
        <div className="mx-auto mt-8 max-w-lg space-y-6 px-4">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <article key={String(p.id)} className={`flex items-center gap-4 ${i % 2 ? "flex-row-reverse text-right" : ""}`}>
              <FallbackImg src={m.productImg(p)} alt="" className="h-24 w-24 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <button type="button" className="font-[ui-serif] text-xl" onClick={() => m.setDetail(p)}>{m.productName(p)}</button>
                <PriceTag product={p} className="mt-1 block text-sm" />
                <AddBtn m={m} product={p} className="mt-2 text-[11px] uppercase tracking-widest disabled:opacity-40" />
              </div>
            </article>
          ))}
        </div>
        <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-3 rounded-full bg-[var(--mt-surface)] px-4 py-2">
          <button type="button" onClick={() => m.onOpenOrders?.()} aria-label="Sifarişlər" className="h-10 w-10 rounded-full bg-[var(--mt-secondary)]">•</button>
          <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="h-11 w-11 rounded-full bg-[var(--mt-primary)] text-[var(--mt-on-primary)]">{m.cartCount}</button>
        </div>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
