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
      <div className="skin-street-market min-h-dvh">
        <header className="bg-[var(--mt-primary)] px-4 py-6 text-[var(--mt-on-primary)]">
          <p className="text-[11px] font-black uppercase tracking-[0.4em]">Open market</p>
          <h1 className="text-3xl font-black">{m.name}</h1>
          <LangSelect className="mt-2" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="grid grid-cols-2 gap-2 p-3" aria-label="Stall">
          {m.categories.map((c) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={`rounded-none border-4 px-3 py-4 text-left text-sm font-black uppercase ${Number(c.id) === Number(m.activeCategory) ? "border-[var(--mt-primary)] bg-[var(--mt-secondary)]" : "border-[var(--mt-text)] bg-[var(--mt-surface)]"}`}>
              {m.catName(c)}
            </button>
          ))}
        </nav>
        <div className="space-y-3 px-3 pb-28">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="relative flex gap-0 overflow-hidden border-y-4 border-[var(--mt-text)] bg-[var(--mt-surface)]">
              <div className="w-2 shrink-0 bg-[var(--mt-accent)]" />
              <button type="button" className="shrink-0" onClick={() => m.setDetail(p)}>
                <FallbackImg src={m.productImg(p)} alt="" className="h-28 w-28 object-cover" />
              </button>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2 p-3">
                <button type="button" className="min-w-0 text-left" onClick={() => m.setDetail(p)}>
                  <p className="truncate text-sm font-black uppercase">{m.productName(p)}</p>
                  <p className="line-clamp-1 text-[11px] text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                </button>
                <div className="shrink-0 text-right">
                  <PriceTag product={p} className="block text-sm" />
                  <AddBtn m={m} product={p} className="mt-1 bg-[var(--mt-primary)] px-2 py-1 text-[10px] font-black text-[var(--mt-on-primary)] disabled:opacity-40" />
                </div>
              </div>
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed bottom-4 left-4 z-30 rounded-none bg-[var(--mt-accent)] px-4 py-3 text-xs font-black shadow-lg">
          {m.tx("nav_cart", "Səbət")} {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="left" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
