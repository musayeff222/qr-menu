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
      <div className="skin-cafe-homestead min-h-dvh pb-28">
        <header className="relative overflow-hidden px-5 pb-8 pt-10">
          {m.logo ? <img src={m.logo} alt="" className="mb-3 h-14 w-14 rounded-full object-cover" /> : null}
          <h1 className="pr-16 font-[ui-serif] text-3xl leading-tight sm:text-4xl">{m.name}</h1>
          {m.tagline ? <p className="mt-2 text-sm text-[var(--mt-muted)]">{m.tagline}</p> : null}
          <LangSelect className="absolute right-4 top-6" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="flex gap-2 overflow-x-auto px-4" aria-label="Menyu">
          {m.categories.map((c) => {
            const id = Number(c.id);
            return (
              <button key={id} type="button" onClick={() => m.setActiveCategory(id)} className={`rounded-full px-4 py-2 text-sm font-semibold ${id === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}`}>
                {m.catName(c)}
              </button>
            );
          })}
        </nav>
        <div className="mt-4 grid grid-cols-2 gap-3 px-4">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="overflow-hidden rounded-[1.6rem] bg-[var(--mt-surface)] shadow-sm">
              <button type="button" onClick={() => m.setDetail(p)} className="w-full text-left">
                <FallbackImg src={m.productImg(p)} alt="" className="aspect-[4/3] w-full object-cover" />
                <div className="p-3">
                  <p className="font-semibold">{m.productName(p)}</p>
                  <PriceTag product={p} className="text-sm text-[var(--mt-primary)]" />
                </div>
              </button>
              <AddBtn m={m} product={p} className="mx-3 mb-3 rounded-full bg-[var(--mt-primary)] px-3 py-1.5 text-xs font-bold text-[var(--mt-on-primary)] disabled:opacity-40" />
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--mt-primary)] px-6 py-3 text-sm font-bold text-[var(--mt-on-primary)] shadow-lg">
          <ShoppingBag size={16} /> {m.cartCount} · {m.formatPrice(m.cartTotal)}
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
