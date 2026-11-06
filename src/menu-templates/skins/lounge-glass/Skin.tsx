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
      <div className="skin-lounge-glass min-h-dvh bg-[var(--mt-bg)]">
        <header className="relative isolate px-4 pb-10 pt-16">
          <FallbackImg priority src={m.cover} alt="" className="absolute inset-0 h-full min-h-[280px] w-full object-cover opacity-40" />
          <div className="relative mx-auto max-w-md rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
            <h1 className="font-[ui-serif] text-3xl text-white">{m.name}</h1>
            {m.tagline ? <p className="mt-2 text-sm text-white/70">{m.tagline}</p> : null}
            <LangSelect className="mt-4 text-white" value={m.currentLang} onChange={m.setCurrentLang} />
          </div>
        </header>
        <nav className="sticky top-2 z-20 mx-4 flex gap-2 overflow-x-auto rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur" aria-label="Glass">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold ${Number(c.id) === Number(m.activeCategory) ? "bg-white/30" : "text-white/70"}`}>
              {m.catName(c)}
            </button>
          ))}
        </nav>
        <div className="space-y-4 p-4">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="overflow-hidden rounded-3xl border border-white/15 bg-white/10 backdrop-blur">
              <button type="button" className="w-full text-left" onClick={() => m.setDetail(Number(m.detail?.id) === Number(p.id) ? null : p)}>
                <div className="flex items-center gap-3 p-3">
                  <FallbackImg src={m.productImg(p)} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{m.productName(p)}</p>
                    <PriceTag product={p} className="text-sm" />
                  </div>
                </div>
              </button>
              {Number(m.detail?.id) === Number(p.id) ? (
                <p className="px-4 text-sm text-[var(--mt-muted)]">{m.productDesc(p)}</p>
              ) : null}
              <AddBtn m={m} product={p} className="mx-3 mb-3 rounded-full bg-[var(--mt-primary)] px-4 py-2 text-xs font-bold text-[var(--mt-on-primary)]" />
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed bottom-5 right-5 z-30 rounded-full bg-[var(--mt-primary)] px-4 py-3 text-sm font-bold text-[var(--mt-on-primary)]">
          {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="right" />
    </SkinChrome>
  );
}
