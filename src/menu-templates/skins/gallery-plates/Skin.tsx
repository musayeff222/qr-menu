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
      <div className="skin-gallery-plates min-h-dvh">
        <header className="relative h-40 overflow-hidden">
          <FallbackImg priority src={m.cover} alt="" className="h-full min-h-[160px] w-full object-cover" />
          <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/60 p-4 text-white">
            <h1 className="font-[ui-serif] text-3xl">{m.name}</h1>
            <LangSelect value={m.currentLang} onChange={m.setCurrentLang} />
          </div>
        </header>
        <nav className="flex gap-2 overflow-x-auto p-3" aria-label="Qalereya">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[var(--mt-surface)] text-[10px] font-bold">
              {m.catName(c).slice(0, 3)}
            </button>
          ))}
        </nav>
        <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <article key={String(p.id)} className={`relative overflow-hidden ${i % 5 === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"}`}>
              <button type="button" onClick={() => m.setDetail(p)} className="h-full w-full">
                <FallbackImg src={m.productImg(p)} alt={m.productName(p)} className="h-full w-full object-cover" />
                <span className="absolute bottom-8 left-2 right-10 truncate text-xs font-bold text-white drop-shadow">{m.productName(p)}</span>
              </button>
              <PriceTag product={p} className="absolute bottom-8 right-2 text-[11px] font-bold text-white drop-shadow" />
              <AddBtn m={m} product={p} compact className="absolute bottom-2 right-2 rounded-full bg-[var(--mt-primary)] px-2 py-1 text-[10px] font-bold text-[var(--mt-on-primary)] disabled:opacity-40" />
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs text-white">
          <ShoppingBag size={14} /> {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="right" />
      <DetailSheet m={m}>
        {m.detail ? <FallbackImg src={m.productImg(m.detail)} alt="" className="aspect-[4/3] w-full object-cover" /> : null}
      </DetailSheet>
    </SkinChrome>
  );
}
