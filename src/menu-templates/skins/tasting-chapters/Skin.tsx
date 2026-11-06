import { ShoppingBag } from "lucide-react";
import type { GuestSkinProps } from "../../guestSkinContract";
import {
  AddBtn,
  CartCheckoutBar,
  CartLines,
  CartOverlay,
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
      <div className="skin-tasting-chapters min-h-dvh">
        <header className="mx-auto max-w-lg px-4 py-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.5em]">Tasting</p>
          <h1 className="mt-2 px-2 font-[ui-serif] text-3xl sm:text-4xl">{m.name}</h1>
          <LangSelect className="mt-4 justify-center" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mx-auto flex max-w-lg justify-center gap-2 px-4" aria-label="Kurslar">
          {m.categories.map((c, i) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={`h-9 w-9 rounded-full text-xs font-bold ${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}`}>
              {i + 1}
            </button>
          ))}
        </nav>
        <div className="mx-auto max-w-lg px-4 py-8">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <section key={String(p.id)} className="mb-6 border border-[var(--mt-muted)]/20 bg-[var(--mt-surface)] p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--mt-muted)]">Course {i + 1}</p>
              <button type="button" className="mt-1 w-full text-left font-[ui-serif] text-2xl" onClick={() => m.setDetail(Number(m.detail?.id) === Number(p.id) ? null : p)}>
                {m.productName(p)}
              </button>
              {Number(m.detail?.id) === Number(p.id) ? <p className="mt-2 text-sm text-[var(--mt-muted)]">{m.productDesc(p)}</p> : null}
              <div className="mt-3 flex items-center justify-between">
                <PriceTag product={p} />
                <AddBtn m={m} product={p} className="text-xs font-bold uppercase tracking-widest disabled:opacity-40" />
              </div>
            </section>
          ))}
        </div>
        <div className="sticky bottom-0 bg-[var(--mt-surface)] px-4 py-3">
          <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="min-h-11 w-full text-center text-sm font-semibold">{m.tx("nav_cart", "Səbət")} · {m.cartCount} · {m.formatPrice(m.cartTotal)}</button>
        </div>
      </div>
      <CartOverlay m={m} placement="bottom" />
    </SkinChrome>
  );
}
