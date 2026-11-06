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
      <div className="skin-menu-paper mx-auto min-h-dvh max-w-md bg-[var(--mt-bg)] px-8 py-10 shadow-inner">
        <header className="mb-8 text-center">
          <h1 className="font-[ui-serif] text-3xl italic leading-tight sm:text-4xl">{m.name}</h1>
          {m.tagline ? <p className="mt-2 px-1 text-[10px] uppercase leading-relaxed tracking-[0.18em] sm:text-xs sm:tracking-[0.3em]">{m.tagline}</p> : null}
          <LangSelect className="mt-4 justify-center" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mb-6 space-y-1 text-center" aria-label="Bölmələr">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={`block w-full font-[ui-serif] ${Number(c.id) === Number(m.activeCategory) ? "italic text-[var(--mt-primary)]" : "text-[var(--mt-muted)]"}`}>
              {m.catName(c)}
            </button>
          ))}
        </nav>
        {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
        {m.filtered.map((p) => (
          <div key={String(p.id)} className="mb-3">
            <div className="flex min-w-0 items-baseline gap-2">
              <div className="flex min-w-0 flex-1 items-baseline gap-2">
                <button type="button" className="min-w-0 truncate font-[ui-serif] text-lg" onClick={() => m.setDetail(Number(m.detail?.id) === Number(p.id) ? null : p)}>{m.productName(p)}</button>
                <span className="min-w-4 flex-1 border-b border-dotted border-[var(--mt-muted)]" />
              </div>
              <PriceTag product={p} className="shrink-0 font-[ui-serif]" />
            </div>
            {Number(m.detail?.id) === Number(p.id) ? (
              <p className="pb-1 pl-1 text-xs italic text-[var(--mt-muted)]">{m.productDesc(p)}</p>
            ) : null}
            <AddBtn m={m} product={p} className="mt-1 text-[11px] uppercase tracking-widest" />
          </div>
        ))}
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="sticky bottom-4 mt-10 min-h-11 w-full border border-dashed bg-[var(--mt-bg)] py-3 text-center font-[ui-serif]">
          {m.tx("nav_cart", "Səbət")} · {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="center" />
    </SkinChrome>
  );
}
