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
      <div className="skin-bistro-market min-h-dvh">
        <header className="grid grid-cols-3 grid-rows-2 gap-1 p-1">
          <FallbackImg priority src={m.cover} alt="" className="col-span-2 row-span-2 h-full min-h-[220px] w-full object-cover" />
          <div className="bg-[var(--mt-primary)] p-3 text-[var(--mt-on-primary)]">
            <h1 className="text-lg font-black leading-tight">{m.name}</h1>
          </div>
          <LangSelect value={m.currentLang} onChange={m.setCurrentLang} className="bg-[var(--mt-secondary)] p-3" />
        </header>
        <nav className="grid grid-cols-3 gap-2 p-3" aria-label="Bazar">
          {m.categories.map((c) => {
            const id = Number(c.id);
            return (
              <button key={id} type="button" onClick={() => m.setActiveCategory(id)} className={`aspect-square rounded-lg p-2 text-left text-xs font-bold ${id === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}`}>
                {m.catName(c)}
              </button>
            );
          })}
        </nav>
        <div className="columns-2 gap-3 px-3 pb-24 sm:columns-3">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <article key={String(p.id)} className="mb-3 break-inside-avoid overflow-hidden rounded-xl bg-[var(--mt-surface)]">
              <button type="button" onClick={() => m.setDetail(p)} className="w-full text-left">
                <FallbackImg src={m.productImg(p)} alt="" className={`w-full object-cover ${i % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}`} />
                <div className="p-2">
                  <p className="text-sm font-bold">{m.productName(p)}</p>
                  <PriceTag product={p} className="text-xs" />
                </div>
              </button>
              <AddBtn m={m} product={p} className="mx-2 mb-2 w-[calc(100%-1rem)] rounded-lg bg-[var(--mt-primary)] py-1.5 text-[11px] font-bold text-[var(--mt-on-primary)] disabled:opacity-40" />
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed bottom-5 right-4 min-h-11 rounded-full bg-[var(--mt-accent)] px-4 py-3 text-sm font-bold text-[var(--mt-on-primary)]">
          {m.tx("nav_cart", "Səbət")} {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="left" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
