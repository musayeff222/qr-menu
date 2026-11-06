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
      <div className="skin-street-zine min-h-dvh overflow-hidden bg-[var(--mt-bg)]">
        <header className="relative px-4 py-8">
          <h1 className="rotate-[-3deg] bg-[var(--mt-primary)] px-3 py-2 text-4xl font-black uppercase italic text-[var(--mt-on-primary)] inline-block">{m.name}</h1>
          <p className="mt-3 rotate-2 bg-[var(--mt-secondary)] px-2 py-1 text-xs font-black uppercase inline-block">{m.tagline || "ZINE"}</p>
          <LangSelect className="absolute right-3 top-3" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mb-4 overflow-hidden whitespace-nowrap bg-[var(--mt-text)] py-2 text-[var(--mt-bg)]" aria-label="Marquee">
          <div className="flex gap-8 px-4">
            {m.categories.map((c) => (
              <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className="text-sm font-black uppercase">
                ★ {m.catName(c)}
              </button>
            ))}
          </div>
        </nav>
        <div className="flex flex-wrap gap-4 px-4 pb-24">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p, i) => (
            <article key={String(p.id)} className={`relative w-[46%] border-4 border-black bg-white p-2 ${i % 3 === 0 ? "rotate-2" : i % 3 === 1 ? "-rotate-3" : "rotate-1"}`}>
              <button type="button" onClick={() => m.setDetail(p)}>
                <FallbackImg src={m.productImg(p)} alt="" className="aspect-square w-full object-cover" />
                <p className="mt-1 text-xs font-black uppercase">{m.productName(p)}</p>
              </button>
              <AddBtn m={m} product={p} compact className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-[var(--mt-primary)] text-sm font-black disabled:opacity-40" />
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed inset-x-0 bottom-0 z-30 min-h-11 bg-black py-3 text-center text-sm font-black uppercase tracking-widest text-white">
          {m.tx("nav_cart", "Səbət")} · {m.cartCount} · {m.formatPrice(m.cartTotal)}
        </button>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
