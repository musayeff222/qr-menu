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

  const step = Math.max(0, m.categories.findIndex((c) => Number(c.id) === Number(m.activeCategory)));
  return (
    <SkinChrome m={m}>
      <div className="skin-build-a-meal min-h-dvh pb-24">
        <header className="px-4 pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em]">Build a meal</p>
          <h1 className="text-3xl font-black">{m.name}</h1>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--mt-secondary)]">
            <div className="h-full bg-[var(--mt-primary)]" style={{ width: `${((step + 1) / Math.max(m.categories.length, 1)) * 100}%` }} />
          </div>
          <LangSelect className="mt-3" value={m.currentLang} onChange={m.setCurrentLang} />
        </header>
        <nav className="mt-4 flex gap-2 overflow-x-auto px-4" aria-label="Mərhələ">
          {m.categories.map((c, i) => (
            <button key={String(c.id)} type="button" onClick={() => m.setActiveCategory(Number(c.id))} className={`rounded-2xl px-3 py-2 text-xs font-black ${Number(c.id) === Number(m.activeCategory) ? "bg-[var(--mt-primary)] text-[var(--mt-on-primary)]" : "bg-[var(--mt-surface)]"}`}>
              {i + 1}. {m.catName(c)}
            </button>
          ))}
        </nav>
        <div className="mt-4 space-y-3 px-4">
          {m.filtered.length === 0 ? <EmptyMenu t={m.t} /> : null}
          {m.filtered.map((p) => (
            <article key={String(p.id)} className="flex gap-3 rounded-2xl bg-[var(--mt-surface)] p-3">
              <button type="button" onClick={() => m.setDetail(p)}>
                <FallbackImg src={m.productImg(p)} alt="" className="h-20 w-20 rounded-xl object-cover" />
              </button>
              <div className="min-w-0 flex-1">
                <button type="button" className="w-full text-left font-bold" onClick={() => m.setDetail(p)}>
                  {m.productName(p)}
                </button>
                <p className="line-clamp-2 text-xs text-[var(--mt-muted)]">{m.productDesc(p)}</p>
                <div className="mt-2 flex items-center justify-between">
                  <PriceTag product={p} className="text-sm" />
                  <AddBtn m={m} product={p} className="rounded-full bg-[var(--mt-primary)] px-3 py-1 text-xs font-black text-[var(--mt-on-primary)] disabled:opacity-40" />
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="fixed inset-x-0 bottom-0 bg-[var(--mt-surface)] px-4 py-3">
          <button type="button" onClick={m.openCart} aria-label={m.tx("nav_cart", "Səbət")} className="w-full rounded-2xl border-2 border-[var(--mt-primary)] py-3 font-black">
            Addım {step + 1} · Səbət {m.cartCount}
          </button>
        </div>
      </div>
      <CartOverlay m={m} placement="bottom" />
      <DetailSheet m={m} />
    </SkinChrome>
  );
}
