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
      <div className="skin-izakaya-night grid min-h-dvh bg-[var(--mt-bg)] md:grid-cols-[140px_1fr]">
        <aside className="border-r border-[var(--mt-muted)]/20 p-4">
          <p className="hidden text-xs tracking-[0.5em] md:block" style={{ writingMode: "vertical-rl" }}>IZAKAYA</p>
          <h1 className="mt-4 font-[ui-serif] text-xl">{m.name}</h1>
          <nav className="mt-6 flex flex-col gap-3" aria-label="Index">
            {m.categories.map((c) => (
              <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={`text-left text-xs tracking-widest ${Number(c.id) === Number(m.activeCategory) ? "text-[var(--mt-primary)]" : "text-[var(--mt-muted)]"}`}>
                {m.catName(c)}
              </button>
            ))}
          </nav>
          <LangSelect className="mt-6" value={m.currentLang} onChange={m.setCurrentLang} />
        </aside>
        <div className="p-4">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="mb-4 grid grid-cols-[1fr_120px] overflow-hidden rounded-xl bg-[var(--mt-surface)]">
              <div className="p-4">
                <button type="button" className="text-left font-[ui-serif] text-xl" onClick={() => m.setDetail(p)}>{m.productName(p)}</button>
                <p className="mt-1 line-clamp-2 text-xs text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                <div className="mt-3 flex items-center justify-between">
                  <PriceTag product={p} />
                  <AddBtn m={m} product={p} compact className="text-[11px] uppercase tracking-widest disabled:opacity-40" />
                </div>
              </div>
              <FallbackImg src={m.productImg(p)} alt="" className="h-full w-full object-cover" />
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed right-3 top-4 min-h-11 min-w-11 rounded-full bg-[var(--mt-primary)] px-3 py-2 text-[10px] font-bold text-[var(--mt-on-primary)]">
          {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="right" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
