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
      <div className="skin-pizza-slices min-h-dvh pb-24">
        <header className="flex flex-col items-center pt-8">
          <div className="grid h-28 w-28 place-items-center rounded-full bg-[var(--mt-primary)] text-3xl font-black text-[var(--mt-on-primary)]">🍕</div>
          <h1 className="mt-3 text-3xl font-black">{m.name}</h1>
          <LangSelect className="mt-2" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mt-4 flex snap-x gap-3 overflow-x-auto px-4" aria-label="Dilimler">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={`snap-center whitespace-nowrap rounded-full px-5 py-3 text-sm font-black ${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}`}>
              {m.catName(c)}
            </button>
          ))}
        </nav>
        <div className="mt-6 flex flex-col items-center gap-8">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="w-[min(100%,280px)] text-center">
              <button type="button" onClick={() => m.setDetail(p)}>
                <FallbackImg src={m.productImg(p)} alt="" className="mx-auto aspect-square w-56 rounded-full object-cover shadow-lg" />
                <p className="mt-3 text-lg font-black">{m.productName(p)}</p>
              </button>
              <PriceTag product={p} className="block" />
              <AddBtn m={m} product={p} className="mt-2 rounded-full bg-[var(--mt-primary)] px-6 py-2 text-sm font-black text-[var(--mt-on-primary)] disabled:opacity-40" />
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[var(--mt-accent)] px-6 py-3 font-black text-[var(--mt-on-primary)]">
          {m.tx("nav_cart", "Səbət")} · {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
