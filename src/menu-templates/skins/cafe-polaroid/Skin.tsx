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
      <div className="skin-cafe-polaroid min-h-dvh overflow-x-hidden pb-24">
        <header className="relative h-52">
          <FallbackImg priority src={m.cover} alt="" className="absolute left-6 top-8 h-32 w-28 rotate-[-12deg] object-cover shadow-xl" />
          <FallbackImg priority src={m.logo || m.cover} alt="" className="absolute right-8 top-12 h-28 w-24 rotate-[8deg] object-cover shadow-xl" />
          <h1 className="absolute bottom-2 left-4 font-[ui-serif] text-3xl">{m.name}</h1>
          <LangSelect className="absolute right-3 top-3" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="flex gap-3 overflow-x-auto px-4 py-4" aria-label="Hekayələr">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={`grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 text-[10px] font-bold ${Number(c.id) === Number(m.activeCategory) ? "border-[var(--mt-primary)]" : "border-[var(--mt-muted)]/30"}`}>
              {m.catName(c).slice(0, 2)}
            </button>
          ))}
        </nav>
        <div className="flex flex-wrap justify-center gap-4 px-3">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <article key={String(p.id)} className={`w-[46%] bg-white p-2 shadow-md ${i % 2 ? "rotate-2" : "-rotate-2"}`}>
              <button type="button" onClick={() => m.setDetail(p)} className="w-full">
                <FallbackImg src={m.productImg(p)} alt="" className="aspect-square w-full object-cover" />
                <p className="mt-2 text-center text-xs font-semibold">{m.productName(p)}</p>
                <PriceTag product={p} className="mt-1 block text-center text-[11px]" />
              </button>
              <AddBtn m={m} product={p} compact className="mt-1 w-full text-[10px] font-bold text-[var(--mt-primary)] disabled:opacity-40" />
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed bottom-5 right-5 z-30 rounded-2xl bg-[var(--mt-surface)] px-4 py-3 text-xs font-bold shadow">
          {m.tx("nav_cart", "Səbət")} {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
