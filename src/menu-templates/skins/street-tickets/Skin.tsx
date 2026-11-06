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
      <div className="skin-street-tickets min-h-dvh bg-[var(--mt-bg)] pb-24">
        <header className="mx-4 mt-4 rounded-xl border-2 border-dashed border-[var(--mt-text)] bg-[var(--mt-surface)] px-4 py-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em]">Admit one</p>
          <h1 className="text-3xl font-black">{m.name}</h1>
          <LangSelect className="mt-2" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mt-4 flex gap-2 overflow-x-auto px-4" aria-label="Tabs">
          {m.categories.map((c, i) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={`min-w-16 rounded-t-lg px-3 py-4 text-2xl font-black ${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}`}>
              {i + 1}
            </button>
          ))}
        </nav>
        <div className="space-y-4 px-4">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="relative overflow-hidden rounded-xl bg-[var(--mt-surface)]">
              <div className="pointer-events-none absolute left-0 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--mt-bg)]" />
              <div className="pointer-events-none absolute right-0 top-1/2 h-6 w-6 translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--mt-bg)]" />
              <button type="button" className="flex w-full items-center gap-3 p-4 text-left" onClick={() => m.setDetail(Number(m.detail?.id) === Number(p.id) ? null : p)}>
                <FallbackImg src={m.productImg(p)} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-black">{m.productName(p)}</p>
                  <PriceTag product={p} className="font-mono text-sm" />
                </div>
              </button>
              {Number(m.detail?.id) === Number(p.id) ? (
                <p className="border-t border-dashed px-4 py-2 text-xs text-[var(--mt-muted)]">{m.productDesc(p)}</p>
              ) : null}
              <AddBtn m={m} product={p} className="mx-4 mb-3 font-mono text-xs font-bold uppercase" />
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed inset-x-4 bottom-4 z-30 rounded-xl bg-[var(--mt-primary)] py-3 font-mono text-sm font-black text-[var(--mt-on-primary)]">
          {m.tx("nav_cart", "Səbət")} · {m.cartCount} · {m.formatPrice(m.cartTotal)}
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
    </SkinChrome>
  );
}
