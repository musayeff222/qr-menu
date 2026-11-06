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
      <div className="skin-street-filmstrip min-h-dvh w-full min-w-0 overflow-x-hidden bg-[var(--mt-bg)]">
        <header className="overflow-x-auto bg-black text-white">
          <div className="flex w-max min-w-full items-center gap-2 px-3 py-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="h-4 w-6 shrink-0 rounded-sm bg-white/30" />
            ))}
            <h1 className="max-w-[70vw] shrink-0 truncate px-3 text-sm font-black tracking-[0.2em] sm:tracking-[0.4em]">{m.name.toUpperCase()}</h1>
            <LangSelect className="ml-auto shrink-0 text-white" value={m.currentLang} onChange={m.setCurrentLang} />
          </div>
        </header>
        <nav className="overflow-x-auto" aria-label="Reel">
          <div className="flex w-max min-w-full gap-3 px-4 py-4">
            {m.categories.map((c) => (
              <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={`h-24 w-20 shrink-0 rounded-sm bg-[var(--mt-surface)] p-2 text-[10px] font-bold ${Number(c.id) === Number(m.activeCategory) ? "ring-2 ring-[var(--mt-primary)]" : ""}`}>
                {m.catName(c)}
              </button>
            ))}
          </div>
        </nav>
        <div className="space-y-3 px-3 pb-28">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="overflow-hidden rounded-sm bg-[var(--mt-surface)]">
              <button type="button" className="flex w-full min-w-0 items-stretch text-left" onClick={() => m.setDetail(Number(m.detail?.id) === Number(p.id) ? null : p)}>
                <FallbackImg src={m.productImg(p)} alt="" className="h-28 w-28 shrink-0 object-cover sm:w-40" />
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2 px-3">
                  <p className="min-w-0 truncate font-bold">{m.productName(p)}</p>
                  <PriceTag product={p} className="shrink-0" />
                </div>
              </button>
              {Number(m.detail?.id) === Number(p.id) ? (
                <p className="bg-black px-3 py-2 text-xs text-white">{m.productDesc(p)}</p>
              ) : null}
              <AddBtn m={m} product={p} className="m-2 text-xs font-black" />
            </article>
          ))}
        </div>
        <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 overflow-x-auto bg-black px-3 py-3">
          <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="shrink-0 rounded-sm bg-[var(--mt-primary)] px-4 py-2 text-xs font-black text-[var(--mt-on-primary)]">
            {m.tx("nav_cart", "Səbət")} {m.cartCount}
          </button>
        </div>
      </div>
      <CartOverlay m={m} placement="bottom" />
    </SkinChrome>
  );
}
