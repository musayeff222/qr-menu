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
      <div className="skin-roastery-journal mx-auto min-h-dvh max-w-3xl px-4 py-8">
        <header className="border-y-4 border-[var(--mt-text)] py-4">
          <div className="flex items-end justify-between">
            <h1 className="font-[ui-serif] text-4xl">{m.name}</h1>
            <LangSelect value={m.currentLang} onChange={m.setCurrentLang} />
          </div>
          <p className="mt-1 text-[11px] uppercase tracking-[0.4em]">{m.tagline || "Roastery Journal"}</p>
        </header>
        <nav className="my-6 columns-2 text-sm" aria-label="Mündəricat">
          {m.categories.map((c, i) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className="mb-1 block w-full text-left">
              {i + 1}. {m.catName(c)}
            </button>
          ))}
        </nav>
        {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
        {m.filtered.map((p, i) => (
          <article key={String(p.id)} className={`mb-8 grid gap-4 ${i === 0 ? "md:grid-cols-2" : ""}`}>
            {i === 0 ? <FallbackImg src={m.productImg(p)} alt="" className="aspect-[4/3] w-full object-cover" /> : null}
            <div>
              <button type="button" className="text-left font-[ui-serif] text-2xl" onClick={() => m.setDetail(p)}>{m.productName(p)}</button>
              <p className="mt-2 text-sm leading-relaxed text-[var(--mt-muted)]">{m.productDesc(p)}</p>
              <div className="mt-3 flex items-center justify-between">
                <PriceTag product={p} />
                <AddBtn m={m} product={p} className="text-xs font-bold uppercase tracking-widest disabled:opacity-40" />
              </div>
            </div>
          </article>
        ))}
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed right-4 top-8 z-30 rotate-12 bg-[var(--mt-secondary)] px-2 py-6 text-[10px] font-bold" style={{ writingMode: "vertical-rl" }}>
          {m.tx("nav_cart", "Səbət")} {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="right" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
