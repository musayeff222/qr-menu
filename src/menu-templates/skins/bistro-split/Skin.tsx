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
      <div className="skin-bistro-split min-h-dvh">
        <header className="grid min-h-[52vh] md:grid-cols-2">
          <FallbackImg priority src={m.cover} alt="" className="h-[42vh] min-h-[240px] w-full object-cover md:h-full md:min-h-[52vh]" />
          <div className="flex flex-col justify-center bg-[var(--mt-secondary)] px-6 py-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em]">{m.meta.family}</p>
            <h1 className="mt-2 font-[ui-serif] text-3xl leading-tight sm:text-4xl">{m.name}</h1>
            {m.tagline ? <p className="mt-3 text-sm">{m.tagline}</p> : null}
            <LangSelect className="mt-6" value={m.currentLang} onChange={m.setCurrentLang} />
          </div>
        </header>
        <nav className="flex gap-6 overflow-x-auto border-b px-4 py-3" aria-label="Kateqoriyalar">
          {m.categories.map((c) => {
            const id = Number(c.id);
            const on = id === Number(m.activeCategory);
            return (
              <button key={id} type="button" onClick={() => m.setActiveCategory(id)} className={`whitespace-nowrap pb-1 text-sm font-semibold ${on ? "border-b-2 border-[var(--mt-primary)]" : "text-[var(--mt-muted)]"}`}>
                {m.catName(c)}
              </button>
            );
          })}
        </nav>
        <div className="mx-auto grid max-w-5xl gap-6 p-4 md:grid-cols-2">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <article key={String(p.id)} className={`overflow-hidden rounded-2xl bg-[var(--mt-surface)] ${i % 2 ? "md:translate-y-8" : ""}`}>
              <button type="button" className="w-full text-left" onClick={() => m.setDetail(p)}>
                <FallbackImg src={m.productImg(p)} alt={m.productName(p)} className="aspect-[5/4] w-full object-cover" />
                <div className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="font-[ui-serif] text-xl">{m.productName(p)}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                  </div>
                  <PriceTag product={p} />
                </div>
              </button>
              <AddBtn m={m} product={p} className="mx-4 mb-4 rounded-full bg-[var(--mt-primary)] px-4 py-2 text-xs font-bold text-[var(--mt-on-primary)] disabled:opacity-40" />
            </article>
          ))}
        </div>
        <div className="sticky bottom-0 z-30 flex items-center justify-between bg-[var(--mt-surface)] px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,.08)]">
          <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="min-h-11 text-sm font-bold">{m.tx("nav_cart", "Səbət")} · {m.cartCount}</button>
          <span className="tabular-nums font-bold">{m.formatPrice(m.cartTotal)}</span>
        </div>
      </div>
      <CartOverlay m={m} placement="right" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
