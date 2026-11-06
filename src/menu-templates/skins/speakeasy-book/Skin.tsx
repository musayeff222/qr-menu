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
      <div className="skin-speakeasy-book min-h-dvh bg-[var(--mt-bg)] px-3 py-6">
        <header className="mx-auto mb-6 max-w-lg rounded-xl border-[12px] border-[var(--mt-secondary)] bg-[var(--mt-surface)] px-6 py-10 text-center shadow-2xl">
          <p className="text-[10px] tracking-[0.6em]">SPEAKEASY</p>
          <h1 className="mt-3 font-[ui-serif] text-4xl">{m.name}</h1>
          <LangSelect className="mt-4 justify-center" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mx-auto mb-4 flex max-w-lg gap-2 overflow-x-auto" aria-label="Fəsil">
          {m.categories.map((c, i) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={`whitespace-nowrap px-3 py-1 font-[ui-serif] ${Number(c.id) === Number(m.activeCategory) ? "underline" : "text-[var(--mt-muted)]"}`}>
              Ch.{i + 1}
            </button>
          ))}
        </nav>
        <div className="mx-auto grid max-w-lg gap-px bg-[var(--mt-muted)]/20 sm:grid-cols-2">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="bg-[var(--mt-surface)] p-4">
              <button type="button" className="w-full text-left font-[ui-serif] text-xl" onClick={() => m.setDetail(p)}>{m.productName(p)}</button>
              <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-[var(--mt-muted)]">{m.productDesc(p)}</p>
              <div className="mt-3 flex items-center justify-between">
                <PriceTag product={p} />
                <AddBtn m={m} product={p} className="text-[10px] uppercase tracking-widest disabled:opacity-40" />
              </div>
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed bottom-0 right-0 z-30 origin-bottom-right -rotate-6 bg-[var(--mt-secondary)] px-5 py-6 text-xs font-bold">
          {m.tx("nav_cart", "Səbət")} {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="center" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
