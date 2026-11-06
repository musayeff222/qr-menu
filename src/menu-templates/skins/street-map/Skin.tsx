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
      <div className="skin-street-map min-h-dvh">
        <header className="relative h-56 overflow-hidden">
          <FallbackImg priority src={m.cover} alt="" className="h-full min-h-[224px] w-full object-cover" />
          <div className="absolute inset-0 bg-[var(--mt-primary)]/30" />
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-[var(--mt-surface)] p-4 shadow">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Route</p>
            <h1 className="text-2xl font-black">{m.name}</h1>
          </div>
          <LangSelect className="absolute right-3 top-3" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="relative mx-6 mt-4 border-l-2 border-dashed border-[var(--mt-primary)] pl-6" aria-label="Stops">
          {m.categories.map((c, i) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className="relative mb-4 block w-full text-left">
              <span className={`absolute -left-[31px] top-0 grid h-6 w-6 place-items-center rounded-full text-[10px] font-black ${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}`}>{i + 1}</span>
              {m.catName(c)}
            </button>
          ))}
        </nav>
        <div className="space-y-3 p-4">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="rounded-2xl border border-[var(--mt-muted)]/20 bg-[var(--mt-surface)] p-3 shadow-sm">
              <div className="flex gap-3">
                <span className="mt-1 h-3 w-3 rounded-full bg-[var(--mt-primary)]" />
                <div className="min-w-0 flex-1">
                  <button type="button" className="text-left font-bold" onClick={() => m.setDetail(p)}>{m.productName(p)}</button>
                  <p className="text-xs text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <PriceTag product={p} />
                    <AddBtn m={m} product={p} className="text-xs font-bold uppercase disabled:opacity-40" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-[var(--mt-primary)] text-[var(--mt-on-primary)] shadow-lg">
          {m.cartCount}
        </button>
      </div>
      <CartOverlay m={m} placement="center" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
