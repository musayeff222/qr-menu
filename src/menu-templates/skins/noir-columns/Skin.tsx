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
      <div className="skin-noir-columns min-h-dvh bg-[var(--mt-bg)]">
        <header className="flex flex-col items-center border-y border-[var(--mt-muted)]/30 py-8">
          <p className="font-[ui-serif] text-4xl tracking-[0.4em]">{m.name.slice(0, 1)}</p>
          <h1 className="mt-2 w-full px-4 text-center font-[ui-serif] text-2xl">{m.name}</h1>
          <LangSelect className="mt-3" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <div className="grid md:grid-cols-[180px_1fr]">
          <nav className="hidden border-r border-[var(--mt-muted)]/20 p-4 md:block" aria-label="Fəsillər">
            {m.categories.map((c) => {
              const id = Number(c.id);
              return (
                <button key={id} type="button" onClick={() => m.setActiveCategory(id)} className={`mb-3 block w-full text-left font-[ui-serif] ${id === Number(m.activeCategory) ? "text-[var(--mt-primary)]" : "text-[var(--mt-muted)]"}`}>
                  {m.catName(c)}
                </button>
              );
            })}
          </nav>
          <div className="md:hidden flex gap-3 overflow-x-auto px-4 py-3">
            {m.categories.map((c) => (
              <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className="whitespace-nowrap text-sm">{m.catName(c)}</button>
            ))}
          </div>
          <div className="p-4">
            {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
            {m.filtered.map((p, i) => (
              <article key={String(p.id)} className={`mb-8 grid items-center gap-4 md:grid-cols-2 ${i % 2 ? "md:[&>div:first-child]:order-2" : ""}`}>
                <button type="button" className="w-full text-left" onClick={() => m.setDetail(p)}>
                    <FallbackImg src={m.productImg(p)} alt="" className="h-48 w-full object-cover sm:h-auto sm:max-h-none sm:aspect-[4/5]" />
                </button>
                <div>
                  <button type="button" className="w-full text-left font-[ui-serif] text-2xl" onClick={() => m.setDetail(p)}>
                    {m.productName(p)}
                  </button>
                  <p className="mt-2 line-clamp-3 text-sm text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                  <PriceTag product={p} className="mt-3 block" />
                  <AddBtn m={m} product={p} className="mt-3 text-xs uppercase tracking-[0.25em] underline disabled:opacity-40" />
                </div>
              </article>
            ))}
          </div>
        </div>
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed right-4 top-6 z-30 rounded-full border border-[var(--mt-muted)]/40 px-3 py-2 text-xs">
          {m.tx("nav_cart", "Səbət")} {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="right" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
