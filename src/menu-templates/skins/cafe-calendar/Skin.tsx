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
      <div className="skin-cafe-calendar min-h-dvh">
        <header className="flex items-center justify-between px-4 py-5">
          <div>
            <p className="rounded-full bg-[var(--mt-secondary)] px-3 py-1 text-[11px] font-bold uppercase">Today special</p>
            <h1 className="mt-2 text-2xl font-black">{m.name}</h1>
          </div>
          <LangSelect value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="flex gap-2 overflow-x-auto px-4" aria-label="Günlər">
          {m.categories.map((c, i) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={`min-w-16 rounded-2xl px-3 py-3 text-center ${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}`}>
              <span className="block text-[10px] uppercase">Day</span>
              <span className="text-lg font-black">{i + 1}</span>
            </button>
          ))}
        </nav>
        <div className="relative mx-4 mt-6 border-l-2 border-[var(--mt-primary)] pl-5">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <article key={String(p.id)} className="relative mb-6">
              <span className="absolute -left-[27px] top-2 h-3 w-3 rounded-full bg-[var(--mt-primary)]" />
              <p className="text-[10px] uppercase text-[var(--mt-muted)]">{String(9 + i).padStart(2, "0")}:00</p>
              <button type="button" className="mt-1 flex w-full items-center gap-3 text-left" onClick={() => m.setDetail(p)}>
                <FallbackImg src={m.productImg(p)} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{m.productName(p)}</p>
                  <PriceTag product={p} className="text-xs" />
                </div>
              </button>
              <AddBtn m={m} product={p} className="mt-2 text-xs font-bold text-[var(--mt-primary)] disabled:opacity-40" />
            </article>
          ))}
        </div>
        <div className="sticky bottom-0 bg-[var(--mt-surface)] px-4 py-3">
          <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="min-h-11 w-full rounded-2xl bg-[var(--mt-primary)] py-3 font-bold text-[var(--mt-on-primary)]">{m.tx("nav_cart", "Səbət")} · {m.cartCount}</button>
        </div>
      </div>
      <CartOverlay m={m} placement="right" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
